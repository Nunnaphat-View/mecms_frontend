import { create } from "zustand"
import { pmService } from "@/features/pm/services/pmService"
import { useCalibrationSettingStore, isInfusionPump } from "./calibrationSettingStore"
import { useStandardToolStore } from "@/features/tools/stores/standardToolStore"

export interface EquipmentDetails {
  id: string
  backendId?: number
  tool_name: string
  company: string
  model: string
  serialNumber: string
  code: string
  riskLevel: string
  type: string
  calibrationCycle: string
  lastCalibrationDate: string
  nextCalibrationDate: string
}

export interface LocationDetails {
  department: string
  hospital: string
  district: string
  province: string
}

export interface EnvironmentDetails {
  temperature: number | null
  humidity: number | null
}

export interface MeasurementRecord {
  parameter_name?: string | null
  range?: number | null
  standard_value?: number | null
  reading_1?: number | null
  reading_2?: number | null
  reading_3?: number | null
  std_reading_1?: number | null
  std_reading_2?: number | null
  std_reading_3?: number | null
  average_value?: number | null
  average_standard?: number | null
  error_value?: number | null
  result: "PASS" | "FAIL"
  display_type?: string | null
  resolution?: string | null
  std_type?: string | null
}

export interface QualitativeRecord {
  parameter_name?: string | null
  item_name: string
  result: "PASS" | "FAIL" | "NA"
}

export interface SpecificParameter {
  name: string
  value?: string | null
  unit?: string | null
}

interface CalibrationRecordState {
  loading: boolean
  isDirty: boolean
  activeTab: "general" | "test_results"
  taskId: number | null
  mockTrigger: number

  equipmentDetails: EquipmentDetails
  locationDetails: LocationDetails
  environment: EnvironmentDetails
  standardToolIds: number[]
  measurements: MeasurementRecord[]
  qualitatives: QualitativeRecord[]
  specificParameters: SpecificParameter[]
  overallResult: "Pass" | "Fail" | "NA"

  // Actions
  setActiveTab: (tab: "general" | "test_results") => void
  setDirty: (isDirty: boolean) => void
  setEnvironment: (env: Partial<EnvironmentDetails>) => void
  setStandardToolIds: (ids: number[]) => void
  setMeasurements: (measurements: MeasurementRecord[]) => void
  setQualitatives: (qualitatives: QualitativeRecord[]) => void
  setSpecificParameters: (params: SpecificParameter[]) => void
  setOverallResult: (result: "Pass" | "Fail" | "NA") => void
  incrementMockTrigger: () => void

  fetchCalibrationRecord: (id: string | number) => Promise<void>
  submitCalibration: (status?: "InProgress" | "PendingApproval") => Promise<boolean>
  saveDraft: () => Promise<boolean>
  fillMockData: () => void
  resetStore: () => void

  // Validators (helper functions implemented as state checks)
  isEnvironmentValid: () => boolean
  isStandardToolsValid: () => boolean
  isTestsValid: () => boolean
  canSubmit: () => boolean
}

const defaultEquipmentDetails: EquipmentDetails = {
  id: "",
  tool_name: "",
  company: "",
  model: "",
  serialNumber: "",
  code: "",
  riskLevel: "",
  type: "",
  calibrationCycle: "",
  lastCalibrationDate: "",
  nextCalibrationDate: "",
}

const defaultLocationDetails: LocationDetails = {
  department: "",
  hospital: "",
  district: "",
  province: "",
}

const defaultEnvironment: EnvironmentDetails = {
  temperature: null,
  humidity: null,
}

export const useCalibrationRecordStore = create<CalibrationRecordState>((set, get) => ({
  loading: false,
  isDirty: false,
  activeTab: "general",
  taskId: null,
  mockTrigger: 0,

  equipmentDetails: { ...defaultEquipmentDetails },
  locationDetails: { ...defaultLocationDetails },
  environment: { ...defaultEnvironment },
  standardToolIds: [],
  measurements: [],
  qualitatives: [],
  specificParameters: [],
  overallResult: "Pass",

  setActiveTab: (tab) => set({ activeTab: tab }),
  setDirty: (isDirty) => set({ isDirty }),
  setEnvironment: (env) =>
    set((state) => ({
      environment: { ...state.environment, ...env },
      isDirty: true,
    })),
  setStandardToolIds: (ids) => set({ standardToolIds: ids, isDirty: true }),
  setMeasurements: (measurements) => set({ measurements, isDirty: true }),
  setQualitatives: (qualitatives) => set({ qualitatives, isDirty: true }),
  setSpecificParameters: (params) => set({ specificParameters: params, isDirty: true }),
  setOverallResult: (result) => set({ overallResult: result, isDirty: true }),
  incrementMockTrigger: () => set((state) => ({ mockTrigger: state.mockTrigger + 1, isDirty: true })),

  fetchCalibrationRecord: async (id) => {
    get().resetStore()
    set({ loading: true })
    try {
      const task = await pmService.getTask(Number(id))
      const riskMap: Record<string, string> = {
        high: "สูง",
        medium: "กลาง",
        low: "ต่ำ",
      }

      const eq = task.equipment
      const equipmentDetails: EquipmentDetails = eq
        ? {
            id: eq.asset_code || String(eq.id),
            backendId: eq.id,
            tool_name: eq.tool_name.trim(),
            company: eq.manufacturer ?? "-",
            model: eq.model ?? "-",
            serialNumber: eq.serial_number ?? "-",
            code: eq.asset_code ?? "-",
            riskLevel: riskMap[eq.risk_level || ""] || eq.risk_level || "-",
            type: eq.equipmentType?.name || "-",
            calibrationCycle: `${eq.interval ?? 0} วัน`,
            lastCalibrationDate: eq.calibration_date_last ?? "-",
            nextCalibrationDate: eq.calibration_due_date ?? "-",
          }
        : { ...defaultEquipmentDetails }

      const locationDetails: LocationDetails = eq
        ? {
            department: eq.section?.name || eq.department || "-",
            hospital: eq.section?.hospital?.name || eq.location || "-",
            district: eq.section?.hospital?.district || "-",
            province: eq.section?.hospital?.province || "-",
          }
        : { ...defaultLocationDetails }

      set({
        taskId: task.id,
        equipmentDetails,
        locationDetails,
        environment: { temperature: null, humidity: null },
        measurements: [],
        qualitatives: [],
        specificParameters:
          task.remarks && task.remarks.startsWith("[")
            ? JSON.parse(task.remarks)
            : [],
        standardToolIds: task.checklistResults?.length ? [] : [], // Empty on new record
      })

      if (eq?.tool_name) {
        await useCalibrationSettingStore.getState().fetchSettings(eq.tool_name.trim())
      }
    } catch (error) {
      console.error("Failed to fetch calibration record:", error)
    } finally {
      set({ loading: false, isDirty: false })
    }
  },

  submitCalibration: async (status = "PendingApproval") => {
    const { taskId, environment, standardToolIds, measurements, qualitatives, specificParameters, overallResult } = get()
    if (!taskId) return false

    try {
      const payload = {
        ambient_temp: environment.temperature ?? undefined,
        ambient_humidity: environment.humidity ?? undefined,
        standard_tool_ids: standardToolIds,
        measurements,
        qualitatives,
        specific_parameters: specificParameters,
        overall_result: overallResult,
        status,
      }

      await pmService.submitCalibrationTask(taskId, payload)
      set({ isDirty: false })
      return true
    } catch (error) {
      console.error("Submit Failed:", error)
      throw error
    }
  },

  saveDraft: async () => {
    return await get().submitCalibration("InProgress")
  },

  fillMockData: () => {
    const settingStore = useCalibrationSettingStore.getState()
    const toolStore = useStandardToolStore.getState()

    // 1. Environment
    const environment = {
      temperature: Math.round((24.5 + Math.random()) * 10) / 10,
      humidity: Math.round((45 + Math.random() * 10) * 10) / 10,
    }

    // 2. Standard Tools — derive from standard_tool_ids stored in each setting
    const settingToolIds = settingStore.settings
      .flatMap((s) => s.standard_tool_ids ?? [])
      .filter((id) => id !== null && id !== undefined)
      .map((id) => Number(id))
    const uniqueToolIds = Array.from(new Set(settingToolIds))

    let standardToolIds: number[] = uniqueToolIds.slice(0, 2)
    if (standardToolIds.length === 0) {
      // Fallback: use first available tool
      standardToolIds = toolStore.tools.length > 0 ? [toolStore.tools[0].id] : [1]
    }

    // 3. Measurements (Quantitative)
    const measurements: MeasurementRecord[] = settingStore.settings
      .filter((s) => s.type === "quantitative")
      .map((s) => {
        const stdVal = s.test_values?.[0]?.value ?? 100
        const isMode4 =
          s.std_type?.includes("4") ||
          s.std_type?.includes("3 UUC : 3 STD") ||
          (s.std_type?.includes("3 UUC") && !s.std_type?.includes("1 STD"))

        if (isMode4) {
          const std1 = stdVal + (Math.random() - 0.5) * (stdVal * 0.005)
          const std2 = stdVal + (Math.random() - 0.5) * (stdVal * 0.005)
          const std3 = stdVal + (Math.random() - 0.5) * (stdVal * 0.005)
          const avgStd = (std1 + std2 + std3) / 3

          const r1 = stdVal + (Math.random() - 0.5) * (stdVal * 0.005)
          const r2 = stdVal + (Math.random() - 0.5) * (stdVal * 0.005)
          const r3 = stdVal + (Math.random() - 0.5) * (stdVal * 0.005)
          const avg = (r1 + r2 + r3) / 3
          const err = avg - avgStd

          return {
            parameter_name: s.parameter_name,
            standard_value: stdVal,
            reading_1: Number(r1.toFixed(2)),
            reading_2: Number(r2.toFixed(2)),
            reading_3: Number(r3.toFixed(2)),
            std_reading_1: Number(std1.toFixed(2)),
            std_reading_2: Number(std2.toFixed(2)),
            std_reading_3: Number(std3.toFixed(2)),
            average_value: Number(avg.toFixed(2)),
            average_standard: Number(avgStd.toFixed(2)),
            error_value: Number(err.toFixed(2)),
            result: "PASS" as const,
            display_type: s.display_type,
            resolution: s.resolution,
            std_type: s.std_type,
          }
        } else {
          const r1 = stdVal + (Math.random() - 0.5) * (stdVal * 0.005)
          const r2 = stdVal + (Math.random() - 0.5) * (stdVal * 0.005)
          const r3 = stdVal + (Math.random() - 0.5) * (stdVal * 0.005)
          const avg = (r1 + r2 + r3) / 3
          const err = avg - stdVal

          return {
            parameter_name: s.parameter_name,
            standard_value: stdVal,
            reading_1: Number(r1.toFixed(2)),
            reading_2: Number(r2.toFixed(2)),
            reading_3: Number(r3.toFixed(2)),
            average_value: Number(avg.toFixed(2)),
            error_value: Number(err.toFixed(2)),
            result: "PASS" as const,
            display_type: s.display_type,
            resolution: s.resolution,
            std_type: s.std_type,
          }
        }
      })

    // 4. Qualitatives
    const qualitatives: QualitativeRecord[] = settingStore.settings
      .filter((s) => s.type === "qualitative")
      .map((s) => ({
        item_name: s.parameter_name,
        result: "PASS" as const,
      }))

    set((state) => ({
      environment,
      standardToolIds,
      measurements,
      qualitatives,
      overallResult: "Pass",
      isDirty: true,
      mockTrigger: state.mockTrigger + 1,
    }))
  },

  resetStore: () => {
    set({
      taskId: null,
      activeTab: "general",
      equipmentDetails: { ...defaultEquipmentDetails },
      locationDetails: { ...defaultLocationDetails },
      environment: { ...defaultEnvironment },
      standardToolIds: [],
      measurements: [],
      qualitatives: [],
      specificParameters: [],
      overallResult: "Pass",
      isDirty: false,
    })
  },

  isEnvironmentValid: () => {
    const { environment } = get()
    const isValid =
      environment.temperature !== null &&
      environment.temperature !== undefined &&
      environment.humidity !== null &&
      environment.humidity !== undefined;
    if (!isValid) {
      console.log("isEnvironmentValid check failed. Environment:", environment);
    }
    return isValid;
  },

  isStandardToolsValid: () => {
    const isValid = get().standardToolIds.length > 0;
    if (!isValid) {
      console.log("isStandardToolsValid check failed. standardToolIds:", get().standardToolIds);
    }
    return isValid;
  },

  isTestsValid: () => {
    const settingStore = useCalibrationSettingStore.getState()
    const { measurements, qualitatives } = get()

    const toolName = get().equipmentDetails.tool_name
    const isInfusion = isInfusionPump(toolName)
    const isUltrasound = toolName?.toLowerCase().includes("ultrasound")

    const hasQuantSettings = settingStore.settings.some((s) => s.type === "quantitative")
    const hasQualSettings =
      settingStore.settings.some((s) => s.type === "qualitative") &&
      !isInfusion &&
      !isUltrasound

    if (hasQuantSettings) {
      if (measurements.length === 0) {
        console.log("isTestsValid check failed: has quantitative settings but measurements list is empty");
        return false;
      }
      for (const m of measurements) {
        const isSingle =
          m.std_type?.includes("6") ||
          m.std_type?.includes("แบบวัดครั้งเดียว") ||
          m.std_type?.includes("1 STD : 1 UUC")

        if (isSingle) {
          if (m.reading_1 === null || m.reading_1 === undefined || String(m.reading_1) === "") {
            console.log("isTestsValid check failed: single measurement missing reading_1", m);
            return false;
          }
        } else {
          if (
            m.reading_1 === null ||
            m.reading_1 === undefined ||
            String(m.reading_1) === "" ||
            m.reading_2 === null ||
            m.reading_2 === undefined ||
            String(m.reading_2) === "" ||
            m.reading_3 === null ||
            m.reading_3 === undefined ||
            String(m.reading_3) === ""
          ) {
            console.log("isTestsValid check failed: multi measurement missing one of reading_1/2/3", m);
            return false;
          }
        }
      }
    }

    if (hasQualSettings) {
      if (qualitatives.length === 0) {
        console.log("isTestsValid check failed: has qualitative settings but qualitatives list is empty");
        return false;
      }
      for (const q of qualitatives) {
        if (!q.result || q.result === "NA") {
          console.log("isTestsValid check failed: qualitative missing result or marked NA", q);
          return false;
        }
      }
    }

    return true;
  },

  canSubmit: () => {
    const isEnv = get().isEnvironmentValid();
    const isTools = get().isStandardToolsValid();
    const isTests = get().isTestsValid();
    const result = isEnv && isTools && isTests;
    console.log("canSubmit validation results:", {
      isEnvironmentValid: isEnv,
      isStandardToolsValid: isTools,
      isTestsValid: isTests,
      canSubmit: result
    });
    return result;
  },
}))

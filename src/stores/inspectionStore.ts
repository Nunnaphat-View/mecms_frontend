import { create } from "zustand"
import { pmService, type ChecklistCategoryApi } from "../services/pmService"

export type InspectionValue = "ผ่าน" | "ไม่ผ่าน" | "N/A"

export interface InspectionItem {
  id: number
  categoryId: number
  label: string
  value: InspectionValue
}

export interface InspectionSection {
  id: number
  title: string
  items: InspectionItem[]
  remarks: string
}

export interface DeviceInfo {
  tool_name: string
  company: string
  manufacturer: string
  model: string
  serialNumber: string
  assetCode: string
  category: string
  department: string
  location: string
  calibrationInterval: string
  lastCalibrationDate: string
  dueDate: string
  riskLevel: string
  type: string
}

const VALUE_MAP: Record<InspectionValue, "Pass" | "Fail" | "NA"> = {
  ผ่าน: "Pass",
  ไม่ผ่าน: "Fail",
  "N/A": "NA",
}

function buildSections(categories: ChecklistCategoryApi[]): InspectionSection[] {
  return categories.map((cat) => ({
    id: cat.id,
    title: cat.name,
    remarks: "",
    items: cat.items.map((item) => ({
      id: item.id,
      categoryId: cat.id,
      label: item.description,
      value: "N/A" as InspectionValue,
    })),
  }))
}

interface InspectionState {
  pmNo: string
  taskId: number | null
  pmByName: string
  pmByPosition: string
  isLoading: boolean
  error: string | null
  deviceInfo: DeviceInfo
  sections: InspectionSection[]

  // Computed-like getters (derived from sections)
  getPmResult: () => InspectionValue
  getPmBy: () => string
  getPmPosition: () => string
  getGeneralItems: () => InspectionItem[]
  getSafetyItems: () => InspectionItem[]
  getMaintenanceItems: () => InspectionItem[]

  // Actions
  loadFromTask: (taskId: number) => Promise<void>
  setItemValue: (sectionIdx: number, itemIdx: number, value: InspectionValue) => void
  setSectionRemarks: (sectionIdx: number, remarks: string) => void
  submitPmForm: () => Promise<{ success: boolean; error?: string }>
  resetAll: () => void
  fillMockData: () => void
}

const defaultDeviceInfo: DeviceInfo = {
  tool_name: "",
  company: "",
  manufacturer: "",
  model: "",
  serialNumber: "",
  assetCode: "",
  category: "",
  department: "",
  location: "",
  calibrationInterval: "",
  lastCalibrationDate: "",
  dueDate: "",
  riskLevel: "",
  type: "",
}

export const useInspectionStore = create<InspectionState>((set, get) => ({
  pmNo: "",
  taskId: null,
  pmByName: "",
  pmByPosition: "",
  isLoading: false,
  error: null,
  deviceInfo: { ...defaultDeviceInfo },
  sections: [],

  getPmResult: () => {
    const allItems = get().sections.flatMap((s) => s.items)
    if (allItems.some((i) => i.value === "ไม่ผ่าน")) return "ไม่ผ่าน"
    if (allItems.some((i) => i.value === "ผ่าน")) return "ผ่าน"
    return "N/A"
  },

  getPmBy: () => get().pmByName,

  getPmPosition: () => get().pmByPosition || "ช่างสอบเทียบ",

  getGeneralItems: () => get().sections[0]?.items ?? [],
  getSafetyItems: () => get().sections[1]?.items ?? [],
  getMaintenanceItems: () => get().sections[2]?.items ?? [],

  loadFromTask: async (tId: number) => {
    set({ isLoading: true, error: null })
    try {
      const task = await pmService.getTask(tId)
      if (!task) throw new Error(`Task #${tId} not found`)

      set({
        taskId: task.id,
        pmNo: task.pm_no ?? "",
        pmByName: task.technician?.name ?? "",
        pmByPosition: task.technician?.role?.description ?? "",
      })

      let eq = task.equipment
      const categories = await pmService.getPmForm(task.equipment_id)

      if (!eq) {
        eq = await pmService.getEquipment(task.equipment_id)
      }

      if (eq) {
        const mfr = eq.manufacturer ?? "-"
        set({
          deviceInfo: {
            tool_name: eq.tool_name,
            company: mfr,
            manufacturer: mfr,
            model: eq.model ?? "-",
            serialNumber: eq.serial_number ?? "-",
            assetCode: eq.asset_code ?? "-",
            category: eq.equipmentType?.name || "-",
            department: eq.section?.name || eq.department || "-",
            location: eq.section?.hospital?.name || eq.location || "-",
            calibrationInterval: eq.interval ? `${eq.interval} วัน` : "-",
            lastCalibrationDate: eq.calibration_date_last ?? "-",
            dueDate: eq.calibration_due_date ?? "-",
            riskLevel: eq.risk_level || "-",
            type: eq.equipmentType?.name || "-",
          },
        })
      }

      set({ sections: buildSections(categories) })
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "เกิดข้อผิดพลาด" })
    } finally {
      set({ isLoading: false })
    }
  },

  setItemValue: (sectionIdx, itemIdx, value) => {
    const sections = get().sections.map((s, si) => {
      if (si !== sectionIdx) return s
      return {
        ...s,
        items: s.items.map((item, ii) => (ii === itemIdx ? { ...item, value } : item)),
      }
    })
    set({ sections })
  },

  setSectionRemarks: (sectionIdx, remarks) => {
    const sections = get().sections.map((s, si) =>
      si === sectionIdx ? { ...s, remarks } : s
    )
    set({ sections })
  },

  submitPmForm: async () => {
    const { taskId, sections, getPmResult } = get()
    if (!taskId) return { success: false, error: "ไม่มี task_id" }

    const allItems = sections.flatMap((s) => s.items)
    const results = allItems.map((item) => ({
      item_id: item.id,
      status: VALUE_MAP[item.value],
    }))

    const remarks = sections
      .filter((s) => s.remarks.trim() !== "")
      .map((s) => ({ category_id: s.id, text: s.remarks }))

    try {
      await pmService.savePmForm({
        task_id: taskId,
        overall_result: VALUE_MAP[getPmResult()],
        status: "Done",
        results,
        remarks,
      })
      return { success: true }
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : "บันทึกไม่สำเร็จ" }
    }
  },

  resetAll: () => {
    set({
      sections: [],
      pmNo: "",
      taskId: null,
      pmByName: "",
      pmByPosition: "",
      error: null,
      deviceInfo: { ...defaultDeviceInfo },
    })
  },

  fillMockData: () => {
    const sections = get().sections.map((s) => ({
      ...s,
      items: s.items.map((item) => ({ ...item, value: "ผ่าน" as InspectionValue })),
    }))
    set({ sections })
  },
}))

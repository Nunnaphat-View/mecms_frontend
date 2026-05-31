import { useState, useEffect, useMemo, useRef, forwardRef, useImperativeHandle } from "react"
import { useCalibrationRecordStore, type MeasurementRecord, type QualitativeRecord } from "@/stores/calibrationRecordStore"
import { useCalibrationSettingStore, isInfusionPump } from "@/stores/calibrationSettingStore"
import EkgTestCard, { type EkgItem } from "./EkgTestCard"
import TestParameterTable, { type TestRow } from "./TestParameterTable"
import CalibrationSummary from "./CalibrationSummary"

interface Props {
  onSave: () => void
}

export interface TestDynamicHandle {
  fillMockData: () => void
}

const TestDynamic = forwardRef<TestDynamicHandle, Props>(function TestDynamic({ onSave }, ref) {
  const store = useCalibrationRecordStore()
  const settingStore = useCalibrationSettingStore()

  // 1. Differentiate equipment types
  const isInfusion = useMemo(() => isInfusionPump(store.equipmentDetails?.name), [store.equipmentDetails])
  const isUltrasound = useMemo(() => store.equipmentDetails?.name?.toLowerCase().includes("ultrasound"), [store.equipmentDetails])

  // 2. Local parameters and fields
  const qualitativeParams = useMemo(() => settingStore.settings.filter((s) => s.type === "qualitative"), [settingStore.settings])
  const quantitativeParams = useMemo(() => settingStore.settings.filter((s) => s.type === "quantitative"), [settingStore.settings])

  const [paramValues, setParamValues] = useState<TestRow[][]>([])
  const [probe1Rows, setProbe1Rows] = useState<TestRow[]>([])
  const [probe2Rows, setProbe2Rows] = useState<TestRow[]>([])
  const [paramMetadata, setParamMetadata] = useState<{ displayType: string; resolution: string }[]>([])
  const [qualValues, setQualValues] = useState<Record<string, EkgItem[]>>({})

  const [probeTab, setProbeTab] = useState<"probe1" | "probe2">("probe1")
  const [probe1Type, setProbe1Type] = useState("Convex")
  const [probe1Freq, setProbe1Freq] = useState("3.5")
  const [probe1Sn, setProbe1Sn] = useState("")
  const [probe2Type, setProbe2Type] = useState("Linear")
  const [probe2Freq, setProbe2Freq] = useState("7.5")
  const [probe2Sn, setProbe2Sn] = useState("")

  const [ivSet, setIvSet] = useState("")
  const [dropRate, setDropRate] = useState("")
  const [air, setAir] = useState("")
  const [occlusionPressure, setOcclusionPressure] = useState("")

  // Prevent multiple initializations
  const isInitialized = useRef(false)

  // Expose fillMockData to parent via ref (replaces the mockTrigger useEffect anti-pattern)
  useImperativeHandle(ref, () => ({ fillMockData: fillLocalMockData }))

  // Initialize data on setting load
  useEffect(() => {
    if (settingStore.settings.length > 0 && !isInitialized.current) {
      initializeData()
      isInitialized.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingStore.settings])

  function initializeData() {
    // 1. Initialize Quantitative
    const initialParamValues = quantitativeParams.map((param) => {
      const testValues = param.test_values || []
      return testValues.map((tv) => ({
        range: tv.label,
        standard: tv.value,
        val1: null,
        val2: null,
        val3: null,
        stdVal1: null,
        stdVal2: null,
        stdVal3: null,
        average: null,
        averageStd: null,
        error: null,
        status: null,
      }))
    })
    setParamValues(initialParamValues)

    if (isUltrasound) {
      const p1 = quantitativeParams.map((param) => {
        const tv = param.test_values?.[0] || { label: "ค่าทดสอบที่ 1", value: 0 }
        return {
          range: tv.label,
          standard: tv.value || null,
          val1: null,
          val2: null,
          val3: null,
          stdVal1: null,
          stdVal2: null,
          stdVal3: null,
          average: null,
          averageStd: null,
          error: null,
          status: null as "pass" | "fail" | null,
          parameterName: param.parameter_name,
          errorLimit: parseFloat(param.tolerance || "2.0"),
          std_type: param.std_type,
        }
      })
      setProbe1Rows(p1)

      const p2 = quantitativeParams.map((param) => {
        const tv = param.test_values?.[0] || { label: "ค่าทดสอบที่ 1", value: 0 }
        return {
          range: tv.label,
          standard: tv.value || null,
          val1: null,
          val2: null,
          val3: null,
          stdVal1: null,
          stdVal2: null,
          stdVal3: null,
          average: null,
          averageStd: null,
          error: null,
          status: null as "pass" | "fail" | null,
          parameterName: param.parameter_name,
          errorLimit: parseFloat(param.tolerance || "2.0"),
          std_type: param.std_type,
        }
      })
      setProbe2Rows(p2)
    }

    const metadata = quantitativeParams.map((param) => ({
      displayType: param.display_type || "",
      resolution: param.resolution || "",
    }))
    setParamMetadata(metadata)

    // 2. Initialize Qualitative
    const qualGroup: Record<string, EkgItem[]> = {}
    qualitativeParams.forEach((param) => {
      let items = param.test_values || []
      if (items.length === 0) {
        items = [{ label: param.parameter_name, value: 0 }]
      }
      qualGroup[param.parameter_name] = items.map((v, idx) => ({
        id: v.label || `${param.parameter_name}_item_${idx}`,
        label: v.label || param.parameter_name,
        status: null,
      }))
    })
    setQualValues(qualGroup)

    // 3. Load from store if draft exists
    if (isInfusion && store.specificParameters && store.specificParameters.length > 0) {
      const findValue = (name: string) => store.specificParameters.find((p) => p.name === name)?.value
      const savedIvSet = findValue("IV Set")
      const savedDropRate = findValue("Drop Rate")
      const savedAir = findValue("Air")
      const savedPressure = findValue("Occlusion Pressure")

      if (savedIvSet !== undefined && savedIvSet !== null) setIvSet(savedIvSet)
      if (savedDropRate !== undefined && savedDropRate !== null) setDropRate(savedDropRate)
      if (savedAir !== undefined && savedAir !== null) setAir(savedAir)
      if (savedPressure !== undefined && savedPressure !== null) setOcclusionPressure(savedPressure)
    }

    if (isUltrasound && store.specificParameters && store.specificParameters.length > 0) {
      const findValue = (name: string) => store.specificParameters.find((p) => p.name === name)?.value
      const p1Type = findValue("Probe 1 Type")
      const p1Freq = findValue("Probe 1 Frequency")
      const p1Sn = findValue("Probe 1 Serial Number")
      const p2Type = findValue("Probe 2 Type")
      const p2Freq = findValue("Probe 2 Frequency")
      const p2Sn = findValue("Probe 2 Serial Number")

      if (p1Type !== undefined && p1Type !== null) setProbe1Type(p1Type)
      if (p1Freq !== undefined && p1Freq !== null) setProbe1Freq(p1Freq)
      if (p1Sn !== undefined && p1Sn !== null) setProbe1Sn(p1Sn)
      if (p2Type !== undefined && p2Type !== null) setProbe2Type(p2Type)
      if (p2Freq !== undefined && p2Freq !== null) setProbe2Freq(p2Freq)
      if (p2Sn !== undefined && p2Sn !== null) setProbe2Sn(p2Sn)
    }
  }

  function fillLocalMockData() {
    if (isUltrasound) {
      setProbe1Type("Convex")
      setProbe1Freq("3.5")
      setProbe1Sn("PRB-2023-001")
      setProbe2Type("Linear")
      setProbe2Freq("7.5")
      setProbe2Sn("PRB-2023-002")

      setProbe1Rows((prev) =>
        prev.map((row) => {
          const stdVal = typeof row.standard === "number" ? row.standard : 0
          if (stdVal === 0 || row.parameterName?.toLowerCase().includes("depth")) {
            return { ...row, val1: 15.8, average: 15.8, error: 0, status: "pass" }
          }
          const offset = (Math.random() - 0.5) * (stdVal * 0.05)
          const val = Number((stdVal + offset).toFixed(2))
          const err = Number((val - stdVal).toFixed(2))
          return { ...row, val1: val, average: val, error: err, status: "pass" }
        })
      )

      setProbe2Rows((prev) =>
        prev.map((row) => {
          const stdVal = typeof row.standard === "number" ? row.standard : 0
          if (stdVal === 0 || row.parameterName?.toLowerCase().includes("depth")) {
            return { ...row, val1: 16.2, average: 16.2, error: 0, status: "pass" }
          }
          const offset = (Math.random() - 0.5) * (stdVal * 0.05)
          const val = Number((stdVal + offset).toFixed(2))
          const err = Number((val - stdVal).toFixed(2))
          return { ...row, val1: val, average: val, error: err, status: "pass" }
        })
      )
    } else {
      setParamValues((prev) =>
        prev.map((rows, i) => {
          const param = quantitativeParams[i]
          const isMode4 =
            param?.std_type?.includes("4") ||
            param?.std_type?.includes("3 UUC : 3 STD") ||
            (param?.std_type?.includes("3 UUC") && !param?.std_type?.includes("1 STD"))

          return rows.map((row) => {
            const stdVal = typeof row.standard === "number" ? row.standard : 0
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
                ...row,
                stdVal1: Number(std1.toFixed(2)),
                stdVal2: Number(std2.toFixed(2)),
                stdVal3: Number(std3.toFixed(2)),
                val1: Number(r1.toFixed(2)),
                val2: Number(r2.toFixed(2)),
                val3: Number(r3.toFixed(2)),
                average: Number(avg.toFixed(2)),
                averageStd: Number(avgStd.toFixed(2)),
                error: Number(err.toFixed(2)),
                status: "pass",
              }
            } else {
              const r1 = stdVal + (Math.random() - 0.5) * (stdVal * 0.005)
              const r2 = stdVal + (Math.random() - 0.5) * (stdVal * 0.005)
              const r3 = stdVal + (Math.random() - 0.5) * (stdVal * 0.005)
              const avg = (r1 + r2 + r3) / 3
              const err = avg - stdVal

              return {
                ...row,
                val1: Number(r1.toFixed(2)),
                val2: Number(r2.toFixed(2)),
                val3: Number(r3.toFixed(2)),
                average: Number(avg.toFixed(2)),
                error: Number(err.toFixed(2)),
                status: "pass",
              }
            }
          })
        })
      )
    }

    setQualValues((prev) => {
      const next = { ...prev }
      Object.entries(next).forEach(([key, items]) => {
        next[key] = items.map((item) => ({ ...item, status: "pass" }))
      })
      return next
    })

    if (isInfusion) {
      setIvSet("Covex")
      setDropRate("20")
      setAir("Pass")
      setOcclusionPressure("750")
    }
  }


  // Handle qualitative item status changes
  function handleQualItemStatusChange(paramName: string, itemId: string, status: "pass" | "fail") {
    setQualValues((prev) => {
      const next = { ...prev }
      next[paramName] = next[paramName].map((item) =>
        item.id === itemId ? { ...item, status } : item
      )
      return next
    })
  }

  // Summary checklists — must be declared before the sync effect that reads it
  const checklistItems = useMemo(() => {
    const qualItems = isInfusion
      ? [{ label: "Alram", icon: "alarm", passed: air === "Pass" }]
      : Object.entries(qualValues).map(([name, values]) => {
          const tested = values.filter((v) => v.status !== null)
          const passed = tested.length > 0 && tested.every((v) => v.status === "pass")
          return { label: name, icon: "fact_check", passed }
        })

    const quantItems = isUltrasound
      ? [
          ...probe1Rows.map((r) => ({
            label: `${r.parameterName} (หัวตรวจที่ 1)`,
            icon: "analytics",
            passed: r.status === "pass",
          })),
          ...probe2Rows.map((r) => ({
            label: `${r.parameterName} (หัวตรวจที่ 2)`,
            icon: "analytics",
            passed: r.status === "pass",
          })),
        ]
      : quantitativeParams.map((param, i) => {
          const rows = paramValues[i] ?? []
          const tested = rows.filter((r) => r.status !== null)
          const passed = tested.length > 0 && tested.every((r) => r.status === "pass")
          return { label: param.parameter_name, icon: "analytics", passed }
        })

    return [...qualItems, ...quantItems]
  }, [isInfusion, air, qualValues, isUltrasound, probe1Rows, probe2Rows, quantitativeParams, paramValues])

  // 5. Watch & Sync to global store
  useEffect(() => {
    // A. Map Qualitatives
    const qualitativesList: QualitativeRecord[] = []
    if (!isInfusion && !isUltrasound) {
      Object.entries(qualValues).forEach(([paramName, items]) => {
        items.forEach((item) => {
          qualitativesList.push({
            parameter_name: paramName,
            item_name: item.label,
            result: item.status === "pass" ? "PASS" : item.status === "fail" ? "FAIL" : "NA",
          })
        })
      })
    }
    store.setQualitatives(qualitativesList)

    // B. Map Measurements
    const measurementsList: MeasurementRecord[] = []
    if (isUltrasound) {
      // Map Probe 1 Measurements (range: 1)
      probe1Rows.forEach((r) => {
        const meta = paramMetadata[0] || { displayType: "Digital", resolution: "0.01" }
        measurementsList.push({
          parameter_name: r.parameterName,
          range: 1, // Probe 1
          result: r.status === "pass" ? "PASS" : "FAIL",
          standard_value: r.standard ?? undefined,
          reading_1: r.val1 ?? undefined,
          reading_2: r.val2 ?? undefined,
          reading_3: r.val3 ?? undefined,
          average_value: r.average ?? undefined,
          error_value: r.error ?? undefined,
          display_type: meta.displayType,
          resolution: meta.resolution,
          std_type: r.std_type,
        })
      })

      // Map Probe 2 Measurements (range: 2)
      probe2Rows.forEach((r) => {
        const meta = paramMetadata[0] || { displayType: "Digital", resolution: "0.01" }
        measurementsList.push({
          parameter_name: r.parameterName,
          range: 2, // Probe 2
          result: r.status === "pass" ? "PASS" : "FAIL",
          standard_value: r.standard ?? undefined,
          reading_1: r.val1 ?? undefined,
          reading_2: r.val2 ?? undefined,
          reading_3: r.val3 ?? undefined,
          average_value: r.average ?? undefined,
          error_value: r.error ?? undefined,
          display_type: meta.displayType,
          resolution: meta.resolution,
          std_type: r.std_type,
        })
      })
    } else {
      quantitativeParams.forEach((param, i) => {
        const rows = paramValues[i]
        const meta = paramMetadata[i]
        if (!rows || !meta) return

        rows.forEach((r) => {
          measurementsList.push({
            parameter_name: param.parameter_name,
            range: 0, // General index
            result: r.status === "pass" ? "PASS" : "FAIL",
            standard_value: r.standard ?? undefined,
            reading_1: r.val1 ?? undefined,
            reading_2: r.val2 ?? undefined,
            reading_3: r.val3 ?? undefined,
            std_reading_1: r.stdVal1 ?? undefined,
            std_reading_2: r.stdVal2 ?? undefined,
            std_reading_3: r.stdVal3 ?? undefined,
            average_value: r.average ?? undefined,
            average_standard: r.averageStd ?? undefined,
            error_value: r.error ?? undefined,
            display_type: meta.displayType,
            resolution: meta.resolution,
            std_type: param.std_type,
          })
        })
      })
    }
    store.setMeasurements(measurementsList)

    // C. Map Specific Parameters for Infusion
    if (isInfusion) {
      store.setSpecificParameters([
        { name: "IV Set", value: ivSet },
        { name: "Drop Rate", value: dropRate, unit: "Drop/mL" },
        { name: "Air", value: air },
        { name: "Occlusion Pressure", value: occlusionPressure, unit: "mmHg" },
      ])
    }

    // D. Map Specific Parameters for Ultrasound
    if (isUltrasound) {
      store.setSpecificParameters([
        { name: "Probe 1 Type", value: probe1Type },
        { name: "Probe 1 Frequency", value: probe1Freq, unit: "MHz" },
        { name: "Probe 1 Serial Number", value: probe1Sn },
        { name: "Probe 2 Type", value: probe2Type },
        { name: "Probe 2 Frequency", value: probe2Freq, unit: "MHz" },
        { name: "Probe 2 Serial Number", value: probe2Sn },
      ])
    }

    // E. Calculate Overall result
    const hasFail = checklistItems.some((item) => !item.passed)
    store.setOverallResult(hasFail ? "Fail" : "Pass")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    paramValues,
    paramMetadata,
    qualValues,
    ivSet,
    dropRate,
    air,
    occlusionPressure,
    probe1Rows,
    probe2Rows,
    probe1Type,
    probe1Freq,
    probe1Sn,
    probe2Type,
    probe2Freq,
    probe2Sn,
  ])


  function getProbeChecklist(rows: TestRow[]) {
    const getStatus = (keywords: string[]) => {
      const matchingRows = rows.filter((r) => {
        const name = (r.parameterName || "").toLowerCase()
        return keywords.some((k) => name.includes(k))
      })
      if (matchingRows.length === 0) return false
      return matchingRows.every((r) => r.status === "pass")
    }

    return [
      {
        label: "Axial Resolution",
        icon: "bar_chart",
        passed: getStatus(["axial", "vertical"]),
      },
      {
        label: "Lateral Resolution",
        icon: "notes",
        passed: getStatus(["lateral", "horizontal"]),
      },
      {
        label: "Uniformity",
        icon: "track_changes",
        passed: getStatus(["uniformity"]),
      },
      {
        label: "Depth of Field",
        icon: "straighten",
        passed: getStatus(["depth"]),
      },
    ]
  }

  const probe1SummaryItems = useMemo(() => getProbeChecklist(probe1Rows), [probe1Rows])
  const probe2SummaryItems = useMemo(() => getProbeChecklist(probe2Rows), [probe2Rows])

  return (
    <div className="py-4">
      {/* 1. Qualitative Parameters */}
      {qualitativeParams.length > 0 && !isInfusion && (
        <div className="mb-8">
          {Object.entries(qualValues).map(([groupName, groupItems]) => (
            <div key={groupName} className="mb-4">
              <EkgTestCard
                ekgItems={groupItems}
                title={groupName}
                onItemStatusChange={(itemId, status) =>
                  handleQualItemStatusChange(groupName, itemId, status)
                }
              />
            </div>
          ))}
        </div>
      )}

      {/* Custom Infusion Pump Specific Parameters Form */}
      {isInfusion && (
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* IV Set Configuration */}
            <div>
              <div
                className="text-sm font-bold text-slate-800 mb-3 pl-3"
                style={{ borderLeft: "4px solid #f59e0b" }}
              >
                IV Set Configuration
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">IV Set:</label>
                  <input
                    type="text"
                    value={ivSet}
                    onChange={(e) => setIvSet(e.target.value)}
                    placeholder="เช่น Covex"
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white text-slate-800"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">Drop Rate:</label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={dropRate}
                      onChange={(e) => setDropRate(e.target.value)}
                      placeholder="20"
                      className="w-full h-10 pl-3 pr-24 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white text-slate-800"
                    />
                    <span className="absolute right-3.5 text-xs text-slate-400 font-semibold">
                      Drop/mL
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Alarm */}
            <div>
              <div
                className="text-sm font-bold text-slate-800 mb-3 pl-3"
                style={{ borderLeft: "4px solid #f59e0b" }}
              >
                Alarm
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">Air:</label>
                  <select
                    value={air}
                    onChange={(e) => setAir(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white text-slate-800"
                  >
                    <option value="">-- เลือกสถานะ --</option>
                    <option value="Pass">Pass</option>
                    <option value="Fail">Fail</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">
                    Occlusion Pressure:
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={occlusionPressure}
                      onChange={(e) => setOcclusionPressure(e.target.value)}
                      placeholder="750"
                      className="w-full h-10 pl-3 pr-16 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white text-slate-800"
                    />
                    <span className="absolute right-3.5 text-xs text-slate-400 font-semibold">
                      mmHg
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Ultrasound Probes Form */}
      {isUltrasound && (
        <div className="mb-6">
          <div className="flex items-center justify-between border-b border-slate-200 mb-4 pb-2">
            <div
              className="text-sm font-bold text-slate-800 pl-3"
              style={{ borderLeft: "4px solid #f59e0b" }}
            >
              ข้อมูลหัวตรวจอัลตราซาวด์
            </div>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setProbeTab("probe1")}
                className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer ${
                  probeTab === "probe1"
                    ? "bg-primary text-white"
                    : "bg-slate-100 text-slate-500 hover:text-slate-700"
                }`}
              >
                หัวตรวจที่ 1
              </button>
              <button
                type="button"
                onClick={() => setProbeTab("probe2")}
                className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer ${
                  probeTab === "probe2"
                    ? "bg-primary text-white"
                    : "bg-slate-100 text-slate-500 hover:text-slate-700"
                }`}
              >
                หัวตรวจที่ 2
              </button>
            </div>
          </div>

          {/* Probe Input Card */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">ประเภท:</label>
                {probeTab === "probe1" ? (
                  <select
                    value={probe1Type}
                    onChange={(e) => setProbe1Type(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-850"
                  >
                    <option value="Convex">Convex</option>
                    <option value="Linear">Linear</option>
                    <option value="Sector">Sector</option>
                    <option value="Micro-convex">Micro-convex</option>
                  </select>
                ) : (
                  <select
                    value={probe2Type}
                    onChange={(e) => setProbe2Type(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-850"
                  >
                    <option value="Convex">Convex</option>
                    <option value="Linear">Linear</option>
                    <option value="Sector">Sector</option>
                    <option value="Micro-convex">Micro-convex</option>
                  </select>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">ความถี่ (MHz):</label>
                {probeTab === "probe1" ? (
                  <input
                    type="text"
                    value={probe1Freq}
                    onChange={(e) => setProbe1Freq(e.target.value)}
                    placeholder="เช่น 3.5"
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-800"
                  />
                ) : (
                  <input
                    type="text"
                    value={probe2Freq}
                    onChange={(e) => setProbe2Freq(e.target.value)}
                    placeholder="เช่น 7.5"
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-800"
                  />
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">หมายเลขเครื่อง:</label>
                {probeTab === "probe1" ? (
                  <input
                    type="text"
                    value={probe1Sn}
                    onChange={(e) => setProbe1Sn(e.target.value)}
                    placeholder="เช่น PRB-2023-001"
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-800"
                  />
                ) : (
                  <input
                    type="text"
                    value={probe2Sn}
                    onChange={(e) => setProbe2Sn(e.target.value)}
                    placeholder="เช่น PRB-2023-002"
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-800"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Quantitative parameters for active probe */}
          {probeTab === "probe1" ? (
            probe1Rows.length > 0 &&
            paramMetadata.length > 0 && (
              <TestParameterTable
                title="พารามิเตอร์การวัด"
                value={probe1Rows}
                onChange={setProbe1Rows}
                showRange={false}
                showParameterName={true}
                stdType="6 - แบบวัดครั้งเดียว (1 STD : 1 UUC)"
                displayType={paramMetadata[0]?.displayType}
                resolution={paramMetadata[0]?.resolution}
              />
            )
          ) : (
            probe2Rows.length > 0 &&
            paramMetadata.length > 0 && (
              <TestParameterTable
                title="พารามิเตอร์การวัด"
                value={probe2Rows}
                onChange={setProbe2Rows}
                showRange={false}
                showParameterName={true}
                stdType="6 - แบบวัดครั้งเดียว (1 STD : 1 UUC)"
                displayType={paramMetadata[0]?.displayType}
                resolution={paramMetadata[0]?.resolution}
              />
            )
          )}
        </div>
      )}

      {/* 2. Quantitative Parameters (Non-Ultrasound) */}
      {!isUltrasound &&
        quantitativeParams.map((param, i) => {
          const currentVal = paramValues[i]
          const currentMeta = paramMetadata[i]
          if (!currentVal || !currentMeta) return null

          return (
            <div key={(param.id || i) + "-" + (param.std_type || "")}>
              <TestParameterTable
                title={param.parameter_name}
                value={currentVal}
                onChange={(nextRows) => {
                  setParamValues((prev) => {
                    const next = [...prev]
                    next[i] = nextRows
                    return next
                  })
                }}
                displayType={currentMeta.displayType}
                onDisplayTypeChange={(val) => {
                  setParamMetadata((prev) => {
                    const next = [...prev]
                    next[i].displayType = val
                    return next
                  })
                }}
                resolution={currentMeta.resolution}
                onResolutionChange={(val) => {
                  setParamMetadata((prev) => {
                    const next = [...prev]
                    next[i].resolution = val
                    return next
                  })
                }}
                showRange={true}
                errorLimit={parseFloat(param.tolerance || "2.0")}
                stdType={param.std_type}
              />
            </div>
          )
        })}

      {/* 3. Summary component */}
      <CalibrationSummary
        isUltrasound={isUltrasound}
        probe1Checklist={probe1SummaryItems}
        probe2Checklist={probe2SummaryItems}
        customChecklist={checklistItems}
        onSave={onSave}
      />
    </div>
  )
})

export default TestDynamic

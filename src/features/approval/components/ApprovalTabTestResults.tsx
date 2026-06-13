import { useMemo, useCallback } from "react"
import type { TaskApi } from "@/features/pm/services/pmService"
import EnvironmentCard from "@/features/calibration/components/record/EnvironmentCard"
import StandardEquipmentSelector from "@/features/calibration/components/record/StandardEquipmentSelector"
import EkgTestCard from "@/features/calibration/components/record/EkgTestCard"
import CalibrationSummary from "@/features/calibration/components/record/CalibrationSummary"
import ApprovalParameterTable from "./ApprovalParameterTable"
import type { TestRow } from "./ApprovalParameterTable"

interface Props {
  task: TaskApi | null
}

interface EkgItem {
  id: string
  label: string
  status: "pass" | "fail" | null
}

export default function ApprovalTabTestResults({ task }: Props) {
  // 1. Environment Info
  const envData = useMemo(() => {
    const env = task?.environments?.[0]
    return {
      temperature: env?.ambient_temp,
      humidity: env?.ambient_humidity,
    }
  }, [task])

  // 2. Standard Equipment
  const standardToolIds = useMemo(() => {
    return task?.standardTools?.map((t) => t.id) || []
  }, [task])

  // 3. Specific Parameters (e.g. Infusion Pump settings stored in task.remarks JSON)
  const specificParameters = useMemo(() => {
    if (task?.specificParameters) return task.specificParameters
    if (task?.remarks && task.remarks.startsWith("[")) {
      try {
        return JSON.parse(task.remarks) as { name: string; value?: string; unit?: string }[]
      } catch (e) {
        console.error("Failed to parse specific parameters from remarks:", e)
      }
    }
    return []
  }, [task])

  // 4. Qualitative parameters grouping
  const groupedQualitatives = useMemo(() => {
    const groups: Record<string, EkgItem[]> = {}
    ;(task?.qualitatives || []).forEach((q) => {
      const pName = q.parameter_name || "พารามิเตอร์เชิงคุณภาพ"
      if (!groups[pName]) groups[pName] = []
      groups[pName].push({
        id: String(q.id),
        label: q.item_name,
        status:
          q.result?.toUpperCase() === "PASS"
            ? "pass"
            : q.result?.toUpperCase() === "FAIL"
            ? "fail"
            : null,
      })
    })
    return groups
  }, [task])

  // 5. Quantitative measurements grouping
  const groupedMeasurements = useMemo(() => {
    const groups: Record<string, TestRow[]> = {}
    ;(task?.measurements || []).forEach((m) => {
      const pName = m.parameter_name || ""
      if (!groups[pName]) groups[pName] = []

      // In some records UUC values are nested inside data object
      const getValue = (key: string): unknown => {
        if (m.data && typeof m.data === "object" && key in m.data) {
          return (m.data as Record<string, unknown>)[key]
        }
        return (m as unknown as Record<string, unknown>)[key]
      }

      groups[pName].push({
        range: getValue("range") ? String(getValue("range")) : "",
        standard: getValue("standard_value") as number | null,
        val1: getValue("reading_1") as number | null,
        val2: getValue("reading_2") as number | null,
        val3: getValue("reading_3") as number | null,
        stdVal1: getValue("std_reading_1") as number | null,
        stdVal2: getValue("std_reading_2") as number | null,
        stdVal3: getValue("std_reading_3") as number | null,
        average: getValue("average_value") as number | null,
        averageStd: getValue("average_standard") as number | null,
        error: getValue("error_value") as number | null,
        status:
          m.result?.toUpperCase() === "PASS"
            ? "pass"
            : m.result?.toUpperCase() === "FAIL"
            ? "fail"
            : null,
        std_type: m.std_type || undefined,
        parameterName: m.parameter_name || undefined,
      })
    })
    return groups
  }, [task])

  // Helpers to get displayType and resolution
  function getMetadata(name: string) {
    const item = task?.measurements?.find((m) => (m.parameter_name || "") === name)
    return {
      displayType: item?.display_type || "",
      resolution: item?.resolution || "",
    }
  }

  // 6. Summary and Checklist
  const checklistItems = useMemo(() => {
    const items: { label: string; icon: string; passed: boolean }[] = []

    Object.entries(groupedQualitatives).forEach(([name, values]) => {
      const tested = values.filter((v) => v.status !== null)
      const passed = tested.length > 0 && tested.every((v) => v.status === "pass")
      items.push({ label: name, icon: "fact_check", passed })
    })

    Object.entries(groupedMeasurements).forEach(([name, rows]) => {
      const tested = rows.filter((r) => r.status !== null)
      const passed = tested.length > 0 && tested.every((r) => r.status === "pass")
      items.push({ label: name, icon: "analytics", passed })
    })

    return items
  }, [groupedQualitatives, groupedMeasurements])

  const isUltrasound = useMemo(() => {
    return task?.equipment?.tool_name?.toLowerCase().includes("ultrasound") || false
  }, [task])

  const getProbeChecklist = useCallback((rangeNum: number) => {
    const measurements = task?.measurements || []
    const getStatus = (keywords: string[]) => {
      const matching = measurements.filter((m) => {
        const rVal =
          m.range !== undefined && m.range !== null ? m.range : (m.data?.range as number | undefined)
        if (rVal === undefined || Number(rVal) !== rangeNum) return false
        const name = (m.parameter_name || "").toLowerCase()
        return keywords.some((k) => name.includes(k))
      })
      if (matching.length === 0) return false
      return matching.every((m) => m.result?.toUpperCase() === "PASS")
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
  }, [task])

  const probe1SummaryItems = useMemo(() => getProbeChecklist(1), [getProbeChecklist])
  const probe2SummaryItems = useMemo(() => getProbeChecklist(2), [getProbeChecklist])

  const inspectorName = task?.approver?.name || task?.technician?.name || "-"
  const inspectorRole =
    task?.technician?.role?.description || task?.technician?.role?.name || "-"

  return (
    <div className="flex flex-col gap-6">
      {/* Environment and Standard Equipment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        <div className="md:col-span-4 flex flex-col">
          <EnvironmentCard readonly={true} envData={envData} />
        </div>
        <div className="md:col-span-8 flex flex-col">
          <StandardEquipmentSelector readonly={true} selectedIds={standardToolIds} />
        </div>
      </div>

      {/* Section Divider Bar */}
      <div className="bg-secondary text-white font-bold text-sm text-center py-2.5 uppercase tracking-wide rounded-lg my-2">
        ข้อมูลผลการทดสอบ
      </div>

      {/* 1. Specific Parameters (e.g. Infusion Pump parameters) */}
      {specificParameters.length > 0 && (
        <div className="mb-4">
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {specificParameters.map((sp) => {
                const valLower = (sp.value || "").toLowerCase()
                const isPass = valLower === "pass"
                const isFail = valLower === "fail"
                const textClass = isPass
                  ? "text-emerald-600 font-bold"
                  : isFail
                  ? "text-rose-600 font-bold"
                  : "text-slate-800 font-medium"

                return (
                  <div key={sp.name} className="flex flex-col gap-1">
                    <span className="text-[11px] font-semibold text-slate-500">{sp.name}:</span>
                    <div className={`h-10 border border-slate-200 rounded-lg px-3 bg-white flex items-center justify-between text-xs ${textClass}`}>
                      {sp.value || "-"} {sp.unit || ""}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. Qualitative Parameters (Cards) */}
      {Object.keys(groupedQualitatives).length > 0 && (
        <div className="flex flex-col gap-4">
          {Object.entries(groupedQualitatives).map(([groupName, items]) => (
            <EkgTestCard key={groupName} ekgItems={items} title={groupName} readonly={true} />
          ))}
        </div>
      )}

      {/* 3. Quantitative Parameters (Tables) */}
      {Object.keys(groupedMeasurements).length > 0 && (
        <div className="flex flex-col gap-2">
          {Object.entries(groupedMeasurements).map(([name, rows]) => (
            <ApprovalParameterTable
              key={name}
              title={name}
              rows={rows}
              showRange={rows.some((r) => !!r.range)}
              displayType={getMetadata(name).displayType}
              resolution={getMetadata(name).resolution}
              stdType={rows[0]?.std_type || ""}
            />
          ))}
        </div>
      )}

      {/* 4. Summary Section */}
      <CalibrationSummary
        isUltrasound={isUltrasound}
        probe1Checklist={probe1SummaryItems}
        probe2Checklist={probe2SummaryItems}
        customChecklist={checklistItems}
        inspectorName={inspectorName}
        inspectorRole={inspectorRole}
        onSave={() => {}} // Read-only / decorative for approval page
      />
    </div>
  )
}

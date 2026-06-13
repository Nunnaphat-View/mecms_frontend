import { useMemo } from "react"
import InspectorCard from "./InspectorCard"
import { CheckCircle2, XCircle, Activity, Gauge, Thermometer, Heart, Bell, ClipboardCheck, TrendingUp, StickyNote, Target, Ruler } from "lucide-react"

interface EkgItem {
  status: "pass" | "fail" | null
}

interface TestRow {
  status: "pass" | "fail" | null
}

interface ChecklistItem {
  label: string
  icon: string
  passed: boolean
}

interface Props {
  ekgItems?: EkgItem[]
  systolicData?: TestRow[]
  diastolicData?: TestRow[]
  tempData?: TestRow[]
  heartRateData?: TestRow[]
  spo2Data?: TestRow[]
  inspectorName?: string
  inspectorRole?: string
  customChecklist?: ChecklistItem[]
  isUltrasound?: boolean
  probe1Checklist?: ChecklistItem[]
  probe2Checklist?: ChecklistItem[]
  onSave: () => void
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  monitor_heart: Activity,
  speed: Gauge,
  device_thermostat: Thermometer,
  favorite: Heart,
  alarm: Bell,
  fact_check: ClipboardCheck,
  analytics: TrendingUp,
  bar_chart: StickyNote,
  notes: StickyNote,
  track_changes: Target,
  straighten: Ruler,
}

export default function CalibrationSummary({
  ekgItems = [],
  systolicData = [],
  diastolicData = [],
  tempData = [],
  heartRateData = [],
  spo2Data = [],
  inspectorName,
  inspectorRole,
  customChecklist,
  isUltrasound = false,
  probe1Checklist = [],
  probe2Checklist = [],
  onSave,
}: Props) {
  const ekgPassed = useMemo(() => {
    const tested = ekgItems.filter((i) => i.status !== null)
    return tested.length > 0 && tested.every((i) => i.status === "pass")
  }, [ekgItems])

  function tablePassed(rows: TestRow[]): boolean {
    const tested = rows.filter((r) => r.status !== null)
    return tested.length > 0 && tested.every((r) => r.status === "pass")
  }

  const checklistItems = useMemo(() => {
    if (customChecklist) return customChecklist

    return [
      { key: "ekg", label: "EKG", icon: "monitor_heart", passed: ekgPassed },
      {
        key: "systolic",
        label: "Systolic Pressure",
        icon: "speed",
        passed: tablePassed(systolicData),
      },
      {
        key: "diastolic",
        label: "Diastolic Pressure",
        icon: "speed",
        passed: tablePassed(diastolicData),
      },
      {
        key: "temp",
        label: "Temp",
        icon: "device_thermostat",
        passed: tablePassed(tempData),
      },
      {
        key: "heartRate",
        label: "Heart Rate",
        icon: "favorite",
        passed: tablePassed(heartRateData),
      },
      {
        key: "spo2",
        label: "SPO2",
        icon: "favorite", // Map default medical to favorite
        passed: tablePassed(spo2Data),
      },
    ]
  }, [customChecklist, ekgPassed, systolicData, diastolicData, tempData, heartRateData, spo2Data])

  const allPassed = useMemo(() => {
    if (isUltrasound) {
      const p1Ok = probe1Checklist.length > 0 && probe1Checklist.every((i) => i.passed)
      const p2Ok = probe2Checklist.length > 0 && probe2Checklist.every((i) => i.passed)
      return p1Ok && p2Ok
    }
    return checklistItems.length > 0 && checklistItems.every((i) => i.passed)
  }, [isUltrasound, probe1Checklist, probe2Checklist, checklistItems])

  return (
    <div className="mt-12 font-sans mb-8">
      {/* Section Header Bar */}
      <div className="bg-primary text-white font-bold text-sm text-center py-2.5 uppercase tracking-wide rounded-lg mb-6">
        สรุปผล
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* LEFT: Inspector card + Confirm button */}
        <div className="md:col-span-5 flex flex-col gap-4">
          <InspectorCard inspectorName={inspectorName} inspectorRole={inspectorRole} />

          {/* Confirm Button */}
          {allPassed ? (
            <button
              type="button"
              onClick={onSave}
              className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 transition-colors text-white font-bold text-base rounded-xl cursor-pointer shadow-sm flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="size-5.5" />
              ผ่าน
            </button>
          ) : (
            <button
              type="button"
              onClick={onSave}
              className="w-full h-14 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors text-rose-600 font-bold text-base rounded-xl cursor-pointer shadow-sm flex items-center justify-center gap-2"
            >
              <XCircle className="size-5.5 text-rose-500" />
              ไม่ผ่าน
            </button>
          )}
        </div>

        {/* RIGHT: Checklist */}
        <div className="md:col-span-7">
          {isUltrasound ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Probe 1 */}
              <div>
                <div className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider pl-3 border-l-3 border-primary">
                  หัวตรวจที่ 1
                </div>
                <div className="flex flex-col gap-2.5">
                  {probe1Checklist.map((item, idx) => {
                    const Icon = iconMap[item.icon] || ClipboardCheck

                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-700 justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="size-4.5 text-slate-400" />
                          <span>{item.label}</span>
                        </div>
                        {item.passed ? (
                          <CheckCircle2 className="size-5 text-emerald-500 fill-emerald-50" />
                        ) : (
                          <XCircle className="size-5 text-rose-500 fill-rose-50" />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Probe 2 */}
              <div>
                <div className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider pl-3 border-l-3 border-primary">
                  หัวตรวจที่ 2
                </div>
                <div className="flex flex-col gap-2.5">
                  {probe2Checklist.map((item, idx) => {
                    const Icon = iconMap[item.icon] || ClipboardCheck

                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-700 justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="size-4.5 text-slate-400" />
                          <span>{item.label}</span>
                        </div>
                        {item.passed ? (
                          <CheckCircle2 className="size-5 text-emerald-500 fill-emerald-50" />
                        ) : (
                          <XCircle className="size-5 text-rose-500 fill-rose-50" />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {checklistItems.map((item, idx) => {
                const Icon = iconMap[item.icon] || ClipboardCheck

                return (
                  <div
                    key={idx}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-700 justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="size-4.5 text-slate-400" />
                      <span>{item.label}</span>
                    </div>
                    {item.passed ? (
                      <CheckCircle2 className="size-5 text-emerald-500 fill-emerald-50" />
                    ) : (
                      <XCircle className="size-5 text-rose-500 fill-rose-50" />
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

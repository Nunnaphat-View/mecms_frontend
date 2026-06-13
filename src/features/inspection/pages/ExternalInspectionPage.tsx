import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Sparkles, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react"
import { useInspectionStore } from "@/features/inspection/stores/inspectionStore"
import type { InspectionValue } from "@/features/inspection/stores/inspectionStore"
import EquipmentDetailsCard from "@/features/inspection/components/EquipmentDetailsCard"
import InspectionSection from "@/features/inspection/components/InspectionSection"
import PmResultCard from "@/features/inspection/components/PmResultCard"

export default function ExternalInspectionPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notify, setNotify] = useState<{ type: "success" | "error" | "warning"; message: string } | null>(null)

  const store = useInspectionStore()

  useEffect(() => {
    const taskId = Number(id)
    if (taskId) {
      void store.loadFromTask(taskId)
    }
    return () => {
      store.resetAll()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // Auto-dismiss notification
  useEffect(() => {
    if (!notify) return
    const t = setTimeout(() => setNotify(null), 3500)
    return () => clearTimeout(t)
  }, [notify])

  async function onSubmit() {
    setIsSubmitting(true)
    const res = await store.submitPmForm()
    setIsSubmitting(false)

    if (res.success) {
      const result = store.getPmResult()
      setNotify({
        type: result === "ไม่ผ่าน" ? "warning" : "success",
        message: `บันทึกผล PM สำเร็จ — ผลลัพธ์: ${result}`,
      })
      setTimeout(() => {
        if (result === "ไม่ผ่าน") {
          void navigate("/calibration")
        } else {
          void navigate(`/calibration/record/${id ?? ""}`)
        }
      }, 1500)
    } else {
      setNotify({
        type: "error",
        message: res.error ?? "บันทึกไม่สำเร็จ กรุณาลองใหม่",
      })
    }
  }

  const pmResult = store.getPmResult()
  const pmBy = store.getPmBy()
  const pmPosition = store.getPmPosition()
  const generalItems = store.getGeneralItems()
  const safetyItems = store.getSafetyItems()
  const maintenanceItems = store.getMaintenanceItems()
  const generalRemarks = store.sections[0]?.remarks ?? ""
  const safetyRemarks = store.sections[1]?.remarks ?? ""
  const maintenanceRemarks = store.sections[2]?.remarks ?? ""

  return (
    <div className="flex flex-col gap-4 font-sans">
      {/* Notification Toast */}
      {notify && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl border bg-white/95 backdrop-blur-md shadow-lg min-w-[320px] max-w-md animate-in fade-in slide-in-from-bottom-5 duration-300 ${
            notify.type === "success"
              ? "border-emerald-100 border-l-4 border-l-emerald-500"
              : notify.type === "warning"
              ? "border-amber-100 border-l-4 border-l-amber-500"
              : "border-rose-100 border-l-4 border-l-rose-500"
          }`}
        >
          {notify.type === "success" && (
            <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
          )}
          {notify.type === "warning" && (
            <AlertTriangle className="size-5 text-amber-500 shrink-0" />
          )}
          {notify.type === "error" && (
            <AlertCircle className="size-5 text-rose-500 shrink-0" />
          )}
          <div className="flex flex-col gap-1">
            <span className="text-[13px] font-bold text-slate-800 leading-none">
              {notify.type === "success" ? "บันทึกผลการตรวจสอบสำเร็จ" : notify.type === "warning" ? "คำเตือน" : "พบข้อผิดพลาด"}
            </span>
            <span className="text-xs text-slate-500 font-medium leading-normal">
              {notify.message}
            </span>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-800">การตรวจสอบสภาพภายนอก</h1>
          <p className="text-xs text-slate-500 mt-0.5">การตรวจสอบเครื่องมือแพทย์</p>
        </div>
        <button
          type="button"
          onClick={() => store.fillMockData()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-amber-700 hover:bg-amber-50 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-amber-300"
        >
          <Sparkles className="size-3.5" />
          จำลองข้อมูล
        </button>
      </div>

      {/* PM No */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-slate-800 whitespace-nowrap">PM No :</span>
        <input
          type="text"
          value={store.pmNo}
          readOnly
          className="max-w-[200px] h-9 px-3 border border-slate-300 rounded-lg text-sm bg-white text-slate-800 focus:outline-none"
        />
      </div>

      {/* Error Banner */}
      {store.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {store.error}
        </div>
      )}

      {/* Loading State */}
      {store.isLoading && (
        <div className="flex items-center justify-center py-16 text-slate-500 text-sm gap-3">
          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          กำลังโหลดข้อมูล...
        </div>
      )}

      {!store.isLoading && (
        <>
          {/* Device Info */}
          <EquipmentDetailsCard details={store.deviceInfo} />

          {/* Inspection Grid */}
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: "repeat(2, 1fr)",
            }}
          >
            {/* Left Column: ตรวจสภาพทั่วไป */}
            <div className="flex flex-col">
              <InspectionSection
                title="ตรวจสภาพทั่วไป"
                items={generalItems}
                remarks={generalRemarks}
                onUpdate={(idx: number, val: InspectionValue) => store.setItemValue(0, idx, val)}
                onUpdateRemarks={(v) => store.setSectionRemarks(0, v)}
              />
            </div>

            {/* Right Column: ความปลอดภัย + การบำรุงรักษา + PM Result + Submit */}
            <div className="flex flex-col gap-4">
              <InspectionSection
                title="ความปลอดภัย"
                items={safetyItems}
                remarks={safetyRemarks}
                onUpdate={(idx: number, val: InspectionValue) => store.setItemValue(1, idx, val)}
                onUpdateRemarks={(v) => store.setSectionRemarks(1, v)}
              />

              <InspectionSection
                title="การบำรุงรักษา"
                items={maintenanceItems}
                remarks={maintenanceRemarks}
                onUpdate={(idx: number, val: InspectionValue) => store.setItemValue(2, idx, val)}
                onUpdateRemarks={(v) => store.setSectionRemarks(2, v)}
              />

              <PmResultCard result={pmResult} pmBy={pmBy} position={pmPosition} />

              {/* Submit Button */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => void onSubmit()}
                className="w-full py-3.5 px-8 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-bold text-base rounded-xl transition-all cursor-pointer shadow-sm"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    กำลังบันทึก...
                  </span>
                ) : pmResult === "ผ่าน" ? (
                  "ส่งสอบเทียบ"
                ) : (
                  "ส่งซ่อม"
                )}
              </button>
            </div>
          </div>

          {/* Responsive: stack on mobile */}
          <style>{`
            @media (max-width: 960px) {
              .inspection-grid {
                grid-template-columns: 1fr !important;
              }
            }
          `}</style>
        </>
      )}
    </div>
  )
}

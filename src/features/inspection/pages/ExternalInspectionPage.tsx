import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Sparkles} from "lucide-react"
import { useInspectionStore } from "@/features/inspection/stores/inspectionStore"
import type { InspectionValue } from "@/features/inspection/stores/inspectionStore"
import EquipmentDetailsCard from "@/features/inspection/components/EquipmentDetailsCard"
import InspectionSection from "@/features/inspection/components/InspectionSection"
import PmResultCard from "@/features/inspection/components/PmResultCard"
import SaveStatusOverlay from "@/components/common/SaveStatusOverlay"

export default function ExternalInspectionPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [submitStatus, setSubmitStatus] = useState<"idle" | "saving" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

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

  async function onSubmit() {
    setSubmitStatus("saving")
    const res = await store.submitPmForm()

    if (res.success) {
      const result = store.getPmResult()
      setSubmitStatus("success")
      setTimeout(() => {
        setSubmitStatus("idle")
        if (result === "ไม่ผ่าน") {
          void navigate("/calibration")
        } else {
          void navigate(`/calibration/record/${id ?? ""}`)
        }
      }, 1500)
    } else {
      setSubmitStatus("error")
      setErrorMessage(res.error ?? "เกิดข้อผิดพลาดในการบันทึกข้อมูล")
      setTimeout(() => setSubmitStatus("idle"), 1500)
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
      <SaveStatusOverlay
        status={submitStatus}
        savingText="กำลังบันทึกข้อมูล PM..."
        savingSubtext="กรุณารอสักครู่ ระบบกำลังบันทึกข้อมูลและอัปเดตสถานะ"
        successText="บันทึกผล PM สำเร็จ!"
        successSubtext={
          store.getPmResult() === "ไม่ผ่าน"
            ? "เครื่องมือไม่ผ่านการตรวจเช็ค กำลังนำส่งซ่อม..."
            : "ระบบบันทึกเรียบร้อย กำลังนำทางไปบันทึกผลทดสอบ..."
        }
        errorSubtext={errorMessage}
      />

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
                disabled={submitStatus !== "idle"}
                onClick={() => void onSubmit()}
                className="w-full py-3.5 px-8 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-bold text-base rounded-xl transition-all cursor-pointer shadow-sm"
              >
                {submitStatus !== "idle" ? (
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

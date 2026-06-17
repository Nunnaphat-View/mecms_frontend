import { useEffect, useState, useRef } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { Sparkles, ArrowLeft, CheckCircle2, ChevronRight, Save } from "lucide-react"
import { useCalibrationRecordStore } from "@/features/calibration/stores/calibrationRecordStore"
import TabGeneralInfo from "@/features/calibration/components/record/TabGeneralInfo"
import TabTestResults, { type TabTestResultsHandle } from "@/features/calibration/components/record/TabTestResults"
import SaveConfirmDialog from "@/features/calibration/components/record/SaveConfirmDialog"
import SaveStatusOverlay from "@/components/common/SaveStatusOverlay"

export default function CalibrationRecordPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const store = useCalibrationRecordStore()

  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle")
  const testResultsRef = useRef<TabTestResultsHandle>(null)

  // Get active tab from URL query parameter 'tab', fallback to store value
  const queryTab = searchParams.get("tab") as "general" | "test_results" | null
  const activeTab = queryTab || store.activeTab

  // Load record on mount
  useEffect(() => {
    if (id) {
      void store.fetchCalibrationRecord(id)
    }
    return () => {
      store.resetStore()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // Sync tab with URL parameter
  function switchTab(tab: "general" | "test_results") {
    store.setActiveTab(tab)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set("tab", tab)
      return next
    })
  }

  function handleBack() {
    if (store.isDirty) {
      const confirmLeave = window.confirm(
        "คุณมีข้อมูลที่ยังไม่ได้บันทึก หากออกจากหน้านี้ข้อมูลจะหายไปทั้งหมด ต้องการออกหรือไม่?"
      )
      if (confirmLeave) {
        navigate("/calibration")
      }
    } else {
      navigate("/calibration")
    }
  }

  function handleNext() {
    if (activeTab === "general") {
      switchTab("test_results")
    } else {
      setShowSaveDialog(true)
    }
  }

  async function handleSaveDraft() {
    setSaveStatus("saving")
    try {
      const success = await store.saveDraft()
      if (success) {
        setSaveStatus("success")
        setTimeout(() => {
          setSaveStatus("idle")
        }, 1000)
      }
    } catch (err: unknown) {
      setSaveStatus("error")
      const e = err as { response?: { data?: { message?: string } } }
      const errMsg = e.response?.data?.message ?? "บันทึกไม่สำเร็จ"
      setErrorMessage(errMsg)
      setTimeout(() => setSaveStatus("idle"), 1500)
    }
  }

  async function handleConfirmSave() {
    setSaveStatus("saving")
    try {
      const success = await store.submitCalibration("PendingApproval")
      if (success) {
        setSaveStatus("success")
        setShowSaveDialog(false)
        setTimeout(() => {
          setSaveStatus("idle")
          navigate("/calibration")
        }, 1500)
      }
    } catch (err: unknown) {
      setSaveStatus("error")
      const e = err as { response?: { data?: { message?: string } } }
      const errMsg = e.response?.data?.message ?? "บันทึกไม่สำเร็จ"
      setErrorMessage(errMsg)
      setTimeout(() => setSaveStatus("idle"), 1500)
    }
  }

  return (
    <div className="flex flex-col gap-6 font-sans">

      {/* Header Page Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">บันทึกการสอบเทียบเครื่องมือ</h1>
        <p className="text-slate-500 text-xs mt-1">กรอกข้อมูลบันทึกผลการทดสอบการสอบเทียบ</p>
      </div>

      {/* Main Container Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {/* Top Header info + Tabs */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end p-6 border-b border-slate-200 gap-6 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {store.equipmentDetails.tool_name || "Patient Monitor"}
            </h2>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-slate-500 mt-1">
              <div>
                <span className="text-slate-400">บริษัท :</span>{" "}
                {store.equipmentDetails.company}
              </div>
              <div>
                <span className="text-slate-400">รุ่น :</span> {store.equipmentDetails.model}
              </div>
              <div>
                <span className="text-slate-400">หมายเลขเครื่อง :</span>{" "}
                {store.equipmentDetails.serialNumber}
              </div>
            </div>
          </div>

          {/* Custom Styled Tabs */}
          <div className="flex gap-1 items-end border-b border-transparent">
            <button
              type="button"
              onClick={() => switchTab("general")}
              className={`min-w-[140px] py-2.5 px-4 font-bold text-xs rounded-t-xl transition-all cursor-pointer select-none text-center ${
                activeTab === "general"
                  ? "bg-primary text-white"
                  : "bg-slate-100 text-primary hover:bg-slate-200"
              }`}
            >
              ข้อมูลทั่วไป
            </button>
            <button
              type="button"
              onClick={() => switchTab("test_results")}
              className={`min-w-[140px] py-2.5 px-4 font-bold text-xs rounded-t-xl transition-all cursor-pointer select-none text-center ${
                activeTab === "test_results"
                  ? "bg-primary text-white"
                  : "bg-slate-100 text-primary hover:bg-slate-200"
              }`}
            >
              บันทึกผลทดสอบ
            </button>
          </div>
        </div>

        {/* Tab Content Area */}
        <div className="border-t-4 border-primary">
          {store.loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-500 text-sm gap-3">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              กำลังโหลดข้อมูล...
            </div>
          ) : (
            <>
              {activeTab === "general" && <TabGeneralInfo />}
              {activeTab === "test_results" && <TabTestResults ref={testResultsRef} onSave={() => setShowSaveDialog(true)} />}
            </>
          )}
        </div>
      </div>

      {/* Floating Footer Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50 border border-slate-200 p-4 rounded-2xl shadow-xs mt-4">
        {/* Left Actions */}
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              store.fillMockData()
              testResultsRef.current?.fillMockData()
            }}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-5 py-2.5 bg-white border border-amber-300 text-amber-700 hover:bg-amber-50 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <Sparkles className="size-3.5" />
            จำลองข้อมูล
          </button>
          <button
            type="button"
            onClick={handleBack}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-5 py-2.5 bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-3.5" />
            ย้อนกลับ
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => void handleSaveDraft()}
            disabled={store.loading || saveStatus !== "idle"}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-5 py-2.5 bg-white border border-primary text-primary hover:bg-primary/5 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Save className="size-3.5" />
            บันทึกแบบร่าง
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={(activeTab === "test_results" && !store.canSubmit()) || saveStatus !== "idle"}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-5 py-2.5 bg-primary hover:bg-primary/95 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
          >
            {activeTab === "general" ? (
              <>
                ถัดไป
                <ChevronRight className="size-3.5" />
              </>
            ) : (
              <>
                <CheckCircle2 className="size-3.5" />
                บันทึก
              </>
            )}
          </button>
        </div>
      </div>

      <SaveStatusOverlay
        status={saveStatus}
        savingText="กำลังบันทึกข้อมูล..."
        savingSubtext="กรุณารอสักครู่ ระบบกำลังบันทึกและส่งข้อมูล"
        successText="บันทึกข้อมูลสำเร็จ!"
        successSubtext={
          showSaveDialog
            ? "ระบบบันทึกผลทดสอบเรียบร้อย กำลังนำทางกลับ..."
            : "ระบบบันทึกแบบร่างเรียบร้อยแล้ว"
        }
        errorSubtext={errorMessage}
      />

      {/* Confirmation modal */}
      <SaveConfirmDialog
        isOpen={showSaveDialog}
        onClose={() => saveStatus === "idle" && setShowSaveDialog(false)}
        onConfirm={handleConfirmSave}
        isSubmitting={saveStatus === "saving"}
      />
    </div>
  )
}

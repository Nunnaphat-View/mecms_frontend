import { useEffect, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { Loader2, CheckCircle2, XCircle, HelpCircle, AlertTriangle } from "lucide-react"
import { useApprovalStore } from "../stores/approvalStore"
import { pmService } from "../services/pmService"
import type { TaskApi } from "../services/pmService"
import { useAuthStore } from "../stores/authStore"
import ApprovalTabGeneralInfo from "../components/approval/ApprovalTabGeneralInfo"
import ApprovalTabTestResults from "../components/approval/ApprovalTabTestResults"

type ToastType = "success" | "error" | "warning"

interface Toast {
  type: ToastType
  message: string
}

export default function ApprovalDetailPage() {
  const navigate = useNavigate()
  const { id: approvalId } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = (searchParams.get("tab") as "general" | "test_results") || "general"

  const store = useApprovalStore()
  const { user } = useAuthStore()

  // Local Page States
  const [loading, setLoading] = useState(true)
  const [task, setTask] = useState<TaskApi | null>(null)
  const [showRemarkField, setShowRemarkField] = useState(false)
  const [rejectRemark, setRejectRemark] = useState("")
  const [remarkError, setRemarkError] = useState("")
  const [toast, setToast] = useState<Toast | null>(null)

  function showToast(type: ToastType, message: string) {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  // Load Task details
  useEffect(() => {
    async function loadTask() {
      setLoading(true)
      // Call fetchApprovals first to locate the correct taskId from the pm_no
      await store.fetchApprovals()
      const approval = store.approvals.find((a) => a.id === approvalId)

      if (approval) {
        try {
          const res = await pmService.getTask(approval.taskId)
          setTask(res)
        } catch (err) {
          console.error("Failed to load task:", err)
          showToast("error", "ไม่สามารถโหลดข้อมูลการสอบเทียบได้")
        }
      } else {
        showToast("error", "ไม่พบงานการสอบเทียบที่กำหนด")
      }
      setLoading(false)
    }

    void loadTask()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approvalId])

  const switchTab = (tab: "general" | "test_results") => {
    setSearchParams({ tab })
  }

  const handleApprove = async () => {
    if (!task) return
    try {
      const approverId = user?.id || 1
      await store.approveEvent(task.id, approverId)
      showToast("success", "อนุมัติการสอบเทียบสำเร็จ!")
      setTimeout(() => navigate("/history"), 1000)
    } catch (err) {
      console.error("Approve Error:", err)
      showToast("error", "เกิดข้อผิดพลาดในการอนุมัติ")
    }
  }

  const handleReject = () => {
    setRejectRemark("")
    setRemarkError("")
    setShowRemarkField(true)
  }

  const cancelReject = () => {
    setShowRemarkField(false)
    setRejectRemark("")
    setRemarkError("")
  }

  const confirmReject = async () => {
    if (!task) return
    if (!rejectRemark.trim()) {
      setRemarkError("กรุณากรอกหมายเหตุ")
      return
    }

    try {
      const approverId = user?.id || 1
      await store.rejectEvent(task.id, rejectRemark.trim(), approverId)
      showToast("error", "ไม่อนุมัติการสอบเทียบ")
      setTimeout(() => navigate("/history"), 1000)
    } catch (err) {
      console.error("Reject Error:", err)
      showToast("error", "เกิดข้อผิดพลาดในการส่งกลับการสอบเทียบ")
    }
  }

  const overallResult = task?.overall_result
  const isPass = overallResult === "Pass"
  const isFail = overallResult === "Fail"

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 z-[9999] px-4 py-3 rounded-xl shadow-lg border text-white font-semibold flex items-center gap-2 animate-in slide-in-from-bottom duration-250 ${
            toast.type === "success"
              ? "bg-emerald-500 border-emerald-600"
              : toast.type === "error"
              ? "bg-rose-500 border-rose-600"
              : "bg-amber-500 border-amber-600"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Page Title Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">รับรองการสอบเทียบเครื่องมือ</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="size-10 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Main Card Container */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col">
            {/* Top Details & Tabs Bar */}
            <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-slate-50/50">
              <div className="flex-1">
                <h2 className="text-lg font-bold text-slate-800">
                  {task?.equipment?.tool_name || "ไม่ระบุชื่อเครื่อง"}
                </h2>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 mt-2 text-xs text-slate-500 font-medium">
                  <div>
                    <span>รหัสการสอบเทียบ : </span>
                    <span className="font-bold text-slate-800">{task?.pm_no || approvalId}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span>สถานะ :</span>
                    {isPass ? (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-500">
                        ผ่าน
                        <CheckCircle2 className="size-4" />
                      </span>
                    ) : isFail ? (
                      <span className="inline-flex items-center gap-1 font-bold text-rose-500">
                        ไม่ผ่าน
                        <XCircle className="size-4" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-bold text-slate-400">
                        {overallResult === "NA" ? "N/A" : "-"}
                        <HelpCircle className="size-4" />
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Tabs Switcher */}
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
                  รับรองผลการสอบเทียบ
                </button>
              </div>
            </div>

            {/* Active Tab Panel */}
            <div className="p-6 border-t-[4px] border-primary">
              {activeTab === "general" ? (
                <ApprovalTabGeneralInfo task={task} />
              ) : (
                <ApprovalTabTestResults task={task} />
              )}
            </div>
          </div>

          {/* Inline Rejection Remark Field */}
          {showRemarkField && (
            <div className="bg-white border-l-[4px] border-l-rose-500 border border-slate-200 rounded-2xl p-6 shadow-xs animate-in slide-in-from-top duration-250 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-rose-500 font-bold text-sm">
                <AlertTriangle className="size-5" />
                <span>หมายเหตุและเหตุผลที่ไม่อนุมัติ</span>
                <span className="text-rose-500 font-medium">*</span>
              </div>
              <textarea
                value={rejectRemark}
                onChange={(e) => {
                  setRejectRemark(e.target.value)
                  if (e.target.value.trim()) setRemarkError("")
                }}
                rows={3}
                placeholder="ระบุเหตุผลที่ไม่อนุมัติ..."
                className={`w-full p-4 border rounded-2xl text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-primary transition-colors bg-white ${
                  remarkError ? "border-rose-500" : "border-slate-200"
                }`}
              />
              {remarkError && (
                <span className="text-rose-500 text-xs font-semibold pl-1">{remarkError}</span>
              )}
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex justify-between items-center pb-12">
            <button
              type="button"
              onClick={() => (showRemarkField ? cancelReject() : navigate(-1))}
              className="min-w-[140px] h-11 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer select-none"
            >
              {showRemarkField ? "ยกเลิก" : "ย้อนกลับ"}
            </button>

            {activeTab === "general" ? (
              <button
                type="button"
                onClick={() => switchTab("test_results")}
                className="min-w-[140px] h-11 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer select-none"
              >
                ถัดไป
              </button>
            ) : (
              <div className="flex items-center gap-3">
                {!showRemarkField ? (
                  <>
                    <button
                      type="button"
                      onClick={handleReject}
                      className="min-w-[140px] h-11 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer select-none"
                    >
                      ไม่อนุมัติ
                    </button>
                    <button
                      type="button"
                      onClick={handleApprove}
                      className="min-w-[140px] h-11 bg-emerald-600 hover:bg-emerald-755 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer select-none"
                    >
                      อนุมัติ
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={confirmReject}
                    className="min-w-[180px] h-11 bg-rose-600 hover:bg-rose-755 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer select-none"
                  >
                    ยืนยันไม่อนุมัติ
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

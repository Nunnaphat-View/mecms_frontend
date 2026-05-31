import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, RefreshCw, AlertCircle, Settings, CheckCircle, XCircle, User, Calendar, History, Clock } from "lucide-react"

interface PublicStatusData {
  equipment: {
    id: number
    name: string
    model: string
    serial_number: string
    manufacturer: string
    calibration_due_date: string
    equipmentType?: { name: string }
    section?: { name: string }
  }
  latestTask: {
    createdAt: string
    overall_result: string
    remarks: string
    technician?: { name: string }
  } | null
  history: Array<{
    createdAt: string
    overall_result: string
    technician?: { name: string }
  }>
}

export default function PublicStatusPlaceholderPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [data, setData] = useState<PublicStatusData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"

  useEffect(() => {
    if (!id) return

    async function fetchPublicStatus() {
      setLoading(true)
      setError(false)
      try {
        const res = await fetch(`${API_BASE_URL}/equipment/public-status/${id}`)
        if (!res.ok) {
          throw new Error("Failed to fetch public status")
        }
        const json = await res.json()
        setData(json)
      } catch (err) {
        console.error("Public status fetch error:", err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchPublicStatus()
  }, [id, API_BASE_URL])

  function formatDate(d: string | null | undefined) {
    if (!d) return "-"
    return new Date(d).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  function getDaysRemaining(nextDue: string | undefined) {
    if (!nextDue) return null
    const today = new Date()
    const due = new Date(nextDue)
    const diff = due.getTime() - today.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days > 0 ? days : 0
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 print:hidden">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => navigate("/history")}
            className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-500 cursor-pointer"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div className="font-bold text-sm text-slate-800">สถานะเครื่องมือแพทย์</div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <RefreshCw className="size-8 text-primary animate-spin" />
            <span className="text-xs text-slate-500">กำลังโหลดข้อมูล...</span>
          </div>
        ) : error || !data ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center mb-4">
              <AlertCircle className="size-7 text-rose-500" />
            </div>
            <h2 className="text-base font-bold text-slate-800">ไม่พบข้อมูลเครื่องมือแพทย์</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              รหัสครุภัณฑ์หรือ ID นี้อาจไม่ถูกต้อง หรือไม่มีข้อมูลประวัติในระบบ
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Left Column: Device Info & History */}
            <div className="space-y-6 md:col-span-1">
              
              {/* Tool Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
                {/* Decorative background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none"></div>

                <div className="inline-block px-2.5 py-0.5 bg-primary/10 border border-primary/20 text-primary rounded-md text-[10px] font-bold font-mono">
                  ID: {data.equipment.id}
                </div>

                <div className="flex items-center gap-3.5 mt-4">
                  <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center flex-shrink-0 text-primary">
                    <Settings className="size-5.5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm text-slate-800 leading-tight">
                      {data.equipment.name}
                    </h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {data.equipment.model} ({data.equipment.equipmentType?.name || "-"})
                    </p>
                  </div>
                </div>

                <hr className="border-slate-100 my-4" />

                <div className="space-y-3 text-xs text-slate-600">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">แผนก</span>
                    <span className="font-semibold text-slate-800">
                      {data.equipment.section?.name || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">ยี่ห้อ</span>
                    <span className="font-semibold text-slate-800">
                      {data.equipment.manufacturer || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Serial No.</span>
                    <span className="font-semibold text-slate-800 font-mono">
                      {data.equipment.serial_number || "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Calibration History Timeline */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center gap-2 font-bold text-slate-800 text-sm mb-4">
                  <History className="size-4 text-primary" />
                  ประวัติการสอบเทียบ
                </div>

                <div className="space-y-4">
                  {data.history.map((log, idx) => (
                    <div key={idx} className="relative flex gap-3">
                      {/* Timeline Line */}
                      {idx !== data.history.length - 1 && (
                        <div className="absolute left-1.5 top-4 bottom-[-16px] w-[1px] bg-slate-100"></div>
                      )}
                      {/* Dot */}
                      <div
                        className={`w-3 h-3 rounded-full border-2 bg-white flex-shrink-0 z-10 ${
                          log.overall_result === "Pass"
                            ? "border-emerald-500"
                            : "border-rose-500"
                        }`}
                      ></div>
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-bold text-[11px] text-slate-700 leading-none mt-0.5">
                            {formatDate(log.createdAt)}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold leading-none ${
                              log.overall_result === "Pass"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-rose-50 text-rose-700"
                            }`}
                          >
                            {log.overall_result === "Pass" ? "ผ่าน" : "ไม่ผ่าน"}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">
                          โดย {log.technician?.name || "-"}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!data.history || data.history.length === 0) && (
                    <p className="text-center text-slate-400 text-xs py-4">ไม่มีประวัติการสอบเทียบ</p>
                  )}
                </div>
              </div>

            </div>

            {/* Right Column: Status Details */}
            <div className="space-y-6 md:col-span-2">
              
              {/* Status Banner */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-800 text-sm">ผลการสอบเทียบล่าสุด</h3>
                  <span className="text-[10px] text-slate-400">
                    ข้อมูล ณ วันที่ {formatDate(data.latestTask?.createdAt)}
                  </span>
                </div>

                <div
                  className={`border rounded-xl p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 ${
                    data.latestTask?.overall_result === "Pass"
                      ? "bg-emerald-50/50 border-emerald-100 text-emerald-800"
                      : "bg-rose-50/50 border-rose-100 text-rose-800"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-xs">
                      {data.latestTask?.overall_result === "Pass" ? (
                        <CheckCircle className="size-6 text-emerald-600" />
                      ) : (
                        <XCircle className="size-6 text-rose-500" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs">
                        {data.latestTask?.overall_result === "Pass"
                          ? "ผ่านการสอบเทียบ (Passed Calibration)"
                          : "ไม่ผ่านการสอบเทียบ (Failed Calibration)"}
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {data.latestTask?.overall_result === "Pass"
                          ? "Passed Calibration Standards"
                          : "Failed Calibration Standards"}
                      </p>
                    </div>
                  </div>

                  <div className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-700 sm:self-center self-start">
                    สถานะ:{" "}
                    {data.latestTask?.overall_result === "Pass"
                      ? "ใช้งานได้ปกติ (Normal)"
                      : "ต้องส่งซ่อม/แก้ไข (Maintenance Required)"}
                  </div>
                </div>

                {/* Detail Blocks */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                      <User className="size-4.5" />
                    </div>
                    <div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase">ผู้สอบเทียบ</div>
                      <div className="font-bold text-xs text-slate-800">
                        {data.latestTask?.technician?.name || "-"}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                      <Calendar className="size-4.5" />
                    </div>
                    <div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase">วันที่สอบเทียบ</div>
                      <div className="font-bold text-xs text-slate-800">
                        {formatDate(data.latestTask?.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between sm:col-span-2 gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                        <Clock className="size-4.5" />
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase">
                          กำหนดสอบเทียบครั้งถัดไป
                        </div>
                        <div className="font-bold text-xs text-slate-800">
                          {formatDate(data.equipment.calibration_due_date)}
                        </div>
                      </div>
                    </div>
                    {getDaysRemaining(data.equipment.calibration_due_date) !== null && (
                      <div className="px-3 py-1 bg-pink-50 border border-pink-100 text-pink-700 rounded-lg text-xs font-bold font-sans">
                        อีก {getDaysRemaining(data.equipment.calibration_due_date)} วัน
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Remarks/Notes */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center gap-2 font-bold text-slate-400 text-xs uppercase mb-3.5">
                  หมายเหตุ (Notes/Remarks)
                </div>
                <div className="p-4 bg-amber-50/50 border border-amber-100 text-amber-900 rounded-xl text-xs leading-relaxed">
                  {data.latestTask?.remarks || "ไม่มีหมายเหตุเพิ่มเติม"}
                </div>
              </div>

            </div>

          </div>
        )}
      </div>
    </div>
  )
}

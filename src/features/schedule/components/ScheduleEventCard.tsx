import { useNavigate } from "react-router-dom"
import { MapPin, User, RefreshCw, CalendarDays } from "lucide-react"
import type { CalibrationEvent } from "../../stores/scheduleStore"
import { useHistoryStore } from "../../stores/historyStore"

interface ScheduleEventCardProps {
  event: CalibrationEvent
}

export const ScheduleEventCard = ({ event }: ScheduleEventCardProps) => {
  const navigate = useNavigate()

  const formatThaiDate = (dateStr?: string) => {
    if (!dateStr) return "-"
    const spl = dateStr.split("-")
    const year = parseInt(spl[0] ?? "0", 10)
    const month = parseInt(spl[1] ?? "1", 10) - 1
    const day = parseInt(spl[2] ?? "0", 10)
    if (!year || month < 0 || !day) return "-"

    const thaiMonthsAbbr = [
      "ม.ค.",
      "ก.พ.",
      "มี.ค.",
      "เม.ย.",
      "พ.ค.",
      "มิ.ย.",
      "ก.ค.",
      "ส.ค.",
      "ก.ย.",
      "ต.ค.",
      "พ.ย.",
      "ธ.ค.",
    ]

    return `${day} ${thaiMonthsAbbr[month]} ${year + 543}`
  }

  const handleGoToDetails = () => {
    navigate(`/status/${event.toolCode}`)
  }

  const handleGoToHistory = () => {
    // Set query in history store to search for this specific equipment and navigate
    useHistoryStore.getState().setSearchQuery(event.toolCode)
    navigate("/history")
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
      {/* Title & Status Badge */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <h4 className="font-bold text-sm text-slate-800 leading-snug">
            {event.tool_name}
          </h4>
          <span className="text-[11px] font-mono text-slate-400 mt-1 block">
            {event.toolCode}
          </span>
        </div>
        <span
          className={`px-3 py-1 text-[10px] font-bold rounded-lg ${
            event.isCompleted
              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
              : "bg-emerald-100 text-emerald-800"
          }`}
        >
          {event.isCompleted ? "สอบเทียบเสร็จสิ้น" : "ตรงตามรอบ"}
        </span>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs text-slate-600">
        <div className="flex items-center gap-2 min-w-0">
          <MapPin className="size-4 text-slate-400 shrink-0" />
          <span className="truncate">{event.location}</span>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <User className="size-4 text-slate-400 shrink-0" />
          <span className="truncate">{event.assignedTo}</span>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <RefreshCw className="size-4 text-slate-400 shrink-0" />
          <span className="truncate">{event.frequency}</span>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <CalendarDays className="size-4 text-slate-400 shrink-0" />
          <span className="truncate">ครั้งล่าสุด: {formatThaiDate(event.lastCalibrationDate)}</span>
        </div>
      </div>

      <hr className="border-slate-100 my-0.5" />

      {/* Footer Navigation Buttons */}
      <div className="flex gap-4 text-xs font-bold text-primary">
        <button
          onClick={handleGoToDetails}
          className="hover:underline hover:text-[#07536a] cursor-pointer text-left select-none"
        >
          ดูรายละเอียดเครื่อง
        </button>
        <button
          onClick={handleGoToHistory}
          className="hover:underline hover:text-[#07536a] cursor-pointer text-left select-none"
        >
          ดูประวัติการสอบเทียบ
        </button>
      </div>
    </div>
  )
}

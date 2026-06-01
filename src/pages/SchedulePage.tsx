import { useEffect, useMemo } from "react"
import { Calendar, CalendarX, RefreshCw } from "lucide-react"
import { useScheduleStore } from "../stores/scheduleStore"
import { useAuthStore } from "../stores/authStore"
import { ScheduleCalendar } from "../components/schedule/ScheduleCalendar"
import { ScheduleEventCard } from "../components/schedule/ScheduleEventCard"

export default function SchedulePage() {
  const { events, selectedDate, loading, fetchEvents } = useScheduleStore()
  const { user } = useAuthStore()
  const currentUserName = user?.name || ""

  useEffect(() => {
    void fetchEvents()
  }, [fetchEvents])

  // Get events on selected date (sorted by user's tasks first)
  const selectedDateEvents = useMemo(() => {
    const filtered = events.filter((e) => e.dueDate === selectedDate)
    return [...filtered].sort((a, b) => {
      const isAMine = a.assignedTo === currentUserName
      const isBMine = b.assignedTo === currentUserName
      if (isAMine && !isBMine) return -1
      if (!isAMine && isBMine) return 1
      return 0
    })
  }, [events, selectedDate, currentUserName])

  const formattedSelectedDate = useMemo(() => {
    if (!selectedDate || selectedDate === "-") return "-"
    const parts = selectedDate.split("-")
    const year = parseInt(parts[0] ?? "0", 10)
    const month = parseInt(parts[1] ?? "1", 10) - 1
    const day = parseInt(parts[2] ?? "0", 10)

    if (!year || month < 0 || !day) return "-"

    const thaiMonthsFull = [
      "มกราคม",
      "กุมภาพันธ์",
      "มีนาคม",
      "เมษายน",
      "พฤษภาคม",
      "มิถุนายน",
      "กรกฎาคม",
      "สิงหาคม",
      "กันยายน",
      "ตุลาคม",
      "พฤศจิกายน",
      "ธันวาคม",
    ]

    const thaiDaysFull = [
      "อาทิตย์",
      "จันทร์",
      "อังคาร",
      "พุธ",
      "พฤหัสบดี",
      "ศุกร์",
      "เสาร์",
    ]

    const d = new Date(year, month, day)
    const dayName = thaiDaysFull[d.getDay()]

    return `${dayName}, ${day} ${thaiMonthsFull[month]} ${year + 543}`
  }, [selectedDate])

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Calendar className="size-5.5 text-primary" />
          แผนการสอบเทียบเครื่องมือแพทย์
        </h1>
        <p className="text-slate-500 text-xs mt-0.5">จัดการและติดตามรอบการสอบเทียบ</p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Calendar */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col h-[500px] lg:h-[calc(100vh-170px)]">
          <ScheduleCalendar />
        </div>

        {/* Right Column: Events List */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col h-[500px] lg:h-[calc(100vh-170px)] relative">
          {/* Header Card Box */}
          <div className="bg-[#088395] text-white p-5 rounded-2xl shadow-xs mb-4 select-none">
            <h3 className="font-bold text-sm">รายการสอบเทียบ</h3>
            <p className="text-xs opacity-80 mt-1">{formattedSelectedDate}</p>
            <span className="inline-block bg-white text-[#1e293b] font-bold text-[10px] px-3 py-1 rounded-full mt-4.5 shadow-xs">
              ทั้งหมด : {selectedDateEvents.length} เครื่อง
            </span>
          </div>

          {/* Events Scroll Area */}
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white border border-slate-200 rounded-2xl">
                <RefreshCw className="size-8 text-[#088395] animate-spin" />
                <span className="text-xs text-slate-500 font-bold">กำลังโหลดแผนการสอบเทียบ...</span>
              </div>
            ) : selectedDateEvents.length > 0 ? (
              selectedDateEvents.map((event) => (
                <ScheduleEventCard key={event.id} event={event} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-slate-200 rounded-2xl bg-white shadow-xs">
                <CalendarX className="size-12 text-slate-300 mb-3" />
                <span className="text-xs font-bold text-slate-400">ไม่มีแผนการสอบเทียบในวันนี้</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

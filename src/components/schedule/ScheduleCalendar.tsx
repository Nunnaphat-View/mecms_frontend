import { useState, useMemo } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useScheduleStore } from "../../stores/scheduleStore"
import { useAuthStore } from "../../stores/authStore"

export const ScheduleCalendar = () => {
  const { events, selectedDate, selectDate } = useScheduleStore()
  const { user } = useAuthStore()
  const currentUserName = user?.name || ""

  const today = new Date()
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()) // 0-11

  const thaiMonths = [
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

  const monthYearString = `${thaiMonths[currentMonth]} ${currentYear + 543}`

  // Get total days in month
  const daysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonth + 1, 0).getDate()
  }, [currentYear, currentMonth])

  // Get day of the week of the 1st day of the month
  const blankDaysCount = useMemo(() => {
    return new Date(currentYear, currentMonth, 1).getDay()
  }, [currentYear, currentMonth])

  const getDateStr = (day: number) => {
    const m = String(currentMonth + 1).padStart(2, "0")
    const d = String(day).padStart(2, "0")
    return `${currentYear}-${m}-${d}`
  }

  // Count events for a specific day
  const getEventCounts = (day: number) => {
    const dateStr = getDateStr(day)
    const dayEvents = events.filter((e) => e.dueDate === dateStr)
    const mine = dayEvents.filter((e) => e.assignedTo === currentUserName).length
    const others = dayEvents.filter((e) => e.assignedTo !== currentUserName).length
    return { mine, others }
  }

  // Total events in the current month
  const totalEventsInMonth = useMemo(() => {
    let total = 0
    for (let i = 1; i <= daysInMonth; i++) {
      const { mine, others } = getEventCounts(i)
      total += mine + others
    }
    return total
  }, [events, daysInMonth, currentMonth, currentYear, currentUserName])

  const isToday = (day: number) => {
    const d = new Date()
    return (
      d.getDate() === day &&
      d.getMonth() === currentMonth &&
      d.getFullYear() === currentYear
    )
  }

  const isSelected = (day: number) => {
    return selectedDate === getDateStr(day)
  }

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear((prev) => prev - 1)
    } else {
      setCurrentMonth((prev) => prev - 1)
    }
  }

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear((prev) => prev + 1)
    } else {
      setCurrentMonth((prev) => prev + 1)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100">
        <div className="flex items-center gap-1.5">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer select-none"
          >
            <ChevronLeft className="size-4" />
          </button>
          <div className="text-sm font-bold text-slate-800 px-2 min-w-[120px] text-center">
            {monthYearString}
          </div>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer select-none"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
        <div className="text-[11px] text-slate-400 font-semibold tracking-wide hidden sm:block">
          แสดง {totalEventsInMonth} รายการ
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 p-3 bg-white overflow-y-auto">
        <div className="grid grid-cols-7 border-t border-l border-slate-100 rounded-lg overflow-hidden">
          {/* Weekdays */}
          {["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."].map((day, idx) => (
            <div
              key={day}
              className={`text-center py-2.5 text-xs font-bold border-r border-b border-slate-100 bg-slate-50/70 ${
                idx === 0 ? "text-rose-500" : idx === 6 ? "text-sky-500" : "text-slate-500"
              }`}
            >
              {day}
            </div>
          ))}

          {/* Blank Days */}
          {Array.from({ length: blankDaysCount }).map((_, i) => (
            <div
              key={`blank-${i}`}
              className="min-h-[70px] md:min-h-[100px] border-r border-b border-slate-100 bg-slate-50/20"
            />
          ))}

          {/* Actual Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1
            const { mine, others } = getEventCounts(dayNum)
            const active = isSelected(dayNum)
            const todayCell = isToday(dayNum)

            return (
              <div
                key={`day-${dayNum}`}
                onClick={() => selectDate(getDateStr(dayNum))}
                className={`min-h-[70px] md:min-h-[100px] p-1.5 flex flex-col items-center justify-between border-r border-b border-slate-100 cursor-pointer transition-all select-none hover:bg-slate-50/75 relative ${
                  active ? "bg-sky-50/40 ring-1 ring-inset ring-primary" : todayCell ? "bg-amber-50/20" : ""
                }`}
              >
                {/* Date label */}
                <div
                  className={`size-6.5 text-xs font-bold flex items-center justify-center transition-colors ${
                    todayCell
                      ? "bg-rose-500 text-white rounded-full shadow-xs"
                      : active
                      ? "text-primary"
                      : "text-slate-700"
                  }`}
                >
                  {dayNum}
                </div>

                {/* Event badges */}
                <div className="w-full flex flex-col gap-1 mt-1.5 px-0.5">
                  {others > 0 && (
                    <div className="text-[9px] py-0.5 px-1.5 bg-slate-100 text-slate-600 border border-slate-200/40 rounded-full text-center font-bold truncate leading-tight">
                      {others} เครื่อง
                    </div>
                  )}
                  {mine > 0 && (
                    <div className="text-[9px] py-0.5 px-1.5 bg-[#088395] text-white rounded-full text-center font-bold truncate leading-tight shadow-xs">
                      {mine} เครื่อง
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer Legend */}
      <div className="flex items-center gap-4 px-4 py-3 border-t border-slate-100 bg-slate-50/30">
        <div className="flex items-center gap-1.5">
          <div className="size-2.5 rounded-full bg-slate-200" />
          <span className="text-[11px] text-slate-500 font-bold">งานทั้งหมด</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-2.5 rounded-full bg-[#088395]" />
          <span className="text-[11px] text-slate-500 font-bold">งานของฉัน</span>
        </div>
      </div>
    </div>
  )
}

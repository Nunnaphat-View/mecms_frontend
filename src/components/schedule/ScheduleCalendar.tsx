import { useState, useMemo } from "react"
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"
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

  // Generate 10 years in past and 10 years in future
  const years = useMemo(() => {
    const list = []
    const startYear = today.getFullYear() - 10
    const endYear = today.getFullYear() + 10
    for (let y = startYear; y <= endYear; y++) {
      list.push(y)
    }
    return list
  }, [])

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
    <div className="flex flex-col bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden transition-all duration-300">
      {/* Header with premium white custom selectors */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4.5 border-b border-slate-100 bg-slate-50/15">
        <div className="flex items-center gap-3">
          {/* Previous Month Button */}
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer select-none active:scale-95 bg-white shadow-2xs"
            title="เดือนก่อนหน้า"
          >
            <ChevronLeft className="size-4" />
          </button>

          {/* Month & Year Select Dropdowns with custom styled arrows */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={currentMonth}
                onChange={(e) => setCurrentMonth(Number(e.target.value))}
                className="appearance-none h-9 pl-4 pr-9 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold focus:outline-none focus:border-primary transition-all outline-none cursor-pointer shadow-2xs"
              >
                {thaiMonths.map((m, idx) => (
                  <option key={idx} value={idx} className="bg-white text-slate-800 font-semibold">
                    {m}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={currentYear}
                onChange={(e) => setCurrentYear(Number(e.target.value))}
                className="appearance-none h-9 pl-4 pr-9 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold focus:outline-none focus:border-primary transition-all outline-none cursor-pointer shadow-2xs"
              >
                {years.map((y) => (
                  <option key={y} value={y} className="bg-white text-slate-800 font-semibold">
                    {y + 543}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Next Month Button */}
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer select-none active:scale-95 bg-white shadow-2xs"
            title="เดือนถัดไป"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        <div className="text-xs text-slate-400 font-bold tracking-wide bg-slate-100/60 px-3 py-1 rounded-full border border-slate-200/20">
          ทั้งหมด {totalEventsInMonth} รายการสอบเทียบ
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4 bg-white">
        <div className="grid grid-cols-7 gap-px bg-slate-200/70 rounded-2xl overflow-hidden border border-slate-200/50 shadow-2xs">
          {/* Weekdays */}
          {["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."].map((day, idx) => (
            <div
              key={day}
              className={`text-center py-3.5 text-xs font-bold bg-slate-50/80 border-b border-slate-200/30 select-none tracking-wider ${
                idx === 0 ? "text-rose-500" : idx === 6 ? "text-[#088395]" : "text-slate-500"
              }`}
            >
              {day}
            </div>
          ))}

          {/* Blank Days */}
          {Array.from({ length: blankDaysCount }).map((_, i) => (
            <div
              key={`blank-${i}`}
              className="min-h-[85px] md:min-h-[110px] bg-slate-50/10"
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
                className={`min-h-[85px] md:min-h-[110px] p-2.5 flex flex-col items-center justify-between bg-white cursor-pointer transition-all duration-200 select-none hover:bg-slate-50/60 hover:scale-[1.01] hover:shadow-2xs relative ${
                  active
                    ? "bg-sky-50/20! shadow-[inset_0_0_0_2px_#09637e] rounded-xl z-10"
                    : todayCell
                    ? "bg-amber-50/10"
                    : ""
                }`}
              >
                {/* Date label circle */}
                <div
                  className={`size-7 text-xs font-bold flex items-center justify-center rounded-full transition-all ${
                    todayCell
                      ? "bg-rose-500 text-white shadow-sm font-extrabold"
                      : active
                      ? "bg-[#09637e] text-white shadow-xs font-extrabold"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {dayNum}
                </div>

                {/* Event badges */}
                <div className="w-full flex flex-col gap-1 mt-2.5 px-0.5">
                  {others > 0 && (
                    <div className="text-[9px] py-1 px-2.5 bg-slate-100 text-slate-600 border border-slate-200/50 rounded-lg text-center font-bold truncate leading-none">
                      {others} เครื่อง
                    </div>
                  )}
                  {mine > 0 && (
                    <div className="text-[9px] py-1 px-2.5 bg-[#088395] text-white rounded-lg text-center font-bold truncate leading-none shadow-xs">
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
      <div className="flex items-center gap-6 px-6 py-4.5 border-t border-slate-100 bg-slate-50/30">
        <div className="flex items-center gap-2">
          <div className="size-2.5 rounded-full bg-slate-200 shadow-2xs" />
          <span className="text-[11px] text-slate-500 font-extrabold tracking-wide">งานทั้งหมด</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-2.5 rounded-full bg-[#088395] shadow-2xs" />
          <span className="text-[11px] text-slate-500 font-extrabold tracking-wide">งานของฉัน</span>
        </div>
      </div>
    </div>
  )
}

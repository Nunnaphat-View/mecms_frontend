import React, { useMemo } from "react"
import { useWardsStore } from "@/stores/wardsStore"

export const WardScheduleCalendar: React.FC = () => {
  const { getTimelineEvents } = useWardsStore()

  const now = useMemo(() => new Date(), [])
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

  // Month name (e.g. 'Jun 2026')
  const monthName = useMemo(() => {
    const date = new Date(currentYear, currentMonth)
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
  }, [currentYear, currentMonth])

  // Calculate number of days in the month
  const daysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonth + 1, 0).getDate()
  }, [currentYear, currentMonth])

  // Calculate first weekday of month
  const startingDay = useMemo(() => {
    return new Date(currentYear, currentMonth, 1).getDay()
  }, [currentYear, currentMonth])

  // Get unique dates with events
  const eventDates = useMemo(() => {
    const events = getTimelineEvents()
    const dates = events.map((e) => e.date)
    return new Set(dates)
  }, [getTimelineEvents])

  const hasEvent = (date: number) => eventDates.has(date)

  // Generate weekday headers
  const weekdays = ["S", "M", "T", "W", "T", "F", "S"]

  return (
    <div className="bg-white border border-slate-200 rounded-xl flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center px-5 py-4">
        <span className="text-sm font-semibold text-slate-800 font-medium">Schedule</span>
        <span className="text-xs font-semibold text-slate-500">{monthName}</span>
      </div>

      <div className="h-px bg-slate-100" />

      {/* Calendar Body */}
      <div className="p-4">
        {/* Weekdays */}
        <div className="grid grid-cols-7 mb-3 text-center">
          {weekdays.map((day, idx) => (
            <div key={`${day}-${idx}`} className="text-xs font-semibold text-slate-400">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-y-4">
          {/* Empty slots for starting offset */}
          {Array.from({ length: startingDay }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-8" />
          ))}

          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const date = idx + 1
            const isToday = date === now.getDate()
            return (
              <div key={`day-${date}`} className="flex flex-col items-center justify-start h-8 relative select-none">
                <span
                  className={`text-xs font-semibold ${
                    isToday ? "text-primary font-bold" : "text-slate-700"
                  }`}
                >
                  {date}
                </span>
                {hasEvent(date) && (
                  <div className="size-1.5 bg-slate-400 rounded-full absolute bottom-0.5" />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 pb-5 pt-1 flex items-center gap-2">
        <div className="size-1.5 bg-slate-400 rounded-full" />
        <span className="text-xs font-medium text-slate-500">กำหนดสอบเทียบ</span>
      </div>
    </div>
  )
}

import { useState, useEffect, useRef } from "react"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react"
import { formatThaiDate } from "@/utils/date"

interface DatePickerProps {
  value: string // YYYY-MM-DD format
  onChange: (date: string) => void
  placeholder?: string
  required?: boolean
  label?: string
  align?: "up" | "down"
}

export default function DatePicker({
  value,
  onChange,
  placeholder = "เลือกวันที่...",
  required = false,
  label,
  align = "up",
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Current view state of the calendar popup
  const [currentDate, setCurrentDate] = useState(() => {
    if (value) {
      const parsed = new Date(value)
      if (!isNaN(parsed.getTime())) return parsed
    }
    return new Date()
  })

  // Synchronize view state if external value changes (done during render to avoid cascading useEffect renders)
  const [prevValue, setPrevValue] = useState(value)
  if (value !== prevValue) {
    setPrevValue(value)
    if (value) {
      const parsed = new Date(value)
      if (!isNaN(parsed.getTime())) {
        setCurrentDate(parsed)
      }
    }
  }

  // Click outside to close helper
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Month names in Thai
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

  const weekDays = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"]

  // Year range for selector (e.g., +/- 10 years)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 40 }, (_, i) => currentYear - 30 + i)

  // Calendar logic
  const firstDayIndex = new Date(year, month, 1).getDay()
  const totalDays = new Date(year, month + 1, 0).getDate()
  const prevMonthTotalDays = new Date(year, month, 0).getDate()

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const handleYearChange = (newYear: number) => {
    setCurrentDate(new Date(newYear, month, 1))
  }

  const handleMonthChange = (newMonth: number) => {
    setCurrentDate(new Date(year, newMonth, 1))
  }

  const handleSelectDay = (day: number) => {
    const selected = new Date(year, month, day)
    // Format to local timezone YYYY-MM-DD
    const yyyy = selected.getFullYear()
    const mm = String(selected.getMonth() + 1).padStart(2, "0")
    const dd = String(selected.getDate()).padStart(2, "0")
    onChange(`${yyyy}-${mm}-${dd}`)
    setIsOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange("")
  }

  // Generate date cells
  const dateCells: { day: number; isCurrentMonth: boolean; isSelected: boolean; dateKey: string }[] = []

  // Previous month padding days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const prevDay = prevMonthTotalDays - i
    const mVal = month === 0 ? 11 : month - 1
    const yVal = month === 0 ? year - 1 : year
    dateCells.push({
      day: prevDay,
      isCurrentMonth: false,
      isSelected: false,
      dateKey: `${yVal}-${mVal}-${prevDay}`,
    })
  }

  // Current month days
  const parsedValueDate = value ? new Date(value) : null
  const selectedDay = parsedValueDate && parsedValueDate.getFullYear() === year && parsedValueDate.getMonth() === month
    ? parsedValueDate.getDate()
    : null

  for (let i = 1; i <= totalDays; i++) {
    dateCells.push({
      day: i,
      isCurrentMonth: true,
      isSelected: selectedDay === i,
      dateKey: `${year}-${month}-${i}`,
    })
  }

  // Next month padding days to round up to complete week rows (usually 42 cells)
  const remainingCells = 42 - dateCells.length
  for (let i = 1; i <= remainingCells; i++) {
    const mVal = month === 11 ? 0 : month + 1
    const yVal = month === 11 ? year + 1 : year
    dateCells.push({
      day: i,
      isCurrentMonth: false,
      isSelected: false,
      dateKey: `${yVal}-${mVal}-${i}`,
    })
  }

  // Format display text using formatThaiDate
  const displayValue = value ? formatThaiDate(value, { monthStyle: "short" }) : ""

  return (
    <div className="space-y-1.5 w-full relative" ref={containerRef}>
      {label && (
        <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
          <CalendarIcon className="size-3.5 text-slate-400" />
          {label}
          {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Input Field Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-center justify-between cursor-pointer hover:border-primary hover:bg-white transition-all text-slate-700 select-none relative"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <CalendarIcon className="size-4 text-slate-400 flex-shrink-0" />
          {displayValue ? (
            <span className="font-medium text-slate-800">{displayValue}</span>
          ) : (
            <span className="text-slate-400 font-sans">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {value && (
            <button
              onClick={handleClear}
              type="button"
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <X className="size-3" />
            </button>
          )}
          <ChevronRight className={`size-3.5 text-slate-400 transition-transform ${isOpen ? "rotate-90" : ""}`} />
        </div>
      </div>

      {/* Calendar Popover */}
      {isOpen && (
        <div
          className={`absolute left-0 w-76 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-3.5 animate-in fade-in duration-150 font-sans ${
            align === "up"
              ? "bottom-full mb-1.5 slide-in-from-bottom-2"
              : "top-full mt-1.5 slide-in-from-top-2"
          }`}
        >
          
          {/* Calendar Header Navigation */}
          <div className="flex justify-between items-center mb-3">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors text-slate-600 cursor-pointer"
            >
              <ChevronLeft className="size-4" />
            </button>

            {/* Quick Dropdown Selectors for Month and Year */}
            <div className="flex items-center gap-1 font-bold text-xs text-slate-800">
              <select
                value={month}
                onChange={(e) => handleMonthChange(Number(e.target.value))}
                className="bg-transparent hover:bg-slate-50 px-1 py-0.5 rounded cursor-pointer font-bold text-xs border-0 outline-none focus:ring-0"
              >
                {thaiMonths.map((mName, idx) => (
                  <option key={idx} value={idx}>
                    {mName}
                  </option>
                ))}
              </select>

              <select
                value={year}
                onChange={(e) => handleYearChange(Number(e.target.value))}
                className="bg-transparent hover:bg-slate-50 px-1 py-0.5 rounded cursor-pointer font-bold text-xs border-0 outline-none focus:ring-0 font-mono"
              >
                {years.map((yVal) => (
                  <option key={yVal} value={yVal}>
                    {yVal + 543}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors text-slate-600 cursor-pointer"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          {/* Weekday Row */}
          <div className="grid grid-cols-7 gap-y-1 mb-1.5 text-center">
            {weekDays.map((day, idx) => (
              <span
                key={idx}
                className={`text-[10px] font-bold uppercase ${
                  idx === 0 ? "text-rose-500" : idx === 6 ? "text-sky-600" : "text-slate-400"
                }`}
              >
                {day}
              </span>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {dateCells.map((cell, idx) => {
              const isWeekend = idx % 7 === 0 || idx % 7 === 6
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => cell.isCurrentMonth && handleSelectDay(cell.day)}
                  disabled={!cell.isCurrentMonth}
                  className={`h-7.5 w-7.5 rounded-lg text-xs font-medium flex items-center justify-center transition-all ${
                    !cell.isCurrentMonth
                      ? "text-slate-200 cursor-default"
                      : cell.isSelected
                      ? "bg-primary text-white font-bold shadow-xs scale-105"
                      : isWeekend
                      ? "text-slate-500 hover:bg-slate-100 cursor-pointer"
                      : "text-slate-800 hover:bg-slate-50 cursor-pointer"
                  }`}
                >
                  {cell.day}
                </button>
              )
            })}
          </div>

          {/* Today Button / Footer */}
          <div className="mt-3.5 pt-2 border-t border-slate-100 flex justify-between items-center">
            <button
              type="button"
              onClick={() => {
                const today = new Date()
                const yyyy = today.getFullYear()
                const mm = String(today.getMonth() + 1).padStart(2, "0")
                const dd = String(today.getDate()).padStart(2, "0")
                onChange(`${yyyy}-${mm}-${dd}`)
                setIsOpen(false)
              }}
              className="text-[10.5px] font-bold text-primary hover:underline cursor-pointer"
            >
              เลือกวันนี้
            </button>
            <span className="text-[9px] text-slate-400 font-medium">
              แสดงปี พ.ศ. {year + 543}
            </span>
          </div>

        </div>
      )}
    </div>
  )
}

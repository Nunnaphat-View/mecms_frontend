import { ClipboardList, User2, ChevronDown, CalendarDays, MapPin } from "lucide-react"
import type { TaskApi } from "@/features/pm/services/pmService"
import type { User } from "@/types/auth"

interface UnassignedTasksPanelProps {
  unassignedTasks: TaskApi[]
  technicians: User[]
  isPublished: boolean
  isEditModeOverride: boolean
  onAssignTechnician: (taskId: number, technicianId: number) => void
  thaiMonthName: string
  thaiYear: number
}

export function UnassignedTasksPanel({
  unassignedTasks,
  technicians,
  isPublished,
  isEditModeOverride,
  onAssignTechnician,
  thaiMonthName,
  thaiYear,
}: UnassignedTasksPanelProps) {
  if (unassignedTasks.length === 0) return null

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs flex flex-col h-[800px] transition-all duration-200">
      {/* Panel Header */}
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/40 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <ClipboardList className="size-4 text-amber-500 shrink-0" />
          <span className="text-xs font-bold text-slate-700">
            งานรอมอบหมาย ({unassignedTasks.length} รายการ)
          </span>
        </div>
        <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-bold border border-amber-200/50">
          {thaiMonthName} {thaiYear}
        </span>
      </div>

      {/* Panel Body (List of Cards) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {unassignedTasks.map((task) => {
          const dueStr = task.equipment?.calibration_due_date
            ? task.equipment.calibration_due_date.split("T")[0]
            : "-"
          
          let formattedDue = dueStr
          if (dueStr !== "-") {
            const spl = dueStr.split("-")
            if (spl.length === 3) {
              formattedDue = `${spl[2]}/${spl[1]}/${parseInt(spl[0], 10) + 543}`
            }
          }

          return (
            <div 
              key={task.id} 
              className="bg-slate-50/30 hover:bg-slate-50 border border-slate-150/70 hover:border-slate-200 p-3 rounded-xl transition-all duration-150 flex flex-col gap-2 shadow-3xs"
            >
              {/* Tool Name & Due Date Badge */}
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-slate-800 text-[11px] leading-tight line-clamp-2">
                  {task.equipment?.tool_name || `เครื่องมือ #${task.equipment_id}`}
                </span>
                <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-100/60 px-1.5 py-0.5 rounded-md shrink-0 flex items-center gap-1">
                  <CalendarDays className="size-2.5" />
                  {formattedDue}
                </span>
              </div>

              {/* Asset Code & Section / Location */}
              <div className="flex flex-col gap-1 text-[10px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider w-11 shrink-0">รหัส:</span>
                  <span className="font-mono font-bold text-slate-700 select-all">
                    {task.equipment?.asset_code || `-`}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider w-11 shrink-0">แผนก:</span>
                  <span className="font-semibold text-slate-600 flex items-center gap-1">
                    <MapPin className="size-2.5 text-slate-400 shrink-0" />
                    {task.equipment?.section?.name || task.equipment?.location || "-"}
                  </span>
                </div>
              </div>

              {/* Assign Technician Dropdown */}
              <div className="border-t border-slate-100 pt-2 mt-0.5 flex flex-col gap-1">
                <div className="relative w-full">
                  <select
                    value=""
                    disabled={isPublished && !isEditModeOverride}
                    onChange={(e) => onAssignTechnician(task.id, Number(e.target.value))}
                    className="appearance-none w-full h-7 pl-7 pr-7 bg-white border border-slate-200 text-slate-700 rounded-lg text-[10px] font-bold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all outline-none cursor-pointer shadow-3xs"
                  >
                    <option value="" disabled className="text-slate-400">
                      -- เลือกช่างผู้รับผิดชอบ --
                    </option>
                    {technicians.map((tech) => (
                      <option key={tech.id} value={tech.id}>
                        {tech.name}
                      </option>
                    ))}
                  </select>
                  <User2 className="absolute left-2 top-1/2 -translate-y-1/2 size-3 text-slate-400 pointer-events-none" />
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 size-3 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

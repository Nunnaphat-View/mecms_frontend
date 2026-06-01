import { create } from "zustand"
import { pmService } from "../services/pmService"

export interface CalibrationEvent {
  id: string
  taskId: number
  toolCode: string
  toolName: string
  location: string
  frequency: string
  assignedTo: string
  dueDate: string // YYYY-MM-DD
  isCompleted: boolean
  lastCalibrationDate?: string
}

interface ScheduleState {
  events: CalibrationEvent[]
  selectedDate: string
  loading: boolean
  fetchEvents: () => Promise<void>
  selectDate: (dateStr: string) => void
}

const getTodayStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export const useScheduleStore = create<ScheduleState>((set) => ({
  events: [],
  selectedDate: getTodayStr(),
  loading: false,

  selectDate: (dateStr) => set({ selectedDate: dateStr }),

  fetchEvents: async () => {
    set({ loading: true })
    try {
      const tasks = await pmService.getTasks()
      
      const mappedEvents: CalibrationEvent[] = tasks
        .map((task) => {
          const rawDate = task.equipment?.calibration_due_date || task.createdAt
          const dueDate = rawDate ? rawDate.split("T")[0] : "-"
          
          let frequency = "ทุก 12 เดือน"
          if (task.equipment?.interval) {
            frequency = `ทุก ${task.equipment.interval} วัน`
          }

          // Determine last calibration date
          let lastCalDate = task.equipment?.calibration_date_last || ""
          if (!lastCalDate && dueDate !== "-") {
            const spl = dueDate.split("-")
            const year = parseInt(spl[0] ?? "0", 10)
            const month = parseInt(spl[1] ?? "0", 10)
            const day = parseInt(spl[2] ?? "0", 10)
            if (year && month && day) {
              const prevDate = new Date(year, month - 1 - 6, day)
              lastCalDate = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}-${String(prevDate.getDate()).padStart(2, "0")}`
            }
          }

          return {
            id: task.pm_no || `TASK-${task.id}`,
            taskId: task.id,
            toolCode: task.equipment?.asset_code || String(task.equipment_id),
            toolName: task.equipment?.name || `เครื่องมือ #${task.equipment_id}`,
            location: task.equipment?.section?.name || task.equipment?.location || "-",
            frequency,
            assignedTo: task.technician?.name || "-",
            dueDate,
            isCompleted: ["Approved", "Done"].includes(task.status),
            lastCalibrationDate: lastCalDate ? lastCalDate.split("T")[0] : undefined
          }
        })
        .filter((e) => e.dueDate !== "-")

      set({ events: mappedEvents })
    } catch (error) {
      console.error("fetchEvents error:", error)
    } finally {
      set({ loading: false })
    }
  },
}))

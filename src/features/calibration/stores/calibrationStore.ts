import { create } from "zustand"
import { pmService } from "@/features/pm/services/pmService"

export interface CalibrationRecord {
  id: string // รหัสสอบเทียบ e.g. CAL-01
  taskId: number // backend task id
  tool_name: string // ชื่อเครื่องมือ
  deviceCode: string // รหัสเครื่อง e.g. BME-001
  location: string // ที่ตั้ง e.g. ICU-01
  type: string // ประเภท e.g. Medical
  dueDate: string // ครบกำหนด YYYY-MM-DD
  responsible: string // ผู้รับผิดชอบ
  status: string // Task status: Pending, InProgress, ReCalibrate
}

interface CalibrationState {
  records: CalibrationRecord[]
  loading: boolean
  searchQuery: string
  selectedType: string
  typeOptions: { label: string; value: string }[]
  setSearchQuery: (query: string) => void
  setSelectedType: (type: string) => void
  fetchFromApi: () => Promise<void>
}

export const useCalibrationStore = create<CalibrationState>((set) => ({
  records: [],
  loading: false,
  searchQuery: "",
  selectedType: "",
  typeOptions: [
    { label: "ทั้งหมด", value: "" },
    { label: "Medical", value: "Medical" },
    { label: "Dimension", value: "Dimension" },
  ],

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedType: (type) => set({ selectedType: type }),

  fetchFromApi: async () => {
    set({ loading: true })
    try {
      const res = await pmService.getTasks()
      // Only show tasks that are yet to be calibrated (status = 'Pending', 'InProgress' or 'ReCalibrate')
      const pendingTasks = res.filter((task) =>
        ["Pending", "InProgress", "ReCalibrate"].includes(task.status)
      )

      const mappedRecords: CalibrationRecord[] = pendingTasks.map((task) => ({
        id: task.cal_no || `TASK-${task.id}`,
        taskId: task.id,
        tool_name: task.equipment?.tool_name ?? `Equipment #${task.equipment_id}`,
        deviceCode: task.equipment?.asset_code ?? String(task.equipment_id),
        location: task.equipment?.section?.name || task.equipment?.location || "-",
        type: "Medical", // Matches original Quasar default
        dueDate: (() => {
          const rawDate = task.scheduled_date || task.equipment?.calibration_due_date
          return rawDate ? rawDate.split("T")[0] : "-"
        })(),
        responsible: task.technician?.name ?? "-",
        status: task.status,
      }))

      set({ records: mappedRecords })
    } catch (error) {
      console.error("fetchFromApi error:", error)
    } finally {
      set({ loading: false })
    }
  },
}))

import { create } from "zustand"
import { pmService } from "../services/pmService"

export type CalibrationResult = "pass" | "fail" | "na"

export interface HistoryRecord {
  id: string
  taskId: number
  date: string // YYYY-MM-DD
  deviceName: string
  deviceCode: string
  inspector: string
  result: CalibrationResult
  pathPdfCer: string | null
}

interface HistoryState {
  records: HistoryRecord[]
  loading: boolean
  searchQuery: string
  selectedDevice: string
  selectedResult: string
  setSearchQuery: (query: string) => void
  setSelectedDevice: (device: string) => void
  setSelectedResult: (result: string) => void
  fetchRecords: () => Promise<void>
}

export const useHistoryStore = create<HistoryState>((set) => ({
  records: [],
  loading: false,
  searchQuery: "",
  selectedDevice: "",
  selectedResult: "",

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedDevice: (device) => set({ selectedDevice: device }),
  setSelectedResult: (result) => set({ selectedResult: result }),

  fetchRecords: async () => {
    set({ loading: true })
    try {
      const res = await pmService.getTasks()
      const approvedOrRejected = res.filter((task) =>
        ["Approved", "Rejected"].includes(task.status)
      )

      const mappedRecords: HistoryRecord[] = approvedOrRejected.map((task) => {
        const resVal = task.overall_result?.toLowerCase()
        return {
          id: String(task.pm_no || `CAL-${task.id}`),
          taskId: Number(task.id),
          date: String((task.createdAt || "").split("T")[0]),
          deviceName: String(task.equipment?.name || "Unknown"),
          deviceCode: String(task.equipment?.asset_code || "-"),
          inspector: String(
            task.certificate_data?.technician?.name || task.technician?.name || "-"
          ),
          result: (resVal === "pass"
            ? "pass"
            : resVal === "fail"
              ? "fail"
              : resVal === "na"
                ? "na"
                : "fail") as CalibrationResult,
          pathPdfCer: task.path_pdf_cer || null,
        }
      })

      set({ records: mappedRecords })
    } catch (error) {
      console.error("fetchRecords error:", error)
    } finally {
      set({ loading: false })
    }
  },
}))

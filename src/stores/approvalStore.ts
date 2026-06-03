import { create } from "zustand"
import { pmService } from "../services/pmService"

export interface ApprovalEvent {
  id: string
  taskId: number
  tool_name: string
  toolCode: string
  location: string
  calDate: string
  result: string
  status: "pending" | "approved" | "rejected"
}

interface ApprovalState {
  approvals: ApprovalEvent[]
  loading: boolean
  searchQuery: string
  selectedType: string
  typeOptions: { label: string; value: string }[]
  setSearchQuery: (query: string) => void
  setSelectedType: (type: string) => void
  fetchApprovals: () => Promise<void>
  approveEvent: (taskId: number, approverId: number) => Promise<boolean>
  rejectEvent: (taskId: number, remarks: string, approverId: number) => Promise<boolean>
}

export const useApprovalStore = create<ApprovalState>((set, get) => ({
  approvals: [],
  loading: false,
  searchQuery: "",
  selectedType: "ทั้งหมด",
  typeOptions: [
    { label: "ทั้งหมด", value: "ทั้งหมด" },
    { label: "รอดำเนินการ", value: "pending" },
    { label: "อนุมัติแล้ว", value: "approved" },
    { label: "ปฏิเสธ", value: "rejected" },
  ],

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedType: (type) => set({ selectedType: type }),

  fetchApprovals: async () => {
    set({ loading: true })
    try {
      const res = await pmService.getTasks()
      // Filter for tasks submitted for approval (status === 'PendingApproval')
      const submitted = res.filter((task) => task.status === "PendingApproval")
      const mapped: ApprovalEvent[] = submitted.map((task) => {
        let displayResult = "-"
        if (task.overall_result === "Pass") displayResult = "ผ่าน"
        else if (task.overall_result === "Fail") displayResult = "ไม่ผ่าน"
        else if (task.overall_result === "NA") displayResult = "N/A"

        let displayStatus: "pending" | "approved" | "rejected" = "pending"
        if (task.status === "Approved") displayStatus = "approved"
        else if (task.status === "Rejected") displayStatus = "rejected"

        return {
          id: task.pm_no || `CAL-${task.id}`,
          taskId: task.id,
          tool_name: task.equipment?.tool_name || "Unknown",
          toolCode: task.equipment?.asset_code || "-",
          location: task.equipment?.section?.name || task.equipment?.location || "-",
          calDate: task.createdAt ? new Date(task.createdAt).toLocaleDateString("th-TH") : "-",
          result: displayResult,
          status: displayStatus,
        }
      })
      set({ approvals: mapped })
    } catch (error) {
      console.error("fetchApprovals error:", error)
    } finally {
      set({ loading: false })
    }
  },

  approveEvent: async (taskId, approverId) => {
    try {
      await pmService.approveTask(taskId, approverId)
      await get().fetchApprovals()
      return true
    } catch (error) {
      console.error("Approve Error:", error)
      throw error
    }
  },

  rejectEvent: async (taskId, remarks, approverId) => {
    try {
      await pmService.rejectTask(taskId, remarks, approverId)
      await get().fetchApprovals()
      return true
    } catch (error) {
      console.error("Reject Error:", error)
      throw error
    }
  },
}))

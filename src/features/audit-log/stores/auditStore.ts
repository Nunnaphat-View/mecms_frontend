import { create } from "zustand"
import type { AuditLog } from "@/types/audit"
import { auditService } from "../services/auditService"

interface AuditState {
  logs: AuditLog[]
  total: number
  page: number
  limit: number
  totalPages: number
  loading: boolean
  searchQuery: string
  startDate: string
  endDate: string

  setSearchQuery: (query: string) => void
  setDateRange: (start: string, end: string) => void
  setPage: (page: number) => void
  setLimit: (limit: number) => void
  fetchLogs: () => Promise<void>
}

export const useAuditStore = create<AuditState>((set, get) => ({
  logs: [],
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
  loading: false,
  searchQuery: "",
  startDate: "",
  endDate: "",

  setSearchQuery: (query) => {
    set({ searchQuery: query, page: 1 })
    void get().fetchLogs()
  },

  setDateRange: (start, end) => {
    set({ startDate: start, endDate: end, page: 1 })
    void get().fetchLogs()
  },

  setPage: (page) => {
    set({ page })
    void get().fetchLogs()
  },

  setLimit: (limit) => {
    set({ limit, page: 1 })
    void get().fetchLogs()
  },

  fetchLogs: async () => {
    set({ loading: true })
    try {
      const state = get()
      const data = await auditService.getLogs({
        search: state.searchQuery,
        startDate: state.startDate,
        endDate: state.endDate,
        page: state.page,
        limit: state.limit,
      })
      set({
        logs: data.items,
        total: data.total,
        totalPages: data.totalPages,
        page: data.page,
        limit: data.limit,
      })
    } catch (e) {
      console.error("fetchLogs error:", e)
    } finally {
      set({ loading: false })
    }
  },
}))

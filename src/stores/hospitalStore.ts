import { create } from "zustand"
import type { Hospital } from "../types/tool"
import { hospitalService } from "../services/hospitalService"

interface HospitalState {
  hospitals: Hospital[]
  loading: boolean
  searchQuery: string

  setSearchQuery: (query: string) => void
  fetchHospitals: () => Promise<void>
  addHospital: (data: Omit<Hospital, "id">) => Promise<void>
  updateHospital: (id: number, data: Partial<Omit<Hospital, "id">>) => Promise<void>
  deleteHospital: (id: number) => Promise<void>
}

export const useHospitalStore = create<HospitalState>((set, get) => ({
  hospitals: [],
  loading: false,
  searchQuery: "",

  setSearchQuery: (query) => set({ searchQuery: query }),

  fetchHospitals: async () => {
    set({ loading: true })
    try {
      const data = await hospitalService.getAll()
      set({ hospitals: data })
    } catch (e) {
      console.error("fetchHospitals error:", e)
    } finally {
      set({ loading: false })
    }
  },

  addHospital: async (data) => {
    await hospitalService.create(data)
    await get().fetchHospitals()
  },

  updateHospital: async (id, data) => {
    await hospitalService.update(id, data)
    await get().fetchHospitals()
  },

  deleteHospital: async (id) => {
    await hospitalService.remove(id)
    await get().fetchHospitals()
  },
}))

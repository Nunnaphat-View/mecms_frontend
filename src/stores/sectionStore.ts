import { create } from "zustand"
import type { Section } from "../types/tool"
import { sectionService } from "../services/sectionService"

interface SectionState {
  sections: Section[]
  loading: boolean
  searchQuery: string

  setSearchQuery: (query: string) => void
  fetchSections: () => Promise<void>
  addSection: (data: Omit<Section, "id">) => Promise<void>
  updateSection: (id: number, data: Partial<Omit<Section, "id">>) => Promise<void>
  deleteSection: (id: number) => Promise<void>
}

export const useSectionStore = create<SectionState>((set, get) => ({
  sections: [],
  loading: false,
  searchQuery: "",

  setSearchQuery: (query) => set({ searchQuery: query }),

  fetchSections: async () => {
    set({ loading: true })
    try {
      const data = await sectionService.getAll()
      set({ sections: data })
    } catch (e) {
      console.error("fetchSections error:", e)
    } finally {
      set({ loading: false })
    }
  },

  addSection: async (data) => {
    await sectionService.create(data)
    await get().fetchSections()
  },

  updateSection: async (id, data) => {
    await sectionService.update(id, data)
    await get().fetchSections()
  },

  deleteSection: async (id) => {
    await sectionService.remove(id)
    await get().fetchSections()
  },
}))

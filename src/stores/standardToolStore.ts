import { create } from "zustand"
import type { BackendStandardTool, StandardToolCategory } from "../types/tool"
import { standardToolService, type CreateStandardToolPayload } from "../services/standardToolService"

interface StandardToolState {
  tools: BackendStandardTool[]
  categories: StandardToolCategory[]
  loading: boolean

  fetchTools: () => Promise<void>
  fetchCategories: () => Promise<void>
  addTool: (payload: CreateStandardToolPayload) => Promise<BackendStandardTool>
  updateTool: (id: number, payload: Partial<CreateStandardToolPayload>) => Promise<BackendStandardTool>
  deleteTool: (id: number) => Promise<void>
  uploadPdf: (id: number, file: File) => Promise<BackendStandardTool>
  uploadImage: (id: number, file: File) => Promise<BackendStandardTool>
}

export const useStandardToolStore = create<StandardToolState>((set, get) => ({
  tools: [],
  categories: [],
  loading: false,

  fetchTools: async () => {
    set({ loading: true })
    try {
      const data = await standardToolService.getAll()
      set({ tools: data })
    } catch (e) {
      console.error("fetchStandardTools error:", e)
    } finally {
      set({ loading: false })
    }
  },

  fetchCategories: async () => {
    try {
      const data = await standardToolService.getCategories()
      set({ categories: data })
    } catch (e) {
      console.error("fetchStandardCategories error:", e)
    }
  },

  addTool: async (payload) => {
    const tool = await standardToolService.create(payload)
    await get().fetchTools()
    return tool
  },

  updateTool: async (id, payload) => {
    const tool = await standardToolService.update(id, payload)
    await get().fetchTools()
    return tool
  },

  deleteTool: async (id) => {
    await standardToolService.remove(id)
    set((state) => ({ tools: state.tools.filter((t) => t.id !== id) }))
  },

  uploadPdf: async (id, file) => {
    const tool = await standardToolService.uploadPdf(id, file)
    // Update the tool in state
    set((state) => ({
      tools: state.tools.map((t) => (t.id === id ? tool : t)),
    }))
    return tool
  },

  uploadImage: async (id, file) => {
    const tool = await standardToolService.uploadImage(id, file)
    set((state) => ({
      tools: state.tools.map((t) => (t.id === id ? tool : t)),
    }))
    return tool
  },
}))

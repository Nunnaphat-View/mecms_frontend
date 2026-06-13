import { create } from "zustand"
import { checklistService } from "../services/checklistService"
import type { ChecklistCategoryApi } from "../services/pmService"

export interface ExtendedCategory extends ChecklistCategoryApi {
  newItemDescription: string
}

interface ChecklistState {
  categories: ExtendedCategory[]
  loading: boolean
  fetchCategories: () => Promise<void>
  updateNewItemDescription: (categoryId: number, value: string) => void
}

export const useChecklistStore = create<ChecklistState>((set, get) => ({
  categories: [],
  loading: false,

  fetchCategories: async () => {
    set({ loading: true })
    try {
      const data = await checklistService.getCategories()
      set({
        categories: data.map((cat) => ({
          ...cat,
          newItemDescription: "",
        })),
      })
    } catch (err) {
      console.error("fetchCategories error:", err)
    } finally {
      set({ loading: false })
    }
  },

  updateNewItemDescription: (categoryId, value) => {
    set({
      categories: get().categories.map((c) =>
        c.id === categoryId ? { ...c, newItemDescription: value } : c,
      ),
    })
  },
}))

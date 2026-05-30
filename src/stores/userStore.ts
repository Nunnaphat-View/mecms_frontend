import { create } from "zustand"
import type { User } from "../types/auth"
import { userService } from "../services/userService"

interface UserState {
  users: User[]
  loading: boolean
  searchQuery: string
  roleFilter: string

  setSearchQuery: (query: string) => void
  setRoleFilter: (role: string) => void
  fetchUsers: () => Promise<void>
  addUser: (data: FormData) => Promise<void>
  updateUser: (id: number, data: FormData) => Promise<void>
  deleteUser: (id: number) => Promise<void>
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  loading: false,
  searchQuery: "",
  roleFilter: "",

  setSearchQuery: (query) => set({ searchQuery: query }),
  setRoleFilter: (role) => set({ roleFilter: role }),

  fetchUsers: async () => {
    set({ loading: true })
    try {
      const data = await userService.getAll()
      set({ users: data })
    } catch (e) {
      console.error("fetchUsers error:", e)
    } finally {
      set({ loading: false })
    }
  },

  addUser: async (data) => {
    await userService.create(data)
    await get().fetchUsers()
  },

  updateUser: async (id, data) => {
    await userService.update(id, data)
    await get().fetchUsers()
  },

  deleteUser: async (id) => {
    await userService.remove(id)
    await get().fetchUsers()
  },
}))

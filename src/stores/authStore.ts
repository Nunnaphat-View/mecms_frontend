import { create } from "zustand"
import type { User } from "../types/auth"
import { authService } from "../services/authService"

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (username, password) => {
    set({ error: null })
    try {
      const response = await authService.login(username, password)
      set({
        token: response.access_token,
        user: response.user,
        isAuthenticated: true,
      })
      authService.setSession(response.access_token, response.user)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "การเข้าสู่ระบบล้มเหลว กรุณาลองใหม่อีกครั้ง"
      set({ error: msg })
      throw err
    }
  },

  logout: () => {
    set({ token: null, user: null, isAuthenticated: false, error: null })
    authService.clearSession()
  },

  initialize: async () => {
    const token = authService.getToken()
    const user = authService.getUser()
    
    if (token && user) {
      set({ token, user, isAuthenticated: true, isLoading: false })
      try {
        const freshUser = await authService.fetchProfile(token)
        set({ user: freshUser })
        authService.setSession(token, freshUser)
      } catch (err: unknown) {
        console.warn("Session validation failed, logging out:", err)
        authService.clearSession()
        set({ token: null, user: null, isAuthenticated: false })
      }
    } else {
      set({ isLoading: false })
    }
  },
}))

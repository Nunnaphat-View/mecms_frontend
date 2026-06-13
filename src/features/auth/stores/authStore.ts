import { create } from "zustand"
import type { User } from "../types/auth"
import { authService } from "../services/authService"
import { AppRole, type RolePermissions, RolePermissionsMap, mapRoleToAppRole } from "@/constants/roles"

interface AuthState {
  user: User | null
  token: string | null
  appRole: AppRole | null
  permissions: RolePermissions | null
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
  appRole: null,
  permissions: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (username, password) => {
    set({ error: null })
    try {
      const response = await authService.login(username, password)
      const appRole = mapRoleToAppRole(response.user.role)
      const permissions = RolePermissionsMap[appRole]
      set({
        token: response.access_token,
        user: response.user,
        appRole,
        permissions,
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
    set({ token: null, user: null, appRole: null, permissions: null, isAuthenticated: false, error: null })
    authService.clearSession()
  },

  initialize: async () => {
    const token = authService.getToken()
    const user = authService.getUser()
    
    if (token && user) {
      const initialAppRole = mapRoleToAppRole(user.role)
      const initialPermissions = RolePermissionsMap[initialAppRole]
      set({ 
        token, 
        user, 
        appRole: initialAppRole, 
        permissions: initialPermissions, 
        isAuthenticated: true, 
        isLoading: false 
      })
      try {
        const freshUser = await authService.fetchProfile(token)
        const appRole = mapRoleToAppRole(freshUser.role)
        const permissions = RolePermissionsMap[appRole]
        set({ user: freshUser, appRole, permissions })
        authService.setSession(token, freshUser)
      } catch (err: unknown) {
        console.warn("Session validation failed, logging out:", err)
        authService.clearSession()
        set({ token: null, user: null, appRole: null, permissions: null, isAuthenticated: false })
      }
    } else {
      set({ isLoading: false })
    }
  },
}))


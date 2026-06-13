import type { LoginResponse, User } from "../types/auth"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"

export const authService = {
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      throw new Error(errData.message || "การเข้าสู่ระบบล้มเหลว กรุณาตรวจสอบชื่อผู้ใช้และรหัสผ่าน")
    }

    return response.json()
  },

  async fetchProfile(token: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      throw new Error(errData.message || "ไม่สามารถดึงข้อมูลผู้ใช้ได้")
    }

    return response.json()
  },

  getToken(): string | null {
    return localStorage.getItem("access_token")
  },

  getUser(): User | null {
    const userStr = localStorage.getItem("user")
    if (!userStr) return null
    try {
      return JSON.parse(userStr)
    } catch {
      localStorage.removeItem("user")
      return null
    }
  },

  setSession(token: string, user: User): void {
    localStorage.setItem("access_token", token)
    localStorage.setItem("user", JSON.stringify(user))
  },

  clearSession(): void {
    localStorage.removeItem("access_token")
    localStorage.removeItem("user")
  },
}

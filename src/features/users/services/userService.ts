import type { User } from "../types/auth"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"

async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("access_token")
  const headers = new Headers(options.headers)

  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json")
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}))
    throw new Error(errData.message || `Request failed with status ${response.status}`)
  }

  if (response.status === 204) {
    return {} as T
  }

  return response.json()
}

export const userService = {
  getFileUrl(path: string | null | undefined): string {
    if (!path) return ""
    if (path.startsWith("http://") || path.startsWith("https://")) return path
    return `${API_BASE_URL}${path}`
  },

  async getAll(): Promise<User[]> {
    return apiFetch<User[]>("/users")
  },

  async create(data: FormData): Promise<User> {
    return apiFetch<User>("/users", {
      method: "POST",
      body: data,
    })
  },

  async update(id: number, data: FormData): Promise<User> {
    return apiFetch<User>(`/users/${id}`, {
      method: "PATCH",
      body: data,
    })
  },

  async remove(id: number): Promise<void> {
    return apiFetch<void>(`/users/${id}`, {
      method: "DELETE",
      body: undefined, // ensure compatibility
    })
  },

  async getSpecialties(userId: number): Promise<{ id: number; userId: number; toolName: string }[]> {
    return apiFetch<{ id: number; userId: number; toolName: string }[]>(`/users/${userId}/specialties`)
  },

  async updateSpecialties(userId: number, toolNames: string[]): Promise<unknown> {
    return apiFetch<unknown>(`/users/${userId}/specialties`, {
      method: "PUT",
      body: JSON.stringify({ toolNames }),
    })
  },
}


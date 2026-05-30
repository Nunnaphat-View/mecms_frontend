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
    })
  },
}

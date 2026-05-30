import type { Hospital } from "../types/tool"

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
    throw new Error((errData as { message?: string }).message || `Request failed with status ${response.status}`)
  }

  if (response.status === 204) {
    return {} as T
  }

  return response.json() as Promise<T>
}

export const hospitalService = {
  async getAll(): Promise<Hospital[]> {
    return apiFetch<Hospital[]>("/hospital")
  },

  async getById(id: number): Promise<Hospital> {
    return apiFetch<Hospital>(`/hospital/${id}`)
  },

  async create(data: Omit<Hospital, "id">): Promise<Hospital> {
    return apiFetch<Hospital>("/hospital", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  async update(id: number, data: Partial<Omit<Hospital, "id">>): Promise<Hospital> {
    return apiFetch<Hospital>(`/hospital/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  },

  async remove(id: number): Promise<void> {
    return apiFetch<void>(`/hospital/${id}`, {
      method: "DELETE",
    })
  },
}

import type { Hospital } from "../types/tool"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"

async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("access_token")
  const headers = new Headers(options.headers)

  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }
  // Don't set Content-Type for FormData — browser sets it with boundary automatically
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

function buildFormData(data: Partial<Omit<Hospital, "id">>, logoFile?: File | null): FormData {
  const fd = new FormData()
  if (data.name !== undefined) fd.append("name", data.name)
  if (data.code !== undefined) fd.append("code", data.code)
  if (data.address !== undefined) fd.append("address", data.address)
  if (data.district !== undefined) fd.append("district", data.district)
  if (data.province !== undefined) fd.append("province", data.province)
  if (data.zipCode !== undefined) fd.append("zipCode", data.zipCode)
  if (data.description !== undefined) fd.append("description", data.description)
  if (logoFile) fd.append("logo", logoFile)
  return fd
}

export const hospitalService = {
  async getAll(): Promise<Hospital[]> {
    return apiFetch<Hospital[]>("/hospital")
  },

  async getById(id: number): Promise<Hospital> {
    return apiFetch<Hospital>(`/hospital/${id}`)
  },

  async create(data: Omit<Hospital, "id">, logoFile?: File | null): Promise<Hospital> {
    const fd = buildFormData(data, logoFile)
    return apiFetch<Hospital>("/hospital", {
      method: "POST",
      body: fd,
    })
  },

  async update(id: number, data: Partial<Omit<Hospital, "id">>, logoFile?: File | null): Promise<Hospital> {
    const fd = buildFormData(data, logoFile)
    return apiFetch<Hospital>(`/hospital/${id}`, {
      method: "PATCH",
      body: fd,
    })
  },

  async remove(id: number): Promise<void> {
    return apiFetch<void>(`/hospital/${id}`, {
      method: "DELETE",
    })
  },
}

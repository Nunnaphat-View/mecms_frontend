import type { BackendEquipment, Hospital, Section, EquipmentType } from "@/types/tool"

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

export const toolService = {
  async getHospitals(): Promise<Hospital[]> {
    return apiFetch<Hospital[]>("/hospital")
  },

  async getSections(): Promise<Section[]> {
    return apiFetch<Section[]>("/section")
  },

  async getEquipmentTypes(): Promise<EquipmentType[]> {
    return apiFetch<EquipmentType[]>("/equipment-types")
  },

  async getUniqueToolNames(): Promise<string[]> {
    return apiFetch<string[]>("/equipment/tool-names")
  },

  async getAll(): Promise<BackendEquipment[]> {
    return apiFetch<BackendEquipment[]>("/equipment")
  },

  async create(data: Partial<BackendEquipment>): Promise<BackendEquipment> {
    return apiFetch<BackendEquipment>("/equipment", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  async update(id: number, data: Partial<BackendEquipment>): Promise<BackendEquipment> {
    return apiFetch<BackendEquipment>(`/equipment/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  },

  async remove(id: number): Promise<void> {
    return apiFetch<void>(`/equipment/${id}`, {
      method: "DELETE",
    })
  },
}

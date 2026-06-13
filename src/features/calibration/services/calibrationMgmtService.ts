import type { CalibrationProcess, CalibrationCost, CalibrationSetting } from "@/types/tool"

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

export const calibrationProcessService = {
  getAll(): Promise<CalibrationProcess[]> {
    return apiFetch<CalibrationProcess[]>("/calibration-processes")
  },
  getById(id: number): Promise<CalibrationProcess> {
    return apiFetch<CalibrationProcess>(`/calibration-processes/${id}`)
  },
  create(data: Partial<CalibrationProcess>): Promise<CalibrationProcess> {
    return apiFetch<CalibrationProcess>("/calibration-processes", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },
  update(id: number, data: Partial<CalibrationProcess>): Promise<CalibrationProcess> {
    return apiFetch<CalibrationProcess>(`/calibration-processes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  },
  remove(id: number): Promise<void> {
    return apiFetch<void>(`/calibration-processes/${id}`, {
      method: "DELETE",
    })
  },
}

export const calibrationCostService = {
  getAll(): Promise<CalibrationCost[]> {
    return apiFetch<CalibrationCost[]>("/calibration-costs")
  },
  getById(id: number): Promise<CalibrationCost> {
    return apiFetch<CalibrationCost>(`/calibration-costs/${id}`)
  },
  create(data: Partial<CalibrationCost>): Promise<CalibrationCost> {
    return apiFetch<CalibrationCost>("/calibration-costs", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },
  update(id: number, data: Partial<CalibrationCost>): Promise<CalibrationCost> {
    return apiFetch<CalibrationCost>(`/calibration-costs/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  },
  remove(id: number): Promise<void> {
    return apiFetch<void>(`/calibration-costs/${id}`, {
      method: "DELETE",
    })
  },
}

export const calibrationSettingService = {
  getByEquipment(equipmentName: string): Promise<CalibrationSetting[]> {
    return apiFetch<CalibrationSetting[]>(`/calibration-setting/${encodeURIComponent(equipmentName)}`)
  },
  saveBatch(equipmentName: string, data: CalibrationSetting[]): Promise<CalibrationSetting[]> {
    return apiFetch<CalibrationSetting[]>(
      `/calibration-setting/batch/${encodeURIComponent(equipmentName)}`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    )
  },
}

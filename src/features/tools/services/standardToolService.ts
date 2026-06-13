import type { BackendStandardTool } from "../types/tool"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"

export function getFileUrl(path: string | null | undefined): string {
  if (!path) return ""
  if (path.startsWith("http://") || path.startsWith("https://")) return path
  return `${API_BASE_URL}${path}`
}


async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("access_token")
  const headers = new Headers(options.headers)

  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json")
  }

  const response = await fetch(`${API_BASE_URL}${url}`, { ...options, headers })

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}))
    throw new Error((errData as { message?: string }).message ?? `Request failed: ${response.status}`)
  }
  if (response.status === 204) return {} as T
  return response.json() as Promise<T>
}

export type CreateStandardToolPayload = {
  tool_name: string
  asset_code?: string | null
  serial_number?: string | null
  manufacturer?: string | null
  model?: string | null
  unit?: string | null
  calibration_date_last?: string | null
  certificate_number?: string | null
}

export const standardToolService = {
  getAll(): Promise<BackendStandardTool[]> {
    return apiFetch<BackendStandardTool[]>("/standard-tool")
  },

  create(payload: CreateStandardToolPayload): Promise<BackendStandardTool> {
    return apiFetch<BackendStandardTool>("/standard-tool", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },

  update(id: number, payload: Partial<CreateStandardToolPayload>): Promise<BackendStandardTool> {
    return apiFetch<BackendStandardTool>(`/standard-tool/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    })
  },

  remove(id: number): Promise<void> {
    return apiFetch<void>(`/standard-tool/${id}`, { method: "DELETE" })
  },

  async uploadPdf(id: number, file: File): Promise<BackendStandardTool> {
    const fd = new FormData()
    fd.append("file", file)
    return apiFetch<BackendStandardTool>(`/standard-tool/${id}/upload-pdf`, {
      method: "POST",
      body: fd,
    })
  },

  async uploadImage(id: number, file: File): Promise<BackendStandardTool> {
    const fd = new FormData()
    fd.append("file", file)
    return apiFetch<BackendStandardTool>(`/standard-tool/${id}/upload-image`, {
      method: "POST",
      body: fd,
    })
  },
}

import type { PaginatedAuditLogs } from "@/types/audit"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"

async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("access_token")
  const headers = new Headers(options.headers)

  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }
  if (!headers.has("Content-Type")) {
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

  return response.json() as Promise<T>
}

export const auditService = {
  async getLogs(params: {
    search?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedAuditLogs> {
    const query = new URLSearchParams()
    if (params.search) query.append("search", params.search)
    if (params.startDate) query.append("startDate", params.startDate)
    if (params.endDate) query.append("endDate", params.endDate)
    if (params.page) query.append("page", String(params.page))
    if (params.limit) query.append("limit", String(params.limit))

    return apiFetch<PaginatedAuditLogs>(`/audit-logs?${query.toString()}`)
  },
}

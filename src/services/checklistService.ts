import type { ChecklistCategoryApi, ChecklistItemApi } from "./pmService"

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
    throw new Error(
      (errData as { message?: string }).message ||
        `Request failed with status ${response.status}`,
    )
  }

  if (response.status === 204) return {} as T
  return response.json() as Promise<T>
}

export const checklistService = {
  getCategories: () =>
    apiFetch<ChecklistCategoryApi[]>("/checklist-categories"),

  createCategory: (data: { name: string; display_order?: number }) =>
    apiFetch<ChecklistCategoryApi>("/checklist-categories", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateCategory: (id: number, data: { name?: string; display_order?: number }) =>
    apiFetch<ChecklistCategoryApi>(`/checklist-categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteCategory: (id: number) =>
    apiFetch<{ success: boolean }>(`/checklist-categories/${id}`, {
      method: "DELETE",
    }),

  createItem: (data: { category_id: number; description: string; display_order?: number }) =>
    apiFetch<ChecklistItemApi>("/checklist-items", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateItem: (
    id: number,
    data: { category_id?: number; description?: string; display_order?: number },
  ) =>
    apiFetch<ChecklistItemApi>(`/checklist-items/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteItem: (id: number) =>
    apiFetch<{ success: boolean }>(`/checklist-items/${id}`, {
      method: "DELETE",
    }),
}

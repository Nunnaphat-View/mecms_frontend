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

// ── Response types from backend ──────────────────────────────────────────────

export interface ChecklistItemApi {
  id: number
  category_id: number
  description: string
  display_order: number
}

export interface ChecklistCategoryApi {
  id: number
  name: string
  display_order: number
  items: ChecklistItemApi[]
}

export interface EquipmentApi {
  id: number
  name: string
  asset_code: string
  serial_number: string
  manufacturer: string
  model: string
  status: string
  risk_level?: string
  equipment_type_id?: number
  equipmentType?: {
    id: number
    name: string
  }
  interval: number
  calibration_due_date: string
  calibration_date_last: string
  department?: string
  location?: string
  sectionId?: number
  section?: {
    id: number
    name: string
    description?: string
    code?: string
    hospital?: {
      id: number
      name: string
      address?: string
      district?: string
      province?: string
      logoUrl?: string
      zipCode?: string
    }
  }
}

export interface TechnicianApi {
  id: number
  name: string
  signatureUrl?: string | null
  role?: {
    id: number
    name: string
    description: string
  }
}

export interface PmChecklistResultApi {
  id: number
  task_id: number
  item_id: number
  status: "Pass" | "Fail" | "NA"
  item?: {
    id: number
    description: string
    category_id: number
    display_order: number
  }
}

export interface PmCategoryRemarkApi {
  id: number
  task_id: number
  category_id: number
  text: string
  category?: {
    id: number
    name: string
  }
}

export interface TaskApi {
  id: number
  pm_no: string
  equipment_id: number
  status: string
  overall_result: string
  task_user: number
  createdAt: string
  approvedAt?: string
  technician: TechnicianApi
  approver?: TechnicianApi
  equipment?: EquipmentApi
  checklistResults?: PmChecklistResultApi[]
  checklistRemarks?: PmCategoryRemarkApi[]
  remarks?: string
}

export interface SavePmPayload {
  task_id: number
  overall_result: "Pass" | "Fail" | "NA"
  status: "Pending" | "InProgress" | "Done"
  results: { item_id: number; status: "Pass" | "Fail" | "NA" }[]
  remarks: { category_id: number; text?: string }[]
}

// ── API calls ─────────────────────────────────────────────────────────────────

export const pmService = {
  getPmForm: (equipmentId: number) =>
    apiFetch<ChecklistCategoryApi[]>(`/pm-form/${equipmentId}`),

  getEquipment: (equipmentId: number) =>
    apiFetch<EquipmentApi>(`/equipment/${equipmentId}`),

  getTask: (taskId: number) =>
    apiFetch<TaskApi>(`/pm-task/${taskId}`),

  savePmForm: (payload: SavePmPayload) =>
    apiFetch<{ success: boolean; task_id: number }>("/pm-save", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
}

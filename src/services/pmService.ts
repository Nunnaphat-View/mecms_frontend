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
  tool_name: string
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
  cal_no: string
  equipment_id: number
  status: string
  overall_result: string
  technician_id: number
  createdAt: string
  approvedAt?: string
  path_pdf_cer?: string | null
  certificate_data?: {
    hospital?: {
      name?: string
      logoUrl?: string
      address?: string
      district?: string
      province?: string
      zipCode?: string
    }
    department?: {
      name?: string
    }
    technician?: {
      name?: string
      signatureUrl?: string
    }
    approver?: {
      name?: string
      signatureUrl?: string
    }
  }
  technician: TechnicianApi
  approver?: TechnicianApi
  equipment?: EquipmentApi
  checklistResults?: PmChecklistResultApi[]
  checklistRemarks?: PmCategoryRemarkApi[]
  remarks?: string
  environments?: { id: number; ambient_temp?: number; ambient_humidity?: number }[]
  standardTools?: {
    id: number
    tool_name: string
    model?: string
    manufacturer?: string
    serial_number?: string
    unit?: string
    calibration_date_last?: string
    certificate_number?: string
  }[]
  measurements?: { id: number; parameter_name: string; range?: string; standard_value?: number; reading_1?: number; reading_2?: number; reading_3?: number; std_reading_1?: number; std_reading_2?: number; std_reading_3?: number; average_value?: number; average_standard?: number; error_value?: number; result: string; display_type?: string; resolution?: string; std_type?: string; data?: Record<string, unknown> }[]
  qualitatives?: { id: number; parameter_name: string; item_name: string; result: string }[]
  specificParameters?: { id: string; name: string; value?: string; unit?: string }[]
}

export interface SavePmPayload {
  task_id: number
  overall_result: "Pass" | "Fail" | "NA"
  status: "Pending" | "InProgress" | "Done"
  results: { item_id: number; status: "Pass" | "Fail" | "NA" }[]
  remarks: { category_id: number; text?: string }[]
}

export interface SubmitTaskPayload {
  ambient_temp?: number
  ambient_humidity?: number
  standard_tool_ids?: number[]
  measurements?: unknown[]
  qualitatives?: unknown[]
  specific_parameters?: unknown[]
  overall_result: "Pass" | "Fail" | "NA"
  status?: "InProgress" | "PendingApproval"
}

// ── API calls ─────────────────────────────────────────────────────────────────

export const pmService = {
  getPmForm: (equipmentId: number) =>
    apiFetch<ChecklistCategoryApi[]>(`/pm-form/${equipmentId}`),

  getEquipment: (equipmentId: number) =>
    apiFetch<EquipmentApi>(`/equipment/${equipmentId}`),

  getTask: (taskId: number) =>
    apiFetch<TaskApi>(`/pm-task/${taskId}`),

  getTasks: () =>
    apiFetch<TaskApi[]>("/pm-task"),

  savePmForm: (payload: SavePmPayload) =>
    apiFetch<{ success: boolean; task_id: number }>("/pm-save", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  submitCalibrationTask: (taskId: number, payload: SubmitTaskPayload) =>
    apiFetch<TaskApi>(`/pm-task/${taskId}/submit`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  approveTask: (taskId: number, approverId: number) =>
    apiFetch<void>(`/pm-task/${taskId}/approve`, {
      method: "PATCH",
      body: JSON.stringify({
        approver_id: approverId,
        decision: "Approve",
        remarks: "Approved via frontend",
      }),
    }),

  rejectTask: (taskId: number, remarks: string, approverId: number) =>
    apiFetch<void>(`/pm-task/${taskId}/approve`, {
      method: "PATCH",
      body: JSON.stringify({
        approver_id: approverId,
        decision: "Reject",
        remarks,
      }),
    }),

  uploadCerPdf: (taskId: number, blob: Blob) => {
    const formData = new FormData()
    formData.append("file", blob, `cer-${taskId}.pdf`)
    return apiFetch<void>(`/pm-task/${taskId}/upload-cer`, {
      method: "POST",
      body: formData,
    })
  },

  autoAssign: (month: number, year: number) =>
    apiFetch<TaskApi[]>("/pm-task/auto-assign", {
      method: "POST",
      body: JSON.stringify({ month, year }),
    }),

  publishAssignments: (month: number, year: number) =>
    apiFetch<TaskApi[]>("/pm-task/publish", {
      method: "POST",
      body: JSON.stringify({ month, year }),
    }),

  assignTechnician: (taskId: number, technicianId: number) =>
    apiFetch<TaskApi>(`/pm-task/${taskId}/assign`, {
      method: "PATCH",
      body: JSON.stringify({ technician_id: technicianId }),
    }),

  seed: () =>
    apiFetch<{ message: string }>("/pm-task/seed", {
      method: "POST",
    }),

  reschedule: (taskIds: number[], newDate: string) =>
    apiFetch<TaskApi[]>("/pm-task/reschedule", {
      method: "PATCH",
      body: JSON.stringify({ taskIds, newDate }),
    }),
}

import { create } from "zustand"
import type { MedicalTool, ToolStatus, BackendEquipment, Hospital, Section, EquipmentType } from "../types/tool"
import { toolService } from "../services/toolService"

interface ToolState {
  tools: MedicalTool[]
  loading: boolean
  equipmentTypes: EquipmentType[]
  hospitals: Hospital[]
  sections: Section[]
  searchQuery: string
  selectedType: string

  setSearchQuery: (query: string) => void
  setSelectedType: (type: string) => void

  fetchReferenceData: () => Promise<void>
  fetchTools: () => Promise<void>
  addTool: (tool: Omit<MedicalTool, "id"> & { asset_code?: string }) => Promise<void>
  updateTool: (id: string, data: Partial<MedicalTool> & { asset_code?: string }) => Promise<void>
  deleteTool: (id: string) => Promise<void>
  
  // Helpers
  getNextId: () => string
}

function mapStatus(s: string): ToolStatus {
  const map: Record<string, ToolStatus> = {
    active: "กำลังใช้งาน",
    inactive: "ปิดใช้งาน",
    maintenance: "กำลังสอบเทียบ",
    ready: "พร้อมใช้งาน",
    calibrating: "กำลังสอบเทียบ",
    repair: "ส่งซ่อม",
    disabled: "ปิดใช้งาน",
  }
  return map[s] ?? "พร้อมใช้งาน"
}

function unmapStatus(s: ToolStatus): string {
  const map: Record<ToolStatus, string> = {
    กำลังใช้งาน: "active",
    ปิดใช้งาน: "inactive",
    กำลังสอบเทียบ: "maintenance",
    พร้อมใช้งาน: "active",
    รอดำเนินการ: "inactive",
    ส่งซ่อม: "maintenance",
    จำหน่ายแล้ว: "inactive",
    ready: "ready",
    calibrating: "calibrating",
    repair: "repair",
    disabled: "disabled",
  }
  return map[s] ?? "active"
}

function normalizeDate(d: string | undefined | null): string | null {
  if (!d || d === "-") return null
  return d
}

export const useToolStore = create<ToolState>((set, get) => ({
  tools: [],
  loading: false,
  equipmentTypes: [],
  hospitals: [],
  sections: [],
  searchQuery: "",
  selectedType: "",

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedType: (type) => set({ selectedType: type }),

  fetchReferenceData: async () => {
    try {
      const [types, hosp, sect] = await Promise.all([
        toolService.getEquipmentTypes(),
        toolService.getHospitals(),
        toolService.getSections(),
      ])
      set({ equipmentTypes: types, hospitals: hosp, sections: sect })
    } catch (e) {
      console.error("fetchReferenceData error:", e)
    }
  },

  fetchTools: async () => {
    set({ loading: true })
    try {
      // Ensure reference data is loaded
      if (get().equipmentTypes.length === 0) {
        await get().fetchReferenceData()
      }

      const backendItems = await toolService.getAll()
      const mappedTools: MedicalTool[] = backendItems.map((item: BackendEquipment) => ({
        id: item.asset_code || String(item.id),
        backendId: item.id,
        tool_name: item.tool_name,
        company: item.manufacturer ?? "-",
        model: item.model ?? "-",
        type: item.equipmentType?.name || "-",
        riskLevel: item.risk_level || "-",
        equipment_type_id: item.equipment_type_id || null,
        serialNumber: item.serial_number ?? "-",
        calibrationCycle: item.interval ? `${item.interval} วัน` : "-",
        dueDate: item.calibration_due_date ?? "-",
        lastCalibrationDate: item.calibration_date_last ?? "-",
        location: item.section?.hospital?.name || item.location || "-",
        department: item.section?.name || item.department || "-",
        hospitalId: item.section?.hospital?.id || null,
        sectionId: item.sectionId || null,
        status: mapStatus(item.status),
      }))

      set({ tools: mappedTools })
    } catch (e) {
      console.error("fetchTools error:", e)
    } finally {
      set({ loading: false })
    }
  },

  addTool: async (tool) => {
    await toolService.create({
      tool_name: tool.tool_name,
      manufacturer: tool.company,
      model: tool.model,
      serial_number: tool.serialNumber,
      interval: parseInt(tool.calibrationCycle, 10) || 365,
      calibration_due_date: normalizeDate(tool.dueDate),
      calibration_date_last: normalizeDate(tool.lastCalibrationDate),
      status: unmapStatus(tool.status),
      risk_level: (tool.riskLevel || "medium") as "high" | "medium" | "low",
      equipment_type_id: tool.equipment_type_id ?? null,
      sectionId: tool.sectionId ?? null,
      asset_code: tool.asset_code ?? null,
    })
    await get().fetchTools()
  },

  updateTool: async (id, data) => {
    const target = get().tools.find((t) => t.id === id)
    const backendId = target?.backendId ?? Number(id)
    
    await toolService.update(backendId, {
      ...(data.tool_name !== undefined && { tool_name: data.tool_name }),
      ...(data.company !== undefined && { manufacturer: data.company }),
      ...(data.model !== undefined && { model: data.model }),
      ...(data.serialNumber !== undefined && { serial_number: data.serialNumber }),
      ...(data.riskLevel !== undefined && { risk_level: data.riskLevel as "high" | "medium" | "low" }),
      ...(data.equipment_type_id !== undefined && {
        equipment_type_id: data.equipment_type_id ?? null,
      }),
      ...(data.calibrationCycle !== undefined && {
        interval: parseInt(data.calibrationCycle, 10) || 365,
      }),
      ...(data.dueDate !== undefined && { calibration_due_date: normalizeDate(data.dueDate) }),
      ...(data.lastCalibrationDate !== undefined && {
        calibration_date_last: normalizeDate(data.lastCalibrationDate),
      }),
      ...(data.status !== undefined && { status: unmapStatus(data.status) }),
      ...(data.sectionId !== undefined && { sectionId: data.sectionId ?? null }),
      ...(data.asset_code !== undefined && { asset_code: data.asset_code ?? null }),
    })
    await get().fetchTools()
  },

  deleteTool: async (id) => {
    const target = get().tools.find((t) => t.id === id)
    const backendId = target?.backendId ?? Number(id)
    await toolService.remove(backendId)
    await get().fetchTools()
  },

  getNextId: () => {
    const maxNum = get().tools.reduce((max, t) => {
      const num = parseInt(t.id.replace("BME-", ""), 10)
      return Number.isNaN(num) ? max : Math.max(max, num)
    }, 0)
    return `BME-${String(maxNum + 1).padStart(3, "0")}`
  },
}))

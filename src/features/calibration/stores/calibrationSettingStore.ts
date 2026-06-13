import { create } from "zustand"
import { calibrationSettingService } from "@/features/calibration/services/calibrationMgmtService"
import type { CalibrationSetting } from "@/types/tool"

export function normalizeEquipmentName(name: string | null | undefined): string {
  if (!name) return ""
  return name.trim().toLowerCase()
}

export function isInfusionPump(name: string | null | undefined): boolean {
  const normalized = normalizeEquipmentName(name)
  return (
    normalized.includes("infusion") ||
    normalized.includes("syringe") ||
    normalized.includes("pump") ||
    normalized.includes("เครื่องให้สารน้ำ") ||
    normalized.includes("เครื่องควบคุมการให้สาร") ||
    normalized.includes("สารละลาย") ||
    normalized.includes("เครื่องควบคุมการให้ยา") ||
    normalized.includes("เครื่องให้ยา") ||
    normalized.includes("เครื่องฉีดยา") ||
    normalized.includes("เครื่องฉีดให้ยา") ||
    normalized.includes("pca") ||
    normalized.includes("tci")
  )
}

function getDefaultSettings(toolName: string): CalibrationSetting[] {
  if (!isInfusionPump(toolName)) return []

  return [
    {
      tool_name: toolName,
      type: "qualitative",
      parameter_name: "Occlusion",
      test_values: [{ label: "Occlusion Alarm", value: 0 }],
    },
    {
      tool_name: toolName,
      type: "quantitative",
      parameter_name: "Flow Rate",
      unit: "mL/hr",
      tolerance: "2.2",
      display_type: "Digital",
      resolution: "0.1",
      test_values: [
        { label: "10 mL/hr", value: 10 },
        { label: "50 mL/hr", value: 50 },
        { label: "100 mL/hr", value: 100 },
      ],
    },
    {
      tool_name: toolName,
      type: "quantitative",
      parameter_name: "Volume",
      unit: "mL",
      tolerance: "2.2",
      display_type: "Digital",
      resolution: "0.1",
      test_values: [
        { label: "50 mL", value: 50 },
        { label: "100 mL", value: 100 },
        { label: "200 mL", value: 200 },
      ],
    },
  ]
}

interface CalibrationSettingState {
  settings: CalibrationSetting[]
  loading: boolean
  clearSettings: () => void
  fetchSettings: (toolName: string) => Promise<CalibrationSetting[]>
  saveSettings: (toolName: string, payload: CalibrationSetting[]) => Promise<CalibrationSetting[]>
}

export const useCalibrationSettingStore = create<CalibrationSettingState>((set) => ({
  settings: [],
  loading: false,

  clearSettings: () => set({ settings: [] }),

  fetchSettings: async (toolName: string) => {
    set({ loading: true, settings: [] })
    try {
      const data = await calibrationSettingService.getByEquipment(toolName)
      const fetchedSettings = data.length > 0 ? data : getDefaultSettings(toolName)
      set({ settings: fetchedSettings })
      return fetchedSettings
    } catch (error) {
      console.error("Failed to fetch settings:", error)
      const fallbackSettings = getDefaultSettings(toolName)
      set({ settings: fallbackSettings })
      return fallbackSettings
    } finally {
      set({ loading: false })
    }
  },

  saveSettings: async (toolName: string, payload: CalibrationSetting[]) => {
    set({ loading: true })
    try {
      const data = await calibrationSettingService.saveBatch(toolName, payload)
      set({ settings: data })
      return data
    } catch (error) {
      console.error("Failed to save settings:", error)
      throw error
    } finally {
      set({ loading: false })
    }
  },
}))

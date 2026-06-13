import { create } from "zustand"
import { toolService } from "../services/toolService"

export interface Ward {
  id: string
  name: string
  description: string
  toolCount: number
}

export interface WardTimelineEvent {
  id: number
  date: number // Just the day number of the due date
  tool_name: string
  toolCode: string
}

export interface WardTool {
  id: string // e.g. ER-BME-001 or asset_code
  tool_name: string
  dueDate: string // e.g. 2026-06-26
  statusLabel: string // e.g. 'วันนี้', 'อีก 2 วัน'
  isDanger: boolean // For red status text
}

interface WardsState {
  selectedWardId: string
  wards: Ward[]
  allTools: Record<string, WardTool[]>
  loading: boolean
  
  selectWard: (id: string) => void
  fetchWardsData: () => Promise<void>
  getWards: () => Ward[]
  getSelectedWard: () => Ward | null
  getTools: () => WardTool[]
  getTimelineEvents: () => WardTimelineEvent[]
}

function calculateStatus(dueDateStr: string | null | undefined): { statusLabel: string; isDanger: boolean; cleanDate: string } {
  if (!dueDateStr) {
    return { statusLabel: "ไม่มีกำหนด", isDanger: false, cleanDate: "-" }
  }

  // Parse YYYY-MM-DD safely to avoid local timezone offset shifts
  const dateOnly = dueDateStr.split("T")[0]
  const parts = dateOnly.split("-")
  const year = parseInt(parts[0] ?? "", 10)
  const month = parseInt(parts[1] ?? "", 10) - 1
  const day = parseInt(parts[2] ?? "", 10)

  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return { statusLabel: "ไม่มีกำหนด", isDanger: false, cleanDate: "-" }
  }

  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const dueDate = new Date(year, month, day)
  dueDate.setHours(0, 0, 0, 0)

  const diffTime = dueDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return { statusLabel: "วันนี้", isDanger: true, cleanDate: dateOnly }
  } else if (diffDays > 0) {
    return { statusLabel: `อีก ${diffDays} วัน`, isDanger: false, cleanDate: dateOnly }
  } else {
    return { statusLabel: `เลยมา ${Math.abs(diffDays)} วัน`, isDanger: true, cleanDate: dateOnly }
  }
}

export const useWardsStore = create<WardsState>((set, get) => ({
  selectedWardId: "",
  wards: [],
  allTools: {},
  loading: false,

  selectWard: (id: string) => set({ selectedWardId: id }),

  fetchWardsData: async () => {
    set({ loading: true })
    try {
      // Fetch both sections (departments) and all equipment parallelly
      const [sections, equipments] = await Promise.all([
        toolService.getSections(),
        toolService.getAll(),
      ])

      // Map sections to Wards and calculate counts
      const wardsList: Ward[] = sections.map((sec) => {
        const secEqs = equipments.filter((eq) => eq.sectionId === sec.id)
        return {
          id: sec.id.toString(),
          name: sec.name,
          description: sec.description || sec.hospital?.name || "Department",
          toolCount: secEqs.length,
        }
      })

      // Map equipments to tools grouped by section ID
      const toolsMap: Record<string, WardTool[]> = {}
      sections.forEach((sec) => {
        const secEqs = equipments.filter((eq) => eq.sectionId === sec.id)
        toolsMap[sec.id.toString()] = secEqs.map((eq) => {
          const { statusLabel, isDanger, cleanDate } = calculateStatus(eq.calibration_due_date)
          return {
            id: eq.asset_code || `BME-${eq.id}`,
            tool_name: eq.tool_name,
            dueDate: cleanDate,
            statusLabel,
            isDanger,
          }
        })
      })

      // Set default selected ward if none or invalid
      const currentSelected = get().selectedWardId
      const isValidSelected = wardsList.some((w) => w.id === currentSelected)
      const nextSelected = isValidSelected ? currentSelected : (wardsList[0]?.id || "")

      set({
        wards: wardsList,
        allTools: toolsMap,
        selectedWardId: nextSelected,
      })
    } catch (error) {
      console.error("fetchWardsData error:", error)
    } finally {
      set({ loading: false })
    }
  },

  getWards: () => get().wards,

  getSelectedWard: () => {
    const { wards, selectedWardId } = get()
    return wards.find((w) => w.id === selectedWardId) || wards[0] || null
  },

  getTools: () => {
    const { allTools, selectedWardId } = get()
    const unsortedTools = allTools[selectedWardId] || []
    
    // Sort tools by due date day or split parts
    return [...unsortedTools].sort((a, b) => {
      if (a.dueDate === "-") return 1
      if (b.dueDate === "-") return -1
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    })
  },

  getTimelineEvents: () => {
    const tools = get().getTools()
    
    // Convert to timeline events (filter out items without due dates)
    return tools
      .filter((t) => t.dueDate !== "-")
      .map((t, index) => {
        const dateParts = t.dueDate.split("-")
        const dateDay = parseInt(dateParts[2] ?? "0", 10)
        return {
          id: index + 1,
          date: dateDay,
          tool_name: t.tool_name,
          toolCode: t.id,
        }
      })
  },
}))

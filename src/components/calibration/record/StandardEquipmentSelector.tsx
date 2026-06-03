import { useEffect, useState, useMemo } from "react"
import { useCalibrationRecordStore } from "@/stores/calibrationRecordStore"
import { useStandardToolStore } from "@/stores/standardToolStore"
import { useCalibrationSettingStore } from "@/stores/calibrationSettingStore"
import type { BackendStandardTool } from "@/types/tool"
import { Cpu, AlertTriangle, Loader2 } from "lucide-react"

interface Props {
  readonly?: boolean
  selectedIds?: number[]
}

export default function StandardEquipmentSelector({ readonly = false, selectedIds }: Props) {
  const store = useCalibrationRecordStore()
  const standardToolStore = useStandardToolStore()
  const settingStore = useCalibrationSettingStore()

  // Fetch tools on mount
  useEffect(() => {
    void standardToolStore.fetchTools()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Compute allowed standard tool IDs from calibration settings.
  // Backend returns `standardTools` (relation objects). We also handle
  // `standard_tool_ids` for locally constructed settings.
  const allowedStandardToolIds = useMemo(() => {
    const ids = settingStore.settings
      .flatMap((s) => {
        const fromRelation = s.standardTools?.map((t) => t.id) ?? []
        const fromIds = s.standard_tool_ids ?? []
        return [...fromRelation, ...fromIds]
      })
      .filter((id) => id !== null && id !== undefined && String(id) !== "")
      .map((id) => Number(id))
    return Array.from(new Set(ids))
  }, [settingStore.settings])


  // Total slots: at least 2, or as many as the settings require
  const totalSlots = useMemo(() => {
    const selectedCount = selectedIds?.length ?? 0
    return Math.max(2, allowedStandardToolIds.length, selectedCount)
  }, [allowedStandardToolIds, selectedIds])

  // Manual overrides by the user (index → tool)
  const [manualSelections, setManualSelections] = useState<Record<number, BackendStandardTool | null>>({})

  // Derive the final selectedTools array
  // Priority: manualSelections > selectedIds (readonly pre-fill) > allowedStandardToolIds auto-select
  const selectedTools = useMemo<(BackendStandardTool | null)[]>(() => {
    return Array.from({ length: totalSlots }, (_, index) => {
      // 1. User has explicitly chosen something for this slot
      if (index in manualSelections) return manualSelections[index]

      // 2. Pre-fill from external selectedIds (e.g. existing record)
      if (selectedIds && selectedIds[index] !== undefined && standardToolStore.tools.length > 0) {
        const found = standardToolStore.tools.find((t) => Number(t.id) === Number(selectedIds[index]))
        if (found) return found
      }

      // 3. Auto-select the allowed standard tool for this slot (editable mode only)
      const toolId = allowedStandardToolIds[index]
      if (!readonly && toolId && standardToolStore.tools.length > 0) {
        const found = standardToolStore.tools.find((t) => Number(t.id) === Number(toolId))
        return found ?? null
      }

      return null
    })
  }, [totalSlots, manualSelections, selectedIds, allowedStandardToolIds, readonly, standardToolStore.tools])

  // Sync the resolved IDs to the calibration record store
  useEffect(() => {
    const ids = selectedTools
      .filter((t): t is BackendStandardTool => t !== null)
      .map((t) => t.id)
    store.setStandardToolIds(ids)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTools])

  // Filter available tools for a dropdown slot
  // If a specific tool is allowed for this slot, show only that tool + all others for flexibility
  function getFilteredToolsForSlot(index: number): BackendStandardTool[] {
    const allowedId = allowedStandardToolIds[index]
    if (!allowedId) return standardToolStore.tools
    // Show the allowed tool first, then all others
    const allowed = standardToolStore.tools.filter((t) => Number(t.id) === Number(allowedId))
    const others = standardToolStore.tools.filter((t) => Number(t.id) !== Number(allowedId))
    return [...allowed, ...others]
  }

  function getSlotLabel(index: number): string {
    const allowedId = allowedStandardToolIds[index]
    if (!allowedId) return "เครื่องมือทั่วไป"
    const tool = standardToolStore.tools.find((t) => Number(t.id) === Number(allowedId))
    return tool ? tool.tool_name : "เลือกเครื่องมือ"
  }

  function handleSelectTool(index: number, toolIdStr: string) {
    const toolId = Number(toolIdStr)
    const tool = toolIdStr ? (standardToolStore.tools.find((t) => t.id === toolId) ?? null) : null
    setManualSelections((prev) => ({ ...prev, [index]: tool }))
  }

  const isLoading = standardToolStore.loading || settingStore.loading

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs h-full flex flex-col">
      <div className="bg-primary text-white font-bold text-sm text-center py-2.5 uppercase tracking-wide">
        เครื่องมือมาตรฐาน
      </div>

      <div className="p-4 flex-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-500 gap-2">
            <Loader2 className="size-8 animate-spin text-primary" />
            <div className="text-sm">กำลังโหลดข้อมูลเครื่องมือ...</div>
          </div>
        ) : settingStore.settings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-500 gap-2">
            <AlertTriangle className="size-8 text-amber-500" />
            <div className="text-sm">ไม่พบการตั้งค่าเครื่องมือสำหรับอุปกรณ์นี้</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: totalSlots }).map((_, index) => {
              const currentTool = selectedTools[index]
              const filteredTools = getFilteredToolsForSlot(index)

              return (
                <div key={index} className="flex flex-col gap-2">
                  {/* Select Dropdown above the card */}
                  {!readonly && (
                    <div className="flex justify-between items-center h-10">
                      <span className="text-xs font-bold text-slate-500">
                        {getSlotLabel(index)}
                      </span>
                      <select
                        value={currentTool?.id ?? ""}
                        onChange={(e) => handleSelectTool(index, e.target.value)}
                        className="w-48 h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-primary focus:bg-white transition-all text-slate-800"
                      >
                        <option value="">เลือกเครื่องมือ...</option>
                        {filteredTools.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.tool_name} | S/N: {t.serial_number ?? "-"}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Info Card */}
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col gap-3">
                    <div className="flex flex-col items-center border-b border-slate-100 pb-3 mb-1">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                        <Cpu className="size-6 text-primary" />
                      </div>
                      <div className="font-bold text-sm text-slate-800 text-center">
                        {currentTool ? currentTool.tool_name : getSlotLabel(index)}
                      </div>
                      {currentTool ? (
                        <div className="text-xs text-slate-400 mt-0.5">
                          {currentTool.model} (S/N: {currentTool.serial_number || "-"})
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400 italic mt-0.5">
                          (ยังไม่ได้เลือกอุปกรณ์)
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 text-xs">
                      <InfoRow label="รุ่น" value={currentTool?.model} />
                      <InfoRow label="บริษัท" value={currentTool?.manufacturer} />
                      <InfoRow label="หมายเลขประจำเครื่อง" value={currentTool?.serial_number} />
                      <InfoRow label="หน่วยวัด" value={currentTool?.unit} />
                      <InfoRow label="วันที่สอบเทียบ" value={currentTool?.calibration_date_last} />
                      <InfoRow label="หมายเลขใบรับรอง" value={currentTool?.certificate_number} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-slate-500 font-medium">{label}</span>
      <span className="text-slate-800 font-semibold">{value || "-"}</span>
    </div>
  )
}

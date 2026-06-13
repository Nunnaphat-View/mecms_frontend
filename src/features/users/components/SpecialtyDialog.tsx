import { useState, useEffect } from "react"
import { X, Save, RefreshCw, Award } from "lucide-react"
import { userService } from "@/features/users/services/userService"
import { toolService } from "@/features/tools/services/toolService"
import { useToast } from "@/hooks/useToast"

interface SpecialtyDialogProps {
  isOpen: boolean
  userId: number
  userName: string
  onClose: () => void
  onSaved: () => void
}

export default function SpecialtyDialog({
  isOpen,
  userId,
  userName,
  onClose,
  onSaved,
}: SpecialtyDialogProps) {
  const toast = useToast()
  const [toolNames, setToolNames] = useState<string[]>([])
  const [selectedNames, setSelectedNames] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isOpen || !userId) return

    async function loadData() {
      setLoading(true)
      try {
        // Fetch all unique tool names
        const names = await toolService.getUniqueToolNames()
        setToolNames(names)

        // Fetch technician's current specialties
        const specialties = await userService.getSpecialties(userId)
        const activeNames = specialties.map((s: { toolName: string }) => s.toolName).filter(Boolean)
        setSelectedNames(activeNames)
      } catch (err) {
        console.error(err)
        toast.error("ไม่สามารถโหลดข้อมูลความเชี่ยวชาญได้")
      } finally {
        setLoading(false)
      }
    }

    void loadData()
  }, [isOpen, userId, toast])

  if (!isOpen) return null

  const handleCheckboxChange = (name: string, checked: boolean) => {
    if (checked) {
      setSelectedNames((prev) => [...prev, name])
    } else {
      setSelectedNames((prev) => prev.filter((n) => n !== name))
    }
  }

  const handleSelectAll = () => {
    setSelectedNames([...toolNames])
  }

  const handleClearAll = () => {
    setSelectedNames([])
  }

  async function handleSave() {
    setSaving(true)
    try {
      await userService.updateSpecialties(userId, selectedNames)
      toast.success("บันทึกข้อมูลความเชี่ยวชาญสำเร็จ")
      onSaved()
      onClose()
    } catch (err) {
      console.error(err)
      toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-sans overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-primary text-white flex justify-between items-center px-6 py-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
              <Award className="size-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-base leading-snug">
                ตั้งค่าความเชี่ยวชาญช่าง
              </div>
              <div className="text-xs opacity-80 mt-0.5">ช่างเทคนิค: {userName}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-white/80 hover:text-white transition-opacity cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <RefreshCw className="size-8 text-slate-400 animate-spin" />
              <span className="text-xs text-slate-500 font-medium">กำลังโหลดข้อมูล...</span>
            </div>
          ) : toolNames.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              ไม่พบชื่อเครื่องมือในระบบ
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-xs font-semibold text-slate-500">เลือกชื่อเครื่องมือสอบเทียบ</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-[11px] font-bold text-cyan-800 hover:text-cyan-900 cursor-pointer"
                  >
                    เลือกทั้งหมด
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
                  >
                    ล้างทั้งหมด
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2.5 max-h-[40vh] overflow-y-auto pr-1">
                {toolNames.map((name) => {
                  const isChecked = selectedNames.includes(name)
                  return (
                    <label
                      key={name}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                        isChecked
                          ? "bg-cyan-50/40 border-cyan-200 text-cyan-950 font-medium"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50/50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => handleCheckboxChange(name, e.target.checked)}
                        className="size-4.5 rounded border-slate-300 text-cyan-800 focus:ring-cyan-500 accent-cyan-800 cursor-pointer"
                      />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm">{name}</span>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-4 bg-slate-50 border-t border-slate-100 flex-shrink-0">
          <span className="text-xs text-slate-500 font-medium">
            เลือกแล้ว {selectedNames.length} รายการ
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              type="button"
              disabled={saving}
              className="px-5 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors text-xs font-medium disabled:opacity-50 cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSave}
              disabled={saving || loading}
              type="button"
              className="flex items-center gap-1.5 px-5 py-2 bg-cyan-800 hover:bg-cyan-900 text-white rounded-lg transition-colors text-xs font-bold disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <Save className="size-3.5" />
              )}
              บันทึก
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

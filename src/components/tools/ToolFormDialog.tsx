import { useState, useEffect } from "react"
import { Edit3, X, Tag, FileText, Settings, Award, ShieldAlert, Calendar, Layout, Info } from "lucide-react"
import type { MedicalTool, ToolStatus } from "../../types/tool"
import { useToolStore } from "../../stores/toolStore"
import { useAuthStore } from "../../stores/authStore"

interface ToolFormDialogProps {
  isOpen: boolean
  tool: MedicalTool | null
  onClose: () => void
  onSaved: () => void
}

const RISK_OPTIONS = [
  { label: "สูง (High)", value: "high" },
  { label: "กลาง (Medium)", value: "medium" },
  { label: "ต่ำ (Low)", value: "low" },
]

const STATUS_OPTIONS: { label: string; value: ToolStatus }[] = [
  { label: "พร้อมใช้งาน", value: "พร้อมใช้งาน" },
  { label: "กำลังสอบเทียบ", value: "กำลังสอบเทียบ" },
  { label: "รอดำเนินการ", value: "รอดำเนินการ" },
  { label: "จำหน่ายแล้ว", value: "จำหน่ายแล้ว" },
  { label: "กำลังใช้งาน", value: "กำลังใช้งาน" },
  { label: "ส่งซ่อม", value: "ส่งซ่อม" },
  { label: "ปิดใช้งาน", value: "ปิดใช้งาน" },
]

export default function ToolFormDialog({ isOpen, tool, onClose, onSaved }: ToolFormDialogProps) {
  const isEditing = !!tool
  const { equipmentTypes, sections, fetchReferenceData, addTool, updateTool, getNextId } = useToolStore()
  const { user } = useAuthStore()

  const [id, setId] = useState(() => (tool ? tool.id : getNextId()))
  const [name, setName] = useState(() => (tool ? tool.name : ""))
  const [company, setCompany] = useState(() => (tool ? (tool.company === "-" ? "" : tool.company) : ""))
  const [model, setModel] = useState(() => (tool ? (tool.model === "-" ? "" : tool.model) : ""))
  const [equipmentTypeId, setEquipmentTypeId] = useState<number | "">(() => (tool ? (tool.equipment_type_id ?? "") : ""))
  const [serialNumber, setSerialNumber] = useState(() => (tool ? (tool.serialNumber === "-" ? "" : tool.serialNumber) : ""))
  const [riskLevel, setRiskLevel] = useState(() => (tool ? (tool.riskLevel || "medium") : "medium"))
  const [calibrationCycle, setCalibrationCycle] = useState(() => (tool ? tool.calibrationCycle.replace(/[^\d]/g, "") : "6"))
  const [dueDate, setDueDate] = useState(() => (tool ? (tool.dueDate === "-" ? "" : tool.dueDate) : ""))
  const [sectionId, setSectionId] = useState<number | "">(() => (tool ? (tool.sectionId ?? "") : ""))
  const [status, setStatus] = useState<ToolStatus>(() => (tool ? tool.status : "พร้อมใช้งาน"))
  const [isSaving, setIsSaving] = useState(false)

  // Initialize reference data on mount
  useEffect(() => {
    void fetchReferenceData()
  }, [fetchReferenceData])

  if (!isOpen) return null

  // Filter sections by current user's hospitalId
  const userHospitalId = tool?.hospitalId || user?.hospitalId || null
  const filteredSections = sections.filter((s) => !userHospitalId || s.hospitalId === userHospitalId)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!id || !name || !equipmentTypeId || !sectionId || !status) {
      alert("กรุณากรอกข้อมูลที่จำเป็น (*) ให้ครบถ้วน")
      return
    }

    setIsSaving(true)
    const selectedTypeObj = equipmentTypes.find((t) => t.id === equipmentTypeId)
    const payload: Omit<MedicalTool, "id"> & { asset_code: string } = {
      name,
      company: company || "-",
      model: model || "-",
      type: selectedTypeObj?.name || "-",
      equipment_type_id: Number(equipmentTypeId),
      riskLevel,
      serialNumber: serialNumber || "-",
      calibrationCycle: `${calibrationCycle} วัน`,
      dueDate: dueDate || "-",
      lastCalibrationDate: tool?.lastCalibrationDate || "-",
      location: tool?.location || "-",
      department: sections.find((s) => s.id === sectionId)?.name || "-",
      hospitalId: userHospitalId,
      sectionId: Number(sectionId),
      status,
      asset_code: id,
    }

    try {
      if (isEditing && tool) {
        await updateTool(tool.id, payload)
      } else {
        await addTool(payload)
      }
      onSaved()
      onClose()
    } catch (err) {
      console.error(err)
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-sans overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl overflow-hidden shadow-xl border border-slate-200 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-cyan-900 text-white flex justify-between items-center px-6 py-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
              <Edit3 className="size-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-base leading-snug">
                {isEditing ? "แก้ไขข้อมูลเครื่องมือ" : "เพิ่มข้อมูลเครื่องมือ"}
              </div>
              <div className="text-xs opacity-80 mt-0.5">บันทึกข้อมูลครุภัณฑ์และรายละเอียดการสอบเทียบ</div>
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

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Section 1: ข้อมูลพื้นฐาน */}
          <div>
            <div className="flex items-center gap-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-4">
              <span className="w-1 h-3.5 bg-cyan-800 rounded-sm"></span>
              ข้อมูลพื้นฐาน
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <Tag className="size-3.5 text-slate-400" /> รหัสเครื่องมือ *
                </label>
                <input
                  type="text"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  placeholder="เช่น BME-001"
                  required
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-cyan-800 focus:bg-white transition-all font-semibold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <FileText className="size-3.5 text-slate-400" /> ชื่อเครื่องมือ *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ระบุชื่อเครื่องมือแพทย์"
                  required
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-cyan-800 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 2: รายละเอียดเครื่องมือ */}
          <div>
            <div className="flex items-center gap-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-4">
              <span className="w-1 h-3.5 bg-sky-600 rounded-sm"></span>
              รายละเอียดเครื่องมือ
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <Settings className="size-3.5 text-slate-400" /> ผู้ผลิต / Manufacturer
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="เช่น Omron, Philips"
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-cyan-800 focus:bg-white transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <Settings className="size-3.5 text-slate-400" /> ชื่อรุ่น / Model
                </label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="ระบุรุ่น (ถ้ามี)"
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-cyan-800 focus:bg-white transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <Layout className="size-3.5 text-slate-400" /> ประเภทเครื่องมือ *
                </label>
                <select
                  value={equipmentTypeId}
                  onChange={(e) => setEquipmentTypeId(Number(e.target.value))}
                  required
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-cyan-800 focus:bg-white transition-all"
                >
                  <option value="">เลือกประเภทเครื่องมือ</option>
                  {equipmentTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <Tag className="size-3.5 text-slate-400" /> หมายเลขเครื่อง (Serial No.)
                </label>
                <input
                  type="text"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="ระบุ S/N"
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-cyan-800 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 3: การสอบเทียบและความเสี่ยง */}
          <div>
            <div className="flex items-center gap-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-4">
              <span className="w-1 h-3.5 bg-amber-600 rounded-sm"></span>
              การสอบเทียบและความเสี่ยง
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <Award className="size-3.5 text-slate-400" /> ระดับความเสี่ยง *
                </label>
                <div className="flex gap-2">
                  <select
                    value={riskLevel}
                    onChange={(e) => setRiskLevel(e.target.value)}
                    required
                    className="flex-1 h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-cyan-800 focus:bg-white transition-all"
                  >
                    {RISK_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <div className={`h-10 px-4 rounded-lg flex items-center justify-center text-xs font-bold text-white uppercase min-w-[70px] ${
                    riskLevel === "high" ? "bg-rose-600" : riskLevel === "medium" ? "bg-amber-500" : "bg-emerald-600"
                  }`}>
                    {riskLevel === "high" ? "HIGH" : riskLevel === "medium" ? "MED" : "LOW"}
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <ShieldAlert className="size-3.5 text-slate-400" /> รอบสอบเทียบ *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={calibrationCycle}
                    onChange={(e) => setCalibrationCycle(e.target.value)}
                    required
                    min="1"
                    className="w-full h-10 pl-3 pr-16 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-cyan-800 focus:bg-white transition-all"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 pointer-events-none">
                    วัน
                  </span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-slate-400" /> ครบกำหนด (Due Date)
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-cyan-800 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 4: ตำแหน่งและสถานะ */}
          <div>
            <div className="flex items-center gap-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-4">
              <span className="w-1 h-3.5 bg-emerald-600 rounded-sm"></span>
              ตำแหน่งและสถานะ
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <Info className="size-3.5 text-slate-400" /> แผนก / หน่วยงาน *
                </label>
                <select
                  value={sectionId}
                  onChange={(e) => setSectionId(Number(e.target.value))}
                  required
                  disabled={!userHospitalId}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-cyan-800 focus:bg-white transition-all disabled:opacity-50"
                >
                  <option value="">เลือกแผนก/หน่วยงาน</option>
                  {filteredSections.map((sect) => (
                    <option key={sect.id} value={sect.id}>
                      {sect.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <Info className="size-3.5 text-slate-400" /> สถานะ *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ToolStatus)}
                  required
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-cyan-800 focus:bg-white transition-all"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-4 bg-slate-50 border-t border-slate-100 flex-shrink-0">
          <span className="text-xs text-slate-500 font-medium">* จำเป็นต้องกรอก</span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              type="button"
              disabled={isSaving}
              className="px-5 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors text-xs font-medium disabled:opacity-50 cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-cyan-800 hover:bg-cyan-900 text-white rounded-lg transition-colors text-xs font-bold disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <Settings className="size-3.5" />
              )}
              บันทึก
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

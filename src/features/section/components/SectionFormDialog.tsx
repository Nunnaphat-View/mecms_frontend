import { useState } from "react"
import { X, Building2, Save, Hospital } from "lucide-react"
import type { Section } from "@/types/tool"

interface SectionFormDialogProps {
  isOpen: boolean
  section: Section | null
  hospitalId: number
  hospitalName?: string
  loading?: boolean
  onSave: (data: Omit<Section, "id">) => Promise<void>
  onClose: () => void
}

const EMPTY_FORM = {
  name: "",
  code: "",
  description: "",
}

function buildInitialForm(section: Section | null) {
  if (!section) return EMPTY_FORM
  return {
    name: section.name ?? "",
    code: section.code ?? "",
    description: section.description ?? "",
  }
}

// Inner form — remounted via `key` so state resets cleanly on each open
function SectionForm({
  section,
  hospitalId,
  hospitalName,
  loading,
  onSave,
  onClose,
}: Omit<SectionFormDialogProps, "isOpen">) {
  const isEdit = section !== null
  const [form, setForm] = useState(() => buildInitialForm(section))
  const [errors, setErrors] = useState<Partial<Record<keyof typeof EMPTY_FORM, string>>>({})

  function validate(): boolean {
    const newErrors: Partial<Record<keyof typeof EMPTY_FORM, string>> = {}
    if (!form.name.trim()) newErrors.name = "กรุณากรอกชื่อหน่วยงาน"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    await onSave({
      name: form.name.trim(),
      code: form.code.trim() || undefined,
      description: form.description.trim() || undefined,
      hospitalId,
    })
  }

  function handleChange(field: keyof typeof EMPTY_FORM, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  return (
    <>
      {/* Header */}
      <div className="bg-primary text-white flex justify-between items-center px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
            <Building2 className="size-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-sm leading-snug">
              {isEdit ? "แก้ไขข้อมูลหน่วยงาน" : "เพิ่มหน่วยงานใหม่"}
            </div>
            <div className="text-[11px] opacity-80 mt-0.5">
              {isEdit ? `แก้ไขข้อมูล: ${section?.name}` : "กรอกข้อมูลหน่วยงานที่ต้องการเพิ่ม"}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          disabled={loading}
          className="text-white/80 hover:text-white transition-opacity disabled:opacity-50 cursor-pointer"
        >
          <X className="size-5" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={(e) => void handleSubmit(e)}>
        <div className="p-5 flex flex-col gap-4 max-h-[65vh] overflow-y-auto">

          {/* Hospital (read-only display) */}
          {hospitalName && (
            <div className="flex items-center gap-2.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <Hospital className="size-4 text-primary flex-shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400 font-medium leading-none mb-0.5">โรงพยาบาล</div>
                <div className="text-sm font-semibold text-slate-700">{hospitalName}</div>
              </div>
            </div>
          )}

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">
              ชื่อหน่วยงาน <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="เช่น แผนกรังสีวิทยา"
              className={`h-9 px-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                errors.name ? "border-rose-400 bg-rose-50" : "border-slate-200 focus:border-primary bg-white"
              }`}
            />
            {errors.name && <p className="text-xs text-rose-500">{errors.name}</p>}
          </div>

          {/* Code */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">รหัสหน่วยงาน</label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => handleChange("code", e.target.value)}
              placeholder="เช่น RAD"
              className="h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white transition-all"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">หมายเหตุ</label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="ข้อมูลเพิ่มเติม..."
              rows={3}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white transition-all resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <hr className="border-slate-100" />
        <div className="flex justify-end items-center gap-2.5 px-5 py-4 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors text-xs font-medium disabled:opacity-50 cursor-pointer"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-1.5 px-5 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors text-xs font-bold disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="size-3.5" />
            )}
            {isEdit ? "บันทึกการแก้ไข" : "เพิ่มหน่วยงาน"}
          </button>
        </div>
      </form>
    </>
  )
}

export default function SectionFormDialog(props: SectionFormDialogProps) {
  if (!props.isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-sans">
      <div className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-150">
        {/* key forces full remount on each open → state resets cleanly */}
        <SectionForm
          key={props.section?.id ?? "new"}
          section={props.section}
          hospitalId={props.hospitalId}
          hospitalName={props.hospitalName}
          loading={props.loading}
          onSave={props.onSave}
          onClose={props.onClose}
        />
      </div>
    </div>
  )
}

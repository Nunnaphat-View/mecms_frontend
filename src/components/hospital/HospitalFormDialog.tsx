import { useState } from "react"
import { X, Hospital, Save } from "lucide-react"
import type { Hospital as HospitalType } from "../../types/tool"

interface HospitalFormDialogProps {
  isOpen: boolean
  hospital: HospitalType | null
  loading?: boolean
  onSave: (data: Omit<HospitalType, "id">) => Promise<void>
  onClose: () => void
}

const EMPTY_FORM = {
  name: "",
  code: "",
  address: "",
  district: "",
  province: "",
  zipCode: "",
  description: "",
  logoUrl: "",
}

function buildInitialForm(hospital: HospitalType | null) {
  if (!hospital) return EMPTY_FORM
  return {
    name: hospital.name ?? "",
    code: hospital.code ?? "",
    address: hospital.address ?? "",
    district: hospital.district ?? "",
    province: hospital.province ?? "",
    zipCode: hospital.zipCode ?? "",
    description: hospital.description ?? "",
    logoUrl: hospital.logoUrl ?? "",
  }
}

// Inner form component — remounted via `key` so state always resets cleanly
function HospitalForm({
  hospital,
  loading,
  onSave,
  onClose,
}: Omit<HospitalFormDialogProps, "isOpen">) {
  const isEdit = hospital !== null
  const [form, setForm] = useState(() => buildInitialForm(hospital))
  const [errors, setErrors] = useState<Partial<typeof EMPTY_FORM>>({})

  function validate(): boolean {
    const newErrors: Partial<typeof EMPTY_FORM> = {}
    if (!form.name.trim()) newErrors.name = "กรุณากรอกชื่อโรงพยาบาล"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    await onSave({
      name: form.name.trim(),
      code: form.code.trim() || undefined,
      address: form.address.trim() || undefined,
      district: form.district.trim() || undefined,
      province: form.province.trim() || undefined,
      zipCode: form.zipCode.trim() || undefined,
      description: form.description.trim() || undefined,
      logoUrl: form.logoUrl.trim() || undefined,
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
            <Hospital className="size-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-sm leading-snug">
              {isEdit ? "แก้ไขข้อมูลโรงพยาบาล" : "เพิ่มโรงพยาบาลใหม่"}
            </div>
            <div className="text-[11px] opacity-80 mt-0.5">
              {isEdit ? `แก้ไขข้อมูล: ${hospital?.name}` : "กรอกข้อมูลโรงพยาบาลที่ต้องการเพิ่ม"}
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
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">
              ชื่อโรงพยาบาล <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="เช่น โรงพยาบาลศิริราช"
              className={`h-9 px-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                errors.name ? "border-rose-400 bg-rose-50" : "border-slate-200 focus:border-primary bg-white"
              }`}
            />
            {errors.name && <p className="text-xs text-rose-500">{errors.name}</p>}
          </div>

          {/* Code */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">รหัสโรงพยาบาล</label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => handleChange("code", e.target.value)}
              placeholder="เช่น SIRIRAJ"
              className="h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white transition-all"
            />
          </div>

          {/* Address */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">ที่อยู่</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="เลขที่ ถนน"
              className="h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white transition-all"
            />
          </div>

          {/* District + Province */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">อำเภอ/เขต</label>
              <input
                type="text"
                value={form.district}
                onChange={(e) => handleChange("district", e.target.value)}
                placeholder="เช่น บางกอกน้อย"
                className="h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">จังหวัด</label>
              <input
                type="text"
                value={form.province}
                onChange={(e) => handleChange("province", e.target.value)}
                placeholder="เช่น กรุงเทพมหานคร"
                className="h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white transition-all"
              />
            </div>
          </div>

          {/* ZipCode */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">รหัสไปรษณีย์</label>
            <input
              type="text"
              value={form.zipCode}
              onChange={(e) => handleChange("zipCode", e.target.value)}
              placeholder="เช่น 10700"
              maxLength={5}
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
            {isEdit ? "บันทึกการแก้ไข" : "เพิ่มโรงพยาบาล"}
          </button>
        </div>
      </form>
    </>
  )
}

export default function HospitalFormDialog(props: HospitalFormDialogProps) {
  if (!props.isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-sans">
      <div className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* key forces full remount on each open → state resets cleanly, no useEffect needed */}
        <HospitalForm
          key={props.hospital?.id ?? "new"}
          hospital={props.hospital}
          loading={props.loading}
          onSave={props.onSave}
          onClose={props.onClose}
        />
      </div>
    </div>
  )
}

import React, { useState } from "react"
import { ReceiptText, Wrench, FileSpreadsheet, DollarSign, X, Save } from "lucide-react"
import type { CalibrationCost } from "../../types/tool"

interface CalibrationCostDialogProps {
  isOpen: boolean
  cost?: CalibrationCost | null
  onSaved: (value: Omit<CalibrationCost, "id">) => Promise<void>
  onClose: () => void
}

export const CalibrationCostDialog: React.FC<CalibrationCostDialogProps> = ({
  isOpen,
  cost = null,
  onSaved,
  onClose,
}) => {
  const isEdit = !!cost

  const [form, setForm] = useState(() => ({
    tool_name: cost?.tool_name ?? "",
    description: cost?.description ?? "",
    price: cost?.price ?? 0,
  }))

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!form.tool_name.trim()) {
      newErrors.tool_name = "กรุณากรอกชื่อเครื่องมือ"
    }
    if (!form.description.trim()) {
      newErrors.description = "กรุณากรอกรายการ"
    }
    if (form.price <= 0) {
      newErrors.price = "กรุณากรอกราคาที่มากกว่า 0"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      await onSaved({ ...form })
      onClose()
    } catch (err) {
      console.error(err)
      setErrors({ submit: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-sans select-none animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-xl border border-slate-200 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-primary text-white flex justify-between items-center px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
              <ReceiptText className="size-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm leading-snug">
                {isEdit ? "แก้ไขค่าใช้จ่าย" : "เพิ่มค่าใช้จ่ายในการสอบเทียบ"}
              </div>
              <div className="text-[11px] opacity-80 mt-0.5">บันทึกรายการค่าใช้จ่ายและราคา</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white transition-opacity cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex flex-col">
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              <span className="w-1 h-3.5 bg-primary rounded-xs"></span>
              รายละเอียดค่าใช้จ่าย
            </div>

            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl font-medium">
                {errors.submit}
              </div>
            )}

            {/* Tool Name Input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                ชื่อเครื่องมือ <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <Wrench className="absolute left-3.5 size-4 text-slate-400" />
                <input
                  type="text"
                  value={form.tool_name}
                  onChange={(e) => setForm({ ...form, tool_name: e.target.value })}
                  placeholder="ระบุชื่อเครื่องมือ"
                  className={`w-full h-11 pl-10 pr-4 bg-slate-50 border ${
                    errors.tool_name ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-primary"
                  } rounded-xl text-sm focus:bg-white outline-none transition-all`}
                />
              </div>
              {errors.tool_name && (
                <p className="text-[11px] text-red-500 font-medium px-1 mt-0.5">{errors.tool_name}</p>
              )}
            </div>

            {/* Description Input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                รายการ <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <FileSpreadsheet className="absolute left-3.5 size-4 text-slate-400" />
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="ระบุรายการ"
                  className={`w-full h-11 pl-10 pr-4 bg-slate-50 border ${
                    errors.description ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-primary"
                  } rounded-xl text-sm focus:bg-white outline-none transition-all`}
                />
              </div>
              {errors.description && (
                <p className="text-[11px] text-red-500 font-medium px-1 mt-0.5">{errors.description}</p>
              )}
            </div>

            {/* Price Input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                ราคา <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <DollarSign className="absolute left-3.5 size-4 text-slate-400" />
                <input
                  type="number"
                  value={form.price || ""}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  placeholder="0"
                  className={`w-full h-11 pl-10 pr-12 bg-slate-50 border ${
                    errors.price ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-primary"
                  } rounded-xl text-sm focus:bg-white outline-none transition-all`}
                />
                <span className="absolute right-3.5 text-xs text-slate-500">บาท</span>
              </div>
              {errors.price && (
                <p className="text-[11px] text-red-500 font-medium px-1 mt-0.5">{errors.price}</p>
              )}
            </div>
          </div>

          {/* Separator */}
          <hr className="border-slate-100" />

          {/* Footer */}
          <div className="flex justify-between items-center px-5 py-4 bg-slate-50">
            <span className="text-[11px] text-slate-400 font-medium">* จำเป็นต้องกรอก</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-5 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors text-xs font-medium disabled:opacity-50 cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-1.5 px-5 py-2 bg-primary hover:bg-primary/95 text-white rounded-lg transition-colors text-xs font-bold disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <Save className="size-3.5" />
                )}
                บันทึก
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

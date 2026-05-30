import React, { useState, useEffect, useMemo } from "react"
import { ListTodo, Wrench, X, Save, ChevronDown } from "lucide-react"
import type { CalibrationProcess } from "../../types/tool"
import { useStandardToolStore } from "../../stores/standardToolStore"

interface CalibrationProcessDialogProps {
  isOpen: boolean
  process?: CalibrationProcess | null
  onSaved: (value: Omit<CalibrationProcess, "id">) => Promise<void>
  onClose: () => void
}

export const CalibrationProcessDialog: React.FC<CalibrationProcessDialogProps> = ({
  isOpen,
  process = null,
  onSaved,
  onClose,
}) => {
  const isEdit = !!process
  const { tools: standardTools, fetchTools } = useStandardToolStore()

  const [form, setForm] = useState(() => ({
    parameter_name: process?.parameter_name ?? "",
    unit: process?.unit ?? "",
    standard_tool_id: process?.standard_tool_id ?? null,
    procedure: process?.procedure ?? "",
  }))

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  // Fetch standard tools on mount if not loaded
  useEffect(() => {
    if (isOpen) {
      void fetchTools()
    }
  }, [isOpen, fetchTools])

  const standardOptions = useMemo(() => {
    return standardTools.map((t) => ({
      label: `${t.name} - ${t.manufacturer || ""}`,
      value: t.id,
    }))
  }, [standardTools])

  if (!isOpen) return null

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!form.parameter_name.trim()) {
      newErrors.parameter_name = "กรุณากรอกรายการ"
    }
    if (!form.unit.trim()) {
      newErrors.unit = "กรุณากรอกหน่วยวัด"
    }
    if (!form.standard_tool_id) {
      newErrors.standard_tool_id = "กรุณาเลือกเครื่องมือมาตรฐาน"
    }
    if (!form.procedure.trim()) {
      newErrors.procedure = "กรุณาระบุกระบวนการสอบเทียบ"
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
      <div className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-xl animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-primary text-white flex justify-between items-center px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
              <ListTodo className="size-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm leading-snug">
                {isEdit ? "แก้ไขกระบวนการสอบเทียบ" : "เพิ่มกระบวนการสอบเทียบ"}
              </div>
              <div className="text-[11px] opacity-80 mt-0.5">กำหนดพารามิเตอร์และขั้นตอนการสอบเทียบ</div>
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
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl font-medium">
                {errors.submit}
              </div>
            )}

            {/* Section: ข้อมูลพารามิเตอร์ */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span className="w-1 h-3.5 bg-primary rounded-xs"></span>
                ข้อมูลพารามิเตอร์
              </div>

              {/* Parameter Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  รายการ <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <ListTodo className="absolute left-3.5 size-4 text-slate-400" />
                  <input
                    type="text"
                    value={form.parameter_name}
                    onChange={(e) => setForm({ ...form, parameter_name: e.target.value })}
                    placeholder="ระบุรายการ"
                    className={`w-full h-11 pl-10 pr-4 bg-slate-50 border ${
                      errors.parameter_name ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-primary"
                    } rounded-xl text-sm focus:bg-white outline-none transition-all`}
                  />
                </div>
                {errors.parameter_name && (
                  <p className="text-[11px] text-red-500 font-medium px-1 mt-0.5">{errors.parameter_name}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Unit */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                    หน่วยวัด <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-xs text-slate-400 font-medium">U</span>
                    <input
                      type="text"
                      value={form.unit}
                      onChange={(e) => setForm({ ...form, unit: e.target.value })}
                      placeholder="เช่น mmHg, BPM, Kg"
                      className={`w-full h-11 pl-10 pr-4 bg-slate-50 border ${
                        errors.unit ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-primary"
                      } rounded-xl text-sm focus:bg-white outline-none transition-all`}
                    />
                  </div>
                  {errors.unit && (
                    <p className="text-[11px] text-red-500 font-medium px-1 mt-0.5">{errors.unit}</p>
                  )}
                </div>

                {/* Standard Tool Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                    เครื่องมือมาตรฐาน <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Wrench className="absolute left-3.5 size-4 text-slate-400 pointer-events-none" />
                    <select
                      value={form.standard_tool_id || ""}
                      onChange={(e) => setForm({ ...form, standard_tool_id: e.target.value ? Number(e.target.value) : null })}
                      className={`w-full h-11 pl-10 pr-10 bg-slate-50 border ${
                        errors.standard_tool_id ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-primary"
                      } rounded-xl text-sm appearance-none focus:bg-white outline-none transition-all`}
                    >
                      <option value="">เลือกเครื่องมือมาตรฐาน</option>
                      {standardOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3.5 size-4 text-slate-400 pointer-events-none" />
                  </div>
                  {errors.standard_tool_id && (
                    <p className="text-[11px] text-red-500 font-medium px-1 mt-0.5">{errors.standard_tool_id}</p>
                  )}
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Section: กระบวนการสอบเทียบ */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span className="w-1 h-3.5 bg-blue-600 rounded-xs"></span>
                กระบวนการสอบเทียบ
              </div>

              {/* Procedure */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  ขั้นตอนการสอบเทียบ <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={form.procedure}
                  onChange={(e) => setForm({ ...form, procedure: e.target.value })}
                  placeholder="ระบุขั้นตอนและวิธีการสอบเทียบโดยละเอียด"
                  className={`w-full p-3 bg-slate-50 border ${
                    errors.procedure ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-primary"
                  } rounded-xl text-sm focus:bg-white outline-none transition-all resize-none`}
                />
                {errors.procedure && (
                  <p className="text-[11px] text-red-500 font-medium px-1 mt-0.5">{errors.procedure}</p>
                )}
              </div>
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

import React, { useState, useEffect, useMemo, useRef } from "react"
import { ReceiptText, Wrench, FileSpreadsheet, DollarSign, X, Save, ChevronDown } from "lucide-react"
import type { CalibrationCost } from "../../types/tool"
import { useToolStore } from "../../stores/toolStore"

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
  const { tools, fetchTools } = useToolStore()

  useEffect(() => {
    if (isOpen) {
      void fetchTools()
    }
  }, [isOpen, fetchTools])

  const uniqueToolNames = useMemo(() => {
    return Array.from(new Set(tools.map((t) => t.tool_name))).filter(Boolean).sort()
  }, [tools])

  const [form, setForm] = useState(() => ({
    tool_name: cost?.tool_name ?? "",
    description: cost?.description ?? "",
    price: cost?.price ?? 0,
  }))

  const [searchQuery, setSearchQuery] = useState(() => cost?.tool_name ?? "")
  const [isOpenDropdown, setIsOpenDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const [prevCost, setPrevCost] = useState(cost)
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen)

  if (cost !== prevCost || isOpen !== prevIsOpen) {
    setPrevCost(cost)
    setPrevIsOpen(isOpen)
    setForm({
      tool_name: cost?.tool_name ?? "",
      description: cost?.description ?? "",
      price: cost?.price ?? 0,
    })
    setSearchQuery(cost?.tool_name ?? "")
    setIsOpenDropdown(false)
    setErrors({})
  }

  const filteredOptions = useMemo(() => {
    const list = [...uniqueToolNames]
    if (cost?.tool_name && !list.includes(cost.tool_name)) {
      list.push(cost.tool_name)
    }
    const sorted = list.sort()
    const query = searchQuery.trim().toLowerCase()
    if (!query) return sorted
    return sorted.filter((name) => name.toLowerCase().includes(query))
  }, [uniqueToolNames, cost, searchQuery])

  // Handle click outside dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpenDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

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
      <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-xl animate-in zoom-in-95 duration-150">
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

            {/* Searchable Tool Name Input */}
            <div className="space-y-1 relative" ref={dropdownRef}>
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                ชื่อเครื่องมือ <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center w-full">
                <Wrench className="absolute left-3.5 size-4 text-slate-400 z-10 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onFocus={() => setIsOpenDropdown(true)}
                  onChange={(e) => {
                    const val = e.target.value
                    setSearchQuery(val)
                    setForm((prev) => ({ ...prev, tool_name: val }))
                    setIsOpenDropdown(true)
                  }}
                  placeholder="พิมพ์ค้นหาหรือเลือกชื่อเครื่องมือ..."
                  className={`w-full h-11 pl-10 pr-10 bg-slate-50 border ${
                    errors.tool_name ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-primary"
                  } rounded-xl text-sm focus:bg-white outline-none transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setIsOpenDropdown((prev) => !prev)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
                >
                  <ChevronDown className="size-4" />
                </button>
              </div>
              {errors.tool_name && (
                <p className="text-[11px] text-red-500 font-medium px-1 mt-0.5">{errors.tool_name}</p>
              )}

              {/* Floating Dropdown List */}
              {isOpenDropdown && (
                <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 max-h-52 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg p-1 animate-in fade-in duration-100">
                  {filteredOptions.length === 0 ? (
                    <div className="px-4 py-3 text-xs text-slate-400 text-center font-medium">
                      ไม่พบชื่อเครื่องมือที่ตรงกัน
                    </div>
                  ) : (
                    filteredOptions.map((name: string) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => {
                          setForm((prev) => ({ ...prev, tool_name: name }))
                          setSearchQuery(name)
                          setIsOpenDropdown(false)
                        }}
                        className={`w-full px-4 py-2.5 text-left text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                          form.tool_name === name
                            ? "bg-primary/10 text-primary"
                            : "text-slate-700 hover:bg-slate-50 active:bg-slate-100"
                        }`}
                      >
                        <span>{name}</span>
                        {form.tool_name === name && (
                          <span className="text-primary text-[10px]">✔</span>
                        )}
                      </button>
                    ))
                  )}
                </div>
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

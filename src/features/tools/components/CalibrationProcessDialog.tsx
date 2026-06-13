import React, { useState, useEffect, useMemo, useRef } from "react"
import { ListTodo, Wrench, X, Save, ChevronDown } from "lucide-react"
import type { CalibrationProcess } from "../../types/tool"
import { useStandardToolStore } from "../../stores/standardToolStore"
import { useToolStore } from "../../stores/toolStore"

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
  const [form, setForm] = useState(() => ({
    parameter_name: process?.parameter_name ?? "",
    unit: process?.unit ?? "",
    standard_tool_id: process?.standard_tool_id ?? null,
    procedure: process?.procedure ?? "",
  }))

  const { tools: standardTools, fetchTools } = useStandardToolStore()
  const { tools: inventoryTools, fetchTools: fetchInventoryTools } = useToolStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [isOpenDropdown, setIsOpenDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [paramSearchQuery, setParamSearchQuery] = useState(() => process?.parameter_name ?? "")
  const [isOpenParamDropdown, setIsOpenParamDropdown] = useState(false)
  const paramDropdownRef = useRef<HTMLDivElement>(null)

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const [prevProcess, setPrevProcess] = useState(process)
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen)
  const [prevStandardTools, setPrevStandardTools] = useState(standardTools)

  if (process !== prevProcess || isOpen !== prevIsOpen) {
    setPrevProcess(process)
    setPrevIsOpen(isOpen)
    setForm({
      parameter_name: process?.parameter_name ?? "",
      unit: process?.unit ?? "",
      standard_tool_id: process?.standard_tool_id ?? null,
      procedure: process?.procedure ?? "",
    })
    const selTool = standardTools.find(t => t.id === (process?.standard_tool_id ?? null))
    setSearchQuery(selTool ? `${selTool.tool_name} - ${selTool.manufacturer || ""}` : "")
    setIsOpenDropdown(false)
    setParamSearchQuery(process?.parameter_name ?? "")
    setIsOpenParamDropdown(false)
    setErrors({})
  }

  if (standardTools !== prevStandardTools) {
    setPrevStandardTools(standardTools)
    if (form.standard_tool_id && !searchQuery) {
      const selTool = standardTools.find((t) => t.id === form.standard_tool_id)
      if (selTool) {
        setSearchQuery(`${selTool.tool_name} - ${selTool.manufacturer || ""}`)
      }
    }
  }

  // Fetch standard tools and inventory tools on mount if not loaded
  useEffect(() => {
    if (isOpen) {
      void fetchTools()
      void fetchInventoryTools()
    }
  }, [isOpen, fetchTools, fetchInventoryTools])

  // Handle click outside dropdowns to close them
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpenDropdown(false)
      }
      if (paramDropdownRef.current && !paramDropdownRef.current.contains(event.target as Node)) {
        setIsOpenParamDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const uniqueToolNames = useMemo(() => {
    return Array.from(new Set(inventoryTools.map((t) => t.tool_name))).filter(Boolean).sort()
  }, [inventoryTools])

  const standardOptions = useMemo(() => {
    return standardTools.map((t) => ({
      label: `${t.tool_name} - ${t.manufacturer || ""}`,
      value: t.id,
    }))
  }, [standardTools])

  const filteredOptions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return standardOptions
    return standardOptions.filter((opt) => opt.label.toLowerCase().includes(query))
  }, [standardOptions, searchQuery])

  const filteredParamOptions = useMemo(() => {
    const list = [...uniqueToolNames]
    if (process?.parameter_name && !list.includes(process.parameter_name)) {
      list.push(process.parameter_name)
    }
    const sorted = list.sort()
    const query = paramSearchQuery.trim().toLowerCase()
    if (!query) return sorted
    return sorted.filter((name) => name.toLowerCase().includes(query))
  }, [uniqueToolNames, process, paramSearchQuery])

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
              <div className="space-y-1 relative" ref={paramDropdownRef}>
                <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  รายการ <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center w-full">
                  <ListTodo className="absolute left-3.5 size-4 text-slate-400 z-10 pointer-events-none" />
                  <input
                    type="text"
                    value={paramSearchQuery}
                    onFocus={() => setIsOpenParamDropdown(true)}
                    onChange={(e) => {
                      const val = e.target.value
                      setParamSearchQuery(val)
                      setForm((prev) => ({ ...prev, parameter_name: val }))
                      setIsOpenParamDropdown(true)
                    }}
                    placeholder="พิมพ์ค้นหาหรือระบุชื่อเครื่องมือ..."
                    className={`w-full h-11 pl-10 pr-10 bg-slate-50 border ${
                      errors.parameter_name ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-primary"
                    } rounded-xl text-sm focus:bg-white outline-none transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setIsOpenParamDropdown((prev) => !prev)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
                  >
                    <ChevronDown className="size-4" />
                  </button>
                </div>
                {errors.parameter_name && (
                  <p className="text-[11px] text-red-500 font-medium px-1 mt-0.5">{errors.parameter_name}</p>
                )}

                {/* Floating Dropdown List */}
                {isOpenParamDropdown && (
                  <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 max-h-52 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg p-1 animate-in fade-in duration-100">
                    {filteredParamOptions.length === 0 ? (
                      <div className="px-4 py-3 text-xs text-slate-400 text-center font-medium">
                        ไม่พบเครื่องมือแพทย์ที่ตรงกัน
                      </div>
                    ) : (
                      filteredParamOptions.map((name: string) => (
                        <button
                          key={name}
                          type="button"
                          onClick={() => {
                            setForm((prev) => ({ ...prev, parameter_name: name }))
                            setParamSearchQuery(name)
                            setIsOpenParamDropdown(false)
                          }}
                          className={`w-full px-4 py-2.5 text-left text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                            form.parameter_name === name
                              ? "bg-primary/10 text-primary"
                              : "text-slate-700 hover:bg-slate-50 active:bg-slate-100"
                          }`}
                        >
                          <span>{name}</span>
                          {form.parameter_name === name && (
                            <span className="text-primary text-[10px]">✔</span>
                          )}
                        </button>
                      ))
                    )}
                  </div>
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
                <div className="space-y-1 relative" ref={dropdownRef}>
                  <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                    เครื่องมือมาตรฐาน <span className="text-red-500">*</span>
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
                        setIsOpenDropdown(true)
                        
                        // Clear the selected tool ID if they clear or type something that doesn't match
                        const match = standardOptions.find(opt => opt.label.toLowerCase() === val.trim().toLowerCase())
                        if (match) {
                          setForm((prev) => ({ ...prev, standard_tool_id: match.value }))
                        } else {
                          setForm((prev) => ({ ...prev, standard_tool_id: null }))
                        }
                      }}
                      placeholder="พิมพ์ค้นหาเครื่องมือมาตรฐาน..."
                      className={`w-full h-11 pl-10 pr-10 bg-slate-50 border ${
                        errors.standard_tool_id ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-primary"
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
                  {errors.standard_tool_id && (
                    <p className="text-[11px] text-red-500 font-medium px-1 mt-0.5">{errors.standard_tool_id}</p>
                  )}

                  {/* Floating Dropdown List */}
                  {isOpenDropdown && (
                    <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 max-h-52 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg p-1 animate-in fade-in duration-100">
                      {filteredOptions.length === 0 ? (
                        <div className="px-4 py-3 text-xs text-slate-400 text-center font-medium">
                          ไม่พบเครื่องมือมาตรฐานที่ตรงกัน
                        </div>
                      ) : (
                        filteredOptions.map((opt: { label: string; value: number }) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              setForm((prev) => ({ ...prev, standard_tool_id: opt.value }))
                              setSearchQuery(opt.label)
                              setIsOpenDropdown(false)
                            }}
                            className={`w-full px-4 py-2.5 text-left text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                              form.standard_tool_id === opt.value
                                ? "bg-primary/10 text-primary"
                                : "text-slate-700 hover:bg-slate-50 active:bg-slate-100"
                            }`}
                          >
                            <span>{opt.label}</span>
                            {form.standard_tool_id === opt.value && (
                              <span className="text-primary text-[10px]">✔</span>
                            )}
                          </button>
                        ))
                      )}
                    </div>
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

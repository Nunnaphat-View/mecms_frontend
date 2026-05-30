import { useState, useEffect, useRef } from "react"
import { X, Tag, FileText, Settings, Award, Calendar, FileCheck2, Image, CheckCircle2 } from "lucide-react"
import type { BackendStandardTool } from "../../types/tool"
import { useStandardToolStore } from "../../stores/standardToolStore"
import { getFileUrl } from "../../services/standardToolService"

interface StandardToolFormDialogProps {
  isOpen: boolean
  tool: BackendStandardTool | null
  onClose: () => void
  onSaved: () => void
}

function SectionLabel({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-4">
      <span className={`w-1 h-3.5 rounded-sm ${color}`}></span>
      {label}
    </div>
  )
}

function FormInput({
  label,
  icon: Icon,
  required,
  ...props
}: {
  label: string
  icon: React.ElementType
  required?: boolean
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
        <Icon className="size-3.5 text-slate-400" />
        {label}
        {required && <span className="text-rose-500">*</span>}
      </label>
      <input
        {...props}
        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:bg-white transition-all"
      />
    </div>
  )
}

export default function StandardToolFormDialog({
  isOpen,
  tool,
  onClose,
  onSaved,
}: StandardToolFormDialogProps) {
  const isEditing = !!tool
  const { categories, fetchCategories, addTool, updateTool, uploadPdf, uploadImage } =
    useStandardToolStore()

  // Lazy initializers — safe because the parent conditionally mounts this component,
  // so `tool` already has the correct value at mount time. No useEffect needed.
  const [name, setName] = useState(() => tool?.name ?? "")
  const [assetCode, setAssetCode] = useState(() => tool?.asset_code ?? "")
  const [manufacturer, setManufacturer] = useState(() => tool?.manufacturer ?? "")
  const [model, setModel] = useState(() => tool?.model ?? "")
  const [serialNumber, setSerialNumber] = useState(() => tool?.serial_number ?? "")
  const [unit, setUnit] = useState(() => tool?.unit ?? "")
  const [categoryId, setCategoryId] = useState<number | "">(() => tool?.category_id ?? "")
  const [calibrationDateLast, setCalibrationDateLast] = useState(() => tool?.calibration_date_last ?? "")
  const [certificateNumber, setCertificateNumber] = useState(() => tool?.certificate_number ?? "")

  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const [isSaving, setIsSaving] = useState(false)
  const [nameError, setNameError] = useState("")

  // Fetch categories on first open (genuine external sync — this is the right use for an effect)
  useEffect(() => {
    if (categories.length === 0) {
      void fetchCategories()
    }
  }, [categories.length, fetchCategories])


  if (!isOpen) return null

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setNameError("กรุณากรอกชื่อเครื่องมือมาตรฐาน")
      return
    }
    setNameError("")
    setIsSaving(true)

    try {
      const payload = {
        name: name.trim(),
        asset_code: assetCode.trim() || null,
        manufacturer: manufacturer.trim() || null,
        model: model.trim() || null,
        serial_number: serialNumber.trim() || null,
        unit: unit.trim() || null,
        category_id: categoryId !== "" ? Number(categoryId) : null,
        calibration_date_last: calibrationDateLast || null,
        certificate_number: certificateNumber.trim() || null,
      }

      let savedTool: BackendStandardTool
      if (isEditing && tool) {
        savedTool = await updateTool(tool.id, payload)
      } else {
        savedTool = await addTool(payload)
      }

      if (pdfFile) await uploadPdf(savedTool.id, pdfFile)
      if (imageFile) await uploadImage(savedTool.id, imageFile)

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
      <div className="bg-white w-full max-w-2xl rounded-2xl overflow-hidden shadow-xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-primary text-white flex justify-between items-center px-6 py-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
              <Settings className="size-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-base leading-snug">
                {isEditing ? "แก้ไขเครื่องมือมาตรฐาน" : "เพิ่มเครื่องมือมาตรฐาน"}
              </div>
              <div className="text-xs opacity-80 mt-0.5">
                กรอกข้อมูลเครื่องมืออ้างอิงสำหรับการสอบเทียบ
              </div>
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
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto">
          {/* Section 1: ข้อมูลพื้นฐาน */}
          <div className="p-6 space-y-4">
            <SectionLabel color="bg-primary" label="ข้อมูลพื้นฐาน" />
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              <div className="sm:col-span-2">
                <FormInput
                  label="รหัสทรัพย์สิน / รหัสเครื่องมือ"
                  icon={Tag}
                  value={assetCode}
                  onChange={(e) => setAssetCode(e.target.value)}
                  placeholder="เช่น STD-001"
                />
              </div>
              <div className="sm:col-span-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                    <FileText className="size-3.5 text-slate-400" />
                    ชื่อเครื่องมือมาตรฐาน
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setNameError("") }}
                    placeholder="เช่น NIBP Simulator"
                    className={`w-full h-10 px-3 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:bg-white transition-all ${
                      nameError ? "border-rose-400 focus:border-rose-500" : "border-slate-200 focus:border-primary"
                    }`}
                  />
                  {nameError && (
                    <p className="text-rose-500 text-[11px] mt-1">{nameError}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 2: รายละเอียดเครื่องมือ */}
          <div className="p-6 space-y-4">
            <SectionLabel color="bg-sky-600" label="รายละเอียดเครื่องมือ" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="บริษัทผู้ผลิต"
                icon={Settings}
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                placeholder="เช่น FLUKE"
              />
              <FormInput
                label="รุ่น (Model)"
                icon={Settings}
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="เช่น ProSim4"
              />
              <FormInput
                label="หมายเลขเครื่อง (Serial No.)"
                icon={Tag}
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="เช่น SN-3891030"
              />
              <FormInput
                label="หน่วยวัด"
                icon={Award}
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="เช่น mmHg"
              />
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <Settings className="size-3.5 text-slate-400" />
                  หมวดหมู่
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value !== "" ? Number(e.target.value) : "")}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:bg-white transition-all"
                >
                  <option value="">กรุณาเลือกหมวดหมู่</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 3: ข้อมูลการสอบเทียบ */}
          <div className="p-6 space-y-4">
            <SectionLabel color="bg-emerald-600" label="ข้อมูลการสอบเทียบ" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-slate-400" />
                  วันที่สอบเทียบล่าสุด
                </label>
                <input
                  type="date"
                  value={calibrationDateLast}
                  onChange={(e) => setCalibrationDateLast(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:bg-white transition-all"
                />
              </div>
              <FormInput
                label="เลขที่ใบรับรอง"
                icon={FileCheck2}
                value={certificateNumber}
                onChange={(e) => setCertificateNumber(e.target.value)}
                placeholder="เช่น CERT-2026-001"
              />
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 4: เอกสารและสื่อ */}
          <div className="p-6 space-y-4">
            <SectionLabel color="bg-amber-600" label="เอกสารและสื่อประกอบ" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* PDF Upload */}
              <div className="flex gap-3 items-start bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                <div className="w-9 h-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FileText className="size-4.5 text-rose-600" />
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="text-xs font-semibold text-slate-600">ใบรับรองการสอบเทียบ</div>
                  <input
                    ref={pdfInputRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                  />
                  <button
                    type="button"
                    onClick={() => pdfInputRef.current?.click()}
                    className="w-full h-9 border border-dashed border-slate-300 rounded-lg text-xs text-slate-500 hover:border-primary hover:text-primary transition-colors cursor-pointer bg-white flex items-center justify-center gap-1.5"
                  >
                    {pdfFile ? pdfFile.name : "เลือกไฟล์ PDF"}
                  </button>
                  {!pdfFile && tool?.path_pdf && (
                    <a
                      href={getFileUrl(tool.path_pdf)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[11px] text-primary underline"
                    >
                      <CheckCircle2 className="size-3 text-emerald-500" />
                      เปิดดูไฟล์ปัจจุบัน
                    </a>
                  )}
                </div>
              </div>

              {/* Image Upload */}
              <div className="flex gap-3 items-start bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                <div className="w-9 h-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Image className="size-4.5 text-sky-600" />
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="text-xs font-semibold text-slate-600">รูปภาพเครื่องมือ</div>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                  />
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="w-full h-9 border border-dashed border-slate-300 rounded-lg text-xs text-slate-500 hover:border-primary hover:text-primary transition-colors cursor-pointer bg-white flex items-center justify-center gap-1.5"
                  >
                    {imageFile ? imageFile.name : "เลือกรูปภาพ (ถ้ามี)"}
                  </button>
                  {!imageFile && tool?.path_image && (
                    <a
                      href={getFileUrl(tool.path_image)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[11px] text-primary underline"
                    >
                      <CheckCircle2 className="size-3 text-emerald-500" />
                      เปิดดูรูปภาพปัจจุบัน
                    </a>
                  )}
                </div>
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
              className="flex items-center gap-1.5 px-5 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors text-xs font-bold disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <FileCheck2 className="size-3.5" />
              )}
              บันทึกข้อมูล
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

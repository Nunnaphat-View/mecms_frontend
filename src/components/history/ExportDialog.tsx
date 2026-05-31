import { useState } from "react"
import { X, Download, FileText, FileSpreadsheet, Archive, Layers, CheckSquare,Wrench } from "lucide-react"
import DatePicker from "../common/DatePicker"

type ExportFormat = "csv" | "pdf"
type PdfOption = "individual" | "zip"
type CertType = "all" | "external" | "calibration"

interface ExportDialogProps {
  isOpen: boolean
  onClose: () => void
  deviceOptions: { label: string; value: string }[]
  resultOptions: { label: string; value: string }[]
  onExportSuccess: (message: string) => void
}

export default function ExportDialog({
  isOpen,
  onClose,
  deviceOptions,
  resultOptions,
  onExportSuccess,
}: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>("pdf")
  const [pdfOption, setPdfOption] = useState<PdfOption>("individual")
  const [certType, setCertType] = useState<CertType>("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [device, setDevice] = useState("")
  const [result, setResult] = useState("")
  const [exporting, setExporting] = useState(false)

  if (!isOpen) return null

  const certTypesList: { label: string; value: CertType; icon: React.ReactNode }[] = [
    { label: "ทั้งหมด", value: "all", icon: <Layers className="size-5" /> },
    { label: "ตรวจสภาพ", value: "external", icon: <Wrench className="size-5" /> },
    { label: "สอบเทียบ", value: "calibration", icon: <CheckSquare className="size-5" /> },
  ]

  async function handleExport() {
    setExporting(true)
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1200))
    setExporting(false)
    onClose()

    const formatName = format.toUpperCase()
    let detail = ""
    if (format === "pdf") {
      detail = pdfOption === "zip" ? " (ไฟล์รวม ZIP)" : " (แยกไฟล์เดี่ยว)"
    }
    onExportSuccess(`ส่งออกไฟล์ ${formatName}${detail} สำเร็จ`)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-sans overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-xl flex flex-col max-h-[95vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-[#088395] text-white flex justify-between items-center px-5 py-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
              <Download className="size-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm leading-snug">ส่งออกข้อมูล (Export)</div>
              <div className="text-[11px] opacity-80 mt-0.5">เลือกรูปแบบและตัวกรองข้อมูลที่ต้องการ</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-opacity cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* File Format */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              <span className="w-1 h-3.5 bg-primary rounded-full"></span>
              รูปแบบไฟล์
            </div>
            <div className="grid grid-cols-2 gap-3">
              {/* CSV */}
              <div
                onClick={() => setFormat("csv")}
                className={`border-2 rounded-xl p-3 flex items-center gap-3 cursor-pointer transition-all hover:bg-slate-50 ${
                  format === "csv"
                    ? "border-primary bg-primary/5"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="text-emerald-600">
                  <FileSpreadsheet className="size-6" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-800">CSV</div>
                  <div className="text-[10px] text-slate-400">สำหรับ Excel / Sheets</div>
                </div>
              </div>

              {/* PDF */}
              <div
                onClick={() => setFormat("pdf")}
                className={`border-2 rounded-xl p-3 flex items-center gap-3 cursor-pointer transition-all hover:bg-slate-50 ${
                  format === "pdf"
                    ? "border-primary bg-primary/5"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="text-rose-500">
                  <FileText className="size-6" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-800">PDF</div>
                  <div className="text-[10px] text-slate-400">รูปแบบใบรับรอง</div>
                </div>
              </div>
            </div>
          </div>

          {/* PDF Options (Only shown if PDF is selected) */}
          {format === "pdf" && (
            <>
              <hr className="border-slate-100" />
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                  <span className="w-1 h-3.5 bg-primary rounded-full"></span>
                  รูปแบบการส่งออก PDF
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {/* Individual files */}
                  <div
                    onClick={() => setPdfOption("individual")}
                    className={`border-2 rounded-xl p-3 flex items-center gap-3 cursor-pointer transition-all hover:bg-slate-50 ${
                      pdfOption === "individual"
                        ? "border-primary bg-primary/5"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="text-rose-500">
                      <FileText className="size-6" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-800">แยกไฟล์เดี่ยว</div>
                      <div className="text-[10px] text-slate-400">ดาวน์โหลดแยกกันทีละไฟล์</div>
                    </div>
                  </div>

                  {/* ZIP archive */}
                  <div
                    onClick={() => setPdfOption("zip")}
                    className={`border-2 rounded-xl p-3 flex items-center gap-3 cursor-pointer transition-all hover:bg-slate-50 ${
                      pdfOption === "zip"
                        ? "border-primary bg-primary/5"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="text-primary">
                      <Archive className="size-6" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-800">รวมเป็นไฟล์ ZIP</div>
                      <div className="text-[10px] text-slate-400">ดาวน์โหลดเป็นไฟล์บีบอัด ZIP</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          <hr className="border-slate-100" />

          {/* Cert Type */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              <span className="w-1 h-3.5 bg-blue-500 rounded-full"></span>
              ประเภทใบรับรอง
            </div>
            <div className="grid grid-cols-3 gap-3">
              {certTypesList.map((ct) => (
                <div
                  key={ct.value}
                  onClick={() => setCertType(ct.value)}
                  className={`border-2 rounded-xl p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:bg-slate-50 ${
                    certType === ct.value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-slate-200 bg-white text-slate-400"
                  }`}
                >
                  <div className={certType === ct.value ? "text-primary" : "text-slate-400"}>
                    {ct.icon}
                  </div>
                  <div className="font-bold text-xs text-slate-800 mt-2">{ct.label}</div>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Date Range */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              <span className="w-1 h-3.5 bg-emerald-500 rounded-full"></span>
              ช่วงเวลาที่ต้องการ
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500">เริ่มจากวันที่</label>
                <DatePicker
                  value={dateFrom}
                  onChange={setDateFrom}
                  placeholder="เลือกวันเริ่มต้น..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500">ถึงวันที่</label>
                <DatePicker
                  value={dateTo}
                  onChange={setDateTo}
                  placeholder="เลือกวันสิ้นสุด..."
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Filters */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              <span className="w-1 h-3.5 bg-amber-500 rounded-full"></span>
              ตัวกรองเพิ่มเติม
            </div>
            <div className="grid grid-cols-2 gap-3">
              {/* Device */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500">เครื่องมือ</label>
                <select
                  value={device}
                  onChange={(e) => setDevice(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-primary focus:bg-white transition-all text-slate-700 outline-none"
                >
                  {deviceOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Result */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500">ผลการสอบเทียบ</label>
                <select
                  value={result}
                  onChange={(e) => setResult(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-primary focus:bg-white transition-all text-slate-700 outline-none"
                >
                  {resultOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <hr className="border-slate-100 flex-shrink-0" />
        <div className="flex justify-end items-center gap-2.5 px-5 py-4 bg-slate-50 flex-shrink-0">
          <button
            onClick={onClose}
            disabled={exporting}
            className="px-5 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors text-xs font-medium disabled:opacity-50 cursor-pointer"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-1.5 px-5 py-2 bg-primary hover:bg-[#07536a] text-white rounded-lg transition-colors text-xs font-bold disabled:opacity-50 cursor-pointer"
          >
            {exporting ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <Download className="size-3.5" />
            )}
            ส่งออกไฟล์
          </button>
        </div>

      </div>
    </div>
  )
}

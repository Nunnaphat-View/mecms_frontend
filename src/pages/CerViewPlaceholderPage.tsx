import { useSearchParams, useNavigate } from "react-router-dom"
import { ArrowLeft, FileText, Download, Printer, ShieldCheck } from "lucide-react"

export default function CerViewPlaceholderPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const taskId = searchParams.get("taskId")

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto p-4 md:p-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/history")}
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-500 cursor-pointer"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <FileText className="size-5.5 text-primary" />
              ใบรับรองผลการสอบเทียบเครื่องมือ (Certificate)
            </h1>
            <p className="text-slate-500 text-xs mt-0.5">ID: CAL-{taskId || "Unknown"}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => window.print()}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 h-9 border border-slate-200 rounded-lg hover:bg-slate-50 text-xs font-semibold text-slate-600 transition-colors cursor-pointer"
          >
            <Printer className="size-4" />
            พิมพ์
          </button>
          <button
            onClick={() => alert("ระบบกำลังดาวน์โหลดไฟล์ PDF...")}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 h-9 bg-primary hover:bg-[#07536a] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            <Download className="size-4" />
            ดาวน์โหลด PDF
          </button>
        </div>
      </div>

      {/* Info Warning Card */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 flex gap-4 text-emerald-800">
        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="size-5.5 text-emerald-700" />
        </div>
        <div>
          <h3 className="font-bold text-sm leading-snug">ใบรับรองระบบอนุมัติสำเร็จ</h3>
          <p className="text-xs text-emerald-700/90 mt-1 leading-relaxed">
            เอกสารการสอบเทียบฉบับนี้ได้รับการลงลายมือชื่อดิจิทัลและรับรองข้อมูลอย่างเป็นทางการในระบบแล้ว 
            สามารถดาวน์โหลดเป็น PDF หรือพิมพ์เอกสารต้นฉบับได้โดยตรง
          </p>
        </div>
      </div>

      {/* Placeholder Document body */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-10 shadow-xs flex flex-col gap-8 min-h-[500px] justify-center items-center text-center">
        <FileText className="size-16 text-slate-300" />
        <div className="max-w-md">
          <h2 className="text-base font-bold text-slate-800">การแสดงผลใบรับรองผลการสอบเทียบ</h2>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            กำลังประมวลผลข้อมูลการสอบเทียบของงานหมายเลข <strong>{taskId}</strong> เพื่อออกใบรับรองอย่างเป็นทางการ 
            และแสดงตารางเปรียบเทียบมาตรฐาน UUC vs STD ตามมาตรฐานโรงพยาบาล
          </p>
        </div>
      </div>
    </div>
  )
}

import { CheckCircle2, AlertCircle } from "lucide-react"

interface Props {
  status: "idle" | "saving" | "success" | "error"
  savingText?: string
  savingSubtext?: string
  successText?: string
  successSubtext?: string
  errorText?: string
  errorSubtext?: string
}

export default function SaveStatusOverlay({
  status,
  savingText = "กำลังบันทึกข้อมูล...",
  savingSubtext = "กรุณารอสักครู่ ระบบกำลังบันทึกข้อมูล",
  successText = "บันทึกข้อมูลสำเร็จ!",
  successSubtext = "ระบบบันทึกข้อมูลเรียบร้อยแล้ว",
  errorText = "บันทึกไม่สำเร็จ",
  errorSubtext = "เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง",
}: Props) {
  if (status === "idle") return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/15 backdrop-blur-xs font-sans animate-in fade-in duration-200">
      <div className="bg-white px-8 py-6 rounded-2xl shadow-2xl border border-slate-100 flex flex-col items-center gap-4 max-w-xs w-full text-center animate-in zoom-in-95 duration-150">
        {status === "saving" && (
          <>
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            <div>
              <div className="text-xs font-bold text-slate-800">{savingText}</div>
              <div className="text-[10px] text-slate-400 mt-1 leading-normal">{savingSubtext}</div>
            </div>
          </>
        )}
        {status === "success" && (
          <>
            <div className="w-11 h-11 bg-emerald-50 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle2 className="size-6 text-emerald-600" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">{successText}</div>
              <div className="text-[10px] text-slate-400 mt-1.5 leading-normal">{successSubtext}</div>
            </div>
          </>
        )}
        {status === "error" && (
          <>
            <div className="w-11 h-11 bg-rose-50 rounded-full flex items-center justify-center">
              <AlertCircle className="size-6 text-rose-600" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">{errorText}</div>
              <div className="text-[10px] text-slate-400 mt-1 leading-normal">{errorSubtext}</div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

import { X, CheckCircle, Save } from "lucide-react"

interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isSubmitting?: boolean
}

export default function SaveConfirmDialog({ isOpen, onClose, onConfirm, isSubmitting = false }: Props) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-sans animate-in fade-in duration-100">
      <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-xl flex flex-col animate-in zoom-in-95 duration-100">
        {/* Header */}
        <div className="bg-primary text-white flex justify-between items-center px-5 py-3.5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Save className="size-4.5 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm leading-snug">ยืนยันการบันทึก</div>
              <div className="text-[10px] opacity-80 mt-0.5">
                ตรวจสอบความถูกต้องก่อนยืนยัน
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            disabled={isSubmitting}
            className="text-white/80 hover:text-white transition-opacity disabled:opacity-50 cursor-pointer"
          >
            <X className="size-4.5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center">
            <CheckCircle className="size-8 text-emerald-600" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-800">
              คุณแน่ใจหรือไม่ว่าต้องการบันทึกข้อมูลการทดสอบนี้?
            </div>
            <div className="text-xs text-slate-400 mt-1.5">
              กรุณาตรวจสอบความถูกต้องของข้อมูลก่อนกดยืนยัน
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-4 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onClose}
            type="button"
            disabled={isSubmitting}
            className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors text-xs font-semibold disabled:opacity-50 cursor-pointer"
          >
            ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            type="button"
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/95 text-white rounded-lg transition-colors text-xs font-bold disabled:opacity-50 cursor-pointer min-w-[120px] justify-center"
          >
            {isSubmitting ? (
              <>
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                กำลังบันทึก...
              </>
            ) : (
              "ยืนยันการบันทึก"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

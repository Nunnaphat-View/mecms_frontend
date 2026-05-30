import { X, AlertTriangle } from "lucide-react"

interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function DeleteConfirmDialog({ isOpen, onClose, onConfirm }: Props) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-sans animate-in fade-in duration-100">
      <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-xl flex flex-col animate-in zoom-in-95 duration-100 border border-slate-200">
        {/* Header */}
        <div className="bg-red-600 text-white flex justify-between items-center px-5 py-3.5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <AlertTriangle className="size-4.5 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm leading-snug">ยืนยันการลบ</div>
              <div className="text-[10px] opacity-80 mt-0.5">
                การดำเนินการนี้ไม่สามารถย้อนกลับได้
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-white/80 hover:text-white transition-opacity cursor-pointer"
          >
            <X className="size-4.5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center">
            <AlertTriangle className="size-8 text-red-600" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-800">
              คุณแน่ใจหรือไม่ว่าต้องการลบแถวนี้?
            </div>
            <div className="text-xs text-slate-400 mt-1.5">
              ข้อมูลที่ลบไปแล้วไม่สามารถกู้คืนได้
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-4 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors text-xs font-semibold cursor-pointer"
          >
            ยกเลิก
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            type="button"
            className="flex items-center gap-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-xs font-bold cursor-pointer"
          >
            ยืนยันการลบ
          </button>
        </div>
      </div>
    </div>
  )
}

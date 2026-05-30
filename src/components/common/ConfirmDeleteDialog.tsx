import { Trash2, AlertTriangle, X } from "lucide-react"

interface ConfirmDeleteDialogProps {
  isOpen: boolean
  title?: string
  message?: string
  itemName?: string
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDeleteDialog({
  isOpen,
  title = "ยืนยันการลบ",
  message = "คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้?",
  itemName = "",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDeleteDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-sans">
      <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-rose-600 text-white flex justify-between items-center px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
              <Trash2 className="size-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm leading-snug">{title}</div>
              <div className="text-[11px] opacity-80 mt-0.5">การดำเนินการนี้ไม่สามารถย้อนกลับได้</div>
            </div>
          </div>
          <button
            onClick={onCancel}
            disabled={loading}
            className="text-white/80 hover:text-white transition-opacity disabled:opacity-50 cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center mb-4">
            <AlertTriangle className="size-9 text-rose-600" />
          </div>
          <div className="text-slate-700 text-sm leading-relaxed mb-3">{message}</div>
          {itemName && (
            <div className="inline-block px-3 py-1 bg-rose-50 border border-rose-200 text-rose-600 rounded-md text-xs font-bold font-mono">
              &quot;{itemName}&quot;
            </div>
          )}
        </div>

        {/* Separator */}
        <hr className="border-slate-100" />

        {/* Footer */}
        <div className="flex justify-end items-center gap-2.5 px-5 py-4 bg-slate-50">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-5 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors text-xs font-medium disabled:opacity-50 cursor-pointer"
          >
            ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-1.5 px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors text-xs font-bold disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <Trash2 className="size-3.5" />
            )}
            ยืนยันการลบ
          </button>
        </div>
      </div>
    </div>
  )
}

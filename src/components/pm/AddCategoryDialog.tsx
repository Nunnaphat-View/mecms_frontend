import { useState, useRef, useEffect } from "react"
import { Tag, X, Save, LayoutList } from "lucide-react"

interface Props {
  isOpen: boolean
  defaultOrder?: number
  loading?: boolean
  onSave: (payload: { name: string; display_order: number }) => void
  onClose: () => void
}

// Inner form — remounted via key each time dialog opens, so state always resets
function AddCategoryForm({
  defaultOrder,
  loading,
  onSave,
  onClose,
}: Omit<Props, "isOpen">) {
  const [name, setName] = useState("")
  const [displayOrder, setDisplayOrder] = useState(defaultOrder ?? 1)
  const [nameError, setNameError] = useState("")
  const nameRef = useRef<HTMLInputElement>(null)

  // Focus input on mount (safe — no setState in effect)
  useEffect(() => {
    const t = setTimeout(() => nameRef.current?.focus(), 80)
    return () => clearTimeout(t)
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setNameError("กรุณากรอกชื่อหมวดหมู่")
      return
    }
    onSave({ name: name.trim(), display_order: displayOrder })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="p-6 flex flex-col gap-4">
        {/* Category Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            ชื่อหมวดหมู่ <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              ref={nameRef}
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (e.target.value.trim()) setNameError("")
              }}
              disabled={loading}
              placeholder="เช่น ระบบไฟฟ้า, สภาพทั่วไป"
              className={`w-full pl-9 pr-3 h-10 border rounded-xl text-sm focus:outline-none focus:ring-1 transition-all disabled:opacity-60 ${
                nameError
                  ? "border-rose-400 focus:border-rose-400 focus:ring-rose-400"
                  : "border-slate-300 focus:border-primary focus:ring-primary"
              }`}
            />
          </div>
          {nameError && <p className="text-xs text-rose-500 mt-1">{nameError}</p>}
        </div>

        {/* Display Order */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            ลำดับการแสดงผล <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            min={0}
            value={displayOrder}
            onChange={(e) => setDisplayOrder(Number(e.target.value))}
            disabled={loading}
            className="w-full px-3 h-10 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all disabled:opacity-60"
          />
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* Footer */}
      <div className="flex justify-end items-center gap-2.5 px-5 py-4 bg-slate-50">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="px-5 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors text-xs font-medium disabled:opacity-50 cursor-pointer"
        >
          ยกเลิก
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-1.5 px-5 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors text-xs font-bold disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="size-3.5" />
          )}
          บันทึก
        </button>
      </div>
    </form>
  )
}

export default function AddCategoryDialog({
  isOpen,
  defaultOrder = 1,
  loading = false,
  onSave,
  onClose,
}: Props) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-sans">
      <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-xl border border-slate-200">
        {/* Header */}
        <div className="bg-primary text-white flex justify-between items-center px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
              <LayoutList className="size-4 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm leading-snug">เพิ่มหมวดหมู่ PM Checklist ใหม่</div>
              <div className="text-[11px] opacity-80 mt-0.5">ระบุชื่อและลำดับการจัดเรียงหมวดหมู่</div>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-white/80 hover:text-white transition-opacity disabled:opacity-50 cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form — key forces remount on each open, resetting all state */}
        <AddCategoryForm
          key={String(isOpen)}
          defaultOrder={defaultOrder}
          loading={loading}
          onSave={onSave}
          onClose={onClose}
        />
      </div>
    </div>
  )
}

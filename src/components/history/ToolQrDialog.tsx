import { X, QrCode, Tag, Bookmark, Calendar, Printer } from "lucide-react"

interface ToolQrDialogProps {
  isOpen: boolean
  onClose: () => void
  tool: {
    id: number
    taskId: number
    deviceName: string
    deviceCode: string
    date: string
  } | null
}

export default function ToolQrDialog({ isOpen, onClose, tool }: ToolQrDialogProps) {
  if (!isOpen || !tool) return null

  const qrUrl = `${window.location.origin}/status/${tool.id}`
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`

  function handlePrint() {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-sans overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      <div className="bg-white w-full max-w-[360px] rounded-2xl overflow-hidden shadow-xl flex flex-col animate-in fade-in zoom-in-95 duration-150 print:shadow-none print:w-full print:max-w-none print:rounded-none">
        
        {/* Header */}
        <div className="bg-primary text-white flex justify-between items-center px-5 py-3.5 flex-shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
              <QrCode className="size-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm leading-snug">QR Code ประจำเครื่องมือ</div>
              <div className="text-[10px] opacity-80 mt-0.5">สแกนหรือพิมพ์เพื่อใช้งาน</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-opacity cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* QR Code Area */}
        <div className="p-6 flex flex-col items-center justify-center print:py-10">
          <div className="relative p-5">
            {/* QR bracket layout */}
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-center justify-center">
              <img
                src={qrImageUrl}
                alt="QR Code"
                className="w-[140px] h-[140px] mix-blend-multiply"
              />
            </div>
            {/* Corner brackets */}
            <div className="absolute top-0 left-0 w-[22px] h-[22px] border-t-2 border-l-2 border-primary rounded-tl-lg pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-[22px] h-[22px] border-t-2 border-r-2 border-primary rounded-tr-lg pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[22px] h-[22px] border-b-2 border-l-2 border-primary rounded-bl-lg pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-[22px] h-[22px] border-b-2 border-r-2 border-primary rounded-br-lg pointer-events-none"></div>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Info Table */}
        <div className="bg-slate-50 text-xs text-slate-700 divide-y divide-slate-100 flex-shrink-0">
          <div className="flex justify-between items-center px-5 py-2.5 min-h-[44px]">
            <div className="flex items-center gap-1.5 text-slate-500 font-medium">
              <Tag className="size-3.5" />
              รหัสเครื่องมือ
            </div>
            <div className="font-semibold text-slate-900">{tool.deviceCode}</div>
          </div>
          <div className="flex justify-between items-center px-5 py-2.5 min-h-[44px]">
            <div className="flex items-center gap-1.5 text-slate-500 font-medium">
              <Bookmark className="size-3.5" />
              ชื่อเครื่องมือ
            </div>
            <div className="font-semibold text-slate-900 text-right max-w-[180px] truncate">
              {tool.deviceName}
            </div>
          </div>
          <div className="flex justify-between items-center px-5 py-2.5 min-h-[44px]">
            <div className="flex items-center gap-1.5 text-slate-500 font-medium">
              <Calendar className="size-3.5" />
              วันที่สอบเทียบ
            </div>
            <div className="font-semibold text-slate-900">{tool.date}</div>
          </div>
        </div>

        {/* Footer Actions */}
        <hr className="border-slate-100 flex-shrink-0 print:hidden" />
        <div className="flex flex-col gap-2 p-5 flex-shrink-0 print:hidden bg-white">
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 w-full h-[42px] bg-primary hover:bg-[#07536a] text-white rounded-lg font-semibold text-sm transition-colors cursor-pointer"
          >
            <Printer className="size-4.5" />
            พิมพ์ QR Code
          </button>
          <button
            onClick={onClose}
            className="w-full h-[38px] border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  )
}

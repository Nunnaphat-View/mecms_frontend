import { X, Cpu } from "lucide-react"

interface ConfigStandardToolCardProps {
  name: string
  onRemove: () => void
}

export default function ConfigStandardToolCard({ name, onRemove }: ConfigStandardToolCardProps) {
  return (
    <div className="relative bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col items-center justify-center min-h-[200px] min-w-[220px] h-full animate-in fade-in zoom-in-95 duration-150">
      {/* X button top-right */}
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
      >
        <X className="size-4" />
      </button>

      {/* Icon + tool name centered */}
      <div className="flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
          <Cpu className="size-12 text-secondary" />
        </div>
        <div className="font-bold text-sm text-slate-800 leading-snug">
          {name}
        </div>
        <div className="text-[11px] text-slate-500 mt-1">
          Standard Tool Type
        </div>
      </div>
    </div>
  )
}

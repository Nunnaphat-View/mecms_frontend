import React from "react"
import type { WardTool } from "@/features/ward/stores/wardsStore"

interface WardToolCardProps {
  tool: WardTool
}

export const WardToolCard: React.FC<WardToolCardProps> = ({ tool }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 transition-all duration-200 hover:shadow-sm hover:border-slate-300">
      <div className="flex justify-between items-start">
        <span className="text-xs font-semibold text-slate-800">{tool.tool_name}</span>
        <span className={`text-[11px] font-bold ${tool.isDanger ? "text-red-600" : "text-primary"}`}>
          {tool.statusLabel}
        </span>
      </div>

      <div className="flex justify-between items-end mt-3 text-[11px] text-slate-500">
        <span className="font-mono text-[10px] text-slate-400">{tool.id}</span>
        <span>
          ครบกำหนด : <span className="font-semibold text-slate-700">{tool.dueDate}</span>
        </span>
      </div>
    </div>
  )
}

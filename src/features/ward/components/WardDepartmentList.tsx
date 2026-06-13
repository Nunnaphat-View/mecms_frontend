import React, { useState } from "react"
import { Search, MapPin } from "lucide-react"
import { useWardsStore } from "@/features/ward/stores/wardsStore"

export const WardDepartmentList: React.FC = () => {
  const { selectedWardId, selectWard, getWards } = useWardsStore()
  const [searchQuery, setSearchQuery] = useState("")

  const wards = getWards()
  
  const filteredWards = wards.filter(
    (w) =>
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-4">
      {/* Search Box */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="size-4 text-slate-400" />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ค้นหาแผนก..."
          className="w-full bg-white border border-slate-200 rounded-lg py-2 pl-9 pr-4 text-sm placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Ward List */}
      <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
        {filteredWards.map((ward) => {
          const isActive = selectedWardId === ward.id
          return (
            <div
              key={ward.id}
              onClick={() => selectWard(ward.id)}
              className={`flex items-center justify-between border rounded-xl p-3.5 cursor-pointer transition-all duration-200 select-none min-h-[70px] ${
                isActive
                  ? "bg-primary border-primary text-white shadow-md shadow-primary/20"
                  : "bg-white border-slate-200 text-slate-800 hover:border-primary hover:bg-slate-50/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <MapPin className={`size-5 shrink-0 ${isActive ? "text-white" : "text-slate-500"}`} />
                <div className="flex flex-col">
                  <span className={`text-sm font-bold ${isActive ? "text-white" : "text-slate-800"}`}>
                    {ward.name}
                  </span>
                  <span className={`text-xs ${isActive ? "text-white/80" : "text-slate-500"}`}>
                    {ward.description}
                  </span>
                </div>
              </div>

              <div className={`text-xs font-semibold shrink-0 ${isActive ? "text-white" : "text-slate-600"}`}>
                {ward.toolCount} เครื่องมือ
              </div>
            </div>
          )
        })}
        {filteredWards.length === 0 && (
          <div className="text-center py-8 text-xs font-semibold text-slate-400">
            ไม่พบแผนกที่ค้นหา
          </div>
        )}
      </div>
    </div>
  )
}

import React from "react"
import { useWardsStore } from "@/stores/wardsStore"

export const WardTimeline: React.FC = () => {
  const { getTimelineEvents } = useWardsStore()
  const events = getTimelineEvents()

  return (
    <div className="flex flex-col">
      <span className="text-sm font-semibold text-slate-800 mb-4 block">Timeline</span>

      {events.length > 0 ? (
        <div className="relative pl-[20px] flex flex-col mt-2 select-none">
          {/* Vertical Connecting Line */}
          <div className="absolute top-4 bottom-4 left-[20px] w-[2px] bg-secondary/50 pointer-events-none" />

          {events.map((event) => (
            <div key={event.id} className="relative flex items-center mb-4 min-h-[48px]">
              {/* Bubble */}
              <div className="absolute left-[-20px] w-10 h-10 rounded-full bg-secondary text-white border-2 border-white flex items-center justify-center font-bold text-sm z-10 shadow-sm">
                {event.date}
              </div>

              {/* Event Content */}
              <div className="flex-1 ml-8">
                <div className="bg-white border border-slate-200 rounded-lg px-4 py-2 flex flex-col justify-center min-h-[52px]">
                  <span className="text-sm font-semibold text-slate-800">
                    {event.toolName}
                  </span>
                  <span className="text-xs text-slate-400 font-mono mt-0.5">
                    {event.toolCode}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-xs font-semibold text-slate-400">
          ไม่มีข้อมูลไทม์ไลน์
        </div>
      )}
    </div>
  )
}

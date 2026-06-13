import  { useEffect } from "react"
import { MapPin, RefreshCw, AlertCircle } from "lucide-react"
import { useWardsStore } from "@/features/ward/stores/wardsStore"
import { WardDepartmentList } from "@/features/ward/components/WardDepartmentList"
import { WardScheduleCalendar } from "@/features/ward/components/WardScheduleCalendar"
import { WardTimeline } from "@/features/ward/components/WardTimeline"
import { WardToolCard } from "@/features/ward/components/WardToolCard"

export default function WardPage() {
  const { fetchWardsData, getSelectedWard, getTools, loading, wards } = useWardsStore()
  
  useEffect(() => {
    void fetchWardsData()
  }, [fetchWardsData])

  const selectedWard = getSelectedWard()
  const tools = getTools()

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Header Area */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <MapPin className="size-5.5 text-primary" />
          ติดตามเครื่องมือแพทย์ตามแผนก
        </h1>
        <p className="text-slate-500 text-xs mt-0.5">
          ตรวจสอบตำแหน่งและกำหนดการสอบเทียบเครื่องมือแพทย์แยกตามแผนก
        </p>
      </div>

      {loading && wards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 gap-3 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <RefreshCw className="size-8 text-primary animate-spin" />
          <span className="text-xs text-slate-500 font-bold">กำลังโหลดข้อมูลแผนกและเครื่องมือ...</span>
        </div>
      ) : wards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 gap-3 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <AlertCircle className="size-8 text-slate-300" />
          <span className="text-xs text-slate-500 font-bold">ไม่พบข้อมูลแผนก</span>
        </div>
      ) : (
        /* Main Grid Layout */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start animate-in fade-in duration-200">
          {/* Left Column (Wards, Calendar, Timeline) */}
          <div className="flex flex-col gap-6">
            {/* Wards List Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <span className="text-sm font-semibold text-slate-800 mb-4 block">แผนก</span>
              <WardDepartmentList />
            </div>

            {/* Calendar & Timeline Group */}
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="flex-[3] w-full">
                <WardScheduleCalendar />
              </div>
              <div className="flex-[2] w-full bg-white border border-slate-200 rounded-xl p-4 shadow-xs self-stretch overflow-y-auto max-h-[380px] custom-scrollbar">
                <WardTimeline />
              </div>
            </div>
          </div>

          {/* Right Column (Selected Ward Tools) */}
          <div className="flex flex-col gap-3 lg:sticky lg:top-6 w-full">
            {/* Selected Ward Title and loading indicator */}
            <div className="flex justify-between items-center px-2 select-none">
              {loading && <RefreshCw className="size-4 text-primary animate-spin" />}
              <div className="text-sm font-bold text-slate-700 ml-auto">
                {selectedWard ? selectedWard.name : "กำลังโหลด..."}
              </div>
            </div>

            {/* Scrollable Tools List */}
            <div className="flex flex-col gap-3 overflow-y-auto max-h-[500px] lg:max-h-[calc(100vh-230px)] pr-1 custom-scrollbar">
              {tools.length > 0 ? (
                tools.map((tool) => (
                  <WardToolCard key={tool.id} tool={tool} />
                ))
              ) : (
                <div className="text-center py-10 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-400">
                  ไม่มีเครื่องมือในแผนกนี้
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

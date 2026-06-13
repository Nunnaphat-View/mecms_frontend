import { useNavigate } from "react-router-dom"
import type { CalibrationRecord } from "../../stores/calibrationStore"

interface CalibrationCardProps {
  record: CalibrationRecord
  isOwner: boolean
}

export default function CalibrationCard({ record, isOwner }: CalibrationCardProps) {
  const navigate = useNavigate()

  function goToInspection() {
    const id = record.taskId ?? record.id
    navigate(`/calibration/inspection/${id}`)
  }

  const buttonLabel =
    record.status === "ReCalibrate"
      ? "สอบเทียบใหม่"
      : record.status === "InProgress"
      ? "ดำเนินการต่อ"
      : "เริ่มการสอบเทียบ"

  return (
    <div
      onClick={goToInspection}
      className="bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col gap-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer active:translate-y-0"
    >
      {/* Card Header */}
      <div className="flex justify-between items-start gap-2">
        <div>
          <div className="font-bold text-sm text-slate-800 line-clamp-1">{record.tool_name}</div>
          <div className="text-xs text-slate-400 mt-0.5">{record.deviceCode}</div>
        </div>
        <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg whitespace-nowrap">
          {record.location}
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-col gap-2 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-slate-400">ประเภท:</span>
          <span className="font-medium text-slate-700">{record.type}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400">ครบกำหนด:</span>
          <span className="font-medium text-slate-700">{record.dueDate}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400">ผู้รับผิดชอบ:</span>
          <span className="font-medium text-slate-700">{record.responsible}</span>
        </div>
      </div>

      {/* Action Button */}
      <button
        type="button"
        disabled={!isOwner}
        onClick={(e) => {
          e.stopPropagation()
          goToInspection()
        }}
        className={`w-full py-2.5 rounded-full text-xs font-semibold transition-colors cursor-pointer select-none ${
          isOwner
            ? "bg-secondary text-white hover:bg-secondary/90 shadow-sm"
            : "bg-slate-200 text-slate-400 cursor-not-allowed"
        }`}
      >
        {buttonLabel}
      </button>
    </div>
  )
}

export function CalibrationCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col gap-4 animate-pulse">
      {/* Card Header Skeleton */}
      <div className="flex justify-between items-start gap-2">
        <div className="flex-grow">
          <div className="h-4 bg-slate-200 rounded-md w-3/4"></div>
          <div className="h-3 bg-slate-200 rounded-md w-1/2 mt-2"></div>
        </div>
        <div className="w-16 h-5 bg-slate-200 rounded-lg"></div>
      </div>

      {/* Card Body Skeleton */}
      <div className="flex flex-col gap-2.5">
        <div className="flex justify-between items-center">
          <div className="w-12 h-3 bg-slate-100 rounded-md"></div>
          <div className="w-20 h-3 bg-slate-200 rounded-md"></div>
        </div>
        <div className="flex justify-between items-center">
          <div className="w-16 h-3 bg-slate-100 rounded-md"></div>
          <div className="w-24 h-3 bg-slate-200 rounded-md"></div>
        </div>
        <div className="flex justify-between items-center">
          <div className="w-16 h-3 bg-slate-100 rounded-md"></div>
          <div className="w-20 h-3 bg-slate-200 rounded-md"></div>
        </div>
      </div>

      {/* Action Button Skeleton */}
      <div className="w-full h-9 bg-slate-200 rounded-full mt-1"></div>
    </div>
  )
}

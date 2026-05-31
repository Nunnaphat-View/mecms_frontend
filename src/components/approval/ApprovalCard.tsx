import { useNavigate } from "react-router-dom"
import { CheckCircle2, XCircle, HelpCircle } from "lucide-react"
import type { ApprovalEvent } from "@/stores/approvalStore"

interface Props {
  item: ApprovalEvent
}

export default function ApprovalCard({ item }: Props) {
  const navigate = useNavigate()

  function goToDetail() {
    navigate(`/approval/${item.id}`)
  }

  const isPass = item.result === "ผ่าน"
  const isFail = item.result === "ไม่ผ่าน"

  return (
    <div
      onClick={goToDetail}
      className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col gap-4 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 cursor-pointer h-full"
    >
      {/* Card Header */}
      <div className="flex justify-between items-start gap-3">
        <div>
          <div className="font-bold text-slate-800 text-sm tracking-tight">{item.toolName}</div>
          <div className="text-[11px] text-slate-400 mt-0.5 font-medium">{item.toolCode}</div>
        </div>
        <div className="text-xs font-semibold text-slate-500 px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg whitespace-nowrap">
          {item.location}
        </div>
      </div>

      {/* Card Body */}
      <div className="flex-1 flex flex-col gap-2.5 text-xs text-slate-600">
        <div className="flex justify-between">
          <span className="text-slate-400 font-medium">รหัสการสอบเทียบ:</span>
          <span className="font-semibold text-slate-700">{item.id}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400 font-medium">วันที่สอบเทียบ:</span>
          <span className="font-semibold text-slate-700">{item.calDate}</span>
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-slate-400 font-medium">ผลการสอบเทียบ:</span>
          <div className="flex items-center gap-1">
            {isPass ? (
              <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-500">
                <CheckCircle2 className="size-4" />
                {item.result}
              </span>
            ) : isFail ? (
              <span className="inline-flex items-center gap-1.5 font-semibold text-rose-500">
                <XCircle className="size-4" />
                {item.result}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 font-semibold text-slate-400">
                <HelpCircle className="size-4" />
                {item.result}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          goToDetail()
        }}
        className="w-full h-10 bg-secondary hover:bg-secondary/95 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center select-none"
      >
        รับรองการสอบเทียบ
      </button>
    </div>
  )
}

import type { InspectionValue } from "../../stores/inspectionStore"

interface Props {
  result: InspectionValue
  pmBy: string
  position: string
}

export default function PmResultCard({ result, pmBy, position }: Props) {
  const badgeClass = {
    ผ่าน: "bg-emerald-400 text-black",
    ไม่ผ่าน: "bg-red-400 text-black",
    "N/A": "bg-slate-300 text-black",
  }[result]

  return (
    <div className="border border-slate-200 rounded-xl p-4 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xl font-bold text-slate-900">PM Result</span>
        <span className={`text-sm font-bold px-8 py-2 rounded-md ${badgeClass}`}>
          {result}
        </span>
      </div>

      <hr className="my-3 border-slate-200" />

      {/* Info */}
      <div className="flex flex-col gap-2.5">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500 font-medium">PM By</span>
          <span className="font-semibold text-slate-900">{pmBy || "-"}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500 font-medium">ตำแหน่ง</span>
          <span className="font-semibold text-slate-900">{position || "-"}</span>
        </div>
      </div>
    </div>
  )
}

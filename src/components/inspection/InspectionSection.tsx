import type { InspectionItem, InspectionValue } from "../../stores/inspectionStore"

interface Props {
  title: string
  items: InspectionItem[]
  remarks: string
  onUpdate: (index: number, value: InspectionValue) => void
  onUpdateRemarks: (value: string) => void
}

export default function InspectionSection({ title, items, remarks, onUpdate, onUpdateRemarks }: Props) {
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      {/* Section Header */}
      <div className="bg-amber-500 px-4 py-2.5">
        <span className="font-bold text-base text-white">{title}</span>
      </div>

      <div className="p-4 pt-3">
        {/* Inspection Items */}
        <div className="flex flex-col">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-2 py-1.5 border-b border-slate-100 last:border-b-0"
            >
              <span className="text-sm text-slate-700 flex-1 min-w-0">{item.label}</span>
              <div className="flex gap-2 flex-shrink-0">
                <InspBtn
                  label="ผ่าน"
                  active={item.value === "ผ่าน"}
                  variant="pass"
                  onClick={() => onUpdate(idx, "ผ่าน")}
                />
                <InspBtn
                  label="ไม่ผ่าน"
                  active={item.value === "ไม่ผ่าน"}
                  variant="fail"
                  onClick={() => onUpdate(idx, "ไม่ผ่าน")}
                />
                <InspBtn
                  label="N/A"
                  active={item.value === "N/A"}
                  variant="na"
                  onClick={() => onUpdate(idx, "N/A")}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Remarks */}
        <div className="mt-4">
          <div className="text-sm font-semibold text-slate-600 mb-1.5">หมายเหตุ</div>
          <textarea
            value={remarks}
            onChange={(e) => onUpdateRemarks(e.target.value)}
            rows={3}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 resize-none focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
          />
        </div>
      </div>
    </div>
  )
}

interface InspBtnProps {
  label: string
  active: boolean
  variant: "pass" | "fail" | "na"
  onClick: () => void
}

function InspBtn({ label, active, variant, onClick }: InspBtnProps) {
  const baseClass =
    "text-xs font-semibold min-w-[58px] min-h-[28px] px-2 py-1 rounded-lg border transition-all cursor-pointer"

  const activeClass = {
    pass: "bg-emerald-400 border-emerald-400 text-black",
    fail: "bg-red-500 border-red-500 text-black",
    na: "bg-slate-400 border-slate-400 text-black",
  }[variant]

  const inactiveClass = "bg-slate-100 border-slate-300 text-slate-500 hover:bg-slate-200"

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseClass} ${active ? activeClass : inactiveClass}`}
    >
      {label}
    </button>
  )
}

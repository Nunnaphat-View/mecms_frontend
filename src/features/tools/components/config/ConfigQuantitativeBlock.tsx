import { X, Trash2, Plus } from "lucide-react"

interface TestValue {
  label: string
  value: number
}

export interface QuantData {
  parameter: string
  unit: string
  tolerance: string
  stdType: string
  display: string
  uncertainty: string
  testValues: TestValue[]
}

interface ConfigQuantitativeBlockProps {
  index: number
  data: QuantData
  onChangeData: (val: QuantData) => void
  onRemove: () => void
}

const stdTypeOptions = [
  "1 - แบบอ้างอิงเครื่องมาตรฐาน (1 STD : 3 UUC)",
  "2 - แบบอ้างอิงเครื่องถูกสอบ (1 UUC : 3 STD)",
  "3 - แบบจับคู่วัดหลายตำแหน่ง (Multi-Point)",
  "4 - แบบจับคู่วัดสามตำแหน่ง (3 UUC : 3 STD)",
  "5 - แบบอ้างอิงเครื่องมาตรฐาน (1 STD : 3 UUT)",
  "6 - แบบวัดครั้งเดียว (1 STD : 1 UUC)",
  "1 - แบบอ้างอิงเครื่องมือมาตรฐาน", // Legacy support
]

const displayOptions = ["Digital", "Analog"]

export default function ConfigQuantitativeBlock({
  index,
  data,
  onChangeData,
  onRemove,
}: ConfigQuantitativeBlockProps) {

  const updateField = (patch: Partial<QuantData>) => {
    onChangeData({ ...data, ...patch })
  }

  const reindexLabels = (items: TestValue[]) => {
    return items.map((item, i) => ({ ...item, label: `ค่าทดสอบที่ ${i + 1}` }))
  }

  const addTestValue = () => {
    const newItems = [...data.testValues, { label: "", value: 0 }]
    updateField({ testValues: reindexLabels(newItems) })
  }

  const removeTestValue = (idx: number) => {
    const newItems = data.testValues.filter((_, i) => i !== idx)
    updateField({ testValues: reindexLabels(newItems) })
  }

  const updateTestValue = (idx: number, value: number) => {
    const newItems = data.testValues.map((item, i) =>
      i === idx ? { ...item, value } : item
    )
    updateField({ testValues: newItems })
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 mb-4 shadow-xs animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="w-8 h-8 rounded-full bg-secondary text-white font-bold flex items-center justify-center text-sm shrink-0">
          {index}
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors cursor-pointer shrink-0"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        {/* Left: Parameter Info Form */}
        <div className="col-span-12 md:col-span-7 space-y-3">
          <div className="flex items-center gap-4 py-0.5">
            <span className="text-slate-700 text-[13.5px] font-medium w-5/12 shrink-0">พารามิเตอร์</span>
            <input
              type="text"
              value={data.parameter}
              onChange={(e) => updateField({ parameter: e.target.value })}
              className="w-7/12 h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-secondary focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-4 py-0.5">
            <span className="text-slate-700 text-[13.5px] font-medium w-5/12 shrink-0">หน่วย</span>
            <input
              type="text"
              value={data.unit}
              onChange={(e) => updateField({ unit: e.target.value })}
              className="w-7/12 h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-secondary focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-4 py-0.5">
            <span className="text-slate-700 text-[13.5px] font-medium w-5/12 shrink-0">ค่าความคลาดเคลื่อน</span>
            <input
              type="text"
              value={data.tolerance}
              onChange={(e) => updateField({ tolerance: e.target.value })}
              className="w-7/12 h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-secondary focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-4 py-0.5">
            <span className="text-slate-700 text-[13.5px] font-medium w-5/12 shrink-0">แบบฟอร์ม</span>
            <select
              value={data.stdType}
              onChange={(e) => updateField({ stdType: e.target.value })}
              className="w-7/12 h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-secondary focus:bg-white transition-all outline-none"
            >
              {stdTypeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4 py-0.5">
            <span className="text-slate-700 text-[13.5px] font-medium w-5/12 shrink-0">การแสดงผล (A/D)</span>
            <select
              value={data.display}
              onChange={(e) => updateField({ display: e.target.value })}
              className="w-7/12 h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-secondary focus:bg-white transition-all outline-none"
            >
              <option value="">เลือกการแสดงผล</option>
              {displayOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4 py-0.5">
            <span className="text-slate-700 text-[13.5px] font-medium w-5/12 shrink-0">ค่าความละเอียด (R)</span>
            <input
              type="text"
              value={data.uncertainty}
              onChange={(e) => updateField({ uncertainty: e.target.value })}
              className="w-7/12 h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-secondary focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Right: Test Values List */}
        <div className="col-span-12 md:col-span-5 border border-slate-200 rounded-xl overflow-hidden flex flex-col min-h-full">
          <div className="h-12 bg-slate-50 border-b border-slate-100 flex items-center justify-center text-sm font-bold text-secondary">
            ค่าทดสอบ
          </div>
          <div className="flex-grow p-3 space-y-2 max-h-[300px] overflow-y-auto">
            {data.testValues.map((val, idx) => (
              <div key={idx} className="flex items-center justify-between gap-2 border-b border-slate-50 pb-2 last:border-none last:pb-0 animate-in fade-in duration-100">
                <div className="flex items-center gap-2 flex-grow">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ffd600] shadow-[0_0_4px_rgba(255,214,0,0.6)] shrink-0"></div>
                  <span className="text-[13px] text-slate-600 font-medium shrink-0">ค่าทดสอบที่ {idx + 1}</span>
                </div>
                <div className="flex items-center gap-1.5 justify-end">
                  <input
                    type="number"
                    value={val.value}
                    onChange={(e) => updateTestValue(idx, Number(e.target.value))}
                    className="w-20 h-8 px-2 bg-slate-50 border border-slate-200 rounded-md text-[13px] text-right font-bold text-slate-700 focus:outline-none focus:border-secondary focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => removeTestValue(idx)}
                    className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors cursor-pointer"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex justify-center">
            <button
              type="button"
              onClick={addTestValue}
              className="flex items-center gap-1 text-[13px] font-bold text-secondary hover:text-secondary/80 transition-colors cursor-pointer"
            >
              <Plus className="size-4" /> เพิ่มค่าทดสอบ
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

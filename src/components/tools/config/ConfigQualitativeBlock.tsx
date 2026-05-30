import { X, PlusCircle } from "lucide-react"

interface TestItem {
  name: string
  result: "pass" | "fail" | null
}

interface ConfigQualitativeBlockProps {
  index: number
  parameterName: string
  testItems: TestItem[]
  onChangeParameterName: (val: string) => void
  onChangeTestItems: (val: TestItem[]) => void
  onRemove: () => void
}

export default function ConfigQualitativeBlock({
  index,
  parameterName,
  testItems,
  onChangeParameterName,
  onChangeTestItems,
  onRemove,
}: ConfigQualitativeBlockProps) {

  const addTestItem = () => {
    onChangeTestItems([...testItems, { name: "", result: null }])
  }

  const removeTestItem = (idx: number) => {
    onChangeTestItems(testItems.filter((_, i) => i !== idx))
  }

  const updateItemName = (idx: number, name: string) => {
    onChangeTestItems(
      testItems.map((item, i) => (i === idx ? { ...item, name } : item))
    )
  }

  const toggleResult = (idx: number, result: "pass" | "fail") => {
    onChangeTestItems(
      testItems.map((item, i) => (i === idx ? { ...item, result: item.result === result ? null : result } : item))
    )
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 mb-4 shadow-xs animate-in fade-in duration-200">
      {/* Parameter header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 flex-grow">
          <div className="w-8 h-8 rounded-full bg-secondary text-white font-bold flex items-center justify-center text-sm shrink-0">
            {index}
          </div>
          <div className="flex-grow max-w-sm space-y-1">
            <label className="text-xs font-bold text-slate-500">ชื่อพารามิเตอร์</label>
            <input
              type="text"
              value={parameterName}
              onChange={(e) => onChangeParameterName(e.target.value)}
              className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:border-secondary focus:bg-white transition-all"
              placeholder="ระบุพารามิเตอร์..."
            />
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors cursor-pointer shrink-0"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Test Items Section */}
      <div className="pl-11 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-slate-500">รายการทดสอบ</span>
          <button
            type="button"
            onClick={addTestItem}
            className="flex items-center gap-1 text-xs font-bold text-secondary hover:text-secondary/80 transition-colors cursor-pointer"
          >
            <PlusCircle className="size-4" /> เพิ่มรายการทดสอบ
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {testItems.map((item, idx) => (
            <div key={idx} className="relative bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col group animate-in fade-in zoom-in-95 duration-150">
              {/* Delete button */}
              <button
                type="button"
                onClick={() => removeTestItem(idx)}
                className="absolute top-2 right-2 p-1 text-slate-300 hover:text-rose-500 rounded transition-colors cursor-pointer z-10 opacity-0 group-hover:opacity-100"
              >
                <X className="size-3.5" />
              </button>

              <div className="flex items-center gap-2 p-3">
                <div className="w-6 h-6 rounded bg-secondary text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                  {idx + 1}
                </div>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateItemName(idx, e.target.value)}
                  placeholder="ระบุรายการ..."
                  className="w-full text-[13px] font-semibold text-slate-700 bg-transparent focus:outline-none placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>

              {/* Pass/Fail buttons */}
              <div className="flex border-t border-dashed border-slate-200 mt-auto">
                <button
                  type="button"
                  onClick={() => toggleResult(idx, "pass")}
                  className={`flex-1 h-8 text-[13px] font-bold cursor-pointer transition-colors border-none ${
                    item.result === "pass"
                      ? "bg-emerald-50 text-emerald-600"
                      : "text-slate-400 hover:bg-slate-50"
                  }`}
                >
                  ผ่าน
                </button>
                <div className="w-px border-r border-dashed border-slate-200"></div>
                <button
                  type="button"
                  onClick={() => toggleResult(idx, "fail")}
                  className={`flex-1 h-8 text-[13px] font-bold cursor-pointer transition-colors border-none ${
                    item.result === "fail"
                      ? "bg-rose-50 text-rose-500"
                      : "text-slate-400 hover:bg-slate-50"
                  }`}
                >
                  ไม่ผ่าน
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

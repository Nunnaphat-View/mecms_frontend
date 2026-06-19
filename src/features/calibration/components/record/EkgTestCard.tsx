import { Heart, AlertTriangle, CheckCircle, XCircle } from "lucide-react"

export interface EkgItem {
  id: string
  label: string
  status: "pass" | "fail" | null
}

interface Props {
  ekgItems: EkgItem[]
  title?: string
  readonly?: boolean
  onItemStatusChange?: (itemId: string, status: "pass" | "fail") => void
}

export default function EkgTestCard({
  ekgItems,
  title = "EKG",
  readonly = false,
  onItemStatusChange,
}: Props) {
  return (
    <div className="mb-6 font-sans">
      {/* Title */}
      <div
        className="text-sm font-bold text-slate-800 mb-3 pl-3"
        style={{ borderLeft: "4px solid var(--primary)" }}
      >
        {title}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {ekgItems.map((item) => {
          const isPass = item.status === "pass"
          const isFail = item.status === "fail"

          return (
            <div
              key={item.id}
              className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs text-center flex flex-col justify-between"
            >
              {readonly ? (
                /* Readonly mode */
                <div className="p-3 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Heart
                      className={`size-4.5 ${
                        isPass
                          ? "text-emerald-500 fill-emerald-500"
                          : isFail
                          ? "text-rose-500 fill-rose-500"
                          : "text-slate-300"
                      }`}
                    />
                    <span className="font-bold text-slate-700">{item.label}</span>
                  </div>
                  <span
                    className={`font-semibold ${
                      isPass ? "text-emerald-500" : isFail ? "text-rose-500" : "text-slate-400"
                    }`}
                  >
                    {isPass ? "ผ่าน" : isFail ? "ไม่ผ่าน" : "-"}
                  </span>
                </div>
              ) : (
                /* Editable mode */
                <>
                  <div className="p-3 flex items-center justify-center gap-2">
                    {isFail ? (
                      <AlertTriangle className="size-4 text-rose-500" />
                    ) : (
                      <Heart
                        className={`size-4 ${
                          isPass
                            ? "text-emerald-500 fill-emerald-500"
                            : "text-slate-300"
                        }`}
                      />
                    )}
                    <span className="font-bold text-xs text-slate-700">{item.label}</span>
                  </div>

                  <div className="flex justify-center gap-3 p-3 pt-0">
                    {/* Pass button */}
                    <button
                      type="button"
                      onClick={() => onItemStatusChange?.(item.id, "pass")}
                      className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                        isPass
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "bg-white border-slate-200 text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      <CheckCircle className="size-3.5" />
                      ผ่าน
                    </button>

                    {/* Fail button */}
                    <button
                      type="button"
                      onClick={() => onItemStatusChange?.(item.id, "fail")}
                      className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                        isFail
                          ? "bg-rose-500 border-rose-500 text-white"
                          : "bg-white border-slate-200 text-slate-400 hover:text-rose-600"
                      }`}
                    >
                      <XCircle className="size-3.5" />
                      ไม่ผ่าน
                    </button>
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

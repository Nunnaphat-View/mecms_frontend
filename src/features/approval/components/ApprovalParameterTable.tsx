import { useMemo } from "react"
import { CheckCircle2, XCircle, Clock } from "lucide-react"

export interface TestRow {
  range: string
  standard: number | null
  val1: number | null
  val2: number | null
  val3: number | null
  stdVal1?: number | null
  stdVal2?: number | null
  stdVal3?: number | null
  average: number | null
  averageStd?: number | null
  error: number | null
  status: "pass" | "fail" | null
  std_type?: string
  parameterName?: string
}

interface Props {
  title: string
  rows: TestRow[]
  showRange?: boolean
  displayType?: string
  resolution?: string
  stdType?: string
  showParameterName?: boolean
}

export default function ApprovalParameterTable({
  title,
  rows,
  displayType = "",
  resolution = "",
  stdType = "",
  showParameterName = false,
}: Props) {
  const isMode4 = useMemo(() => {
    return (
      stdType?.includes("4") ||
      stdType?.includes("3 UUC : 3 STD") ||
      (stdType?.includes("3 UUC") && !stdType?.includes("1 STD"))
    )
  }, [stdType])

  const isMode6 = useMemo(() => {
    return (
      stdType?.includes("6") ||
      stdType?.includes("แบบวัดครั้งเดียว") ||
      stdType?.includes("1 STD : 1 UUC")
    )
  }, [stdType])

  const isMode2 = useMemo(() => {
    return stdType?.includes("2") && (stdType?.includes("UUC") || stdType?.includes("STD"))
  }, [stdType])

  const isUUT = useMemo(() => stdType?.includes("UUT"), [stdType])

  // Get table columns
  const columns = useMemo(() => {
    if (isMode6) {
      const cols = []
      if (showParameterName) {
        cols.push({ id: "parameterName", label: "ค่าพารามิเตอร์" })
      }
      cols.push(
        { id: "standard", label: "ค่ามาตรฐาน" },
        { id: "val1", label: "ค่าที่วัดได้" },
        { id: "error", label: "ค่าความคลาดเคลื่อน" },
        { id: "status", label: "ผลการทดสอบ" }
      )
      return cols
    } else if (isMode4) {
      return [
        { id: "val1", label: "UUC-1" },
        { id: "stdVal1", label: "STD-1" },
        { id: "val2", label: "UUC-2" },
        { id: "stdVal2", label: "STD-2" },
        { id: "val3", label: "UUC-3" },
        { id: "stdVal3", label: "STD-3" },
        { id: "average", label: "Mean-U" },
        { id: "averageStd", label: "Mean-S" },
        { id: "error", label: "Error" },
        { id: "status", label: "Result" },
      ]
    } else {
      return [
        { id: "standard", label: isUUT ? "STD Setting" : isMode2 ? "UUC Setting" : "STD Setting" },
        { id: "val1", label: isUUT ? "UUT-1" : isMode2 ? "STD-1" : "UUC-1" },
        { id: "val2", label: isUUT ? "UUT-2" : isMode2 ? "STD-2" : "UUC-2" },
        { id: "val3", label: isUUT ? "UUT-3" : isMode2 ? "STD-3" : "UUC-3" },
        { id: "average", label: "Mean" },
        { id: "error", label: isUUT ? "Err" : "Error" },
        { id: "status", label: "Result" },
      ]
    }
  }, [isMode6, isMode4, showParameterName, isUUT, isMode2])

  function getErrorClass(error: number | null): string {
    if (error === null) return ""
    if (error > 0) return "text-emerald-600 font-bold"
    if (error < 0) return "text-rose-600 font-bold"
    return "text-slate-700"
  }

  function formatError(error: number | null): string {
    if (error === null) return "-"
    return (error > 0 ? "+" : "") + error
  }

  return (
    <div className="mb-8 font-sans">
      {/* Title outside the table */}
      <div
        className="text-sm font-bold text-slate-800 mb-2 pl-3"
        style={{ borderLeft: "4px solid var(--primary)" }}
      >
        {title}
      </div>

      {/* Metadata Header */}
      {(displayType || resolution) && (
        <div className="flex gap-4 mb-2 pl-3 text-xs text-slate-500 font-medium">
          {displayType && (
            <div>
              <span>Display Type: </span>
              <span className="font-bold text-slate-800 uppercase">{displayType}</span>
            </div>
          )}
          {resolution && (
            <div>
              <span>Resolution: </span>
              <span className="font-bold text-slate-800">{resolution}</span>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs bg-white mt-1">
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-primary text-white text-xs font-semibold">
                {columns.map((col) => (
                  <th key={col.id} className="px-3 py-2.5 border-r border-white/10 last:border-0 font-bold">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors h-11">
                  {/* Parameter Name */}
                  {showParameterName && (
                    <td className="px-3 py-1.5 font-semibold text-slate-700 whitespace-nowrap">
                      {row.parameterName || "-"}
                    </td>
                  )}

                  {/* Standard Value */}
                  {!isMode4 && (
                    <td className="px-3 py-1.5 font-medium whitespace-nowrap border-r border-slate-50 text-slate-500">
                      {row.standard !== null ? row.standard : isMode6 ? "N/A" : "-"}
                    </td>
                  )}

                  {/* Val1 */}
                  <td className="px-3 py-1.5 border-r border-slate-50 font-medium text-slate-800">
                    {row.val1 !== null ? row.val1 : "-"}
                  </td>

                  {/* stdVal1 (Mode 4 only) */}
                  {isMode4 && (
                    <td className="px-3 py-1.5 border-r border-slate-50 font-medium text-slate-800">
                      {row.stdVal1 !== null ? row.stdVal1 : "-"}
                    </td>
                  )}

                  {/* Val2 */}
                  {!isMode6 && (
                    <td className="px-3 py-1.5 border-r border-slate-50 font-medium text-slate-800">
                      {row.val2 !== null ? row.val2 : "-"}
                    </td>
                  )}

                  {/* stdVal2 (Mode 4 only) */}
                  {isMode4 && (
                    <td className="px-3 py-1.5 border-r border-slate-50 font-medium text-slate-800">
                      {row.stdVal2 !== null ? row.stdVal2 : "-"}
                    </td>
                  )}

                  {/* Val3 */}
                  {!isMode6 && (
                    <td className="px-3 py-1.5 border-r border-slate-50 font-medium text-slate-800">
                      {row.val3 !== null ? row.val3 : "-"}
                    </td>
                  )}

                  {/* stdVal3 (Mode 4 only) */}
                  {isMode4 && (
                    <td className="px-3 py-1.5 border-r border-slate-50 font-medium text-slate-800">
                      {row.stdVal3 !== null ? row.stdVal3 : "-"}
                    </td>
                  )}

                  {/* Average / Mean-U */}
                  {!isMode6 && (
                    <td className="px-3 py-1.5 font-bold text-slate-800 border-r border-slate-50">
                      {row.average !== null ? row.average : "-"}
                    </td>
                  )}

                  {/* Mean-S (Mode 4 only) */}
                  {isMode4 && (
                    <td className="px-3 py-1.5 font-bold text-slate-800 border-r border-slate-50">
                      {row.averageStd !== null ? row.averageStd : "-"}
                    </td>
                  )}

                  {/* Error */}
                  <td className="px-3 py-1.5 border-r border-slate-50">
                    <span className={getErrorClass(row.error)}>{formatError(row.error)}</span>
                  </td>

                  {/* Result */}
                  <td className="px-3 py-1.5">
                    <div className="flex items-center justify-center">
                      {row.status === "pass" ? (
                        <span className="inline-flex items-center justify-center gap-1.5 w-24 h-7 border border-emerald-500 rounded-full text-emerald-600 font-bold bg-white">
                          <CheckCircle2 className="size-3.5" />
                          ผ่าน
                        </span>
                      ) : row.status === "fail" ? (
                        <span className="inline-flex items-center justify-center gap-1.5 w-24 h-7 border border-rose-500 rounded-full text-rose-600 font-bold bg-white">
                          <XCircle className="size-3.5" />
                          ไม่ผ่าน
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center gap-1.5 w-24 h-7 border border-slate-300 rounded-full text-slate-400 font-bold bg-white">
                          <Clock className="size-3.5" />
                          รอดำเนินการ
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

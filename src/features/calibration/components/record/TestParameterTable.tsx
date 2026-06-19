import { useState, useMemo } from "react"
import { Plus, Trash, CheckCircle2, XCircle, Clock } from "lucide-react"
import DeleteConfirmDialog from "./DeleteConfirmDialog"

export interface TestRow {
  isNew?: boolean
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
  errorLimit?: number
}

interface Props {
  title: string
  value: TestRow[]
  onChange: (value: TestRow[]) => void
  showRange?: boolean
  displayType?: string
  onDisplayTypeChange?: (val: string) => void
  resolution?: string
  onResolutionChange?: (val: string) => void
  errorType?: "absolute" | "percent"
  errorLimit?: number
  stdType?: string
  showParameterName?: boolean
}

export default function TestParameterTable({
  title,
  value,
  onChange,
  displayType = "",
  onDisplayTypeChange,
  resolution = "",
  onResolutionChange,
  errorType = "absolute",
  errorLimit = 2,
  stdType = "",
  showParameterName = false,
}: Props) {
  const [editingCell, setEditingCell] = useState<{ index: number; col: string } | null>(null)
  const [activeRowIndex, setActiveRowIndex] = useState<number | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [rowToDeleteIndex, setRowToDeleteIndex] = useState<number | null>(null)

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

  // Get table column headers
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

  function handleRowClick(index: number) {
    setActiveRowIndex((prev) => (prev === index ? null : index))
  }

  function handleStartEdit(index: number, col: string) {
    setEditingCell({ index, col })
  }

  function handleOpenDelete(index: number, e: React.MouseEvent) {
    e.stopPropagation()
    setRowToDeleteIndex(index)
    setIsDeleteOpen(true)
  }

  function handleDeleteConfirm() {
    if (rowToDeleteIndex !== null) {
      const nextRows = value.filter((_, idx) => idx !== rowToDeleteIndex)
      onChange(nextRows)
      setRowToDeleteIndex(null)
      setActiveRowIndex(null)
    }
  }

  function handleCellChange(index: number, field: keyof TestRow, val: number | null) {
    const nextRows = value.map((r, idx) => {
      if (idx !== index) return r
      const updatedRow = { ...r, [field]: val }
      calculateRow(updatedRow)
      return updatedRow
    })
    onChange(nextRows)
  }

  function calculateRow(row: TestRow) {
    const v1 = row.val1
    const v2 = row.val2
    const v3 = row.val3
    const s1 = row.stdVal1
    const s2 = row.stdVal2
    const s3 = row.stdVal3

    if (isMode6) {
      if (v1 !== null && v1 !== undefined) {
        row.average = v1

        if (row.standard !== null && row.standard !== undefined) {
          const limit = row.errorLimit !== undefined ? row.errorLimit : errorLimit

          if (errorType === "percent") {
            if (row.standard !== 0) {
              const err = ((v1 - row.standard) / row.standard) * 100
              row.error = Number(err.toFixed(2))
            } else {
              row.error = Number((v1 - row.standard).toFixed(2))
            }
          } else {
            const err = v1 - row.standard
            row.error = Number(err.toFixed(2))
          }

          row.status = Math.abs(row.error) <= limit ? "pass" : "fail"
        } else {
          row.error = 0
          row.status = "pass"
        }
      } else {
        row.average = null
        row.error = null
        row.status = null
      }
    } else if (isMode4) {
      const hasUUC =
        v1 !== null &&
        v1 !== undefined &&
        v2 !== null &&
        v2 !== undefined &&
        v3 !== null &&
        v3 !== undefined
      const hasSTD =
        s1 !== null &&
        s1 !== undefined &&
        s2 !== null &&
        s2 !== undefined &&
        s3 !== null &&
        s3 !== undefined

      if (hasUUC) {
        row.average = Number(((v1 + v2 + v3) / 3).toFixed(1))
      } else {
        row.average = null
      }

      if (hasSTD) {
        row.averageStd = Number(((s1 + s2 + s3) / 3).toFixed(1))
      } else {
        row.averageStd = null
      }

      if (row.average !== null && row.averageStd !== null) {
        const limit = errorLimit

        if (errorType === "percent") {
          if (row.averageStd !== 0) {
            const err = ((row.average - row.averageStd) / row.averageStd) * 100
            row.error = Number(err.toFixed(1))
          } else {
            row.error = Number((row.average - row.averageStd).toFixed(1))
          }
        } else {
          const err = row.average - row.averageStd
          row.error = Number(err.toFixed(1))
        }

        row.status = Math.abs(row.error) <= limit ? "pass" : "fail"
      } else {
        row.error = null
        row.status = null
      }
    } else {
      if (
        v1 !== null &&
        v1 !== undefined &&
        v2 !== null &&
        v2 !== undefined &&
        v3 !== null &&
        v3 !== undefined
      ) {
        const avg = (v1 + v2 + v3) / 3
        row.average = Number(avg.toFixed(1))

        if (row.standard !== null && row.standard !== undefined && row.standard !== 0) {
          const limit = errorLimit

          if (errorType === "percent") {
            const err = ((row.average - row.standard) / row.standard) * 100
            row.error = Number(err.toFixed(1))
          } else {
            const err = row.average - row.standard
            row.error = Number(err.toFixed(1))
          }

          row.status = Math.abs(row.error) <= limit ? "pass" : "fail"
        } else if (row.standard === 0) {
          const err = row.average - row.standard
          row.error = Number(err.toFixed(1))
          const limit = errorLimit
          row.status = Math.abs(row.error) <= limit ? "pass" : "fail"
        } else {
          row.error = null
          row.status = null
        }
      } else {
        row.average = null
        row.error = null
        row.status = null
      }
    }
  }

  function handleAddRow() {
    const newRow: TestRow = {
      isNew: true,
      range: "กำหนดเอง",
      standard: null,
      val1: null,
      val2: null,
      val3: null,
      stdVal1: null,
      stdVal2: null,
      stdVal3: null,
      average: null,
      averageStd: null,
      error: null,
      status: null,
    }
    const nextRows = [...value, newRow]
    onChange(nextRows)
  }

  function getErrorClass(error: number | null): string {
    if (error === null) return ""
    if (error > 0) return "text-emerald-600 font-bold"
    if (error < 0) return "text-rose-600 font-bold"
    return "text-slate-700"
  }

  function formatError(error: number | null): string {
    if (error === null) return "-"
    const suffix = errorType === "percent" ? "%" : ""
    return (error > 0 ? "+" : "") + error + suffix
  }

  return (
    <div className="mb-8 font-sans">
      {/* Table Title Section */}
      <div
        className="text-sm font-bold text-slate-800 mb-2 pl-3"
        style={{ borderLeft: "4px solid var(--primary)" }}
      >
        {title}
      </div>

      {/* Metadata settings header */}
      <div className="flex items-center justify-between gap-4 px-4 py-2 text-xs text-slate-500 font-medium">
        <div className="flex items-center gap-4">
          {onDisplayTypeChange && (
            <div className="flex items-center gap-1">
              <span>Display Type:</span>
              <input
                type="text"
                value={displayType}
                onChange={(e) => onDisplayTypeChange(e.target.value)}
                className="w-16 h-6 px-1 border border-slate-200 rounded-sm font-bold text-slate-700 bg-transparent focus:outline-none focus:border-primary focus:bg-white"
              />
            </div>
          )}

          {onResolutionChange && (
            <div className="flex items-center gap-1">
              <span>Resolution:</span>
              <input
                type="text"
                value={resolution}
                onChange={(e) => onResolutionChange(e.target.value)}
                className="w-12 h-6 px-1 border border-slate-200 rounded-sm font-bold text-slate-700 bg-transparent focus:outline-none focus:border-primary focus:bg-white"
              />
            </div>
          )}
        </div>

        {!showParameterName && (
          <button
            type="button"
            onClick={handleAddRow}
            className="flex items-center gap-1 px-3 py-2 bg-secondary hover:bg-slate-200 text-white rounded-lg font-bold transition-colors cursor-pointer"
          >
            <Plus className="size-3.5" />
            เพิ่มพารามิเตอร์
          </button>
        )}
      </div>

      {/* Parameter Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs bg-white mt-1">
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-primary text-white text-xs font-bold">
                {columns.map((col) => (
                  <th key={col.id} className="px-3 py-2.5 border-r border-white/10 last:border-0">
                    {col.label}
                  </th>
                ))}
                {!showParameterName && <th className="w-12 px-3 py-2.5 bg-primary"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {value.map((row, idx) => {
                const isActive = activeRowIndex === idx

                return (
                  <tr
                    key={idx}
                    onClick={() => handleRowClick(idx)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer h-12"
                  >
                    {/* Parameter name (Ultrasound only) */}
                    {showParameterName && (
                      <td className="px-3 py-1.5 font-semibold text-slate-700 whitespace-nowrap">
                        {row.parameterName || "-"}
                      </td>
                    )}

                    {/* Standard Value */}
                    {!isMode4 && (
                      <td
                        className="px-3 py-1.5 font-medium whitespace-nowrap border-r border-slate-50"
                        onDoubleClick={(e) => {
                          e.stopPropagation()
                          handleStartEdit(idx, "standard")
                        }}
                      >
                        {editingCell?.index === idx && editingCell?.col === "standard" ? (
                          <input
                            type="number"
                            autoFocus
                            value={row.standard ?? ""}
                            onClick={(e) => e.stopPropagation()}
                            onBlur={() => setEditingCell(null)}
                            onKeyDown={(e) => e.key === "Enter" && setEditingCell(null)}
                            onChange={(e) =>
                              handleCellChange(
                                idx,
                                "standard",
                                e.target.value !== "" ? parseFloat(e.target.value) : null
                              )
                            }
                            className="w-16 h-7 text-center border border-primary rounded-md focus:outline-none"
                          />
                        ) : (
                          <span className="text-slate-800 select-none">
                            {row.standard !== null ? row.standard : isMode6 ? "N/A" : "-"}
                          </span>
                        )}
                      </td>
                    )}

                    {/* Val1 */}
                    <td className="px-2 py-1.5 border-r border-slate-50">
                      <input
                        type="number"
                        value={row.val1 ?? ""}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) =>
                          handleCellChange(
                            idx,
                            "val1",
                            e.target.value !== "" ? parseFloat(e.target.value) : null
                          )
                        }
                        className="w-16 h-8 text-center border border-slate-200 rounded-md focus:outline-none focus:border-primary text-slate-800 bg-white"
                      />
                    </td>

                    {/* stdVal1 (Mode 4 only) */}
                    {isMode4 && (
                      <td className="px-2 py-1.5 border-r border-slate-50">
                        <input
                          type="number"
                          value={row.stdVal1 ?? ""}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            handleCellChange(
                              idx,
                              "stdVal1",
                              e.target.value !== "" ? parseFloat(e.target.value) : null
                            )
                          }
                          className="w-16 h-8 text-center border border-slate-200 rounded-md focus:outline-none focus:border-primary text-slate-800 bg-white"
                        />
                      </td>
                    )}

                    {/* Val2 */}
                    {!isMode6 && (
                      <td className="px-2 py-1.5 border-r border-slate-50">
                        <input
                          type="number"
                          value={row.val2 ?? ""}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            handleCellChange(
                              idx,
                              "val2",
                              e.target.value !== "" ? parseFloat(e.target.value) : null
                            )
                          }
                          className="w-16 h-8 text-center border border-slate-200 rounded-md focus:outline-none focus:border-primary text-slate-800 bg-white"
                        />
                      </td>
                    )}

                    {/* stdVal2 (Mode 4 only) */}
                    {isMode4 && (
                      <td className="px-2 py-1.5 border-r border-slate-50">
                        <input
                          type="number"
                          value={row.stdVal2 ?? ""}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            handleCellChange(
                              idx,
                              "stdVal2",
                              e.target.value !== "" ? parseFloat(e.target.value) : null
                            )
                          }
                          className="w-16 h-8 text-center border border-slate-200 rounded-md focus:outline-none focus:border-primary text-slate-800 bg-white"
                        />
                      </td>
                    )}

                    {/* Val3 */}
                    {!isMode6 && (
                      <td className="px-2 py-1.5 border-r border-slate-50">
                        <input
                          type="number"
                          value={row.val3 ?? ""}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            handleCellChange(
                              idx,
                              "val3",
                              e.target.value !== "" ? parseFloat(e.target.value) : null
                            )
                          }
                          className="w-16 h-8 text-center border border-slate-200 rounded-md focus:outline-none focus:border-primary text-slate-800 bg-white"
                        />
                      </td>
                    )}

                    {/* stdVal3 (Mode 4 only) */}
                    {isMode4 && (
                      <td className="px-2 py-1.5 border-r border-slate-50">
                        <input
                          type="number"
                          value={row.stdVal3 ?? ""}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            handleCellChange(
                              idx,
                              "stdVal3",
                              e.target.value !== "" ? parseFloat(e.target.value) : null
                            )
                          }
                          className="w-16 h-8 text-center border border-slate-200 rounded-md focus:outline-none focus:border-primary text-slate-800 bg-white"
                        />
                      </td>
                    )}

                    {/* Average (Mean / Mean-U) */}
                    {!isMode6 && (
                      <td className="px-3 py-1.5 font-bold text-slate-800 border-r border-slate-50">
                        {row.average !== null ? row.average : "-"}
                      </td>
                    )}

                    {/* Average Standard (Mean-S) (Mode 4 only) */}
                    {isMode4 && (
                      <td className="px-3 py-1.5 font-bold text-slate-800 border-r border-slate-50">
                        {row.averageStd !== null ? row.averageStd : "-"}
                      </td>
                    )}

                    {/* Error value */}
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

                    {/* Trash Delete button */}
                    {!showParameterName && (
                      <td className="w-12 px-1 text-center">
                        {isActive && (
                          <button
                            type="button"
                            onClick={(e) => handleOpenDelete(idx, e)}
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
                          >
                            <Trash className="size-4" />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}

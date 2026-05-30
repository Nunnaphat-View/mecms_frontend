import { ChevronLeft, ChevronRight } from "lucide-react"

interface TablePaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?: number[]
}

/**
 * Shared pagination footer for all data tables.
 * Renders: item range label | rows-per-page selector (optional) | prev / page-counter / next
 */
export default function TablePagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
}: TablePaginationProps) {
  const from = (currentPage - 1) * pageSize + 1
  const to = Math.min(currentPage * pageSize, totalItems)

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-6 py-4 bg-slate-50 border-t border-slate-200 text-xs font-medium text-slate-500">
      {/* Left: item range + optional page-size selector */}
      <div className="flex items-center gap-4">
        <span>
          แสดง {from} - {to} จากทั้งหมด {totalItems} รายการ
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5">
            <span>แถวต่อหน้า:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value))
                onPageChange(1)
              }}
              className="bg-white border border-slate-200 px-2 py-1 rounded-md text-slate-700 outline-none"
            >
              {pageSizeOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: prev / counter / next */}
      <div className="flex items-center gap-1.5">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
        >
          <ChevronLeft className="size-4" />
        </button>

        <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold">
          {currentPage} / {totalPages}
        </span>

        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  )
}

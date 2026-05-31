import { useEffect, useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { FileCheck, List, LayoutGrid, CheckCircle2, XCircle, HelpCircle } from "lucide-react"
import SearchBar from "../components/SearchBar"
import TablePagination from "../components/common/TablePagination"
import ApprovalCard from "../components/approval/ApprovalCard"
import { useApprovalStore } from "../stores/approvalStore"

export default function ApprovalsPage() {
  const navigate = useNavigate()
  const {
    approvals,
    loading,
    searchQuery,
    selectedType,
    typeOptions,
    fetchApprovals,
    setSearchQuery,
    setSelectedType,
  } = useApprovalStore()

  // Local UI States
  const [viewMode, setViewMode] = useState<"table" | "card">("table")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Fetch approvals on mount
  useEffect(() => {
    void fetchApprovals()
  }, [fetchApprovals])

  // Filter and sort client-side (newest first)
  const filteredApprovals = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()

    let result = approvals

    if (q) {
      result = result.filter(
        (a) =>
          a.id.toLowerCase().includes(q) ||
          a.toolName.toLowerCase().includes(q) ||
          a.toolCode.toLowerCase().includes(q)
      )
    }

    if (selectedType !== "ทั้งหมด") {
      result = result.filter((a) => a.status === selectedType)
    }

    // Always sort by taskId descending (Newest at top)
    return [...result].sort((a, b) => b.taskId - a.taskId)
  }, [approvals, searchQuery, selectedType])

  // Paginated approvals (for Table View)
  const paginatedApprovals = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredApprovals.slice(start, start + pageSize)
  }, [filteredApprovals, currentPage, pageSize])

  const totalPages = Math.ceil(filteredApprovals.length / pageSize) || 1

  function goToApprovalDetail(id: string) {
    navigate(`/approval/${id}`)
  }

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileCheck className="size-5.5 text-primary" />
            รับรองการสอบเทียบ
          </h1>
          <p className="text-slate-500 text-xs mt-1">ตรวจสอบและรับรองผลการสอบเทียบเครื่องมือแพทย์</p>
        </div>
      </div>

      {/* Filters + View Toggle */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-xs">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto flex-1">
          <SearchBar
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val)
              setCurrentPage(1)
            }}
            placeholder="ค้นหา..."
          />

          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full sm:w-48 h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-all outline-none text-slate-700 font-medium"
          >
            {typeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                สถานะ: {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* View Toggle Buttons */}
        <div className="flex items-center gap-1 border border-slate-200 rounded-xl p-1 bg-slate-50">
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === "table"
                ? "bg-white text-primary shadow-xs font-semibold"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <List className="size-4.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("card")}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === "card"
                ? "bg-white text-primary shadow-xs font-semibold"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <LayoutGrid className="size-4.5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === "table" ? (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary text-white text-xs font-semibold uppercase tracking-wider">
                  <th className="px-5 py-3.5 text-center">รหัสสอบเทียบ</th>
                  <th className="px-5 py-3.5">ชื่อเครื่องมือ</th>
                  <th className="px-5 py-3.5">รหัสเครื่อง</th>
                  <th className="px-5 py-3.5">ที่ตั้ง</th>
                  <th className="px-5 py-3.5 text-center">วันที่สอบเทียบ</th>
                  <th className="px-5 py-3.5 text-center">ผลการสอบเทียบ</th>
                  <th className="px-5 py-3.5 text-right w-[180px]">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {loading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded w-16 mx-auto"></div></td>
                      <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded w-36"></div></td>
                      <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                      <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                      <td className="px-5 py-4 text-center"><div className="h-4 bg-slate-200 rounded w-20 mx-auto"></div></td>
                      <td className="px-5 py-4 text-center"><div className="h-4 bg-slate-200 rounded w-16 mx-auto"></div></td>
                      <td className="px-5 py-4 text-right"><div className="h-8 bg-slate-200 rounded-lg w-28 ml-auto"></div></td>
                    </tr>
                  ))
                ) : paginatedApprovals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">
                      ไม่พบข้อมูล
                    </td>
                  </tr>
                ) : (
                  paginatedApprovals.map((row) => {
                    const isPass = row.result === "ผ่าน"
                    const isFail = row.result === "ไม่ผ่าน"

                    return (
                      <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-[#1a1a2e] text-center whitespace-nowrap">
                          {row.id}
                        </td>
                        <td className="px-5 py-3.5 font-medium whitespace-nowrap">{row.toolName}</td>
                        <td className="px-5 py-3.5 whitespace-nowrap">{row.toolCode}</td>
                        <td className="px-5 py-3.5 whitespace-nowrap">{row.location}</td>
                        <td className="px-5 py-3.5 text-center whitespace-nowrap">{row.calDate}</td>
                        <td className="px-5 py-3.5 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center">
                            {isPass ? (
                              <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-500">
                                <CheckCircle2 className="size-4.5" />
                                {row.result}
                              </span>
                            ) : isFail ? (
                              <span className="inline-flex items-center gap-1.5 font-semibold text-rose-500">
                                <XCircle className="size-4.5" />
                                {row.result}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 font-semibold text-slate-500">
                                <HelpCircle className="size-4.5" />
                                {row.result}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => goToApprovalDetail(row.id)}
                            className="px-4 py-1.5 bg-primary hover:bg-primary/95 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer min-w-[140px] select-none"
                          >
                            รับรองการสอบเทียบ
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {filteredApprovals.length > 0 && (
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredApprovals.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size)
                setCurrentPage(1)
              }}
            />
          )}
        </div>
      ) : (
        /* Card View Mode */
        <div className="flex flex-col gap-4">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 h-44 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-2/3 mb-4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2 mb-3"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/3 mb-6"></div>
                  <div className="h-8 bg-slate-200 rounded-lg w-full"></div>
                </div>
              ))}
            </div>
          ) : filteredApprovals.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 font-medium shadow-xs">
              ไม่พบข้อมูล
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredApprovals.map((item) => (
                <ApprovalCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

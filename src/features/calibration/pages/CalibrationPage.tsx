import { useEffect, useState, useMemo } from "react"
import { ClipboardCheck, List, LayoutGrid } from "lucide-react"
import { useNavigate } from "react-router-dom"
import SearchBar from "@/components/SearchBar"
import TablePagination from "@/components/common/TablePagination"
import CalibrationCard, { CalibrationCardSkeleton } from "@/features/calibration/components/CalibrationCard"
import { useCalibrationStore } from "@/features/calibration/stores/calibrationStore"
import { useAuthStore } from "@/features/auth/stores/authStore"

export default function CalibrationPage() {
  const navigate = useNavigate()
  const {
    records,
    loading,
    searchQuery,
    selectedType,
    typeOptions,
    fetchFromApi,
    setSearchQuery,
    setSelectedType,
  } = useCalibrationStore()

  const { user } = useAuthStore()

  // Local UI States
  const [viewMode, setViewMode] = useState<"table" | "card">("table")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Fetch active/pending calibration tasks on mount
  useEffect(() => {
    void fetchFromApi()
  }, [fetchFromApi])

  // Returns true when the logged-in user is the responsible person for a record
  const isOwner = (responsible: string): boolean => {
    if (!user) return false
    return user.name === responsible
  }

  // Filter and sort client-side (current user's tasks first)
  const filteredRecords = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    const currentUserName = user?.name || ""

    const filtered = records.filter((r) => {
      const matchSearch =
        !q ||
        r.id.toLowerCase().includes(q) ||
        r.tool_name.toLowerCase().includes(q) ||
        r.deviceCode.toLowerCase().includes(q) ||
        r.responsible.toLowerCase().includes(q)

      const matchType = !selectedType || r.type === selectedType

      return matchSearch && matchType
    })

    // Sort: current user's tasks first, then by earliest due date (closest to due date)
    return filtered.slice().sort((a, b) => {
      const isAOwner = a.responsible === currentUserName
      const isBOwner = b.responsible === currentUserName

      if (isAOwner && !isBOwner) return -1
      if (!isAOwner && isBOwner) return 1

      // If ownership is the same, sort by due date ascending (earlier date first)
      const timeA = a.dueDate && a.dueDate !== "-" ? new Date(a.dueDate).getTime() : Infinity
      const timeB = b.dueDate && b.dueDate !== "-" ? new Date(b.dueDate).getTime() : Infinity

      const validA = isNaN(timeA) ? Infinity : timeA
      const validB = isNaN(timeB) ? Infinity : timeB

      if (validA !== validB) {
        return validA - validB
      }

      // Fallback: sort by ID
      return a.id.localeCompare(b.id)
    })
  }, [records, searchQuery, selectedType, user])

  // Paginated Records (strictly for Table View)
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredRecords.slice(start, start + pageSize)
  }, [filteredRecords, currentPage, pageSize])

  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1

  function goToInspection(record: { id: string; taskId?: number }) {
    const id = record.taskId ?? record.id
    navigate(`/calibration/inspection/${id}`)
  }

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <ClipboardCheck className="size-5.5 text-primary" />
            บันทึกการสอบเทียบ
          </h1>
          <p className="text-slate-500 text-xs mt-1">บันทึกผลการตรวจสอบและสอบเทียบเครื่องมือแพทย์</p>
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
            placeholder="ค้นหาเครื่องมือแพทย์"
          />

          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full sm:w-48 h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-all outline-none text-slate-700"
          >
            {typeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                ประเภท: {opt.label}
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
                  <th className="px-5 py-3.5">รหัสสอบเทียบ</th>
                  <th className="px-5 py-3.5">ชื่อเครื่องมือ</th>
                  <th className="px-5 py-3.5">รหัสเครื่อง</th>
                  <th className="px-5 py-3.5 text-center">ที่ตั้ง</th>
                  <th className="px-5 py-3.5 text-center">ประเภท</th>
                  <th className="px-5 py-3.5 text-center">ครบกำหนด</th>
                  <th className="px-5 py-3.5">ผู้รับผิดชอบ</th>
                  <th className="px-5 py-3.5 text-center w-[180px]">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {loading ? (
                  Array.from({ length: 6 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                      <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded w-36"></div></td>
                      <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                      <td className="px-5 py-4 text-center"><div className="h-4 bg-slate-200 rounded w-16 mx-auto"></div></td>
                      <td className="px-5 py-4 text-center"><div className="h-4 bg-slate-200 rounded w-16 mx-auto"></div></td>
                      <td className="px-5 py-4 text-center"><div className="h-4 bg-slate-200 rounded w-20 mx-auto"></div></td>
                      <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                      <td className="px-5 py-4 text-center"><div className="h-8 bg-slate-200 rounded-lg w-28 mx-auto"></div></td>
                    </tr>
                  ))
                ) : paginatedRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-400 font-medium">
                      ไม่พบข้อมูลบันทึกการสอบเทียบ
                    </td>
                  </tr>
                ) : (
                  paginatedRecords.map((record) => {
                    const owned = isOwner(record.responsible)
                    const buttonLabel =
                      record.status === "ReCalibrate"
                        ? "สอบเทียบใหม่"
                        : record.status === "InProgress"
                        ? "ดำเนินการต่อ"
                        : "เริ่มการสอบเทียบ"

                    return (
                      <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-[#1a1a2e] whitespace-nowrap">{record.id}</td>
                        <td className="px-5 py-3.5 font-medium whitespace-nowrap">{record.tool_name}</td>
                        <td className="px-5 py-3.5 whitespace-nowrap">{record.deviceCode}</td>
                        <td className="px-5 py-3.5 text-center whitespace-nowrap">{record.location}</td>
                        <td className="px-5 py-3.5 text-center whitespace-nowrap">{record.type}</td>
                        <td className="px-5 py-3.5 text-center whitespace-nowrap">{record.dueDate}</td>
                        <td className="px-5 py-3.5 whitespace-nowrap">{record.responsible}</td>
                        <td className="px-5 py-3.5 text-center whitespace-nowrap">
                          <button
                            type="button"
                            disabled={!owned}
                            onClick={() => goToInspection(record)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer min-w-[140px] select-none ${
                              owned
                                ? "bg-primary text-white hover:bg-primary/95"
                                : "bg-slate-200 text-slate-400 cursor-not-allowed"
                            }`}
                          >
                            {buttonLabel}
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Footer */}
          {filteredRecords.length > 0 && (
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredRecords.length}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, idx) => (
                <CalibrationCardSkeleton key={idx} />
              ))}
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 font-medium shadow-xs">
              ไม่พบข้อมูลบันทึกการสอบเทียบ
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRecords.map((record) => (
                <CalibrationCard
                  key={record.id}
                  record={record}
                  isOwner={isOwner(record.responsible)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

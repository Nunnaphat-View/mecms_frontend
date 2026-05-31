import { useState, useEffect, useMemo, useCallback } from "react"
import { Settings2, Plus, FileText, Edit, Trash2 } from "lucide-react"
import TablePagination from "../components/common/TablePagination"
import type { BackendStandardTool } from "../types/tool"
import { useStandardToolStore } from "../stores/standardToolStore"
import { useAuthStore } from "../stores/authStore"
import SearchBar from "../components/SearchBar"
import StandardToolFormDialog from "../components/tools/StandardToolFormDialog"
import ConfirmDeleteDialog from "../components/common/ConfirmDeleteDialog"
import { getFileUrl } from "../services/standardToolService"
import { formatDateBE } from "../utils"

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StandardToolsPage() {
  const { tools, loading, fetchTools, deleteTool } = useStandardToolStore()
  const { user } = useAuthStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedTool, setSelectedTool] = useState<BackendStandardTool | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<BackendStandardTool | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const ROWS_PER_PAGE = pageSize

  const isAdmin = useMemo(() => {
    if (!user) return false
    return (
      user.roleId === 1 ||
      user.role?.name?.toLowerCase().includes("admin") ||
      user.role?.name?.includes("ผู้ดูแลระบบ")
    )
  }, [user])

  useEffect(() => {
    void fetchTools()
  }, [fetchTools])

  // ── Filter with relevance sort ────────────────────────────────────────────
  const filteredTools = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()

    const filtered = tools.filter((t) => {
      if (!q) return true
      return (
        t.name.toLowerCase().includes(q) ||
        (t.asset_code ?? "").toLowerCase().includes(q) ||
        (t.manufacturer ?? "").toLowerCase().includes(q) ||
        (t.model ?? "").toLowerCase().includes(q) ||
        (t.serial_number ?? "").toLowerCase().includes(q)
      )
    })

    if (!q) return filtered

    const score = (val: string | null | undefined): number => {
      const v = (val ?? "").toLowerCase()
      if (v === q) return 0
      if (v.startsWith(q)) return 1
      if (v.includes(q)) return 2
      return 3
    }

    return filtered.sort((a, b) => {
      const sa = score(a.name)
      const sb = score(b.name)
      if (sa !== sb) return sa - sb
      return a.name.localeCompare(b.name)
    })
  }, [tools, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredTools.length / ROWS_PER_PAGE))

  const paginatedTools = useMemo(() => {
    const start = (currentPage - 1) * ROWS_PER_PAGE
    return filteredTools.slice(start, start + ROWS_PER_PAGE)
  }, [filteredTools, currentPage, pageSize])

  // Reset to page 1 when search changes
  const handleSearchChange = useCallback((val: string) => {
    setSearchQuery(val)
    setCurrentPage(1)
  }, [])

  function openAdd() {
    setSelectedTool(null)
    setIsFormOpen(true)
  }

  function openEdit(tool: BackendStandardTool) {
    setSelectedTool(tool)
    setIsFormOpen(true)
  }

  function openDelete(tool: BackendStandardTool) {
    setDeleteTarget(tool)
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteTool(deleteTarget.id)
    } catch (err) {
      console.error(err)
      alert("ลบข้อมูลล้มเหลว กรุณาลองใหม่อีกครั้ง")
    } finally {
      setIsDeleting(false)
      setDeleteTarget(null)
    }
  }

  function viewCertificate(path: string | null | undefined) {
    const url = getFileUrl(path)
    if (url) window.open(url, "_blank")
  }

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Settings2 className="size-5.5 text-primary" />
          เครื่องมือมาตรฐาน
        </h1>
        <p className="text-slate-500 text-xs mt-1">
          จัดการข้อมูลเครื่องมือมาตรฐานทั้งหมดในระบบ
        </p>
      </div>

      {/* Filters Row */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-xs">
        <div className="w-full sm:flex-1">
          <SearchBar
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="ค้นหาเครื่องมือมาตรฐาน..."
          />
        </div>
        {isAdmin && (
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary/95 text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow transition-all cursor-pointer w-full sm:w-auto justify-center"
          >
            <Plus className="size-4" /> เพิ่มเครื่องมือมาตรฐาน
          </button>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            {/* Table Header */}
            <thead>
              <tr className="bg-primary text-white">
                <th className="px-4 py-3.5 text-left font-semibold text-[13.5px] whitespace-nowrap w-24">
                  รหัส
                </th>
                <th className="px-4 py-3.5 text-left font-semibold text-[13.5px]">
                  เครื่องมือมาตรฐาน
                </th>
                <th className="px-4 py-3.5 text-left font-semibold text-[13.5px] whitespace-nowrap">
                  บริษัท
                </th>
                <th className="px-4 py-3.5 text-left font-semibold text-[13.5px] whitespace-nowrap">
                  รุ่น
                </th>
                <th className="px-4 py-3.5 text-center font-semibold text-[13.5px] whitespace-nowrap w-32">
                  หมายเลขเครื่อง
                </th>
                <th className="px-4 py-3.5 text-center font-semibold text-[13.5px] whitespace-nowrap w-32">
                  วันที่สอบเทียบ
                </th>
                <th className="px-4 py-3.5 text-center font-semibold text-[13.5px] w-28">
                  {/* actions */}
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400 text-sm">
                    <span className="inline-block w-5 h-5 border-2 border-slate-300 border-t-primary rounded-full animate-spin mr-2 align-middle" />
                    กำลังโหลดข้อมูล...
                  </td>
                </tr>
              )}

              {!loading && paginatedTools.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400 text-sm">
                    ไม่พบข้อมูลเครื่องมือมาตรฐาน
                  </td>
                </tr>
              )}

              {!loading &&
                paginatedTools.map((tool) => (
                  <tr
                    key={tool.id}
                    className="border-t border-slate-100 hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="px-4 py-3 text-center">
                      <span className="font-semibold text-slate-800 text-[13.5px] font-mono whitespace-nowrap">
                        {tool.asset_code || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-800 text-[13.5px]">{tool.name}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-[13.5px]">
                      {tool.manufacturer || "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-[13.5px]">
                      {tool.model || "-"}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600 text-[13.5px]">
                      {tool.serial_number || "-"}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600 text-[13.5px]">
                      {formatDateBE(tool.calibration_date_last)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {/* View Certificate PDF */}
                        <button
                          onClick={() => viewCertificate(tool.path_pdf)}
                          disabled={!tool.path_pdf}
                          title={tool.path_pdf ? "เปิดดูใบรับรอง PDF" : "ไม่มีไฟล์ใบรับรอง"}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-primary hover:bg-primary/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <FileText className="size-4" />
                        </button>

                        {/* Edit */}
                        {isAdmin && (
                          <button
                            onClick={() => openEdit(tool)}
                            title="แก้ไขข้อมูล"
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Edit className="size-4" />
                          </button>
                        )}

                        {/* Delete */}
                        {isAdmin && (
                          <button
                            onClick={() => openDelete(tool)}
                            title="ลบข้อมูล"
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-rose-400 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filteredTools.length > 0 && (
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredTools.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setCurrentPage(1)
            }}
          />
        )}
      </div>

      {/* Add / Edit Form Dialog (conditionally mounted to reset state) */}
      {isFormOpen && (
        <StandardToolFormDialog
          isOpen={isFormOpen}
          tool={selectedTool}
          onClose={() => setIsFormOpen(false)}
          onSaved={() => void fetchTools()}
        />
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDeleteDialog
        isOpen={!!deleteTarget}
        message="ต้องการลบข้อมูลเครื่องมือมาตรฐานนี้ใช่หรือไม่?"
        itemName={
          deleteTarget
            ? `${deleteTarget.asset_code ?? ""} ${deleteTarget.name}`.trim()
            : ""
        }
        loading={isDeleting}
        onConfirm={() => void handleDeleteConfirm()}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

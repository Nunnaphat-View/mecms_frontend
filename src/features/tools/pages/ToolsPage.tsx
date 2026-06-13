import { useEffect, useState, useMemo } from "react"
import { Plus, Wrench, Edit, Trash2 } from "lucide-react"
import TablePagination from "@/components/common/TablePagination"
import { useToolStore } from "@/features/tools/stores/toolStore"
import { useAuthStore } from "@/features/auth/stores/authStore"
import type { MedicalTool, ToolStatus } from "@/types/tool"
import ToolFormDialog from "@/features/tools/components/ToolFormDialog"
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog"
import SearchBar from "@/components/SearchBar"
import { useToast } from "@/hooks/useToast"

export default function ToolsPage() {
  const {
    tools,
    loading,
    searchQuery,
    selectedType,
    equipmentTypes,
    fetchTools,
    deleteTool,
    setSearchQuery,
    setSelectedType,
  } = useToolStore()

  const { user } = useAuthStore()
  const toast = useToast()

  // Modal Dialog States
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedToolForEdit, setSelectedToolForEdit] = useState<MedicalTool | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedToolForDelete, setSelectedToolForDelete] = useState<MedicalTool | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const handleSearchChange = (val: string) => {
    setSearchQuery(val)
    setCurrentPage(1)
  }

  const handleTypeChange = (val: string) => {
    setSelectedType(val)
    setCurrentPage(1)
  }

  // Fetch tools list on mount
  useEffect(() => {
    void fetchTools()
  }, [fetchTools])

  // Check Admin permission
  const isAdmin = useMemo(() => {
    if (!user) return false
    return (
      user.roleId === 1 ||
      user.role?.name?.toLowerCase().includes("admin") ||
      user.role?.name?.includes("ผู้ดูแลระบบ")
    )
  }, [user])

  // Filter tools client-side with relevance sorting
  const filteredTools = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()

    const filtered = tools.filter((t) => {
      const matchSearch =
        !q ||
        t.tool_name.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.model.toLowerCase().includes(q) ||
        t.location.toLowerCase().includes(q)

      const matchType = !selectedType || t.type === selectedType

      return matchSearch && matchType
    })

    if (!q) return filtered

    // Sort by relevance: name match scores higher than other fields
    return filtered.sort((a, b) => {
      const scoreField = (val: string): number => {
        const v = val.toLowerCase()
        if (v === q) return 0         // exact match
        if (v.startsWith(q)) return 1 // prefix match
        if (v.includes(q)) return 2   // substring match
        return 3                       // matched via other field
      }

      const scoreA = scoreField(a.tool_name)
      const scoreB = scoreField(b.tool_name)

      if (scoreA !== scoreB) return scoreA - scoreB
      return a.tool_name.localeCompare(b.tool_name)
    })
  }, [tools, searchQuery, selectedType])

  // Paginated Tools
  const paginatedTools = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredTools.slice(start, start + pageSize)
  }, [filteredTools, currentPage, pageSize])

  const totalPages = Math.ceil(filteredTools.length / pageSize) || 1

  // Handle Add/Edit modal trigger
  function openAdd() {
    setSelectedToolForEdit(null)
    setIsFormOpen(true)
  }

  function openEdit(tool: MedicalTool) {
    setSelectedToolForEdit(tool)
    setIsFormOpen(true)
  }

  // Handle Delete modal trigger
  function confirmDelete(tool: MedicalTool) {
    setSelectedToolForDelete(tool)
    setIsDeleteOpen(true)
  }

  async function handleDeleteConfirm() {
    if (!selectedToolForDelete) return
    setIsDeleting(true)
    try {
      await deleteTool(selectedToolForDelete.id)
      setIsDeleteOpen(false)
      setSelectedToolForDelete(null)
      toast.success("ลบเครื่องมือแพทย์สำเร็จ")
    } catch (err) {
      console.error(err)
      toast.error("เกิดข้อผิดพลาดในการลบเครื่องมือแพทย์")
    } finally {
      setIsDeleting(false)
    }
  }

  // Status Badge Mapper
  function getStatusStyles(status: ToolStatus): { bg: string; text: string } {
    const styles: Record<string, { bg: string; text: string }> = {
      พร้อมใช้งาน: { bg: "rgba(20, 160, 1, 0.12)", text: "#14a001" },
      กำลังสอบเทียบ: { bg: "rgba(9, 99, 126, 0.15)", text: "#09637e" },
      รอดำเนินการ: { bg: "rgba(255, 152, 0, 0.14)", text: "#e65100" },
      จำหน่ายแล้ว: { bg: "rgba(0, 0, 0, 0.07)", text: "#6b7280" },
      กำลังใช้งาน: { bg: "rgba(33, 150, 243, 0.15)", text: "#1976d2" },
      ส่งซ่อม: { bg: "rgba(255, 1, 1, 0.1)", text: "#ff0101" },
      ปิดใช้งาน: { bg: "#f5f5f5", text: "#9e9e9e" },
      ready: { bg: "rgba(20, 160, 1, 0.12)", text: "#14a001" },
      calibrating: { bg: "rgba(9, 99, 126, 0.15)", text: "#09637e" },
      repair: { bg: "rgba(255, 1, 1, 0.1)", text: "#ff0101" },
      disabled: { bg: "#f5f5f5", text: "#9e9e9e" },
    }
    return styles[status] ?? { bg: "#f5f5f5", text: "#9e9e9e" }
  }

  // Risk Badge Mapper
  function getRiskStyles(risk: string): { bg: string; text: string; dot: string } {
    if (risk === "high") {
      return { bg: "bg-red-50", text: "text-red-800", dot: "bg-red-600" }
    } else if (risk === "medium") {
      return { bg: "bg-amber-50", text: "text-amber-800", dot: "bg-amber-600" }
    } else if (risk === "low") {
      return { bg: "bg-emerald-50", text: "text-emerald-800", dot: "bg-emerald-600" }
    }
    return { bg: "bg-slate-50", text: "text-slate-500", dot: "bg-slate-400" }
  }

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Wrench className="size-5.5 text-primary" />
            เครื่องมือแพทย์
          </h1>
          <p className="text-slate-500 text-xs mt-1">จัดการข้อมูลเครื่องมือแพทย์ทั้งหมดในระบบ</p>
        </div>
      </div>

      {/* Filters, Search Bar & Add Button */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-xs">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto flex-1">
          <SearchBar
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="ค้นหาเครื่องมือแพทย์"
          />
          <select
            value={selectedType}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="w-full sm:w-48 h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-all outline-none"
          >
            <option value="">ประเภททั้งหมด</option>
            {equipmentTypes.map((type) => (
              <option key={type.id} value={type.name}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
        {isAdmin && (
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary/95 text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow transition-all cursor-pointer w-full sm:w-auto justify-center"
          >
            <Plus className="size-4" /> เพิ่มเครื่องมือ
          </button>
        )}
      </div>

      {/* Equipment Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-primary text-white text-xs font-semibold uppercase tracking-wider">
                <th className="px-5 py-3.5">รหัสเครื่องมือ</th>
                <th className="px-5 py-3.5">ชื่อเครื่องมือ</th>
                <th className="px-5 py-3.5">ผู้ผลิต</th>
                <th className="px-5 py-3.5">ชื่อรุ่น</th>
                <th className="px-5 py-3.5">ประเภท</th>
                <th className="px-5 py-3.5 text-center">ความเสี่ยง</th>
                <th className="px-5 py-3.5 text-center">ครบกำหนด</th>
                <th className="px-5 py-3.5 text-center">แผนก/หน่วยงาน</th>
                <th className="px-5 py-3.5 text-center">สถานะ</th>
                {isAdmin && <th className="px-5 py-3.5 text-center w-24">จัดการ</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={isAdmin ? 10 : 9} className="px-6 py-12 text-center text-slate-500 font-medium">
                    <div className="inline-block w-6 h-6 border-2 border-cyan-800 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <div>กำลังโหลดข้อมูล...</div>
                  </td>
                </tr>
              ) : paginatedTools.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 10 : 9} className="px-6 py-12 text-center text-slate-400 font-medium">
                    ไม่พบข้อมูลเครื่องมือแพทย์
                  </td>
                </tr>
              ) : (
                paginatedTools.map((tool) => {
                  const statusStyle = getStatusStyles(tool.status)
                  const riskStyle = getRiskStyles(tool.riskLevel || "")
                  return (
                    <tr key={tool.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-slate-800 whitespace-nowrap">{tool.id}</td>
                      <td className="px-5 py-3.5 font-medium whitespace-nowrap">{tool.tool_name}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap">{tool.company}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap">{tool.model}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap">{tool.type}</td>
                      <td className="px-5 py-3.5 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${riskStyle.bg} ${riskStyle.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${riskStyle.dot}`}></span>
                          {tool.riskLevel === "high" ? "สูง" : tool.riskLevel === "medium" ? "กลาง" : tool.riskLevel === "low" ? "ต่ำ" : "-"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center whitespace-nowrap">{tool.dueDate}</td>
                      <td className="px-5 py-3.5 text-center whitespace-nowrap">{tool.department}</td>
                      <td className="px-5 py-3.5 text-center whitespace-nowrap">
                        <span
                          className="inline-block px-3 py-1 rounded-full text-xs font-bold text-center min-w-[100px]"
                          style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
                        >
                          {tool.status}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-5 py-3.5 text-center whitespace-nowrap">
                          <div className="flex justify-center gap-1">
                            <button
                              onClick={() => openEdit(tool)}
                              className="p-1.5 text-slate-500 hover:text-cyan-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit className="size-4" />
                            </button>
                            <button
                              onClick={() => confirmDelete(tool)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50/80 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredTools.length > 0 && (
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

      {/* Tool Form Dialog */}
      {isFormOpen && (
        <ToolFormDialog
          isOpen={isFormOpen}
          tool={selectedToolForEdit}
          onClose={() => setIsFormOpen(false)}
          onSaved={fetchTools}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        isOpen={isDeleteOpen}
        itemName={selectedToolForDelete?.tool_name}
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </div>
  )
}

import { useEffect, useState, useMemo } from "react"
import { Plus, Users as UsersIcon, Edit, Trash2, Award } from "lucide-react"
import TablePagination from "@/components/common/TablePagination"
import { useUserStore } from "@/features/users/stores/userStore"
import type { User } from "@/types/auth"
import { userService } from "@/features/users/services/userService"
import UserFormDialog from "@/features/users/components/UserFormDialog"
import SpecialtyDialog from "@/features/users/components/SpecialtyDialog"
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog"
import SearchBar from "@/components/SearchBar"

// ── Toast notification ────────────────────────────────────────────────────────
type ToastType = "success" | "error" | "warning"
interface Toast {
  type: ToastType
  message: string
}


export default function UsersPage() {
  const {
    users,
    loading,
    searchQuery,
    roleFilter,
    fetchUsers,
    deleteUser,
    setSearchQuery,
    setRoleFilter,
  } = useUserStore()

  // Toast
  const [toast, setToast] = useState<Toast | null>(null)

  // Form Dialog
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedForEdit, setSelectedForEdit] = useState<User | null>(null)

  // Delete Dialog
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedForDelete, setSelectedForDelete] = useState<User | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Specialty Dialog
  const [isSpecialtyOpen, setIsSpecialtyOpen] = useState(false)
  const [selectedForSpecialty, setSelectedForSpecialty] = useState<User | null>(null)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    void fetchUsers()
  }, [fetchUsers])

  function showToast(type: ToastType, message: string) {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }


  // Available unique roles for selection filter
  const availableRoles = useMemo(() => {
    const roles = new Set(users.map((u) => u.role?.description || u.role?.name).filter(Boolean))
    return Array.from(roles) as string[]
  }, [users])

  // Filter
  const filteredUsers = useMemo(() => {
    let result = users

    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (u) =>
          (u.name || "").toLowerCase().includes(q) ||
          (u.email || "").toLowerCase().includes(q) ||
          (u.username || "").toLowerCase().includes(q) ||
          (u.tel || "").includes(q)
      )
    }

    if (roleFilter) {
      result = result.filter((u) => (u.role?.description || u.role?.name) === roleFilter)
    }

    return result
  }, [users, searchQuery, roleFilter])

  // Paginated
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredUsers.slice(start, start + pageSize)
  }, [filteredUsers, currentPage, pageSize])

  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1

  function handleSearchChange(val: string) {
    setSearchQuery(val)
    setCurrentPage(1)
  }

  function openAdd() {
    setSelectedForEdit(null)
    setIsFormOpen(true)
  }

  function openEdit(user: User) {
    setSelectedForEdit(user)
    setIsFormOpen(true)
  }

  function confirmDelete(user: User) {
    setSelectedForDelete(user)
    setIsDeleteOpen(true)
  }

  function openSpecialty(user: User) {
    setSelectedForSpecialty(user)
    setIsSpecialtyOpen(true)
  }

  async function handleDeleteConfirm() {
    if (!selectedForDelete) return
    setIsDeleting(true)
    try {
      await deleteUser(selectedForDelete.id)
      showToast("success", "ลบผู้ใช้งานสำเร็จ")
      setIsDeleteOpen(false)
      setSelectedForDelete(null)
    } catch (err) {
      console.error(err)
      showToast("error", "ไม่สามารถลบผู้ใช้งานได้")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold transition-all ${
            toast.type === "success"
              ? "bg-emerald-500 text-white"
              : toast.type === "warning"
                ? "bg-amber-500 text-white"
                : "bg-red-500 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <UsersIcon className="size-5.5 text-primary" />
            การจัดการผู้ใช้งาน
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            จัดการข้อมูลของผู้ใช้งานในระบบ
          </p>
        </div>
      </div>

      {/* Stats bar */}
      {!loading && users.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-6 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <UsersIcon className="size-4.5 text-primary" />
            </div>
            <div>
              <div className="text-lg font-bold text-slate-800 leading-none">
                {users.length}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">ผู้ใช้งานทั้งหมด</div>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filters & Add */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-xs">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto flex-1">
          <SearchBar
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="ค้นหา..."
          />
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-all outline-none min-w-[220px] w-full sm:w-auto"
          >
            <option value="">ตำแหน่งทั้งหมด</option>
            {availableRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary/95 text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow transition-all cursor-pointer w-full sm:w-auto justify-center"
        >
          <Plus className="size-4" /> เพิ่มผู้ใช้งาน
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed">
            <colgroup>
              <col className="w-[80px]" />
              <col className="w-[12%]" />
              <col className="w-[20%]" />
              <col className="w-[15%]" />
              <col className="w-[23%]" />
              <col className="w-[15%]" />
              <col className="w-[100px]" />
            </colgroup>
            <thead>
              <tr className="bg-primary text-white text-xs font-semibold uppercase tracking-wider">
                <th className="px-5 py-3.5 text-center">รูปภาพ</th>
                <th className="px-5 py-3.5 text-center">รหัสพนักงาน</th>
                <th className="px-5 py-3.5 text-center">ชื่อ-นามสกุล</th>
                <th className="px-5 py-3.5 text-center">ตำแหน่ง</th>
                <th className="px-5 py-3.5 text-center">อีเมล</th>
                <th className="px-5 py-3.5 text-center">เบอร์โทรศัพท์</th>
                <th className="px-5 py-3.5 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 font-medium">
                    <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
                    <div>กำลังโหลดข้อมูล...</div>
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                        <UsersIcon className="size-7 text-slate-400" />
                      </div>
                      <div className="text-slate-400 text-sm font-medium">
                        {searchQuery || roleFilter ? "ไม่พบข้อมูลที่ค้นหา" : "ยังไม่มีข้อมูลผู้ใช้งาน"}
                      </div>
                      {!searchQuery && !roleFilter && (
                        <button
                          onClick={openAdd}
                          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold cursor-pointer hover:bg-primary/90 transition-colors"
                        >
                          <Plus className="size-3.5" /> เพิ่มผู้ใช้งานคนแรก
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-55/80 transition-colors">
                    {/* รูปภาพ */}
                    <td className="px-5 py-3.5 text-center">
                      <div className="size-[38px] rounded-full overflow-hidden border-2 border-primary/20 mx-auto bg-slate-100 flex items-center justify-center shrink-0">
                        <img
                          src={userService.getFileUrl(u.imageUrl) || "/image/profile.png"}
                          alt={u.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/image/profile.png"
                          }}
                        />
                      </div>
                    </td>
                    {/* รหัสพนักงาน */}
                    <td className="px-5 py-3.5 text-center whitespace-nowrap font-medium text-slate-700 font-mono">
                      {u.username || <span className="text-slate-400">-</span>}
                    </td>
                    {/* ชื่อ-นามสกุล */}
                    <td className="px-5 py-3.5 text-center font-semibold text-slate-800 truncate" title={u.name}>
                      {u.name}
                    </td>
                    {/* ตำแหน่ง */}
                    <td className="px-5 py-3.5 text-center text-slate-600 truncate" title={u.role?.description || u.role?.name}>
                      {u.role?.description || u.role?.name || <span className="text-slate-400">-</span>}
                    </td>
                    {/* อีเมล */}
                    <td className="px-5 py-3.5 text-center text-slate-600 truncate" title={u.email}>
                      {u.email}
                    </td>
                    {/* เบอร์โทรศัพท์ */}
                    <td className="px-5 py-3.5 text-center text-slate-600 font-mono">
                      {u.tel || <span className="text-slate-400">-</span>}
                    </td>
                    {/* จัดการ */}
                    <td className="px-5 py-3.5 text-center whitespace-nowrap">
                      <div className="flex justify-center gap-1">
                        {u.roleId === 2 && (
                          <button
                            onClick={() => openSpecialty(u)}
                            className="p-1.5 text-cyan-700 hover:text-cyan-900 hover:bg-cyan-50 rounded-lg transition-colors cursor-pointer"
                            title="ตั้งค่าความเชี่ยวชาญช่าง"
                          >
                            <Award className="size-4" />
                          </button>
                        )}
                        <button
                          onClick={() => openEdit(u)}
                          className="p-1.5 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="แก้ไข"
                        >
                          <Edit className="size-4" />
                        </button>
                        <button
                          onClick={() => confirmDelete(u)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50/80 rounded-lg transition-colors cursor-pointer"
                          title="ลบ"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredUsers.length > 0 && (
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredUsers.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setCurrentPage(1)
            }}
          />
        )}
      </div>

      {/* User Form Dialog */}
      {isFormOpen && (
        <UserFormDialog
          isOpen={isFormOpen}
          user={selectedForEdit}
          onClose={() => {
            setIsFormOpen(false)
            setSelectedForEdit(null)
          }}
          onSaved={() => {
            showToast("success", selectedForEdit ? "แก้ไขข้อมูลสำเร็จ" : "เพิ่มผู้ใช้งานสำเร็จ")
            void fetchUsers()
          }}
        />
      )}

      {/* Specialty Dialog */}
      {isSpecialtyOpen && selectedForSpecialty && (
        <SpecialtyDialog
          isOpen={isSpecialtyOpen}
          userId={selectedForSpecialty.id}
          userName={selectedForSpecialty.name}
          onClose={() => {
            setIsSpecialtyOpen(false)
            setSelectedForSpecialty(null)
          }}
          onSaved={() => {
            void fetchUsers()
          }}
        />
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDeleteDialog
        isOpen={isDeleteOpen}
        title="ยืนยันการลบผู้ใช้งาน"
        message="คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้งานคนนี้? ข้อมูลที่เกี่ยวข้องทั้งหมดอาจได้รับผลกระทบ"
        itemName={selectedForDelete?.name}
        loading={isDeleting}
        onConfirm={() => void handleDeleteConfirm()}
        onCancel={() => {
          setIsDeleteOpen(false)
          setSelectedForDelete(null)
        }}
      />
    </div>
  )
}

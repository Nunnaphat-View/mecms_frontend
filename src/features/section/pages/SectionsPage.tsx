import { useEffect, useState, useMemo } from "react";
import { Plus, Building2, Edit, Trash2 } from "lucide-react";
import TablePagination from "@/components/common/TablePagination";
import { useSectionStore } from "@/features/section/stores/sectionStore";
import { useHospitalStore } from "@/features/hospital/stores/hospitalStore";
import { useAuthStore } from "@/features/auth/stores/authStore";
import type { Section } from "@/types/tool";
import SectionFormDialog from "@/features/section/components/SectionFormDialog";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import SearchBar from "@/components/SearchBar";

// ── Toast notification ────────────────────────────────────────────────────────
type ToastType = "success" | "error" | "warning";
interface Toast {
  type: ToastType;
  message: string;
}

export default function SectionsPage() {
  const {
    sections,
    loading,
    searchQuery,
    fetchSections,
    addSection,
    updateSection,
    deleteSection,
    setSearchQuery,
  } = useSectionStore();

  const { hospitals, fetchHospitals } = useHospitalStore();
  const { user } = useAuthStore();

  // Hospital from logged-in user
  const userHospitalId = user?.hospitalId ?? 0;
  const userHospitalName = useMemo(() => {
    if (!userHospitalId) return undefined;
    return hospitals.find((h) => h.id === userHospitalId)?.name;
  }, [hospitals, userHospitalId]);

  // Toast
  const [toast, setToast] = useState<Toast | null>(null);

  // Form Dialog
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedForEdit, setSelectedForEdit] = useState<Section | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete Dialog
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<Section | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    void fetchSections();
    void fetchHospitals();
  }, [fetchSections, fetchHospitals]);

  // Admin check
  const isAdmin = useMemo(() => {
    if (!user) return false;
    return (
      user.roleId === 1 ||
      user.role?.name?.toLowerCase().includes("admin") ||
      user.role?.name?.includes("ผู้ดูแลระบบ")
    );
  }, [user]);

  function showToast(type: ToastType, message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }

  // Filter
  const filteredSections = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return sections;
    return sections.filter((s) =>
      s.name.toLowerCase().includes(q) ||
      (s.code ?? "").toLowerCase().includes(q) ||
      (s.description ?? "").toLowerCase().includes(q)
    );
  }, [sections, searchQuery]);

  // Paginated
  const paginatedSections = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSections.slice(start, start + pageSize);
  }, [filteredSections, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredSections.length / pageSize) || 1;

  function handleSearchChange(val: string) {
    setSearchQuery(val);
    setCurrentPage(1);
  }

  function openAdd() {
    setSelectedForEdit(null);
    setIsFormOpen(true);
  }

  function openEdit(section: Section) {
    setSelectedForEdit(section);
    setIsFormOpen(true);
  }

  async function handleSave(data: Omit<Section, "id">) {
    setIsSaving(true);
    try {
      if (selectedForEdit) {
        await updateSection(selectedForEdit.id, data);
        showToast("success", "แก้ไขข้อมูลหน่วยงานสำเร็จ");
      } else {
        await addSection(data);
        showToast("success", "เพิ่มหน่วยงานสำเร็จ");
      }
      setIsFormOpen(false);
      setSelectedForEdit(null);
    } catch (err) {
      console.error(err);
      showToast("error", selectedForEdit ? "แก้ไขข้อมูลล้มเหลว" : "เพิ่มหน่วยงานล้มเหลว");
    } finally {
      setIsSaving(false);
    }
  }

  function confirmDelete(section: Section) {
    setSelectedForDelete(section);
    setIsDeleteOpen(true);
  }

  async function handleDeleteConfirm() {
    if (!selectedForDelete) return;
    setIsDeleting(true);
    try {
      await deleteSection(selectedForDelete.id);
      showToast("success", "ลบหน่วยงานเรียบร้อยแล้ว");
      setIsDeleteOpen(false);
      setSelectedForDelete(null);
    } catch (err) {
      console.error(err);
      showToast("error", "ไม่สามารถลบหน่วยงานได้");
    } finally {
      setIsDeleting(false);
    }
  }

  // colSpan count
  const colCount = isAdmin ? 4 : 3;

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
            <Building2 className="size-5.5 text-primary" />
            ข้อมูลหน่วยงาน
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            จัดการข้อมูลหน่วยงานทั้งหมดในระบบ
          </p>
        </div>
      </div>

      {/* Stats bar */}
      {!loading && sections.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-6 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="size-4.5 text-primary" />
            </div>
            <div>
              <div className="text-lg font-bold text-slate-800 leading-none">
                {sections.length}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">หน่วยงานทั้งหมด</div>
            </div>
          </div>
        </div>
      )}

      {/* Search & Add */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-xs">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto flex-1">
          <SearchBar
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="ค้นหาหน่วยงาน ชื่อ รหัส..."
          />
        </div>
        {isAdmin && (
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary/95 text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow transition-all cursor-pointer w-full sm:w-auto justify-center"
          >
            <Plus className="size-4" /> เพิ่มหน่วยงาน
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed">
            <colgroup>
              <col className={isAdmin ? "w-1/4" : "w-1/3"} />
              <col className={isAdmin ? "w-1/4" : "w-1/3"} />
              <col className={isAdmin ? "w-1/4" : "w-1/3"} />
              {isAdmin && <col className="w-1/4" />}
            </colgroup>
            <thead>
              <tr className="bg-primary text-white text-xs font-semibold uppercase tracking-wider">
                <th className="px-5 py-3.5">
                  <span className="flex items-center gap-1.5">รหัสหน่วยงาน</span>
                </th>
                <th className="px-5 py-3.5">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="size-3.5" />
                    ชื่อย่อหน่วยงาน
                  </span>
                </th>
                <th className="px-5 py-3.5">ชื่อหน่่วยงาน</th>
                {isAdmin && (
                  <th className="px-5 py-3.5 text-center">จัดการ</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={colCount} className="px-6 py-12 text-center text-slate-500 font-medium">
                    <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
                    <div>กำลังโหลดข้อมูล...</div>
                  </td>
                </tr>
              ) : paginatedSections.length === 0 ? (
                <tr>
                  <td colSpan={colCount} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                        <Building2 className="size-7 text-slate-400" />
                      </div>
                      <div className="text-slate-400 text-sm font-medium">
                        {searchQuery ? "ไม่พบหน่วยงานที่ค้นหา" : "ยังไม่มีข้อมูลหน่วยงาน"}
                      </div>
                      {isAdmin && !searchQuery && (
                        <button
                          onClick={openAdd}
                          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold cursor-pointer hover:bg-primary/90 transition-colors"
                        >
                          <Plus className="size-3.5" /> เพิ่มหน่วยงานแรก
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedSections.map((section) => (
                  <tr key={section.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* รหัส */}
                    <td className="px-5 py-3.5 whitespace-nowrap font-medium text-slate-700 font-mono">
                      {section.code || <span className="text-slate-400">-</span>}
                    </td>
                    {/* ชื่อหน่วยงาน */}
                    <td className="px-5 py-3.5 font-semibold text-slate-800 truncate" title={section.name}>
                      {section.name}
                    </td>
                    {/* หมายเหตุ */}
                    <td className="px-5 py-3.5 truncate text-slate-600" title={section.description}>
                      {section.description || <span className="text-slate-400">-</span>}
                    </td>
                    {isAdmin && (
                      <td className="px-5 py-3.5 text-center whitespace-nowrap">
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => openEdit(section)}
                            className="p-1.5 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="แก้ไข"
                          >
                            <Edit className="size-4" />
                          </button>
                          <button
                            onClick={() => confirmDelete(section)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50/80 rounded-lg transition-colors cursor-pointer"
                            title="ลบ"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredSections.length > 0 && (
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredSections.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        )}
      </div>

      {/* Section Form Dialog */}
      <SectionFormDialog
        isOpen={isFormOpen}
        section={selectedForEdit}
        hospitalId={userHospitalId}
        hospitalName={userHospitalName}
        loading={isSaving}
        onSave={(data) => handleSave(data)}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedForEdit(null);
        }}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDeleteDialog
        isOpen={isDeleteOpen}
        title="ยืนยันการลบหน่วยงาน"
        message="คุณแน่ใจหรือไม่ว่าต้องการลบหน่วยงานนี้? ข้อมูลที่เกี่ยวข้องทั้งหมดอาจได้รับผลกระทบ"
        itemName={selectedForDelete?.name}
        loading={isDeleting}
        onConfirm={() => void handleDeleteConfirm()}
        onCancel={() => {
          setIsDeleteOpen(false);
          setSelectedForDelete(null);
        }}
      />
    </div>
  );
}

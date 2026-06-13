import { useEffect, useState, useMemo } from "react";
import {
  Plus,
  Hospital,
  Edit,
  Trash2,
  MapPin,
  ImageOff,
} from "lucide-react";
import TablePagination from "../components/common/TablePagination";
import { useHospitalStore } from "../stores/hospitalStore";
import { useAuthStore } from "../stores/authStore";
import type { Hospital as HospitalType } from "../types/tool";
import HospitalFormDialog from "../components/hospital/HospitalFormDialog";
import ConfirmDeleteDialog from "../components/common/ConfirmDeleteDialog";
import SearchBar from "../components/SearchBar";

// ── Toast notification ────────────────────────────────────────────────────────
type ToastType = "success" | "error" | "warning";
interface Toast {
  type: ToastType;
  message: string;
}

export default function HospitalsPage() {
  const {
    hospitals,
    loading,
    searchQuery,
    fetchHospitals,
    addHospital,
    updateHospital,
    deleteHospital,
    setSearchQuery,
  } = useHospitalStore();

  const { user } = useAuthStore();

  // Toast
  const [toast, setToast] = useState<Toast | null>(null);

  // Form Dialog
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedForEdit, setSelectedForEdit] = useState<HospitalType | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);

  // Delete Dialog
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedForDelete, setSelectedForDelete] =
    useState<HospitalType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    void fetchHospitals();
  }, [fetchHospitals]);

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
  const filteredHospitals = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return hospitals;

    return hospitals.filter((h) => {
      return (
        h.name.toLowerCase().includes(q) ||
        (h.code ?? "").toLowerCase().includes(q) ||
        (h.province ?? "").toLowerCase().includes(q) ||
        (h.district ?? "").toLowerCase().includes(q) ||
        (h.address ?? "").toLowerCase().includes(q)
      );
    });
  }, [hospitals, searchQuery]);

  // Paginated
  const paginatedHospitals = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredHospitals.slice(start, start + pageSize);
  }, [filteredHospitals, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredHospitals.length / pageSize) || 1;

  function handleSearchChange(val: string) {
    setSearchQuery(val);
    setCurrentPage(1);
  }

  // Add
  function openAdd() {
    setSelectedForEdit(null);
    setIsFormOpen(true);
  }

  // Edit
  function openEdit(hospital: HospitalType) {
    setSelectedForEdit(hospital);
    setIsFormOpen(true);
  }

  // Save (add or edit)
  async function handleSave(data: Omit<HospitalType, "id">, logoFile?: File | null) {
    setIsSaving(true);
    try {
      if (selectedForEdit) {
        await updateHospital(selectedForEdit.id, data, logoFile);
        showToast("success", "แก้ไขข้อมูลโรงพยาบาลสำเร็จ");
      } else {
        await addHospital(data, logoFile);
        showToast("success", "เพิ่มโรงพยาบาลสำเร็จ");
      }
      setIsFormOpen(false);
      setSelectedForEdit(null);
    } catch (err) {
      console.error(err);
      showToast(
        "error",
        selectedForEdit ? "แก้ไขข้อมูลล้มเหลว" : "เพิ่มโรงพยาบาลล้มเหลว",
      );
    } finally {
      setIsSaving(false);
    }
  }

  // Delete
  function confirmDelete(hospital: HospitalType) {
    setSelectedForDelete(hospital);
    setIsDeleteOpen(true);
  }

  async function handleDeleteConfirm() {
    if (!selectedForDelete) return;
    setIsDeleting(true);
    try {
      await deleteHospital(selectedForDelete.id);
      showToast("success", "ลบโรงพยาบาลเรียบร้อยแล้ว");
      setIsDeleteOpen(false);
      setSelectedForDelete(null);
    } catch (err) {
      console.error(err);
      showToast("error", "ไม่สามารถลบโรงพยาบาลได้");
    } finally {
      setIsDeleting(false);
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
            <Hospital className="size-5.5 text-primary" />
            ข้อมูลโรงพยาบาล
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            จัดการข้อมูลโรงพยาบาลทั้งหมดในระบบ
          </p>
        </div>
      </div>

      {/* Stats bar */}
      {!loading && hospitals.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-6 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Hospital className="size-4.5 text-primary" />
            </div>
            <div>
              <div className="text-lg font-bold text-slate-800 leading-none">
                {hospitals.length}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                โรงพยาบาลทั้งหมด
              </div>
            </div>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <MapPin className="size-4.5 text-blue-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-slate-800 leading-none">
                {new Set(hospitals.map((h) => h.province).filter(Boolean)).size}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">จังหวัด</div>
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
            placeholder="ค้นหาโรงพยาบาล ชื่อ รหัส จังหวัด..."
          />
        </div>
        {isAdmin && (
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary/95 text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow transition-all cursor-pointer w-full sm:w-auto justify-center"
          >
            <Plus className="size-4" /> เพิ่มโรงพยาบาล
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-primary text-white text-xs font-semibold uppercase tracking-wider">
                <th className="px-5 py-3.5 w-28">
                  <span className="flex items-center gap-1.5">รหัส</span>
                </th>
                <th className="px-5 py-3.5 w-16 text-center">ตรา</th>
                <th className="px-5 py-3.5">
                  <span className="flex items-center gap-1.5">
                    <Hospital className="size-3.5" />
                    ชื่อโรงพยาบาล
                  </span>
                </th>
                <th className="px-5 py-3.5">ที่อยู่</th>
                <th className="px-5 py-3.5">จังหวัด</th>
                <th className="px-5 py-3.5">อำเภอ/เขต</th>
                <th className="px-5 py-3.5">รหัสไปรษณีย์</th>
                {isAdmin && (
                  <th className="px-5 py-3.5 text-center w-24">จัดการ</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {loading ? (
                <tr>
                  <td
                    colSpan={isAdmin ? 8 : 7}
                    className="px-6 py-12 text-center text-slate-500 font-medium"
                  >
                    <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
                    <div>กำลังโหลดข้อมูล...</div>
                  </td>
                </tr>
              ) : paginatedHospitals.length === 0 ? (
                <tr>
                  <td
                    colSpan={isAdmin ? 8 : 7}
                    className="px-6 py-16 text-center"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                        <Hospital className="size-7 text-slate-400" />
                      </div>
                      <div className="text-slate-400 text-sm font-medium">
                        {searchQuery
                          ? "ไม่พบโรงพยาบาลที่ค้นหา"
                          : "ยังไม่มีข้อมูลโรงพยาบาล"}
                      </div>
                      {isAdmin && !searchQuery && (
                        <button
                          onClick={openAdd}
                          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold cursor-pointer hover:bg-primary/90 transition-colors"
                        >
                          <Plus className="size-3.5" /> เพิ่มโรงพยาบาลแรก
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedHospitals.map((hospital) => (
                  <tr
                    key={hospital.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    {/* รหัส */}
                    <td className="px-5 py-3.5 whitespace-nowrap font-medium text-slate-700 font-mono">
                      {hospital.code || <span className="text-slate-400">-</span>}
                    </td>
                    {/* ตรา */}
                    <td className="px-5 py-3.5 text-center">
                      <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-100 mx-auto border border-slate-200 flex items-center justify-center">
                        {hospital.logoUrl ? (
                          <img
                            src={hospital.logoUrl}
                            alt={`โลโก้ ${hospital.name}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none"
                              e.currentTarget.nextElementSibling?.classList.remove("hidden")
                            }}
                          />
                        ) : null}
                        <ImageOff className={`size-5 text-slate-400 ${hospital.logoUrl ? "hidden" : ""}`} />
                      </div>
                    </td>
                    {/* ชื่อโรงพยาบาล */}
                    <td className="px-5 py-3.5 font-semibold text-slate-800 whitespace-nowrap">
                      {hospital.name}
                    </td>
                    {/* ที่อยู่ */}
                    <td className="px-5 py-3.5 max-w-[200px] truncate text-slate-600" title={hospital.address}>
                      {hospital.address || <span className="text-slate-400">-</span>}
                    </td>
                    {/* จังหวัด */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {hospital.province ? (
                        <span className="inline-flex items-center gap-1 text-slate-700">
                          <MapPin className="size-3 text-slate-400 flex-shrink-0" />
                          {hospital.province}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    {/* อำเภอ/เขต */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-slate-600">
                      {hospital.district || <span className="text-slate-400">-</span>}
                    </td>
                    {/* รหัสไปรษณีย์ */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-slate-600">
                      {hospital.zipCode || <span className="text-slate-400">-</span>}
                    </td>
                    {isAdmin && (
                      <td className="px-5 py-3.5 text-center whitespace-nowrap">
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => openEdit(hospital)}
                            className="p-1.5 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="แก้ไข"
                          >
                            <Edit className="size-4" />
                          </button>
                          <button
                            onClick={() => confirmDelete(hospital)}
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
        {filteredHospitals.length > 0 && (
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredHospitals.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        )}
      </div>

      {/* Hospital Form Dialog */}
      <HospitalFormDialog
        isOpen={isFormOpen}
        hospital={selectedForEdit}
        loading={isSaving}
        onSave={(data, logoFile) => handleSave(data, logoFile)}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedForEdit(null);
        }}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDeleteDialog
        isOpen={isDeleteOpen}
        title="ยืนยันการลบโรงพยาบาล"
        message="คุณแน่ใจหรือไม่ว่าต้องการลบโรงพยาบาลนี้? ข้อมูลที่เกี่ยวข้องทั้งหมดอาจได้รับผลกระทบ"
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

import { useEffect, useState } from "react"
import { Plus, Edit2, Trash2, Check, X, ClipboardList, FileText, Settings2 } from "lucide-react"
import { checklistService } from "../services/checklistService"
import type { ChecklistCategoryApi, ChecklistItemApi } from "../services/pmService"
import { useChecklistStore } from "../stores/checklistStore"
import AddCategoryDialog from "../components/pm/AddCategoryDialog"
import ConfirmDeleteDialog from "../components/common/ConfirmDeleteDialog"

// ── Toast notification ────────────────────────────────────────────────────────
type ToastType = "success" | "error" | "warning"
interface Toast {
  type: ToastType
  message: string
}

export default function PmChecklistPage() {
  const { categories, loading, fetchCategories, updateNewItemDescription } = useChecklistStore()

  const [toast, setToast] = useState<Toast | null>(null)

  // Edit Category state
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null)
  const [editCategoryName, setEditCategoryName] = useState("")
  const [editCategoryOrder, setEditCategoryOrder] = useState(0)

  // Edit Item state
  const [editingItemId, setEditingItemId] = useState<number | null>(null)
  const [editItemDescription, setEditItemDescription] = useState("")
  const [editItemOrder, setEditItemOrder] = useState(0)

  // Add Category Dialog
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [savingCategory, setSavingCategory] = useState(false)

  // Delete Category
  const [deleteCategoryOpen, setDeleteCategoryOpen] = useState(false)
  const [deletingCategory, setDeletingCategory] = useState<ChecklistCategoryApi | null>(null)
  const [deletingCategoryLoading, setDeletingCategoryLoading] = useState(false)

  // Delete Item
  const [deleteItemOpen, setDeleteItemOpen] = useState(false)
  const [deletingItem, setDeletingItem] = useState<ChecklistItemApi | null>(null)
  const [deletingItemLoading, setDeletingItemLoading] = useState(false)

  // Load on mount — fetchCategories is a Zustand action (no React setState in effect)
  useEffect(() => {
    void fetchCategories()
  }, [fetchCategories])

  function showToast(type: ToastType, message: string) {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  // ── Category CRUD ─────────────────────────────────────────────────────────

  function startCategoryEdit(cat: ChecklistCategoryApi) {
    setEditingCategoryId(cat.id)
    setEditCategoryName(cat.name)
    setEditCategoryOrder(cat.display_order)
  }

  async function saveCategoryEdit(id: number) {
    if (!editCategoryName.trim()) {
      showToast("warning", "กรุณากรอกชื่อหมวดหมู่")
      return
    }
    try {
      await checklistService.updateCategory(id, {
        name: editCategoryName,
        display_order: editCategoryOrder,
      })
      showToast("success", "แก้ไขหมวดหมู่สำเร็จ")
      setEditingCategoryId(null)
      await fetchCategories()
    } catch (err) {
      console.error(err)
      showToast("error", "แก้ไขหมวดหมู่ล้มเหลว")
    }
  }

  async function handleAddCategory(payload: { name: string; display_order: number }) {
    setSavingCategory(true)
    try {
      await checklistService.createCategory(payload)
      showToast("success", "เพิ่มหมวดหมู่สำเร็จ")
      setShowAddDialog(false)
      await fetchCategories()
    } catch (err) {
      console.error(err)
      showToast("error", "เพิ่มหมวดหมู่ล้มเหลว")
    } finally {
      setSavingCategory(false)
    }
  }

  function confirmDeleteCategory(cat: ChecklistCategoryApi) {
    setDeletingCategory(cat)
    setDeleteCategoryOpen(true)
  }

  async function doDeleteCategory() {
    if (!deletingCategory) return
    setDeletingCategoryLoading(true)
    try {
      await checklistService.deleteCategory(deletingCategory.id)
      showToast("success", "ลบหมวดหมู่เรียบร้อยแล้ว")
      await fetchCategories()
    } catch (err) {
      console.error(err)
      showToast("error", "ไม่สามารถลบหมวดหมู่ได้")
    } finally {
      setDeletingCategoryLoading(false)
      setDeleteCategoryOpen(false)
      setDeletingCategory(null)
    }
  }

  // ── Item CRUD ─────────────────────────────────────────────────────────────

  function startItemEdit(item: ChecklistItemApi) {
    setEditingItemId(item.id)
    setEditItemDescription(item.description)
    setEditItemOrder(item.display_order)
  }

  async function saveItemEdit(id: number) {
    if (!editItemDescription.trim()) {
      showToast("warning", "กรุณากรอกรายละเอียดรายการตรวจ")
      return
    }
    try {
      await checklistService.updateItem(id, {
        description: editItemDescription,
        display_order: editItemOrder,
      })
      showToast("success", "แก้ไขรายการตรวจสำเร็จ")
      setEditingItemId(null)
      await fetchCategories()
    } catch (err) {
      console.error(err)
      showToast("error", "แก้ไขรายการตรวจล้มเหลว")
    }
  }

  async function handleAddItem(categoryId: number) {
    const cat = categories.find((c) => c.id === categoryId)
    if (!cat || !cat.newItemDescription.trim()) {
      showToast("warning", "กรุณากรอกข้อความเพื่อเพิ่มรายการตรวจ")
      return
    }
    const maxOrder = cat.items.reduce((max, item) => Math.max(max, item.display_order), 0)
    try {
      await checklistService.createItem({
        category_id: categoryId,
        description: cat.newItemDescription,
        display_order: maxOrder + 1,
      })
      showToast("success", "เพิ่มรายการตรวจสำเร็จ")
      await fetchCategories()
    } catch (err) {
      console.error(err)
      showToast("error", "เพิ่มรายการตรวจล้มเหลว")
    }
  }

  function confirmDeleteItem(item: ChecklistItemApi) {
    setDeletingItem(item)
    setDeleteItemOpen(true)
  }

  async function doDeleteItem() {
    if (!deletingItem) return
    setDeletingItemLoading(true)
    try {
      await checklistService.deleteItem(deletingItem.id)
      showToast("success", "ลบรายการตรวจเรียบร้อยแล้ว")
      await fetchCategories()
    } catch (err) {
      console.error(err)
      showToast("error", "ไม่สามารถลบรายการตรวจได้")
    } finally {
      setDeletingItemLoading(false)
      setDeleteItemOpen(false)
      setDeletingItem(null)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

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
            <ClipboardList className="size-5.5 text-primary" />
            จัดการรายการตรวจสภาพภายนอก
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            ตั้งค่ารายการตรวจสอบสภาพภายนอก สำหรับใช้ในการทำรายงาน
          </p>
        </div>
        <button
          onClick={() => setShowAddDialog(true)}
          className="flex items-center gap-2 px-5 py-2 bg-primary hover:bg-primary/95 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer w-full sm:w-auto justify-center"
        >
          <Plus className="size-4" />
          เพิ่มหมวดหมู่ใหม่
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs flex items-center justify-center py-20 text-slate-500 text-sm gap-3">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          กำลังโหลดข้อมูล...
        </div>
      )}

      {/* Empty */}
      {!loading && categories.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
            <ClipboardList className="size-7 text-slate-400" />
          </div>
          <div className="text-slate-500 text-sm font-medium">ยังไม่มีหมวดหมู่รายการตรวจ</div>
          <button
            onClick={() => setShowAddDialog(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold cursor-pointer hover:bg-primary/90 transition-colors"
          >
            <Plus className="size-3.5" /> เพิ่มหมวดหมู่แรก
          </button>
        </div>
      )}

      {/* Stats bar */}
      {!loading && categories.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-6 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Settings2 className="size-4.5 text-primary" />
            </div>
            <div>
              <div className="text-lg font-bold text-slate-800 leading-none">{categories.length}</div>
              <div className="text-xs text-slate-500 mt-0.5">หมวดหมู่</div>
            </div>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
              <FileText className="size-4.5 text-amber-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-slate-800 leading-none">
                {categories.reduce((sum, c) => sum + c.items.length, 0)}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">รายการตรวจทั้งหมด</div>
            </div>
          </div>
        </div>
      )}

      {/* Category Cards */}
      {!loading && categories.length > 0 && (
        <div className="flex flex-col gap-5">
          {categories.map((cat, catIdx) => (
            <div key={cat.id} className="flex flex-col gap-3">

              {/* Category title row — outside the table card */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  {/* Index badge */}
                  <span className="w-6 h-6 rounded-md bg-primary text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {catIdx + 1}
                  </span>

                  {editingCategoryId === cat.id ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <input
                        type="text"
                        value={editCategoryName}
                        onChange={(e) => setEditCategoryName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") void saveCategoryEdit(cat.id)
                          if (e.key === "Escape") setEditingCategoryId(null)
                        }}
                        autoFocus
                        className="h-8 px-3 border border-primary/50 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[200px] bg-white"
                        placeholder="ชื่อหมวดหมู่"
                      />
                      <input
                        type="number"
                        value={editCategoryOrder}
                        onChange={(e) => setEditCategoryOrder(Number(e.target.value))}
                        className="h-8 w-16 px-2 border border-slate-300 rounded-lg text-sm text-center focus:outline-none focus:border-primary bg-white"
                      />
                      <button onClick={() => void saveCategoryEdit(cat.id)} className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors cursor-pointer" title="บันทึก">
                        <Check className="size-3.5" />
                      </button>
                      <button onClick={() => setEditingCategoryId(null)} className="p-1.5 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-colors cursor-pointer" title="ยกเลิก">
                        <X className="size-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-bold text-slate-800 text-sm">{cat.name}</span>
                      <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full flex-shrink-0">
                        {cat.items.length} รายการ
                      </span>
                      <button
                        onClick={() => startCategoryEdit(cat)}
                        className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                        title="แก้ไขหมวดหมู่"
                      >
                        <Edit2 className="size-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {editingCategoryId !== cat.id && (
                  <button
                    onClick={() => confirmDeleteCategory(cat)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-rose-500 hover:bg-rose-50 border border-rose-100 hover:border-rose-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex-shrink-0"
                  >
                    <Trash2 className="size-3.5" />
                    ลบหมวดหมู่
                  </button>
                )}
              </div>

              {/* Table card — same pattern as ToolsPage */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-primary text-white text-xs font-semibold uppercase tracking-wider">
                        <th className="px-5 py-3.5 w-24 text-center">ลำดับ</th>
                        <th className="px-5 py-3.5">รายละเอียดรายการตรวจ</th>
                        <th className="px-5 py-3.5 w-32 text-center">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm text-slate-700">

                      {cat.items.length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-6 py-10 text-center text-slate-400 text-xs font-medium">
                            ยังไม่มีรายการตรวจในหมวดหมู่นี้
                          </td>
                        </tr>
                      )}

                      {cat.items.map((item) => (
                        <tr
                          key={item.id}
                          className={`transition-colors group ${
                            editingItemId === item.id ? "bg-blue-50/60" : "hover:bg-slate-50/80"
                          }`}
                        >
                          <td className="px-5 py-3.5 text-center">
                            {editingItemId === item.id ? (
                              <input
                                type="number"
                                value={editItemOrder}
                                onChange={(e) => setEditItemOrder(Number(e.target.value))}
                                className="w-14 h-8 px-2 border border-slate-300 rounded-lg text-sm text-center focus:outline-none focus:border-primary mx-auto block bg-white"
                              />
                            ) : (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 text-slate-600 text-xs font-bold">
                                {item.display_order}
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-3.5">
                            {editingItemId === item.id ? (
                              <input
                                type="text"
                                value={editItemDescription}
                                onChange={(e) => setEditItemDescription(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") void saveItemEdit(item.id)
                                  if (e.key === "Escape") setEditingItemId(null)
                                }}
                                autoFocus
                                className="w-full h-8 px-3 border border-primary/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                                placeholder="ข้อความรายละเอียด"
                              />
                            ) : (
                              <span className="text-slate-700">{item.description}</span>
                            )}
                          </td>

                          <td className="px-5 py-3.5 text-center">
                            {editingItemId === item.id ? (
                              <div className="flex items-center justify-center gap-1.5">
                                <button onClick={() => void saveItemEdit(item.id)} className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors cursor-pointer" title="บันทึก">
                                  <Check className="size-3.5" />
                                </button>
                                <button onClick={() => setEditingItemId(null)} className="p-1.5 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-colors cursor-pointer" title="ยกเลิก">
                                  <X className="size-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => startItemEdit(item)} className="p-1.5 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors cursor-pointer" title="แก้ไข">
                                  <Edit2 className="size-4" />
                                </button>
                                <button onClick={() => confirmDeleteItem(item)} className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50/80 rounded-lg transition-colors cursor-pointer" title="ลบ">
                                  <Trash2 className="size-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}

                      {/* Add New Item Row */}
                      <tr className="bg-slate-50/60 border-t border-dashed border-slate-200">
                        <td className="px-5 py-3 text-center">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-primary/10 text-primary text-xs font-bold">
                            {cat.items.reduce((max, i) => Math.max(max, i.display_order), 0) + 1}
                          </span>
                        </td>
                        <td colSpan={2} className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={cat.newItemDescription}
                              onChange={(e) => updateNewItemDescription(cat.id, e.target.value)}
                              onKeyDown={(e) => { if (e.key === "Enter") void handleAddItem(cat.id) }}
                              placeholder="พิมพ์รายการตรวจใหม่..."
                              className="flex-1 min-w-0 h-8 px-3 border border-dashed border-slate-300 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 bg-white placeholder:text-slate-400 transition-all"
                            />
                            <button
                              onClick={() => void handleAddItem(cat.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-sm flex-shrink-0"
                            >
                              <Plus className="size-3.5" />
                              เพิ่มรายการ
                            </button>
                          </div>
                        </td>
                      </tr>

                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Add Category Dialog */}
      <AddCategoryDialog
        isOpen={showAddDialog}
        defaultOrder={categories.length + 1}
        loading={savingCategory}
        onSave={(payload) => void handleAddCategory(payload)}
        onClose={() => setShowAddDialog(false)}
      />

      {/* Confirm Delete Category */}
      <ConfirmDeleteDialog
        isOpen={deleteCategoryOpen}
        title="ยืนยันการลบหมวดหมู่"
        message="คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่และรายการตรวจเช็คทั้งหมดภายใต้หมวดหมู่นี้?"
        itemName={deletingCategory?.name}
        loading={deletingCategoryLoading}
        onConfirm={() => void doDeleteCategory()}
        onCancel={() => {
          setDeleteCategoryOpen(false)
          setDeletingCategory(null)
        }}
      />

      {/* Confirm Delete Item */}
      <ConfirmDeleteDialog
        isOpen={deleteItemOpen}
        title="ยืนยันการลบรายการตรวจ"
        message="คุณแน่ใจหรือไม่ว่าต้องการลบรายการตรวจนี้?"
        itemName={deletingItem?.description}
        loading={deletingItemLoading}
        onConfirm={() => void doDeleteItem()}
        onCancel={() => {
          setDeleteItemOpen(false)
          setDeletingItem(null)
        }}
      />
    </div>
  )
}

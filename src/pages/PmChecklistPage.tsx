import { useEffect, useState, useCallback } from "react"
import { Plus, Edit2, Trash2, Check, X, ClipboardList } from "lucide-react"
import { checklistService } from "../services/checklistService"
import type { ChecklistCategoryApi, ChecklistItemApi } from "../services/pmService"
import AddCategoryDialog from "../components/pm/AddCategoryDialog"
import ConfirmDeleteDialog from "../components/common/ConfirmDeleteDialog"

interface ExtendedCategory extends ChecklistCategoryApi {
  newItemDescription: string
}

// ── Toast notification ────────────────────────────────────────────────────────
type ToastType = "success" | "error" | "warning"
interface Toast {
  type: ToastType
  message: string
}

export default function PmChecklistPage() {
  const [categories, setCategories] = useState<ExtendedCategory[]>([])
  const [loading, setLoading] = useState(false)
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

  function showToast(type: ToastType, message: string) {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await checklistService.getCategories()
      setCategories(
        data.map((cat) => ({
          ...cat,
          newItemDescription: "",
        })),
      )
    } catch (err) {
      console.error(err)
      showToast("error", "ไม่สามารถโหลดข้อมูล PM Checklist ได้")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])
  // ── Category CRUD ─────────────────────────────────────────────────────────

  function startCategoryEdit(cat: ChecklistCategoryApi) {
    setEditingCategoryId(cat.id)
    setEditCategoryName(cat.name)
    setEditCategoryOrder(cat.display_order)
  }

  function cancelCategoryEdit() {
    setEditingCategoryId(null)
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
      await loadData()
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
      await loadData()
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
      await loadData()
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

  function cancelItemEdit() {
    setEditingItemId(null)
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
      await loadData()
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
      await loadData()
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
      await loadData()
    } catch (err) {
      console.error(err)
      showToast("error", "ไม่สามารถลบรายการตรวจได้")
    } finally {
      setDeletingItemLoading(false)
      setDeleteItemOpen(false)
      setDeletingItem(null)
    }
  }

  function updateNewItemDescription(categoryId: number, value: string) {
    setCategories((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, newItemDescription: value } : c)),
    )
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
        <div className="flex items-center justify-center py-16 text-slate-500 text-sm gap-3">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          กำลังโหลดข้อมูล...
        </div>
      )}

      {/* Empty */}
      {!loading && categories.length === 0 && (
        <div className="flex items-center justify-center py-16 text-slate-400 text-sm">
          ไม่มีข้อมูลหมวดหมู่
        </div>
      )}

      {/* Category Cards */}
      {!loading && categories.length > 0 && (
        <div className="flex flex-col gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden"
            >
              {/* Category Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {editingCategoryId === cat.id ? (
                    <>
                      <input
                        type="text"
                        value={editCategoryName}
                        onChange={(e) => setEditCategoryName(e.target.value)}
                        className="h-9 px-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary min-w-[220px]"
                        placeholder="ชื่อหมวดหมู่"
                      />
                      <input
                        type="number"
                        value={editCategoryOrder}
                        onChange={(e) => setEditCategoryOrder(Number(e.target.value))}
                        className="h-9 w-20 px-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        placeholder="ลำดับ"
                      />
                      <button
                        onClick={() => void saveCategoryEdit(cat.id)}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        title="บันทึก"
                      >
                        <Check className="size-4" />
                      </button>
                      <button
                        onClick={cancelCategoryEdit}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="ยกเลิก"
                      >
                        <X className="size-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="font-bold text-slate-800 text-sm">{cat.name}</span>
                      <span className="text-xs text-slate-400">(ลำดับ: {cat.display_order})</span>
                      <button
                        onClick={() => startCategoryEdit(cat)}
                        className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="แก้ไขหมวดหมู่"
                      >
                        <Edit2 className="size-3.5" />
                      </button>
                    </>
                  )}
                </div>
                <button
                  onClick={() => confirmDeleteCategory(cat)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-rose-500 hover:bg-rose-50 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Trash2 className="size-3.5" />
                  ลบหมวดหมู่
                </button>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-primary text-white text-xs font-semibold">
                      <th className="px-5 py-3 w-24 text-center">ลำดับแสดงผล</th>
                      <th className="px-5 py-3">รายละเอียดรายการตรวจ</th>
                      <th className="px-5 py-3 w-36 text-center">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                    {cat.items.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-5 py-6 text-center text-slate-400 text-xs">
                          ไม่มีรายการตรวจเช็คในหมวดหมู่นี้
                        </td>
                      </tr>
                    )}
                    {cat.items.map((item) => (
                      <tr
                        key={item.id}
                        className={`transition-colors ${
                          editingItemId === item.id ? "bg-blue-50" : "hover:bg-slate-50/80"
                        }`}
                      >
                        {/* Display Order */}
                        <td className="px-5 py-3 text-center">
                          {editingItemId === item.id ? (
                            <input
                              type="number"
                              value={editItemOrder}
                              onChange={(e) => setEditItemOrder(Number(e.target.value))}
                              className="w-16 h-8 px-2 border border-slate-300 rounded-lg text-sm text-center focus:outline-none focus:border-primary mx-auto block"
                            />
                          ) : (
                            <span className="font-medium">{item.display_order}</span>
                          )}
                        </td>

                        {/* Description */}
                        <td className="px-5 py-3">
                          {editingItemId === item.id ? (
                            <input
                              type="text"
                              value={editItemDescription}
                              onChange={(e) => setEditItemDescription(e.target.value)}
                              className="w-full h-8 px-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-primary"
                              placeholder="ข้อความรายละเอียด"
                            />
                          ) : (
                            item.description
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3 text-center">
                          {editingItemId === item.id ? (
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => void saveItemEdit(item.id)}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                title="บันทึก"
                              >
                                <Check className="size-4" />
                              </button>
                              <button
                                onClick={cancelItemEdit}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="ยกเลิก"
                              >
                                <X className="size-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => startItemEdit(item)}
                                className="p-1.5 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                title="แก้ไข"
                              >
                                <Edit2 className="size-4" />
                              </button>
                              <button
                                onClick={() => confirmDeleteItem(item)}
                                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="ลบ"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}

                    {/* Add New Item Row */}
                    <tr className="bg-slate-50">
                      <td className="px-5 py-3 text-center text-xs font-bold text-slate-500">
                        {cat.items.reduce((max, i) => Math.max(max, i.display_order), 0) + 1}
                      </td>
                      <td className="px-5 py-3">
                        <input
                          type="text"
                          value={cat.newItemDescription}
                          onChange={(e) => updateNewItemDescription(cat.id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") void handleAddItem(cat.id)
                          }}
                          placeholder="เพิ่มรายการตรวจใหม่..."
                          className="w-full h-8 px-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
                        />
                      </td>
                      <td className="px-5 py-3 text-center">
                        <button
                          onClick={() => void handleAddItem(cat.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer mx-auto"
                        >
                          <Plus className="size-3.5" />
                          เพิ่มรายการ
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
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

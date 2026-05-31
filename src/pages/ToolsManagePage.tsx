import { useState, useEffect, useMemo } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { Settings2, Plus, Edit, Trash2 } from "lucide-react"

import SearchBar from "../components/SearchBar"
import TablePagination from "../components/common/TablePagination"
import ConfirmDeleteDialog from "../components/common/ConfirmDeleteDialog"
import { CalibrationCostDialog } from "../components/tools/CalibrationCostDialog"
import { CalibrationProcessDialog } from "../components/tools/CalibrationProcessDialog"

import { useToolStore } from "../stores/toolStore"
import { useAuthStore } from "../stores/authStore"
import type { CalibrationProcess, CalibrationCost } from "../types/tool"
import { useToast } from "@/hooks/useToast"
import {
  calibrationProcessService,
  calibrationCostService,
} from "../services/calibrationMgmtService"

interface PageInfo {
  title: string
  caption: string
}

const TOOL_MANAGEMENT_TABS: Record<string, PageInfo> = {
  calibration: {
    title: "กระบวนการสอบเทียบ",
    caption: "จัดการและรายละเอียดกระบวนการสอบเทียบได้อย่างเป็นระบบ",
  },
  settings: {
    title: "ตั้งค่าเครื่องมือแพทย์",
    caption: "จัดการและกำหนดค่าเครื่องมือแพทย์ให้พร้อมสำหรับการใช้งานได้อย่างสะดวก",
  },
  cost: {
    title: "ค่าใช้จ่ายในการสอบเทียบ",
    caption: "บันทึกและจัดการค่าใช้จ่ายที่เกี่ยวข้องกับการสอบเทียบได้อย่างเป็นระบบ",
  },
}

export default function ToolsManagePage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { tools, fetchTools } = useToolStore()
  const { user } = useAuthStore()
  const toast = useToast()

  const activeTab = (searchParams.get("tab") as "calibration" | "settings" | "cost") || "calibration"

  const pageInfo = useMemo(() => {
    return (
      TOOL_MANAGEMENT_TABS[activeTab] ?? {
        title: "จัดการเครื่องมือ",
        caption: "Tool Management",
      }
    )
  }, [activeTab])

  const isAdmin = useMemo(() => {
    if (!user) return false
    return (
      user.roleId === 1 ||
      user.role?.name?.toLowerCase().includes("admin") ||
      user.role?.name?.includes("ผู้ดูแลระบบ")
    )
  }, [user])

  // Lists State
  const [processes, setProcesses] = useState<CalibrationProcess[]>([])
  const [costs, setCosts] = useState<CalibrationCost[]>([])
  const [loadingList, setLoadingList] = useState(true)

  // Search States
  const [processSearch, setProcessSearch] = useState("")
  const [settingsSearch, setSettingsSearch] = useState("")
  const [selectedSettingType, setSelectedSettingType] = useState("")
  const [costSearch, setCostSearch] = useState("")

  // Pagination States
  const [processPage, setProcessPage] = useState(1)
  const [processPageSize, setProcessPageSize] = useState(10)
  const [settingsPageNum, setSettingsPageNum] = useState(1)
  const [settingsPageSize, setSettingsPageSize] = useState(10)
  const [costPage, setCostPage] = useState(1)
  const [costPageSize, setCostPageSize] = useState(10)

  // Dialog & Form States
  const [showAddProcess, setShowAddProcess] = useState(false)
  const [editingProcess, setEditingProcess] = useState<CalibrationProcess | null>(null)
  const [deleteProcessTarget, setDeleteProcessTarget] = useState<CalibrationProcess | null>(null)

  const [showAddCost, setShowAddCost] = useState(false)
  const [editingCost, setEditingCost] = useState<CalibrationCost | null>(null)
  const [deleteCostTarget, setDeleteCostTarget] = useState<CalibrationCost | null>(null)

  const [actionLoading, setActionLoading] = useState(false)

  // Fetch Processes & Costs
  const loadProcesses = async () => {
    try {
      const data = await calibrationProcessService.getAll()
      setProcesses(data)
    } catch (e) {
      console.error("Failed to load processes:", e)
    }
  }

  const loadCosts = async () => {
    try {
      const data = await calibrationCostService.getAll()
      setCosts(data)
    } catch (e) {
      console.error("Failed to load costs:", e)
    }
  }

  useEffect(() => {
    let active = true
    const init = async () => {
      try {
        await Promise.all([fetchTools(), loadProcesses(), loadCosts()])
      } finally {
        if (active) setLoadingList(false)
      }
    }
    void init()
    return () => {
      active = false
    }
  }, [fetchTools])

  // Unique types options for settings tab
  const uniqueTypes = useMemo(() => {
    const types = new Set<string>()
    tools.forEach((t) => {
      if (t.type && t.type !== "-") types.add(t.type)
    })
    return Array.from(types)
  }, [tools])

  // --- Filtering & Sorting & Pagination Calculations ---

  // 1. Calibration Processes
  const filteredProcesses = useMemo(() => {
    const q = processSearch.toLowerCase().trim()
    if (!q) return processes
    return processes.filter(
      (p) =>
        p.parameter_name.toLowerCase().includes(q) ||
        p.unit.toLowerCase().includes(q) ||
        (p.standardTool ? `${p.standardTool.name}-${p.standardTool.manufacturer}` : "")
          .toLowerCase()
          .includes(q) ||
        p.procedure.toLowerCase().includes(q)
    )
  }, [processes, processSearch])

  const paginatedProcesses = useMemo(() => {
    const start = (processPage - 1) * processPageSize
    return filteredProcesses.slice(start, start + processPageSize)
  }, [filteredProcesses, processPage, processPageSize])

  const totalProcessPages = Math.ceil(filteredProcesses.length / processPageSize) || 1

  // 2. Settings Unique Tools
  const uniqueTools = useMemo(() => {
    const seen = new Set<string>()
    return tools
      .filter((t) => {
        const normalizedName = t.name.trim().toLowerCase()
        if (seen.has(normalizedName)) return false
        seen.add(normalizedName)
        return true
      })
      .map((t) => ({
        name: t.name.trim(),
        type: t.type,
        department: t.department,
      }))
  }, [tools])

  const filteredUniqueTools = useMemo(() => {
    return uniqueTools.filter((t) => {
      const matchSearch =
        !settingsSearch || t.name.toLowerCase().includes(settingsSearch.toLowerCase().trim())
      const matchType = !selectedSettingType || t.type === selectedSettingType
      return matchSearch && matchType
    })
  }, [uniqueTools, settingsSearch, selectedSettingType])

  const paginatedUniqueTools = useMemo(() => {
    const start = (settingsPageNum - 1) * settingsPageSize
    return filteredUniqueTools.slice(start, start + settingsPageSize)
  }, [filteredUniqueTools, settingsPageNum, settingsPageSize])

  const totalSettingsPages = Math.ceil(filteredUniqueTools.length / settingsPageSize) || 1

  // 3. Calibration Costs
  const filteredCosts = useMemo(() => {
    const q = costSearch.toLowerCase().trim()
    if (!q) return costs
    return costs.filter(
      (c) => c.tool_name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
    )
  }, [costs, costSearch])

  const paginatedCosts = useMemo(() => {
    const start = (costPage - 1) * costPageSize
    return filteredCosts.slice(start, start + costPageSize)
  }, [filteredCosts, costPage, costPageSize])

  const totalCostPages = Math.ceil(filteredCosts.length / costPageSize) || 1

  // --- Handlers ---

  // Calibration Process
  const openEditProcess = (proc: CalibrationProcess) => {
    setEditingProcess(proc)
    setShowAddProcess(true)
  }

  const handleProcessSaved = async (data: Omit<CalibrationProcess, "id">) => {
    setActionLoading(true)
    try {
      if (editingProcess) {
        await calibrationProcessService.update(editingProcess.id, data)
      } else {
        await calibrationProcessService.create(data)
      }
      await loadProcesses()
      setShowAddProcess(false)
      setEditingProcess(null)
      toast.success("บันทึกข้อมูลกระบวนการสอบเทียบสำเร็จ")
    } catch (err) {
      console.error(err)
      toast.error("ไม่สามารถบันทึกข้อมูลได้")
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteProcessConfirm = async () => {
    if (!deleteProcessTarget) return
    setActionLoading(true)
    try {
      await calibrationProcessService.remove(deleteProcessTarget.id)
      await loadProcesses()
      setDeleteProcessTarget(null)
      toast.success("ลบข้อมูลกระบวนการสอบเทียบสำเร็จ")
    } catch (err) {
      console.error(err)
      toast.error("ลบข้อมูลล้มเหลว")
    } finally {
      setActionLoading(false)
    }
  }

  // Calibration Cost
  const openEditCost = (cost: CalibrationCost) => {
    setEditingCost(cost)
    setShowAddCost(true)
  }

  const handleCostSaved = async (data: Omit<CalibrationCost, "id">) => {
    setActionLoading(true)
    try {
      if (editingCost) {
        await calibrationCostService.update(editingCost.id, data)
      } else {
        await calibrationCostService.create(data)
      }
      await loadCosts()
      setShowAddCost(false)
      setEditingCost(null)
      toast.success("บันทึกข้อมูลค่าใช้จ่ายสำเร็จ")
    } catch (err) {
      console.error(err)
      toast.error("ไม่สามารถบันทึกข้อมูลได้")
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteCostConfirm = async () => {
    if (!deleteCostTarget) return
    setActionLoading(true)
    try {
      await calibrationCostService.remove(deleteCostTarget.id)
      await loadCosts()
      setDeleteCostTarget(null)
      toast.success("ลบข้อมูลค่าใช้จ่ายสำเร็จ")
    } catch (err) {
      console.error(err)
      toast.error("ลบข้อมูลล้มเหลว")
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-6 font-sans select-none">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Settings2 className="size-5.5 text-primary" />
          {pageInfo.title}
        </h1>
        <p className="text-slate-500 text-xs mt-1">{pageInfo.caption}</p>
      </div>

      {/* Tab content area */}
      <div className="space-y-4">
        {/* ─── TAB: Calibration Processes ─── */}
        {activeTab === "calibration" && (
          <>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-xs">
              <SearchBar
                value={processSearch}
                onChange={(val) => {
                  setProcessSearch(val)
                  setProcessPage(1)
                }}
                placeholder="ค้นหา..."
              />
              {isAdmin && (
                <button
                  onClick={() => {
                    setEditingProcess(null)
                    setShowAddProcess(true)
                  }}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/95 text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow transition-all cursor-pointer w-full sm:w-auto justify-center"
                >
                  <Plus className="size-4" /> เพิ่มกระบวนการ
                </button>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="bg-primary text-white text-xs font-semibold uppercase">
                      <th className="px-5 py-3.5 text-center w-[70px]">ลำดับ</th>
                      <th className="px-5 py-3.5 w-[20%]">รายการ</th>
                      <th className="px-5 py-3.5">กระบวนการสอบเทียบ</th>
                      <th className="px-5 py-3.5 text-center w-[100px]">หน่วยวัด</th>
                      <th className="px-5 py-3.5 w-[25%]">เครื่องมือมาตรฐาน</th>
                      {isAdmin && <th className="px-5 py-3.5 text-center w-[90px]"></th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {loadingList ? (
                      <tr>
                        <td colSpan={isAdmin ? 6 : 5} className="px-6 py-12 text-center text-slate-400">
                          <span className="inline-block w-5 h-5 border-2 border-slate-300 border-t-primary rounded-full animate-spin mr-2 align-middle" />
                          กำลังโหลดข้อมูล...
                        </td>
                      </tr>
                    ) : paginatedProcesses.length === 0 ? (
                      <tr>
                        <td colSpan={isAdmin ? 6 : 5} className="px-6 py-12 text-center text-slate-400">
                          ไม่พบข้อมูล
                        </td>
                      </tr>
                    ) : (
                      paginatedProcesses.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-5 py-3.5 text-center font-medium w-[70px]">
                            {(processPage - 1) * processPageSize + idx + 1}
                          </td>
                          <td className="px-5 py-3.5 font-medium w-[20%]">{row.parameter_name}</td>
                          <td className="px-5 py-3.5 max-w-[300px] truncate" title={row.procedure}>
                            {row.procedure}
                          </td>
                          <td className="px-5 py-3.5 text-center font-semibold text-primary w-[100px]">{row.unit}</td>
                          <td className="px-5 py-3.5 w-[25%]">
                            {row.standardTool
                              ? `${row.standardTool.name}-${row.standardTool.manufacturer || ""}`
                              : ""}
                          </td>
                          {isAdmin && (
                            <td className="px-5 py-3.5 text-center whitespace-nowrap w-[90px]">
                              <div className="flex justify-center gap-1.5">
                                <button
                                  onClick={() => openEditProcess(row)}
                                  className="p-1.5 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Edit className="size-4" />
                                </button>
                                <button
                                  onClick={() => setDeleteProcessTarget(row)}
                                  className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50/80 rounded-lg transition-colors cursor-pointer"
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

              {!loadingList && filteredProcesses.length > 0 && (
                <TablePagination
                  currentPage={processPage}
                  totalPages={totalProcessPages}
                  totalItems={filteredProcesses.length}
                  pageSize={processPageSize}
                  onPageChange={setProcessPage}
                  onPageSizeChange={setProcessPageSize}
                />
              )}
            </div>
          </>
        )}

        {/* ─── TAB: Settings (Unique Tools Config) ─── */}
        {activeTab === "settings" && (
          <>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-xs">
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto flex-1">
                <SearchBar
                  value={settingsSearch}
                  onChange={(val) => {
                    setSettingsSearch(val)
                    setSettingsPageNum(1)
                  }}
                  placeholder="ค้นหาชื่อเครื่องมือ..."
                />
                <select
                  value={selectedSettingType}
                  onChange={(e) => {
                    setSelectedSettingType(e.target.value)
                    setSettingsPageNum(1)
                  }}
                  className="w-full sm:w-48 h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-all outline-none"
                >
                  <option value="">ประเภททั้งหมด</option>
                  {uniqueTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="bg-primary text-white text-xs font-semibold uppercase">
                      <th className="px-5 py-3.5 w-[35%]">ชื่อเครื่องมือ</th>
                      <th className="px-5 py-3.5 text-center w-[20%]">ประเภท</th>
                      <th className="px-5 py-3.5 w-[30%]">แผนก/หน่วยงาน</th>
                      <th className="px-5 py-3.5 text-center w-[15%]"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {loadingList ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                          <span className="inline-block w-5 h-5 border-2 border-slate-300 border-t-primary rounded-full animate-spin mr-2 align-middle" />
                          กำลังโหลดข้อมูล...
                        </td>
                      </tr>
                    ) : paginatedUniqueTools.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                          ไม่พบข้อมูลเครื่องมือแพทย์
                        </td>
                      </tr>
                    ) : (
                      paginatedUniqueTools.map((row) => (
                        <tr key={row.name} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-5 py-3.5 font-semibold text-slate-800 w-[35%]">{row.name}</td>
                          <td className="px-5 py-3.5 text-center w-[20%]">{row.type}</td>
                          <td className="px-5 py-3.5 text-slate-600 w-[30%]">{row.department}</td>
                          <td className="px-5 py-3.5 text-center w-[15%]">
                            <button
                              onClick={() => navigate(`/tools/config/${encodeURIComponent(row.name)}`)}
                              className="px-5 py-1.5 bg-primary hover:bg-primary/95 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer w-24 text-center"
                            >
                              ตั้งค่า
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {!loadingList && filteredUniqueTools.length > 0 && (
                <TablePagination
                  currentPage={settingsPageNum}
                  totalPages={totalSettingsPages}
                  totalItems={filteredUniqueTools.length}
                  pageSize={settingsPageSize}
                  onPageChange={setSettingsPageNum}
                  onPageSizeChange={setSettingsPageSize}
                />
              )}
            </div>
          </>
        )}

        {/* ─── TAB: Calibration Costs ─── */}
        {activeTab === "cost" && (
          <>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-xs">
              <SearchBar
                value={costSearch}
                onChange={(val) => {
                  setCostSearch(val)
                  setCostPage(1)
                }}
                placeholder="ค้นหา..."
              />
              {isAdmin && (
                <button
                  onClick={() => {
                    setEditingCost(null)
                    setShowAddCost(true)
                  }}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/95 text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow transition-all cursor-pointer w-full sm:w-auto justify-center"
                >
                  <Plus className="size-4" /> เพิ่มค่าใช้จ่าย
                </button>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="bg-primary text-white text-xs font-semibold uppercase">
                      <th className="px-5 py-3.5 text-center w-[70px]">ลำดับ</th>
                      <th className="px-5 py-3.5 w-[35%]">ชื่อเครื่องมือ</th>
                      <th className="px-5 py-3.5">รายการ</th>
                      <th className="px-5 py-3.5 text-center w-[150px]">ราคา</th>
                      {isAdmin && <th className="px-5 py-3.5 text-center w-[90px]"></th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {loadingList ? (
                      <tr>
                        <td colSpan={isAdmin ? 5 : 4} className="px-6 py-12 text-center text-slate-400">
                          <span className="inline-block w-5 h-5 border-2 border-slate-300 border-t-primary rounded-full animate-spin mr-2 align-middle" />
                          กำลังโหลดข้อมูล...
                        </td>
                      </tr>
                    ) : paginatedCosts.length === 0 ? (
                      <tr>
                        <td colSpan={isAdmin ? 5 : 4} className="px-6 py-12 text-center text-slate-400">
                          ไม่พบข้อมูล
                        </td>
                      </tr>
                    ) : (
                      paginatedCosts.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-5 py-3.5 text-center font-medium w-[70px]">
                            {(costPage - 1) * costPageSize + idx + 1}
                          </td>
                          <td className="px-5 py-3.5 font-medium w-[35%]">{row.tool_name}</td>
                          <td className="px-5 py-3.5 text-slate-600">{row.description}</td>
                          <td className="px-5 py-3.5 text-center font-semibold text-emerald-600 w-[150px]">
                            {row.price.toLocaleString()} บาท
                          </td>
                          {isAdmin && (
                            <td className="px-5 py-3.5 text-center whitespace-nowrap w-[90px]">
                              <div className="flex justify-center gap-1.5">
                                <button
                                  onClick={() => openEditCost(row)}
                                  className="p-1.5 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Edit className="size-4" />
                                </button>
                                <button
                                  onClick={() => setDeleteCostTarget(row)}
                                  className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50/80 rounded-lg transition-colors cursor-pointer"
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

              {!loadingList && filteredCosts.length > 0 && (
                <TablePagination
                  currentPage={costPage}
                  totalPages={totalCostPages}
                  totalItems={filteredCosts.length}
                  pageSize={costPageSize}
                  onPageChange={setCostPage}
                  onPageSizeChange={setCostPageSize}
                />
              )}
            </div>
          </>
        )}
      </div>

      {/* --- Dialog Component Modals --- */}

      {/* Calibration Process Form Dialog */}
      {showAddProcess && (
        <CalibrationProcessDialog
          key={editingProcess?.id || "new"}
          isOpen={showAddProcess}
          process={editingProcess}
          onSaved={handleProcessSaved}
          onClose={() => {
            setShowAddProcess(false)
            setEditingProcess(null)
          }}
        />
      )}

      {/* Calibration Cost Form Dialog */}
      {showAddCost && (
        <CalibrationCostDialog
          key={editingCost?.id || "new"}
          isOpen={showAddCost}
          cost={editingCost}
          onSaved={handleCostSaved}
          onClose={() => {
            setShowAddCost(false)
            setEditingCost(null)
          }}
        />
      )}

      {/* Delete Process Confirmation */}
      <ConfirmDeleteDialog
        isOpen={!!deleteProcessTarget}
        title="ยืนยันการลบกระบวนการสอบเทียบ"
        message="ต้องการลบกระบวนการสอบเทียบนี้ใช่หรือไม่?"
        itemName={deleteProcessTarget?.parameter_name}
        loading={actionLoading}
        onConfirm={handleDeleteProcessConfirm}
        onCancel={() => setDeleteProcessTarget(null)}
      />

      {/* Delete Cost Confirmation */}
      <ConfirmDeleteDialog
        isOpen={!!deleteCostTarget}
        title="ยืนยันการลบลำดับค่าใช้จ่าย"
        message="ต้องการลบค่าใช้จ่ายนี้ใช่หรือไม่?"
        itemName={deleteCostTarget?.tool_name}
        loading={actionLoading}
        onConfirm={handleDeleteCostConfirm}
        onCancel={() => setDeleteCostTarget(null)}
      />
    </div>
  )
}

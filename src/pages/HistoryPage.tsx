import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useHistoryStore, type HistoryRecord } from "../stores/historyStore"
import SearchBar from "../components/SearchBar"
import ExportDialog from "../components/history/ExportDialog"
import ToolQrDialog from "../components/history/ToolQrDialog"
import {
  FileText,
  QrCode,
  CheckCircle2,
  XCircle,
  HelpCircle,
  SearchX,
  Download,
  History,
  RefreshCw,
} from "lucide-react"

type ToastType = "success" | "error" | "warning"

interface Toast {
  type: ToastType
  message: string
}

export default function HistoryPage() {
  const navigate = useNavigate()
  const {
    records,
    loading,
    searchQuery,
    selectedDevice,
    selectedResult,
    setSearchQuery,
    setSelectedDevice,
    setSelectedResult,
    fetchRecords,
  } = useHistoryStore()

  const [showExport, setShowExport] = useState(false)
  const [showQr, setShowQr] = useState(false)
  const [selectedTool, setSelectedTool] = useState<{
    id: number
    taskId: number
    deviceName: string
    deviceCode: string
    date: string
  } | null>(null)

  const [toast, setToast] = useState<Toast | null>(null)

  function showToast(type: ToastType, message: string) {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  // Derive unique device names for filter options
  const deviceNames = Array.from(new Set(records.map((r) => r.deviceName)))
  const deviceOptions = [
    { label: "เครื่องมือทั้งหมด", value: "" },
    ...deviceNames.map((name) => ({ label: name, value: name })),
  ]

  const resultOptions = [
    { label: "ทุกผลลัพธ์", value: "" },
    { label: "ผ่าน", value: "pass" },
    { label: "ไม่ผ่าน", value: "fail" },
    { label: "N/A", value: "na" },
  ]

  // Filter and sort records
  const filteredRecords = records.filter((r) => {
    const q = searchQuery.toLowerCase()
    const matchSearch =
      !q ||
      r.deviceName.toLowerCase().includes(q) ||
      r.deviceCode.toLowerCase().includes(q) ||
      r.inspector.toLowerCase().includes(q)
    const matchDevice = !selectedDevice || r.deviceName === selectedDevice
    const matchResult = !selectedResult || r.result === selectedResult
    return matchSearch && matchDevice && matchResult
  })

  const sortedRecords = [...filteredRecords].sort((a, b) => b.taskId - a.taskId)

  function openQr(row: HistoryRecord, e: React.MouseEvent) {
    e.stopPropagation()
    // Extract numerical ID from string id (e.g. CAL-10 -> 10, or just parse id directly if numeric)
    const numericId = Number(row.id.replace("CAL-", ""))
    setSelectedTool({
      id: isNaN(numericId) ? row.taskId : numericId,
      taskId: row.taskId,
      deviceName: row.deviceName,
      deviceCode: row.deviceCode,
      date: row.date,
    })
    setShowQr(true)
  }

  function handleRowClick(row: HistoryRecord, e: React.MouseEvent) {
    // Avoid triggering navigation on action button clicks
    const target = e.target as HTMLElement
    if (target.closest(".action-btn")) return
    navigate(`/status/${row.deviceCode}`)
  }

  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <History className="size-5.5 text-primary" />
          ประวัติการสอบเทียบ
        </h1>
        <p className="text-slate-500 text-xs mt-0.5">ดูรายงานการสอบเทียบเครื่องมือแพทย์</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 border border-slate-200 rounded-xl shadow-xs">
        {/* Left: Searchbar + Dropdowns */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="ค้นหา..."
          />
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-primary transition-all outline-none min-w-[160px] cursor-pointer"
            >
              {deviceOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              value={selectedResult}
              onChange={(e) => setSelectedResult(e.target.value)}
              className="h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-primary transition-all outline-none min-w-[140px] cursor-pointer"
            >
              {resultOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Export Button */}
        <button
          onClick={() => setShowExport(true)}
          className="flex items-center justify-center gap-1.5 h-10 px-4 bg-primary hover:bg-[#07536a] text-white rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
        >
          <Download className="size-4" />
          ส่งออกข้อมูล
        </button>
      </div>

      {/* History Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <RefreshCw className="size-8 text-primary animate-spin" />
            <span className="text-xs text-slate-500">กำลังโหลดข้อมูล...</span>
          </div>
        ) : sortedRecords.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <SearchX className="size-14 text-slate-300 mb-3" />
            <h3 className="text-sm font-bold text-slate-700">ไม่พบข้อมูลที่ค้นหา</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              ลองปรับปรุงคำค้นหาหรือตัวกรองเครื่องมือของคุณ
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-primary text-white text-xs font-semibold">
                  <th className="px-5 py-3 font-semibold h-11">วันที่</th>
                  <th className="px-5 py-3 font-semibold h-11">เครื่องมือ</th>
                  <th className="px-5 py-3 font-semibold h-11">เลขครุภัณฑ์</th>
                  <th className="px-5 py-3 font-semibold h-11">ผู้สอบเทียบ</th>
                  <th className="px-5 py-3 font-semibold h-11">ผลลัพธ์</th>
                  <th className="px-5 py-3 font-semibold h-11 w-28"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {sortedRecords.map((record) => (
                  <tr
                    key={record.taskId}
                    onClick={(e) => handleRowClick(record, e)}
                    className="hover:bg-primary/5 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3.5 whitespace-nowrap">{record.date}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800">
                      {record.deviceName}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-500 font-medium">
                      {record.deviceCode}
                    </td>
                    <td className="px-5 py-3.5">{record.inspector}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-center gap-1.5 font-semibold">
                        {record.result === "pass" ? (
                          <span className="flex items-center gap-1 text-emerald-600">
                            <CheckCircle2 className="size-4.5" />
                            ผ่าน
                          </span>
                        ) : record.result === "fail" ? (
                          <span className="flex items-center gap-1 text-rose-500">
                            <XCircle className="size-4.5" />
                            ไม่ผ่าน
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-slate-500">
                            <HelpCircle className="size-4.5" />
                            N/A
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 flex justify-center gap-1">
                      {/* View Certificate */}
                      <button
                        title="ดูใบรับรอง (CER)"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/cer-view?taskId=${record.taskId}`)
                        }}
                        className="action-btn p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                      >
                        <FileText className="size-4.5" />
                      </button>
                      {/* QR Code */}
                      <button
                        title="QR Code"
                        onClick={(e) => openQr(record, e)}
                        className="action-btn p-1.5 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <QrCode className="size-4.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Export Dialog Overlay */}
      <ExportDialog
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        deviceOptions={deviceOptions}
        resultOptions={resultOptions}
        onExportSuccess={(msg) => showToast("success", msg)}
      />

      {/* QR Code Dialog Overlay */}
      <ToolQrDialog
        isOpen={showQr}
        onClose={() => setShowQr(false)}
        tool={selectedTool}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-[100] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold animate-in fade-in slide-in-from-top-4 duration-200 bg-white border-emerald-100 text-emerald-800">
          <CheckCircle2 className="size-5 text-emerald-600" />
          {toast.message}
        </div>
      )}

    </div>
  )
}

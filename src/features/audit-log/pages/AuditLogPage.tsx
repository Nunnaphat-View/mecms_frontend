import { useEffect, useState } from "react"
import { Shield, Download, Eye, Plus, Edit, Trash, Lock, FileCheck, CheckCircle2 } from "lucide-react"
import { useAuditStore } from "../stores/auditStore"
import { formatThaiDate } from "@/utils/date"
import DatePicker from "@/components/common/DatePicker"
import TablePagination from "@/components/common/TablePagination"
import SearchBar from "@/components/SearchBar"
import { AuditLogDetailDialog } from "../components/AuditLogDetailDialog"
import type { AuditLog } from "@/types/audit"

export default function AuditLogPage() {
  const {
    logs,
    total,
    page,
    limit,
    totalPages,
    loading,
    searchQuery,
    startDate,
    endDate,
    setSearchQuery,
    setDateRange,
    setPage,
    setLimit,
    fetchLogs,
  } = useAuditStore()

  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  useEffect(() => {
    void fetchLogs()
  }, [fetchLogs])

  // Map database action to badge UI (Label, Text Color, Background Color, Border Color, Icon)
  const getActionBadge = (action: string) => {
    const defaultBadge = {
      label: action,
      bg: "bg-slate-50 border-slate-200 text-slate-700",
      icon: <InfoIcon className="size-3.5" />,
    }

    const map: Record<string, typeof defaultBadge> = {
      EQUIPMENT_CREATE: {
        label: "เพิ่มเครื่องมือแพทย์",
        bg: "bg-blue-50 border-blue-200 text-blue-700",
        icon: <Plus className="size-3.5" />,
      },
      EQUIPMENT_UPDATE: {
        label: "แก้ไขเครื่องมือแพทย์",
        bg: "bg-amber-50 border-amber-200/60 text-amber-700",
        icon: <Edit className="size-3.5" />,
      },
      EQUIPMENT_DELETE: {
        label: "ลบเครื่องมือแพทย์",
        bg: "bg-rose-50 border-rose-200 text-rose-700",
        icon: <Trash className="size-3.5" />,
      },
      TASK_CREATE: {
        label: "สร้างใบงานสอบเทียบ",
        bg: "bg-blue-50 border-blue-200 text-blue-700",
        icon: <Plus className="size-3.5" />,
      },
      TASK_SUBMIT_RESULT: {
        label: "บันทึกการสอบเทียบ",
        bg: "bg-emerald-50 border-emerald-200 text-emerald-700",
        icon: <CheckCircle2 className="size-3.5" />,
      },
      TASK_APPROVE: {
        label: "อนุมัติผลสอบเทียบ",
        bg: "bg-emerald-50 border-emerald-200 text-emerald-700",
        icon: <FileCheck className="size-3.5" />,
      },
      TASK_REJECT: {
        label: "ตีกลับผลสอบเทียบ",
        bg: "bg-rose-50 border-rose-200 text-rose-700",
        icon: <XCircleIcon className="size-3.5" />,
      },
      TASK_ASSIGN: {
        label: "มอบหมายงานช่าง",
        bg: "bg-amber-50 border-amber-200/60 text-amber-700",
        icon: <Edit className="size-3.5" />,
      },
      TASK_RESCHEDULE: {
        label: "ย้ายวันสอบเทียบ",
        bg: "bg-amber-50 border-amber-200/60 text-amber-700",
        icon: <Edit className="size-3.5" />,
      },
      AUTH_LOGIN: {
        label: "เข้าสู่ระบบ",
        bg: "bg-emerald-50 border-emerald-200 text-emerald-700",
        icon: <CheckCircle2 className="size-3.5" />,
      },
      AUTH_LOGIN_FAILED: {
        label: "เข้าสู่ระบบล้มเหลว",
        bg: "bg-rose-50 border-rose-200 text-rose-700",
        icon: <Lock className="size-3.5" />,
      },
      AUTH_REGISTER: {
        label: "สร้างผู้ใช้งาน",
        bg: "bg-blue-50 border-blue-200 text-blue-700",
        icon: <Plus className="size-3.5" />,
      },
    }

    return map[action] || defaultBadge
  }

  const translateResource = (resource: string) => {
    const resources: Record<string, string> = {
      Equipment: "จัดการเครื่องมือแพทย์",
      Task: "บันทึกการสอบเทียบ",
      User: "จัดการผู้ใช้งาน",
      PmChecklist: "จัดการเช็คลิสต์",
      Section: "จัดการวอร์ด",
    }
    return resources[resource] || resource
  }

  // Export current search results as CSV
  const handleExportCSV = () => {
    if (logs.length === 0) return

    const headers = ["ID", "User", "Role", "Action", "Module", "Time", "IP Address"]
    const rows = logs.map((log) => [
      log.id,
      log.actorName,
      log.actorRole,
      getActionBadge(log.action).label,
      translateResource(log.resourceName),
      formatThaiDate(log.createdAt, { includeTime: true, monthStyle: "short" }),
      log.ipAddress || "-",
    ])

    const csvContent =
      "\uFEFF" + // UTF-8 BOM for Excel compatibility with Thai characters
      [headers.join(","), ...rows.map((e) => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `audit-log-${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleOpenDetail = (log: AuditLog) => {
    setSelectedLog(log)
    setIsDetailOpen(true)
  }

  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Shield className="size-5.5 text-primary" />
            Audit Log
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            ติดตามการทำงานในระบบ
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col xl:flex-row gap-4 items-center justify-between shadow-xs">
        <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto flex-1">
          {/* Search bar */}
          <div className="w-full md:w-80">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="ค้นหา..."
            />
          </div>

          {/* Date range picker wrapper */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="w-full md:w-44">
              <DatePicker
                value={startDate}
                onChange={(d) => setDateRange(d, endDate)}
                placeholder="เลือกวันเริ่มต้น"
                align="down"
              />
            </div>
            <span className="text-slate-400 font-semibold">-</span>
            <div className="w-full md:w-44">
              <DatePicker
                value={endDate}
                onChange={(d) => setDateRange(startDate, d)}
                placeholder="เลือกวันสิ้นสุด"
                align="down"
              />
            </div>
          </div>
        </div>

        {/* CSV Export */}
        <button
          onClick={handleExportCSV}
          disabled={logs.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/95 text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow transition-all cursor-pointer w-full xl:w-auto justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="size-4" /> Export to csv
        </button>
      </div>

      {/* Table grid */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed">
            <colgroup>
              <col className="w-1/6" />
              <col className="w-1/4" />
              <col className="w-1/6" />
              <col className="w-1/5" />
              <col className="w-1/7" />
              <col className="w-1/12" />
            </colgroup>
            <thead>
              <tr className="bg-primary text-white text-xs font-semibold uppercase tracking-wider">
                <th className="px-5 py-3.5">ผู้ใช้</th>
                <th className="px-5 py-3.5 text-center">การกระทำ</th>
                <th className="px-5 py-3.5">โมดูล</th>
                <th className="px-5 py-3.5">เวลา</th>
                <th className="px-5 py-3.5">IP Address</th>
                <th className="px-5 py-3.5 text-center">รายละเอียด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium">
                    <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
                    <div>กำลังโหลดข้อมูล...</div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                        <Shield className="size-7 text-slate-400" />
                      </div>
                      <div className="text-slate-400 text-sm font-medium">
                        ไม่พบข้อมูลประวัติกิจกรรมการใช้งาน
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const badge = getActionBadge(log.action)
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* ผู้ใช้ */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="font-bold text-slate-800 leading-snug">{log.actorName}</div>
                        <div className="text-[10px] text-slate-400 font-medium mt-0.5 font-sans">{log.actorRole}</div>
                      </td>

                      {/* การกระทำ */}
                      <td className="px-5 py-3.5 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1.2 rounded-full text-[11px] font-bold border w-[160px] ${badge.bg}`}>
                          {badge.icon}
                          {badge.label}
                        </span>
                      </td>

                      {/* โมดูล */}
                      <td className="px-5 py-3.5 truncate text-slate-700 font-medium">
                        {translateResource(log.resourceName)}
                      </td>

                      {/* เวลา */}
                      <td className="px-5 py-3.5 whitespace-nowrap text-slate-600 font-medium">
                        {formatThaiDate(log.createdAt, { includeTime: true, monthStyle: "short" })}
                      </td>

                      {/* IP Address */}
                      <td className="px-5 py-3.5 whitespace-nowrap font-mono text-[11px] text-slate-500 font-semibold">
                        {log.ipAddress || "-"}
                      </td>

                      {/* รายละเอียด */}
                      <td className="px-5 py-3.5 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleOpenDetail(log)}
                          className="p-2 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="ดูรายละเอียด"
                        >
                          <Eye className="size-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {!loading && logs.length > 0 && (
          <TablePagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={total}
            pageSize={limit}
            onPageChange={setPage}
            onPageSizeChange={setLimit}
          />
        )}
      </div>

      {/* Log Details Modal */}
      <AuditLogDetailDialog
        isOpen={isDetailOpen}
        log={selectedLog}
        onClose={() => {
          setIsDetailOpen(false)
          setSelectedLog(null)
        }}
      />
    </div>
  )
}

// Inline fallback mini SVG icons for types not in standard lucide list
function InfoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="2.5"
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.25 11.25l.041-.02a.75.75 0 111.063.852l-.708 2.836a.75.75 0 001.063.852l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
      />
    </svg>
  )
}

function XCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="2.5"
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  )
}

import React from "react"
import { X, Info, FileText } from "lucide-react"
import type { AuditLog } from "@/types/audit"
import { formatThaiDate } from "@/utils/date"

interface AuditLogDetailDialogProps {
  isOpen: boolean
  log: AuditLog | null
  onClose: () => void
}

interface DiffItem {
  key: string
  label: string
  oldVal: unknown
  newVal: unknown
  status: "added" | "deleted" | "modified" | "unchanged"
}

export const AuditLogDetailDialog: React.FC<AuditLogDetailDialogProps> = ({
  isOpen,
  log,
  onClose,
}) => {
  if (!isOpen || !log) return null

  // Dictionary to map database actions/resources to Thai
  const translateAction = (action: string) => {
    const actions: Record<string, string> = {
      EQUIPMENT_CREATE: "เพิ่มเครื่องมือแพทย์",
      EQUIPMENT_UPDATE: "แก้ไขข้อมูลเครื่องมือแพทย์",
      EQUIPMENT_DELETE: "ลบเครื่องมือแพทย์",
      TASK_CREATE: "สร้างใบงานสอบเทียบ",
      TASK_SUBMIT_RESULT: "บันทึกผลสอบเทียบ",
      TASK_APPROVE: "อนุมัติงานสอบเทียบ",
      TASK_REJECT: "ตีกลับงานสอบเทียบ",
      TASK_ASSIGN: "มอบหมายช่างผู้รับผิดชอบ",
      TASK_RESCHEDULE: "ย้ายวันที่นัดหมายสอบเทียบ",
      AUTH_LOGIN: "เข้าสู่ระบบสำเร็จ",
      AUTH_LOGIN_FAILED: "เข้าสู่ระบบล้มเหลว",
      AUTH_REGISTER: "ลงทะเบียนสมาชิกใหม่",
      CHECKLIST_CREATE: "สร้างใบตรวจเช็คลิสต์",
      CHECKLIST_UPDATE: "แก้ไขใบตรวจเช็คลิสต์",
      CHECKLIST_DELETE: "ลบใบตรวจเช็คลิสต์",
    }
    return actions[action] || action
  }

  const translateResource = (resource: string) => {
    const resources: Record<string, string> = {
      Equipment: "เครื่องมือแพทย์",
      Task: "งานสอบเทียบ",
      User: "ผู้ใช้งาน",
      PmChecklist: "ใบตรวจเช็คลิสต์",
    }
    return resources[resource] || resource
  }

  const formatKeyLabel = (key: string): string => {
    const dictionary: Record<string, string> = {
      tool_name: "ชื่อเครื่องมือ",
      asset_code: "รหัสครุภัณฑ์",
      serial_number: "ซีเรียลนัมเบอร์",
      manufacturer: "ผู้ผลิต",
      model: "รุ่น",
      status: "สถานะ",
      risk_level: "ระดับความเสี่ยง",
      interval: "รอบการสอบเทียบ (เดือน)",
      calibration_due_date: "วันครบกำหนดสอบเทียบ",
      calibration_date_last: "วันสอบเทียบล่าสุด",
      department: "หน่วยงาน/วอร์ด",
      location: "สถานที่ติดตั้ง",
      name: "ชื่อ",
      username: "ชื่อผู้ใช้งาน",
      email: "อีเมล",
      tel: "เบอร์โทรศัพท์",
      signatureUrl: "ลายเซ็น",
      imageUrl: "รูปโปรไฟล์",
      overall_result: "ผลการตรวจสอบภาพรวม",
      remarks: "หมายเหตุ/ความคิดเห็น",
      scheduled_date: "วันที่นัดหมายสอบเทียบ",
      ambient_temp: "อุณหภูมิห้อง",
      ambient_humidity: "ความชื้นห้อง",
      technician_id: "ไอดีช่างผู้รับผิดชอบ",
      approver_id: "ไอดีผู้อนุมัติ",
    }
    return dictionary[key] || key
  }

  const calculateDiff = (
    oldValues: Record<string, unknown> | null,
    newValues: Record<string, unknown> | null
  ): DiffItem[] => {
    const diffs: DiffItem[] = []
    const oldObj = oldValues || {}
    const newObj = newValues || {}

    const allKeys = Array.from(new Set([...Object.keys(oldObj), ...Object.keys(newObj)]))
    const excludeKeys = ["createdAt", "updatedAt", "deletedAt", "id", "userId", "roleId", "hospitalId", "sectionId"]

    for (const key of allKeys) {
      if (excludeKeys.includes(key)) continue

      const oldVal = oldObj[key]
      const newVal = newObj[key]

      if (
        (typeof oldVal === "object" && oldVal !== null) ||
        (typeof newVal === "object" && newVal !== null)
      ) {
        // Skip sub-objects or relations to avoid cluttering comparison
        continue
      }

      const hasOld = key in oldObj
      const hasNew = key in newObj

      if (hasOld && !hasNew) {
        diffs.push({ key, label: formatKeyLabel(key), oldVal, newVal: null, status: "deleted" })
      } else if (!hasOld && hasNew) {
        diffs.push({ key, label: formatKeyLabel(key), oldVal: null, newVal, status: "added" })
      } else if (String(oldVal) !== String(newVal)) {
        diffs.push({ key, label: formatKeyLabel(key), oldVal, newVal, status: "modified" })
      } else {
        diffs.push({ key, label: formatKeyLabel(key), oldVal, newVal, status: "unchanged" })
      }
    }

    return diffs
  }

  const diffItems = calculateDiff(log.oldValues, log.newValues)
  const isUpdate = log.action.includes("UPDATE") || log.action.includes("SUBMIT") || log.action.includes("APPROVE") || log.action.includes("ASSIGN") || log.action.includes("RESCHEDULE")

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 font-sans select-none animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white flex justify-between items-center px-6 py-4.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <FileText className="size-5.5 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm leading-snug">
                รายละเอียดเหตุการณ์
              </div>
              <div className="text-[11px] opacity-75 mt-0.5 font-mono">
                Log ID: #{log.id}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors cursor-pointer p-1 rounded-lg hover:bg-white/10"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-6">
          
          {/* Metadata Section */}
          <div className="w-full md:w-80 border-r-0 md:border-r border-slate-200/60 pr-0 md:pr-6 flex flex-col gap-4.5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="size-4 text-slate-400" />
              ข้อมูลพื้นฐาน
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-semibold text-slate-400">ผู้ทำรายการ</label>
                <div className="text-xs font-bold text-slate-800">{log.actorName}</div>
                <div className="text-[10.5px] text-slate-500 font-medium mt-0.5">{log.actorRole}</div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-400">การกระทำ</label>
                <div className="text-xs font-bold text-slate-800">{translateAction(log.action)}</div>
                <div className="text-[10px] font-mono text-slate-500 mt-0.5">{log.action}</div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-400">โมดูล</label>
                <div className="text-xs font-semibold text-slate-700">
                  {translateResource(log.resourceName)}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-400">วันเวลาเกิดเหตุการณ์</label>
                <div className="text-xs font-semibold text-slate-700">
                  {formatThaiDate(log.createdAt, { includeTime: true, monthStyle: "short" })}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-400">IP Address</label>
                <div className="text-xs font-mono font-semibold text-slate-700">{log.ipAddress || "-"}</div>
              </div>

              <div className="md:col-span-2">
                <label className="text-[10px] font-semibold text-slate-400">User Agent</label>
                <div className="text-[11px] font-sans text-slate-500 leading-normal break-all line-clamp-3" title={log.userAgent || ""}>
                  {log.userAgent || "-"}
                </div>
              </div>
            </div>
          </div>

          {/* Diffs & Values Section */}
          <div className="flex-1 flex flex-col">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3.5">
              ข้อมูลที่เปลี่ยนแปลง
            </h3>

            {diffItems.length === 0 ? (
              <div className="flex-1 bg-slate-50 border border-slate-200/50 rounded-xl p-8 flex flex-col items-center justify-center text-center">
                <span className="text-xs font-semibold text-slate-400">ไม่มีประวัติการเปลี่ยนแปลงฟิลด์ข้อมูลหลัก</span>
              </div>
            ) : (
              <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-slate-50/50">
                <table className="w-full text-left border-collapse table-fixed">
                  <thead>
                    <tr className="bg-slate-100/80 text-[11px] font-bold text-slate-500 border-b border-slate-200">
                      <th className="px-4 py-2.5 w-1/3">ชื่อฟิลด์</th>
                      <th className="px-4 py-2.5 w-1/3">ค่าเดิม</th>
                      <th className="px-4 py-2.5 w-1/3">ค่าใหม่</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 text-xs">
                    {diffItems.map((item) => {
                      const isUnchanged = item.status === "unchanged"
                      if (isUnchanged && isUpdate) return null // Hide unchanged fields on update to focus on changes

                      return (
                        <tr key={item.key} className="hover:bg-slate-50/70 transition-colors">
                          {/* Field name */}
                          <td className="px-4 py-3 font-semibold text-slate-700">
                            {item.label}
                          </td>
                          {/* Old value */}
                          <td className={`px-4 py-3 font-mono text-[11px] break-words ${
                            item.status === "deleted" || item.status === "modified"
                              ? "bg-rose-50 text-rose-700 font-semibold"
                              : "text-slate-400"
                          }`}>
                            {item.oldVal !== null ? String(item.oldVal) : "-"}
                          </td>
                          {/* New value */}
                          <td className={`px-4 py-3 font-mono text-[11px] break-words ${
                            item.status === "added" || item.status === "modified"
                              ? "bg-emerald-50 text-emerald-700 font-semibold"
                              : "text-slate-500"
                          }`}>
                            {item.newVal !== null ? String(item.newVal) : "-"}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 flex justify-end border-t border-slate-200/60">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  )
}

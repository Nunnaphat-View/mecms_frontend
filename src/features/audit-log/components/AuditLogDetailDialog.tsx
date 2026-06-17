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
      section: "หน่วยงาน/วอร์ด",
      equipmentType: "ประเภทเครื่องมือ",
      technician: "ช่างผู้รับผิดชอบ",
      approver: "ผู้อนุมัติ",
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

    // Exclude database metadata and IDs that have human-readable relation objects
    const excludeKeys = [
      "createdAt",
      "updatedAt",
      "deletedAt",
      "id",
      "userId",
      "roleId",
      "hospitalId",
      "sectionId",
      "equipment_type_id",
      "technician_id",
      "approver_id",
      "hospital", // Exclude hospital sub-object from detail logs if we want to focus on department/ward
    ]

    const allKeys = Array.from(new Set([...Object.keys(oldObj), ...Object.keys(newObj)]))

    for (const key of allKeys) {
      if (excludeKeys.includes(key)) continue

      let oldVal = oldObj[key]
      let newVal = newObj[key]

      // If the property is a relation object containing a 'name' field, compare its name instead
      if (
        (oldVal && typeof oldVal === "object" && "name" in oldVal) ||
        (newVal && typeof newVal === "object" && "name" in newVal)
      ) {
        oldVal = oldVal ? (oldVal as Record<string, unknown>).name : null
        newVal = newVal ? (newVal as Record<string, unknown>).name : null
      } else if (
        (typeof oldVal === "object" && oldVal !== null) ||
        (typeof newVal === "object" && newVal !== null)
      ) {
        // Skip other nested objects/arrays to avoid cluttering comparison
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
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 font-sans select-none animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
      >
        
        {/* Header */}
        <div className="bg-primary text-white flex justify-between items-center px-6 py-4.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <FileText className="size-5.5 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm leading-snug">
                รายละเอียดเหตุการณ์
              </div>
              <div className="text-[11px] opacity-80 mt-0.5 font-mono">
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
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <Info className="size-4.5 text-primary" />
              ข้อมูลพื้นฐาน
            </h3>

            <div className="space-y-3">
              <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-200/50">
                <label className="text-[10px] font-bold text-slate-400 block mb-1">ผู้ทำรายการ</label>
                <div className="text-xs font-bold text-slate-800">{log.actorName}</div>
                <div className="text-[10.5px] text-slate-500 font-medium mt-0.5">{log.actorRole}</div>
              </div>

              <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-200/50">
                <label className="text-[10px] font-bold text-slate-400 block mb-1">การกระทำ</label>
                <div className="flex flex-col gap-1.5 items-start mt-0.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                    {translateAction(log.action)}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 leading-none">{log.action}</span>
                </div>
              </div>

              <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-200/50">
                <label className="text-[10px] font-bold text-slate-400 block mb-1">โมดูล</label>
                <div className="text-xs font-bold text-slate-700 mt-0.5">
                  {translateResource(log.resourceName)}
                </div>
              </div>

              <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-200/50">
                <label className="text-[10px] font-bold text-slate-400 block mb-1">วันเวลาเกิดเหตุการณ์</label>
                <div className="text-xs font-bold text-slate-700 mt-0.5">
                  {formatThaiDate(log.createdAt, { includeTime: true, monthStyle: "short" })}
                </div>
              </div>

              <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-200/50">
                <label className="text-[10px] font-bold text-slate-400 block mb-1">IP Address</label>
                <div className="text-xs font-mono font-bold text-slate-700 mt-0.5">{log.ipAddress || "-"}</div>
              </div>

              <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-200/50 md:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 block mb-1">User Agent</label>
                <div className="text-[11px] font-sans text-slate-500 leading-normal break-all line-clamp-3 mt-0.5" title={log.userAgent || ""}>
                  {log.userAgent || "-"}
                </div>
              </div>
            </div>
          </div>

          {/* Diffs & Values Section */}
          <div className="flex-1 flex flex-col">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3.5 flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <FileText className="size-4.5 text-primary" />
              ข้อมูลที่เปลี่ยนแปลง
            </h3>

            {diffItems.length === 0 ? (
              <div className="flex-1 bg-slate-50 border border-slate-200/50 rounded-xl p-8 flex flex-col items-center justify-center text-center">
                <span className="text-xs font-semibold text-slate-400">ไม่มีประวัติการเปลี่ยนแปลงฟิลด์ข้อมูลหลัก</span>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                <table className="w-full text-left border-collapse table-fixed">
                  <thead>
                    <tr className="bg-primary/5 text-[11px] font-bold text-primary border-b border-slate-200">
                      <th className="px-4 py-3 w-1/3 font-semibold">ชื่อฟิลด์</th>
                      <th className="px-4 py-3 w-1/3 font-semibold">ค่าเดิม</th>
                      <th className="px-4 py-3 w-1/3 font-semibold">ค่าใหม่</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 text-xs">
                    {diffItems.map((item) => {
                      const isUnchanged = item.status === "unchanged"
                      if (isUnchanged && isUpdate) return null // Hide unchanged fields on update to focus on changes

                      return (
                        <tr key={item.key} className="hover:bg-slate-50/70 transition-colors">
                          {/* Field name */}
                          <td className="px-4 py-3 font-semibold text-slate-700 border-r border-slate-200/40">
                            {item.label}
                          </td>
                          {/* Old value */}
                          <td className={`px-4 py-3 font-mono text-[11px] break-words border-r border-slate-200/40 ${
                            item.status === "deleted" || item.status === "modified"
                              ? "bg-rose-50/50 text-rose-700 font-semibold border-l-2 border-rose-300"
                              : "text-slate-400"
                          }`}>
                            {item.oldVal !== null ? String(item.oldVal) : "-"}
                          </td>
                          {/* New value */}
                          <td className={`px-4 py-3 font-mono text-[11px] break-words ${
                            item.status === "added" || item.status === "modified"
                              ? "bg-emerald-50/50 text-emerald-700 font-semibold border-l-2 border-emerald-300"
                              : "text-slate-600"
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

      </div>
    </div>
  )
}


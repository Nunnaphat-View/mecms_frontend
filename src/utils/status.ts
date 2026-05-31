export type TaskStatus = "PendingApproval" | "Approved" | "Rejected" | "Draft" | "pending" | "approved" | "rejected" | string
export type TestResult = "Pass" | "Fail" | "NA" | "pass" | "fail" | "na" | string

/**
 * Maps a task status to its Thai label.
 */
export function getStatusLabel(status: TaskStatus | null | undefined): string {
  if (!status) return "-"
  const normalized = status.toLowerCase()
  switch (normalized) {
    case "pendingapproval":
    case "pending":
      return "รอดำเนินการ"
    case "approved":
      return "อนุมัติแล้ว"
    case "rejected":
      return "ปฏิเสธ/ส่งกลับ"
    case "draft":
      return "ร่าง"
    default:
      return status
  }
}

/**
 * Returns Tailwind CSS class names for status badges.
 * Built using the "Clean Industrial" UI design system rules.
 */
export function getStatusBadgeClass(status: TaskStatus | null | undefined): string {
  if (!status) return "bg-slate-50 text-slate-400 border-slate-200"
  const normalized = status.toLowerCase()
  
  // Clean industrial styled badge base classes
  const base = "inline-flex items-center px-2 py-0.5 border text-xs font-semibold rounded-md"

  switch (normalized) {
    case "pendingapproval":
    case "pending":
      // Amber for Caution/Warning/Pending
      return `${base} bg-amber-50 text-amber-600 border-amber-200`
    case "approved":
      // Green for Safe/Pass/Success
      return `${base} bg-emerald-50 text-emerald-600 border-emerald-200`
    case "rejected":
      // Red for Danger/Fail/Rejected
      return `${base} bg-rose-50 text-rose-600 border-rose-200`
    case "draft":
      // Slate for draft/neutral
      return `${base} bg-slate-50 text-slate-500 border-slate-200`
    default:
      return `${base} bg-slate-50 text-slate-600 border-slate-200`
  }
}

/**
 * Maps a test result (Pass/Fail) to Thai label.
 */
export function getResultLabel(result: TestResult | null | undefined): string {
  if (!result) return "-"
  const normalized = result.toLowerCase()
  switch (normalized) {
    case "pass":
      return "ผ่าน"
    case "fail":
      return "ไม่ผ่าน"
    case "na":
      return "N/A"
    default:
      return result
  }
}

/**
 * Returns Tailwind CSS class names for test result text/badges.
 */
export function getResultBadgeClass(result: TestResult | null | undefined): string {
  if (!result) return "text-slate-400 font-bold"
  const normalized = result.toLowerCase()

  switch (normalized) {
    case "pass":
      return "text-emerald-500 font-bold"
    case "fail":
      return "text-rose-500 font-bold"
    default:
      return "text-slate-400 font-bold"
  }
}

import { useState, useEffect, useMemo, useRef } from "react"
import {
  Calendar,
  Sparkles,
  Send,
  X,
  UserPlus,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Save,
  Paintbrush,
  Check,
  ClipboardList,
  UserCheck,
  UserX,
  Pencil,
} from "lucide-react"
import { pmService } from "@/features/pm/services/pmService"
import type { TaskApi } from "@/features/pm/services/pmService"
import { userService } from "@/features/users/services/userService"
import { useToast } from "@/hooks/useToast"
import type { User } from "@/types/auth"
import { useAuthStore } from "@/features/auth/stores/authStore"
import { AppRole } from "@/constants/roles"
import { UnassignedTasksPanel } from "./UnassignedTasksPanel"

interface GroupedTask {
  key: string
  toolName: string
  sectionName: string
  technicianId: number | null
  technicianName: string
  taskIds: number[]
  assetCodes: string[]
  day: number
}

// 10 Curated Premium Palettes complying with the Clean Industrial styling guidelines (and the Purple Ban)
const COLOR_DEFINITIONS: Record<string, {
  name: string
  bg: string
  text: string
  border: string
  borderL: string
  dot: string
  legendBg: string
}> = {
  sky: { name: "ฟ้าสว่าง", bg: "bg-sky-50/80", text: "text-sky-800", border: "border-sky-200/50", borderL: "border-l-sky-500", dot: "bg-sky-500", legendBg: "bg-sky-500" },
  emerald: { name: "เขียวมรกต", bg: "bg-emerald-50/80", text: "text-emerald-800", border: "border-emerald-200/50", borderL: "border-l-emerald-500", dot: "bg-emerald-500", legendBg: "bg-emerald-500" },
  amber: { name: "ส้ม/เหลือง", bg: "bg-amber-50/80", text: "text-amber-800", border: "border-amber-200/50", borderL: "border-l-amber-500", dot: "bg-amber-500", legendBg: "bg-amber-500" },
  teal: { name: "เขียวเทอร์ควอยซ์", bg: "bg-teal-50/80", text: "text-teal-800", border: "border-teal-200/50", borderL: "border-l-teal-500", dot: "bg-teal-500", legendBg: "bg-teal-500" },
  rose: { name: "ชมพู/แดง", bg: "bg-rose-50/80", text: "text-rose-800", border: "border-rose-200/50", borderL: "border-l-rose-500", dot: "bg-rose-500", legendBg: "bg-rose-500" },
  indigo: { name: "น้ำเงินเข้ม", bg: "bg-indigo-50/80", text: "text-indigo-800", border: "border-indigo-200/50", borderL: "border-l-indigo-500", dot: "bg-indigo-500", legendBg: "bg-indigo-500" },
  slate: { name: "เทาเหล็ก", bg: "bg-slate-50/80", text: "text-slate-800", border: "border-slate-200/50", borderL: "border-l-slate-500", dot: "bg-slate-500", legendBg: "bg-slate-500" },
  cyan: { name: "ฟ้าคราม", bg: "bg-cyan-50/80", text: "text-cyan-800", border: "border-cyan-200/50", borderL: "border-l-cyan-500", dot: "bg-cyan-500", legendBg: "bg-cyan-500" },
  lime: { name: "เขียวมะนาว", bg: "bg-lime-50/80", text: "text-lime-800", border: "border-lime-200/50", borderL: "border-l-lime-500", dot: "bg-lime-500", legendBg: "bg-lime-500" },
  orange: { name: "ส้มอิฐ", bg: "bg-orange-50/80", text: "text-orange-800", border: "border-orange-200/50", borderL: "border-l-orange-500", dot: "bg-orange-500", legendBg: "bg-orange-500" },
}

const DEFAULT_ORDER = ["sky", "emerald", "amber", "teal", "slate", "rose", "indigo", "lime", "orange", "cyan"]

const getTechColor = (techId: number | null | undefined, techColorsMap: Record<number, string>) => {
  if (!techId) {
    return {
      name: "ไม่มีผู้รับผิดชอบ",
      bg: "bg-slate-50/50",
      text: "text-slate-500",
      border: "border-slate-200",
      borderL: "border-l-slate-400",
      dot: "bg-slate-400",
      legendBg: "bg-slate-400"
    }
  }
  const colorKey = techColorsMap[techId] || DEFAULT_ORDER[techId % DEFAULT_ORDER.length]
  return COLOR_DEFINITIONS[colorKey] || COLOR_DEFINITIONS.sky
}

export function ManageScheduleView() {
  const toast = useToast()
  const today = new Date()

  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()) // 0-11
  const [tasks, setTasks] = useState<TaskApi[]>([])
  const [technicians, setTechnicians] = useState<User[]>([])

  // AI Analysis State
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null)
  const [loadingAnalysis, setLoadingAnalysis] = useState(false)
  const [isAiPanelVisible, setIsAiPanelVisible] = useState(false)
  const [isAiPanelCollapsed, setIsAiPanelCollapsed] = useState(false)

  const handleAnalyzeSchedule = async (m = currentMonth, y = currentYear) => {
    setIsAiPanelVisible(true)
    setIsAiPanelCollapsed(false)

    const hasTasks = tasks.some((task) => {
      const rawDate = task.scheduled_date || task.equipment?.calibration_due_date || task.createdAt
      if (!rawDate) return false
      const dateObj = new Date(rawDate)
      return dateObj.getMonth() === m && dateObj.getFullYear() === y
    })

    if (!hasTasks) {
      setAiAnalysis("ไม่มีรายการงานสอบเทียบในเดือนและปีที่เลือก จึงไม่มีข้อมูลสำหรับให้ AI วิเคราะห์แผนงาน")
      return
    }

    setLoadingAnalysis(true)
    try {
      const res = await pmService.analyzeSchedule(m + 1, y)
      setAiAnalysis(res.analysis)
    } catch (err: unknown) {
      console.error(err)
      const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการวิเคราะห์แผนงานจากระบบ AI"
      setAiAnalysis(`เกิดข้อผิดพลาด: ${msg}`)
    } finally {
      setLoadingAnalysis(false)
    }
  }

  // Reassignment Modal State
  const [editingGroup, setEditingGroup] = useState<GroupedTask | null>(null)
  const [selectedTechId, setSelectedTechId] = useState<number | "">("")
  const [selectedDay, setSelectedDay] = useState<number>(1)
  const [isEditModeOverride, setIsEditModeOverride] = useState(false)

  // Drag & Drop state
  const [draggedGroup, setDraggedGroup] = useState<GroupedTask | null>(null)
  const [dragOverDay, setDragOverDay] = useState<number | null>(null)
  const dragRef = useRef<GroupedTask | null>(null)
  const reschedulingRef = useRef(false)

  // Auth role
  const { appRole } = useAuthStore()
  const canDrag = appRole === AppRole.ADMIN || appRole === AppRole.HEAD_OF_DEPT
  const canEdit = appRole === AppRole.ADMIN || appRole === AppRole.HEAD_OF_DEPT

  // Color selection state
  const [pickingColorTech, setPickingColorTech] = useState<User | null>(null)
  const [techColorsMap, setTechColorsMap] = useState<Record<number, string>>(() => {
    const saved = localStorage.getItem("mecms_tech_colors_map")
    return saved ? JSON.parse(saved) : {}
  })

  const thaiMonths = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ]

  const years = useMemo(() => {
    const localToday = new Date()
    const list = []
    const startYear = localToday.getFullYear() - 5
    const endYear = localToday.getFullYear() + 5
    for (let y = startYear; y <= endYear; y++) {
      list.push(y)
    }
    return list
  }, [])

  useEffect(() => {
    let active = true

    async function loadData() {
      try {
        const allTasks = await pmService.getTasks()
        if (active) {
          setTasks(allTasks)
        }
      } catch (err) {
        console.error(err)
        toast.error("ไม่สามารถดึงข้อมูลแผนงานได้")
      }

      try {
        const users = await userService.getAll()
        const techs = users.filter((u) => u.roleId === 2)
        if (active) {
          setTechnicians(techs)
        }
      } catch (err) {
        console.error("Failed to load technicians", err)
      }
    }

    void loadData()

    return () => {
      active = false
    }
  }, [toast])


  const daysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonth + 1, 0).getDate()
  }, [currentYear, currentMonth])

  const blankDaysCount = useMemo(() => {
    return new Date(currentYear, currentMonth, 1).getDay()
  }, [currentYear, currentMonth])

  // Filter tasks in selected month & year
  const currentMonthTasks = useMemo(() => {
    return tasks.filter((task) => {
      const rawDate = task.scheduled_date || task.equipment?.calibration_due_date || task.createdAt
      if (!rawDate) return false
      const dateObj = new Date(rawDate)
      return (
        dateObj.getMonth() === currentMonth &&
        dateObj.getFullYear() === currentYear
      )
    })
  }, [tasks, currentMonth, currentYear])

  // Filter assigned tasks (technician_id !== null) to show on calendar
  const assignedTasks = useMemo(() => {
    return currentMonthTasks.filter((t) => t.technician_id !== null)
  }, [currentMonthTasks])

  // Filter unassigned tasks
  const unassignedTasks = useMemo(() => {
    return currentMonthTasks.filter((t) => t.technician_id === null)
  }, [currentMonthTasks])

  // Determine if published (status !== Pending)
  const isPublished = useMemo(() => {
    if (currentMonthTasks.length === 0) return false
    return currentMonthTasks.some((t) => t.status !== "Pending")
  }, [currentMonthTasks])

  // Compute edit mode dynamically (always edit mode if unpublished, or if explicitly overridden by user)
  const isEditMode = !isPublished || isEditModeOverride

  // Get list of technicians currently assigned to tasks in this month for Legend
  const activeTechniciansInMonth = useMemo(() => {
    const assignedIds = new Set(assignedTasks.map((t) => t.technician_id))
    return technicians.filter((tech) => assignedIds.has(tech.id))
  }, [assignedTasks, technicians])

  // Get grouped tasks for a specific day in the selected month
  const getGroupedTasksForDay = (day: number) => {
    const dayStr = String(day).padStart(2, "0")
    const monthStr = String(currentMonth + 1).padStart(2, "0")
    const dateQuery = `${currentYear}-${monthStr}-${dayStr}`
    
    const dayTasks = assignedTasks.filter((task) => {
      const rawDate = task.scheduled_date || task.equipment?.calibration_due_date || task.createdAt
      if (!rawDate) return false
      const dObj = new Date(rawDate)
      const localDateStr = `${dObj.getFullYear()}-${String(dObj.getMonth() + 1).padStart(2, "0")}-${String(dObj.getDate()).padStart(2, "0")}`
      return localDateStr === dateQuery
    })

    const groups: Record<string, GroupedTask> = {}

    for (const task of dayTasks) {
      const toolName = task.equipment?.tool_name || "ไม่ระบุเครื่องมือ"
      const sectionName = task.equipment?.section?.name || "-"
      const techId = task.technician_id
      const techName = task.technician?.name || "ไม่ระบุ"
      
      const key = `${toolName}-${sectionName}-${techId}-${day}`

      if (!groups[key]) {
        groups[key] = {
          key,
          toolName,
          sectionName,
          technicianId: techId,
          technicianName: techName,
          taskIds: [],
          assetCodes: [],
          day,
        }
      }
      groups[key].taskIds.push(task.id)
      if (task.equipment?.asset_code) {
        groups[key].assetCodes.push(task.equipment.asset_code)
      }
    }

    return Object.values(groups)
  }

  // Check if a day is today
  const isToday = (dayNum: number) => {
    const d = new Date()
    return (
      d.getDate() === dayNum &&
      d.getMonth() === currentMonth &&
      d.getFullYear() === currentYear
    )
  }

  // Month Navigation Handlers
  const handlePrevMonth = () => {
    setAiAnalysis(null)
    setIsAiPanelVisible(false)
    setIsEditModeOverride(false)
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear((prev) => prev - 1)
    } else {
      setCurrentMonth((prev) => prev - 1)
    }
  }

  const handleNextMonth = () => {
    setAiAnalysis(null)
    setIsAiPanelVisible(false)
    setIsEditModeOverride(false)
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear((prev) => prev + 1)
    } else {
      setCurrentMonth((prev) => prev + 1)
    }
  }

  // Handle Manual Single Task Technician Assignment
  const handleAssignTaskSingle = async (taskId: number, techId: number) => {
    try {
      const updatedTask = await pmService.assignTechnician(taskId, techId)
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)))
      toast.success("มอบหมายช่างเทคนิคสำเร็จ")
    } catch (err: unknown) {
      console.error(err)
      const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการมอบหมายงาน"
      toast.error(msg)
    }
  }

  // Handle AI Auto Assign
  const handleAutoAssign = async () => {
    try {
      const updatedTasks = await pmService.autoAssign(currentMonth + 1, currentYear)
      setTasks((prev) => {
        const updatedIds = new Set(updatedTasks.map((u) => u.id))
        const filtered = prev.filter((p) => !updatedIds.has(p.id))
        return [...filtered, ...updatedTasks]
      })
      toast.success("AI จัดการแบ่งมอบหมายงานสอบเทียบสำเร็จ")
      // Auto trigger AI analysis after assignment
      void handleAnalyzeSchedule(currentMonth, currentYear)
    } catch (err: unknown) {
      console.error(err)
      const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการรัน AI"
      toast.error(msg)
    }
  }

  // Handle Publish
  const handlePublish = async () => {
    try {
      const updatedTasks = await pmService.publishAssignments(currentMonth + 1, currentYear)
      setTasks((prev) => {
        const updatedIds = new Set(updatedTasks.map((u) => u.id))
        const filtered = prev.filter((p) => !updatedIds.has(p.id))
        return [...filtered, ...updatedTasks]
      })
      toast.success("เผยแพร่ตารางปฏิบัติงานสอบเทียบเข้าระบบเสร็จสิ้น")
    } catch (err: unknown) {
      console.error(err)
      const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการเผยแพร่"
      toast.error(msg)
    }
  }

  const handleOpenReassignGroup = (group: GroupedTask) => {
    setEditingGroup(group)
    setSelectedTechId(group.technicianId || "")
    setSelectedDay(group.day)
  }

  const handleSaveReassignGroup = async () => {
    if (!editingGroup || !selectedTechId) return
    try {
      const techChanged = editingGroup.technicianId !== Number(selectedTechId)
      const dayChanged = editingGroup.day !== selectedDay

      let resultTasks: TaskApi[] = []

      // 1. If technician changed, assign new technician
      if (techChanged) {
        const updatedAssign = await Promise.all(
          editingGroup.taskIds.map((id) => pmService.assignTechnician(id, Number(selectedTechId)))
        )
        resultTasks = [...resultTasks, ...updatedAssign]
      }

      // 2. If day changed, reschedule
      if (dayChanged) {
        const dayStr = String(selectedDay).padStart(2, "0")
        const monthStr = String(currentMonth + 1).padStart(2, "0")
        const newDate = `${currentYear}-${monthStr}-${dayStr}`
        
        const updatedSchedule = await pmService.reschedule(editingGroup.taskIds, newDate)
        resultTasks = [...resultTasks, ...updatedSchedule]
      }

      // 3. Update tasks in state
      if (resultTasks.length > 0) {
        setTasks((prev) => {
          const updatedMap = new Map(resultTasks.map((t) => [t.id, t]))
          return prev.map((t) => updatedMap.get(t.id) || t)
        })
      }

      toast.success("บันทึกการแก้ไขข้อมูลกลุ่มงานสอบเทียบเรียบร้อยแล้ว")
      setEditingGroup(null)
    } catch (err) {
      console.error(err)
      toast.error("ไม่สามารถบันทึกข้อมูลแก้ไขได้")
    }
  }

  // const handleSeedTestData = async () => {
  //   try {
  //     const res = await pmService.seed()
  //     toast.success(res.message || "จำลองข้อมูลสำเร็จแล้ว!")
      
  //     const allTasks = await pmService.getTasks()
  //     setTasks(allTasks)
      
  //     setCurrentMonth(5)
  //     setCurrentYear(2026)
  //     setAiAnalysis(null)
  //     setIsAiPanelVisible(false)
  //     setIsEditModeOverride(false)
  //   } catch (err: unknown) {
  //     console.error(err)
  //     const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาด"
  //     toast.error(msg)
  //   }
  // }

  // ── Drag & Drop handlers ───────────────────────────────────────────────────
  const handleDragStart = (group: GroupedTask) => {
    setDraggedGroup(group)
    dragRef.current = group
  }

  const handleDragEnd = () => {
    setDraggedGroup(null)
    setDragOverDay(null)
    dragRef.current = null
  }

  const handleDragOver = (e: React.DragEvent, dayNum: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverDay(dayNum)
  }

  const handleDragLeave = () => {
    setDragOverDay(null)
  }

  const handleDrop = async (e: React.DragEvent, dayNum: number) => {
    e.preventDefault()
    setDragOverDay(null)

    const group = dragRef.current
    if (!group || group.day === dayNum || reschedulingRef.current) return

    const dayStr = String(dayNum).padStart(2, "0")
    const monthStr = String(currentMonth + 1).padStart(2, "0")
    const newDate = `${currentYear}-${monthStr}-${dayStr}`

    reschedulingRef.current = true
    try {
      const updated = await pmService.reschedule(group.taskIds, newDate)
      setTasks((prev) => {
        const updatedMap = new Map(updated.map((t) => [t.id, t]))
        return prev.map((t) => updatedMap.get(t.id) ?? t)
      })
      toast.success(`ย้ายงาน ${group.toolName} ไปวันที่ ${dayNum} ${thaiMonths[currentMonth]} สำเร็จ`)
    } catch (err: unknown) {
      console.error(err)
      const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการย้ายงาน"
      toast.error(msg)
    } finally {
      reschedulingRef.current = false
      setDraggedGroup(null)
      dragRef.current = null
    }
  }

  return (
    <div className="flex flex-col gap-6 font-sans antialiased text-slate-800">
      
      {/* Dynamic Title / Header Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="size-6 text-primary" />
            จัดการแผนปฏิบัติงานสอบเทียบ
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            เครื่องมือแพทย์ และระบบบริหารจัดการมอบหมายงานอัตโนมัติด้วยปัญญาประดิษฐ์ (AI Task Scheduler)
          </p>
        </div>
      </div>

      {/* KPI Dashboard Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-4.5 border border-slate-200 rounded-2xl shadow-3xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">งานสอบเทียบทั้งหมด</span>
            <span className="text-2xl font-bold text-slate-900 leading-tight block mt-1">{currentMonthTasks.length}</span>
            <span className="text-[10.5px] text-slate-500 font-medium block mt-1">ประจำเดือน {thaiMonths[currentMonth]}</span>
          </div>
          <div className="p-3 rounded-xl bg-primary/5 text-primary">
            <ClipboardList className="size-5" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-4.5 border border-slate-200 rounded-2xl shadow-3xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">จัดสรรช่างเสร็จสิ้น</span>
            <span className="text-2xl font-bold text-emerald-700 leading-tight block mt-1">{assignedTasks.length}</span>
            <span className="text-[10.5px] text-emerald-600/80 font-bold block mt-1">
              {currentMonthTasks.length > 0 ? Math.round((assignedTasks.length / currentMonthTasks.length) * 100) : 0}% ของงานทั้งหมด
            </span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <UserCheck className="size-5" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-4.5 border border-slate-200 rounded-2xl shadow-3xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">รอมอบหมายงาน</span>
            <span className={`text-2xl font-bold leading-tight block mt-1 ${unassignedTasks.length > 0 ? "text-amber-600 animate-pulse" : "text-slate-950"}`}>
              {unassignedTasks.length}
            </span>
            <span className="text-[10.5px] text-slate-500 font-medium block mt-1">รายการที่ต้องจัดสรรช่างเพิ่มเติม</span>
          </div>
          <div className={`p-3 rounded-xl ${unassignedTasks.length > 0 ? "bg-amber-50 text-amber-600" : "bg-slate-50 text-slate-400"}`}>
            <UserX className="size-5" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-4.5 border border-slate-200 rounded-2xl shadow-3xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">สถานะตารางงาน</span>
            <div className="mt-2.5">
              {isPublished ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100/70 text-emerald-800 border border-emerald-200">
                  <CheckCircle className="size-3.5" />
                  เผยแพร่แล้ว
                </span>
              ) : currentMonthTasks.length > 0 ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100/70 text-amber-800 border border-amber-200">
                  <HelpCircle className="size-3.5" />
                  ฉบับร่าง
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
                  ไม่มีรายการงาน
                </span>
              )}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-100 text-slate-500">
            <Send className="size-5" />
          </div>
        </div>
      </div>

      {/* Top Filter and Action Bar */}
      <div className="bg-white p-4.5 border border-slate-200 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-3xs">
        
        {/* Left Side: Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="flex items-center justify-center size-10 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl transition-all cursor-pointer shadow-3xs"
            title="เดือนก่อนหน้า"
          >
            <ChevronLeft className="size-4" />
          </button>

          <div className="relative">
            <select
              value={currentMonth}
              onChange={(e) => {
                setCurrentMonth(Number(e.target.value))
                setAiAnalysis(null)
                setIsAiPanelVisible(false)
                setIsEditModeOverride(false)
              }}
              className="appearance-none h-10 pl-3.5 pr-9 bg-white border border-slate-200 text-slate-800 rounded-xl text-xs font-bold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none cursor-pointer shadow-3xs"
            >
              {thaiMonths.map((m, idx) => (
                <option key={idx} value={idx}>
                  {m}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={currentYear}
              onChange={(e) => {
                setCurrentYear(Number(e.target.value))
                setAiAnalysis(null)
                setIsAiPanelVisible(false)
                setIsEditModeOverride(false)
              }}
              className="appearance-none h-10 pl-3.5 pr-9 bg-white border border-slate-200 text-slate-800 rounded-xl text-xs font-bold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none cursor-pointer shadow-3xs"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y + 543}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400 pointer-events-none" />
          </div>

          <button
            onClick={handleNextMonth}
            className="flex items-center justify-center size-10 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl transition-all cursor-pointer shadow-3xs"
            title="เดือนถัดไป"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        {/* Right Side: Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleAutoAssign}
            disabled={isPublished || currentMonthTasks.length === 0}
            className="flex items-center gap-1.5 px-4.5 h-10 bg-primary text-white hover:bg-primary/95 font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-3xs select-none"
            title="มอบหมายผู้ชำนาญการตามวิเคราะห์ทักษะอัตโนมัติ"
          >
            <Sparkles className="size-3.5" />
            AI จัดตารางงาน
          </button>

          <button
            onClick={() => handleAnalyzeSchedule(currentMonth, currentYear)}
            disabled={currentMonthTasks.length === 0}
            className="flex items-center gap-1.5 px-4 h-10 border border-slate-200 bg-white hover:bg-slate-50 font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-3xs text-slate-600 select-none"
            title="วิเคราะห์และสรุปข้อเสนอแนะในการจัดตารางงานด้วย AI"
          >
            <Sparkles className="size-3.5 text-amber-500" />
            AI วิเคราะห์ตาราง
          </button>

          {canEdit && isPublished && (
            <button
              onClick={() => setIsEditModeOverride((prev) => !prev)}
              className={`flex items-center gap-1.5 px-4 h-10 border font-bold text-xs rounded-xl transition-all cursor-pointer shadow-3xs select-none ${
                isEditModeOverride
                  ? "bg-amber-500 border-amber-600 text-white hover:bg-amber-600"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
              title="เปิด/ปิดโหมดแก้ไขเพื่อปรับตารางงาน (ลากวางหรือแก้ไขข้อมูล)"
            >
              <Pencil className="size-3.5" />
              {isEditModeOverride ? "ปิดโหมดแก้ไข" : "เปิดโหมดแก้ไข"}
            </button>
          )}

          <button
            onClick={handlePublish}
            disabled={isPublished || currentMonthTasks.length === 0 || unassignedTasks.length > 0}
            className="flex items-center gap-1.5 px-4.5 h-10 bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-3xs select-none"
            title="ยืนยันแผนการจัดช่างเพื่อให้สามารถเริ่มงานได้"
          >
            <Send className="size-3.5" />
            เผยแพร่งานสอบเทียบ
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Main Grid Calendar Container */}
        <div className={`bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs ${
          unassignedTasks.length > 0 ? "xl:col-span-8 2xl:col-span-9" : "xl:col-span-12"
        }`}>
        
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/40 flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <Calendar className="size-4 text-primary" />
            <span className="text-xs font-bold text-slate-700">
              ตารางปฏิบัติงานสอบเทียบประจำเดือน {thaiMonths[currentMonth]} {currentYear + 543}
            </span>
            {isEditMode && isPublished && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse select-none">
                โหมดแก้ไขเปิดอยู่
              </span>
            )}
          </div>
          
          <div className="text-[11px] text-slate-400 font-bold">
            รวม {currentMonthTasks.length} รายการ
          </div>
        </div>

        <div className="p-4">
            
            {/* Calendar Table Grid */}
            <div className="grid grid-cols-7 gap-px bg-slate-200/60 rounded-xl overflow-hidden border border-slate-200/50">
              
              {/* Day headers */}
              {["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."].map((day, idx) => (
                <div
                  key={day}
                  className={`text-center py-2.5 text-xs font-bold bg-slate-100/90 select-none ${
                    idx === 0 ? "text-rose-500" : idx === 6 ? "text-primary" : "text-slate-600"
                  }`}
                >
                  {day}
                </div>
              ))}

              {/* Blank Cells at start */}
              {Array.from({ length: blankDaysCount }).map((_, i) => (
                <div key={`blank-${i}`} className="min-h-[110px] bg-slate-50/15 border border-slate-100/20" />
              ))}

              {/* Active Days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1
                const dayGroups = getGroupedTasksForDay(dayNum)
                const isCurrent = isToday(dayNum)
                const dayOfWeek = (blankDaysCount + i) % 7
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

                return (
                  <div
                    key={`day-${dayNum}`}
                    onDragOver={canDrag && isEditMode ? (e) => handleDragOver(e, dayNum) : undefined}
                    onDragLeave={canDrag && isEditMode ? handleDragLeave : undefined}
                    onDrop={canDrag && isEditMode ? (e) => handleDrop(e, dayNum) : undefined}
                    className={`min-h-[110px] p-2 flex flex-col relative transition-all border ${
                      dragOverDay === dayNum && draggedGroup !== null
                        ? "bg-primary/10 border-primary/50 ring-2 ring-primary/30 ring-inset"
                        : isCurrent
                          ? "bg-primary/5 border-slate-100/30 ring-1 ring-primary/20"
                          : isWeekend
                            ? "bg-slate-50/40 border-slate-100/30"
                            : "bg-white border-slate-100/30"
                    }`}
                  >
                    {/* Day number label */}
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-[10px] font-bold flex items-center justify-center rounded-full select-none ${
                        isCurrent 
                          ? "size-5 bg-primary text-white" 
                          : isWeekend 
                            ? "text-slate-400" 
                            : "text-slate-500"
                      }`}>
                        {dayNum}
                      </span>
                      {isCurrent && (
                        <span className="text-[8px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                          วันนี้
                        </span>
                      )}
                    </div>

                    {/* Task chips list */}
                    <div className="flex flex-col gap-1 mt-1 overflow-y-auto max-h-[85px] custom-scrollbar">
                      {dayGroups.map((group) => {
                        const style = getTechColor(group.technicianId, techColorsMap)
                        const count = group.taskIds.length
                        return (
                          <div
                            key={group.key}
                            draggable={canDrag && isEditMode}
                            onDragStart={canDrag && isEditMode ? () => handleDragStart(group) : undefined}
                            onDragEnd={canDrag && isEditMode ? handleDragEnd : undefined}
                            onClick={canEdit && isEditMode ? () => handleOpenReassignGroup(group) : undefined}
                            className={`group text-[10px] px-2 py-1.5 border ${style.border} ${style.borderL} border-l-4 ${style.bg} rounded-lg flex items-center justify-between gap-1.5 transition-all select-none w-full overflow-hidden ${
                              draggedGroup?.key === group.key
                                ? "opacity-40 cursor-grabbing"
                                : canDrag && isEditMode
                                  ? "cursor-grab hover:shadow-xs animate-in fade-in duration-200"
                                  : "cursor-default"
                            }`}
                            title={`${group.toolName} (${group.assetCodes.join(", ")}) [ช่าง: ${group.technicianName}]${
                              canDrag && isEditMode ? " — ลากเพื่อย้ายวัน" : ""
                            }`}
                          >
                            <span className={`font-bold ${style.text} leading-none flex items-center justify-between gap-1.5 min-w-0 w-full`}>
                              <span className="flex items-center gap-1.5 min-w-0">
                                <span className="truncate">
                                  <span className="font-semibold opacity-75 mr-1 text-[9.5px]">[{group.sectionName}]</span>
                                  {group.toolName}
                                </span>
                              </span>
                              
                              <div className="flex items-center gap-1 shrink-0">
                                {count > 1 && (
                                  <span className={`text-[8.5px] px-1 py-0.5 rounded-sm font-extrabold ${style.legendBg} text-white leading-none`}>
                                    x{count}
                                  </span>
                                )}
                                {canEdit && isEditMode && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleOpenReassignGroup(group)
                                    }}
                                    className="p-0.5 rounded-sm hover:bg-black/10 text-current transition-colors opacity-65 hover:opacity-100 cursor-pointer"
                                    title="แก้ไขผู้รับผิดชอบหรือวันปฏิบัติงาน"
                                  >
                                    <Pencil className="size-3" />
                                  </button>
                                )}
                              </div>
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
            
            {/* Color Legend & Dynamic Color Selection */}
            {activeTechniciansInMonth.length > 0 && (
              <div className="mt-6 p-4 border border-slate-200/80 rounded-xl bg-slate-50/40">
                <div className="flex items-center justify-between mb-3 border-b border-slate-200/40 pb-2">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Paintbrush className="size-3 text-slate-400" />
                    รายชื่อช่างสอบเทียบ (คลิกเพื่อเปลี่ยนสีที่ต้องการ)
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5">
                  {activeTechniciansInMonth.map((tech) => {
                    const style = getTechColor(tech.id, techColorsMap)
                    const count = assignedTasks.filter((t) => t.technician_id === tech.id).length
                    return (
                      <button
                        key={tech.id}
                        onClick={() => setPickingColorTech(tech)}
                        className="flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-200 rounded-lg hover:border-primary/50 hover:bg-slate-50/50 transition-all cursor-pointer text-left shadow-3xs"
                        title={`คลิกเพื่อเปลี่ยนสีประจำตัวของ ${tech.name}`}
                      >
                        <span className={`size-2.5 rounded-full ${style.legendBg}`} />
                        <span className="text-xs text-slate-700 font-semibold">
                          {tech.name}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-full">
                          {count} งาน
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
        </div>
      </div>

      {/* List of Unassigned Tasks */}
      {unassignedTasks.length > 0 && (
        <div className="xl:col-span-4 2xl:col-span-3">
          <UnassignedTasksPanel
            unassignedTasks={unassignedTasks}
            technicians={technicians}
            isPublished={isPublished}
            isEditModeOverride={isEditModeOverride}
            onAssignTechnician={handleAssignTaskSingle}
            thaiMonthName={thaiMonths[currentMonth]}
            thaiYear={currentYear + 543}
          />
        </div>
      )}
    </div>

    {/* AI Assistant Analysis Panel */}
      {isAiPanelVisible && (
        <div className="mt-4.5 bg-slate-50/50 border border-slate-200 rounded-2xl overflow-hidden shadow-3xs">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-amber-500 animate-pulse" />
              <span className="text-sm font-bold text-slate-700">AI Assistant บทวิเคราะห์ตารางงาน</span>
            </div>
            
            <div className="flex items-center gap-2">
              {loadingAnalysis && (
                <span className="text-xs font-bold text-slate-400 animate-pulse mr-2">
                  กำลังวิเคราะห์แผนงาน...
                </span>
              )}
              
              {/* Collapse/Expand Button */}
              <button
                onClick={() => setIsAiPanelCollapsed(!isAiPanelCollapsed)}
                className="p-1 hover:bg-slate-200/60 text-slate-500 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
                title={isAiPanelCollapsed ? "แสดงเนื้อหา" : "ย่อเนื้อหา"}
              >
                <ChevronDown className={`size-4 transition-transform duration-200 ${isAiPanelCollapsed ? "" : "rotate-180"}`} />
              </button>
              
              {/* Close Button */}
              <button
                onClick={() => setIsAiPanelVisible(false)}
                className="p-1 hover:bg-slate-200/60 text-slate-500 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
                title="ปิดบทวิเคราะห์"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {!isAiPanelCollapsed && (
            <div className="p-5 font-sans">
              {loadingAnalysis ? (
                <div className="flex flex-col gap-2.5 py-4">
                  <div className="h-4 bg-slate-200/60 rounded-md animate-pulse w-3/4" />
                  <div className="h-3 bg-slate-200/60 rounded-md animate-pulse w-full" />
                  <div className="h-3 bg-slate-200/60 rounded-md animate-pulse w-5/6" />
                  <div className="h-3 bg-slate-200/60 rounded-md animate-pulse w-4/5" />
                </div>
              ) : aiAnalysis ? (
                <div className="space-y-1">
                  {renderMarkdown(aiAnalysis)}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <span className="text-xs text-slate-400 font-medium">
                    ยังไม่มีข้อมูลบทวิเคราะห์แผนงานสอบเทียบในเดือนนี้
                  </span>
                  <button
                    onClick={() => handleAnalyzeSchedule(currentMonth, currentYear)}
                    disabled={currentMonthTasks.length === 0}
                    className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 font-bold text-[10.5px] rounded-lg text-slate-650 transition-all cursor-pointer shadow-3xs disabled:opacity-40 disabled:cursor-not-allowed select-none"
                  >
                    <Sparkles className="size-3 text-amber-500" />
                    เริ่มวิเคราะห์โดย AI
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Manual Assignment Dialog */}
      {editingGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-sans overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-xl flex flex-col animate-in fade-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="bg-primary text-white flex justify-between items-center px-6 py-4">
              <div className="flex items-center gap-2.5">
                <UserPlus className="size-5" />
                <span className="font-bold text-sm">แก้ไขแผนการจัดตารางงาน</span>
              </div>
              <button
                onClick={() => setEditingGroup(null)}
                className="text-white/80 hover:text-white transition-opacity cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {isPublished && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-800 font-medium">
                  ⚠️ หมายเหตุ: ตารางงานนี้เผยแพร่แล้ว การเปลี่ยนแปลงผู้รับผิดชอบหรือวันจะอัปเดตงานสอบเทียบในระบบทันที
                </div>
              )}

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-700 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">เครื่องมือสอบเทียบ:</span>
                  <span className="font-bold text-slate-800">{editingGroup.toolName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">แผนก/ห้อง:</span>
                  <span className="font-semibold text-slate-800">{editingGroup.sectionName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">จำนวนเครื่องมือ:</span>
                  <span className="font-bold text-primary">{editingGroup.taskIds.length} เครื่อง</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">วันครบกำหนดเดิม:</span>
                  <span className="font-semibold text-slate-800">
                    {(() => {
                      const groupTasks = tasks.filter((t) => editingGroup.taskIds.includes(t.id))
                      const dueDates = Array.from(
                        new Set(
                          groupTasks
                            .map((t) => t.equipment?.calibration_due_date)
                            .filter((d): d is string => !!d)
                        )
                      )
                      if (dueDates.length === 0) return "-"
                      return dueDates.map((d) => {
                        const parts = d.split("T")[0].split("-")
                        if (parts.length === 3) {
                          const [year, month, day] = parts
                          return `${day}/${month}/${Number(year) + 543}`
                        }
                        return d
                      }).join(", ")
                    })()}
                  </span>
                </div>
                <div className="flex flex-col gap-1 border-t border-slate-200/50 pt-2 mt-1">
                  <span className="text-slate-450 text-[10px]">รหัสเครื่องมือในกลุ่ม:</span>
                  <span className="font-mono text-[10px] text-slate-600 break-words">{editingGroup.assetCodes.join(", ")}</span>
                </div>
              </div>

              {/* 1. Technician Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">ช่างเทคนิคผู้รับผิดชอบ</label>
                <div className="relative">
                  <select
                    value={selectedTechId}
                    onChange={(e) => setSelectedTechId(Number(e.target.value))}
                    className="appearance-none w-full h-10 px-4 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none cursor-pointer shadow-3xs"
                  >
                    <option value="" disabled className="text-slate-400">
                      -- เลือกช่างผู้รับผิดชอบ --
                    </option>
                    {technicians.map((tech) => (
                      <option key={tech.id} value={tech.id}>
                        {tech.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* 2. Date Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">วันที่ปฏิบัติงาน</label>
                <div className="relative">
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(Number(e.target.value))}
                    className="appearance-none w-full h-10 px-4 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none cursor-pointer shadow-3xs"
                  >
                    {Array.from({ length: daysInMonth }).map((_, idx) => {
                      const d = idx + 1
                      return (
                        <option key={d} value={d}>
                          วันที่ {d} {thaiMonths[currentMonth]} {currentYear + 543}
                        </option>
                      )
                    })}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 px-6 py-4 bg-slate-50 border-t border-slate-100">
              <button
                onClick={() => setEditingGroup(null)}
                className="px-5 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors text-xs font-medium cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveReassignGroup}
                disabled={!selectedTechId}
                className="flex items-center gap-1.5 px-5 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors text-xs font-bold disabled:opacity-50 cursor-pointer"
              >
                <Save className="size-3.5" />
                บันทึก
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Color Selection Dialog */}
      {pickingColorTech && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-sans overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-xl flex flex-col animate-in fade-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="bg-primary text-white flex justify-between items-center px-6 py-4">
              <div className="flex items-center gap-2.5">
                <Paintbrush className="size-5" />
                <span className="font-bold text-sm">เลือกสีประจำตัวช่างสอบเทียบ</span>
              </div>
              <button
                onClick={() => setPickingColorTech(null)}
                className="text-white/80 hover:text-white transition-opacity cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="text-slate-700 text-xs">
                ช่างเทคนิค: <span className="font-bold text-sm text-slate-800">{pickingColorTech.name}</span> ({pickingColorTech.email || "ไม่ระบุอีเมล"})
              </div>
              
              <div className="grid grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-1">
                {Object.entries(COLOR_DEFINITIONS).map(([key, value]) => {
                  const isSelected = (techColorsMap[pickingColorTech.id] || DEFAULT_ORDER[pickingColorTech.id % DEFAULT_ORDER.length]) === key
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        const newMap = { ...techColorsMap, [pickingColorTech.id]: key }
                        setTechColorsMap(newMap)
                        localStorage.setItem("mecms_tech_colors_map", JSON.stringify(newMap))
                        toast.success(`เปลี่ยนสีของ ${pickingColorTech.name} เป็น สี${value.name} เรียบร้อย`)
                        setPickingColorTech(null)
                      }}
                      className={`flex flex-col gap-2.5 p-3.5 border rounded-xl text-left transition-all hover:bg-slate-50/80 cursor-pointer ${
                        isSelected ? "border-primary bg-primary/5 shadow-3xs ring-2 ring-primary/20" : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">สี{value.name}</span>
                        {isSelected && <Check className="size-4 text-primary" />}
                      </div>
                      
                      {/* Visual Demo of Chip */}
                      <div className={`text-[9.5px] px-2 py-1 border ${value.border} ${value.borderL} border-l-4 ${value.bg} rounded-lg flex flex-col gap-0.5 pointer-events-none`}>
                        <span className={`font-bold ${value.text} flex items-center gap-1.5`}>
                          <span className={`size-1.5 rounded-full ${value.dot}`} />
                          ตัวอย่างป้ายงาน
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end px-6 py-4 bg-slate-50 border-t border-slate-100">
              <button
                onClick={() => setPickingColorTech(null)}
                className="px-5 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors text-xs font-medium cursor-pointer"
              >
                ปิด
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}

function parseBoldText(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return <strong key={index} className="font-bold text-slate-800">{part}</strong>
    }
    return part
  })
}

function renderMarkdown(text: string) {
  return text.split("\n").map((line, i) => {
    if (line.startsWith("### ")) {
      return <h4 key={i} className="text-base font-bold text-slate-800 mt-3.5 mb-1.5 flex items-center gap-1.5">{line.slice(4)}</h4>
    }
    if (line.startsWith("## ")) {
      return <h3 key={i} className="text-lg font-bold text-slate-800 mt-4.5 mb-2 flex items-center gap-1.5 border-b border-slate-100 pb-1">{line.slice(3)}</h3>
    }
    if (line.startsWith("# ")) {
      return <h2 key={i} className="text-xl font-bold text-slate-900 mt-5.5 mb-2.5 flex items-center gap-2">{line.slice(2)}</h2>
    }
    if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
      const content = line.trim().slice(2)
      return (
        <li key={i} className="text-sm text-slate-600 list-disc ml-5 mb-1 leading-relaxed">
          {parseBoldText(content)}
        </li>
      )
    }
    if (line.trim() === "") {
      return <div key={i} className="h-1.5" />
    }
    return <p key={i} className="text-sm text-slate-600 leading-relaxed mb-1.5">{parseBoldText(line)}</p>
  })
}

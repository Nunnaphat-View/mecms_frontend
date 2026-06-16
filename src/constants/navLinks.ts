import {
  Home,
  Calendar,
  CalendarDays,
  MapPin,
  FileText,
  FileCheck,
  Settings2,
  Stethoscope,
  Wrench,
  Activity,
  Settings,
  DollarSign,
  ListTodo,
  Building2,
  Users,
  Hospital,
  History,
  Shield,
  type LucideIcon
} from "lucide-react"

export interface NavLinkProps {
  title: string
  caption?: string
  link?: string
  icon: LucideIcon
  children?: NavLinkProps[]
}

export const ALL_NAV_LINKS: NavLinkProps[] = [
  { 
    title: "หน้าหลัก", 
    caption: "Home Page", 
    icon: Home, 
    link: "/dashboard" 
  },
  {
    title: "แผนการสอบเทียบ",
    caption: "Calibration Schedule",
    icon: Calendar,
    link: "/schedule",
  },
  {
    title: "จัดการงานสอบเทียบ",
    caption: "Manage Calibration",
    icon: CalendarDays,
    link: "/schedule/manage",
  },
  { 
    title: "จัดการวอร์ด", 
    caption: "Ward Management", 
    icon: MapPin, 
    link: "/ward" 
  },
  {
    title: "บันทึกการสอบเทียบ",
    caption: "Calibration Records",
    icon: FileText,
    link: "/calibration",
  },
  {
    title: "รับรองการสอบเทียบ",
    caption: "Calibration Approval",
    icon: FileCheck,
    link: "/approval",
  },
  {
    title: "จัดการเครื่องมือ",
    caption: "Config Tools",
    icon: Settings2,
    children: [
      { 
        title: "เครื่องมือแพทย์", 
        caption: "Medical Tools", 
        icon: Stethoscope, 
        link: "/tools" 
      },
      {
        title: "เครื่องมือมาตรฐาน",
        caption: "Standard Tools",
        icon: Wrench,
        link: "/tools/standard",
      },
      {
        title: "กระบวนการสอบเทียบ",
        caption: "Calibration Processes",
        icon: Activity,
        link: "/tools/manage?tab=calibration",
      },
      {
        title: "ตั้งค่าเครื่องมือแพทย์",
        caption: "Medical Tools Settings",
        icon: Settings,
        link: "/tools/manage?tab=settings",
      },
      {
        title: "ค่าใช้จ่าย",
        caption: "Calibration Costs",
        icon: DollarSign,
        link: "/tools/manage?tab=cost",
      },
      {
        title: "รายการตรวจภายนอก",
        caption: "PM Checklist Items",
        icon: ListTodo,
        link: "/tools/pm-checklist",
      },
    ],
  },
  { 
    title: "หน่วยงาน", 
    caption: "Departments", 
    icon: Building2, 
    link: "/sections" 
  },
  { 
    title: "จัดการผู้ใช้งาน", 
    caption: "User Management", 
    icon: Users, 
    link: "/users" 
  },
  {
    title: "ข้อมูลโรงพยาบาล",
    caption: "Hospital Info",
    icon: Hospital,
    link: "/hospitals",
  },
  {
    title: "ประวัติการสอบเทียบ",
    caption: "Calibration History",
    icon: History,
    link: "/history",
  },
  {
    title: "ประวัติการเข้าใช้งาน",
    caption: "Audit Log",
    icon: Shield,
    link: "/audit",
  },
]

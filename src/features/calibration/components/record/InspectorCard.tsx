import { useAuthStore } from "@/features/auth/stores/authStore"
import { User as UserIcon } from "lucide-react"

interface Props {
  inspectorName?: string
  inspectorRole?: string
}

export default function InspectorCard({ inspectorName, inspectorRole }: Props) {
  const { user, appRole } = useAuthStore()

  const displayName = inspectorName ?? user?.name ?? "-"
  const displayRole = inspectorRole && inspectorRole !== "-" ? inspectorRole : (appRole ?? "-")

  return (
    <div className="border border-slate-200 rounded-2xl p-6 bg-white flex flex-col items-center shadow-xs">
      {/* Avatar centered */}
      <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-2 border border-slate-200">
        <UserIcon className="size-6 text-slate-500" />
      </div>
      <div className="font-bold text-sm text-slate-800 mb-4">ผู้ทำการสอบเทียบ</div>

      {/* Name & Role rows */}
      <div className="w-full space-y-2.5 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-slate-500 font-medium">ชื่อ</span>
          <span className="text-slate-800 font-semibold">{displayName}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-500 font-medium">ตำแหน่ง</span>
          <span className="text-slate-800 font-semibold">{displayRole}</span>
        </div>
      </div>
    </div>
  )
}

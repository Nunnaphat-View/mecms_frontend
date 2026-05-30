import React, { useState, useRef, useEffect, useMemo } from "react"
import { useAuthStore } from "@/stores/authStore"
import { LogOut, ChevronRight, Settings } from "lucide-react"
import { userService } from "@/services/userService"

interface ProfileCardProps {
  children: React.ReactNode
  onEditProfile: () => void
  onLogout: () => void
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  children,
  onEditProfile,
  onLogout,
}) => {
  const { user } = useAuthStore()
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const userAvatar = useMemo(() => {
    return userService.getFileUrl(user?.imageUrl) || "/image/profile.png"
  }, [user])

  const userFullName = useMemo(() => {
    return user?.name || "User Administrator"
  }, [user])

  const userRole = useMemo(() => {
    return user?.role?.description || user?.role?.name || "Hospital Admin"
  }, [user])

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        cardRef.current &&
        !cardRef.current.contains(target)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="relative">
      {/* Trigger Slot */}
      <div 
        ref={triggerRef} 
        onClick={() => setOpen((prev) => !prev)} 
        className="cursor-pointer select-none"
      >
        {children}
      </div>

      {/* Floating Card Popover */}
      {open && (
        <div
          ref={cardRef}
          className="absolute right-0 mt-2.5 w-[280px] bg-white rounded-[20px] shadow-2xl border border-slate-100 overflow-hidden z-[1020] animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Decorative Gradient Banner */}
          <div className="h-16 bg-gradient-to-r from-secondary to-primary" />

          {/* Avatar wrapper */}
          <div className="flex justify-center -mt-9">
            <div className="size-[72px] rounded-full overflow-hidden border-[3px] border-white shadow-md bg-slate-200">
              <img
                src={userAvatar}
                alt="User Avatar"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/image/profile.png"
                }}
              />
            </div>
          </div>

          {/* User Info */}
          <div className="px-6 pt-3 text-center">
            <h4 className="text-[16px] font-bold text-slate-800 leading-tight">
              {userFullName}
            </h4>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {userRole}
            </p>
          </div>

          {/* Divider */}
          <hr className="border-slate-100 my-4 mx-6" />

          {/* Actions */}
          <div className="px-3 pb-4 flex flex-col gap-1">
            <button
              onClick={() => {
                setOpen(false)
                onEditProfile()
              }}
              className="flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-xl hover:bg-cyan-50/50 hover:text-primary hover:translate-x-0.5 transition-all text-[13.5px] font-semibold text-slate-600 text-left cursor-pointer group"
            >
              <Settings className="size-[18px] text-primary shrink-0 transition-transform group-hover:rotate-45 duration-300" />
              <span>แก้ไขโปรไฟล์</span>
              <ChevronRight className="size-4 text-slate-400 ml-auto opacity-0 translate-x-[-4px] group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </button>

            <button
              onClick={() => {
                setOpen(false)
                onLogout()
              }}
              className="flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-xl hover:bg-rose-50 hover:text-rose-600 hover:translate-x-0.5 transition-all text-[13.5px] font-semibold text-slate-600 text-left cursor-pointer group"
            >
              <LogOut className="size-[18px] text-rose-500 shrink-0" />
              <span>ออกจากระบบ</span>
              <ChevronRight className="size-4 text-slate-400 ml-auto opacity-0 translate-x-[-4px] group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

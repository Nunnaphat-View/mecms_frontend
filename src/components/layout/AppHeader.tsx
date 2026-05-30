import React, { useMemo, useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "@/stores/authStore"
import { Menu, Bell, LogOut, Activity, User as UserIcon } from "lucide-react"

interface AppHeaderProps {
  onToggleDrawer: () => void
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onToggleDrawer }) => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"

  const profileImage = useMemo(() => {
    const img = user?.imageUrl
    if (!img) return "/image/profile.png"
    if (img.startsWith("http")) return img
    return `${apiBase}${img}`
  }, [user, apiBase])

  const userRole = useMemo(() => {
    return user?.role?.description || user?.role?.name || "Hospital Admin"
  }, [user])

  const userFullName = useMemo(() => {
    return user?.name || "User Administrator"
  }, [user])

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <header className="bg-primary text-primary-foreground shadow-md h-[50px] sticky top-0 z-[1000] border-b border-primary/20 flex items-center">
      <div className="w-full px-4 flex items-center justify-between">
        
        {/* Left Section: Logo and Title */}
        <div className="flex items-center">
          <button
            onClick={onToggleDrawer}
            className="p-1.5 rounded-lg text-white hover:bg-white/10 xl:hidden mr-2 cursor-pointer shrink-0 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="size-6" />
          </button>

          <div className="flex items-center select-none">
            {/* Medical services / Activity icon */}
            <Activity className="size-7 text-white hidden sm:block mr-5 shrink-0" />
            
            <div className="flex flex-col">
              <span 
                className="text-white font-bold leading-tight select-text" 
                style={{ fontSize: "clamp(13px, 4vw, 15.5px)" }}
              >
                ระบบบริหารจัดการสอบเทียบเครื่องมือแพทย์
              </span>
              <span className="text-[10px] text-white/70 font-normal leading-tight hidden sm:block mt-0.5 select-text">
                Medical Calibration Management System
              </span>
            </div>
          </div>
        </div>

        {/* Right Section: Notifications and User Profile */}
        <div className="flex items-center gap-2">
          
          {/* Notifications Button */}
          <button
            className="p-2 text-white hover:bg-white/10 rounded-full cursor-pointer relative transition-colors"
            aria-label="Notifications"
          >
            <Bell className="size-[22px]" />
            <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border border-primary animate-pulse" />
          </button>

          {/* Divider */}
          <div className="h-6 w-[1px] bg-white/20 mx-2 hidden sm:block" />

          {/* User Profile Card Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2.5 pl-2 py-1 pr-1.5 hover:bg-white/10 rounded-full transition-colors cursor-pointer select-none"
            >
              <div className="flex flex-col text-right hidden sm:flex">
                <span className="text-[12.5px] font-bold text-white leading-tight">{userFullName}</span>
                <span className="text-[9.5px] text-white/80 font-normal leading-none mt-0.5">{userRole}</span>
              </div>
              <div className="size-9 rounded-full overflow-hidden border-[2.5px] border-white/50 hover:border-white hover:scale-105 transition-all duration-250 shadow-sm shrink-0 bg-slate-200">
                <img 
                  src={profileImage} 
                  alt="User Profile" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/image/profile.png"
                  }}
                />
              </div>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-[1020] animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4.5 py-2.5 border-b border-slate-100 flex flex-col sm:hidden">
                  <span className="text-sm font-bold text-slate-800 leading-tight">{userFullName}</span>
                  <span className="text-[10px] text-slate-500 font-medium leading-none mt-1">{userRole}</span>
                </div>
                
                <button
                  onClick={() => {
                    setIsDropdownOpen(false)
                    navigate("/profile")
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-slate-700 hover:bg-slate-50 text-left transition-colors cursor-pointer"
                >
                  <UserIcon className="size-4 text-slate-400" />
                  <span>ข้อมูลส่วนตัว</span>
                </button>
                
                <button
                  onClick={() => {
                    setIsDropdownOpen(false)
                    logout()
                    navigate("/")
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-red-600 hover:bg-red-50 text-left transition-colors cursor-pointer border-t border-slate-100 mt-1"
                >
                  <LogOut className="size-4" />
                  <span>ออกจากระบบ</span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  )
}

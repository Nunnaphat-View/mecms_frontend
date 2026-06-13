import React, { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "@/features/auth/stores/authStore"
import { Menu, Bell, Activity } from "lucide-react"
import { ProfileCard } from "./ProfileCard"
import { userService } from "@/features/users/services/userService"

interface AppHeaderProps {
  onToggleDrawer: () => void
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onToggleDrawer }) => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const profileImage = useMemo(() => {
    return userService.getFileUrl(user?.imageUrl) || "/image/profile.png"
  }, [user])

  const userRole = useMemo(() => {
    return user?.role?.description || user?.role?.name || "Hospital Admin"
  }, [user])

  const userFullName = useMemo(() => {
    return user?.name || "User Administrator"
  }, [user])

  return (
    <>
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
            <ProfileCard
              onEditProfile={() => navigate("/settings")}
              onLogout={() => {
                logout()
                navigate("/")
              }}
            >
              <div className="flex items-center gap-2.5 pl-2 py-1 pr-1.5 hover:bg-white/10 rounded-full transition-colors cursor-pointer select-none">
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
              </div>
            </ProfileCard>

          </div>
        </div>
      </header>
    </>
  )
}

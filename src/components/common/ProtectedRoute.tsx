import React from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuthStore } from "@/stores/authStore"
import { RolePermissionsMap, mapRoleToAppRole } from "@/constants/roles"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuthStore()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 rounded-full border-4 border-slate-200 border-t-[#09637e] animate-spin" />
          <span className="text-sm font-semibold text-slate-500 font-sans">กำลังโหลดข้อมูล...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace state={{ from: location }} />
  }

  const appRole = mapRoleToAppRole(user.role)
  const rolePermissions = RolePermissionsMap[appRole]
  const allowedMenus = rolePermissions?.allowedMenus || []

  const currentPath = location.pathname

  // Check if current path (or prefix for dynamic paths) is allowed
  const isAllowed = (() => {
    // 1. Exact match
    if (allowedMenus.includes(currentPath)) return true

    // 2. Base path check for dynamic routes
    if (currentPath.startsWith("/calibration/")) {
      return allowedMenus.includes("/calibration")
    }
    if (currentPath.startsWith("/approval/")) {
      return allowedMenus.includes("/approval")
    }
    if (currentPath.startsWith("/tools/config/")) {
      return allowedMenus.includes("/tools/manage") || allowedMenus.includes("/tools")
    }

    return false
  })()

  if (!isAllowed) {
    // If not allowed, redirect to their main dashboard or first allowed page
    const fallbackPath = allowedMenus.includes("/dashboard")
      ? "/dashboard"
      : allowedMenus.includes("/director-dashboard")
      ? "/director-dashboard"
      : (allowedMenus[0] || "/")

    return <Navigate to={fallbackPath} replace />
  }

  return <>{children}</>
}

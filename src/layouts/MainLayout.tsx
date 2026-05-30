import { useState } from "react"
import { Outlet } from "react-router-dom"
import { AppHeader } from "@/components/layout/AppHeader"
import { AppDrawer } from "@/components/layout/AppDrawer"

export default function MainLayout() {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* App Header */}
      <AppHeader onToggleDrawer={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)} />

      {/* Main Page Layout Wrapper */}
      <div className="flex-1 flex w-full">
        {/* Sidebar Navigation */}
        <AppDrawer 
          isOpen={isMobileDrawerOpen} 
          onClose={() => setIsMobileDrawerOpen(false)} 
        />

        {/* Content Area */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

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

      {/* Footer */}
      <footer className="bg-slate-100 border-t border-slate-200 py-6 z-[980]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <span>&copy; 2026 MECMS Portal. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

import { useState } from "react"
import { Outlet, useLocation } from "react-router-dom"
import { AppHeader } from "@/components/layout/AppHeader"
import { AppDrawer } from "@/components/layout/AppDrawer"

export default function MainLayout() {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)
  const [isPinned, setIsPinned] = useState(() => {
    const saved = localStorage.getItem("sidebar_pinned")
    return saved ? saved === "true" : false
  })
  const location = useLocation()
  const [prevPathname, setPrevPathname] = useState(location.pathname)

  // Close mobile drawer and collapse tablet/desktop drawer on route change during render
  if (location.pathname !== prevPathname) {
    setPrevPathname(location.pathname)
    setIsMobileDrawerOpen(false)
    setIsPinned(false)
  }

  const handleToggleDrawer = () => {
    if (window.innerWidth < 768) {
      setIsMobileDrawerOpen((prev) => !prev)
    } else {
      setIsPinned((prev) => {
        const next = !prev
        localStorage.setItem("sidebar_pinned", String(next))
        return next
      })
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* App Header */}
      <AppHeader onToggleDrawer={handleToggleDrawer} />

      {/* Main Page Layout Wrapper */}
      <div className="flex-1 flex w-full">
        {/* Sidebar Navigation */}
        <AppDrawer 
          isOpen={isMobileDrawerOpen} 
          isPinned={isPinned}
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

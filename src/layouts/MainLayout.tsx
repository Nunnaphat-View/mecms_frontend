import { Link, Outlet, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { 
  Activity, 
  Wrench, 
  ClipboardCheck, 
  History, 
  Users, 
  LayoutDashboard,
  LogOut
} from "lucide-react"

export default function MainLayout() {
  const location = useLocation()
  const currentPath = location.pathname

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Equipment / Tools", path: "/tools", icon: Wrench },
    { label: "Calibration Tasks", path: "/calibration", icon: ClipboardCheck },
    { label: "Calibration History", path: "/history", icon: History },
    { label: "Users & Roles", path: "/users", icon: Users },
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* App Header */}
      <header className="bg-primary text-white shadow-sm border-b border-primary/20 sticky top-0 z-15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg">
              <Activity className="size-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight">MECMS</span>
              <span className="text-[10px] block text-white/70">Medical Equipment Control Management System</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium bg-white/10 px-3 py-1 rounded-full text-white">
              Hospital Admin
            </span>
            <Link to="/">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" title="Log Out">
                <LogOut className="size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Page Layout Wrapper */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar Navigation */}
        <aside className="w-64 border-r border-slate-200 bg-white hidden md:flex flex-col p-4 gap-2 min-h-[calc(100vh-4rem)]">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-450 px-3 mb-2">
            Navigation Menu
          </div>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = currentPath === item.path
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={`w-full justify-start gap-3 h-10 px-3 text-sm font-medium ${
                      isActive 
                        ? "bg-secondary text-white hover:bg-secondary/90 hover:text-white" 
                        : "text-slate-650 hover:bg-slate-50 hover:text-primary"
                    }`}
                  >
                    <Icon className={`size-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </nav>
          <div className="mt-auto bg-slate-50 border border-slate-150 p-4 rounded-xl text-xs text-slate-500 leading-relaxed">
            <span className="font-semibold block text-slate-700 mb-1">MECMS React Client</span>
            Migrated from Quasar Vue. Preserves original brand colors and layouts.
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-slate-100 border-t border-slate-200 py-6">
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

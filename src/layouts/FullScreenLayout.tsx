import { Outlet } from "react-router-dom"

export default function FullScreenLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
      <Outlet />
    </div>
  )
}

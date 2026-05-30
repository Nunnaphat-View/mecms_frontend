import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Activity, Lock, User } from "lucide-react"

export default function LoginPage() {
  const navigate = useNavigate()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    navigate("/dashboard")
  }

  return (
    <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
      <div className="flex flex-col items-center gap-3 text-center mb-8">
        <div className="bg-primary/10 p-3 rounded-xl text-primary">
          <Activity className="size-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">MECMS Portal</h1>
          <p className="text-slate-500 text-sm mt-1">Medical Equipment Control Management System</p>
        </div>
      </div>

      <form onSubmit={handleLogin} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-650 uppercase tracking-wider" htmlFor="username">
            Username
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              id="username"
              type="text"
              required
              placeholder="Enter your username"
              className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-650 uppercase tracking-wider" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              id="password"
              type="password"
              required
              placeholder="Enter your password"
              className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <Button type="submit" variant="default" className="w-full h-11 text-sm font-semibold mt-2">
          Sign In
        </Button>
      </form>

      <div className="text-center mt-6 text-xs text-slate-400">
        Authorized Access Only. All transactions are logged.
      </div>
    </div>
  )
}

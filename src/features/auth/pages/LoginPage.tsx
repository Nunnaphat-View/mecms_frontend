import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/features/auth/stores/authStore"
import { AppRole } from "@/constants/roles"
import { 
  AlertCircle, 
  Eye, 
  EyeOff, 
  KeyRound, 
  LogIn 
} from "lucide-react"

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated, appRole, isLoading } = useAuthStore()
  
  // Form states
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  
  // Validation error states
  const [usernameError, setUsernameError] = useState(false)
  const [passwordError, setPasswordError] = useState(false)
  
  // Login submission error state
  const [loginError, setLoginError] = useState("")
  
  // Animation state for validation failure shake
  const [shake, setShake] = useState(false)
  
  const [showPassword, setShowPassword] = useState(false)
  const [rememberDevice, setRememberDevice] = useState(false)

  useEffect(() => {
    if (!isLoading && isAuthenticated && appRole) {
      const state = location.state as { from?: { pathname: string; search: string } } | null;
      const from = state?.from;
      
      if (from) {
        navigate(from.pathname + from.search, { replace: true });
      } else if (appRole === AppRole.DIRECTOR) {
        navigate("/director-dashboard", { replace: true })
      } else {
        navigate("/dashboard", { replace: true })
      }
    }
  }, [isAuthenticated, appRole, isLoading, navigate, location.state])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")
    
    const isUserEmpty = !username.trim()
    const isPassEmpty = !password.trim()
    
    setUsernameError(isUserEmpty)
    setPasswordError(isPassEmpty)
    
    if (isUserEmpty || isPassEmpty) {
      setShake(true)
      setTimeout(() => setShake(false), 500)
      return
    }

    try {
      await login(username, password)
    } catch (err: unknown) {
      setShake(true)
      setTimeout(() => setShake(false), 500)
      const errorMessage = err instanceof Error ? err.message : "ไม่สามารถเชื่อมต่อระบบหลังบ้านได้ กรุณาลองใหม่อีกครั้ง"
      setLoginError(errorMessage)
    }
  }


  return (
    <div className="relative min-h-screen w-screen flex items-center justify-center bg-gradient-to-br from-[#cbecea] via-[#d7f2f0] to-[#e4f7f6] overflow-hidden font-sans select-none">
      
      {/* Premium radial glow overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4)_0%,transparent_70%)] pointer-events-none" />

      {/* --- Floating Background Medical SVGs with Float Animations --- */}
      
      {/* Pill/Medicine Jar (Top-Left) */}
      <div className="absolute top-12 left-16 w-32 h-32 text-[#09637e] opacity-10 pointer-events-none animate-float-pill">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M6 18V9h12v9a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3Z" />
          <path d="M9 9V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4" />
          <path d="M12 11v6M10 14h4" />
          <rect x="5" y="3" width="14" height="2" rx="0.5" fill="currentColor" className="opacity-20" />
        </svg>
      </div>

      {/* Microscope (Bottom-Left) */}
      <div className="absolute bottom-16 left-24 w-40 h-40 text-[#09637e] opacity-10 pointer-events-none animate-float-microscope">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M6 18h12M12 18v-3" />
          <path d="M8 12a4 4 0 0 1 4-4h1v3H9" />
          <path d="M14 5l3 3-5 5-3-3 5-5z" />
          <path d="M9 15a3 3 0 0 0 3-3V8" />
          <circle cx="15.5" cy="6.5" r="1" fill="currentColor" />
        </svg>
      </div>

      {/* Flask/Beaker (Top-Right) */}
      <div className="absolute top-20 right-32 w-32 h-32 text-[#09637e] opacity-10 pointer-events-none animate-float-flask">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M9 3h6M10 3v4.5L5.5 17a2 2 0 0 0 1.8 3h9.4a2 2 0 0 0 1.8-3L14 7.5V3" />
          <path d="M7.5 14.5h9" className="opacity-30" />
          <path d="M6.5 17.5h11" className="opacity-30" />
        </svg>
      </div>

      {/* ECG Monitor Card (Bottom-Right) */}
      <div className="absolute bottom-20 right-28 w-36 h-36 text-[#09637e] opacity-10 pointer-events-none animate-float-pulse">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 12h4.5l1.5-3.5L11 16.5l2-8 1.5 3.5H21" />
        </svg>
      </div>

      {/* --- Main Login Card Container --- */}
      <div className={`w-full max-w-[430px] bg-white/95 backdrop-blur-md rounded-xl p-9 border border-white/80 shadow-[0_20px_50px_rgba(9,99,126,0.12),0_4px_12px_rgba(0,0,0,0.02)] transition-all duration-300 transform scale-100 hover:shadow-[0_24px_60px_rgba(9,99,126,0.16)] z-10 mx-4 ${
        shake ? "animate-shake-input" : ""
      }`}>
        
        {/* Gear-Heart Logo Header */}
        <div className="flex flex-col items-center gap-4 text-center mb-8">
          <div className="bg-gradient-to-tr from-[#09637e] to-[#088395] p-3.5 rounded-2xl text-white shadow-md transition-transform duration-300 hover:scale-105">
            <svg 
              className="size-8"
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              {/* Custom heart-in-gear SVG paths */}
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <path d="M12 14.5c-1.5-1.5-2.5-2.2-2.5-3.2a1.7 1.7 0 0 1 3-1 1.7 1.7 0 0 1 3 1c0 1-1 1.7-2.5 3.2z" fill="currentColor" />
            </svg>
          </div>
          <h1 className="text-[22px] font-bold text-slate-800 tracking-wide font-sans">
            เข้าสู่ระบบ MECMS
          </h1>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          {loginError && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2 text-rose-800 text-xs font-semibold animate-pulse">
              <AlertCircle className="size-4 shrink-0 text-red-500 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}
          
          {/* User ID Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] text-slate-500 font-semibold" htmlFor="username">
              User ID / Email
            </label>
            <div className="relative group">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#09637e] transition-colors">
                {/* Briefcase/ID icon */}
                <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <rect x="2" y="7" width="20" height="14" rx="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              </span>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value)
                  if (e.target.value.trim()) setUsernameError(false)
                }}
                placeholder="Enter your ID"
                className={`w-full h-12 pl-11 pr-10 bg-slate-50/50 border rounded-xl text-sm font-sans focus:outline-none focus:bg-white focus:ring-4 focus:ring-[#09637e]/10 transition-all ${
                  usernameError 
                    ? "border-red-400 focus:border-red-400 focus:ring-red-100" 
                    : "border-slate-200 focus:border-[#09637e]"
                }`}
              />
              {usernameError && (
                <AlertCircle className="absolute right-3.5 top-1/2 -translate-y-1/2 size-5 text-red-500" />
              )}
            </div>
            {usernameError && (
              <span className="text-xs text-red-500 font-semibold pl-1 mt-0.5 animate-pulse">
                Please type your User ID / Email
              </span>
            )}
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] text-slate-500 font-semibold" htmlFor="password">
              Password
            </label>
            <div className="relative group">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#09637e] transition-colors">
                <KeyRound className="size-5 rotate-90" strokeWidth={2.2} />
              </span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (e.target.value.trim()) setPasswordError(false)
                }}
                placeholder="••••••••"
                className={`w-full h-12 pl-11 pr-20 bg-slate-50/50 border rounded-xl text-sm font-sans focus:outline-none focus:bg-white focus:ring-4 focus:ring-[#09637e]/10 transition-all ${
                  passwordError 
                    ? "border-red-400 focus:border-red-400 focus:ring-red-100" 
                    : "border-slate-200 focus:border-[#09637e]"
                }`}
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {passwordError && (
                  <AlertCircle className="size-5 text-red-500" />
                )}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 p-1 focus:outline-none transition-colors"
                >
                  {showPassword ? (
                    <Eye className="size-5" />
                  ) : (
                    <EyeOff className="size-5" />
                  )}
                </button>
              </div>
            </div>
            {passwordError && (
              <span className="text-xs text-red-500 font-semibold pl-1 mt-0.5 animate-pulse">
                Please type your password
              </span>
            )}
          </div>

          {/* Remember Me & Reset Link */}
          <div className="flex items-center justify-between text-sm mt-1">
            <label className="flex items-center gap-2 text-[13px] text-slate-500 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberDevice}
                onChange={(e) => setRememberDevice(e.target.checked)}
                className="size-4 rounded border-slate-300 text-[#09637e] focus:ring-[#09637e] transition-colors"
              />
              Remember device
            </label>
            <a href="#" className="text-[13px] text-[#09637e] hover:underline font-semibold transition-all">
              Reset Password?
            </a>
          </div>

          {/* Submit Sign In Button */}
          <Button 
            type="submit" 
            className="w-full h-12 bg-gradient-to-r from-[#09637e] to-[#088395] hover:brightness-105 active:scale-[0.98] text-white rounded-xl text-md font-semibold gap-2 mt-2 shadow-[0_6px_20px_rgba(9,99,126,0.22)] hover:shadow-[0_8px_24px_rgba(9,99,126,0.3)] transition-all flex items-center justify-center border-none cursor-pointer"
          >
            เข้าสู่ระบบ
            <LogIn className="size-5 transition-transform group-hover:translate-x-0.5" />
          </Button>

        </form>
      </div>
    </div>
  )
}

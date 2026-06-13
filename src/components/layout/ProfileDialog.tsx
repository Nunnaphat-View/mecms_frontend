import { useState, useMemo, useRef } from "react"
import {
  X,
  User as UserIcon,
  Lock,
  Camera,
  Save,
  Eye,
  EyeOff,
  Phone,
  Mail,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  PenLine,
} from "lucide-react"
import { useAuthStore } from "@/features/auth/stores/authStore"
import { userService } from "@/features/users/services/userService"
import { authService } from "@/features/auth/services/authService"

// ── Types ─────────────────────────────────────────────────────────────────────
type ToastType = "success" | "error" | "warning"
interface Toast { type: ToastType; message: string }
type Tab = "profile" | "password"


interface ProfileDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function ProfileDialog({ isOpen, onClose }: ProfileDialogProps) {
  const { user, token } = useAuthStore()

  const [activeTab, setActiveTab] = useState<Tab>("profile")

  // ── Toast ─────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState<Toast | null>(null)
  function showToast(type: ToastType, message: string) {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Profile form ──────────────────────────────────────────────────────────
  const [profileForm, setProfileForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    tel: user?.tel ?? "",
    position: user?.position ?? "",
  })
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  // ── Avatar ────────────────────────────────────────────────────────────────
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const currentAvatar = useMemo(
    () => avatarPreview ?? (userService.getFileUrl(user?.imageUrl) || "/image/profile.png"),
    [avatarPreview, user?.imageUrl]
  )

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  // ── Signature ─────────────────────────────────────────────────────────────
  const sigInputRef = useRef<HTMLInputElement>(null)
  const [sigFile, setSigFile] = useState<File | null>(null)
  const [sigPreview, setSigPreview] = useState<string | null>(null)

  const currentSig = useMemo(
    () => sigPreview ?? userService.getFileUrl(user?.signatureUrl),
    [sigPreview, user?.signatureUrl]
  )

  function handleSigChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setSigFile(file)
    setSigPreview(URL.createObjectURL(file))
  }

  // ── Save profile ──────────────────────────────────────────────────────────
  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setIsSavingProfile(true)
    try {
      const fd = new FormData()
      fd.append("name", profileForm.name.trim())
      fd.append("email", profileForm.email.trim())
      fd.append("tel", profileForm.tel.trim())
      fd.append("position", profileForm.position.trim())
      if (avatarFile) fd.append("image", avatarFile)
      if (sigFile) fd.append("signature", sigFile)

      const updated = await userService.update(user.id, fd)
      authService.setSession(token!, updated)
      showToast("success", "บันทึกข้อมูลส่วนตัวสำเร็จ")
      setAvatarFile(null)
      setSigFile(null)
    } catch (err) {
      console.error(err)
      showToast("error", "บันทึกข้อมูลล้มเหลว กรุณาลองใหม่")
    } finally {
      setIsSavingProfile(false)
    }
  }

  // ── Password form ─────────────────────────────────────────────────────────
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" })
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false })
  const [isSavingPw, setIsSavingPw] = useState(false)

  async function handleSavePassword(e: React.FormEvent) {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      showToast("error", "รหัสผ่านใหม่ไม่ตรงกัน")
      return
    }
    if (pwForm.newPassword.length < 6) {
      showToast("warning", "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร")
      return
    }
    if (!user) return
    setIsSavingPw(true)
    try {
      const fd = new FormData()
      fd.append("currentPassword", pwForm.currentPassword)
      fd.append("password", pwForm.newPassword)
      await userService.update(user.id, fd)
      showToast("success", "เปลี่ยนรหัสผ่านสำเร็จ")
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "เปลี่ยนรหัสผ่านล้มเหลว"
      showToast("error", msg.toLowerCase().includes("incorrect") || msg.toLowerCase().includes("wrong") ? "รหัสผ่านปัจจุบันไม่ถูกต้อง" : msg)
    } finally {
      setIsSavingPw(false)
    }
  }

  // ── Handle close ──────────────────────────────────────────────────────────
  function handleClose() {
    setActiveTab("profile")
    setAvatarFile(null)
    setAvatarPreview(null)
    setSigFile(null)
    setSigPreview(null)
    setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-[1100] animate-in fade-in duration-150"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-[1110] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col pointer-events-auto animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-3">
              <img
                src={currentAvatar}
                alt="avatar"
                className="size-9 rounded-full object-cover border-2 border-primary/20"
                onError={(e) => { (e.target as HTMLImageElement).src = "/image/profile.png" }}
              />
              <div>
                <div className="font-bold text-slate-800 text-sm leading-tight">{user?.name || "—"}</div>
                <div className="text-[10px] text-slate-400 leading-none mt-0.5">{user?.role?.description || user?.role?.name}</div>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="size-4.5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-100 shrink-0">
            {([
              { id: "profile" as Tab, label: "ข้อมูลส่วนตัว", icon: UserIcon },
              { id: "password" as Tab, label: "เปลี่ยนรหัสผ่าน", icon: Lock },
            ]).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold transition-colors cursor-pointer border-b-2 -mb-px ${
                  activeTab === id
                    ? "border-primary text-primary"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <Icon className="size-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Scrollable body */}
          <div className="overflow-y-auto flex-1">

            {/* ── Profile Tab ─────────────────────────────────────────── */}
            {activeTab === "profile" && (
              <form onSubmit={(e) => void handleSaveProfile(e)} className="p-5 flex flex-col gap-5">

                {/* Avatar + Signature */}
                <div className="flex gap-4">
                  {/* Avatar */}
                  <div className="flex flex-col items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-semibold text-slate-500">รูปโปรไฟล์</span>
                    <div className="relative group">
                      <img
                        src={currentAvatar}
                        alt="avatar"
                        className="size-20 rounded-full object-cover border-2 border-slate-200 group-hover:border-primary/40 transition-colors"
                        onError={(e) => { (e.target as HTMLImageElement).src = "/image/profile.png" }}
                      />
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        className="absolute bottom-0 right-0 size-6 bg-primary text-white rounded-full flex items-center justify-center shadow hover:bg-primary/90 transition-colors cursor-pointer"
                      >
                        <Camera className="size-3" />
                      </button>
                      <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    </div>
                    <span className="text-[9px] text-slate-400">JPG, PNG</span>
                  </div>

                  {/* Signature */}
                  <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                    <span className="text-[10px] font-semibold text-slate-500">ลายเซ็น</span>
                    <div
                      onClick={() => sigInputRef.current?.click()}
                      className="flex-1 min-h-[80px] border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center cursor-pointer hover:border-primary/40 transition-colors bg-slate-50 overflow-hidden"
                    >
                      {currentSig ? (
                        <img src={currentSig} alt="signature" className="max-h-16 max-w-full object-contain p-1" />
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-slate-400">
                          <PenLine className="size-5" />
                          <span className="text-[10px]">คลิกเพื่ออัปโหลด</span>
                        </div>
                      )}
                    </div>
                    <input ref={sigInputRef} type="file" accept="image/*" className="hidden" onChange={handleSigChange} />
                    <span className="text-[9px] text-slate-400">PNG พื้นหลังโปร่งใสแนะนำ</span>
                  </div>
                </div>

                <div className="border-t border-slate-100" />

                {/* Fields */}
                <div className="grid grid-cols-2 gap-3">
                  {/* ชื่อ */}
                  <div className="col-span-2 flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                      <UserIcon className="size-3 text-slate-400" /> ชื่อ-นามสกุล
                    </label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="ชื่อ-นามสกุล"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all"
                    />
                  </div>

                  {/* อีเมล */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                      <Mail className="size-3 text-slate-400" /> อีเมล
                    </label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
                      placeholder="example@email.com"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all"
                    />
                  </div>

                  {/* เบอร์โทร */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                      <Phone className="size-3 text-slate-400" /> เบอร์โทร
                    </label>
                    <input
                      type="tel"
                      value={profileForm.tel}
                      onChange={(e) => setProfileForm((p) => ({ ...p, tel: e.target.value }))}
                      placeholder="0xx-xxx-xxxx"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all"
                    />
                  </div>

                  {/* ตำแหน่ง */}
                  <div className="col-span-2 flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                      <Briefcase className="size-3 text-slate-400" /> ตำแหน่ง
                    </label>
                    <input
                      type="text"
                      value={profileForm.position}
                      onChange={(e) => setProfileForm((p) => ({ ...p, position: e.target.value }))}
                      placeholder="ตำแหน่งงาน"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all"
                    />
                  </div>

                  {/* Username read-only */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-slate-500">ชื่อผู้ใช้งาน</label>
                    <input type="text" value={user?.username ?? ""} readOnly
                      className="w-full px-3 py-2 rounded-xl border border-slate-100 bg-slate-50 text-sm text-slate-400 cursor-not-allowed" />
                  </div>

                  {/* Role read-only */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-slate-500">บทบาท</label>
                    <input type="text" value={user?.role?.description || user?.role?.name || ""} readOnly
                      className="w-full px-3 py-2 rounded-xl border border-slate-100 bg-slate-50 text-sm text-slate-400 cursor-not-allowed" />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="flex items-center gap-2 px-5 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSavingProfile
                      ? <span className="inline-block size-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <Save className="size-3.5" />}
                    {isSavingProfile ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                  </button>
                </div>
              </form>
            )}

            {/* ── Password Tab ─────────────────────────────────────────── */}
            {activeTab === "password" && (
              <form onSubmit={(e) => void handleSavePassword(e)} className="p-5 flex flex-col gap-4">
                <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
                  <AlertCircle className="size-3.5 text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร
                  </p>
                </div>

                {/* Current */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-slate-500">รหัสผ่านปัจจุบัน</label>
                  <div className="relative">
                    <input
                      type={showPw.current ? "text" : "password"}
                      value={pwForm.currentPassword}
                      onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))}
                      placeholder="รหัสผ่านปัจจุบัน"
                      required
                      className="w-full px-3 py-2 pr-9 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all"
                    />
                    <button type="button" onClick={() => setShowPw((p) => ({ ...p, current: !p.current }))}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                      {showPw.current ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                    </button>
                  </div>
                </div>

                {/* New */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-slate-500">รหัสผ่านใหม่</label>
                  <div className="relative">
                    <input
                      type={showPw.next ? "text" : "password"}
                      value={pwForm.newPassword}
                      onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
                      placeholder="อย่างน้อย 6 ตัวอักษร"
                      required minLength={6}
                      className="w-full px-3 py-2 pr-9 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all"
                    />
                    <button type="button" onClick={() => setShowPw((p) => ({ ...p, next: !p.next }))}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                      {showPw.next ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                    </button>
                  </div>
                  {pwForm.newPassword.length > 0 && (
                    <div className="flex gap-1 mt-0.5">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                          pwForm.newPassword.length >= i * 3
                            ? i <= 1 ? "bg-red-400" : i <= 2 ? "bg-amber-400" : i <= 3 ? "bg-yellow-400" : "bg-emerald-500"
                            : "bg-slate-200"
                        }`} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Confirm */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-slate-500">ยืนยันรหัสผ่านใหม่</label>
                  <div className="relative">
                    <input
                      type={showPw.confirm ? "text" : "password"}
                      value={pwForm.confirmPassword}
                      onChange={(e) => setPwForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                      placeholder="ยืนยันรหัสผ่านใหม่"
                      required
                      className={`w-full px-3 py-2 pr-9 rounded-xl border text-sm text-slate-800 focus:outline-none focus:ring-2 transition-all ${
                        pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword
                          ? "border-red-300 focus:ring-red-200 focus:border-red-400"
                          : "border-slate-200 focus:ring-primary/25 focus:border-primary"
                      }`}
                    />
                    <button type="button" onClick={() => setShowPw((p) => ({ ...p, confirm: !p.confirm }))}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                      {showPw.confirm ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                    </button>
                  </div>
                  {pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword && (
                    <p className="text-[10px] text-red-500 flex items-center gap-1">
                      <AlertCircle className="size-3" /> รหัสผ่านไม่ตรงกัน
                    </p>
                  )}
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={isSavingPw}
                    className="flex items-center gap-2 px-5 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSavingPw
                      ? <span className="inline-block size-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <Lock className="size-3.5" />}
                    {isSavingPw ? "กำลังบันทึก..." : "เปลี่ยนรหัสผ่าน"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[1200] flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold transition-all ${
          toast.type === "success" ? "bg-emerald-500 text-white"
          : toast.type === "warning" ? "bg-amber-500 text-white"
          : "bg-red-500 text-white"
        }`}>
          {toast.type === "success"
            ? <CheckCircle2 className="size-4 shrink-0" />
            : <AlertCircle className="size-4 shrink-0" />}
          {toast.message}
        </div>
      )}
    </>
  )
}

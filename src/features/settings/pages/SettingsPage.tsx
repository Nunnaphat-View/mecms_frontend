import { useState, useMemo, useRef } from "react";
import {
  Settings,
  User as UserIcon,
  Lock,
  Camera,
  Save,
  Eye,
  EyeOff,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  PenLine,
} from "lucide-react";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { userService } from "@/features/users/services/userService";
import { authService } from "@/features/auth/services/authService";

// ── Types ─────────────────────────────────────────────────────────────────────
type ToastType = "success" | "error" | "warning";
interface Toast { type: ToastType; message: string }
type Tab = "profile" | "password";



export default function SettingsPage() {
  const { user } = useAuthStore();
  const token = authService.getToken();

  // ── Tab ───────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  // ── Toast ─────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState<Toast | null>(null);
  function showToast(type: ToastType, message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  }

  // ── Profile form ──────────────────────────────────────────────────────────
  const queryParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const urlLineUserId = queryParams.get("lineUserId");

  const [profileForm, setProfileForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    tel: user?.tel ?? "",
    lineUserId: urlLineUserId || user?.lineUserId || "",
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // ── Avatar ────────────────────────────────────────────────────────────────
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const currentAvatar = useMemo(
    () => avatarPreview ?? (userService.getFileUrl(user?.imageUrl) || "/image/profile.png"),
    [avatarPreview, user?.imageUrl]
  );

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  // ── Signature ─────────────────────────────────────────────────────────────
  const sigInputRef = useRef<HTMLInputElement>(null);
  const [sigFile, setSigFile] = useState<File | null>(null);
  const [sigPreview, setSigPreview] = useState<string | null>(null);

  const currentSig = useMemo(
    () => sigPreview ?? userService.getFileUrl(user?.signatureUrl),
    [sigPreview, user?.signatureUrl]
  );

  function handleSigChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSigFile(file);
    setSigPreview(URL.createObjectURL(file));
  }

  // ── Save profile ──────────────────────────────────────────────────────────
  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setIsSavingProfile(true);
    try {
      const fd = new FormData();
      fd.append("name", profileForm.name.trim());
      fd.append("email", profileForm.email.trim());
      fd.append("tel", profileForm.tel.trim());
      fd.append("lineUserId", profileForm.lineUserId.trim());
      if (avatarFile) fd.append("image", avatarFile);
      if (sigFile) fd.append("signature", sigFile);

      const updated = await userService.update(user.id, fd);
      // Update both localStorage and Zustand store
      authService.setSession(token!, updated);
      useAuthStore.setState({ user: updated });
      showToast("success", "บันทึกข้อมูลส่วนตัวสำเร็จ");
      setAvatarFile(null);
      setSigFile(null);
    } catch (err) {
      console.error(err);
      showToast("error", "บันทึกข้อมูลล้มเหลว กรุณาลองใหม่");
    } finally {
      setIsSavingProfile(false);
    }
  }

  // ── Password form ─────────────────────────────────────────────────────────
  const [pwForm, setPwForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showPw, setShowPw] = useState({ next: false, confirm: false });
  const [isSavingPw, setIsSavingPw] = useState(false);

  async function handleSavePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      showToast("error", "รหัสผ่านใหม่ไม่ตรงกัน");
      return;
    }
    if (pwForm.newPassword.length < 6) {
      showToast("warning", "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }
    if (!user) return;
    setIsSavingPw(true);
    try {
      const fd = new FormData();
      // Backend accepts only "password" — no currentPassword verification at API level
      fd.append("password", pwForm.newPassword);
      await userService.update(user.id, fd);
      showToast("success", "เปลี่ยนรหัสผ่านสำเร็จ");
      setPwForm({ newPassword: "", confirmPassword: "" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "เปลี่ยนรหัสผ่านล้มเหลว";
      showToast("error", msg);
    } finally {
      setIsSavingPw(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 font-sans max-w-3xl mx-auto">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold transition-all ${
            toast.type === "success"
              ? "bg-emerald-500 text-white"
              : toast.type === "warning"
                ? "bg-amber-500 text-white"
                : "bg-red-500 text-white"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="size-4 shrink-0" />
          ) : (
            <AlertCircle className="size-4 shrink-0" />
          )}
          {toast.message}
        </div>
      )}

      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Settings className="size-5.5 text-primary" />
          ตั้งค่าบัญชี
        </h1>
        <p className="text-slate-500 text-xs mt-1">จัดการข้อมูลส่วนตัวและความปลอดภัยของบัญชีคุณ</p>
      </div>

      {/* User summary card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-xs">
        <div className="relative shrink-0">
          <img
            src={currentAvatar}
            alt="avatar"
            className="size-16 rounded-full object-cover border-2 border-primary/30"
            onError={(e) => { (e.target as HTMLImageElement).src = "/image/profile.png" }}
          />
        </div>
        <div className="min-w-0">
          <div className="font-bold text-slate-800 text-base truncate">{user?.name || "—"}</div>
          <div className="text-xs text-slate-500 mt-0.5">{user?.role?.description || user?.role?.name || "—"}</div>
          <div className="text-xs text-slate-400 mt-0.5">{user?.email || "—"}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="flex border-b border-slate-100">
          {([ 
            { id: "profile" as Tab, label: "ข้อมูลส่วนตัว", icon: UserIcon },
            { id: "password" as Tab, label: "เปลี่ยนรหัสผ่าน", icon: Lock },
          ]).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-6 py-3.5 text-sm font-semibold transition-colors cursor-pointer border-b-2 -mb-px ${
                activeTab === id
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>

        {/* ── Profile Tab ─────────────────────────────────────────────────── */}
        {activeTab === "profile" && (
          <form onSubmit={(e) => void handleSaveProfile(e)} className="p-6 flex flex-col gap-6">

            {/* Avatar + Signature row */}
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Avatar */}
              <div className="flex flex-col items-center gap-2">
                <div className="text-xs font-semibold text-slate-600 mb-1">รูปโปรไฟล์</div>
                <div className="relative group">
                  <img
                    src={currentAvatar}
                    alt="avatar"
                    className="size-24 rounded-full object-cover border-2 border-slate-200 group-hover:border-primary/50 transition-colors"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/image/profile.png" }}
                  />
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute bottom-0 right-0 size-7 bg-primary text-white rounded-full flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors cursor-pointer"
                  >
                    <Camera className="size-3.5" />
                  </button>
                  <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </div>
                <span className="text-[10px] text-slate-400">JPG, PNG ไม่เกิน 2MB</span>
              </div>

              {/* Signature */}
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="text-xs font-semibold text-slate-600 mb-1">ลายเซ็น</div>
                <div
                  onClick={() => sigInputRef.current?.click()}
                  className="w-full h-24 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors bg-slate-50 overflow-hidden"
                >
                  {currentSig ? (
                    <img src={currentSig} alt="signature" className="max-h-20 max-w-full object-contain" />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-slate-400">
                      <PenLine className="size-6" />
                      <span className="text-xs">คลิกเพื่ออัปโหลดลายเซ็น</span>
                    </div>
                  )}
                </div>
                <input ref={sigInputRef} type="file" accept="image/*" className="hidden" onChange={handleSigChange} />
                <span className="text-[10px] text-slate-400">PNG พื้นหลังโปร่งใสแนะนำ</span>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-100" />

            {/* Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* ชื่อ-นามสกุล */}
              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <UserIcon className="size-3.5 text-slate-400" /> ชื่อ-นามสกุล
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="ชื่อ-นามสกุล"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              {/* อีเมล */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <Mail className="size-3.5 text-slate-400" /> อีเมล
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="example@email.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              {/* เบอร์โทร */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <Phone className="size-3.5 text-slate-400" /> เบอร์โทรศัพท์
                </label>
                <input
                  type="tel"
                  value={profileForm.tel}
                  onChange={(e) => setProfileForm((p) => ({ ...p, tel: e.target.value }))}
                  placeholder="0xx-xxx-xxxx"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              {/* Username (read-only) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">ชื่อผู้ใช้งาน</label>
                <input
                  type="text"
                  value={user?.username ?? ""}
                  readOnly
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-sm text-slate-400 cursor-not-allowed"
                />
              </div>

              {/* Role (read-only) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">บทบาท</label>
                <input
                  type="text"
                  value={user?.role?.description || user?.role?.name || ""}
                  readOnly
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-sm text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>

            {/* LINE User ID */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <span className="size-2 bg-emerald-500 rounded-full animate-pulse mr-1" />
                LINE User ID (สำหรับการรับแจ้งเตือน)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={profileForm.lineUserId}
                  onChange={(e) => setProfileForm((p) => ({ ...p, lineUserId: e.target.value }))}
                  placeholder="ยังไม่ได้ผูกบัญชี LINE (พิมพ์ข้อความหา LINE Bot เพื่อสแกน/ผูก)"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary ${
                    urlLineUserId
                      ? "border-emerald-300 bg-emerald-50/20 text-emerald-800 ring-2 ring-emerald-100"
                      : "border-slate-200 text-slate-800"
                  }`}
                />
                {urlLineUserId && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    ตรวจพบรหัสใหม่จาก LINE
                  </span>
                )}
              </div>
              {urlLineUserId && (
                <p className="text-[10px] text-emerald-600 mt-0.5 font-medium">
                  * กรุณากดปุ่ม "บันทึกข้อมูล" ด้านล่างเพื่อยืนยันการเชื่อมโยงบัญชี
                </p>
              )}
            </div>

            {/* Save button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSavingProfile ? (
                  <span className="inline-block size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                {isSavingProfile ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
              </button>
            </div>
          </form>
        )}

        {/* ── Password Tab ─────────────────────────────────────────────────── */}
        {activeTab === "password" && (
          <form onSubmit={(e) => void handleSavePassword(e)} className="p-6 flex flex-col gap-5">
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertCircle className="size-4 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700 leading-relaxed">
                รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร หลังเปลี่ยนรหัสผ่านสำเร็จ กรุณาจำรหัสผ่านใหม่ไว้
              </p>
            </div>

            {/* New password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600">รหัสผ่านใหม่</label>
              <div className="relative">
                <input
                  type={showPw.next ? "text" : "password"}
                  value={pwForm.newPassword}
                  onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
                  placeholder="รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)"
                  required
                  minLength={6}
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((p) => ({ ...p, next: !p.next }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPw.next ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {/* Strength indicator */}
              {pwForm.newPassword.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        pwForm.newPassword.length >= i * 3
                          ? i <= 1 ? "bg-red-400" : i <= 2 ? "bg-amber-400" : i <= 3 ? "bg-yellow-400" : "bg-emerald-500"
                          : "bg-slate-200"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600">ยืนยันรหัสผ่านใหม่</label>
              <div className="relative">
                <input
                  type={showPw.confirm ? "text" : "password"}
                  value={pwForm.confirmPassword}
                  onChange={(e) => setPwForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                  placeholder="ยืนยันรหัสผ่านใหม่"
                  required
                  className={`w-full px-3.5 py-2.5 pr-10 rounded-xl border text-sm text-slate-800 focus:outline-none focus:ring-2 transition-all ${
                    pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword
                      ? "border-red-300 focus:ring-red-200 focus:border-red-400"
                      : "border-slate-200 focus:ring-primary/30 focus:border-primary"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((p) => ({ ...p, confirm: !p.confirm }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPw.confirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="size-3" /> รหัสผ่านไม่ตรงกัน
                </p>
              )}
            </div>

            {/* Save button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSavingPw}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSavingPw ? (
                  <span className="inline-block size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Lock className="size-4" />
                )}
                {isSavingPw ? "กำลังบันทึก..." : "เปลี่ยนรหัสผ่าน"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

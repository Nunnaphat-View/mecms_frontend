import React, { useState, useEffect, useRef } from "react"
import { X, Edit, Upload, RefreshCw, Eye, EyeOff, Save, Key, User as UserIcon, Mail, Phone, Shield, MessageCircle } from "lucide-react"
import type { User } from "../../types/auth"
import { useUserStore } from "../../stores/userStore"

interface UserFormDialogProps {
  isOpen: boolean
  user: User | null
  onClose: () => void
  onSaved: () => void
}

const ROLE_OPTIONS = [
  { label: "ผู้ดูแลระบบ", value: 1 },
  { label: "เจ้าหน้าที่สอบเทียบ", value: 2 },
  { label: "หัวหน้าแผนก", value: 3 },
  { label: "ผู้อำนวยการ", value: 4 },
]

const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"

export default function UserFormDialog({ isOpen, user, onClose, onSaved }: UserFormDialogProps) {
  const isEditing = !!user
  const { addUser, updateUser } = useUserStore()

  const [username, setUsername] = useState(() => (user ? user.username || "" : ""))
  const [name, setName] = useState(() => (user ? user.name || "" : ""))
  const [email, setEmail] = useState(() => (user ? user.email || "" : ""))
  const [tel, setTel] = useState(() => (user ? user.tel || "" : ""))
  const [roleId, setRoleId] = useState<number | "">(() => (user ? user.roleId || "" : ""))
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [lineUserId, setLineUserId] = useState(() => (user ? user.lineUserId || "" : ""))
  const [isSaving, setIsSaving] = useState(false)

  // Signature States
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)
  const [isResettingSignature, setIsResettingSignature] = useState(false)

  const sigCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)

  const hasExistingSignature = !!user?.signatureUrl

  // Canvas drawing setup
  useEffect(() => {
    const canvas = sigCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (ctx) {
      // Set canvas dimensions based on client rect
      canvas.width = canvas.offsetWidth || 500
      canvas.height = canvas.offsetHeight || 180
      ctx.strokeStyle = "#000000"
      ctx.lineWidth = 2
      ctx.lineCap = "round"
      ctxRef.current = ctx
    }
  }, [isOpen, isResettingSignature, user])

  if (!isOpen) return null

  const getImageUrl = (path: string | null | undefined) => {
    if (!path) return ""
    if (path.startsWith("http")) return path
    return `${apiBase}${path}`
  }

  // Draw handlers
  const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = sigCanvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()

    let clientX = 0
    let clientY = 0

    if ("touches" in e) {
      if (e.touches.length > 0) {
        clientX = e.touches[0].clientX
        clientY = e.touches[0].clientY
      }
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    setHasDrawn(true)
    const { x, y } = getPos(e)
    const ctx = ctxRef.current
    if (ctx) {
      ctx.beginPath()
      ctx.moveTo(x, y)
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const { x, y } = getPos(e)
    const ctx = ctxRef.current
    if (ctx) {
      ctx.lineTo(x, y)
      ctx.stroke()
    }
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    if (ctxRef.current) {
      ctxRef.current.closePath()
    }
  }

  const clearSignature = () => {
    const canvas = sigCanvasRef.current
    const ctx = ctxRef.current
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      setHasDrawn(false)
    }
  }

  const getSignatureBlob = (): Promise<Blob | null> => {
    const canvas = sigCanvasRef.current
    if (!canvas || !hasDrawn) return Promise.resolve(null)
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/png")
    })
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()

    if (!username || !name || !email || !tel || !roleId) {
      alert("กรุณากรอกข้อมูลที่จำเป็น (*) ให้ครบถ้วน")
      return
    }

    if (!isEditing && !password) {
      alert("กรุณาระบุรหัสผ่านสำหรับการเพิ่มผู้ใช้งาน")
      return
    }

    if (!hasExistingSignature && !hasDrawn) {
      alert("กรุณาเซ็นชื่อก่อนบันทึก")
      return
    }

    setIsSaving(true)

    const fd = new FormData()
    fd.append("username", username)
    fd.append("name", name)
    fd.append("email", email)
    fd.append("tel", tel)
    fd.append("roleId", String(roleId))
    if (password) fd.append("password", password)
    if (imageFile) fd.append("image", imageFile)
    if (lineUserId) fd.append("lineUserId", lineUserId)

    try {
      if (hasDrawn) {
        const sigBlob = await getSignatureBlob()
        if (sigBlob) {
          fd.append("signature", sigBlob, "signature.png")
        }
      }

      if (isEditing && user) {
        await updateUser(user.id, fd)
      } else {
        await addUser(fd)
      }
      onSaved()
      onClose()
    } catch (err) {
      console.error(err)
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-sans overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl overflow-hidden shadow-xl flex flex-col max-h-[95vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-cyan-900 text-white flex justify-between items-center px-6 py-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
              <Edit className="size-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-base leading-snug">
                {isEditing ? "แก้ไขข้อมูลผู้ใช้งาน" : "เพิ่มข้อมูลผู้ใช้งาน"}
              </div>
              <div className="text-xs opacity-80 mt-0.5">กรอกข้อมูลผู้ใช้และเซ็นชื่อรับรองข้อมูล</div>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-white/80 hover:text-white transition-opacity cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* รหัสพนักงาน */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <UserIcon className="size-3.5 text-slate-400" /> รหัสพนักงาน *
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ระบุรหัสพนักงาน"
                required
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-cyan-800 focus:bg-white transition-all"
              />
            </div>

            {/* ชื่อ-นามสกุล */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <UserIcon className="size-3.5 text-slate-400" /> ชื่อ-นามสกุล *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ระบุชื่อ-นามสกุล"
                required
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-cyan-800 focus:bg-white transition-all"
              />
            </div>

            {/* อีเมล */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <Mail className="size-3.5 text-slate-400" /> อีเมล *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ระบุอีเมล"
                required
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-cyan-800 focus:bg-white transition-all"
              />
            </div>

            {/* รหัสผ่าน */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <Key className="size-3.5 text-slate-400" /> รหัสผ่าน {!isEditing && "*"}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isEditing ? "ระบุเพื่อเปลี่ยนรหัสผ่าน" : "ระบุรหัสผ่าน"}
                  required={!isEditing}
                  className="w-full h-10 pl-3 pr-10 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-cyan-800 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* เบอร์โทรศัพท์ */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <Phone className="size-3.5 text-slate-400" /> เบอร์โทรศัพท์ *
              </label>
              <input
                type="text"
                value={tel}
                onChange={(e) => setTel(e.target.value.replace(/[^\d]/g, ""))}
                maxLength={10}
                placeholder="ระบุเบอร์โทรศัพท์"
                required
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-cyan-800 focus:bg-white transition-all"
              />
            </div>

            {/* ตำแหน่ง */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <Shield className="size-3.5 text-slate-400" /> ตำแหน่ง *
              </label>
              <select
                value={roleId}
                onChange={(e) => setRoleId(Number(e.target.value))}
                required
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-cyan-800 focus:bg-white transition-all outline-none"
              >
                <option value="">เลือกตำแหน่ง</option>
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* อัปโหลดรูปภาพ */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <Upload className="size-3.5 text-slate-400" /> รูปภาพ
              </label>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setImageFile(e.target.files[0])
                    }
                  }}
                  className="hidden"
                  id="user-avatar-upload"
                />
                <label
                  htmlFor="user-avatar-upload"
                  className="flex-1 flex items-center justify-between px-3 h-10 bg-slate-50 border border-slate-200 rounded-lg text-sm cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <span className="text-slate-500 truncate">
                    {imageFile ? imageFile.name : user?.imageUrl ? "มีรูปโปรไฟล์เดิมแล้ว" : "อัปโหลดรูปโปรไฟล์"}
                  </span>
                  <Upload className="size-4.5 text-slate-400" />
                </label>
                {imageFile && (
                  <button
                    type="button"
                    onClick={() => setImageFile(null)}
                    className="h-10 px-3 border border-slate-200 rounded-lg text-rose-500 hover:bg-rose-50 text-xs font-medium cursor-pointer"
                  >
                    ล้าง
                  </button>
                )}
              </div>
            </div>

            {/* LINE User ID */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <MessageCircle className="size-3.5 text-slate-400" /> LINE User ID
              </label>
              <input
                type="text"
                value={lineUserId}
                onChange={(e) => setLineUserId(e.target.value)}
                placeholder="รหัส User ID (U...)"
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-cyan-800 focus:bg-white transition-all"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">พิมพ์ 'ID' หาบอทเพื่อดูรหัสของคุณ</span>
            </div>

          </div>

          <hr className="border-slate-100" />

          {/* ลายเซ็นดิจิทัล (Full Width) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
              ลายเซ็นดิจิทัล *
            </label>
            <div className="border border-slate-200 rounded-xl bg-slate-50 h-[180px] relative overflow-hidden flex items-center justify-center">
              {hasExistingSignature && !isResettingSignature ? (
                <div className="w-full h-full bg-white flex items-center justify-center relative p-4">
                  <img
                    src={getImageUrl(user?.signatureUrl)}
                    alt="Signature"
                    className="max-w-full max-h-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsResettingSignature(true)
                      setHasDrawn(false)
                    }}
                    className="absolute top-2.5 right-2.5 p-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors cursor-pointer"
                    title="เซ็นใหม่"
                  >
                    <RefreshCw className="size-4" />
                  </button>
                </div>
              ) : (
                <div className="w-full h-full relative">
                  <canvas
                    ref={sigCanvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-full cursor-crosshair bg-white"
                  />
                  <div className="absolute bottom-2.5 right-2.5 flex gap-1.5">
                    {hasExistingSignature && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsResettingSignature(false)
                          setHasDrawn(false)
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-medium cursor-pointer"
                      >
                        ใช้ลายเซ็นเดิม
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={clearSignature}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-rose-50 text-rose-500 hover:text-rose-700 rounded-lg text-xs font-medium cursor-pointer"
                    >
                      ล้างลายเซ็น
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-4 bg-slate-50 border-t border-slate-100 flex-shrink-0">
          <span className="text-xs text-slate-500 font-medium">* จำเป็นต้องกรอก</span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              type="button"
              disabled={isSaving}
              className="px-5 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors text-xs font-medium disabled:opacity-50 cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-cyan-800 hover:bg-cyan-900 text-white rounded-lg transition-colors text-xs font-bold disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <Save className="size-3.5" />
              )}
              บันทึก
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

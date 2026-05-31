import React, { useState, useCallback } from "react"
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react"
import { ToastContext, type Toast, type ToastType } from "./ToastContextObject"

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  const success = useCallback((message: string) => showToast("success", message), [showToast])
  const error = useCallback((message: string) => showToast("error", message), [showToast])
  const warn = useCallback((message: string) => showToast("warning", message), [showToast])

  return (
    <ToastContext.Provider value={{ showToast, success, error, warn }}>
      {children}
      {/* Toast container */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2.5 pointer-events-none max-w-sm w-full sm:w-[380px] items-center">
        {toasts.map((toast) => {
          // Dynamic styles based on toast type
          const isSuccess = toast.type === "success"
          const isWarning = toast.type === "warning"
          
          let cardClass: string
          let iconWrapperClass: string
          let iconClass: string
          let titleClass: string
          let descClass: string
          let titleText: string

          if (isSuccess) {
            cardClass = "bg-emerald-50/90 border-emerald-200/80 shadow-emerald-500/5"
            iconWrapperClass = "bg-emerald-500/10"
            iconClass = "text-emerald-600"
            titleClass = "text-emerald-900"
            descClass = "text-emerald-700"
            titleText = "ดำเนินการสำเร็จ"
          } else if (isWarning) {
            cardClass = "bg-amber-50/90 border-amber-200/80 shadow-amber-500/5"
            iconWrapperClass = "bg-amber-500/10"
            iconClass = "text-amber-600"
            titleClass = "text-amber-900"
            descClass = "text-amber-700"
            titleText = "คำเตือน"
          } else {
            // Error
            cardClass = "bg-rose-50/90 border-rose-200/80 shadow-rose-500/5"
            iconWrapperClass = "bg-rose-500/10"
            iconClass = "text-rose-600"
            titleClass = "text-rose-900"
            descClass = "text-rose-700"
            titleText = "เกิดข้อผิดพลาด"
          }

          return (
            <div
              key={toast.id}
              className={`flex items-start gap-3.5 px-4.5 py-3.5 rounded-xl border text-xs font-medium pointer-events-auto backdrop-blur-md transition-all duration-300 shadow-lg animate-in fade-in slide-in-from-top-5 duration-300 w-full ${cardClass}`}
            >
              {/* Status Indicator Icon with a subtle circular bg */}
              <div className={`p-1.5 rounded-lg shrink-0 ${iconWrapperClass}`}>
                {toast.type === "success" && <CheckCircle2 className={`size-4.5 ${iconClass}`} />}
                {toast.type === "warning" && <AlertTriangle className={`size-4.5 ${iconClass}`} />}
                {toast.type === "error" && <XCircle className={`size-4.5 ${iconClass}`} />}
              </div>

              {/* Content Stack */}
              <div className="flex-grow space-y-0.5 text-left">
                <div className={`text-[12px] font-bold tracking-wide ${titleClass}`}>
                  {titleText}
                </div>
                <p className={`leading-relaxed font-normal text-[11px] ${descClass}`}>
                  {toast.message}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

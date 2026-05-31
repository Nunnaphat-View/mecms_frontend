import { createContext } from "react"

export type ToastType = "success" | "error" | "warning"

export interface Toast {
  id: string
  type: ToastType
  message: string
}

export interface ToastContextType {
  showToast: (type: ToastType, message: string) => void
  success: (message: string) => void
  error: (message: string) => void
  warn: (message: string) => void
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined)

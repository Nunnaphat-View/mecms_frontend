import { useEffect } from "react"
import { RouterProvider } from "react-router-dom"
import { router } from "@/router"
import { useAuthStore } from "@/stores/authStore"
import { ToastProvider } from "@/context/ToastContext"

function App() {
  const initialize = useAuthStore((state) => state.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  )
}

export default App

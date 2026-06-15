import { useEffect } from "react"
import { RouterProvider } from "react-router-dom"
import { router } from "@/router"
import { useAuthStore } from "@/features/auth/stores/authStore"
import { ToastProvider } from "@/context/ToastContext"

function App() {
  const initialize = useAuthStore((state) => state.initialize)

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.has("lineUserId")) {
      useAuthStore.getState().logout();
    }
    initialize();
  }, [initialize]);

  return (
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  )
}

export default App

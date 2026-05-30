import { createBrowserRouter, Navigate } from "react-router-dom"
import MainLayout from "@/layouts/MainLayout"
import FullScreenLayout from "@/layouts/FullScreenLayout"

import LoginPage from "@/pages/LoginPage"
import HomePage from "@/pages/HomePage"
import ToolsPage from "@/pages/ToolsPage"
import StandardToolsPage from "@/pages/StandardToolsPage"
import CalibrationPage from "@/pages/CalibrationPage"
import HistoryPage from "@/pages/HistoryPage"
import UsersPage from "@/pages/UsersPage"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <FullScreenLayout />,
    children: [
      { path: "", element: <LoginPage /> },
    ],
  },
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { path: "dashboard", element: <HomePage /> },
      { path: "tools", element: <ToolsPage /> },
      { path: "tools/standard", element: <StandardToolsPage /> },
      { path: "calibration", element: <CalibrationPage /> },
      { path: "history", element: <HistoryPage /> },
      { path: "users", element: <UsersPage /> },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
])


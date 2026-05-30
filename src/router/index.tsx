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
import ExternalInspectionPage from "@/pages/ExternalInspectionPage"
import PmChecklistPage from "@/pages/PmChecklistPage"

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
      { path: "tools/pm-checklist", element: <PmChecklistPage /> },
      { path: "calibration", element: <CalibrationPage /> },
      { path: "calibration/inspection/:id", element: <ExternalInspectionPage /> },
      { path: "history", element: <HistoryPage /> },
      { path: "users", element: <UsersPage /> },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
])


import { createBrowserRouter, Navigate } from "react-router-dom"
import MainLayout from "@/layouts/MainLayout"
import FullScreenLayout from "@/layouts/FullScreenLayout"
import { ProtectedRoute } from "@/components/common/ProtectedRoute"

import LoginPage from "@/features/auth/pages/LoginPage"
import HomePage from "@/features/dashboard/pages/HomePage"
import ToolsPage from "@/features/tools/pages/ToolsPage"
import StandardToolsPage from "@/features/tools/pages/StandardToolsPage"
import CalibrationPage from "@/features/calibration/pages/CalibrationPage"
import HistoryPage from "@/features/history/pages/HistoryPage"
import UsersPage from "@/features/users/pages/UsersPage"
import ExternalInspectionPage from "@/features/inspection/pages/ExternalInspectionPage"
import PmChecklistPage from "@/features/pm/pages/PmChecklistPage"
import HospitalsPage from "@/features/hospital/pages/HospitalsPage"
import SectionsPage from "@/features/section/pages/SectionsPage"
import ToolsManagePage from "@/features/tools/pages/ToolsManagePage"
import CalibrationRecordPage from "@/features/calibration/pages/CalibrationRecordPage"
import ToolConfigPage from "@/features/tools/pages/ToolConfigPage"
import SettingsPage from "@/features/settings/pages/SettingsPage"
import ApprovalsPage from "@/features/approval/pages/ApprovalsPage"
import ApprovalDetailPage from "@/features/approval/pages/ApprovalDetailPage"
import CerViewPage from "@/features/calibration/pages/CerViewPage"
import PublicStatusPlaceholderPage from "@/features/public-status/pages/PublicStatusPlaceholderPage"
import SchedulePage from "@/features/schedule/pages/SchedulePage"
import ManageSchedulePage from "@/features/schedule/pages/ManageSchedulePage"
import WardPage from "@/features/ward/pages/WardPage"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <FullScreenLayout />,
    children: [
      { path: "", element: <LoginPage /> },
      { path: "status/:id", element: <PublicStatusPlaceholderPage /> },
    ],
  },
  {
    path: "/",
    element: <ProtectedRoute><MainLayout /></ProtectedRoute>,
    children: [
      { path: "dashboard", element: <HomePage /> },
      { path: "director-dashboard", element: <HomePage /> },
      { path: "schedule", element: <SchedulePage /> },
      { path: "schedule/manage", element: <ManageSchedulePage /> },
      { path: "ward", element: <WardPage /> },
      { path: "tools", element: <ToolsPage /> },
      { path: "tools/standard", element: <StandardToolsPage /> },
      { path: "tools/pm-checklist", element: <PmChecklistPage /> },
      { path: "tools/manage", element: <ToolsManagePage /> },
      { path: "tools/config/:name", element: <ToolConfigPage /> },
      { path: "calibration", element: <CalibrationPage /> },
      { path: "calibration/inspection/:id", element: <ExternalInspectionPage /> },
      { path: "calibration/record/:id", element: <CalibrationRecordPage /> },
      { path: "approval", element: <ApprovalsPage /> },
      { path: "approval/:id", element: <ApprovalDetailPage /> },
      { path: "history", element: <HistoryPage /> },
      { path: "cer-view", element: <CerViewPage /> },
      { path: "users", element: <UsersPage /> },
      { path: "hospitals", element: <HospitalsPage /> },
      { path: "sections", element: <SectionsPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "profile", element: <SettingsPage /> },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
])



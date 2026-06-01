export const AppRole = {
  TECHNICIAN: "ช่างเทคนิค",
  HEAD_OF_DEPT: "หัวหน้าแผนก",
  ADMIN: "ผู้ดูแลระบบ",
  DIRECTOR: "ผู้อำนวยการ",
} as const

export type AppRole = typeof AppRole[keyof typeof AppRole]

export interface RolePermissions {
  canManageTools: boolean;
  canManageDepartments: boolean;
  canApproveCalibration: boolean;
  allowedMenus: string[];
}

export const RolePermissionsMap: Record<AppRole, RolePermissions> = {
  [AppRole.TECHNICIAN]: {
    canManageTools: false,
    canManageDepartments: false,
    canApproveCalibration: false,
    allowedMenus: ["/dashboard", "/schedule", "/ward", "/calibration", "/tools", "/history", "/settings"],
  },
  [AppRole.HEAD_OF_DEPT]: {
    canManageTools: false,
    canManageDepartments: false,
    canApproveCalibration: true,
    allowedMenus: ["/dashboard", "/schedule", "/ward", "/approval", "/tools", "/history", "/settings"],
  },
  [AppRole.ADMIN]: {
    canManageTools: true,
    canManageDepartments: true,
    canApproveCalibration: true,
    allowedMenus: [
      "/dashboard",
      "/schedule",
      "/ward",
      "/calibration",
      "/approval",
      "/tools",
      "/sections",
      "/users",
      "/hospitals",
      "/maintenance",
      "/history",
      "/audit",
      "/tools/manage",
      "/tools/standard",
      "/tools/pm-checklist",
      "/settings",
    ],
  },
  [AppRole.DIRECTOR]: {
    canManageTools: false,
    canManageDepartments: false,
    canApproveCalibration: true,
    allowedMenus: ["/director-dashboard", "/schedule", "/approval", "/history", "/settings"],
  },
}

export function mapRoleToAppRole(role: { id: number; name: string } | null | undefined): AppRole {
  if (!role) return AppRole.TECHNICIAN

  // Priority 1: Map by ID (most reliable)
  const idMap: Record<number, AppRole> = {
    1: AppRole.ADMIN,
    2: AppRole.TECHNICIAN,
    3: AppRole.HEAD_OF_DEPT,
    4: AppRole.DIRECTOR,
  }
  const appRoleById = idMap[role.id]
  if (appRoleById) return appRoleById

  // Priority 2: Map by Name (fallback)
  const normalized = (role.name || "").toLowerCase().trim()
  const nameMap: Record<string, AppRole> = {
    admin: AppRole.ADMIN,
    ผู้ดูแลระบบ: AppRole.ADMIN,
    technician: AppRole.TECHNICIAN,
    ช่างเทคนิค: AppRole.TECHNICIAN,
    เจ้าหน้าที่สอบเทียบ: AppRole.TECHNICIAN,
    head_of_dept: AppRole.HEAD_OF_DEPT,
    "head of dept": AppRole.HEAD_OF_DEPT,
    "head-of-dept": AppRole.HEAD_OF_DEPT,
    "head of department": AppRole.HEAD_OF_DEPT,
    หัวหน้าแผนก: AppRole.HEAD_OF_DEPT,
    หัวหน้างาน: AppRole.HEAD_OF_DEPT,
    director: AppRole.DIRECTOR,
    ผู้อำนวยการ: AppRole.DIRECTOR,
  }
  return nameMap[normalized] || AppRole.TECHNICIAN
}

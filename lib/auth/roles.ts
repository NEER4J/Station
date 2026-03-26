export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  EMPLOYEE: "employee",
  VIEWER: "viewer",
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

const ROLE_HIERARCHY: Record<RoleName, number> = {
  admin: 40,
  manager: 30,
  employee: 20,
  viewer: 10,
};

export function hasMinimumRole(
  userRole: RoleName | null,
  requiredRole: RoleName,
): boolean {
  if (!userRole) return false;
  return (ROLE_HIERARCHY[userRole] ?? 0) >= ROLE_HIERARCHY[requiredRole];
}

export const PERMISSIONS = {
  VIEW_FINANCIALS: "view_financials",
  MANAGE_SETTINGS: "manage_settings",
  EXPORT_DATA: "export_data",
} as const;

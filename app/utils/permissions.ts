import type { User } from "@/app/types";

export type AppRole = User["role"];

export const isElevatedRole = (
  role: AppRole | string | null | undefined
): role is "admin" | "manager" => role === "admin" || role === "manager";

export const canAccessAdminPortal = (
  role: AppRole | string | null | undefined
) => isElevatedRole(role);

export const canViewAdminDashboardModules = (
  role: AppRole | string | null | undefined
) => isElevatedRole(role);

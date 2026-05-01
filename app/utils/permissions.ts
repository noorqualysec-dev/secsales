import type { User } from "@/app/types";

export type AppRole = User["role"];

export const isAdminRole = (
  role: AppRole | string | null | undefined
): role is "admin" => role === "admin";

export const isElevatedRole = (
  role: AppRole | string | null | undefined
): role is "admin" | "manager" => role === "admin" || role === "manager";

export const canUseSalesWorkspace = (
  role: AppRole | string | null | undefined
): role is "sales_rep" | "manager" => role === "sales_rep" || role === "manager";

export const canAccessAdminPortal = (
  role: AppRole | string | null | undefined
) => isElevatedRole(role);

export const canViewAdminDashboardModules = (
  role: AppRole | string | null | undefined
) => isElevatedRole(role);

export const canManageUsers = (
  role: AppRole | string | null | undefined
) => isAdminRole(role);

export const shouldForceAdminWorkspace = (
  role: AppRole | string | null | undefined
) => isAdminRole(role);

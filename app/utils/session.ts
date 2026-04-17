import type { User } from "@/app/types";

export const PRIMARY_TOKEN_KEY = "token";
export const PRIMARY_USER_KEY = "user";
export const ADMIN_TOKEN_KEY = "admin_token";
export const ADMIN_USER_KEY = "admin_user";
export const PRIMARY_AUTH_EVENT = "auth-change";
export const ADMIN_AUTH_EVENT = "admin-auth-change";

export function readStoredUser(raw: string | null): User | null {
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function persistPrimarySession(
  token: string,
  user: User,
  dispatchEvent = true
) {
  localStorage.setItem(PRIMARY_TOKEN_KEY, token);
  localStorage.setItem(PRIMARY_USER_KEY, JSON.stringify(user));

  if (dispatchEvent) {
    window.dispatchEvent(new Event(PRIMARY_AUTH_EVENT));
  }
}

export function clearPrimarySession(dispatchEvent = true) {
  localStorage.removeItem(PRIMARY_TOKEN_KEY);
  localStorage.removeItem(PRIMARY_USER_KEY);

  if (dispatchEvent) {
    window.dispatchEvent(new Event(PRIMARY_AUTH_EVENT));
  }
}

export function persistAdminSession(
  token: string,
  user: User,
  dispatchEvent = true
) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));

  if (dispatchEvent) {
    window.dispatchEvent(new Event(ADMIN_AUTH_EVENT));
  }
}

export function clearAdminSession(dispatchEvent = true) {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_USER_KEY);

  if (dispatchEvent) {
    window.dispatchEvent(new Event(ADMIN_AUTH_EVENT));
  }
}

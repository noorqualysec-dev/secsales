"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { User } from "@/app/types";
import { canAccessAdminPortal } from "@/app/utils/permissions";
import {
  ADMIN_AUTH_EVENT,
  ADMIN_TOKEN_KEY,
  ADMIN_USER_KEY,
  PRIMARY_AUTH_EVENT,
  PRIMARY_TOKEN_KEY,
  PRIMARY_USER_KEY,
  clearAdminSession,
  clearPrimarySession,
  persistAdminSession,
  readStoredUser,
} from "@/app/utils/session";

// This hook uses separate storage keys to prevent session bleeding between Admin and Sales portals
export function useAdminAuth(automaticRedirect: boolean = true) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const applySession = (nextToken: string, nextUser: User) => {
    setToken(nextToken);
    setUser(nextUser);
    setLoading(false);
  };

  const checkAuth = () => {
    const storedAdminToken = localStorage.getItem(ADMIN_TOKEN_KEY);
    const storedAdminUser = readStoredUser(localStorage.getItem(ADMIN_USER_KEY));

    if (storedAdminToken && storedAdminUser && canAccessAdminPortal(storedAdminUser.role)) {
      applySession(storedAdminToken, storedAdminUser);
      return;
    }

    if (storedAdminToken || localStorage.getItem(ADMIN_USER_KEY)) {
      clearAdminSession(false);
    }

    const storedPrimaryToken = localStorage.getItem(PRIMARY_TOKEN_KEY);
    const storedPrimaryUser = readStoredUser(localStorage.getItem(PRIMARY_USER_KEY));

    if (storedPrimaryToken && storedPrimaryUser && canAccessAdminPortal(storedPrimaryUser.role)) {
      persistAdminSession(storedPrimaryToken, storedPrimaryUser, false);
      applySession(storedPrimaryToken, storedPrimaryUser);
      return;
    }

    if (automaticRedirect && pathname !== "/admin") {
      router.replace("/admin");
    }

    setUser(null);
    setToken(null);
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();

    const handleStorage = () => checkAuth();
    window.addEventListener("storage", handleStorage);
    window.addEventListener(ADMIN_AUTH_EVENT, handleStorage);
    window.addEventListener(PRIMARY_AUTH_EVENT, handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(ADMIN_AUTH_EVENT, handleStorage);
      window.removeEventListener(PRIMARY_AUTH_EVENT, handleStorage);
    };
  }, [router, automaticRedirect, pathname]);

  const logout = () => {
    clearAdminSession(false);
    clearPrimarySession(false);
    window.dispatchEvent(new Event(ADMIN_AUTH_EVENT));
    window.dispatchEvent(new Event(PRIMARY_AUTH_EVENT));
    router.replace("/admin");
  };

  return { user, token, loading, logout, checkAuth };
}

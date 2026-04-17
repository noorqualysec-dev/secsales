"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/app/types";
import {
  ADMIN_AUTH_EVENT,
  PRIMARY_AUTH_EVENT,
  PRIMARY_TOKEN_KEY,
  PRIMARY_USER_KEY,
  clearAdminSession,
  clearPrimarySession,
  readStoredUser,
} from "@/app/utils/session";

export function useAuth(automaticRedirect: boolean = true) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = () => {
    const storedToken = localStorage.getItem(PRIMARY_TOKEN_KEY);
    const storedUser = localStorage.getItem(PRIMARY_USER_KEY);

    if (!storedToken) {
      if (automaticRedirect) {
        router.replace("/login");
      }
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    setToken(storedToken);
    setUser(readStoredUser(storedUser));
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();

    // Listen for storage changes from other tabs/components
    const handleStorage = () => checkAuth();
    window.addEventListener("storage", handleStorage);
    
    // Also listen for a custom event we can trigger manually
    window.addEventListener(PRIMARY_AUTH_EVENT, handleStorage);
    window.addEventListener(ADMIN_AUTH_EVENT, handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(PRIMARY_AUTH_EVENT, handleStorage);
      window.removeEventListener(ADMIN_AUTH_EVENT, handleStorage);
    };
  }, [router, automaticRedirect]);

  const logout = () => {
    clearPrimarySession(false);
    clearAdminSession(false);
    window.dispatchEvent(new Event(PRIMARY_AUTH_EVENT));
    window.dispatchEvent(new Event(ADMIN_AUTH_EVENT));
    router.replace("/login");
  };

  return { user, token, loading, logout, checkAuth };
}

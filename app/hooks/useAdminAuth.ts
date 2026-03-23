"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { User } from "@/app/types";

// This hook uses separate storage keys to prevent session bleeding between Admin and Sales portals
export function useAdminAuth(automaticRedirect: boolean = true) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = () => {
    // Admin specific keys
    const storedToken = localStorage.getItem("admin_token");
    const storedUser = localStorage.getItem("admin_user");

    if (!storedToken) {
      if (automaticRedirect && pathname !== "/admin") {
        router.replace("/admin");
      }
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    setToken(storedToken);
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        // Ensure it's actually an admin session
        if (parsed.role !== "admin") {
           throw new Error("Not an admin session");
        }
        setUser(parsed);
      } catch {
        setUser(null);
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();

    const handleStorage = () => checkAuth();
    window.addEventListener("storage", handleStorage);
    window.addEventListener("admin-auth-change", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("admin-auth-change", handleStorage);
    };
  }, [router, automaticRedirect, pathname]);

  const logout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    window.dispatchEvent(new Event("admin-auth-change"));
    router.replace("/admin");
  };

  return { user, token, loading, logout, checkAuth };
}

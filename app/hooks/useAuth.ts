"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/app/types";

export function useAuth(automaticRedirect: boolean = true) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = () => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

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
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();

    // Listen for storage changes from other tabs/components
    const handleStorage = () => checkAuth();
    window.addEventListener("storage", handleStorage);
    
    // Also listen for a custom event we can trigger manually
    window.addEventListener("auth-change", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("auth-change", handleStorage);
    };
  }, [router, automaticRedirect]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth-change"));
    router.replace("/login");
  };

  return { user, token, loading, logout, checkAuth };
}

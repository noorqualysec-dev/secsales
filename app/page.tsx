"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { canAccessAdminPortal } from "@/app/utils/permissions";
import { readStoredUser } from "@/app/utils/session";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = readStoredUser(localStorage.getItem("user"));

    if (!token) {
      router.replace("/login");
      return;
    }

    router.replace(canAccessAdminPortal(user?.role) ? "/admin/dashboard" : "/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

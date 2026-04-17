"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/app/components/layout/Sidebar";
import { Header } from "@/app/components/layout/Header";
import { useAuth } from "@/app/hooks/useAuth";
import { canAccessAdminPortal } from "@/app/utils/permissions";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/tasks": "Tasks",
  "/leads": "Leads",
  "/companies": "Companies",
  "/proposals": "Proposals",
};

const elevatedRouteMap: Array<{
  salesRoute: string;
  adminRoute: string;
  preserveNestedPath?: boolean;
}> = [
  { salesRoute: "/dashboard", adminRoute: "/admin/dashboard" },
  { salesRoute: "/tasks", adminRoute: "/admin/tasks" },
  { salesRoute: "/kanban", adminRoute: "/admin/kanban" },
  { salesRoute: "/leads", adminRoute: "/admin/leads", preserveNestedPath: true },
  { salesRoute: "/companies", adminRoute: "/admin/companies", preserveNestedPath: true },
  { salesRoute: "/proposals", adminRoute: "/admin/proposals", preserveNestedPath: true },
];

function resolveElevatedRoute(pathname: string) {
  const matchedRoute = elevatedRouteMap.find(
    ({ salesRoute }) => pathname === salesRoute || pathname.startsWith(`${salesRoute}/`)
  );

  if (!matchedRoute) {
    return "/admin/dashboard";
  }

  if (!matchedRoute.preserveNestedPath || pathname === matchedRoute.salesRoute) {
    return matchedRoute.adminRoute;
  }

  const suffix = pathname.slice(matchedRoute.salesRoute.length);
  return `${matchedRoute.adminRoute}${suffix}`;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const shouldUseAdminPortal = canAccessAdminPortal(user?.role);
  const elevatedRedirectPath = useMemo(
    () => resolveElevatedRoute(pathname),
    [pathname]
  );

  useEffect(() => {
    if (!loading && shouldUseAdminPortal) {
      router.replace(elevatedRedirectPath);
    }
  }, [elevatedRedirectPath, loading, router, shouldUseAdminPortal]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (shouldUseAdminPortal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Switching to admin workspace...</p>
        </div>
      </div>
    );
  }

  const pageTitle =
    Object.entries(pageTitles).find(([route]) => pathname === route || pathname.startsWith(`${route}/`))?.[1] ??
    "Dashboard";

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — fixed on desktop, slide-in on mobile */}
      <div
        className={`fixed inset-y-0 left-0 z-30 transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header
          user={user}
          pageTitle={pageTitle}
          onMenuClick={() => setSidebarOpen(true)}
          onLogout={logout}
        />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

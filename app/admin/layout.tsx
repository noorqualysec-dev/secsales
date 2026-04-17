"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminSidebar } from "@/app/components/admin/AdminSidebar";
import { AdminHeader } from "@/app/components/admin/AdminHeader";
import { useAdminAuth } from "@/app/hooks/useAdminAuth";
import { ShieldAlert } from "lucide-react";
import { canAccessAdminPortal } from "@/app/utils/permissions";

const adminPageTitles: Record<string, string> = {
  "/admin/dashboard": "Executive Overview",
  "/admin/analytics": "Analytics",
  "/admin/tasks": "Task Management",
  "/admin/kanban": "Lead Kanban",
  "/admin/users": "User Management",
  "/admin/leads": "System-wide Leads",
  "/admin/companies": "Company Accounts",
  "/admin/proposals": "Financial Monitoring",
  "/admin/team": "Team Performance",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAdminAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !canAccessAdminPortal(user.role))) {
      if (pathname !== "/admin") {
        router.push("/admin");
      }
    }
  }, [user, loading, pathname, router]);

  if (pathname === "/admin") {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 gap-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">Authenticating Admin...</p>
      </div>
    );
  }

  if (user && !canAccessAdminPortal(user.role)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-6 text-center">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mb-6">
          <ShieldAlert className="text-red-500 w-10 h-10" />
        </div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight mb-2">Restricted Area</h2>
        <p className="text-slate-400 text-sm max-w-sm mx-auto mb-8 font-medium">
          You are currently signed in as a <span className="text-indigo-400 font-bold">{user.role}</span>. You do not have the required clearance to access the admin and manager workspace.
        </p>
        <button
          onClick={() => {
            logout();
            router.push("/admin");
          }}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-xl transition duration-300 shadow-lg shadow-indigo-500/20 active:scale-95"
        >
          Logout & Try Again
        </button>
      </div>
    );
  }

  const pageTitle = adminPageTitles[pathname] ?? "Admin Panel";

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-inter antialiased">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 lg:hidden transition-all duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 transform transition-all duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <AdminSidebar onClose={() => setIsSidebarOpen(false)} />
      </aside>

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        <AdminHeader
          pageTitle={pageTitle}
          onMenuClick={() => setIsSidebarOpen(true)}
          onLogout={() => {
            logout();
            router.push("/admin");
          }}
        />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar relative">
          <div className="max-w-7xl mx-auto animate-fade-in-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

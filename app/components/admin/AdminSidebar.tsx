"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Users2,
  Database,
  FileCheck,
  ListTodo,
  ChevronRight,
  ShieldCheck,
  UserCircle,
  BarChart3,
  Building2,
  Calendar,
} from "lucide-react";
import type { AppRole } from "@/app/utils/permissions";

interface AdminSidebarProps {
  onClose?: () => void;
  role?: AppRole | null;
}

type NavItem = {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
  requiresAdmin?: boolean;
};

const navItems: NavItem[] = [
  { name: "Overview",      href: "/admin/dashboard",  icon: LayoutDashboard },
  { name: "Analytics",     href: "/admin/analytics",  icon: BarChart3 },
  { name: "Tasks",         href: "/admin/tasks",      icon: ListTodo },
  { name: "Lead Kanban",   href: "/admin/kanban",     icon: LayoutDashboard },
  { name: "Manage Users",  href: "/admin/users",      icon: Users, requiresAdmin: true },
  { name: "All Leads",     href: "/admin/leads",      icon: Database },
  { name: "Companies",     href: "/admin/companies",  icon: Building2 },
  { name: "All Proposals", href: "/admin/proposals",  icon: FileCheck },
  { name: "Team",          href: "/admin/team",       icon: Users2 },
];

export function AdminSidebar({ onClose, role }: AdminSidebarProps) {
  const pathname = usePathname();
  const showManagerSalesTools = role === "manager";
  const visibleNavItems = navItems.filter((item) => !item.requiresAdmin || role === "admin");

  return (
    <aside className="w-68 h-full bg-slate-900 text-white flex flex-col shrink-0 border-r border-slate-800 shadow-2xl">
      <div className="p-6 border-b border-slate-800">
        <Link href="/admin/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition duration-300">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-tight tracking-tight">Admin Portal</span>
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.2em]">Qualysec CRM</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-2 mt-4 custom-scrollbar">
        {visibleNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 group ${isActive
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                  : "text-slate-400 hover:bg-slate-800/80 hover:text-white"
                }`}
            >
              <div className="flex items-center gap-3.5">
                <Icon
                  className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-white" : "text-slate-500"
                    }`}
                />
                <span className="font-semibold text-sm tracking-tight">{item.name}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4 text-white/60" />}
            </Link>
          );
        })}

        {showManagerSalesTools && (
          <>
            <p className="px-4 pt-4 pb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Sales Workspace
            </p>
            <Link
              href="/leads"
              onClick={onClose}
              className={`flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 group ${
                pathname === "/leads" || pathname.startsWith("/leads/")
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                  : "text-slate-400 hover:bg-slate-800/80 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Users className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${pathname === "/leads" || pathname.startsWith("/leads/") ? "text-white" : "text-slate-500"}`} />
                <span className="font-semibold text-sm tracking-tight">My Leads</span>
              </div>
            </Link>
            <Link
              href="/proposals"
              onClick={onClose}
              className={`flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 group ${
                pathname === "/proposals" || pathname.startsWith("/proposals/")
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                  : "text-slate-400 hover:bg-slate-800/80 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <FileCheck className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${pathname === "/proposals" || pathname.startsWith("/proposals/") ? "text-white" : "text-slate-500"}`} />
                <span className="font-semibold text-sm tracking-tight">My Proposals</span>
              </div>
            </Link>
            <Link
              href="/dashboard/integrations/google"
              onClick={onClose}
              className={`flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 group ${
                pathname === "/dashboard/integrations/google" || pathname.startsWith("/dashboard/integrations/google/")
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                  : "text-slate-400 hover:bg-slate-800/80 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Calendar className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${pathname === "/dashboard/integrations/google" || pathname.startsWith("/dashboard/integrations/google/") ? "text-white" : "text-slate-500"}`} />
                <span className="font-semibold text-sm tracking-tight">Google Calendar</span>
              </div>
            </Link>
          </>
        )}
      </nav>

      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="bg-slate-800/40 p-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center border border-slate-600">
            <UserCircle size={22} className="text-slate-400" />
          </div>
          <div className="flex flex-col truncate min-w-0">
            <span className="text-sm font-bold truncate">System Admin</span>
            <span className="text-[10px] text-slate-500 font-medium">Root Access</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

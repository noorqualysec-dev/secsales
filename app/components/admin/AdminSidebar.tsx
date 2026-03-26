"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Zap,
  LayoutDashboard,
  Users,
  Users2,
  Database,
  FileCheck,
  LogOut,
  ChevronRight,
  ShieldCheck,
  UserCircle
} from "lucide-react";

interface AdminSidebarProps {
  onClose?: () => void;
}

const navItems = [
  { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Lead Kanban", href: "/admin/kanban", icon: LayoutDashboard },
  { name: "Manage Users", href: "/admin/users", icon: Users },
  { name: "All Leads", href: "/admin/leads", icon: Database },
  { name: "All Proposals", href: "/admin/proposals", icon: FileCheck },
  { name: "Team", href: "/admin/team", icon: Users2 },
];

export function AdminSidebar({ onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-68 h-full bg-slate-900 text-white flex flex-col shrink-0 border-r border-slate-800 shadow-2xl">
      {/* Admin Logo */}
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

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2 mt-4 custom-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
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
      </nav>

      {/* Admin Profile Footer */}
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

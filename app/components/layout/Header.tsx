"use client";

import { Menu, LogOut } from "lucide-react";
import type { User } from "@/app/types";

interface HeaderProps {
  user: User | null;
  pageTitle: string;
  onMenuClick: () => void;
  onLogout: () => void;
}

export function Header({ user, pageTitle, onMenuClick, onLogout }: HeaderProps) {
  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "U";

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-semibold text-slate-800">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* User info */}
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-sm font-medium text-slate-700">{user?.name ?? "User"}</span>
          <span className="text-xs text-slate-400 capitalize">{user?.role ?? ""}</span>
        </div>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-bold">
          {initials}
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          title="Logout"
          className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}

"use client";

import { Bell, Search, LogOut, ShieldCheck, Menu, CircleDot } from "lucide-react";
import { Button } from "@/app/components/ui/button";

interface AdminHeaderProps {
  pageTitle: string;
  onMenuClick?: () => void;
  onLogout: () => void;
}

export function AdminHeader({ pageTitle, onMenuClick, onLogout }: AdminHeaderProps) {
  return (
    <header className="h-16 border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-sm sticky top-0 bg-white/70 backdrop-blur-lg z-20 transition-all duration-300">
      <div className="flex items-center gap-6">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-indigo-600 transition-all duration-300"
        >
          <Menu size={24} />
        </button>
        
        <div className="flex items-center gap-3 animate-fade-in">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
            <ShieldCheck size={18} className="text-indigo-600 shadow-sm shadow-indigo-200" />
          </div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none group flex items-center gap-2">
            {pageTitle}
            <span className="h-4 w-1px bg-slate-200 hidden sm:block mx-1" />
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100/50 shadow-sm shadow-emerald-100">
              <CircleDot size={8} className="animate-pulse" /> Live
            </span>
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Quick Search */}
        <div className="hidden md:flex items-center bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-slate-400 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-200 transition-all duration-300 w-64 group">
          <Search size={16} className="shrink-0 group-hover:text-indigo-400 transition" />
          <input
            type="text"
            placeholder="Search records..."
            className="bg-transparent border-none text-xs font-medium focus:outline-none w-full ml-2 text-slate-700 placeholder:text-slate-400"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 border-l border-slate-200 pl-4 ml-2">
          <button className="p-2.5 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-800 transition duration-300 relative group">
            <Bell size={20} className="group-hover:scale-110 transition" />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-indigo-500 border-2 border-white rounded-full transition shadow-sm shadow-indigo-400" />
          </button>
          
          <button
            onClick={onLogout}
            className="p-2.5 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-600 transition-all duration-300 flex items-center gap-2 group active:scale-95"
            title="Logout Admin"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition" />
            <span className="text-xs font-bold hidden sm:inline uppercase tracking-widest">Quit</span>
          </button>
        </div>
      </div>
    </header>
  );
}

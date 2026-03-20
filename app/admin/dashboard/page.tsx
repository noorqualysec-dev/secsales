"use client";

import { useAdminUsers, useAdminLeads, useAdminProposals } from "@/app/hooks/useAdmin";
import { 
  Users, 
  Database, 
  HandCoins, 
  TrendingUp, 
  Activity, 
  Clock, 
  ChevronRight,
  ShieldCheck,
  UserPlus,
  Target
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const { data: userData, isLoading: userLoading } = useAdminUsers();
  const { data: leadData, isLoading: leadLoading } = useAdminLeads();
  const { data: proposalData, isLoading: proposalLoading } = useAdminProposals();

  const users = userData?.data ?? [];
  const leads = leadData?.data ?? [];
  const proposals = proposalData?.data ?? [];

  const totalRevenue = proposals
    .filter((p) => p.status === "Accepted")
    .reduce((acc, curr) => acc + (curr.value || 0), 0);

  const stats = [
    { label: "Total Platform Users", value: users.length, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Global Lead Pool", value: leads.length, icon: Database, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Pipeline Proposals", value: proposals.length, icon: HandCoins, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Historical Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  const recentUsers = [...users].slice(0, 5);

  if (userLoading || leadLoading || proposalLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-2xl border border-slate-100 shadow-sm" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 bg-slate-100 rounded-2xl border border-slate-200 shadow-sm" />
          <div className="h-96 bg-slate-100 rounded-2xl border border-slate-200 shadow-sm" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in-up">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 relative group overflow-hidden">
            <div className={`absolute top-0 left-0 w-1 h-full shadow-lg ${stat.color.replace("text-", "bg-")}`} />
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bg} p-3 rounded-xl transition-all duration-300 group-hover:scale-110`}>
                <stat.icon size={22} className={stat.color} />
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">PLATFORM</div>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight group-hover:translate-x-1 transition-transform duration-300">{stat.value}</p>
            <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Platform Activity */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <Activity className="text-indigo-600" size={20} />
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight uppercase tracking-widest text-[11px]">Audit Logs</h2>
            </div>
            <Link href="/admin/users" className="text-xs font-bold text-indigo-600 hover:text-indigo-400 flex items-center gap-1 transition-all duration-300 hover:gap-2">
              All Records <ChevronRight size={14} />
            </Link>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
            <div className="divide-y divide-slate-100">
              {recentUsers.map((user) => (
                <div key={user._id} className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-all duration-300 group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100 transition-all duration-300 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white">
                      {user.role === "admin" ? <ShieldCheck size={20} /> : <UserPlus size={20} />}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{user.name}</h3>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-widest leading-none mt-1">{user.role}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-6">
                    <div className="hidden sm:block">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Signed Up</p>
                      <p className="text-xs font-semibold text-slate-700 mt-0.5">{new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                    </div>
                    <span className={`h-2 w-2 rounded-full shadow-sm ${user.isActive ? "bg-emerald-500 shadow-emerald-200" : "bg-red-500 shadow-red-200 animate-pulse"}`} title={user.isActive ? "Active Account" : "Deactivated"} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Health / Quick Actions */}
        <div className="space-y-6">
           <div className="px-2">
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight uppercase tracking-widest text-[11px]">Action Center</h2>
          </div>

          <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 transform translate-x-1/3 -translate-y-1/3 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition duration-500" />
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">Platform Summary</h3>
              <p className="text-indigo-100 text-sm font-medium mb-6 leading-relaxed opacity-80">
                Qualysec CRM is currently monitoring across <span className="text-white font-bold">{users.length}</span> administrators and representatives.
              </p>
              <div className="flex flex-col gap-3">
                <Link href="/admin/users" className="bg-white/10 hover:bg-white/20 border border-white/20 p-3 rounded-xl flex items-center justify-between transition-all duration-300 active:scale-95 group/btn">
                  <span className="text-sm font-bold flex items-center gap-2 tracking-tight underline-offset-4 decoration-white/30 group-hover/btn:underline"><Users size={16} /> User Roles</span>
                  <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition" />
                </Link>
                <Link href="/admin/leads" className="bg-white/10 hover:bg-white/20 border border-white/20 p-3 rounded-xl flex items-center justify-between transition-all duration-300 active:scale-95 group/btn">
                  <span className="text-sm font-bold flex items-center gap-2 tracking-tight underline-offset-4 decoration-white/30 group-hover/btn:underline"><Target size={16} /> Reassign Leads</span>
                  <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition" />
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4 group">
            <div className="bg-slate-50 p-3 rounded-xl transition duration-300 group-hover:bg-indigo-50 group-hover:scale-110">
              <Clock size={20} className="text-slate-400 group-hover:text-indigo-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Platform Status</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5 tracking-tight">Active & Synchronized</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

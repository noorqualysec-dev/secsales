"use client";

import { 
  useAdminUsers, 
  useAdminLeads, 
  useAdminProposals,
  useAdminStats 
} from "@/app/hooks/useAdmin";
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
  Target,
  BarChart3,
  ArrowRight,
  FileText
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const { data: userData, isLoading: userLoading } = useAdminUsers();
  const { data: leadData, isLoading: leadLoading } = useAdminLeads();
  const { data: proposalData, isLoading: proposalLoading } = useAdminProposals();
  const { data: statsData, isLoading: statsLoading } = useAdminStats();

  const users = userData?.data ?? [];
  const leads = leadData?.data ?? [];
  const proposals = proposalData?.data ?? [];
  const stats = statsData?.data ?? {};

  const totalRevenue = proposals
    .filter((p) => p.status === "Accepted")
    .reduce((acc, curr) => acc + (curr.value || 0), 0);

  const mainStats = [
    { label: "Platform Users", value: users.length, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Global Lead Pool", value: leads.length, icon: Database, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Pipeline Proposals", value: proposals.length, icon: HandCoins, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Historical Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  const pipelineStages = [
    { name: "Lead Captured", color: "bg-slate-500", icon: Target },
    { name: "Discovery Call Scheduled", color: "bg-blue-500", icon: Activity },
    { name: "Requirement Gathering", color: "bg-indigo-500", icon: ShieldCheck },
    { name: "Pre-Assessment Form Sent", color: "bg-violet-500", icon: FileText },
    { name: "Proposal Preparation", color: "bg-purple-500", icon: BarChart3 },
    { name: "Proposal Sent", color: "bg-amber-500", icon: HandCoins },
    { name: "Negotiation", color: "bg-orange-500", icon: Clock },
    { name: "Won", color: "bg-emerald-500", icon: TrendingUp },
    { name: "Lost", color: "bg-rose-500", icon: Activity }
  ];

  const recentUsers = [...users].slice(0, 5);

  if (userLoading || leadLoading || proposalLoading || statsLoading) {
    return (
      <div className="space-y-8 animate-pulse text-slate-400">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-2xl border border-slate-100 shadow-sm" />
          ))}
        </div>
        <div className="h-48 bg-slate-100 rounded-2xl border border-slate-200" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in-up">
      {/* Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainStats.map((stat) => (
          <div key={stat.label} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 relative group overflow-hidden">
            <div className={`absolute top-0 left-0 w-1 h-full ${stat.color.replace("text-", "bg-")}`} />
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bg} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                <stat.icon size={20} className={stat.color} />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{stat.value}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Pipeline View */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
           <div className="flex items-center gap-2">
            <BarChart3 className="text-indigo-600" size={18} />
            <h2 className="text-[11px] font-extrabold text-slate-900 tracking-widest uppercase">Lead Lifecycle Pipeline</h2>
          </div>
          <Link href="/admin/kanban" className="text-[10px] font-black text-indigo-600 hover:text-indigo-400 uppercase tracking-[0.2em] underline decoration-indigo-200 decoration-2 underline-offset-4">Open Kanban View</Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-8 overflow-x-auto custom-scrollbar">
          <div className="flex items-center gap-4 min-w-[1200px]">
            {pipelineStages.map((stage, idx) => (
               <Link 
                key={stage.name} 
                href={`/admin/leads?status=${stage.name}`} 
                className="flex-1 bg-slate-50 border border-slate-100 p-5 rounded-2xl hover:bg-white hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 group relative"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stage.color} text-white p-2 rounded-xl shadow-lg`}>
                    <stage.icon size={16} />
                  </div>
                  <span className="text-xl font-black text-slate-900">{stats[stage.name] || 0}</span>
                </div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-tight group-hover:text-indigo-600">LEAD: {stage.name}</p>
                {idx < pipelineStages.length - 1 && (
                  <div className="absolute top-1/2 -right-3 transform -translate-y-1/2 text-slate-200 group-hover:text-indigo-400 transition-colors z-20">
                    <ArrowRight size={14} />
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Admin Activity */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-[11px] font-extrabold text-slate-900 tracking-widest uppercase">System Audit: Users</h2>
            <Link href="/admin/users" className="text-xs font-bold text-indigo-600 hover:underline">View All</Link>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm divide-y divide-slate-100 overflow-hidden">
            {recentUsers.map((user) => (
              <div key={user._id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    {user.role === "admin" ? <ShieldCheck size={18} /> : <UserPlus size={18} />}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{user.name}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{user.role}</p>
                  </div>
                </div>
                <span className={`h-2 w-2 rounded-full ${user.isActive ? "bg-emerald-500" : "bg-red-500"}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Action Center */}
        <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 transform translate-x-1/2 -translate-y-1/2 bg-indigo-500/20 rounded-full blur-3xl" />
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2 tracking-tight">
            <ShieldCheck size={20} className="text-indigo-400" /> Administrative Hub
          </h3>
          <div className="space-y-3 relative z-10">
            {[
              { label: "Manage User Access", href: "/admin/users", icon: Users },
              { label: "Lead Reassignment", href: "/admin/leads", icon: Target },
              { label: "Audit Proposals", href: "/admin/proposals", icon: HandCoins }
            ].map((link) => (
              <Link key={link.label} href={link.href} className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between hover:bg-white/10 transition-all group/btn">
                <span className="text-sm font-bold flex items-center gap-3"><link.icon size={16} className="text-indigo-400" /> {link.label}</span>
                <ChevronRight size={14} className="opacity-40 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

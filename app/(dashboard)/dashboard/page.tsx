"use client";

import { useLeads } from "@/app/hooks/useLeads";
import { useProposals } from "@/app/hooks/useProposals";
import type { Lead } from "@/app/types";
import { useState, useMemo } from "react";
import { 
  TrendingUp, 
  Users, 
  FileText, 
  CheckCircle, 
  LayoutDashboard, 
  Target, 
  Activity, 
  ShieldCheck, 
  FileCheck, 
  BarChart3, 
  HandCoins, 
  Clock, 
  ArrowRight,
  Eye
} from "lucide-react";
import Link from "next/link";

const STAGE_CONFIG = [
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

export default function DashboardPage() {
  const { data: leadsData, isLoading: leadsLoading } = useLeads();
  const { data: proposalsData, isLoading: proposalsLoading } = useProposals();

  const leads = leadsData?.data ?? [];
  const proposals = proposalsData?.data ?? [];

  // Calculate pipeline stats for this user
  const pipelineStats = useMemo(() => {
    const stats: Record<string, number> = {};
    STAGE_CONFIG.forEach(s => stats[s.name] = 0);
    leads.forEach(l => { if (stats[l.status] !== undefined) stats[l.status]++; });
    return stats;
  }, [leads]);

  const mainStats = [
    { label: "Total Leads", value: leads.length, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Won Leads", value: leads.filter((l) => l.status === "Won").length, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Total Proposals", value: proposals.length, icon: FileText, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Accepted", value: proposals.filter((p) => p.status === "Accepted").length, icon: CheckCircle, color: "text-cyan-600", bg: "bg-cyan-50" },
  ];

  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  if (leadsLoading || proposalsLoading) {
    return (
      <div className="space-y-8 animate-pulse text-slate-400">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-2xl border border-slate-100" />
          ))}
        </div>
        <div className="h-48 bg-slate-100 rounded-2xl border border-slate-200" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in-up">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainStats.map((stat) => (
          <div key={stat.label} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 relative group overflow-hidden">
            <div className={`absolute top-0 left-0 w-1 h-full ${stat.color.replace("text-", "bg-")}`} />
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bg} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                <stat.icon size={20} className={stat.color} />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 leading-none">{stat.value}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Visual Pipeline Runner */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
           <div className="flex items-center gap-2">
            <BarChart3 className="text-indigo-600" size={18} />
            <h2 className="text-[11px] font-extrabold text-slate-900 tracking-widest uppercase text-shadow-sm">Your Sales Pipeline</h2>
          </div>
          <Link href="/kanban" className="text-[10px] font-black text-indigo-600 hover:text-indigo-400 uppercase tracking-[0.2em] underline decoration-indigo-200 decoration-2 underline-offset-4">Open Kanban Workspace</Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-8 overflow-x-auto custom-scrollbar">
          <div className="flex items-center gap-4 min-w-[1200px]">
            {STAGE_CONFIG.map((stage, idx) => (
               <Link 
                key={stage.name} 
                href={`/leads?status=${stage.name}`} 
                className="flex-1 bg-slate-50 border border-slate-100 p-5 rounded-2xl hover:bg-white hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 group relative"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stage.color} text-white p-2 rounded-xl shadow-lg`}>
                    <stage.icon size={16} />
                  </div>
                  <span className="text-xl font-black text-slate-900">{pipelineStats[stage.name] || 0}</span>
                </div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-tight group-hover:text-indigo-600 leading-tight">LEAD: {stage.name}</p>
                {idx < STAGE_CONFIG.length - 1 && (
                  <div className="absolute top-1/2 -right-3 transform -translate-y-1/2 text-slate-200 group-hover:text-indigo-400 transition-colors z-20">
                    <ArrowRight size={14} />
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Leads Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <Users className="text-indigo-600" size={18} />
            <h2 className="text-[11px] font-extrabold text-slate-900 tracking-widest uppercase">Lead Intelligence Feed</h2>
          </div>
          <Link href="/leads" className="text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-[0.2em] transition">View Full Roster</Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          {recentLeads.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <Users className="mx-auto mb-4 w-12 h-12 opacity-20" />
              <p className="text-[10px] font-black uppercase tracking-widest">No leads assigned to your profile yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentLeads.map((lead: Lead) => (
                <div key={lead._id} className="px-8 py-5 flex items-center justify-between hover:bg-slate-50/50 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-sm shadow-lg group-hover:scale-110 transition cursor-default">
                      {lead.firstName[0]}{lead.lastName[0]}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight group-hover:text-indigo-600 transition">
                        {lead.firstName} {lead.lastName}
                      </h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5 tracking-wider">{lead.company || "Individual Opportunity"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <span className={`inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.15em] px-4 py-1.5 rounded-full border shadow-sm ${
                      lead.status === 'Won' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      lead.status === 'Lost' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                      'bg-slate-50 text-slate-600 border-slate-100'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        lead.status === 'Won' ? 'bg-emerald-500' :
                        lead.status === 'Lost' ? 'bg-rose-500' :
                        'bg-slate-400'
                      }`} />
                      LEAD: {lead.status}
                    </span>
                    <Link href={`/leads/${lead._id}`} className="p-3 bg-white border border-slate-100 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white hover:border-slate-900 transition shadow-sm active:scale-95 group/btn">
                      <Eye size={16} className="group-hover/btn:rotate-12 transition" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

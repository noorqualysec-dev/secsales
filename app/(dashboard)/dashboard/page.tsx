"use client";

import { useLeads } from "@/app/hooks/useLeads";
import { useProposals } from "@/app/hooks/useProposals";
import type { Lead } from "@/app/types";
import { TrendingUp, Users, FileText, CheckCircle } from "lucide-react";

const statusColors: Record<string, string> = {
  "Lead Captured": "bg-blue-100 text-blue-700",
  "Discovery Call Scheduled": "bg-purple-100 text-purple-700",
  "Requirement Gathering": "bg-yellow-100 text-yellow-700",
  "Pre-Assessment Form Sent": "bg-orange-100 text-orange-700",
  "Proposal Preparation": "bg-indigo-100 text-indigo-700",
  "Proposal Sent": "bg-cyan-100 text-cyan-700",
  "Negotiation": "bg-amber-100 text-amber-700",
  "Won": "bg-green-100 text-green-700",
  "Lost": "bg-red-100 text-red-700",
};

export default function DashboardPage() {
  const { data: leadsData, isLoading: leadsLoading } = useLeads();
  const { data: proposalsData, isLoading: proposalsLoading } = useProposals();

  const leads = leadsData?.data ?? [];
  const proposals = proposalsData?.data ?? [];

  const stats = [
    {
      label: "Total Leads",
      value: leads.length,
      icon: Users,
      color: "bg-blue-500",
      bg: "bg-blue-50",
    },
    {
      label: "Won Leads",
      value: leads.filter((l) => l.status === "Won").length,
      icon: TrendingUp,
      color: "bg-green-500",
      bg: "bg-green-50",
    },
    {
      label: "Total Proposals",
      value: proposals.length,
      icon: FileText,
      color: "bg-indigo-500",
      bg: "bg-indigo-50",
    },
    {
      label: "Accepted Proposals",
      value: proposals.filter((p) => p.status === "Accepted").length,
      icon: CheckCircle,
      color: "bg-emerald-500",
      bg: "bg-emerald-50",
    },
  ];

  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  if (leadsLoading || proposalsLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-xl" />
          ))}
        </div>
        <div className="h-64 bg-slate-200 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
            <div className={`${bg} p-3 rounded-xl`}>
              <Icon className={`${color.replace("bg-", "text-")} w-5 h-5`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Leads */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">Recent Leads</h2>
          <a href="/leads" className="text-sm text-indigo-600 hover:underline font-medium">
            View all →
          </a>
        </div>

        {recentLeads.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Users className="mx-auto mb-3 w-10 h-10 opacity-30" />
            <p className="text-sm">No leads yet. Add your first lead!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentLeads.map((lead: Lead) => (
              <div key={lead._id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm">
                    {lead.firstName[0]}{lead.lastName[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {lead.firstName} {lead.lastName}
                    </p>
                    <p className="text-xs text-slate-500">{lead.company ?? lead.email}</p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[lead.status] ?? "bg-slate-100 text-slate-600"}`}>
                  {lead.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

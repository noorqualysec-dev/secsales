"use client";

import { useMemo, useState } from "react";
import { useAdminLeads, useAdminUsers } from "@/app/hooks/useAdmin";
import {
  Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Cell, PieChart, Pie, BarChart,
  Tooltip as RechartsTooltip,
} from "recharts";
import {
  TrendingUp, IndianRupee, Target, Percent, Trophy,
  BarChart3, GitMerge, PieChart as PieIcon, CheckCircle, XCircle, SlidersHorizontal,
} from "lucide-react";
import type { Lead, User } from "@/app/types";
import { PIPELINE_LEAD_STATUSES, getLeadOutcome, getLeadStage } from "@/app/lib/leadStatus";

// ── Constants ─────────────────────────────────────────────────────────────────

const PIPELINE_STAGES = PIPELINE_LEAD_STATUSES;

const STAGE_COLORS: Record<string, string> = {
  "Lead Captured":               "#94a3b8",
  "Discovery Call Scheduled":    "#6366f1",
  "Requirement Gathering":       "#8b5cf6",

  "Proposal Sent":               "#f97316",
  "Negotiation":                 "#fb923c",
  "Won":                         "#10b981",
  "Lost":                        "#f43f5e",
};

const SOURCE_COLORS = [
  "#6366f1", "#8b5cf6", "#10b981", "#f59e0b",
  "#ec4899", "#06b6d4", "#f43f5e", "#84cc16", "#64748b",
];

const MONTH_RANGE_OPTIONS = [
  { label: "3M",  value: 3 },
  { label: "6M",  value: 6 },
  { label: "12M", value: 12 },
  { label: "24M", value: 24 },
];



// ── Custom Tooltips ───────────────────────────────────────────────────────────

function LeadsTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xl text-xs space-y-1.5">
      <p className="font-extrabold text-slate-800 text-[11px] uppercase tracking-widest">{label}</p>
      <p className="text-indigo-600 font-bold">{payload[0].value} leads</p>
    </div>
  );
}

function RevenueTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xl text-xs space-y-1.5">
      <p className="font-extrabold text-slate-800 text-[11px] uppercase tracking-widest">{label}</p>
      <p className="text-emerald-600 font-bold">₹{Number(payload[0].value).toLocaleString("en-IN")}</p>
    </div>
  );
}

function FunnelTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xl text-xs space-y-1">
      <p className="font-extrabold text-slate-800">{d.fullStage}</p>
      <p className="text-slate-600 font-bold">{d.count} leads</p>
      <p className="text-slate-500 font-bold">Open {d.openCount} · Won {d.wonCount} · Lost {d.lostCount}</p>
      {d.value > 0 && <p className="text-indigo-600 font-bold">₹{d.value.toLocaleString("en-IN")} pipeline</p>}
    </div>
  );
}

function LostStageTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xl text-xs space-y-1">
      <p className="font-extrabold text-slate-800">{d.stage}</p>
      <p className="text-rose-500 font-bold">{d.count} lost · {d.pct}%</p>
    </div>
  );
}

function SourceTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xl text-xs space-y-1">
      <p className="font-extrabold text-slate-800 capitalize">{d.name}</p>
      <p className="text-slate-600 font-bold">{d.value} leads</p>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminAnalyticsPage() {
  const { data: leadData,  isLoading: leadsLoading } = useAdminLeads();
  const { data: userData,  isLoading: usersLoading } = useAdminUsers();

  const leads = leadData?.data ?? [];
  const users = userData?.data  ?? [];
  const isLoading = leadsLoading || usersLoading;

  const [monthRange, setMonthRange] = useState<number>(6);

  // ── Window start timestamp ────────────────────────────────────────────────
  const windowStart = useMemo(
    () => Date.now() - monthRange * 30 * 24 * 60 * 60 * 1000,
    [monthRange]
  );

  // ── Windowed leads (for filter-aware KPIs and conversion stats) ───────────
  const windowedLeads = useMemo(
    () => leads.filter(l => Number(l.createdAt) >= windowStart),
    [leads, windowStart]
  );

  // ── KPIs (filter-aware) ───────────────────────────────────────────────────
  const wonLeads   = windowedLeads.filter(l => getLeadOutcome(l) === "won");
  const openLeads  = windowedLeads.filter(l => getLeadOutcome(l) === "open");
  const lostLeads  = windowedLeads.filter(l => getLeadOutcome(l) === "lost");

  const totalRevenue  = wonLeads.reduce((s, l) => s + (l.dealValue || 0), 0);
  const pipelineValue = openLeads.reduce((s, l) => s + (l.dealValue || 0), 0);
  const winRate       = (wonLeads.length + lostLeads.length) > 0
    ? Math.round((wonLeads.length / (wonLeads.length + lostLeads.length)) * 100)
    : 0;
  const avgDeal       = wonLeads.length > 0 ? Math.round(totalRevenue / wonLeads.length) : 0;

  // ── Leads by Month ────────────────────────────────────────────────────────
  const leadsMonthlyData = useMemo(() => {
    return Array.from({ length: monthRange }, (_, i) => {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - (monthRange - 1 - i));
      const start = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
      const end   = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
      const count = leads.filter(l => Number(l.createdAt) >= start && Number(l.createdAt) <= end).length;
      return {
        month: d.toLocaleDateString("en-IN", { month: "short", year: monthRange > 12 ? "2-digit" : undefined }),
        count,
      };
    });
  }, [leads, monthRange]);

  // ── Revenue by Month ──────────────────────────────────────────────────────
  const revenueMonthlyData = useMemo(() => {
    return Array.from({ length: monthRange }, (_, i) => {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - (monthRange - 1 - i));
      const start = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
      const end   = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
      const revenue = leads
        .filter(l => getLeadOutcome(l) === "won" && Number(l.updatedAt) >= start && Number(l.updatedAt) <= end)
        .reduce((sum, l) => sum + (l.dealValue || 0), 0);
      return {
        month: d.toLocaleDateString("en-IN", { month: "short", year: monthRange > 12 ? "2-digit" : undefined }),
        revenue,
      };
    });
  }, [leads, monthRange]);

  // ── Conversion Lost by Stage ──────────────────────────────────────────────
  const lostByStageData = useMemo(() => {
    const lostByStage: Record<string, number> = {};
    lostLeads.forEach((lead: Lead) => {
      const stage = lead.lostAtStatus || getLeadStage(lead) || "Unknown";
      lostByStage[stage] = (lostByStage[stage] || 0) + 1;
    });
    const total = lostLeads.length || 1;
    return Object.entries(lostByStage)
      .map(([stage, count]) => ({ stage, count, pct: Math.round((count / total) * 100) }))
      .sort((a, b) => b.count - a.count);
  }, [lostLeads]);

  // ── Lead Source Distribution ──────────────────────────────────────────────
  const sourceData = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach(l => {
      const src = (l.source || "other").replace(/_/g, " ");
      counts[src] = (counts[src] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))
      .sort((a, b) => b.value - a.value);
  }, [leads]);

  // ── Conversion Funnel (all-time) ──────────────────────────────────────────
  const funnelData = useMemo(() => {
    return PIPELINE_STAGES.map(stage => {
      const leadsAtStage = leads.filter(l => getLeadStage(l) === stage);
      return {
      stage: stage.length > 22 ? stage.slice(0, 20) + "…" : stage,
      fullStage: stage,
      openCount: leadsAtStage.filter(l => getLeadOutcome(l) === "open").length,
      wonCount: leadsAtStage.filter(l => getLeadOutcome(l) === "won").length,
      lostCount: leadsAtStage.filter(l => getLeadOutcome(l) === "lost").length,
      count: leadsAtStage.length,
      value: leadsAtStage.reduce((s, l) => s + (l.dealValue || 0), 0),
      };
    });
  }, [leads]);

  // ── Rep Leaderboard ───────────────────────────────────────────────────────
  const leaderboard = useMemo(() => {
    return users
      .filter(u => u.role !== "admin")
      .map(user => {
        const ul = leads.filter(l => {
          const aid = (l.assignedTo as any)?._id || l.assignedTo;
          return aid === user._id;
        });
        const won      = ul.filter(l => getLeadOutcome(l) === "won");
        const open     = ul.filter(l => getLeadOutcome(l) === "open");
        const revenue  = won.reduce((s, l)  => s + (l.dealValue || 0), 0);
        const pipeline = open.reduce((s, l) => s + (l.dealValue || 0), 0);
        const closed   = ul.filter(l => ["won", "lost"].includes(getLeadOutcome(l))).length;
        const wr       = closed > 0 ? Math.round((won.length / closed) * 100) : 0;
        return { user, total: ul.length, won: won.length, revenue, pipeline, winRate: wr };
      })
      .sort((a, b) => b.revenue - a.revenue);
  }, [users, leads]);

  // ── Revenue Y-axis formatter ──────────────────────────────────────────────
  const fmtRevAxis = (v: number) =>
    v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : v >= 1000 ? `₹${(v / 1000).toFixed(0)}K` : `₹${v}`;

  // ── Skeleton ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-12 bg-slate-100 rounded-2xl w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-slate-200 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-slate-100 rounded-2xl" />
          <div className="h-72 bg-slate-100 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="h-32 bg-slate-100 rounded-2xl" />
          <div className="h-32 bg-slate-100 rounded-2xl" />
        </div>
        <div className="h-64 bg-slate-100 rounded-2xl" />
        <div className="h-80 bg-slate-100 rounded-2xl" />
        <div className="h-64 bg-slate-100 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">

      {/* ── Month Range Filter ── */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
          <SlidersHorizontal size={14} className="text-slate-400" />
          Period
        </div>
        <div className="flex items-center gap-1.5 bg-slate-100 rounded-xl p-1">
          {MONTH_RANGE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setMonthRange(opt.value)}
              className={`px-4 py-1.5 rounded-lg text-[11px] font-extrabold transition-all duration-200 cursor-pointer ${
                monthRange === opt.value
                  ? "bg-white text-indigo-600 shadow-sm border border-slate-200"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <span className="text-[10px] text-slate-400 font-bold ml-1">
          Showing last {monthRange} months
        </span>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            label: "Total Won Revenue",
            value: `₹${totalRevenue.toLocaleString("en-IN")}`,
            sub:   `${wonLeads.length} deals closed`,
            icon:  IndianRupee,
            color: "text-emerald-600",
            bg:    "bg-emerald-50",
            bar:   "bg-emerald-500",
          },
          {
            label: "Open Pipeline",
            value: `₹${pipelineValue.toLocaleString("en-IN")}`,
            sub:   `${openLeads.length} active deals`,
            icon:  TrendingUp,
            color: "text-indigo-600",
            bg:    "bg-indigo-50",
            bar:   "bg-indigo-500",
          },
          {
            label: "Win Rate",
            value: `${winRate}%`,
            sub:   `${wonLeads.length}W · ${lostLeads.length}L`,
            icon:  Percent,
            color: "text-violet-600",
            bg:    "bg-violet-50",
            bar:   "bg-violet-500",
          },
          {
            label: "Avg Won Deal",
            value: `₹${avgDeal.toLocaleString("en-IN")}`,
            sub:   "per closed deal",
            icon:  Target,
            color: "text-amber-600",
            bg:    "bg-amber-50",
            bar:   "bg-amber-500",
          },
        ].map(stat => (
          <div key={stat.label} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
            <div className={`absolute top-0 left-0 w-1 h-full ${stat.bar}`} />
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bg} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                <stat.icon size={20} className={stat.color} />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{stat.value}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Leads by Month | Revenue by Month ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Leads by Month */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center">
              <BarChart3 size={15} className="text-indigo-600" />
            </div>
            <div>
              <h3 className="text-[11px] font-extrabold text-slate-900 uppercase tracking-widest">Leads by Month</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">New leads created · last {monthRange} months</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={leadsMonthlyData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                axisLine={false} tickLine={false}
                allowDecimals={false}
              />
              <RechartsTooltip content={<LeadsTooltip />} cursor={{ fill: "#f8fafc" }} />
              <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={monthRange <= 6 ? 32 : 18} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Month */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center">
              <IndianRupee size={15} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="text-[11px] font-extrabold text-slate-900 uppercase tracking-widest">Revenue by Month</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">Won deal value · last {monthRange} months</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueMonthlyData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                axisLine={false} tickLine={false}
                tickFormatter={fmtRevAxis}
              />
              <RechartsTooltip content={<RevenueTooltip />} cursor={{ fill: "#f8fafc" }} />
              <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} barSize={monthRange <= 6 ? 32 : 18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Conversion Won ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Won Deals card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle size={16} className="text-emerald-600" />
                </div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Conversion Won</span>
              </div>
              <p className="text-4xl font-extrabold text-slate-900 tracking-tight">{wonLeads.length}</p>
              <p className="text-[11px] text-slate-400 font-bold mt-1">
                deals won · {windowedLeads.length > 0 ? Math.round((wonLeads.length / windowedLeads.length) * 100) : 0}% of {windowedLeads.length} total
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Revenue</p>
              <p className="text-xl font-extrabold text-emerald-600">₹{totalRevenue.toLocaleString("en-IN")}</p>
            </div>
          </div>

          {/* Mini monthly won bars */}
          <div className="mt-5 flex items-end gap-1 h-10">
            {revenueMonthlyData.slice(-12).map((d, i) => {
              const maxRev = Math.max(...revenueMonthlyData.map(r => r.revenue), 1);
              const pct = Math.round((d.revenue / maxRev) * 100);
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                  <div
                    className="w-full rounded-t bg-emerald-400 opacity-70 min-h-[2px] transition-all duration-500"
                    style={{ height: `${pct}%` }}
                  />
                </div>
              );
            })}
          </div>
          <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest mt-1">monthly revenue trend</p>
        </div>

        {/* Win Rate card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-violet-500" />
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-violet-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Percent size={16} className="text-violet-600" />
                </div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Win Rate</span>
              </div>
              <p className="text-4xl font-extrabold text-slate-900 tracking-tight">{winRate}%</p>
              <p className="text-[11px] text-slate-400 font-bold mt-1">
                {wonLeads.length}W · {lostLeads.length}L · in last {monthRange} months
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Avg Deal</p>
              <p className="text-xl font-extrabold text-violet-600">₹{avgDeal.toLocaleString("en-IN")}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1.5">
              <span className="text-emerald-500">Won {wonLeads.length}</span>
              <span className="text-rose-400">Lost {lostLeads.length}</span>
            </div>
            <div className="w-full h-2.5 bg-rose-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${winRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Conversion Lost by Stage ── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-rose-50 rounded-xl flex items-center justify-center">
              <XCircle size={15} className="text-rose-500" />
            </div>
            <div>
              <h3 className="text-[11px] font-extrabold text-slate-900 uppercase tracking-widest">Conversion Lost by Stage</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                At which pipeline stage leads were lost · last {monthRange} months
              </p>
            </div>
          </div>
          <span className="text-[10px] font-extrabold text-rose-400 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100">
            {lostLeads.length} leads lost
          </span>
        </div>

        {lostByStageData.length === 0 ? (
          <div className="h-32 flex items-center justify-center text-slate-300 italic text-sm">
            No lost leads in this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(160, lostByStageData.length * 52)}>
            <BarChart data={lostByStageData} layout="vertical" barSize={22} margin={{ left: 0, right: 64, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="stage"
                width={175}
                tick={{ fontSize: 10, fontWeight: 700, fill: "#475569" }}
                axisLine={false} tickLine={false}
              />
              <RechartsTooltip content={<LostStageTooltip />} cursor={{ fill: "#fef2f2" }} />
              <Bar
                dataKey="count"
                radius={[0, 6, 6, 0]}
                label={{
                  position: "right",
                  fontSize: 11,
                  fontWeight: 800,
                  fill: "#94a3b8",
                  valueAccessor: (entry) => `${entry.value} (${(entry.payload as any)?.pct ?? 0}%)`,
                }}
              >
                {lostByStageData.map((entry, i) => (
                  <Cell key={i} fill={STAGE_COLORS[entry.stage] ?? "#f43f5e"} opacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Conversion Funnel (all-time) ── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center">
              <GitMerge size={15} className="text-amber-600" />
            </div>
            <div>
              <h3 className="text-[11px] font-extrabold text-slate-900 uppercase tracking-widest">Conversion Funnel</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">Lead count at each pipeline stage · all time</p>
            </div>
          </div>
          <span className="text-[10px] font-extrabold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
            {leads.length} total leads
          </span>
        </div>
        <ResponsiveContainer width="100%" height={290}>
          <BarChart data={funnelData} layout="vertical" barSize={22} margin={{ left: 0, right: 48, top: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="stage"
              width={175}
              tick={{ fontSize: 10, fontWeight: 700, fill: "#475569" }}
              axisLine={false} tickLine={false}
            />
            <RechartsTooltip content={<FunnelTooltip />} cursor={{ fill: "#f8fafc" }} />
            <Bar
              dataKey="openCount"
              stackId="funnel"
              radius={[0, 6, 6, 0]}
              fill="#94a3b8"
            />
            <Bar dataKey="wonCount" stackId="funnel" fill={STAGE_COLORS.Won} />
            <Bar
              dataKey="lostCount"
              stackId="funnel"
              radius={[0, 6, 6, 0]}
              fill={STAGE_COLORS.Lost}
              label={{ position: "right", fontSize: 11, fontWeight: 800, fill: "#94a3b8", valueAccessor: (entry) => `${entry.payload.count}` }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Lead Source + Rep Leaderboard ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Lead Source — 2/5 */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-violet-50 rounded-xl flex items-center justify-center">
              <PieIcon size={15} className="text-violet-600" />
            </div>
            <div>
              <h3 className="text-[11px] font-extrabold text-slate-900 uppercase tracking-widest">Lead Sources</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">Acquisition channel breakdown</p>
            </div>
          </div>

          {sourceData.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-slate-300 italic text-sm">No data</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%" cy="50%"
                    innerRadius={48} outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {sourceData.map((_, i) => (
                      <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<SourceTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              <div className="mt-4 space-y-2">
                {sourceData.map((item, i) => {
                  const pct = leads.length > 0 ? Math.round((item.value / leads.length) * 100) : 0;
                  return (
                    <div key={item.name} className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: SOURCE_COLORS[i % SOURCE_COLORS.length] }}
                      />
                      <span className="text-[10px] font-bold text-slate-600 flex-1 capitalize">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-14 h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${pct}%`, backgroundColor: SOURCE_COLORS[i % SOURCE_COLORS.length] }}
                          />
                        </div>
                        <span className="text-[10px] font-extrabold text-slate-700 w-4 text-right">{item.value}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Rep Leaderboard — 3/5 */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center">
                <Trophy size={15} className="text-amber-500" />
              </div>
              <div>
                <h3 className="text-[11px] font-extrabold text-slate-900 uppercase tracking-widest">Rep Leaderboard</h3>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">Ranked by total revenue closed</p>
              </div>
            </div>
            <span className="text-[10px] font-extrabold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
              {leaderboard.length} reps
            </span>
          </div>

          {leaderboard.length === 0 ? (
            <div className="py-16 text-center text-slate-300 italic text-sm">No sales reps found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[500px]">
                <thead>
                  <tr className="bg-slate-50/60 text-slate-400 text-[9px] font-extrabold uppercase tracking-widest">
                    <th className="px-5 py-4">Rank</th>
                    <th className="px-5 py-4">Rep</th>
                    <th className="px-5 py-4 text-right">Won</th>
                    <th className="px-5 py-4 text-right">Win Rate</th>
                    <th className="px-5 py-4 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {leaderboard.map((rep, idx) => {
                    const medalColors = [
                      "bg-amber-100 text-amber-600 border-amber-200",
                      "bg-slate-100 text-slate-600 border-slate-200",
                      "bg-orange-100 text-orange-600 border-orange-200",
                    ];
                    return (
                      <tr key={rep.user._id} className="hover:bg-slate-50/60 transition-colors group">
                        <td className="px-5 py-4">
                          <span className={`w-7 h-7 inline-flex items-center justify-center rounded-xl text-[11px] font-extrabold border ${
                            idx < 3 ? medalColors[idx] : "text-slate-400 border-transparent"
                          }`}>
                            {idx + 1}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-[11px] font-extrabold text-indigo-600">
                              {rep.user.name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800">{rep.user.name}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{rep.user.role}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="text-sm font-extrabold text-emerald-600">{rep.won}</span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-indigo-500 transition-all duration-700"
                                style={{ width: `${rep.winRate}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-extrabold text-slate-700 w-8 text-right">{rep.winRate}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="text-sm font-extrabold text-slate-900">
                            ₹{rep.revenue.toLocaleString("en-IN")}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}


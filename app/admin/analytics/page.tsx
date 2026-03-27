"use client";

import { useMemo } from "react";
import { useAdminLeads, useAdminUsers } from "@/app/hooks/useAdmin";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Cell, PieChart, Pie, BarChart,
  Tooltip as RechartsTooltip,
} from "recharts";
import {
  TrendingUp, IndianRupee, Target, Percent, Trophy,
  BarChart3, GitMerge, PieChart as PieIcon,
} from "lucide-react";
import type { Lead, User } from "@/app/types";

// ── Constants ─────────────────────────────────────────────────────────────────

const PIPELINE_STAGES = [
  "Lead Captured", "Discovery Call Scheduled", "Requirement Gathering",
  "Pre-Assessment Form Sent", "Proposal Preparation", "Proposal Sent",
  "Negotiation", "Won", "Lost",
] as const;

const STAGE_COLORS: Record<string, string> = {
  "Lead Captured":               "#94a3b8",
  "Discovery Call Scheduled":    "#6366f1",
  "Requirement Gathering":       "#8b5cf6",
  "Pre-Assessment Form Sent":    "#a78bfa",
  "Proposal Preparation":        "#f59e0b",
  "Proposal Sent":               "#f97316",
  "Negotiation":                 "#fb923c",
  "Won":                         "#10b981",
  "Lost":                        "#f43f5e",
};

const SOURCE_COLORS = [
  "#6366f1", "#8b5cf6", "#10b981", "#f59e0b",
  "#ec4899", "#06b6d4", "#f43f5e", "#84cc16", "#64748b",
];

// ── Custom Tooltips ───────────────────────────────────────────────────────────

function RevenueTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const rev  = payload.find((p: any) => p.dataKey === "revenue");
  const leads = payload.find((p: any) => p.dataKey === "newLeads");
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xl text-xs space-y-1.5">
      <p className="font-extrabold text-slate-800 text-[11px] uppercase tracking-widest">{label}</p>
      {rev   && <p className="text-indigo-600 font-bold">₹{Number(rev.value).toLocaleString("en-IN")} revenue</p>}
      {leads && <p className="text-slate-400 font-bold">{leads.value} new leads</p>}
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
      {d.value > 0 && <p className="text-indigo-600 font-bold">₹{d.value.toLocaleString("en-IN")} pipeline</p>}
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

  // ── KPIs ─────────────────────────────────────────────────────────────────────
  const wonLeads  = leads.filter(l => l.status === "Won");
  const openLeads = leads.filter(l => !["Won", "Lost"].includes(l.status));
  const lostLeads = leads.filter(l => l.status === "Lost");

  const totalRevenue = wonLeads.reduce((s, l)  => s + (l.dealValue || 0), 0);
  const pipelineValue = openLeads.reduce((s, l) => s + (l.dealValue || 0), 0);
  const winRate   = leads.length > 0 ? Math.round((wonLeads.length / (wonLeads.length + lostLeads.length || 1)) * 100) : 0;
  const avgDeal   = wonLeads.length > 0 ? Math.round(totalRevenue / wonLeads.length) : 0;

  // ── Monthly Revenue & New Leads (last 6 months) ───────────────────────────
  const monthlyData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - (5 - i));
      const start = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
      const end   = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
      const revenue  = leads
        .filter(l => l.status === "Won" && Number(l.updatedAt) >= start && Number(l.updatedAt) <= end)
        .reduce((sum, l) => sum + (l.dealValue || 0), 0);
      const newLeads = leads.filter(l => Number(l.createdAt) >= start && Number(l.createdAt) <= end).length;
      return { month: d.toLocaleDateString("en-IN", { month: "short" }), revenue, newLeads };
    });
  }, [leads]);

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

  // ── Conversion Funnel ─────────────────────────────────────────────────────
  const funnelData = useMemo(() => {
    return PIPELINE_STAGES.map(stage => ({
      stage: stage.length > 22 ? stage.slice(0, 20) + "…" : stage,
      fullStage: stage,
      count: leads.filter(l => l.status === stage).length,
      value: leads.filter(l => l.status === stage).reduce((s, l) => s + (l.dealValue || 0), 0),
    }));
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
        const won      = ul.filter(l => l.status === "Won");
        const open     = ul.filter(l => !["Won", "Lost"].includes(l.status));
        const revenue  = won.reduce((s, l)  => s + (l.dealValue || 0), 0);
        const pipeline = open.reduce((s, l) => s + (l.dealValue || 0), 0);
        const closed   = ul.filter(l => ["Won", "Lost"].includes(l.status)).length;
        const wr       = closed > 0 ? Math.round((won.length / closed) * 100) : 0;
        return { user, total: ul.length, won: won.length, revenue, pipeline, winRate: wr };
      })
      .sort((a, b) => b.revenue - a.revenue);
  }, [users, leads]);

  // ── Skeleton ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-slate-200 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 h-72 bg-slate-100 rounded-2xl" />
          <div className="lg:col-span-2 h-72 bg-slate-100 rounded-2xl" />
        </div>
        <div className="h-80 bg-slate-100 rounded-2xl" />
        <div className="h-64 bg-slate-100 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">

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

      {/* ── Revenue Trend + Lead Source ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Revenue Trend — 3/5 */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center">
                <BarChart3 size={15} className="text-indigo-600" />
              </div>
              <div>
                <h3 className="text-[11px] font-extrabold text-slate-900 uppercase tracking-widest">Revenue Trend</h3>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">Won deal value · last 6 months</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 inline-block" /> Revenue
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" /> New Leads
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <ComposedChart data={monthlyData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fontWeight: 700, fill: "#94a3b8" }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                yAxisId="rev"
                orientation="left"
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                axisLine={false} tickLine={false}
                tickFormatter={v => v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : v >= 1000 ? `₹${(v / 1000).toFixed(0)}K` : `₹${v}`}
              />
              <YAxis
                yAxisId="cnt"
                orientation="right"
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                axisLine={false} tickLine={false}
              />
              <RechartsTooltip content={<RevenueTooltip />} cursor={{ fill: "#f8fafc" }} />
              <Bar
                yAxisId="rev"
                dataKey="revenue"
                fill="#6366f1"
                radius={[6, 6, 0, 0]}
                barSize={32}
              />
              <Line
                yAxisId="cnt"
                type="monotone"
                dataKey="newLeads"
                stroke="#cbd5e1"
                strokeWidth={2.5}
                dot={{ fill: "#94a3b8", r: 4, strokeWidth: 0 }}
                activeDot={{ fill: "#6366f1", r: 5, strokeWidth: 0 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

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

              {/* Legend rows */}
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
      </div>

      {/* ── Conversion Funnel ── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center">
              <GitMerge size={15} className="text-amber-600" />
            </div>
            <div>
              <h3 className="text-[11px] font-extrabold text-slate-900 uppercase tracking-widest">Conversion Funnel</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">Lead count at each pipeline stage</p>
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
              dataKey="count"
              radius={[0, 6, 6, 0]}
              label={{ position: "right", fontSize: 11, fontWeight: 800, fill: "#94a3b8" }}
            >
              {funnelData.map((entry, i) => (
                <Cell key={i} fill={STAGE_COLORS[entry.fullStage] || "#94a3b8"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Rep Leaderboard ── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
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
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="bg-slate-50/60 text-slate-400 text-[9px] font-extrabold uppercase tracking-widest">
                  <th className="px-6 py-4">Rank</th>
                  <th className="px-6 py-4">Representative</th>
                  <th className="px-6 py-4 text-right">Leads</th>
                  <th className="px-6 py-4 text-right">Won</th>
                  <th className="px-6 py-4 text-right">Win Rate</th>
                  <th className="px-6 py-4 text-right">Revenue Closed</th>
                  <th className="px-6 py-4 text-right">Open Pipeline</th>
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
                      <td className="px-6 py-4">
                        <span className={`w-7 h-7 inline-flex items-center justify-center rounded-xl text-[11px] font-extrabold border ${
                          idx < 3 ? medalColors[idx] : "text-slate-400 border-transparent"
                        }`}>
                          {idx + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4">
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
                      <td className="px-6 py-4 text-right text-sm font-bold text-slate-500">{rep.total}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-extrabold text-emerald-600">{rep.won}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-indigo-500 transition-all duration-700"
                              style={{ width: `${rep.winRate}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-extrabold text-slate-700 w-8 text-right">{rep.winRate}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-extrabold text-slate-900">
                          ₹{rep.revenue.toLocaleString("en-IN")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-bold text-indigo-500">
                          ₹{rep.pipeline.toLocaleString("en-IN")}
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
  );
}

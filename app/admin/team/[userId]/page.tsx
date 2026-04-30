"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  Briefcase,
  CheckCircle2,
  FileText,
  Funnel,
  Search,
  Target,
  Trophy,
  UserRound,
  XCircle,
} from "lucide-react";
import {
  useAdminLeads,
  useAdminProposals,
  useAdminUsers,
} from "@/app/hooks/useAdmin";
import type { Lead, LeadStatusBucket, Proposal, ProposalStatus, User } from "@/app/types";
import {
  computeAllUserStats,
  createEmptyStats,
  formatLeadStatusBadgeColor,
  formatRoleBadgeColor,
  formatRoleLabel,
  getLeadStatusBucket,
  getUserLeads,
  getUserProposals,
  LEAD_STATUSES,
  PROPOSAL_STATUSES,
} from "../performance";

type LeadFilter = "all" | LeadStatusBucket;
type ProposalFilter = "all" | ProposalStatus;

const EMPTY_USERS: User[] = [];
const EMPTY_LEADS: Lead[] = [];
const EMPTY_PROPOSALS: Proposal[] = [];

function getProposalStatusBadgeColor(status: ProposalStatus): string {
  if (status === "Accepted") return "bg-emerald-100 text-emerald-700";
  if (status === "Rejected") return "bg-rose-100 text-rose-600";
  if (status === "In Negotiation") return "bg-orange-100 text-orange-700";
  if (status === "Sent") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-700";
}

function getLeadName(
  leadRef: Lead | string | null | undefined,
  leadsMap: Map<string, Lead>
): string {
  if (!leadRef) return "Unknown Lead";

  if (typeof leadRef === "string") {
    const lead = leadsMap.get(leadRef);
    if (!lead) return "Unknown Lead";
    return `${lead.firstName} ${lead.lastName}`;
  }

  const firstName = leadRef.firstName?.trim?.() || "";
  const lastName = leadRef.lastName?.trim?.() || "";
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || "Unknown Lead";
}

export default function SalesRepProfilePage() {
  const params = useParams<{ userId: string | string[] }>();
  const rawUserId = params.userId;
  const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId;

  const { data: usersData, isLoading: usersLoading } = useAdminUsers();
  const { data: leadsData, isLoading: leadsLoading } = useAdminLeads();
  const { data: proposalData, isLoading: proposalLoading } = useAdminProposals();

  const users = usersData?.data ?? EMPTY_USERS;
  const leads = leadsData?.data ?? EMPTY_LEADS;
  const proposals = proposalData?.data ?? EMPTY_PROPOSALS;

  const [leadFilter, setLeadFilter] = useState<LeadFilter>("all");
  const [proposalFilter, setProposalFilter] = useState<ProposalFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const isLoading = usersLoading || leadsLoading || proposalLoading;

  const statsMap = useMemo(
    () => computeAllUserStats(users, leads, proposals),
    [users, leads, proposals]
  );

  const user = useMemo(
    () => users.find((item) => item._id === userId) || null,
    [userId, users]
  );

  const userStats = user ? statsMap.get(user._id) ?? createEmptyStats(user._id) : null;
  const userLeads = useMemo(
    () => (user ? getUserLeads(user._id, leads) : []),
    [user, leads]
  );
  const userProposals = useMemo(
    () => (user ? getUserProposals(user._id, proposals) : []),
    [user, proposals]
  );

  const leadsMap = useMemo(
    () => new Map(leads.map((lead) => [lead._id, lead])),
    [leads]
  );

  const statusValueMap = useMemo(() => {
    const map = Object.fromEntries(
      LEAD_STATUSES.map((status) => [status, 0])
    ) as Record<LeadStatusBucket, number>;

    userLeads.forEach((lead) => {
      const statusBucket = getLeadStatusBucket(lead);
      map[statusBucket] += lead.dealValue || 0;
    });

    return map;
  }, [userLeads]);

  const filteredLeads = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return userLeads.filter((lead) => {
      const statusBucket = getLeadStatusBucket(lead);
      if (leadFilter !== "all" && statusBucket !== leadFilter) return false;

      if (!q) return true;
      const fullName = `${lead.firstName} ${lead.lastName}`.toLowerCase();
      return (
        fullName.includes(q) ||
        lead.email.toLowerCase().includes(q) ||
        (lead.company || "").toLowerCase().includes(q)
      );
    });
  }, [leadFilter, searchQuery, userLeads]);

  const filteredProposals = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return userProposals.filter((proposal) => {
      if (proposalFilter !== "all" && proposal.status !== proposalFilter) {
        return false;
      }

      if (!q) return true;
      const leadName = getLeadName(proposal.lead, leadsMap).toLowerCase();
      return (
        leadName.includes(q) ||
        proposal.status.toLowerCase().includes(q) ||
        String(proposal.value ?? "").includes(q)
      );
    });
  }, [leadsMap, proposalFilter, searchQuery, userProposals]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 bg-slate-100 rounded-2xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!user || !userStats) {
    return (
      <div className="space-y-5">
        <Link
          href="/admin/team"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Team
        </Link>
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center">
          <p className="text-lg font-black text-slate-900">User not found</p>
          <p className="text-sm text-slate-500 mt-2">
            The selected sales profile could not be located.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link
          href="/admin/team"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Team
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-lg p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {user.name}
              </h1>
              <p className="text-sm text-slate-500">{user.email}</p>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest ${formatRoleBadgeColor(
                    user.role
                  )}`}
                >
                  {formatRoleLabel(user.role)}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest ${
                    user.isActive
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-rose-100 text-rose-600"
                  }`}
                >
                  {user.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">
              Acceptance Rate
            </p>
            <p className="text-3xl font-black text-indigo-700">
              {userStats.acceptanceRate}%
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mt-7">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Total Leads
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {userStats.totalLeads}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Open Deals
            </p>
            <p className="text-2xl font-black text-blue-700 mt-1">
              {userStats.openDeals}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Won Deals
            </p>
            <p className="text-2xl font-black text-emerald-700 mt-1">
              {userStats.wonDeals}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Pipeline
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1">
              INR {userStats.pipelineValue.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Revenue
            </p>
            <p className="text-2xl font-black text-emerald-700 mt-1">
              INR {userStats.revenue.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-lg p-4 md:p-5">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search leads/proposals by lead name, email, company, value"
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <select
            value={leadFilter}
            onChange={(event) => setLeadFilter(event.target.value as LeadFilter)}
            className="px-4 py-2.5 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
          >
            <option value="all">All Lead Stages</option>
            {LEAD_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <select
            value={proposalFilter}
            onChange={(event) =>
              setProposalFilter(event.target.value as ProposalFilter)
            }
            className="px-4 py-2.5 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
          >
            <option value="all">All Proposal States</option>
            {PROPOSAL_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setSearchQuery("");
              setLeadFilter("all");
              setProposalFilter("all");
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:text-indigo-700 hover:border-indigo-200 hover:bg-indigo-50 transition-colors"
          >
            <Funnel className="w-4 h-4" />
            Reset Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl shadow-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Pipeline Breakdown
            </h2>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[10px] font-extrabold uppercase tracking-[0.2em]">
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-right">Leads</th>
                  <th className="px-6 py-4 text-right">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {LEAD_STATUSES.map((status) => (
                  <tr key={status}>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-extrabold ${formatLeadStatusBadgeColor(
                          status
                        )}`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">
                      {userStats.leadsByStatus[status]}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">
                      INR {statusValueMap[status].toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl shadow-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Target className="w-4 h-4" />
              Proposal Summary
            </h2>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Total Proposals
              </p>
              <p className="text-2xl font-black text-slate-900 mt-1">
                {userStats.totalProposals}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Accepted
              </p>
              <p className="text-2xl font-black text-emerald-700 mt-1">
                {userStats.acceptedProposals}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Proposal Value
              </p>
              <p className="text-2xl font-black text-slate-900 mt-1">
                INR {userStats.proposalValue.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Acceptance Rate
              </p>
              <p className="text-2xl font-black text-indigo-700 mt-1">
                {userStats.acceptanceRate}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl shadow-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100">
            <h2 className="text-sm font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <UserRound className="w-4 h-4" />
              Leads ({filteredLeads.length}/{userLeads.length})
            </h2>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[10px] font-extrabold uppercase tracking-[0.2em]">
                  <th className="px-6 py-4 text-left">Lead</th>
                  <th className="px-6 py-4 text-left">Company</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Deal Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredLeads.map((lead) => {
                  const statusBucket = getLeadStatusBucket(lead);
                  return (
                  <tr key={lead._id}>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">
                        {lead.firstName} {lead.lastName}
                      </p>
                      <p className="text-xs text-slate-500">{lead.email}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium">
                      {lead.company || "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold ${formatLeadStatusBadgeColor(
                          statusBucket
                        )}`}
                      >
                        {statusBucket}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">
                      INR {(lead.dealValue || 0).toLocaleString("en-IN")}
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
          {filteredLeads.length === 0 && (
            <div className="py-10 text-center border-t border-slate-100 text-sm font-medium text-slate-500">
              No leads found for current filters.
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl shadow-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100">
            <h2 className="text-sm font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Proposals ({filteredProposals.length}/{userProposals.length})
            </h2>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[10px] font-extrabold uppercase tracking-[0.2em]">
                  <th className="px-6 py-4 text-left">Lead</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Value</th>
                  <th className="px-6 py-4 text-right">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredProposals.map((proposal) => (
                  <tr key={proposal._id}>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {getLeadName(proposal.lead, leadsMap)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold ${getProposalStatusBadgeColor(
                          proposal.status
                        )}`}
                      >
                        {proposal.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">
                      INR {Number(proposal.value || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-slate-600 font-medium">
                      {new Date(proposal.createdAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredProposals.length === 0 && (
            <div className="py-10 text-center border-t border-slate-100 text-sm font-medium text-slate-500">
              No proposals found for current filters.
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-5">
          <p className="text-xs font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Briefcase className="w-4 h-4" /> Open Deals
          </p>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {userStats.openDeals}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-5">
          <p className="text-xs font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Trophy className="w-4 h-4" /> Won vs Lost
          </p>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {userStats.wonDeals} / {userStats.lostDeals}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-5">
          <p className="text-xs font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            {userStats.acceptedProposals > 0 ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-600" />
            )}
            Accepted Proposals
          </p>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {userStats.acceptedProposals}
          </p>
        </div>
      </div>
    </div>
  );
}

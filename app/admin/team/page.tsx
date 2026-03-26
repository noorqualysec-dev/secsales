"use client";

import { useMemo, useState } from "react";
import {
  Users2,
  TrendingUp,
  Target,
  Trophy,
  XCircle,
  IndianRupee,
  ChevronRight,
  X,
  BarChart2,
  FileText,
  Percent,
  CheckCircle2,
  Eye,
} from "lucide-react";
import { useAdminUsers, useAdminLeads, useAdminProposals } from "@/app/hooks/useAdmin";
import {
  User,
  Lead,
  Proposal,
  LeadStatus,
  UserPerformanceStats,
} from "@/app/types";

// Ordered list of all lead statuses for pipeline breakdown
const LEAD_STATUSES: LeadStatus[] = [
  "Lead Captured",
  "Discovery Call Scheduled",
  "Requirement Gathering",
  "Pre-Assessment Form Sent",
  "Proposal Preparation",
  "Proposal Sent",
  "Negotiation",
  "Won",
  "Lost",
];

// Pure function to compute stats for all users
function computeAllUserStats(
  users: User[],
  leads: Lead[],
  proposals: Proposal[]
): Map<string, UserPerformanceStats> {
  const statsMap = new Map<string, UserPerformanceStats>();

  users.forEach((user) => {
    // Filter leads assigned to this user
    const userLeads = leads.filter((lead) => {
      const assignedId = (lead.assignedTo as User)?._id || lead.assignedTo;
      return assignedId === user._id;
    });

    // Initialize status breakdown
    const leadsByStatus: Record<LeadStatus, number> = {
      "Lead Captured": 0,
      "Discovery Call Scheduled": 0,
      "Requirement Gathering": 0,
      "Pre-Assessment Form Sent": 0,
      "Proposal Preparation": 0,
      "Proposal Sent": 0,
      Negotiation: 0,
      Won: 0,
      Lost: 0,
    };

    // Count leads by status
    let openDeals = 0;
    let wonDeals = 0;
    let lostDeals = 0;
    let pipelineValue = 0;
    let revenue = 0;

    userLeads.forEach((lead) => {
      // Count by status
      leadsByStatus[lead.status]++;

      // Categorize deals
      if (lead.status === "Won") {
        wonDeals++;
        revenue += lead.dealValue || 0;
      } else if (lead.status === "Lost") {
        lostDeals++;
      } else {
        openDeals++;
        pipelineValue += lead.dealValue || 0;
      }
    });

    // Filter proposals created by this user
    const userProposals = proposals.filter((proposal) => {
      const createdById = (proposal.createdBy as User)?._id || proposal.createdBy;
      return createdById === user._id;
    });

    // Proposal aggregations
    const totalProposals = userProposals.length;
    const acceptedProposals = userProposals.filter(
      (p) => p.status === "Accepted"
    ).length;
    const proposalValue = userProposals
      .filter((p) => p.status === "Accepted")
      .reduce((sum, p) => sum + (p.value || 0), 0);
    const acceptanceRate =
      totalProposals > 0
        ? parseFloat(((acceptedProposals / totalProposals) * 100).toFixed(1))
        : 0;

    statsMap.set(user._id, {
      userId: user._id,
      totalLeads: userLeads.length,
      openDeals,
      wonDeals,
      lostDeals,
      leadsByStatus,
      pipelineValue,
      revenue,
      totalProposals,
      acceptedProposals,
      acceptanceRate,
      proposalValue,
    });
  });

  return statsMap;
}

// Get status badge color
function getStatusBadgeColor(status: LeadStatus): string {
  switch (status) {
    case "Won":
      return "bg-emerald-100 text-emerald-700";
    case "Lost":
      return "bg-rose-100 text-rose-600";
    case "Negotiation":
      return "bg-orange-100 text-orange-700";
    case "Proposal Sent":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-indigo-100 text-indigo-700";
  }
}

// Get role badge color
function getRoleBadgeColor(role: string): string {
  switch (role) {
    case "admin":
      return "bg-indigo-100 text-indigo-700";
    case "manager":
      return "bg-violet-100 text-violet-700";
    case "sales_rep":
      return "bg-slate-100 text-slate-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

// Detail Modal Component
interface UserDetailModalProps {
  user: User;
  stats: UserPerformanceStats;
  leads: Lead[];
  proposals: Proposal[];
  onClose: () => void;
}

function UserDetailModal({
  user,
  stats,
  leads,
  proposals,
  onClose,
}: UserDetailModalProps) {
  // Filter leads for this user
  const userLeads = leads.filter((lead) => {
    const assignedId = (lead.assignedTo as User)?._id || lead.assignedTo;
    return assignedId === user._id;
  });

  // Filter proposals for this user
  const userProposals = proposals.filter((proposal) => {
    const createdById = (proposal.createdBy as User)?._id || proposal.createdBy;
    return createdById === user._id;
  });

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] animate-fade-in-up">
        {/* Header */}
        <div className="border-b border-slate-200 p-8 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                {user.name}
              </h2>
              <p className="text-sm text-slate-500 mt-1">{user.email}</p>
              {/* <div className="flex gap-2 mt-3">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest ${getRoleBadgeColor(
                    user.role
                  )}`}
                >
                  {user.role === "sales_rep" ? "Sales Rep" : user.role}
                </span>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest ${
                    user.isActive
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-rose-100 text-rose-600"
                  }`}
                >
                  {user.isActive ? "Active" : "Inactive"}
                </span>
              </div> */}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-slate-100 rounded-xl transition-colors duration-300"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
          {/* Lead Pipeline Breakdown */}
          <div>
            <h3 className="text-sm font-extrabold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <BarChart2 size={16} /> Lead Pipeline Breakdown
            </h3>
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 font-extrabold text-slate-500 text-xs uppercase tracking-widest">
                      Status
                    </th>
                    <th className="px-6 py-4 font-extrabold text-slate-500 text-xs uppercase tracking-widest text-right">
                      Count
                    </th>
                    <th className="px-6 py-4 font-extrabold text-slate-500 text-xs uppercase tracking-widest text-right">
                      Deal Value
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {LEAD_STATUSES.map((status) => {
                    const count = stats.leadsByStatus[status] || 0;
                    if (count === 0) return null;

                    const statusLeads = userLeads.filter(
                      (l) => l.status === status
                    );
                    const totalValue = statusLeads.reduce(
                      (sum, l) => sum + (l.dealValue || 0),
                      0
                    );

                    const isWon = status === "Won";
                    const isLost = status === "Lost";

                    return (
                      <tr
                        key={status}
                        className={`hover:bg-slate-50/80 transition-all duration-300 ${
                          isWon ? "bg-emerald-50/30" : isLost ? "bg-rose-50/30" : ""
                        }`}
                      >
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-extrabold ${getStatusBadgeColor(
                              status
                            )}`}
                          >
                            {status === "Won" && (
                              <Trophy className="w-3.5 h-3.5" />
                            )}
                            {status === "Lost" && (
                              <XCircle className="w-3.5 h-3.5" />
                            )}
                            {status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-slate-900">
                          {count}
                        </td>
                        <td
                          className={`px-6 py-4 text-right font-bold ${
                            totalValue > 0
                              ? isWon
                                ? "text-emerald-600"
                                : "text-slate-900"
                              : "text-slate-400"
                          }`}
                        >
                          {totalValue > 0
                            ? `₹${totalValue.toLocaleString("en-IN")}`
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Proposal Activity */}
          <div>
            <h3 className="text-sm font-extrabold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <FileText size={16} /> Proposal Activity ({userProposals.length})
            </h3>
            {userProposals.length > 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
                <table className="w-full text-left text-sm min-w-[500px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-6 py-4 font-extrabold text-slate-500 text-xs uppercase tracking-widest">
                        Lead
                      </th>
                      <th className="px-6 py-4 font-extrabold text-slate-500 text-xs uppercase tracking-widest text-right">
                        Value
                      </th>
                      <th className="px-6 py-4 font-extrabold text-slate-500 text-xs uppercase tracking-widest text-center">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {userProposals.map((proposal) => {
                      const leadName =
                        typeof proposal.lead === "object"
                          ? `${proposal.lead.firstName} ${proposal.lead.lastName}`
                          : "Unknown Lead";

                      return (
                        <tr
                          key={proposal._id}
                          className="hover:bg-slate-50/80 transition-all duration-300"
                        >
                          <td className="px-6 py-4 text-slate-900 font-medium">
                            {leadName}
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-slate-900">
                            ₹{proposal.value.toLocaleString("en-IN")}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest ${
                                proposal.status === "Accepted"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : proposal.status === "Rejected"
                                    ? "bg-rose-100 text-rose-600"
                                    : proposal.status === "Sent"
                                      ? "bg-amber-100 text-amber-700"
                                      : proposal.status === "In Negotiation"
                                        ? "bg-orange-100 text-orange-700"
                                        : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {proposal.status === "Accepted" && (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              )}
                              {proposal.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-12 text-center">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No proposals created yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Stats Bar */}
        <div className="border-t border-slate-200 p-8 bg-slate-50/50 grid grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
            <p className="text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-2">
              Pipeline
            </p>
            <p className="text-lg font-black text-slate-900">
              ₹{stats.pipelineValue.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
            <p className="text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-2">
              Revenue
            </p>
            <p className="text-lg font-black text-emerald-600">
              ₹{stats.revenue.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
            <p className="text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-2">
              Acceptance %
            </p>
            <p className="text-lg font-black text-slate-900">
              {stats.acceptanceRate}%
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
            <p className="text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-2">
              Proposals
            </p>
            <p className="text-lg font-black text-slate-900">
              {stats.acceptedProposals}/{stats.totalProposals}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Page Component
export default function TeamPerformancePage() {
  const { data: usersData, isLoading: usersLoading } = useAdminUsers();
  const { data: leadsData, isLoading: leadsLoading } = useAdminLeads();
  const { data: proposalData, isLoading: proposalLoading } = useAdminProposals();

  const users = usersData?.data ?? [];
  const leads = leadsData?.data ?? [];
  const proposals = proposalData?.data ?? [];

  const isLoading = usersLoading || leadsLoading || proposalLoading;

  const statsMap = useMemo(
    () => computeAllUserStats(users, leads, proposals),
    [users, leads, proposals]
  );

  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Calculate totals for summary bar
  const totalPipeline = Array.from(statsMap.values()).reduce(
    (sum, s) => sum + s.pipelineValue,
    0
  );
  const totalRevenue = Array.from(statsMap.values()).reduce(
    (sum, s) => sum + s.revenue,
    0
  );

  // Loading state
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

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Reps */}
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 border border-indigo-200 rounded-3xl p-8 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center">
              <Users2 className="text-white w-8 h-8" />
            </div>
            <span className="text-3xl font-black text-indigo-600">
              {users.length}
            </span>
          </div>
          <p className="text-sm font-extrabold text-indigo-700 uppercase tracking-widest">
            Active Reps
          </p>
        </div>

        {/* Total Pipeline */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-3xl p-8 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center">
              <TrendingUp className="text-white w-8 h-8" />
            </div>
            <span className="text-3xl font-black text-blue-600">
              ₹{(totalPipeline / 1000000).toFixed(1)}M
            </span>
          </div>
          <p className="text-sm font-extrabold text-blue-700 uppercase tracking-widest">
            Pipeline Value
          </p>
        </div>

        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-3xl p-8 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center">
              <Trophy className="text-white w-8 h-8" />
            </div>
            <span className="text-3xl font-black text-emerald-600">
              ₹{(totalRevenue / 1000000).toFixed(1)}M
            </span>
          </div>
          <p className="text-sm font-extrabold text-emerald-700 uppercase tracking-widest">
            Total Revenue
          </p>
        </div>
      </div>

      {/* Main Table */}
      <div>
        <h2 className="text-sm font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-4">
          <Users2 size={16} /> Platform Directory{" "}
          <span className="bg-slate-100 px-2 py-0.5 rounded-full text-[10px]">
            {users.length} Reps
          </span>
        </h2>
        <div className="bg-white border border-slate-200 rounded-3xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[10px] font-extrabold uppercase tracking-[0.2em]">
                  <th className="px-8 py-5">User</th>
                  <th className="px-8 py-5 text-center">Role</th>
                  <th className="px-8 py-5 text-center">Status</th>
                  <th className="px-8 py-5 text-right">Open Deals</th>
                  <th className="px-8 py-5 text-right">Won</th>
                  <th className="px-8 py-5 text-right">Lost</th>
                  <th className="px-8 py-5 text-right">Pipeline</th>
                  <th className="px-8 py-5 text-right">Revenue</th>
                  <th className="px-8 py-5 text-right">Accept %</th>
                  <th className="px-8 py-5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((user) => {
                  const stats = statsMap.get(user._id) || {
                    userId: user._id,
                    totalLeads: 0,
                    openDeals: 0,
                    wonDeals: 0,
                    lostDeals: 0,
                    leadsByStatus: {},
                    pipelineValue: 0,
                    revenue: 0,
                    totalProposals: 0,
                    acceptedProposals: 0,
                    acceptanceRate: 0,
                    proposalValue: 0,
                  };

                  return (
                    <tr
                      key={user._id}
                      className="hover:bg-slate-50/80 transition-all duration-300 group"
                    >
                      {/* User Info */}
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">
                              {user.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-8 py-5 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest ${getRoleBadgeColor(
                            user.role
                          )}`}
                        >
                          {user.role === "sales_rep" ? "Sales Rep" : user.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-8 py-5 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest ${
                            user.isActive
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-rose-100 text-rose-600"
                          }`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Open Deals */}
                      <td className="px-8 py-5 text-right font-bold text-slate-900">
                        {stats.openDeals}
                      </td>

                      {/* Won */}
                      <td className="px-8 py-5 text-right font-bold text-emerald-600">
                        {stats.wonDeals}
                      </td>

                      {/* Lost */}
                      <td className="px-8 py-5 text-right font-bold text-rose-500">
                        {stats.lostDeals}
                      </td>

                      {/* Pipeline Value */}
                      <td className="px-8 py-5 text-right font-bold text-slate-900">
                        ₹{stats.pipelineValue.toLocaleString("en-IN")}
                      </td>

                      {/* Revenue */}
                      <td className="px-8 py-5 text-right font-bold text-emerald-600">
                        ₹{stats.revenue.toLocaleString("en-IN")}
                      </td>

                      {/* Acceptance Rate */}
                      <td className="px-8 py-5 text-right font-bold text-slate-900">
                        {stats.acceptanceRate}%
                      </td>

                      {/* Action */}
                      <td className="px-8 py-5 text-center">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:border-indigo-400 hover:text-indigo-600 transition-all duration-300 inline-flex items-center justify-center group-hover:scale-110"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          stats={statsMap.get(selectedUser._id)!}
          leads={leads}
          proposals={proposals}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}

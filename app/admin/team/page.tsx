"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Activity,
  Eye,
  FilterX,
  Search,
  TrendingUp,
  Trophy,
  Users2,
} from "lucide-react";
import {
  useAdminLeads,
  useAdminProposals,
  useAdminUsers,
} from "@/app/hooks/useAdmin";
import type { Lead, LeadStatusBucket, Proposal, User } from "@/app/types";
import {
  computeAllUserStats,
  createEmptyStats,
  formatRoleBadgeColor,
  formatRoleLabel,
  LEAD_STATUSES,
} from "./performance";

type RoleFilter = "all" | User["role"];
type ActiveFilter = "all" | "active" | "inactive";
type StageFilter = "all" | LeadStatusBucket;

const EMPTY_USERS: User[] = [];
const EMPTY_LEADS: Lead[] = [];
const EMPTY_PROPOSALS: Proposal[] = [];

export default function TeamPerformancePage() {
  const { data: usersData, isLoading: usersLoading } = useAdminUsers();
  const { data: leadsData, isLoading: leadsLoading } = useAdminLeads();
  const { data: proposalData, isLoading: proposalLoading } = useAdminProposals();

  const users = usersData?.data ?? EMPTY_USERS;
  const leads = leadsData?.data ?? EMPTY_LEADS;
  const proposals = proposalData?.data ?? EMPTY_PROPOSALS;

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");
  const [stageFilter, setStageFilter] = useState<StageFilter>("all");

  const isLoading = usersLoading || leadsLoading || proposalLoading;

  const statsMap = useMemo(
    () => computeAllUserStats(users, leads, proposals),
    [users, leads, proposals]
  );

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return users.filter((user) => {
      const stats = statsMap.get(user._id) ?? createEmptyStats(user._id);

      if (roleFilter !== "all" && user.role !== roleFilter) return false;
      if (activeFilter === "active" && !user.isActive) return false;
      if (activeFilter === "inactive" && user.isActive) return false;
      if (stageFilter !== "all" && stats.leadsByStatus[stageFilter] === 0) {
        return false;
      }

      if (!q) return true;
      return (
        user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q)
      );
    });
  }, [activeFilter, roleFilter, searchQuery, stageFilter, statsMap, users]);

  const filteredStats = useMemo(
    () =>
      filteredUsers.map((user) => statsMap.get(user._id) ?? createEmptyStats(user._id)),
    [filteredUsers, statsMap]
  );

  const totalPipeline = filteredStats.reduce(
    (sum, stats) => sum + stats.pipelineValue,
    0
  );
  const totalRevenue = filteredStats.reduce((sum, stats) => sum + stats.revenue, 0);

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 border border-indigo-200 rounded-3xl p-8 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center">
              <Users2 className="text-white w-8 h-8" />
            </div>
            <span className="text-3xl font-black text-indigo-600">
              {filteredUsers.length}
            </span>
          </div>
          <p className="text-sm font-extrabold text-indigo-700 uppercase tracking-widest">
            Visible Team Members
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-3xl p-8 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center">
              <TrendingUp className="text-white w-8 h-8" />
            </div>
            <span className="text-3xl font-black text-blue-600">
              INR {(totalPipeline / 1000000).toFixed(1)}M
            </span>
          </div>
          <p className="text-sm font-extrabold text-blue-700 uppercase tracking-widest">
            Pipeline Value
          </p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-3xl p-8 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center">
              <Trophy className="text-white w-8 h-8" />
            </div>
            <span className="text-3xl font-black text-emerald-600">
              INR {(totalRevenue / 1000000).toFixed(1)}M
            </span>
          </div>
          <p className="text-sm font-extrabold text-emerald-700 uppercase tracking-widest">
            Total Revenue
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-lg p-4 md:p-5">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by name or email"
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value as RoleFilter)}
            className="px-4 py-2.5 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
          >
            <option value="all">All Roles</option>
            <option value="sales_rep">Sales Rep</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>

          <select
            value={activeFilter}
            onChange={(event) => setActiveFilter(event.target.value as ActiveFilter)}
            className="px-4 py-2.5 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={stageFilter}
            onChange={(event) => setStageFilter(event.target.value as StageFilter)}
            className="px-4 py-2.5 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
          >
            <option value="all">All Stages</option>
            {LEAD_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setSearchQuery("");
              setRoleFilter("all");
              setActiveFilter("all");
              setStageFilter("all");
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors"
          >
            <FilterX className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-4">
          <Activity size={16} /> Team Performance Directory
          <span className="bg-slate-100 px-2 py-0.5 rounded-full text-[10px]">
            {filteredUsers.length} of {users.length}
          </span>
        </h2>

        <div className="bg-white border border-slate-200 rounded-3xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[1250px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[10px] font-extrabold uppercase tracking-[0.2em]">
                  <th className="px-8 py-5">User</th>
                  <th className="px-8 py-5 text-center">Role</th>
                  <th className="px-8 py-5 text-center">Status</th>
                  <th className="px-8 py-5 text-right">Total Leads</th>
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
                {filteredUsers.map((user) => {
                  const stats = statsMap.get(user._id) ?? createEmptyStats(user._id);

                  return (
                    <tr
                      key={user._id}
                      className="hover:bg-slate-50/80 transition-all duration-300 group"
                    >
                      <td className="px-8 py-5">
                        <Link
                          href={`/admin/team/${user._id}`}
                          className="flex items-center gap-3"
                        >
                          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm group-hover:text-indigo-700">
                              {user.name}
                            </p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                          </div>
                        </Link>
                      </td>

                      <td className="px-8 py-5 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest ${formatRoleBadgeColor(
                            user.role
                          )}`}
                        >
                          {formatRoleLabel(user.role)}
                        </span>
                      </td>

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

                      <td className="px-8 py-5 text-right font-bold text-slate-900">
                        {stats.totalLeads}
                      </td>
                      <td className="px-8 py-5 text-right font-bold text-slate-900">
                        {stats.openDeals}
                      </td>
                      <td className="px-8 py-5 text-right font-bold text-emerald-600">
                        {stats.wonDeals}
                      </td>
                      <td className="px-8 py-5 text-right font-bold text-rose-500">
                        {stats.lostDeals}
                      </td>
                      <td className="px-8 py-5 text-right font-bold text-slate-900">
                        INR {stats.pipelineValue.toLocaleString("en-IN")}
                      </td>
                      <td className="px-8 py-5 text-right font-bold text-emerald-600">
                        INR {stats.revenue.toLocaleString("en-IN")}
                      </td>
                      <td className="px-8 py-5 text-right font-bold text-slate-900">
                        {stats.acceptanceRate}%
                      </td>

                      <td className="px-8 py-5 text-center">
                        <Link
                          href={`/admin/team/${user._id}`}
                          className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:border-indigo-400 hover:text-indigo-600 transition-all duration-300 inline-flex items-center justify-center group-hover:scale-110"
                          title="Open performance profile"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="py-16 text-center border-t border-slate-100">
              <p className="text-sm font-bold text-slate-500">
                No team members match the selected filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

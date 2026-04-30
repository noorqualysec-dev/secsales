import type {
  Lead,
  LeadStatusBucket,
  Proposal,
  ProposalStatus,
  User,
  UserPerformanceStats,
} from "@/app/types";
import { PIPELINE_LEAD_STATUSES, getLeadOutcome, getLeadStage } from "@/app/lib/leadStatus";

export const LEAD_STATUSES: LeadStatusBucket[] = [
  ...PIPELINE_LEAD_STATUSES,
  "Won",
  "Lost",
];

export const PROPOSAL_STATUSES: ProposalStatus[] = [
  "Draft",
  "Sent",
  "In Negotiation",
  "Accepted",
  "Rejected",
];

export function resolveUserId(value: User | string | undefined): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value._id;
}

export function getUserLeads(userId: string, leads: Lead[]): Lead[] {
  return leads.filter((lead) => resolveUserId(lead.assignedTo) === userId);
}

export function getUserProposals(userId: string, proposals: Proposal[]): Proposal[] {
  return proposals.filter(
    (proposal) => resolveUserId(proposal.createdBy) === userId
  );
}

export function getLeadStatusBucket(lead: Lead): LeadStatusBucket {
  const outcome = getLeadOutcome(lead);
  if (outcome === "won") return "Won";
  if (outcome === "lost") return "Lost";
  return getLeadStage(lead);
}

export function createEmptyStats(userId: string): UserPerformanceStats {
  const leadsByStatus = Object.fromEntries(
    LEAD_STATUSES.map((status) => [status, 0])
  ) as UserPerformanceStats["leadsByStatus"];

  return {
    userId,
    totalLeads: 0,
    openDeals: 0,
    wonDeals: 0,
    lostDeals: 0,
    leadsByStatus,
    pipelineValue: 0,
    revenue: 0,
    totalProposals: 0,
    acceptedProposals: 0,
    acceptanceRate: 0,
    proposalValue: 0,
  };
}

export function computeAllUserStats(
  users: User[],
  leads: Lead[],
  proposals: Proposal[]
): Map<string, UserPerformanceStats> {
  const statsMap = new Map<string, UserPerformanceStats>();

  users.forEach((user) => {
    const stats = createEmptyStats(user._id);
    const userLeads = getUserLeads(user._id, leads);
    const userProposals = getUserProposals(user._id, proposals);

    userLeads.forEach((lead) => {
      const statusBucket = getLeadStatusBucket(lead);
      const outcome = getLeadOutcome(lead);
      stats.leadsByStatus[statusBucket] += 1;

      if (outcome === "won") {
        stats.wonDeals += 1;
        stats.revenue += lead.dealValue || 0;
      } else if (outcome === "lost") {
        stats.lostDeals += 1;
      } else {
        stats.openDeals += 1;
        stats.pipelineValue += lead.dealValue || 0;
      }
    });

    stats.totalLeads = userLeads.length;

    stats.totalProposals = userProposals.length;
    stats.acceptedProposals = userProposals.filter(
      (proposal) => proposal.status === "Accepted"
    ).length;
    stats.proposalValue = userProposals
      .filter((proposal) => proposal.status === "Accepted")
      .reduce((sum, proposal) => sum + (proposal.value || 0), 0);
    stats.acceptanceRate =
      stats.totalProposals > 0
        ? parseFloat(
            ((stats.acceptedProposals / stats.totalProposals) * 100).toFixed(1)
          )
        : 0;

    statsMap.set(user._id, stats);
  });

  return statsMap;
}

export function formatRoleLabel(role: User["role"]): string {
  if (role === "sales_rep") return "Sales Rep";
  if (role === "manager") return "Manager";
  return "Admin";
}

export function formatRoleBadgeColor(role: User["role"]): string {
  if (role === "admin") return "bg-indigo-100 text-indigo-700";
  if (role === "manager") return "bg-violet-100 text-violet-700";
  return "bg-slate-100 text-slate-700";
}

export function formatLeadStatusBadgeColor(status: LeadStatusBucket): string {
  if (status === "Won") return "bg-emerald-100 text-emerald-700";
  if (status === "Lost") return "bg-rose-100 text-rose-600";
  if (status === "Negotiation") return "bg-orange-100 text-orange-700";
  if (status === "Proposal Sent") return "bg-amber-100 text-amber-700";
  return "bg-indigo-100 text-indigo-700";
}


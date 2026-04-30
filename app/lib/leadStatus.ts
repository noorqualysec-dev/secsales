import type { Lead, LeadOutcome } from "@/app/types";

export const PIPELINE_LEAD_STATUSES = [
  "Lead Captured",
  "Discovery Call Scheduled",
  "Requirement Gathering",
  "Proposal Sent",
  "Negotiation",
] as const;

export type PipelineLeadStatus = (typeof PIPELINE_LEAD_STATUSES)[number];
export type LeadBoardColumn = PipelineLeadStatus | "Won" | "Lost";

type LegacyPipelineLeadStatus = "Pre-Assessment Form Sent" | "Proposal Preparation";

const LEGACY_STATUS_TO_PIPELINE_STATUS: Record<LegacyPipelineLeadStatus, PipelineLeadStatus> = {
  "Pre-Assessment Form Sent": "Requirement Gathering",
  "Proposal Preparation": "Proposal Sent",
};

const PIPELINE_STATUS_SET = new Set<string>(PIPELINE_LEAD_STATUSES);

export function normalizePipelineLeadStatus(statusRaw: unknown): PipelineLeadStatus {
  const status = String(statusRaw ?? "").trim();
  if (!status) return "Lead Captured";
  if (status in LEGACY_STATUS_TO_PIPELINE_STATUS) {
    return LEGACY_STATUS_TO_PIPELINE_STATUS[status as LegacyPipelineLeadStatus];
  }
  if (PIPELINE_STATUS_SET.has(status)) {
    return status as PipelineLeadStatus;
  }
  return "Lead Captured";
}

export function getLeadOutcome(
  lead: Pick<Lead, "status" | "outcome">
): LeadOutcome {
  if (lead.outcome === "won" || lead.outcome === "lost" || lead.outcome === "cancelled") {
    return lead.outcome;
  }
  if (lead.status === "Won") return "won";
  if (lead.status === "Lost") return "lost";
  return "open";
}

export function getLeadStage(
  lead: Pick<Lead, "status" | "lostAtStatus" | "wonAtStatus">
): PipelineLeadStatus {
  if (lead.status !== "Won" && lead.status !== "Lost") {
    return normalizePipelineLeadStatus(lead.status);
  }
  return normalizePipelineLeadStatus(lead.lostAtStatus || lead.wonAtStatus);
}

export function getLeadBoardColumn(
  lead: Pick<Lead, "status" | "outcome" | "lostAtStatus" | "wonAtStatus">
): LeadBoardColumn {
  const outcome = getLeadOutcome(lead);
  if (outcome === "won") return "Won";
  if (outcome === "lost") return "Lost";
  return getLeadStage(lead);
}

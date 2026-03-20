// TypeScript interfaces matching backend MongoDB models exactly

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "ADMIN" | "user" | "sales";
}

export type LeadStatus =
  | "Lead Captured"
  | "Discovery Call Scheduled"
  | "Requirement Gathering"
  | "Pre-Assessment Form Sent"
  | "Proposal Preparation"
  | "Proposal Sent"
  | "Negotiation"
  | "Won"
  | "Lost";

export type LeadSource =
  | "website"
  | "email_marketing"
  | "linkedin"
  | "referral"
  | "events"
  | "recurring"
  | "partnership"
  | "offline_source"
  | "other";

export interface Lead {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  country?: string;
  industry?: string;
  status: LeadStatus;
  source: LeadSource;
  assignedTo?: User | string;
  createdAt: string;
  updatedAt: string;
}

export type ProposalStatus = "Draft" | "Sent" | "In Negotiation" | "Accepted" | "Rejected";

export interface Proposal {
  _id: string;
  lead: Lead | string;
  createdBy: User | string;
  value: number;
  testingScope: string[];
  status: ProposalStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// API response shape from backend
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  message?: string;
}

// TypeScript interfaces matching backend MongoDB models exactly

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "sales_rep" | "manager";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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

export interface TimelineEvent {
  event: string;
  status?: string;
  remark?: string;
  performedBy: User | string;
  timestamp: string;
}

export interface LeadContact {
  id: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  phone?: string;
  phoneCountryCode?: string;
  designation?: string;
  department?: string;
  isPrimary?: boolean;
  isDecisionMaker?: boolean;
  isInfluencer?: boolean;
  isTechnicalContact?: boolean;
  isBillingContact?: boolean;
  linkedinUrl?: string;
  notes?: string;
  source?: string;
  addedAt: number;
  updatedAt: number;
  addedBy: string;
  lastContactedAt?: number;
  nextFollowUpAt?: number;
  contactStatus?: "active" | "inactive" | "unresponsive" | "left_company";
  preferredChannel?: "email" | "phone" | "whatsapp" | "linkedin";
  employmentStage?: "current" | "joining_soon" | "newly_joined";
  joinedOn?: number;
}

export interface CompanyInsights {
  hiringSignal?: string;
  recentTrigger?: string;
  nextOpportunity?: string;
  accountNotes?: string;
}

export interface Lead {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  designation?: string;
  employeeStrength?: string;
  phone?: string;
  phoneCountryCode?: string;
  company?: string;
  country?: string;
  industry?: string;
  status: LeadStatus;
  latestRemark?: string;
  source: LeadSource;
  assignedTo?: User | string;
  createdBy: User | string;
  timeline: TimelineEvent[];
  closingDate?: number;
  dealValue?: number;
  createdAt: string;
  updatedAt: string;
  contacts?: LeadContact[];
  companyInsights?: CompanyInsights;
}

export interface CompanySummary {
  key: string;
  name: string;
  industry?: string;
  country?: string;
  employeeStrength?: string;
  leadCount: number;
  memberCount: number;
  openOpportunities: number;
  lastUpdatedAt: number;
  owners: Array<{ _id: string; name: string }>;
}

export interface CompanyMember {
  contactId: string;
  leadId: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  designation?: string;
  department?: string;
  phone?: string;
  phoneCountryCode?: string;
  status?: string;
  source?: string;
  type: "lead" | "contact";
  preferredChannel?: string;
  employmentStage?: string;
  joinedOn?: number;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface CompanyDetails {
  key: string;
  name: string;
  industry?: string;
  country?: string;
  employeeStrength?: string;
  companyInsights?: CompanyInsights;
  leads: Lead[];
  members: CompanyMember[];
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

export type TaskStatus =
  | "Pending"
  | "In Progress"
  | "Completed"
  | "Waiting on someone"
  | "Deferred";

export type TaskPriority = "Low" | "Medium" | "High";

export type TaskSource = "self" | "admin" | "system";

export interface Task {
  id: string;
  subject: string;
  description?: string;
  dueDate: number;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: string;
  assignedBy?: string;
  createdBy: string;
  source: TaskSource;
  isRead?: boolean;
  leadId?: string | null;
  leadName?: string;
  company?: string;
  assignedToName?: string;
  assignedByName?: string;
  createdByName?: string;
  completedAt?: number | null;
  completedBy?: string | null;
  completionRemark?: string | null;
  createdAt: number;
  updatedAt: number;
}

// API response shape from backend
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  message?: string;
}

export interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  leadId?: string;
  read: boolean;
  createdAt: number;
  readAt?: number | null;
}

export interface NotificationsResponse {
  success: boolean;
  count: number;
  unreadCount: number;
  data: Notification[];
  message?: string;
}

// Per-user aggregated performance stats (computed client-side)
export interface UserPerformanceStats {
  userId: string;
  totalLeads: number;
  openDeals: number;       // non-Won/Lost
  wonDeals: number;
  lostDeals: number;
  leadsByStatus: Record<LeadStatus, number>;
  pipelineValue: number;   // sum of dealValue on open leads
  revenue: number;         // sum of dealValue on Won leads
  totalProposals: number;
  acceptedProposals: number;
  acceptanceRate: number;  // 0-100
  proposalValue: number;   // sum of value on Accepted proposals
}

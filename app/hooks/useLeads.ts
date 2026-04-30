import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/app/services/api";
import type { Lead, ApiResponse, CompanySummary, CompanyDetails, LeadContact, User } from "@/app/types";

export type LeadPayload = Omit<Partial<Lead>, "contacts"> & {
  contacts?: Array<Partial<LeadContact>>;
};

type LeadJourneyData = {
  lead: Lead;
  assignedUser: Pick<User, "_id" | "name" | "email" | "role"> | null;
  proposals: Array<{
    _id: string;
    value: number;
    status: string;
    createdAt: number;
  }>;
};

const LEADS_KEY = ["leads"];
const COMPANIES_KEY = [...LEADS_KEY, "companies"];
const PROPOSALS_KEY = ["proposals"];
const ADMIN_PROPOSALS_KEY = ["admin", "proposals"];

export function useLeads(options: { enabled?: boolean } = {}) {
  return useQuery<ApiResponse<Lead[]>>({
    queryKey: LEADS_KEY,
    queryFn: async () => {
      const res = await api.get<ApiResponse<Lead[]>>("/leads");
      return res.data;
    },
    enabled: options.enabled ?? true,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useCreateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: LeadPayload) => api.post("/leads", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LEADS_KEY });
      qc.invalidateQueries({ queryKey: COMPANIES_KEY });
      qc.invalidateQueries({ queryKey: PROPOSALS_KEY });
      qc.invalidateQueries({ queryKey: ADMIN_PROPOSALS_KEY });
    },
  });
}

export function useUpdateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: LeadPayload }) =>
      api.put(`/leads/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LEADS_KEY });
      qc.invalidateQueries({ queryKey: COMPANIES_KEY });
      qc.invalidateQueries({ queryKey: PROPOSALS_KEY });
      qc.invalidateQueries({ queryKey: ADMIN_PROPOSALS_KEY });
    },
  });
}

export function useDeleteLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/leads/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LEADS_KEY });
      qc.invalidateQueries({ queryKey: COMPANIES_KEY });
    },
  });
}

export function useBulkImportLeads() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file, file.name);
      return api.post("/lead-import/excel", formData);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LEADS_KEY });
      qc.invalidateQueries({ queryKey: COMPANIES_KEY });
      qc.refetchQueries({ queryKey: LEADS_KEY, type: "active" });
      qc.refetchQueries({ queryKey: COMPANIES_KEY, type: "active" });
    },
  });
}

export function useLeadJourney(id: string) {
  return useQuery<ApiResponse<LeadJourneyData>>({
    queryKey: [...LEADS_KEY, id, "journey"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<LeadJourneyData>>(`/leads/${id}/journey`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCompanies(options: { globalScope?: boolean } = {}) {
  const globalScope = options.globalScope ?? false;

  return useQuery<ApiResponse<CompanySummary[]>>({
    queryKey: [...COMPANIES_KEY, globalScope ? "global" : "scoped"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<CompanySummary[]>>("/leads/companies", {
        params: globalScope ? { scope: "all" } : undefined,
      });
      return res.data;
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useCompanyDetails(companyKey: string, options: { globalScope?: boolean } = {}) {
  const globalScope = options.globalScope ?? false;

  return useQuery<ApiResponse<CompanyDetails>>({
    queryKey: [...COMPANIES_KEY, globalScope ? "global" : "scoped", companyKey],
    queryFn: async () => {
      const res = await api.get<ApiResponse<CompanyDetails>>(`/leads/companies/${companyKey}`, {
        params: globalScope ? { scope: "all" } : undefined,
      });
      return res.data;
    },
    enabled: !!companyKey,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

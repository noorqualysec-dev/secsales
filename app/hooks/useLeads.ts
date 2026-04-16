import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/app/services/api";
import type { Lead, ApiResponse, CompanySummary, CompanyDetails, LeadContact } from "@/app/types";

export type LeadPayload = Omit<Partial<Lead>, "contacts"> & {
  contacts?: Array<Partial<LeadContact>>;
};

const LEADS_KEY = ["leads"];
const COMPANIES_KEY = [...LEADS_KEY, "companies"];

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
    mutationFn: (leads: any[]) => api.post("/leads/bulk", { leads }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LEADS_KEY });
      qc.invalidateQueries({ queryKey: COMPANIES_KEY });
    },
  });
}

export function useLeadJourney(id: string) {
  return useQuery<ApiResponse<{ lead: Lead; assignedUser: any; proposals: any[] }>>({
    queryKey: [...LEADS_KEY, id, "journey"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<{ lead: Lead; assignedUser: any; proposals: any[] }>>(`/leads/${id}/journey`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCompanies() {
  return useQuery<ApiResponse<CompanySummary[]>>({
    queryKey: COMPANIES_KEY,
    queryFn: async () => {
      const res = await api.get<ApiResponse<CompanySummary[]>>("/leads/companies");
      return res.data;
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useCompanyDetails(companyKey: string) {
  return useQuery<ApiResponse<CompanyDetails>>({
    queryKey: [...COMPANIES_KEY, companyKey],
    queryFn: async () => {
      const res = await api.get<ApiResponse<CompanyDetails>>(`/leads/companies/${companyKey}`);
      return res.data;
    },
    enabled: !!companyKey,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

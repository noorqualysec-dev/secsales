import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/app/services/api";
import type { Lead, ApiResponse } from "@/app/types";

const LEADS_KEY = ["leads"];

export function useLeads() {
  return useQuery<ApiResponse<Lead[]>>({
    queryKey: LEADS_KEY,
    queryFn: async () => {
      const res = await api.get<ApiResponse<Lead[]>>("/leads");
      return res.data;
    },
  });
}

export function useCreateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Lead>) => api.post("/leads", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: LEADS_KEY }),
  });
}

export function useUpdateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Lead> }) =>
      api.put(`/leads/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: LEADS_KEY }),
  });
}

export function useDeleteLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/leads/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: LEADS_KEY }),
  });
}

export function useBulkImportLeads() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (leads: any[]) => api.post("/leads/bulk", { leads }),
    onSuccess: () => qc.invalidateQueries({ queryKey: LEADS_KEY }),
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

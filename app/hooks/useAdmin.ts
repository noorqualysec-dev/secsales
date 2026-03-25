import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/app/services/api";
import type { User, Lead, Proposal, ApiResponse } from "@/app/types";

const ADMIN_USERS_KEY = ["admin", "users"];
const ADMIN_LEADS_KEY = ["admin", "leads"];
const ADMIN_STATS_KEY = ["admin", "stats"];
const ADMIN_PROPOSALS_KEY = ["admin", "proposals"];

export function useAdminUsers() {
  return useQuery<ApiResponse<User[]>>({
    queryKey: ADMIN_USERS_KEY,
    queryFn: async () => {
      const res = await api.get<ApiResponse<User[]>>("/admin/users");
      return res.data;
    },
  });
}

export function useAdminLeads(status?: string) {
  return useQuery<ApiResponse<Lead[]>>({
    queryKey: status ? [...ADMIN_LEADS_KEY, status] : ADMIN_LEADS_KEY,
    queryFn: async () => {
      const url = status ? `/admin/leads?status=${status}` : "/admin/leads";
      const res = await api.get<ApiResponse<Lead[]>>(url);
      return res.data;
    },
  });
}

export function useAdminStats() {
    return useQuery<ApiResponse<Record<string, number>>>({
      queryKey: ADMIN_STATS_KEY,
      queryFn: async () => {
        const res = await api.get<ApiResponse<Record<string, number>>>("/admin/lead-stats");
        return res.data;
      },
    });
}

export function useAdminLeadJourney(id: string) {
    return useQuery<ApiResponse<{ lead: Lead; assignedUser: User; proposals: any[] }>>({
      queryKey: ["admin", "lead", id],
      queryFn: async () => {
        const res = await api.get<ApiResponse<{ lead: Lead; assignedUser: User; proposals: any[] }>>(`/admin/lead/${id}`);
        return res.data;
      },
      enabled: !!id,
    });
}

export function useAdminProposals() {
  return useQuery<ApiResponse<Proposal[]>>({
    queryKey: ADMIN_PROPOSALS_KEY,
    queryFn: async () => {
      const res = await api.get<ApiResponse<Proposal[]>>("/admin/proposals");
      return res.data;
    },
  });
}

// ── Mutations ───────────────────────────────────────────────────────────────

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      api.put(`/admin/users/${userId}/role`, { role }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_USERS_KEY }),
  });
}

export function useToggleUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => api.put(`/admin/users/${userId}/status`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_USERS_KEY }),
  });
}

export function useAssignLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ leadId, userId }: { leadId: string; userId: string }) =>
      api.put(`/admin/leads/${leadId}/assign`, { assignedTo: userId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_LEADS_KEY }),
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/app/services/api";
import type { User, Lead, Proposal, ApiResponse } from "@/app/types";

const ADMIN_USERS_KEY = ["admin", "users"];
const ADMIN_LEADS_KEY = ["admin", "leads"];
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

export function useAdminLeads() {
  return useQuery<ApiResponse<Lead[]>>({
    queryKey: ADMIN_LEADS_KEY,
    queryFn: async () => {
      const res = await api.get<ApiResponse<Lead[]>>("/admin/leads");
      return res.data;
    },
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

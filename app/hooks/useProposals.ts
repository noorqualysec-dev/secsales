import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/app/services/api";
import type { Proposal, ApiResponse } from "@/app/types";

const PROPOSALS_KEY = ["proposals"];

export function useProposals() {
  return useQuery<ApiResponse<Proposal[]>>({
    queryKey: PROPOSALS_KEY,
    queryFn: async () => {
      const res = await api.get<ApiResponse<Proposal[]>>("/proposals");
      return res.data;
    },
  });
}

export function useCreateProposal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Proposal>) => api.post("/proposals", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PROPOSALS_KEY });
      qc.invalidateQueries({ queryKey: ["leads"] }); // lead status may change
    },
  });
}

export function useUpdateProposal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Proposal> }) =>
      api.put(`/proposals/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PROPOSALS_KEY });
      qc.invalidateQueries({ queryKey: ["leads"] }); // cascading status update
    },
  });
}

export function useDeleteProposal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/proposals/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: PROPOSALS_KEY }),
  });
}

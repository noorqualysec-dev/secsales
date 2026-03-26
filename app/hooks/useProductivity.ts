import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { ApiResponse } from "../types";

export interface SalesSummary {
    openDeals: number;
    untouchedDeals: number;
    callsToday: number;
    totalMyLeads: number;
    openTasks: any[];
    meetings: any[];
    todaysLeads: any[];
    dealsClosingThisMonth: any[];
}

export function useSalesSummary(filters: { startDate?: number; endDate?: number } = {}) {
    return useQuery<ApiResponse<SalesSummary>>({
        queryKey: ["productivity", "summary", filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters.startDate) params.append("startDate", filters.startDate.toString());
            if (filters.endDate) params.append("endDate", filters.endDate.toString());
            
            const res = await api.get<ApiResponse<SalesSummary>>(`/productivity/summary?${params.toString()}`);
            return res.data;
        }
    });
}

export function useScheduleMeeting() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { leadId: string; title: string; from: number; to: number }) => 
            api.post("/productivity/meetings", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["productivity", "summary"] });
            queryClient.invalidateQueries({ queryKey: ["leads"] });
        }
    });
}

export function useCreateTask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { leadId?: string; subject: string; dueDate: number; priority: string }) => 
            api.post("/productivity/tasks", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["productivity", "summary"] });
            queryClient.invalidateQueries({ queryKey: ["leads"] });
        }
    });
}

export function useUpdateTask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => 
            api.patch(`/productivity/tasks/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["productivity", "summary"] });
        }
    });
}

export function useUpdateMeeting() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            api.patch(`/productivity/meetings/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["productivity", "summary"] });
        }
    });
}

export function useDeleteTask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) =>
            api.delete(`/productivity/tasks/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["productivity", "summary"] });
        }
    });
}

export function useDeleteMeeting() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) =>
            api.delete(`/productivity/meetings/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["productivity", "summary"] });
        }
    });
}

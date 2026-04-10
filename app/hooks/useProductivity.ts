import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { ApiResponse, Task, TaskPriority, TaskStatus } from "../types";

export interface SalesSummary {
    openDeals: number;
    untouchedDeals: number;
    callsToday: number;
    totalMyLeads: number;
    allTasks: Task[];
    openTasks: Task[];
    meetings: any[];
    todaysLeads: any[];
    dealsClosingThisMonth: any[];
}

let productivityTasksEndpointAvailable: boolean | null = null;

export interface ScheduleMeetingPayload {
    leadId: string;
    subject?: string;
    title?: string;
    startTime?: number;
    endTime?: number;
    from?: number;
    to?: number;
    description?: string;
    agenda?: string;
    location?: string;
    meetingMode?: "google_meet" | "zoom" | "phone" | "in_person" | "other";
    attendees?: { email: string; name?: string; type?: "sales_rep" | "lead" | "external" }[];
    status?: "Scheduled" | "Completed" | "Cancelled";
}

export interface TaskFilters {
    status?: TaskStatus | "";
    priority?: TaskPriority | "";
    leadId?: string;
    assignedTo?: string;
    search?: string;
}

export interface TaskPayload {
    leadId?: string | null;
    subject: string;
    description?: string;
    dueDate: number;
    priority: TaskPriority;
    status?: TaskStatus;
    assignedTo?: string;
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
        },
        staleTime: 30_000,
        refetchOnWindowFocus: false,
    });
}

export function useTasks(filters: TaskFilters = {}) {
    return useQuery<ApiResponse<Task[]>>({
        queryKey: ["productivity", "tasks", filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters.status) params.append("status", filters.status);
            if (filters.priority) params.append("priority", filters.priority);
            if (filters.leadId) params.append("leadId", filters.leadId);
            if (filters.assignedTo) params.append("assignedTo", filters.assignedTo);
            if (filters.search) params.append("search", filters.search);

            const query = params.toString();
            const getSummaryTasks = async () => {
                const summaryRes = await api.get<ApiResponse<SalesSummary>>("/productivity/summary");
                const summaryTasks = summaryRes.data.data.allTasks || summaryRes.data.data.openTasks || [];
                const filteredTasks = summaryTasks.filter((task: Task) => {
                    if (filters.status && task.status !== filters.status) return false;
                    if (filters.priority && task.priority !== filters.priority) return false;
                    if (filters.leadId && task.leadId !== filters.leadId) return false;
                    if (filters.assignedTo && task.assignedTo !== filters.assignedTo) return false;
                    if (filters.search) {
                        const queryText = filters.search.toLowerCase();
                        const haystack = [
                            task.subject,
                            task.description || "",
                            task.leadName || "",
                            task.company || "",
                        ]
                            .join(" ")
                            .toLowerCase();
                        if (!haystack.includes(queryText)) return false;
                    }
                    return true;
                });

                return {
                    success: true,
                    data: filteredTasks,
                    count: filteredTasks.length,
                };
            };

            if (productivityTasksEndpointAvailable === false) {
                return getSummaryTasks();
            }

            try {
                const res = await api.get<ApiResponse<Task[]>>(`/productivity/tasks${query ? `?${query}` : ""}`);
                productivityTasksEndpointAvailable = true;
                return res.data;
            } catch (error: any) {
                if (error?.response?.status !== 404) {
                    throw error;
                }

                productivityTasksEndpointAvailable = false;
                return getSummaryTasks();
            }
        },
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error: any) => {
            if (error?.response?.status === 404) return false;
            return failureCount < 2;
        },
    });
}

export function useScheduleMeeting() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: ScheduleMeetingPayload) => 
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
        mutationFn: (data: TaskPayload) => 
            api.post("/productivity/tasks", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["productivity", "summary"] });
            queryClient.invalidateQueries({ queryKey: ["productivity", "tasks"] });
            queryClient.invalidateQueries({ queryKey: ["leads"] });
        }
    });
}

export function useUpdateTask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<TaskPayload> }) => 
            api.patch(`/productivity/tasks/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["productivity", "summary"] });
            queryClient.invalidateQueries({ queryKey: ["productivity", "tasks"] });
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
            queryClient.invalidateQueries({ queryKey: ["productivity", "tasks"] });
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

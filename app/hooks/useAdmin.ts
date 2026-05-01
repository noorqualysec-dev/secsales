import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/app/services/api";
import type { User, Lead, Proposal, ApiResponse } from "@/app/types";

const ADMIN_USERS_KEY = ["admin", "users"];
const ADMIN_LEADS_KEY = ["admin", "leads"];
const ADMIN_STATS_KEY = ["admin", "stats"];
const ADMIN_PROPOSALS_KEY = ["admin", "proposals"];
const XLSX_FALLBACK_FILE = "sales_report.xlsx";

export type SalesReportPeriod = "current_month" | "last_3_months" | "custom";

export interface SalesReportFilters {
  period: SalesReportPeriod;
  month?: string;
  fromMonth?: string;
  toMonth?: string;
}

interface DownloadSalesRepReportPayload {
  userId: string;
  filters: SalesReportFilters;
}

const getFileNameFromDisposition = (
  contentDisposition: string | undefined,
  fallbackFileName: string
) => {
  if (!contentDisposition) return fallbackFileName;

  const encodedNameMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (encodedNameMatch?.[1]) {
    try {
      return decodeURIComponent(encodedNameMatch[1]);
    } catch {
      return encodedNameMatch[1];
    }
  }

  const directNameMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  if (directNameMatch?.[1]) return directNameMatch[1];

  return fallbackFileName;
};

const downloadBlobAsFile = (blob: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

const buildSalesReportParams = (filters: SalesReportFilters): Record<string, string> => {
  const params: Record<string, string> = { period: filters.period };

  if (filters.period !== "custom") {
    return params;
  }

  if (filters.month) {
    params.month = filters.month;
    return params;
  }

  if (filters.fromMonth) params.fromMonth = filters.fromMonth;
  if (filters.toMonth) params.toMonth = filters.toMonth;

  return params;
};

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

export function useDownloadCombinedSalesRepReport() {
  return useMutation({
    mutationFn: async (filters: SalesReportFilters) => {
      const res = await api.get<Blob>("/admin/reports/sales-reps/download", {
        params: buildSalesReportParams(filters),
        responseType: "blob",
      });

      const fileName = getFileNameFromDisposition(
        res.headers["content-disposition"],
        XLSX_FALLBACK_FILE
      );
      downloadBlobAsFile(res.data, fileName);
    },
  });
}

export function useDownloadSalesRepReport() {
  return useMutation({
    mutationFn: async ({ userId, filters }: DownloadSalesRepReportPayload) => {
      const res = await api.get<Blob>(`/admin/reports/sales-reps/${userId}/download`, {
        params: buildSalesReportParams(filters),
        responseType: "blob",
      });

      const fileName = getFileNameFromDisposition(
        res.headers["content-disposition"],
        XLSX_FALLBACK_FILE
      );
      downloadBlobAsFile(res.data, fileName);
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

export function useUpdateLeadStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ leadId, ...data }: { leadId: string; status?: string; outcome?: string; lostReason?: string; wonReason?: string; latestRemark?: string }) =>
      api.put(`/admin/leads/${leadId}/status`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_LEADS_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_STATS_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_PROPOSALS_KEY });
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
    },
  });
}

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/app/services/api";
import type { NotificationsResponse } from "@/app/types";

const NOTIFICATIONS_KEY = ["notifications"];

export function useNotifications(options: {
  enabled?: boolean;
  limit?: number;
  unreadOnly?: boolean;
} = {}) {
  const {
    enabled = true,
    limit = 10,
    unreadOnly = false,
  } = options;

  return useQuery<NotificationsResponse>({
    queryKey: [...NOTIFICATIONS_KEY, { limit, unreadOnly }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("limit", String(limit));

      if (unreadOnly) {
        params.set("unread", "true");
      }

      const res = await api.get<NotificationsResponse>(`/notifications?${params.toString()}`);
      return res.data;
    },
    enabled,
    staleTime: 10_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const res = await api.patch(`/notifications/${notificationId}/read`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await api.patch("/notifications/read-all");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
  });
}

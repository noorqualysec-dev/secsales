"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Menu, LogOut, CheckCheck } from "lucide-react";
import { useNotifications, useMarkAllNotificationsAsRead, useMarkNotificationAsRead } from "@/app/hooks/useNotifications";
import type { Notification, User } from "@/app/types";

interface HeaderProps {
  user: User | null;
  pageTitle: string;
  onMenuClick: () => void;
  onLogout: () => void;
}

export function Header({ user, pageTitle, onMenuClick, onLogout }: HeaderProps) {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const shouldShowNotifications = user?.role === "sales_rep";
  const { data, isLoading } = useNotifications({
    enabled: shouldShowNotifications,
    limit: 8,
  });
  const markNotificationAsRead = useMarkNotificationAsRead();
  const markAllNotificationsAsRead = useMarkAllNotificationsAsRead();

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "U";
  const notifications = data?.data ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  const relativeTimeFormatter = useMemo(
    () => new Intl.RelativeTimeFormat("en", { numeric: "auto" }),
    []
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isOpen]);

  const formatRelativeTime = (createdAt: number) => {
    const diffMs = createdAt - Date.now();
    const diffMinutes = Math.round(diffMs / 60000);

    if (Math.abs(diffMinutes) < 60) {
      return relativeTimeFormatter.format(diffMinutes, "minute");
    }

    const diffHours = Math.round(diffMs / 3600000);
    if (Math.abs(diffHours) < 24) {
      return relativeTimeFormatter.format(diffHours, "hour");
    }

    const diffDays = Math.round(diffMs / 86400000);
    return relativeTimeFormatter.format(diffDays, "day");
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markNotificationAsRead.mutateAsync(notification._id);
    }

    setIsOpen(false);

    if (notification.leadId) {
      router.push(`/leads/${notification.leadId}`);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-semibold text-slate-800">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-3">
        {shouldShowNotifications && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen((open) => !open)}
              title="Notifications"
              className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {isOpen && (
              <div className="absolute right-0 top-12 w-96 max-w-[calc(100vw-2rem)] bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-30">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Notifications</p>
                    <p className="text-xs text-slate-400">
                      {unreadCount > 0 ? `${unreadCount} unread reminder${unreadCount === 1 ? "" : "s"}` : "All caught up"}
                    </p>
                  </div>

                  <button
                    onClick={() => markAllNotificationsAsRead.mutate()}
                    disabled={unreadCount === 0 || markAllNotificationsAsRead.isPending}
                    className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 disabled:text-slate-300 transition-colors"
                  >
                    <CheckCheck size={14} />
                    Mark all read
                  </button>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {isLoading ? (
                    <div className="px-4 py-6 text-sm text-slate-500">Loading notifications...</div>
                  ) : notifications.length === 0 ? (
                    <div className="px-4 py-6 text-sm text-slate-500">No notifications yet.</div>
                  ) : (
                    notifications.map((notification) => (
                      <button
                        key={notification._id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`w-full text-left px-4 py-3 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors ${
                          notification.read ? "bg-white" : "bg-indigo-50/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-800">{notification.title}</p>
                            <p className="mt-1 text-xs text-slate-500 leading-5">{notification.message}</p>
                          </div>
                          {!notification.read && (
                            <span className="mt-1 w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
                          )}
                        </div>
                        <p className="mt-2 text-[11px] text-slate-400">{formatRelativeTime(notification.createdAt)}</p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* User info */}
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-sm font-medium text-slate-700">{user?.name ?? "User"}</span>
          <span className="text-xs text-slate-400 capitalize">{user?.role ?? ""}</span>
        </div>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-bold">
          {initials}
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          title="Logout"
          className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}

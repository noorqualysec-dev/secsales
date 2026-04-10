"use client";

import { TasksWorkspace } from "@/app/components/tasks/TasksWorkspace";
import { useAdminUsers } from "@/app/hooks/useAdmin";
import { useAdminAuth } from "@/app/hooks/useAdminAuth";

export default function AdminTasksPage() {
  const { user } = useAdminAuth();
  const { data: usersData } = useAdminUsers();

  return (
    <TasksWorkspace
      currentUser={user}
      users={usersData?.data ?? []}
      adminView
    />
  );
}

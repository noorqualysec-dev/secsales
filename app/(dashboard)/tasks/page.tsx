"use client";

import { TasksWorkspace } from "@/app/components/tasks/TasksWorkspace";
import { useAuth } from "@/app/hooks/useAuth";

export default function TasksPage() {
  const { user } = useAuth();

  return <TasksWorkspace currentUser={user} />;
}

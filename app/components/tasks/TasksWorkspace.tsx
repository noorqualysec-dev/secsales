"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  ClipboardList,
  Filter,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserSquare2,
  X,
} from "lucide-react";
import { useLeads } from "@/app/hooks/useLeads";
import {
  useCreateTask,
  useDeleteTask,
  useTasks,
  useUpdateTask,
} from "@/app/hooks/useProductivity";
import { canAccessAdminPortal } from "@/app/utils/permissions";
import type { Lead, Task, TaskPriority, TaskStatus, User } from "@/app/types";

const TASK_STATUSES: TaskStatus[] = [
  "Pending",
  "In Progress",
  "Completed",
  "Waiting on someone",
  "Deferred",
];

const TASK_PRIORITIES: TaskPriority[] = ["Low", "Medium", "High"];

const statusClasses: Record<TaskStatus, string> = {
  Pending: "bg-slate-100 text-slate-700 border-slate-200",
  "In Progress": "bg-blue-50 text-blue-700 border-blue-200",
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Waiting on someone": "bg-amber-50 text-amber-700 border-amber-200",
  Deferred: "bg-rose-50 text-rose-700 border-rose-200",
};

const priorityClasses: Record<TaskPriority, string> = {
  Low: "bg-slate-100 text-slate-600",
  Medium: "bg-indigo-50 text-indigo-700",
  High: "bg-orange-50 text-orange-700",
};

function TaskEditor({
  task,
  leads,
  users,
  canAssign,
  onClose,
  onSave,
  isSaving,
}: {
  task?: Task | null;
  leads: Lead[];
  users: User[];
  canAssign: boolean;
  onClose: () => void;
  onSave: (data: {
    subject: string;
    description?: string;
    dueDate: number;
    status: TaskStatus;
    priority: TaskPriority;
    leadId?: string | null;
    assignedTo?: string;
  }) => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState({
    subject: task?.subject || "",
    description: task?.description || "",
    dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
    status: (task?.status || "Pending") as TaskStatus,
    priority: (task?.priority || "Medium") as TaskPriority,
    leadId: task?.leadId || "",
    assignedTo: task?.assignedTo || users[0]?._id || "",
  });

  const inputCls =
    "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              {task ? "Edit Task" : "Create Task"}
            </h2>
            <p className="text-xs font-medium text-slate-400">
              {canAssign ? "Assign work to sales reps and track progress." : "Manage your task details and progress."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave({
              subject: form.subject.trim(),
              description: form.description.trim(),
              dueDate: new Date(form.dueDate).getTime(),
              status: form.status,
              priority: form.priority,
              leadId: form.leadId || null,
              assignedTo: canAssign ? form.assignedTo : undefined,
            });
          }}
          className="space-y-5 p-6"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                Subject
              </label>
              <input
                required
                className={inputCls}
                value={form.subject}
                onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
                placeholder="Prepare follow-up proposal notes"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                Description
              </label>
              <textarea
                rows={4}
                className={`${inputCls} resize-none`}
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Add the context the sales rep should see."
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                Due Date
              </label>
              <input
                required
                type="date"
                className={inputCls}
                value={form.dueDate}
                onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                Priority
              </label>
              <select
                className={inputCls}
                value={form.priority}
                onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value as TaskPriority }))}
              >
                {TASK_PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                Status
              </label>
              <select
                className={inputCls}
                value={form.status}
                onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as TaskStatus }))}
              >
                {TASK_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                Linked Lead
              </label>
              <select
                className={inputCls}
                value={form.leadId}
                onChange={(e) => setForm((prev) => ({ ...prev, leadId: e.target.value }))}
              >
                <option value="">No linked lead</option>
                {leads.map((lead) => (
                  <option key={lead._id} value={lead._id}>
                    {lead.firstName} {lead.lastName} {lead.company ? `(${lead.company})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {canAssign && (
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                  Assign To
                </label>
                <select
                  className={inputCls}
                  value={form.assignedTo}
                  onChange={(e) => setForm((prev) => ({ ...prev, assignedTo: e.target.value }))}
                >
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.role})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : task ? "Update Task" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function TasksWorkspace({
  currentUser,
  users = [],
  adminView = false,
}: {
  currentUser: User | null;
  users?: User[];
  adminView?: boolean;
}) {
  const canAssign = adminView || canAccessAdminPortal(currentUser?.role);
  const assignableUsers = useMemo(
    () => users.filter((user) => user.role === "sales_rep" || user.role === "manager"),
    [users]
  );
  const [editorTask, setEditorTask] = useState<Task | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const { data: leadsData } = useLeads({ enabled: editorOpen });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TaskStatus | "">("");
  const [priority, setPriority] = useState<TaskPriority | "">("");
  const [assignedTo, setAssignedTo] = useState("");
  const taskFilters = useMemo(
    () => ({
      search: search.trim(),
      status,
      priority,
      assignedTo: canAssign ? assignedTo : undefined,
    }),
    [search, status, priority, assignedTo, canAssign]
  );

  const { data: tasksData, isLoading } = useTasks(taskFilters);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const leads = useMemo(() => leadsData?.data ?? [], [leadsData?.data]);
  const tasks = useMemo(() => tasksData?.data ?? [], [tasksData?.data]);

  const summary = useMemo(() => {
    const open = tasks.filter((task) => task.status !== "Completed").length;
    const completed = tasks.filter((task) => task.status === "Completed").length;
    const overdue = tasks.filter(
      (task) => task.status !== "Completed" && Number(task.dueDate) < new Date().setHours(0, 0, 0, 0)
    ).length;

    return { total: tasks.length, open, completed, overdue };
  }, [tasks]);

  const canDeleteTask = (task: Task) =>
    canAssign || task.createdBy === currentUser?._id;

  const saveTask = (payload: {
    subject: string;
    description?: string;
    dueDate: number;
    status: TaskStatus;
    priority: TaskPriority;
    leadId?: string | null;
    assignedTo?: string;
  }) => {
    if (editorTask) {
      updateTask.mutate(
        { id: editorTask.id, data: payload },
        { onSuccess: () => {
          setEditorOpen(false);
          setEditorTask(null);
        } }
      );
      return;
    }

    createTask.mutate(payload, {
      onSuccess: () => {
        setEditorOpen(false);
        setEditorTask(null);
      },
    });
  };

  return (
    <div className="space-y-8">
      {editorOpen && (
        <TaskEditor
          task={editorTask}
          leads={leads}
          users={assignableUsers}
          canAssign={canAssign}
          isSaving={createTask.isPending || updateTask.isPending}
          onClose={() => {
            setEditorOpen(false);
            setEditorTask(null);
          }}
          onSave={saveTask}
        />
      )}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight text-slate-900">
            <ClipboardList className="text-indigo-600" size={28} />
            Tasks
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {canAssign
              ? "Create, assign, and monitor task execution across the team."
              : "Track your workload, update status, and finish assigned tasks."}
          </p>
        </div>

        <button
          onClick={() => {
            setEditorTask(null);
            setEditorOpen(true);
          }}
          className="inline-flex items-center gap-2 self-start rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500"
        >
          <Plus size={16} />
          New Task
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
              <ClipboardList size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500">Total Tasks</p>
              <p className="text-3xl font-black text-slate-900">{summary.total}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
              <CircleDashed size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500">Open Tasks</p>
              <p className="text-3xl font-black text-slate-900">{summary.open}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-rose-50 p-3 text-rose-600">
              <CalendarDays size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500">Overdue</p>
              <p className="text-3xl font-black text-slate-900">{summary.overdue}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
              placeholder="Search by task, lead, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus | "")}
          >
            <option value="">All statuses</option>
            {TASK_STATUSES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>

          <select
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority | "")}
          >
            <option value="">All priorities</option>
            {TASK_PRIORITIES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>

          {canAssign ? (
            <select
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            >
              <option value="">All assignees</option>
              {assignableUsers.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
              <Filter size={16} />
              Your assigned tasks
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center text-slate-400 shadow-sm">
            Loading tasks...
          </div>
        ) : tasks.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
            <CheckCircle2 className="mx-auto mb-4 text-slate-300" size={32} />
            <h3 className="text-lg font-black text-slate-800">No tasks found</h3>
            <p className="mt-2 text-sm text-slate-500">
              Try adjusting the filters or create the first task for this view.
            </p>
          </div>
        ) : (
          tasks.map((task) => {
            const dueDate = new Date(task.dueDate);
            const isOverdue =
              task.status !== "Completed" && dueDate.getTime() < new Date().setHours(0, 0, 0, 0);

            return (
              <div
                key={task.id}
                className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-black text-slate-900">{task.subject}</h2>
                      <span className={`rounded-full border px-3 py-1 text-xs font-bold ${statusClasses[task.status]}`}>
                        {task.status}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${priorityClasses[task.priority]}`}>
                        {task.priority}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                        {task.source === "admin" ? "Assigned" : "Self"}
                      </span>
                      {isOverdue && (
                        <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">
                          Overdue
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p className="max-w-3xl text-sm leading-6 text-slate-600">{task.description}</p>
                    )}

                    <div className="flex flex-wrap gap-3 text-sm text-slate-500">
                      <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2">
                        <CalendarDays size={15} />
                        Due {dueDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                      {task.leadName && (
                        <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2">
                          <ClipboardList size={15} />
                          {task.leadName}
                          {task.company ? ` · ${task.company}` : ""}
                        </div>
                      )}
                      {(canAssign || adminView) && task.assignedToName && (
                        <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2">
                          <UserSquare2 size={15} />
                          {task.assignedToName}
                        </div>
                      )}
                      {!canAssign && task.source === "admin" && task.assignedByName && (
                        <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2">
                          <UserSquare2 size={15} />
                          Assigned by {task.assignedByName}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 lg:min-w-[240px]">
                    <select
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                      value={task.status}
                      onChange={(e) =>
                        updateTask.mutate({
                          id: task.id,
                          data: { status: e.target.value as TaskStatus },
                        })
                      }
                    >
                      {TASK_STATUSES.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditorTask(task);
                          setEditorOpen(true);
                        }}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                      >
                        <Pencil size={15} />
                        Edit
                      </button>
                      {canDeleteTask(task) && (
                        <button
                          onClick={() => {
                            if (confirm("Delete this task?")) {
                              deleteTask.mutate(task.id);
                            }
                          }}
                          className="inline-flex items-center justify-center rounded-2xl border border-rose-200 px-4 py-3 text-rose-600 transition hover:bg-rose-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

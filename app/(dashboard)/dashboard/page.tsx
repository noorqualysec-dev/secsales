"use client";

import {
  useSalesSummary,
  useCreateTask,
  useScheduleMeeting,
  useUpdateTask,
  useDeleteTask,
  useUpdateMeeting,
  useDeleteMeeting
} from "@/app/hooks/useProductivity";
import { useLeads } from "@/app/hooks/useLeads";
import {
  Briefcase,
  Users,
  PhoneCall,
  LayoutDashboard,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  ChevronDown,
  Plus,
  TrendingUp,
  X,
  Pencil,
  CheckCircle,
  AlertCircle,
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import type { TaskStatus } from "@/app/types";
import { canViewAdminDashboardModules } from "@/app/utils/permissions";

const getMeetingTitle = (meeting: any) => meeting.subject || meeting.title || "Untitled Meeting";
const getMeetingStart = (meeting: any) => meeting.startTime ?? meeting.from ?? 0;
const getMeetingEnd = (meeting: any) => meeting.endTime ?? meeting.to ?? 0;

// ── Quick Modals ─────────────────────────────────────────────────────────────

function TaskModal({ leads, initial, onSave, onClose, isSaving }: { 
  leads: any[]; 
  initial?: any;
  onSave: (d: any) => void; 
  onClose: () => void; 
  isSaving: boolean 
}) {
  const [form, setForm] = useState(initial || { subject: "", dueDate: "", priority: "Medium", leadId: "", status: "Pending" });
  const inputCls = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all";

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-scale-in">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">{initial ? "Modify Strategy" : "Create Strategic Task"}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition"><X size={18} /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="p-8 space-y-5">
           <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Subject *</label>
              <input className={inputCls} value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} required placeholder="Follow up on Requirement..." />
           </div>
           <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Link Prospect</label>
              <select className={inputCls} value={form.leadId} onChange={e => setForm({...form, leadId: e.target.value})}>
                 <option value="">Internal Only / No Lead</option>
                 {leads.map(l => <option key={l._id || l.id} value={l._id || l.id}>{l.firstName} {l.lastName} ({l.company})</option>)}
              </select>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Due Date</label>
                <input className={inputCls} type="date" value={form.dueDate ? new Date(form.dueDate).toISOString().split('T')[0] : ""} onChange={e => setForm({...form, dueDate: new Date(e.target.value).getTime()})} />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Priority</label>
                <select className={inputCls} value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                   <option>Low</option>
                   <option>Medium</option>
                   <option>High</option>
                </select>
              </div>
           </div>
           <button type="submit" disabled={isSaving} className="w-full py-4 bg-indigo-600 hover:bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/10 disabled:opacity-50">
              {isSaving ? "Synchronizing..." : initial ? "Finalize Updates" : "Add to Agenda"}
           </button>
        </form>
      </div>
    </div>
  );
}

function MeetingModal({ leads, initial, onSave, onClose, isSaving }: { 
  leads: any[]; 
  initial?: any;
  onSave: (d: any) => void; 
  onClose: () => void; 
  isSaving: boolean 
}) {
  const [form, setForm] = useState(
    initial
      ? {
          title: initial.subject ?? initial.title ?? "",
          from: initial.startTime ?? initial.from ?? "",
          to: initial.endTime ?? initial.to ?? "",
          leadId: initial.leadId ?? "",
        }
      : { title: "", from: "", to: "", leadId: "" }
  );
  const inputCls = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all";

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-scale-in">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">{initial ? "Reschedule Interaction" : "Schedule Interaction"}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition"><X size={18} /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="p-8 space-y-5">
           <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Interaction Title *</label>
              <input className={inputCls} value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="Discovery Call w/ ..." />
           </div>
           <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Prospect Identity *</label>
              <select className={inputCls} value={form.leadId} onChange={e => setForm({...form, leadId: e.target.value})} required>
                 <option value="">Select Prospect</option>
                 {leads.map(l => <option key={l._id || l.id} value={l._id || l.id}>{l.firstName} {l.lastName} ({l.company})</option>)}
              </select>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Starts At</label>
                <input className={inputCls} type="datetime-local" value={form.from ? new Date(form.from).toISOString().slice(0, 16) : ""} onChange={e => setForm({...form, from: new Date(e.target.value).getTime()})} required />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Ends At</label>
                <input className={inputCls} type="datetime-local" value={form.to ? new Date(form.to).toISOString().slice(0, 16) : ""} onChange={e => setForm({...form, to: new Date(e.target.value).getTime()})} required />
              </div>
           </div>
           <button type="submit" disabled={isSaving} className="w-full py-4 bg-emerald-600 hover:bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-500/10 disabled:opacity-50">
              {isSaving ? "Locking Schedule..." : initial ? "Push Reschedule" : "Confirm Schedule"}
           </button>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth();
  const canViewAdminModules = canViewAdminDashboardModules(user?.role);
  const [dateFilter, setDateFilter] = useState<"Today" | "Last Month" | "All Time" | "Custom">("Today");
  const [customRange, setCustomRange] = useState<{ start: string; end: string }>({ start: "", end: "" });
  const [modal, setModal] = useState<{ type: "task" | "meeting" | null; initial?: any } | null>(null);
  const [searchQuery, setSearchQuery] = useState({ tasks: "", meetings: "" });
  const [meetingsPage, setMeetingsPage] = useState(1);
  const MEETINGS_PER_PAGE = 5;
  const [tasksPage, setTasksPage] = useState(1);
  const TASKS_PER_PAGE = 5;
  
  const filters = useMemo(() => {
    if (dateFilter === "Today") return { startDate: new Date().setHours(0,0,0,0) };
    if (dateFilter === "Last Month") {
       const d = new Date(); d.setMonth(d.getMonth() - 1);
       return { startDate: d.getTime() };
    }
    if (dateFilter === "Custom" && customRange.start && customRange.end) {
       return { 
         startDate: new Date(customRange.start).getTime(),
         endDate: new Date(customRange.end).getTime()
       };
    }
    return {};
  }, [dateFilter, customRange]);

  const { data: summaryData, isLoading: summaryLoading } = useSalesSummary(filters);
  const { data: leadsData } = useLeads();
  const createTask = useCreateTask();
  const scheduleMeeting = useScheduleMeeting();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const updateMeeting = useUpdateMeeting();
  const deleteMeeting = useDeleteMeeting();

  const summary = summaryData?.data;
  const leads = leadsData?.data ?? [];

  const handleTaskStatusCycle = (task: any) => {
    const statuses: TaskStatus[] = ["Pending", "Waiting on someone", "Completed", "Deferred"];
    const nextIdx = (statuses.indexOf(task.status) + 1) % statuses.length;
    updateTask.mutate({ id: task.id, data: { status: statuses[nextIdx] } });
  };

  const quickStats = [
    { label: "My Open Deals", value: summary?.openDeals ?? 0, icon: Briefcase, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Untouched Deals", value: summary?.untouchedDeals ?? 0, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "My Calls Today", value: summary?.callsToday ?? 0, icon: PhoneCall, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "My Leads", value: summary?.totalMyLeads ?? 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
  ];

  const filteredTasks = summary?.openTasks?.filter((t: any) => 
    t.subject.toLowerCase().includes(searchQuery.tasks.toLowerCase()) || 
    t.leadName?.toLowerCase().includes(searchQuery.tasks.toLowerCase())
  );

  const filteredMeetings = summary?.meetings?.filter((m: any) =>
    getMeetingTitle(m).toLowerCase().includes(searchQuery.meetings.toLowerCase()) ||
    m.leadName?.toLowerCase().includes(searchQuery.meetings.toLowerCase())
  );

  const totalTaskPages = Math.ceil((filteredTasks?.length || 0) / TASKS_PER_PAGE);
  const paginatedTasks = filteredTasks?.slice(
    (tasksPage - 1) * TASKS_PER_PAGE,
    tasksPage * TASKS_PER_PAGE
  );

  const totalMeetingPages = Math.ceil((filteredMeetings?.length || 0) / MEETINGS_PER_PAGE);
  const paginatedMeetings = filteredMeetings?.slice(
    (meetingsPage - 1) * MEETINGS_PER_PAGE,
    meetingsPage * MEETINGS_PER_PAGE
  );

  if (summaryLoading) return (
    <div className="space-y-8 animate-pulse p-8">
      <div className="h-12 w-64 bg-slate-200 rounded-xl mb-10" />
      <div className="grid grid-cols-4 gap-6">{[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-slate-100 rounded-2xl" />)}</div>
      <div className="grid grid-cols-2 gap-8">{[...Array(2)].map((_, i) => <div key={i} className="h-64 bg-slate-50 rounded-3xl" />)}</div>
    </div>
  );

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      {/* Modals */}
      {(modal?.type === "task") && (
        <TaskModal 
          leads={leads} 
          initial={modal.initial}
          isSaving={createTask.isPending || updateTask.isPending}
          onClose={() => setModal(null)}
          onSave={(d) => {
            if (modal.initial) {
              updateTask.mutate({ id: modal.initial.id, data: d }, { onSuccess: () => setModal(null) });
            } else {
              createTask.mutate({ ...d, dueDate: new Date(d.dueDate).getTime() }, { onSuccess: () => setModal(null) });
            }
          }}
        />
      )}
      {(modal?.type === "meeting") && (
        <MeetingModal 
          leads={leads}
          initial={modal.initial}
          isSaving={scheduleMeeting.isPending || updateMeeting.isPending}
          onClose={() => setModal(null)}
          onSave={(d) => {
            if (modal.initial) {
              updateMeeting.mutate({ id: modal.initial.id, data: d }, { onSuccess: () => setModal(null) });
            } else {
              scheduleMeeting.mutate({ 
                ...d, 
                from: new Date(d.from).getTime(), 
                to: new Date(d.to).getTime() 
              }, { onSuccess: () => setModal(null) });
            }
          }}
        />
      )}

      {/* Header & Global Filter */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 px-2">
        <div className="flex items-center gap-4">
           <div className="w-14 h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-sm">
              <LayoutDashboard className="text-indigo-600" size={28} />
           </div>
           <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Home</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">Welcome to QualySec Power Dashboard</p>
           </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
           {["Today", "Last Month", "All Time", "Custom"].map((f) => (
             <button key={f} onClick={() => setDateFilter(f as any)} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${dateFilter === f ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-900"}`}>{f}</button>
           ))}
           {dateFilter === "Custom" && (
              <div className="flex items-center gap-2 px-4 animate-scale-in">
                 <input type="date" className="text-[9px] font-black bg-slate-50 border-none rounded-lg p-1" value={customRange.start} onChange={e => setCustomRange({...customRange, start: e.target.value})} />
                 <span className="text-[9px] text-slate-400 font-black">TO</span>
                 <input type="date" className="text-[9px] font-black bg-slate-50 border-none rounded-lg p-1" value={customRange.end} onChange={e => setCustomRange({...customRange, end: e.target.value})} />
              </div>
           )}
        </div>
      </div>

      {/* Top Pulse Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat) => (
          <div key={stat.label} className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bg} p-3 rounded-2xl group-hover:scale-110 transition-transform`}><stat.icon size={20} className={stat.color} /></div>
              <ChevronDown size={14} className="text-slate-300" />
            </div>
            <p className="text-3xl font-black text-slate-900 leading-none tracking-tight">{stat.value}</p>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-3">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Main Activity Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Open Tasks — Redesigned */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col min-h-[400px]">

          {/* Header */}
          <div className="px-7 py-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-50 rounded-2xl flex items-center justify-center">
                <CheckCircle2 className="text-emerald-600" size={16} />
              </div>
              <div>
                <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">My Open Tasks</h2>
                <p className="text-[9px] text-slate-400 font-bold mt-0.5">{filteredTasks?.length || 0} pending</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative group/search">
                <input
                  className="w-0 group-hover/search:w-36 focus:w-36 bg-slate-50 border border-transparent focus:border-slate-200 rounded-xl px-3 py-1.5 text-[9px] font-bold transition-all outline-none placeholder:text-slate-300"
                  placeholder="Search tasks..."
                  value={searchQuery.tasks}
                  onChange={e => { setSearchQuery({...searchQuery, tasks: e.target.value}); setTasksPage(1); }}
                />
                <Search size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              <button
                onClick={() => setModal({ type: "task" })}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black tracking-widest transition-all duration-200 shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                <Plus size={12} />
                Add Task
              </button>
            </div>
          </div>

          {/* Task List */}
          <div className="flex-1 overflow-auto flex flex-col">
            {filteredTasks?.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16 text-slate-300">
                <CheckCircle2 size={30} className="opacity-30" />
                <p className="text-[11px] font-bold italic">No open tasks</p>
              </div>
            ) : (
              <>
                <div className="p-4 space-y-2 flex-1">
                  {paginatedTasks?.map((task: any, idx: number) => {
                    const dueDate = new Date(task.dueDate);
                    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
                    const dueDateStart = new Date(dueDate); dueDateStart.setHours(0, 0, 0, 0);
                    const isOverdue = dueDateStart < todayStart && task.status !== "Completed";
                    const isDueToday = dueDateStart.getTime() === todayStart.getTime();
                    const priorityConfig: Record<string, { bg: string; light: string; text: string; border: string }> = {
                      High:   { bg: "bg-rose-500",  light: "bg-rose-50",   text: "text-rose-600",  border: "border-rose-100"  },
                      Medium: { bg: "bg-amber-400", light: "bg-amber-50",  text: "text-amber-600", border: "border-amber-100" },
                      Low:    { bg: "bg-slate-300", light: "bg-slate-50",  text: "text-slate-500", border: "border-slate-100" },
                    };
                    const pc = priorityConfig[task.priority || "Medium"] ?? priorityConfig.Medium;

                    return (
                      <div
                        key={task.id || idx}
                        className={`group flex items-center gap-3.5 px-4 py-3 rounded-2xl border transition-all duration-200
                          ${task.status === "Completed"
                            ? "bg-slate-50/60 border-slate-100 opacity-60"
                            : isOverdue
                            ? "bg-rose-50/40 border-rose-100 hover:border-rose-200 hover:shadow-sm"
                            : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 hover:shadow-sm"
                          }`}
                      >
                        {/* Priority Strip */}
                        <div className={`shrink-0 w-1.5 h-10 rounded-full ${pc.bg}`} />

                        {/* Subject + Due Date */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-black truncate leading-snug ${task.status === "Completed" ? "line-through text-slate-400" : "text-slate-800"}`}>
                            {task.subject}
                          </p>
                          <p className={`text-[9px] font-bold mt-0.5 ${isOverdue ? "text-rose-500" : isDueToday ? "text-amber-500" : "text-slate-400"}`}>
                            {isOverdue ? "⚠ Overdue · " : isDueToday ? "⏰ Due Today · " : ""}
                            {dueDate.toLocaleDateString([], { month: "short", day: "numeric" })}
                          </p>
                        </div>

                        {/* Contact Name + Related To */}
                        <div className="shrink-0 w-28 min-w-0">
                          {task.leadName ? (
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                <span className="text-[8px] font-black text-slate-500">{task.leadName[0].toUpperCase()}</span>
                              </div>
                              <div className="min-w-0">
                                <p className="text-[10px] font-bold text-slate-700 truncate">{task.leadName}</p>
                                <p className="text-[8px] font-black text-slate-400 uppercase truncate">{task.company || "—"}</p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-[9px] text-slate-300 font-bold italic">No lead</span>
                          )}
                        </div>

                        {/* Priority Badge */}
                        <div className="shrink-0">
                          <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-wide ${pc.light} ${pc.text} border ${pc.border}`}>
                            {task.priority || "Medium"}
                          </span>
                        </div>

                        {/* Status (clickable cycle) */}
                        <div className="shrink-0">
                          <button
                            onClick={() => handleTaskStatusCycle(task)}
                            title="Click to change status"
                            className={`px-2.5 py-1 flex items-center gap-1.5 rounded-full font-black text-[8px] uppercase tracking-wider shadow-sm transition active:scale-95 ${
                              task.status === "Completed"          ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                              task.status === "Waiting on someone" ? "bg-amber-50 text-amber-600 border border-amber-100"   :
                              task.status === "Deferred"           ? "bg-slate-100 text-slate-500 border border-slate-200"   :
                                                                     "bg-slate-50 text-slate-600 border border-slate-100"
                            }`}
                          >
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              task.status === "Completed"          ? "bg-emerald-500" :
                              task.status === "Waiting on someone" ? "bg-amber-500"   :
                                                                     "bg-slate-400"
                            }`} />
                            {task.status === "Waiting on someone" ? "Waiting" : task.status}
                          </button>
                        </div>

                        {/* Actions */}
                        <div className="shrink-0 flex items-center gap-0.5">
                          <button
                            onClick={() => setModal({ type: "task", initial: task })}
                            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-150"
                            title="Edit"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => { if (confirm("Delete this task?")) deleteTask.mutate(task.id); }}
                            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all duration-150"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalTaskPages > 1 && (
                  <div className="px-6 py-3 border-t border-slate-50 flex items-center justify-between bg-slate-50/40">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      {(tasksPage - 1) * TASKS_PER_PAGE + 1}–{Math.min(tasksPage * TASKS_PER_PAGE, filteredTasks?.length || 0)}{" "}
                      <span className="text-slate-300">of</span>{" "}{filteredTasks?.length}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        disabled={tasksPage === 1}
                        onClick={() => setTasksPage(p => p - 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 disabled:opacity-30 transition"
                      >
                        <ChevronLeft size={13} />
                      </button>
                      <div className="flex items-center gap-1 px-1">
                        {Array.from({ length: Math.min(totalTaskPages, 5) }, (_, i) => {
                          const page = totalTaskPages <= 5
                            ? i + 1
                            : tasksPage <= 3
                            ? i + 1
                            : tasksPage >= totalTaskPages - 2
                            ? totalTaskPages - 4 + i
                            : tasksPage - 2 + i;
                          return (
                            <button
                              key={page}
                              onClick={() => setTasksPage(page)}
                              className={`w-6 h-6 rounded-lg text-[9px] font-black transition-all duration-150
                                ${tasksPage === page
                                  ? "bg-emerald-600 text-white shadow-sm"
                                  : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                      </div>
                      <button
                        disabled={tasksPage === totalTaskPages}
                        onClick={() => setTasksPage(p => p + 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 disabled:opacity-30 transition"
                      >
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Meetings — Redesigned */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col min-h-[400px]">

          {/* Header */}
          <div className="px-7 py-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-indigo-50 rounded-2xl flex items-center justify-center">
                <Calendar className="text-indigo-600" size={16} />
              </div>
              <div>
                <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">My Meetings</h2>
                <p className="text-[9px] text-slate-400 font-bold mt-0.5">{filteredMeetings?.length || 0} scheduled</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative group/search">
                <input
                  className="w-0 group-hover/search:w-36 focus:w-36 bg-slate-50 border border-transparent focus:border-slate-200 rounded-xl px-3 py-1.5 text-[9px] font-bold transition-all outline-none placeholder:text-slate-300"
                  placeholder="Search meetings..."
                  value={searchQuery.meetings}
                  onChange={e => { setSearchQuery({...searchQuery, meetings: e.target.value}); setMeetingsPage(1); }}
                />
                <Search size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              <button
                onClick={() => setModal({ type: "meeting" })}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black tracking-widest transition-all duration-200 shadow-lg shadow-indigo-500/20 active:scale-95"
              >
                <Plus size={12} />
                Schedule
              </button>
            </div>
          </div>

          {/* Meeting List */}
          <div className="flex-1 overflow-auto flex flex-col">
            {filteredMeetings?.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16 text-slate-300">
                <Calendar size={30} className="opacity-30" />
                <p className="text-[11px] font-bold italic">No meetings scheduled</p>
              </div>
            ) : (
              <>
                <div className="p-4 space-y-2 flex-1">
                  {paginatedMeetings?.map((m: any, idx: number) => {
                    const fromDate = new Date(getMeetingStart(m));
                    const toDate   = new Date(getMeetingEnd(m));
                    const now      = new Date();
                    const isToday    = fromDate.toDateString() === now.toDateString();
                    const isTomorrow = fromDate.toDateString() === new Date(now.getTime() + 86400000).toDateString();
                    const isPast     = fromDate < now && !isToday;
                    const durationMin = Math.round((toDate.getTime() - fromDate.getTime()) / 60000);

                    return (
                      <div
                        key={m.id || idx}
                        className={`group flex items-center gap-3.5 px-4 py-3 rounded-2xl border transition-all duration-200
                          ${isToday
                            ? "bg-indigo-50/70 border-indigo-100 hover:border-indigo-200 hover:shadow-sm"
                            : isPast
                            ? "bg-slate-50/60 border-slate-100 opacity-55 hover:opacity-80"
                            : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 hover:shadow-sm"
                          }`}
                      >
                        {/* Date Badge */}
                        <div className={`shrink-0 w-10 flex flex-col items-center justify-center rounded-xl py-2 text-center
                          ${isToday  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                          : isPast   ? "bg-slate-200 text-slate-500"
                          :            "bg-slate-900 text-white"}`}
                        >
                          <span className="text-[7px] font-black uppercase tracking-widest leading-none opacity-70">
                            {fromDate.toLocaleDateString([], { month: "short" })}
                          </span>
                          <span className="text-[17px] font-black leading-snug">
                            {fromDate.getDate()}
                          </span>
                        </div>

                        {/* Divider */}
                        <div className={`w-px h-8 shrink-0 ${isToday ? "bg-indigo-200" : "bg-slate-100"}`} />

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <p className="text-xs font-black text-slate-800 truncate leading-snug">{getMeetingTitle(m)}</p>
                            {isToday && (
                              <span className="shrink-0 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[7px] font-black rounded-full uppercase tracking-wide">
                                Today
                              </span>
                            )}
                            {isTomorrow && !isToday && (
                              <span className="shrink-0 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[7px] font-black rounded-full uppercase tracking-wide">
                                Tomorrow
                              </span>
                            )}
                            {isPast && (
                              <span className="shrink-0 px-1.5 py-0.5 bg-slate-100 text-slate-400 text-[7px] font-black rounded-full uppercase tracking-wide">
                                Past
                              </span>
                            )}
                          </div>
                          {(m.leadName || m.company) && (
                            <div className="flex items-center gap-1.5">
                              <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                <span className="text-[7px] font-black text-slate-500">
                                  {(m.leadName || "?")[0].toUpperCase()}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 font-medium truncate">
                                {m.leadName && <span className="text-slate-600 font-semibold">{m.leadName}</span>}
                                {m.leadName && m.company && <span className="text-slate-300 mx-1">·</span>}
                                {m.company && <span className="text-slate-400">{m.company}</span>}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Time + Duration */}
                        <div className="shrink-0 text-right mr-1">
                          <p className={`text-xs font-black ${isToday ? "text-indigo-700" : "text-slate-700"}`}>
                            {fromDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                          <p className="text-[9px] text-slate-400 font-medium">
                            {durationMin > 0 ? `${durationMin} min` : "—"}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="shrink-0 flex items-center gap-0.5">
                          <button
                            onClick={() => setModal({ type: "meeting", initial: m })}
                            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-150"
                            title="Edit"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => { if (confirm("Delete this meeting?")) deleteMeeting.mutate(m.id); }}
                            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all duration-150"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalMeetingPages > 1 && (
                  <div className="px-6 py-3 border-t border-slate-50 flex items-center justify-between bg-slate-50/40">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      {(meetingsPage - 1) * MEETINGS_PER_PAGE + 1}–{Math.min(meetingsPage * MEETINGS_PER_PAGE, filteredMeetings?.length || 0)}{" "}
                      <span className="text-slate-300">of</span>{" "}{filteredMeetings?.length}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        disabled={meetingsPage === 1}
                        onClick={() => setMeetingsPage(p => p - 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-30 transition"
                      >
                        <ChevronLeft size={13} />
                      </button>
                      <div className="flex items-center gap-1 px-1">
                        {Array.from({ length: Math.min(totalMeetingPages, 5) }, (_, i) => {
                          const page = totalMeetingPages <= 5
                            ? i + 1
                            : meetingsPage <= 3
                            ? i + 1
                            : meetingsPage >= totalMeetingPages - 2
                            ? totalMeetingPages - 4 + i
                            : meetingsPage - 2 + i;
                          return (
                            <button
                              key={page}
                              onClick={() => setMeetingsPage(page)}
                              className={`w-6 h-6 rounded-lg text-[9px] font-black transition-all duration-150
                                ${meetingsPage === page
                                  ? "bg-indigo-600 text-white shadow-sm"
                                  : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                      </div>
                      <button
                        disabled={meetingsPage === totalMeetingPages}
                        onClick={() => setMeetingsPage(p => p + 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-30 transition"
                      >
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Admin Leaderboard AB Testing View (Worthy check) */}
      {canViewAdminModules && (
        <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full -mr-20 -mt-20 group-hover:bg-indigo-500/20 transition-all duration-700" />
           <div className="relative z-10">
              <div className="flex items-center justify-between mb-10">
                 <div>
                    <h3 className="text-xl font-black tracking-tight uppercase">Strategic Staff Performance</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Global Oversight & Representative Engagement</p>
                 </div>
                 <div className="bg-slate-800 p-4 rounded-2xl flex items-center gap-6 border border-slate-700">
                    <div className="text-center">
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Reps</p>
                       <p className="text-lg font-black">12</p>
                    </div>
                    <div className="w-px h-8 bg-slate-700" />
                    <div className="text-center">
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Team Goal</p>
                       <p className="text-lg font-black text-emerald-400">82%</p>
                    </div>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {[1,2,3].map((i) => (
                    <div key={i} className="bg-slate-800/50 border border-slate-700 p-6 rounded-3xl hover:bg-slate-800 transition-colors">
                       <div className="flex items-center gap-4 mb-6">
                          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-sm">#0{i}</div>
                          <div>
                             <p className="font-black text-sm">Top Performer {i}</p>
                             <p className="text-[9px] text-slate-500 uppercase font-black">Sales Strategic Unit</p>
                          </div>
                       </div>
                       <div className="space-y-3">
                          <div className="flex justify-between text-[9px] font-black uppercase text-slate-400 tracking-widest"><span>Deals Won</span><span>{15-i}</span></div>
                          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden truncate">
                             <div className="h-full bg-emerald-500" style={{ width: `${80-i*10}%` }} />
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {/* Today's Leads & Closing Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm group border-l-4 border-l-emerald-500">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2"><Plus className="text-emerald-500" size={18} /> Today's Leads</h3>
                <Link href="/leads" className="text-[9px] font-black text-indigo-600 hover:underline">View All</Link>
             </div>
             <div className="space-y-4">
                {summary?.todaysLeads?.slice(0,3).map((l: any, idx: number) => (
                   <div key={l._id || l.id || idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group-hover:bg-white border border-transparent group-hover:border-slate-100 transition-all">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white text-[10px] font-bold">{l.firstName?.[0]}{l.lastName?.[0]}</div>
                         <div>
                            <p className="text-xs font-black text-slate-900 tracking-tight">{l.firstName} {l.lastName}</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase">{l.company}</p>
                         </div>
                      </div>
                      <Link href={`/leads/${l._id || l.id}`} className="p-2 text-slate-300 hover:text-indigo-600 transition"><ArrowRight size={16} /></Link>
                   </div>
                ))}
             </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm group border-l-4 border-l-indigo-500">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2"><TrendingUp className="text-indigo-500" size={18} /> Closing This Month</h3>
                <Link href="/kanban" className="text-[9px] font-black text-indigo-600 hover:underline">Negotiate Now</Link>
             </div>
             <div className="space-y-4 text-center py-4">
                <p className="text-5xl font-black text-slate-900 tracking-tighter">{summary?.dealsClosingThisMonth?.length || 0}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Opportunities Found</p>
                <div className="pt-6 px-10">
                   <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: '65%' }} /></div>
                   <div className="flex items-center justify-between mt-2 text-[9px] font-black uppercase text-indigo-600 tracking-widest"><span>Monthly Progress</span><span>65%</span></div>
                </div>
             </div>
          </div>
      </div>
    </div>
  );
}

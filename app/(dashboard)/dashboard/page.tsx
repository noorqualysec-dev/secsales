"use client";

import { 
  useSalesSummary, 
  useCreateTask, 
  useScheduleMeeting, 
  useUpdateTask, 
  useUpdateMeeting 
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
  Filter,
  Eye,
  Plus,
  TrendingUp,
  X,
  Pencil,
  CheckCircle,
  AlertCircle,
  Search
} from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";
import { useAuth } from "@/app/hooks/useAuth";

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
  const [form, setForm] = useState(initial || { title: "", from: "", to: "", leadId: "" });
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
  const isAdmin = user?.role === 'admin';
  const [dateFilter, setDateFilter] = useState<"Today" | "Last Month" | "All Time" | "Custom">("Today");
  const [customRange, setCustomRange] = useState<{ start: string; end: string }>({ start: "", end: "" });
  const [modal, setModal] = useState<{ type: "task" | "meeting" | null; initial?: any } | null>(null);
  const [searchQuery, setSearchQuery] = useState({ tasks: "", meetings: "" });
  
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
  const updateMeeting = useUpdateMeeting();

  const summary = summaryData?.data;
  const leads = leadsData?.data ?? [];

  const handleTaskStatusCycle = (task: any) => {
    const statuses = ["Pending", "Waiting on someone", "Completed", "Deferred"];
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
    m.title.toLowerCase().includes(searchQuery.meetings.toLowerCase()) || 
    m.leadName?.toLowerCase().includes(searchQuery.meetings.toLowerCase())
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
        {/* Open Tasks Table */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col min-h-[400px]">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
             <div className="flex items-center gap-3">
                <CheckCircle2 className="text-indigo-600" size={18} />
                <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">My Open Tasks</h2>
                <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-bold">{filteredTasks?.length || 0}</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="relative group/search">
                   <input 
                     className="w-0 group-hover/search:w-32 focus:w-32 bg-slate-50 border-none rounded-lg px-2 py-1 text-[9px] font-black transition-all outline-none" 
                     placeholder="Search tasks..."
                     value={searchQuery.tasks}
                     onChange={e => setSearchQuery({...searchQuery, tasks: e.target.value})}
                   />
                   <Search size={16} className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none p-0.5" />
                </div>
                <button onClick={() => setModal({ type: "task" })} className="text-slate-400 hover:text-indigo-600 transition p-2 bg-slate-50 rounded-xl hover:rotate-90 duration-300"><Plus size={18} /></button>
             </div>
          </div>
          <div className="flex-1 overflow-x-auto text-[11px]">
             {filteredTasks?.length === 0 ? (
               <div className="h-64 flex flex-col items-center justify-center text-slate-300 italic">No tasks found</div>
             ) : (
               <table className="w-full">
                 <thead>
                    <tr className="text-slate-400 font-black uppercase text-[9px] tracking-widest bg-slate-50/50">
                       <th className="px-8 py-4 text-left">Subject</th>
                       <th className="px-8 py-4 text-left">Related Lead</th>
                       <th className="px-8 py-4 text-left">Due Date</th>
                       <th className="px-8 py-4 text-left">Status</th>
                       <th className="px-8 py-4 text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {filteredTasks?.map((task: any, idx: number) => (
                      <tr key={task.id || idx} className="hover:bg-indigo-50/30 transition group">
                         <td className="px-8 py-4 font-bold text-slate-700">{task.subject}</td>
                         <td className="px-8 py-4">
                            <div className="flex flex-col">
                               <span className="font-bold text-slate-900">{task.leadName || "—"}</span>
                               <span className="text-[8px] font-black uppercase text-slate-400">{task.company}</span>
                            </div>
                         </td>
                         <td className="px-8 py-4 text-slate-400">{new Date(task.dueDate).toLocaleDateString()}</td>
                         <td className="px-8 py-4">
                            <button 
                              onClick={() => handleTaskStatusCycle(task)}
                              className={`px-3 py-1 flex items-center gap-2 rounded-full font-black text-[8px] uppercase tracking-wider shadow-sm transition active:scale-95 ${
                                task.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                task.status === 'Waiting on someone' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                'bg-slate-50 text-slate-600 border border-slate-100'
                              }`}
                            >
                               <div className={`w-1.5 h-1.5 rounded-full ${
                                 task.status === 'Completed' ? 'bg-emerald-500' :
                                 task.status === 'Waiting on someone' ? 'bg-amber-500' :
                                 'bg-slate-400'
                               }`} />
                               {task.status}
                            </button>
                         </td>
                         <td className="px-8 py-4 text-right">
                            <button onClick={() => setModal({ type: "task", initial: task })} className="p-2 text-slate-300 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition"><Pencil size={14} /></button>
                         </td>
                      </tr>
                    ))}
                 </tbody>
               </table>
             )}
          </div>
        </div>

        {/* Meetings Table */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col min-h-[400px]">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
             <div className="flex items-center gap-3">
                <Calendar className="text-indigo-600" size={18} />
                <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">My Meetings</h2>
                <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-bold">{filteredMeetings?.length || 0}</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="relative group/search">
                   <input 
                     className="w-0 group-hover/search:w-32 focus:w-32 bg-slate-50 border-none rounded-lg px-2 py-1 text-[9px] font-black transition-all outline-none" 
                     placeholder="Search meetings..."
                     value={searchQuery.meetings}
                     onChange={e => setSearchQuery({...searchQuery, meetings: e.target.value})}
                   />
                   <Search size={16} className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none p-0.5" />
                </div>
                <button className="p-2 text-slate-400 hover:text-indigo-600 bg-slate-50 rounded-xl transition"><Filter size={18} /></button>
                <button onClick={() => setModal({ type: "meeting" })} className="text-slate-400 hover:text-indigo-600 transition p-2 bg-slate-50 rounded-xl hover:scale-110 duration-300"><Plus size={18} /></button>
             </div>
          </div>
          <div className="flex-1 overflow-x-auto text-[11px]">
             {filteredMeetings?.length === 0 ? (
               <div className="h-64 flex flex-col items-center justify-center text-slate-300 italic">No meetings found</div>
             ) : (
               <table className="w-full">
                 <thead>
                    <tr className="text-slate-400 font-black uppercase text-[9px] tracking-widest bg-slate-50/50">
                       <th className="px-8 py-4 text-left">Title</th>
                       <th className="px-8 py-4 text-left">Prospect Details</th>
                       <th className="px-8 py-4 text-left">Time</th>
                       <th className="px-8 py-4 text-right">Edit</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {filteredMeetings?.map((m: any, idx: number) => (
                      <tr key={m.id || idx} className="hover:bg-indigo-50/30 transition group">
                         <td className="px-8 py-4 font-bold text-slate-700">{m.title}</td>
                         <td className="px-8 py-4">
                            <div className="flex flex-col">
                               <span className="font-bold text-slate-900">{m.leadName || "—"}</span>
                               <span className="text-[8px] font-black uppercase text-slate-400">{m.company}</span>
                            </div>
                         </td>
                         <td className="px-8 py-4 text-slate-400 font-medium">
                            <div className="flex flex-col">
                               <span>{new Date(m.from).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                               <span className="text-[9px] opacity-70">to {new Date(m.to).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                         </td>
                         <td className="px-8 py-4 text-right">
                            <button onClick={() => setModal({ type: "meeting", initial: m })} className="p-2 text-slate-300 hover:text-indigo-600 transition opacity-0 group-hover:opacity-100"><Pencil size={14} /></button>
                         </td>
                      </tr>
                    ))}
                 </tbody>
               </table>
             )}
          </div>
        </div>
      </div>

      {/* Admin Leaderboard AB Testing View (Worthy check) */}
      {isAdmin && (
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

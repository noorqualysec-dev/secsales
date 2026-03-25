"use client";

import { useAdminLeads, useAdminUsers, useAssignLead } from "@/app/hooks/useAdmin";
import { 
  Database, 
  ArrowRightLeft, 
  Search,
  CheckCircle2,
  Clock,
  History,
  X,
  MessageSquare,
  Building2,
  Briefcase,
  ChevronDown,
  Plus,
  UserPlus,
  Eye,
  FileText
} from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Lead, User, TimelineEvent } from "@/app/types";

function TimelineModal({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  // ... (keeping internal logic same, but adding icons)
  const getEventIcon = (event: string) => {
    switch (event) {
      case "Creation": return <Plus className="w-4 h-4" />;
      case "Status Changed": return <History className="w-4 h-4" />;
      case "Remark Added": return <MessageSquare className="w-4 h-4" />;
      case "Assigned": return <UserPlus className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Global Lifecycle Audit</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Timeline for {lead.firstName} {lead.lastName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="space-y-8 relative before:absolute before:inset-0 before:left-[19px] before:w-0.5 before:bg-slate-100 before:h-full">
            {[...(lead.timeline || [])].reverse().map((ev, i) => (
              <div key={i} className="relative pl-12 group">
                <div className="absolute left-0 w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border-4 border-white shadow-sm z-10 transition-transform group-hover:scale-110">
                   {getEventIcon(ev.event)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">{ev.event}</p>
                    <p className="text-[10px] font-bold text-slate-400">{new Date(ev.timestamp).toLocaleString("en-IN")}</p>
                  </div>
                  {ev.remark && (
                    <p className="text-xs font-medium text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">"{ev.remark}"</p>
                  )}
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-1">
                      BY {typeof ev.performedBy === 'object' ? ev.performedBy.name : 'System/Anonymous'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLeadsPage() {
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status") || undefined;
  
  const { data: leadsData, isLoading: leadsLoading } = useAdminLeads(statusFilter);
  const { data: usersData } = useAdminUsers();
  const assignLead = useAssignLead();

  const [assigningLead, setAssigningLead] = useState<Lead | null>(null);
  const [timelineLead, setTimelineLead] = useState<Lead | null>(null);
  const [targetUser, setTargetUser] = useState<string>("");

  const leads = leadsData?.data ?? [];
  const users = usersData?.data ?? [];

  const handleAssign = () => {
    if (!assigningLead || !targetUser) return;
    assignLead.mutate({ leadId: assigningLead._id, userId: targetUser }, {
      onSuccess: () => setAssigningLead(null)
    });
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      "Lead Captured": "bg-slate-50 text-slate-600 border-slate-100",
      "Contacted": "bg-blue-50 text-blue-600 border-blue-100",
      "Qualified": "bg-indigo-50 text-indigo-600 border-indigo-100",
      "Proposal Sent": "bg-amber-50 text-amber-600 border-amber-100",
      "Negotiation": "bg-orange-50 text-orange-600 border-orange-100",
      "Won": "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-50",
      "Lost": "bg-rose-50 text-rose-600 border-rose-100 shadow-rose-50",
    };
    const cls = colors[status] || "bg-slate-50 text-slate-600 border-slate-100 shadow-slate-50";
    
    return (
      <span className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full border shadow-sm ${cls}`}>
        <div className={`w-1.5 h-1.5 rounded-full ${cls.split(' ')[1].replace('text-', 'bg-')}`} />
        {status}
      </span>
    );
  };

  if (leadsLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 w-48 bg-slate-200 rounded-lg mb-6" />
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-16 bg-slate-100 rounded-2xl border border-slate-200 shadow-sm" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Reassignment Modal */}
      {assigningLead && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-fade-in-up border border-slate-200 p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center">
                <ArrowRightLeft className="text-indigo-600 w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Reassign Global Lead</h3>
                <p className="text-slate-500 text-sm font-medium mt-1">Select a platform representative for <span className="text-indigo-600 font-bold">{assigningLead.firstName} {assigningLead.lastName}</span></p>
              </div>
            </div>
            <div className="space-y-6">
               <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest pl-1">Target Representative</label>
                <div className="relative group">
                  <select
                    value={targetUser}
                    onChange={(e) => setTargetUser(e.target.value)}
                    className="w-full appearance-none bg-slate-50 hover:bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-800 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 cursor-pointer shadow-sm pr-12 group-hover:scale-[1.01]"
                  >
                    <option value="">— DISPATCH TO... —</option>
                    {users.filter(u => u.role !== 'admin').map((u: User) => (
                      <option key={u._id} value={u._id}>
                        {u.name} · {u.role.replace('_', ' ').toUpperCase()}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-indigo-600 transition" />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setAssigningLead(null)} className="flex-1 px-6 py-4 rounded-2xl border border-slate-200 text-slate-500 font-extrabold text-xs uppercase tracking-[0.2em] transition-all duration-300 hover:bg-slate-50 active:scale-95 shadow-sm">
                  Cancel
                </button>
                <button
                  onClick={handleAssign}
                  disabled={!targetUser || assignLead.isPending}
                  className="flex-1 px-6 py-4 rounded-2xl bg-indigo-600 text-white font-extrabold text-xs uppercase tracking-[0.2em] transition-all duration-300 hover:bg-indigo-500 shadow-xl shadow-indigo-500/20 active:scale-95 disabled:opacity-50"
                >
                  {assignLead.isPending ? "Assigning..." : "Confirm Handoff"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {timelineLead && <TimelineModal lead={timelineLead} onClose={() => setTimelineLead(null)} />}

      {/* Leads Table Management */}
      <div className="flex items-center justify-between px-2">
        <h2 className="text-sm font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <Database size={16} /> Global Lead Monitoring <span className="bg-slate-100 px-2 py-0.5 rounded-full text-[10px] text-slate-800 border border-slate-200 shadow-sm">{leads.length} Total</span>
        </h2>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl group/container">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[10px] font-extrabold uppercase tracking-[0.2em]">
                <th className="px-8 py-5">Identity (Source Rep)</th>
                <th className="px-8 py-5">Affiliation</th>
                <th className="px-8 py-5">Pipeline State</th>
                <th className="px-8 py-5">Current Target</th>
                <th className="px-8 py-5 text-right">Audit & Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {leads.map((lead: Lead) => (
                <tr key={lead._id} className="hover:bg-slate-50/80 transition-all duration-300 group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                        {lead.firstName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors uppercase">{lead.firstName} {lead.lastName}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-tighter">ORIGIN: {typeof lead.createdBy === 'object' ? lead.createdBy.name : 'System Acquisition'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                     <div className="space-y-0.5">
                        <p className="text-xs font-bold text-slate-700 uppercase">{lead.company ?? "Privately Held"}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lead.industry || "General Inquiry"}</p>
                     </div>
                  </td>
                  <td className="px-8 py-5">
                    {getStatusBadge(lead.status)}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 group-hover:translate-x-1 transition-transform duration-300">
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-tighter">
                        {typeof lead.assignedTo === 'object' && lead.assignedTo ? lead.assignedTo.name : 'Unassigned Pool'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center gap-3 justify-end">
                      <Link
                        href={`/admin/leads/${lead._id}`}
                        className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:border-indigo-400 hover:text-indigo-600 hover:shadow-md transition-all duration-300"
                        title="View Full Lead Journey"
                      >
                        <Eye size={16} />
                      </Link>
                      <button
                        onClick={() => setTimelineLead(lead)}
                        className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:border-indigo-400 hover:text-indigo-600 hover:shadow-md transition-all duration-300"
                        title="Quick Lifecycle Audit"
                      >
                        <History size={16} />
                      </button>
                      <button
                        onClick={() => setAssigningLead(lead)}
                        className="inline-flex items-center gap-2.5 font-extrabold text-[10px] uppercase tracking-[0.2em] bg-white border border-slate-200 px-5 py-3 rounded-2xl text-slate-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-slate-50 transition-all duration-300 active:scale-95 shadow-sm group-hover:shadow-md"
                      >
                        <ArrowRightLeft size={14} className="group-hover:rotate-180 transition-transform duration-500" /> Dispatch
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

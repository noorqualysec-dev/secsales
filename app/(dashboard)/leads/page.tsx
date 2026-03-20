"use client";

import { useState } from "react";
import { useLeads, useCreateLead, useUpdateLead, useDeleteLead } from "@/app/hooks/useLeads";
import type { Lead, LeadStatus, LeadSource, TimelineEvent } from "@/app/types";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Users, 
  History, 
  X, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  UserPlus, 
  ArrowRightLeft,
  Building2,
  Briefcase
} from "lucide-react";

// ── Configuration ────────────────────────────────────────────────────────────

const LEAD_STATUSES: LeadStatus[] = [
  "Lead Captured", "Discovery Call Scheduled", "Requirement Gathering",
  "Pre-Assessment Form Sent", "Proposal Preparation", "Proposal Sent",
  "Negotiation", "Won", "Lost",
];

const LEAD_SOURCES: LeadSource[] = [
  "website", "email_marketing", "linkedin", "referral",
  "events", "recurring", "partnership", "offline_source", "other",
];

const EMPLOYEE_STRENGTHS = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"];

const statusColors: Record<string, string> = {
  "Lead Captured": "bg-blue-50 text-blue-600 border-blue-100",
  "Discovery Call Scheduled": "bg-purple-50 text-purple-600 border-purple-100",
  "Requirement Gathering": "bg-yellow-50 text-yellow-600 border-yellow-100",
  "Pre-Assessment Form Sent": "bg-orange-50 text-orange-600 border-orange-100",
  "Proposal Preparation": "bg-indigo-50 text-indigo-600 border-indigo-100",
  "Proposal Sent": "bg-cyan-50 text-cyan-600 border-cyan-100",
  "Negotiation": "bg-amber-50 text-amber-600 border-amber-100",
  "Won": "bg-emerald-50 text-emerald-600 border-emerald-100",
  "Lost": "bg-rose-50 text-rose-600 border-rose-100",
};

// ── Components ───────────────────────────────────────────────────────────────

function TimelineModal({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const getEventIcon = (event: string) => {
    switch (event) {
      case "Creation": return <Plus className="w-4 h-4" />;
      case "Status Change": return <History className="w-4 h-4" />;
      case "Remark Added": return <MessageSquare className="w-4 h-4" />;
      case "Assigned": return <UserPlus className="w-4 h-4" />;
      case "Won": return <CheckCircle2 className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Lead Lifecycle</h2>
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
                <div className={`absolute left-0 w-10 h-10 rounded-2xl flex items-center justify-center border-4 border-white shadow-sm z-10 transition-transform group-hover:scale-110 ${
                   ev.event === 'Won' ? 'bg-emerald-100 text-emerald-600' : 
                   ev.event === 'Lost' ? 'bg-rose-100 text-rose-600' : 'bg-indigo-50 text-indigo-600'
                }`}>
                  {getEventIcon(ev.event)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">{ev.event}</p>
                    <p className="text-[10px] font-bold text-slate-400">{new Date(ev.timestamp).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                  {ev.status && (
                    <span className="inline-block text-[10px] font-extrabold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200 uppercase tracking-tighter">
                      SHIFTD TO: {ev.status}
                    </span>
                  )}
                  {ev.remark && (
                    <p className="text-xs font-medium text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">
                      "{ev.remark}"
                    </p>
                  )}
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-1 flex items-center gap-1">
                     <Clock size={10} /> BY {typeof ev.performedBy === 'object' ? ev.performedBy.name : 'Unknown User'}
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

const emptyForm = {
  firstName: "", lastName: "", email: "", phone: "",
  company: "", country: "", industry: "",
  designation: "", employeeStrength: "",
  status: "Lead Captured" as LeadStatus,
  source: "website" as LeadSource,
  latestRemark: ""
};

function LeadModal({ initial, onSave, onClose, isSaving }: { 
  initial: typeof emptyForm; 
  onSave: (d: typeof emptyForm) => void; 
  onClose: () => void; 
  isSaving: boolean;
}) {
  const [form, setForm] = useState(initial);
  const set = (k: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const sectionLabelCls = "text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] mb-4 mt-6 first:mt-0 flex items-center gap-2";
  const inputCls = "w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 focus:bg-white transition-all duration-300";
  const labelCls = "text-[11px] font-bold text-slate-500 mb-1.5 block ml-1";

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {initial.firstName ? "Modify Intelligence" : "Capture New Lead"}
            </h2>
            <p className="text-slate-500 text-sm font-medium mt-1">Precision data entry for the sales pipeline.</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 transition-all duration-300 hover:rotate-90">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="overflow-y-auto px-10 py-8 custom-scrollbar space-y-8">
          
          <div>
            <h3 className={sectionLabelCls}><Users size={14} /> Identity & Contact</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className={labelCls}>First Name *</label>
                <input className={inputCls} value={form.firstName} onChange={set("firstName")} required placeholder="John" />
              </div>
              <div>
                <label className={labelCls}>Last Name *</label>
                <input className={inputCls} value={form.lastName} onChange={set("lastName")} required placeholder="Doe" />
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Primary Email *</label>
                <input className={inputCls} type="email" value={form.email} onChange={set("email")} required placeholder="example@corporate.com" />
              </div>
              <div>
                 <label className={labelCls}>Designation</label>
                 <input className={inputCls} value={form.designation} onChange={set("designation")} placeholder="C-Level, VP, etc." />
              </div>
              <div>
                <label className={labelCls}>Phone Line</label>
                <input className={inputCls} value={form.phone} onChange={set("phone")} placeholder="+91..." />
              </div>
            </div>
          </div>

          <div>
            <h3 className={sectionLabelCls}><Building2 size={14} /> Organization Profile</h3>
            <div className="grid grid-cols-2 gap-6">
               <div className="col-span-2">
                <label className={labelCls}>Company Legal Name</label>
                <input className={inputCls} value={form.company} onChange={set("company")} placeholder="Global Tech Corp" />
              </div>
               <div>
                <label className={labelCls}>Employee Strength</label>
                <select className={inputCls} value={form.employeeStrength} onChange={set("employeeStrength")}>
                  <option value="">Select Scale</option>
                  {EMPLOYEE_STRENGTHS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
               <div>
                <label className={labelCls}>Industry Sector</label>
                <input className={inputCls} value={form.industry} onChange={set("industry")} placeholder="Fintech, SaaS, etc." />
              </div>
            </div>
          </div>

          <div>
             <h3 className={sectionLabelCls}><Briefcase size={14} /> Pipeline Strategy</h3>
             <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className={labelCls}>Pipeline State</label>
                  <select className={inputCls} value={form.status} onChange={set("status")}>
                    {LEAD_STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Discovery Source</label>
                  <select className={inputCls} value={form.source} onChange={set("source")}>
                    {LEAD_SOURCES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ').toUpperCase()}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                   <label className={labelCls}>{initial.firstName ? "Current Remarks / Updates" : "Initial Remarks"}</label>
                   <textarea 
                    className={`${inputCls} h-32 resize-none pt-4`} 
                    value={form.latestRemark} 
                    onChange={set("latestRemark")}
                    placeholder="Enter strategic notes about this state change..."
                   />
                </div>
             </div>
          </div>

          <div className="flex gap-4 pt-6 sticky bottom-0 bg-white pb-2">
            <button type="button" onClick={onClose} className="flex-1 px-8 py-4 rounded-2xl border border-slate-200 text-slate-500 font-extrabold text-xs uppercase tracking-widest hover:bg-slate-50 transition active:scale-95 shadow-sm">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="flex-1 px-8 py-4 rounded-2xl bg-indigo-600 text-white font-extrabold text-xs uppercase tracking-widest hover:bg-slate-800 transition active:scale-95 shadow-xl shadow-indigo-500/10 disabled:opacity-50">
              {isSaving ? "Transmitting..." : initial.firstName ? "Update Record" : "Archive Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LeadsPage() {
  const { data, isLoading, error } = useLeads();
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();

  const [modal, setModal] = useState<{ open: boolean; lead?: Lead }>({ open: false });
  const [timelineLead, setTimelineLead] = useState<Lead | null>(null);

  const leads = data?.data ?? [];

  const handleSave = (form: typeof emptyForm) => {
    if (modal.lead) {
      updateLead.mutate(
        { id: modal.lead._id, data: form },
        { onSuccess: () => setModal({ open: false }) }
      );
    } else {
      createLead.mutate(form, { onSuccess: () => setModal({ open: false }) });
    }
  };

  if (error) return (
     <div className="bg-rose-50 border border-rose-200 rounded-3xl p-12 text-center text-rose-600 space-y-4">
        <X size={48} className="mx-auto" />
        <p className="font-extrabold text-sm uppercase tracking-widest">Global Sync Failed</p>
        <p className="text-sm font-medium opacity-70">Encountered an error fetching the lead database. Reconnecting...</p>
     </div>
  );

  return (
    <>
      {modal.open && (
        <LeadModal
          initial={modal.lead ? {
            firstName: modal.lead.firstName, lastName: modal.lead.lastName,
            email: modal.lead.email, phone: modal.lead.phone ?? "",
            company: modal.lead.company ?? "", country: modal.lead.country ?? "",
            industry: modal.lead.industry ?? "", status: modal.lead.status,
            source: modal.lead.source, designation: modal.lead.designation ?? "",
            employeeStrength: modal.lead.employeeStrength ?? "",
            latestRemark: "" // Always start empty for updates to prevent accidental duplicate logging
          } : emptyForm}
          onSave={handleSave}
          onClose={() => setModal({ open: false })}
          isSaving={createLead.isPending || updateLead.isPending}
        />
      )}

      {timelineLead && <TimelineModal lead={timelineLead} onClose={() => setTimelineLead(null)} />}

      <div className="space-y-8 animate-fade-in-up">
        {/* Header toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
          <div>
            <h2 className="text-sm font-extrabold text-slate-500 uppercase tracking-[0.2em] mb-1 flex items-center gap-2">
              <Plus size={16} /> Internal Lead Management
            </h2>
            <p className="text-xl font-extrabold text-slate-900 tracking-tight">Active Pipeline Intelligence <span className="text-indigo-600 ml-2">[{leads.length}]</span></p>
          </div>
          <button
            onClick={() => setModal({ open: true })}
            className="w-full md:w-auto flex items-center justify-center gap-3 bg-indigo-600 hover:bg-slate-900 text-white px-4 py-2 rounded-[2rem] text-sm font-extrabold uppercase tracking-widest transition-all duration-500 hover:scale-105 active:scale-95 shadow-xl shadow-indigo-500/20"
          >
            <Plus size={16} /> Add Intelligence
          </button>
        </div>

        {/* Global Monitor Table */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-lg overflow-hidden transition-shadow duration-500 hover:shadow-2xl group/monitor">
          {isLoading ? (
            <div className="p-12 space-y-6">
              {[...Array(6)].map((_, i) => <div key={i} className="h-20 bg-slate-50 rounded-[2rem] animate-pulse border border-slate-100" />)}
            </div>
          ) : leads.length === 0 ? (
            <div className="py-24 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-slate-300">
                <Users size={40} />
              </div>
              <p className="text-sm font-extrabold text-slate-400 uppercase tracking-widest">No Intelligence Data Detected</p>
              <p className="text-sm text-slate-400 mt-2">Initialize your database by adding your first lead entry.</p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-50 text-slate-400 text-[10px] font-extrabold uppercase tracking-[0.25em]">
                    <th className="px-10 py-6">Prospect Identity</th>
                    <th className="px-10 py-6 hidden md:table-cell">Affiliation</th>
                    <th className="px-10 py-6">Pipeline State</th>
                    <th className="px-10 py-6 hidden lg:table-cell">Archived Note</th>
                    <th className="px-10 py-6 text-right">Strategic Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {leads.map((lead: Lead) => (
                    <tr key={lead._id} className="hover:bg-slate-50/80 transition-all duration-300 group">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black border transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3 ${
                             lead.status === 'Won' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                          }`}>
                            {lead.firstName[0]}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 tracking-tight transition-colors uppercase">{lead.firstName} {lead.lastName}</p>
                            <p className="text-xs font-bold text-slate-400 mt-0.5">{lead.designation || lead.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                         <div className="space-y-0.5">
                            <p className="text-xs font-bold text-slate-700 uppercase">{lead.company ?? "Privately Held"}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lead.industry || "—"}</p>
                         </div>
                      </td>
                      <td className="px-10 py-6">
                         <span className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full border shadow-sm transition-all duration-500 group-hover:scale-105 ${
                           statusColors[lead.status] || "bg-slate-50 text-slate-600 border-slate-100"
                         }`}>
                           <div className={`w-1.5 h-1.5 rounded-full ${statusColors[lead.status]?.split(' ')[1].replace('text-', 'bg-')}`} />
                           {lead.status}
                         </span>
                      </td>
                      <td className="px-10 py-6 hidden lg:table-cell max-w-[200px]">
                         <p className="text-xs font-medium text-slate-500 italic truncate" title={lead.latestRemark}>
                           {lead.latestRemark ? `"${lead.latestRemark}"` : "No remarks recorded."}
                         </p>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-3 justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button
                            onClick={() => setTimelineLead(lead)}
                            className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:border-indigo-400 hover:text-indigo-600 hover:shadow-md transition-all duration-300"
                            title="View Lifecycle Timeline"
                          >
                            <History size={16} />
                          </button>
                          <button
                            onClick={() => setModal({ open: true, lead })}
                            className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:border-indigo-400 hover:text-indigo-600 hover:shadow-md transition-all duration-300"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(lead._id)}
                            disabled={deleteLead.isPending}
                            className="p-3 bg-white border border-rose-200 rounded-2xl text-rose-300 hover:bg-rose-50 hover:text-rose-600 hover:shadow-md transition-all duration-300 disabled:opacity-30"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

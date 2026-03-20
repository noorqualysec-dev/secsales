"use client";

import { useState } from "react";
import { useLeads, useCreateLead, useUpdateLead, useDeleteLead } from "@/app/hooks/useLeads";
import type { Lead, LeadStatus, LeadSource } from "@/app/types";
import { Plus, Pencil, Trash2, Users } from "lucide-react";

// ── Status & source config ────────────────────────────────────────────────────

const LEAD_STATUSES: LeadStatus[] = [
  "Lead Captured", "Discovery Call Scheduled", "Requirement Gathering",
  "Pre-Assessment Form Sent", "Proposal Preparation", "Proposal Sent",
  "Negotiation", "Won", "Lost",
];

const LEAD_SOURCES: LeadSource[] = [
  "website", "email_marketing", "linkedin", "referral",
  "events", "recurring", "partnership", "offline_source", "other",
];

const statusColors: Record<string, string> = {
  "Lead Captured": "bg-blue-100 text-blue-700",
  "Discovery Call Scheduled": "bg-purple-100 text-purple-700",
  "Requirement Gathering": "bg-yellow-100 text-yellow-700",
  "Pre-Assessment Form Sent": "bg-orange-100 text-orange-700",
  "Proposal Preparation": "bg-indigo-100 text-indigo-700",
  "Proposal Sent": "bg-cyan-100 text-cyan-700",
  "Negotiation": "bg-amber-100 text-amber-700",
  "Won": "bg-green-100 text-green-700",
  "Lost": "bg-red-100 text-red-700",
};

// ── Empty form ────────────────────────────────────────────────────────────────

const emptyForm = {
  firstName: "", lastName: "", email: "", phone: "",
  company: "", country: "", industry: "",
  status: "Lead Captured" as LeadStatus,
  source: "other" as LeadSource,
};

// ── Modal ─────────────────────────────────────────────────────────────────────

function LeadModal({
  initial,
  onSave,
  onClose,
  isSaving,
}: {
  initial: typeof emptyForm;
  onSave: (d: typeof emptyForm) => void;
  onClose: () => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState(initial);
  const set = (k: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const inputCls = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition";
  const labelCls = "text-xs font-medium text-slate-600 mb-1 block";

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">
            {initial.firstName ? "Edit Lead" : "Add New Lead"}
          </h2>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); onSave(form); }}
          className="px-6 py-5 space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>First Name *</label>
              <input className={inputCls} value={form.firstName} onChange={set("firstName")} required />
            </div>
            <div>
              <label className={labelCls}>Last Name *</label>
              <input className={inputCls} value={form.lastName} onChange={set("lastName")} required />
            </div>
          </div>

          <div>
            <label className={labelCls}>Email *</label>
            <input className={inputCls} type="email" value={form.email} onChange={set("email")} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Phone</label>
              <input className={inputCls} value={form.phone} onChange={set("phone")} />
            </div>
            <div>
              <label className={labelCls}>Company</label>
              <input className={inputCls} value={form.company} onChange={set("company")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Country</label>
              <input className={inputCls} value={form.country} onChange={set("country")} />
            </div>
            <div>
              <label className={labelCls}>Industry</label>
              <input className={inputCls} value={form.industry} onChange={set("industry")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Status</label>
              <select className={inputCls} value={form.status} onChange={set("status")}>
                {LEAD_STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Source</label>
              <select className={inputCls} value={form.source} onChange={set("source")}>
                {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-slate-200 rounded-lg py-2 text-sm text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium transition disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LeadsPage() {
  const { data, isLoading, error } = useLeads();
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();

  const [modal, setModal] = useState<{ open: boolean; lead?: Lead }>({ open: false });

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

  const handleDelete = (id: string) => {
    if (!confirm("Delete this lead?")) return;
    deleteLead.mutate(id);
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-600 text-sm">
        Failed to load leads. Please try refreshing.
      </div>
    );
  }

  return (
    <>
      {modal.open && (
        <LeadModal
          initial={modal.lead ? {
            firstName: modal.lead.firstName, lastName: modal.lead.lastName,
            email: modal.lead.email, phone: modal.lead.phone ?? "",
            company: modal.lead.company ?? "", country: modal.lead.country ?? "",
            industry: modal.lead.industry ?? "", status: modal.lead.status,
            source: modal.lead.source,
          } : emptyForm}
          onSave={handleSave}
          onClose={() => setModal({ open: false })}
          isSaving={createLead.isPending || updateLead.isPending}
        />
      )}

      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {isLoading ? "Loading..." : `${leads.length} lead${leads.length !== 1 ? "s" : ""} total`}
          </p>
          <button
            onClick={() => setModal({ open: true })}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            <Plus size={16} /> Add Lead
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {isLoading ? (
            <div className="p-8 space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />)}
            </div>
          ) : leads.length === 0 ? (
            <div className="py-20 text-center">
              <Users className="mx-auto mb-3 w-10 h-10 text-slate-300" />
              <p className="text-sm text-slate-400">No leads yet. Click "Add Lead" to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Company</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Source</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Date</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leads.map((lead: Lead) => (
                    <tr key={lead._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-xs shrink-0">
                            {lead.firstName[0]}{lead.lastName[0]}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{lead.firstName} {lead.lastName}</p>
                            <p className="text-xs text-slate-500">{lead.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600 hidden md:table-cell">{lead.company ?? "—"}</td>
                      <td className="px-5 py-4 text-slate-600 hidden lg:table-cell capitalize">{lead.source.replace(/_/g, " ")}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[lead.status] ?? "bg-slate-100 text-slate-600"}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-500 text-xs hidden lg:table-cell">
                        {new Date(lead.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => setModal({ open: true, lead })}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-500 transition"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(lead._id)}
                            disabled={deleteLead.isPending}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition disabled:opacity-40"
                          >
                            <Trash2 size={14} />
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

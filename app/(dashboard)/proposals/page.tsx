"use client";

import { useState } from "react";
import { useProposals, useCreateProposal, useUpdateProposal, useDeleteProposal } from "@/app/hooks/useProposals";
import { useLeads } from "@/app/hooks/useLeads";
import type { Proposal, ProposalStatus, Lead } from "@/app/types";
import { Plus, Pencil, Trash2, FileText } from "lucide-react";

// ── Config ────────────────────────────────────────────────────────────────────

const PROPOSAL_STATUSES: ProposalStatus[] = ["Draft", "Sent", "In Negotiation", "Accepted", "Rejected"];

const TEST_SCOPES = [
  "Web App Pentest", "API Pentest", "Mobile App Pentest",
  "Cloud Security", "Network Pentest", "Social Engineering",
  "Source Code Review", "Red Team Exercise",
];

const statusColors: Record<ProposalStatus, string> = {
  Draft: "bg-slate-100 text-slate-600",
  Sent: "bg-blue-100 text-blue-700",
  "In Negotiation": "bg-amber-100 text-amber-700",
  Accepted: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
};

// ── Modal ─────────────────────────────────────────────────────────────────────

function ProposalModal({
  initial,
  leads,
  onSave,
  onClose,
  isSaving,
  isEdit,
}: {
  initial: { leadId: string; value: string; testingScope: string[]; status: ProposalStatus; notes: string };
  leads: Lead[];
  onSave: (d: typeof initial) => void;
  onClose: () => void;
  isSaving: boolean;
  isEdit: boolean;
}) {
  const [form, setForm] = useState(initial);

  const toggleScope = (scope: string) =>
    setForm((f) => ({
      ...f,
      testingScope: f.testingScope.includes(scope)
        ? f.testingScope.filter((s) => s !== scope)
        : [...f.testingScope, scope],
    }));

  const inputCls = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition";
  const labelCls = "text-xs font-medium text-slate-600 mb-1 block";

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">
            {isEdit ? "Edit Proposal" : "New Proposal"}
          </h2>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="px-6 py-5 space-y-4">
          {/* Lead select — only on create */}
          {!isEdit && (
            <div>
              <label className={labelCls}>Select Lead *</label>
              <select
                className={inputCls}
                value={form.leadId}
                onChange={(e) => setForm((f) => ({ ...f, leadId: e.target.value }))}
                required
              >
                <option value="">— Choose a lead —</option>
                {leads.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.firstName} {l.lastName} {l.company ? `· ${l.company}` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className={labelCls}>Proposal Value (₹) *</label>
            <input
              className={inputCls}
              type="number"
              min="0"
              value={form.value}
              onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className={labelCls}>Testing Scope * (select all that apply)</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {TEST_SCOPES.map((scope) => {
                const selected = form.testingScope.includes(scope);
                return (
                  <button
                    key={scope}
                    type="button"
                    onClick={() => toggleScope(scope)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition font-medium ${
                      selected
                        ? "bg-indigo-500 text-white border-indigo-500"
                        : "border-slate-200 text-slate-600 hover:border-indigo-300"
                    }`}
                  >
                    {scope}
                  </button>
                );
              })}
            </div>
            {form.testingScope.length === 0 && (
              <p className="text-xs text-red-400 mt-1">Select at least one scope.</p>
            )}
          </div>

          <div>
            <label className={labelCls}>Status</label>
            <select className={inputCls} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ProposalStatus }))}>
              {PROPOSAL_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className={labelCls}>Notes</label>
            <textarea
              className={`${inputCls} resize-none`}
              rows={3}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-slate-200 rounded-lg py-2 text-sm text-slate-600 hover:bg-slate-50 transition">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || form.testingScope.length === 0}
              className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium transition disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save Proposal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const emptyForm = { leadId: "", value: "", testingScope: [] as string[], status: "Draft" as ProposalStatus, notes: "" };

export default function ProposalsPage() {
  const { data: proposalsData, isLoading, error } = useProposals();
  const { data: leadsData } = useLeads();
  const createProposal = useCreateProposal();
  const updateProposal = useUpdateProposal();
  const deleteProposal = useDeleteProposal();

  const [modal, setModal] = useState<{ open: boolean; proposal?: Proposal }>({ open: false });

  const proposals = proposalsData?.data ?? [];
  const leads = leadsData?.data ?? [];

  const handleSave = (form: typeof emptyForm) => {
    const payload = {
      ...(modal.proposal ? {} : { lead: form.leadId }),
      value: Number(form.value),
      testingScope: form.testingScope,
      status: form.status,
      notes: form.notes,
    };

    if (modal.proposal) {
      updateProposal.mutate(
        { id: modal.proposal._id, data: payload },
        { onSuccess: () => setModal({ open: false }) }
      );
    } else {
      createProposal.mutate(payload, { onSuccess: () => setModal({ open: false }) });
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this proposal?")) return;
    deleteProposal.mutate(id);
  };

  const getLeadName = (lead: Lead | string) => {
    if (typeof lead === "string") return "—";
    return `${lead.firstName} ${lead.lastName}`;
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-600 text-sm">
        Failed to load proposals. Please try refreshing.
      </div>
    );
  }

  return (
    <>
      {modal.open && (
        <ProposalModal
          initial={modal.proposal ? {
            leadId: typeof modal.proposal.lead === "string" ? modal.proposal.lead : modal.proposal.lead._id,
            value: String(modal.proposal.value),
            testingScope: modal.proposal.testingScope,
            status: modal.proposal.status,
            notes: modal.proposal.notes ?? "",
          } : emptyForm}
          leads={leads}
          onSave={handleSave}
          onClose={() => setModal({ open: false })}
          isSaving={createProposal.isPending || updateProposal.isPending}
          isEdit={!!modal.proposal}
        />
      )}

      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {isLoading ? "Loading..." : `${proposals.length} proposal${proposals.length !== 1 ? "s" : ""} total`}
          </p>
          <button
            onClick={() => setModal({ open: true })}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            <Plus size={16} /> New Proposal
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {isLoading ? (
            <div className="p-8 space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />)}
            </div>
          ) : proposals.length === 0 ? (
            <div className="py-20 text-center">
              <FileText className="mx-auto mb-3 w-10 h-10 text-slate-300" />
              <p className="text-sm text-slate-400">No proposals yet. Create your first proposal.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Lead</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Value</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Scope</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Date</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {proposals.map((p: Proposal) => (
                    <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4 font-medium text-slate-800">{getLeadName(p.lead as Lead | string)}</td>
                      <td className="px-5 py-4 text-slate-700 font-semibold">
                        ₹{p.value.toLocaleString("en-IN")}
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {p.testingScope.slice(0, 2).map((s) => (
                            <span key={s} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{s}</span>
                          ))}
                          {p.testingScope.length > 2 && (
                            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">+{p.testingScope.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[p.status]}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-500 text-xs hidden lg:table-cell">
                        {new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => setModal({ open: true, proposal: p })}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-500 transition"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(p._id)}
                            disabled={deleteProposal.isPending}
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

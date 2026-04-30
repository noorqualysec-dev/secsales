"use client";

import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  Calendar,
  Mail,
  Phone,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";
import { useCompanyDetails } from "@/app/hooks/useLeads";

type CompanyDetailViewProps = {
  companyKey: string;
  backHref: string;
  backLabel: string;
  leadBasePath?: string;
  globalScope?: boolean;
};

function formatDate(value?: number) {
  if (!value) return "Not set";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatPhone(phone?: string, code?: string) {
  return [code, phone].filter(Boolean).join(" ").trim();
}

export function CompanyDetailView({
  companyKey,
  backHref,
  backLabel,
  leadBasePath = "/leads",
  globalScope = false,
}: CompanyDetailViewProps) {
  const { data, isLoading, error } = useCompanyDetails(companyKey, { globalScope });
  const company = data?.data;

  if (error) {
    return (
      <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-8 text-rose-700">
        Unable to load this company right now.
      </div>
    );
  }

  if (isLoading || !company) {
    return (
      <div className="space-y-6">
        <div className="h-12 w-44 animate-pulse rounded-2xl bg-slate-100" />
        <div className="h-56 animate-pulse rounded-[2.5rem] bg-slate-100" />
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="h-96 animate-pulse rounded-[2rem] bg-slate-100" />
          <div className="h-96 animate-pulse rounded-[2rem] bg-slate-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition hover:border-sky-200 hover:text-sky-700"
      >
        <ArrowLeft size={16} /> {backLabel}
      </Link>

      <section className="rounded-[2.5rem] border border-slate-200 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.16),_transparent_35%),linear-gradient(135deg,_#0f172a,_#1e293b_58%,_#f8fafc_58%,_#ffffff)] p-8 text-white shadow-xl">
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-sky-200">
              <Building2 size={14} /> Company Intelligence
            </p>
            <h1 className="mt-5 text-4xl font-black tracking-tight">{company.name}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Use this account view to see every member captured for the company and coordinate follow-ups from one place.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Leads</p>
                <p className="mt-2 text-3xl font-black">{company.leads.length}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Members</p>
                <p className="mt-2 text-3xl font-black">{company.members.length}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Industry</p>
                <p className="mt-2 text-xl font-black">{company.industry || "Not set"}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur-sm">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-300">Follow-Up Signals</p>
            <div className="mt-5 space-y-4">
              <div className="rounded-[1.25rem] bg-black/10 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Hiring signal</p>
                <p className="mt-2 text-sm font-semibold">{company.companyInsights?.hiringSignal || "No hiring signal captured yet"}</p>
              </div>
              <div className="rounded-[1.25rem] bg-black/10 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Recent trigger</p>
                <p className="mt-2 text-sm font-semibold">{company.companyInsights?.recentTrigger || "No recent trigger added"}</p>
              </div>
              <div className="rounded-[1.25rem] bg-black/10 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Next opportunity</p>
                <p className="mt-2 text-sm font-semibold">{company.companyInsights?.nextOpportunity || "Opportunity note not added"}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="rounded-[2.25rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-900">All Members</h2>
              <p className="mt-1 text-sm text-slate-500">Primary leads and additional contacts already known for this company.</p>
            </div>
            <div className="rounded-full bg-slate-100 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
              {company.members.length} total
            </div>
          </div>

          <div className="grid gap-4">
            {company.members.map((member) => (
              <div key={member.contactId} className="rounded-[1.75rem] border border-slate-200 bg-[linear-gradient(135deg,_#fff,_#f8fbff)] p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-black tracking-tight text-slate-900">{member.fullName}</p>
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${
                          member.type === "lead" ? "bg-indigo-50 text-indigo-700" : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {member.type === "lead" ? "Primary Lead" : "Company Member"}
                      </span>
                      {member.employmentStage && (
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-amber-700">
                          {member.employmentStage.replace(/_/g, " ")}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm font-semibold text-slate-600">
                      {member.designation || "Role not set"} {member.department ? ` / ${member.department}` : ""}
                    </p>
                  </div>

                  <Link
                    href={`${leadBasePath}/${member.leadId}`}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-600 transition hover:border-sky-200 hover:text-sky-700"
                  >
                    Open Lead <ArrowLeft className="rotate-180" size={14} />
                  </Link>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-[1.25rem] bg-slate-50 p-4">
                    <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                      <Mail size={12} /> Email
                    </p>
                    <p className="mt-2 break-all text-sm font-semibold text-slate-700">{member.email}</p>
                  </div>
                  <div className="rounded-[1.25rem] bg-slate-50 p-4">
                    <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                      <Phone size={12} /> Phone
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-700">{formatPhone(member.phone, member.phoneCountryCode) || "Not added"}</p>
                  </div>
                  <div className="rounded-[1.25rem] bg-slate-50 p-4">
                    <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                      <BadgeCheck size={12} /> Source
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-700">{member.source || "Not specified"}</p>
                  </div>
                  <div className="rounded-[1.25rem] bg-slate-50 p-4">
                    <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                      <Calendar size={12} /> Last updated
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-700">{formatDate(member.updatedAt)}</p>
                  </div>
                </div>

                {member.notes && (
                  <div className="mt-4 rounded-[1.25rem] border border-amber-100 bg-amber-50/70 p-4">
                    <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-amber-700">
                      <Sparkles size={12} /> Follow-up note
                    </p>
                    <p className="mt-2 text-sm leading-6 text-amber-950">{member.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-[2.25rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[1.3rem] bg-indigo-50 text-indigo-700">
                <Users size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight text-slate-900">Opportunity Owners</h2>
                <p className="text-sm text-slate-500">Open each lead below to update remarks or add more members.</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {company.leads.map((lead) => (
                <Link
                  key={lead._id}
                  href={`${leadBasePath}/${lead._id}`}
                  className="block rounded-[1.5rem] border border-slate-200 p-4 transition hover:border-sky-200 hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-black tracking-tight text-slate-900">
                        {lead.firstName} {lead.lastName}
                      </p>
                      <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{lead.designation || lead.email}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-600">
                      {lead.status}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.25rem] bg-slate-50 p-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Owner</p>
                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {typeof lead.assignedTo === "string" ? lead.assignedTo : lead.assignedTo?.name || "Not assigned"}
                      </p>
                    </div>
                    <div className="rounded-[1.25rem] bg-slate-50 p-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Members on lead</p>
                      <p className="mt-1 text-sm font-semibold text-slate-700">{1 + (lead.contacts?.length || 0)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-[2.25rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black tracking-tight text-slate-900">Account Notes</h2>
            <p className="mt-4 rounded-[1.5rem] bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              {company.companyInsights?.accountNotes || "No account notes yet. Edit a lead from this company to capture shared follow-up context."}
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.25rem] bg-slate-50 p-4">
                <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  <UserRound size={12} /> Country
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-700">{company.country || "Not set"}</p>
              </div>
              <div className="rounded-[1.25rem] bg-slate-50 p-4">
                <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  <Users size={12} /> Employee strength
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-700">{company.employeeStrength || "Not set"}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

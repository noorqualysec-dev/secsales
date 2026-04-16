"use client";

import Link from "next/link";
import { Building2, ChevronRight, Network, Users, Briefcase, ArrowUpRight } from "lucide-react";
import { useCompanies } from "@/app/hooks/useLeads";

function formatDate(value?: number) {
  if (!value) return "No recent activity";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function CompaniesPage() {
  const { data, isLoading, error } = useCompanies();
  const companies = data?.data ?? [];

  if (error) {
    return (
      <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-8 text-rose-700">
        Unable to load company accounts right now.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[2.5rem] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(79,70,229,0.16),_transparent_35%),linear-gradient(135deg,_#ffffff,_#eef4ff)] p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-indigo-700">
              <Network size={14} /> Account Follow-Up Workspace
            </p>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Track every company, not just one contact.</h1>
            <p className="mt-3 text-sm font-medium leading-6 text-slate-600">
              Open a company to see all members your team has captured, spot new joins, and keep account-based follow-ups organized.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Companies</p>
              <p className="mt-2 text-3xl font-black text-slate-900">{companies.length}</p>
            </div>
            <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Members</p>
              <p className="mt-2 text-3xl font-black text-slate-900">
                {companies.reduce((sum, company) => sum + company.memberCount, 0)}
              </p>
            </div>
            <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-4 sm:col-span-1 col-span-2">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Open Opportunities</p>
              <p className="mt-2 text-3xl font-black text-slate-900">
                {companies.reduce((sum, company) => sum + company.openOpportunities, 0)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2.5rem] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-8 py-6">
          <h2 className="text-lg font-black tracking-tight text-slate-900">Company Directory</h2>
          <p className="mt-1 text-sm text-slate-500">Each card opens the full account view with every known member.</p>
        </div>

        {isLoading ? (
          <div className="space-y-4 p-8">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-28 animate-pulse rounded-[1.75rem] bg-slate-100" />
            ))}
          </div>
        ) : companies.length === 0 ? (
          <div className="px-8 py-20 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] bg-slate-100 text-slate-300">
              <Building2 size={34} />
            </div>
            <p className="mt-6 text-sm font-black uppercase tracking-[0.22em] text-slate-400">No companies captured yet</p>
            <p className="mt-2 text-sm text-slate-500">Add leads with a company name and they will appear here automatically.</p>
          </div>
        ) : (
          <div className="grid gap-5 p-6 lg:grid-cols-2">
            {companies.map((company) => (
              <Link
                key={company.key}
                href={`/companies/${company.key}`}
                className="group rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,_#fff,_#f8fbff)] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xl font-black tracking-tight text-slate-900">{company.name}</p>
                    <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                      {company.industry || "Industry not set"} {company.country ? `• ${company.country}` : ""}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-[1.25rem] bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 transition-transform duration-300 group-hover:rotate-6">
                    <ArrowUpRight size={18} />
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  <div className="rounded-[1.5rem] bg-slate-50 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Leads</p>
                    <p className="mt-2 text-2xl font-black text-slate-900">{company.leadCount}</p>
                  </div>
                  <div className="rounded-[1.5rem] bg-slate-50 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Members</p>
                    <p className="mt-2 text-2xl font-black text-slate-900">{company.memberCount}</p>
                  </div>
                  <div className="rounded-[1.5rem] bg-slate-50 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Open</p>
                    <p className="mt-2 text-2xl font-black text-slate-900">{company.openOpportunities}</p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Users size={14} />
                    <span>{company.owners.map((owner) => owner.name).join(", ") || "Owner not assigned"}</span>
                  </div>
                  <div className="flex items-center gap-2 font-bold text-indigo-700">
                    <Briefcase size={14} />
                    <span>{formatDate(company.lastUpdatedAt)}</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

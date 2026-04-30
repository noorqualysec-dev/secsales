"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import {
  ArrowRight,
  Briefcase,
  Building2,
  Globe2,
  Network,
  Search,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import { useCompanies } from "@/app/hooks/useLeads";
import type { CompanySummary } from "@/app/types";

type CompanyDirectoryProps = {
  detailBasePath: string;
  eyebrow: string;
  title: string;
  description: string;
  globalScope?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
};

function formatDate(value?: number) {
  if (!value) return "No recent activity";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function sortCompanies(companies: CompanySummary[], sortBy: string) {
  const list = [...companies];

  switch (sortBy) {
    case "name":
      return list.sort((a, b) => a.name.localeCompare(b.name));
    case "members":
      return list.sort((a, b) => b.memberCount - a.memberCount || a.name.localeCompare(b.name));
    case "open":
      return list.sort((a, b) => b.openOpportunities - a.openOpportunities || a.name.localeCompare(b.name));
    case "leads":
      return list.sort((a, b) => b.leadCount - a.leadCount || a.name.localeCompare(b.name));
    case "updated":
    default:
      return list.sort((a, b) => b.lastUpdatedAt - a.lastUpdatedAt || a.name.localeCompare(b.name));
  }
}

export function CompanyDirectory({
  detailBasePath,
  eyebrow,
  title,
  description,
  globalScope = false,
  emptyTitle = "No companies captured yet",
  emptyDescription = "Add leads with a company name and they will appear here automatically.",
}: CompanyDirectoryProps) {
  const { data, isLoading, error } = useCompanies({ globalScope });
  const companies = data?.data ?? [];

  const [query, setQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [sortBy, setSortBy] = useState("updated");

  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  const industries = Array.from(new Set(companies.map((company) => company.industry).filter(Boolean))).sort();
  const countries = Array.from(new Set(companies.map((company) => company.country).filter(Boolean))).sort();
  const owners = Array.from(
    new Set(companies.flatMap((company) => company.owners.map((owner) => owner.name)).filter(Boolean)),
  ).sort();

  const filteredCompanies = sortCompanies(
    companies.filter((company) => {
      const matchesQuery =
        !deferredQuery ||
        company.name.toLowerCase().includes(deferredQuery) ||
        (company.industry || "").toLowerCase().includes(deferredQuery) ||
        (company.country || "").toLowerCase().includes(deferredQuery) ||
        company.owners.some((owner) => owner.name.toLowerCase().includes(deferredQuery));

      const matchesIndustry = industryFilter === "all" || (company.industry || "Not set") === industryFilter;
      const matchesCountry = countryFilter === "all" || (company.country || "Not set") === countryFilter;
      const matchesOwner = ownerFilter === "all" || company.owners.some((owner) => owner.name === ownerFilter);

      return matchesQuery && matchesIndustry && matchesCountry && matchesOwner;
    }),
    sortBy,
  );

  const totalMembers = companies.reduce((sum, company) => sum + company.memberCount, 0);
  const totalOpenOpportunities = companies.reduce((sum, company) => sum + company.openOpportunities, 0);

  if (error) {
    return (
      <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-8 text-rose-700">
        Unable to load company accounts right now.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[2.5rem] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_35%),linear-gradient(135deg,_#ffffff,_#eef6ff)] p-8 shadow-sm">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-sky-700">
              <Network size={14} /> {eyebrow}
            </p>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">{title}</h1>
            <p className="mt-3 text-sm font-medium leading-6 text-slate-600">{description}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-[1.75rem] border border-white/70 bg-white/85 p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Companies</p>
              <p className="mt-2 text-3xl font-black text-slate-900">{companies.length}</p>
            </div>
            <div className="rounded-[1.75rem] border border-white/70 bg-white/85 p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Members</p>
              <p className="mt-2 text-3xl font-black text-slate-900">{totalMembers}</p>
            </div>
            <div className="col-span-2 rounded-[1.75rem] border border-white/70 bg-white/85 p-4 sm:col-span-1">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Open Opportunities</p>
              <p className="mt-2 text-3xl font-black text-slate-900">{totalOpenOpportunities}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2.5rem] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-8 py-6">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h2 className="text-lg font-black tracking-tight text-slate-900">Company Directory</h2>
              <p className="mt-1 text-sm text-slate-500">
                Switch from endless scrolling to a searchable account list that opens the same full company page.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5 xl:items-end">
              <label className="xl:col-span-2">
                <span className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                  <Search size={14} /> Search
                </span>
                <div className="flex items-center gap-3 rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-sky-300 focus-within:bg-white">
                  <Search size={16} className="text-slate-400" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Company, owner, industry, country"
                    className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
                  />
                </div>
              </label>

              <label>
                <span className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                  <SlidersHorizontal size={14} /> Industry
                </span>
                <select
                  value={industryFilter}
                  onChange={(event) => setIndustryFilter(event.target.value)}
                  className="w-full rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-sky-300 focus:bg-white"
                >
                  <option value="all">All industries</option>
                  <option value="Not set">Not set</option>
                  {industries.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Country</span>
                <select
                  value={countryFilter}
                  onChange={(event) => setCountryFilter(event.target.value)}
                  className="w-full rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-sky-300 focus:bg-white"
                >
                  <option value="all">All countries</option>
                  <option value="Not set">Not set</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Owner / Rep</span>
                <select
                  value={ownerFilter}
                  onChange={(event) => setOwnerFilter(event.target.value)}
                  className="w-full rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-sky-300 focus:bg-white"
                >
                  <option value="all">All reps</option>
                  {owners.map((owner) => (
                    <option key={owner} value={owner}>
                      {owner}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Sort by</span>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="w-full rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-sky-300 focus:bg-white"
                >
                  <option value="updated">Recent activity</option>
                  <option value="name">Company name</option>
                  <option value="members">Members</option>
                  <option value="open">Open opportunities</option>
                  <option value="leads">Lead count</option>
                </select>
              </label>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4 p-8">
            {Array.from({ length: 7 }).map((_, index) => (
              <div key={index} className="h-24 animate-pulse rounded-[1.75rem] bg-slate-100" />
            ))}
          </div>
        ) : companies.length === 0 ? (
          <div className="px-8 py-20 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] bg-slate-100 text-slate-300">
              <Building2 size={34} />
            </div>
            <p className="mt-6 text-sm font-black uppercase tracking-[0.22em] text-slate-400">{emptyTitle}</p>
            <p className="mt-2 text-sm text-slate-500">{emptyDescription}</p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-8 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              <span>{filteredCompanies.length} results</span>
              <span>Showing compact list view for faster browsing across larger company volumes.</span>
            </div>

            {filteredCompanies.length === 0 ? (
              <div className="px-8 py-16 text-center">
                <p className="text-sm font-black uppercase tracking-[0.22em] text-slate-400">No companies match these filters</p>
                <p className="mt-2 text-sm text-slate-500">Try a broader search or reset one of the filters above.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredCompanies.map((company) => (
                  <Link
                    key={company.key}
                    href={`${detailBasePath}/${company.key}`}
                    className="group grid gap-4 px-6 py-5 transition hover:bg-sky-50/60 md:grid-cols-[minmax(0,2.1fr)_minmax(0,1.1fr)_minmax(0,1fr)_auto]"
                  >
                    <div className="min-w-0">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.3rem] bg-slate-100 text-slate-500 transition group-hover:bg-sky-100 group-hover:text-sky-700">
                          <Building2 size={20} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-lg font-black tracking-tight text-slate-900">{company.name}</p>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                              {company.industry || "Not set"}
                            </span>
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                            <span className="inline-flex items-center gap-2">
                              <Globe2 size={14} />
                              {company.country || "Country not set"}
                            </span>
                            <span className="inline-flex items-center gap-2">
                              <Users size={14} />
                              {company.owners.map((owner) => owner.name).join(", ") || "Owner not assigned"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 sm:max-w-md">
                      <div className="rounded-[1.25rem] bg-slate-50 p-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Leads</p>
                        <p className="mt-2 text-2xl font-black text-slate-900">{company.leadCount}</p>
                      </div>
                      <div className="rounded-[1.25rem] bg-slate-50 p-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Members</p>
                        <p className="mt-2 text-2xl font-black text-slate-900">{company.memberCount}</p>
                      </div>
                      <div className="rounded-[1.25rem] bg-slate-50 p-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Open</p>
                        <p className="mt-2 text-2xl font-black text-slate-900">{company.openOpportunities}</p>
                      </div>
                    </div>

                    <div className="flex flex-col justify-center gap-2 text-sm">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Latest activity</p>
                      <p className="font-semibold text-slate-700">{formatDate(company.lastUpdatedAt)}</p>
                      <div className="inline-flex items-center gap-2 text-slate-500">
                        <Briefcase size={14} />
                        <span>{company.employeeStrength || "Strength not set"}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end">
                      <div className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-sky-600/20 transition group-hover:translate-x-1">
                        Open account <ArrowRight size={14} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

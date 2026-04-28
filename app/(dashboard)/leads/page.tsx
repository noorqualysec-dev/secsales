"use client";

import { useState, useRef } from "react";
import { useLeads, useCreateLead, useUpdateLead, useDeleteLead, useBulkImportLeads } from "@/app/hooks/useLeads";
import type { LeadPayload } from "@/app/hooks/useLeads";
import type { Lead, LeadStatus, LeadSource, LeadContact, LeadOutcome, LeadRegion } from "@/app/types";
import Papa from "papaparse";
import {
  Plus, Pencil, Trash2, X, CheckCircle2, Eye,
  Briefcase, Users, Building2, Upload, Download, AlertCircle, UserPlus2, Sparkles
} from "lucide-react";
import Link from "next/link";

// ── Configuration ─────────────────────────────────────────────────────────────

const LEAD_STATUSES: LeadStatus[] = [
  "Lead Captured", "Discovery Call Scheduled", "Requirement Gathering",
  "Pre-Assessment Form Sent", "Proposal Preparation", "Proposal Sent",
  "Negotiation",
];

const LEAD_SOURCES: LeadSource[] = [
  "website", "email_marketing", "linkedin", "referral",
  "events", "recurring", "partnership", "offline_source", "other",
];

const EMPLOYEE_STRENGTHS = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"];
const LEAD_REGIONS: LeadRegion[] = [
  "India",
  "Middle-East",
  "North-America",
  "SouthEast-Asia",
  "Australia",
  "South-America",
];

/** Match backend LEAD_INDUSTRY_PRESETS */
const LEAD_INDUSTRY_PRESETS = [
  "Technology",
  "Healthcare",
  "Financial Services",
  "Manufacturing",
  "Retail",
] as const;

const INDUSTRY_OTHER = "__other__";

const PHONE_COUNTRY_OPTIONS: { name: string; dial: string }[] = [
  { name: "Australia", dial: "+61" },
  { name: "Bangladesh", dial: "+880" },
  { name: "Brazil", dial: "+55" },
  { name: "Canada", dial: "+1" },
  { name: "China", dial: "+86" },
  { name: "Egypt", dial: "+20" },
  { name: "France", dial: "+33" },
  { name: "Germany", dial: "+49" },
  { name: "India", dial: "+91" },
  { name: "Indonesia", dial: "+62" },
  { name: "Italy", dial: "+39" },
  { name: "Japan", dial: "+81" },
  { name: "Kenya", dial: "+254" },
  { name: "Malaysia", dial: "+60" },
  { name: "Mexico", dial: "+52" },
  { name: "Netherlands", dial: "+31" },
  { name: "Nigeria", dial: "+234" },
  { name: "Philippines", dial: "+63" },
  { name: "Saudi Arabia", dial: "+966" },
  { name: "Singapore", dial: "+65" },
  { name: "South Africa", dial: "+27" },
  { name: "South Korea", dial: "+82" },
  { name: "Spain", dial: "+34" },
  { name: "Thailand", dial: "+66" },
  { name: "United Arab Emirates", dial: "+971" },
  { name: "United Kingdom", dial: "+44" },
  { name: "United States", dial: "+1" },
  { name: "Vietnam", dial: "+84" },
].sort((a, b) => a.name.localeCompare(b.name));

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

function getLeadOutcome(lead: Lead): LeadOutcome {
  if (lead.outcome === "won" || lead.outcome === "lost" || lead.outcome === "cancelled") {
    return lead.outcome;
  }
  if (lead.status === "Won") return "won";
  if (lead.status === "Lost") return "lost";
  return "open";
}

function getLeadStage(lead: Lead): LeadStatus {
  if (lead.status !== "Won" && lead.status !== "Lost") {
    return lead.status;
  }
  return lead.lostAtStatus || lead.wonAtStatus || "Lead Captured";
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function exportLeadsToCSV(leads: Lead[]) {
  const esc = (v: any) => {
    if (v == null) return "";
    const s = String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const headers = [
    "First Name", "Last Name", "Email", "Phone", "Designation",
    "Company", "Industry", "Country", "Region", "Employee Strength",
    "Status", "Source", "Deal Value", "Closing Date", "Remarks",
  ];
  const rows = leads.map((l: Lead) => [
    l.firstName, l.lastName, l.email,
    l.phoneCountryCode && l.phone ? `${l.phoneCountryCode}${l.phone}` : (l.phone ?? ""),
    l.designation ?? "", l.company ?? "", l.industry ?? "",
    l.country ?? "", l.region ?? "", l.employeeStrength ?? "",
    l.status, l.source,
    l.dealValue ?? "",
    l.closingDate ? new Date(l.closingDate).toISOString().split("T")[0] : "",
    l.latestRemark ?? "",
  ].map(esc).join(","));
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `leads_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const CSV_FIELD_MAP: Record<string, string> = {
  "first name": "firstName", "firstname": "firstName", "first_name": "firstName",
  "last name": "lastName", "lastname": "lastName", "last_name": "lastName",
  "contact person": "contactPerson",
  "email": "email", "email address": "email", "email_address": "email",
  "phone": "phone", "phone number": "phone", "mobile": "phone",
  "company": "company", "company name": "company", "organization": "company",
  "designation": "designation", "title": "designation", "job title": "designation",
  "industry": "industry", "industry sector": "industry", "industry vertical": "industry", "industrial vertical": "industry",
  "country": "country",
  "region": "region",
  "employee strength": "employeeStrength", "employees": "employeeStrength", "employee_strength": "employeeStrength",
  "status": "status", "pipeline state": "status",
  "source": "source", "lead source": "source",
  "deal value": "dealValue", "value": "dealValue", "deal_value": "dealValue",
  "closing date": "closingDate", "closing_date": "closingDate",
  "remarks": "latestRemark", "notes": "latestRemark", "remark": "latestRemark", "latest remark": "latestRemark",
};

function splitContactPersonName(fullName: string): { firstName: string; lastName: string } {
  const clean = String(fullName || "").trim();
  if (!clean) return { firstName: "", lastName: "" };
  const parts = clean.split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0] || "", lastName: "" };
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" "),
  };
}

function splitLegacyPhone(full: string): { phoneCountryCode: string; phone: string; country: string } {
  const t = full.trim();
  if (!t) return { phoneCountryCode: "", phone: "", country: "" };
  if (!t.startsWith("+")) {
    return { phoneCountryCode: "", phone: t.replace(/\D/g, ""), country: "" };
  }
  const sorted = [...PHONE_COUNTRY_OPTIONS].sort((a, b) => b.dial.length - a.dial.length);
  for (const o of sorted) {
    if (t.startsWith(o.dial)) {
      const national = t.slice(o.dial.length).replace(/\D/g, "");
      return { phoneCountryCode: o.dial, phone: national, country: o.name };
    }
  }
  return { phoneCountryCode: "", phone: t, country: "" };
}

// ── Components ────────────────────────────────────────────────────────────────

const emptyForm = {
  firstName: "", lastName: "", email: "",
  phoneCountryCode: "", phone: "",
  company: "", country: "",
  region: "" as LeadRegion | "",
  industrySelect: "", industryOther: "",
  designation: "", employeeStrength: "",
  status: "Lead Captured" as LeadStatus,
  outcome: "open" as LeadOutcome,
  lostReason: "",
  source: "website" as LeadSource,
  latestRemark: "",
  closingDate: 0,
  dealValue: 0,
  contacts: [] as CompanyContactForm[],
  companyInsights: {
    hiringSignal: "",
    recentTrigger: "",
    nextOpportunity: "",
    accountNotes: "",
  },
};

type LeadForm = typeof emptyForm;
type CompanyContactForm = {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  designation: string;
  department: string;
  source: string;
  notes: string;
  phoneCountryCode: string;
  phone: string;
  employmentStage: "" | "current" | "joining_soon" | "newly_joined";
};

const emptyCompanyContact = (): CompanyContactForm => ({
  firstName: "",
  lastName: "",
  email: "",
  designation: "",
  department: "",
  source: "",
  notes: "",
  phoneCountryCode: "",
  phone: "",
  employmentStage: "",
});

function leadContactToForm(contact: LeadContact): CompanyContactForm {
  return {
    id: contact.id,
    firstName: contact.firstName ?? "",
    lastName: contact.lastName ?? "",
    email: contact.email ?? "",
    designation: contact.designation ?? "",
    department: contact.department ?? "",
    source: contact.source ?? "",
    notes: contact.notes ?? "",
    phoneCountryCode: contact.phoneCountryCode ?? "",
    phone: (contact.phone ?? "").replace(/\D/g, ""),
    employmentStage: contact.employmentStage ?? "",
  };
}

function leadToFormInitial(lead: Lead): LeadForm {
  let phoneCountryCode = lead.phoneCountryCode?.trim() ?? "";
  let phone = (lead.phone ?? "").trim();
  let country = lead.country ?? "";
  if (!phoneCountryCode && phone.startsWith("+")) {
    const parsed = splitLegacyPhone(phone);
    phoneCountryCode = parsed.phoneCountryCode;
    phone = parsed.phone;
    if (!country && parsed.country) country = parsed.country;
  } else {
    phone = phone.replace(/\D/g, "");
  }

  const ind = lead.industry ?? "";
  const presetList = LEAD_INDUSTRY_PRESETS as readonly string[];
  const industrySelect = ind && presetList.includes(ind) ? ind : ind ? INDUSTRY_OTHER : "";
  const industryOther = industrySelect === INDUSTRY_OTHER ? ind : "";

  return {
    firstName: lead.firstName,
    lastName: lead.lastName,
    email: lead.email,
    phoneCountryCode,
    phone,
    company: lead.company ?? "",
    country,
    region: lead.region ?? "",
    industrySelect,
    industryOther,
    status: getLeadStage(lead),
    outcome: getLeadOutcome(lead),
    lostReason: lead.lostReason ?? "",
    source: lead.source,
    designation: lead.designation ?? "",
    employeeStrength: lead.employeeStrength ?? "",
    latestRemark: "",
    closingDate: lead.closingDate || 0,
    dealValue: lead.dealValue || 0,
    contacts: (lead.contacts ?? []).map(leadContactToForm),
    companyInsights: {
      hiringSignal: lead.companyInsights?.hiringSignal ?? "",
      recentTrigger: lead.companyInsights?.recentTrigger ?? "",
      nextOpportunity: lead.companyInsights?.nextOpportunity ?? "",
      accountNotes: lead.companyInsights?.accountNotes ?? "",
    },
  };
}

function formToApiPayload(form: LeadForm): LeadPayload {
  const { industrySelect, industryOther, contacts, companyInsights, lostReason, ...rest } = form;
  const industry =
    industrySelect === INDUSTRY_OTHER
      ? industryOther.trim()
      : industrySelect.trim();
  const normalizedLostReason = lostReason.trim();
  return {
    ...rest,
    region: rest.region || undefined,
    lostReason: rest.outcome === "lost" ? normalizedLostReason : undefined,
    industry: industry || undefined,
    contacts: contacts
      .map((contact) => ({
        ...contact,
        phone: contact.phone.replace(/\D/g, ""),
        phoneCountryCode: contact.phoneCountryCode.trim(),
        employmentStage: contact.employmentStage || undefined,
      }))
      .filter((contact) => contact.firstName.trim() && contact.email.trim()),
    companyInsights: Object.values(companyInsights).some((value) => value.trim())
      ? {
          hiringSignal: companyInsights.hiringSignal.trim(),
          recentTrigger: companyInsights.recentTrigger.trim(),
          nextOpportunity: companyInsights.nextOpportunity.trim(),
          accountNotes: companyInsights.accountNotes.trim(),
        }
      : undefined,
  };
}

function LeadModal({ initial, onSave, onClose, isSaving }: {
  initial: LeadForm;
  onSave: (d: LeadForm) => void;
  onClose: () => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState(initial);
  const [formError, setFormError] = useState<string | null>(null);
  const set = (k: keyof LeadForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const sectionLabelCls = "text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] mb-4 mt-6 first:mt-0 flex items-center gap-2";
  const inputCls = "w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 focus:bg-white transition-all duration-300";
  const labelCls = "text-[11px] font-bold text-slate-500 mb-1.5 block ml-1";
  const updateContact = (index: number, field: keyof CompanyContactForm, value: string) => {
    setForm((current) => ({
      ...current,
      contacts: current.contacts.map((contact, contactIndex) =>
        contactIndex === index ? { ...contact, [field]: value } : contact
      ),
    }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const dial = form.phoneCountryCode.trim();
    const digits = form.phone.replace(/\D/g, "");
    const hasDial = dial.length > 0;
    const hasDigits = digits.length > 0;
    if (hasDial !== hasDigits) {
      setFormError("Select a country / code and enter the national number, or leave both empty.");
      return;
    }
    if (hasDigits) {
      if (!/^\+\d{1,4}$/.test(dial)) {
        setFormError("Invalid country calling code.");
        return;
      }
      if (digits.length < 4 || digits.length > 15) {
        setFormError("Phone must be between 4 and 15 digits.");
        return;
      }
    }
    if (form.industrySelect === INDUSTRY_OTHER && !form.industryOther.trim()) {
      setFormError("Please specify the industry when you select Other.");
      return;
    }
    for (const contact of form.contacts) {
      const hasAnyValue = Object.values(contact).some((value) => String(value ?? "").trim());
      if (!hasAnyValue) continue;
      if (!contact.firstName.trim() || !contact.email.trim()) {
        setFormError("Each added company member needs at least a first name and email.");
        return;
      }
      const contactHasDial = contact.phoneCountryCode.trim().length > 0;
      const contactDigits = contact.phone.replace(/\D/g, "");
      const contactHasDigits = contactDigits.length > 0;
      if (contactHasDial !== contactHasDigits) {
        setFormError(`Complete both phone fields for ${contact.firstName.trim()} or leave both empty.`);
        return;
      }
      if (contactHasDigits) {
        if (!/^\+\d{1,4}$/.test(contact.phoneCountryCode.trim())) {
          setFormError(`Invalid country calling code for ${contact.firstName.trim()}.`);
          return;
        }
        if (contactDigits.length < 4 || contactDigits.length > 15) {
          setFormError(`Phone must be between 4 and 15 digits for ${contact.firstName.trim()}.`);
          return;
        }
      }
    }
    if (form.outcome === "lost" && !form.lostReason.trim()) {
      setFormError("Please add a loss note before marking this lead as lost.");
      return;
    }
    onSave({
      ...form,
      phone: digits,
      phoneCountryCode: dial,
      latestRemark: form.outcome === "lost" && !form.latestRemark.trim()
        ? form.lostReason.trim()
        : form.latestRemark,
    });
  };

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
        <form onSubmit={submit} className="overflow-y-auto px-10 py-8 custom-scrollbar space-y-8">
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
              <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Country / dialing code</label>
                  <select
                    className={inputCls}
                    value={form.phoneCountryCode && form.country ? `${form.phoneCountryCode}|${form.country}` : ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (!v) {
                        setForm((f) => ({ ...f, phoneCountryCode: "", country: "" }));
                        return;
                      }
                      const pipe = v.indexOf("|");
                      const dial = v.slice(0, pipe);
                      const name = v.slice(pipe + 1);
                      setForm((f) => ({ ...f, phoneCountryCode: dial, country: name }));
                    }}
                  >
                    <option value="">Select country (optional)</option>
                    {PHONE_COUNTRY_OPTIONS.map((o) => (
                      <option key={`${o.dial}-${o.name}`} value={`${o.dial}|${o.name}`}>
                        {o.name} ({o.dial})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Phone (digits only)</label>
                  <input
                    className={inputCls}
                    inputMode="numeric"
                    autoComplete="tel-national"
                    value={form.phone}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "");
                      setForm((f) => ({ ...f, phone: digits }));
                    }}
                    placeholder="9876543210"
                  />
                </div>
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
                <label className={labelCls}>Region</label>
                <select className={inputCls} value={form.region} onChange={set("region")}>
                  <option value="">Select region</option>
                  {LEAD_REGIONS.map((region) => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Industry Sector</label>
                <select className={inputCls} value={form.industrySelect} onChange={set("industrySelect")}>
                  <option value="">Select sector (optional)</option>
                  {LEAD_INDUSTRY_PRESETS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                  <option value={INDUSTRY_OTHER}>Other</option>
                </select>
              </div>
              {form.industrySelect === INDUSTRY_OTHER && (
                <div className="col-span-2">
                  <label className={labelCls}>Specify industry</label>
                  <input
                    className={inputCls}
                    value={form.industryOther}
                    onChange={set("industryOther")}
                    placeholder="Fintech, Education, etc."
                  />
                </div>
              )}
              <div>
                <label className={labelCls}>Hiring / expansion signal</label>
                <input
                  className={inputCls}
                  value={form.companyInsights.hiringSignal}
                  onChange={(e) => setForm((f) => ({ ...f, companyInsights: { ...f.companyInsights, hiringSignal: e.target.value } }))}
                  placeholder="Hiring security team, new compliance push, new product line..."
                />
              </div>
              <div>
                <label className={labelCls}>Recent trigger event</label>
                <input
                  className={inputCls}
                  value={form.companyInsights.recentTrigger}
                  onChange={(e) => setForm((f) => ({ ...f, companyInsights: { ...f.companyInsights, recentTrigger: e.target.value } }))}
                  placeholder="Funding round, audit deadline, product launch..."
                />
              </div>
              <div>
                <label className={labelCls}>Next account opportunity</label>
                <input
                  className={inputCls}
                  value={form.companyInsights.nextOpportunity}
                  onChange={(e) => setForm((f) => ({ ...f, companyInsights: { ...f.companyInsights, nextOpportunity: e.target.value } }))}
                  placeholder="Intro to infra lead, renewal in June, cross-sell testing..."
                />
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Shared account notes</label>
                <textarea
                  className={`${inputCls} h-28 resize-none pt-4`}
                  value={form.companyInsights.accountNotes}
                  onChange={(e) => setForm((f) => ({ ...f, companyInsights: { ...f.companyInsights, accountNotes: e.target.value } }))}
                  placeholder="Context that should stay visible across everyone from this company."
                />
              </div>
            </div>
          </div>
          <div>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className={sectionLabelCls}><UserPlus2 size={14} /> Company Member Tracker</h3>
                <p className="text-sm text-slate-500">Add new joins or stakeholders from the same company so the sales rep can follow up later.</p>
              </div>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, contacts: [...f.contacts, emptyCompanyContact()] }))}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-xs font-extrabold uppercase tracking-[0.18em] text-indigo-700 transition hover:bg-indigo-100"
              >
                <Plus size={14} /> Add Member
              </button>
            </div>

            {form.contacts.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-slate-200 bg-slate-50/70 px-6 py-10 text-center">
                <Sparkles size={24} className="mx-auto text-slate-300" />
                <p className="mt-4 text-sm font-bold text-slate-500">No extra company members added yet.</p>
                <p className="mt-1 text-xs text-slate-400">Use this when a company hires someone new or another stakeholder enters the buying group.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {form.contacts.map((contact, index) => (
                  <div key={contact.id || index} className="rounded-[2rem] border border-slate-200 bg-slate-50/70 p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-slate-400">Member {index + 1}</p>
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, contacts: f.contacts.filter((_, currentIndex) => currentIndex !== index) }))}
                        className="rounded-xl border border-rose-200 px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-rose-600 transition hover:bg-rose-50"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className={labelCls}>First Name *</label>
                        <input className={inputCls} value={contact.firstName} onChange={(e) => updateContact(index, "firstName", e.target.value)} placeholder="Ananya" />
                      </div>
                      <div>
                        <label className={labelCls}>Last Name</label>
                        <input className={inputCls} value={contact.lastName} onChange={(e) => updateContact(index, "lastName", e.target.value)} placeholder="Sharma" />
                      </div>
                      <div className="md:col-span-2">
                        <label className={labelCls}>Work Email *</label>
                        <input className={inputCls} type="email" value={contact.email} onChange={(e) => updateContact(index, "email", e.target.value)} placeholder="name@company.com" />
                      </div>
                      <div>
                        <label className={labelCls}>Designation</label>
                        <input className={inputCls} value={contact.designation} onChange={(e) => updateContact(index, "designation", e.target.value)} placeholder="Security Manager" />
                      </div>
                      <div>
                        <label className={labelCls}>Department</label>
                        <input className={inputCls} value={contact.department} onChange={(e) => updateContact(index, "department", e.target.value)} placeholder="IT, Engineering, Procurement..." />
                      </div>
                      <div>
                        <label className={labelCls}>Member source</label>
                        <input className={inputCls} value={contact.source} onChange={(e) => updateContact(index, "source", e.target.value)} placeholder="Referral, LinkedIn, website, internal intro..." />
                      </div>
                      <div>
                        <label className={labelCls}>Employment stage</label>
                        <select className={inputCls} value={contact.employmentStage} onChange={(e) => updateContact(index, "employmentStage", e.target.value)}>
                          <option value="">Select stage</option>
                          <option value="current">Current employee</option>
                          <option value="joining_soon">Joining soon</option>
                          <option value="newly_joined">Newly joined</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Country / dialing code</label>
                        <select
                          className={inputCls}
                          value={contact.phoneCountryCode}
                          onChange={(e) => updateContact(index, "phoneCountryCode", e.target.value)}
                        >
                          <option value="">Select country (optional)</option>
                          {PHONE_COUNTRY_OPTIONS.map((o) => (
                            <option key={`${o.dial}-${o.name}`} value={o.dial}>
                              {o.name} ({o.dial})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Phone (digits only)</label>
                        <input
                          className={inputCls}
                          inputMode="numeric"
                          value={contact.phone}
                          onChange={(e) => updateContact(index, "phone", e.target.value.replace(/\D/g, ""))}
                          placeholder="9876543210"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className={labelCls}>Notes for follow-up</label>
                        <textarea
                          className={`${inputCls} h-24 resize-none pt-4`}
                          value={contact.notes}
                          onChange={(e) => updateContact(index, "notes", e.target.value)}
                          placeholder="Why this person matters, when they are joining, or what to mention in follow-up."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                <label className={labelCls}>Lead Outcome</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, outcome: "open", lostReason: "" }))}
                    className={`rounded-2xl border px-4 py-3 text-xs font-extrabold uppercase tracking-[0.18em] transition ${
                      form.outcome === "open"
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 bg-white text-slate-500 hover:border-indigo-200"
                    }`}
                  >
                    Keep Open
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, outcome: "lost" }))}
                    className={`rounded-2xl border px-4 py-3 text-xs font-extrabold uppercase tracking-[0.18em] transition ${
                      form.outcome === "lost"
                        ? "border-rose-500 bg-rose-50 text-rose-700"
                        : "border-slate-200 bg-white text-slate-500 hover:border-rose-200"
                    }`}
                  >
                    Mark Lost
                  </button>
                </div>
                <p className="mt-2 text-[11px] font-bold text-slate-400">
                  The stage stays selected above. Marking lost closes the lead at that stage for analytics.
                </p>
              </div>
              <div>
                <label className={labelCls}>Discovery Source</label>
                <select className={inputCls} value={form.source} onChange={set("source")}>
                  {LEAD_SOURCES.map(s => <option key={s} value={s}>{s.replace(/_/g, " ").toUpperCase()}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Estimated Closing Date</label>
                <input className={inputCls} type="date" value={form.closingDate ? new Date(form.closingDate).toISOString().split("T")[0] : ""} onChange={(e) => setForm(f => ({ ...f, closingDate: new Date(e.target.value).getTime() }))} />
              </div>
              <div>
                <label className={labelCls}>Estimated Deal Value (INR)</label>
                <input className={inputCls} type="number" value={form.dealValue || ""} onChange={(e) => setForm(f => ({ ...f, dealValue: Number(e.target.value) }))} placeholder="50000" />
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
              {form.outcome === "lost" && (
                <div className="col-span-2">
                  <label className={labelCls}>Loss Note *</label>
                  <textarea
                    className={`${inputCls} h-28 resize-none pt-4 border-rose-200 bg-rose-50/40 focus:ring-rose-50 focus:border-rose-500`}
                    value={form.lostReason}
                    onChange={set("lostReason")}
                    placeholder="Why is this lead being marked lost? Add the reason so admin analytics can report it clearly."
                  />
                </div>
              )}
            </div>
          </div>
          {formError && (
            <p className="text-sm font-bold text-rose-600 bg-rose-50 border border-rose-100 rounded-2xl px-4 py-3">{formError}</p>
          )}
          <div className="flex gap-4 pt-6 sticky bottom-0 bg-white pb-2">
            <button type="button" onClick={onClose} className="flex-1 px-8 py-4 rounded-2xl border border-slate-200 text-slate-500 font-extrabold text-xs uppercase tracking-widest hover:bg-slate-50 transition active:scale-95 shadow-sm">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="flex-1 px-8 py-4 rounded-2xl bg-indigo-600 text-white font-extrabold text-xs uppercase tracking-widest hover:bg-slate-800 transition active:scale-95 shadow-xl shadow-indigo-500/10 disabled:opacity-50">
              {isSaving ? "Transmitting..." : initial.firstName ? "Update Record" : "Create Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ImportModal({ onClose, onImport, isImporting, result }: {
  onClose: () => void;
  onImport: (file: File) => void;
  isImporting: boolean;
  result: { imported: number; skipped: number } | null;
}) {
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith(".csv")) { alert("Please upload a .csv file"); return; }
    setSelectedFile(file);
    setFileName(file.name);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res: any) => {
        const mapped = (res.data as any[]).map((row: any) => {
          const lead: any = {};
          Object.entries(row).forEach(([key, val]) => {
            const fieldName = CSV_FIELD_MAP[key.trim().toLowerCase()];
            if (!fieldName) return;
            if (fieldName === "closingDate") lead[fieldName] = val ? (new Date(val as string).getTime() || 0) : 0;
            else if (fieldName === "dealValue") lead[fieldName] = Number(val) || 0;
            else lead[fieldName] = val;
          });
          const hasFirstName = String(lead.firstName ?? "").trim().length > 0;
          const contactPerson = String(lead.contactPerson ?? "").trim();
          if (!hasFirstName && contactPerson) {
            const split = splitContactPersonName(contactPerson);
            lead.firstName = split.firstName;
            if (!String(lead.lastName ?? "").trim()) {
              lead.lastName = split.lastName;
            }
          }
          delete lead.contactPerson;
          return lead;
        });
        setParsedRows(mapped);
      },
    });
  };

  const downloadTemplate = () => {
    const csv = [
      "First Name,Last Name,Email,Phone,Designation,Company,Industry,Country,Employee Strength,Status,Source,Deal Value,Closing Date,Remarks",
      "John,Doe,john@example.com,+91 9999999999,CTO,Tech Corp,SaaS,India,51-200,Lead Captured,linkedin,500000,2026-04-30,Interested in security audit",
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "leads_import_template.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const validRows = parsedRows.filter(r => r.firstName && r.email);
  const invalidCount = parsedRows.length - validRows.length;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Import Leads</h2>
            <p className="text-slate-500 text-sm font-medium mt-1">Upload a CSV to bulk import leads into the pipeline.</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 transition-all duration-300 hover:rotate-90">
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto px-10 py-8 space-y-6 flex-1">
          {result ? (
            /* ── Success state ── */
            <div className="flex flex-col items-center justify-center py-12 gap-6">
              <div className="w-20 h-20 bg-emerald-50 rounded-4xl flex items-center justify-center">
                <CheckCircle2 size={40} className="text-emerald-500" />
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-slate-900">{result.imported} Leads Imported</p>
                {result.skipped > 0 && (
                  <p className="text-sm text-slate-400 mt-2">
                    {result.skipped} rows skipped — duplicates or missing required fields
                  </p>
                )}
              </div>
              <button onClick={onClose} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-extrabold text-xs uppercase tracking-widest hover:bg-slate-900 transition active:scale-95">
                Done
              </button>
            </div>
          ) : (
            <>
              {/* ── Drop zone ── */}
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                className="border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group"
              >
                <Upload size={32} className="mx-auto text-slate-300 group-hover:text-indigo-500 mb-3 transition" />
                {fileName ? (
                  <p className="font-extrabold text-slate-700 text-sm">{fileName}</p>
                ) : (
                  <>
                    <p className="font-extrabold text-slate-500">Drop your CSV here or <span className="text-indigo-600">click to browse</span></p>
                    <p className="text-xs text-slate-400 mt-1">CSV files only (Windows may display type as "Comma Separated Values")</p>
                  </>
                )}
                <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              </div>

              {/* ── Template download ── */}
              <div className="flex items-center justify-between bg-slate-50 rounded-2xl px-6 py-4">
                <div>
                  <p className="text-xs font-extrabold text-slate-700">First time? Download our template</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Pre-formatted CSV with the correct column headers</p>
                </div>
                <button onClick={downloadTemplate}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-extrabold text-slate-600 hover:text-indigo-600 hover:border-indigo-300 transition shadow-sm">
                  <Download size={14} /> Template
                </button>
              </div>

              {/* ── Preview table ── */}
              {parsedRows.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                      {parsedRows.length} rows found · {validRows.length} valid
                    </p>
                    {invalidCount > 0 && (
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
                        <AlertCircle size={11} /> {invalidCount} invalid rows will be skipped
                      </span>
                    )}
                  </div>
                  <div className="border border-slate-100 rounded-2xl overflow-hidden overflow-x-auto">
                    <table className="w-full text-xs min-w-[560px]">
                      <thead>
                        <tr className="bg-slate-50 text-slate-400 text-[9px] font-extrabold uppercase tracking-widest">
                          <th className="px-4 py-3 text-left">First Name</th>
                          <th className="px-4 py-3 text-left">Last Name</th>
                          <th className="px-4 py-3 text-left">Email</th>
                          <th className="px-4 py-3 text-left">Company</th>
                          <th className="px-4 py-3 text-left">Status</th>
                          <th className="px-4 py-3 text-center">Valid</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {parsedRows.slice(0, 8).map((row, i) => {
                          const isValid = !!(row.firstName && row.email);
                          return (
                            <tr key={i} className={isValid ? "" : "bg-rose-50/40"}>
                              <td className="px-4 py-2.5 font-bold text-slate-700">
                                {row.firstName || <span className="text-rose-400 italic text-[10px]">missing</span>}
                              </td>
                              <td className="px-4 py-2.5 text-slate-500">{row.lastName || "—"}</td>
                              <td className="px-4 py-2.5 text-slate-500">
                                {row.email || <span className="text-rose-400 italic text-[10px]">missing</span>}
                              </td>
                              <td className="px-4 py-2.5 text-slate-500">{row.company || "—"}</td>
                              <td className="px-4 py-2.5">
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[9px] font-bold">
                                  {row.status || "Lead Captured"}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 text-center">
                                {isValid
                                  ? <CheckCircle2 size={14} className="text-emerald-500 mx-auto" />
                                  : <AlertCircle size={14} className="text-rose-400 mx-auto" />
                                }
                              </td>
                            </tr>
                          );
                        })}
                        {parsedRows.length > 8 && (
                          <tr>
                            <td colSpan={6} className="px-4 py-3 text-center text-[10px] text-slate-400 italic bg-slate-50/50">
                              +{parsedRows.length - 8} more rows not shown in preview
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {!result && (
          <div className="px-10 py-6 border-t border-slate-100 flex gap-4 shrink-0">
            <button onClick={onClose} className="flex-1 px-8 py-4 rounded-2xl border border-slate-200 text-slate-500 font-extrabold text-xs uppercase tracking-widest hover:bg-slate-50 transition active:scale-95">
              Cancel
            </button>
            <button
              disabled={!selectedFile || validRows.length === 0 || isImporting}
              onClick={() => {
                if (!selectedFile) return;
                onImport(selectedFile);
              }}
              className="flex-1 px-8 py-4 rounded-2xl bg-indigo-600 text-white font-extrabold text-xs uppercase tracking-widest hover:bg-slate-800 transition active:scale-95 shadow-xl shadow-indigo-500/10 disabled:opacity-40"
            >
              {isImporting ? "Importing..." : `Import ${validRows.length} Lead${validRows.length !== 1 ? "s" : ""} →`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function LeadsPage() {
  const { data, isLoading, error } = useLeads();
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();
  const bulkImport = useBulkImportLeads();

  const [modal, setModal] = useState<{ open: boolean; lead?: Lead }>({ open: false });
  const [importModal, setImportModal] = useState<{
    open: boolean;
    result: { imported: number; skipped: number } | null;
  }>({ open: false, result: null });

  const leads = data?.data ?? [];

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to permanently delete this lead?")) {
      deleteLead.mutate(id);
    }
  };

  const handleSave = (form: LeadForm) => {
    const payload = formToApiPayload(form);
    if (modal.lead) {
      updateLead.mutate(
        { id: modal.lead._id, data: payload },
        { onSuccess: () => setModal({ open: false }) }
      );
    } else {
      createLead.mutate(payload, { onSuccess: () => setModal({ open: false }) });
    }
  };

  const handleImport = (file: File) => {
    bulkImport.mutate(file, {
      onSuccess: (res: any) => {
        const payload = res?.data ?? {};
        const imported = Number(payload?.data?.imported ?? payload?.importedCount ?? 0);
        const skipped = Number(payload?.data?.skipped ?? payload?.failedCount ?? 0);
        setImportModal({ open: true, result: { imported, skipped } });
      },
    });
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
          key={modal.lead?._id ?? "new-lead"}
          initial={modal.lead ? leadToFormInitial(modal.lead) : emptyForm}
          onSave={handleSave}
          onClose={() => setModal({ open: false })}
          isSaving={createLead.isPending || updateLead.isPending}
        />
      )}

      {importModal.open && (
        <ImportModal
          onClose={() => setImportModal({ open: false, result: null })}
          onImport={handleImport}
          isImporting={bulkImport.isPending}
          result={importModal.result}
        />
      )}

      <div className="space-y-8 animate-fade-in-up">
        {/* Header toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
          <div>
            <h2 className="text-sm font-extrabold text-slate-500 uppercase tracking-[0.2em] mb-1 flex items-center gap-2">
              <Plus size={16} /> Internal Lead Management
            </h2>
            <p className="text-xl font-extrabold text-slate-900 tracking-tight">
              Active Pipeline Intelligence <span className="text-indigo-600 ml-2">[{leads.length}]</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => exportLeadsToCSV(leads)}
              disabled={leads.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-extrabold text-slate-600 hover:text-indigo-600 hover:border-indigo-300 uppercase tracking-widest transition shadow-sm disabled:opacity-40 active:scale-95"
            >
              <Download size={15} /> Export CSV
            </button>
            <button
              onClick={() => setImportModal({ open: true, result: null })}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-extrabold text-slate-600 hover:text-indigo-600 hover:border-indigo-300 uppercase tracking-widest transition shadow-sm active:scale-95"
            >
              <Upload size={15} /> Import CSV
            </button>
            <button
              onClick={() => setModal({ open: true })}
              className="flex items-center justify-center gap-3 bg-indigo-600 hover:bg-slate-900 text-white px-5 py-2.5 rounded-4xl text-sm font-extrabold uppercase tracking-widest transition-all duration-500 hover:scale-105 active:scale-95 shadow-xl shadow-indigo-500/20"
            >
              <Plus size={16} /> Add Lead
            </button>
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-lg overflow-hidden transition-shadow duration-500 hover:shadow-2xl group/monitor">
          {isLoading ? (
            <div className="p-12 space-y-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-20 bg-slate-50 rounded-4xl animate-pulse border border-slate-100" />
              ))}
            </div>
          ) : leads.length === 0 ? (
            <div className="py-24 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-4xl flex items-center justify-center mx-auto mb-6 text-slate-300">
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
                  {leads.map((lead: Lead) => {
                    const outcome = getLeadOutcome(lead);
                    const stage = getLeadStage(lead);
                    const badgeKey = outcome === "won" ? "Won" : outcome === "lost" ? "Lost" : stage;
                    const badgeClass = statusColors[badgeKey] || "bg-slate-50 text-slate-600 border-slate-100";
                    const dotClass = badgeClass.split(" ")[1]?.replace("text-", "bg-") || "bg-slate-500";
                    const stageLabel = outcome === "won"
                      ? `Won at ${stage}`
                      : outcome === "lost"
                        ? `Lost at ${stage}`
                        : stage;
                    const notePreview = outcome === "lost"
                      ? (lead.lostReason || lead.latestRemark || "Marked lost with no note.")
                      : (lead.latestRemark || "No remarks recorded.");

                    return (
                    <tr key={lead._id} className="hover:bg-slate-50/80 transition-all duration-300 group">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black border transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3 ${
                            outcome === "won"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                              : outcome === "lost"
                                ? "bg-rose-50 text-rose-600 border-rose-100"
                                : "bg-indigo-50 text-indigo-600 border-indigo-100"
                          }`}>
                            {lead.firstName[0]}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 tracking-tight uppercase">{lead.firstName} {lead.lastName}</p>
                            <p className="text-xs font-bold text-slate-400 mt-0.5">{lead.designation || lead.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6 hidden md:table-cell">
                        <div className="space-y-0.5">
                          {lead.company ? (
                            <Link
                              href={`/companies/${encodeURIComponent(lead.company.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""))}`}
                              className="text-xs font-bold uppercase text-slate-700 transition hover:text-indigo-700"
                            >
                              {lead.company}
                            </Link>
                          ) : (
                            <p className="text-xs font-bold text-slate-700 uppercase">Privately Held</p>
                          )}
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lead.industry || "—"}</p>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full border shadow-sm transition-all duration-500 group-hover:scale-105 ${badgeClass}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
                          {stageLabel}
                        </span>
                      </td>
                      <td className="px-10 py-6 hidden lg:table-cell max-w-[200px]">
                        <p className="text-xs font-medium text-slate-500 italic truncate" title={notePreview}>
                          {notePreview ? `"${notePreview}"` : "No remarks recorded."}
                        </p>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-3 justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Link
                            href={`/leads/${lead._id}`}
                            className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:border-indigo-400 hover:text-indigo-600 hover:shadow-md transition-all duration-300"
                            title="View Full Journey"
                          >
                            <Eye size={16} />
                          </Link>
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
                  )})}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

"use client";

import { useAdminProposals } from "@/app/hooks/useAdmin";
import { 
  FileCheck, 
  HandCoins, 
  TrendingUp, 
  FileText, 
  CheckCircle2, 
  Calendar,
  IndianRupee,
  ChevronRight,
  MoreVertical,
  ArrowRight
} from "lucide-react";
import type { Proposal, User, Lead } from "@/app/types";

export default function AdminProposalsPage() {
  const { data, isLoading } = useAdminProposals();

  const proposals = data?.data ?? [];

  const totalValue = proposals
    .filter((p) => p.status === "Accepted")
    .reduce((acc, curr) => acc + (curr.value || 0), 0);

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      "Draft": "bg-slate-50 text-slate-500 border-slate-100 shadow-slate-50",
      "Sent": "bg-blue-50 text-blue-600 border-blue-100 shadow-blue-50",
      "Accepted": "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-50",
      "Rejected": "bg-rose-50 text-rose-600 border-rose-100 shadow-rose-50",
      "In Negotiation": "bg-amber-50 text-amber-600 border-amber-100 shadow-amber-50",
    };
    const cls = colors[status] || "bg-slate-50 text-slate-400 border-slate-100 shadow-slate-50";
    
    return (
      <span className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full border shadow-sm ${cls}`}>
        {status}
      </span>
    );
  };

  if (isLoading) {
    return (
       <div className="space-y-4 animate-pulse">
        <div className="h-28 bg-slate-100 rounded-3xl border border-slate-200 shadow-sm mb-8" />
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-16 bg-slate-100 rounded-2xl border border-slate-200 shadow-sm" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Financial Health Summary Banner */}
      <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-16 transform translate-x-1/3 -translate-y-1/3 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition duration-1000" />
        <div className="absolute bottom-0 left-0 p-12 transform -translate-x-1/4 translate-y-1/2 bg-blue-400/10 rounded-full blur-2xl group-hover:scale-110 transition duration-1000" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-xl group-hover:rotate-12 transition-transform duration-500">
               <TrendingUp size={32} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-indigo-100 uppercase tracking-[0.25em] opacity-80">Global Portfolio Value</p>
              <h1 className="text-4xl font-extrabold text-white tracking-tight mt-1 group-hover:translate-x-1 transition-transform">
                ₹{totalValue.toLocaleString("en-IN")}
              </h1>
              <p className="text-[10px] font-medium text-indigo-200 mt-2 flex items-center gap-1 opacity-70">
                <CheckCircle2 size={12} /> Calculated from all <span className="text-white font-bold">accepted</span> contracts across the platform.
              </p>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-12 border-l border-white/10 pl-12 mr-8">
            <div className="text-center group-hover:scale-110 transition duration-500">
              <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest opacity-70">Total Proposals</p>
              <p className="text-2xl font-extrabold text-white mt-0.5">{proposals.length}</p>
            </div>
            <div className="text-center group-hover:scale-110 transition duration-500 delay-75">
               <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest opacity-70">Conversion Rate</p>
               <p className="text-2xl font-extrabold text-white mt-0.5">{proposals.length > 0 ? ((proposals.filter(p => p.status === 'Accepted').length / proposals.length) * 100).toFixed(1) : 0}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-2 mt-12">
        <h2 className="text-sm font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <HandCoins size={16} /> Financial Ledger <span className="bg-white px-2 py-0.5 rounded-full text-[10px] text-slate-800 border border-slate-200 shadow-sm">{proposals.length} TOTAL CONTRACTS</span>
        </h2>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2rem] shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl group/ledger">
        <div className="overflow-x-auto custom-scrollbar">
           <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[10px] font-extrabold uppercase tracking-[0.2em]">
                <th className="px-8 py-5">Record Identifier</th>
                <th className="px-8 py-5">Subject (Lead)</th>
                <th className="px-8 py-5">Author (Rep)</th>
                <th className="px-8 py-5">Current State</th>
                <th className="px-8 py-5 text-right">Contract Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {proposals.map((p: Proposal) => (
                <tr key={p._id} className="hover:bg-slate-50 group transition-all duration-300">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3 group-hover:translate-x-1 transition-transform">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 border border-slate-200">
                        <FileText size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-tighter">ID: {p._id.slice(-8).toUpperCase()}</p>
                        <p className="text-[10px] font-medium text-slate-400 mt-0.5 flex items-center gap-1 tracking-widest">
                          <Calendar size={10} /> {new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                       <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                         {typeof p.lead === 'object' && p.lead ? `${p.lead.firstName} ${p.lead.lastName}` : 'System Subject'}
                       </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">
                        {typeof p.createdBy === 'object' && p.createdBy ? p.createdBy.name : 'Automated Task'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    {getStatusBadge(p.status)}
                  </td>
                  <td className="px-8 py-5 text-right font-inter font-extrabold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                    <span className="inline-flex items-center gap-0.5 group-hover:scale-110 transition-transform origin-right">
                      <IndianRupee size={12} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                      {p.value?.toLocaleString("en-IN")}
                    </span>
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

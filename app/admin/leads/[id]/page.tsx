"use client";

import { useAdminLeadJourney } from "@/app/hooks/useAdmin";
import { 
  ArrowLeft, 
  Calendar, 
  Mail, 
  Phone, 
  Building2, 
  User as UserIcon,
  Briefcase,
  History,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  MessageSquare,
  ShieldCheck,
  UserPlus
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { Lead, User, ProposalStatus } from "@/app/types";

export default function AdminLeadJourneyPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: journeyData, isLoading } = useAdminLeadJourney(id);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse p-8">
        <div className="h-10 w-48 bg-slate-200 rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 bg-slate-100 rounded-3xl" />
          <div className="h-96 bg-slate-100 rounded-3xl" />
        </div>
      </div>
    );
  }

  const { lead, assignedUser, proposals } = journeyData?.data ?? {};

  if (!lead) return <div>Lead not found</div>;

  const getEventIcon = (event: string) => {
    switch (event) {
      case "Creation": return <Plus size={16} />;
      case "Status Changed": return <History size={16} />;
      case "Remark Added": return <MessageSquare size={16} />;
      case "Assigned": return <UserPlus size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const getProposalStatusColor = (status: ProposalStatus) => {
      switch(status) {
          case "Accepted": return "text-emerald-600 bg-emerald-50 border-emerald-100";
          case "Rejected": return "text-rose-600 bg-rose-50 border-rose-100";
          case "Sent": return "text-blue-600 bg-blue-50 border-blue-100";
          default: return "text-slate-600 bg-slate-50 border-slate-100";
      }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-10 pb-20 animate-fade-in">
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link 
            href="/admin/leads" 
            className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-lg transition-all active:scale-95 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
                {lead.firstName} {lead.lastName}
              </h1>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-indigo-100 shadow-sm">
                JOURNEY VIEW
              </span>
            </div>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1 flex items-center gap-2">
              <Building2 size={14} /> {lead.company || "Direct Engagement"} · {lead.industry || "General Inquiry"}
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <div className="text-right">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pipeline Entry</p>
             <p className="text-xs font-bold text-slate-700 mt-0.5">{new Date(lead.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Left: Journey Timeline */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-20 transform translate-x-1/2 -translate-y-1/2 bg-indigo-50/50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
             
             <div className="flex items-center gap-3 mb-10 relative z-10">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xl shadow-indigo-200">
                    <History size={20} />
                </div>
                <div>
                   <h2 className="text-lg font-black text-slate-900 tracking-tight">LIFECYCLE TIMELINE</h2>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time engagement audit</p>
                </div>
             </div>

             <div className="relative before:absolute before:inset-0 before:left-[19px] before:w-0.5 before:bg-slate-100 before:h-full pb-2 z-10">
                {[...(lead.timeline || [])].reverse().map((event, idx) => (
                  <div key={idx} className="relative pl-12 mb-10 last:mb-0 group/ev">
                    <div className="absolute left-0 w-10 h-10 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center text-slate-400 group-hover/ev:text-indigo-600 group-hover/ev:bg-indigo-50 transition-all duration-300 z-10">
                        {getEventIcon(event.event)}
                    </div>
                    <div className="bg-slate-50/50 border border-slate-100 p-5 rounded-3xl group-hover/ev:bg-white group-hover/ev:border-indigo-100 group-hover/ev:shadow-xl group-hover/ev:shadow-indigo-500/5 transition-all duration-500">
                       <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{event.event}</p>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                             <Clock size={12} /> {new Date(event.timestamp).toLocaleString("en-IN")}
                          </div>
                       </div>
                       {event.remark && (
                         <div className="bg-white border border-slate-100 p-4 rounded-2xl text-xs font-semibold text-slate-600 leading-relaxed italic shadow-sm">
                            "{event.remark}"
                         </div>
                       )}
                       <div className="mt-4 flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 border border-white">
                             {typeof event.performedBy === 'object' ? event.performedBy.name[0] : '?'}
                          </div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                             BY {typeof event.performedBy === 'object' ? event.performedBy.name : (event.performedBy || 'Platform')}
                          </p>
                       </div>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Right: Detailed Context */}
        <div className="space-y-8">
           {/* Current State Card */}
           <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 transform translate-x-1/2 -translate-y-1/2 bg-indigo-500/20 rounded-full blur-2xl" />
              <div className="relative z-10">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">CURRENT PIPELINE STATE</p>
                 <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shadow-lg transform rotate-3">
                        <TrendingUp size={24} />
                    </div>
                    <h2 className="text-3xl font-black tracking-tight uppercase leading-none">{lead.status}</h2>
                 </div>

                 <div className="space-y-4">
                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-4">
                        <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-indigo-400">
                           <ShieldCheck size={16} />
                        </div>
                        <div>
                           <p className="text-[10px] font-bold text-slate-500 uppercase">Assigned To</p>
                           <p className="text-sm font-bold truncate">{assignedUser?.name || 'Unassigned Pool'}</p>
                        </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-4">
                        <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-indigo-400">
                           <Briefcase size={16} />
                        </div>
                        <div>
                           <p className="text-[10px] font-bold text-slate-500 uppercase">Source Channel</p>
                           <p className="text-sm font-bold uppercase tracking-tight">{lead.source}</p>
                        </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Linked Proposals List */}
           <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8 px-2">
                 <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <FileText size={16} className="text-indigo-600" /> PROPOSALS ({proposals?.length || 0})
                 </h2>
              </div>
              
              <div className="space-y-4">
                 {proposals && proposals.length > 0 ? (
                    proposals.map((prop: any) => (
                      <div key={prop._id} className="bg-slate-50 border border-slate-100 p-5 rounded-3xl hover:border-indigo-200 hover:shadow-lg transition-all active:scale-95 group cursor-pointer">
                         <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-black uppercase text-slate-400">VALUATION</span>
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black border uppercase tracking-widest ${getProposalStatusColor(prop.status)}`}>
                               {prop.status}
                            </span>
                         </div>
                         <p className="text-xl font-black text-slate-900 tracking-tight">₹{prop.value.toLocaleString("en-IN")}</p>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                            <Calendar size={12} /> {new Date(prop.createdAt).toLocaleDateString("en-IN")}
                         </p>
                      </div>
                    ))
                 ) : (
                    <div className="text-center py-10 px-6 border-2 border-dashed border-slate-100 rounded-3xl">
                       <FileText size={32} className="text-slate-200 mx-auto mb-4" />
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No active proposals found</p>
                    </div>
                 )}
              </div>
           </div>

           {/* Contact Insight */}
           <div className="bg-indigo-50 rounded-[2.5rem] p-8 border border-indigo-100 group hover:bg-indigo-600 transition-colors duration-500">
              <h2 className="text-xs font-black text-indigo-700 uppercase tracking-widest mb-6 group-hover:text-white transition-colors">Direct Contact Access</h2>
              <div className="space-y-4">
                 <div className="flex items-center gap-4 bg-white/50 p-4 rounded-2xl group-hover:bg-white/10 transition-colors">
                    <Mail size={16} className="text-indigo-600 group-hover:text-indigo-200" />
                    <p className="text-xs font-bold text-slate-700 truncate group-hover:text-white transition-colors">{lead.email}</p>
                 </div>
                 {lead.phone && (
                   <div className="flex items-center gap-4 bg-white/50 p-4 rounded-2xl group-hover:bg-white/10 transition-colors">
                      <Phone size={16} className="text-indigo-600 group-hover:text-indigo-200" />
                      <p className="text-xs font-bold text-slate-700 group-hover:text-white transition-colors">{lead.phone}</p>
                   </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

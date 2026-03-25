"use client";

import { useLeads, useUpdateLead } from "@/app/hooks/useLeads";
import { 
  DragDropContext, 
  Droppable, 
  Draggable, 
  DropResult 
} from "@hello-pangea/dnd";
import { 
  LayoutDashboard, 
  Search,
  Mail,
  Building2,
  Calendar,
  Eye,
  Briefcase,
  Users
} from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";
import type { Lead, LeadStatus } from "@/app/types";

const STAGES: LeadStatus[] = [
  "Lead Captured",
  "Discovery Call Scheduled",
  "Requirement Gathering",
  "Pre-Assessment Form Sent",
  "Proposal Preparation",
  "Proposal Sent",
  "Negotiation",
  "Won",
  "Lost"
];

const STAGE_COLORS: Record<string, string> = {
  "Lead Captured": "bg-slate-500",
  "Discovery Call Scheduled": "bg-blue-500",
  "Requirement Gathering": "bg-indigo-500",
  "Pre-Assessment Form Sent": "bg-violet-500",
  "Proposal Preparation": "bg-purple-500",
  "Proposal Sent": "bg-amber-500",
  "Negotiation": "bg-orange-500",
  "Won": "bg-emerald-500",
  "Lost": "bg-rose-500"
};

export default function KanbanPage() {
  const { data: leadsData, isLoading } = useLeads();
  const updateLead = useUpdateLead();
  const [search, setSearch] = useState("");

  const leads = leadsData?.data ?? [];

  // Group leads by status
  const columns = useMemo(() => {
    const cols: Record<string, Lead[]> = {};
    STAGES.forEach(s => cols[s] = []);
    
    leads.filter(l => 
      `${l.firstName} ${l.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      l.company?.toLowerCase().includes(search.toLowerCase())
    ).forEach(l => {
      if (cols[l.status]) cols[l.status].push(l);
    });
    
    return cols;
  }, [leads, search]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // Trigger update
    updateLead.mutate({ 
      id: draggableId, 
      data: { status: destination.droppableId as LeadStatus } 
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] animate-pulse uppercase">Syncing Your Pipeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6 animate-fade-in-up">
      {/* Kanban Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3 uppercase">
             <LayoutDashboard className="text-indigo-600" size={28} /> Pipeline Kanban
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Accelerate Your Sales Cycle</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition" size={16} />
            <input 
              type="text"
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white border border-slate-200 rounded-2xl pl-12 pr-6 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all w-full sm:w-64 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="flex-1 overflow-x-auto pb-6 custom-scrollbar">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-6 h-full min-w-max px-2">
            {STAGES.map((stage) => (
              <div key={stage} className="w-80 flex flex-col gap-4">
                {/* Column Header */}
                <div className="flex items-center justify-between px-2">
                   <div className="flex items-center gap-2">
                      <div className={`w-2 h-6 rounded-full ${STAGE_COLORS[stage]}`} />
                      <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-widest leading-none">
                         {stage}
                      </h2>
                   </div>
                   <span className="bg-slate-100 text-[10px] font-black text-slate-500 px-2 py-1 rounded-lg border border-slate-200">
                      {columns[stage].length}
                   </span>
                </div>

                {/* Droppable Area */}
                <Droppable droppableId={stage}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`flex-1 rounded-4xl p-4 transition-all duration-300 border-2 border-dashed ${
                        snapshot.isDraggingOver 
                          ? "bg-indigo-50/50 border-indigo-200 shadow-inner" 
                          : "bg-slate-50/50 border-transparent"
                      }`}
                    >
                      <div className="space-y-4">
                        {columns[stage].map((lead, index) => (
                          <Draggable key={lead._id} draggableId={lead._id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-white border rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all group ${
                                  snapshot.isDragging 
                                    ? "ring-2 ring-indigo-500 shadow-2xl scale-105" 
                                    : "border-slate-100"
                                }`}
                              >
                                <div className="flex items-start justify-between mb-4">
                                   <div className="flex items-center gap-3">
                                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg ${STAGE_COLORS[stage]} group-hover:scale-110 transition`}>
                                         {(lead.firstName?.[0] || 'L')}
                                      </div>
                                      <div>
                                         <h4 className="text-sm font-black text-slate-900 leading-tight uppercase tracking-tight truncate max-w-[140px] group-hover:text-indigo-600">
                                            {lead.firstName} {lead.lastName}
                                         </h4>
                                         <p className="text-[9px] font-bold text-slate-400 uppercase truncate max-w-[140px] mt-0.5">
                                            {lead.company || "Individual Lead"}
                                         </p>
                                      </div>
                                   </div>
                                   <Link 
                                    href={`/leads/${lead._id}`}
                                    className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-indigo-600 hover:text-white transition active:scale-90"
                                   >
                                      <Eye size={14} />
                                   </Link>
                                </div>

                                <div className="space-y-3">
                                   <div className="flex items-center gap-3 text-slate-500">
                                      <Mail size={12} className="opacity-40" />
                                      <span className="text-[10px] font-bold truncate">{lead.email}</span>
                                   </div>
                                   <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                                      <div className="flex items-center gap-2">
                                         <Calendar size={12} className="text-slate-300" />
                                         <span className="text-[9px] font-black text-slate-400 uppercase">
                                            {new Date(lead.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}
                                         </span>
                                      </div>
                                      <div className="flex items-center gap-2 text-indigo-500">
                                          <Briefcase size={12} />
                                          <span className="text-[9px] font-black uppercase tracking-tighter">{lead.source}</span>
                                      </div>
                                   </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}

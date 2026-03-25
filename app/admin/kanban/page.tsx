"use client";

import { useAdminLeads, useUpdateLeadStatus } from "@/app/hooks/useAdmin";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  defaultDropAnimationSideEffects,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  DropAnimation,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  LayoutDashboard,
  Search,
  Mail,
  Building2,
  Calendar,
  Eye,
  Briefcase,
  Database,
  GripVertical
} from "lucide-react";
import Link from "next/link";
import { useState, useMemo, useCallback, useEffect, memo } from "react";
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

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.5",
      },
    },
  }),
};

// --- Sub-components (Memoized) ---

const KanbanCard = memo(({ lead, isOverlay }: { lead: Lead; isOverlay?: boolean }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: lead._id,
    data: {
      type: "Lead",
      lead,
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const cardContent = (
    <div
      className={`bg-white border rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all group relative ${
        isDragging ? "opacity-30 border-indigo-200" : "border-slate-100"
      } ${isOverlay ? "shadow-2xl ring-2 ring-indigo-500 scale-105 cursor-grabbing" : "cursor-grab"}`}
    >
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg ${STAGE_COLORS[lead.status]} group-hover:scale-110 transition`}>
            {lead.firstName?.[0] || 'L'}
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900 leading-tight uppercase tracking-tight truncate max-w-[140px] group-hover:text-indigo-600 transition">
              {lead.firstName} {lead.lastName}
            </h4>
            <p className="text-[9px] font-bold text-slate-400 uppercase truncate max-w-[140px] mt-0.5">
              {lead.company || "Individual Lead"}
            </p>
          </div>
        </div>
        {!isOverlay && (
          <div className="flex items-center gap-1">
             <div {...attributes} {...listeners} className="p-2 text-slate-300 hover:text-indigo-600 cursor-grab active:cursor-grabbing transition">
               <GripVertical size={18} />
            </div>
            <Link 
                href={`/admin/leads/${lead._id}`}
                className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-indigo-600 hover:text-white transition active:scale-90"
            >
                <Eye size={14} />
            </Link>
          </div>
        )}
      </div>

      <div className="space-y-3 relative z-10">
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
  );

  if (isOverlay) return cardContent;

  return (
    <div ref={setNodeRef} style={style}>
      {cardContent}
    </div>
  );
});

const KanbanColumn = memo(({ stage, leads }: { stage: LeadStatus; leads: Lead[] }) => {
  const { setNodeRef } = useDroppable({
    id: stage,
  });

  return (
    <div ref={setNodeRef} className="w-80 flex flex-col gap-4">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-6 rounded-full ${STAGE_COLORS[stage]}`} />
          <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-widest leading-none">
            {stage}
          </h2>
        </div>
        <span className="bg-slate-100 text-[10px] font-black text-slate-500 px-2 py-1 rounded-lg border border-slate-200">
          {leads.length}
        </span>
      </div>

      <SortableContext id={stage} items={leads.map(l => l._id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 rounded-4xl p-4 bg-slate-50/50 border-2 border-dashed border-transparent transition-all duration-300 min-h-[500px]">
          <div className="space-y-4">
            {leads.map((lead) => (
              <KanbanCard key={lead._id} lead={lead} />
            ))}
          </div>
        </div>
      </SortableContext>
    </div>
  );
});

export default function AdminKanbanPage() {
  const { data: leadsData, isLoading } = useAdminLeads();
  const updateStatus = useUpdateLeadStatus();
  const [search, setSearch] = useState("");
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [localLeads, setLocalLeads] = useState<Lead[]>([]);

  useEffect(() => {
    if (leadsData?.data) {
      setLocalLeads(leadsData.data);
    }
  }, [leadsData]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const columns = useMemo(() => {
    const cols: Record<string, Lead[]> = {};
    STAGES.forEach(s => cols[s] = []);
    localLeads.filter(l => 
      `${l.firstName} ${l.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      l.company?.toLowerCase().includes(search.toLowerCase())
    ).forEach(l => {
      if (cols[l.status]) cols[l.status].push(l);
    });
    return cols;
  }, [localLeads, search]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const lead = localLeads.find(l => l._id === active.id);
    if (lead) setActiveLead(lead);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeLead = localLeads.find(l => l._id === activeId);
    if (!activeLead) return;

    setLocalLeads((prev) => {
      const activeIdx = prev.findIndex(l => l._id === activeId);
      const activeL = prev[activeIdx];

      const isOverACard = over.data.current?.type === "Lead";
      if (isOverACard) {
        const overIdx = prev.findIndex(l => l._id === overId);
        const overLead = prev[overIdx];
        if (activeL.status !== overLead.status) {
          const updated = { ...activeL, status: overLead.status };
          const newList = [...prev];
          newList[activeIdx] = updated;
          return arrayMove(newList, activeIdx, overIdx);
        }
      }

      const isOverAColumn = STAGES.includes(overId as any);
      if (isOverAColumn && activeL.status !== overId) {
        const updated = { ...activeL, status: overId as LeadStatus };
        const newList = [...prev];
        newList[activeIdx] = updated;
        return arrayMove(newList, activeIdx, activeIdx);
      }

      return prev;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveLead(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeLead = localLeads.find(l => l._id === activeId);
    if (!activeLead) return;

    let finalStatus: LeadStatus = activeLead.status;
    if (STAGES.includes(overId as any)) {
      finalStatus = overId as LeadStatus;
    } else {
      const overLead = localLeads.find(l => l._id === overId);
      if (overLead) finalStatus = overLead.status;
    }

    const originalLead = leadsData?.data?.find(l => l._id === activeId);
    if (originalLead && originalLead.status !== finalStatus) {
      updateStatus.mutate({ leadId: activeId as string, status: finalStatus });
    }

    if (activeId !== overId) {
      setLocalLeads(prev => {
        const aIdx = prev.findIndex(l => l._id === activeId);
        const oIdx = prev.findIndex(l => l._id === overId);
        return arrayMove(prev, aIdx, oIdx);
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] animate-pulse uppercase">Activating Performance Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
             <LayoutDashboard className="text-indigo-600" size={28} /> LEAD KANBAN
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">High-Precision Visual Pipeline Management</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition" size={16} />
            <input 
              type="text"
              placeholder="Filter by lead name or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white border border-slate-200 rounded-2xl pl-12 pr-6 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all w-full sm:w-72 shadow-sm"
            />
          </div>
          <Link href="/admin/leads" className="bg-slate-900 text-white p-3 rounded-2xl hover:bg-slate-800 transition shadow-lg active:scale-95 group">
             <Database size={20} className="group-hover:rotate-12 transition" />
          </Link>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-6 custom-scrollbar">
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
          <div className="flex gap-6 h-full min-w-max px-2">
            {STAGES.map((stage) => <KanbanColumn key={stage} stage={stage} leads={columns[stage]} />)}
          </div>
          <DragOverlay dropAnimation={dropAnimation}>
            {activeLead ? <KanbanCard lead={activeLead} isOverlay /> : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}

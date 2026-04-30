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
  GripVertical,
  X
} from "lucide-react";
import Link from "next/link";
import { useState, useMemo, useCallback, useEffect, memo } from "react";
import type { Lead, LeadOutcome } from "@/app/types";
import {
  PIPELINE_LEAD_STATUSES,
  getLeadBoardColumn,
  getLeadOutcome,
  getLeadStage,
  type PipelineLeadStatus,
} from "@/app/lib/leadStatus";

const BOARD_COLUMNS = [...PIPELINE_LEAD_STATUSES, "Won", "Lost"] as const;
type BoardColumn = typeof BOARD_COLUMNS[number];

const STAGE_COLORS: Record<string, string> = {
  "Lead Captured": "bg-slate-500",
  "Discovery Call Scheduled": "bg-blue-500",
  "Requirement Gathering": "bg-indigo-500",
  "Proposal Sent": "bg-amber-500",
  "Negotiation": "bg-orange-500",
  "Won": "bg-emerald-500",
  "Lost": "bg-rose-500"
};

function applyBoardColumn(lead: Lead, column: BoardColumn): Lead {
  if (column === "Won") return { ...lead, outcome: "won" };
  if (column === "Lost") return { ...lead, outcome: "lost" };
  return { ...lead, status: column as PipelineLeadStatus, outcome: "open" };
}

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

const KanbanCard = memo(({ lead, isOverlay, onOpen }: { lead: Lead; isOverlay?: boolean; onOpen?: (lead: Lead) => void }) => {
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
  const column = getLeadBoardColumn(lead) as BoardColumn;

  const cardContent = (
    <div
      onClick={!isOverlay ? () => onOpen?.(lead) : undefined}
      className={`bg-white border rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all group relative ${
        isDragging ? "opacity-30 border-indigo-200" : "border-slate-100"
      } ${isOverlay ? "shadow-2xl ring-2 ring-indigo-500 scale-105 cursor-grabbing" : "cursor-grab"}`}
    >
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg ${STAGE_COLORS[column]} group-hover:scale-110 transition`}>
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
             <div {...attributes} {...listeners} onClick={(e) => e.stopPropagation()} className="p-2 text-slate-300 hover:text-indigo-600 cursor-grab active:cursor-grabbing transition">
               <GripVertical size={18} />
            </div>
            <Link 
                onClick={(e) => e.stopPropagation()}
                href={`/admin/leads/${lead._id}`}
                className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-indigo-600 hover:text-white transition active:scale-90"
            >
                <Eye size={14} />
            </Link>
          </div>
        )}
      </div>

      <div className="space-y-3 relative z-10">
        <div className="inline-flex rounded-full bg-slate-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-slate-500 border border-slate-100">
          {column}
        </div>
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

const KanbanColumn = memo(({ stage, leads, onOpen }: { stage: BoardColumn; leads: Lead[]; onOpen: (lead: Lead) => void }) => {
  const { setNodeRef } = useDroppable({
    id: stage,
  });
  const isOutcomeColumn = stage === "Won" || stage === "Lost";

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
        <div className={`flex-1 rounded-4xl p-4 border-2 border-dashed transition-all duration-300 min-h-[500px] ${
          isOutcomeColumn ? "bg-slate-50/30 border-slate-100" : "bg-slate-50/50 border-transparent"
        }`}>
          <div className="space-y-4">
            {leads.map((lead) => (
              <KanbanCard key={lead._id} lead={lead} onOpen={onOpen} />
            ))}
          </div>
        </div>
      </SortableContext>
    </div>
  );
});

function OutcomeModal({
  lead,
  onSave,
  onClose,
  isSaving,
}: {
  lead: Lead;
  onSave: (payload: { status: PipelineLeadStatus; outcome: LeadOutcome; lostReason?: string; latestRemark?: string }) => void;
  onClose: () => void;
  isSaving: boolean;
}) {
  const [status, setStatus] = useState<PipelineLeadStatus>(getLeadStage(lead));
  const [outcome, setOutcome] = useState<LeadOutcome>(getLeadOutcome(lead));
  const [latestRemark, setLatestRemark] = useState("");
  const [lostReason, setLostReason] = useState(lead.lostReason ?? "");
  const inputCls = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all";

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg animate-scale-in">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Admin Lead Update</h3>
            <p className="mt-1 text-xs font-bold text-slate-400">{lead.firstName} {lead.lastName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition"><X size={18} /></button>
        </div>
        <div className="p-8 space-y-5">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Pipeline Stage</label>
            <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value as PipelineLeadStatus)}>
              {PIPELINE_LEAD_STATUSES.map((stage) => <option key={stage} value={stage}>{stage}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Outcome</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: "open", label: "Open", cls: "border-indigo-500 bg-indigo-50 text-indigo-700" },
                { key: "won", label: "Won", cls: "border-emerald-500 bg-emerald-50 text-emerald-700" },
                { key: "lost", label: "Lost", cls: "border-rose-500 bg-rose-50 text-rose-700" },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setOutcome(item.key as LeadOutcome)}
                  className={`rounded-2xl border px-3 py-3 text-[11px] font-black uppercase tracking-widest transition ${
                    outcome === item.key ? item.cls : "border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          {outcome === "lost" && (
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Loss Note</label>
              <textarea
                className={`${inputCls} min-h-28 resize-none border-rose-200 bg-rose-50/40 focus:ring-rose-50 focus:border-rose-500`}
                value={lostReason}
                onChange={(e) => setLostReason(e.target.value)}
                placeholder="Optional admin loss note."
              />
            </div>
          )}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Update Note</label>
            <textarea
              className={`${inputCls} min-h-24 resize-none`}
              value={latestRemark}
              onChange={(e) => setLatestRemark(e.target.value)}
              placeholder="Optional note for the timeline."
            />
          </div>
          <button
            type="button"
            onClick={() => onSave({
              status,
              outcome,
              lostReason: outcome === "lost" ? lostReason.trim() || undefined : undefined,
              latestRemark: latestRemark.trim() || undefined,
            })}
            disabled={isSaving}
            className="w-full py-4 bg-indigo-600 hover:bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/10 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Update"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminKanbanPage() {
  const { data: leadsData, isLoading } = useAdminLeads();
  const updateStatus = useUpdateLeadStatus();
  const [search, setSearch] = useState("");
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
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
    BOARD_COLUMNS.forEach(s => cols[s] = []);
    localLeads.filter(l => 
      `${l.firstName} ${l.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      l.company?.toLowerCase().includes(search.toLowerCase())
    ).forEach(l => {
      const column = getLeadBoardColumn(l) as BoardColumn;
      if (cols[column]) cols[column].push(l);
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
        const overColumn = getLeadBoardColumn(overLead) as BoardColumn;
        if ((getLeadBoardColumn(activeL) as BoardColumn) !== overColumn && overColumn !== "Won" && overColumn !== "Lost") {
          const updated = applyBoardColumn(activeL, overColumn);
          const newList = [...prev];
          newList[activeIdx] = updated;
          return arrayMove(newList, activeIdx, overIdx);
        }
      }

      const isOverAColumn = BOARD_COLUMNS.includes(overId as BoardColumn);
      if (isOverAColumn && overId !== "Won" && overId !== "Lost" && (getLeadBoardColumn(activeL) as BoardColumn) !== overId) {
        const updated = applyBoardColumn(activeL, overId as BoardColumn);
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

    let finalColumn: BoardColumn = getLeadBoardColumn(activeLead) as BoardColumn;
    if (BOARD_COLUMNS.includes(overId as BoardColumn)) {
      finalColumn = overId as BoardColumn;
    } else {
      const overLead = localLeads.find(l => l._id === overId);
      if (overLead) finalColumn = getLeadBoardColumn(overLead) as BoardColumn;
    }

    const originalLead = leadsData?.data?.find(l => l._id === activeId);
    const originalColumn = originalLead
      ? (getLeadBoardColumn(originalLead) as BoardColumn)
      : (getLeadBoardColumn(activeLead) as BoardColumn);
    if (finalColumn === "Won" || finalColumn === "Lost") {
      setLocalLeads(leadsData?.data ?? []);
      if (originalLead) setEditingLead(originalLead);
      return;
    }

    if (originalLead && originalColumn !== finalColumn) {
      updateStatus.mutate({ leadId: activeId as string, status: finalColumn, outcome: "open" });
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
      {editingLead && (
        <OutcomeModal
          lead={editingLead}
          isSaving={updateStatus.isPending}
          onClose={() => setEditingLead(null)}
          onSave={(payload) => {
            updateStatus.mutate(
              { leadId: editingLead._id, ...payload },
              { onSuccess: () => setEditingLead(null) }
            );
          }}
        />
      )}
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
            {BOARD_COLUMNS.map((stage) => <KanbanColumn key={stage} stage={stage} leads={columns[stage]} onOpen={setEditingLead} />)}
          </div>
          <DragOverlay dropAnimation={dropAnimation}>
            {activeLead ? <KanbanCard lead={activeLead} isOverlay /> : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}

"use client";

import { useAdminUsers, useUpdateUserRole, useToggleUserStatus } from "@/app/hooks/useAdmin";
import { 
  Users, 
  ShieldCheck, 
  UserCog, 
  LockKeyhole, 
  LockKeyholeOpen, 
  ArrowRight,
  MoreVertical,
  ChevronDown,
  UserCheck,
  UserX
} from "lucide-react";
import { useState } from "react";
import type { User } from "@/app/types";

export default function AdminUsersPage() {
  const { data, isLoading } = useAdminUsers();
  const updateRole = useUpdateUserRole();
  const toggleStatus = useToggleUserStatus();
  
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const users = data?.data ?? [];

  const handleRoleChange = (userId: string, newRole: string) => {
    setUpdatingId(userId);
    updateRole.mutate({ userId, role: newRole }, {
      onSettled: () => setUpdatingId(null)
    });
  };

  const handleToggleStatus = (userId: string) => {
    setUpdatingId(userId);
    toggleStatus.mutate(userId, {
      onSettled: () => setUpdatingId(null)
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-16 bg-slate-100 rounded-2xl border border-slate-200 shadow-sm" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-sm font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <Users size={16} /> Platform Directory <span className="bg-slate-100 px-2 py-0.5 rounded-full text-[10px] text-slate-800 border border-slate-200 shadow-sm">{users.length} Total</span>
        </h2>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[10px] font-extrabold uppercase tracking-[0.2em]">
                <th className="px-8 py-5">Full Name & ID</th>
                <th className="px-8 py-5">Role Authority</th>
                <th className="px-8 py-5 text-center">Credentials Status</th>
                <th className="px-8 py-5 text-right">Access Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((user: User) => {
                const isUpdating = updatingId === user._id;

                return (
                  <tr key={user._id} className="hover:bg-slate-50/80 transition-all duration-300 group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                          user.role === 'admin' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                        } border border-slate-200 shadow-sm relative group-hover:scale-105`}>
                          {user.role === 'admin' ? <ShieldCheck size={20} /> : <UserCog size={20} />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{user.name}</p>
                          <p className="text-[10px] font-medium text-slate-400 font-mono mt-0.5">{user._id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="relative inline-block w-40 animate-fade-in">
                        <select
                          disabled={isUpdating}
                          value={user.role}
                          onChange={(e) => handleRoleChange(user._id, e.target.value)}
                          className="w-full appearance-none bg-slate-100 hover:bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 cursor-pointer disabled:opacity-50 pr-10 uppercase tracking-widest shadow-sm"
                        >
                          <option value="admin">Administrator</option>
                          <option value="sales_rep">Sales Rep</option>
                          <option value="manager">Lead Manager</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-indigo-600 transition" />
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex justify-center">
                        <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full border shadow-sm transition-all duration-300 group-hover:scale-105 ${
                          user.isActive 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                            : "bg-red-50 text-red-700 border-red-100"
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${user.isActive ? "bg-emerald-500 shadow-emerald-200" : "bg-red-500 shadow-red-200 animate-pulse"}`} />
                          <span className="text-[10px] font-extrabold uppercase tracking-widest">
                            {user.isActive ? "Authorized" : "Revoked"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button
                        disabled={isUpdating}
                        onClick={() => handleToggleStatus(user._id)}
                        className={`inline-flex items-center gap-2.5 font-extrabold text-[10px] uppercase tracking-[0.25em] px-5 py-3 rounded-2xl transition-all duration-300 active:scale-95 disabled:opacity-50 shadow-sm ${
                          user.isActive 
                            ? "bg-red-50 text-red-600 border border-red-100 hover:bg-red-600 hover:text-white hover:shadow-red-200 hover:shadow-lg" 
                            : "bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-600 hover:text-white hover:shadow-emerald-200 hover:shadow-lg"
                        }`}
                      >
                        {user.isActive ? (
                          <>Revoke Access <LockKeyhole size={14} /></>
                        ) : (
                          <>Restore Access <LockKeyholeOpen size={14} /></>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

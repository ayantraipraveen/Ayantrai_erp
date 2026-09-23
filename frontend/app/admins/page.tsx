"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Search,
  Building,
  ShieldCheck,
  Clock,
  CheckCircle2,
  X,
  Sparkles,
  Trash2,
  RotateCcw,
  Database,
  Copy,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  addAdminAccount,
  toggleAdminAccountStatus,
  deleteAdminAccount,
  syncAdminsFromStorage,
  resetAdminsToDefault,
  ADMINS_STORAGE_KEY,
  showGlobalToast,
} from "@/lib/redux/slices/reportModuleSlice";

export default function AdminsManagementPage() {
  const dispatch = useAppDispatch();
  const { admins, sites } = useAppSelector((state) => state.reportModule);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive">("All");
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Form State
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminSiteId, setNewAdminSiteId] = useState("SITE-01");

  // Keep synced with localStorage on mount
  useEffect(() => {
    dispatch(syncAdminsFromStorage());
  }, [dispatch]);

  const showToast = (msg: string, type: "success" | "info" | "warning" | "error" = "info") => {
    dispatch(showGlobalToast({ message: msg, type }));
  };

  const copyToClipboard = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast(`Copied ${label}: ${text}`);
    }
  };

  const filteredAdmins = admins.filter((adm) => {
    const matchesSearch =
      adm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      adm.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      adm.assigned_site.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || adm.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminName.trim() || !newAdminEmail.trim()) {
      showToast("Please provide both name and email.");
      return;
    }
    const targetSite = sites.find((s) => s.id === newAdminSiteId) || sites[0];

    dispatch(
      addAdminAccount({
        name: newAdminName.trim(),
        email: newAdminEmail.trim(),
        assigned_site: targetSite.name,
        assigned_site_id: targetSite.id,
        status: "Active",
      })
    );

    setAddModalOpen(false);
    const createdName = newAdminName.trim();
    setNewAdminName("");
    setNewAdminEmail("");
    showToast(`Administrator "${createdName}" created and saved in localStorage ('${ADMINS_STORAGE_KEY}')!`);
  };

  const toggleAdminStatus = (id: string, name: string) => {
    dispatch(toggleAdminAccountStatus(id));
    showToast(`Admin ${name} status updated & saved to localStorage.`);
  };

  const handleDeleteAdmin = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove admin "${name}"?`)) {
      dispatch(deleteAdminAccount(id));
      showToast(`Admin ${name} deleted from localStorage.`);
    }
  };

  const handleResetDefaults = () => {
    if (confirm("Reset administrator directory back to initial mock accounts in localStorage?")) {
      dispatch(resetAdminsToDefault());
      showToast("Admins reset to default seed records.");
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-zinc-800/90 bg-white/90 dark:bg-[#0b0e14]/90 backdrop-blur-xl shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#F6C72F] px-2 py-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 font-bold">
              SUPERADMIN GOVERNANCE
            </span>
            <span className="text-xs text-slate-500 dark:text-zinc-400">Spec Section 1 & 5</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Site Administrator Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1 max-w-2xl">
            Superadmin directory of authorized field admins scoped to individual industrial infrastructure sites.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            title="Reset to default seed administrators"
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/70 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-medium text-xs transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#F6C72F] hover:bg-[#F6C72F]/90 text-slate-950 font-semibold text-xs transition-all shadow-[0_0_20px_rgba(246,199,47,0.35)] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Provision New Admin</span>
          </button>
        </div>
      </div>

      {/* LocalStorage Persistence Banner */}
      <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 dark:bg-[#0f1420] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-slate-700 dark:text-zinc-300">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#F6C72F]/20 text-[#F6C72F]">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-slate-900 dark:text-white">
              LocalStorage Persistence Active:
            </span>{" "}
            Admins created here are automatically saved to browser storage (
            <code className="font-mono text-[11px] text-[#F6C72F] font-bold">
              &apos;{ADMINS_STORAGE_KEY}&apos;
            </code>
            ) and persist across page refreshes.
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-zinc-400">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{admins.length} Total Registered</span>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-[#0d1017] flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400">Total Admins</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{admins.length}</div>
          </div>
          <div className="p-2 rounded-lg bg-amber-500/10 text-[#F6C72F]">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-[#0d1017] flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400">Active On-Site</div>
            <div className="text-lg font-bold text-emerald-500 mt-0.5">
              {admins.filter((a) => a.status === "Active").length}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-[#0d1017] flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400">Assigned Sites</div>
            <div className="text-lg font-bold text-sky-400 mt-0.5">{sites.length} Active</div>
          </div>
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
            <Building className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-[#0d1017] flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400">Access Policy</div>
            <div className="text-lg font-bold text-[#F6C72F] mt-0.5">Site-Scoped</div>
          </div>
          <div className="p-2 rounded-lg bg-[#F6C72F]/10 text-[#F6C72F]">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-[#0d1017]">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or site..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/80 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#F6C72F]"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
          {(["All", "Active", "Inactive"] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                statusFilter === st
                  ? "bg-[#F6C72F]/15 border border-[#F6C72F]/50 text-slate-900 dark:text-white font-semibold"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Admins Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-zinc-800/90 bg-white dark:bg-[#0c1017] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-zinc-800/80 bg-slate-50/70 dark:bg-zinc-900/40 text-[10px] font-mono uppercase text-slate-500 dark:text-zinc-400">
                <th className="py-3.5 px-4 font-semibold">Administrator</th>
                <th className="py-3.5 px-4 font-semibold">Assigned Scoped Site</th>
                <th className="py-3.5 px-4 font-semibold">Work Email</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold">Last Active</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
              {filteredAdmins.map((adm) => (
                <tr
                  key={adm.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/30 transition-colors"
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-xl bg-[#F6C72F]/20 border border-[#F6C72F]/40 flex items-center justify-center font-bold text-xs text-[#F6C72F]">
                        {adm.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">{adm.name}</div>
                        <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">ID: {adm.id}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-slate-800 dark:text-zinc-300">
                      <Building className="w-3.5 h-3.5 text-[#F6C72F] flex-shrink-0" />
                      <span className="truncate max-w-[220px]">{adm.assigned_site}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-600 dark:text-zinc-400 font-mono text-[11px]">
                    <div className="flex items-center gap-1.5 group/email">
                      <span>{adm.email}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(adm.email, "Admin email")}
                        title="Copy email to clipboard for sign-in testing"
                        className="p-1 rounded opacity-0 group-hover/email:opacity-100 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-opacity cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase border ${
                        adm.status === "Active"
                          ? "bg-emerald-950/60 text-emerald-400 border-emerald-500/40"
                          : "bg-slate-800 text-slate-400 border-slate-700"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          adm.status === "Active" ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
                        }`}
                      />
                      {adm.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-500 dark:text-zinc-400 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {adm.last_active}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => toggleAdminStatus(adm.id, adm.name)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer border ${
                          adm.status === "Active"
                            ? "border-rose-500/30 text-rose-500 hover:bg-rose-500/10"
                            : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                        }`}
                      >
                        {adm.status === "Active" ? "Deactivate" : "Reactivate"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteAdmin(adm.id, adm.name)}
                        title="Delete admin account"
                        className="p-1 rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision Admin Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] p-6 shadow-2xl space-y-4 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-[#F6C72F]">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Provision Site Administrator</h3>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">Scoped to industrial site operations</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="p-1 rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddAdmin} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Administrator Full Name *</label>
                <input
                  type="text"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  placeholder="e.g. Sunil Mahapatra"
                  required
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#F6C72F]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Corporate Email Address *</label>
                <input
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="e.g. sunil.m@lt-infra.com"
                  required
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#F6C72F]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Assigned Site Scope *</label>
                <select
                  value={newAdminSiteId}
                  onChange={(e) => setNewAdminSiteId(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#F6C72F]"
                >
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.location})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-zinc-700 text-xs font-medium text-slate-600 dark:text-zinc-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#F6C72F] hover:bg-[#F6C72F]/90 text-slate-950 font-bold text-xs shadow-[0_0_16px_rgba(246,199,47,0.3)] transition-all cursor-pointer"
                >
                  Create Admin Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

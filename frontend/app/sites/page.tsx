"use client";

import React, { useState } from "react";
import {
  Building,
  Plus,
  Users,
  ShieldCheck,
  Sparkles,
  MapPin,
  X,
  Radio,
} from "lucide-react";
import { useAppSelector } from "@/lib/redux/hooks";
import { SiteInfo } from "@/lib/redux/slices/reportModuleSlice";

export default function SitesDirectoryPage() {
  const { sites: initialSites } = useAppSelector((state) => state.reportModule);
  const [sitesList, setSitesList] = useState<SiteInfo[]>(initialSites);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [workers, setWorkers] = useState(100);
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [projectHeadName, setProjectHeadName] = useState("");
  const [projectHeadEmail, setProjectHeadEmail] = useState("");
  const [projectHeadPhone, setProjectHeadPhone] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCreateSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !location.trim()) {
      showToast("Please provide site name and location.");
      return;
    }

    const newSite: SiteInfo = {
      id: `SITE-0${sitesList.length + 1}`,
      name,
      location,
      active_workers: workers || 80,
      assigned_admin_name: adminName || "Vikram Seth",
      assigned_admin_email: adminEmail || "admin@ayantrai-demo.com",
      project_head_name: projectHeadName || "Er. Project Head",
      project_head_email: projectHeadEmail || "head@ayantrai-demo.com",
      project_head_phone: projectHeadPhone || "+91 98000 12345",
      auto_attach_pdf: true,
    };

    setSitesList([newSite, ...sitesList]);
    setAddModalOpen(false);
    setName("");
    setLocation("");
    showToast(`Site "${newSite.name}" registered into enterprise telemetry mesh!`);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white border border-[#9D61FF]/60 shadow-[0_0_24px_rgba(157,97,255,0.3)] text-xs font-medium animate-slideUp">
          <Sparkles className="w-4 h-4 text-[#9D61FF]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-zinc-800/90 bg-white/90 dark:bg-[#0b0e14]/90 backdrop-blur-xl shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#9D61FF] px-2 py-0.5 rounded-full border border-purple-500/30 bg-purple-500/10 font-bold">
              SUPERADMIN INFRASTRUCTURE
            </span>
            <span className="text-xs text-slate-500 dark:text-zinc-400">Spec Section 1 & 5</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Industrial Sites Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1 max-w-2xl">
            Directory of all monitored industrial sites, each configured with an assigned Site Administrator and Project Head.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#9D61FF] hover:bg-[#8B4CF0] text-white font-semibold text-xs transition-all shadow-[0_0_20px_rgba(157,97,255,0.35)] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Site</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-[#0d1017] flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400">Monitored Sites</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{sitesList.length} Sites</div>
          </div>
          <div className="p-2 rounded-lg bg-purple-500/10 text-[#9D61FF]">
            <Building className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-[#0d1017] flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400">Active Field Force</div>
            <div className="text-lg font-bold text-emerald-500 mt-0.5">
              {sitesList.reduce((acc, s) => acc + s.active_workers, 0)} Personnel
            </div>
          </div>
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-[#0d1017] flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400">BLE Mesh Sync</div>
            <div className="text-lg font-bold text-sky-400 mt-0.5">100% Online</div>
          </div>
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
            <Radio className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-[#0d1017] flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400">Standard</div>
            <div className="text-lg font-bold text-[#9D61FF] mt-0.5">ISO 45001</div>
          </div>
          <div className="p-2 rounded-lg bg-purple-500/10 text-[#9D61FF]">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Sites Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sitesList.map((site) => (
          <div
            key={site.id}
            className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800/90 bg-white dark:bg-[#0c1017] hover:border-purple-500/50 transition-all flex flex-col justify-between shadow-sm space-y-4"
          >
            <div>
              {/* Site Header: Name, Location, Status */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-[#9D61FF] bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 rounded">
                      {site.id}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{site.name}</h3>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-zinc-400 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{site.location}</span>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-[10px] font-mono text-emerald-400 font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {site.active_workers} Active
                </span>
              </div>

              {/* Two Column Breakdown: Site Admin vs Project Head */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800/80 text-xs">
                {/* Site Admin Scoped Box */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/70 space-y-1.5">
                  <div className="text-[10px] font-mono uppercase font-bold text-[#9D61FF] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Assigned Site Admin
                  </div>
                  <div className="font-semibold text-slate-900 dark:text-white">{site.assigned_admin_name}</div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 truncate font-mono">
                    {site.assigned_admin_email}
                  </div>
                </div>

                {/* Project Head Box */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/70 space-y-1.5">
                  <div className="text-[10px] font-mono uppercase font-bold text-sky-400 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    Site Project Head
                  </div>
                  <div className="font-semibold text-slate-900 dark:text-white">{site.project_head_name}</div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 truncate font-mono">
                    {site.project_head_email}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">{site.project_head_phone}</div>
                </div>
              </div>
            </div>

            {/* Site Footer Badges */}
            <div className="pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-zinc-400">
                <span>PDF Auto-Attach:</span>
                <span className={site.auto_attach_pdf ? "text-emerald-500 font-semibold" : "text-slate-400"}>
                  {site.auto_attach_pdf ? "Enabled" : "Disabled"}
                </span>
              </div>

              <div className="text-[10px] font-mono text-[#9D61FF] flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#9D61FF]" />
                Mesh Telemetry Ready
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Register Site Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] p-6 shadow-2xl space-y-4 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-500/10 text-[#9D61FF]">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Register Industrial Site</h3>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">Configure site telemetry, admin & project head</p>
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

            <form onSubmit={handleCreateSite} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Site Facility Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Coastal Road Reclamation"
                    required
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#9D61FF]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Geo Location *</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Worli, Mumbai"
                    required
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#9D61FF]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Active Workers Count</label>
                <input
                  type="number"
                  value={workers}
                  onChange={(e) => setWorkers(Number(e.target.value))}
                  placeholder="120"
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#9D61FF]"
                />
              </div>

              {/* Assigned Site Admin */}
              <div className="pt-2 border-t border-slate-200 dark:border-zinc-800">
                <span className="text-[11px] font-mono uppercase font-bold text-[#9D61FF]">Assigned Admin Credentials</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1.5">
                  <input
                    type="text"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="Admin Name"
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#9D61FF]"
                  />
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@lt-infra.com"
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#9D61FF]"
                  />
                </div>
              </div>

              {/* Project Head Credentials */}
              <div className="pt-2 border-t border-slate-200 dark:border-zinc-800">
                <span className="text-[11px] font-mono uppercase font-bold text-sky-400">Site Project Head Contact</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1.5">
                  <input
                    type="text"
                    value={projectHeadName}
                    onChange={(e) => setProjectHeadName(e.target.value)}
                    placeholder="Project Head Name"
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#9D61FF]"
                  />
                  <input
                    type="email"
                    value={projectHeadEmail}
                    onChange={(e) => setProjectHeadEmail(e.target.value)}
                    placeholder="head@client.com"
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#9D61FF]"
                  />
                  <input
                    type="text"
                    value={projectHeadPhone}
                    onChange={(e) => setProjectHeadPhone(e.target.value)}
                    placeholder="+91 98..."
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#9D61FF]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-zinc-700 text-xs font-medium text-slate-600 dark:text-zinc-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#9D61FF] hover:bg-[#8B4CF0] text-white font-bold text-xs shadow-[0_0_16px_rgba(157,97,255,0.3)] transition-all cursor-pointer"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

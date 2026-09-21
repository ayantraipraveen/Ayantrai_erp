"use client";

import React, { useState, useEffect } from "react";
import { useAppSelector } from "@/lib/redux/hooks";
import {
  ShieldCheck,
  HardHat,
  Footprints,
  Radio,
  Wifi,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
  Zap,
  Volume2,
  ArrowUpRight,
  SlidersHorizontal,
  ChevronRight,
} from "lucide-react";

interface WorkerTelemetry {
  id: string;
  name: string;
  empId: string;
  trade: string;
  zone: string;
  helmetStatus: "WORN" | "REMOVED";
  vestStatus: "CELLULAR" | "MESH_RELAY";
  bootStatus: "GROUNDED" | "STANDBY";
  battery: number;
  lastSync: string;
  isCompliant: boolean;
}

export default function DashboardPage() {
  const { user } = useAppSelector((state) => state.auth);

  const [filterZone, setFilterZone] = useState("ALL");
  const [filterCompliance, setFilterCompliance] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [lastHeartbeat, setLastHeartbeat] = useState("Just now");
  const [pingFeedback, setPingFeedback] = useState<string | null>(null);

  // Initial Sample Workers Telemetry
  const [workers, setWorkers] = useState<WorkerTelemetry[]>([
    {
      id: "w-1",
      name: "Rajesh Kumar",
      empId: "EMP-1048",
      trade: "Steel Framing Crew #3",
      zone: "Zone 2 (Tower Core L12)",
      helmetStatus: "WORN",
      vestStatus: "CELLULAR",
      bootStatus: "GROUNDED",
      battery: 98,
      lastSync: "1.2s ago",
      isCompliant: true,
    },
    {
      id: "w-2",
      name: "Amit Verma",
      empId: "EMP-1082",
      trade: "Concrete Pouring Core",
      zone: "Zone 1 (Ground Yard B)",
      helmetStatus: "WORN",
      vestStatus: "CELLULAR",
      bootStatus: "GROUNDED",
      battery: 94,
      lastSync: "2.4s ago",
      isCompliant: true,
    },
    {
      id: "w-3",
      name: "Sunil Paswan",
      empId: "EMP-1104",
      trade: "Scaffolding & Rigging",
      zone: "Zone 2 (External Façade)",
      helmetStatus: "WORN",
      vestStatus: "MESH_RELAY",
      bootStatus: "GROUNDED",
      battery: 89,
      lastSync: "3.1s ago",
      isCompliant: true,
    },
    {
      id: "w-4",
      name: "Dinesh Yadav",
      empId: "EMP-1092",
      trade: "Electrical Conduit Ops",
      zone: "Zone 3 (Basement Substation)",
      helmetStatus: "REMOVED",
      vestStatus: "CELLULAR",
      bootStatus: "GROUNDED",
      battery: 82,
      lastSync: "0.8s ago",
      isCompliant: false,
    },
    {
      id: "w-5",
      name: "Mohan Lal",
      empId: "EMP-1115",
      trade: "Crane & Hoist Rigging",
      zone: "Zone 1 (Material Staging)",
      helmetStatus: "WORN",
      vestStatus: "CELLULAR",
      bootStatus: "GROUNDED",
      battery: 96,
      lastSync: "1.8s ago",
      isCompliant: true,
    },
    {
      id: "w-6",
      name: "Bikram Singh",
      empId: "EMP-1120",
      trade: "Civil Inspection",
      zone: "Zone 2 (Tower Core L14)",
      helmetStatus: "WORN",
      vestStatus: "CELLULAR",
      bootStatus: "GROUNDED",
      battery: 99,
      lastSync: "0.5s ago",
      isCompliant: true,
    },
  ]);

  // Live Telemetry Event Log
  const [telemetryLogs, setTelemetryLogs] = useState([
    {
      id: "log-1",
      kit: "AY-9024 (Rajesh K.)",
      event: "Continuous 3-point compliance verified",
      time: "15:48:12",
      status: "compliant",
    },
    {
      id: "log-2",
      kit: "AY-9018 (Amit V.)",
      event: "Zone 1 perimeter heartbeat acknowledged",
      time: "15:48:10",
      status: "compliant",
    },
    {
      id: "log-3",
      kit: "AY-8992 (Dinesh Y.)",
      event: "Helmet optical sensor detected removal",
      time: "15:48:06",
      status: "warning",
    },
    {
      id: "log-4",
      kit: "AY-9104 (Mohan L.)",
      event: "Vest Hub 4G cellular uplink calibrated",
      time: "15:48:02",
      status: "compliant",
    },
  ]);

  // Simulated Live Pulse Tick
  useEffect(() => {
    const interval = setInterval(() => {
      setLastHeartbeat("Just now");
      const kits = ["AY-9024", "AY-9018", "AY-8992", "AY-9104", "AY-9142"];
      const randomKit = kits[Math.floor(Math.random() * kits.length)];
      const now = new Date();
      const timeString = now.toTimeString().split(" ")[0];

      setTelemetryLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          kit: `${randomKit} (Smart Hub)`,
          event: "Sensor frame batch synced via IoT Gateway",
          time: timeString,
          status: "compliant",
        },
        ...prev.slice(0, 5),
      ]);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const handlePingWorker = (worker: WorkerTelemetry) => {
    setPingFeedback(`Haptic alert sent to ${worker.name}'s Vest Hub (AY-${worker.empId.split("-")[1]})`);
    setTimeout(() => setPingFeedback(null), 3500);
  };

  const handleTogglePPE = (workerId: string) => {
    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id === workerId) {
          const nextStatus = w.helmetStatus === "WORN" ? "REMOVED" : "WORN";
          return {
            ...w,
            helmetStatus: nextStatus,
            isCompliant: nextStatus === "WORN",
          };
        }
        return w;
      })
    );
  };

  // Filtered workers
  const filteredWorkers = workers.filter((w) => {
    const matchesSearch =
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.empId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.trade.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesZone =
      filterZone === "ALL" || w.zone.toLowerCase().includes(filterZone.toLowerCase());

    const matchesCompliance =
      filterCompliance === "ALL" ||
      (filterCompliance === "COMPLIANT" && w.isCompliant) ||
      (filterCompliance === "NON_COMPLIANT" && !w.isCompliant);

    return matchesSearch && matchesZone && matchesCompliance;
  });

  const compliantCount = workers.filter((w) => w.isCompliant).length;
  const compliancePercentage = ((compliantCount / workers.length) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      
      {/* Toast feedback */}
      {pingFeedback && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-[#F6C72F]/50 bg-[#111520] p-3 text-xs text-[#F6C72F] shadow-2xl flex items-center gap-2 animate-fadeIn badge-glow-amber">
          <Volume2 className="w-4 h-4 flex-shrink-0 animate-bounce" />
          <span>{pingFeedback}</span>
        </div>
      )}

      {/* ================= HERO SITE STATUS BANNER ================= */}
      <div className="rounded-2xl border border-zinc-800/90 bg-gradient-to-r from-[#0d121c] via-[#0f1422] to-[#0d121c] p-4 sm:p-5 backdrop-blur-xl relative overflow-hidden neon-glow-card">
        <div className="absolute top-0 left-0 right-0 shimmer-line opacity-80" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-[11px] font-mono text-zinc-400">
              <span className="flex items-center gap-1 text-[#F6C72F] font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                PILOT DEPLOYMENT COHORT
              </span>
              <span>•</span>
              <span className="text-zinc-300">Shift 1 (08:00 - 18:00 IST)</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Mesh Sync: {lastHeartbeat}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Nx-One Commercial Tower{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F6C72F] to-amber-200">
                Telemetry Hub
              </span>
            </h1>
            <p className="text-xs text-zinc-400 max-w-2xl">
              Real-time wireless 3-point smart PPE verification. Active supervision powered by AyantrAI
              Bluetooth mesh and 4G LTE-M industrial telemetry gateways.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <div className="p-2.5 rounded-xl border border-zinc-800 bg-[#090c12]/80 text-center min-w-[100px]">
              <div className="text-[10px] font-mono text-zinc-400">Ambient Temp</div>
              <div className="text-sm font-bold font-mono text-zinc-200">32°C Normal</div>
            </div>
            <div className="p-2.5 rounded-xl border border-zinc-800 bg-[#090c12]/80 text-center min-w-[100px]">
              <div className="text-[10px] font-mono text-zinc-400">Gateways</div>
              <div className="text-sm font-bold font-mono text-emerald-400">4 / 4 Online</div>
            </div>
            <div className="p-2.5 rounded-xl border border-[#F6C72F]/30 bg-[#F6C72F]/10 text-center min-w-[110px]">
              <div className="text-[10px] font-mono text-[#F6C72F]">ISO 45001 EHS</div>
              <div className="text-sm font-bold font-mono text-white">Full Audit Log</div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 4 KPI METRIC CARDS ================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Metric 1: Compliance */}
        <div className="rounded-2xl border border-amber-500/40 bg-[#0e131d]/90 p-4 relative overflow-hidden group hover:border-[#F6C72F] transition-all hover:shadow-[0_0_25px_rgba(246,199,47,0.18)]">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span className="font-medium">PPE Compliance Rate</span>
            <span className="h-6 w-6 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#F6C72F]">
              <ShieldCheck className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#F6C72F] drop-shadow-[0_0_12px_rgba(246,199,47,0.35)]">
            {compliancePercentage}%
          </div>
          <div className="text-[10px] font-mono text-emerald-400 mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>+1.8% vs manual inspections</span>
          </div>
        </div>

        {/* Metric 2: Deployed Kits */}
        <div className="rounded-2xl border border-zinc-800/90 bg-[#0e131d]/90 p-4 relative overflow-hidden group hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span className="font-medium">Active Deployed Kits</span>
            <span className="h-6 w-6 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
              <HardHat className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
            142 <span className="text-base text-zinc-500 font-normal">/ 150</span>
          </div>
          <div className="text-[10px] font-mono text-zinc-400 mt-1">
            8 standby in dock charging bay
          </div>
        </div>

        {/* Metric 3: Hazards */}
        <div className="rounded-2xl border border-emerald-500/30 bg-[#0e131d]/90 p-4 relative overflow-hidden group hover:border-emerald-500/60 transition-all hover:shadow-[0_0_25px_rgba(16,185,129,0.15)]">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span className="font-medium">Active Hazards / Breaches</span>
            <span className="h-6 w-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.35)]">
            {workers.filter((w) => !w.isCompliant).length}
          </div>
          <div className="text-[10px] font-mono text-emerald-400 mt-1">
            Zero unresolved critical alarms
          </div>
        </div>

        {/* Metric 4: Average Battery */}
        <div className="rounded-2xl border border-sky-500/30 bg-[#0e131d]/90 p-4 relative overflow-hidden group hover:border-sky-500/60 transition-all hover:shadow-[0_0_25px_rgba(6,182,212,0.15)]">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span className="font-medium">Fleet Battery Average</span>
            <span className="h-6 w-6 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Zap className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-sky-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.35)]">
            94.2%
          </div>
          <div className="text-[10px] font-mono text-sky-400 mt-1">
            All kits &gt; 14h continuous runtime
          </div>
        </div>
      </div>

      {/* ================= WORKSPACE: WORKER MATRIX + LIVE EVENT LOG ================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Worker Compliance Matrix (8 Cols) */}
        <div className="xl:col-span-8 space-y-3">
          
          {/* Controls Bar: Search & Filter */}
          <div className="rounded-2xl border border-zinc-800/90 bg-[#0f131c]/90 p-3 flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search worker by name, ID, trade..."
                className="w-full rounded-xl border border-zinc-800 bg-[#080b10] pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus-glow-amber"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterZone}
                onChange={(e) => setFilterZone(e.target.value)}
                className="rounded-xl border border-zinc-800 bg-[#080b10] px-2.5 py-1.5 text-xs text-zinc-300 focus-glow-amber"
              >
                <option value="ALL">All Zones</option>
                <option value="Zone 1">Zone 1 (Yard)</option>
                <option value="Zone 2">Zone 2 (Tower Core)</option>
                <option value="Zone 3">Zone 3 (Basement)</option>
              </select>

              <select
                value={filterCompliance}
                onChange={(e) => setFilterCompliance(e.target.value)}
                className="rounded-xl border border-zinc-800 bg-[#080b10] px-2.5 py-1.5 text-xs text-zinc-300 focus-glow-amber"
              >
                <option value="ALL">All Statuses</option>
                <option value="COMPLIANT">100% Compliant</option>
                <option value="NON_COMPLIANT">Violations Only</option>
              </select>
            </div>
          </div>

          {/* Worker Matrix Table */}
          <div className="rounded-2xl border border-zinc-800/90 bg-[#0f131c]/90 overflow-hidden shadow-2xl">
            <div className="p-3.5 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardHat className="w-4 h-4 text-[#F6C72F]" />
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Live 3-Point PPE Compliance Matrix
                </h3>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">
                Showing {filteredWorkers.length} of {workers.length} Personnel
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800/80 bg-[#090c12]/80 text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3.5">Personnel</th>
                    <th className="py-2.5 px-3">Zone Location</th>
                    <th className="py-2.5 px-3 text-center">Helmet Chip</th>
                    <th className="py-2.5 px-3 text-center">Vest Hub</th>
                    <th className="py-2.5 px-3 text-center">Boot Module</th>
                    <th className="py-2.5 px-3 text-center">Battery</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-medium">
                  {filteredWorkers.map((worker) => (
                    <tr
                      key={worker.id}
                      className="hover:bg-zinc-800/30 transition-colors group"
                    >
                      {/* Name & Trade */}
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xs text-zinc-200">
                            {worker.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-white flex items-center gap-1.5">
                              <span>{worker.name}</span>
                              <span className="text-[10px] font-mono text-zinc-500">
                                {worker.empId}
                              </span>
                            </div>
                            <div className="text-[10px] text-zinc-400">{worker.trade}</div>
                          </div>
                        </div>
                      </td>

                      {/* Zone */}
                      <td className="py-3 px-3 text-zinc-300 font-mono text-[11px]">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#F6C72F]" />
                          <span>{worker.zone}</span>
                        </div>
                      </td>

                      {/* Helmet Chipset Status */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleTogglePPE(worker.id)}
                          title="Click to toggle simulated status"
                          className="cursor-pointer"
                        >
                          {worker.helmetStatus === "WORN" ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 font-semibold badge-glow-emerald">
                              WORN
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md bg-red-950/70 border border-red-500/40 text-red-400 font-semibold animate-pulse">
                              OFF-HEAD
                            </span>
                          )}
                        </button>
                      </td>

                      {/* Vest Hub Status */}
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md bg-sky-950/70 border border-sky-500/40 text-sky-300 font-semibold">
                          <Wifi className="w-2.5 h-2.5" />
                          {worker.vestStatus}
                        </span>
                      </td>

                      {/* Boot Module Status */}
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 font-semibold">
                          <Footprints className="w-2.5 h-2.5" />
                          {worker.bootStatus}
                        </span>
                      </td>

                      {/* Battery */}
                      <td className="py-3 px-3 text-center font-mono text-[11px] text-zinc-300">
                        {worker.battery}%
                      </td>

                      {/* Actions: Ping Worker */}
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handlePingWorker(worker)}
                          className="px-2.5 py-1 text-[10px] font-semibold rounded-lg bg-zinc-800/80 border border-zinc-700 text-zinc-200 hover:text-white hover:border-[#F6C72F]/60 hover:bg-[#F6C72F]/10 transition-all flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <Volume2 className="w-3 h-3 text-[#F6C72F]" />
                          Ping Hub
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Real-Time Telemetry Event Log (4 Cols) */}
        <div className="xl:col-span-4 space-y-4">
          
          {/* Hardware Kit Telemetry Distribution */}
          <div className="rounded-2xl border border-zinc-800/90 bg-[#0f131c]/90 p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5 uppercase">
                <Radio className="w-3.5 h-3.5 text-[#F6C72F]" />
                Connected Chipsets
              </span>
              <span className="text-[10px] font-mono text-emerald-400">426 Online</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#090c12] border border-zinc-800">
                <div className="flex items-center gap-2">
                  <HardHat className="w-3.5 h-3.5 text-[#F6C72F]" />
                  <span className="text-zinc-300">Smart Helmet Modules</span>
                </div>
                <span className="font-mono font-bold text-white">142 Active</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-[#090c12] border border-zinc-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                  <span className="text-zinc-300">Smart Vest IoT Hubs</span>
                </div>
                <span className="font-mono font-bold text-white">142 Active</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-[#090c12] border border-zinc-800">
                <div className="flex items-center gap-2">
                  <Footprints className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-zinc-300">Safety Boot Sensors</span>
                </div>
                <span className="font-mono font-bold text-white">142 Active</span>
              </div>
            </div>
          </div>

          {/* Live Telemetry Stream */}
          <div className="rounded-2xl border border-zinc-800/90 bg-[#0f131c]/90 p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#F6C72F] beacon-active" />
                <span className="text-xs font-mono font-bold text-white uppercase">
                  Real-Time Audit Stream
                </span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">Continuous</span>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {telemetryLogs.map((log) => (
                <div
                  key={log.id}
                  className={`p-2.5 rounded-xl border text-xs space-y-1 transition-all ${
                    log.status === "warning"
                      ? "border-amber-500/40 bg-amber-950/30 text-amber-200"
                      : "border-zinc-800/90 bg-[#090c12]/90 text-zinc-300"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                    <span className="font-bold text-[#F6C72F]">{log.kit}</span>
                    <span>{log.time}</span>
                  </div>
                  <div className="text-[11px] leading-snug">{log.event}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

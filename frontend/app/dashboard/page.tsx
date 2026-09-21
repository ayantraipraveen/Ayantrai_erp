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
import { Tooltip, CustomDropdown, DropdownOption } from "../Component";

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

  const zoneOptions: DropdownOption[] = [
    { value: "ALL", label: "All Zones" },
    { value: "Zone 1", label: "Zone 1 (Yard)", description: "Ground Yard B" },
    { value: "Zone 2", label: "Zone 2 (Tower Core)", description: "Tower Core L12" },
    { value: "Zone 3", label: "Zone 3 (Basement)", description: "Basement Substation" },
  ];

  const complianceOptions: DropdownOption[] = [
    { value: "ALL", label: "All Statuses" },
    {
      value: "COMPLIANT",
      label: "100% Compliant",
      badge: "SAFE",
      badgeColor: "bg-emerald-950 text-emerald-400 border-emerald-500/40",
    },
    {
      value: "NON_COMPLIANT",
      label: "Violations Only",
      badge: "ALERT",
      badgeColor: "bg-red-950 text-red-400 border-red-500/40",
    },
  ];

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
              Nx-One Tower • Real-Time Safety Operations
            </h1>
            <p className="text-xs text-zinc-400 max-w-2xl">
              Streaming active personnel presence, biometric safety thresholds, and 3-point PPE telemetry directly from field hardware chipsets.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setLastHeartbeat("Just now");
                setPingFeedback("Synchronized latest mesh packet from base gateway.");
                setTimeout(() => setPingFeedback(null), 3000);
              }}
              className="px-3.5 py-2 rounded-xl border border-zinc-800 bg-[#080b10] text-xs font-semibold text-zinc-300 hover:text-white hover:border-[#F6C72F]/50 flex items-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#F6C72F]" />
              Refresh Mesh
            </button>
            <div className="px-3 py-1.5 rounded-xl border border-[#F6C72F]/30 bg-[#F6C72F]/10 text-xs font-mono text-[#F6C72F]">
              Gateways: <span className="font-bold">4 Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= COMPLIANCE & TELEMETRY KPI METRICS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 01: Compliance Percentage */}
        <div className="rounded-2xl border border-zinc-800/90 bg-[#0f131c]/90 p-4 relative overflow-hidden group hover:border-[#F6C72F]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Site Compliance</span>
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400">
              {compliancePercentage}%
            </span>
            <span className="text-[10px] font-mono text-emerald-300">+2.1% today</span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-400">3-point verified PPE adherence</p>
        </div>

        {/* Metric 02: Active Workers */}
        <div className="rounded-2xl border border-zinc-800/90 bg-[#0f131c]/90 p-4 relative overflow-hidden group hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Active Crews</span>
            <div className="h-7 w-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#F6C72F]">
              <HardHat className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-white">
              {workers.length}
            </span>
            <span className="text-[10px] font-mono text-zinc-400">of 150 registered</span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-400">Real-time BLE mesh beacon sync</p>
        </div>

        {/* Metric 03: Open Safety Violations */}
        <div className="rounded-2xl border border-zinc-800/90 bg-[#0f131c]/90 p-4 relative overflow-hidden group hover:border-red-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Open Violations</span>
            <div className="h-7 w-7 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-red-400">
              {workers.length - compliantCount}
            </span>
            <span className="text-[10px] font-mono text-amber-400">Auto-auditing</span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-400">Instant haptic triage enabled</p>
        </div>

        {/* Metric 04: Hardware Battery Health */}
        <div className="rounded-2xl border border-zinc-800/90 bg-[#0f131c]/90 p-4 relative overflow-hidden group hover:border-sky-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Fleet Battery</span>
            <div className="h-7 w-7 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-sky-400">91.6%</span>
            <span className="text-[10px] font-mono text-sky-300">Avg fleet level</span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-400">Estimated 38h remaining</p>
        </div>
      </div>

      {/* ================= WORKERS MATRIX & LIVE TELEMETRY LOGS ================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Worker Compliance Matrix (8 Cols) */}
        <div className="xl:col-span-8 space-y-3">
          
          {/* Controls Bar: Search & Reusable CustomDropdown Filters */}
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
              <div className="w-36 sm:w-44">
                <CustomDropdown
                  options={zoneOptions}
                  value={filterZone}
                  onChange={setFilterZone}
                  size="sm"
                />
              </div>

              <div className="w-40 sm:w-48">
                <CustomDropdown
                  options={complianceOptions}
                  value={filterCompliance}
                  onChange={setFilterCompliance}
                  size="sm"
                />
              </div>
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
                        <Tooltip
                          content={`Click to simulate helmet ${worker.helmetStatus === "WORN" ? "removal violation" : "re-attachment"}`}
                          position="top"
                          variant={worker.helmetStatus === "WORN" ? "emerald" : "danger"}
                        >
                          <button
                            onClick={() => handleTogglePPE(worker.id)}
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
                        </Tooltip>
                      </td>

                      {/* Vest Hub Status */}
                      <td className="py-3 px-3 text-center">
                        <Tooltip content="Mesh Relay Uplink to Tower Gateway" position="top">
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md bg-sky-950/70 border border-sky-500/40 text-sky-300 font-semibold cursor-help">
                            <Wifi className="w-2.5 h-2.5" />
                            {worker.vestStatus}
                          </span>
                        </Tooltip>
                      </td>

                      {/* Boot Module Status */}
                      <td className="py-3 px-3 text-center">
                        <Tooltip content="Sub-meter geofenced boot sensor" position="top" variant="emerald">
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 font-semibold cursor-help">
                            <Footprints className="w-2.5 h-2.5" />
                            {worker.bootStatus}
                          </span>
                        </Tooltip>
                      </td>

                      {/* Battery */}
                      <td className="py-3 px-3 text-center font-mono text-[11px] text-zinc-300">
                        <Tooltip content={`Li-ion battery status: ${worker.battery}%`} position="top">
                          <span className="cursor-help">{worker.battery}%</span>
                        </Tooltip>
                      </td>

                      {/* Actions: Ping Worker */}
                      <td className="py-3 px-3 text-right">
                        <Tooltip content={`Trigger haptic buzz on ${worker.name}'s vest`} position="left" variant="amber">
                          <button
                            onClick={() => handlePingWorker(worker)}
                            className="px-2.5 py-1 text-[10px] font-semibold rounded-lg bg-zinc-800/80 border border-zinc-700 text-zinc-200 hover:text-white hover:border-[#F6C72F]/60 hover:bg-[#F6C72F]/10 transition-all flex items-center gap-1 ml-auto cursor-pointer"
                          >
                            <Volume2 className="w-3 h-3 text-[#F6C72F]" />
                            Ping Hub
                          </button>
                        </Tooltip>
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

"use client";

import React, { useState } from "react";
import {
  Stamp,
  ExternalLink,
  Minus,
  Check,
  Maximize2,
  Grid,
  LayoutGrid,
  RotateCw,
  Layers,
  ChevronsDown,
  ChevronsUp,
} from "lucide-react";
import { UploadedSvgWatermark, WatermarkStampConfig } from "../../../watermark/utils";

export interface WatermarkPopoverProps {
  uploadedWatermarks: UploadedSvgWatermark[];
  activeWatermarkId?: string | null;
  onSelectWatermark: (id: string | null) => void;
  config?: WatermarkStampConfig;
  onUpdateConfig?: (cfg: Partial<WatermarkStampConfig>) => void;
  onClose: () => void;
}

export function WatermarkPopover({
  uploadedWatermarks,
  activeWatermarkId,
  onSelectWatermark,
  config,
  onUpdateConfig,
  onClose,
}: WatermarkPopoverProps) {
  const current = uploadedWatermarks.find((w) => w.id === activeWatermarkId);
  const [activeTab, setActiveTab] = useState<"select" | "transform">(
    activeWatermarkId ? "transform" : "select"
  );

  const scale = config?.scale ?? 100;
  const opacity = config?.opacity ?? 18;
  const rotation = config?.rotation ?? -18;
  const placement = config?.placement ?? "center";
  const xOffset = config?.xOffset ?? 0;
  const yOffset = config?.yOffset ?? 0;
  const layer = config?.layer ?? "back";

  return (
    <div className="w-[360px] sm:w-[420px] max-w-[calc(100vw-24px)] rounded-2xl bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-zinc-800 p-4 space-y-3.5 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-[#8B3DFF] flex items-center justify-center font-bold">
            <Stamp className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Document Watermark</h4>
            <p className="text-[10px] text-slate-400">Selection, dynamic scale & location placement</p>
          </div>
        </div>
        <a
          href="/templates/Sections&Graphs/watermark"
          target="_blank"
          rel="noreferrer"
          className="text-[10px] text-[#8B3DFF] hover:underline flex items-center gap-1 font-semibold"
          title="Go to Watermark Studio to upload more SVGs"
        >
          <span>Upload SVG</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Popover Nav Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => setActiveTab("select")}
          className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === "select"
              ? "bg-white dark:bg-zinc-800 text-purple-600 dark:text-purple-400"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200"
          }`}
        >
          Select Stamp ({uploadedWatermarks.length})
        </button>
        <button
          type="button"
          onClick={() => {
            if (activeWatermarkId) setActiveTab("transform");
          }}
          disabled={!activeWatermarkId}
          className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            !activeWatermarkId
              ? "opacity-40 cursor-not-allowed text-slate-400"
              : activeTab === "transform"
              ? "bg-white dark:bg-zinc-800 text-purple-600 dark:text-purple-400"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200"
          }`}
        >
          Resize & Location {current ? "• " + current.name.split(" ")[0] : ""}
        </button>
      </div>

      {/* ── TAB 1: SELECTION GALLERY ── */}
      {activeTab === "select" && (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {/* Option: None */}
          <button
            type="button"
            onClick={() => {
              onSelectWatermark(null);
            }}
            className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all ${
              !activeWatermarkId
                ? "border-[#8B3DFF] bg-[#8B3DFF]/10 text-[#8B3DFF] font-bold"
                : "border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900/50 text-slate-600 dark:text-zinc-400"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400">
                <Minus className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-bold">No Watermark</span>
                <p className="text-[10px] text-slate-400">Clear all watermarks from this sheet</p>
              </div>
            </div>
            {!activeWatermarkId && <Check className="w-4 h-4 text-[#8B3DFF]" />}
          </button>

          {uploadedWatermarks.map((wm) => {
            const isSelected = activeWatermarkId === wm.id;
            return (
              <button
                key={wm.id}
                type="button"
                onClick={() => {
                  onSelectWatermark(wm.id);
                  setActiveTab("transform");
                }}
                className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                  isSelected
                    ? "border-[#8B3DFF] bg-[#8B3DFF]/10 text-[#8B3DFF] font-bold"
                    : "border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900/50 text-slate-700 dark:text-zinc-300"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-12 h-8 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-0.5 flex items-center justify-center flex-shrink-0 overflow-hidden"
                    dangerouslySetInnerHTML={{ __html: wm.svgContent }}
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate text-slate-900 dark:text-white">{wm.name}</div>
                    <div className="text-[10px] font-mono text-slate-400 truncate">{wm.fileName}</div>
                  </div>
                </div>
                {isSelected ? (
                  <Check className="w-4 h-4 text-[#8B3DFF] flex-shrink-0" />
                ) : (
                  <span className="text-[10px] text-purple-600 font-semibold opacity-0 group-hover:opacity-100">
                    Select
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ── TAB 2: RESIZE & LOCATION CONTROLS ── */}
      {activeTab === "transform" && current && onUpdateConfig && (
        <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
          {/* Active Watermark Preview Strip */}
          <div className="p-2.5 rounded-xl bg-purple-500/5 border border-purple-500/20 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-10 h-7 rounded border border-purple-300/40 bg-white dark:bg-zinc-900 p-0.5 flex items-center justify-center flex-shrink-0 overflow-hidden"
                dangerouslySetInnerHTML={{ __html: current.svgContent }}
              />
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                  {current.name}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Scale: {scale}% • Pos: {placement}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("select")}
              className="text-[10px] font-semibold text-purple-600 hover:underline flex-shrink-0"
            >
              Change
            </button>
          </div>

          {/* ── 1. RESIZE BASED ON NEED ── */}
          <div className="space-y-2 border-t border-slate-100 dark:border-zinc-800/80 pt-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5 text-[#8B3DFF]" />
                Resize Scale
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onUpdateConfig({ scale: Math.max(20, scale - 10) })}
                  className="w-5 h-5 rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-100 flex items-center justify-center text-xs font-bold cursor-pointer"
                  title="Decrease Size"
                >
                  -
                </button>
                <span className="font-mono text-xs font-bold text-[#8B3DFF] px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/50">
                  {scale}%
                </span>
                <button
                  type="button"
                  onClick={() => onUpdateConfig({ scale: Math.min(300, scale + 10) })}
                  className="w-5 h-5 rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-100 flex items-center justify-center text-xs font-bold cursor-pointer"
                  title="Increase Size"
                >
                  +
                </button>
              </div>
            </div>

            {/* Quick Scale Presets */}
            <div className="grid grid-cols-5 gap-1 text-[10px] font-bold">
              {[
                { label: "25%", val: 25 },
                { label: "50%", val: 50 },
                { label: "100%", val: 100 },
                { label: "160%", val: 160 },
                { label: "240%", val: 240 },
              ].map((p) => (
                <button
                  key={p.val}
                  type="button"
                  onClick={() => onUpdateConfig({ scale: p.val })}
                  className={`py-1 rounded-lg border text-center transition-all cursor-pointer ${
                    scale === p.val
                      ? "bg-[#8B3DFF] text-white border-transparent"
                      : "border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Scale Slider */}
            <input
              type="range"
              min={20}
              max={300}
              step={5}
              value={scale}
              onChange={(e) => onUpdateConfig({ scale: parseInt(e.target.value, 10) })}
              className="w-full accent-[#8B3DFF] cursor-pointer"
            />
          </div>

          {/* ── 2. LOCATED ON LOCATION (9-POINT MATRIX + OFFSETS) ── */}
          <div className="space-y-2 border-t border-slate-100 dark:border-zinc-800/80 pt-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Grid className="w-3.5 h-3.5 text-[#8B3DFF]" />
                Location & Placement
              </span>
              <span className="text-[10px] font-mono font-bold uppercase text-[#8B3DFF] bg-purple-50 dark:bg-purple-950/40 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-800/50">
                {placement}
              </span>
            </div>

            {/* 3x3 Placement Grid + Tiled */}
            <div className="grid grid-cols-3 gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800">
              {[
                { id: "top-left", label: "Top-Left" },
                { id: "top-center", label: "Top-Center" },
                { id: "top-right", label: "Top-Right" },
                { id: "center-left", label: "Mid-Left" },
                { id: "center", label: "Center" },
                { id: "center-right", label: "Mid-Right" },
                { id: "bottom-left", label: "Btm-Left" },
                { id: "bottom-center", label: "Btm-Center" },
                { id: "bottom-right", label: "Btm-Right" },
              ].map((pos) => {
                const isSelected = placement === pos.id;
                return (
                  <button
                    key={pos.id}
                    type="button"
                    onClick={() => onUpdateConfig({ placement: pos.id as any })}
                    className={`h-7 rounded-lg text-[10px] font-bold transition-all cursor-pointer border flex items-center justify-center ${
                      isSelected
                        ? "bg-[#8B3DFF] text-white border-transparent"
                        : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:border-purple-300"
                    }`}
                  >
                    {pos.label}
                  </button>
                );
              })}
            </div>

            {/* Tiled Repeat Pattern Toggle */}
            <button
              type="button"
              onClick={() => onUpdateConfig({ placement: placement === "tiled" ? "center" : "tiled" })}
              className={`w-full py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                placement === "tiled"
                  ? "bg-[#8B3DFF] text-white border-transparent"
                  : "border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Tiled Repeat Pattern (2x2 Grid)</span>
            </button>

            {/* Fine-tune Location Offsets (X & Y) */}
            <div className="pt-2 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-zinc-300">
                <span>Fine-tune Position Offsets</span>
                {(xOffset !== 0 || yOffset !== 0) && (
                  <button
                    type="button"
                    onClick={() => onUpdateConfig({ xOffset: 0, yOffset: 0 })}
                    className="text-[10px] text-purple-600 hover:underline flex items-center gap-0.5 cursor-pointer font-bold"
                  >
                    <RotateCw className="w-2.5 h-2.5" />
                    Reset Offsets
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-400 font-mono">
                    <span>X Offset</span>
                    <span className="text-[#8B3DFF] font-bold">{xOffset}%</span>
                  </div>
                  <input
                    type="range"
                    min={-50}
                    max={50}
                    step={1}
                    value={xOffset}
                    onChange={(e) => onUpdateConfig({ xOffset: parseInt(e.target.value, 10) })}
                    className="w-full accent-[#8B3DFF] cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-400 font-mono">
                    <span>Y Offset</span>
                    <span className="text-[#8B3DFF] font-bold">{yOffset}%</span>
                  </div>
                  <input
                    type="range"
                    min={-50}
                    max={50}
                    step={1}
                    value={yOffset}
                    onChange={(e) => onUpdateConfig({ yOffset: parseInt(e.target.value, 10) })}
                    className="w-full accent-[#8B3DFF] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── 3. ROTATION & OPACITY ── */}
          <div className="space-y-2 border-t border-slate-100 dark:border-zinc-800/80 pt-2.5">
            {/* Opacity */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-zinc-300 mb-1">
                <span>Stamp Opacity</span>
                <span className="font-mono text-[#8B3DFF] font-bold">{opacity}%</span>
              </div>
              <input
                type="range"
                min={5}
                max={80}
                step={1}
                value={opacity}
                onChange={(e) => onUpdateConfig({ opacity: parseInt(e.target.value, 10) })}
                className="w-full accent-[#8B3DFF] cursor-pointer"
              />
            </div>

            {/* Rotation Angle */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-zinc-300 mb-1">
                <span>Stamp Rotation</span>
                <span className="font-mono text-[#8B3DFF] font-bold">{rotation}°</span>
              </div>
              <div className="grid grid-cols-4 gap-1 text-[10px] font-bold mb-1">
                {[
                  { label: "Flat (0°)", deg: 0 },
                  { label: "Stamp (-18°)", deg: -18 },
                  { label: "Diag (-45°)", deg: -45 },
                  { label: "Vert (90°)", deg: 90 },
                ].map((rot) => (
                  <button
                    key={rot.deg}
                    type="button"
                    onClick={() => onUpdateConfig({ rotation: rot.deg })}
                    className={`py-1 rounded-md border text-center transition-all cursor-pointer ${
                      rotation === rot.deg
                        ? "bg-[#8B3DFF] text-white border-transparent"
                        : "border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {rot.label}
                  </button>
                ))}
              </div>
              <input
                type="range"
                min={-90}
                max={90}
                step={1}
                value={rotation}
                onChange={(e) => onUpdateConfig({ rotation: parseInt(e.target.value, 10) })}
                className="w-full accent-[#8B3DFF] cursor-pointer"
              />
            </div>
          </div>

          {/* ── 4. LAYER STACKING: BRING FRONT / SEND BACK ── */}
          <div className="space-y-2 border-t border-slate-100 dark:border-zinc-800/80 pt-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#8B3DFF]" />
                Layer Stacking
              </span>
              <span
                className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${
                  layer === "front"
                    ? "bg-purple-50 dark:bg-purple-950/40 text-[#8B3DFF] border-purple-200 dark:border-purple-800/50"
                    : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50"
                }`}
              >
                {layer === "front" ? "Front (z-20)" : "Back (z-5)"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {/* Send to Back */}
              <button
                type="button"
                onClick={() => onUpdateConfig({ layer: "back" })}
                className={`p-2 rounded-xl border text-left flex flex-col justify-between cursor-pointer transition-all ${
                  layer === "back"
                    ? "border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-300 font-bold"
                    : "border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 text-slate-600 dark:text-zinc-400"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <ChevronsDown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Send to Back</span>
                  </div>
                  {layer === "back" && <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
                </div>
                <p className="text-[10px] font-normal text-slate-500 dark:text-zinc-400 leading-tight">
                  Behind report content & tables (subtle background)
                </p>
              </button>

              {/* Bring to Front */}
              <button
                type="button"
                onClick={() => onUpdateConfig({ layer: "front" })}
                className={`p-2 rounded-xl border text-left flex flex-col justify-between cursor-pointer transition-all ${
                  layer === "front"
                    ? "border-[#8B3DFF] bg-[#8B3DFF]/10 text-purple-950 dark:text-purple-300 font-bold"
                    : "border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 text-slate-600 dark:text-zinc-400"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <ChevronsUp className="w-3.5 h-3.5 text-[#8B3DFF]" />
                    <span>Bring to Front</span>
                  </div>
                  {layer === "front" && <Check className="w-3.5 h-3.5 text-[#8B3DFF]" />}
                </div>
                <p className="text-[10px] font-normal text-slate-500 dark:text-zinc-400 leading-tight">
                  Over report rows (bold draft / confidential stamp)
                </p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Done Button */}
      <button
        type="button"
        onClick={onClose}
        className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer transition-colors"
      >
        Done & Apply
      </button>
    </div>
  );
}

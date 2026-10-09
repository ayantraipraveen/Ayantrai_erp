"use client";

import React, { useState } from "react";
import { CanvasSectionStyle } from "@/lib/redux/slices/reportModuleSlice";
import { CanvasMarginConfig } from "../constants";

export interface MarginPopoverProps {
  marginConfig: CanvasMarginConfig;
  onUpdateMarginConfig?: (config: Partial<CanvasMarginConfig>) => void;
  sectionStyle?: CanvasSectionStyle;
  onUpdateSectionStyle?: (style: Partial<CanvasSectionStyle>) => void;
  showGuides: boolean;
  onToggleGuides: () => void;
  onClose: () => void;
}

export function MarginPopover({
  marginConfig,
  onUpdateMarginConfig,
  sectionStyle,
  onUpdateSectionStyle,
  showGuides,
  onToggleGuides,
  onClose,
}: MarginPopoverProps) {
  const [activeTab, setActiveTab] = useState<"margins" | "padding">("margins");

  const presets = [
    { value: 12, label: "Narrow", description: "Compact content area" },
    { value: 24, label: "Normal", description: "Balanced page spacing" },
    { value: 40, label: "Wide", description: "Comfortable print margins" },
  ];

  const isPresetSelected = (value: number) =>
    marginConfig.top === value &&
    marginConfig.right === value &&
    marginConfig.bottom === value &&
    marginConfig.left === value;

  const updateAxis = (axis: keyof Pick<CanvasMarginConfig, "top" | "right" | "bottom" | "left">, value: string) => {
    const nextValue = Math.max(0, Math.min(120, Number(value) || 0));
    onUpdateMarginConfig?.({ [axis]: nextValue });
  };

  const secPadTop = sectionStyle?.paddingTop ?? sectionStyle?.padding ?? 12;
  const secPadBottom = sectionStyle?.paddingBottom ?? sectionStyle?.padding ?? 6;
  const secPadLeft = sectionStyle?.paddingLeft ?? sectionStyle?.padding ?? 0;
  const secPadRight = sectionStyle?.paddingRight ?? sectionStyle?.padding ?? 0;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute top-8 left-0 w-80 max-h-[min(540px,calc(100dvh-15rem))] overflow-y-auto custom-scrollbar rounded-2xl bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-zinc-800 p-3.5 z-[60] space-y-3 animate-fadeIn text-slate-800 dark:text-zinc-200"
    >
      <div className="border-b border-slate-100 dark:border-zinc-800/80 pb-2">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white">Page Margins & Section Padding</h4>
        <p className="text-[10px] text-slate-400">Configure printable boundaries & content rows area</p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-1 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 p-1">
        <button
          type="button"
          onClick={() => setActiveTab("margins")}
          className={`py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === "margins"
              ? "bg-[#8B3DFF] text-white"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          Page Margins
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("padding")}
          className={`py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === "padding"
              ? "bg-[#8B3DFF] text-white"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          Section Padding
        </button>
      </div>

      {activeTab === "margins" ? (
        <div className="space-y-3">
          <div className="space-y-1.5">
            {presets.map((preset) => {
              const selected = isPresetSelected(preset.value);
              return (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => onUpdateMarginConfig?.({ top: preset.value, right: preset.value, bottom: preset.value, left: preset.value })}
                  className={`w-full rounded-lg border px-2.5 py-2 text-left flex items-center justify-between transition-colors cursor-pointer ${
                    selected
                      ? "border-[#8B3DFF] bg-purple-500/10 text-[#8B3DFF]"
                      : "border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300"
                  }`}
                >
                  <span>
                    <span className="block text-xs font-bold">{preset.label}</span>
                    <span className="block text-[10px] opacity-70">{preset.description}</span>
                  </span>
                  <span className="text-[10px] font-mono">{preset.value}px</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-2 border-t border-slate-100 dark:border-zinc-800/80 pt-2">
            {(["top", "right", "bottom", "left"] as const).map((axis) => (
              <label key={axis} className="space-y-1">
                <span className="block text-[10px] font-mono font-bold uppercase text-slate-400">{axis}</span>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={120}
                    value={marginConfig[axis]}
                    onChange={(event) => updateAxis(axis, event.target.value)}
                    className="w-full rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 px-2 py-1.5 pr-7 text-xs font-mono font-bold text-slate-800 dark:text-zinc-200 outline-none focus:border-[#8B3DFF]"
                  />
                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">px</span>
                </div>
              </label>
            ))}
          </div>

          <div className="border-t border-slate-100 dark:border-zinc-800/80 pt-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Sheet Corner radius</span>
              <span className="text-[10px] font-mono font-bold text-[#8B3DFF]">{marginConfig.radius}px</span>
            </div>
            <input
              type="range"
              min={0}
              max={48}
              step={1}
              value={marginConfig.radius}
              onChange={(event) => onUpdateMarginConfig?.({ radius: Number(event.target.value) })}
              className="w-full accent-[#8B3DFF] cursor-pointer"
            />
            <div className="grid grid-cols-5 gap-1 mt-1.5">
              {[0, 8, 16, 24, 32].map((radius) => (
                <button
                  key={radius}
                  type="button"
                  onClick={() => onUpdateMarginConfig?.({ radius })}
                  className={`rounded-md border py-1 text-[10px] font-mono font-bold cursor-pointer ${
                    marginConfig.radius === radius
                      ? "border-[#8B3DFF] bg-purple-500/10 text-[#8B3DFF]"
                      : "border-slate-200 dark:border-zinc-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  {radius}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center justify-between border-t border-slate-100 dark:border-zinc-800/80 pt-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 cursor-pointer">
            Show margin guides
            <input
              type="checkbox"
              checked={showGuides}
              onChange={onToggleGuides}
              className="accent-[#8B3DFF] cursor-pointer"
            />
          </label>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Section Padding Presets */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              Content Area Padding Presets
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { label: "None", top: 0, bottom: 0, left: 0, right: 0 },
                { label: "Compact", top: 6, bottom: 4, left: 0, right: 0 },
                { label: "Default", top: 12, bottom: 6, left: 0, right: 0 },
                { label: "Spacious", top: 20, bottom: 12, left: 8, right: 8 },
              ].map((p) => {
                const isSelected = secPadTop === p.top && secPadBottom === p.bottom && secPadLeft === p.left && secPadRight === p.right;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() =>
                      onUpdateSectionStyle?.({
                        paddingTop: p.top,
                        paddingBottom: p.bottom,
                        paddingLeft: p.left,
                        paddingRight: p.right,
                      })
                    }
                    className={`p-2 rounded-lg border text-left text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#8B3DFF] bg-purple-500/10 text-[#8B3DFF]"
                        : "border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300"
                    }`}
                  >
                    <span className="block">{p.label}</span>
                    <span className="block text-[10px] text-slate-400 font-normal">
                      T:{p.top} B:{p.bottom} L/R:{p.left}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Individual Axis Steppers */}
          <div className="grid grid-cols-2 gap-2 border-t border-slate-100 dark:border-zinc-800/80 pt-2">
            {[
              { label: "Top Padding", key: "paddingTop" as const, val: secPadTop },
              { label: "Bottom Padding", key: "paddingBottom" as const, val: secPadBottom },
              { label: "Left Padding", key: "paddingLeft" as const, val: secPadLeft },
              { label: "Right Padding", key: "paddingRight" as const, val: secPadRight },
            ].map((ax) => (
              <label key={ax.key} className="space-y-1">
                <span className="block text-[10px] font-mono font-bold uppercase text-slate-400">{ax.label}</span>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={64}
                    value={ax.val}
                    onChange={(e) => onUpdateSectionStyle?.({ [ax.key]: Math.max(0, Math.min(64, Number(e.target.value) || 0)) })}
                    className="w-full rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 px-2 py-1.5 pr-7 text-xs font-mono font-bold text-slate-800 dark:text-zinc-200 outline-none focus:border-[#8B3DFF]"
                  />
                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">px</span>
                </div>
              </label>
            ))}
          </div>

          {/* Section Frame & Appearance */}
          <div className="space-y-1.5 border-t border-slate-100 dark:border-zinc-800/80 pt-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              Section Background Tone
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { label: "None", val: undefined },
                { label: "Subtle Slate", val: "#f8fafc" },
                { label: "Glass Frost", val: "rgba(255,255,255,0.75)" },
                { label: "Purple Mist", val: "#faf5ff" },
                { label: "Midnight Dark", val: "#0f172a" },
              ].map((bg) => (
                <button
                  key={bg.label}
                  type="button"
                  onClick={() => onUpdateSectionStyle?.({ backgroundColor: bg.val })}
                  className={`h-9 rounded-lg border text-[10px] font-bold p-1 transition-all cursor-pointer ${
                    sectionStyle?.backgroundColor === bg.val
                      ? "border-[#8B3DFF] ring-2 ring-purple-500/30"
                      : "border-slate-200 dark:border-zinc-800 hover:border-slate-300"
                  }`}
                  style={{ backgroundColor: bg.val || "transparent" }}
                >
                  <span className={bg.val === "#0f172a" ? "text-white" : "text-slate-700 dark:text-zinc-200"}>
                    {bg.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onClose}
        className="w-full py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer transition-colors"
      >
        Apply & Close
      </button>
    </div>
  );
}

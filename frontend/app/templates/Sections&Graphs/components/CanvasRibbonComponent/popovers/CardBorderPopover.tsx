"use client";

import React, { useState, useRef,useEffect  } from "react";
import { Square, Pipette, Check } from "lucide-react";
import { CARD_BORDER_PRESETS } from "../constants";

export interface CardBorderPopoverProps {
  currentBorderColor?: string;
  currentBorderStyle?: "solid" | "dashed" | "dotted" | "none";
  currentBorderWidth?: number;
  currentBorderRadius?: number | "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full" | string;
  currentShadow?: "none" | "sm" | "md" | "lg" | "xl" | "glow" | string;
  onSelectBorder: (patch: {
    borderColor?: string;
    borderStyle?: "solid" | "dashed" | "dotted" | "none";
    borderWidth?: number;
    borderRadius?: number | "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full" | string;
    shadow?: "none" | "sm" | "md" | "lg" | "xl" | "glow" | string;
  }) => void;
  onReset: () => void;
  onClose: () => void;
}

export function CardBorderPopover({
  currentBorderColor,
  currentBorderStyle,
  currentBorderWidth,
  currentBorderRadius,
  currentShadow,
  onSelectBorder,
  onReset,
  onClose,
}: CardBorderPopoverProps) {
  const [activeHex, setActiveHex] = useState(
    currentBorderColor && currentBorderColor !== "transparent" ? currentBorderColor : "#e2e8f0"
  );
  const colorPickerRef = useRef<HTMLInputElement>(null);
 useEffect(() => {
   if (currentBorderColor && currentBorderColor !== "transparent") {
    setActiveHex(currentBorderColor);
    }
  }, [currentBorderColor]);
  // Compute numeric radius for smooth slider / steppers
  const numericRadius =
    typeof currentBorderRadius === "number"
      ? currentBorderRadius
      : currentBorderRadius === "none"
      ? 0
      : currentBorderRadius === "sm"
      ? 6
      : currentBorderRadius === "md"
      ? 10
      : currentBorderRadius === "lg"
      ? 16
      : currentBorderRadius === "xl"
      ? 20
      : currentBorderRadius === "2xl"
      ? 24
      : currentBorderRadius === "full"
      ? 99
      : typeof currentBorderRadius === "string" && !isNaN(parseInt(currentBorderRadius))
      ? parseInt(currentBorderRadius)
      : 16;

  const [activeRadius, setActiveRadius] = useState<number>(numericRadius);
  const [activeWidth, setActiveWidth] = useState<number>(currentBorderWidth ?? 1);

  useEffect(() => {
    setActiveRadius(numericRadius);
  }, [numericRadius]);

  useEffect(() => {
    setActiveWidth(currentBorderWidth ?? 1);
  }, [currentBorderWidth]);

  const handleNativeColorInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setActiveHex(val);
    onSelectBorder({
      borderColor: val,
      borderWidth: activeWidth > 0 ? activeWidth : 1,
      borderStyle: currentBorderStyle === "none" ? "solid" : currentBorderStyle ?? "solid",
    });
  };

  const handleRadiusChange = (val: number) => {
    const clamped = Math.max(0, Math.min(99, val));
    setActiveRadius(clamped);
    onSelectBorder({ borderRadius: clamped });
  };

  const handleWidthChange = (val: number) => {
    const clamped = Math.max(0, Math.min(12, val));
    setActiveWidth(clamped);
    onSelectBorder({
      borderWidth: clamped,
      borderStyle: clamped === 0 ? "none" : currentBorderStyle === "none" ? "solid" : currentBorderStyle ?? "solid",
    });
  };

  return (
    <div className="w-80 max-h-[min(540px,calc(100vh-140px))] overflow-y-auto custom-scrollbar rounded-2xl bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-zinc-800 p-4 space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-purple-500/10 text-[#8B3DFF] flex items-center justify-center font-bold">
            <Square className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Card Appearance</h4>
            <p className="text-[10px] text-slate-400">Border line style, width & corner radius</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-[10px] font-semibold text-slate-400 hover:text-red-500 transition-colors cursor-pointer px-2 py-0.5 rounded hover:bg-red-50 dark:hover:bg-red-950/30"
        >
          Reset All
        </button>
      </div>

      {/* ── 1. Border Style & Width ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
          <span>Border Line Style</span>
          <span>Width: {activeWidth}px</span>
        </div>

        {/* Style pills */}
        <div className="grid grid-cols-4 gap-1 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 p-1">
          {(["solid", "dashed", "dotted", "none"] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() =>
                onSelectBorder({
                  borderStyle: st,
                  borderColor:
                    st === "none"
                      ? "transparent"
                      : currentBorderColor && currentBorderColor !== "transparent"
                      ? currentBorderColor
                      : "#e2e8f0",
                  borderWidth: st === "none" ? 0 : activeWidth > 0 ? activeWidth : 1,
                })
              }
              className={`py-1 rounded-lg text-[10px] font-bold capitalize transition-all cursor-pointer flex items-center justify-center ${
                (currentBorderStyle || (activeWidth === 0 ? "none" : "solid")) === st
                  ? "bg-[#8B3DFF] text-white"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Width Stepper & Quick Pills */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleWidthChange(activeWidth - 1)}
              className="w-6 h-6 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-600 dark:text-zinc-300 cursor-pointer"
              title="Decrease width"
            >
              -
            </button>
            <input
              type="number"
              min={0}
              max={12}
              value={activeWidth}
              onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
              className="w-10 h-6 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-center font-mono font-bold text-xs text-slate-800 dark:text-zinc-200 outline-none"
            />
            <button
              type="button"
              onClick={() => handleWidthChange(activeWidth + 1)}
              className="w-6 h-6 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-600 dark:text-zinc-300 cursor-pointer"
              title="Increase width"
            >
              +
            </button>
          </div>

          <div className="flex items-center gap-1">
            {[0, 1, 2, 3, 4, 6].map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => handleWidthChange(w)}
                className={`w-6 h-6 rounded-lg text-[10px] font-bold font-mono transition-all cursor-pointer flex items-center justify-center ${
                  activeWidth === w
                    ? "bg-[#8B3DFF] text-white"
                    : "border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 2. Border Radius (Corner Rounding) ── */}
      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800/80">
        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
          <span>Border Radius (Corners)</span>
          <span className="text-[#8B3DFF] font-bold">{activeRadius >= 99 ? "Pill" : `${activeRadius}px`}</span>
        </div>

        {/* Stepper + Slider */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleRadiusChange(activeRadius - 2)}
            className="w-6 h-6 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-600 dark:text-zinc-300 cursor-pointer shrink-0"
            title="Decrease radius"
          >
            -
          </button>
          <input
            type="range"
            min={0}
            max={40}
            step={2}
            value={Math.min(40, activeRadius)}
            onChange={(e) => handleRadiusChange(parseInt(e.target.value))}
            className="flex-1 accent-[#8B3DFF] cursor-pointer"
          />
          <button
            type="button"
            onClick={() => handleRadiusChange(activeRadius + 2)}
            className="w-6 h-6 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-600 dark:text-zinc-300 cursor-pointer shrink-0"
            title="Increase radius"
          >
            +
          </button>
        </div>

        {/* Quick Radius Preset Chips */}
        <div className="grid grid-cols-6 gap-1">
          {[
            { label: "0", val: 0, title: "Sharp (0px)" },
            { label: "6", val: 6, title: "Small (6px)" },
            { label: "12", val: 12, title: "Medium (12px)" },
            { label: "16", val: 16, title: "Default (16px)" },
            { label: "24", val: 24, title: "Round (24px)" },
            { label: "Pill", val: 99, title: "Pill / Full" },
          ].map((r) => (
            <button
              key={r.label}
              type="button"
              onClick={() => handleRadiusChange(r.val)}
              className={`py-1 rounded-lg text-[10px] font-bold font-mono transition-all cursor-pointer flex items-center justify-center border ${
                activeRadius === r.val
                  ? "bg-[#8B3DFF] border-[#8B3DFF] text-white"
                  : "border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400"
              }`}
              title={r.title}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 4. Border Colors ── */}
      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800/80">
        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
          Border Color
        </div>

        {/* Color Swatches Grid */}
        <div className="grid grid-cols-5 gap-1.5">
          {CARD_BORDER_PRESETS.map((p) => {
            const isSelected =
              currentBorderColor === p.color ||
              (p.id === "none" && (currentBorderStyle === "none" || currentBorderColor === "transparent"));
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  if (p.id === "none") {
                    onSelectBorder({
                      borderColor: "transparent",
                      borderStyle: "none",
                      borderWidth: 0,
                    });
                  } else {
                    onSelectBorder({
                      borderColor: p.color,
                      borderStyle: currentBorderStyle === "none" ? "solid" : currentBorderStyle ?? "solid",
                      borderWidth: activeWidth > 0 ? activeWidth : 1,
                    });
                  }
                }}
                className={`h-7 rounded-lg border flex items-center justify-center transition-all cursor-pointer relative ${
                  isSelected ? "ring-2 ring-[#8B3DFF] scale-105" : "hover:scale-105 border-slate-300 dark:border-zinc-700"
                }`}
                style={{ backgroundColor: p.color === "transparent" ? "#ffffff" : p.color }}
                title={p.label}
              >
                {p.id === "none" ? (
                  <span className="text-[9px] font-bold text-slate-400">None</span>
                ) : isSelected ? (
                  <Check
                    className={`w-3 h-3 ${
                      p.id === "dark" || p.id === "purple" || p.id === "blue" ? "text-white" : "text-slate-900"
                    }`}
                  />
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Custom Color Input & Eyedropper */}
        <div className="flex items-center gap-2 pt-1">
          <div className="relative">
            <button
              type="button"
              onClick={() => colorPickerRef.current?.click()}
              className="w-8 h-8 rounded-xl border border-slate-200 dark:border-zinc-700 flex items-center justify-center hover:scale-105 transition-all cursor-pointer relative overflow-hidden group"
              style={{ backgroundColor: activeHex }}
              title="Open border color eyedropper"
            >
              <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                <Pipette className="w-3.5 h-3.5 text-white opacity-80 group-hover:scale-110 transition-transform" />
              </div>
            </button>
            <input
              ref={colorPickerRef}
              type="color"
              value={activeHex.startsWith("#") && activeHex.length === 7 ? activeHex : "#e2e8f0"}
              onChange={handleNativeColorInput}
              className="absolute inset-0 h-8 w-8 cursor-pointer opacity-0"
              aria-label="Choose custom border color"
            />
          </div>
          <input
            type="text"
            value={activeHex}
            onChange={(e) => {
              const val = e.target.value;
              setActiveHex(val);
              if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                onSelectBorder({
                  borderColor: val,
                  borderStyle: currentBorderStyle === "none" ? "solid" : currentBorderStyle ?? "solid",
                  borderWidth: activeWidth > 0 ? activeWidth : 1,
                });
              }
            }}
            placeholder="#E2E8F0"
            className="h-8 flex-1 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 px-2.5 font-mono text-xs text-slate-800 dark:text-zinc-200 uppercase outline-none focus:border-[#8B3DFF]"
          />
        </div>
      </div>

      {/* Done Button */}
      <button
        type="button"
        onClick={onClose}
        className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer transition-colors"
      >
        Apply & Close
      </button>
    </div>
  );
}

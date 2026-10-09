"use client";

import React, { useState, useRef, useEffect } from "react";
import { Palette, Plus, Pipette, RotateCw } from "lucide-react";
import { CARD_BG_PRESETS } from "../constants";

export interface CardBgPopoverProps {
  currentBg?: string;
  onSelectBg: (bg: string) => void;
  onReset: () => void;
  onClose: () => void;
}

export function CardBgPopover({
  currentBg = "white",
  onSelectBg,
  onReset,
  onClose,
}: CardBgPopoverProps) {
  const activeBgHex = currentBg?.startsWith("#")
    ? currentBg
    : CARD_BG_PRESETS.find((p) => p.id === currentBg)?.color || "#ffffff";
  const [hexInput, setHexInput] = useState(
    activeBgHex.startsWith("#") ? activeBgHex.toUpperCase() : "#FFFFFF"
  );
  const colorPickerRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (currentBg?.startsWith("#")) {
      setHexInput(currentBg.toUpperCase());
    } else {
      const p = CARD_BG_PRESETS.find((x) => x.id === currentBg);
      if (p?.color.startsWith("#")) setHexInput(p.color.toUpperCase());
    }
  }, [currentBg]);

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.trim();
    if (!val.startsWith("#")) {
      val = "#" + val;
    }
    setHexInput(val.toUpperCase());
    if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(val)) {
      onSelectBg(val.toLowerCase());
    }
  };

  const handleNativeColorInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHexInput(val.toUpperCase());
    onSelectBg(val);
  };

  const isCustomBg = Boolean(currentBg?.startsWith("#") || currentBg?.startsWith("rgb"));

  return (
    <div className="w-64 sm:w-72 rounded-2xl bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-zinc-800 p-3.5 space-y-3.5 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/80 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-purple-500/10 text-[#8B3DFF] flex items-center justify-center font-bold">
            <Palette className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Card Background</h4>
            <p className="text-[10px] text-slate-400">Surface tone & custom hex</p>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200">
          {activeBgHex.toUpperCase()}
        </span>
      </div>

      {/* Surface Presets */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
          Surface Presets
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {/* Custom Color Button in grid */}
          <button
            type="button"
            onClick={() => colorPickerRef.current?.click()}
            className={`h-11 rounded-lg border p-1 text-[10px] font-bold flex flex-col items-center justify-center transition-all cursor-pointer relative overflow-hidden group ${
              isCustomBg ? "ring-2 ring-[#8B3DFF] border-[#8B3DFF]" : "border-slate-300 dark:border-zinc-700 hover:scale-105"
            }`}
            style={{
              background: "conic-gradient(from 180deg at 50% 50%, #FF0000 0deg, #FFA500 45deg, #FFFF00 90deg, #008000 135deg, #00FFFF 180deg, #0000FF 225deg, #800080 270deg, #FF00FF 315deg, #FF0000 360deg)",
            }}
            title="Custom Hex / Color Picker"
          >
            <div className="w-full h-full rounded bg-white/90 dark:bg-black/90 flex flex-col items-center justify-center gap-0.5">
              <Plus className="w-3.5 h-3.5 text-[#8B3DFF] font-bold" />
              <span className="text-[9px] font-bold text-[#8B3DFF]">Custom</span>
            </div>
          </button>

          {CARD_BG_PRESETS.map((p) => {
            const isSelected = currentBg === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelectBg(p.id)}
                className={`h-11 rounded-lg border p-1 text-[10px] font-bold flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isSelected
                    ? "ring-2 ring-[#8B3DFF]"
                    : "hover:scale-105"
                }`}
                style={{ backgroundColor: p.color, borderColor: p.border }}
                title={p.label}
              >
                <span className={p.id === "dark" ? "text-white" : "text-slate-800"}>{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Color Input & Color Picker */}
      <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-zinc-800/80">
        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
          Custom Background Color
        </div>
        <div className="flex items-center gap-2">
          {/* Native HTML5 Color Picker Trigger Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => colorPickerRef.current?.click()}
              className="w-8 h-8 rounded-xl border border-slate-200 dark:border-zinc-700 flex items-center justify-center hover:scale-105 transition-all cursor-pointer relative overflow-hidden group"
              style={{ backgroundColor: activeBgHex }}
              title="Open card background color picker"
            >
              <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                <Pipette className="w-3.5 h-3.5 text-white opacity-80 group-hover:scale-110 transition-transform" />
              </div>
            </button>
            <input
              ref={colorPickerRef}
              type="color"
              value={activeBgHex.startsWith("#") ? activeBgHex : "#ffffff"}
              onChange={handleNativeColorInput}
              className="absolute inset-0 h-8 w-8 cursor-pointer opacity-0"
              aria-label="Choose custom card background color"
            />
          </div>

          {/* Hex Input Field */}
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">
              #
            </span>
            <input
              type="text"
              value={hexInput.replace(/^#/, "")}
              onChange={handleHexChange}
              maxLength={6}
              placeholder="FFFFFF"
              className="w-full pl-6 pr-2 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-mono font-bold text-slate-900 dark:text-white uppercase focus:outline-none focus:ring-2 focus:ring-[#8B3DFF] focus:border-transparent transition-all"
            />
          </div>

          {/* Reset to Default Button */}
          <button
            type="button"
            onClick={() => {
              onReset();
              setHexInput("#FFFFFF");
            }}
            className="h-8 px-2 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            title="Reset to Default Background"
          >
            <RotateCw className="w-3 h-3" />
            <span className="text-[10px]">Reset</span>
          </button>
        </div>
      </div>

      {/* Done Button */}
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

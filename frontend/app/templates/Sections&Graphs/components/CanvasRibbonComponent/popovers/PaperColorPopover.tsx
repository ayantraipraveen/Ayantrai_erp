"use client";

import React, { useState, useRef, useEffect } from "react";
import { Palette, Check, Pipette, RotateCw } from "lucide-react";
import { PAPER_TONE_PRESETS, getPaperToneColor } from "../constants";

export interface PaperColorPopoverProps {
  paperTone: string;
  onSetPaperTone: (tone: string) => void;
  onClose: () => void;
}

export function PaperColorPopover({
  paperTone,
  onSetPaperTone,
  onClose,
}: PaperColorPopoverProps) {
  const activeColor = getPaperToneColor(paperTone);
  const [hexInput, setHexInput] = useState(
    activeColor.startsWith("#") ? activeColor.toUpperCase() : "#FFFFFF"
  );
  const colorPickerRef = useRef<HTMLInputElement | null>(null);

  // Keep hexInput in sync if preset is clicked
  useEffect(() => {
    const col = getPaperToneColor(paperTone);
    if (col.startsWith("#")) {
      setHexInput(col.toUpperCase());
    }
  }, [paperTone]);

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.trim();
    if (!val.startsWith("#")) {
      val = "#" + val;
    }
    setHexInput(val.toUpperCase());
    if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(val)) {
      onSetPaperTone(val.toLowerCase());
    }
  };

  const handleNativeColorInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHexInput(val.toUpperCase());
    onSetPaperTone(val);
  };

  return (
    <div className="w-72 sm:w-80 rounded-2xl bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-zinc-800 p-4 space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-[#8B3DFF] flex items-center justify-center font-bold">
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Paper Sheet Color</h4>
            <p className="text-[10px] text-slate-400">Curated document tones & custom hex</p>
          </div>
        </div>
        <span
          className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200"
        >
          {activeColor.toUpperCase()}
        </span>
      </div>

      {/* Curated Document Tones Grid */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
          Document Surface Presets
        </div>
        <div className="grid grid-cols-3 gap-2">
          {PAPER_TONE_PRESETS.map((p) => {
            const isSelected =
              paperTone.toLowerCase() === p.id.toLowerCase() ||
              paperTone.toLowerCase() === p.color.toLowerCase();
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onSetPaperTone(p.id)}
                className={`group relative p-2 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer h-16 ${
                  isSelected
                    ? "ring-2 ring-[#8B3DFF] border-[#8B3DFF]"
                    : "hover:scale-[1.03] border-slate-200 dark:border-zinc-700/80"
                }`}
                style={{ backgroundColor: p.color, borderColor: isSelected ? undefined : p.border }}
                title={`${p.label} (${p.color})`}
              >
                <div className="flex items-center justify-between w-full">
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-black/10 dark:border-white/20"
                    style={{ backgroundColor: p.color }}
                  />
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-[#8B3DFF] text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>
                <span
                  className={`text-[10px] font-bold truncate ${
                    p.id === "dark" ? "text-white" : "text-slate-800"
                  }`}
                >
                  {p.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Color Input & Color Picker */}
      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800/80">
        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
          Custom Color & Hex
        </div>
        <div className="flex items-center gap-2">
          {/* Native HTML5 Color Picker Trigger Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => colorPickerRef.current?.click()}
              className="w-9 h-9 rounded-xl border border-slate-200 dark:border-zinc-700 flex items-center justify-center hover:scale-105 transition-all cursor-pointer relative overflow-hidden group"
              style={{ backgroundColor: activeColor }}
              title="Open color picker"
            >
              <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                <Pipette className="w-3.5 h-3.5 text-white opacity-80 group-hover:scale-110 transition-transform" />
              </div>
            </button>
            <input
              ref={colorPickerRef}
              type="color"
              value={activeColor.startsWith("#") ? activeColor : "#ffffff"}
              onChange={handleNativeColorInput}
              className="absolute inset-0 h-9 w-9 cursor-pointer opacity-0"
              aria-label="Choose custom paper color"
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
              onChange={(e) => handleHexChange(e)}
              maxLength={6}
              placeholder="FFFFFF"
              className="w-full pl-6 pr-2 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-mono font-bold text-slate-900 dark:text-white uppercase focus:outline-none focus:ring-2 focus:ring-[#8B3DFF] focus:border-transparent transition-all"
            />
          </div>

          {/* Reset to White Button */}
          <button
            type="button"
            onClick={() => {
              onSetPaperTone("white");
              setHexInput("#FFFFFF");
            }}
            className="h-9 px-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            title="Reset to Pure White (#FFFFFF)"
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

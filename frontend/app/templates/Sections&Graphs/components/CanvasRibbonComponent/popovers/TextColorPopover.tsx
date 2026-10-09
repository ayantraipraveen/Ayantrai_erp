"use client";

import React, { useState, useRef, useEffect } from "react";
import { Type, Plus, Check, Pipette, RotateCw } from "lucide-react";
import { TEXT_COLOR_SWATCHES } from "../constants";

export interface TextColorPopoverProps {
  currentColor?: string;
  onSelectColor: (color: string) => void;
  onReset: () => void;
  onClose: () => void;
  title?: string;
}

export function TextColorPopover({
  currentColor = "#0f172a",
  onSelectColor,
  onReset,
  onClose,
  title = "Text Color",
}: TextColorPopoverProps) {
  const [hexInput, setHexInput] = useState(
    currentColor.startsWith("#") ? currentColor.toUpperCase() : "#0F172A"
  );
  const colorPickerRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (currentColor && currentColor.startsWith("#")) {
      setHexInput(currentColor.toUpperCase());
    }
  }, [currentColor]);

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.trim();
    if (!val.startsWith("#")) {
      val = "#" + val;
    }
    setHexInput(val.toUpperCase());
    if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(val)) {
      onSelectColor(val.toLowerCase());
    }
  };

  const handleNativeColorInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHexInput(val.toUpperCase());
    onSelectColor(val);
  };

  const isCustomColor = !TEXT_COLOR_SWATCHES.some(s => s.hex.toLowerCase() === currentColor.toLowerCase());

  return (
    <div className="absolute top-8 left-0 w-72 sm:w-80 rounded-2xl bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-zinc-800 p-4 z-50 space-y-3.5 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-[#8B3DFF] flex items-center justify-center font-bold">
            <Type className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">{title}</h4>
            <p className="text-[10px] text-slate-400">Corporate typography palette & custom hex</p>
          </div>
        </div>
        <span
          className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200"
        >
          {currentColor.toUpperCase()}
        </span>
      </div>

      {/* Curated Typography Swatches Grid with integrated [+] Custom button */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
          <span>Palette Swatches</span>
          <span className="text-[9px] text-[#8B3DFF] font-semibold">Click + for color picker</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {/* Custom Color Add Button with Rainbow Spectrum directly in swatches */}
          <button
            type="button"
            onClick={() => colorPickerRef.current?.click()}
            className={`w-full h-8 rounded-lg flex items-center justify-center transition-all hover:scale-105 cursor-pointer border relative overflow-hidden group ${
              isCustomColor
                ? "ring-2 ring-[#8B3DFF] ring-offset-1 border-[#8B3DFF]"
                : "border-slate-300 dark:border-zinc-700 hover:border-purple-400"
            }`}
            style={{
              background: "conic-gradient(from 180deg at 50% 50%, #FF0000 0deg, #FFA500 45deg, #FFFF00 90deg, #008000 135deg, #00FFFF 180deg, #0000FF 225deg, #800080 270deg, #FF00FF 315deg, #FF0000 360deg)",
            }}
            title="Custom Selection: Open Color Picker / Eyedropper"
          >
            <div className="w-5 h-5 rounded-md bg-white/90 dark:bg-black/90 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-3.5 h-3.5 text-[#8B3DFF] font-bold" />
            </div>
          </button>

          {TEXT_COLOR_SWATCHES.map((swatch) => {
            const isSelected = currentColor.toLowerCase() === swatch.hex.toLowerCase();
            return (
              <button
                key={swatch.hex}
                type="button"
                onClick={() => {
                  onSelectColor(swatch.hex);
                }}
                className={`w-full h-8 rounded-lg flex items-center justify-center transition-transform hover:scale-110 cursor-pointer border ${
                  isSelected
                    ? "ring-2 ring-[#8B3DFF] ring-offset-1 border-transparent"
                    : "border-slate-200 dark:border-zinc-700"
                }`}
                style={{ backgroundColor: swatch.hex }}
                title={`${swatch.label} (${swatch.hex})`}
              >
                {isSelected && (
                  <Check
                    className={`w-3.5 h-3.5 ${
                      swatch.hex.toLowerCase() === "#ffffff" ? "text-slate-900" : "text-white"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Custom Color indicator (if non-preset is selected) */}
      {isCustomColor && (
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/25">
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-md border border-black/10 dark:border-white/20 flex-shrink-0"
              style={{ backgroundColor: currentColor }}
            />
            <div className="text-[11px] font-mono font-bold text-slate-800 dark:text-zinc-200">
              {currentColor.toUpperCase()}
            </div>
          </div>
          <span className="text-[9px] font-mono font-bold text-[#8B3DFF] uppercase tracking-wider bg-purple-500/15 px-1.5 py-0.5 rounded">
            Active Custom
          </span>
        </div>
      )}

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
              style={{ backgroundColor: currentColor }}
              title="Click to open system color picker"
            >
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Pipette
                  className={`w-3.5 h-3.5 ${
                    currentColor.toLowerCase() === "#ffffff" ? "text-slate-900" : "text-white"
                  }`}
                />
              </div>
            </button>
            <input
              ref={colorPickerRef}
              type="color"
              value={currentColor.startsWith("#") ? currentColor : "#0f172a"}
              onChange={handleNativeColorInput}
              className="absolute inset-0 h-9 w-9 cursor-pointer opacity-0"
              aria-label="Choose custom text color"
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
              placeholder="0F172A"
              className="w-full pl-6 pr-2 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-mono font-bold text-slate-900 dark:text-white uppercase focus:outline-none focus:ring-2 focus:ring-[#8B3DFF] focus:border-transparent transition-all"
            />
          </div>

          {/* Reset to Default Button */}
          <button
            type="button"
            onClick={() => {
              onReset();
              setHexInput("#0F172A");
            }}
            className="h-9 px-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            title="Reset to Default Color"
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

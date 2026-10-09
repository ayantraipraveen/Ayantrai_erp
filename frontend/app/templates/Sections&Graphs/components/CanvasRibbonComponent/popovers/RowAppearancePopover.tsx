"use client";

import React from "react";
import { Palette } from "lucide-react";
import { CanvasRowStyle } from "@/lib/redux/slices/reportModuleSlice";

export interface RowAppearancePopoverProps {
  rowStyle?: CanvasRowStyle;
  onUpdateRowStyle: (patch: Partial<CanvasRowStyle>) => void;
  onClose: () => void;
}

export function RowAppearancePopover({
  rowStyle = {},
  onUpdateRowStyle,
  onClose,
}: RowAppearancePopoverProps) {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="w-72 rounded-2xl bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-zinc-800 p-3.5 space-y-3.5 animate-fadeIn text-slate-800 dark:text-zinc-200"
    >
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/80 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-purple-500/10 text-[#8B3DFF] flex items-center justify-center font-bold">
            <Palette className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Row Appearance</h4>
            <p className="text-[10px] text-slate-400">Background, borders & radius</p>
          </div>
        </div>
      </div>

      {/* Row Background Tones */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
          Row Background Tone
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
              onClick={() => onUpdateRowStyle({ backgroundColor: bg.val })}
              className={`h-9 rounded-lg border text-[10px] font-bold p-1 transition-all cursor-pointer ${
                rowStyle.backgroundColor === bg.val
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

      {/* Border Style */}
      <div className="space-y-1.5 border-t border-slate-100 dark:border-zinc-800/80 pt-2">
        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
          Border Line Style
        </div>
        <div className="grid grid-cols-4 gap-1">
          {(["none", "solid", "dashed", "dotted"] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() =>
                onUpdateRowStyle({
                  borderStyle: st,
                  borderWidth: st === "none" ? 0 : rowStyle.borderWidth || 1,
                  borderColor: st === "none" ? "transparent" : rowStyle.borderColor || "#e2e8f0",
                })
              }
              className={`py-1 rounded-lg text-[10px] font-bold capitalize border transition-all cursor-pointer ${
                (rowStyle.borderStyle || (rowStyle.borderWidth ? "solid" : "none")) === st
                  ? "border-[#8B3DFF] bg-purple-500/10 text-[#8B3DFF]"
                  : "border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Border Radius */}
      <div className="space-y-1.5 border-t border-slate-100 dark:border-zinc-800/80 pt-2">
        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
          <span>Corner Radius</span>
          <span className="text-[#8B3DFF]">
            {typeof rowStyle.borderRadius === "number" ? `${rowStyle.borderRadius}px` : rowStyle.borderRadius || "16px"}
          </span>
        </div>
        <div className="grid grid-cols-5 gap-1">
          {[0, 8, 12, 16, 24].map((rad) => (
            <button
              key={rad}
              type="button"
              onClick={() => onUpdateRowStyle({ borderRadius: rad })}
              className={`py-1 rounded-md text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                rowStyle.borderRadius === rad
                  ? "border-[#8B3DFF] bg-purple-500/10 text-[#8B3DFF]"
                  : "border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-100"
              }`}
            >
              {rad}px
            </button>
          ))}
        </div>
      </div>

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

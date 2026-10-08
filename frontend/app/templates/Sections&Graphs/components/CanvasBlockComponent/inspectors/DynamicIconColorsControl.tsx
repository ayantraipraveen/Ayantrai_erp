import React from "react";
import { ColorSwatchPicker } from "../common/ColorSwatchPicker";

export interface DynamicIconColorsControlProps {
  customIconBg?: string;
  customIconColor?: string;
  onUpdateIconBg: (bg?: string) => void;
  onUpdateIconColor: (color?: string) => void;
  defaultBgPlaceholder?: string;
  defaultColorPlaceholder?: string;
}

export function DynamicIconColorsControl({
  customIconBg,
  customIconColor,
  onUpdateIconBg,
  onUpdateIconColor,
  defaultBgPlaceholder = "Auto (Tint)",
  defaultColorPlaceholder = "Auto (Tint)",
}: DynamicIconColorsControlProps) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      <div>
        <div className="flex items-center justify-between mb-0.5">
          <label className="text-[9px] font-semibold text-slate-700 dark:text-zinc-300">
            Icon Shape Color
          </label>
          {customIconBg && (
            <button
              type="button"
              onClick={() => onUpdateIconBg(undefined)}
              className="text-[8.5px] text-[#9D61FF] hover:underline cursor-pointer font-medium"
              title="Reset to default tint"
            >
              Reset
            </button>
          )}
        </div>
        <div className="flex items-center gap-1">
          <ColorSwatchPicker
            value={customIconBg || "#f3e8ff"}
            onChange={(hex) => onUpdateIconBg(hex)}
          />
          <input
            type="text"
            value={customIconBg || ""}
            onChange={(e) => onUpdateIconBg(e.target.value)}
            placeholder={defaultBgPlaceholder}
            className="flex-1 min-w-0 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-[10px] font-mono text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-[#9D61FF]"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-0.5">
          <label className="text-[9px] font-semibold text-slate-700 dark:text-zinc-300">
            Icon Glyph Color
          </label>
          {customIconColor && (
            <button
              type="button"
              onClick={() => onUpdateIconColor(undefined)}
              className="text-[8.5px] text-[#9D61FF] hover:underline cursor-pointer font-medium"
              title="Reset to default tint"
            >
              Reset
            </button>
          )}
        </div>
        <div className="flex items-center gap-1">
          <ColorSwatchPicker
            value={customIconColor || "#9D61FF"}
            onChange={(hex) => onUpdateIconColor(hex)}
          />
          <input
            type="text"
            value={customIconColor || ""}
            onChange={(e) => onUpdateIconColor(e.target.value)}
            placeholder={defaultColorPlaceholder}
            className="flex-1 min-w-0 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-[10px] font-mono text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-[#9D61FF]"
          />
        </div>
      </div>
    </div>
  );
}

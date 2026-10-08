import React from "react";
import { BADGE_COLOR_PALETTES } from "../common/blockConstants";

export interface BadgeColorPalettePickerProps {
  activePaletteId?: string;
  isCustomColorActive?: boolean;
  onSelectPalette: (paletteId: string) => void;
  label?: string;
}

export function BadgeColorPalettePicker({
  activePaletteId,
  isCustomColorActive = false,
  onSelectPalette,
  label = "Badge Color Palette",
}: BadgeColorPalettePickerProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-0.5">
        <label className="font-semibold text-slate-700 dark:text-zinc-300 block text-[9.5px]">
          {label}
        </label>
        {activePaletteId && (
          <span className="text-[8.5px] text-slate-400 capitalize font-medium">
            {activePaletteId}
          </span>
        )}
      </div>
      <div className="grid grid-cols-10 gap-0.5">
        {BADGE_COLOR_PALETTES.map((pal) => (
          <button
            key={pal.id}
            type="button"
            onClick={() => onSelectPalette(pal.id)}
            className={`h-5 rounded-md flex items-center justify-center border transition-all cursor-pointer ${pal.bg} ${pal.border} ${
              activePaletteId === pal.id && !isCustomColorActive
                ? "ring-1.5 ring-[#9D61FF] scale-105 shadow-xs"
                : "opacity-80 hover:opacity-100 hover:scale-102"
            }`}
            title={pal.label}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${pal.dot} shadow-xs`} />
          </button>
        ))}
      </div>
    </div>
  );
}

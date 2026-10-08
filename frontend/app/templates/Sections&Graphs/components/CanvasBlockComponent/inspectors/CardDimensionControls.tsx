import React from "react";
import { RotateCcw } from "lucide-react";

export interface CardDimensionControlsProps {
  customHeight?: number;
  customWidth?: number;
  onUpdateHeight: (height?: number) => void;
  onUpdateWidth: (width?: number) => void;
  titlePrefix?: string;
  badgeTag?: string;
  minHeight?: number;
  maxHeight?: number;
  defaultHeight?: number;
  minWidth?: number;
  maxWidth?: number;
  defaultWidth?: number;
}

export function CardDimensionControls({
  customHeight,
  customWidth,
  onUpdateHeight,
  onUpdateWidth,
  titlePrefix = "Card Sizing",
  badgeTag,
  minHeight = 50,
  maxHeight = 280,
  defaultHeight = 90,
  minWidth = 60,
  maxWidth = 360,
  defaultWidth = 120,
}: CardDimensionControlsProps) {
  const isCustom = Boolean(customHeight || customWidth);

  return (
    <div className="pt-1 border-t border-slate-200/80 dark:border-zinc-800/80">
      <div className="flex items-center justify-between mb-0.5">
        <div className="flex items-center gap-1">
          <span className="font-semibold text-slate-700 dark:text-zinc-300 text-[9.5px]">
            {titlePrefix}
          </span>
          {badgeTag && isCustom && (
            <span className="px-1 py-0.1 rounded bg-purple-100 dark:bg-purple-900/40 text-[8px] font-bold text-[#9D61FF]">
              {badgeTag}
            </span>
          )}
        </div>
        {isCustom && (
          <button
            type="button"
            onClick={() => {
              onUpdateHeight(undefined);
              onUpdateWidth(undefined);
            }}
            className="text-[8.5px] text-[#9D61FF] hover:underline cursor-pointer font-semibold flex items-center gap-0.5"
            title="Reset to auto stretch"
          >
            <RotateCcw className="w-2 h-2" />
            <span>Reset Auto</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        <div>
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[9px] text-slate-600 dark:text-zinc-400">Card Height</span>
            <span className="font-mono text-[9px] font-bold text-[#9D61FF]">
              {customHeight ? `${customHeight}px` : "Auto"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <input
              type="range"
              min={minHeight}
              max={maxHeight}
              value={customHeight || defaultHeight}
              onChange={(e) => onUpdateHeight(Number(e.target.value))}
              className="flex-1 accent-[#9D61FF] cursor-pointer h-1 bg-slate-200 dark:bg-zinc-700 rounded-lg"
            />
            <input
              type="number"
              min={40}
              max={500}
              value={customHeight ?? ""}
              placeholder="Auto"
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : undefined;
                onUpdateHeight(val);
              }}
              className="w-11 px-1 py-0.2 text-[9.5px] rounded border border-slate-200 dark:border-zinc-800 text-center font-mono font-bold bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-[#9D61FF]"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[9px] text-slate-600 dark:text-zinc-400">Card Width</span>
            <span className="font-mono text-[9px] font-bold text-[#9D61FF]">
              {customWidth ? `${customWidth}px` : "Auto"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <input
              type="range"
              min={minWidth}
              max={maxWidth}
              value={customWidth || defaultWidth}
              onChange={(e) => onUpdateWidth(Number(e.target.value))}
              className="flex-1 accent-[#9D61FF] cursor-pointer h-1 bg-slate-200 dark:bg-zinc-700 rounded-lg"
            />
            <input
              type="number"
              min={40}
              max={500}
              value={customWidth ?? ""}
              placeholder="Auto"
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : undefined;
                onUpdateWidth(val);
              }}
              className="w-11 px-1 py-0.2 text-[9.5px] rounded border border-slate-200 dark:border-zinc-800 text-center font-mono font-bold bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-[#9D61FF]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

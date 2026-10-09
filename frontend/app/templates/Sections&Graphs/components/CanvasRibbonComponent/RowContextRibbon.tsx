"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Undo2,
  Redo2,
  Sliders,
  Palette,
  ChevronDown,
  Layers,
  Trash2,
} from "lucide-react";
import { CanvasRow, CanvasRowStyle } from "@/lib/redux/slices/reportModuleSlice";
import { RibbonPortalPopover, RowAppearancePopover } from "./popovers";

export interface RowContextRibbonProps {
  activeRow: CanvasRow;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUpdateRowStyle?: (rowId: string, style: Partial<CanvasRowStyle>) => void;
  onRemoveRow?: (rowId: string) => void;
  onTogglePageBreak?: (rowId: string) => void;
}

export function RowContextRibbon({
  activeRow,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onUpdateRowStyle,
  onRemoveRow,
  onTogglePageBreak,
}: RowContextRibbonProps) {
  const [rowBorderMenuOpen, setRowBorderMenuOpen] = useState(false);
  const rowBorderBtnRef = useRef<HTMLButtonElement | null>(null);
  const ribbonRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const closeMenus = () => {
      setRowBorderMenuOpen(false);
    };

    const handlePointerDownOutside = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest(".portal-ribbon-popover")) {
        return;
      }
      if (ribbonRef.current && !ribbonRef.current.contains(e.target as Node)) {
        closeMenus();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenus();
    };

    document.addEventListener("pointerdown", handlePointerDownOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDownOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const rowStyle = activeRow.style || {};
  const colGap = rowStyle.columnGap ?? 12;
  const rowGap = rowStyle.rowGap ?? 12;
  const rowPadding = rowStyle.padding ?? rowStyle.paddingTop ?? 0;
  const rowMargin = rowStyle.marginTop ?? rowStyle.margin ?? 0;

  return (
    <div
      ref={ribbonRef}
      className="relative h-11 flex-shrink-0 flex items-center justify-between gap-2 px-3 sm:px-4 bg-slate-50/95 dark:bg-[#090d14]/95 border-b border-slate-200/80 dark:border-zinc-800/80 backdrop-blur-md overflow-x-auto no-scrollbar select-none animate-fadeIn z-40"
    >
      <div className="flex items-center gap-1.5 flex-nowrap shrink-0">
        {/* Undo / Redo controls */}
        {onUndo && (
          <div className="flex items-center gap-0.5 border-r border-slate-200 dark:border-zinc-800 pr-1.5 mr-0.5">
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              className={`h-7 w-7 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                canUndo
                  ? "border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200"
                  : "border-slate-100 dark:border-zinc-800/40 text-slate-300 dark:text-zinc-700 cursor-not-allowed opacity-40"
              }`}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onRedo}
              disabled={!canRedo}
              className={`h-7 w-7 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                canRedo
                  ? "border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200"
                  : "border-slate-100 dark:border-zinc-800/40 text-slate-300 dark:text-zinc-700 cursor-not-allowed opacity-40"
              }`}
              title="Redo (Ctrl+Y or Ctrl+Shift+Z)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Row Identifier Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/25 text-[#8B3DFF]">
          <Sliders className="w-3.5 h-3.5" />
          <span className="text-[11px] font-bold font-mono uppercase tracking-wider">Row Layout</span>
          <span className="text-[10px] opacity-75 font-mono">({activeRow.cells.length} blocks)</span>
        </div>

        <div className="w-px h-4 bg-slate-200 dark:bg-zinc-800 mx-0.5" />

        {/* Column Gap Control */}
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2 py-1 h-7">
          <span className="text-[10px] font-bold text-slate-400">Col Gap:</span>
          <button
            type="button"
            onClick={() => onUpdateRowStyle?.(activeRow.id, { columnGap: Math.max(0, colGap - 4) })}
            className="w-4 h-4 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center font-bold text-xs cursor-pointer"
            title="Decrease column gap"
          >
            -
          </button>
          <span className="text-[10px] font-mono font-bold text-slate-800 dark:text-zinc-200 min-w-[32px] text-center">
            {colGap}px
          </span>
          <button
            type="button"
            onClick={() => onUpdateRowStyle?.(activeRow.id, { columnGap: Math.min(48, colGap + 4) })}
            className="w-4 h-4 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center font-bold text-xs cursor-pointer"
            title="Increase column gap"
          >
            +
          </button>
          <div className="flex items-center gap-0.5 border-l border-slate-200 dark:border-zinc-800 pl-1 ml-0.5">
            {[0, 8, 12, 16, 24].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => onUpdateRowStyle?.(activeRow.id, { columnGap: g })}
                className={`px-1 py-0.5 rounded text-[9px] font-mono font-bold cursor-pointer transition-all ${
                  colGap === g ? "bg-[#8B3DFF] text-white" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Row Gap Control */}
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2 py-1 h-7">
          <span className="text-[10px] font-bold text-slate-400">Row Gap:</span>
          <button
            type="button"
            onClick={() => onUpdateRowStyle?.(activeRow.id, { rowGap: Math.max(0, rowGap - 4) })}
            className="w-4 h-4 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center font-bold text-xs cursor-pointer"
            title="Decrease row gap"
          >
            -
          </button>
          <span className="text-[10px] font-mono font-bold text-slate-800 dark:text-zinc-200 min-w-[32px] text-center">
            {rowGap}px
          </span>
          <button
            type="button"
            onClick={() => onUpdateRowStyle?.(activeRow.id, { rowGap: Math.min(48, rowGap + 4) })}
            className="w-4 h-4 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center font-bold text-xs cursor-pointer"
            title="Increase row gap"
          >
            +
          </button>
        </div>

        {/* Row Padding Control */}
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2 py-1 h-7">
          <span className="text-[10px] font-bold text-slate-400">Padding:</span>
          <button
            type="button"
            onClick={() => {
              const next = Math.max(0, rowPadding - 4);
              onUpdateRowStyle?.(activeRow.id, { padding: next, paddingTop: next, paddingBottom: next, paddingLeft: next, paddingRight: next });
            }}
            className="w-4 h-4 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center font-bold text-xs cursor-pointer"
            title="Decrease row padding"
          >
            -
          </button>
          <span className="text-[10px] font-mono font-bold text-slate-800 dark:text-zinc-200 min-w-[32px] text-center">
            {rowPadding}px
          </span>
          <button
            type="button"
            onClick={() => {
              const next = Math.min(48, rowPadding + 4);
              onUpdateRowStyle?.(activeRow.id, { padding: next, paddingTop: next, paddingBottom: next, paddingLeft: next, paddingRight: next });
            }}
            className="w-4 h-4 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center font-bold text-xs cursor-pointer"
            title="Increase row padding"
          >
            +
          </button>
        </div>

        {/* Row Margin Control */}
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2 py-1 h-7">
          <span className="text-[10px] font-bold text-slate-400">Margin:</span>
          <button
            type="button"
            onClick={() => {
              const next = Math.max(0, rowMargin - 4);
              onUpdateRowStyle?.(activeRow.id, { margin: next, marginTop: next, marginBottom: next });
            }}
            className="w-4 h-4 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center font-bold text-xs cursor-pointer"
            title="Decrease row margin"
          >
            -
          </button>
          <span className="text-[10px] font-mono font-bold text-slate-800 dark:text-zinc-200 min-w-[32px] text-center">
            {rowMargin}px
          </span>
          <button
            type="button"
            onClick={() => {
              const next = Math.min(32, rowMargin + 4);
              onUpdateRowStyle?.(activeRow.id, { margin: next, marginTop: next, marginBottom: next });
            }}
            className="w-4 h-4 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center font-bold text-xs cursor-pointer"
            title="Increase row margin"
          >
            +
          </button>
        </div>

        {/* Row Appearance Button */}
        <div className="relative">
          <button
            ref={rowBorderBtnRef}
            type="button"
            onClick={() => setRowBorderMenuOpen(!rowBorderMenuOpen)}
            className="h-7 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 hover:border-purple-400 bg-white dark:bg-zinc-900 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer text-slate-700 dark:text-zinc-200"
            title="Row Background & Borders"
          >
            <Palette className="w-3.5 h-3.5 text-[#8B3DFF]" />
            <span>Row Style</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          <RibbonPortalPopover
            anchorEl={rowBorderBtnRef.current}
            isOpen={rowBorderMenuOpen}
            onClose={() => setRowBorderMenuOpen(false)}
          >
            <RowAppearancePopover
              rowStyle={rowStyle}
              onUpdateRowStyle={(patch) => onUpdateRowStyle?.(activeRow.id, patch)}
              onClose={() => setRowBorderMenuOpen(false)}
            />
          </RibbonPortalPopover>
        </div>

        {/* Page Break Toggle */}
        {onTogglePageBreak && (
          <button
            type="button"
            onClick={() => onTogglePageBreak(activeRow.id)}
            className={`h-7 px-2.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeRow.pageBreakBefore
                ? "border-purple-500 bg-purple-500/15 text-[#8B3DFF] font-bold"
                : "border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
            }`}
            title="Start this row on a new page (Page Break)"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Page Break</span>
          </button>
        )}

        {/* Delete Row */}
        {onRemoveRow && (
          <button
            type="button"
            onClick={() => onRemoveRow(activeRow.id)}
            className="h-7 px-2 rounded-lg border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-500 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            title="Delete this row"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Row</span>
          </button>
        )}
      </div>
    </div>
  );
}

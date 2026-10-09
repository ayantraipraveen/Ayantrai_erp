"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Undo2,
  Redo2,
  Activity,
  BarChart2,
  Lightbulb,
  AlignLeft,
  AlignCenter,
  AlignRight,
  LayoutGrid,
  Minus,
  Stamp,
  Ruler,
  Copy,
  Trash2,
  Type,
  ChevronDown,
  Check,
  Palette,
  Square,
  SlidersHorizontal,
} from "lucide-react";
import {
  CanvasCell,
  CanvasCellStyle,
  LibraryMetricCard,
  LibraryChartCard,
  GraphType,
} from "@/lib/redux/slices/reportModuleSlice";
import { CHART_TYPE_OPTIONS } from "../constants/chartTypes";
import { COLOR_RAMP_DOTS, FONT_OPTIONS } from "../../utils";
import { UploadedSvgWatermark, WatermarkStampConfig } from "../../watermark/utils";
import {
  RibbonPortalPopover,
  TextColorPopover,
  CardBgPopover,
  CardBorderPopover,
  WatermarkPopover,
} from "./popovers";

export interface BlockContextRibbonProps {
  selectedCell: CanvasCell;
  onUpdateColSpan: (span: 1 | 2 | 3 | 4) => void;
  onUpdateWidth?: (customWidth?: number) => void;
  onUpdateHeight?: (customHeight?: number) => void;
  onUpdateMetricCard?: (card: LibraryMetricCard) => void;
  onUpdateChart?: (chart: LibraryChartCard) => void;
  onOpenChartEditor?: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  showRulers?: boolean;
  onToggleRulers?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUpdateCellStyle?: (style: Partial<CanvasCellStyle>) => void;
  uploadedWatermarks?: UploadedSvgWatermark[];
  activeWatermarkId?: string | null;
  onSelectWatermark?: (watermarkId: string | null) => void;
  watermarkConfig?: WatermarkStampConfig;
  onUpdateWatermarkConfig?: (config: Partial<WatermarkStampConfig>) => void;
}

export function BlockContextRibbon({
  selectedCell,
  onUpdateColSpan,
  onUpdateWidth,
  onUpdateHeight,
  onUpdateMetricCard,
  onUpdateChart,
  onOpenChartEditor,
  onDuplicate,
  onDelete,
  showRulers = false,
  onToggleRulers,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onUpdateCellStyle,
  uploadedWatermarks = [],
  activeWatermarkId,
  onSelectWatermark,
  watermarkConfig,
  onUpdateWatermarkConfig,
}: BlockContextRibbonProps) {
  // Popover menus state
  const [fontMenuOpen, setFontMenuOpen] = useState(false);
  const [colorMenuOpen, setColorMenuOpen] = useState(false);
  const [bgMenuOpen, setBgMenuOpen] = useState(false);
  const [borderMenuOpen, setBorderMenuOpen] = useState(false);
  const [watermarkMenuOpen, setWatermarkMenuOpen] = useState(false);

  // Button refs for anchor alignment
  const fontBtnRef = useRef<HTMLButtonElement | null>(null);
  const colorBtnRef = useRef<HTMLButtonElement | null>(null);
  const bgBtnRef = useRef<HTMLButtonElement | null>(null);
  const borderBtnRef = useRef<HTMLButtonElement | null>(null);
  const cellWatermarkBtnRef = useRef<HTMLButtonElement | null>(null);
  const ribbonRef = useRef<HTMLDivElement | null>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const closeMenus = () => {
      setFontMenuOpen(false);
      setColorMenuOpen(false);
      setBgMenuOpen(false);
      setBorderMenuOpen(false);
      setWatermarkMenuOpen(false);
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

  const currentStyle = selectedCell.style || {};
  const currentWm = uploadedWatermarks.find((w) => w.id === activeWatermarkId);
  const card = selectedCell.metricCard;
  const chart = selectedCell.chart;

  return (
    <div
      ref={ribbonRef}
      className="relative flex-shrink-0 flex flex-col justify-center gap-1.5 py-1.5 px-3 sm:px-4 bg-slate-50/95 dark:bg-[#090d14]/95 border-b border-slate-200/80 dark:border-zinc-800/80 backdrop-blur-md select-none animate-fadeIn z-40 overflow-visible"
    >
      {/* ── ROW 1: Dimensions, Block Layout & Document Actions ── */}
      <div className="flex items-center justify-between gap-2 w-full min-h-[28px]">
        {/* Row 1 Left: Undo/Redo, Block Type Tag, Width & Height Controls */}
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

          {/* Active Block Type Tag */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#9D61FF]/15 text-[#9D61FF] border border-[#9D61FF]/30 text-xs font-bold font-mono">
            {selectedCell.blockType === "metric-card" && <Activity className="w-3.5 h-3.5" />}
            {selectedCell.blockType === "chart" && <BarChart2 className="w-3.5 h-3.5" />}
            {selectedCell.blockType === "insight" && <Lightbulb className="w-3.5 h-3.5" />}
            {selectedCell.blockType === "text" && <AlignLeft className="w-3.5 h-3.5" />}
            {selectedCell.blockType === "badge-strip" && <LayoutGrid className="w-3.5 h-3.5" />}
            {selectedCell.blockType === "divider" && <Minus className="w-3.5 h-3.5" />}
            <span className="capitalize">{selectedCell.blockType.replace("-", " ")}</span>
          </div>

          {/* Fluid Width Controls (Always Visible) */}
          {(() => {
            const currentCellWidth = Math.round(
              selectedCell.customWidth ?? (selectedCell.colSpan ? selectedCell.colSpan * 25 : 50)
            );
            const isChart = selectedCell.blockType === "chart";
            const baseHeightForCell =
              selectedCell.customHeight ||
              (isChart
                ? 360
                : selectedCell.blockType === "badge-strip"
                ? 140
                : selectedCell.blockType === "insight"
                ? 110
                : selectedCell.blockType === "text"
                ? 90
                : selectedCell.blockType === "divider"
                ? 32
                : 140);

            return (
              <>
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800/80 p-0.5 rounded-lg border border-slate-200/80 dark:border-zinc-700/80">
                  <span className="text-[10px] font-mono font-bold text-slate-400 px-1">Width:</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (onUpdateWidth) onUpdateWidth(undefined);
                      else onUpdateColSpan(2);
                    }}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                      selectedCell.customWidth === undefined
                        ? "bg-[#9D61FF] text-white"
                        : "text-slate-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-900"
                    }`}
                    title="Auto width (fits row naturally)"
                  >
                    Auto
                  </button>
                  {([25, 33, 50, 66, 75, 100] as const).map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => {
                        if (onUpdateWidth) onUpdateWidth(w);
                        else {
                          const span = (w <= 30 ? 1 : w <= 55 ? 2 : w <= 80 ? 3 : 4) as 1 | 2 | 3 | 4;
                          onUpdateColSpan(span);
                        }
                      }}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                        selectedCell.customWidth !== undefined && Math.abs(currentCellWidth - w) <= 1
                          ? "bg-[#9D61FF] text-white"
                          : "text-slate-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-900"
                      }`}
                      title={`Set block width to ${w}%`}
                    >
                      {w}%
                    </button>
                  ))}
                  {/* Steppers for fluid adjustable width */}
                  <div className="flex items-center border-l border-slate-200 dark:border-zinc-700 pl-1 ml-0.5 gap-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        const next = Math.max(15, currentCellWidth - 5);
                        if (onUpdateWidth) onUpdateWidth(next);
                      }}
                      className="w-4 h-4 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-zinc-900 flex items-center justify-center font-bold text-xs cursor-pointer"
                      title="Decrease width by 5%"
                    >
                      -
                    </button>
                    <span className="text-[10px] font-mono font-bold text-slate-700 dark:text-zinc-200 min-w-[28px] text-center">
                      {currentCellWidth}%
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const next = Math.min(100, currentCellWidth + 5);
                        if (onUpdateWidth) onUpdateWidth(next);
                      }}
                      className="w-4 h-4 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-zinc-900 flex items-center justify-center font-bold text-xs cursor-pointer"
                      title="Increase width by 5%"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Fluid Height Controls with Standard Block-Aware Presets */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800/80 p-0.5 rounded-lg border border-slate-200/80 dark:border-zinc-700/80">
                  <span className="text-[10px] font-mono font-bold text-slate-400 px-1">Height:</span>
                  {(isChart
                    ? [
                        { label: "Auto", val: undefined, tip: "Auto standard golden-ratio height (360px)" },
                        { label: "S", val: 280, tip: "S (Compact Chart 280px)" },
                        { label: "M", val: 360, tip: "M (Standard Chart 360px)" },
                        { label: "L", val: 460, tip: "L (Expanded Chart 460px)" },
                      ]
                    : [
                        { label: "Auto", val: undefined, tip: "Auto fits block content naturally" },
                        { label: "S", val: 140, tip: "S (Compact 140px)" },
                        { label: "M", val: 240, tip: "M (Standard 240px)" },
                        { label: "L", val: 360, tip: "L (Large 360px)" },
                      ]
                  ).map((h) => {
                    const isSelected =
                      h.val === undefined
                        ? selectedCell.customHeight === undefined
                        : selectedCell.customHeight === h.val;
                    return (
                      <button
                        key={h.label}
                        type="button"
                        onClick={() => onUpdateHeight && onUpdateHeight(h.val)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#9D61FF] text-white"
                            : "text-slate-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-900"
                        }`}
                        title={h.tip}
                      >
                        {h.label}
                      </button>
                    );
                  })}
                  {/* Steppers for fluid adjustable height */}
                  <div className="flex items-center border-l border-slate-200 dark:border-zinc-700 pl-1 ml-0.5 gap-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        const curr = selectedCell.customHeight ?? baseHeightForCell;
                        const minH = isChart ? 260 : 32;
                        const next = Math.max(minH, curr - 20);
                        if (onUpdateHeight) onUpdateHeight(next);
                      }}
                      className="w-4 h-4 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-zinc-900 flex items-center justify-center font-bold text-xs cursor-pointer"
                      title={isChart ? "Decrease height by 20px (min 260px)" : "Decrease height by 20px"}
                    >
                      -
                    </button>
                    <span className="text-[10px] font-mono font-bold text-slate-700 dark:text-zinc-200 min-w-[38px] text-center">
                      {selectedCell.customHeight ? `${selectedCell.customHeight}px` : "Auto"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const curr = selectedCell.customHeight ?? baseHeightForCell;
                        const next = Math.min(560, curr + 20);
                        if (onUpdateHeight) onUpdateHeight(next);
                      }}
                      className="w-4 h-4 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-zinc-900 flex items-center justify-center font-bold text-xs cursor-pointer"
                      title="Increase height by 20px"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Dynamic Zoom & Scale Controls */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800/80 p-0.5 rounded-lg border border-slate-200/80 dark:border-zinc-700/80">
                  <span className="text-[10px] font-mono font-bold text-slate-400 px-1">Zoom:</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (isChart && selectedCell.chart && onUpdateChart) {
                        onUpdateChart({ ...selectedCell.chart, scale: 1 });
                      } else if (onUpdateCellStyle) {
                        onUpdateCellStyle({ scale: 1 });
                      }
                    }}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                      (selectedCell.chart?.scale ?? selectedCell.style?.scale ?? 1) === 1
                        ? "bg-[#9D61FF] text-white"
                        : "text-slate-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-900"
                    }`}
                    title="Reset Zoom to 100%"
                  >
                    100%
                  </button>
                  {([75, 125, 150] as const).map((z) => {
                    const factor = z / 100;
                    const curr = selectedCell.chart?.scale ?? selectedCell.style?.scale ?? 1;
                    const isActive = Math.abs(curr - factor) < 0.02;
                    return (
                      <button
                        key={z}
                        type="button"
                        onClick={() => {
                          if (isChart && selectedCell.chart && onUpdateChart) {
                            onUpdateChart({ ...selectedCell.chart, scale: factor });
                          } else if (onUpdateCellStyle) {
                            onUpdateCellStyle({ scale: factor });
                          }
                        }}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                          isActive
                            ? "bg-[#9D61FF] text-white"
                            : "text-slate-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-900"
                        }`}
                        title={`Set Zoom to ${z}%`}
                      >
                        {z}%
                      </button>
                    );
                  })}
                  {/* Steppers */}
                  <div className="flex items-center border-l border-slate-200 dark:border-zinc-700 pl-1 ml-0.5 gap-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        const curr = selectedCell.chart?.scale ?? selectedCell.style?.scale ?? 1;
                        const next = Math.max(0.5, Math.round((curr - 0.1) * 10) / 10);
                        if (isChart && selectedCell.chart && onUpdateChart) {
                          onUpdateChart({ ...selectedCell.chart, scale: next });
                        } else if (onUpdateCellStyle) {
                          onUpdateCellStyle({ scale: next });
                        }
                      }}
                      className="w-4 h-4 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-zinc-900 flex items-center justify-center font-bold text-xs cursor-pointer"
                      title="Decrease Zoom by 10%"
                    >
                      -
                    </button>
                    <span className="text-[10px] font-mono font-bold text-slate-700 dark:text-zinc-200 min-w-[32px] text-center">
                      {Math.round((selectedCell.chart?.scale ?? selectedCell.style?.scale ?? 1) * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const curr = selectedCell.chart?.scale ?? selectedCell.style?.scale ?? 1;
                        const next = Math.min(2.0, Math.round((curr + 0.1) * 10) / 10);
                        if (isChart && selectedCell.chart && onUpdateChart) {
                          onUpdateChart({ ...selectedCell.chart, scale: next });
                        } else if (onUpdateCellStyle) {
                          onUpdateCellStyle({ scale: next });
                        }
                      }}
                      className="w-4 h-4 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-zinc-900 flex items-center justify-center font-bold text-xs cursor-pointer"
                      title="Increase Zoom by 10%"
                    >
                      +
                    </button>
                  </div>
                </div>
              </>
            );
          })()}
        </div>

        {/* Row 1 Right: Document & Canvas Tools (Watermark, Rulers, Duplicate, Delete) */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Watermark Quick Access */}
          <button
            ref={cellWatermarkBtnRef}
            type="button"
            onClick={() => {
              setWatermarkMenuOpen(!watermarkMenuOpen);
              setFontMenuOpen(false);
              setColorMenuOpen(false);
              setBgMenuOpen(false);
            }}
            className={`h-7 px-2.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              currentWm
                ? "bg-purple-500/15 border-purple-400/40 text-[#8B3DFF]"
                : "border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
            }`}
            title="Document Watermark & Corporate Stamp"
          >
            <Stamp className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{currentWm ? currentWm.name.split(" ")[0] : "Watermark"}</span>
          </button>

          {/* Rulers Toggle Button */}
          {onToggleRulers && (
            <button
              type="button"
              onClick={onToggleRulers}
              className={`h-7 px-2.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                showRulers
                  ? "bg-purple-500/15 border-purple-400/40 text-[#8B3DFF]"
                  : "border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
              }`}
              title="Toggle Dimensions & Position Rulers (Shift+R) — 794×1123px"
            >
              <Ruler className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Rulers</span>
            </button>
          )}

          {/* Duplicate Button */}
          <button
            type="button"
            onClick={onDuplicate}
            className="h-7 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Duplicate Block (Ctrl+D)"
          >
            <Copy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Duplicate</span>
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={onDelete}
            className="h-7 px-2.5 rounded-lg border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Delete Block (Del)"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      </div>

      {/* ── ROW 2: Typography, Styling (Colors, Borders, Opacity) & Content Configuration ── */}
      <div className="flex items-center justify-between gap-2 w-full min-h-[28px] pt-1 border-t border-slate-200/60 dark:border-zinc-800/60">
        {/* Row 2 Left: Typography & Styling Controls */}
        <div className="flex items-center gap-1.5 flex-nowrap shrink-0">
          {/* Font Family Dropdown */}
          <div className="relative">
            <button
              ref={fontBtnRef}
              type="button"
              onClick={() => {
                setFontMenuOpen(!fontMenuOpen);
                setColorMenuOpen(false);
                setBgMenuOpen(false);
                setWatermarkMenuOpen(false);
              }}
              className="h-7 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 hover:border-purple-400 bg-white dark:bg-zinc-900 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer text-slate-700 dark:text-zinc-200"
              title="Change Font Family"
            >
              <Type className="w-3.5 h-3.5 text-[#8B3DFF]" />
              <span className="capitalize">{currentStyle.fontFamily || "Sans"}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            <RibbonPortalPopover
              anchorEl={fontBtnRef.current}
              isOpen={fontMenuOpen}
              onClose={() => setFontMenuOpen(false)}
            >
              <div className="w-44 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-1.5 space-y-1 animate-fadeIn select-none">
                <div className="px-2 py-1 text-[10px] font-mono uppercase text-slate-400 font-bold">Typography</div>
                {FONT_OPTIONS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      if (onUpdateCellStyle) onUpdateCellStyle({ fontFamily: f.id });
                      setFontMenuOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors ${
                      (currentStyle.fontFamily || "sans") === f.id
                        ? "bg-[#8B3DFF]/10 text-[#8B3DFF] font-bold"
                        : "hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200"
                    }`}
                  >
                    <span className={f.previewClass}>{f.label}</span>
                    {(currentStyle.fontFamily || "sans") === f.id && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </RibbonPortalPopover>
          </div>

          {/* Direct Font Size Scale Controls */}
          <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-zinc-800/80 p-0.5 rounded-lg border border-slate-200/80 dark:border-zinc-700/80">
            <span className="text-[10px] font-mono font-bold text-slate-400 px-1" title="Font Size Scale">
              Size:
            </span>
            {([
              { id: "xs", label: "XS", tip: "Extra Small (11px)" },
              { id: "sm", label: "S", tip: "Small (12px)" },
              { id: "base", label: "M", tip: "Medium Standard (14px)" },
              { id: "lg", label: "L", tip: "Large (16px)" },
              { id: "xl", label: "XL", tip: "Extra Large (18px)" },
            ] as const).map((sz) => {
              const isSelected = (currentStyle.fontSize || "base") === sz.id;
              return (
                <button
                  key={sz.id}
                  type="button"
                  onClick={() => onUpdateCellStyle && onUpdateCellStyle({ fontSize: sz.id })}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#9D61FF] text-white"
                      : "text-slate-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-900"
                  }`}
                  title={sz.tip}
                >
                  {sz.label}
                </button>
              );
            })}
          </div>

          {/* Text Align Controls */}
          <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-zinc-800/80 p-0.5 rounded-lg border border-slate-200/80 dark:border-zinc-700/80">
            <button
              type="button"
              onClick={() => onUpdateCellStyle && onUpdateCellStyle({ textAlign: "left" })}
              className={`p-1 rounded cursor-pointer transition-colors ${
                (currentStyle.textAlign || "left") === "left"
                  ? "bg-white dark:bg-zinc-900 text-[#8B3DFF]"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
              }`}
              title="Align Left"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onUpdateCellStyle && onUpdateCellStyle({ textAlign: "center" })}
              className={`p-1 rounded cursor-pointer transition-colors ${
                currentStyle.textAlign === "center"
                  ? "bg-white dark:bg-zinc-900 text-[#8B3DFF]"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
              }`}
              title="Align Center"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onUpdateCellStyle && onUpdateCellStyle({ textAlign: "right" })}
              className={`p-1 rounded cursor-pointer transition-colors ${
                currentStyle.textAlign === "right"
                  ? "bg-white dark:bg-zinc-900 text-[#8B3DFF]"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
              }`}
              title="Align Right"
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Text Color Swatches Dropdown */}
          <div className="relative">
            <button
              ref={colorBtnRef}
              type="button"
              onClick={() => {
                setColorMenuOpen(!colorMenuOpen);
                setFontMenuOpen(false);
                setBgMenuOpen(false);
                setWatermarkMenuOpen(false);
              }}
              className="h-7 px-2 rounded-lg border border-slate-200 dark:border-zinc-800 hover:border-purple-400 bg-white dark:bg-zinc-900 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer text-slate-700 dark:text-zinc-200"
              title="Text Color"
            >
              <div
                className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-zinc-600"
                style={{ backgroundColor: currentStyle.textColor || "#0f172a" }}
              />
              <span className="hidden sm:inline">Color</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            <RibbonPortalPopover
              anchorEl={colorBtnRef.current}
              isOpen={colorMenuOpen}
              onClose={() => setColorMenuOpen(false)}
            >
              <TextColorPopover
                currentColor={currentStyle.textColor || "#0f172a"}
                onSelectColor={(col) => {
                  if (onUpdateCellStyle) onUpdateCellStyle({ textColor: col });
                }}
                onReset={() => {
                  if (onUpdateCellStyle) onUpdateCellStyle({ textColor: undefined });
                }}
                onClose={() => setColorMenuOpen(false)}
                title="Block Text Color"
              />
            </RibbonPortalPopover>
          </div>

          <div className="w-px h-4 bg-slate-200 dark:bg-zinc-800 mx-0.5" />

          {/* Card Background (Bg) Presets Dropdown */}
          <div className="relative">
            <button
              ref={bgBtnRef}
              type="button"
              onClick={() => {
                setBgMenuOpen(!bgMenuOpen);
                setFontMenuOpen(false);
                setColorMenuOpen(false);
                setWatermarkMenuOpen(false);
              }}
              className="h-7 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 hover:border-purple-400 bg-white dark:bg-zinc-900 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer text-slate-700 dark:text-zinc-200"
              title="Card Background"
            >
              <Palette className="w-3.5 h-3.5 text-[#8B3DFF]" />
              <span>Card Bg</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            <RibbonPortalPopover
              anchorEl={bgBtnRef.current}
              isOpen={bgMenuOpen}
              onClose={() => setBgMenuOpen(false)}
            >
              <CardBgPopover
                currentBg={currentStyle.cardBg}
                onSelectBg={(bg) => {
                  if (onUpdateCellStyle) onUpdateCellStyle({ cardBg: bg });
                }}
                onReset={() => {
                  if (onUpdateCellStyle) onUpdateCellStyle({ cardBg: undefined });
                }}
                onClose={() => setBgMenuOpen(false)}
              />
            </RibbonPortalPopover>
          </div>

          {/* Card Border Presets Dropdown */}
          <div className="relative">
            <button
              ref={borderBtnRef}
              type="button"
              onClick={() => {
                setBorderMenuOpen(!borderMenuOpen);
                setBgMenuOpen(false);
                setFontMenuOpen(false);
                setColorMenuOpen(false);
                setWatermarkMenuOpen(false);
              }}
              className="h-7 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 hover:border-purple-400 bg-white dark:bg-zinc-900 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer text-slate-700 dark:text-zinc-200"
              title="Card Border Color & Style"
            >
              <Square className="w-3.5 h-3.5 text-[#8B3DFF]" />
              <span>Border</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            <RibbonPortalPopover
              anchorEl={borderBtnRef.current}
              isOpen={borderMenuOpen}
              onClose={() => setBorderMenuOpen(false)}
            >
              <CardBorderPopover
                currentBorderColor={currentStyle.borderColor}
                currentBorderStyle={currentStyle.borderStyle}
                currentBorderWidth={currentStyle.borderWidth}
                currentBorderRadius={currentStyle.borderRadius}
                currentShadow={currentStyle.shadow}
                onSelectBorder={(patch) => {
                  if (onUpdateCellStyle) onUpdateCellStyle(patch);
                }}
                onReset={() => {
                  if (onUpdateCellStyle) {
                    onUpdateCellStyle({
                      borderColor: undefined,
                      borderStyle: undefined,
                      borderWidth: undefined,
                      borderRadius: undefined,
                      shadow: undefined,
                    });
                  }
                }}
                onClose={() => setBorderMenuOpen(false)}
              />
            </RibbonPortalPopover>
          </div>

          {/* Selected Card Background Opacity */}
          <div className="flex h-7 items-center gap-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2">
            <span className="text-[10px] font-bold text-slate-400">Bg</span>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={currentStyle.backgroundOpacity ?? 100}
              onChange={(event) => onUpdateCellStyle?.({ backgroundOpacity: Number(event.target.value) })}
              className="w-16 accent-[#8B3DFF] cursor-pointer"
              title="Adjust selected card background opacity"
            />
            <span className="min-w-[30px] text-right text-[10px] font-mono font-bold text-[#8B3DFF]">
              {currentStyle.backgroundOpacity ?? 100}%
            </span>
          </div>
        </div>

        {/* Row 2 Right: Block Data Controls (Metric / Chart) */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Metric Card Context Controls (if metric-card) */}
          {selectedCell.blockType === "metric-card" && card && onUpdateMetricCard && (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded-lg border border-slate-200/80 dark:border-zinc-700/80">
                <span className="text-[10px] font-mono font-bold text-slate-400">Val:</span>
                <input
                  type="text"
                  value={card.value}
                  onChange={(e) => onUpdateMetricCard({ ...card, value: e.target.value })}
                  className="h-6 w-16 px-1.5 rounded bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-800 dark:text-zinc-100 outline-none focus:border-[#9D61FF]"
                  placeholder="Value..."
                  title="Edit metric value directly"
                />
                <span className="text-[10px] font-mono font-bold text-slate-400 ml-1">Txt:</span>
                <input
                  type="text"
                  value={card.label}
                  onChange={(e) => onUpdateMetricCard({ ...card, label: e.target.value })}
                  className="h-6 w-24 px-1.5 rounded bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-800 dark:text-zinc-100 outline-none focus:border-[#9D61FF] truncate"
                  placeholder="Label..."
                  title="Edit metric label directly"
                />
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-400 mr-0.5 hidden md:inline">Tint:</span>
              {COLOR_RAMP_DOTS.map((dot) => (
                <button
                  key={dot.id}
                  type="button"
                  onClick={() => onUpdateMetricCard({ ...card, tintColor: dot.id })}
                  title={dot.label}
                  className={`w-4 h-4 rounded-full ${dot.bg} transition-transform cursor-pointer ${
                    card.tintColor === dot.id ? "ring-2 ring-offset-1 ring-[#9D61FF] scale-110" : "opacity-70 hover:opacity-100"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Chart Context Controls (if chart) */}
          {selectedCell.blockType === "chart" && chart && onUpdateChart && (
            <>
              {/* Direct Title Text Editing from Ribbon */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded-lg border border-slate-200/80 dark:border-zinc-700/80">
                <span className="text-[10px] font-mono font-bold text-slate-400">Title:</span>
                <input
                  type="text"
                  value={chart.title || ""}
                  onChange={(e) => onUpdateChart({ ...chart, title: e.target.value })}
                  className="h-6 w-28 sm:w-36 px-1.5 rounded bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-800 dark:text-zinc-100 outline-none focus:border-[#9D61FF] focus:ring-1 focus:ring-[#9D61FF]/30 transition-all truncate"
                  placeholder="No title (hidden)..."
                  title="Edit chart title (clear to remove from card)"
                />
                {chart.title ? (
                  <button
                    type="button"
                    onClick={() => onUpdateChart({ ...chart, title: "" })}
                    className="text-slate-400 hover:text-red-500 text-[11px] px-1 font-bold cursor-pointer transition-colors"
                    title="Remove chart name"
                  >
                    ✕
                  </button>
                ) : null}
              </div>

              <select
                value={chart.chartType}
                onChange={(e) => onUpdateChart({ ...chart, chartType: e.target.value as GraphType })}
                className="h-6.5 px-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-800 dark:text-zinc-200 outline-none cursor-pointer"
              >
                {CHART_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {onOpenChartEditor && (
                <button
                  type="button"
                  onClick={onOpenChartEditor}
                  className="h-6.5 px-2 rounded-lg border border-purple-300 dark:border-purple-800/80 bg-purple-500/10 hover:bg-purple-500/20 text-[#9D61FF] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Configure Chart Type, Data Points, Axis & Units"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Edit Data</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Watermark Popover Modal ── */}
      <RibbonPortalPopover
        anchorEl={cellWatermarkBtnRef.current}
        isOpen={watermarkMenuOpen}
        onClose={() => setWatermarkMenuOpen(false)}
        align="right"
      >
        <WatermarkPopover
          uploadedWatermarks={uploadedWatermarks}
          activeWatermarkId={activeWatermarkId}
          onSelectWatermark={(id) => {
            if (onSelectWatermark) onSelectWatermark(id);
          }}
          config={watermarkConfig}
          onUpdateConfig={onUpdateWatermarkConfig}
          onClose={() => setWatermarkMenuOpen(false)}
        />
      </RibbonPortalPopover>
    </div>
  );
}

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  SlidersHorizontal,
  Pencil,
  BarChart2,
  ExternalLink,
  Layers,
  Plus,
} from "lucide-react";
import { CanvasCell, LibraryChartCard } from "@/lib/redux/slices/reportModuleSlice";
import { CHART_TYPE_OPTIONS } from "../../constants/chartTypes";
import { getChartEditorMode } from "../../constants/chartDataPresets";
import { DynamicTextEditor } from "../../DynamicTitleEditor";
import ChartRenderer from "../../ChartComponent/ChartRenderer";
import { calculateTopBarPosition } from "../common/blockUtils";
import { ChartInspectorPopover } from "../inspectors/ChartInspectorPopover";

export interface ChartBlockProps {
  cell: CanvasCell;
  isSelected?: boolean;
  isPreview?: boolean;
  onOpenChartEditor?: () => void;
  onUpdateChart?: (chart: LibraryChartCard) => void;
  onEditingChange?: (isEditing: boolean) => void;
}

export function ChartBlock({
  cell,
  isSelected,
  isPreview,
  onOpenChartEditor,
  onUpdateChart,
  onEditingChange,
}: ChartBlockProps) {
  const chart = cell.chart;
  const containerRef = useRef<HTMLDivElement>(null);

  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [inspectorTab, setInspectorTab] = useState<"chart" | "data" | "layout">("chart");
  const [portalCoords, setPortalCoords] = useState<{ top: number; left: number } | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  const [editingTarget, setEditingTarget] = useState<"title" | "description" | null>(null);

  useEffect(() => {
    if (!isSelected) {
      setIsInspectorOpen(false);
    }
  }, [isSelected]);

  const updatePortalPos = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setAnchorRect(rect);
    setPortalCoords(calculateTopBarPosition(rect));
  }, []);

  useEffect(() => {
    if (isSelected && !isPreview) {
      updatePortalPos();
      const interval = setInterval(updatePortalPos, 400);
      window.addEventListener("scroll", updatePortalPos, true);
      window.addEventListener("resize", updatePortalPos);
      return () => {
        clearInterval(interval);
        window.removeEventListener("scroll", updatePortalPos, true);
        window.removeEventListener("resize", updatePortalPos);
      };
    }
  }, [isSelected, isPreview, updatePortalPos]);

  if (!chart) return null;

  const customHeight = chart.customHeight || cell.customHeight;
  const style = cell.style || {};

  const currentChartTypeMeta = CHART_TYPE_OPTIONS.find((c) => c.id === chart.chartType);
  const chartTypeLabel = currentChartTypeMeta?.label || `${chart.chartType || "Chart"}`;
  const ChartIcon = currentChartTypeMeta?.icon || BarChart2;
  const editorMode = getChartEditorMode(chart.chartType || "bar");

  const dataTabLabel =
    editorMode === "donut"
      ? "Data & Slices"
      : editorMode === "gauge"
      ? "Value & Target"
      : editorMode === "table"
      ? "Table Grid"
      : editorMode === "heatmap"
      ? "Heatmap Matrix"
      : editorMode === "radar"
      ? "Audit Dimensions"
      : editorMode === "funnel"
      ? "Funnel Stages"
      : "Data & Points";

  // Dynamic responsive scaling based on customHeight and customWidth
  const isUltraCompact = customHeight !== undefined && customHeight < 200;
  const isCompact = (customHeight !== undefined && customHeight < 280) || isUltraCompact;

  const fontSize = style.fontSize || "base";
  const titleSizeClass = isUltraCompact
    ? "text-xs font-bold leading-tight"
    : isCompact
      ? "text-xs sm:text-sm font-bold leading-snug"
      : fontSize === "xs"
        ? "text-xs font-bold"
        : fontSize === "sm"
          ? "text-sm font-bold"
          : fontSize === "lg"
            ? "text-base sm:text-lg font-bold"
            : fontSize === "xl"
              ? "text-lg sm:text-xl font-bold"
              : "text-sm sm:text-base font-bold";

  const descSizeClass = isUltraCompact
    ? "text-[9px] leading-tight line-clamp-1"
    : isCompact
      ? "text-[10px] leading-snug line-clamp-1"
      : fontSize === "xs"
        ? "text-[10px] line-clamp-2"
        : fontSize === "sm"
          ? "text-[11px] line-clamp-2"
          : fontSize === "lg"
            ? "text-xs sm:text-sm line-clamp-2"
            : fontSize === "xl"
              ? "text-sm line-clamp-2"
              : "text-[11px] sm:text-xs leading-relaxed line-clamp-2";

  const pClass = isUltraCompact
    ? "p-2 gap-1"
    : isCompact
      ? "p-2.5 sm:p-3 gap-1.5"
      : "p-4 gap-2";

  // Compute accurate overhead budget so child NEVER overflows the card
  const padOverhead = isUltraCompact ? 16 : isCompact ? 22 : 32;
  const titleOverhead = chart.title ? (isUltraCompact ? 18 : isCompact ? 22 : 28) : 0;
  const descOverhead = chart.description ? (isUltraCompact ? 16 : isCompact ? 20 : 30) : 0;
  const totalOverhead = padOverhead + titleOverhead + descOverhead;

  const chartAreaHeight = customHeight
    ? Math.max(50, customHeight - totalOverhead)
    : undefined;

  const startEdit = (target: "title" | "description") => {
    if (isPreview) return;
    setEditingTarget(target);
    onEditingChange?.(true);
  };

  const finishEdit = () => {
    setEditingTarget(null);
    onEditingChange?.(false);
  };

  const isTransparent = Boolean(chart.isTransparent);

  const containerStyle: React.CSSProperties = {
    height: customHeight ? `${customHeight}px` : "100%",
    maxHeight: "100%",
    width: chart.customWidth ? `${chart.customWidth}px` : "100%",
    backgroundColor: isTransparent ? "transparent" : (chart.backgroundColor || undefined),
    borderColor: chart.borderColor || undefined,
    borderWidth: chart.borderWidth !== undefined ? `${chart.borderWidth}px` : undefined,
    borderRadius: chart.borderRadius !== undefined ? `${chart.borderRadius}px` : undefined,
  };

  return (
    <>
      <div
        ref={containerRef}
        style={containerStyle}
        className={`relative group/chart w-full max-h-full transition-all overflow-hidden flex flex-col justify-between ${
          isTransparent
            ? "border-0 shadow-none bg-transparent p-1.5"
            : `rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] ${pClass}`
        }`}
      >
        {/* Configure & Edit Data Button - Clean overlay in top right on hover (if not selected) */}
        {!isPreview && onOpenChartEditor && !isSelected && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenChartEditor();
            }}
            className="absolute top-2.5 right-2.5 z-10 opacity-0 group-hover/chart:opacity-100 transition-opacity flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#9D61FF] text-white hover:bg-purple-600 cursor-pointer shadow-xs"
            title="Configure Chart, Data Points & Axis"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>Edit Data</span>
          </button>
        )}

        {/* Chart Title */}
        <div className="flex items-start justify-between gap-3 flex-shrink-0 pr-16 min-h-[20px]">
          <div className="min-w-0 flex-1">
            {!isPreview && editingTarget === "title" ? (
              <DynamicTextEditor
                initialValue={chart.title || ""}
                defaultFontSize={isUltraCompact ? 12 : isCompact ? 13 : 14}
                className={titleSizeClass}
                placeholder="Chart Title..."
                onSave={(plain) => {
                  onUpdateChart?.({ ...chart, title: plain });
                  finishEdit();
                }}
                onCancel={finishEdit}
              />
            ) : chart.title ? (
              <h3
                onDoubleClick={(e) => {
                  if (isPreview) return;
                  e.stopPropagation();
                  startEdit("title");
                }}
                title={!isPreview ? "Double-click to edit chart title" : undefined}
                className={`${titleSizeClass} text-slate-900 dark:text-white tracking-tight truncate select-text ${
                  !isPreview ? "cursor-text hover:text-[#9D61FF] transition-colors hover:underline hover:decoration-dotted" : ""
                }`}
              >
                {chart.title}
              </h3>
            ) : !isPreview ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  startEdit("title");
                }}
                className="text-[11px] text-slate-400 hover:text-[#9D61FF] italic flex items-center gap-1 cursor-pointer opacity-30 group-hover/chart:opacity-100 transition-opacity"
              >
                <Plus className="w-2.5 h-2.5" />
                <span>Add chart title</span>
              </button>
            ) : null}
          </div>
        </div>

        {/* Chart Render Area */}
        <div className="flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden py-0.5">
          <ChartRenderer
            chart={chart}
            color={chart.color || chart.colors?.[0]}
            colors={chart.colors}
            gridRows={chart.gridRows}
            gridCols={chart.gridCols}
            height={chartAreaHeight}
            fontSize={fontSize}
            customFontSize={style.customFontSize}
          />
        </div>

        {/* Chart Description / Caption */}
        {!isPreview && editingTarget === "description" ? (
          <div className="pt-1 border-t border-slate-100 dark:border-zinc-800/80 flex-shrink-0">
            <DynamicTextEditor
              initialValue={chart.description || ""}
              defaultFontSize={isCompact ? 10 : 11}
              className={descSizeClass}
              placeholder="Chart description / explanatory note..."
              onSave={(plain) => {
                onUpdateChart?.({ ...chart, description: plain });
                finishEdit();
              }}
              onCancel={finishEdit}
            />
          </div>
        ) : chart.description ? (
          <p
            onDoubleClick={(e) => {
              if (isPreview) return;
              e.stopPropagation();
              startEdit("description");
            }}
            title={!isPreview ? "Double-click to edit description" : undefined}
            className={`${descSizeClass} text-slate-500 dark:text-zinc-400 ${
              isCompact ? "pt-1" : "pt-1.5"
            } border-t border-slate-100 dark:border-zinc-800/80 leading-relaxed flex-shrink-0 select-text ${
              !isPreview ? "cursor-text hover:text-[#9D61FF] transition-colors hover:underline hover:decoration-dotted" : ""
            }`}
          >
            {chart.description}
          </p>
        ) : !isPreview && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              startEdit("description");
            }}
            className="text-[9.5px] text-slate-400 hover:text-[#9D61FF] italic cursor-pointer self-start opacity-0 group-hover/chart:opacity-60 hover:opacity-100 transition-opacity pt-0.5 border-t border-transparent hover:border-slate-100"
          >
            + Add caption
          </button>
        )}
      </div>

      {/* ── React Portal: Floating Top Action Bar for Chart Block ── */}
      {isSelected && !isPreview && portalCoords && typeof document !== "undefined" &&
        createPortal(
          <div
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              top: `${portalCoords.top}px`,
              left: `${portalCoords.left}px`,
              transform: "translateX(-50%)",
              zIndex: 99999,
            }}
            className="portal-chart-topbar flex items-center gap-1.5 bg-white/98 dark:bg-[#0c1017]/98 border border-slate-200 dark:border-zinc-800 rounded-full px-2.5 py-1 shadow-2xl backdrop-blur-md text-xs select-none pointer-events-auto whitespace-nowrap animate-in fade-in zoom-in-95 duration-100"
          >
            <span className="text-[10px] font-mono font-bold text-[#9D61FF] px-2 py-0.5 rounded-full bg-[#9D61FF]/10 flex items-center gap-1">
              <ChartIcon className="w-2.5 h-2.5" />
              <span>{chartTypeLabel}</span>
            </span>

            {/* Chart Type & Colors Inspector Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (isInspectorOpen && inspectorTab === "chart") {
                  setIsInspectorOpen(false);
                } else {
                  setInspectorTab("chart");
                  setIsInspectorOpen(true);
                }
              }}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold transition-all cursor-pointer ${
                isInspectorOpen && inspectorTab === "chart"
                  ? "bg-[#9D61FF] text-white shadow-xs"
                  : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Pencil className="w-2.5 h-2.5" />
              <span>Type & Colors</span>
            </button>

            {/* Data & Points Inspector Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (isInspectorOpen && inspectorTab === "data") {
                  setIsInspectorOpen(false);
                } else {
                  setInspectorTab("data");
                  setIsInspectorOpen(true);
                }
              }}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold transition-all cursor-pointer ${
                isInspectorOpen && inspectorTab === "data"
                  ? "bg-[#9D61FF] text-white shadow-xs"
                  : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Layers className="w-2.5 h-2.5" />
              <span>{dataTabLabel}</span>
            </button>

            {/* Layout & Frame Inspector Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (isInspectorOpen && inspectorTab === "layout") {
                  setIsInspectorOpen(false);
                } else {
                  setInspectorTab("layout");
                  setIsInspectorOpen(true);
                }
              }}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold transition-all cursor-pointer ${
                isInspectorOpen && inspectorTab === "layout"
                  ? "bg-[#9D61FF] text-white shadow-xs"
                  : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
              }`}
            >
              <SlidersHorizontal className="w-2.5 h-2.5" />
              <span>Layout & Frame</span>
            </button>

            {/* Comprehensive Data Points & Axis Modal Editor */}
            {onOpenChartEditor && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenChartEditor();
                }}
                className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/10 hover:bg-purple-500/20 text-[#9D61FF] border border-[#9D61FF]/20 text-[10.5px] font-bold transition-all cursor-pointer shadow-2xs"
                title="Open comprehensive dataset, series and axis editor"
              >
                <ExternalLink className="w-2.5 h-2.5" />
                <span>Full Modal</span>
              </button>
            )}
          </div>,
          document.body
        )}

      {/* ── Floating Inspector Popover Portal ── */}
      {isInspectorOpen && !isPreview && (
        <ChartInspectorPopover
          chart={chart}
          activeTab={inspectorTab}
          onTabChange={setInspectorTab}
          isOpen={isInspectorOpen}
          anchorRect={anchorRect}
          onClose={() => setIsInspectorOpen(false)}
          onUpdateChart={(patch) => {
            if (onUpdateChart) {
              onUpdateChart({ ...chart, ...patch });
            }
          }}
          onOpenFullEditor={onOpenChartEditor}
        />
      )}
    </>
  );
}

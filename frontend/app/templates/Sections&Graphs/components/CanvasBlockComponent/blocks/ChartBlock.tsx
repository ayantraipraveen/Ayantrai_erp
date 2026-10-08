import React, { useState, useEffect } from "react";
import { SlidersHorizontal } from "lucide-react";
import { CanvasCell, LibraryChartCard } from "@/lib/redux/slices/reportModuleSlice";
import ChartRenderer from "../../ChartComponent/ChartRenderer";

export interface ChartBlockProps {
  cell: CanvasCell;
  isPreview?: boolean;
  onOpenChartEditor?: () => void;
  onUpdateChart?: (chart: LibraryChartCard) => void;
  onEditingChange?: (isEditing: boolean) => void;
}

export function ChartBlock({
  cell,
  isPreview,
  onOpenChartEditor,
  onUpdateChart,
  onEditingChange,
}: ChartBlockProps) {
  const chart = cell.chart;
  if (!chart) return null;
  const customHeight = cell.customHeight;
  const style = cell.style || {};

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

  const hasTitle = Boolean(chart.title && chart.title.trim());
  const pClass = isUltraCompact
    ? "p-2 gap-1"
    : isCompact
      ? "p-2.5 sm:p-3 gap-1.5"
      : "p-4 gap-2";

  // Compute accurate overhead budget so child NEVER overflows the card
  const padOverhead = isUltraCompact ? 16 : isCompact ? 22 : 32;
  const titleOverhead = hasTitle ? (isUltraCompact ? 18 : isCompact ? 22 : 28) : 0;
  const descOverhead = chart.description ? (isUltraCompact ? 16 : isCompact ? 20 : 30) : 0;
  const totalOverhead = padOverhead + titleOverhead + descOverhead;

  const chartAreaHeight = customHeight
    ? Math.max(50, customHeight - totalOverhead)
    : undefined;

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [localTitle, setLocalTitle] = useState(chart.title || "");
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [localDesc, setLocalDesc] = useState(chart.description || "");

  const handleSetEditingTitle = (editing: boolean) => {
    setIsEditingTitle(editing);
    onEditingChange?.(editing || isEditingDesc);
  };

  const handleSetEditingDesc = (editing: boolean) => {
    setIsEditingDesc(editing);
    onEditingChange?.(isEditingTitle || editing);
  };

  useEffect(() => {
    setLocalTitle(chart.title || "");
  }, [chart.title]);

  useEffect(() => {
    setLocalDesc(chart.description || "");
  }, [chart.description]);

  const handleTitleCommit = () => {
    handleSetEditingTitle(false);
    const trimmed = localTitle.trim();
    if (trimmed !== (chart.title || "").trim() && onUpdateChart) {
      onUpdateChart({ ...chart, title: trimmed });
    }
  };

  const handleDescCommit = () => {
    handleSetEditingDesc(false);
    const trimmed = localDesc.trim();
    if (trimmed !== (chart.description || "").trim() && onUpdateChart) {
      onUpdateChart({ ...chart, description: trimmed });
    }
  };

  return (
    <div
      style={customHeight ? { height: `${customHeight}px`, maxHeight: "100%" } : { maxHeight: "100%" }}
      className={`relative group/chart w-full max-h-full rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] ${pClass} flex flex-col justify-between overflow-hidden`}
    >
      {/* Configure & Edit Data Button - Clean overlay in top right on hover */}
      {!isPreview && onOpenChartEditor && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenChartEditor();
          }}
          className="absolute top-2.5 right-2.5 z-10 opacity-0 group-hover/chart:opacity-100 transition-opacity flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#9D61FF] text-white hover:bg-purple-600 cursor-pointer"
          title="Configure Chart, Data Points & Axis"
        >
          <SlidersHorizontal className="w-3 h-3" />
          <span>Edit Data</span>
        </button>
      )}

      {/* Chart Title (if present or currently editing) */}
      {(hasTitle || (isEditingTitle && !isPreview)) && (
        <div className="flex items-start justify-between gap-3 flex-shrink-0 pr-16">
          <div className="min-w-0 flex-1">
            {isEditingTitle && !isPreview ? (
              <input
                type="text"
                autoFocus
                value={localTitle}
                onChange={(e) => setLocalTitle(e.target.value)}
                onBlur={handleTitleCommit}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === "Enter") handleTitleCommit();
                  if (e.key === "Escape") {
                    setLocalTitle(chart.title || "");
                    handleSetEditingTitle(false);
                  }
                }}
                className={`${titleSizeClass} text-slate-900 dark:text-white bg-purple-500/10 border border-[#9D61FF] rounded px-1.5 py-0.5 outline-none w-full`}
              />
            ) : (
              <h3
                onDoubleClick={() => !isPreview && handleSetEditingTitle(true)}
                title={!isPreview ? "Double click to rename or clear chart title" : undefined}
                className={`${titleSizeClass} text-slate-900 dark:text-white tracking-tight truncate ${!isPreview ? "cursor-text hover:text-[#9D61FF] transition-colors" : ""
                  }`}
              >
                {chart.title}
              </h3>
            )}
          </div>
        </div>
      )}

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
      {chart.description && (
        isEditingDesc && !isPreview ? (
          <input
            type="text"
            autoFocus
            value={localDesc}
            onChange={(e) => setLocalDesc(e.target.value)}
            onBlur={handleDescCommit}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Enter") handleDescCommit();
              if (e.key === "Escape") {
                setLocalDesc(chart.description || "");
                handleSetEditingDesc(false);
              }
            }}
            className={`${descSizeClass} font-medium text-slate-700 dark:text-zinc-300 bg-purple-500/10 border border-[#9D61FF] rounded px-1.5 py-0.5 outline-none w-full`}
          />
        ) : (
          <p
            onDoubleClick={() => !isPreview && handleSetEditingDesc(true)}
            title={!isPreview ? "Double click to edit description / caption" : undefined}
            className={`${descSizeClass} text-slate-500 dark:text-zinc-400 ${isCompact ? "pt-1" : "pt-1.5"} border-t border-slate-100 dark:border-zinc-800/80 leading-relaxed flex-shrink-0 ${!isPreview ? "cursor-text hover:text-[#9D61FF] transition-colors" : ""
              }`}
          >
            {chart.description}
          </p>
        )
      )}
    </div>
  );
}

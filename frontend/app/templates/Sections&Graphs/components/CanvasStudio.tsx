"use client";

import React, { useCallback, useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  pointerWithin,
  rectIntersection,
  DragOverlay,
  UniqueIdentifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus,
  Trash2,
  Copy,
  Edit2,
  Check,
  GripVertical,
  ChevronDown,
  ChevronUp,
  X,
  Move,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Eye,
  Grid,
  Square,
  Sparkles,
  Layers,
  Stamp,
  Sliders,
  FileText,
} from "lucide-react";
import { useDispatch } from "react-redux";
import {
  CanvasRow,
  CanvasCell,
  CanvasBadgeStrip,
  CanvasBadgeItem,
  CanvasBlockType,
  LibrarySection,
  LibraryMetricCard,
  updateLibrarySection,
  addCanvasRow,
  addRowWithCell,
  toggleRowPageBreak,
  removeCanvasRow,
  addCellToRow,
  moveCellBetweenRows,
  reorderCellsInRow,
  reorderCanvasRows,
  duplicateCanvasCell,
  deleteCanvasCell,
  updateCellColSpan,
  updateCellWidth,
  updateCellHeight,
  showGlobalToast,
} from "@/lib/redux/slices/reportModuleSlice";
import { CanvasBlockRenderer } from "./CanvasBlockRenderer";
import { UploadedSvgWatermark, WatermarkStampConfig } from "./watermarkStorage";
import { SidebarAddBlockEvent } from "./CanvasSidebar";
import {
  DEFAULT_CANVAS_MARGIN,
  CanvasMarginConfig,
  getPaperToneColor,
} from "./CanvasContextRibbon";

// ─── Standard Physical A4 Dimensions at 96 DPI ────────────────────────────────
export const A4_WIDTH_PX = 794;
export const A4_HEIGHT_PX = 1123;

// ─── Mathematical fluid width formula for flex-wrap row with gap: 16px ────────
export function getCellWidthStyle(percent: number): string {
  const p = Math.max(15, Math.min(100, Math.round(percent)));
  if (p >= 100) return "100%";
  const gapSub = (16 * (100 - p)) / 100;
  return `calc(${p}% - ${gapSub.toFixed(1)}px)`;
}

// ─── Predictive Row Height Estimation (Calibrated for Standard 1123px A4) ──────
export function estimateRowHeight(row: CanvasRow): number {
  if (!row.cells || row.cells.length === 0) return 80;

  // Track flex-wrap line progression based on cumulative customWidth percentages
  let currentLineWidth = 0;
  let currentLineMaxHeight = 0;
  let totalCalculatedHeight = 0;

  for (const cell of row.cells) {
    let h = cell.customHeight || 90;
    if (!cell.customHeight) {
      switch (cell.blockType) {
        case "chart":
          // Chart card: 40px padding + 32px header + 260px chart area + description + margins
          h = cell.chart?.description ? 395 : 370;
          break;
        case "metric-card":
          // Metric card: 32px padding + label + 2xl value + trend badge
          h = 135;
          break;
        case "badge-strip":
          // 4-badge strip: 28px padding + 88px badges
          h = 140;
          break;
        case "insight":
          // Key insight card: 32px padding + icon badge + text
          h = 110;
          break;
        case "text": {
          // Rich text block with multiline awareness
          const lines = (cell.textBlock?.content || "").split("\n").length;
          h = Math.max(90, 60 + lines * 20);
          break;
        }
        case "divider":
          h = 32;
          break;
        default:
          h = 100;
      }
    }

    const cellWidth = cell.customWidth ?? (cell.colSpan ? cell.colSpan * 25 : 100);

    // If flex-wrap wraps into a new line (exceeds 105% allowing for slight margin rounding)
    if (currentLineWidth + cellWidth > 105 && currentLineWidth > 0) {
      totalCalculatedHeight += currentLineMaxHeight + 12; // 12px flex line gap
      currentLineWidth = cellWidth;
      currentLineMaxHeight = h;
    } else {
      currentLineWidth += cellWidth;
      if (h > currentLineMaxHeight) currentLineMaxHeight = h;
    }
  }

  totalCalculatedHeight += currentLineMaxHeight;
  return totalCalculatedHeight + 16; // 16px row margins & drop zone
}

// ─── Multi-Page Partitioning Algorithm (Standard A4 1123px Limit) ─────────────
export interface PagePartition {
  pageIndex: number;
  pageNumber: number;
  rows: CanvasRow[];
  isFirstPage: boolean;
  isLastPage: boolean;
  usedHeight: number;
  maxCapacity: number;
}

export function partitionCanvasPages(
  rows: CanvasRow[],
  marginConfig: CanvasMarginConfig = DEFAULT_CANVAS_MARGIN,
  startPageNumber: number = 1
): PagePartition[] {
  const page1MarginY = (marginConfig?.top ?? 24) + (marginConfig?.bottom ?? 24);

  // Exact physical A4 sheet height: 1123px at standard 96 DPI
  // Safe capacities strictly calibrated to standard A4 height to prevent clipping:
  // Page 1 (Single-page report): Header (130px) + Section Title Bar (~90px) + Margins (~48px) + Full Footer (~92px) + Controls (~42px) + Buffer (~35px)
  const capPage1Single = Math.max(500, Math.min(680, A4_HEIGHT_PX - page1MarginY - 130 - 90 - 92 - 42 - 35));
  
  // Page 1 (Multi-page report): Header (130px) + Section Title Bar (~90px) + Margins (~48px) + Running Footer (~32px) + Controls (~42px) + Buffer (~35px)
  const capPage1Multi = Math.max(550, Math.min(700, A4_HEIGHT_PX - page1MarginY - 130 - 90 - 32 - 42 - 35));

  // Continuation Pages (Middle): Compact Header (~64px) + Margins (~40px) + Running Footer (~32px) + Controls (~42px) + Buffer (~30px)
  const capMiddlePage = Math.max(650, Math.min(860, A4_HEIGHT_PX - 40 - 64 - 32 - 42 - 30));

  // Last Page (Multi-page report): Compact Header (~64px) + Margins (~40px) + Full Footer (~92px) + Controls (~42px) + Buffer (~30px)
  const capLastPage = Math.max(600, Math.min(800, A4_HEIGHT_PX - 40 - 64 - 92 - 42 - 30));

  if (rows.length === 0) {
    return [
      {
        pageIndex: 0,
        pageNumber: startPageNumber,
        rows: [],
        isFirstPage: true,
        isLastPage: true,
        usedHeight: 0,
        maxCapacity: capPage1Single,
      },
    ];
  }

  const rowHeights = rows.map((r) => estimateRowHeight(r));
  const totalRowHeight = rowHeights.reduce((a, b) => a + b, 0);

  // Check if everything fits on a single page with footer and without forced page break
  const hasForcedPageBreak = rows.some((r, i) => i > 0 && r.pageBreakBefore);
  if (!hasForcedPageBreak && totalRowHeight <= capPage1Single) {
    return [
      {
        pageIndex: 0,
        pageNumber: startPageNumber,
        rows: [...rows],
        isFirstPage: true,
        isLastPage: true,
        usedHeight: totalRowHeight,
        maxCapacity: capPage1Single,
      },
    ];
  }

  // Multi-page distribution
  const pages: PagePartition[] = [];
  let currentPageRows: CanvasRow[] = [];
  let currentUsedHeight = 0;
  let currentPageIndex = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rHeight = rowHeights[i];
    const isFirstPage = currentPageIndex === 0;
    const currentLimit = isFirstPage ? capPage1Multi : capMiddlePage;
    const isForcedBreak = i > 0 && Boolean(row.pageBreakBefore);

    if (
      currentPageRows.length > 0 &&
      (isForcedBreak || currentUsedHeight + rHeight > currentLimit)
    ) {
      pages.push({
        pageIndex: currentPageIndex,
        pageNumber: startPageNumber + currentPageIndex,
        rows: currentPageRows,
        isFirstPage: currentPageIndex === 0,
        isLastPage: false,
        usedHeight: currentUsedHeight,
        maxCapacity: currentLimit,
      });

      currentPageIndex++;
      currentPageRows = [row];
      currentUsedHeight = rHeight;
    } else {
      currentPageRows.push(row);
      currentUsedHeight += rHeight;
    }
  }

  if (currentPageRows.length > 0 || pages.length === 0) {
    pages.push({
      pageIndex: currentPageIndex,
      pageNumber: startPageNumber + currentPageIndex,
      rows: currentPageRows,
      isFirstPage: currentPageIndex === 0,
      isLastPage: true,
      usedHeight: currentUsedHeight,
      maxCapacity: currentPageIndex === 0 ? capPage1Single : capLastPage,
    });
  }

  if (pages.length > 0) {
    pages[pages.length - 1].isLastPage = true;
  }

  return pages;
}


// ─── Drop Insertion Zone (Between Rows) ───────────────────────────────────────
function DropInsertZone({
  insertIndex,
  onAddRow,
  onDropBlock,
  label = "Insert Row Here",
}: {
  insertIndex: number;
  onAddRow?: (index: number) => void;
  onDropBlock?: (e: SidebarAddBlockEvent) => void;
  label?: string;
}) {
  const [isOver, setIsOver] = useState(false);

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        if (typeof onAddRow === "function") {
          onAddRow(insertIndex);
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = "copy";
        if (!isOver) setIsOver(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOver(false);
        try {
          const raw = e.dataTransfer.getData("application/json");
          if (!raw) return;
          const data: SidebarAddBlockEvent = JSON.parse(raw);
          if (onDropBlock) {
            onDropBlock({ ...data, insertRowAtIndex: insertIndex });
          }
        } catch (err) {
          console.error("DropInsertZone error:", err);
        }
      }}
      className={`group/dropzone relative w-full rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer select-none ${
        isOver
          ? "h-12 my-2.5 bg-gradient-to-r from-purple-500/15 via-[#9D61FF]/25 to-purple-500/15 border-2 border-dashed border-[#9D61FF] shadow-[0_0_20px_rgba(157,97,255,0.4)] scale-[1.01]"
          : "h-3 my-0.5 hover:h-8 hover:my-1.5"
      }`}
      title="Click to insert new row here, or drag a block from sidebar"
    >
      {/* Active Drag Over Indicator */}
      {isOver ? (
        <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#8B3DFF] dark:text-[#c49aff] animate-pulse">
          <Plus className="w-4 h-4" />
          <span>{label}</span>
        </div>
      ) : (
        /* Sleek Canva / Notion Style Hover Line with Centered "+ New Row" Button */
        <div className="w-full flex items-center justify-center opacity-0 group-hover/dropzone:opacity-100 transition-opacity pointer-events-auto">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#8B3DFF]/40 to-[#8B3DFF]/70" />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (typeof onAddRow === "function") {
                onAddRow(insertIndex);
              }
            }}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#8B3DFF] hover:bg-[#7828ea] text-white text-[10.5px] font-bold shadow-md hover:shadow-lg transition-all scale-95 hover:scale-105 cursor-pointer"
          >
            <Plus className="w-3 h-3 stroke-[2.5]" />
            <span>New Row</span>
          </button>
          <div className="flex-1 h-px bg-gradient-to-r from-[#8B3DFF]/70 via-[#8B3DFF]/40 to-transparent" />
        </div>
      )}
    </div>
  );
}

// ─── Page Add Row Drop Zone ───────────────────────────────────────────────────
function PageAddRowDropZone({
  pageNumber,
  insertIndex,
  onAddRow,
  onDropBlock,
}: {
  pageNumber: number;
  insertIndex: number;
  onAddRow: () => void;
  onDropBlock?: (e: SidebarAddBlockEvent) => void;
}) {
  const [isOver, setIsOver] = useState(false);

  return (
    <button
      type="button"
      onClick={onAddRow}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = "copy";
        if (!isOver) setIsOver(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOver(false);
        try {
          const raw = e.dataTransfer.getData("application/json");
          if (!raw) return;
          const data: SidebarAddBlockEvent = JSON.parse(raw);
          if (onDropBlock) {
            onDropBlock({ ...data, insertRowAtIndex: insertIndex });
          }
        } catch (err) {
          console.error("PageAddRowDropZone error:", err);
        }
      }}
      className={`flex-1 py-2.5 rounded-xl border border-dashed transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs font-bold ${
        isOver
          ? "border-2 border-[#9D61FF] bg-[#9D61FF]/15 text-[#8B3DFF] dark:text-[#c49aff] shadow-md scale-[1.01]"
          : "border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-500 hover:border-[#8B3DFF]/50 hover:text-[#8B3DFF] hover:bg-[#8B3DFF]/5"
      }`}
    >
      <Plus className={`w-3.5 h-3.5 ${isOver ? "animate-pulse" : ""}`} />
      <span>{isOver ? `Drop to add row to Page ${pageNumber}` : `Add Row to Page ${pageNumber}`}</span>
    </button>
  );
}

// ─── Sortable Cell ────────────────────────────────────────────────────────────
interface SortableCellProps {
  sectionId: string;
  rowId: string;
  cell: CanvasCell;
  isSelected: boolean;
  isPreview?: boolean;
  onSelect?: (cellId: string, rowId: string) => void;
  onEdit: (cell: CanvasCell, rowId: string) => void;
  onDuplicate: (cellId: string, rowId: string) => void;
  onDelete: (cellId: string, rowId: string) => void;
  onColSpanChange?: (cellId: string, rowId: string, span: 1 | 2 | 3 | 4) => void;
  onWidthChange?: (cellId: string, rowId: string, customWidth: number) => void;
  onHeightChange?: (cellId: string, rowId: string, customHeight?: number) => void;
  onUpdateMetricCard?: (rowId: string, cellId: string, card: LibraryMetricCard) => void;
  onUpdateInsight?: (rowId: string, cellId: string, text: string) => void;
  onUpdateTextBlock?: (rowId: string, cellId: string, content: string) => void;
  onUpdateBadgeStrip?: (rowId: string, cellId: string, strip: CanvasBadgeStrip) => void;
  onUpdateSingleBadge?: (rowId: string, cellId: string, badgeId: string, patch: Partial<CanvasBadgeItem>) => void;
  onAddBadge?: (rowId: string, cellId: string) => void;
  onDeleteBadge?: (rowId: string, cellId: string, badgeId: string) => void;
  isDraggingOverlay?: boolean;
  cellIndex?: number;
  totalCellsInRow?: number;
}

function SortableCell({
  sectionId,
  rowId,
  cell,
  isSelected,
  isPreview = false,
  onSelect,
  onEdit,
  onDuplicate,
  onDelete,
  onColSpanChange,
  onWidthChange,
  onHeightChange,
  onUpdateMetricCard,
  onUpdateInsight,
  onUpdateTextBlock,
  onUpdateBadgeStrip,
  onUpdateSingleBadge,
  onAddBadge,
  onDeleteBadge,
  isDraggingOverlay = false,
  cellIndex,
  totalCellsInRow,
}: SortableCellProps) {
  const isFirstInRow = cellIndex === 0;
  const isLastInRow = typeof totalCellsInRow === "number" && totalCellsInRow > 1 && cellIndex === totalCellsInRow - 1;
  const toolbarPlacementClass = isFirstInRow
    ? "left-0"
    : isLastInRow
    ? "right-0"
    : (cell.customWidth ?? (cell.colSpan * 25)) <= 35
    ? "left-0"
    : "right-0";

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: cell.id, data: { rowId, cell }, disabled: isPreview });

  const defaultWidthForCount = totalCellsInRow && totalCellsInRow > 0
    ? totalCellsInRow === 1 ? 100 : totalCellsInRow === 2 ? 50 : totalCellsInRow === 3 ? 33.3 : 25
    : 100;
  const initialPercent = cell.customWidth ?? (cell.colSpan ? cell.colSpan * 25 : defaultWidthForCount);
  const [isResizing, setIsResizing] = useState(false);
  const [resizePercent, setResizePercent] = useState<number>(initialPercent);

  const initialHeight = cell.customHeight;
  const [isHeightResizing, setIsHeightResizing] = useState(false);
  const [resizeHeight, setResizeHeight] = useState<number | undefined>(initialHeight);
  const cellDomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setResizePercent(cell.customWidth ?? (cell.colSpan ? cell.colSpan * 25 : defaultWidthForCount));
  }, [cell.customWidth, cell.colSpan, defaultWidthForCount]);

  useEffect(() => {
    setResizeHeight(cell.customHeight);
  }, [cell.customHeight]);

  const currentPercent = isResizing ? resizePercent : (cell.customWidth ?? (cell.colSpan ? cell.colSpan * 25 : defaultWidthForCount));
  const currentHeight = isHeightResizing ? resizeHeight : cell.customHeight;
  const widthStyle = getCellWidthStyle(currentPercent);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);

    const startX = e.clientX;
    const parentRow = cellDomRef.current?.closest(".canvas-row-cells");
    const parentWidth = parentRow ? parentRow.getBoundingClientRect().width : 740;
    const startPercent = currentPercent;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaPercent = (deltaX / parentWidth) * 100;
      const newPercent = Math.min(100, Math.max(15, Math.round(startPercent + deltaPercent)));
      setResizePercent(newPercent);
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      setIsResizing(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);

      const deltaX = upEvent.clientX - startX;
      const deltaPercent = (deltaX / parentWidth) * 100;
      const finalPercent = Math.min(100, Math.max(15, Math.round(startPercent + deltaPercent)));
      setResizePercent(finalPercent);

      let colSpan: 1 | 2 | 3 | 4 = 1;
      if (finalPercent >= 85) colSpan = 4;
      else if (finalPercent >= 60) colSpan = 3;
      else if (finalPercent >= 38) colSpan = 2;
      else colSpan = 1;

      if (typeof onColSpanChange === "function") {
        onColSpanChange(cell.id, rowId, colSpan);
      }
      if (typeof onWidthChange === "function") {
        onWidthChange(cell.id, rowId, finalPercent);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleHeightResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsHeightResizing(true);

    const startY = e.clientY;
    const startH = cellDomRef.current?.getBoundingClientRect().height || currentHeight || 300;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const newH = Math.min(800, Math.max(80, Math.round(startH + deltaY)));
      setResizeHeight(newH);
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      setIsHeightResizing(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);

      const deltaY = upEvent.clientY - startY;
      const finalH = Math.min(800, Math.max(80, Math.round(startH + deltaY)));
      setResizeHeight(finalH);

      if (typeof onHeightChange === "function") {
        onHeightChange(cell.id, rowId, finalH);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleCornerResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    setIsHeightResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const parentRow = cellDomRef.current?.closest(".canvas-row-cells");
    const parentWidth = parentRow ? parentRow.getBoundingClientRect().width : 740;
    const startPercent = currentPercent;
    const startH = cellDomRef.current?.getBoundingClientRect().height || currentHeight || 300;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaPercent = (deltaX / parentWidth) * 100;
      const newPercent = Math.min(100, Math.max(15, Math.round(startPercent + deltaPercent)));
      setResizePercent(newPercent);

      const deltaY = moveEvent.clientY - startY;
      const newH = Math.min(800, Math.max(80, Math.round(startH + deltaY)));
      setResizeHeight(newH);
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      setIsResizing(false);
      setIsHeightResizing(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);

      const deltaX = upEvent.clientX - startX;
      const deltaPercent = (deltaX / parentWidth) * 100;
      const finalPercent = Math.min(100, Math.max(15, Math.round(startPercent + deltaPercent)));
      setResizePercent(finalPercent);

      const deltaY = upEvent.clientY - startY;
      const finalH = Math.min(800, Math.max(80, Math.round(startH + deltaY)));
      setResizeHeight(finalH);

      let colSpan: 1 | 2 | 3 | 4 = 1;
      if (finalPercent >= 85) colSpan = 4;
      else if (finalPercent >= 60) colSpan = 3;
      else if (finalPercent >= 38) colSpan = 2;
      else colSpan = 1;

      if (typeof onColSpanChange === "function") {
        onColSpanChange(cell.id, rowId, colSpan);
      }
      if (typeof onWidthChange === "function") {
        onWidthChange(cell.id, rowId, finalPercent);
      }
      if (typeof onHeightChange === "function") {
        onHeightChange(cell.id, rowId, finalH);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isResizing || isHeightResizing ? "none" : transition,
    opacity: isDragging ? 0.25 : 1,
    width: widthStyle,
    maxWidth: widthStyle,
    height: currentHeight ? `${currentHeight}px` : undefined,
    flexShrink: 0,
    flexGrow: 0,
    boxSizing: "border-box",
  };

  return (
    <div
      ref={(el) => {
        setNodeRef(el);
        cellDomRef.current = el;
      }}
      style={style}
      className={`relative group/cell transition-shadow duration-150 flex flex-col ${
        isSelected && !isPreview ? "ring-2 ring-[#8B3DFF] shadow-lg rounded-2xl" : ""
      }`}
      onClick={(e) => {
        e.stopPropagation();
        if (!isPreview && typeof onSelect === "function") {
          onSelect(cell.id, rowId);
        }
      }}
    >
      {/* Draggable cell badge tag */}
      {!isPreview && (
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 z-20 opacity-0 group-hover/cell:opacity-100 transition-opacity bg-black/70 hover:bg-black/90 text-white rounded-md px-1.5 py-0.5 text-[9px] font-mono font-bold flex items-center gap-1 cursor-grab active:cursor-grabbing backdrop-blur-xs shadow-xs"
          title="Drag horizontally to reorder within row"
        >
          <GripVertical className="w-2.5 h-2.5" />
          <span className="capitalize">{cell.blockType.replace("-", " ")}</span>
          <span className="text-purple-300 font-mono">({Math.round(currentPercent)}%)</span>
        </div>
      )}

      {/* Live resizing indicator HUD */}
      {!isPreview && (isResizing || isHeightResizing) && (
        <div className="absolute top-2 right-2 z-40 bg-[#8B3DFF] text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-md shadow-lg pointer-events-none animate-in fade-in zoom-in-95 duration-100 flex items-center gap-1.5">
          {isResizing && <span>W: {Math.round(currentPercent)}%</span>}
          {isResizing && isHeightResizing && <span className="opacity-60">&bull;</span>}
          {isHeightResizing && <span>H: {currentHeight ? `${Math.round(currentHeight)}px` : "Auto"}</span>}
        </div>
      )}

      {/* Resize handle (right edge for width) */}
      {!isPreview && (
        <div
          onMouseDown={handleResizeStart}
          className={`absolute right-0 top-0 bottom-0 w-3 cursor-col-resize z-30 flex items-center justify-center transition-all group/handle ${
            isResizing ? "opacity-100" : "opacity-0 group-hover/cell:opacity-100"
          }`}
          title="Drag horizontally to adjust width freely"
        >
          <div className="w-1 h-8 rounded-full bg-slate-400 dark:bg-zinc-600 group-hover/handle:bg-[#8B3DFF] group-hover/handle:w-1.5 group-hover/handle:h-12 transition-all shadow-xs" />
        </div>
      )}

      {/* Resize handle (bottom edge for height) */}
      {!isPreview && (
        <div
          onMouseDown={handleHeightResizeStart}
          className={`absolute left-0 right-0 -bottom-1.5 h-3 cursor-row-resize z-30 flex items-center justify-center transition-all group/bhandle ${
            isHeightResizing ? "opacity-100" : "opacity-0 group-hover/cell:opacity-100"
          }`}
          title="Drag vertically to adjust height freely (80px - 800px)"
        >
          <div className="h-1 w-12 rounded-full bg-slate-400 dark:bg-zinc-600 group-hover/bhandle:bg-[#8B3DFF] group-hover/bhandle:h-1.5 group-hover/bhandle:w-20 transition-all shadow-xs" />
        </div>
      )}

      {/* Resize handle (bottom-right corner for simultaneous width & height) */}
      {!isPreview && (
        <div
          onMouseDown={handleCornerResizeStart}
          className={`absolute -right-1.5 -bottom-1.5 w-4 h-4 cursor-se-resize z-30 flex items-center justify-center transition-all group/chandle ${
            isResizing || isHeightResizing ? "opacity-100" : "opacity-0 group-hover/cell:opacity-100"
          }`}
          title="Drag corner to adjust width & height simultaneously"
        >
          <div className="w-2.5 h-2.5 rounded-full border-2 border-white dark:border-zinc-900 bg-slate-400 dark:bg-zinc-500 group-hover/chandle:bg-[#8B3DFF] group-hover/chandle:scale-125 transition-all shadow-xs" />
        </div>
      )}

      {/* Floating cell action bar */}
      {!isPreview && (isSelected || isResizing || isHeightResizing) && (
        <div className={`absolute -top-11 ${toolbarPlacementClass} z-40 flex items-center gap-1 bg-white/95 dark:bg-zinc-900/95 border border-slate-200 dark:border-zinc-800 rounded-xl px-2 py-1 shadow-xl backdrop-blur-md text-xs select-none pointer-events-auto whitespace-nowrap`}>
          <div className="flex items-center gap-1 font-mono text-[11px] text-purple-600 dark:text-purple-400 font-bold px-1">
            <span>{Math.round(currentPercent)}%</span>
          </div>

          <div className="flex items-center gap-0.5 border-l border-slate-200 dark:border-zinc-800 pl-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const autoW = defaultWidthForCount;
                setResizePercent(autoW);
                const span = autoW >= 85 ? 4 : autoW >= 60 ? 3 : autoW >= 38 ? 2 : 1;
                if (typeof onColSpanChange === "function") onColSpanChange(cell.id, rowId, span);
                if (typeof onWidthChange === "function") onWidthChange(cell.id, rowId, autoW);
              }}
              className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-[#8B3DFF] hover:bg-[#8B3DFF]/10 transition-colors cursor-pointer"
              title={`Auto-balance width to fit standard A4 row (${defaultWidthForCount}%)`}
            >
              Auto
            </button>
            {[25, 33, 50, 75, 100].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setResizePercent(preset);
                  const span = preset >= 85 ? 4 : preset >= 60 ? 3 : preset >= 38 ? 2 : 1;
                  if (typeof onColSpanChange === "function") onColSpanChange(cell.id, rowId, span);
                  if (typeof onWidthChange === "function") onWidthChange(cell.id, rowId, preset);
                }}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                  Math.abs(currentPercent - preset) <= 3
                    ? "bg-[#8B3DFF] text-white font-bold"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800"
                }`}
              >
                {preset}%
              </button>
            ))}
          </div>

          {/* Height Presets & Steppers */}
          <div className="flex items-center gap-0.5 border-l border-slate-200 dark:border-zinc-800 pl-1.5">
            <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold font-mono pr-0.5">H:</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setResizeHeight(undefined);
                if (typeof onHeightChange === "function") onHeightChange(cell.id, rowId, undefined);
              }}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                !currentHeight
                  ? "bg-[#8B3DFF] text-white font-bold"
                  : "text-[#8B3DFF] hover:bg-[#8B3DFF]/10 font-bold"
              }`}
              title="Auto height (fits content naturally)"
            >
              Auto
            </button>
            {[
              { label: "S", h: 200 },
              { label: "M", h: 300 },
              { label: "L", h: 400 },
            ].map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setResizeHeight(preset.h);
                  if (typeof onHeightChange === "function") onHeightChange(cell.id, rowId, preset.h);
                }}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                  currentHeight && Math.abs(currentHeight - preset.h) <= 15
                    ? "bg-[#8B3DFF] text-white font-bold"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800"
                }`}
                title={`Set height to ${preset.label} (${preset.h}px)`}
              >
                {preset.label}
              </button>
            ))}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const newH = Math.max(80, (currentHeight || 300) - 25);
                setResizeHeight(newH);
                if (typeof onHeightChange === "function") onHeightChange(cell.id, rowId, newH);
              }}
              className="px-1 py-0.5 rounded text-[10px] font-mono text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Decrease height by 25px"
            >
              -
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const newH = Math.min(800, (currentHeight || 300) + 25);
                setResizeHeight(newH);
                if (typeof onHeightChange === "function") onHeightChange(cell.id, rowId, newH);
              }}
              className="px-1 py-0.5 rounded text-[10px] font-mono text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Increase height by 25px"
            >
              +
            </button>
          </div>

          <div className="w-px h-3.5 bg-slate-200 dark:bg-zinc-800 mx-0.5" />

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (typeof onEdit === "function") onEdit(cell, rowId);
            }}
            className="p-1 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer rounded"
            title="Edit block properties"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (typeof onDuplicate === "function") onDuplicate(cell.id, rowId);
            }}
            className="p-1 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer rounded"
            title="Duplicate block (Ctrl+D)"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (typeof onDelete === "function") onDelete(cell.id, rowId);
            }}
            className="p-1 text-slate-500 hover:text-rose-500 transition-colors cursor-pointer rounded"
            title="Delete block (Del)"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Render the actual cell content block */}
      <div className="w-full flex-1 h-full min-h-0">
        <CanvasBlockRenderer
          cell={cell}
          isSelected={isSelected}
          isPreview={isPreview}
          onUpdateMetricCard={(card) => {
            if (typeof onUpdateMetricCard === "function") onUpdateMetricCard(rowId, cell.id, card);
          }}
          onUpdateInsight={(text) => {
            if (typeof onUpdateInsight === "function") onUpdateInsight(rowId, cell.id, text);
          }}
          onUpdateTextBlock={(content) => {
            if (typeof onUpdateTextBlock === "function") onUpdateTextBlock(rowId, cell.id, content);
          }}
          onUpdateBadgeStrip={(strip) => {
            if (typeof onUpdateBadgeStrip === "function") onUpdateBadgeStrip(rowId, cell.id, strip);
          }}
          onUpdateSingleBadge={(badgeId, patch) => {
            if (typeof onUpdateSingleBadge === "function") onUpdateSingleBadge(rowId, cell.id, badgeId, patch);
          }}
          onAddBadge={() => {
            if (typeof onAddBadge === "function") onAddBadge(rowId, cell.id);
          }}
          onDeleteBadge={(badgeId) => {
            if (typeof onDeleteBadge === "function") onDeleteBadge(rowId, cell.id, badgeId);
          }}
        />
      </div>
    </div>
  );
}

// ─── Sortable Row (Canva Row Container) ───────────────────────────────────────
interface SortableRowProps {
  sectionId: string;
  row: CanvasRow;
  selectedCellId?: string | null;
  selectedRowId?: string | null;
  isPreview?: boolean;
  isAutoBreakFirstRow?: boolean;
  currentPageNumber?: number;
  onSelectCell?: (cellId: string | null, rowId: string | null) => void;
  onEditCell: (cell: CanvasCell, rowId: string) => void;
  onDuplicateCell: (cellId: string, rowId: string) => void;
  onDeleteCell: (cellId: string, rowId: string) => void;
  onColSpanChange?: (cellId: string, rowId: string, span: 1 | 2 | 3 | 4) => void;
  onWidthChange?: (cellId: string, rowId: string, customWidth: number) => void;
  onHeightChange?: (cellId: string, rowId: string, customHeight?: number) => void;
  onUpdateMetricCard?: (rowId: string, cellId: string, card: LibraryMetricCard) => void;
  onUpdateInsight?: (rowId: string, cellId: string, text: string) => void;
  onUpdateTextBlock?: (rowId: string, cellId: string, content: string) => void;
  onUpdateBadgeStrip?: (rowId: string, cellId: string, strip: CanvasBadgeStrip) => void;
  onUpdateSingleBadge?: (rowId: string, cellId: string, badgeId: string, patch: Partial<CanvasBadgeItem>) => void;
  onAddBadge?: (rowId: string, cellId: string) => void;
  onDeleteBadge?: (rowId: string, cellId: string, badgeId: string) => void;
  onRemoveRow: (rowId: string) => void;
  onTogglePageBreak?: (rowId: string) => void;
  onDropBlock?: (e: SidebarAddBlockEvent) => void;
}

function SortableRow({
  sectionId,
  row,
  selectedCellId,
  selectedRowId,
  isPreview = false,
  isAutoBreakFirstRow = false,
  currentPageNumber = 1,
  onSelectCell,
  onEditCell,
  onDuplicateCell,
  onDeleteCell,
  onColSpanChange,
  onWidthChange,
  onHeightChange,
  onUpdateMetricCard,
  onUpdateInsight,
  onUpdateTextBlock,
  onUpdateBadgeStrip,
  onUpdateSingleBadge,
  onAddBadge,
  onDeleteBadge,
  onRemoveRow,
  onTogglePageBreak,
  onDropBlock,
}: SortableRowProps) {
  const [isDragOverRow, setIsDragOverRow] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.id, data: { isRow: true, row, rowId: row.id }, disabled: isPreview });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const isRowSelected = selectedRowId === row.id;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group/row transition-all duration-150 ${
        isRowSelected && !isPreview ? "ring-1 ring-purple-300/40 rounded-2xl" : ""
      }`}
      onClick={() => {
        if (!isPreview && typeof onSelectCell === "function") {
          onSelectCell(null, row.id);
        }
      }}
    >
      {/* Forced Page Break visual marker */}
      {row.pageBreakBefore && !isPreview && (
        <div className="flex items-center gap-2 -mt-1 mb-2 text-[10px] font-mono text-[#8B3DFF]">
          <Layers className="w-3 h-3" />
          <span className="font-bold uppercase tracking-wider">Manual Page Break (Starts on New Page)</span>
          <div className="flex-1 border-t border-dashed border-[#8B3DFF]/40" />
        </div>
      )}

      {/* Auto Page Break visual marker (Triggered by standard A4 height 1123px) */}
      {isAutoBreakFirstRow && !isPreview && (
        <div className="flex items-center gap-2 -mt-1 mb-2.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/60 text-[10px] font-mono text-purple-700 dark:text-purple-300 shadow-xs">
          <Layers className="w-3.5 h-3.5 text-[#8B3DFF] flex-shrink-0 animate-pulse" />
          <span className="font-bold uppercase tracking-wider">AUTO PAGE BREAK APPLIED</span>
          <span className="text-purple-300 dark:text-purple-700">&bull;</span>
          <span className="text-slate-600 dark:text-zinc-300 font-sans font-medium">Standard A4 Height Limit (1123px) &bull; Moved to Page {currentPageNumber}</span>
          <div className="flex-1 border-t border-dashed border-purple-300 dark:border-purple-700/60" />
        </div>
      )}

      {/* Row Control Strip */}
      {!isPreview && (
        <div className="absolute -top-3.5 right-2 opacity-0 group-hover/row:opacity-100 transition-opacity z-30 flex items-center gap-1 bg-white/95 dark:bg-zinc-900/95 border border-slate-200 dark:border-zinc-800 rounded-lg px-1.5 py-0.5 shadow-sm text-[10px] text-slate-500 backdrop-blur-sm">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-0.5 hover:text-slate-800 dark:hover:text-white"
            title="Drag row order"
          >
            <GripVertical className="w-3 h-3" />
          </div>
          <span className="font-mono text-[9px] text-slate-400">Row</span>

          {onTogglePageBreak && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onTogglePageBreak(row.id);
              }}
              className={`p-0.5 rounded cursor-pointer transition-colors ${
                row.pageBreakBefore
                  ? "text-[#8B3DFF] bg-purple-500/15 font-bold"
                  : "hover:text-[#8B3DFF]"
              }`}
              title={
                row.pageBreakBefore
                  ? "Remove forced page break before this row"
                  : "Force this row onto a new page (Page Break)"
              }
            >
              <Layers className="w-3 h-3" />
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemoveRow(row.id);
            }}
            className="p-0.5 hover:text-rose-500 rounded cursor-pointer"
            title="Delete this row"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Row Container */}
      <SortableContext
        items={row.cells.map((c) => c.id)}
        strategy={rectSortingStrategy}
        disabled={isPreview}
      >
        <div
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = "copy";
            if (!isDragOverRow) setIsDragOverRow(true);
          }}
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              setIsDragOverRow(false);
            }
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragOverRow(false);
            try {
              const raw = e.dataTransfer.getData("application/json");
              if (!raw) return;
              const data = JSON.parse(raw);
              if (onDropBlock) {
                onDropBlock({ ...data, targetRowId: row.id });
              }
            } catch (err) {
              console.error("Row drop error:", err);
            }
          }}
          className={`canvas-row-cells flex flex-wrap gap-4 items-stretch min-h-[60px] transition-all rounded-2xl ${
            isDragOverRow && !isPreview
              ? "ring-2 ring-[#9D61FF] bg-[#9D61FF]/10 p-2 shadow-md"
              : ""
          }`}
        >
          {row.cells.length === 0 ? (
            <div className="w-full py-6 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-xs text-slate-400">
              <span>Empty Row &middot; Drag blocks here</span>
            </div>
          ) : (
            row.cells.map((cell, idx) => (
              <SortableCell
                key={cell.id}
                sectionId={sectionId}
                rowId={row.id}
                cell={cell}
                cellIndex={idx}
                totalCellsInRow={row.cells.length}
                isSelected={selectedCellId === cell.id}
                isPreview={isPreview}
                onSelect={(cellId, rId) => {
                  if (typeof onSelectCell === "function") {
                    onSelectCell(cellId, rId);
                  }
                }}
                onEdit={onEditCell}
                onDuplicate={onDuplicateCell}
                onDelete={onDeleteCell}
                onColSpanChange={onColSpanChange}
                onWidthChange={onWidthChange}
                onHeightChange={onHeightChange}
                onUpdateMetricCard={onUpdateMetricCard}
                onUpdateInsight={onUpdateInsight}
                onUpdateTextBlock={onUpdateTextBlock}
                onUpdateBadgeStrip={onUpdateBadgeStrip}
                onUpdateSingleBadge={onUpdateSingleBadge}
                onAddBadge={onAddBadge}
                onDeleteBadge={onDeleteBadge}
              />
            ))
          )}

          {/* Active Row Drop Target when dragging over row */}
          {isDragOverRow && !isPreview && (
            <div className="flex-1 min-w-[150px] min-h-[90px] rounded-2xl border-2 border-dashed border-[#9D61FF] bg-[#9D61FF]/15 flex flex-col items-center justify-center gap-1.5 text-[#8B3DFF] dark:text-[#c49aff] font-bold text-xs shadow-md animate-pulse">
              <Plus className="w-5 h-5" />
              <span>Drop inside this Row</span>
            </div>
          )}
        </div>
      </SortableContext>

      {!isPreview && (
        <div className="mt-3 h-px bg-slate-100 dark:bg-zinc-800/40 group-hover/row:bg-[#8B3DFF]/20 transition-colors" />
      )}
    </div>
  );
}

// ─── Reusable Watermark Layer ─────────────────────────────────────────────────
function WatermarkStampLayer({
  activeWatermark,
  wmPlacement,
  wmOpacity,
  wmScale,
  wmRotation,
  wmXOffset,
  wmYOffset,
  isDarkPaper,
  isWatermarkSelected,
  activeIsPreview,
  handleWatermarkDragStart,
  handleWatermarkResizeStart,
  onUpdateWatermarkConfig,
  onSelectWatermark,
  setIsWatermarkSelected,
  getPlacementClass,
}: {
  activeWatermark: UploadedSvgWatermark | null;
  wmPlacement: string;
  wmOpacity: number;
  wmScale: number;
  wmRotation: number;
  wmXOffset: number;
  wmYOffset: number;
  isDarkPaper: boolean;
  isWatermarkSelected: boolean;
  activeIsPreview: boolean;
  handleWatermarkDragStart: (e: React.MouseEvent) => void;
  handleWatermarkResizeStart: (e: React.MouseEvent) => void;
  onUpdateWatermarkConfig?: (config: Partial<WatermarkStampConfig>) => void;
  onSelectWatermark?: ((w: UploadedSvgWatermark | null) => void) | ((watermarkId: string | null) => void);
  setIsWatermarkSelected: (selected: boolean) => void;
  getPlacementClass: (pos: string) => string;
}) {
  if (!activeWatermark?.svgContent) return null;

  return (
    <div
      className={`absolute inset-0 select-none z-10 overflow-hidden flex p-8 sm:p-12 transition-all duration-300 ${
        getPlacementClass(wmPlacement)
      } ${isWatermarkSelected ? "pointer-events-auto" : "pointer-events-none"}`}
    >
      {wmPlacement === "tiled" ? (
        <div className="grid grid-cols-2 gap-24 w-full h-full p-8 place-items-center">
          {[1, 2, 3, 4].map((idx) => (
            <div
              key={idx}
              style={{
                opacity: wmOpacity * 0.7,
                transform: `translate(${wmXOffset}%, ${wmYOffset}%) rotate(${wmRotation}deg) scale(${wmScale * 0.75})`,
                transformOrigin: "center center",
                mixBlendMode: isDarkPaper ? "screen" : "multiply",
              }}
              className="w-full max-w-[280px] filter drop-shadow-sm select-none"
              dangerouslySetInnerHTML={{ __html: activeWatermark.svgContent }}
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            transform: `translate(${wmXOffset}%, ${wmYOffset}%)`,
            transformOrigin: "center center",
          }}
          className="relative flex items-center justify-center transition-transform duration-75 max-w-full"
        >
          <div
            style={{
              opacity: wmOpacity,
              transform: `rotate(${wmRotation}deg) scale(${wmScale})`,
              transformOrigin: "center center",
              mixBlendMode: isDarkPaper ? "screen" : "multiply",
            }}
            className="w-full max-w-[500px] flex items-center justify-center filter drop-shadow-sm select-none cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              if (!activeIsPreview) setIsWatermarkSelected(true);
            }}
            dangerouslySetInnerHTML={{ __html: activeWatermark.svgContent }}
          />

          {isWatermarkSelected && !activeIsPreview && (
            <div
              className="absolute inset-0 -m-3 border-2 border-[#8B3DFF] rounded-2xl ring-4 ring-[#8B3DFF]/20 pointer-events-auto cursor-move flex items-center justify-center select-none"
              onMouseDown={handleWatermarkDragStart}
              title="Drag to reposition watermark anywhere on page"
            >
              <div
                onMouseDown={handleWatermarkResizeStart}
                className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 rounded-full bg-white dark:bg-black border-2 border-[#8B3DFF] shadow-md cursor-nwse-resize hover:scale-125 transition-transform"
                title="Drag corner to resize scale"
              />
              <div
                onMouseDown={handleWatermarkResizeStart}
                className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-white dark:bg-black border-2 border-[#8B3DFF] shadow-md cursor-nesw-resize hover:scale-125 transition-transform"
                title="Drag corner to resize scale"
              />
              <div
                onMouseDown={handleWatermarkResizeStart}
                className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 rounded-full bg-white dark:bg-black border-2 border-[#8B3DFF] shadow-md cursor-nesw-resize hover:scale-125 transition-transform"
                title="Drag corner to resize scale"
              />
              <div
                onMouseDown={handleWatermarkResizeStart}
                className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-white dark:bg-black border-2 border-[#8B3DFF] shadow-md cursor-nwse-resize hover:scale-125 transition-transform"
                title="Drag corner to resize scale"
              />

              <div
                className="absolute -top-11 left-1/2 -translate-x-1/2 h-8 px-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-zinc-200 z-50 whitespace-nowrap cursor-default"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <span title="Drag watermark" className="flex items-center">
                  <Move className="w-3.5 h-3.5 text-[#8B3DFF] cursor-move" />
                </span>
                <span className="font-semibold text-slate-600 dark:text-zinc-300 max-w-[120px] truncate">
                  {activeWatermark.name.split(" ")[0]}
                </span>

                <div className="w-px h-3.5 bg-slate-200 dark:bg-zinc-800" />

                <div className="flex items-center gap-1 font-mono">
                  <button
                    type="button"
                    onClick={() => onUpdateWatermarkConfig && onUpdateWatermarkConfig({ scale: Math.max(20, Math.round(wmScale * 100) - 10) })}
                    className="w-5 h-5 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center font-bold text-slate-700 dark:text-zinc-300 cursor-pointer"
                    title="Smaller"
                  >
                    -
                  </button>
                  <span className="text-[#8B3DFF] font-bold px-1 text-[11px]">
                    {Math.round(wmScale * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => onUpdateWatermarkConfig && onUpdateWatermarkConfig({ scale: Math.min(300, Math.round(wmScale * 100) + 10) })}
                    className="w-5 h-5 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center font-bold text-slate-700 dark:text-zinc-300 cursor-pointer"
                    title="Larger"
                  >
                    +
                  </button>
                </div>

                <div className="w-px h-3.5 bg-slate-200 dark:bg-zinc-800" />

                <button
                  type="button"
                  onClick={() => {
                    if (!onUpdateWatermarkConfig) return;
                    const placements = [
                      "center",
                      "top-left",
                      "top-right",
                      "bottom-left",
                      "bottom-right",
                      "tiled",
                    ] as const;
                    const nextIdx = (placements.indexOf(wmPlacement as any) + 1) % placements.length;
                    onUpdateWatermarkConfig({ placement: placements[nextIdx] });
                  }}
                  className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 hover:bg-purple-100 text-[10px] font-mono uppercase text-slate-700 dark:text-zinc-300 cursor-pointer"
                  title="Cycle Placement Location"
                >
                  Pos: {wmPlacement}
                </button>

                <div className="w-px h-3.5 bg-slate-200 dark:bg-zinc-800" />

                <button
                  type="button"
                  onClick={() => setIsWatermarkSelected(false)}
                  className="w-5 h-5 rounded hover:bg-purple-100 text-purple-600 flex items-center justify-center cursor-pointer"
                  title="Done"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>

                {onSelectWatermark && (
                  <button
                    type="button"
                    onClick={() => {
                      (onSelectWatermark as any)(null);
                      setIsWatermarkSelected(false);
                    }}
                    className="w-5 h-5 rounded hover:bg-rose-100 text-rose-500 flex items-center justify-center cursor-pointer"
                    title="Remove Watermark"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main CanvasStudio ────────────────────────────────────────────────────────
export interface CanvasStudioProps {
  section: LibrarySection;
  selectedCellId?: string | null;
  selectedRowId?: string | null;
  onSelectCell?: (cellId: string | null, rowId: string | null) => void;
  onEditCell: (cell: CanvasCell, rowId: string) => void;
  onUpdateMetricCardInCell?: (rowId: string, cellId: string, card: LibraryMetricCard) => void;
  onUpdateInsightInCell?: (rowId: string, cellId: string, text: string) => void;
  onUpdateTextBlockInCell?: (rowId: string, cellId: string, content: string) => void;
  onUpdateBadgeStripInCell?: (rowId: string, cellId: string, strip: CanvasBadgeStrip) => void;
  onUpdateSingleBadgeInCell?: (rowId: string, cellId: string, badgeId: string, patch: Partial<CanvasBadgeItem>) => void;
  onAddBadgeToStripInCell?: (rowId: string, cellId: string) => void;
  onDeleteBadgeFromStripInCell?: (rowId: string, cellId: string, badgeId: string) => void;
  onHeightChange?: (cellId: string, rowId: string, customHeight?: number) => void;
  paperTone?: string;
  marginConfig?: CanvasMarginConfig;
  pageNumber?: number;
  sectionTextColor?: string;
  showGrid?: boolean;
  onToggleGrid?: () => void;
  showGuides?: boolean;
  onToggleGuides?: () => void;
  zoom?: number;
  setZoom?: (zoom: number | ((prev: number) => number)) => void;
  isPreview?: boolean;
  onTogglePreview?: () => void;
  activeWatermark?: UploadedSvgWatermark | null;
  watermarkConfig?: WatermarkStampConfig;
  onUpdateWatermarkConfig?: (config: Partial<WatermarkStampConfig>) => void;
  onSelectWatermark?: ((w: UploadedSvgWatermark | null) => void) | ((watermarkId: string | null) => void);
  onDropBlock?: (e: SidebarAddBlockEvent) => void;
  onEditHeader?: () => void;
}

// ─── Dual-Tone Typography Helpers (Matching Design Target) ────────────────────
export function renderDualToneEyebrow(eyebrow: string, sectionTextColor?: string, isDarkPaper?: boolean) {
  if (sectionTextColor) {
    return <span style={{ color: sectionTextColor }}>{eyebrow}</span>;
  }
  const trimmed = (eyebrow || "").trim();
  if (!trimmed) return null;
  const parts = trimmed.split(/\s+/);
  if (parts.length <= 1) {
    return <span className={isDarkPaper ? "text-sky-400" : "text-[#0d2562] dark:text-sky-400"}>{trimmed}</span>;
  }
  const firstPart = parts.slice(0, -1).join(" ");
  const lastWord = parts[parts.length - 1];
  return (
    <>
      <span className={isDarkPaper ? "text-blue-300" : "text-[#0d2562] dark:text-blue-300"}>{firstPart}</span>{" "}
      <span className={isDarkPaper ? "text-sky-400" : "text-[#2563eb] dark:text-sky-400"}>{lastWord}</span>
    </>
  );
}

export function renderDualToneTitle(name: string, sectionTextColor?: string, isDarkPaper?: boolean) {
  if (sectionTextColor) {
    return <span style={{ color: sectionTextColor }}>{name}</span>;
  }
  const trimmed = (name || "").trim();
  if (!trimmed) return null;
  const parts = trimmed.split(/\s+/);
  if (parts.length <= 1) {
    return <span className={isDarkPaper ? "text-white" : "text-[#050a1a] dark:text-white"}>{trimmed}</span>;
  }
  const mainPart = parts.slice(0, -1).join(" ");
  const accentWord = parts[parts.length - 1];
  return (
    <>
      <span className={isDarkPaper ? "text-white" : "text-[#050a1a] dark:text-white"}>{mainPart}</span>{" "}
      <span className={isDarkPaper ? "text-sky-400" : "text-[#2563eb] dark:text-sky-400"}>{accentWord}</span>
    </>
  );
}

function isColorDark(hexOrColor?: string): boolean {
  if (!hexOrColor) return false;
  if (hexOrColor === "dark") return true;
  if (!hexOrColor.startsWith("#") || hexOrColor.length < 7) return false;
  const r = parseInt(hexOrColor.slice(1, 3), 16);
  const g = parseInt(hexOrColor.slice(3, 5), 16);
  const b = parseInt(hexOrColor.slice(5, 7), 16);
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luma < 135;
}

export function CanvasStudio({
  section,
  selectedCellId,
  selectedRowId,
  onSelectCell,
  onEditCell,
  onUpdateMetricCardInCell,
  onUpdateInsightInCell,
  onUpdateTextBlockInCell,
  onUpdateBadgeStripInCell,
  onUpdateSingleBadgeInCell,
  onAddBadgeToStripInCell,
  onDeleteBadgeFromStripInCell,
  onHeightChange,
  paperTone = "white",
  marginConfig = DEFAULT_CANVAS_MARGIN,
  pageNumber = 1,
  sectionTextColor,
  showGrid = true,
  onToggleGrid,
  showGuides = false,
  onToggleGuides,
  zoom = 1,
  setZoom,
  isPreview = false,
  onTogglePreview,
  activeWatermark = null,
  watermarkConfig,
  onUpdateWatermarkConfig,
  onSelectWatermark,
  onDropBlock,
  onEditHeader,
}: CanvasStudioProps) {
  const dispatch = useDispatch();
  const rows = section.canvasRows || [];

  // Multi-page layout engine: partitions rows across authentic A4 sheets
  const pages = useMemo(() => {
    return partitionCanvasPages(rows, marginConfig, pageNumber);
  }, [rows, marginConfig, pageNumber]);

  const [activeViewPageIndex, setActiveViewPageIndex] = useState<number>(0);
  const prevPagesLengthRef = useRef(pages.length);

  // Auto-scroll to newly created page if page count increases
  useEffect(() => {
    if (pages.length > prevPagesLengthRef.current) {
      const newPageIdx = pages.length - 1;
      setActiveViewPageIndex(newPageIdx);
      setTimeout(() => {
        document.getElementById(`canvas-page-${newPageIdx}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
    }
    prevPagesLengthRef.current = pages.length;
  }, [pages.length]);

  // Internal fallbacks if not controlled by parent
  const [internalSelectedCellId, setInternalSelectedCellId] = useState<string | null>(null);
  const [internalSelectedRowId, setInternalSelectedRowId] = useState<string | null>(null);
  const [internalZoom, setInternalZoom] = useState(1);
  const [internalShowGrid, setInternalShowGrid] = useState(true);
  const [internalShowGuides, setInternalShowGuides] = useState(false);
  const [internalIsPreview, setInternalIsPreview] = useState(false);
  const [headerValuesBySection, setHeaderValuesBySection] = useState<Record<string, { taglinePrimary: string; taglineSecondary: string; title: string; period: string }>>({});
  const [editingHeaderValue, setEditingHeaderValue] = useState<"taglinePrimary" | "taglineSecondary" | "title" | "period" | null>(null);
  const [footerValuesBySection, setFooterValuesBySection] = useState<Record<string, { company: string; websites: string; quote: string }>>({});
  const [editingFooterValue, setEditingFooterValue] = useState<"company" | "websites" | "quote" | null>(null);

  const headerValues = headerValuesBySection[section.id] || {
    taglinePrimary: "Visibility for Every Worker;",
    taglineSecondary: "Intelligence for Every Site.",
    title: "Monthly Report",
    period: "01 Sept 2025 - 30 Sept 2025",
  };

  const updateHeaderValue = (field: "taglinePrimary" | "taglineSecondary" | "title" | "period", value: string) => {
    setHeaderValuesBySection((current) => ({
      ...current,
      [section.id]: { ...headerValues, [field]: value },
    }));
  };

  const commitHeaderValue = () => setEditingHeaderValue(null);

  const footerValues = footerValuesBySection[section.id] || {
    company: "AyantrAI Private Limited",
    websites: "www.ayantrai.com  |  www.sitesafe.ai",
    quote: "Every Worker Returns Home Safe",
  };

  const updateFooterValue = (field: "company" | "websites" | "quote", value: string) => {
    setFooterValuesBySection((current) => ({
      ...current,
      [section.id]: { ...footerValues, [field]: value },
    }));
  };

  const commitFooterValue = () => setEditingFooterValue(null);

  // Section Header Live / Inline Editing State
  const [editingSectionField, setEditingSectionField] = useState<"eyebrow" | "name" | "description" | null>(null);
  const [localSectionEyebrow, setLocalSectionEyebrow] = useState(section.eyebrow);
  const [localSectionName, setLocalSectionName] = useState(section.name);
  const [localSectionDesc, setLocalSectionDesc] = useState(section.description);

  useEffect(() => {
    setLocalSectionEyebrow(section.eyebrow);
    setLocalSectionName(section.name);
    setLocalSectionDesc(section.description);
  }, [section.eyebrow, section.name, section.description]);

  const commitSectionHeaderUpdate = useCallback(() => {
    dispatch(
      updateLibrarySection({
        id: section.id,
        name: (localSectionName || "").trim() || section.name,
        eyebrow: (localSectionEyebrow || "").trim(),
        description: (localSectionDesc || "").trim(),
      })
    );
    setEditingSectionField(null);
    dispatch(showGlobalToast({ message: "Section header updated", type: "success" }));
  }, [dispatch, section.id, section.name, localSectionName, localSectionEyebrow, localSectionDesc]);

  const activeSelectedCellId = selectedCellId !== undefined ? selectedCellId : internalSelectedCellId;
  const activeSelectedRowId = selectedRowId !== undefined ? selectedRowId : internalSelectedRowId;
  const activeZoom = zoom !== undefined ? zoom : internalZoom;
  const activeShowGrid = showGrid !== undefined ? showGrid : internalShowGrid;
  const activeShowGuides = showGuides !== undefined ? showGuides : internalShowGuides;
  const activeIsPreview = isPreview !== undefined ? isPreview : internalIsPreview;

  const handleSelectCell = useCallback(
    (cellId: string | null, rowId: string | null) => {
      if (typeof onSelectCell === "function") {
        onSelectCell(cellId, rowId);
      } else {
        setInternalSelectedCellId(cellId);
        setInternalSelectedRowId(rowId);
      }
    },
    [onSelectCell]
  );

  const handleToggleGrid = useCallback(() => {
    if (typeof onToggleGrid === "function") {
      onToggleGrid();
    } else {
      setInternalShowGrid((prev) => !prev);
    }
  }, [onToggleGrid]);

  const handleToggleGuides = useCallback(() => {
    if (typeof onToggleGuides === "function") {
      onToggleGuides();
    } else {
      setInternalShowGuides((prev) => !prev);
    }
  }, [onToggleGuides]);

  const handleTogglePreview = useCallback(() => {
    if (typeof onTogglePreview === "function") {
      onTogglePreview();
    } else {
      setInternalIsPreview((prev) => !prev);
    }
  }, [onTogglePreview]);

  const zoomIn = () => {
    const next = Math.min(1.25, activeZoom + 0.1);
    if (typeof setZoom === "function") setZoom(next);
    else setInternalZoom(next);
  };

  const zoomOut = () => {
    const next = Math.max(0.5, activeZoom - 0.1);
    if (typeof setZoom === "function") setZoom(next);
    else setInternalZoom(next);
  };

  const resetZoom = () => {
    if (typeof setZoom === "function") setZoom(1);
    else setInternalZoom(1);
  };

  // DnD Kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Active dragged block overlay
  const [activeDragCell, setActiveDragCell] = useState<CanvasCell | null>(null);

  // Custom collision detection
  const customCollisionDetection = useCallback((args: any) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) return pointerCollisions;
    const rectCollisions = rectIntersection(args);
    if (rectCollisions.length > 0) return rectCollisions;
    return closestCenter(args);
  }, []);

  // Cell Action Handlers
  const handleDuplicateCell = useCallback(
    (cellId: string, rowId: string) => {
      dispatch(duplicateCanvasCell({ sectionId: section.id, rowId, cellId }));
      dispatch(showGlobalToast({ message: "Block duplicated", type: "success" }));
    },
    [dispatch, section.id]
  );

  const handleDeleteCell = useCallback(
    (cellId: string, rowId: string) => {
      dispatch(deleteCanvasCell({ sectionId: section.id, rowId, cellId }));
      handleSelectCell(null, null);
      dispatch(showGlobalToast({ message: "Block removed", type: "info" }));
    },
    [dispatch, section.id, handleSelectCell]
  );

  const handleColSpanChange = useCallback(
    (cellId: string, rowId: string, colSpan: 1 | 2 | 3 | 4) => {
      dispatch(updateCellColSpan({ sectionId: section.id, rowId, cellId, colSpan }));
    },
    [dispatch, section.id]
  );

  const handleWidthChange = useCallback(
    (cellId: string, rowId: string, customWidth: number) => {
      dispatch(updateCellWidth({ sectionId: section.id, rowId, cellId, customWidth }));
    },
    [dispatch, section.id]
  );

  const handleHeightChange = useCallback(
    (cellId: string, rowId: string, customHeight?: number) => {
      if (typeof onHeightChange === "function") {
        onHeightChange(cellId, rowId, customHeight);
      } else {
        dispatch(updateCellHeight({ sectionId: section.id, rowId, cellId, customHeight }));
      }
    },
    [dispatch, section.id, onHeightChange]
  );

  const handleAddRow = useCallback(() => {
    dispatch(addCanvasRow(section.id));
    dispatch(showGlobalToast({ message: "New row added to section", type: "success" }));
  }, [dispatch, section.id]);

  const handleInsertRowAtIndex = useCallback(
    (insertIndex: number) => {
      dispatch(addCanvasRow({ sectionId: section.id, insertAtIndex: insertIndex }));
      dispatch(showGlobalToast({ message: "New row added to section", type: "success" }));
    },
    [dispatch, section.id]
  );

  const handleAddPage = useCallback(() => {
    dispatch(addCanvasRow({ sectionId: section.id, pageBreakBefore: true }));
    dispatch(showGlobalToast({ message: "New A4 page created", type: "success" }));
  }, [dispatch, section.id]);

  const handleTogglePageBreak = useCallback(
    (rowId: string) => {
      dispatch(toggleRowPageBreak({ sectionId: section.id, rowId }));
      dispatch(showGlobalToast({ message: "Page break toggled", type: "info" }));
    },
    [dispatch, section.id]
  );

  const handleRemoveRow = useCallback(
    (rowId: string) => {
      dispatch(removeCanvasRow({ sectionId: section.id, rowId }));
      handleSelectCell(null, null);
      dispatch(showGlobalToast({ message: "Row removed", type: "info" }));
    },
    [dispatch, section.id, handleSelectCell]
  );

  // Drag Handlers
  const handleDragStart = (e: DragStartEvent) => {
    const data = e.active.data.current;
    if (data?.cell) setActiveDragCell(data.cell as CanvasCell);
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveDragCell(null);
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // Row reordering
    if (activeData?.isRow) {
      const oldIndex = rows.findIndex((r) => r.id === active.id);
      const newIndex = rows.findIndex((r) => r.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const newRows = arrayMove(rows, oldIndex, newIndex);
        dispatch(reorderCanvasRows({ sectionId: section.id, rows: newRows }));
      }
      return;
    }

    // Cell reordering inside same row or cross-row
    if (activeData?.cell && activeData?.rowId) {
      const fromRowId = activeData.rowId;
      const cellId = String(active.id);

      const toRowId = (overData?.rowId as string) || (overData?.isRow ? String(over.id) : null);
      if (toRowId) {
        if (fromRowId === toRowId) {
          const row = rows.find((r) => r.id === fromRowId);
          if (row) {
            const oldIndex = row.cells.findIndex((c) => c.id === cellId);
            const newIndex = row.cells.findIndex((c) => c.id === over.id);
            if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
              const newCells = arrayMove(row.cells, oldIndex, newIndex);
              dispatch(reorderCellsInRow({ sectionId: section.id, rowId: fromRowId, cells: newCells }));
            }
          }
        } else {
          // Cross-row movement
          const toRow = rows.find((r) => r.id === toRowId);
          if (toRow) {
            const targetIndex = overData?.isRow
              ? toRow.cells.length
              : toRow.cells.findIndex((c) => c.id === over.id);
            dispatch(
              moveCellBetweenRows({
                sectionId: section.id,
                fromRowId,
                toRowId,
                cellId,
                toIndex: targetIndex === -1 ? toRow.cells.length : targetIndex,
              })
            );
          }
        }
      }
    }
  };

  // Background desk click clears selection
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleSelectCell(null, null);
      setIsWatermarkSelected(false);
    }
  };

  const isCustomColor =
    Boolean(paperTone) &&
    (paperTone.startsWith("#") ||
      paperTone.startsWith("rgb") ||
      paperTone.startsWith("hsl"));

  const paperBgClass =
    paperTone === "slate"
      ? "bg-slate-50 dark:bg-zinc-900"
      : paperTone === "paper" || paperTone === "cream"
      ? "bg-[#faf8f5] dark:bg-[#15130f]"
      : paperTone === "linen"
      ? "bg-[#f4f1ea] dark:bg-[#181613]"
      : paperTone === "ice"
      ? "bg-[#f0f7ff] dark:bg-[#0c1322]"
      : paperTone === "mint"
      ? "bg-[#f2f9f5] dark:bg-[#0b1812]"
      : paperTone === "rose"
      ? "bg-[#fff5f7] dark:bg-[#1a0c10]"
      : paperTone === "amber"
      ? "bg-[#fffbeb] dark:bg-[#1a1608]"
      : paperTone === "dark"
      ? "bg-[#0b0e14] dark:bg-[#07090d]"
      : !isCustomColor
      ? "bg-white dark:bg-[#0c1017]"
      : "";

  const customPaperStyle: React.CSSProperties = isCustomColor
    ? { backgroundColor: paperTone }
    : {};

  const isDarkPaper = isColorDark(paperTone);

  // Watermark parameters
  const wmOpacity = (watermarkConfig?.opacity ?? 18) / 100;
  const wmScale = (watermarkConfig?.scale ?? 100) / 100;
  const wmRotation = watermarkConfig?.rotation ?? -18;
  const wmPlacement = watermarkConfig?.placement ?? "center";
  const wmXOffset = watermarkConfig?.xOffset ?? 0;
  const wmYOffset = watermarkConfig?.yOffset ?? 0;

  const [isWatermarkSelected, setIsWatermarkSelected] = useState(false);
  const [isDraggingWatermark, setIsDraggingWatermark] = useState(false);
  const [isResizingWatermark, setIsResizingWatermark] = useState(false);

  const getPlacementClass = (pos: string) => {
    switch (pos) {
      case "top-left":
        return "items-start justify-start";
      case "top-center":
        return "items-start justify-center";
      case "top-right":
        return "items-start justify-end";
      case "center-left":
        return "items-center justify-start";
      case "center":
        return "items-center justify-center";
      case "center-right":
        return "items-center justify-end";
      case "bottom-left":
        return "items-end justify-start";
      case "bottom-center":
        return "items-end justify-center";
      case "bottom-right":
        return "items-end justify-end";
      case "tiled":
        return "items-center justify-around flex-wrap opacity-60";
      default:
        return "items-center justify-center";
    }
  };

  const handleWatermarkDragStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDraggingWatermark(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const startXOffset = wmXOffset;
    const startYOffset = wmYOffset;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaXPercent = Math.round(((moveEvent.clientX - startX) / 800) * 100);
      const deltaYPercent = Math.round(((moveEvent.clientY - startY) / 1000) * 100);
      const newX = Math.min(50, Math.max(-50, startXOffset + deltaXPercent));
      const newY = Math.min(50, Math.max(-50, startYOffset + deltaYPercent));
      if (onUpdateWatermarkConfig) {
        onUpdateWatermarkConfig({ xOffset: newX, yOffset: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDraggingWatermark(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleWatermarkResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizingWatermark(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const startScale = Math.round(wmScale * 100);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = (moveEvent.clientX - startX) - (moveEvent.clientY - startY);
      const newScale = Math.min(300, Math.max(20, Math.round(startScale + delta * 0.5)));
      if (onUpdateWatermarkConfig) {
        onUpdateWatermarkConfig({ scale: newScale });
      }
    };

    const handleMouseUp = () => {
      setIsResizingWatermark(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* ── Infinite Studio Blueprint Desk ── */}
      <div
        className="relative flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-6 sm:p-10 flex flex-col items-center select-none bg-[#f1f4f9] dark:bg-[#06080d]"
        style={
          activeShowGrid
            ? {
                backgroundImage: "radial-gradient(circle, rgba(148, 163, 184, 0.35) 1.5px, transparent 1.5px)",
                backgroundSize: "24px 24px",
              }
            : undefined
        }
        onClick={handleCanvasClick}
      >
        {/* Scalable Multi-Page Desk Container */}
        <div
          className="flex flex-col items-center gap-10 pb-28 transition-transform duration-200 select-none"
          style={{
            transform: `scale(${activeZoom})`,
            transformOrigin: "top center",
            width: `${A4_WIDTH_PX}px`,
          }}
        >
          <SortableContext
            items={rows.map((r) => r.id)}
            strategy={verticalListSortingStrategy}
            disabled={activeIsPreview}
          >
            {pages.map((page, pageIdx) => {
              return (
                <React.Fragment key={`page-${page.pageIndex}`}>
                  {/* Visual Page Break Between Pages on Desk */}
                  {pageIdx > 0 && (
                    <div className="flex items-center gap-4 w-[794px] my-2 text-xs select-none">
                      <div className="flex-1 border-t-2 border-dashed border-purple-300 dark:border-purple-900/60" />
                      <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-zinc-800 border-2 border-purple-300 dark:border-purple-700 text-slate-700 dark:text-zinc-200 font-mono font-bold text-[11px] shadow-md">
                        <Layers className="w-4 h-4 text-[#8B3DFF] animate-pulse" />
                        <span className="text-[#8B3DFF] font-black">AUTO PAGE BREAKER</span>
                        <span className="text-slate-300 dark:text-zinc-600">&bull;</span>
                        <span>Page {page.pageNumber} of {pages.length}</span>
                        <span className="text-slate-300 dark:text-zinc-600">&bull;</span>
                        <span className="text-slate-500 dark:text-zinc-400 font-medium">Standard A4 (794 &times; 1123 px)</span>
                      </div>
                      <div className="flex-1 border-t-2 border-dashed border-purple-300 dark:border-purple-900/60" />
                    </div>
                  )}

                  {/* ── Fixed A4 Artboard Sheet ── */}
                  <div
                    id={`canvas-page-${page.pageIndex}`}
                    style={{
                      ...customPaperStyle,
                      borderRadius: `${marginConfig.radius}px`,
                      width: `${A4_WIDTH_PX}px`,
                      minWidth: `${A4_WIDTH_PX}px`,
                      maxWidth: `${A4_WIDTH_PX}px`,
                      height: `${A4_HEIGHT_PX}px`,
                      minHeight: `${A4_HEIGHT_PX}px`,
                      maxHeight: `${A4_HEIGHT_PX}px`,
                      boxSizing: "border-box",
                    }}
                    className={`relative ${paperBgClass} border border-slate-200/90 dark:border-zinc-800 overflow-hidden transition-all duration-200 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_25px_50px_-12px_rgba(0,0,0,0.18),0_0_0_1px_rgba(0,0,0,0.05)] flex flex-col justify-between`}
                  >
                    {/* Margin Guides (if enabled) */}
                    {activeShowGuides && !activeIsPreview && (
                      <div
                        className="absolute border border-dashed border-sky-400/40 pointer-events-none z-20"
                        style={{
                          top: marginConfig.top,
                          right: marginConfig.right,
                          bottom: marginConfig.bottom,
                          left: marginConfig.left,
                          borderRadius: Math.max(0, marginConfig.radius - 2),
                        }}
                      />
                    )}

                    {/* Realistic Corporate Document Watermark Stamp Layer */}
                    <WatermarkStampLayer
                      activeWatermark={activeWatermark}
                      wmPlacement={wmPlacement}
                      wmOpacity={wmOpacity}
                      wmScale={wmScale}
                      wmRotation={wmRotation}
                      wmXOffset={wmXOffset}
                      wmYOffset={wmYOffset}
                      isDarkPaper={isDarkPaper}
                      isWatermarkSelected={isWatermarkSelected}
                      activeIsPreview={activeIsPreview}
                      handleWatermarkDragStart={handleWatermarkDragStart}
                      handleWatermarkResizeStart={handleWatermarkResizeStart}
                      onUpdateWatermarkConfig={onUpdateWatermarkConfig}
                      onSelectWatermark={onSelectWatermark}
                      setIsWatermarkSelected={setIsWatermarkSelected}
                      getPlacementClass={getPlacementClass}
                    />

                    {/* Inner Page Content with Margins */}
                    <div
                      className="relative z-10 flex-1 min-h-0 flex flex-col justify-between w-full max-w-full box-border"
                      style={{
                        paddingTop: marginConfig.top,
                        paddingRight: marginConfig.right,
                        paddingBottom: marginConfig.bottom,
                        paddingLeft: marginConfig.left,
                        boxSizing: "border-box",
                      }}
                    >
                      {/* Top Header */}
                      {page.isFirstPage ? (
                        <div>
                          {/* Fixed Sitesafe Report Header */}
                          <div
                            className="relative z-10 min-h-[150px] border-b border-slate-200/80 dark:border-zinc-800/60 overflow-hidden"
                            style={{ backgroundColor: getPaperToneColor(paperTone) }}
                          >
                            <div className="relative h-full grid grid-cols-[1.05fr_1.25fr_1fr] items-center gap-5 px-6 py-5">
                              <div className="flex min-w-0 flex-col justify-center">
                                <Image
                                  src="/sitesafe-header-logo.svg"
                                  alt="Sitesafe by AyantrAI"
                                  width={340}
                                  height={95}
                                  className="h-[90px] w-[280px] object-contain object-left"
                                  priority
                                />
                              </div>

                              <div className="min-w-0 border-l-2 border-[#2454d8] pl-6">
                                {editingHeaderValue === "taglinePrimary" ? (
                                  <input
                                    autoFocus
                                    value={headerValues.taglinePrimary}
                                    onChange={(event) => updateHeaderValue("taglinePrimary", event.target.value)}
                                    onBlur={commitHeaderValue}
                                    onKeyDown={(event) => {
                                      if (event.key === "Enter" || event.key === "Escape") commitHeaderValue();
                                    }}
                                    className="w-full bg-transparent text-[17px] font-semibold italic leading-tight text-[#2454d8] outline-none ring-1 ring-[#2454d8]/40 rounded-sm"
                                    aria-label="Primary report tagline"
                                  />
                                ) : (
                                  <p
                                    className="cursor-text text-[17px] font-semibold italic leading-tight text-[#2454d8]"
                                    onClick={() => !activeIsPreview && setEditingHeaderValue("taglinePrimary")}
                                    onDoubleClick={() => !activeIsPreview && setEditingHeaderValue("taglinePrimary")}
                                    title="Click to edit primary report tagline"
                                  >
                                    {headerValues.taglinePrimary}
                                  </p>
                                )}
                                {editingHeaderValue === "taglineSecondary" ? (
                                  <input
                                    autoFocus
                                    value={headerValues.taglineSecondary}
                                    onChange={(event) => updateHeaderValue("taglineSecondary", event.target.value)}
                                    onBlur={commitHeaderValue}
                                    onKeyDown={(event) => {
                                      if (event.key === "Enter" || event.key === "Escape") commitHeaderValue();
                                    }}
                                    className="w-full bg-transparent text-[17px] font-semibold italic leading-tight text-[#2454d8] outline-none ring-1 ring-[#2454d8]/40 rounded-sm"
                                    aria-label="Secondary report tagline"
                                  />
                                ) : (
                                  <p
                                    className="cursor-text text-[17px] font-semibold italic leading-tight text-[#2454d8]"
                                    onClick={() => !activeIsPreview && setEditingHeaderValue("taglineSecondary")}
                                    onDoubleClick={() => !activeIsPreview && setEditingHeaderValue("taglineSecondary")}
                                    title="Click to edit secondary report tagline"
                                  >
                                    {headerValues.taglineSecondary}
                                  </p>
                                )}
                              </div>

                              <div className="relative min-w-0 self-stretch flex items-center justify-between gap-4 border-l-2 border-[#2454d8] pl-6 pr-20">
                                <div className="min-w-0">
                                  {editingHeaderValue === "title" ? (
                                    <input
                                      autoFocus
                                      value={headerValues.title}
                                      onChange={(event) => updateHeaderValue("title", event.target.value)}
                                      onBlur={commitHeaderValue}
                                      onKeyDown={(event) => {
                                        if (event.key === "Enter" || event.key === "Escape") commitHeaderValue();
                                      }}
                                      className="w-full bg-transparent text-[19px] font-black leading-tight text-[#1836a0] outline-none ring-1 ring-[#2454d8]/40 rounded-sm"
                                      aria-label="Report title"
                                    />
                                  ) : (
                                    <p
                                      className="cursor-text text-[19px] font-black leading-tight text-[#1836a0]"
                                      onClick={() => !activeIsPreview && setEditingHeaderValue("title")}
                                      onDoubleClick={() => !activeIsPreview && setEditingHeaderValue("title")}
                                      title="Double-click to edit report title"
                                    >
                                      {headerValues.title}
                                    </p>
                                  )}
                                  {editingHeaderValue === "period" ? (
                                    <input
                                      autoFocus
                                      value={headerValues.period}
                                      onChange={(event) => updateHeaderValue("period", event.target.value)}
                                      onBlur={commitHeaderValue}
                                      onKeyDown={(event) => {
                                        if (event.key === "Enter" || event.key === "Escape") commitHeaderValue();
                                      }}
                                      className="mt-1 w-full bg-transparent text-[12px] font-semibold leading-tight text-[#1836a0] outline-none ring-1 ring-[#2454d8]/40 rounded-sm"
                                      aria-label="Report period"
                                    />
                                  ) : (
                                    <p
                                      className="mt-1 cursor-text text-[12px] font-semibold leading-tight text-[#1836a0]"
                                      onClick={() => !activeIsPreview && setEditingHeaderValue("period")}
                                      onDoubleClick={() => !activeIsPreview && setEditingHeaderValue("period")}
                                      title="Double-click to edit report period"
                                    >
                                      {headerValues.period}
                                    </p>
                                  )}
                                  <div className="mt-2 h-1 w-14 rounded-full bg-[#2454d8]" />
                                </div>
                                <div className="absolute -right-6 -top-5 -bottom-5 flex w-[72px] flex-col items-center justify-center bg-[#18344f] text-white [clip-path:polygon(0_0,100%_0,100%_100%,28%_100%,0_76%)]">
                                  <span className="text-[10px] font-semibold">Page</span>
                                  <span className="text-[25px] font-black leading-none">{String(page.pageNumber).padStart(2, "0")}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Section-specific Header Bar (Pixel-Perfect Matching Design Target) */}
                          <div
                            className={`relative z-10 px-0 group/section-header transition-all select-text ${
                              section.headerSpacing === "compact"
                                ? "pt-2 pb-1.5"
                                : section.headerSpacing === "spacious"
                                ? "pt-7 pb-6"
                                : "pt-4 pb-3.5"
                            }`}
                            style={{ backgroundColor: getPaperToneColor(paperTone) }}
                          >
                            <div className="flex items-center justify-between gap-3 mb-1.5">
                              {editingSectionField === "eyebrow" ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={localSectionEyebrow}
                                    onChange={(e) => setLocalSectionEyebrow(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") commitSectionHeaderUpdate();
                                      if (e.key === "Escape") setEditingSectionField(null);
                                    }}
                                    autoFocus
                                    className="text-[12.5px] font-bold uppercase tracking-[0.15em] font-sans px-2 py-0.5 rounded border border-[#2563eb] bg-white dark:bg-zinc-900 text-[#0d2562] dark:text-sky-400 outline-none shadow-xs"
                                    aria-label="Section eyebrow"
                                  />
                                  <button
                                    type="button"
                                    onClick={commitSectionHeaderUpdate}
                                    className="p-1 rounded bg-[#2563eb] text-white hover:bg-blue-700 cursor-pointer"
                                    title="Save Eyebrow"
                                  >
                                    <Check className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingSectionField(null)}
                                    className="p-1 rounded bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-300 cursor-pointer"
                                    title="Cancel"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <span
                                  onDoubleClick={() => {
                                    if (!activeIsPreview) {
                                      setLocalSectionEyebrow(section.eyebrow);
                                      setEditingSectionField("eyebrow");
                                    }
                                  }}
                                  className="text-[12.5px] font-bold uppercase tracking-[0.15em] font-sans leading-none cursor-pointer transition-colors"
                                  title="Double-click to edit eyebrow"
                                >
                                  {renderDualToneEyebrow(section.eyebrow, sectionTextColor, isDarkPaper)}
                                </span>
                              )}

                              {/* Right Header Controls: Spacing + Watermark + Edit Header Button */}
                              <div className="flex items-center gap-2">
                                {/* Header Spacing / Height Preset Selector */}
                                {!activeIsPreview && (
                                  <div className="opacity-0 group-hover/section-header:opacity-100 transition-opacity flex items-center gap-0.5 bg-slate-100 dark:bg-zinc-800 rounded-lg p-0.5 text-[10px] font-medium text-slate-500">
                                    <span className="px-1 text-[9px] text-slate-400 font-mono">Pad:</span>
                                    {(["compact", "normal", "spacious"] as const).map((space) => (
                                      <button
                                        key={space}
                                        type="button"
                                        onClick={() => {
                                          dispatch(updateLibrarySection({ id: section.id, headerSpacing: space }));
                                        }}
                                        className={`px-1.5 py-0.5 rounded capitalize transition-colors cursor-pointer ${
                                          (section.headerSpacing || "normal") === space
                                            ? "bg-white dark:bg-zinc-700 text-[#8B3DFF] font-bold shadow-xs"
                                            : "hover:text-slate-900 dark:hover:text-white"
                                        }`}
                                        title={`Set header vertical padding to ${space}`}
                                      >
                                        {space}
                                      </button>
                                    ))}
                                  </div>
                                )}

                                {activeWatermark && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setIsWatermarkSelected(!isWatermarkSelected);
                                    }}
                                    className={`inline-flex items-center gap-1.5 text-[10px] font-mono uppercase px-2 py-0.5 rounded transition-all cursor-pointer ${
                                      isWatermarkSelected
                                        ? "bg-purple-600 text-white shadow-xs ring-2 ring-purple-400 font-bold"
                                        : "bg-purple-500/10 text-[#8B3DFF] border border-purple-500/20 hover:bg-purple-500/20 font-bold"
                                    }`}
                                    title={isWatermarkSelected ? "Click to deselect watermark" : "Click to select, resize & locate watermark on canvas"}
                                  >
                                    <Stamp className="w-2.5 h-2.5" />
                                    <span>{activeWatermark.name}</span>
                                    <span className="text-[9px] opacity-80">({Math.round(wmScale * 100)}%)</span>
                                  </button>
                                )}

                                {!activeIsPreview && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (onEditHeader) {
                                        onEditHeader();
                                      } else {
                                        setLocalSectionName(section.name);
                                        setLocalSectionEyebrow(section.eyebrow);
                                        setLocalSectionDesc(section.description);
                                        setEditingSectionField("name");
                                      }
                                    }}
                                    className="opacity-0 group-hover/section-header:opacity-100 transition-opacity flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-[#2563eb] px-2 py-0.5 rounded hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer"
                                    title="Edit Section Header"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                    <span className="hidden sm:inline">Edit Header</span>
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Main Section Title: Huge 40px Font-Black Dual-Tone */}
                            {editingSectionField === "name" ? (
                              <div className="flex items-center gap-2 my-1">
                                <input
                                  type="text"
                                  value={localSectionName}
                                  onChange={(e) => setLocalSectionName(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") commitSectionHeaderUpdate();
                                    if (e.key === "Escape") setEditingSectionField(null);
                                  }}
                                  autoFocus
                                  className="w-full text-2xl sm:text-[34px] font-black tracking-[-0.03em] leading-tight px-2 py-1 rounded border-2 border-[#2563eb] bg-white dark:bg-zinc-900 text-[#050a1a] dark:text-white outline-none shadow-sm"
                                  aria-label="Section title"
                                />
                                <button
                                  type="button"
                                  onClick={commitSectionHeaderUpdate}
                                  className="p-1.5 rounded-lg bg-[#2563eb] text-white hover:bg-blue-700 cursor-pointer"
                                  title="Save Title"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingSectionField(null)}
                                  className="p-1.5 rounded-lg bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-300 cursor-pointer"
                                  title="Cancel"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <h1
                                onDoubleClick={() => {
                                  if (!activeIsPreview) {
                                    setLocalSectionName(section.name);
                                    setEditingSectionField("name");
                                  }
                                }}
                                className="text-3xl sm:text-[38px] lg:text-[40px] font-black tracking-[-0.035em] leading-[1.08] cursor-pointer mt-1"
                                title="Double-click to edit title"
                              >
                                {renderDualToneTitle(section.name, sectionTextColor, isDarkPaper)}
                              </h1>
                            )}

                            {/* Subtitle / Description */}
                            {editingSectionField === "description" ? (
                              <div className="flex items-start gap-2 mt-2">
                                <textarea
                                  value={localSectionDesc}
                                  onChange={(e) => setLocalSectionDesc(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                      e.preventDefault();
                                      commitSectionHeaderUpdate();
                                    }
                                    if (e.key === "Escape") setEditingSectionField(null);
                                  }}
                                  autoFocus
                                  rows={2}
                                  className="w-full text-[14px] leading-relaxed px-2 py-1 rounded border border-[#2563eb] bg-white dark:bg-zinc-900 text-[#4b556b] dark:text-zinc-200 outline-none shadow-xs resize-none"
                                  aria-label="Section description"
                                />
                                <button
                                  type="button"
                                  onClick={commitSectionHeaderUpdate}
                                  className="p-1.5 rounded-lg bg-[#2563eb] text-white hover:bg-blue-700 cursor-pointer mt-0.5"
                                  title="Save Description"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingSectionField(null)}
                                  className="p-1.5 rounded-lg bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-300 cursor-pointer mt-0.5"
                                  title="Cancel"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : section.description ? (
                              <p
                                onDoubleClick={() => {
                                  if (!activeIsPreview) {
                                    setLocalSectionDesc(section.description);
                                    setEditingSectionField("description");
                                  }
                                }}
                                className={`text-[14px] sm:text-[14.5px] mt-2 max-w-4xl leading-relaxed cursor-pointer font-normal ${
                                  isDarkPaper && !sectionTextColor
                                    ? "text-zinc-300"
                                    : !sectionTextColor
                                    ? "text-[#4b556b] dark:text-zinc-300"
                                    : ""
                                }`}
                                style={sectionTextColor ? { color: sectionTextColor, opacity: 0.9 } : undefined}
                                title="Double-click to edit description"
                              >
                                {section.description}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      ) : (
                        /* Continuation Page Header */
                        <div
                          className="relative z-10 min-h-[56px] border-b border-slate-200/80 dark:border-zinc-800/60 overflow-hidden flex items-center justify-between px-6 py-2.5 mb-2"
                          style={{ backgroundColor: getPaperToneColor(paperTone) }}
                        >
                          <div className="flex items-center gap-4">
                            <Image
                              src="/sitesafe-header-logo.svg"
                              alt="Sitesafe by AyantrAI"
                              width={140}
                              height={38}
                              className="h-[34px] w-[110px] object-contain object-left"
                              priority
                            />
                            <div className="h-6 w-px bg-[#2454d8]/40" />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-[0.14em] font-sans">
                                  {renderDualToneEyebrow(section.eyebrow, sectionTextColor, isDarkPaper)} &bull; CONTINUATION
                                </span>
                                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-[#8B3DFF] border border-purple-500/20">
                                  A4 Split (1123px)
                                </span>
                              </div>
                              <div className="text-xs font-black tracking-tight truncate max-w-[300px]">
                                {renderDualToneTitle(section.name, sectionTextColor, isDarkPaper)}
                              </div>
                            </div>
                          </div>

                          <div className="relative flex items-center gap-4">
                            <span className="text-[11px] font-semibold text-slate-500 italic hidden sm:inline">
                              {headerValues.title}
                            </span>
                            <div className="-my-2.5 -mr-6 h-[56px] w-[68px] flex flex-col items-center justify-center bg-[#18344f] text-white [clip-path:polygon(0_0,100%_0,100%_100%,28%_100%,0_76%)]">
                              <span className="text-[9px] font-semibold">Page</span>
                              <span className="text-[20px] font-black leading-none">{String(page.pageNumber).padStart(2, "0")}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Canvas Rows Container for this Page */}
                      <div className="relative z-10 px-0 pt-3 pb-2 space-y-2 flex-1 min-h-0 overflow-visible">
                        {page.rows.length === 0 ? (
                          <div
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              e.dataTransfer.dropEffect = "copy";
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              try {
                                const raw = e.dataTransfer.getData("application/json");
                                if (!raw) return;
                                const data = JSON.parse(raw);
                                if (onDropBlock) onDropBlock({ ...data, insertRowAtIndex: 0 });
                              } catch (err) {
                                console.error("Empty canvas drop error:", err);
                              }
                            }}
                            className="text-center py-16 border-2 border-dashed border-slate-200 dark:border-zinc-800 hover:border-[#9D61FF] hover:bg-[#9D61FF]/5 transition-all rounded-2xl text-slate-400 dark:text-zinc-600 space-y-3 cursor-copy"
                          >
                            <p className="text-sm font-medium">Canvas is empty</p>
                            <p className="text-xs">Drag any block from the left sidebar or click to add</p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {/* Drop zone at the top of the report */}
                            {page.isFirstPage && !activeIsPreview && (
                              <DropInsertZone
                                insertIndex={0}
                                onAddRow={handleInsertRowAtIndex}
                                onDropBlock={onDropBlock}
                                label="Drop to insert at top of report"
                              />
                            )}

                            {page.rows.map((row, rowIdx) => {
                              const globalRowIndex = rows.findIndex((r) => r.id === row.id);
                              const isAutoBreakFirstRow = pageIdx > 0 && rowIdx === 0 && !row.pageBreakBefore;
                              return (
                                <React.Fragment key={row.id}>
                                  <SortableRow
                                    sectionId={section.id}
                                    row={row}
                                    selectedCellId={activeSelectedCellId}
                                    selectedRowId={activeSelectedRowId}
                                    isPreview={activeIsPreview}
                                    isAutoBreakFirstRow={isAutoBreakFirstRow}
                                    currentPageNumber={page.pageNumber}
                                    onSelectCell={handleSelectCell}
                                    onEditCell={onEditCell}
                                    onDuplicateCell={handleDuplicateCell}
                                    onDeleteCell={handleDeleteCell}
                                    onColSpanChange={handleColSpanChange}
                                    onWidthChange={handleWidthChange}
                                    onHeightChange={handleHeightChange}
                                    onUpdateMetricCard={onUpdateMetricCardInCell}
                                    onUpdateInsight={onUpdateInsightInCell}
                                    onUpdateTextBlock={onUpdateTextBlockInCell}
                                    onUpdateBadgeStrip={onUpdateBadgeStripInCell}
                                    onUpdateSingleBadge={onUpdateSingleBadgeInCell}
                                    onAddBadge={onAddBadgeToStripInCell}
                                    onDeleteBadge={onDeleteBadgeFromStripInCell}
                                    onRemoveRow={handleRemoveRow}
                                    onTogglePageBreak={handleTogglePageBreak}
                                    onDropBlock={onDropBlock}
                                  />
                                  {/* Drop zone below this row */}
                                  {!activeIsPreview && (
                                    <DropInsertZone
                                      insertIndex={globalRowIndex + 1}
                                      onAddRow={handleInsertRowAtIndex}
                                      onDropBlock={onDropBlock}
                                      label={`Drop to insert new row below row ${globalRowIndex + 1}`}
                                    />
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </div>
                        )}

                        {/* Add Row Button on this page (Hidden in preview) */}
                        {!activeIsPreview && (
                          <div className="flex items-center gap-2 pt-2">
                            {(() => {
                              const lastRowOfPage = page.rows[page.rows.length - 1];
                              const pageEndInsertIndex = lastRowOfPage
                                ? rows.findIndex((r) => r.id === lastRowOfPage.id) + 1
                                : rows.length;
                              return (
                                <PageAddRowDropZone
                                  pageNumber={page.pageNumber}
                                  insertIndex={pageEndInsertIndex}
                                  onAddRow={() => handleInsertRowAtIndex(pageEndInsertIndex)}
                                  onDropBlock={onDropBlock}
                                />
                              );
                            })()}
                            {page.isLastPage && (
                              <button
                                type="button"
                                onClick={handleAddPage}
                                className="
                                  px-3.5 py-2.5 rounded-xl border border-dashed border-[#8B3DFF]/40
                                  text-xs font-bold text-[#8B3DFF] bg-[#8B3DFF]/5
                                  hover:bg-[#8B3DFF]/10 hover:border-[#8B3DFF]
                                  transition-all flex items-center gap-1.5 cursor-pointer
                                "
                                title="Create a new blank A4 page"
                              >
                                <Layers className="w-3.5 h-3.5" />
                                <span>+ New Page</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Footer: Full Sitesafe Footer on Last Page, Running footer on earlier pages */}
                      {page.isLastPage ? (
                        <footer
                          className="relative z-10 mt-auto grid grid-cols-[1.1fr_1fr_1.1fr] items-center gap-6 border-t border-slate-200/80 dark:border-zinc-800/60 px-0 pt-4 pb-2"
                          style={{ backgroundColor: getPaperToneColor(paperTone) }}
                        >
                          <div className="min-w-0">
                            {editingFooterValue === "company" ? (
                              <input
                                autoFocus
                                value={footerValues.company}
                                onChange={(event) => updateFooterValue("company", event.target.value)}
                                onBlur={commitFooterValue}
                                onKeyDown={(event) => {
                                  if (event.key === "Enter" || event.key === "Escape") commitFooterValue();
                                }}
                                className="w-full bg-transparent text-sm font-bold text-[#1836a0] outline-none ring-1 ring-[#2454d8]/40 rounded-sm"
                                aria-label="Footer company name"
                              />
                            ) : (
                              <p
                                className="cursor-text text-sm font-bold text-[#1836a0]"
                                onDoubleClick={() => !activeIsPreview && setEditingFooterValue("company")}
                                title="Double-click to edit company name"
                              >
                                {footerValues.company}
                              </p>
                            )}
                            {editingFooterValue === "websites" ? (
                              <input
                                autoFocus
                                value={footerValues.websites}
                                onChange={(event) => updateFooterValue("websites", event.target.value)}
                                onBlur={commitFooterValue}
                                onKeyDown={(event) => {
                                  if (event.key === "Enter" || event.key === "Escape") commitFooterValue();
                                }}
                                className="mt-1 w-full bg-transparent text-xs font-semibold text-[#1836a0] outline-none ring-1 ring-[#2454d8]/40 rounded-sm"
                                aria-label="Footer website links"
                              />
                            ) : (
                              <p
                                className="mt-1 cursor-text text-xs font-semibold text-[#1836a0]"
                                onDoubleClick={() => !activeIsPreview && setEditingFooterValue("websites")}
                                title="Double-click to edit website links"
                              >
                                {footerValues.websites}
                              </p>
                            )}
                          </div>

                          <div className="h-[2px] w-full bg-[#1836a0]/60" />

                          {editingFooterValue === "quote" ? (
                            <input
                              autoFocus
                              value={footerValues.quote}
                              onChange={(event) => updateFooterValue("quote", event.target.value)}
                              onBlur={commitFooterValue}
                              onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === "Escape") commitFooterValue();
                              }}
                              className="w-full bg-transparent text-right text-sm font-semibold text-[#1836a0] outline-none ring-1 ring-[#2454d8]/40 rounded-sm"
                              aria-label="Footer safety quote"
                            />
                          ) : (
                            <p
                              className="cursor-text text-right text-sm font-semibold text-[#1836a0]"
                              onDoubleClick={() => !activeIsPreview && setEditingFooterValue("quote")}
                              title="Double-click to edit safety quote"
                            >
                              &ldquo;{footerValues.quote}&rdquo;
                            </p>
                          )}
                        </footer>
                      ) : (
                        <footer
                          className="relative z-10 mt-auto flex items-center justify-between border-t border-slate-200/80 dark:border-zinc-800/60 px-0 pt-2 pb-1 text-[11px] text-slate-400 font-mono"
                          style={{ backgroundColor: getPaperToneColor(paperTone) }}
                        >
                          <span className="font-semibold text-[#1836a0] dark:text-sky-400">Sitesafe&trade; by AyantrAI Private Limited</span>
                          <span>Page {page.pageNumber} of {pages.length}</span>
                        </footer>
                      )}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </SortableContext>
        </div>
      </div>

      {/* ── Floating Viewport Dock (Bottom Center/Right) ── */}
      <div className="fixed bottom-4 right-8 z-40 flex items-center gap-1.5 bg-white/95 dark:bg-zinc-900/95 border border-slate-200 dark:border-zinc-800 rounded-2xl px-3 py-1.5 shadow-2xl backdrop-blur-md select-none text-xs">
        {/* Page Navigator when multi-page */}
        {pages.length > 1 && (
          <>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 rounded-xl px-2 py-0.5 font-mono text-[11px] font-bold text-slate-700 dark:text-zinc-200">
              <button
                type="button"
                onClick={() => {
                  const prev = Math.max(0, activeViewPageIndex - 1);
                  setActiveViewPageIndex(prev);
                  document.getElementById(`canvas-page-${prev}`)?.scrollIntoView({ behavior: "smooth" });
                }}
                disabled={activeViewPageIndex === 0}
                className="p-1 rounded hover:bg-white dark:hover:bg-zinc-700 disabled:opacity-30 cursor-pointer"
                title="Previous Page"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <span className="px-1 text-[#8B3DFF]">
                Page {activeViewPageIndex + 1} / {pages.length}
              </span>
              <span className="text-[9px] font-mono text-slate-400 dark:text-zinc-500 pl-1 border-l border-slate-200 dark:border-zinc-700">
                A4 (1123px)
              </span>
              <button
                type="button"
                onClick={() => {
                  const next = Math.min(pages.length - 1, activeViewPageIndex + 1);
                  setActiveViewPageIndex(next);
                  document.getElementById(`canvas-page-${next}`)?.scrollIntoView({ behavior: "smooth" });
                }}
                disabled={activeViewPageIndex === pages.length - 1}
                className="p-1 rounded hover:bg-white dark:hover:bg-zinc-700 disabled:opacity-30 cursor-pointer"
                title="Next Page"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="w-px h-4 bg-slate-200 dark:bg-zinc-800 mx-1" />
          </>
        )}

        {/* Zoom Out */}
        <button
          type="button"
          onClick={zoomOut}
          disabled={activeZoom <= 0.5}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white disabled:opacity-30 cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        {/* Zoom Percentage Label */}
        <button
          type="button"
          onClick={resetZoom}
          className="px-2 py-0.5 rounded-md font-mono text-[11px] font-bold text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
          title="Reset Zoom to 100%"
        >
          {Math.round(activeZoom * 100)}%
        </button>

        {/* Zoom In */}
        <button
          type="button"
          onClick={zoomIn}
          disabled={activeZoom >= 1.25}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white disabled:opacity-30 cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-4 bg-slate-200 dark:bg-zinc-800 mx-1" />

        {/* Grid Toggle */}
        <button
          type="button"
          onClick={handleToggleGrid}
          className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
            activeShowGrid ? "text-[#8B3DFF] bg-purple-500/15" : "text-slate-400 hover:text-slate-700"
          }`}
          title="Toggle Background Grid"
        >
          <Grid className="w-3.5 h-3.5" />
        </button>

        {/* Margin Guides Toggle */}
        <button
          type="button"
          onClick={handleToggleGuides}
          className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
            activeShowGuides ? "text-[#8B3DFF] bg-purple-500/15" : "text-slate-400 hover:text-slate-700"
          }`}
          title="Toggle Margin Guides"
        >
          <Square className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-4 bg-slate-200 dark:bg-zinc-800 mx-1" />

        {/* Preview Button */}
        <button
          type="button"
          onClick={handleTogglePreview}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
            activeIsPreview ? "bg-[#8B3DFF] text-white shadow-sm" : "text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
          }`}
          title="Toggle Clean Preview Mode"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{activeIsPreview ? "Exit" : "Preview"}</span>
        </button>
      </div>

      {/* ── 3D Elevated Drag Overlay ── */}
      <DragOverlay dropAnimation={{ duration: 150, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}>
        {activeDragCell && (
          <div className="w-[300px] max-w-full opacity-95 shadow-[0_20px_50px_rgba(0,0,0,0.35)] rounded-2xl rotate-1 scale-105 transition-transform ring-2 ring-[#8B3DFF] pointer-events-none cursor-grabbing">
            <CanvasBlockRenderer cell={activeDragCell} isPreview />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

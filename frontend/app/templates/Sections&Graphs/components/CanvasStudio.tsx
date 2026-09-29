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
  useDroppable,
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
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Type,
  Underline,
  CornerDownLeft,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  Activity,
  Lightbulb,
  Minus,
  Ruler,
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
  moveCellToStackBelow,
  updateCellColSpan,
  updateCellWidth,
  updateCellHeight,
  showGlobalToast,
} from "@/lib/redux/slices/reportModuleSlice";
import { CanvasBlockRenderer } from "./CanvasBlockRenderer";
import { UploadedSvgWatermark, WatermarkStampConfig } from "../watermark/utils";
import { SidebarAddBlockEvent } from "./CanvasSidebar";
import { CanvasRuler } from "./CanvasRuler";
import {
  DynamicTitleEditor,
  DynamicTextEditor,
  renderDynamicTitle,
  renderDynamicEyebrow,
  renderDynamicText,
  getFallbackEyebrowHtml,
  getFallbackTitleHtml,
} from "./DynamicTitleEditor";

import {
  A4_WIDTH_PX,
  A4_HEIGHT_PX,
  getCellWidthStyle,
  estimateRowHeight,
  PagePartition,
  partitionCanvasPages,
  renderDualToneEyebrow,
  renderDualToneTitle,
  isColorDark,
  getPaperToneColor,
  DEFAULT_CANVAS_MARGIN,
  CanvasMarginConfig,
  RulerUnit,
} from "../utils";

export {
  A4_WIDTH_PX,
  A4_HEIGHT_PX,
  getCellWidthStyle,
  estimateRowHeight,
  partitionCanvasPages,
  renderDualToneEyebrow,
  renderDualToneTitle,
};
export type { PagePartition };


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
  selectedCellId?: string | null;
  previousCellId?: string;
  onMoveToStackBelow?: (sourceCellId: string, targetCellId: string) => void;
  onStackCellBelow?: (cell: CanvasCell) => void;
  onUnstackCell?: (cellId: string) => void;
  onReorderStacked?: (parentCellId: string, direction: "up" | "down", index: number) => void;
  onDropToStack?: (targetCellId: string, data: any) => void;
  activeDragCellId?: string | null;
  onAddBlockBeside?: (rowId: string, cellIndex: number, blockType: CanvasBlockType) => void;
  zoom?: number;
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
  selectedCellId,
  previousCellId,
  onMoveToStackBelow,
  onStackCellBelow,
  onUnstackCell,
  onReorderStacked,
  onDropToStack,
  activeDragCellId,
  onAddBlockBeside,
  zoom = 1,
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

  const isSelfDragging = Boolean(activeDragCellId && activeDragCellId === cell.id);
  const isOtherDragging = Boolean(activeDragCellId && activeDragCellId !== cell.id);

  const { setNodeRef: setStackDropRef, isOver: isStackDropOver } = useDroppable({
    id: `stack-drop-${cell.id}`,
    data: { isStackDrop: true, targetCellId: cell.id, rowId },
    disabled: isPreview || isSelfDragging,
  });

  const { setNodeRef: setBesideDropRef, isOver: isBesideDropOver } = useDroppable({
    id: `beside-drop-${cell.id}`,
    data: { isBesideDrop: true, targetCellId: cell.id, rowId, cellIndex },
    disabled: isPreview || isSelfDragging,
  });

  const defaultWidthForCount = totalCellsInRow && totalCellsInRow > 0
    ? totalCellsInRow === 1 ? 100 : totalCellsInRow === 2 ? 50 : totalCellsInRow === 3 ? 33.3 : 25
    : 100;
  const initialPercent = cell.customWidth ?? (cell.colSpan ? cell.colSpan * 25 : defaultWidthForCount);
  const [isResizing, setIsResizing] = useState(false);
  const [resizePercent, setResizePercent] = useState<number>(initialPercent);

  const initialHeight = cell.customHeight;
  const [isHeightResizing, setIsHeightResizing] = useState(false);
  const [resizeHeight, setResizeHeight] = useState<number | undefined>(initialHeight);
  const [isDragOverBottom, setIsDragOverBottom] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const cellDomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setResizePercent(cell.customWidth ?? (cell.colSpan ? cell.colSpan * 25 : defaultWidthForCount));
  }, [cell.customWidth, cell.colSpan, defaultWidthForCount]);

  useEffect(() => {
    setResizeHeight(cell.customHeight);
  }, [cell.customHeight]);

  const [isCellEditing, setIsCellEditing] = useState(false);

  useEffect(() => {
    if (!isSelected) {
      setIsCellEditing(false);
    }
  }, [isSelected]);

  const currentPercent = isResizing ? resizePercent : (cell.customWidth ?? (cell.colSpan ? cell.colSpan * 25 : defaultWidthForCount));
  const currentHeight = isHeightResizing ? resizeHeight : cell.customHeight;
  const widthStyle = getCellWidthStyle(currentPercent);

  const effectiveZoom = zoom > 0 ? zoom : 1;

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);

    const startX = e.clientX;
    const parentRow = cellDomRef.current?.closest(".canvas-row-cells") as HTMLElement | null;
    const scrollContainer = cellDomRef.current?.closest(".overflow-y-auto, .overflow-auto") as HTMLElement | null;
    const startScrollLeft = scrollContainer?.scrollLeft || 0;
    // Parent width in unscaled CSS space
    const parentWidth = parentRow ? (parentRow.getBoundingClientRect().width / effectiveZoom) : 740;
    const startPercent = currentPercent;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const currentScrollLeft = scrollContainer?.scrollLeft || 0;
      const scrollDeltaX = currentScrollLeft - startScrollLeft;
      const deltaX = (moveEvent.clientX - startX + scrollDeltaX) / effectiveZoom;
      const deltaPercent = (deltaX / parentWidth) * 100;
      const newPercent = Math.min(100, Math.max(15, Math.round(startPercent + deltaPercent)));
      setResizePercent(newPercent);
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      setIsResizing(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);

      const currentScrollLeft = scrollContainer?.scrollLeft || 0;
      const scrollDeltaX = currentScrollLeft - startScrollLeft;
      const deltaX = (upEvent.clientX - startX + scrollDeltaX) / effectiveZoom;
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
    // Use offsetHeight (unscaled CSS layout height) to prevent jumping when zoomed or auto
    const startH = cellDomRef.current?.offsetHeight || currentHeight || 300;
    const scrollContainer = cellDomRef.current?.closest(".overflow-y-auto, .overflow-auto") as HTMLElement | null;
    const startScrollTop = scrollContainer?.scrollTop || 0;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const currentScrollTop = scrollContainer?.scrollTop || 0;
      const scrollDeltaY = currentScrollTop - startScrollTop;
      const deltaY = (moveEvent.clientY - startY + scrollDeltaY) / effectiveZoom;
      const newH = Math.min(680, Math.max(80, Math.round(startH + deltaY)));
      setResizeHeight(newH);
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      setIsHeightResizing(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);

      const currentScrollTop = scrollContainer?.scrollTop || 0;
      const scrollDeltaY = currentScrollTop - startScrollTop;
      const deltaY = (upEvent.clientY - startY + scrollDeltaY) / effectiveZoom;
      const finalH = Math.min(680, Math.max(80, Math.round(startH + deltaY)));
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
    const parentRow = cellDomRef.current?.closest(".canvas-row-cells") as HTMLElement | null;
    const scrollContainer = cellDomRef.current?.closest(".overflow-y-auto, .overflow-auto") as HTMLElement | null;
    const startScrollLeft = scrollContainer?.scrollLeft || 0;
    const startScrollTop = scrollContainer?.scrollTop || 0;
    const parentWidth = parentRow ? (parentRow.getBoundingClientRect().width / effectiveZoom) : 740;
    const startPercent = currentPercent;
    const startH = cellDomRef.current?.offsetHeight || currentHeight || 300;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const currentScrollLeft = scrollContainer?.scrollLeft || 0;
      const scrollDeltaX = currentScrollLeft - startScrollLeft;
      const deltaX = (moveEvent.clientX - startX + scrollDeltaX) / effectiveZoom;
      const deltaPercent = (deltaX / parentWidth) * 100;
      const newPercent = Math.min(100, Math.max(15, Math.round(startPercent + deltaPercent)));
      setResizePercent(newPercent);

      const currentScrollTop = scrollContainer?.scrollTop || 0;
      const scrollDeltaY = currentScrollTop - startScrollTop;
      const deltaY = (moveEvent.clientY - startY + scrollDeltaY) / effectiveZoom;
      const newH = Math.min(680, Math.max(80, Math.round(startH + deltaY)));
      setResizeHeight(newH);
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      setIsResizing(false);
      setIsHeightResizing(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);

      const currentScrollLeft = scrollContainer?.scrollLeft || 0;
      const scrollDeltaX = currentScrollLeft - startScrollLeft;
      const deltaX = (upEvent.clientX - startX + scrollDeltaX) / effectiveZoom;
      const deltaPercent = (deltaX / parentWidth) * 100;
      const finalPercent = Math.min(100, Math.max(15, Math.round(startPercent + deltaPercent)));
      setResizePercent(finalPercent);

      const currentScrollTop = scrollContainer?.scrollTop || 0;
      const scrollDeltaY = currentScrollTop - startScrollTop;
      const deltaY = (upEvent.clientY - startY + scrollDeltaY) / effectiveZoom;
      const finalH = Math.min(680, Math.max(80, Math.round(startH + deltaY)));
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
      id={`canvas-cell-${cell.id}`}
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
          className={`absolute top-2 left-2 z-20 ${
            isSelected ? "opacity-100 ring-2 ring-[#8B3DFF] shadow-md" : "opacity-0 group-hover/cell:opacity-100"
          } transition-opacity bg-black/80 hover:bg-black text-white rounded-md px-1.5 py-0.5 text-[9px] font-mono font-bold flex items-center gap-1 cursor-grab active:cursor-grabbing backdrop-blur-xs shadow-xs`}
          title="Drag to move card anywhere (within row or across rows)"
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

      {/* Beside Droppable Zone on Right Edge (Canva Column Beside Target) */}
      {!isPreview && !isSelfDragging && (
        <div
          ref={setBesideDropRef}
          className={`absolute right-0 top-0 bottom-0 transition-all z-35 flex items-center justify-center ${
            isBesideDropOver
              ? "w-8 -right-4 bg-purple-500/25 border-2 border-dashed border-[#8B3DFF] rounded-r-2xl pointer-events-auto"
              : isOtherDragging
              ? "w-4 -right-2 border-r-2 border-dashed border-purple-300 dark:border-purple-700/60 pointer-events-auto"
              : "w-3 pointer-events-none"
          }`}
          title="Drop here to place beside as column"
        >
          {isBesideDropOver && (
            <div className="bg-[#8B3DFF] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-md whitespace-nowrap rotate-90 flex items-center gap-0.5 animate-pulse pointer-events-none">
              <Plus className="w-2.5 h-2.5" /> Beside
            </div>
          )}
        </div>
      )}

      {/* Quick Add Column Beside Button (+) */}
      {!isPreview && !activeDragCellId && typeof onAddBlockBeside === "function" && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAddBlockBeside(rowId, (cellIndex ?? 0) + 1, "text");
          }}
          className="absolute -right-2.5 top-1/2 -translate-y-1/2 z-35 w-5 h-5 rounded-full bg-white dark:bg-zinc-800 border border-purple-300 dark:border-purple-700 text-[#8B3DFF] hover:bg-[#8B3DFF] hover:text-white flex items-center justify-center text-[11px] font-black shadow-md transition-all opacity-0 group-hover/cell:opacity-100 cursor-pointer"
          title="Add a new column block beside this card in this row"
        >
          <Plus className="w-3 h-3" />
        </button>
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
      {!isPreview && !isCellEditing && (isSelected || isResizing || isHeightResizing) && (
        <div className={`absolute -top-11 ${toolbarPlacementClass} z-40 flex items-center gap-1 bg-white/95 dark:bg-zinc-900/95 border border-slate-200 dark:border-zinc-800 rounded-xl px-2 py-1 shadow-xl backdrop-blur-md text-xs select-none pointer-events-auto whitespace-nowrap`}>
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 -ml-0.5 text-slate-400 hover:text-[#8B3DFF] rounded flex items-center"
            title="Drag to move card anywhere across canvas"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </div>

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
              if (cell.blockType === "text" || cell.blockType === "insight") {
                setIsCellEditing(true);
              } else if (typeof onEdit === "function") {
                onEdit(cell, rowId);
              }
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

          {/* Quick 1-click Stack under left card (Canva Stack) */}
          {cellIndex !== undefined && cellIndex > 0 && previousCellId && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (typeof onMoveToStackBelow === "function") {
                  onMoveToStackBelow(cell.id, previousCellId);
                }
              }}
              className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-white bg-[#8B3DFF] hover:bg-[#7828E0] transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
              title="Combine into a single vertical column under the card to its left (Canva Stack)"
            >
              <CornerDownLeft className="w-3.5 h-3.5" />
              <span>Stack under left card</span>
            </button>
          )}

          {/* Quick Add Block Below (Canva Stack) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setQuickAddOpen((prev) => !prev);
            }}
            className={`px-2 py-1 transition-all cursor-pointer rounded-lg flex items-center gap-1 text-[10px] font-bold ${
              quickAddOpen
                ? "bg-[#8B3DFF] text-white shadow-xs"
                : "text-purple-600 dark:text-purple-400 bg-purple-500/10 hover:bg-purple-500/20"
            }`}
            title="Stack another block directly below this card (Canva Stack)"
          >
            <Plus className="w-3 h-3" />
            <span>+ Stack</span>
          </button>
        </div>
      )}

      {/* Render the actual cell content block and vertically stacked blocks */}
      <div className="w-full flex-1 h-full min-h-0 flex flex-col gap-3">
        {/* Primary Block */}
        <div className="w-full relative group/primary-block">
          <CanvasBlockRenderer
            cell={cell}
            isSelected={isSelected}
            isPreview={isPreview}
            isForceEditing={isCellEditing}
            onEditingChange={(editing) => setIsCellEditing(editing)}
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

        {/* Stacked Blocks underneath (Canva Column Stack) */}
        {cell.stackedCells && cell.stackedCells.length > 0 && (
          <div className="w-full flex flex-col gap-3">
            {cell.stackedCells.map((sc, sIdx) => {
              const isStackedSelected = selectedCellId === sc.id;
              return (
                <div
                  key={sc.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isPreview && typeof onSelect === "function") {
                      onSelect(sc.id, rowId);
                    }
                  }}
                  className={`relative group/stacked-block w-full transition-all ${
                    isStackedSelected && !isPreview ? "ring-2 ring-[#8B3DFF] rounded-2xl shadow-lg" : ""
                  }`}
                >
                  {/* Mini Hover Toolbar for Stacked Item */}
                  {!isPreview && (
                    <div className="absolute -top-3.5 right-2 z-30 opacity-0 group-hover/stacked-block:opacity-100 transition-opacity flex items-center gap-0.5 bg-white/95 dark:bg-zinc-900/95 border border-slate-200 dark:border-zinc-800 rounded-lg px-1.5 py-0.5 shadow-md text-xs backdrop-blur-sm">
                      {sIdx > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (typeof onReorderStacked === "function") {
                              onReorderStacked(cell.id, "up", sIdx);
                            }
                          }}
                          className="p-0.5 text-slate-500 hover:text-purple-600 rounded cursor-pointer"
                          title="Move up in stack"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {sIdx < cell.stackedCells!.length - 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (typeof onReorderStacked === "function") {
                              onReorderStacked(cell.id, "down", sIdx);
                            }
                          }}
                          className="p-0.5 text-slate-500 hover:text-purple-600 rounded cursor-pointer"
                          title="Move down in stack"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (typeof onUnstackCell === "function") {
                            onUnstackCell(sc.id);
                          }
                        }}
                        className="px-1.5 py-0.5 text-[9px] font-mono text-slate-600 dark:text-zinc-300 hover:text-purple-600 rounded cursor-pointer flex items-center gap-0.5 hover:bg-slate-100 dark:hover:bg-zinc-800"
                        title="Unstack to row as standalone block"
                      >
                        <ExternalLink className="w-2.5 h-2.5" />
                        <span>Unstack</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (typeof onDuplicate === "function") {
                            onDuplicate(sc.id, rowId);
                          }
                        }}
                        className="p-0.5 text-slate-500 hover:text-emerald-600 rounded cursor-pointer"
                        title="Duplicate block"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (typeof onDelete === "function") {
                            onDelete(sc.id, rowId);
                          }
                        }}
                        className="p-0.5 text-slate-500 hover:text-rose-500 rounded cursor-pointer"
                        title="Delete block"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  <CanvasBlockRenderer
                    cell={sc}
                    isSelected={isStackedSelected}
                    isPreview={isPreview}
                    onUpdateMetricCard={(card) => {
                      if (typeof onUpdateMetricCard === "function") onUpdateMetricCard(rowId, sc.id, card);
                    }}
                    onUpdateInsight={(text) => {
                      if (typeof onUpdateInsight === "function") onUpdateInsight(rowId, sc.id, text);
                    }}
                    onUpdateTextBlock={(content) => {
                      if (typeof onUpdateTextBlock === "function") onUpdateTextBlock(rowId, sc.id, content);
                    }}
                    onUpdateBadgeStrip={(strip) => {
                      if (typeof onUpdateBadgeStrip === "function") onUpdateBadgeStrip(rowId, sc.id, strip);
                    }}
                    onUpdateSingleBadge={(badgeId, patch) => {
                      if (typeof onUpdateSingleBadge === "function") onUpdateSingleBadge(rowId, sc.id, badgeId, patch);
                    }}
                    onAddBadge={() => {
                      if (typeof onAddBadge === "function") onAddBadge(rowId, sc.id);
                    }}
                    onDeleteBadge={(badgeId) => {
                      if (typeof onDeleteBadge === "function") onDeleteBadge(rowId, sc.id, badgeId);
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Canva-style Bottom Edge Drop Zone & In-Card Stack Button */}
        {!isPreview && !isSelfDragging && (
          <div
            ref={setStackDropRef}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.dataTransfer.dropEffect = "copy";
              if (!isDragOverBottom) setIsDragOverBottom(true);
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setIsDragOverBottom(false);
              }
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragOverBottom(false);
              try {
                const raw = e.dataTransfer.getData("application/json");
                if (!raw) return;
                const data = JSON.parse(raw);
                if (typeof onDropToStack === "function") {
                  onDropToStack(cell.id, data);
                }
              } catch (err) {
                console.error("Drop to stack error:", err);
              }
            }}
            onClick={(e) => {
              e.stopPropagation();
              setQuickAddOpen((prev) => !prev);
            }}
            className={`w-full transition-all duration-150 flex items-center justify-center rounded-xl cursor-pointer select-none ${
              isStackDropOver || isDragOverBottom
                ? "py-3 bg-purple-500/25 border-2 border-dashed border-[#8B3DFF] text-[#8B3DFF] text-xs font-bold shadow-lg scale-101 animate-pulse"
                : isOtherDragging
                ? "py-2 bg-purple-50/70 dark:bg-purple-950/40 border border-dashed border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 text-[10px] font-semibold"
                : isSelected
                ? "py-1.5 border border-dashed border-purple-300/80 dark:border-purple-800/80 hover:bg-purple-50/60 dark:hover:bg-purple-950/30 text-purple-600 dark:text-purple-400 text-[10px] font-medium"
                : "py-1 opacity-0 group-hover/cell:opacity-100 hover:py-1.5 border border-dashed border-slate-300 dark:border-zinc-700 hover:border-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 text-slate-500 hover:text-purple-600 text-[10px] font-medium"
            }`}
            title="Drop card or click to stack another block directly below in this column"
          >
            <div className="flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span>
                {isStackDropOver || isDragOverBottom
                  ? "Drop here to stack into this column"
                  : isOtherDragging
                  ? "Drop to stack below"
                  : "Stack block below"}
              </span>
            </div>
          </div>
        )}

        {/* Quick Add Menu Popup (Canva-Style In-Place Block Adder) */}
        {quickAddOpen && !isPreview && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl flex items-center gap-1.5 z-40 text-xs animate-scaleUp"
          >
            <button
              type="button"
              onClick={() => {
                const ts = Date.now();
                if (typeof onStackCellBelow === "function") {
                  onStackCellBelow({
                    id: `cell-mc-${ts}`,
                    colSpan: cell.colSpan || 1,
                    blockType: "metric-card",
                    metricCard: {
                      id: `mc-${ts}`,
                      label: "New KPI Indicator",
                      value: "96.5%",
                      tintColor: "blue",
                      trendDirection: "up",
                      trendValue: "+1.8%",
                    },
                  });
                }
                setQuickAddOpen(false);
              }}
              className="px-2.5 py-1 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-[#8B3DFF] font-semibold text-[11px] cursor-pointer flex items-center gap-1"
            >
              <Activity className="w-3 h-3" /> Metric Card
            </button>
            <button
              type="button"
              onClick={() => {
                const ts = Date.now();
                if (typeof onStackCellBelow === "function") {
                  onStackCellBelow({
                    id: `cell-tb-${ts}`,
                    colSpan: cell.colSpan || 1,
                    blockType: "text",
                    textBlock: { id: `tb-${ts}`, content: "" },
                  });
                }
                setQuickAddOpen(false);
              }}
              className="px-2.5 py-1 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 font-semibold text-[11px] cursor-pointer flex items-center gap-1"
            >
              <Type className="w-3 h-3" /> Text Block
            </button>
            <button
              type="button"
              onClick={() => {
                const ts = Date.now();
                if (typeof onStackCellBelow === "function") {
                  onStackCellBelow({
                    id: `cell-ki-${ts}`,
                    colSpan: cell.colSpan || 1,
                    blockType: "insight",
                    insight: { id: `ki-${ts}`, text: "Supervisory insight note." },
                  });
                }
                setQuickAddOpen(false);
              }}
              className="px-2.5 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 font-semibold text-[11px] cursor-pointer flex items-center gap-1"
            >
              <Lightbulb className="w-3 h-3" /> Key Insight
            </button>
            <button
              type="button"
              onClick={() => {
                const ts = Date.now();
                if (typeof onStackCellBelow === "function") {
                  onStackCellBelow({
                    id: `cell-div-${ts}`,
                    colSpan: cell.colSpan || 1,
                    blockType: "divider",
                  });
                }
                setQuickAddOpen(false);
              }}
              className="px-2.5 py-1 rounded-xl bg-slate-500/10 hover:bg-slate-500/20 text-slate-600 dark:text-zinc-300 font-semibold text-[11px] cursor-pointer flex items-center gap-1"
            >
              <Minus className="w-3 h-3" /> Divider
            </button>
            <button
              type="button"
              onClick={() => setQuickAddOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer ml-auto"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
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
  onMoveCellToStackBelow?: (sourceCellId: string, targetCellId: string, rowId: string) => void;
  onStackCellBelow?: (rowId: string, targetCellId: string, cell: CanvasCell) => void;
  onUnstackCell?: (rowId: string, cellId: string) => void;
  onReorderStacked?: (rowId: string, parentCellId: string, direction: "up" | "down", index: number) => void;
  activeDragCellId?: string | null;
  onAddBlockBeside?: (rowId: string, cellIndex: number, blockType: CanvasBlockType) => void;
  zoom?: number;
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
  onMoveCellToStackBelow,
  onStackCellBelow,
  onUnstackCell,
  onReorderStacked,
  activeDragCellId,
  onAddBlockBeside,
  zoom = 1,
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
          <span className="text-slate-600 dark:text-zinc-300 font-sans font-medium">Standard PDF Page Limit (842px) &bull; Moved to Page {currentPageNumber}</span>
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
            <div className="w-full py-5 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-xs text-slate-400 bg-slate-50/50 dark:bg-zinc-900/30">
              <span className="font-medium text-slate-500 dark:text-zinc-400">Empty Row &middot; Drag blocks from sidebar here</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveRow(row.id);
                }}
                className="text-[11px] text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Remove empty row</span>
              </button>
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
                selectedCellId={selectedCellId}
                previousCellId={idx > 0 ? row.cells[idx - 1].id : undefined}
                isPreview={isPreview}
                zoom={zoom}
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
                onMoveToStackBelow={(sourceId, targetId) => {
                  if (typeof onMoveCellToStackBelow === "function") {
                    onMoveCellToStackBelow(sourceId, targetId, row.id);
                  }
                }}
                onStackCellBelow={(newCell) => {
                  if (typeof onStackCellBelow === "function") {
                    onStackCellBelow(row.id, cell.id, newCell);
                  }
                }}
                onUnstackCell={(cellId) => {
                  if (typeof onUnstackCell === "function") {
                    onUnstackCell(row.id, cellId);
                  }
                }}
                onReorderStacked={(parentCellId, dir, index) => {
                  if (typeof onReorderStacked === "function") {
                    onReorderStacked(row.id, parentCellId, dir, index);
                  }
                }}
                onDropToStack={(targetCellId, data) => {
                  if (data?.blockType && typeof onDropBlock === "function") {
                    onDropBlock({ ...data, targetRowId: row.id, targetStackCellId: targetCellId });
                  } else if (data?.cell?.id && typeof onMoveCellToStackBelow === "function") {
                    onMoveCellToStackBelow(data.cell.id, targetCellId, row.id);
                  }
                }}
                activeDragCellId={activeDragCellId}
                onAddBlockBeside={onAddBlockBeside}
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
  wmLayer,
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
  wmLayer: "back" | "front";
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
      className={`absolute inset-0 select-none ${isWatermarkSelected ? "z-30" : wmLayer === "back" ? "z-[5]" : "z-20"} overflow-hidden flex p-8 sm:p-12 transition-all duration-300 ${
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
                  onClick={() => onUpdateWatermarkConfig?.({ layer: wmLayer === "back" ? "front" : "back" })}
                  className="w-5 h-5 rounded hover:bg-purple-100 text-slate-600 flex items-center justify-center cursor-pointer"
                  title={wmLayer === "back" ? "Bring watermark in front of page content" : "Send watermark behind page content"}
                  aria-label={wmLayer === "back" ? "Bring watermark forward" : "Send watermark backward"}
                >
                  <Layers className="w-3.5 h-3.5" />
                </button>

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

type HeaderTitleFormat = {
  fontFamily: "sans" | "serif" | "mono" | "rounded";
  fontSize: number;
  color: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  textAlign: "left" | "center" | "right";
};

const DEFAULT_HEADER_TITLE_FORMAT: HeaderTitleFormat = {
  fontFamily: "sans",
  fontSize: 19,
  color: "#1836a0",
  bold: true,
  italic: false,
  underline: false,
  textAlign: "left",
};

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
  showRulers?: boolean;
  onToggleRulers?: () => void;
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
  onMoveCellToStackBelow?: (sourceCellId: string, targetCellId: string, rowId: string) => void;
  onStackCellBelow?: (rowId: string, targetCellId: string, cell: CanvasCell) => void;
  onUnstackCell?: (rowId: string, cellId: string) => void;
  onReorderStacked?: (rowId: string, parentCellId: string, direction: "up" | "down", index: number) => void;
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
  showRulers = false,
  onToggleRulers,
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
  onMoveCellToStackBelow,
  onStackCellBelow,
  onUnstackCell,
  onReorderStacked,
}: CanvasStudioProps) {
  const dispatch = useDispatch();
  const rows = section.canvasRows || [];

  const activePageWidth = A4_WIDTH_PX;
  const activePageHeight = A4_HEIGHT_PX;

  // Multi-page layout engine: partitions rows across authentic A4 sheets (calibrated for standard 842px sheet height)
  const pages = useMemo(() => {
    return partitionCanvasPages(rows, marginConfig, pageNumber, activePageHeight);
  }, [rows, marginConfig, pageNumber, activePageHeight]);

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
  const [internalShowRulers, setInternalShowRulers] = useState(false);
  const [rulerUnit, setRulerUnit] = useState<RulerUnit>("px");
  const [pageMousePos, setPageMousePos] = useState<Record<number, { x: number; y: number } | null>>({});
  const [internalIsPreview, setInternalIsPreview] = useState(false);
  const [headerValuesBySection, setHeaderValuesBySection] = useState<
    Record<
      string,
      {
        taglinePrimary: string;
        taglinePrimaryHtml?: string;
        taglineSecondary: string;
        taglineSecondaryHtml?: string;
        title: string;
        titleHtml?: string;
        period: string;
        periodHtml?: string;
      }
    >
  >({});
  const [headerTitleFormatsBySection, setHeaderTitleFormatsBySection] = useState<Record<string, HeaderTitleFormat>>({});
  const [editingHeaderValue, setEditingHeaderValue] = useState<"taglinePrimary" | "taglineSecondary" | "title" | "period" | null>(null);
  const [isHeaderTitleFormatOpen, setIsHeaderTitleFormatOpen] = useState(false);
  const [footerValuesBySection, setFooterValuesBySection] = useState<
    Record<
      string,
      {
        company: string;
        companyHtml?: string;
        websites: string;
        websitesHtml?: string;
        quote: string;
        quoteHtml?: string;
      }
    >
  >({});
  const [editingFooterValue, setEditingFooterValue] = useState<"company" | "websites" | "quote" | null>(null);

  const headerValues = headerValuesBySection[section.id] || {
    taglinePrimary: "Visibility for Every Worker;",
    taglinePrimaryHtml: "",
    taglineSecondary: "Intelligence for Every Site.",
    taglineSecondaryHtml: "",
    title: "Monthly Report",
    titleHtml: "",
    period: "01 Sept 2025 - 30 Sept 2025",
    periodHtml: "",
  };
  const headerTitleFormat = headerTitleFormatsBySection[section.id] || DEFAULT_HEADER_TITLE_FORMAT;
  const headerTitleFontFamily = {
    sans: "var(--font-geist-sans), Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    mono: "ui-monospace, SFMono-Regular, Menlo, monospace",
    rounded: "var(--font-geist-sans), 'Trebuchet MS', sans-serif",
  }[headerTitleFormat.fontFamily];
  const headerTitleTextStyle: React.CSSProperties = {
    fontFamily: headerTitleFontFamily,
    fontSize: `${headerTitleFormat.fontSize}px`,
    color: headerTitleFormat.color,
    fontWeight: headerTitleFormat.bold ? 900 : 500,
    fontStyle: headerTitleFormat.italic ? "italic" : "normal",
    textDecoration: headerTitleFormat.underline ? "underline" : "none",
    textAlign: headerTitleFormat.textAlign,
  };

  const updateHeaderTitleFormat = <Key extends keyof HeaderTitleFormat,>(
    field: Key,
    value: HeaderTitleFormat[Key]
  ) => {
    setHeaderTitleFormatsBySection((current) => ({
      ...current,
      [section.id]: { ...(current[section.id] || DEFAULT_HEADER_TITLE_FORMAT), [field]: value },
    }));
  };

  const updateHeaderValue = (field: "taglinePrimary" | "taglineSecondary" | "title" | "period", value: string) => {
    setHeaderValuesBySection((current) => ({
      ...current,
      [section.id]: { ...headerValues, [field]: value },
    }));
  };

  const updateHeaderValueWithHtml = (
    field: "taglinePrimary" | "taglineSecondary" | "title" | "period",
    plainText: string,
    html: string
  ) => {
    setHeaderValuesBySection((current) => ({
      ...current,
      [section.id]: {
        ...headerValues,
        [field]: plainText,
        [`${field}Html`]: html,
      },
    }));
    setEditingHeaderValue(null);
  };

  const commitHeaderValue = () => setEditingHeaderValue(null);

  const footerValues = footerValuesBySection[section.id] || {
    company: "AyantrAI Private Limited",
    companyHtml: "",
    websites: "www.ayantrai.com  |  www.sitesafe.ai",
    websitesHtml: "",
    quote: "Every Worker Returns Home Safe",
    quoteHtml: "",
  };

  const updateFooterValue = (field: "company" | "websites" | "quote", value: string) => {
    setFooterValuesBySection((current) => ({
      ...current,
      [section.id]: { ...footerValues, [field]: value },
    }));
  };

  const updateFooterValueWithHtml = (
    field: "company" | "websites" | "quote",
    plainText: string,
    html: string
  ) => {
    setFooterValuesBySection((current) => ({
      ...current,
      [section.id]: {
        ...footerValues,
        [field]: plainText,
        [`${field}Html`]: html,
      },
    }));
    setEditingFooterValue(null);
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
  const activeShowRulers = showRulers !== undefined ? showRulers : internalShowRulers;
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

  const handleToggleRulers = useCallback(() => {
    if (typeof onToggleRulers === "function") {
      onToggleRulers();
    } else {
      setInternalShowRulers((prev) => !prev);
    }
  }, [onToggleRulers]);

  // Keyboard Shortcut: Shift + R toggles rulers (Canva / Figma standard)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      const isInput =
        activeTag === "input" ||
        activeTag === "textarea" ||
        (document.activeElement as HTMLElement)?.isContentEditable;
      if (isInput) return;

      if (e.shiftKey && e.key.toLowerCase() === "r" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleToggleRulers();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleToggleRulers]);

  // Selected box bounds for live ruler highlight band
  const getSelectedBoxForPage = useCallback(
    (pageIndex: number) => {
      if (!activeSelectedCellId) return null;
      const cellEl = document.getElementById(`canvas-cell-${activeSelectedCellId}`);
      const pageEl = document.getElementById(`canvas-page-${pageIndex}`);
      if (!cellEl || !pageEl) return null;
      const cellRect = cellEl.getBoundingClientRect();
      const pageRect = pageEl.getBoundingClientRect();
      if (cellRect.bottom < pageRect.top || cellRect.top > pageRect.bottom) {
        return null;
      }
      return {
        x: Math.max(0, Math.round((cellRect.left - pageRect.left) / activeZoom)),
        y: Math.max(0, Math.round((cellRect.top - pageRect.top) / activeZoom)),
        width: Math.round(cellRect.width / activeZoom),
        height: Math.round(cellRect.height / activeZoom),
      };
    },
    [activeSelectedCellId, activeZoom]
  );

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

  // Custom collision detection prioritizing directional droppable zones
  const customCollisionDetection = useCallback((args: any) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
      // Prioritize explicit directional drop zones (stacking bottom or beside edge)
      const stackCollision = pointerCollisions.find((c: any) =>
        String(c.id).startsWith("stack-drop-")
      );
      if (stackCollision) {
        return [stackCollision, ...pointerCollisions.filter((c: any) => c.id !== stackCollision.id)];
      }

      const besideCollision = pointerCollisions.find((c: any) =>
        String(c.id).startsWith("beside-drop-")
      );
      if (besideCollision) {
        return [besideCollision, ...pointerCollisions.filter((c: any) => c.id !== besideCollision.id)];
      }

      return pointerCollisions;
    }

    const rectCollisions = rectIntersection(args);
    if (rectCollisions.length > 0) {
      const stackCollision = rectCollisions.find((c: any) =>
        String(c.id).startsWith("stack-drop-")
      );
      if (stackCollision) {
        return [stackCollision, ...rectCollisions.filter((c: any) => c.id !== stackCollision.id)];
      }
      return rectCollisions;
    }

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

  const handleAddBlockBeside = useCallback(
    (rowId: string, cellIndex: number, blockType: CanvasBlockType = "text") => {
      const ts = Date.now();
      let newCell: CanvasCell;
      if (blockType === "metric-card") {
        newCell = {
          id: `cell-mc-${ts}`,
          colSpan: 1,
          blockType: "metric-card",
          metricCard: {
            id: `mc-${ts}`,
            label: "New KPI Indicator",
            value: "96.5%",
            tintColor: "blue",
            trendDirection: "up",
            trendValue: "+1.8%",
          },
        };
      } else if (blockType === "insight") {
        newCell = {
          id: `cell-ki-${ts}`,
          colSpan: 1,
          blockType: "insight",
          insight: { id: `ki-${ts}`, text: "Supervisory insight note." },
        };
      } else {
        newCell = {
          id: `cell-tb-${ts}`,
          colSpan: 1,
          blockType: "text",
          textBlock: { id: `tb-${ts}`, content: "" },
        };
      }
      dispatch(addCellToRow({ sectionId: section.id, rowId, cell: newCell, insertAtIndex: cellIndex }));
      handleSelectCell(newCell.id, rowId);
      dispatch(showGlobalToast({ message: "Added new column beside!", type: "success" }));
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
    const activeId = String(active.id);
    const overId = String(over.id);

    // 1. Stack drop (dragged block dropped onto bottom stack-drop zone)
    if (overData?.isStackDrop || overId.startsWith("stack-drop-")) {
      const targetCellId = (overData?.targetCellId as string) || overId.replace("stack-drop-", "");
      const toRowId = (overData?.rowId as string) || (activeData?.rowId as string);
      const fromRowId = (activeData?.rowId as string) || toRowId;

      if (activeId !== targetCellId && toRowId) {
        dispatch(
          moveCellToStackBelow({
            sectionId: section.id,
            fromRowId,
            toRowId,
            sourceCellId: activeId,
            targetCellId,
          })
        );
        handleSelectCell(activeId, toRowId);
        dispatch(
          showGlobalToast({
            message: "Stacked card directly underneath into column!",
            type: "success",
          })
        );
      }
      return;
    }

    // 2. Beside drop (dragged block dropped onto right edge beside-drop zone)
    if (overData?.isBesideDrop || overId.startsWith("beside-drop-")) {
      const targetCellId = (overData?.targetCellId as string) || overId.replace("beside-drop-", "");
      const toRowId = (overData?.rowId as string) || (activeData?.rowId as string);
      const fromRowId = (activeData?.rowId as string) || toRowId;

      if (activeId !== targetCellId && toRowId) {
        const toRow = rows.find((r) => r.id === toRowId);
        if (toRow) {
          const targetIndex = toRow.cells.findIndex((c) => c.id === targetCellId);
          const insertIdx = targetIndex !== -1 ? targetIndex + 1 : toRow.cells.length;

          if (fromRowId === toRowId) {
            const oldIndex = toRow.cells.findIndex((c) => c.id === activeId);
            if (oldIndex !== -1 && oldIndex !== insertIdx) {
              const newCells = arrayMove(toRow.cells, oldIndex, oldIndex < insertIdx ? insertIdx - 1 : insertIdx);
              dispatch(reorderCellsInRow({ sectionId: section.id, rowId: toRowId, cells: newCells }));
            }
          } else if (fromRowId) {
            dispatch(
              moveCellBetweenRows({
                sectionId: section.id,
                fromRowId,
                toRowId,
                cellId: activeId,
                toIndex: insertIdx,
              })
            );
          }
          handleSelectCell(activeId, toRowId);
          dispatch(
            showGlobalToast({
              message: "Placed card beside in row!",
              type: "success",
            })
          );
        }
      }
      return;
    }

    // 3. Row reordering
    if (activeData?.isRow) {
      const oldIndex = rows.findIndex((r) => r.id === active.id);
      const newIndex = rows.findIndex((r) => r.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const newRows = arrayMove(rows, oldIndex, newIndex);
        dispatch(reorderCanvasRows({ sectionId: section.id, rows: newRows }));
      }
      return;
    }

    // 4. Cell reordering inside same row or cross-row
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
            dispatch(showGlobalToast({ message: "Moved card to new row!", type: "success" }));
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
      ? "bg-slate-50 text-slate-900"
      : paperTone === "paper" || paperTone === "cream"
      ? "bg-[#faf8f5] text-slate-900"
      : paperTone === "linen"
      ? "bg-[#f4f1ea] text-slate-900"
      : paperTone === "ice"
      ? "bg-[#f0f7ff] text-slate-900"
      : paperTone === "mint"
      ? "bg-[#f2f9f5] text-slate-900"
      : paperTone === "rose"
      ? "bg-[#fff5f7] text-slate-900"
      : paperTone === "amber"
      ? "bg-[#fffbeb] text-slate-900"
      : paperTone === "dark"
      ? "bg-[#0f172a] text-white"
      : !isCustomColor
      ? "bg-white text-slate-900"
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
  const wmLayer = watermarkConfig?.layer ?? "back";

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
        className="relative flex-1 min-h-0 overflow-auto p-6 sm:p-10 flex flex-col items-center select-none bg-[#f1f4f9] dark:bg-[#06080d]"
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
            width: activeShowRulers && !activeIsPreview ? `${activePageWidth + 32}px` : `${activePageWidth}px`,
            minWidth: activeShowRulers && !activeIsPreview
              ? `${Math.round((activePageWidth + 32) * Math.max(1, activeZoom))}px`
              : `${Math.round(activePageWidth * Math.max(1, activeZoom))}px`,
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
                    <div
                      className="flex items-center gap-4 my-2 text-xs select-none"
                      style={{
                        width: `${activePageWidth}px`,
                        marginLeft: activeShowRulers && !activeIsPreview ? "32px" : undefined,
                      }}
                    >
                      <div className="flex-1 border-t-2 border-dashed border-purple-300 dark:border-purple-900/60" />
                      <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-zinc-800 border-2 border-purple-300 dark:border-purple-700 text-slate-700 dark:text-zinc-200 font-mono font-bold text-[11px] shadow-md">
                        <Layers className="w-4 h-4 text-[#8B3DFF] animate-pulse" />
                        <span className="text-[#8B3DFF] font-black">AUTO PAGE BREAKER</span>
                        <span className="text-slate-300 dark:text-zinc-600">&bull;</span>
                        <span>Page {page.pageNumber} of {pages.length}</span>
                        <span className="text-slate-300 dark:text-zinc-600">&bull;</span>
                        <span className="text-slate-500 dark:text-zinc-400 font-medium">
                          Standard PDF A4 (595 × 842 px)
                        </span>
                      </div>
                      <div className="flex-1 border-t-2 border-dashed border-purple-300 dark:border-purple-900/60" />
                    </div>
                  )}

                  {/* ── Page Ruler & Artboard Wrapper ── */}
                  <div
                    key={`page-ruler-wrapper-${page.pageIndex}`}
                    className="relative"
                    style={{
                      marginTop: activeShowRulers && !activeIsPreview ? "24px" : undefined,
                      marginLeft: activeShowRulers && !activeIsPreview ? "32px" : undefined,
                    }}
                    onMouseMove={(e) => {
                      if (!activeShowRulers || activeIsPreview) return;
                      const pageEl = document.getElementById(`canvas-page-${page.pageIndex}`);
                      if (!pageEl) return;
                      const rect = pageEl.getBoundingClientRect();
                      const x = Math.round((e.clientX - rect.left) / activeZoom);
                      const y = Math.round((e.clientY - rect.top) / activeZoom);
                      setPageMousePos((prev) => ({
                        ...prev,
                        [page.pageIndex]: {
                          x: Math.max(0, Math.min(activePageWidth, x)),
                          y: Math.max(0, Math.min(activePageHeight, y)),
                        },
                      }));
                    }}
                    onMouseLeave={() => {
                      setPageMousePos((prev) => ({
                        ...prev,
                        [page.pageIndex]: null,
                      }));
                    }}
                  >
                    {/* ── Precision Figma/Canva Style Canvas Ruler Overlay ── */}
                    {activeShowRulers && !activeIsPreview && (
                      <CanvasRuler
                        pageWidth={activePageWidth}
                        pageHeight={activePageHeight}
                        marginConfig={marginConfig}
                        activeMousePos={pageMousePos[page.pageIndex] || null}
                        selectedBox={getSelectedBoxForPage(page.pageIndex)}
                        unit={rulerUnit}
                        onUnitChange={(u) => setRulerUnit(u)}
                        isDark={isDarkPaper}
                      />
                    )}

                    {/* ── Fixed A4 Artboard Sheet ── */}
                    <div
                      id={`canvas-page-${page.pageIndex}`}
                    style={{
                      ...customPaperStyle,
                      borderRadius: "2px",
                      width: `${activePageWidth}px`,
                      minWidth: `${activePageWidth}px`,
                      maxWidth: `${activePageWidth}px`,
                      height: `${activePageHeight}px`,
                      minHeight: `${activePageHeight}px`,
                      maxHeight: `${activePageHeight}px`,
                      boxSizing: "border-box",
                    }}
                    className={`relative ${paperBgClass} border border-slate-200/90 dark:border-zinc-800 ${
                      editingHeaderValue || editingSectionField || editingFooterValue ? "overflow-visible" : "overflow-hidden"
                    } transition-all duration-200 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_25px_50px_-12px_rgba(0,0,0,0.18),0_0_0_1px_rgba(0,0,0,0.05)] flex flex-col justify-between`}
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
                          borderRadius: "2px",
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
                      wmLayer={wmLayer}
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
                      {/* Top Header (Standard across Page 1, Page 2, and all pages) */}
                      <div>
                          {/* Fixed Sitesafe Report Header */}
                          <div
                            className="relative z-30 min-h-[110px] border-b border-slate-200/80 overflow-visible"
                            style={{ backgroundColor: paperTone === "dark" ? "#0f172a" : undefined }}
                          >
                            <div className="relative grid min-h-[110px] grid-cols-[minmax(0,105px)_minmax(0,1.5fr)_minmax(0,1.2fr)_65px] items-stretch gap-0 px-0 py-0 overflow-visible">
                              <div className="flex min-w-0 flex-col justify-center px-2 py-1">
                                <Image
                                  src="/sitesafe-header-logo.svg"
                                  alt="Sitesafe by AyantrAI"
                                  width={1254}
                                  height={1254}
                                  className="h-[95px] w-[95px] object-contain object-left"
                                  priority
                                />
                              </div>

                              <div className={`min-w-0 flex flex-col justify-center ${editingHeaderValue === "taglinePrimary" || editingHeaderValue === "taglineSecondary" ? "relative z-50" : "relative z-10"}`}>
                               <div className="flex flex-col gap-0.5 border-l-2 border-[#2454d8] pl-2.5 px-3 py-2">
                                 {editingHeaderValue === "taglinePrimary" ? (
                                   <DynamicTextEditor
                                     initialValue={headerValues.taglinePrimary}
                                     initialHtml={headerValues.taglinePrimaryHtml}
                                     defaultFontSize={13}
                                     multiline={false}
                                     toolbarPosition="top"
                                     className="text-[13px] font-semibold italic leading-tight text-[#2454d8]"
                                     onSave={(plain, html) => updateHeaderValueWithHtml("taglinePrimary", plain, html)}
                                     onCancel={() => setEditingHeaderValue(null)}
                                   />
                                 ) : (
                                   <p
                                     className="cursor-text text-[13px] font-semibold italic leading-tight text-[#2454d8]"
                                     onClick={() => !activeIsPreview && setEditingHeaderValue("taglinePrimary")}
                                     onDoubleClick={() => !activeIsPreview && setEditingHeaderValue("taglinePrimary")}
                                     title="Double-click to format primary report tagline (Word style)"
                                   >
                                     {renderDynamicText(headerValues.taglinePrimaryHtml, headerValues.taglinePrimary)}
                                   </p>
                                 )}
                                 {editingHeaderValue === "taglineSecondary" ? (
                                   <DynamicTextEditor
                                     initialValue={headerValues.taglineSecondary}
                                     initialHtml={headerValues.taglineSecondaryHtml}
                                     defaultFontSize={13}
                                     multiline={false}
                                     toolbarPosition="bottom"
                                     className="text-[13px] font-semibold italic leading-tight text-[#2454d8]"
                                     onSave={(plain, html) => updateHeaderValueWithHtml("taglineSecondary", plain, html)}
                                     onCancel={() => setEditingHeaderValue(null)}
                                   />
                                 ) : (
                                   <p
                                     className="cursor-text text-[13px] font-semibold italic leading-tight text-[#2454d8]"
                                     onClick={() => !activeIsPreview && setEditingHeaderValue("taglineSecondary")}
                                     onDoubleClick={() => !activeIsPreview && setEditingHeaderValue("taglineSecondary")}
                                     title="Double-click to format secondary report tagline (Word style)"
                                   >
                                     {renderDynamicText(headerValues.taglineSecondaryHtml, headerValues.taglineSecondary)}
                                   </p>
                                 )}
                                </div>
                              </div>

                              <div className={`min-w-0 flex flex-col justify-center px-2 py-2 ${editingHeaderValue === "title" || editingHeaderValue === "period" ? "relative z-50" : "relative z-10"}`}>
                                <div className="relative">
                                  {editingHeaderValue === "title" ? (
                                    <DynamicTextEditor
                                      initialValue={headerValues.title}
                                      initialHtml={headerValues.titleHtml}
                                      defaultFontSize={headerTitleFormat.fontSize || 22}
                                      multiline={false}
                                      toolbarPosition="top"
                                      toolbarAlign="right"
                                      className="text-lg sm:text-xl font-black leading-tight"
                                      onSave={(plain, html) => updateHeaderValueWithHtml("title", plain, html)}
                                      onCancel={() => setEditingHeaderValue(null)}
                                    />
                                  ) : (
                                    <p
                                      className="cursor-text pr-5 leading-tight"
                                      style={headerTitleTextStyle}
                                      onClick={() => !activeIsPreview && setEditingHeaderValue("title")}
                                      onDoubleClick={() => !activeIsPreview && setEditingHeaderValue("title")}
                                      title="Double-click to format report title (Word style)"
                                    >
                                      {renderDynamicText(headerValues.titleHtml, headerValues.title)}
                                    </p>
                                  )}
                                </div>
                                {editingHeaderValue === "period" ? (
                                  <DynamicTextEditor
                                    initialValue={headerValues.period}
                                    initialHtml={headerValues.periodHtml}
                                    defaultFontSize={11}
                                    multiline={false}
                                    toolbarPosition="bottom"
                                    toolbarAlign="right"
                                    className="mt-0.5 text-[11px] font-semibold leading-tight text-[#1836a0]"
                                    onSave={(plain, html) => updateHeaderValueWithHtml("period", plain, html)}
                                    onCancel={() => setEditingHeaderValue(null)}
                                  />
                                ) : (
                                  <p
                                    className="mt-0.5 cursor-text text-[11px] font-semibold leading-tight text-[#1836a0]"
                                    onClick={() => !activeIsPreview && setEditingHeaderValue("period")}
                                    onDoubleClick={() => !activeIsPreview && setEditingHeaderValue("period")}
                                    title="Double-click to format report period (Word style)"
                                  >
                                    {renderDynamicText(headerValues.periodHtml, headerValues.period)}
                                  </p>
                                )}
                                <div className="mt-1 h-0.5 w-10 rounded-full bg-[#2454d8]" />
                              </div>
                              {/* Page Badge - flush right, full height */}
                              <div className="flex flex-col items-center justify-center border-l-2 border-[#2454d8] bg-[#18344f] text-white [clip-path:polygon(0_0,100%_0,100%_100%,28%_100%,0_76%)]">
                                <span className="text-[9px] font-semibold">Page</span>
                                <span className="text-[20px] font-black leading-none">{String(page.pageNumber).padStart(2, "0")}</span>
                              </div>
                            </div>
                          </div>

                          {/* Section-specific Header Bar (Pixel-Perfect Matching Design Target) */}
                          <div
                            className={`relative ${editingSectionField ? "z-50" : "z-10"} px-0 group/section-header transition-all select-text ${
                              section.headerSpacing === "compact"
                                ? "pt-2 pb-1.5"
                                : section.headerSpacing === "spacious"
                                ? "pt-7 pb-6"
                                : "pt-4 pb-3.5"
                            }`}
                            style={{ backgroundColor: getPaperToneColor(paperTone) }}
                          >
                            {editingSectionField === "eyebrow" ? (
                              <div className="w-full mb-3">
                                <DynamicTextEditor
                                  initialValue={section.eyebrow}
                                  initialHtml={section.eyebrowHtml || getFallbackEyebrowHtml(section.eyebrow, isDarkPaper)}
                                  isDarkPaper={isDarkPaper}
                                  defaultFontSize={12.5}
                                  multiline={false}
                                  className="text-[12.5px] font-bold uppercase tracking-[0.15em]"
                                  placeholder="Section eyebrow..."
                                  onSave={(newVal, newHtml) => {
                                    dispatch(
                                      updateLibrarySection({
                                        id: section.id,
                                        eyebrow: newVal,
                                        eyebrowHtml: newHtml,
                                        changes: {
                                          eyebrow: newVal,
                                          eyebrowHtml: newHtml,
                                        },
                                      })
                                    );
                                    setLocalSectionEyebrow(newVal);
                                    setEditingSectionField(null);
                                    dispatch(showGlobalToast({ message: "Eyebrow updated!", type: "success" }));
                                  }}
                                  onCancel={() => setEditingSectionField(null)}
                                />
                              </div>
                            ) : (
                              <div className="flex items-center justify-between gap-3 mb-1.5">
                                <span
                                  onDoubleClick={() => {
                                    if (!activeIsPreview) {
                                      setEditingSectionField("eyebrow");
                                    }
                                  }}
                                  className="text-[12.5px] font-bold uppercase tracking-[0.15em] font-sans leading-none cursor-pointer transition-colors"
                                  title="Double-click to format eyebrow (Word style)"
                                >
                                  {renderDynamicEyebrow(section.eyebrowHtml, section.eyebrow, sectionTextColor, isDarkPaper)}
                                </span>

                                {/* Right Header Controls: Spacing + Watermark + Edit Header Button */}
                                {!editingSectionField && !activeIsPreview && (
                                  <div className="flex items-center gap-2">
                                    {/* Header Spacing / Height Preset Selector */}
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

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setLocalSectionName(section.name);
                                        setLocalSectionEyebrow(section.eyebrow);
                                        setLocalSectionDesc(section.description);
                                        setEditingSectionField("name");
                                      }}
                                      className="opacity-0 group-hover/section-header:opacity-100 transition-opacity flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-[#2563eb] px-2 py-0.5 rounded hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer"
                                      title="Edit Section Header"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                      <span className="hidden sm:inline">Edit Header</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Main Section Title: Dynamic Word-Style Typography & Color Studio */}
                            {editingSectionField === "name" ? (
                              <DynamicTitleEditor
                                initialName={section.name}
                                initialHtml={section.titleHtml || getFallbackTitleHtml(section.name, isDarkPaper)}
                                isDarkPaper={isDarkPaper}
                                paperTone={paperTone}
                                toolbarPosition="bottom"
                                onSave={(newName, newHtml) => {
                                  dispatch(
                                    updateLibrarySection({
                                      id: section.id,
                                      name: newName,
                                      titleHtml: newHtml,
                                      changes: {
                                        name: newName,
                                        titleHtml: newHtml,
                                      },
                                    })
                                  );
                                  setLocalSectionName(newName);
                                  setEditingSectionField(null);
                                  dispatch(showGlobalToast({ message: "Title updated!", type: "success" }));
                                }}
                                onCancel={() => setEditingSectionField(null)}
                              />
                            ) : (
                              <h1
                                onDoubleClick={() => {
                                  if (!activeIsPreview) {
                                    setEditingSectionField("name");
                                  }
                                }}
                                className="text-3xl sm:text-[38px] lg:text-[40px] font-black tracking-[-0.035em] leading-[1.08] cursor-pointer mt-1"
                                title="Double-click to format title (Word style)"
                              >
                                {renderDynamicTitle(section.titleHtml, section.name, sectionTextColor, isDarkPaper)}
                              </h1>
                            )}

                            {editingSectionField === "description" ? (
                              <DynamicTextEditor
                                initialValue={section.description}
                                initialHtml={section.descriptionHtml}
                                isDarkPaper={isDarkPaper}
                                defaultFontSize={14}
                                multiline={true}
                                className="text-[14px] sm:text-[14.5px] leading-relaxed font-normal min-h-[50px]"
                                placeholder="Section description..."
                                onSave={(newVal, newHtml) => {
                                  dispatch(
                                    updateLibrarySection({
                                      id: section.id,
                                      description: newVal,
                                      descriptionHtml: newHtml,
                                      changes: {
                                        description: newVal,
                                        descriptionHtml: newHtml,
                                      },
                                    })
                                  );
                                  setLocalSectionDesc(newVal);
                                  setEditingSectionField(null);
                                  dispatch(showGlobalToast({ message: "Description updated!", type: "success" }));
                                }}
                                onCancel={() => setEditingSectionField(null)}
                              />
                            ) : section.description || section.descriptionHtml ? (
                              <p
                                onDoubleClick={() => {
                                  if (!activeIsPreview) {
                                    setEditingSectionField("description");
                                  }
                                }}
                                className={`text-[14px] sm:text-[14.5px] mt-2 max-w-4xl leading-relaxed cursor-pointer font-normal ${
                                  isDarkPaper && !sectionTextColor
                                    ? "text-zinc-300"
                                    : !sectionTextColor
                                    ? "text-[#4b556b]"
                                    : ""
                                }`}
                                style={sectionTextColor ? { color: sectionTextColor, opacity: 0.9 } : undefined}
                                title="Double-click to format description (Word style)"
                              >
                                {renderDynamicText(section.descriptionHtml, section.description, sectionTextColor)}
                              </p>
                            ) : null}
                          </div>
                        </div>

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
                          <div className="space-y-3.5">
                            {/* Drop zone at the top of this page */}
                            {!activeIsPreview && page.rows.length > 0 && (
                              <DropInsertZone
                                insertIndex={Math.max(0, rows.findIndex((r) => r.id === page.rows[0]?.id))}
                                onAddRow={handleInsertRowAtIndex}
                                onDropBlock={onDropBlock}
                                label={page.isFirstPage ? "Drop to insert at top of report" : `Drop to insert at top of Page ${page.pageNumber}`}
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
                                    zoom={activeZoom}
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
                                    onMoveCellToStackBelow={onMoveCellToStackBelow}
                                    onStackCellBelow={onStackCellBelow}
                                    onUnstackCell={onUnstackCell}
                                    onReorderStacked={onReorderStacked}
                                    activeDragCellId={activeDragCell?.id || null}
                                    onAddBlockBeside={handleAddBlockBeside}
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
                      {/* Standard Corporate Footer (Consistent across Page 1, Page 2, and all pages) */}
                      <footer
                        className="relative z-10 mt-auto grid grid-cols-[1.1fr_1fr_1.1fr] items-center gap-6 border-t border-slate-200/80 dark:border-zinc-800/60 px-0 pt-4 pb-2"
                        style={{ backgroundColor: getPaperToneColor(paperTone) }}
                      >
                        <div className={`min-w-0 ${editingFooterValue === "company" || editingFooterValue === "websites" ? "relative z-50" : "relative z-10"}`}>
                          {editingFooterValue === "company" ? (
                            <DynamicTextEditor
                              initialValue={footerValues.company}
                              initialHtml={footerValues.companyHtml}
                              defaultFontSize={14}
                              multiline={false}
                              toolbarPosition="top"
                              className="text-sm font-bold text-[#1836a0]"
                              onSave={(plain, html) => updateFooterValueWithHtml("company", plain, html)}
                              onCancel={() => setEditingFooterValue(null)}
                            />
                          ) : (
                            <p
                              className="cursor-text text-sm font-bold text-[#1836a0]"
                              onDoubleClick={() => !activeIsPreview && setEditingFooterValue("company")}
                              title="Double-click to format company name (Word style)"
                            >
                              {renderDynamicText(footerValues.companyHtml, footerValues.company)}
                            </p>
                          )}
                          {editingFooterValue === "websites" ? (
                            <DynamicTextEditor
                              initialValue={footerValues.websites}
                              initialHtml={footerValues.websitesHtml}
                              defaultFontSize={12}
                              multiline={false}
                              toolbarPosition="top"
                              className="mt-1 text-xs font-semibold text-[#1836a0]"
                              onSave={(plain, html) => updateFooterValueWithHtml("websites", plain, html)}
                              onCancel={() => setEditingFooterValue(null)}
                            />
                          ) : (
                            <p
                              className="mt-1 cursor-text text-xs font-semibold text-[#1836a0]"
                              onDoubleClick={() => !activeIsPreview && setEditingFooterValue("websites")}
                              title="Double-click to format website links (Word style)"
                            >
                              {renderDynamicText(footerValues.websitesHtml, footerValues.websites)}
                            </p>
                          )}
                        </div>

                        <div className="h-[2px] w-full bg-[#1836a0]/60" />

                        <div className={`min-w-0 ${editingFooterValue === "quote" ? "relative z-50" : "relative z-10"}`}>
                          {editingFooterValue === "quote" ? (
                            <DynamicTextEditor
                              initialValue={footerValues.quote}
                              initialHtml={footerValues.quoteHtml}
                              defaultFontSize={14}
                              multiline={false}
                              toolbarPosition="top"
                              toolbarAlign="right"
                              className="text-right text-sm font-semibold text-[#1836a0]"
                              onSave={(plain, html) => updateFooterValueWithHtml("quote", plain, html)}
                              onCancel={() => setEditingFooterValue(null)}
                            />
                          ) : (
                            <p
                              className="cursor-text text-right text-sm font-semibold text-[#1836a0]"
                              onDoubleClick={() => !activeIsPreview && setEditingFooterValue("quote")}
                              title="Double-click to format safety quote (Word style)"
                            >
                              &ldquo;{renderDynamicText(footerValues.quoteHtml, footerValues.quote)}&rdquo;
                            </p>
                          )}
                        </div>
                      </footer>
                    </div>
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

        {/* Dimensions & Position Rulers Toggle */}
        <button
          type="button"
          onClick={handleToggleRulers}
          className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
            activeShowRulers ? "text-[#8B3DFF] bg-purple-500/15" : "text-slate-400 hover:text-slate-700"
          }`}
          title="Toggle Dimensions & Position Rulers (Shift+R)"
        >
          <Ruler className="w-3.5 h-3.5" />
        </button>

        {/* Fixed Standard PDF Page Indicator */}
        <div
          className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold text-purple-600 dark:text-purple-300 bg-purple-500/10 border border-purple-500/20 select-none"
          title="Fixed Standard ISO PDF Page (595 × 842 px)"
        >
          PDF 595×842
        </div>

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

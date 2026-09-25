"use client";

import React, { useCallback, useState, useRef, useEffect } from "react";
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
} from "lucide-react";
import { useDispatch } from "react-redux";
import {
  CanvasRow,
  CanvasCell,
  CanvasBlockType,
  LibrarySection,
  LibraryMetricCard,
  addCanvasRow,
  removeCanvasRow,
  addCellToRow,
  moveCellBetweenRows,
  reorderCellsInRow,
  reorderCanvasRows,
  duplicateCanvasCell,
  deleteCanvasCell,
  updateCellColSpan,
  updateCellWidth,
  showGlobalToast,
} from "@/lib/redux/slices/reportModuleSlice";
import { CanvasBlockRenderer } from "./CanvasBlockRenderer";
import { UploadedSvgWatermark, WatermarkStampConfig } from "./watermarkStorage";

// ─── Mathematical fluid width formula for flex-wrap row with gap: 16px ────────
export function getCellWidthStyle(percent: number): string {
  const p = Math.max(15, Math.min(100, Math.round(percent)));
  if (p >= 100) return "100%";
  const gapSub = (16 * (100 - p)) / 100;
  return `calc(${p}% - ${gapSub.toFixed(1)}px)`;
}

// ─── Sortable Cell (All can drag horizontally + fully adjustable width) ────────
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
  onUpdateMetricCard?: (rowId: string, cellId: string, card: LibraryMetricCard) => void;
  onUpdateInsight?: (rowId: string, cellId: string, text: string) => void;
  onUpdateTextBlock?: (rowId: string, cellId: string, content: string) => void;
  isDraggingOverlay?: boolean;
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
  onUpdateMetricCard,
  onUpdateInsight,
  onUpdateTextBlock,
  isDraggingOverlay = false,
}: SortableCellProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: cell.id, data: { rowId, cell }, disabled: isPreview });

  // ── Drag Resizing State (Adjustable fluid width - not locked in ratio) ──
  const initialPercent = cell.customWidth ?? (cell.colSpan * 25);
  const [isResizing, setIsResizing] = useState(false);
  const [resizePercent, setResizePercent] = useState<number>(initialPercent);
  const cellDomRef = useRef<HTMLDivElement | null>(null);

  // Keep internal resizePercent in sync if external props change
  useEffect(() => {
    setResizePercent(cell.customWidth ?? (cell.colSpan * 25));
  }, [cell.customWidth, cell.colSpan]);

  const currentPercent = isResizing ? resizePercent : (cell.customWidth ?? (cell.colSpan * 25));
  const widthStyle = getCellWidthStyle(currentPercent);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    setResizePercent(currentPercent);

    const startX = e.clientX;
    const startWidthPercent = currentPercent;

    const rowEl = cellDomRef.current?.closest(".canvas-row-cells") as HTMLElement | null;
    const rowWidth = rowEl ? rowEl.getBoundingClientRect().width : 800;

    let computedPercent = startWidthPercent;

    const handleMouseMove = (ev: MouseEvent) => {
      const deltaX = ev.clientX - startX;
      const deltaPercent = (deltaX / rowWidth) * 100;
      // Fluid adjustable percentage in 1% steps from 15% to 100%
      const nextPercent = Math.max(15, Math.min(100, Math.round(startWidthPercent + deltaPercent)));
      computedPercent = nextPercent;
      setResizePercent(nextPercent);
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      setIsResizing(false);
      if (typeof onWidthChange === "function") {
        onWidthChange(cell.id, rowId, computedPercent);
      } else if (typeof onColSpanChange === "function") {
        const span = (computedPercent <= 30 ? 1 : computedPercent <= 55 ? 2 : computedPercent <= 80 ? 3 : 4) as 1 | 2 | 3 | 4;
        onColSpanChange(cell.id, rowId, span);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isResizing ? "none" : transition,
    opacity: isDragging ? 0.25 : 1,
    width: widthStyle,
    flex: `0 0 ${widthStyle}`,
    maxWidth: "100%",
  };

  // Ghost placeholder when dragged
  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="min-h-[110px] rounded-2xl border-2 border-dashed border-[#8B3DFF]/50 bg-[#8B3DFF]/5 flex items-center justify-center"
      >
        <span className="text-[11px] font-mono text-[#8B3DFF] font-semibold animate-pulse">
          Drop block here
        </span>
      </div>
    );
  }

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        cellDomRef.current = node;
      }}
      style={style}
      className={`relative group min-w-0 transition-all duration-150 flex flex-col rounded-2xl ${
        isResizing ? "z-40 ring-2 ring-[#8B3DFF] ring-offset-2 shadow-2xl" : ""
      }`}
      onClick={(e) => {
        if (isPreview || isResizing) return;
        e.stopPropagation();
        if (typeof onSelect === "function") {
          onSelect(cell.id, rowId);
        }
      }}
    >
      {/* ── Top Horizontal Drag Grab Bar (All cards can drag horizontally & vertically) ── */}
      {!isPreview && (
        <div
          {...attributes}
          {...listeners}
          className={`
            w-full flex items-center justify-between px-3 py-1.5 rounded-t-2xl border-b
            cursor-grab active:cursor-grabbing transition-all select-none group/dragbar z-10
            ${isSelected
              ? "bg-[#8B3DFF]/15 border-[#8B3DFF]/30 text-[#8B3DFF]"
              : "bg-slate-100/90 dark:bg-zinc-800/90 hover:bg-[#8B3DFF]/10 border-slate-200/80 dark:border-zinc-700/80 text-slate-600 dark:text-zinc-300 hover:text-[#8B3DFF]"}
          `}
          title="Drag horizontally to reorder"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <GripVertical className="w-3.5 h-3.5 text-[#8B3DFF] opacity-70 group-hover/dragbar:opacity-100 group-hover/dragbar:scale-110 transition-all flex-shrink-0" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider truncate">
              {cell.blockType.replace("-", " ")}
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 shadow-2xs">
              {currentPercent}%
            </span>
            <span className="text-[9px] font-mono text-slate-400 opacity-60 group-hover/dragbar:opacity-100 hidden sm:inline">
              Drag ⇄
            </span>
          </div>
        </div>
      )}

      {/* ── Canva Selection Bounding Box with Draggable Handles ── */}
      {isSelected && !isPreview && !isDraggingOverlay && (
        <div className="absolute inset-0 rounded-2xl border-2 border-[#8B3DFF] pointer-events-none z-20 shadow-[0_0_0_1px_rgba(139,61,255,0.2)]">
          {/* Top-Left Corner Handle */}
          <div className="absolute -top-1.5 -left-1.5 w-3 h-3 rounded-full bg-white border-2 border-[#8B3DFF] shadow-md z-30" />

          {/* Top-Right Corner Resizer Handle */}
          <div
            onMouseDown={handleResizeStart}
            className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#8B3DFF] shadow-md z-30 cursor-ne-resize pointer-events-auto hover:scale-125 active:scale-110 active:bg-[#8B3DFF] transition-all"
            title="Drag corner to adjust width"
          />

          {/* Bottom-Left Corner Handle */}
          <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 rounded-full bg-white border-2 border-[#8B3DFF] shadow-md z-30" />

          {/* Bottom-Right Corner Master Resizer Handle (Primary Tactile Handle) */}
          <div
            onMouseDown={handleResizeStart}
            className="absolute -bottom-2 -right-2 w-4.5 h-4.5 rounded-full bg-white border-2 border-[#8B3DFF] shadow-xl z-30 cursor-se-resize pointer-events-auto hover:scale-125 active:scale-110 active:bg-[#8B3DFF] transition-all flex items-center justify-center group/resize"
            title="Drag corner to smoothly adjust block width (15% - 100%)"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#8B3DFF] group-hover/resize:bg-[#7c3aed]" />
          </div>

          {/* Left Middle Pill Handle */}
          <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-1.5 h-4 rounded-full bg-[#8B3DFF] shadow-md z-30" />

          {/* Right Middle Pill Resizer Handle */}
          <div
            onMouseDown={handleResizeStart}
            className="absolute top-1/2 -right-2 -translate-y-1/2 w-2.5 h-7 rounded-full bg-[#8B3DFF] shadow-md z-30 cursor-ew-resize pointer-events-auto hover:scale-125 active:scale-110 transition-all flex items-center justify-center"
            title="Drag edge to smoothly adjust block width"
          >
            <div className="w-0.5 h-3 bg-white/80 rounded-full" />
          </div>

          {/* Block Type Tag (Top-Left Pill) - DRAGGABLE */}
          <div
            {...attributes}
            {...listeners}
            className="absolute -top-6 left-0 px-2 py-0.5 rounded-t-md bg-[#8B3DFF] text-white text-[10px] font-mono font-bold tracking-wider uppercase z-30 shadow-sm flex items-center gap-1 cursor-grab active:cursor-grabbing pointer-events-auto select-none"
            title="Drag block to reorder"
          >
            <GripVertical className="w-2.5 h-2.5 opacity-80" />
            <span>{cell.blockType.replace("-", " ")}</span>
            <span className="opacity-80">· {currentPercent}%</span>
          </div>

          {/* Live Drag-Resize Canva HUD Tooltip */}
          {isResizing && (
            <div className="absolute -bottom-9 right-0 z-50 px-2.5 py-1 rounded-lg bg-[#0F172A] text-white text-[10px] font-mono font-bold shadow-2xl flex items-center gap-1.5 border border-[#8B3DFF] whitespace-nowrap animate-pulse">
              <Maximize2 className="w-3 h-3 text-[#8B3DFF]" />
              <span>
                Width: {resizePercent}%{" "}
                {resizePercent === 25 ? "(1/4)" : resizePercent === 33 ? "(1/3)" : resizePercent === 50 ? "(Half)" : resizePercent === 66 ? "(2/3)" : resizePercent === 75 ? "(3/4)" : resizePercent === 100 ? "(Full)" : "(Adjustable)"}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Subtle hover ring when not selected */}
      {!isSelected && !isPreview && (
        <div className="absolute inset-0 rounded-2xl pointer-events-none z-10 group-hover:ring-1 group-hover:ring-[#8B3DFF]/40 transition-all" />
      )}

      {/* Canva Micro Quick-Toolbar (Top-Right above card) */}
      {isSelected && !isPreview && !isDraggingOverlay && (
        <div className="absolute -top-9 right-0 z-30 flex items-center gap-1 bg-white/95 dark:bg-zinc-900/95 border border-slate-200/90 dark:border-zinc-700/90 rounded-xl px-2 py-1 shadow-xl backdrop-blur-sm animate-fadeIn">
          {/* Width Presets */}
          <span className="text-[10px] font-mono font-bold text-slate-400 mr-0.5">W:</span>
          {([25, 33, 50, 75, 100] as const).map((w) => (
            <button
              key={w}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (typeof onWidthChange === "function") {
                  onWidthChange(cell.id, rowId, w);
                }
              }}
              className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold transition-all cursor-pointer ${
                currentPercent === w
                  ? "bg-[#8B3DFF] text-white shadow-xs"
                  : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
              }`}
              title={`Set width to ${w}%`}
            >
              {w}%
            </button>
          ))}

          {/* Stepper [- 5%] [+ 5%] */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const next = Math.max(15, currentPercent - 5);
              if (typeof onWidthChange === "function") onWidthChange(cell.id, rowId, next);
            }}
            className="w-4.5 h-4.5 rounded text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center font-bold text-xs cursor-pointer"
            title="Decrease width by 5%"
          >
            -
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const next = Math.min(100, currentPercent + 5);
              if (typeof onWidthChange === "function") onWidthChange(cell.id, rowId, next);
            }}
            className="w-4.5 h-4.5 rounded text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center font-bold text-xs cursor-pointer"
            title="Increase width by 5%"
          >
            +
          </button>

          <div className="w-px h-3.5 bg-slate-200 dark:bg-zinc-700 mx-1" />

          {/* Quick Edit */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (typeof onEdit === "function") {
                onEdit(cell, rowId);
              }
            }}
            className="p-1 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer rounded"
            title="Edit block properties"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          {/* Duplicate */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (typeof onDuplicate === "function") {
                onDuplicate(cell.id, rowId);
              }
            }}
            className="p-1 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer rounded"
            title="Duplicate block (Ctrl+D)"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (typeof onDelete === "function") {
                onDelete(cell.id, rowId);
              }
            }}
            className="p-1 text-slate-500 hover:text-rose-500 transition-colors cursor-pointer rounded"
            title="Delete block (Del)"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Render the actual cell content block */}
      <div className="w-full flex-1">
        <CanvasBlockRenderer
          cell={cell}
          isSelected={isSelected}
          isPreview={isPreview}
          onUpdateMetricCard={(card) => {
            if (typeof onUpdateMetricCard === "function") {
              onUpdateMetricCard(rowId, cell.id, card);
            }
          }}
          onUpdateInsight={(text) => {
            if (typeof onUpdateInsight === "function") {
              onUpdateInsight(rowId, cell.id, text);
            }
          }}
          onUpdateTextBlock={(content) => {
            if (typeof onUpdateTextBlock === "function") {
              onUpdateTextBlock(rowId, cell.id, content);
            }
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
  onSelectCell?: (cellId: string | null, rowId: string | null) => void;
  onEditCell: (cell: CanvasCell, rowId: string) => void;
  onDuplicateCell: (cellId: string, rowId: string) => void;
  onDeleteCell: (cellId: string, rowId: string) => void;
  onColSpanChange: (cellId: string, rowId: string, span: 1 | 2 | 3 | 4) => void;
  onWidthChange: (cellId: string, rowId: string, customWidth: number) => void;
  onUpdateMetricCard?: (rowId: string, cellId: string, card: LibraryMetricCard) => void;
  onUpdateInsight?: (rowId: string, cellId: string, text: string) => void;
  onUpdateTextBlock?: (rowId: string, cellId: string, content: string) => void;
  onRemoveRow: (rowId: string) => void;
}

function SortableRow({
  sectionId,
  row,
  selectedCellId,
  selectedRowId,
  isPreview = false,
  onSelectCell,
  onEditCell,
  onDuplicateCell,
  onDeleteCell,
  onColSpanChange,
  onWidthChange,
  onUpdateMetricCard,
  onUpdateInsight,
  onUpdateTextBlock,
  onRemoveRow,
}: SortableRowProps) {
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
      {/* Row Control Strip (Top-right corner, visible on hover) */}
      {!isPreview && (
        <div className="absolute -top-3.5 right-2 opacity-0 group-hover/row:opacity-100 transition-opacity z-30 flex items-center gap-1 bg-white/95 dark:bg-zinc-900/95 border border-slate-200 dark:border-zinc-800 rounded-lg px-1.5 py-0.5 shadow-sm text-[10px] text-slate-500 backdrop-blur-sm">
          {/* Row Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-0.5 hover:text-slate-800 dark:hover:text-white"
            title="Drag row order"
          >
            <GripVertical className="w-3 h-3" />
          </div>
          <span className="font-mono text-[9px] text-slate-400">Row</span>
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

      {/* Row Container with flexible items & 2D rect sortable strategy */}
      <SortableContext
        items={row.cells.map((c) => c.id)}
        strategy={rectSortingStrategy}
        disabled={isPreview}
      >
        <div className="canvas-row-cells flex flex-wrap gap-4 items-stretch min-h-[60px]">
          {row.cells.length === 0 ? (
            <div className="w-full py-6 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-xs text-slate-400">
              <span>Empty Row &middot; Drag blocks here</span>
            </div>
          ) : (
            row.cells.map((cell) => (
              <SortableCell
                key={cell.id}
                sectionId={sectionId}
                rowId={row.id}
                cell={cell}
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
                onUpdateMetricCard={onUpdateMetricCard}
                onUpdateInsight={onUpdateInsight}
                onUpdateTextBlock={onUpdateTextBlock}
              />
            ))
          )}
        </div>
      </SortableContext>

      {/* Row subtle separator */}
      {!isPreview && (
        <div className="mt-3 h-px bg-slate-100 dark:bg-zinc-800/40 group-hover/row:bg-[#8B3DFF]/20 transition-colors" />
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
  paperTone?: "white" | "slate" | "paper";
  showGrid?: boolean;
  onToggleGrid?: () => void;
  showGuides?: boolean;
  onToggleGuides?: () => void;
  zoom?: number;
  setZoom?: (z: number) => void;
  isPreview?: boolean;
  onTogglePreview?: () => void;
  // Watermark Support
  activeWatermark?: UploadedSvgWatermark | null;
  watermarkConfig?: WatermarkStampConfig;
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
  paperTone = "white",
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
}: CanvasStudioProps) {
  const dispatch = useDispatch();
  const rows = section.canvasRows || [];

  // Internal fallbacks if not controlled by parent
  const [internalSelectedCellId, setInternalSelectedCellId] = useState<string | null>(null);
  const [internalSelectedRowId, setInternalSelectedRowId] = useState<string | null>(null);
  const [internalZoom, setInternalZoom] = useState(1);
  const [internalShowGrid, setInternalShowGrid] = useState(true);
  const [internalShowGuides, setInternalShowGuides] = useState(false);
  const [internalIsPreview, setInternalIsPreview] = useState(false);

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

  // Zoom controls
  const zoomIn = () => {
    const next = Math.min(1.25, activeZoom + 0.1);
    if (setZoom) setZoom(next);
    else setInternalZoom(next);
  };
  const zoomOut = () => {
    const next = Math.max(0.5, activeZoom - 0.1);
    if (setZoom) setZoom(next);
    else setInternalZoom(next);
  };
  const resetZoom = () => {
    if (setZoom) setZoom(1);
    else setInternalZoom(1);
  };

  // DnD Sensors (Responsive 4px activation for crisp horizontal & vertical dragging)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Custom collision detection: pointer-first, then bounding-rect, then center
  const customCollisionDetection = useCallback((args: any) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) return pointerCollisions;
    const rectCollisions = rectIntersection(args);
    if (rectCollisions.length > 0) return rectCollisions;
    return closestCenter(args);
  }, []);

  const [activeDragCell, setActiveDragCell] = useState<CanvasCell | null>(null);

  // Cell actions with defensive dispatch
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
    (cellId: string, rowId: string, span: 1 | 2 | 3 | 4) => {
      dispatch(updateCellColSpan({ sectionId: section.id, rowId, cellId, colSpan: span }));
    },
    [dispatch, section.id]
  );

  const handleWidthChange = useCallback(
    (cellId: string, rowId: string, customWidth: number) => {
      dispatch(updateCellWidth({ sectionId: section.id, rowId, cellId, customWidth }));
    },
    [dispatch, section.id]
  );

  const handleAddRow = useCallback(() => {
    dispatch(addCanvasRow(section.id));
    dispatch(showGlobalToast({ message: "New row added to canvas", type: "success" }));
  }, [dispatch, section.id]);

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
    if (activeData?.isRow && overData?.isRow) {
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
    }
  };

  const paperBgClass =
    paperTone === "slate"
      ? "bg-slate-50 dark:bg-zinc-900"
      : paperTone === "paper"
      ? "bg-[#faf8f5] dark:bg-[#15130f]"
      : "bg-white dark:bg-[#0c1017]";

  // Watermark parameters
  const wmOpacity = (watermarkConfig?.opacity ?? 18) / 100;
  const wmScale = (watermarkConfig?.scale ?? 100) / 100;
  const wmRotation = watermarkConfig?.rotation ?? -18;
  const wmPlacement = watermarkConfig?.placement ?? "center";

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
        {/* Scalable Artboard Container */}
        <div
          className="w-full max-w-5xl transition-transform duration-200"
          style={{
            transform: `scale(${activeZoom})`,
            transformOrigin: "top center",
          }}
        >
          {/* ── Floating A4 Artboard Sheet with Multilayer Depth ── */}
          <div
            className={`relative min-h-[842px] ${paperBgClass} border border-slate-200/90 dark:border-zinc-800 rounded-3xl overflow-hidden transition-all duration-200 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_25px_50px_-12px_rgba(0,0,0,0.18),0_0_0_1px_rgba(0,0,0,0.05)]`}
          >
            {/* Margin Guides (if enabled) */}
            {activeShowGuides && !activeIsPreview && (
              <div className="absolute inset-4 rounded-2xl border border-dashed border-sky-400/40 pointer-events-none z-20" />
            )}

            {/* ── Realistic Corporate Document Watermark Stamp Layer ── */}
            {activeWatermark?.svgContent && (
              <div
                className={`absolute inset-0 pointer-events-none select-none z-10 overflow-hidden flex p-10 transition-all duration-300 ${
                  wmPlacement === "top-right"
                    ? "items-start justify-end"
                    : wmPlacement === "bottom-right"
                    ? "items-end justify-end"
                    : wmPlacement === "tiled"
                    ? "items-center justify-around flex-wrap opacity-60"
                    : "items-center justify-center"
                }`}
              >
                {wmPlacement === "tiled" ? (
                  <div className="grid grid-cols-2 gap-24 w-full h-full p-8 place-items-center">
                    {[1, 2, 3, 4].map((idx) => (
                      <div
                        key={idx}
                        style={{
                          opacity: wmOpacity * 0.7,
                          transform: `rotate(${wmRotation}deg) scale(${wmScale * 0.75})`,
                          transformOrigin: "center center",
                          mixBlendMode: "multiply",
                        }}
                        className="w-full max-w-[280px] filter drop-shadow-sm select-none"
                        dangerouslySetInnerHTML={{ __html: activeWatermark.svgContent }}
                      />
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      opacity: wmOpacity,
                      transform: `rotate(${wmRotation}deg) scale(${wmScale})`,
                      transformOrigin: "center center",
                      mixBlendMode: "multiply",
                    }}
                    className="w-full max-w-[500px] flex items-center justify-center transition-all duration-300 filter drop-shadow-sm select-none"
                    dangerouslySetInnerHTML={{ __html: activeWatermark.svgContent }}
                  />
                )}
              </div>
            )}

            {/* Document Header Bar */}
            <div className="relative z-10 px-8 sm:px-10 pt-8 pb-5 border-b border-slate-100 dark:border-zinc-800/60 bg-white/40 dark:bg-black/20 backdrop-blur-[2px]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 font-mono">
                  {section.eyebrow}
                </span>
                <div className="flex items-center gap-2">
                  {activeWatermark && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-500/10 text-[#8B3DFF] border border-purple-500/20 font-bold">
                      <Stamp className="w-2.5 h-2.5" />
                      <span>{activeWatermark.name}</span>
                    </span>
                  )}
                  <span className="text-[10px] font-mono tracking-widest uppercase text-slate-300 dark:text-zinc-600">
                    CANVA STUDIO · INDUSTRIAL REPORT
                  </span>
                </div>
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {section.name}
              </h1>
              {section.description && (
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-3xl leading-relaxed">
                  {section.description}
                </p>
              )}
            </div>

            {/* Canvas Rows Container */}
            <div className="relative z-10 px-8 sm:px-10 py-6 space-y-4">
              {rows.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl text-slate-400 dark:text-zinc-600 space-y-3">
                  <p className="text-sm font-medium">Canvas is empty</p>
                  <p className="text-xs">Click any block in the left sidebar to start building</p>
                </div>
              ) : (
                <SortableContext
                  items={rows.map((r) => r.id)}
                  strategy={verticalListSortingStrategy}
                  disabled={activeIsPreview}
                >
                  <div className="space-y-4">
                    {rows.map((row) => (
                      <SortableRow
                        key={row.id}
                        sectionId={section.id}
                        row={row}
                        selectedCellId={activeSelectedCellId}
                        selectedRowId={activeSelectedRowId}
                        isPreview={activeIsPreview}
                        onSelectCell={handleSelectCell}
                        onEditCell={onEditCell}
                        onDuplicateCell={handleDuplicateCell}
                        onDeleteCell={handleDeleteCell}
                        onColSpanChange={handleColSpanChange}
                        onWidthChange={handleWidthChange}
                        onUpdateMetricCard={onUpdateMetricCardInCell}
                        onUpdateInsight={onUpdateInsightInCell}
                        onUpdateTextBlock={onUpdateTextBlockInCell}
                        onRemoveRow={handleRemoveRow}
                      />
                    ))}
                  </div>
                </SortableContext>
              )}

              {/* Add Row Button (Hidden in preview) */}
              {!activeIsPreview && (
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="
                    w-full py-3.5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-zinc-800
                    text-xs font-bold text-slate-400 dark:text-zinc-500
                    hover:border-[#8B3DFF]/50 hover:text-[#8B3DFF] hover:bg-[#8B3DFF]/5
                    transition-all flex items-center justify-center gap-2 cursor-pointer
                    mt-4
                  "
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Row to Section</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Floating Viewport Dock (Bottom Center/Right) ── */}
      <div className="fixed bottom-4 right-8 z-40 flex items-center gap-1.5 bg-white/95 dark:bg-zinc-900/95 border border-slate-200 dark:border-zinc-800 rounded-2xl px-3 py-1.5 shadow-2xl backdrop-blur-md select-none text-xs">
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

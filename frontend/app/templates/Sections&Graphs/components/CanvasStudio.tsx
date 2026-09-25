"use client";

import React, { useCallback, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragOverlay,
  UniqueIdentifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
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
  showGlobalToast,
} from "@/lib/redux/slices/reportModuleSlice";
import { CanvasBlockRenderer } from "./CanvasBlockRenderer";

// ─── ColSpan class map ────────────────────────────────────────────────────────
const COL_SPAN_CLASS: Record<number, string> = {
  1: "col-span-1",
  2: "col-span-2",
  3: "col-span-3",
  4: "col-span-4",
};

// ─── Sortable Cell (Authentic Canva Bounding Box) ─────────────────────────────
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
  onColSpanChange: (cellId: string, rowId: string, span: 1 | 2 | 3 | 4) => void;
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

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.25 : 1,
  };

  const colClass = COL_SPAN_CLASS[cell.colSpan] || "col-span-1";

  // Ghost placeholder when dragged
  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`${colClass} min-h-[90px] rounded-2xl border-2 border-dashed border-[#8B3DFF]/50 bg-[#8B3DFF]/5 flex items-center justify-center`}
      >
        <span className="text-[11px] font-mono text-[#8B3DFF] font-semibold animate-pulse">
          Drop block here
        </span>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${colClass} min-w-0 transition-shadow`}
      onClick={(e) => {
        if (isPreview) return;
        e.stopPropagation();
        if (typeof onSelect === "function") {
          onSelect(cell.id, rowId);
        }
      }}
    >
      {/* ── Canva Selection Bounding Box with 4 Corner Handles ── */}
      {isSelected && !isPreview && !isDraggingOverlay && (
        <div className="absolute inset-0 rounded-2xl border-2 border-[#8B3DFF] pointer-events-none z-20 shadow-[0_0_0_1px_rgba(139,61,255,0.2)]">
          {/* Top-Left Corner Handle */}
          <div className="absolute -top-1.5 -left-1.5 w-3 h-3 rounded-full bg-white border-2 border-[#8B3DFF] shadow-md z-30" />
          {/* Top-Right Corner Handle */}
          <div className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-white border-2 border-[#8B3DFF] shadow-md z-30" />
          {/* Bottom-Left Corner Handle */}
          <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 rounded-full bg-white border-2 border-[#8B3DFF] shadow-md z-30" />
          {/* Bottom-Right Corner Handle */}
          <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 rounded-full bg-white border-2 border-[#8B3DFF] shadow-md z-30" />

          {/* Left Middle Pill Handle */}
          <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-1.5 h-4 rounded-full bg-[#8B3DFF] shadow-md z-30" />
          {/* Right Middle Pill Handle */}
          <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-1.5 h-4 rounded-full bg-[#8B3DFF] shadow-md z-30" />

          {/* Block Type Tag (Top-Left Pill) */}
          <div className="absolute -top-5.5 left-0 px-2 py-0.5 rounded-t-md bg-[#8B3DFF] text-white text-[10px] font-mono font-bold tracking-wider uppercase z-30 shadow-sm flex items-center gap-1">
            <span>{cell.blockType.replace("-", " ")}</span>
            <span className="opacity-80">· {cell.colSpan}/4</span>
          </div>
        </div>
      )}

      {/* Subtle hover ring when not selected */}
      {!isSelected && !isPreview && (
        <div className="absolute inset-0 rounded-2xl pointer-events-none z-10 group-hover:ring-1 group-hover:ring-[#8B3DFF]/40 transition-all" />
      )}

      {/* Drag handle button (Top-Left inside card) */}
      {!isPreview && (
        <button
          type="button"
          className={`
            absolute top-2.5 left-2.5 z-30 p-1 rounded-lg
            bg-white/95 dark:bg-zinc-900/95 border border-slate-200 dark:border-zinc-700
            shadow-md cursor-grab active:cursor-grabbing
            opacity-0 group-hover:opacity-100 transition-opacity
            ${isDraggingOverlay ? "opacity-100" : ""}
          `}
          {...attributes}
          {...listeners}
          title="Drag block"
        >
          <GripVertical className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
        </button>
      )}

      {/* Canva Micro Quick-Toolbar (Top-Right above card) */}
      {isSelected && !isPreview && !isDraggingOverlay && (
        <div className="absolute -top-8 right-0 z-30 flex items-center gap-1 bg-white/95 dark:bg-zinc-900/95 border border-slate-200/90 dark:border-zinc-700/90 rounded-xl px-2 py-1 shadow-xl backdrop-blur-sm animate-fadeIn">
          {/* Width Pills */}
          <span className="text-[10px] font-mono font-bold text-slate-400 mr-0.5">W:</span>
          {([1, 2, 3, 4] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={(e) => { e.stopPropagation(); onColSpanChange(cell.id, rowId, s); }}
              className={`w-5 h-5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                cell.colSpan === s
                  ? "bg-[#8B3DFF] text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800"
              }`}
              title={`Span ${s} of 4 columns`}
            >
              {s}
            </button>
          ))}

          <div className="w-px h-3.5 bg-slate-200 dark:bg-zinc-700 mx-1" />

          {/* Quick Edit */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEdit(cell, rowId); }}
            className="p-1 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer rounded"
            title="Edit block properties"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          {/* Duplicate */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDuplicate(cell.id, rowId); }}
            className="p-1 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer rounded"
            title="Duplicate block (Ctrl+D)"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(cell.id, rowId); }}
            className="p-1 text-slate-500 hover:text-rose-500 transition-colors cursor-pointer rounded"
            title="Delete block (Del)"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Block Content with Live Inline Editing */}
      <div className="h-full">
        <CanvasBlockRenderer
          cell={cell}
          isSelected={isSelected}
          isPreview={isPreview}
          onUpdateMetricCard={(card) => onUpdateMetricCard && onUpdateMetricCard(rowId, cell.id, card)}
          onUpdateInsight={(text) => onUpdateInsight && onUpdateInsight(rowId, cell.id, text)}
          onUpdateTextBlock={(content) => onUpdateTextBlock && onUpdateTextBlock(rowId, cell.id, content)}
        />
      </div>
    </div>
  );
}

// ─── Sortable Row ─────────────────────────────────────────────────────────────
interface SortableRowProps {
  sectionId: string;
  row: CanvasRow;
  selectedCellId: string | null;
  selectedRowId: string | null;
  isPreview?: boolean;
  onSelectCell?: (cellId: string, rowId: string) => void;
  onEditCell: (cell: CanvasCell, rowId: string) => void;
  onDuplicateCell: (cellId: string, rowId: string) => void;
  onDeleteCell: (cellId: string, rowId: string) => void;
  onColSpanChange: (cellId: string, rowId: string, span: 1 | 2 | 3 | 4) => void;
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
  } = useSortable({ id: row.id, data: { type: "row" }, disabled: isPreview });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group/row"
    >
      {/* Row drag handle (left gutter) */}
      {!isPreview && (
        <div className="absolute -left-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity z-10">
          <button
            type="button"
            className="p-1 rounded cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-600 dark:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            {...attributes}
            {...listeners}
            title="Drag to reorder row"
          >
            <Move className="w-3.5 h-3.5" />
          </button>
          {row.cells.length === 0 && (
            <button
              type="button"
              onClick={() => onRemoveRow(row.id)}
              className="p-1 rounded text-slate-300 hover:text-rose-400 transition-colors cursor-pointer"
              title="Remove empty row"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* Row Cell Grid (4-column base) */}
      <SortableContext
        items={row.cells.map((c) => c.id)}
        strategy={horizontalListSortingStrategy}
        disabled={isPreview}
      >
        <div
          className={`
            grid grid-cols-4 gap-3.5 min-h-[60px] rounded-2xl transition-all
            ${row.cells.length === 0 && !isPreview
              ? "border-2 border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/40 dark:bg-zinc-900/20 flex items-center justify-center p-6"
              : ""
            }
          `}
        >
          {row.cells.length === 0 && !isPreview ? (
            <div className="col-span-4 text-center text-xs text-slate-400 dark:text-zinc-600 italic">
              Empty row — select a block in the sidebar to add here, or drag one across
            </div>
          ) : (
            row.cells.map((cell) => (
              <SortableCell
                key={cell.id}
                sectionId={sectionId}
                rowId={row.id}
                cell={cell}
                isSelected={selectedCellId === cell.id && selectedRowId === row.id}
                isPreview={isPreview}
                onSelect={onSelectCell}
                onEdit={onEditCell}
                onDuplicate={onDuplicateCell}
                onDelete={onDeleteCell}
                onColSpanChange={onColSpanChange}
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

  const handleSetZoom = useCallback(
    (z: number) => {
      if (typeof setZoom === "function") {
        setZoom(z);
      } else {
        setInternalZoom(z);
      }
    },
    [setZoom]
  );

  const [activeDragId, setActiveDragId] = useState<UniqueIdentifier | null>(null);
  const [activeDragCell, setActiveDragCell] = useState<CanvasCell | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleCanvasClick = useCallback(() => {
    handleSelectCell(null, null);
  }, [handleSelectCell]);

  const handleDuplicateCell = useCallback(
    (cellId: string, rowId: string) => {
      dispatch(duplicateCanvasCell({ sectionId: section.id, rowId, cellId }));
      dispatch(showGlobalToast({ message: "Block duplicated!", type: "success" }));
    },
    [dispatch, section.id]
  );

  const handleDeleteCell = useCallback(
    (cellId: string, rowId: string) => {
      dispatch(deleteCanvasCell({ sectionId: section.id, rowId, cellId }));
      if (activeSelectedCellId === cellId) {
        handleSelectCell(null, null);
      }
      dispatch(showGlobalToast({ message: "Block removed.", type: "info" }));
    },
    [dispatch, section.id, activeSelectedCellId, handleSelectCell]
  );

  const handleColSpanChange = useCallback(
    (cellId: string, rowId: string, colSpan: 1 | 2 | 3 | 4) => {
      dispatch(updateCellColSpan({ sectionId: section.id, rowId, cellId, colSpan }));
    },
    [dispatch, section.id]
  );

  const handleAddRow = useCallback(() => {
    dispatch(addCanvasRow(section.id));
  }, [dispatch, section.id]);

  const handleRemoveRow = useCallback(
    (rowId: string) => {
      dispatch(removeCanvasRow({ sectionId: section.id, rowId }));
    },
    [dispatch, section.id]
  );

  // ── DnD Handlers ────────────────────────────────────────────────────────────
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      setActiveDragId(event.active.id);
      const data = event.active.data.current;
      if (data?.cell) setActiveDragCell(data.cell as CanvasCell);
    },
    []
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveDragId(null);
      setActiveDragCell(null);

      if (!over || active.id === over.id) return;

      const activeData = active.data.current;
      const overData = over.data.current;

      // Row reordering
      if (activeData?.type === "row") {
        const oldIdx = rows.findIndex((r) => r.id === active.id);
        const newIdx = rows.findIndex((r) => r.id === over.id);
        if (oldIdx !== -1 && newIdx !== -1) {
          dispatch(
            reorderCanvasRows({
              sectionId: section.id,
              rows: arrayMove(rows, oldIdx, newIdx),
            })
          );
        }
        return;
      }

      // Cell drag
      const fromRowId = activeData?.rowId as string;
      const toRowId = (overData?.rowId as string) || (over.id as string);

      if (!fromRowId) return;

      if (fromRowId === toRowId) {
        // Same row reorder
        const row = rows.find((r) => r.id === fromRowId);
        if (!row) return;
        const oldIdx = row.cells.findIndex((c) => c.id === active.id);
        const newIdx = row.cells.findIndex((c) => c.id === over.id);
        if (oldIdx !== -1 && newIdx !== -1) {
          dispatch(
            reorderCellsInRow({
              sectionId: section.id,
              rowId: fromRowId,
              cells: arrayMove(row.cells, oldIdx, newIdx),
            })
          );
        }
      } else {
        // Cross-row move
        const toRow = rows.find((r) => r.id === toRowId);
        const toIndex = toRow
          ? toRow.cells.findIndex((c) => c.id === over.id)
          : 0;
        dispatch(
          moveCellBetweenRows({
            sectionId: section.id,
            fromRowId,
            toRowId,
            cellId: active.id as string,
            toIndex: toIndex === -1 ? (toRow?.cells.length || 0) : toIndex,
          })
        );
      }
    },
    [dispatch, section.id, rows]
  );

  // Zoom Steppers
  const zoomIn = () => handleSetZoom(Math.min(1.25, Math.round((activeZoom + 0.25) * 100) / 100));
  const zoomOut = () => handleSetZoom(Math.max(0.5, Math.round((activeZoom - 0.25) * 100) / 100));
  const resetZoom = () => handleSetZoom(1);

  // Paper Tone Background
  const paperBgClass =
    paperTone === "paper"
      ? "bg-[#faf8f5] dark:bg-[#12100d]"
      : paperTone === "slate"
      ? "bg-slate-50 dark:bg-[#0c1017]"
      : "bg-white dark:bg-[#0c1017]";

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* ── Desk Workspace with Dot-Grid Pattern ── */}
      <div
        className="relative flex-1 min-h-0 overflow-y-auto px-4 sm:px-12 py-8 flex justify-center bg-slate-100/90 dark:bg-[#06080c] select-none"
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
        {/* Scalable Container */}
        <div
          className="w-full max-w-5xl transition-transform duration-200"
          style={{
            transform: `scale(${activeZoom})`,
            transformOrigin: "top center",
          }}
        >
          {/* ── Floating A4 Artboard Sheet ── */}
          <div
            className={`relative ${paperBgClass} border border-slate-200/90 dark:border-zinc-800 rounded-3xl overflow-hidden transition-all duration-200 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_25px_50px_-12px_rgba(0,0,0,0.18),0_0_0_1px_rgba(0,0,0,0.05)]`}
          >
            {/* Margin Guides (if enabled) */}
            {activeShowGuides && !activeIsPreview && (
              <div className="absolute inset-4 rounded-2xl border border-dashed border-sky-400/40 pointer-events-none z-10" />
            )}

            {/* Document Header Bar */}
            <div className="px-8 sm:px-10 pt-8 pb-5 border-b border-slate-100 dark:border-zinc-800/60">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 font-mono">
                  {section.eyebrow}
                </span>
                <span className="text-[10px] font-mono tracking-widest uppercase text-slate-300 dark:text-zinc-600">
                  CANVA STUDIO · INDUSTRIAL SAFETY REPORT
                </span>
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
            <div className="px-8 sm:px-10 py-6 space-y-4">
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
      <DragOverlay>
        {activeDragCell && (
          <div className="opacity-95 shadow-[0_20px_50px_rgba(0,0,0,0.35)] rounded-2xl rotate-1 scale-105 transition-transform ring-2 ring-[#8B3DFF]">
            <CanvasBlockRenderer cell={activeDragCell} isPreview />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

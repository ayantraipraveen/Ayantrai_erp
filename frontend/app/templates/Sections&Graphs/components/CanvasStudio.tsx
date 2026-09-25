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
} from "lucide-react";
import { useDispatch } from "react-redux";
import {
  CanvasRow,
  CanvasCell,
  CanvasBlockType,
  LibrarySection,
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

// ─── Sortable Cell ────────────────────────────────────────────────────────────
interface SortableCellProps {
  sectionId: string;
  rowId: string;
  cell: CanvasCell;
  isSelected: boolean;
  onSelect: (cellId: string, rowId: string) => void;
  onEdit: (cell: CanvasCell, rowId: string) => void;
  onDuplicate: (cellId: string, rowId: string) => void;
  onDelete: (cellId: string, rowId: string) => void;
  onColSpanChange: (cellId: string, rowId: string, span: 1 | 2 | 3 | 4) => void;
  isDraggingOverlay?: boolean;
}

function SortableCell({
  sectionId,
  rowId,
  cell,
  isSelected,
  onSelect,
  onEdit,
  onDuplicate,
  onDelete,
  onColSpanChange,
  isDraggingOverlay = false,
}: SortableCellProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: cell.id, data: { rowId, cell } });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const colClass = COL_SPAN_CLASS[cell.colSpan] || "col-span-1";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${colClass} min-w-0`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(cell.id, rowId);
      }}
    >
      {/* Selection ring */}
      <div
        className={`
          absolute inset-0 rounded-xl pointer-events-none z-10 transition-all
          ${isSelected
            ? "ring-2 ring-[#9D61FF] ring-offset-2 ring-offset-white dark:ring-offset-[#0b0e14]"
            : "group-hover:ring-1 group-hover:ring-slate-300 dark:group-hover:ring-zinc-600"
          }
        `}
      />

      {/* Drag handle */}
      <button
        type="button"
        className={`
          absolute top-2 left-2 z-20 p-1 rounded-lg
          bg-white/90 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-700
          shadow-sm cursor-grab active:cursor-grabbing
          opacity-0 group-hover:opacity-100 transition-opacity
          ${isDraggingOverlay ? "opacity-100" : ""}
        `}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-3 h-3 text-slate-400 dark:text-zinc-500" />
      </button>

      {/* Context toolbar (top-right) — shows when selected */}
      {isSelected && !isDraggingOverlay && (
        <div className="absolute -top-8 right-0 z-30 flex items-center gap-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl px-2 py-1 shadow-lg">
          {/* ColSpan controls */}
          <span className="text-[10px] font-mono text-slate-400 mr-1">W:</span>
          {([1, 2, 3, 4] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={(e) => { e.stopPropagation(); onColSpanChange(cell.id, rowId, s); }}
              className={`w-5 h-5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                cell.colSpan === s
                  ? "bg-[#9D61FF] text-white"
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800"
              }`}
            >
              {s}
            </button>
          ))}
          <div className="w-px h-4 bg-slate-200 dark:bg-zinc-700 mx-0.5" />
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEdit(cell, rowId); }}
            className="p-1 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            title="Edit block"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDuplicate(cell.id, rowId); }}
            className="p-1 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
            title="Duplicate"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(cell.id, rowId); }}
            className="p-1 text-slate-500 hover:text-rose-500 transition-colors cursor-pointer"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Block Content */}
      <div className="h-full">
        <CanvasBlockRenderer cell={cell} />
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
  onSelectCell: (cellId: string, rowId: string) => void;
  onEditCell: (cell: CanvasCell, rowId: string) => void;
  onDuplicateCell: (cellId: string, rowId: string) => void;
  onDeleteCell: (cellId: string, rowId: string) => void;
  onColSpanChange: (cellId: string, rowId: string, span: 1 | 2 | 3 | 4) => void;
  onRemoveRow: (rowId: string) => void;
}

function SortableRow({
  sectionId,
  row,
  selectedCellId,
  selectedRowId,
  onSelectCell,
  onEditCell,
  onDuplicateCell,
  onDeleteCell,
  onColSpanChange,
  onRemoveRow,
}: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.id, data: { type: "row" } });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group/row"
    >
      {/* Row drag handle (left gutter) */}
      <div className="absolute -left-7 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity z-10">
        <button
          type="button"
          className="p-1 rounded cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 dark:text-zinc-600 dark:hover:text-zinc-400"
          {...attributes}
          {...listeners}
          title="Drag row"
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

      {/* Cell Grid (4-col base) */}
      <SortableContext
        items={row.cells.map((c) => c.id)}
        strategy={horizontalListSortingStrategy}
      >
        <div
          className={`
            grid grid-cols-4 gap-3 min-h-[60px] rounded-xl
            transition-colors
            ${row.cells.length === 0
              ? "border-2 border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 flex items-center justify-center"
              : ""
            }
          `}
        >
          {row.cells.length === 0 ? (
            <div className="col-span-4 text-center text-xs text-slate-400 dark:text-zinc-600 py-4 italic">
              Empty row — drag a block here or remove it
            </div>
          ) : (
            row.cells.map((cell) => (
              <SortableCell
                key={cell.id}
                sectionId={sectionId}
                rowId={row.id}
                cell={cell}
                isSelected={selectedCellId === cell.id && selectedRowId === row.id}
                onSelect={onSelectCell}
                onEdit={onEditCell}
                onDuplicate={onDuplicateCell}
                onDelete={onDeleteCell}
                onColSpanChange={onColSpanChange}
              />
            ))
          )}
        </div>
      </SortableContext>

      {/* Row bottom separator */}
      <div className="mt-3 h-px bg-slate-100 dark:bg-zinc-800/60 group-hover/row:bg-[#9D61FF]/20 transition-colors" />
    </div>
  );
}

// ─── Main CanvasStudio ────────────────────────────────────────────────────────
interface CanvasStudioProps {
  section: LibrarySection;
  onEditCell: (cell: CanvasCell, rowId: string) => void;
}

export function CanvasStudio({ section, onEditCell }: CanvasStudioProps) {
  const dispatch = useDispatch();
  const rows = section.canvasRows || [];

  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [activeDragId, setActiveDragId] = useState<UniqueIdentifier | null>(null);
  const [activeDragCell, setActiveDragCell] = useState<CanvasCell | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Deselect when clicking canvas background
  const handleCanvasClick = useCallback(() => {
    setSelectedCellId(null);
    setSelectedRowId(null);
  }, []);

  const handleSelectCell = useCallback((cellId: string, rowId: string) => {
    setSelectedCellId(cellId);
    setSelectedRowId(rowId);
  }, []);

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
      if (selectedCellId === cellId) {
        setSelectedCellId(null);
        setSelectedRowId(null);
      }
      dispatch(showGlobalToast({ message: "Block removed.", type: "info" }));
    },
    [dispatch, section.id, selectedCellId]
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

      // Row reordering (drag entire row)
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
      const toRowId = overData?.rowId as string || over.id as string;

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

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div
        className="relative flex-1 min-h-0 overflow-y-auto px-4 sm:px-8 py-6 flex justify-center bg-slate-100/60 dark:bg-[#07090d]"
        onClick={handleCanvasClick}
      >
        {/* A4-style canvas paper */}
        <div className="w-full max-w-5xl">
          <div className="bg-white dark:bg-[#0b0e14] border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-xl overflow-hidden">

            {/* Report Header Block */}
            <div className="px-8 pt-8 pb-5 border-b border-slate-100 dark:border-zinc-800/60">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 font-mono">
                  {section.eyebrow}
                </span>
                <span className="text-[10px] font-mono text-slate-300 dark:text-zinc-600">
                  CANVAS EDITOR · SITESAFE EXECUTIVE SUITE
                </span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                {section.name}
              </h1>
              {section.description && (
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-3xl leading-relaxed">
                  {section.description}
                </p>
              )}
            </div>

            {/* Canvas Rows */}
            <div className="px-8 py-6 space-y-4">
              {rows.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl text-slate-400 dark:text-zinc-600 space-y-3">
                  <p className="text-sm font-medium">Canvas is empty</p>
                  <p className="text-xs">Click a block type in the sidebar to add your first element</p>
                </div>
              ) : (
                <SortableContext
                  items={rows.map((r) => r.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4 pl-8">
                    {rows.map((row) => (
                      <SortableRow
                        key={row.id}
                        sectionId={section.id}
                        row={row}
                        selectedCellId={selectedCellId}
                        selectedRowId={selectedRowId}
                        onSelectCell={handleSelectCell}
                        onEditCell={onEditCell}
                        onDuplicateCell={handleDuplicateCell}
                        onDeleteCell={handleDeleteCell}
                        onColSpanChange={handleColSpanChange}
                        onRemoveRow={handleRemoveRow}
                      />
                    ))}
                  </div>
                </SortableContext>
              )}

              {/* Add Row Button */}
              <button
                type="button"
                onClick={handleAddRow}
                className="
                  w-full py-3 rounded-2xl border-2 border-dashed border-slate-200 dark:border-zinc-800
                  text-xs font-semibold text-slate-400 dark:text-zinc-600
                  hover:border-[#9D61FF]/40 hover:text-[#9D61FF]
                  transition-all flex items-center justify-center gap-2 cursor-pointer
                  mt-2
                "
              >
                <Plus className="w-3.5 h-3.5" />
                Add Row
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeDragCell && (
          <div className="opacity-90 shadow-2xl rounded-xl rotate-1 scale-105 transition-transform">
            <CanvasBlockRenderer cell={activeDragCell} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

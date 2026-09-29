"use client";

import React, { useState } from "react";
import { useSortable, SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Layers, GripVertical, Trash2, Plus } from "lucide-react";
import { SortableCell } from "./CanvasSortableCell";
import { SortableRowProps } from "../../utils";

export function SortableRow({
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
      data-row-id={row.id}
      className={`relative group/row canvas-row-item overflow-visible transition-colors duration-100 ${
        isRowSelected && !isPreview ? "ring-1 ring-purple-300/30 rounded-2xl" : ""
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

      {/* Row Control Strip — uses pointer-events-none wrapper to prevent layout interference */}
      {!isPreview && (
        <div className="absolute -top-3 right-1 opacity-0 group-hover/row:opacity-100 transition-opacity z-30 flex items-center gap-0.5 bg-white/95 dark:bg-zinc-900/95 border border-slate-200 dark:border-zinc-800 rounded-md px-1 py-0.5 shadow-sm text-[9px] text-slate-500 backdrop-blur-sm">
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
          className={`canvas-row-cells flex flex-wrap gap-3 items-stretch min-h-[60px] transition-colors duration-100 rounded-2xl ${
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
                currentPageNumber={currentPageNumber}
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

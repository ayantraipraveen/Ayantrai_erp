"use client";

import React, { useState, useRef } from "react";
import { useSortable, SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Layers, GripVertical, Trash2, Plus, Sliders, RotateCcw } from "lucide-react";
import { SortableCell } from "./CanvasSortableCell";
import { SortableRowProps } from "../../utils";
import { CanvasRowStyle } from "@/lib/redux/slices/reportModuleSlice";
import { CanvasRow } from "@/lib/redux/types/reportModuleTypes";
import { RibbonPortalPopover } from "../CanvasContextRibbon";

function getRowBackground(style?: CanvasRowStyle): string | undefined {
  if (!style?.backgroundColor) return undefined;
  if (style.backgroundOpacity === undefined || style.backgroundOpacity === 100) return style.backgroundColor;
  const hex = style.backgroundColor.trim();
  const alpha = Math.max(0, Math.min(100, style.backgroundOpacity)) / 100;
  if (/^#[0-9a-f]{6}$/i.test(hex)) {
    const value = parseInt(hex.slice(1), 16);
    return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`;
  }
  return style.backgroundColor;
}

interface RowConfigPopoverProps {
  row: CanvasRow;
  onUpdateRowStyle?: (rowId: string, style: Partial<CanvasRowStyle>) => void;
  onTogglePageBreak?: (rowId: string) => void;
  onRemoveRow?: (rowId: string) => void;
  onClose: () => void;
}

function RowConfigPopover({
  row,
  onUpdateRowStyle,
  onTogglePageBreak,
  onRemoveRow,
  onClose,
}: RowConfigPopoverProps) {
  const [activeTab, setActiveTab] = useState<"spacing" | "appearance">("spacing");
  const rowStyle = row.style || {};
  const colGap = rowStyle.columnGap ?? 12;
  const rowGap = rowStyle.rowGap ?? 12;
  const padding = rowStyle.padding ?? rowStyle.paddingTop ?? 0;
  const marginY = rowStyle.marginTop ?? rowStyle.margin ?? 0;

  const handleUpdate = (patch: Partial<CanvasRowStyle>) => {
    onUpdateRowStyle?.(row.id, patch);
  };

  const handleReset = () => {
    handleUpdate({
      columnGap: 12,
      rowGap: 12,
      padding: 0,
      paddingTop: undefined,
      paddingBottom: undefined,
      paddingLeft: undefined,
      paddingRight: undefined,
      margin: 0,
      marginTop: undefined,
      marginBottom: undefined,
      borderWidth: undefined,
      borderColor: undefined,
      borderStyle: undefined,
      borderRadius: undefined,
      backgroundColor: undefined,
      backgroundOpacity: undefined,
    });
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="w-80 max-h-[min(540px,calc(100vh-140px))] overflow-y-auto custom-scrollbar rounded-2xl bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-zinc-800 shadow-2xl p-3.5 space-y-3 animate-fadeIn text-slate-800 dark:text-zinc-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/80 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-purple-500/10 text-[#8B3DFF] flex items-center justify-center font-bold">
            <Sliders className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Row Layout & Style</h4>
            <p className="text-[10px] text-slate-400">{row.cells.length} block(s) in this row</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="text-[10px] font-semibold text-slate-400 hover:text-red-500 transition-colors cursor-pointer px-2 py-0.5 rounded hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-1"
          title="Reset to default spacing"
        >
          <RotateCcw className="w-2.5 h-2.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-1 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 p-1">
        <button
          type="button"
          onClick={() => setActiveTab("spacing")}
          className={`py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === "spacing"
              ? "bg-[#8B3DFF] text-white shadow-xs"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          Spacing & Gaps
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("appearance")}
          className={`py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === "appearance"
              ? "bg-[#8B3DFF] text-white shadow-xs"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          Borders & Bg
        </button>
      </div>

      {activeTab === "spacing" ? (
        <div className="space-y-3">
          {/* Column Gap */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              <span>Column Gap (Horizontal)</span>
              <span className="text-[#8B3DFF]">{colGap}px</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleUpdate({ columnGap: Math.max(0, colGap - 4) })}
                className="w-7 h-7 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 flex items-center justify-center font-bold text-xs cursor-pointer"
              >
                -
              </button>
              <input
                type="range"
                min={0}
                max={48}
                step={2}
                value={colGap}
                onChange={(e) => handleUpdate({ columnGap: Number(e.target.value) })}
                className="flex-1 accent-[#8B3DFF] cursor-pointer"
              />
              <button
                type="button"
                onClick={() => handleUpdate({ columnGap: Math.min(48, colGap + 4) })}
                className="w-7 h-7 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 flex items-center justify-center font-bold text-xs cursor-pointer"
              >
                +
              </button>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {[0, 8, 12, 16, 24].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleUpdate({ columnGap: val })}
                  className={`py-1 rounded-md text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                    colGap === val
                      ? "border-[#8B3DFF] bg-purple-500/10 text-[#8B3DFF]"
                      : "border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                  }`}
                >
                  {val}px
                </button>
              ))}
            </div>
          </div>

          {/* Row Gap */}
          <div className="space-y-1.5 border-t border-slate-100 dark:border-zinc-800/80 pt-2">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              <span>Row Gap (Vertical Wrap)</span>
              <span className="text-[#8B3DFF]">{rowGap}px</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleUpdate({ rowGap: Math.max(0, rowGap - 4) })}
                className="w-7 h-7 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 flex items-center justify-center font-bold text-xs cursor-pointer"
              >
                -
              </button>
              <input
                type="range"
                min={0}
                max={48}
                step={2}
                value={rowGap}
                onChange={(e) => handleUpdate({ rowGap: Number(e.target.value) })}
                className="flex-1 accent-[#8B3DFF] cursor-pointer"
              />
              <button
                type="button"
                onClick={() => handleUpdate({ rowGap: Math.min(48, rowGap + 4) })}
                className="w-7 h-7 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 flex items-center justify-center font-bold text-xs cursor-pointer"
              >
                +
              </button>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {[0, 8, 12, 16, 24].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleUpdate({ rowGap: val })}
                  className={`py-1 rounded-md text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                    rowGap === val
                      ? "border-[#8B3DFF] bg-purple-500/10 text-[#8B3DFF]"
                      : "border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                  }`}
                >
                  {val}px
                </button>
              ))}
            </div>
          </div>

          {/* Row Inner Padding */}
          <div className="space-y-1.5 border-t border-slate-100 dark:border-zinc-800/80 pt-2">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              <span>Row Padding (Internal)</span>
              <span className="text-[#8B3DFF]">{padding}px</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  const next = Math.max(0, padding - 4);
                  handleUpdate({ padding: next, paddingTop: next, paddingBottom: next, paddingLeft: next, paddingRight: next });
                }}
                className="w-7 h-7 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 flex items-center justify-center font-bold text-xs cursor-pointer"
              >
                -
              </button>
              <input
                type="range"
                min={0}
                max={40}
                step={2}
                value={padding}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  handleUpdate({ padding: val, paddingTop: val, paddingBottom: val, paddingLeft: val, paddingRight: val });
                }}
                className="flex-1 accent-[#8B3DFF] cursor-pointer"
              />
              <button
                type="button"
                onClick={() => {
                  const next = Math.min(40, padding + 4);
                  handleUpdate({ padding: next, paddingTop: next, paddingBottom: next, paddingLeft: next, paddingRight: next });
                }}
                className="w-7 h-7 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 flex items-center justify-center font-bold text-xs cursor-pointer"
              >
                +
              </button>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {[0, 4, 8, 12, 16].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleUpdate({ padding: val, paddingTop: val, paddingBottom: val, paddingLeft: val, paddingRight: val })}
                  className={`py-1 rounded-md text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                    padding === val
                      ? "border-[#8B3DFF] bg-purple-500/10 text-[#8B3DFF]"
                      : "border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                  }`}
                >
                  {val}px
                </button>
              ))}
            </div>
          </div>

          {/* Row Margin (Vertical) */}
          <div className="space-y-1.5 border-t border-slate-100 dark:border-zinc-800/80 pt-2">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              <span>Row Margin (External Spacing)</span>
              <span className="text-[#8B3DFF]">{marginY}px</span>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {[0, 4, 8, 12, 16].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleUpdate({ margin: val, marginTop: val, marginBottom: val })}
                  className={`py-1 rounded-md text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                    marginY === val
                      ? "border-[#8B3DFF] bg-purple-500/10 text-[#8B3DFF]"
                      : "border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                  }`}
                >
                  {val}px
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Background Presets */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              Row Background Tone
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { label: "None", val: undefined },
                { label: "Subtle Slate", val: "#f8fafc" },
                { label: "Glass Frost", val: "rgba(255,255,255,0.75)" },
                { label: "Purple Mist", val: "#faf5ff" },
                { label: "Midnight Dark", val: "#0f172a" },
              ].map((bg) => (
                <button
                  key={bg.label}
                  type="button"
                  onClick={() => handleUpdate({ backgroundColor: bg.val })}
                  className={`h-9 rounded-lg border text-[10px] font-bold p-1 transition-all cursor-pointer ${
                    rowStyle.backgroundColor === bg.val
                      ? "border-[#8B3DFF] ring-2 ring-purple-500/30"
                      : "border-slate-200 dark:border-zinc-800 hover:border-slate-300"
                  }`}
                  style={{ backgroundColor: bg.val || "transparent" }}
                >
                  <span className={bg.val === "#0f172a" ? "text-white" : "text-slate-700 dark:text-zinc-200"}>
                    {bg.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Border Width & Style */}
          <div className="space-y-1.5 border-t border-slate-100 dark:border-zinc-800/80 pt-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              Border Line Style
            </div>
            <div className="grid grid-cols-4 gap-1">
              {(["none", "solid", "dashed", "dotted"] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() =>
                    handleUpdate({
                      borderStyle: st,
                      borderWidth: st === "none" ? 0 : rowStyle.borderWidth || 1,
                      borderColor: st === "none" ? "transparent" : rowStyle.borderColor || "#e2e8f0",
                    })
                  }
                  className={`py-1 rounded-lg text-[10px] font-bold capitalize border transition-all cursor-pointer ${
                    (rowStyle.borderStyle || (rowStyle.borderWidth ? "solid" : "none")) === st
                      ? "border-[#8B3DFF] bg-purple-500/10 text-[#8B3DFF]"
                      : "border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Border Radius */}
          <div className="space-y-1.5 border-t border-slate-100 dark:border-zinc-800/80 pt-2">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              <span>Corner Radius</span>
              <span className="text-[#8B3DFF]">
                {typeof rowStyle.borderRadius === "number" ? `${rowStyle.borderRadius}px` : rowStyle.borderRadius || "16px"}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {[0, 8, 12, 16, 24].map((rad) => (
                <button
                  key={rad}
                  type="button"
                  onClick={() => handleUpdate({ borderRadius: rad })}
                  className={`py-1 rounded-md text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                    rowStyle.borderRadius === rad
                      ? "border-[#8B3DFF] bg-purple-500/10 text-[#8B3DFF]"
                      : "border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-100"
                  }`}
                >
                  {rad}px
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Row Actions */}
      <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 space-y-2">
        {onTogglePageBreak && (
          <button
            type="button"
            onClick={() => onTogglePageBreak(row.id)}
            className={`w-full py-1.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              row.pageBreakBefore
                ? "border-purple-500 bg-purple-500/15 text-[#8B3DFF]"
                : "border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{row.pageBreakBefore ? "Remove Page Break Before Row" : "Force Row onto New Page"}</span>
          </button>
        )}

        {onRemoveRow && (
          <button
            type="button"
            onClick={() => {
              onClose();
              onRemoveRow(row.id);
            }}
            className="w-full py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-500 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Row</span>
          </button>
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-full py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer transition-colors shadow-sm"
        >
          Apply & Close
        </button>
      </div>
    </div>
  );
}

export function SortableRow({
  sectionId,
  row,
  selectedCellId,
  selectedRowId,
  isPreview = false,
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
  onUpdateRowStyle,
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
  const [rowConfigOpen, setRowConfigOpen] = useState(false);
  const configBtnRef = useRef<HTMLButtonElement | null>(null);
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
            ref={configBtnRef}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (typeof onSelectCell === "function") {
                onSelectCell(null, row.id);
              }
              setRowConfigOpen((prev) => !prev);
            }}
            className={`p-0.5 rounded cursor-pointer transition-colors ${
              isRowSelected || rowConfigOpen ? "text-[#8B3DFF] bg-purple-500/15 font-bold" : "hover:text-[#8B3DFF]"
            }`}
            title="Configure Row Spacing & Borders (Row Gap, Column Gap, Padding, Borders)"
          >
            <Sliders className="w-3 h-3" />
          </button>

          <RibbonPortalPopover
            anchorEl={configBtnRef.current}
            isOpen={rowConfigOpen}
            onClose={() => setRowConfigOpen(false)}
            align="right"
          >
            <RowConfigPopover
              row={row}
              onUpdateRowStyle={onUpdateRowStyle}
              onTogglePageBreak={onTogglePageBreak}
              onRemoveRow={onRemoveRow}
              onClose={() => setRowConfigOpen(false)}
            />
          </RibbonPortalPopover>

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
          style={{
            columnGap: row.style?.columnGap !== undefined ? `${row.style.columnGap}px` : "12px",
            rowGap: row.style?.rowGap !== undefined ? `${row.style.rowGap}px` : "12px",
            paddingTop: row.style?.paddingTop !== undefined ? `${row.style.paddingTop}px` : row.style?.padding !== undefined ? `${row.style.padding}px` : undefined,
            paddingBottom: row.style?.paddingBottom !== undefined ? `${row.style.paddingBottom}px` : row.style?.padding !== undefined ? `${row.style.padding}px` : undefined,
            paddingLeft: row.style?.paddingLeft !== undefined ? `${row.style.paddingLeft}px` : row.style?.padding !== undefined ? `${row.style.padding}px` : undefined,
            paddingRight: row.style?.paddingRight !== undefined ? `${row.style.paddingRight}px` : row.style?.padding !== undefined ? `${row.style.padding}px` : undefined,
            marginTop: row.style?.marginTop !== undefined ? `${row.style.marginTop}px` : row.style?.margin !== undefined ? `${row.style.margin}px` : undefined,
            marginBottom: row.style?.marginBottom !== undefined ? `${row.style.marginBottom}px` : row.style?.margin !== undefined ? `${row.style.margin}px` : undefined,
            borderWidth: row.style?.borderWidth !== undefined ? `${row.style.borderWidth}px` : undefined,
            borderColor: row.style?.borderColor || undefined,
            borderStyle: row.style?.borderStyle || (row.style?.borderWidth ? "solid" : undefined),
            borderRadius: row.style?.borderRadius !== undefined ? (typeof row.style.borderRadius === "number" ? `${row.style.borderRadius}px` : row.style.borderRadius) : undefined,
            backgroundColor: getRowBackground(row.style),
          }}
          className={`canvas-row-cells flex flex-wrap items-stretch ${row.cells.length === 0 ? "min-h-[60px]" : "min-h-0"} transition-colors duration-100 rounded-2xl ${
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

"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { SidebarAddBlockEvent } from "../CanvasSidebar";

export interface DropInsertZoneProps {
  insertIndex: number;
  onAddRow?: (index: number) => void;
  onDropBlock?: (e: SidebarAddBlockEvent) => void;
  label?: string;
}

export function DropInsertZone({
  insertIndex,
  onAddRow,
  onDropBlock,
  label = "Insert Row Here",
}: DropInsertZoneProps) {
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

export interface PageAddRowDropZoneProps {
  pageNumber: number;
  insertIndex: number;
  onAddRow: () => void;
  onDropBlock?: (e: SidebarAddBlockEvent) => void;
}

export function PageAddRowDropZone({
  pageNumber,
  insertIndex,
  onAddRow,
  onDropBlock,
}: PageAddRowDropZoneProps) {
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

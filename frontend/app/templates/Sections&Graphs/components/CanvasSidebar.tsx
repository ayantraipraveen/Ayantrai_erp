"use client";

import React from "react";
import {
  Activity,
  BarChart2,
  Lightbulb,
  AlignLeft,
  LayoutGrid,
  Minus,
  Plus,
  GripVertical,
} from "lucide-react";
import { CanvasBlockType } from "@/lib/redux/slices/reportModuleSlice";

export interface SidebarAddBlockEvent {
  blockType: CanvasBlockType;
  targetRowId?: string; // if undefined, creates a new row
}

interface CanvasSidebarProps {
  onAddBlock: (e: SidebarAddBlockEvent) => void;
}

interface BlockDef {
  type: CanvasBlockType;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  border: string;
  iconColor: string;
}

const BLOCK_DEFS: BlockDef[] = [
  {
    type: "metric-card",
    label: "Metric Card",
    description: "Pastel KPI indicator card",
    icon: Activity,
    color: "bg-blue-500/8 hover:bg-blue-500/14",
    border: "border-blue-400/25",
    iconColor: "text-blue-500",
  },
  {
    type: "chart",
    label: "Chart / Graph",
    description: "Bar, line, pie, heatmap & more",
    icon: BarChart2,
    color: "bg-purple-500/8 hover:bg-purple-500/14",
    border: "border-purple-400/25",
    iconColor: "text-[#9D61FF]",
  },
  {
    type: "insight",
    label: "Key Insight",
    description: "Numbered observation bullet",
    icon: Lightbulb,
    color: "bg-amber-500/8 hover:bg-amber-500/14",
    border: "border-amber-400/25",
    iconColor: "text-amber-500",
  },
  {
    type: "text",
    label: "Text Block",
    description: "Editable paragraph content",
    icon: AlignLeft,
    color: "bg-slate-500/8 hover:bg-slate-500/14",
    border: "border-slate-400/25",
    iconColor: "text-slate-500",
  },
  {
    type: "badge-strip",
    label: "Badge Strip",
    description: "4-badge insight row from report",
    icon: LayoutGrid,
    color: "bg-emerald-500/8 hover:bg-emerald-500/14",
    border: "border-emerald-400/25",
    iconColor: "text-emerald-500",
  },
  {
    type: "divider",
    label: "Divider",
    description: "Horizontal section separator",
    icon: Minus,
    color: "bg-zinc-500/8 hover:bg-zinc-500/14",
    border: "border-zinc-400/25",
    iconColor: "text-zinc-400",
  },
];

export function CanvasSidebar({ onAddBlock }: CanvasSidebarProps) {
  return (
    <aside
      className="
        flex-shrink-0 w-52 flex flex-col gap-1
        border-r border-slate-200 dark:border-zinc-800
        bg-white dark:bg-[#0b0e14]
        overflow-y-auto
      "
    >
      {/* Header */}
      <div className="flex-shrink-0 px-4 pt-4 pb-3 border-b border-slate-100 dark:border-zinc-800/80">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500">
          Block Library
        </p>
        <p className="text-[11px] text-slate-500 dark:text-zinc-500 mt-0.5">
          Click to add to canvas
        </p>
      </div>

      {/* Block List */}
      <div className="flex-1 px-3 py-3 space-y-1.5">
        {BLOCK_DEFS.map((def) => {
          const Icon = def.icon;
          return (
            <button
              key={def.type}
              type="button"
              onClick={() => onAddBlock({ blockType: def.type })}
              className={`
                w-full group flex items-center gap-3 rounded-xl border px-3 py-2.5
                text-left transition-all cursor-pointer
                ${def.color} ${def.border}
              `}
            >
              {/* Drag grip hint */}
              <GripVertical className="w-3 h-3 text-slate-300 dark:text-zinc-600 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className={`flex-shrink-0 ${def.iconColor}`}>
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold text-slate-800 dark:text-zinc-200 truncate">
                  {def.label}
                </div>
                <div className="text-[10px] text-slate-400 dark:text-zinc-500 leading-tight mt-0.5 truncate">
                  {def.description}
                </div>
              </div>

              <Plus className="w-3.5 h-3.5 text-slate-300 dark:text-zinc-600 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          );
        })}
      </div>

      {/* Footer hint */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-slate-100 dark:border-zinc-800/80">
        <p className="text-[10px] text-slate-400 dark:text-zinc-600 leading-relaxed">
          Drag cells across rows to rearrange layout.
        </p>
      </div>
    </aside>
  );
}

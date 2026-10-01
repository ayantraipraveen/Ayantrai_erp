"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  BarChart2,
  Users,
  AlertTriangle,
  UserCheck,
  Box,
  FileText,
  Target,
  Layers,
  Edit3,
  Sparkles,
} from "lucide-react";
import {
  TableOfContentsData,
  TableOfContentsItem,
  DEFAULT_TOC_DATA,
} from "@/lib/redux/types/reportModuleTypes";

export interface CanvasTableOfContentsPageProps {
  tocData?: Partial<TableOfContentsData>;
  activeIsPreview?: boolean;
  onUpdate?: (data: Partial<TableOfContentsData>) => void;
}

interface EditingField {
  type: "meta" | "item";
  field: string;
  itemId?: string;
  value: string;
}

const ICON_MAP: Record<string, React.ElementType> = {
  chart: BarChart2,
  users: Users,
  alert: AlertTriangle,
  supervisor: UserCheck,
  box: Box,
  file: FileText,
  target: Target,
  layers: Layers,
};

const COLOR_MAP: Record<string, { bg: string; text: string; iconBg: string }> = {
  "01": { bg: "bg-blue-50 dark:bg-blue-950/40", text: "text-blue-600 dark:text-blue-400", iconBg: "bg-blue-500/10" },
  "02": { bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-600 dark:text-emerald-400", iconBg: "bg-emerald-500/10" },
  "03": { bg: "bg-rose-50 dark:bg-rose-950/40", text: "text-rose-600 dark:text-rose-400", iconBg: "bg-rose-500/10" },
  "04": { bg: "bg-purple-50 dark:bg-purple-950/40", text: "text-purple-600 dark:text-purple-400", iconBg: "bg-purple-500/10" },
  "05": { bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-600 dark:text-amber-400", iconBg: "bg-amber-500/10" },
  "06": { bg: "bg-sky-50 dark:bg-sky-950/40", text: "text-sky-600 dark:text-sky-400", iconBg: "bg-sky-500/10" },
  "07": { bg: "bg-indigo-50 dark:bg-indigo-950/40", text: "text-indigo-600 dark:text-indigo-400", iconBg: "bg-indigo-500/10" },
};

export function CanvasTableOfContentsPage({
  tocData,
  activeIsPreview = false,
  onUpdate,
}: CanvasTableOfContentsPageProps) {
  const data: TableOfContentsData = { ...DEFAULT_TOC_DATA, ...tocData };
  const items = data.items && data.items.length > 0 ? data.items : DEFAULT_TOC_DATA.items;

  const [editing, setEditing] = useState<EditingField | null>(null);

  const startEditMeta = (field: string, initialVal: string) => {
    if (activeIsPreview) return;
    setEditing({ type: "meta", field, value: initialVal });
  };

  const startEditItem = (itemId: string, field: string, initialVal: string) => {
    if (activeIsPreview) return;
    setEditing({ type: "item", itemId, field, value: initialVal });
  };

  const commitEdit = () => {
    if (!editing) return;
    if (editing.type === "meta") {
      onUpdate?.({ [editing.field]: editing.value });
    } else if (editing.type === "item" && editing.itemId) {
      const nextItems = items.map((it) =>
        it.id === editing.itemId ? { ...it, [editing.field]: editing.value } : it
      );
      onUpdate?.({ items: nextItems });
    }
    setEditing(null);
  };

  return (
    <div
      id="canvas-toc-page"
      className="relative bg-white text-slate-900 overflow-hidden flex flex-col select-none shadow-md border border-slate-200/60 transition-all mx-auto"
      style={{ width: "595px", minHeight: "842px" }}
    >
      {/* ── TOP RUNNING HEADER (Page 2) ── */}
      <div className="px-7 pt-5 pb-3 border-b border-slate-100 flex items-center justify-between text-[9px] text-slate-400 font-medium">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] flex items-center justify-center text-[7px] text-white">▲</span>
            <span>Sitesafe</span>
          </div>
          <div className="h-3 w-px bg-slate-200" />
          <span className="italic text-slate-500">
            Visibility for Every Worker, Intelligence for Every Site.
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono">
          <span className="font-semibold text-slate-700">Monthly Report</span>
          <span>{data.reportingPeriod || "01 Sept 2025 – 30 Sept 2025"}</span>
          <div className="h-3 w-px bg-slate-200" />
          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-bold text-[10px]">
            Page 02
          </span>
        </div>
      </div>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <div className="flex-1 px-7 py-5 flex flex-col justify-between">
        
        {/* Title Block */}
        <div className="mb-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 font-mono">
            Table of
          </div>
          <h1 className="text-3xl font-black text-[#0f2044] tracking-tight leading-none mt-0.5">
            Contents
          </h1>
          <div
            className="text-[11px] text-slate-500 mt-1 max-w-md cursor-text"
            onDoubleClick={() => startEditMeta("subtitle", data.subtitle)}
          >
            {editing?.type === "meta" && editing.field === "subtitle" ? (
              <input
                autoFocus
                value={editing.value}
                onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                onBlur={commitEdit}
                className="w-full bg-slate-50 border border-purple-400 rounded px-1 outline-none text-xs"
              />
            ) : (
              <span>{data.subtitle}</span>
            )}
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="flex items-stretch gap-4 flex-1">
          
          {/* Left Hero Graphic Card (Matching Dummy_report.pdf) */}
          <div className="w-[170px] rounded-2xl bg-gradient-to-b from-[#0f2044] via-[#162a56] to-[#0a1630] text-white p-4 flex flex-col justify-between relative overflow-hidden flex-shrink-0 shadow-sm">
            {/* Subtle Top Background Watermark */}
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-28 h-28 rounded-full bg-white/5 blur-xl pointer-events-none" />
            
            <div className="relative z-10 space-y-3">
              <div className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-[#f59e0b] font-black text-sm border border-white/15">
                ▲
              </div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-300 font-semibold">
                AyantrAI Platform
              </div>
              <div
                className="text-base font-extrabold leading-tight cursor-text"
                onDoubleClick={() => startEditMeta("sidebarTitle", data.sidebarTitle || "Safer People\nStronger Industries")}
              >
                {editing?.type === "meta" && editing.field === "sidebarTitle" ? (
                  <textarea
                    autoFocus
                    rows={2}
                    value={editing.value}
                    onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                    onBlur={commitEdit}
                    className="w-full bg-white/10 border border-cyan-400 rounded px-1 outline-none text-xs text-white"
                  />
                ) : (
                  (data.sidebarTitle || "Safer People\nStronger Industries").split("\n").map((line, idx) => (
                    <div key={idx}>{line}</div>
                  ))
                )}
              </div>
            </div>

            {/* Bottom Hero Tagline */}
            <div className="relative z-10 pt-3 border-t border-white/10 space-y-1">
              <div
                className="text-[10px] text-slate-300 leading-snug cursor-text"
                onDoubleClick={() => startEditMeta("sidebarTagline", data.sidebarTagline || "AI + IoT for a safer, smarter tomorrow.")}
              >
                {editing?.type === "meta" && editing.field === "sidebarTagline" ? (
                  <input
                    autoFocus
                    value={editing.value}
                    onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                    onBlur={commitEdit}
                    className="w-full bg-white/10 border border-cyan-400 rounded px-1 outline-none text-[10px] text-white"
                  />
                ) : (
                  <span>{data.sidebarTagline || "AI + IoT for a safer, smarter tomorrow."}</span>
                )}
              </div>
              <div className="text-[9px] font-mono text-cyan-400 font-semibold pt-1">
                Every Worker Returns Home Safe
              </div>
            </div>
          </div>

          {/* Right Column: Numbered Table of Contents List */}
          <div className="flex-1 flex flex-col justify-between py-0.5 space-y-1.5">
            {items.map((item, idx) => {
              const numKey = item.number || String(idx + 1).padStart(2, "0");
              const palette = COLOR_MAP[numKey] || COLOR_MAP["01"];
              const IconComp = ICON_MAP[item.iconType || "chart"] || BarChart2;

              return (
                <div
                  key={item.id || idx}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors group border border-transparent hover:border-slate-100"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0 pr-3">
                    {/* Number Badge */}
                    <div
                      className={`w-9 h-9 rounded-xl ${palette.bg} ${palette.text} font-black text-sm flex items-center justify-center flex-shrink-0 font-mono shadow-xs border border-black/5`}
                    >
                      {numKey}
                    </div>

                    {/* Icon Bubble */}
                    <div
                      className={`w-7 h-7 rounded-lg ${palette.iconBg} ${palette.text} flex items-center justify-center flex-shrink-0`}
                    >
                      <IconComp className="w-3.5 h-3.5" />
                    </div>

                    {/* Title & Description */}
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-xs font-bold text-[#0f2044] truncate cursor-text hover:text-[#9D61FF] transition-colors"
                        onDoubleClick={() => startEditItem(item.id, "title", item.title)}
                        title={activeIsPreview ? undefined : "Double-click to edit"}
                      >
                        {editing?.type === "item" && editing.itemId === item.id && editing.field === "title" ? (
                          <input
                            autoFocus
                            value={editing.value}
                            onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                            onBlur={commitEdit}
                            className="w-full bg-white border border-[#9D61FF] rounded px-1 outline-none text-xs text-slate-900"
                          />
                        ) : (
                          item.title
                        )}
                      </div>

                      <div
                        className="text-[10px] text-slate-400 truncate mt-0.5 cursor-text"
                        onDoubleClick={() => startEditItem(item.id, "description", item.description)}
                        title={activeIsPreview ? undefined : "Double-click to edit"}
                      >
                        {editing?.type === "item" && editing.itemId === item.id && editing.field === "description" ? (
                          <input
                            autoFocus
                            value={editing.value}
                            onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                            onBlur={commitEdit}
                            className="w-full bg-white border border-[#9D61FF] rounded px-1 outline-none text-[10px] text-slate-700"
                          />
                        ) : (
                          item.description
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Page Range Badge */}
                  <div
                    className="text-xs font-mono font-bold text-slate-700 px-2 py-1 rounded-md bg-slate-100 group-hover:bg-purple-50 group-hover:text-[#9D61FF] transition-colors cursor-text flex-shrink-0"
                    onDoubleClick={() => startEditItem(item.id, "pageRange", item.pageRange)}
                    title={activeIsPreview ? undefined : "Double-click to edit page range"}
                  >
                    {editing?.type === "item" && editing.itemId === item.id && editing.field === "pageRange" ? (
                      <input
                        autoFocus
                        value={editing.value}
                        onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                        onBlur={commitEdit}
                        className="w-12 bg-white border border-[#9D61FF] rounded px-1 text-center outline-none text-xs"
                      />
                    ) : (
                      item.pageRange
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

      {/* ── BOTTOM RUNNING FOOTER ── */}
      <div className="px-7 py-3 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400">
        <div>
          <span className="font-semibold text-slate-600">AyantrAI Private Limited</span>
          <span className="mx-2 text-slate-300">•</span>
          <span>People | Technology | Safer Tomorrow</span>
        </div>
        <div className="font-serif italic text-slate-500">
          &ldquo;Every Worker Returns Home Safe&rdquo;
        </div>
      </div>
    </div>
  );
}

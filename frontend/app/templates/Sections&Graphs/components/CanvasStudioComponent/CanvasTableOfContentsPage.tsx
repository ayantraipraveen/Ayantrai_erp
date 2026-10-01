"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  BarChart2,
  Users,
  AlertTriangle,
  UserCog,
  Box,
  FileText,
  Target,
  Layers,
  Edit3,
} from "lucide-react";
import {
  TableOfContentsData,
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
  supervisor: UserCog,
  box: Box,
  file: FileText,
  target: Target,
  layers: Layers,
};

const COLOR_MAP: Record<string, { bg: string; text: string; iconBg: string }> = {
  "01": { bg: "bg-[#DCEBFF]", text: "text-[#1E5BCE]", iconBg: "bg-[#EBF3FE]" },
  "02": { bg: "bg-[#D2F5DC]", text: "text-[#187A42]", iconBg: "bg-[#E6F9EC]" },
  "03": { bg: "bg-[#FDE2DF]", text: "text-[#D42B2B]", iconBg: "bg-[#FDEEED]" },
  "04": { bg: "bg-[#E9DEFF]", text: "text-[#5E2DBF]", iconBg: "bg-[#F3ECFF]" },
  "05": { bg: "bg-[#FBEBD2]", text: "text-[#A66212]", iconBg: "bg-[#FDF4E6]" },
  "06": { bg: "bg-[#D9F4FF]", text: "text-[#087A9E]", iconBg: "bg-[#EAF8FE]" },
  "07": { bg: "bg-[#E6E1FF]", text: "text-[#4326B8]", iconBg: "bg-[#F0ECFF]" },
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

  const cancelEdit = () => {
    setEditing(null);
  };

  return (
    <div
      id="canvas-toc-page"
      className="relative bg-white text-slate-900 overflow-hidden select-none shadow-2xl mx-auto"
      style={{
        width: "595px",
        height: "842px",
        minHeight: "842px",
        maxHeight: "842px",
      }}
    >
      {/* ── 1. TOP RUNNING HEADER (Height = 56px, Pinned to top: 0) ── */}
      <header className="absolute top-0 left-0 right-0 h-[56px] px-7 border-b border-slate-100 flex items-center justify-between z-20 bg-white">
        {/* Left: Sitesafe Shield Logo & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-24 relative flex items-center">
            <Image
              src="/images/sitesafe-shield-logo.png"
              alt="Sitesafe"
              width={96}
              height={32}
              className="object-contain object-left max-h-12 w-auto"
              priority
            />
          </div>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex flex-col text-[8.5px] italic text-[#1D58BA] font-medium leading-tight">
            <span>Visibility for Every Worker,</span>
            <span>Intelligence for Every Site.</span>
          </div>
        </div>

        {/* Center/Right: Monthly Report & Date (clear of angled badge) */}
        <div className="flex items-center gap-3 pr-22">
          <div className="flex flex-col items-end">
            <span className="text-[12px] font-bold text-[#0E1C4E] leading-tight">
              Monthly Report
            </span>
            <div className="h-[2px] w-8 bg-[#1A38D6] rounded-full mt-0.5" />
            <div
              className="text-[9px] font-medium text-slate-500 mt-0.5 cursor-text"
              onDoubleClick={() => startEditMeta("reportingPeriod", data.reportingPeriod || "01 Sept 2025 – 30 Sept 2025")}
              title={activeIsPreview ? undefined : "Double-click to edit"}
            >
              {editing?.type === "meta" && editing.field === "reportingPeriod" ? (
                <input
                  autoFocus
                  value={editing.value}
                  onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                  onBlur={commitEdit}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitEdit();
                    if (e.key === "Escape") cancelEdit();
                  }}
                  className="bg-blue-50 border-b border-[#1A38D6] text-[9px] outline-none text-right px-0.5"
                />
              ) : (
                <span>{data.reportingPeriod || "01 Sept 2025 – 30 Sept 2025"}</span>
              )}
            </div>
          </div>

          {/* Thin vertical divider before Page badge */}
          <div className="h-5 w-px bg-slate-200 ml-1" />
        </div>

        {/* Far Right: Angled Page Badge Tab (Matches PDF polygon slant) */}
        <div
          className="absolute top-0 right-0 h-14 w-18 bg-[#0F1E3D] text-white flex flex-col items-center justify-center pl-3 pr-2.5 shadow-sm"
          style={{ clipPath: "polygon(22% 0, 100% 0, 100% 100%, 0% 100%)" }}
        >
          <span className="text-[8px] font-semibold uppercase tracking-wider text-slate-300 leading-none">Page</span>
          <span className="text-[17px] font-black leading-none text-white font-mono mt-0.5">02</span>
        </div>
      </header>

      {/* ── 2. MIDDLE CONTENT AREA (Exact height = 701px between Header and Footer) ── */}
      <div className="absolute top-[56px] bottom-[85px] left-0 right-0 overflow-hidden">
        
        {/* ── LEFT HERO CARD (Flush with left sheet boundary x=0, spans full height, rounded right corners) ── */}
        <div className="absolute top-0 left-0 bottom-0 w-[184px] rounded-r-2xl overflow-hidden shadow-sm flex flex-col justify-end">
          <Image
            src="/images/toc-sidebar-hero-clean.png"
            alt="Safer People Stronger Industries"
            fill
            priority
            className="object-cover object-bottom"
          />

          {/* Editable Overlay for Sidebar Title & Tagline (if user wants to customize) */}
          <div className="relative z-10 p-3 pt-6 flex flex-col justify-end text-white">
            <div
              className="cursor-text"
              onDoubleClick={() => startEditMeta("sidebarTitle", data.sidebarTitle || "Safer People\nStronger\nIndustries")}
              title={activeIsPreview ? undefined : "Double-click to edit"}
            >
              {editing?.type === "meta" && editing.field === "sidebarTitle" ? (
                <textarea
                  autoFocus
                  rows={3}
                  value={editing.value}
                  onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                  onBlur={commitEdit}
                  className="w-full bg-blue-950/80 border-b border-cyan-400 outline-none text-sm font-extrabold text-white leading-tight resize-none"
                />
              ) : null}
            </div>

            <div
              className="mt-1 cursor-text"
              onDoubleClick={() => startEditMeta("sidebarTagline", data.sidebarTagline || "AI + IoT for a safer, smarter tomorrow.")}
              title={activeIsPreview ? undefined : "Double-click to edit"}
            >
              {editing?.type === "meta" && editing.field === "sidebarTagline" ? (
                <input
                  autoFocus
                  value={editing.value}
                  onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                  onBlur={commitEdit}
                  className="w-full bg-blue-950/80 border-b border-cyan-400 outline-none text-[9.5px] text-white leading-tight"
                />
              ) : null}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: HEADLINE & 7 CONTENT ROWS ── */}
        <div className="absolute top-2.5 bottom-2.5 left-[198px] right-6 flex flex-col justify-between py-1 min-w-0">
          
          {/* Title Block */}
          <div className="relative">
            {/* Top Accent Bar */}
            <div className="w-12 h-[3.5px] bg-[#1A38D6] rounded-full mb-1.5" />

            {/* TABLE OF */}
            <div className="text-[12px] font-black tracking-[0.16em] uppercase text-[#0B1546] leading-tight">
              TABLE OF
            </div>

            {/* Contents */}
            <h1 className="text-[40px] font-black text-[#0A1646] leading-[0.92] tracking-tight mt-0.5">
              Contents
            </h1>

            {/* Subtitle */}
            <div
              className="text-[10px] font-medium text-slate-500 leading-snug max-w-[270px] mt-1.5 cursor-text"
              onDoubleClick={() => startEditMeta("subtitle", data.subtitle)}
              title={activeIsPreview ? undefined : "Double-click to edit subtitle"}
            >
              {editing?.type === "meta" && editing.field === "subtitle" ? (
                <input
                  autoFocus
                  value={editing.value}
                  onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                  onBlur={commitEdit}
                  className="w-full bg-blue-50/80 border-b border-[#1A38D6] outline-none text-[10px] text-slate-800"
                />
              ) : (
                <span>{data.subtitle}</span>
              )}
            </div>

            {/* Handwritten script note (top-right of headline) matching reference */}
            <div className="absolute right-0 -top-1 pointer-events-none select-none text-right">
              <div
                className="text-[#1A38D6] font-bold text-[14px] leading-snug tracking-tight italic"
                style={{
                  fontFamily: "'Segoe Script', 'Brush Script MT', 'Caveat', cursive, sans-serif",
                  transform: "rotate(-7deg)",
                  transformOrigin: "bottom right",
                }}
              >
                Every Worker<br />Returns Home Safe
                <div className="h-[2px] w-24 bg-[#1A38D6] ml-auto mt-0.5 rounded-full" />
              </div>
            </div>
          </div>

          {/* 7 Content Items */}
          <div className="flex flex-col flex-1 mt-8">
            {items.map((item, idx) => {
              const numKey = item.number || String(idx + 1).padStart(2, "0");
              const palette = COLOR_MAP[numKey] || COLOR_MAP["01"];
              const IconComp = ICON_MAP[item.iconType || "chart"] || BarChart2;

              return (
                <div
                  key={item.id || idx}
                  className="flex items-center justify-between py-1 border-b border-slate-100 last:border-b-0 group"
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
                    {/* Number Badge */}
                    <div
                      className={`w-9 h-9 rounded-xl ${palette.bg} ${palette.text} font-black text-xs flex items-center justify-center flex-shrink-0 font-mono shadow-xs`}
                    >
                      {numKey}
                    </div>

                    {/* Circular Icon */}
                    <div
                      className={`w-9 h-9 rounded-full ${palette.iconBg} ${palette.text} flex items-center justify-center flex-shrink-0`}
                    >
                      <IconComp className="w-4 h-4 stroke-[2]" />
                    </div>

                    {/* Title & Description (Natural 2-line wrap matching reference PDF) */}
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-[12.5px] font-bold text-[#0E1B46] leading-tight cursor-text hover:text-[#1A38D6] transition-colors"
                        onDoubleClick={() => startEditItem(item.id, "title", item.title)}
                        title={activeIsPreview ? undefined : "Double-click to edit"}
                      >
                        {editing?.type === "item" && editing.itemId === item.id && editing.field === "title" ? (
                          <input
                            autoFocus
                            value={editing.value}
                            onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                            onBlur={commitEdit}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") commitEdit();
                              if (e.key === "Escape") cancelEdit();
                            }}
                            className="w-full bg-blue-50/80 border-b border-[#1A38D6] outline-none text-[12.5px] font-bold text-slate-900"
                          />
                        ) : (
                          item.title
                        )}
                      </div>

                      <div
                        className="text-[9.5px] text-[#64748B] leading-tight mt-0.5 cursor-text"
                        onDoubleClick={() => startEditItem(item.id, "description", item.description)}
                        title={activeIsPreview ? undefined : "Double-click to edit"}
                      >
                        {editing?.type === "item" && editing.itemId === item.id && editing.field === "description" ? (
                          <textarea
                            autoFocus
                            rows={2}
                            value={editing.value}
                            onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                            onBlur={commitEdit}
                            className="w-full bg-blue-50/80 border-b border-[#1A38D6] outline-none text-[9.5px] text-slate-700 resize-none leading-tight"
                          />
                        ) : (
                          item.description
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Page Number (Bold right-aligned) */}
                  <div
                    className="text-[13px] font-bold text-[#0E1B46] px-1 py-0.5 rounded cursor-text flex-shrink-0 text-right min-w-[36px]"
                    onDoubleClick={() => startEditItem(item.id, "pageRange", item.pageRange)}
                    title={activeIsPreview ? undefined : "Double-click to edit page range"}
                  >
                    {editing?.type === "item" && editing.itemId === item.id && editing.field === "pageRange" ? (
                      <input
                        autoFocus
                        value={editing.value}
                        onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                        onBlur={commitEdit}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitEdit();
                          if (e.key === "Escape") cancelEdit();
                        }}
                        className="w-12 bg-blue-50/80 border-b border-[#1A38D6] text-center outline-none text-[13px] font-bold"
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

      {/* ── 3. BOTTOM RUNNING FOOTER (Exact match with Cover Page, pinned to bottom: 0) ── */}
      <footer
        className="absolute bottom-0 left-0 right-0 z-20 bg-white border-t border-slate-200/80 px-9 flex items-center justify-between"
        style={{ height: "85px" }}
      >
        {/* Left: Company & Websites */}
        <div className="min-w-0 flex flex-col justify-center">
          <span className="text-[9.5px] font-bold text-slate-800 tracking-wider uppercase leading-tight">
            AYANTRAI PRIVATE LIMITED
          </span>
          <span className="text-[8px] font-medium text-slate-500 leading-tight mt-1">
            www.ayantrai.com&nbsp;&nbsp;|&nbsp;&nbsp;www.sitesafe.ai
          </span>
        </div>

        {/* Center: Accent divider bar */}
        <div className="h-[1.5px] w-32 bg-slate-300 mx-4 flex-shrink-0" />

        {/* Right: Safety Quote */}
        <div className="text-right flex-shrink-0">
          <span className="text-[9px] font-semibold italic text-slate-700">
            &ldquo;Every Worker Returns Home Safe&rdquo;
          </span>
        </div>
      </footer>
    </div>
  );
}


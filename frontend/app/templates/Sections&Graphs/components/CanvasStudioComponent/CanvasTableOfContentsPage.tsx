"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
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
  Sparkles,
} from "lucide-react";
import {
  TableOfContentsData,
  TableOfContentsItem,
  DEFAULT_TOC_DATA,
} from "@/lib/redux/types/reportModuleTypes";
import { AccurateReportSectionGroup } from "../../utils/canvasLayoutUtils";

export interface CanvasTableOfContentsPageProps {
  tocData?: Partial<TableOfContentsData>;
  activeIsPreview?: boolean;
  onUpdate?: (data: Partial<TableOfContentsData>) => void;
  sectionGroups?: AccurateReportSectionGroup[];
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

const COLOR_PALETTES = [
  { bg: "bg-[#DCEBFF]", text: "text-[#1E5BCE]", iconBg: "bg-[#EBF3FE]" },
  { bg: "bg-[#D2F5DC]", text: "text-[#187A42]", iconBg: "bg-[#E6F9EC]" },
  { bg: "bg-[#FDE2DF]", text: "text-[#D42B2B]", iconBg: "bg-[#FDEEED]" },
  { bg: "bg-[#E9DEFF]", text: "text-[#5E2DBF]", iconBg: "bg-[#F3ECFF]" },
  { bg: "bg-[#FBEBD2]", text: "text-[#A66212]", iconBg: "bg-[#FDF4E6]" },
  { bg: "bg-[#D9F4FF]", text: "text-[#087A9E]", iconBg: "bg-[#EAF8FE]" },
  { bg: "bg-[#E6E1FF]", text: "text-[#4326B8]", iconBg: "bg-[#F0ECFF]" },
  { bg: "bg-[#FEF08A]/40", text: "text-[#854D0E]", iconBg: "bg-[#FEF9C3]" },
  { bg: "bg-[#CCFBF1]", text: "text-[#0F766E]", iconBg: "bg-[#F0FDFA]" },
  { bg: "bg-[#FCE7F3]", text: "text-[#9D174D]", iconBg: "bg-[#FDF2F8]" },
];

export function CanvasTableOfContentsPage({
  tocData,
  activeIsPreview = false,
  onUpdate,
  sectionGroups,
}: CanvasTableOfContentsPageProps) {
  const data: TableOfContentsData = { ...DEFAULT_TOC_DATA, ...tocData };
  const rawItems = data.items && data.items.length > 0 ? data.items : DEFAULT_TOC_DATA.items;

  // Dynamically resolve items based on real report section groups when available
  const items = useMemo(() => {
    if (!sectionGroups || sectionGroups.length === 0) {
      return rawItems;
    }

    return sectionGroups.map((group, idx) => {
      const existing = rawItems[idx];
      const numKey = existing?.number || String(idx + 1).padStart(2, "0");
      return {
        id: existing?.id || `toc-group-${group.id || idx}`,
        number: numKey,
        title:
          existing?.title && existing.title !== DEFAULT_TOC_DATA.items[idx]?.title
            ? existing.title
            : group.name,
        description:
          existing?.description ||
          "Comprehensive operational telemetry, performance metrics and safety review.",
        pageRange: group.pageRangeStr || existing?.pageRange || String(idx + 3),
        iconType:
          existing?.iconType ||
          (idx % 4 === 0 ? "chart" : idx % 4 === 1 ? "users" : idx % 4 === 2 ? "alert" : "target"),
        color: existing?.color,
      };
    });
  }, [sectionGroups, rawItems]);

  const [editing, setEditing] = useState<EditingField | null>(null);

  const startEditMeta = (field: keyof TableOfContentsData, initialVal?: string) => {
    if (activeIsPreview) return;
    setEditing({ type: "meta", field, value: String(initialVal ?? data[field] ?? "") });
  };

  const startEditItem = (itemId: string, field: keyof TableOfContentsItem, initialVal?: string) => {
    if (activeIsPreview) return;
    setEditing({ type: "item", itemId, field, value: String(initialVal ?? "") });
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

  // Reusable meta text editor
  const EditableMetaText = ({
    field,
    className = "",
    placeholder = "",
    multiline = false,
    as = "span",
    style,
  }: {
    field: keyof TableOfContentsData;
    className?: string;
    placeholder?: string;
    multiline?: boolean;
    rows?: number;
    as?: "span" | "div" | "h1" | "p";
    style?: React.CSSProperties;
  }) => {
    const isEditing = editing?.type === "meta" && editing.field === field;
    const content = String(data[field] ?? placeholder);
    const Tag = as;
    const elementRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
      if (isEditing && elementRef.current) {
        elementRef.current.focus();
        const range = document.createRange();
        range.selectNodeContents(elementRef.current);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }, [isEditing]);

    const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
      if (!isEditing) return;
      const text = e.currentTarget.innerText;
      onUpdate?.({ [field]: text });
      setEditing(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (elementRef.current) {
          elementRef.current.innerText = content;
        }
        setEditing(null);
      } else if (!multiline && e.key === "Enter") {
        e.preventDefault();
        e.currentTarget.blur();
      } else if (multiline && e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        e.currentTarget.blur();
      }
    };

    return (
      <Tag
        ref={elementRef as any}
        contentEditable={isEditing && !activeIsPreview}
        suppressContentEditableWarning
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (!activeIsPreview) startEditMeta(field, content);
        }}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`${className} ${
          isEditing
            ? "outline-none ring-1.5 ring-blue-500 bg-blue-50/40 rounded-xs px-0.5 cursor-text select-text"
            : !activeIsPreview
            ? "hover:ring-1 hover:ring-blue-300/50 hover:bg-blue-50/30 rounded-xs px-0.5 cursor-text"
            : ""
        }`}
        style={style}
        title={activeIsPreview ? undefined : "Double-click to edit"}
      >
        {content}
      </Tag>
    );
  };

  // Reusable item text editor
  const EditableItemText = ({
    itemId,
    field,
    className = "",
    placeholder = "",
    multiline = false,
    as = "span",
    style,
  }: {
    itemId: string;
    field: keyof TableOfContentsItem;
    className?: string;
    placeholder?: string;
    multiline?: boolean;
    rows?: number;
    as?: "span" | "div";
    style?: React.CSSProperties;
  }) => {
    const isEditing = editing?.type === "item" && editing.itemId === itemId && editing.field === field;
    const item = items.find((it) => it.id === itemId);
    const content = String(item?.[field] ?? placeholder);
    const Tag = as;
    const elementRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
      if (isEditing && elementRef.current) {
        elementRef.current.focus();
        const range = document.createRange();
        range.selectNodeContents(elementRef.current);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }, [isEditing]);

    const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
      if (!isEditing) return;
      const text = e.currentTarget.innerText;
      const nextItems = items.map((it) =>
        it.id === itemId ? { ...it, [field]: text } : it
      );
      onUpdate?.({ items: nextItems });
      setEditing(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (elementRef.current) {
          elementRef.current.innerText = content;
        }
        setEditing(null);
      } else if (!multiline && e.key === "Enter") {
        e.preventDefault();
        e.currentTarget.blur();
      } else if (multiline && e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        e.currentTarget.blur();
      }
    };

    return (
      <Tag
        ref={elementRef as any}
        contentEditable={isEditing && !activeIsPreview}
        suppressContentEditableWarning
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (!activeIsPreview) startEditItem(itemId, field, content);
        }}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`${className} ${
          isEditing
            ? "outline-none ring-1.5 ring-blue-500 bg-blue-50/40 rounded-xs px-0.5 cursor-text select-text"
            : !activeIsPreview
            ? "hover:ring-1 hover:ring-blue-300/50 hover:bg-blue-50/30 rounded-xs px-0.5 cursor-text"
            : ""
        }`}
        style={style}
        title={activeIsPreview ? undefined : "Double-click to edit"}
      >
        {content}
      </Tag>
    );
  };

  return (
    <div
      id="canvas-toc-page"
      className="relative bg-white text-slate-900 overflow-hidden select-none mx-auto"
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
          <EditableMetaText
            field="headerSubtitle"
            multiline
            rows={2}
            as="div"
            className="text-[8.5px] italic text-[#1D58BA] font-medium leading-tight whitespace-pre-line"
            placeholder={"Visibility for Every Worker,\nIntelligence for Every Site."}
          />
        </div>

        {/* Center/Right: Monthly Report & Date (clear of angled badge) */}
        <div className="flex items-center gap-3 pr-22">
          <div className="flex flex-col items-end">
            <EditableMetaText
              field="reportTitle"
              className="text-[12px] font-bold text-[#0E1C4E] leading-tight"
              placeholder="Monthly Report"
            />
            <div className="h-[2px] w-8 bg-[#1A38D6] rounded-full mt-0.5" />
            <EditableMetaText
              field="reportingPeriod"
              className="text-[9px] font-medium text-slate-500 mt-0.5 text-right block"
              placeholder="01 Sept 2025 – 30 Sept 2025"
            />
          </div>

          {/* Thin vertical divider before Page badge */}
          <div className="h-5 w-px bg-slate-200 ml-1" />
        </div>

        {/* Far Right: Angled Page Badge Tab (Matches PDF polygon slant) */}
        <div
          className="absolute top-0 right-0 h-14 w-18 bg-[#0F1E3D] text-white flex flex-col items-center justify-center pl-3 pr-2.5"
          style={{ clipPath: "polygon(22% 0, 100% 0, 100% 100%, 0% 100%)" }}
        >
          <span className="text-[8px] font-semibold uppercase tracking-wider text-slate-300 leading-none">Page</span>
          <span className="text-[17px] font-black leading-none text-white font-mono mt-0.5">02</span>
        </div>
      </header>

      {/* ── 2. MIDDLE CONTENT AREA (Exact height = 701px between Header and Footer) ── */}
      <div className="absolute top-[56px] bottom-[85px] left-0 right-0 overflow-hidden">
        
        {/* ── LEFT HERO CARD (Flush with left sheet boundary x=0, spans full height, rounded right corners) ── */}
        <div className="absolute top-0 left-0 bottom-0 w-[184px] rounded-r-2xl overflow-hidden flex flex-col justify-end">
          {/* Background image without text */}
          <Image
            src="/images/toc-sidebar-hero-clean.png"
            alt="Safer People Stronger Industries"
            fill
            priority
            className="object-cover object-bottom"
          />

          {/* Real Text Overlay for Sidebar Title & Tagline with double-click in-place editing! */}
          <div className="relative z-10 p-4 pb-6 flex flex-col justify-end text-white">
            <EditableMetaText
              field="sidebarTitle"
              multiline
              rows={3}
              as="div"
              className="text-[16px] font-black text-white leading-[1.08] tracking-tight whitespace-pre-line"
              placeholder={"Safer People\nStronger\nIndustries"}
            />

            {/* Accent divider line */}
            <div className="w-8 h-[2.5px] bg-[#1A38D6] rounded-full my-2" />

            {/* Tagline: AI + IoT for a safer, smarter tomorrow. */}
            <EditableMetaText
              field="sidebarTagline"
              multiline
              rows={2}
              as="div"
              className="text-[9.5px] font-medium text-slate-200 leading-snug whitespace-pre-line"
              placeholder={"AI + IoT for a safer,\nsmarter tomorrow."}
            />
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
            <EditableMetaText
              field="title"
              as="h1"
              className="text-[40px] font-black text-[#0A1646] leading-[0.92] tracking-tight mt-0.5 block"
              placeholder="Contents"
            />

            {/* Subtitle */}
            <EditableMetaText
              field="subtitle"
              multiline
              rows={2}
              as="div"
              className="text-[10px] font-medium text-slate-500 leading-snug max-w-[270px] mt-1.5 block"
              placeholder="A complete overview of workforce safety, device utilisation and operational performance."
            />

            {/* Handwritten script note (top-right of headline) matching reference */}
            <div className="absolute right-0 -top-1 text-right">
              <div
                style={{
                  fontFamily: "'Segoe Script', 'Brush Script MT', 'Caveat', cursive, sans-serif",
                  transform: "rotate(-7deg)",
                  transformOrigin: "bottom right",
                }}
              >
                <EditableMetaText
                  field="scriptQuote"
                  multiline
                  rows={2}
                  as="div"
                  className="text-[#1A38D6] font-bold text-[14px] leading-snug tracking-tight italic whitespace-pre-line"
                  placeholder={"Every Worker\nReturns Home Safe"}
                />
                <div className="h-[2px] w-24 bg-[#1A38D6] ml-auto mt-0.5 rounded-full" />
              </div>
            </div>
          </div>

          {/* Content Items */}
          <div className="flex flex-col flex-1 mt-6">
             <div className="flex flex-col flex-1 mt-1 ">
              {items.map((item, idx) => {
                const numKey = item.number || String(idx + 1).padStart(2, "0");
                const palette = COLOR_MAP[numKey] || COLOR_PALETTES[idx % COLOR_PALETTES.length];
                const IconComp = ICON_MAP[item.iconType || "chart"] || BarChart2;

                return (
                  <div
                    key={item.id || idx}
                    className="flex items-center justify-between py-1 border-b border-slate-100 last:border-b-0 group"
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
                      {/* Number Badge */}
                      <div
                        className={`w-9 h-9 rounded-xl ${palette.bg} ${palette.text} font-black text-xs flex items-center justify-center flex-shrink-0 font-mono `}
                      >
                        <EditableItemText
                          itemId={item.id}
                          field="number"
                          className="font-mono text-center"
                          placeholder={numKey}
                        />
                      </div>

                      {/* Circular Icon */}
                      <div
                        className={`w-9 h-9 rounded-full ${palette.iconBg} ${palette.text} flex items-center justify-center flex-shrink-0`}
                      >
                        <IconComp className="w-4 h-4 stroke-[2]" />
                      </div>

                      {/* Title & Description (Natural 2-line wrap matching reference PDF) */}
                      <div className="flex-1 min-w-0">
                        <EditableItemText
                          itemId={item.id}
                          field="title"
                          as="div"
                          className="text-[12.5px] font-bold text-[#0E1B46] leading-tight block"
                          placeholder="Title"
                        />
                        <EditableItemText
                          itemId={item.id}
                          field="description"
                          multiline
                          rows={2}
                          as="div"
                          className="text-[9.5px] text-[#64748B] leading-tight mt-0.5 block"
                          placeholder="Description"
                        />
                      </div>
                    </div>

                    {/* Page Number (Bold right-aligned, based on auto) */}
                    <div className="px-1 py-0.5 flex-shrink-0 text-right min-w-[36px]">
                      <EditableItemText
                        itemId={item.id}
                        field="pageRange"
                        className="text-[13px] font-bold text-[#0E1B46] text-right block font-mono"
                        placeholder={item.pageRange || "1"}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
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
          <EditableMetaText
            field="footerCompany"
            className="text-[9.5px] font-bold text-slate-800 tracking-wider uppercase leading-tight block"
            placeholder="AYANTRAI PRIVATE LIMITED"
          />
          <EditableMetaText
            field="footerWebsite"
            className="text-[8px] font-medium text-slate-500 leading-tight mt-1 block"
            placeholder="www.ayantrai.com  |  www.sitesafe.ai"
          />
        </div>

        {/* Center: Accent divider bar */}
        <div className="h-[1.5px] w-32 bg-slate-300 mx-4 flex-shrink-0" />

        {/* Right: Safety Quote */}
        <div className="text-right flex-shrink-0">
          <EditableMetaText
            field="footerQuote"
            className="text-[9px] font-semibold italic text-slate-700 block"
            placeholder="“Every Worker Returns Home Safe”"
          />
        </div>
      </footer>

      
    </div>
  );
}

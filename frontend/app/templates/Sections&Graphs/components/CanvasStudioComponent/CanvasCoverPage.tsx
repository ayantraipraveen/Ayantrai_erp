"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Calendar,
  Building2,
  User,
  FileText,
  Edit3,
  Shield,
  Users,
  BarChart3,
  Leaf,
} from "lucide-react";
import {
  CoverPageData,
  DEFAULT_COVER_PAGE_DATA,
} from "@/lib/redux/types/reportModuleTypes";

export interface CanvasCoverPageProps {
  coverPageData?: Partial<CoverPageData>;
  activeIsPreview?: boolean;
  zoom?: number;
  onUpdate?: (data: Partial<CoverPageData>) => void;
}

interface EditingField {
  field: keyof CoverPageData;
  value: string;
}

export function CanvasCoverPage({
  coverPageData,
  activeIsPreview = false,
  onUpdate,
}: CanvasCoverPageProps) {
  const data: CoverPageData = { ...DEFAULT_COVER_PAGE_DATA, ...coverPageData };
  const [editing, setEditing] = useState<EditingField | null>(null);

  const startEdit = (field: keyof CoverPageData) => {
    if (activeIsPreview) return;
    setEditing({ field, value: String(data[field] ?? "") });
  };

  const commitEdit = () => {
    if (!editing) return;
    onUpdate?.({ [editing.field]: editing.value });
    setEditing(null);
  };

  const cancelEdit = () => {
    setEditing(null);
  };

  const val = (field: keyof CoverPageData) =>
    editing?.field === field ? editing.value : data[field];

  const metaRows: Array<{
    icon: React.ElementType;
    label: string;
    field: keyof CoverPageData;
  }> = [
      { icon: Calendar, label: "Reporting Period", field: "reportingPeriod" },
      { icon: Building2, label: "Project / Site", field: "projectSite" },
      { icon: User, label: "Prepared for", field: "preparedFor" },
      { icon: FileText, label: "Prepared by", field: "preparedBy" },
    ];

  const rawTitle = String(val("reportType") || "Monthly\nReport");
  const displayTitle = rawTitle.includes("\n")
    ? rawTitle
    : rawTitle.replace(/^Monthly Report$/i, "Monthly\nReport");

  const isTitleEditing = editing?.field === "reportType";
  const isSubtitleEditing = editing?.field === "subtitle";

  return (
    <div
      className="relative overflow-hidden select-none shadow-2xl bg-white"
      style={{
        width: "595px",
        height: "842px",
        minHeight: "842px",
        maxHeight: "842px",
      }}
    >
      {/* ── 1. RIGHT HERO GRAPHIC (Flush with top & banner at y=652px, 0 ghosting) ── */}
      <div
        className="absolute top-0 left-0 w-[595px] h-[652px] pointer-events-none z-0"
      >
        <Image
          src="/images/cover-hero-fullpage.png"
          alt="Hero visual"
          fill
          priority
          className="object-cover"
        />
      </div>

      {/* ── 2. BOTTOM STAT BANNER (100% Code & Tailwind CSS Layout, No Image) ──
          Exact PDF proportions: height = 105px, from y=652px to y=757px (bottom: 85px)
      */}
      <div
        className="absolute left-0 right-0 z-10 flex items-center px-6 bg-[#0E1E3F]"
        style={{ bottom: "85px", height: "105px" }}
      >
        {/* Metric 1: Higher Compliance */}
        <div className="flex-1 min-w-0 flex flex-col items-center justify-center text-center">
          <Shield className="w-5 h-5 text-white stroke-[1.8] mb-2" />
          <span className="text-[8.5px] font-bold text-white tracking-[0.14em] leading-tight uppercase">
            HIGHER<br />COMPLIANCE
          </span>
        </div>

        {/* Divider 1 */}
        <div className="h-10 w-[1px] bg-white/20 flex-shrink-0" />

        {/* Metric 2: Safer Workforce */}
        <div className="flex-1 min-w-0 flex flex-col items-center justify-center text-center">
          <Users className="w-5 h-5 text-white stroke-[1.8] mb-2" />
          <span className="text-[8.5px] font-bold text-white tracking-[0.14em] leading-tight uppercase">
            SAFER<br />WORKFORCE
          </span>
        </div>

        {/* Divider 2 */}
        <div className="h-10 w-[1px] bg-white/20 flex-shrink-0" />

        {/* Metric 3: Data-Driven Decisions */}
        <div className="flex-1 min-w-0 flex flex-col items-center justify-center text-center">
          <BarChart3 className="w-5 h-5 text-white stroke-[1.8] mb-2" />
          <span className="text-[8.5px] font-bold text-white tracking-[0.14em] leading-tight uppercase">
            DATA-DRIVEN<br />DECISIONS
          </span>
        </div>

        {/* Divider 3 */}
        <div className="h-10 w-[1px] bg-white/20 flex-shrink-0" />

        {/* Metric 4: A Stronger Tomorrow */}
        <div className="flex-1 min-w-0 flex flex-col items-center justify-center text-center">
          <Leaf className="w-5 h-5 text-white stroke-[1.8] mb-2" />
          <span className="text-[8.5px] font-bold text-white tracking-[0.14em] leading-tight uppercase">
            A STRONGER<br />TOMORROW
          </span>
        </div>

        {/* Right Geometric Facet Wedge (matches the slant in the reference) */}
        <div className="absolute right-0 top-0 bottom-0 w-12 overflow-hidden pointer-events-none">
          <svg viewBox="0 0 48 105" preserveAspectRatio="none" className="w-full h-full">
            <polygon points="12,0 48,0 48,105 24,105" fill="#3B5CD7" opacity="0.6" />
            <polygon points="26,0 48,0 48,105 38,105" fill="#6B8AF6" opacity="0.85" />
          </svg>
        </div>
      </div>

      {/* ── 3. BOTTOM FOOTER STRIP (Consistent HTML/CSS with all report pages) ──
          Exact PDF proportions: height = 85px, from y=757px to y=842px (bottom: 0)
      */}
      <footer
        className="absolute left-0 right-0 bottom-0 z-20 bg-white border-t border-slate-200/80 px-9 flex items-center justify-between"
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

      {/* ── 4. TOP-LEFT BRANDING LOGOS (Locked Position) ── */}
      <div className="absolute left-[36px] top-[30px] z-20 flex items-center gap-3">
        {/* Logo 1: AyantrAI */}
        <div className="relative h-11 w-24 flex items-center">
          <Image
            src="/images/ayantrai-brand-logo.png"
            alt="AyantrAI"
            width={96}
            height={44}
            className="object-contain object-left max-h-15 w-auto"
            priority
          />
        </div>

        {/* Divider line */}
        <div className="w-[1.5px] h-15 bg-slate-300 mx-0.5" />

        {/* Logo 2: Sitesafe (using the user's provided shield logo!) */}
        <div className="relative h-12 w-28 flex items-center">
          <Image
            src="/images/sitesafe-shield-logo.png"
            alt="Sitesafe - People Safer. Sites Smarter."
            width={112}
            height={48}
            className="object-contain object-left max-h-15 w-auto"
            priority
          />
        </div>
      </div>

      {/* ── 5. TITLE BLOCK (Locked Position: top 175px, zero layout shift) ── */}
      <div
        className="absolute left-[36px] top-[175px] z-20"
        style={{ width: "245px" }}
      >
        {isTitleEditing ? (
          <textarea
            autoFocus
            rows={2}
            value={editing!.value}
            onChange={(e) => setEditing({ field: "reportType", value: e.target.value })}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                commitEdit();
              }
              if (e.key === "Escape") cancelEdit();
            }}
            className="w-full bg-blue-50/60 border-b-2 border-[#1E2B58] outline-none resize-none p-0 m-0 text-[#1E2B58] font-black text-[42px] leading-[0.95] tracking-tight block"
            placeholder="Monthly&#10;Report"
          />
        ) : (
          <div
            onDoubleClick={() => startEdit("reportType")}
            className={`font-black text-[#1E2B58] text-[42px] leading-[0.95] tracking-tight whitespace-pre-line cursor-text transition-colors ${!activeIsPreview ? "hover:bg-blue-50/50 rounded -mx-1 px-1" : ""
              }`}
            title={activeIsPreview ? undefined : "Double-click to edit title"}
          >
            {displayTitle}
          </div>
        )}
      </div>

      {/* ── 6. SOLID NAVY HORIZONTAL ACCENT LINE (Locked Position: top 276px) ── */}
      <div className="absolute left-[36px] top-[276px] z-20 w-14 h-[3.5px] bg-[#1E2B58] rounded-full pointer-events-none" />

      {/* ── 7. SUBTITLE BLOCK (Locked Position: top 294px, zero layout shift) ── */}
      <div
        className="absolute left-[36px] top-[294px] z-20"
        style={{ width: "245px" }}
      >
        {isSubtitleEditing ? (
          <textarea
            autoFocus
            rows={2}
            value={editing!.value}
            onChange={(e) => setEditing({ field: "subtitle", value: e.target.value })}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                commitEdit();
              }
              if (e.key === "Escape") cancelEdit();
            }}
            className="w-full bg-blue-50/60 border-b border-[#1E2B58] outline-none resize-none p-0 m-0 text-[#334155] font-bold text-[9.5px] tracking-[0.18em] uppercase leading-tight block"
            placeholder="WORKFORCE INSIGHTS&#10;FOR A SAFER TOMORROW"
          />
        ) : (
          <div
            onDoubleClick={() => startEdit("subtitle")}
            className={`text-[9.5px] font-bold tracking-[0.18em] uppercase text-[#334155] leading-tight whitespace-pre-line cursor-text transition-colors ${!activeIsPreview ? "hover:bg-blue-50/50 rounded -mx-1 px-1" : ""
              }`}
            title={activeIsPreview ? undefined : "Double-click to edit subtitle"}
          >
            {val("subtitle") || "WORKFORCE INSIGHTS\nFOR A SAFER TOMORROW"}
          </div>
        )}
      </div>

      {/* ── 8. METADATA ROWS (Locked Position: top 355px, zero layout shift, no truncation) ── */}
      <div
        className="absolute left-[36px] top-[355px] z-20 flex flex-col gap-3.5"
        style={{ width: "320px" }}
      >
        {metaRows.map(({ icon: Icon, label, field }) => {
          const isRowEditing = editing?.field === field;
          return (
            <div key={field} className="h-[38px] flex items-center gap-3 relative group">
              {/* Ice-blue circular pill */}
              <div
                className="w-8 h-8 rounded-full bg-[#E5EDF8] flex items-center justify-center flex-shrink-0 text-[#1E2B58] shadow-sm pointer-events-none"
              >
                <Icon className="w-4 h-4 stroke-[2]" />
              </div>

              {/* Text Area (Fixed height, inline identical typography editor) */}
              <div className="flex-1 min-w-0 h-full flex flex-col justify-center">
                <div className="text-[8.5px] font-medium text-slate-500 leading-none mb-1 pointer-events-none">
                  {label}
                </div>

                {isRowEditing ? (
                  <input
                    autoFocus
                    value={editing!.value}
                    onChange={(e) => setEditing({ field, value: e.target.value })}
                    onBlur={commitEdit}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitEdit();
                      if (e.key === "Escape") cancelEdit();
                    }}
                    className="w-full bg-blue-50/60 border-b border-[#1E2B58] outline-none p-0 m-0 text-[11.5px] font-bold text-[#1E2B58] leading-tight"
                    placeholder={label}
                  />
                ) : (
                  <div
                    onDoubleClick={() => startEdit(field)}
                    className={`text-[11.5px] font-bold text-[#1E2B58] leading-tight whitespace-nowrap cursor-text transition-colors ${!activeIsPreview
                        ? "hover:bg-blue-50/50 rounded -mx-0.5 px-0.5"
                        : ""
                      }`}
                    title={activeIsPreview ? undefined : "Double-click to edit"}
                  >
                    {val(field) || label}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}





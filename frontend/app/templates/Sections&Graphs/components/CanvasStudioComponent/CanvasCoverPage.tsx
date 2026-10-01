"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Calendar,
  Building2,
  User,
  FileText,
  Edit3,
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

  const reportTitle = String(val("reportType") || "Monthly Report");
  const isTitleEditing = editing?.field === "reportType";
  const isSubtitleEditing = editing?.field === "subtitle";

  // Dynamic font sizing for title so it always fits without pushing layout
  const titleFontSizeClass =
    reportTitle.length <= 16
      ? "text-[42px] leading-[1.02]"
      : reportTitle.length <= 28
      ? "text-[28px] leading-[1.06]"
      : "text-[20px] leading-[1.12]";

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
      {/* ── 1. HIGH-RES BACKGROUND GRAPHIC ──
          Features:
          - Worker hero, crane, sky & blue faceted geometry on right
          - PEOPLE | SITES | PROGRESS top-right eyebrow
          - Bottom navy 4-stat banner with icons, dividers & corner wedge
          - Bottom footer strip with AyantrAI details & quote
          - Pure white (#ffffff) on the left side with 0 ghosting
      */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <Image
          src="/images/cover-layout-bg.png"
          alt="Report Cover Background"
          fill
          priority
          className="object-fill"
        />
      </div>

      {/* ── 2. TOP-LEFT BRANDING LOGOS (Locked Position) ── */}
      <div className="absolute left-[36px] top-[28px] z-10 flex items-center gap-3">
        {/* Logo 1: AyantrAI */}
        <div className="relative h-11 w-28 flex items-center">
          <Image
            src="/images/cover-logo-ayantrai.png"
            alt="AyantrAI - Built for a safer tomorrow"
            width={112}
            height={44}
            className="object-contain object-left max-h-11 w-auto"
            priority
          />
        </div>

        {/* Divider line */}
        <div className="w-[1.5px] h-8 bg-slate-300 mx-0.5" />

        {/* Logo 2: Sitesafe */}
        <div className="relative h-11 w-32 flex items-center">
          <Image
            src="/images/cover-logo-sitesafe.png"
            alt="Sitesafe - A product of AyantrAI"
            width={128}
            height={44}
            className="object-contain object-left max-h-11 w-auto"
            priority
          />
        </div>
      </div>

      {/* ── 3. TITLE BLOCK (Locked Box: top 175px, height 110px, zero layout shift) ── */}
      <div
        className="absolute left-[36px] top-[175px] w-[270px] h-[110px] z-10 flex flex-col justify-end"
      >
        {isTitleEditing ? (
          <textarea
            autoFocus
            rows={3}
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
            className="w-full h-full bg-white border-2 border-[#1E2B58] rounded p-2 outline-none resize-none shadow-xl text-[#1E2B58] font-black text-[22px] leading-tight z-30"
            placeholder="Monthly Report"
          />
        ) : (
          <div
            onDoubleClick={() => startEdit("reportType")}
            className={`w-full h-full flex flex-col justify-end ${
              !activeIsPreview
                ? "hover:bg-blue-50/60 rounded px-1 transition-colors cursor-text group"
                : ""
            }`}
            title={activeIsPreview ? undefined : "Double-click to edit title"}
          >
            <div
              className={`font-black text-[#1E2B58] tracking-tight break-words whitespace-pre-line ${titleFontSizeClass}`}
            >
              {reportTitle}
            </div>
          </div>
        )}
      </div>

      {/* ── 4. SOLID NAVY HORIZONTAL ACCENT LINE (Locked Position: top 296px) ── */}
      <div className="absolute left-[36px] top-[296px] z-10 w-12 h-[3.5px] bg-[#1E2B58] rounded-full pointer-events-none" />

      {/* ── 5. SUBTITLE BLOCK (Locked Box: top 312px, height 36px, zero layout shift) ── */}
      <div
        className="absolute left-[36px] top-[312px] w-[270px] h-[36px] z-10 flex items-center"
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
            className="w-full h-full bg-white border-2 border-[#1E2B58] rounded p-1 outline-none resize-none shadow-xl text-[#334155] font-bold text-[10px] tracking-wider uppercase leading-snug z-30"
            placeholder="WORKFORCE INSIGHTS&#10;FOR A SAFER TOMORROW"
          />
        ) : (
          <div
            onDoubleClick={() => startEdit("subtitle")}
            className={`w-full h-full flex items-center ${
              !activeIsPreview
                ? "hover:bg-blue-50/60 rounded px-1 transition-colors cursor-text"
                : ""
            }`}
            title={activeIsPreview ? undefined : "Double-click to edit subtitle"}
          >
            <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-[#334155] leading-snug whitespace-pre-line block">
              {val("subtitle") || "WORKFORCE INSIGHTS\nFOR A SAFER TOMORROW"}
            </span>
          </div>
        )}
      </div>

      {/* ── 6. METADATA ROWS (Locked Container: top 368px, zero layout shift) ── */}
      <div className="absolute left-[36px] top-[368px] w-[270px] z-10 flex flex-col gap-3">
        {metaRows.map(({ icon: Icon, label, field }) => {
          const isRowEditing = editing?.field === field;
          return (
            <div key={field} className="h-[40px] flex items-center gap-3 relative group">
              {/* Ice-blue circular pill */}
              <div
                className="w-8 h-8 rounded-full bg-[#E5EDF8] flex items-center justify-center flex-shrink-0 text-[#1E2B58] shadow-sm pointer-events-none"
              >
                <Icon className="w-4 h-4 stroke-[2]" />
              </div>

              {/* Text Area (Fixed height, absolute inline editor) */}
              <div className="flex-1 min-w-0 h-full flex flex-col justify-center relative">
                <div className="text-[8.5px] font-normal text-slate-500 leading-none mb-1 pointer-events-none">
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
                    className="absolute left-0 right-0 bottom-0 h-[22px] bg-white border-2 border-[#1E2B58] rounded px-1.5 text-[11px] font-bold text-[#1E2B58] outline-none shadow-xl z-30"
                    placeholder={label}
                  />
                ) : (
                  <div
                    onDoubleClick={() => startEdit(field)}
                    className={`text-[11.5px] font-bold text-[#1E2B58] leading-tight truncate ${
                      !activeIsPreview
                        ? "hover:bg-blue-50/80 rounded px-1 -ml-1 transition-colors cursor-text"
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

      {/* Edit Hint Badge */}
      {!activeIsPreview && (
        <div className="absolute top-2.5 right-4 z-20 flex items-center gap-1.5 bg-white/95 backdrop-blur-md text-[#1E2B58] text-[8px] font-bold px-2.5 py-1 rounded-full shadow-sm border border-slate-200/80 pointer-events-none">
          <Edit3 className="w-2.5 h-2.5 text-[#9D61FF]" />
          <span>COVER PAGE — Double-click any field to customize</span>
        </div>
      )}
    </div>
  );
}



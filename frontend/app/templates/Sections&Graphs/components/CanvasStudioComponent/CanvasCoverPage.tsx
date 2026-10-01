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

  const EditableText = ({
    field,
    className,
    multiline = false,
    placeholder,
  }: {
    field: keyof CoverPageData;
    className?: string;
    multiline?: boolean;
    placeholder?: string;
  }) => {
    const isActive = editing?.field === field;
    if (isActive) {
      return multiline ? (
        <textarea
          autoFocus
          rows={2}
          value={editing!.value}
          onChange={(e) => setEditing({ field, value: e.target.value })}
          onBlur={commitEdit}
          onKeyDown={(e) => {
            if (e.key === "Escape") cancelEdit();
          }}
          className={`bg-white border-2 border-[#1E2B58] rounded px-1.5 py-0.5 outline-none resize-none w-full shadow-md text-[#1E2B58] ${className}`}
          placeholder={placeholder}
        />
      ) : (
        <input
          autoFocus
          value={editing!.value}
          onChange={(e) => setEditing({ field, value: e.target.value })}
          onBlur={commitEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitEdit();
            if (e.key === "Escape") cancelEdit();
          }}
          className={`bg-white border-2 border-[#1E2B58] rounded px-1.5 py-0.5 outline-none w-full shadow-md text-[#1E2B58] ${className}`}
          placeholder={placeholder}
        />
      );
    }
    return (
      <span
        className={`${
          !activeIsPreview
            ? "hover:bg-blue-50/80 rounded px-1 transition-colors cursor-text"
            : ""
        } ${className}`}
        onDoubleClick={() => startEdit(field)}
        title={activeIsPreview ? undefined : "Double-click to edit"}
      >
        {val(field) || placeholder}
      </span>
    );
  };

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

  return (
    <div
      className="relative overflow-hidden flex flex-col select-none shadow-2xl bg-white"
      style={{
        width: "595px",
        height: "842px",
        minHeight: "842px",
        maxHeight: "842px",
      }}
    >
      {/* ── HIGH-RES BACKGROUND GRAPHIC ──
          Features:
          - Worker hero, crane, sky & blue faceted geometry
          - PEOPLE | SITES | PROGRESS top-right eyebrow
          - Bottom navy 4-stat banner with icons, dividers & corner wedge
          - Bottom footer strip with AyantrAI details & quote
          - Pure white left panel ready for HTML text & logos
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

      {/* ── TOP-LEFT BRANDING LOGOS ── */}
      <div className="relative z-10 px-8 pt-7 flex items-center">
        <div className="flex items-center gap-3">
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
      </div>

      {/* ── TITLE & SUBTITLE BLOCK ── */}
      <div className="relative z-10 px-8 pt-10" style={{ maxWidth: "330px" }}>
        <div className="block">
          <EditableText
            field="reportType"
            className="text-[40px] font-black leading-[1.04] text-[#1E2B58] tracking-tight block break-words"
            placeholder="Monthly Report"
          />
        </div>

        {/* Solid dark navy horizontal underline */}
        <div className="w-12 h-[3.5px] bg-[#1E2B58] rounded-full mt-3.5 mb-3" />

        {/* Subtitle */}
        <div className="mt-1">
          <EditableText
            field="subtitle"
            multiline
            className="text-[10px] font-bold tracking-[0.16em] uppercase text-[#334155] leading-snug whitespace-pre-line block"
            placeholder="WORKFORCE INSIGHTS&#10;FOR A SAFER TOMORROW"
          />
        </div>
      </div>

      {/* ── METADATA ROWS ── */}
      <div className="relative z-10 px-8 mt-11 flex flex-col gap-3.5" style={{ maxWidth: "320px" }}>
        {metaRows.map(({ icon: Icon, label, field }) => (
          <div key={field} className="flex items-center gap-3 group">
            {/* Ice-blue circular pill */}
            <div
              className="w-8 h-8 rounded-full bg-[#E5EDF8] flex items-center justify-center flex-shrink-0 text-[#1E2B58] shadow-sm"
            >
              <Icon className="w-4 h-4 stroke-[2]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[8.5px] font-normal text-slate-500 leading-tight">
                {label}
              </div>
              <div className="text-[11.5px] font-bold text-[#1E2B58] leading-tight mt-0.5">
                <EditableText
                  field={field}
                  className="text-[11.5px] font-bold text-[#1E2B58]"
                  placeholder={label}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Hint Badge */}
      {!activeIsPreview && (
        <div className="absolute top-2.5 right-4 z-20 flex items-center gap-1.5 bg-white/90 backdrop-blur-md text-[#1E2B58] text-[8px] font-bold px-2.5 py-1 rounded-full shadow-sm border border-slate-200/80 pointer-events-none">
          <Edit3 className="w-2.5 h-2.5 text-[#9D61FF]" />
          <span>COVER PAGE — Double-click any text to edit</span>
        </div>
      )}
    </div>
  );
}


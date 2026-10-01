"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Calendar,
  Building2,
  User,
  Users,
  Shield,
  Activity,
  CheckCircle,
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
    setEditing({ field, value: data[field] });
  };

  const commitEdit = () => {
    if (!editing) return;
    onUpdate?.({ [editing.field]: editing.value });
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
          className={`bg-white/10 border border-white/40 rounded px-1 outline-none resize-none w-full ${className}`}
          placeholder={placeholder}
        />
      ) : (
        <input
          autoFocus
          value={editing!.value}
          onChange={(e) => setEditing({ field, value: e.target.value })}
          onBlur={commitEdit}
          className={`bg-white/10 border border-white/40 rounded px-1 outline-none w-full ${className}`}
          placeholder={placeholder}
        />
      );
    }
    return (
      <span
        className={`${!activeIsPreview ? "hover:bg-white/10 rounded px-0.5 transition-colors cursor-text" : ""} ${className}`}
        onDoubleClick={() => startEdit(field)}
        title={activeIsPreview ? undefined : "Double-click to edit"}
      >
        {val(field) || placeholder}
      </span>
    );
  };

  const statBadges = [
    { icon: Shield, label: "HIGHER\nCOMPLIANCE" },
    { icon: Users, label: "SAFER\nWORKFORCE" },
    { icon: Activity, label: "DATA-DRIVEN\nDECISIONS" },
    { icon: CheckCircle, label: "A STRONGER\nTOMORROW" },
  ];

  const metaRows: Array<{
    icon: React.ElementType;
    label: string;
    field: keyof CoverPageData;
  }> = [
    { icon: Calendar, label: "Reporting Period", field: "reportingPeriod" },
    { icon: Building2, label: "Project / Site", field: "projectSite" },
    { icon: User, label: "Prepared for", field: "preparedFor" },
    { icon: Users, label: "Prepared by", field: "preparedBy" },
  ];

  return (
    <div
      className="relative bg-white overflow-hidden flex flex-col select-none"
      style={{ width: "595px", minHeight: "842px" }}
    >
      {/* ── TOP SPLIT ── */}
      <div className="relative flex" style={{ minHeight: "640px" }}>
        {/* LEFT — dark navy */}
        <div
          className="relative z-10 flex flex-col bg-[#0f2044] text-white flex-shrink-0"
          style={{ width: "52%", padding: "28px 22px 20px" }}
        >
          {/* Logos */}
          <div className="flex items-center gap-3 mb-4">
            <Image src="/logo.png" alt="AyantrAI" width={80} height={28} className="object-contain" />
            <div className="w-px h-7 bg-white/30" />
            <div className="flex flex-col">
              <Image
                src="/sitesafe-header-logo.svg"
                alt="Sitesafe"
                width={64}
                height={24}
                className="object-contain"
              />
              <span className="text-[7px] text-white/40 mt-0.5">A product of AyantrAI</span>
            </div>
          </div>

          {/* Corner nav tags */}
          <div className="absolute top-6 right-3 text-[7px] text-white/30 font-mono tracking-widest text-right">
            PEOPLE&nbsp;|&nbsp;SITES&nbsp;|&nbsp;PROGRESS
          </div>

          {/* Title block */}
          <div className="mt-auto">
            <div className="w-7 h-0.5 bg-white/30 mb-3" />
            <div className="block text-[32px] font-black leading-tight text-white">
              <EditableText field="reportType" className="text-[32px] font-black leading-tight text-white" />
            </div>
            <div className="mt-2">
              <EditableText
                field="subtitle"
                multiline
                className="text-[9px] font-semibold tracking-[0.14em] text-white/50 uppercase"
                placeholder="WORKFORCE INSIGHTS..."
              />
            </div>
          </div>

          {/* Meta rows */}
          <div className="mt-5 pt-4 border-t border-white/10 flex flex-col gap-2.5">
            {metaRows.map(({ icon: Icon, label, field }) => (
              <div key={field} className="flex items-start gap-2">
                <div className="mt-0.5 w-4.5 h-4.5 rounded-full border border-white/20 flex items-center justify-center flex-shrink-0" style={{ width: 18, height: 18 }}>
                  <Icon className="w-2.5 h-2.5 text-white/40" />
                </div>
                <div className="min-w-0">
                  <div className="text-[7px] text-white/35 font-mono uppercase tracking-wider">{label}</div>
                  <EditableText
                    field={field}
                    className="text-[10px] font-semibold text-white"
                    placeholder={label}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — hero image */}
        <div className="relative flex-1 overflow-hidden bg-[#1c2d52]">
          <Image
            src="/logo-stacked.png"
            alt="Safety visual"
            fill
            className="object-cover opacity-30"
          />
          {/* Left diagonal accent */}
          <div
            className="absolute inset-y-0 left-0 bg-[#1836a0]/50"
            style={{ width: 32, clipPath: "polygon(0 0,100% 0,55% 100%,0 100%)" }}
          />
          {/* Safer People watermark */}
          <div className="absolute bottom-10 right-4 text-right leading-tight">
            <div className="text-[10px] font-black text-white/20 uppercase tracking-wide">
              Safer<br />People<br />Stronger<br />Tomorrow
            </div>
          </div>
        </div>
      </div>

      {/* ── STAT BADGES ── */}
      <div className="bg-[#0f2044] border-t-2 border-[#1836a0]" style={{ padding: "10px 22px" }}>
        <div className="grid grid-cols-4 gap-1.5">
          {statBadges.map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <div
                className="rounded-full border border-white/20 flex items-center justify-center"
                style={{ width: 26, height: 26 }}
              >
                <Icon className="w-3 h-3 text-white/50" />
              </div>
              <span className="text-[6.5px] font-bold text-center tracking-wide uppercase text-white/40 whitespace-pre-line leading-tight">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── FOOTER STRIP ── */}
      <div
        className="bg-white border-t border-slate-200 flex items-center justify-between"
        style={{ padding: "7px 22px" }}
      >
        <div>
          <div className="text-[7.5px] font-black text-[#0f2044] uppercase tracking-widest">
            AYANTRAI PRIVATE LIMITED
          </div>
          <div className="text-[6.5px] text-slate-400 mt-0.5">
            www.ayantrai.com&nbsp;&nbsp;|&nbsp;&nbsp;www.sitesafe.ai
          </div>
        </div>
        <div className="flex-1 mx-3 h-px bg-slate-200" />
        <div className="text-[6.5px] font-semibold text-slate-400 italic">
          "Every Worker Returns Home Safe"
        </div>
      </div>

      {/* Edit badge */}
      {!activeIsPreview && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 bg-white/95 backdrop-blur text-[#0f2044] text-[8px] font-bold px-2.5 py-1 rounded-full shadow border border-slate-200 pointer-events-none">
          <Edit3 className="w-2.5 h-2.5" />
          COVER PAGE — double-click any text to edit
        </div>
      )}
    </div>
  );
}

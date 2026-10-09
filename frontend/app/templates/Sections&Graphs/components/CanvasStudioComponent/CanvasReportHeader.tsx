"use client";

import React from "react";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { CanvasInlineEditableText } from "./CanvasInlineEditableText";
import { ReportHeaderValues, HeaderTitleFormat } from "../../utils";

export type HeaderField = "taglinePrimary" | "taglineSecondary" | "title" | "period";

export interface CanvasReportHeaderProps {
  pageNumber: number;
  paperTone?: string;
  headerValues: ReportHeaderValues;
  headerTitleFormat?: HeaderTitleFormat;
  headerTitleTextStyle?: React.CSSProperties;
  editingHeaderValue?: HeaderField | null;
  activeIsPreview?: boolean;
  isMandatory?: boolean;
  onDelete?: () => void;
  onStartEditing?: (field: HeaderField) => void;
  onSave?: (field: HeaderField, plain: string, html: string) => void;
  onCancel?: () => void;
}

export function CanvasReportHeader({
  pageNumber,
  paperTone = "white",
  headerValues,
  headerTitleFormat,
  headerTitleTextStyle,
  editingHeaderValue,
  activeIsPreview = false,
  isMandatory = false,
  onDelete,
  onStartEditing,
  onSave,
  onCancel,
}: CanvasReportHeaderProps) {
  const open = (field: HeaderField) => {
    if (!activeIsPreview && onStartEditing) onStartEditing(field);
  };

  const isDark = paperTone === "dark";

  return (
    <header
      className={`group/report-header relative z-30 h-[56px] w-full px-7  flex items-center justify-between flex-shrink-0 select-none overflow-hidden`}
    >
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
        <div className="h-4 w-px bg-slate-200 dark:bg-zinc-800" />
        <div className="flex flex-col text-[8.5px] italic text-[#1D58BA] font-medium leading-tight">
          {onSave ? (
            <>
              <CanvasInlineEditableText
                value={headerValues.taglinePrimary || "Visibility for Every Worker,"}
                html={headerValues.taglinePrimaryHtml}
                isEditing={editingHeaderValue === "taglinePrimary"}
                defaultFontSize={8.5}
                toolbarPosition="top"
                className="text-[8.5px] italic text-[#1D58BA] font-medium leading-tight cursor-text"
                title="Double-click to edit primary tagline"
                onDoubleClick={() => open("taglinePrimary")}
                onSave={(plain, html) => onSave("taglinePrimary", plain, html)}
                onCancel={onCancel || (() => {})}
              />
              <CanvasInlineEditableText
                value={headerValues.taglineSecondary || "Intelligence for Every Site."}
                html={headerValues.taglineSecondaryHtml}
                isEditing={editingHeaderValue === "taglineSecondary"}
                defaultFontSize={8.5}
                toolbarPosition="bottom"
                className="text-[8.5px] italic text-[#1D58BA] font-medium leading-tight cursor-text"
                title="Double-click to edit secondary tagline"
                onDoubleClick={() => open("taglineSecondary")}
                onSave={(plain, html) => onSave("taglineSecondary", plain, html)}
                onCancel={onCancel || (() => {})}
              />
            </>
          ) : (
            <>
              <span>{headerValues.taglinePrimary || "Visibility for Every Worker,"}</span>
              <span>{headerValues.taglineSecondary || "Intelligence for Every Site."}</span>
            </>
          )}
        </div>
      </div>

      {/* Center/Right: Monthly Report & Date */}
      <div className="flex items-center gap-3 pr-22">
        {/* Page 1 Mandatory vs Next Page Deletable Controls */}
        {!activeIsPreview && (
          <>
            {isMandatory ? (
              <span className="opacity-0 group-hover/report-header:opacity-100 transition-opacity text-[9.5px] font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 px-2 py-0.5 rounded select-none mr-1">
                Mandatory Header
              </span>
            ) : onDelete ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="opacity-0 group-hover/report-header:opacity-100 transition-opacity h-6 px-2 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-zinc-900 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer mr-1"
                title="Delete Report Header on this page completely"
              >
                <Trash2 className="w-3 h-3" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            ) : null}
          </>
        )}
        <div className="flex flex-col items-end">
          {onSave ? (
            <CanvasInlineEditableText
              value={headerValues.title || "Monthly Report"}
              html={headerValues.titleHtml}
              isEditing={editingHeaderValue === "title"}
              defaultFontSize={12}
              toolbarPosition="top"
              toolbarAlign="right"
              className={`text-[12px] font-bold ${
                isDark ? "text-white" : "text-[#0E1C4E]"
              } leading-tight text-right cursor-text`}
              title="Double-click to edit report title"
              onDoubleClick={() => open("title")}
              onSave={(plain, html) => onSave("title", plain, html)}
              onCancel={onCancel || (() => {})}
            />
          ) : (
            <span
              className={`text-[12px] font-bold ${
                isDark ? "text-white" : "text-[#0E1C4E]"
              } leading-tight`}
            >
              {headerValues.title || "Monthly Report"}
            </span>
          )}
          <div className="h-[2px] w-8 bg-[#1A38D6] rounded-full mt-0.5" />
          {onSave ? (
            <CanvasInlineEditableText
              value={headerValues.period || "01 Sept 2025 – 30 Sept 2025"}
              html={headerValues.periodHtml}
              isEditing={editingHeaderValue === "period"}
              defaultFontSize={9}
              toolbarPosition="bottom"
              toolbarAlign="right"
              className="text-[9px] font-medium text-slate-500 dark:text-zinc-400 mt-0.5 text-right cursor-text"
              title="Double-click to edit reporting period"
              onDoubleClick={() => open("period")}
              onSave={(plain, html) => onSave("period", plain, html)}
              onCancel={onCancel || (() => {})}
            />
          ) : (
            <span className="text-[9px] font-medium text-slate-500 dark:text-zinc-400 mt-0.5">
              {headerValues.period || "01 Sept 2025 – 30 Sept 2025"}
            </span>
          )}
        </div>

        {/* Thin vertical divider before Page badge */}
        <div className="h-5 w-px bg-slate-200 dark:bg-zinc-800 ml-1" />
      </div>

      {/* Far Right: Angled Page Badge Tab (Matches PDF polygon slant) */}
      <div
        className="absolute top-0 right-0 h-14 w-18 bg-[#0F1E3D] text-white flex flex-col items-center justify-center pl-3 pr-2.5"
        style={{ clipPath: "polygon(22% 0, 100% 0, 100% 100%, 0% 100%)" }}
      >
        <span className="text-[8px] font-semibold uppercase tracking-wider text-slate-300 leading-none">
          Page
        </span>
        <span className="text-[17px] font-black leading-none text-white font-mono mt-0.5">
          {String(pageNumber).padStart(2, "0")}
        </span>
      </div>
    </header>
  );
}


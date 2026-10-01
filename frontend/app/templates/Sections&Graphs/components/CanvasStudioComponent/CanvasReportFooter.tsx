"use client";

import React from "react";
import { CanvasInlineEditableText } from "./CanvasInlineEditableText";
import { ReportFooterValues, getPaperToneColor } from "../../utils";

export type FooterField = "company" | "websites" | "quote";

export interface CanvasReportFooterProps {
  paperTone?: string;
  footerValues: ReportFooterValues;
  /** Field being edited ON THIS PAGE only (pass null for other pages) */
  editingFooterValue: FooterField | null;
  activeIsPreview: boolean;
  onStartEditing: (field: FooterField) => void;
  onSave: (field: FooterField, plain: string, html: string) => void;
  onCancel: () => void;
}

export function CanvasReportFooter({
  paperTone = "white",
  footerValues,
  editingFooterValue,
  activeIsPreview,
  onStartEditing,
  onSave,
  onCancel,
}: CanvasReportFooterProps) {
  const open = (field: FooterField) => {
    if (!activeIsPreview) onStartEditing(field);
  };

  const leftZ =
    editingFooterValue === "company" || editingFooterValue === "websites"
      ? "relative z-50"
      : "relative z-10";
  const rightZ = editingFooterValue === "quote" ? "relative z-50" : "relative z-10";

  return (
    <footer
      className={`relative z-20 flex-shrink-0 mt-auto flex items-center justify-between border-t ${
        paperTone === "dark"
          ? "border-zinc-800/80 bg-[#0c1017] text-white"
          : "border-slate-200/80 bg-white text-slate-900"
      } px-7 py-2.5`}
      style={{ backgroundColor: getPaperToneColor(paperTone) }}
    >
      {/* Left: Company & Websites */}
      <div className={`min-w-0 flex flex-col justify-center ${leftZ}`}>
        <CanvasInlineEditableText
          value={footerValues.company || "AYANTRAI PRIVATE LIMITED"}
          html={footerValues.companyHtml}
          isEditing={editingFooterValue === "company"}
          defaultFontSize={9.5}
          toolbarPosition="top"
          className="text-[9.5px] font-bold text-slate-800 dark:text-zinc-200 tracking-wider uppercase leading-tight cursor-text"
          title="Double-click to edit company name"
          onDoubleClick={() => open("company")}
          onSave={(plain, html) => onSave("company", plain, html)}
          onCancel={onCancel}
        />
        <CanvasInlineEditableText
          value={footerValues.websites || "www.ayantrai.com  |  www.sitesafe.ai"}
          html={footerValues.websitesHtml}
          isEditing={editingFooterValue === "websites"}
          defaultFontSize={8}
          toolbarPosition="top"
          className="text-[8px] font-medium text-slate-500 dark:text-zinc-400 leading-tight mt-0.5 cursor-text"
          title="Double-click to edit website links"
          onDoubleClick={() => open("websites")}
          onSave={(plain, html) => onSave("websites", plain, html)}
          onCancel={onCancel}
        />
      </div>

      {/* Center: Accent divider bar */}
      <div className="h-[1.5px] w-28 bg-slate-300 dark:bg-zinc-700 mx-4 flex-shrink-0" />

      {/* Right: Safety Quote */}
      <div className={`min-w-0 text-right flex-shrink-0 ${rightZ}`}>
        <CanvasInlineEditableText
          value={footerValues.quote || "“Every Worker Returns Home Safe”"}
          html={footerValues.quoteHtml}
          isEditing={editingFooterValue === "quote"}
          defaultFontSize={9}
          toolbarPosition="top"
          toolbarAlign="right"
          className="text-[9px] font-semibold italic text-slate-700 dark:text-zinc-300 text-right leading-tight cursor-text"
          title="Double-click to edit safety quote"
          onDoubleClick={() => open("quote")}
          onSave={(plain, html) => onSave("quote", plain, html)}
          onCancel={onCancel}
        />
      </div>
    </footer>
  );
}
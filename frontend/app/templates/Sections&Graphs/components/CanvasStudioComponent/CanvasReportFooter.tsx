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
      className="relative z-20 flex-shrink-0 mt-auto grid grid-cols-[1.1fr_1fr_1.1fr] items-center gap-6 border-t border-slate-200/80 dark:border-zinc-800/60 px-0 pt-1 pb-.5"
      style={{ backgroundColor: getPaperToneColor(paperTone) }}
    >
      <div className={`min-w-0 ${leftZ}`}>
        <CanvasInlineEditableText
          value={footerValues.company}
          html={footerValues.companyHtml}
          isEditing={editingFooterValue === "company"}
          defaultFontSize={14}
          toolbarPosition="top"
          className="text-sm font-bold text-[#1836a0]"
          title="Double-click to format company name (Word style)"
          onDoubleClick={() => open("company")}
          onSave={(plain, html) => onSave("company", plain, html)}
          onCancel={onCancel}
        />
        <CanvasInlineEditableText
          value={footerValues.websites}
          html={footerValues.websitesHtml}
          isEditing={editingFooterValue === "websites"}
          defaultFontSize={12}
          toolbarPosition="top"
          className="mt-1 text-xs font-semibold text-[#1836a0]"
          title="Double-click to format website links (Word style)"
          onDoubleClick={() => open("websites")}
          onSave={(plain, html) => onSave("websites", plain, html)}
          onCancel={onCancel}
        />
      </div>

      <div className="h-[2px] w-full bg-[#1836a0]/60" />

      <div className={`min-w-0 ${rightZ}`}>
        <CanvasInlineEditableText
          value={footerValues.quote}
          html={footerValues.quoteHtml}
          isEditing={editingFooterValue === "quote"}
          defaultFontSize={14}
          toolbarPosition="top"
          toolbarAlign="right"
          className="text-right text-sm font-semibold text-[#1836a0]"
          title="Double-click to format safety quote (Word style)"
          onDoubleClick={() => open("quote")}
          onSave={(plain, html) => onSave("quote", plain, html)}
          onCancel={onCancel}
        />
      </div>
    </footer>
  );
}
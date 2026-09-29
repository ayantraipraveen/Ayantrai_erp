"use client";

import React from "react";
import { DynamicTextEditor, renderDynamicText } from "../DynamicTitleEditor";
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
      className="relative z-20 flex-shrink-0 mt-auto grid grid-cols-[1.1fr_1fr_1.1fr] items-center gap-6 border-t border-slate-200/80 dark:border-zinc-800/60 px-0 pt-4 pb-2"
      style={{ backgroundColor: getPaperToneColor(paperTone) }}
    >
      <div className={`min-w-0 ${leftZ}`}>
        {editingFooterValue === "company" ? (
          <DynamicTextEditor
            initialValue={footerValues.company}
            initialHtml={footerValues.companyHtml}
            defaultFontSize={14}
            multiline={false}
            toolbarPosition="top"
            className="text-sm font-bold text-[#1836a0]"
            onSave={(plain, html) => onSave("company", plain, html)}
            onCancel={onCancel}
          />
        ) : (
          <p
            className="cursor-text text-sm font-bold text-[#1836a0]"
            onDoubleClick={() => open("company")}
            title="Double-click to format company name (Word style)"
          >
            {renderDynamicText(footerValues.companyHtml, footerValues.company)}
          </p>
        )}

        {editingFooterValue === "websites" ? (
          <DynamicTextEditor
            initialValue={footerValues.websites}
            initialHtml={footerValues.websitesHtml}
            defaultFontSize={12}
            multiline={false}
            toolbarPosition="top"
            className="mt-1 text-xs font-semibold text-[#1836a0]"
            onSave={(plain, html) => onSave("websites", plain, html)}
            onCancel={onCancel}
          />
        ) : (
          <p
            className="mt-1 cursor-text text-xs font-semibold text-[#1836a0]"
            onDoubleClick={() => open("websites")}
            title="Double-click to format website links (Word style)"
          >
            {renderDynamicText(footerValues.websitesHtml, footerValues.websites)}
          </p>
        )}
      </div>

      <div className="h-[2px] w-full bg-[#1836a0]/60" />

      <div className={`min-w-0 ${rightZ}`}>
        {editingFooterValue === "quote" ? (
          <DynamicTextEditor
            initialValue={footerValues.quote}
            initialHtml={footerValues.quoteHtml}
            defaultFontSize={14}
            multiline={false}
            toolbarPosition="top"
            toolbarAlign="right"
            className="text-right text-sm font-semibold text-[#1836a0]"
            onSave={(plain, html) => onSave("quote", plain, html)}
            onCancel={onCancel}
          />
        ) : (
          <p
            className="cursor-text text-right text-sm font-semibold text-[#1836a0]"
            onDoubleClick={() => open("quote")}
            title="Double-click to format safety quote (Word style)"
          >
            &ldquo;{renderDynamicText(footerValues.quoteHtml, footerValues.quote)}&rdquo;
          </p>
        )}
      </div>
    </footer>
  );
}
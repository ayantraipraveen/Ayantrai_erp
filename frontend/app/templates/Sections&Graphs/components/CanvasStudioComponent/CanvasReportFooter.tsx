"use client";

import React from "react";
import { DynamicTextEditor, renderDynamicText } from "../DynamicTitleEditor";
import { ReportFooterValues } from "../../utils";
import { getPaperToneColor } from "../../utils";

export interface CanvasReportFooterProps {
  paperTone?: string;
  footerValues: ReportFooterValues;
  editingFooterValue: "company" | "websites" | "quote" | null;
  activeIsPreview: boolean;
  onStartEditing: (field: "company" | "websites" | "quote") => void;
  onSave: (field: "company" | "websites" | "quote", plain: string, html: string) => void;
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
  return (
    <footer
      className="relative z-20 flex-shrink-0 mt-auto grid grid-cols-[1.1fr_1fr_1.1fr] items-center gap-6 border-t border-slate-200/80 dark:border-zinc-800/60 px-0 pt-4 pb-2"
      style={{ backgroundColor: getPaperToneColor(paperTone) }}
    >
      <div
        className={`min-w-0 ${
          editingFooterValue === "company" || editingFooterValue === "websites"
            ? "relative z-50"
            : "relative z-10"
        }`}
      >
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
            onDoubleClick={() => !activeIsPreview && onStartEditing("company")}
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
            onDoubleClick={() => !activeIsPreview && onStartEditing("websites")}
            title="Double-click to format website links (Word style)"
          >
            {renderDynamicText(footerValues.websitesHtml, footerValues.websites)}
          </p>
        )}
      </div>

      <div className="flex flex-col items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[#1836a0]" />
          <div className="h-2 w-2 rounded-full bg-[#2454d8]" />
          <div className="h-2 w-2 rounded-full bg-[#41b2ff]" />
        </div>
      </div>

      <div
        className={`flex flex-col items-end text-right ${
          editingFooterValue === "quote" ? "relative z-50" : "relative z-10"
        }`}
      >
        {editingFooterValue === "quote" ? (
          <DynamicTextEditor
            initialValue={footerValues.quote}
            initialHtml={footerValues.quoteHtml}
            defaultFontSize={13}
            multiline={false}
            toolbarPosition="top"
            toolbarAlign="right"
            className="text-xs font-medium text-[#1836a0]"
            onSave={(plain, html) => onSave("quote", plain, html)}
            onCancel={onCancel}
          />
        ) : (
          <p
            className="cursor-text text-xs font-medium text-[#1836a0]"
            onDoubleClick={() => !activeIsPreview && onStartEditing("quote")}
            title="Double-click to format footer tagline (Word style)"
          >
            {renderDynamicText(footerValues.quoteHtml, footerValues.quote)}
          </p>
        )}
        <p className="mt-1 text-[11px] font-medium text-slate-400">
          Generated automatically via Sitesafe EHS Platform
        </p>
      </div>
    </footer>
  );
}

"use client";

import React from "react";
import Image from "next/image";
import { DynamicTextEditor, renderDynamicText } from "../DynamicTitleEditor";
import { ReportHeaderValues, HeaderTitleFormat } from "../../utils";

export type HeaderField = "taglinePrimary" | "taglineSecondary" | "title" | "period";

export interface CanvasReportHeaderProps {
  pageNumber: number;
  paperTone?: string;
  headerValues: ReportHeaderValues;
  headerTitleFormat: HeaderTitleFormat;
  headerTitleTextStyle: React.CSSProperties;
  editingHeaderValue: HeaderField | null;
  activeIsPreview: boolean;
  onStartEditing: (field: HeaderField) => void;
  onSave: (field: HeaderField, plain: string, html: string) => void;
  onCancel: () => void;
}

export function CanvasReportHeader({
  pageNumber,
  paperTone = "white",
  headerValues,
  headerTitleFormat,
  headerTitleTextStyle,
  editingHeaderValue,
  activeIsPreview,
  onStartEditing,
  onSave,
  onCancel,
}: CanvasReportHeaderProps) {
  const open = (field: HeaderField) => {
    if (!activeIsPreview) onStartEditing(field);
  };

  const taglineZ =
    editingHeaderValue === "taglinePrimary" || editingHeaderValue === "taglineSecondary"
      ? "relative z-50"
      : "relative z-10";

  const titleZ =
    editingHeaderValue === "title" || editingHeaderValue === "period"
      ? "relative z-50"
      : "relative z-10";

  return (
    <div
      className="relative z-30 min-h-[110px] border-b border-slate-200/80 overflow-visible"
      style={{ backgroundColor: paperTone === "dark" ? "#0f172a" : undefined }}
    >
      <div className="relative grid min-h-[110px] grid-cols-[minmax(0,105px)_minmax(0,1.5fr)_minmax(0,1.2fr)_65px] items-stretch gap-0 px-0 py-0 overflow-visible">
        <div className="flex min-w-0 flex-col justify-center px-2 py-1">
          <Image
            src="/sitesafe-header-logo.svg"
            alt="Sitesafe by AyantrAI"
            width={1254}
            height={1254}
            className="h-[95px] w-[95px] object-contain object-left"
            priority
          />
        </div>

        <div className={`min-w-0 flex flex-col justify-center ${taglineZ}`}>
          <div className="flex flex-col gap-0.5 border-l-2 border-[#2454d8] pl-2.5 px-3 py-2">
            {editingHeaderValue === "taglinePrimary" ? (
              <DynamicTextEditor
                initialValue={headerValues.taglinePrimary}
                initialHtml={headerValues.taglinePrimaryHtml}
                defaultFontSize={13}
                multiline={false}
                toolbarPosition="top"
                className="text-[13px] font-semibold italic leading-tight text-[#2454d8]"
                onSave={(plain, html) => onSave("taglinePrimary", plain, html)}
                onCancel={onCancel}
              />
            ) : (
              <p
                className="cursor-text text-[13px] font-semibold italic leading-tight text-[#2454d8]"
                onDoubleClick={() => open("taglinePrimary")}
                title="Double-click to format primary report tagline (Word style)"
              >
                {renderDynamicText(headerValues.taglinePrimaryHtml, headerValues.taglinePrimary)}
              </p>
            )}
            {editingHeaderValue === "taglineSecondary" ? (
              <DynamicTextEditor
                initialValue={headerValues.taglineSecondary}
                initialHtml={headerValues.taglineSecondaryHtml}
                defaultFontSize={13}
                multiline={false}
                toolbarPosition="bottom"
                className="text-[13px] font-semibold italic leading-tight text-[#2454d8]"
                onSave={(plain, html) => onSave("taglineSecondary", plain, html)}
                onCancel={onCancel}
              />
            ) : (
              <p
                className="cursor-text text-[13px] font-semibold italic leading-tight text-[#2454d8]"
                onDoubleClick={() => open("taglineSecondary")}
                title="Double-click to format secondary report tagline (Word style)"
              >
                {renderDynamicText(headerValues.taglineSecondaryHtml, headerValues.taglineSecondary)}
              </p>
            )}
          </div>
        </div>

        <div className={`min-w-0 flex flex-col justify-center px-2 py-2 ${titleZ}`}>
          <div className="relative">
            {editingHeaderValue === "title" ? (
              <DynamicTextEditor
                initialValue={headerValues.title}
                initialHtml={headerValues.titleHtml}
                defaultFontSize={headerTitleFormat.fontSize || 22}
                multiline={false}
                toolbarPosition="top"
                toolbarAlign="right"
                className="text-lg sm:text-xl font-black leading-tight"
                onSave={(plain, html) => onSave("title", plain, html)}
                onCancel={onCancel}
              />
            ) : (
              <p
                className="cursor-text pr-5 leading-tight"
                style={headerTitleTextStyle}
                onDoubleClick={() => open("title")}
                title="Double-click to format report title (Word style)"
              >
                {renderDynamicText(headerValues.titleHtml, headerValues.title)}
              </p>
            )}
          </div>
          {editingHeaderValue === "period" ? (
            <DynamicTextEditor
              initialValue={headerValues.period}
              initialHtml={headerValues.periodHtml}
              defaultFontSize={11}
              multiline={false}
              toolbarPosition="bottom"
              toolbarAlign="right"
              className="mt-0.5 text-[11px] font-semibold leading-tight text-[#1836a0]"
              onSave={(plain, html) => onSave("period", plain, html)}
              onCancel={onCancel}
            />
          ) : (
            <p
              className="mt-0.5 cursor-text text-[11px] font-semibold leading-tight text-[#1836a0]"
              onDoubleClick={() => open("period")}
              title="Double-click to format report period (Word style)"
            >
              {renderDynamicText(headerValues.periodHtml, headerValues.period)}
            </p>
          )}
          <div className="mt-1 h-0.5 w-10 rounded-full bg-[#2454d8]" />
        </div>

        {/* Page Badge - flush right, full height */}
        <div className="flex flex-col items-center justify-center border-l-2 border-[#2454d8] bg-[#18344f] text-white [clip-path:polygon(0_0,100%_0,100%_100%,28%_100%,0_76%)]">
          <span className="text-[9px] font-semibold">Page</span>
          <span className="text-[20px] font-black leading-none">{String(pageNumber).padStart(2, "0")}</span>
        </div>
      </div>
    </div>
  );
}

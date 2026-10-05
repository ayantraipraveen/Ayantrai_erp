"use client";

import React from "react";
import { Edit2, Stamp } from "lucide-react";
import { LibrarySection } from "@/lib/redux/slices/reportModuleSlice";
import { UploadedSvgWatermark } from "../../watermark/utils";
import {
  DynamicTitleEditor,
  DynamicTextEditor,
  renderDynamicTitle,
  renderDynamicEyebrow,
  renderDynamicText,
  getFallbackEyebrowHtml,
  getFallbackTitleHtml,
} from "../DynamicTitleEditor";
import { getPaperToneColor } from "../../utils";

export type SectionField = "eyebrow" | "name" | "description";

export interface CanvasSectionHeaderProps {
  section: LibrarySection;
  paperTone?: string;
  isDarkPaper: boolean;
  sectionTextColor?: string;
  editingSectionField: SectionField | null;
  activeIsPreview: boolean;
  activeWatermark?: UploadedSvgWatermark | null;
  isWatermarkSelected: boolean;
  wmScale: number;
  onStartEditing: (field: SectionField) => void;
  onFinishEditing: () => void;
  onUpdateSection: (patch: Partial<LibrarySection>) => void;
  onUpdateSpacing: (spacing: "compact" | "normal" | "spacious") => void;
  onToggleWatermarkSelect: () => void;
}

export function CanvasSectionHeader({
  section,
  paperTone = "white",
  isDarkPaper,
  sectionTextColor,
  editingSectionField,
  activeIsPreview,
  activeWatermark,
  isWatermarkSelected,
  wmScale,
  onStartEditing,
  onFinishEditing,
  onUpdateSection,
  onUpdateSpacing,
  onToggleWatermarkSelect,
}: CanvasSectionHeaderProps) {
  const open = (field: SectionField) => {
    if (!activeIsPreview) onStartEditing(field);
  };

  return (
    <div
      className={`relative ${editingSectionField ? "z-50" : "z-10"} px-0 group/section-header transition-all select-text ${
        section.headerSpacing === "compact"
          ? "pt-2 pb-1.5"
          : section.headerSpacing === "spacious"
          ? "pt-7 pb-6"
          : "pt-4 pb-3.5"
      }`}
      style={{ backgroundColor: getPaperToneColor(paperTone) }}
    >
      {editingSectionField === "eyebrow" ? (
        <div className="w-full mb-3">
          <DynamicTextEditor
            initialValue={section.eyebrow}
            initialHtml={section.eyebrowHtml || getFallbackEyebrowHtml(section.eyebrow, isDarkPaper)}
            isDarkPaper={isDarkPaper}
            defaultFontSize={12.5}
            multiline={false}
            className="text-[12.5px] font-bold uppercase tracking-[0.15em]"
            placeholder="Section eyebrow..."
            onSave={(newVal, newHtml) => {
              onUpdateSection({
                eyebrow: newVal,
                eyebrowHtml: newHtml,
              });
              onFinishEditing();
            }}
            onCancel={onFinishEditing}
          />
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3 mb-1.5">
          <span
            onDoubleClick={(e) => {
              e.stopPropagation();
              open("eyebrow");
            }}
            className="text-[12.5px] font-bold uppercase tracking-[0.15em] font-sans leading-none cursor-pointer transition-colors"
            title="Double-click to format eyebrow (Word style)"
          >
            {renderDynamicEyebrow(section.eyebrowHtml, section.eyebrow, sectionTextColor, isDarkPaper)}
          </span>

          {/* Right Header Controls: Spacing + Watermark + Edit Header Button */}
          {!editingSectionField && !activeIsPreview && (
            <div className="flex items-center gap-2">
              {/* Header Spacing / Height Preset Selector */}
              <div className="opacity-0 group-hover/section-header:opacity-100 transition-opacity flex items-center gap-0.5 bg-slate-100 dark:bg-zinc-800 rounded-lg p-0.5 text-[10px] font-medium text-slate-500">
                <span className="px-1 text-[9px] text-slate-400 font-mono">Pad:</span>
                {(["compact", "normal", "spacious"] as const).map((space) => (
                  <button
                    key={space}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateSpacing(space);
                    }}
                    className={`px-1.5 py-0.5 rounded capitalize transition-colors cursor-pointer ${
                      (section.headerSpacing || "normal") === space
                        ? "bg-white dark:bg-zinc-700 text-[#8B3DFF] font-bold"
                        : "hover:text-slate-900 dark:hover:text-white"
                    }`}
                    title={`Set header vertical padding to ${space}`}
                  >
                    {space}
                  </button>
                ))}
              </div>

              {activeWatermark && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleWatermarkSelect();
                  }}
                  className={`inline-flex items-center gap-1.5 text-[10px] font-mono uppercase px-2 py-0.5 rounded transition-all cursor-pointer ${
                    isWatermarkSelected
                      ? "bg-purple-600 text-white ring-2 ring-purple-400 font-bold"
                      : "bg-purple-500/10 text-[#8B3DFF] border border-purple-500/20 hover:bg-purple-500/20 font-bold"
                  }`}
                  title={isWatermarkSelected ? "Click to deselect watermark" : "Click to select, resize & locate watermark on canvas"}
                >
                  <Stamp className="w-2.5 h-2.5" />
                  <span>{activeWatermark.name}</span>
                  <span className="text-[9px] opacity-80">({Math.round(wmScale * 100)}%)</span>
                </button>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  open("name");
                }}
                className="opacity-0 group-hover/section-header:opacity-100 transition-opacity flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-[#2563eb] px-2 py-0.5 rounded hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer"
                title="Edit Section Header"
              >
                <Edit2 className="w-3 h-3" />
                <span className="hidden sm:inline">Edit Header</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Section Title */}
      {editingSectionField === "name" ? (
        <DynamicTitleEditor
          initialName={section.name}
          initialHtml={section.titleHtml || getFallbackTitleHtml(section.name, isDarkPaper)}
          isDarkPaper={isDarkPaper}
          paperTone={paperTone}
          toolbarPosition="bottom"
          onSave={(newName, newHtml) => {
            onUpdateSection({ name: newName, titleHtml: newHtml });
            onFinishEditing();
          }}
          onCancel={onFinishEditing}
        />
      ) : (
        <h1
          onDoubleClick={(e) => {
            e.stopPropagation();
            open("name");
          }}
          className="text-3xl sm:text-[38px] lg:text-[40px] font-black tracking-[-0.035em] leading-[1.08] cursor-pointer mt-1"
          title="Double-click to format title (Word style)"
        >
          {renderDynamicTitle(section.titleHtml, section.name, sectionTextColor, isDarkPaper)}
        </h1>
      )}

      {/* Section Description */}
      {editingSectionField === "description" ? (
        <DynamicTextEditor
          initialValue={section.description}
          initialHtml={section.descriptionHtml}
          isDarkPaper={isDarkPaper}
          defaultFontSize={14}
          multiline={true}
          toolbarPosition="bottom"
          className="text-[14px] sm:text-[14.5px] leading-relaxed font-normal min-h-[50px]"
          placeholder="Section description..."
          onSave={(newVal, newHtml) => {
            onUpdateSection({ description: newVal, descriptionHtml: newHtml });
            onFinishEditing();
          }}
          onCancel={onFinishEditing}
        />
      ) : section.description || section.descriptionHtml ? (
        <p
          onDoubleClick={(e) => {
            e.stopPropagation();
            open("description");
          }}
          className={`text-[14px] sm:text-[14.5px] mt-2 max-w-4xl leading-relaxed cursor-pointer font-normal ${
            isDarkPaper && !sectionTextColor
              ? "text-zinc-300"
              : !sectionTextColor
              ? "text-[#4b556b]"
              : ""
          }`}
          style={sectionTextColor ? { color: sectionTextColor, opacity: 0.9 } : undefined}
          title="Double-click to format description (Word style)"
        >
          {renderDynamicText(section.descriptionHtml, section.description, sectionTextColor)}
        </p>
      ) : null}
    </div>
  );
}

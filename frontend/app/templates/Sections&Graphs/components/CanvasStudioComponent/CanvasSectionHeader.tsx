"use client";

import { Building2, Calendar, Edit2, Trash2 } from "lucide-react";
import { LibrarySection } from "@/lib/redux/slices/reportModuleSlice";
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
  isMandatory?: boolean;
  onDelete?: () => void;
  onStartEditing: (field: SectionField) => void;
  onFinishEditing: () => void;
  onUpdateSection: (patch: Partial<LibrarySection>) => void;
  onUpdateSpacing: (spacing: "compact" | "normal" | "spacious") => void;
}

export function CanvasSectionHeader({
  section,
  paperTone = "white",
  isDarkPaper,
  sectionTextColor,
  editingSectionField,
  activeIsPreview,
  isMandatory = false,
  onDelete,
  onStartEditing,
  onFinishEditing,
  onUpdateSection,
  onUpdateSpacing,
}: CanvasSectionHeaderProps) {
  const open = (field: SectionField) => {
    if (!activeIsPreview) onStartEditing(field);
  };

  return (
    <div
      className={`relative ${editingSectionField ? "z-50" : "z-10"} px-0 group/section-header transition-all select-text ${
        section.headerSpacing === "compact"
          ? "pt-1 pb-0.5"
          : section.headerSpacing === "spacious"
          ? "pt-4 pb-3"
          : "pt-1.5 pb-1"
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

              {/* Mandatory on Page 1 or Delete on Next Pages */}
              {isMandatory ? (
                <span
                  className="opacity-0 group-hover/section-header:opacity-100 transition-opacity text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 px-2 py-0.5 rounded select-none"
                  title="Section title is mandatory on Page 1"
                >
                  Mandatory Title
                </span>
              ) : onDelete ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="opacity-0 group-hover/section-header:opacity-100 transition-opacity flex items-center gap-1 text-[11px] font-semibold text-rose-500 hover:text-rose-700 px-2 py-0.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/40 cursor-pointer transition-colors"
                  title="Delete Section Title on this page completely"
                >
                  <Trash2 className="w-3 h-3" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              ) : null}

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

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mt-0.5">
        <div className="flex-1 min-w-0">
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
              className="text-2xl sm:text-[27px] font-black tracking-[-0.03em] leading-[1.15] cursor-pointer"
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
              defaultFontSize={13}
              multiline={true}
              toolbarPosition="bottom"
              className="text-[13px] leading-relaxed font-normal min-h-[40px]"
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
              className={`text-[12.5px] mt-1 max-w-3xl leading-relaxed cursor-pointer font-normal ${
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

        {/* Right Side Project / Site Info Card (Matching Dummy_report.pdf Page 3) */}
        {(section.projectSite || section.reportingPeriod) && (
          <div className="hidden sm:flex flex-col gap-1.5 p-2 bg-slate-50/90 dark:bg-zinc-800/80 rounded-xl border border-slate-200/80 dark:border-zinc-700/60 text-xs shrink-0 min-w-[190px] max-w-[210px] shadow-none">
            {(section.projectSite || "ABC Infrastructure Project") && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Building2 className="w-3 h-3" />
                </div>
                <div className="min-w-0">
                  <div className="text-[9px] text-slate-400 font-medium leading-none mb-0.5">Project / Site</div>
                  <div className="font-bold text-[11px] text-slate-800 dark:text-zinc-100 truncate">{section.projectSite || "ABC Infrastructure Project"}</div>
                </div>
              </div>
            )}
            {(section.reportingPeriod || "01 Sept 2025 – 30 Sept 2025") && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Calendar className="w-3 h-3" />
                </div>
                <div className="min-w-0">
                  <div className="text-[9px] text-slate-400 font-medium leading-none mb-0.5">Reporting Period</div>
                  <div className="font-bold text-[11px] text-slate-800 dark:text-zinc-100 truncate">{section.reportingPeriod || "01 Sept 2025 – 30 Sept 2025"}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

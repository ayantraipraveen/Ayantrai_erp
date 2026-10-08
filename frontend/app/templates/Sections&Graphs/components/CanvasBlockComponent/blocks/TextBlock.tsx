import React, { useState, useEffect } from "react";
import { CanvasCell } from "@/lib/redux/slices/reportModuleSlice";
import { CARD_BG_PRESETS } from "../../../utils";
import { withAlpha } from "../common/blockConstants";
import { DynamicTextEditor } from "../../DynamicTitleEditor";

export interface TextBlockProps {
  cell: CanvasCell;
  isPreview?: boolean;
  isForceEditing?: boolean;
  onEditingChange?: (isEditing: boolean) => void;
  onUpdateTextBlock?: (content: string) => void;
  style?: React.CSSProperties;
}

export function TextBlock({
  cell,
  isPreview,
  isForceEditing,
  onEditingChange,
  onUpdateTextBlock,
  style,
}: TextBlockProps) {
  const tb = cell.textBlock;
  if (!tb) return null;

  const [isEditing, setIsEditing] = useState(false);
  const activeEditing = isEditing || isForceEditing;

  useEffect(() => {
    if (isForceEditing) {
      setIsEditing(true);
    }
  }, [isForceEditing]);

  const handleStartEditing = () => {
    if (isPreview || activeEditing) return;
    setIsEditing(true);
    if (onEditingChange) onEditingChange(true);
  };

  const handleFinishEditing = () => {
    setIsEditing(false);
    if (onEditingChange) onEditingChange(false);
  };

  // Compute dynamic card background & border from cell.style or passed style
  const cardBgPreset = cell.style?.cardBg ? (CARD_BG_PRESETS as Array<{ id: string; color: string; border: string }>).find((p) => p.id === cell.style?.cardBg) : undefined;
  const rawBgColor = cardBgPreset?.color || cell.style?.cardBg;
  const dynamicBg = rawBgColor
    ? cell.style?.backgroundOpacity !== undefined
      ? withAlpha(rawBgColor, cell.style.backgroundOpacity)
      : rawBgColor
    : undefined;

  const dynamicBorderColor =
    cell.style?.borderColor === "none" || cell.style?.borderColor === "transparent"
      ? "transparent"
      : cell.style?.borderColor || cardBgPreset?.border;

  const dynamicBorderWidth =
    cell.style?.borderWidth !== undefined
      ? `${cell.style.borderWidth}px`
      : cell.style?.borderStyle === "none" || cell.style?.borderColor === "transparent" || cell.style?.borderColor === "none"
        ? "0px"
        : undefined;

  const dynamicBorderStyle = cell.style?.borderStyle || undefined;

  const dynamicBorderRadius =
    cell.style?.borderRadius !== undefined
      ? typeof cell.style.borderRadius === "number"
        ? `${cell.style.borderRadius}px`
        : cell.style.borderRadius === "none"
          ? "0px"
          : cell.style.borderRadius === "sm"
            ? "6px"
            : cell.style.borderRadius === "md"
              ? "10px"
              : cell.style.borderRadius === "lg"
                ? "16px"
                : cell.style.borderRadius === "xl"
                  ? "20px"
                  : cell.style.borderRadius === "2xl"
                    ? "24px"
                    : cell.style.borderRadius === "full"
                      ? "9999px"
                      : cell.style.borderRadius
      : undefined;

  const dynamicBoxShadow = "none";

  const isContentEmpty =
    !tb.content ||
    tb.content.trim() === "" ||
    tb.content.includes("Empty text block") ||
    tb.content === "<p><br></p>" ||
    tb.content === "<br>";

  const contentToEdit = isContentEmpty ? "" : tb.content;

  return (
    <div
      onDoubleClick={(e) => {
        if (!isPreview && !activeEditing) {
          e.stopPropagation();
          handleStartEditing();
        }
      }}
      className={`w-full h-full flex-1 min-h-0 rounded-2xl border p-4 transition-all duration-150 flex flex-col ${
        !activeEditing ? "cursor-text hover:border-purple-300 dark:hover:border-purple-700/60" : ""
      } ${!dynamicBg ? "bg-slate-50/70 dark:bg-zinc-900/50" : ""} ${
        !dynamicBorderColor ? "border-slate-200 dark:border-zinc-800" : ""
      }`}
      style={{
        backgroundColor: dynamicBg,
        borderColor: dynamicBorderColor,
        borderWidth: dynamicBorderWidth,
        borderStyle: dynamicBorderStyle,
        borderRadius: dynamicBorderRadius,
        boxShadow: dynamicBoxShadow,
        ...style,
      }}
    >
      {!isPreview && activeEditing ? (
        <DynamicTextEditor
          initialValue={contentToEdit}
          initialHtml={contentToEdit}
          defaultFontSize={14}
          multiline={true}
          toolbarPosition="top"
          editorBorderColor={dynamicBorderColor && dynamicBorderColor !== "transparent" ? dynamicBorderColor : undefined}
          editorBgColor={dynamicBg}
          className="text-sm leading-relaxed w-full h-full min-h-[60px] flex-1"
          placeholder="Empty text block — click to type content."
          onSave={(_plain, html) => {
            if (onUpdateTextBlock) {
              onUpdateTextBlock(html);
            }
            handleFinishEditing();
          }}
          onCancel={handleFinishEditing}
        />
      ) : (
        <div
          title={!isPreview ? "Double-click to format text block (Word style)" : undefined}
          onDoubleClick={(e) => {
            if (isPreview) return;
            e.stopPropagation();
            handleStartEditing();
          }}
          className="w-full h-full min-h-[60px] flex-1 select-text leading-relaxed text-sm text-slate-800 dark:text-zinc-200 overflow-y-auto"
          dangerouslySetInnerHTML={{
            __html: isContentEmpty
              ? "<p class='text-sm text-slate-400 italic'>Empty text block — double click to type content.</p>"
              : tb.content,
          }}
        />
      )}
    </div>
  );
}

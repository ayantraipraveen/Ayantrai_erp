import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Type,
  Pencil,
  SlidersHorizontal,
  Info,
  AlertTriangle,
  CheckCircle2,
  Quote,
  Sparkles,
  FileText,
  Maximize2,
} from "lucide-react";
import { CanvasCell, CanvasTextBlock, TextCalloutType } from "@/lib/redux/slices/reportModuleSlice";
import { CARD_BG_PRESETS } from "../../../utils";
import { withAlpha } from "../common/blockConstants";
import { calculateTopBarPosition } from "../common/blockUtils";
import { DynamicTextEditor } from "../../DynamicTitleEditor";
import { TextBlockInspectorPopover } from "../inspectors/TextBlockInspectorPopover";

export interface TextBlockProps {
  cell: CanvasCell;
  isSelected?: boolean;
  isPreview?: boolean;
  isForceEditing?: boolean;
  onEditingChange?: (isEditing: boolean) => void;
  onUpdateTextBlock?: (contentOrBlock: string | CanvasTextBlock) => void;
  style?: React.CSSProperties;
}

export function TextBlock({
  cell,
  isSelected,
  isPreview,
  isForceEditing,
  onEditingChange,
  onUpdateTextBlock,
  style,
}: TextBlockProps) {
  const tb = cell.textBlock;
  if (!tb) return null;

  const containerRef = useRef<HTMLDivElement>(null);

  // Inspector and floating action bar states
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [inspectorTab, setInspectorTab] = useState<"typography" | "layout">("typography");
  const [portalCoords, setPortalCoords] = useState<{ top: number; left: number } | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const activeEditing = isEditing || isForceEditing;

  useEffect(() => {
    if (!isSelected) {
      setIsInspectorOpen(false);
    }
  }, [isSelected]);

  useEffect(() => {
    if (isForceEditing) {
      setIsEditing(true);
    }
  }, [isForceEditing]);

  const updatePortalPos = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setAnchorRect(rect);
    setPortalCoords(calculateTopBarPosition(rect));
  }, []);

  useEffect(() => {
    if (isSelected && !isPreview) {
      updatePortalPos();
      const interval = setInterval(updatePortalPos, 400);
      window.addEventListener("scroll", updatePortalPos, true);
      window.addEventListener("resize", updatePortalPos);
      return () => {
        clearInterval(interval);
        window.removeEventListener("scroll", updatePortalPos, true);
        window.removeEventListener("resize", updatePortalPos);
      };
    }
  }, [isSelected, isPreview, updatePortalPos]);

  const handleStartEditing = () => {
    if (isPreview || activeEditing) return;
    setIsEditing(true);
    if (onEditingChange) onEditingChange(true);
  };

  const handleFinishEditing = () => {
    setIsEditing(false);
    if (onEditingChange) onEditingChange(false);
  };

  const handleUpdate = (patch: Partial<CanvasTextBlock>) => {
    if (!onUpdateTextBlock) return;
    const updated: CanvasTextBlock = {
      ...tb,
      ...patch,
    };
    onUpdateTextBlock(updated);
  };

  // Compute dynamic card background & border from tb or cell.style
  const cardBgPreset = cell.style?.cardBg ? (CARD_BG_PRESETS as Array<{ id: string; color: string; border: string }>).find((p) => p.id === cell.style?.cardBg) : undefined;
  const rawBgColor = tb.backgroundColor || cardBgPreset?.color || cell.style?.cardBg;
  const dynamicBg = rawBgColor
    ? cell.style?.backgroundOpacity !== undefined
      ? withAlpha(rawBgColor, cell.style.backgroundOpacity)
      : rawBgColor
    : undefined;

  const dynamicBorderColor =
    tb.borderColor === "none" || tb.borderColor === "transparent" || cell.style?.borderColor === "none" || cell.style?.borderColor === "transparent"
      ? "transparent"
      : tb.borderColor || cell.style?.borderColor || cardBgPreset?.border;

  const dynamicBorderWidth =
    tb.borderWidth !== undefined
      ? `${tb.borderWidth}px`
      : cell.style?.borderWidth !== undefined
      ? `${cell.style.borderWidth}px`
      : cell.style?.borderStyle === "none" || cell.style?.borderColor === "transparent" || cell.style?.borderColor === "none"
        ? "0px"
        : undefined;

  const dynamicBorderStyle = cell.style?.borderStyle || undefined;

  const dynamicBorderRadius =
    tb.borderRadius !== undefined
      ? `${tb.borderRadius}px`
      : cell.style?.borderRadius !== undefined
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

  const isTransparent = Boolean(tb.isTransparent);
  const calloutType: TextCalloutType = tb.calloutType || "none";
  const customFontSize = tb.customFontSize ?? (tb.fontSize === "xs" ? 11 : tb.fontSize === "sm" ? 13 : tb.fontSize === "lg" ? 16 : tb.fontSize === "xl" ? 20 : tb.fontSize === "2xl" ? 24 : 14);
  const textAlign = tb.textAlign || "left";
  const lineHeight = tb.lineHeight === "tight" ? 1.3 : tb.lineHeight === "relaxed" ? 1.75 : 1.5;
  const textColor = tb.textColor || undefined;
  const paddingVal = tb.padding !== undefined ? `${tb.padding}px` : "16px";

  const isContentEmpty =
    !tb.content ||
    tb.content.trim() === "" ||
    tb.content.includes("Empty text block") ||
    tb.content === "<p><br></p>" ||
    tb.content === "<br>";

  const contentToEdit = isContentEmpty ? "" : tb.content;

  // Callout specific styling decorations
  const getCalloutDecorations = () => {
    switch (calloutType) {
      case "info":
        return {
          stripeClass: "border-l-4 border-l-blue-500",
          bgClass: !dynamicBg ? "bg-blue-50/70 dark:bg-blue-950/25" : "",
          borderClass: !dynamicBorderColor ? "border-blue-200 dark:border-blue-900/60" : "",
          badgeBg: "bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300",
          badgeLabel: "Info Note",
          icon: Info,
        };
      case "warning":
        return {
          stripeClass: "border-l-4 border-l-amber-500",
          bgClass: !dynamicBg ? "bg-amber-50/70 dark:bg-amber-950/25" : "",
          borderClass: !dynamicBorderColor ? "border-amber-200 dark:border-amber-900/60" : "",
          badgeBg: "bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300",
          badgeLabel: "Warning",
          icon: AlertTriangle,
        };
      case "success":
        return {
          stripeClass: "border-l-4 border-l-emerald-500",
          bgClass: !dynamicBg ? "bg-emerald-50/70 dark:bg-emerald-950/25" : "",
          borderClass: !dynamicBorderColor ? "border-emerald-200 dark:border-emerald-900/60" : "",
          badgeBg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300",
          badgeLabel: "Compliance Pass",
          icon: CheckCircle2,
        };
      case "quote":
        return {
          stripeClass: "border-l-4 border-l-purple-500 italic font-serif",
          bgClass: !dynamicBg ? "bg-purple-50/50 dark:bg-purple-950/20" : "",
          borderClass: !dynamicBorderColor ? "border-purple-200 dark:border-purple-900/60" : "",
          badgeBg: "bg-purple-100 text-[#9D61FF] dark:bg-purple-950/80 dark:text-purple-300",
          badgeLabel: "Quote",
          icon: Quote,
        };
      case "neutral":
        return {
          stripeClass: "border-l-4 border-l-slate-400 dark:border-l-zinc-500",
          bgClass: !dynamicBg ? "bg-slate-100/60 dark:bg-zinc-800/40" : "",
          borderClass: !dynamicBorderColor ? "border-slate-200 dark:border-zinc-700" : "",
          badgeBg: "bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300",
          badgeLabel: "Neutral",
          icon: Sparkles,
        };
      default:
        return {
          stripeClass: "",
          bgClass: !dynamicBg ? "bg-slate-50/70 dark:bg-zinc-900/50" : "",
          borderClass: !dynamicBorderColor ? "border-slate-200 dark:border-zinc-800" : "",
          badgeBg: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300",
          badgeLabel: "Note",
          icon: FileText,
        };
    }
  };

  const calloutDec = getCalloutDecorations();
  const CalloutIcon = calloutDec.icon;

  const containerStyle: React.CSSProperties = {
    height: tb.customHeight ? `${tb.customHeight}px` : "100%",
    maxHeight: "100%",
    width: tb.customWidth ? `${tb.customWidth}px` : "100%",
    backgroundColor: isTransparent ? "transparent" : dynamicBg,
    borderColor: isTransparent ? "transparent" : dynamicBorderColor,
    borderWidth: isTransparent ? 0 : dynamicBorderWidth,
    borderStyle: isTransparent ? "none" : dynamicBorderStyle,
    borderRadius: isTransparent ? 0 : dynamicBorderRadius,
    padding: paddingVal,
    boxShadow: "none",
    ...style,
  };

  return (
    <>
      <div
        ref={containerRef}
        onDoubleClick={(e) => {
          if (!isPreview && !activeEditing) {
            e.stopPropagation();
            handleStartEditing();
          }
        }}
        className={`w-full max-h-full flex-1 min-h-0 rounded-2xl border transition-all duration-150 flex flex-col justify-between ${
          !activeEditing ? "cursor-text hover:border-purple-300 dark:hover:border-purple-700/60" : ""
        } ${isTransparent ? "border-0 bg-transparent shadow-none" : `${calloutDec.stripeClass} ${calloutDec.bgClass} ${calloutDec.borderClass}`}`}
        style={containerStyle}
      >
        {/* Callout Header Badge (if not none) */}
        {calloutType !== "none" && !activeEditing && (
          <div className="flex items-center gap-1.5 mb-2 flex-shrink-0 select-none">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${calloutDec.badgeBg}`}>
              <CalloutIcon className="w-2.5 h-2.5" />
              <span>{calloutDec.badgeLabel}</span>
            </span>
          </div>
        )}

        {/* Word-Style Rich Text Editor / Static Render */}
        {!isPreview && activeEditing ? (
          <DynamicTextEditor
            initialValue={contentToEdit}
            initialHtml={contentToEdit}
            defaultFontSize={customFontSize}
            multiline={true}
            toolbarPosition="top"
            editorBorderColor={dynamicBorderColor && dynamicBorderColor !== "transparent" ? dynamicBorderColor : undefined}
            editorBgColor={dynamicBg}
            className="w-full h-full min-h-[60px] flex-1 text-sm leading-relaxed"
            placeholder="Empty text block — click to type content."
            onSave={(_plain, html) => {
              handleUpdate({ content: html });
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
            style={{
              fontSize: `${customFontSize}px`,
              textAlign,
              lineHeight,
              color: textColor,
            }}
            className="w-full h-full min-h-[40px] flex-1 select-text overflow-y-auto leading-relaxed text-slate-800 dark:text-zinc-200"
            dangerouslySetInnerHTML={{
              __html: isContentEmpty
                ? "<p class='text-sm text-slate-400 italic'>Empty text block — double click to type content.</p>"
                : tb.content,
            }}
          />
        )}
      </div>

      {/* ── Floating Top Selection Action Bar (Portal) ── */}
      {isSelected && !isPreview && portalCoords && typeof document !== "undefined" && createPortal(
        <div
          style={{
            position: "fixed",
            top: `${portalCoords.top}px`,
            left: `${portalCoords.left}px`,
            transform: "translateX(-50%)",
            zIndex: 99999,
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className="portal-text-topbar flex items-center gap-1.5 bg-white/98 dark:bg-[#0c1017]/98 border border-slate-200 dark:border-zinc-800 rounded-full px-2.5 py-1 shadow-2xl backdrop-blur-md text-xs select-none pointer-events-auto whitespace-nowrap animate-in fade-in zoom-in-95 duration-100"
        >
          {/* Block Indicator Pill */}
          <span className="text-[10px] font-mono font-bold text-[#9D61FF] px-2 py-0.5 rounded-full bg-[#9D61FF]/10 flex items-center gap-1">
            <Type className="w-2.5 h-2.5" />
            <span>Text & Notes</span>
          </span>

          {/* Quick Edit Text Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleStartEditing();
            }}
            className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 text-[10.5px] font-semibold transition-all cursor-pointer"
            title="Edit text content (Word style)"
          >
            <Pencil className="w-2.5 h-2.5 text-[#9D61FF]" />
            <span>Edit Text</span>
          </button>

          {/* Typography & Style Inspector Toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (isInspectorOpen && inspectorTab === "typography") {
                setIsInspectorOpen(false);
              } else {
                setInspectorTab("typography");
                setIsInspectorOpen(true);
              }
            }}
            className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold transition-all cursor-pointer ${
              isInspectorOpen && inspectorTab === "typography"
                ? "bg-[#9D61FF] text-white shadow-xs"
                : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
            }`}
            title="Configure Typography, Alignment & Callout Type"
          >
            <SlidersHorizontal className="w-2.5 h-2.5" />
            <span>Typography</span>
          </button>

          {/* Sizing & Frame Inspector Toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (isInspectorOpen && inspectorTab === "layout") {
                setIsInspectorOpen(false);
              } else {
                setInspectorTab("layout");
                setIsInspectorOpen(true);
              }
            }}
            className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold transition-all cursor-pointer ${
              isInspectorOpen && inspectorTab === "layout"
                ? "bg-[#9D61FF] text-white shadow-xs"
                : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
            }`}
            title="Adjust Dimensions, Padding & Frame"
          >
            <Maximize2 className="w-2.5 h-2.5" />
            <span>Frame</span>
          </button>
        </div>,
        document.body
      )}

      {/* ── Draggable TextBlock Inspector Popover ── */}
      <TextBlockInspectorPopover
        textBlock={tb}
        activeTab={inspectorTab}
        onTabChange={setInspectorTab}
        isOpen={isInspectorOpen && !isPreview && Boolean(isSelected)}
        anchorRect={anchorRect}
        onClose={() => setIsInspectorOpen(false)}
        onUpdateTextBlock={handleUpdate}
      />
    </>
  );
}

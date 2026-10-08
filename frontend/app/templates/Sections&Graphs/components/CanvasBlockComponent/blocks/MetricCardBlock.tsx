import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Pencil } from "lucide-react";
import { CanvasCell, LibraryMetricCard } from "@/lib/redux/slices/reportModuleSlice";
import { DynamicTextEditor, renderDynamicText } from "../../DynamicTitleEditor";
import { PALETTE_RAMPS } from "../../constants/chartTypes";
import { getMetricIconComponent } from "../../../utils";
import { calculateTopBarPosition } from "../common/blockUtils";
import { MetricCardInspectorPopover } from "../inspectors/MetricCardInspectorPopover";

export interface MetricCardBlockProps {
  cell: CanvasCell;
  isSelected?: boolean;
  isPreview?: boolean;
  onUpdateMetricCard?: (card: LibraryMetricCard) => void;
  onEditingChange?: (isEditing: boolean) => void;
}

export function MetricCardBlock({
  cell,
  isSelected,
  isPreview,
  onUpdateMetricCard,
  onEditingChange,
}: MetricCardBlockProps) {
  const card = cell.metricCard;
  const containerRef = useRef<HTMLDivElement>(null);
  const [portalCoords, setPortalCoords] = useState<{ top: number; left: number } | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  if (!card) return null;
  const ramp = PALETTE_RAMPS.find((r) => r.id === card.tintColor) || PALETTE_RAMPS[0];

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

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<"label" | "value" | "trend" | null>(null);
  const [localLabel, setLocalLabel] = useState(card.label);
  const [localValue, setLocalValue] = useState(card.value);
  const [localTrendVal, setLocalTrendVal] = useState(card.trendValue);

  useEffect(() => {
    setLocalLabel(card.label);
    setLocalValue(card.value);
    setLocalTrendVal(card.trendValue);
  }, [card]);

  const handleSetEditingField = (field: "label" | "value" | "trend" | null) => {
    setEditingField(field);
    onEditingChange?.(Boolean(field));
  };

  const commitCardChange = (patch: Partial<LibraryMetricCard>) => {
    if (!onUpdateMetricCard) return;
    onUpdateMetricCard({
      ...card,
      ...patch,
    });
    handleSetEditingField(null);
  };

  const cycleTrend = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPreview || !onUpdateMetricCard) return;
    const nextDir: "up" | "down" | "no-change" =
      card.trendDirection === "up"
        ? "down"
        : card.trendDirection === "down"
          ? "no-change"
          : "up";
    commitCardChange({ trendDirection: nextDir });
  };

  const renderCardIcon = (iconName?: string) => {
    const IconComp = getMetricIconComponent(iconName);
    const size = card.iconSize || 14;
    return (
      <IconComp
        style={{
          width: `${size}px`,
          height: `${size}px`,
          color: card.customIconColor || undefined,
          strokeWidth: 2,
        }}
      />
    );
  };

  // Dynamic Trend Sentiment Resolution
  const isNegativeMetric =
    card.higherIsBetter === false ||
    card.dataSourceField?.includes("damage") ||
    card.dataSourceField?.includes("overtime") ||
    card.dataSourceField?.includes("incident") ||
    card.dataSourceField?.includes("violation") ||
    card.label?.toLowerCase().includes("damage") ||
    card.label?.toLowerCase().includes("overtime");

  const resolvedTrendColor: "green" | "red" | "neutral" = card.trendColor || (
    card.trendDirection === "no-change"
      ? "neutral"
      : isNegativeMetric
        ? card.trendDirection === "up" ? "red" : "green"
        : card.trendDirection === "up" ? "green" : "red"
  );

  const trendTextColor =
    resolvedTrendColor === "red"
      ? "text-rose-600 dark:text-rose-400"
      : resolvedTrendColor === "neutral"
        ? "text-slate-500 dark:text-zinc-400"
        : "text-emerald-600 dark:text-emerald-400";

  // Dynamic Value & Unit parsing
  const formatDynamicValue = (valStr: string) => {
    const trimmed = (valStr || "").trim();
    if (!trimmed) return { num: "0", unit: card.unit || "" };
    const unitMatch = trimmed.match(/^(.*?)\s*(hrs|hr|%|min|sec|days|devices|workers)$/i);
    if (unitMatch) {
      return { num: unitMatch[1], unit: unitMatch[2] };
    }
    return { num: trimmed, unit: card.unit || "" };
  };

  const valueFontSizeClass =
    cell.style?.fontSize === "xs"
      ? "text-sm sm:text-base"
      : cell.style?.fontSize === "sm"
        ? "text-base sm:text-lg"
        : cell.style?.fontSize === "lg"
          ? "text-[22px] sm:text-[24px]"
          : cell.style?.fontSize === "xl"
            ? "text-[26px] sm:text-[28px]"
            : "text-lg sm:text-xl";

  const labelFontSizeClass =
    cell.style?.fontSize === "xs"
      ? "text-[9px]"
      : cell.style?.fontSize === "sm"
        ? "text-[9.5px]"
        : cell.style?.fontSize === "lg"
          ? "text-[11px]"
          : cell.style?.fontSize === "xl"
            ? "text-[12px]"
            : "text-[9.5px] sm:text-[10px]";

  const customPx = cell.style?.customFontSize ?? cell.style?.fontSizeCustom;

  const defaultValFontSize =
    card.fontSizeValue ||
    customPx ||
    (cell.style?.fontSize === "xs" ? 16 : cell.style?.fontSize === "sm" ? 18 : cell.style?.fontSize === "lg" ? 24 : cell.style?.fontSize === "xl" ? 28 : 20);

  const cardContainerStyle: React.CSSProperties = {
    width: card.customWidth ? `${card.customWidth}px` : "100%",
    height: card.customHeight ? `${card.customHeight}px` : (cell.customHeight ? `${cell.customHeight}px` : "100%"),
    minHeight: card.customHeight ? `${card.customHeight}px` : (cell.customHeight ? `${cell.customHeight}px` : 0),
    maxWidth: "100%",
    backgroundColor: card.customBgColor || undefined,
    borderColor: card.customBorderColor || undefined,
    borderWidth: card.customBorderWidth !== undefined ? `${card.customBorderWidth}px` : undefined,
    borderRadius: card.customBorderRadius !== undefined ? `${card.customBorderRadius}px` : undefined,
    padding: card.customPadding !== undefined ? `${card.customPadding}px` : undefined,
  };

  const iconContainerSize =
    card.iconShape === "none"
      ? (card.iconSize || 14)
      : Math.max(24, (card.iconSize || 14) + 10);

  const iconShapeClass =
    card.iconShape === "rounded"
      ? "rounded-xl"
      : card.iconShape === "none"
        ? "bg-transparent p-0 shadow-none border-0"
        : "rounded-full";

  return (
    <>
      <div
        ref={containerRef}
        style={cardContainerStyle}
        className={`group/metric-card relative w-full h-full min-h-0 rounded-xl border p-2 transition-all duration-200 select-none flex flex-col justify-between overflow-hidden ${
          !card.customBgColor ? `${ramp.bgLight} ${ramp.bgDark}` : ""
        } ${
          !card.customBorderColor ? `${ramp.borderLight} ${ramp.borderDark}` : ""
        } ${editingField ? "z-50" : "z-10"}`}
      >
        {/* Top Right Quick Edit Button */}
        {!isPreview && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditModalOpen(true);
            }}
            className="opacity-0 group/metric-card:opacity-100 p-1 text-slate-400 hover:text-[#9D61FF] transition-opacity cursor-pointer rounded-lg hover:bg-white/60 dark:hover:bg-zinc-800/60 absolute top-1.5 right-1.5 z-20"
            title="Edit Metric Card properties (React Portal)"
          >
            <Pencil className="w-3 h-3" />
          </button>
        )}
        <div>
          {/* Icon Badge */}
          <div
            style={{
              width: `${iconContainerSize}px`,
              height: `${iconContainerSize}px`,
              backgroundColor: card.customIconBg || undefined,
            }}
            className={`${iconShapeClass} flex items-center justify-center shrink-0 mb-0.5 shadow-none ${!card.customIconBg && card.iconShape !== "none" ? (ramp.iconCircleBg || "bg-blue-100 dark:bg-blue-900/50") : ""
              } ${!card.customIconColor ? (ramp.iconColor || "text-blue-600 dark:text-blue-300") : ""
              }`}
          >
            {renderCardIcon(card.icon)}
          </div>

          {/* Label (inline editable on double click) */}
          <div
            style={{
              color: card.customTextColor || undefined,
              fontSize: card.fontSizeLabel ? `${card.fontSizeLabel}px` : undefined,
            }}
            className={`${labelFontSizeClass} font-bold text-slate-800 dark:text-zinc-200 ${editingField === "label" ? "" : "line-clamp-2 sm:line-clamp-1"
              } leading-tight mb-0.5`}
          >
            {!isPreview && editingField === "label" ? (
              <DynamicTextEditor
                initialValue={card.label}
                initialHtml={(card as any).labelHtml}
                defaultFontSize={card.fontSizeLabel || 11.5}
                className="font-bold leading-tight"
                onSave={(plain, html) => {
                  commitCardChange({ label: plain, labelHtml: html } as any);
                }}
                onCancel={() => handleSetEditingField(null)}
              />
            ) : (
              <span
                onDoubleClick={(e) => {
                  if (isPreview) return;
                  e.stopPropagation();
                  handleSetEditingField("label");
                }}
                title={!isPreview ? "Double-click to format label (Word style)" : undefined}
                className={!isPreview ? "hover:underline hover:decoration-dotted cursor-text" : ""}
              >
                {renderDynamicText((card as any).labelHtml, card.label)}
              </span>
            )}
          </div>

          {/* Primary Value (inline editable on double click) */}
          <div
            style={{
              color: card.customValueColor || undefined,
              fontSize: card.fontSizeValue ? `${card.fontSizeValue}px` : (customPx ? `${customPx}px` : undefined),
            }}
            className={`${valueFontSizeClass} font-black tracking-tight leading-none text-slate-900 dark:text-white my-0.5 flex items-baseline gap-1`}
          >
            {!isPreview && editingField === "value" ? (
              <DynamicTextEditor
                initialValue={card.value}
                initialHtml={(card as any).valueHtml}
                defaultFontSize={defaultValFontSize}
                className="font-black"
                onSave={(plain, html) => {
                  commitCardChange({ value: plain, valueHtml: html } as any);
                }}
                onCancel={() => handleSetEditingField(null)}
              />
            ) : (
              <span
                onDoubleClick={(e) => {
                  if (isPreview) return;
                  e.stopPropagation();
                  handleSetEditingField("value");
                }}
                title={!isPreview ? "Double-click to format value (Word style)" : undefined}
                className={!isPreview ? "hover:underline hover:decoration-dotted cursor-text" : ""}
              >
                {(() => {
                  const hasCustomHtml = Boolean((card as any).valueHtml && (card as any).valueHtml.includes("<"));
                  if (hasCustomHtml) {
                    return renderDynamicText((card as any).valueHtml, card.value);
                  }

                  const { num, unit } = formatDynamicValue(card.value);
                  if (unit) {
                    return (
                      <>
                        <span>{num}</span>
                        <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-zinc-300 ml-0.5">{unit}</span>
                      </>
                    );
                  }
                  return renderDynamicText((card as any).valueHtml, card.value);
                })()}
              </span>
            )}
          </div>
        </div>

        {/* Trend Row */}
        <div className="pt-0.5 flex flex-col gap-0">
          <div className="flex items-center gap-1 flex-wrap">
            <button
              type="button"
              onClick={cycleTrend}
              title={!isPreview ? "Click to cycle trend: Up → Down → Neutral" : undefined}
              className={`inline-flex items-center gap-0.5 text-[10px] sm:text-[10.5px] font-bold font-sans transition-transform ${trendTextColor} ${!isPreview ? "hover:scale-105 cursor-pointer" : ""
                }`}
            >
              {card.trendDirection === "up" && <span>▲</span>}
              {card.trendDirection === "down" && <span>▼</span>}
              {card.trendDirection === "no-change" && <span>—</span>}

              {!isPreview && editingField === "trend" ? (
                <div onClick={(e) => e.stopPropagation()} className="min-w-[80px] max-w-full">
                  <DynamicTextEditor
                    initialValue={card.trendValue}
                    initialHtml={(card as any).trendValueHtml}
                    defaultFontSize={11}
                    className="text-[11px] font-bold"
                    onSave={(plain, html) => {
                      commitCardChange({ trendValue: plain, trendValueHtml: html } as any);
                    }}
                    onCancel={() => handleSetEditingField(null)}
                  />
                </div>
              ) : (
                <span
                  onDoubleClick={(e) => {
                    if (isPreview) return;
                    e.stopPropagation();
                    handleSetEditingField("trend");
                  }}
                  title={!isPreview ? "Double-click to format trend text (Word style)" : undefined}
                >
                  {renderDynamicText((card as any).trendValueHtml, card.trendValue)}
                </span>
              )}
            </button>

            {/* Subtitle e.g. "vs. last month" */}
            {card.trendSubtitle && !card.trendSubtitle.includes("(Lower is better)") && (
              <span className="text-[9.5px] sm:text-[10px] text-slate-400 dark:text-zinc-500 font-normal">
                {card.trendSubtitle}
              </span>
            )}
            {!card.trendSubtitle && (
              <span className="text-[9.5px] sm:text-[10px] text-slate-400 dark:text-zinc-500 font-normal">
                vs. last month
              </span>
            )}
          </div>

          {(card.trendSubtitle?.includes("(Lower is better)") || (isNegativeMetric && card.trendDirection === "down")) && (
            <div className="text-[9px] text-slate-400 dark:text-zinc-500 font-medium leading-none">
              (Lower is better)
            </div>
          )}
        </div>
      </div>

      {/* ── React Portal: Top Action Bar for Single KPI Metric Card ── */}
      {isSelected && !isPreview && portalCoords && typeof document !== "undefined" &&
        createPortal(
          <div
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              top: `${portalCoords.top}px`,
              left: `${portalCoords.left}px`,
              transform: "translateX(-50%)",
              zIndex: 99999,
            }}
            className="portal-metric-card-topbar flex items-center gap-1.5 bg-white/98 dark:bg-[#0c1017]/98 border border-slate-200 dark:border-zinc-800 rounded-full px-2.5 py-1 shadow-2xl backdrop-blur-md text-xs select-none pointer-events-auto whitespace-nowrap animate-in fade-in zoom-in-95 duration-100"
          >
            <span className="text-[10px] font-mono font-bold text-[#9D61FF] px-2 py-0.5 rounded-full bg-[#9D61FF]/10">
              KPI Metric
            </span>

            {/* Edit Card Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditModalOpen((prev) => !prev);
              }}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold transition-all cursor-pointer ${
                isEditModalOpen
                  ? "bg-[#9D61FF] text-white shadow-xs"
                  : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
              }`}
              title="Edit Metric Card Properties (React Portal)"
            >
              <Pencil className="w-2.5 h-2.5" />
              <span>Edit Card</span>
            </button>

            <div className="w-px h-3.5 bg-slate-200 dark:border-zinc-800 mx-0.5" />

            {/* Cycle Trend Button */}
            <button
              type="button"
              onClick={cycleTrend}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 text-[11px] font-medium transition-colors cursor-pointer"
              title="Click to cycle trend (Up / Down / Neutral)"
            >
              <span className="text-[#9D61FF] font-bold">
                {card.trendDirection === "up" ? "▲ Up" : card.trendDirection === "down" ? "▼ Down" : "— Flat"}
              </span>
            </button>
          </div>,
          document.body
        )
      }

      {/* React Portal: Anchored Metric Card Inspector (Beside Card) */}
      {isEditModalOpen && (
        <MetricCardInspectorPopover
          card={card}
          isOpen={isEditModalOpen}
          anchorRect={anchorRect}
          onClose={() => setIsEditModalOpen(false)}
          onUpdateCard={(patch) => commitCardChange(patch)}
        />
      )}
    </>
  );
}

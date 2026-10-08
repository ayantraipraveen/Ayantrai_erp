import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Lightbulb,
  Users,
  CheckSquare,
  AlertTriangle,
  Shield,
  HardHat,
  FileText,
  BarChart2,
  MessageSquare,
  Plus,
  Trash2,
  Pencil,
  SlidersHorizontal,
} from "lucide-react";
import {
  CanvasCell,
  LibraryKeyInsightItem,
  KeyInsightBulletItem,
  KeyInsightVariant,
  BulletMarkerStyle,
} from "@/lib/redux/slices/reportModuleSlice";
import { DynamicTextEditor } from "../../DynamicTitleEditor";
import { calculateTopBarPosition } from "../common/blockUtils";
import { BadgeIcon } from "../common/BadgeIcon";
import { KeyInsightInspectorPopover } from "../inspectors/KeyInsightInspectorPopover";

export interface InsightBlockProps {
  cell: CanvasCell;
  isSelected?: boolean;
  isPreview?: boolean;
  isForceEditing?: boolean;
  onEditingChange?: (isEditing: boolean) => void;
  onUpdateInsight?: (textOrInsight: string | LibraryKeyInsightItem) => void;
  style?: React.CSSProperties;
}

export const BADGE_NUM_COLORS: Record<string, string> = {
  green: "bg-[#10b981] text-white",
  blue: "bg-[#3b82f6] text-white",
  purple: "bg-[#8b5cf6] text-white",
  orange: "bg-[#f97316] text-white",
  red: "bg-[#ef4444] text-white",
  amber: "bg-[#f59e0b] text-white",
  emerald: "bg-[#059669] text-white",
  mint: "bg-[#059669] text-white",
  cyan: "bg-[#0ea5e9] text-white",
  sky: "bg-[#0284c7] text-white",
  teal: "bg-[#10b981] text-white",
};

// ── Dynamic Bullet Marker Resolution Helper ──────────────────────────────────
function getBulletGlyph(
  item: KeyInsightBulletItem,
  idx: number,
  style: BulletMarkerStyle,
  insight?: LibraryKeyInsightItem
): { type: "text" | "icon"; value: string } {
  switch (style) {
    case "alpha":
      return { type: "text", value: String.fromCharCode(65 + (idx % 26)) };
    case "roman": {
      const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
      return { type: "text", value: romanNumerals[idx % romanNumerals.length] };
    }
    case "pill":
      return { type: "text", value: String(item.num ?? idx + 1).padStart(2, "0") };
    case "check":
      return { type: "text", value: "✓" };
    case "dot":
      return { type: "text", value: "•" };
    case "icon":
      return { type: "icon", value: item.icon || insight?.icon || "CheckCircle2" };
    case "number":
    default:
      return { type: "text", value: String(item.num ?? idx + 1) };
  }
}

function renderBulletBadge({
  item,
  idx,
  insight,
  defaultSize = 24,
  defaultBgClass = "bg-[#3b82f6] text-white",
}: {
  item: KeyInsightBulletItem;
  idx: number;
  insight: LibraryKeyInsightItem;
  defaultSize?: number;
  defaultBgClass?: string;
}) {
  const bulletStyle: BulletMarkerStyle =
    item.bulletStyle ||
    insight.bulletStyle ||
    (insight.variant === "bullet-observations" ? "dot" : "number");
  const shape = insight.bulletShape || (bulletStyle === "pill" ? "rounded" : "circle");
  const sizePx = insight.bulletSize ?? defaultSize;

  const glyph = getBulletGlyph(item, idx, bulletStyle, insight);

  const customBg = item.customBg || insight.badgeBg;
  const customColor = item.customColor || insight.badgeColor;

  if (shape === "none") {
    const noneStyle: React.CSSProperties = {
      fontSize: `${Math.max(9, Math.round(sizePx * 0.52))}px`,
      color: customColor || undefined,
    };
    if (glyph.type === "icon") {
      return (
        <span
          style={{ width: `${sizePx}px`, height: `${sizePx}px`, color: customColor || undefined }}
          className="flex items-center justify-center shrink-0"
        >
          <BadgeIcon name={glyph.value} className="w-[85%] h-[85%]" />
        </span>
      );
    }
    return (
      <span style={noneStyle} className="font-bold shrink-0 flex items-center justify-center px-1">
        {glyph.value}
      </span>
    );
  }

  const shapeClass =
    shape === "circle"
      ? "rounded-full"
      : shape === "rounded"
      ? "rounded-md"
      : shape === "square"
      ? "rounded-none"
      : "";

  if (bulletStyle === "dot") {
    const dotSize = Math.max(6, Math.round(sizePx * 0.35));
    return (
      <span
        style={{
          width: `${dotSize}px`,
          height: `${dotSize}px`,
          backgroundColor: customBg || customColor || (defaultBgClass ? undefined : "#3b82f6"),
        }}
        className={`rounded-full shrink-0 mt-1.5 ${!customBg && !customColor && defaultBgClass ? defaultBgClass : ""}`}
      />
    );
  }

  const containerStyle: React.CSSProperties = {
    width: bulletStyle === "pill" ? "auto" : `${sizePx}px`,
    height: `${sizePx}px`,
    minWidth: `${sizePx}px`,
    fontSize: `${Math.max(7.5, Math.round(sizePx * 0.46))}px`,
    backgroundColor: customBg || undefined,
    color: customColor || undefined,
  };

  const baseClasses = customBg
    ? `${shapeClass} flex items-center justify-center font-black shrink-0 ${bulletStyle === "pill" ? "px-1.5" : ""}`
    : `${shapeClass} flex items-center justify-center font-black shrink-0 ${defaultBgClass} ${bulletStyle === "pill" ? "px-1.5" : ""}`;

  if (glyph.type === "icon") {
    return (
      <span style={containerStyle} className={baseClasses}>
        <BadgeIcon name={glyph.value} className="w-[60%] h-[60%]" />
      </span>
    );
  }

  return (
    <span style={containerStyle} className={baseClasses}>
      {glyph.value}
    </span>
  );
}

export function InsightBlock({
  cell,
  isSelected,
  isPreview,
  isForceEditing,
  onEditingChange,
  onUpdateInsight,
  style,
}: InsightBlockProps) {
  const insight = cell.insight;
  const containerRef = useRef<HTMLDivElement>(null);

  const [editingTarget, setEditingTarget] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [inspectorTab, setInspectorTab] = useState<"bullets" | "layout">("bullets");
  const [portalCoords, setPortalCoords] = useState<{ top: number; left: number } | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  if (!insight) return null;

  const variant: KeyInsightVariant = insight.variant || "single";
  const items = insight.items || [];

  // Synchronize selection
  useEffect(() => {
    if (isSelected && items.length > 0 && !selectedItemId) {
      setSelectedItemId(items[0].id);
    }
  }, [isSelected, items, selectedItemId]);

  useEffect(() => {
    if (!isSelected) {
      setIsInspectorOpen(false);
    }
  }, [isSelected]);

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

  const startEdit = (target: string) => {
    if (isPreview) return;
    setEditingTarget(target);
    onEditingChange?.(true);
  };

  const finishEdit = () => {
    setEditingTarget(null);
    onEditingChange?.(false);
  };

  const handleUpdate = (patch: Partial<LibraryKeyInsightItem>) => {
    if (!onUpdateInsight) return;
    onUpdateInsight({
      ...insight,
      ...patch,
    });
  };

  const handleUpdateSingleItem = (itemId: string, patch: Partial<KeyInsightBulletItem>) => {
    const updated = (insight.items || []).map((it) => (it.id === itemId ? { ...it, ...patch } : it));
    handleUpdate({ items: updated });
  };

  const handleItemTextUpdate = (itemId: string, newText: string) => {
    handleUpdateSingleItem(itemId, { text: newText });
    finishEdit();
  };

  const handleItemTitleUpdate = (itemId: string, newTitle: string) => {
    handleUpdateSingleItem(itemId, { title: newTitle });
    finishEdit();
  };

  const handleUpdateSubItem = (itemId: string, subIdx: number, newText: string) => {
    const item = (insight.items || []).find((it) => it.id === itemId);
    if (!item) return;
    const currentSubs = [...(item.subItems || [])];
    currentSubs[subIdx] = newText;
    handleUpdateSingleItem(itemId, { subItems: currentSubs });
    finishEdit();
  };

  const handleAddSubItem = (itemId: string, initialText = "New action point") => {
    const item = (insight.items || []).find((it) => it.id === itemId);
    if (!item) return;
    const currentSubs = [...(item.subItems || []), initialText];
    handleUpdateSingleItem(itemId, { subItems: currentSubs });
  };

  const handleDeleteSubItem = (itemId: string, subIdx: number) => {
    const item = (insight.items || []).find((it) => it.id === itemId);
    if (!item) return;
    const currentSubs = (item.subItems || []).filter((_, i) => i !== subIdx);
    handleUpdateSingleItem(itemId, { subItems: currentSubs });
  };

  const handleAddItem = (defaultItem?: Partial<KeyInsightBulletItem>) => {
    const ts = Date.now();
    const count = (insight.items?.length || 0) + 1;
    const newItem: KeyInsightBulletItem = {
      id: `kib-${ts}`,
      num: count,
      color: count === 1 ? "green" : count === 2 ? "blue" : count === 3 ? "purple" : "orange",
      title: defaultItem?.title || `Observation ${count}`,
      text: defaultItem?.text || "New observation recorded during monitoring.",
      subItems: defaultItem?.subItems || [],
      ...defaultItem,
    };
    handleUpdate({ items: [...(insight.items || []), newItem] });
    setSelectedItemId(newItem.id);
  };

  const handleDeleteItem = (itemId: string) => {
    const updated = (insight.items || []).filter((it) => it.id !== itemId);
    handleUpdate({ items: updated });
    if (selectedItemId === itemId) {
      setSelectedItemId(updated[0]?.id || null);
    }
  };

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

  const isTransparent = Boolean(insight.isTransparent);

  const containerStyle: React.CSSProperties = {
    padding: insight.padding !== undefined ? `${insight.padding}px` : undefined,
    borderRadius: insight.borderRadius !== undefined ? `${insight.borderRadius}px` : dynamicBorderRadius,
    borderWidth: insight.borderWidth !== undefined ? `${insight.borderWidth}px` : undefined,
    borderColor: insight.borderColor || undefined,
    backgroundColor: isTransparent ? "transparent" : (insight.backgroundColor || undefined),
    width: insight.customWidth ? `${insight.customWidth}px` : "100%",
    height: insight.customHeight ? `${insight.customHeight}px` : "100%",
    minHeight: insight.minHeight || (insight.customHeight ? `${insight.customHeight}px` : undefined),
    boxShadow: "none",
    ...style,
  };

  // ── Render Variant-Specific Content ──────────────────────────────────────────
  const renderContent = () => {
    // 1. 4-Column Numbered Key Insights Grid
    if (variant === "columns-numbered") {
      const colCount = insight.columns || 4;
      const gapPx = insight.gap !== undefined ? `${insight.gap}px` : "14px";

      return (
        <div className="w-full h-full flex flex-col justify-between space-y-3.5">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div>
                {editingTarget === "title" && !isPreview ? (
                  <DynamicTextEditor
                    initialValue={insight.title || "Key Insights"}
                    defaultFontSize={14}
                    className="text-sm font-black text-[#1e3a8a] dark:text-blue-400"
                    onSave={(plain) => {
                      handleUpdate({ title: plain });
                      finishEdit();
                    }}
                    onCancel={finishEdit}
                  />
                ) : (
                  <div
                    onDoubleClick={() => startEdit("title")}
                    title={!isPreview ? "Double-click to edit title" : undefined}
                    className="cursor-text"
                  >
                    <h3 className="text-sm sm:text-base font-black text-[#1e3a8a] dark:text-blue-400 tracking-tight leading-none">
                      {insight.title || "Key Insights"}
                    </h3>
                    <div className="w-10 h-0.5 bg-blue-600 rounded-full mt-1" />
                  </div>
                )}
              </div>
            </div>

            {!isPreview && (
              <button
                type="button"
                onClick={() => handleAddItem({})}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 px-2 py-0.5 rounded-lg border border-blue-200 dark:border-blue-900/50 flex items-center gap-1 cursor-pointer transition-colors"
                title="Add another insight column"
              >
                <Plus className="w-3 h-3" />
                <span>Add Column</span>
              </button>
            )}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))`,
              gap: gapPx,
            }}
            className="w-full flex-1 min-h-0 md:divide-x divide-slate-100 dark:divide-zinc-800/80"
          >
            {(insight.items || []).map((item, idx) => {
              const defaultColor =
                BADGE_NUM_COLORS[item.color || ""] ||
                (idx % 4 === 0 ? "bg-[#10b981] text-white" : idx % 4 === 1 ? "bg-[#3b82f6] text-white" : idx % 4 === 2 ? "bg-[#8b5cf6] text-white" : "bg-[#f97316] text-white");
              const isItemEditing = editingTarget === `item-${item.id}`;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  className={`relative group/item flex items-start gap-2.5 cursor-pointer ${idx > 0 ? "md:pl-3.5" : ""}`}
                >
                  {renderBulletBadge({
                    item,
                    idx,
                    insight,
                    defaultSize: 24,
                    defaultBgClass: defaultColor,
                  })}

                  <div className="flex-1 min-w-0">
                    {isItemEditing && !isPreview ? (
                      <DynamicTextEditor
                        initialValue={item.text}
                        initialHtml={item.text}
                        defaultFontSize={12}
                        multiline={true}
                        toolbarPosition="top"
                        className="text-xs leading-relaxed"
                        onSave={(_plain, html) => handleItemTextUpdate(item.id, html)}
                        onCancel={finishEdit}
                      />
                    ) : (
                      <div
                        onDoubleClick={() => startEdit(`item-${item.id}`)}
                        title={!isPreview ? "Double-click to format text (Word style)" : undefined}
                        className={`text-xs text-slate-700 dark:text-zinc-300 leading-relaxed select-text ${!isPreview ? "hover:bg-blue-500/5 rounded p-0.5 cursor-text transition-colors" : ""}`}
                        dangerouslySetInnerHTML={{ __html: item.text }}
                      />
                    )}
                  </div>

                  {!isPreview && (insight.items?.length || 0) > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(item.id);
                      }}
                      className="opacity-0 group-hover/item:opacity-100 text-slate-400 hover:text-rose-500 p-0.5 transition-opacity cursor-pointer absolute -top-1.5 -right-1"
                      title="Remove this bullet"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // 2. 4-Column Titled Key Insights
    if (variant === "columns-titled") {
      const colCount = insight.columns || 4;
      const gapPx = insight.gap !== undefined ? `${insight.gap}px` : "14px";

      return (
        <div className="w-full h-full flex flex-col justify-between space-y-3.5">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div>
                {!isPreview && editingTarget === "title" ? (
                  <DynamicTextEditor
                    initialValue={insight.title || "Key Insights"}
                    defaultFontSize={14}
                    className="text-sm sm:text-base font-black text-[#1e3a8a] dark:text-blue-400"
                    onSave={(plain) => {
                      handleUpdate({ title: plain });
                      finishEdit();
                    }}
                    onCancel={finishEdit}
                  />
                ) : (
                  <div
                    onDoubleClick={() => startEdit("title")}
                    title={!isPreview ? "Double-click to edit heading" : undefined}
                    className="cursor-text"
                  >
                    <h3 className={`text-sm sm:text-base font-black text-[#1e3a8a] dark:text-blue-400 tracking-tight leading-none ${!isPreview ? "hover:underline hover:decoration-dotted" : ""}`}>
                      {insight.title || "Key Insights"}
                    </h3>
                    <div className="w-10 h-0.5 bg-blue-600 rounded-full mt-1" />
                  </div>
                )}
              </div>
            </div>
            {!isPreview && (
              <button
                type="button"
                onClick={() => handleAddItem({ title: "New Focus Area" })}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 px-2 py-0.5 rounded-lg border border-blue-200 dark:border-blue-900/50 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-3 h-3" /> Add Column
              </button>
            )}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))`,
              gap: gapPx,
            }}
            className="w-full flex-1 min-h-0 md:divide-x divide-slate-100 dark:divide-zinc-800/80"
          >
            {(insight.items || []).map((item, idx) => {
              const defaultColor =
                BADGE_NUM_COLORS[item.color || ""] ||
                (idx % 4 === 0 ? "bg-[#10b981] text-white" : idx % 4 === 1 ? "bg-[#3b82f6] text-white" : idx % 4 === 2 ? "bg-[#f97316] text-white" : "bg-[#ef4444] text-white");
              const isEditingTitle = editingTarget === `title-${item.id}`;
              const isEditingText = editingTarget === `text-${item.id}`;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  className={`relative group/item flex items-start gap-2.5 cursor-pointer ${idx > 0 ? "md:pl-3.5" : ""}`}
                >
                  {renderBulletBadge({
                    item,
                    idx,
                    insight,
                    defaultSize: 24,
                    defaultBgClass: defaultColor,
                  })}

                  <div className="flex-1 min-w-0 space-y-1">
                    {isEditingTitle && !isPreview ? (
                      <DynamicTextEditor
                        initialValue={item.title || ""}
                        defaultFontSize={12}
                        className="text-xs font-black text-[#1e3a8a] dark:text-blue-400"
                        onSave={(plain) => handleItemTitleUpdate(item.id, plain)}
                        onCancel={finishEdit}
                      />
                    ) : (
                      <h4
                        onDoubleClick={() => startEdit(`title-${item.id}`)}
                        title={!isPreview ? "Double-click to edit title" : undefined}
                        className={`text-xs font-black text-[#1e3a8a] dark:text-blue-400 leading-snug cursor-text ${!isPreview ? "hover:underline hover:decoration-dotted" : ""}`}
                      >
                        {item.title}
                      </h4>
                    )}

                    {isEditingText && !isPreview ? (
                      <DynamicTextEditor
                        initialValue={item.text}
                        initialHtml={item.text}
                        defaultFontSize={11}
                        multiline={true}
                        toolbarPosition="top"
                        className="text-xs leading-relaxed"
                        onSave={(_plain, html) => handleItemTextUpdate(item.id, html)}
                        onCancel={finishEdit}
                      />
                    ) : (
                      <div
                        onDoubleClick={() => startEdit(`text-${item.id}`)}
                        title={!isPreview ? "Double-click to format text (Word style)" : undefined}
                        className={`text-xs text-slate-600 dark:text-zinc-300 leading-relaxed select-text ${!isPreview ? "hover:bg-blue-500/5 rounded p-0.5 cursor-text transition-colors" : ""}`}
                        dangerouslySetInnerHTML={{ __html: item.text }}
                      />
                    )}
                  </div>

                  {!isPreview && (insight.items?.length || 0) > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(item.id);
                      }}
                      className="opacity-0 group-hover/item:opacity-100 text-slate-400 hover:text-rose-500 p-0.5 transition-opacity cursor-pointer absolute -top-1.5 -right-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // 3. Key Takeaways Numbered Badge List
    if (variant === "vertical-takeaways") {
      const takeawayFontSizeClass =
        cell.style?.fontSize === "xs"
          ? "text-[8px] leading-[1.2]"
          : cell.style?.fontSize === "sm"
            ? "text-[8.5px] leading-[1.2]"
            : cell.style?.fontSize === "lg"
              ? "text-[10px] leading-snug"
              : cell.style?.fontSize === "xl"
                ? "text-[11px] leading-relaxed"
                : "text-[8.5px] sm:text-[9px] leading-[1.25]";

      const spacingGap = insight.gap !== undefined ? `${insight.gap}px` : "2px";

      return (
        <div className="w-full h-auto min-h-fit space-y-0.5">
          <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-200/80 dark:border-zinc-800">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-[#2563eb] text-white flex items-center justify-center font-bold shrink-0">
                <FileText className="w-2.5 h-2.5" />
              </div>
              <div>
                {!isPreview && editingTarget === "title" ? (
                  <DynamicTextEditor
                    initialValue={insight.title || "Key Takeaways"}
                    defaultFontSize={11}
                    className="text-[11px] sm:text-xs font-black text-[#0f172a] dark:text-blue-400"
                    onSave={(plain) => {
                      handleUpdate({ title: plain });
                      finishEdit();
                    }}
                    onCancel={finishEdit}
                  />
                ) : (
                  <h3
                    onDoubleClick={() => startEdit("title")}
                    title={!isPreview ? "Double-click to edit heading" : undefined}
                    className={`text-[11px] sm:text-xs font-black text-[#0f172a] dark:text-blue-400 tracking-tight leading-none cursor-text select-text ${!isPreview ? "hover:underline hover:decoration-dotted" : ""}`}
                  >
                    {insight.title || "Key Takeaways"}
                  </h3>
                )}
              </div>
            </div>
            {!isPreview && (
              <button
                type="button"
                onClick={() => handleAddItem({ title: "New Metric" })}
                className="text-[9px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-900/50 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-2.5 h-2.5" /> Add Takeaway
              </button>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: spacingGap }}>
            {(insight.items || []).map((item, idx) => {
              const defaultColors = [
                "bg-[#3b82f6] text-white",
                "bg-[#10b981] text-white",
                "bg-[#8b5cf6] text-white",
                "bg-[#ef4444] text-white",
                "bg-[#059669] text-white",
                "bg-[#f59e0b] text-white",
                "bg-[#0ea5e9] text-white",
                "bg-[#10b981] text-white",
              ];
              const defaultColor =
                BADGE_NUM_COLORS[item.color || ""] ||
                defaultColors[idx % defaultColors.length];
              const isEditing = editingTarget === `item-${item.id}`;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  className={`relative group/row flex items-start gap-1.5 ${takeawayFontSizeClass} text-slate-700 dark:text-zinc-300 py-[1px] cursor-pointer`}
                >
                  {renderBulletBadge({
                    item,
                    idx,
                    insight,
                    defaultSize: 15,
                    defaultBgClass: defaultColor,
                  })}

                  <div className="flex-1 min-w-0">
                    {isEditing && !isPreview ? (
                      <DynamicTextEditor
                        initialValue={item.text}
                        initialHtml={item.text}
                        defaultFontSize={9}
                        multiline={true}
                        toolbarPosition="top"
                        className="text-[9px] leading-tight"
                        onSave={(_plain, html) => handleItemTextUpdate(item.id, html)}
                        onCancel={finishEdit}
                      />
                    ) : (
                      <div
                        onDoubleClick={() => startEdit(`item-${item.id}`)}
                        title={!isPreview ? "Double-click to format takeaway (Word style)" : undefined}
                        className={`select-text ${!isPreview ? "hover:bg-blue-500/5 rounded px-0.5 py-0 cursor-text transition-colors" : ""}`}
                      >
                        {item.title && <b className="text-slate-900 dark:text-white mr-1 font-bold">{item.title}:</b>}
                        <span dangerouslySetInnerHTML={{ __html: item.text }} />
                      </div>
                    )}
                  </div>

                  {!isPreview && (insight.items?.length || 0) > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(item.id);
                      }}
                      className="opacity-0 group-hover/row:opacity-100 text-slate-400 hover:text-rose-500 p-0.5 transition-opacity cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // 4. Narrative Key Insights Multi-Paragraph
    if (variant === "narrative-summary") {
      return (
        <div className="w-full h-full flex flex-col justify-between space-y-3.5">
          <div className="flex items-center gap-2.5 pb-1.5 border-b border-slate-100 dark:border-zinc-800">
            <div className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              {!isPreview && editingTarget === "title" ? (
                <DynamicTextEditor
                  initialValue={insight.title || "Key Insights"}
                  defaultFontSize={14}
                  className="text-sm sm:text-base font-black text-[#1e3a8a] dark:text-blue-400"
                  onSave={(plain) => {
                    handleUpdate({ title: plain });
                    finishEdit();
                  }}
                  onCancel={finishEdit}
                />
              ) : (
                <div
                  onDoubleClick={() => startEdit("title")}
                  title={!isPreview ? "Double-click to edit heading" : undefined}
                  className="cursor-text"
                >
                  <h3 className={`text-sm sm:text-base font-black text-[#1e3a8a] dark:text-blue-400 tracking-tight leading-none ${!isPreview ? "hover:underline hover:decoration-dotted" : ""}`}>
                    {insight.title || "Key Insights"}
                  </h3>
                  <div className="w-10 h-0.5 bg-blue-600 rounded-full mt-1" />
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {!isPreview && editingTarget === "narrative" ? (
              <DynamicTextEditor
                initialValue={insight.text}
                initialHtml={insight.text}
                defaultFontSize={12}
                multiline={true}
                toolbarPosition="top"
                className="text-xs leading-relaxed space-y-2"
                onSave={(_plain, html) => {
                  handleUpdate({ text: html });
                  finishEdit();
                }}
                onCancel={finishEdit}
              />
            ) : (
              <div
                onDoubleClick={() => startEdit("narrative")}
                title={!isPreview ? "Double-click to edit narrative commentary (Word style)" : undefined}
                className={`text-xs text-slate-700 dark:text-zinc-300 leading-relaxed select-text space-y-2.5 ${!isPreview ? "hover:bg-blue-500/5 rounded p-1 cursor-text transition-colors" : ""}`}
                dangerouslySetInnerHTML={{ __html: insight.text }}
              />
            )}
          </div>
        </div>
      );
    }

    // 5. Split Remarks & Quote Block
    if (variant === "split-quote") {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-center w-full h-full">
          <div className="lg:col-span-7 space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <MessageSquare className="w-3.5 h-3.5" />
              </div>
              {!isPreview && editingTarget === "title" ? (
                <DynamicTextEditor
                  initialValue={insight.title || "3. Operational Remarks"}
                  defaultFontSize={13}
                  className="text-sm font-black text-[#1e3a8a] dark:text-blue-400"
                  onSave={(plain) => {
                    handleUpdate({ title: plain });
                    finishEdit();
                  }}
                  onCancel={finishEdit}
                />
              ) : (
                <h3
                  onDoubleClick={() => startEdit("title")}
                  title={!isPreview ? "Double-click to edit heading" : undefined}
                  className={`text-sm font-black text-[#1e3a8a] dark:text-blue-400 cursor-text select-text ${!isPreview ? "hover:underline hover:decoration-dotted" : ""}`}
                >
                  {insight.title || "3. Operational Remarks"}
                </h3>
              )}
            </div>

            {!isPreview && editingTarget === "text" ? (
              <DynamicTextEditor
                initialValue={insight.text}
                initialHtml={insight.text}
                defaultFontSize={12}
                multiline={true}
                toolbarPosition="top"
                className="text-xs leading-relaxed"
                onSave={(_plain, html) => {
                  handleUpdate({ text: html });
                  finishEdit();
                }}
                onCancel={finishEdit}
              />
            ) : (
              <div
                onDoubleClick={() => startEdit("text")}
                title={!isPreview ? "Double-click to edit remarks" : undefined}
                className={`text-xs text-slate-700 dark:text-zinc-300 leading-relaxed select-text ${!isPreview ? "hover:bg-blue-500/5 rounded p-1 cursor-text transition-colors" : ""}`}
                dangerouslySetInnerHTML={{ __html: insight.text }}
              />
            )}
          </div>

          <div className="lg:col-span-3 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-zinc-800 pt-4 lg:pt-0 lg:pl-6 space-y-2">
            <span className="text-3xl font-serif font-black text-blue-500 dark:text-blue-400 leading-none block">“</span>
            {!isPreview && editingTarget === "quote" ? (
              <DynamicTextEditor
                initialValue={insight.quote?.text || ""}
                defaultFontSize={12}
                multiline={true}
                toolbarPosition="top"
                className="font-serif italic text-xs leading-relaxed"
                onSave={(plain) => {
                  handleUpdate({ quote: { ...insight.quote, text: plain } });
                  finishEdit();
                }}
                onCancel={finishEdit}
              />
            ) : (
              <p
                onDoubleClick={() => startEdit("quote")}
                title={!isPreview ? "Double-click to edit quote" : undefined}
                className={`font-serif italic text-xs text-blue-950 dark:text-blue-200 font-semibold leading-relaxed cursor-text ${!isPreview ? "hover:bg-blue-500/5 rounded p-1" : ""}`}
              >
                {insight.quote?.text || "A safer site is not an accident. It is the result of consistent action, responsible teams and data-driven decisions."}
              </p>
            )}
            <div className="w-8 h-0.5 bg-blue-600 rounded-full" />
          </div>
        </div>
      );
    }

    // 6. Executive Quote Card
    if (variant === "quote-card") {
      return (
        <div className="w-full h-full flex flex-col justify-between relative">
          <span className="text-3xl font-serif font-black text-blue-400/80 leading-none">“</span>
          <div className="py-2 px-4 text-center">
            {!isPreview && editingTarget === "quote" ? (
              <DynamicTextEditor
                initialValue={insight.text}
                defaultFontSize={14}
                multiline={true}
                toolbarPosition="top"
                className="font-serif italic text-sm sm:text-base font-semibold text-center text-blue-950 dark:text-blue-200"
                onSave={(plain) => {
                  handleUpdate({ text: plain });
                  finishEdit();
                }}
                onCancel={finishEdit}
              />
            ) : (
              <blockquote
                onDoubleClick={() => startEdit("quote")}
                title={!isPreview ? "Double-click to edit quote" : undefined}
                className={`font-serif italic text-sm sm:text-base font-bold text-blue-950 dark:text-blue-200 leading-relaxed cursor-text ${!isPreview ? "hover:bg-blue-500/5 rounded p-2" : ""}`}
              >
                {insight.text || "Consistent attendance builds safer sites and stronger teams."}
              </blockquote>
            )}
            <div className="w-10 h-0.5 bg-blue-600 rounded-full mx-auto mt-3" />
          </div>
          <span className="text-3xl font-serif font-black text-blue-400/80 leading-none self-end rotate-180">“</span>
        </div>
      );
    }

    // 7. Campaign Vision Banner
    if (variant === "vision-banner") {
      return (
        <div className="w-full h-full flex flex-col md:flex-row items-center justify-between gap-4 relative">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-blue-900 text-white flex items-center justify-center shrink-0">
              <HardHat className="w-6 h-6" />
            </div>
            <div className="w-px h-10 bg-blue-600/40 hidden sm:block shrink-0" />
            <div>
              {!isPreview && editingTarget === "banner-headline" ? (
                <DynamicTextEditor
                  initialValue={insight.banner?.headline || insight.title || "Turning Insights into a Safer Tomorrow"}
                  defaultFontSize={16}
                  className="text-base sm:text-lg font-black text-[#1e3a8a] dark:text-blue-300 leading-tight"
                  onSave={(plain) => {
                    handleUpdate({
                      banner: { ...(insight.banner || { subtitle: "", tagline: "" }), headline: plain },
                      title: plain,
                    });
                    finishEdit();
                  }}
                  onCancel={finishEdit}
                />
              ) : (
                <h3
                  onDoubleClick={() => startEdit("banner-headline")}
                  title={!isPreview ? "Double-click to edit headline" : undefined}
                  className={`text-base sm:text-lg font-black text-[#1e3a8a] dark:text-blue-300 leading-tight cursor-text select-text ${!isPreview ? "hover:underline hover:decoration-dotted" : ""}`}
                >
                  {insight.banner?.headline || insight.title || "Turning Insights into a Safer Tomorrow"}
                </h3>
              )}

              {!isPreview && editingTarget === "banner-subtitle" ? (
                <DynamicTextEditor
                  initialValue={insight.banner?.subtitle || insight.text || "Continuous monitoring. Clearer actions. Safer workplaces."}
                  defaultFontSize={12}
                  className="text-xs text-sky-700 dark:text-sky-400 font-semibold mt-0.5"
                  onSave={(plain) => {
                    handleUpdate({
                      banner: { ...(insight.banner || { headline: "", tagline: "" }), subtitle: plain },
                      text: plain,
                    });
                    finishEdit();
                  }}
                  onCancel={finishEdit}
                />
              ) : (
                <p
                  onDoubleClick={() => startEdit("banner-subtitle")}
                  title={!isPreview ? "Double-click to edit subtitle" : undefined}
                  className={`text-xs text-sky-700 dark:text-sky-400 font-semibold mt-0.5 cursor-text select-text ${!isPreview ? "hover:underline hover:decoration-dotted" : ""}`}
                >
                  {insight.banner?.subtitle || insight.text || "Continuous monitoring. Clearer actions. Safer workplaces."}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 dark:bg-zinc-800/80 border border-blue-200/60 dark:border-zinc-700 text-xs font-bold text-blue-900 dark:text-blue-200">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>People Safer</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 dark:bg-zinc-800/80 border border-blue-200/60 dark:border-zinc-700 text-xs font-bold text-blue-900 dark:text-blue-200">
              <BarChart2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Sites Smarter</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 dark:bg-zinc-800/80 border border-blue-200/60 dark:border-zinc-700 text-xs font-bold text-blue-900 dark:text-blue-200">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>Operations Stronger</span>
            </div>
          </div>

          <div className="text-right shrink-0">
            {!isPreview && editingTarget === "banner-tagline" ? (
              <DynamicTextEditor
                initialValue={insight.banner?.tagline || "Every Worker Returns Home Safe"}
                defaultFontSize={13}
                className="font-serif italic font-black text-sm text-blue-950 dark:text-blue-200"
                onSave={(plain) => {
                  handleUpdate({
                    banner: { ...(insight.banner || { headline: "", subtitle: "" }), tagline: plain },
                  });
                  finishEdit();
                }}
                onCancel={finishEdit}
              />
            ) : (
              <div
                onDoubleClick={() => startEdit("banner-tagline")}
                title={!isPreview ? "Double-click to edit tagline" : undefined}
                className={`font-serif italic font-black text-sm text-blue-950 dark:text-blue-200 cursor-text select-text ${!isPreview ? "hover:underline hover:decoration-dotted" : ""}`}
              >
                {insight.banner?.tagline || "Every Worker Returns Home Safe"}
              </div>
            )}
            <div className="w-12 h-0.5 bg-blue-600 rounded-full ml-auto mt-1" />
          </div>
        </div>
      );
    }

    // 8. Key Factors / Risk Bullets
    if (variant === "risk-factors") {
      return (
        <div className="w-full h-full flex flex-col justify-between space-y-2.5">
          <div className="flex items-center justify-between pb-1 border-b border-rose-100 dark:border-rose-900/40">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              {!isPreview && editingTarget === "title" ? (
                <DynamicTextEditor
                  initialValue={insight.title || "Key Factors"}
                  defaultFontSize={12}
                  className="text-xs font-bold text-rose-800 dark:text-rose-300"
                  onSave={(plain) => {
                    handleUpdate({ title: plain });
                    finishEdit();
                  }}
                  onCancel={finishEdit}
                />
              ) : (
                <h4
                  onDoubleClick={() => startEdit("title")}
                  title={!isPreview ? "Double-click to edit heading" : undefined}
                  className={`text-xs font-bold text-rose-800 dark:text-rose-300 cursor-text select-text ${!isPreview ? "hover:underline hover:decoration-dotted" : ""}`}
                >
                  {insight.title || "Key Factors"}
                </h4>
              )}
            </div>
            {!isPreview && (
              <button
                type="button"
                onClick={() => handleAddItem({ color: "red", text: "New critical risk observation" })}
                className="text-[10px] font-bold text-rose-600 hover:text-rose-700 bg-rose-100/60 dark:bg-rose-900/40 px-2 py-0.5 rounded border border-rose-300/50 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            )}
          </div>
          <div className="space-y-1.5 text-xs text-slate-700 dark:text-zinc-300">
            {(insight.items || []).map((item, idx) => (
              <div
                key={item.id}
                onClick={() => setSelectedItemId(item.id)}
                className="relative group/risk flex items-start gap-2 cursor-pointer"
              >
                {renderBulletBadge({
                  item,
                  idx,
                  insight,
                  defaultSize: 14,
                  defaultBgClass: "bg-rose-500 text-white",
                })}
                <div
                  onDoubleClick={() => startEdit(`item-${item.id}`)}
                  className={`flex-1 select-text ${!isPreview ? "hover:bg-rose-500/10 rounded px-1 cursor-text" : ""}`}
                >
                  {editingTarget === `item-${item.id}` && !isPreview ? (
                    <DynamicTextEditor
                      initialValue={item.text}
                      defaultFontSize={12}
                      className="text-xs"
                      onSave={(plain) => handleItemTextUpdate(item.id, plain)}
                      onCancel={finishEdit}
                    />
                  ) : (
                    <span>{item.text}</span>
                  )}
                </div>
                {!isPreview && (insight.items?.length || 0) > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteItem(item.id);
                    }}
                    className="opacity-0 group/risk:opacity-100 text-slate-400 hover:text-rose-500 p-0.5 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 9. Key Observations Dot Bullets
    if (variant === "bullet-observations") {
      return (
        <div className="w-full h-full flex flex-col justify-between space-y-2.5">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-blue-600" />
              {!isPreview && editingTarget === "title" ? (
                <DynamicTextEditor
                  initialValue={insight.title || "Key Observations"}
                  defaultFontSize={12}
                  className="text-xs font-bold text-blue-900 dark:text-blue-300"
                  onSave={(plain) => {
                    handleUpdate({ title: plain });
                    finishEdit();
                  }}
                  onCancel={finishEdit}
                />
              ) : (
                <h4
                  onDoubleClick={() => startEdit("title")}
                  title={!isPreview ? "Double-click to edit heading" : undefined}
                  className={`text-xs font-bold text-blue-900 dark:text-blue-300 cursor-text select-text ${!isPreview ? "hover:underline hover:decoration-dotted" : ""}`}
                >
                  {insight.title || "Key Observations"}
                </h4>
              )}
            </div>
            {!isPreview && (
              <button
                type="button"
                onClick={() => handleAddItem({ color: "blue", text: "New operational observation" })}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            )}
          </div>
          <div className="space-y-1.5 text-xs text-slate-700 dark:text-zinc-300">
            {(insight.items || []).map((item, idx) => (
              <div
                key={item.id}
                onClick={() => setSelectedItemId(item.id)}
                className="relative group/obs flex items-start gap-2 cursor-pointer"
              >
                {renderBulletBadge({
                  item,
                  idx,
                  insight,
                  defaultSize: 14,
                  defaultBgClass: "bg-blue-500 text-white",
                })}
                <div
                  onDoubleClick={() => startEdit(`item-${item.id}`)}
                  className={`flex-1 select-text ${!isPreview ? "hover:bg-blue-500/10 rounded px-1 cursor-text" : ""}`}
                >
                  {editingTarget === `item-${item.id}` && !isPreview ? (
                    <DynamicTextEditor
                      initialValue={item.text}
                      defaultFontSize={12}
                      className="text-xs"
                      onSave={(plain) => handleItemTextUpdate(item.id, plain)}
                      onCancel={finishEdit}
                    />
                  ) : (
                    <span>{item.text}</span>
                  )}
                </div>
                {!isPreview && (insight.items?.length || 0) > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteItem(item.id);
                    }}
                    className="opacity-0 group-hover/obs:opacity-100 text-slate-400 hover:text-rose-500 p-0.5 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 10. Priority Actions Steps
    if (variant === "priority-actions") {
      const colCount = insight.columns || Math.min(Math.max(items.length, 1), 6);
      const gapPx = insight.gap !== undefined ? `${insight.gap}px` : "12px";

      return (
        <div className="w-full h-full flex flex-col justify-between space-y-3.5">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
                <CheckSquare className="w-4 h-4" />
              </div>
              <div>
                {!isPreview && editingTarget === "title" ? (
                  <DynamicTextEditor
                    initialValue={insight.title || "2. Priority Actions for Next Month"}
                    defaultFontSize={14}
                    className="text-sm font-black text-[#1e3a8a] dark:text-blue-400"
                    onSave={(plain) => {
                      handleUpdate({ title: plain });
                      finishEdit();
                    }}
                    onCancel={finishEdit}
                  />
                ) : (
                  <h3
                    onDoubleClick={() => startEdit("title")}
                    title={!isPreview ? "Double-click to edit block heading" : undefined}
                    className={`text-sm font-black text-[#1e3a8a] dark:text-blue-400 tracking-tight leading-none cursor-text select-text ${
                      !isPreview ? "hover:underline hover:decoration-dotted" : ""
                    }`}
                  >
                    {insight.title || "2. Priority Actions for Next Month"}
                  </h3>
                )}

                {!isPreview && editingTarget === "subtitle" ? (
                  <DynamicTextEditor
                    initialValue={insight.text || "Key actions to address identified improvement areas."}
                    defaultFontSize={10}
                    className="text-[10px] text-slate-400"
                    onSave={(plain) => {
                      handleUpdate({ text: plain });
                      finishEdit();
                    }}
                    onCancel={finishEdit}
                  />
                ) : (
                  <p
                    onDoubleClick={() => startEdit("subtitle")}
                    title={!isPreview ? "Double-click to edit subtitle" : undefined}
                    className={`text-[10px] text-slate-400 mt-0.5 cursor-text select-text ${
                      !isPreview ? "hover:underline hover:decoration-dotted" : ""
                    }`}
                  >
                    {insight.text || "Key actions to address identified improvement areas."}
                  </p>
                )}
              </div>
            </div>

            {!isPreview && items.length < 6 && (
              <button
                type="button"
                onClick={() =>
                  handleAddItem({
                    title: `Action Item ${items.length + 1}`,
                    subItems: ["Action point 1", "Action point 2"],
                  })
                }
                className="text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 px-2 py-0.5 rounded-lg border border-blue-200 dark:border-blue-900/50 flex items-center gap-1 cursor-pointer transition-colors"
                title="Add action column"
              >
                <Plus className="w-3 h-3" /> Add Action
              </button>
            )}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))`,
              gap: gapPx,
            }}
            className="w-full flex-1 min-h-0"
          >
            {(insight.items || []).map((item, idx) => {
              const defaultColor =
                BADGE_NUM_COLORS[item.color || ""] ||
                (idx === 0
                  ? "bg-blue-600 text-white"
                  : idx === 1
                  ? "bg-emerald-600 text-white"
                  : idx === 2
                  ? "bg-amber-600 text-white"
                  : idx === 3
                  ? "bg-purple-600 text-white"
                  : idx === 4
                  ? "bg-rose-600 text-white"
                  : "bg-indigo-600 text-white");

              const isEditingTitle = editingTarget === `title-${item.id}`;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  className="rounded-xl border border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/40 p-3 flex flex-col justify-between space-y-2 cursor-pointer group/col relative"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      {renderBulletBadge({
                        item,
                        idx,
                        insight,
                        defaultSize: 22,
                        defaultBgClass: defaultColor,
                      })}

                      {!isPreview && (insight.items?.length || 0) > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteItem(item.id);
                          }}
                          className="opacity-0 group-hover/col:opacity-100 text-slate-400 hover:text-rose-500 p-0.5 cursor-pointer transition-opacity"
                          title="Delete action column"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {isEditingTitle && !isPreview ? (
                      <DynamicTextEditor
                        initialValue={item.title || ""}
                        defaultFontSize={12}
                        className="text-xs font-bold text-slate-900 dark:text-white"
                        onSave={(plain) => handleItemTitleUpdate(item.id, plain)}
                        onCancel={finishEdit}
                      />
                    ) : (
                      <h5
                        onDoubleClick={(e) => {
                          if (isPreview) return;
                          e.stopPropagation();
                          startEdit(`title-${item.id}`);
                        }}
                        title={!isPreview ? "Double-click to edit title" : undefined}
                        className={`text-xs font-bold text-slate-900 dark:text-white leading-tight cursor-text select-text ${
                          !isPreview ? "hover:bg-blue-500/10 rounded px-1" : ""
                        }`}
                      >
                        {item.title}
                      </h5>
                    )}

                    {item.subItems && item.subItems.length > 0 && (
                      <ul className="space-y-1 text-[11px] text-slate-600 dark:text-zinc-400 leading-snug">
                        {item.subItems.map((sub, sIdx) => {
                          const isEditingSub = editingTarget === `sub-${item.id}-${sIdx}`;
                          return (
                            <li key={sIdx} className="flex items-start gap-1.5 group/sub relative">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                              {isEditingSub && !isPreview ? (
                                <DynamicTextEditor
                                  initialValue={sub}
                                  defaultFontSize={11}
                                  className="text-[11px] flex-1"
                                  onSave={(plain) => handleUpdateSubItem(item.id, sIdx, plain)}
                                  onCancel={finishEdit}
                                />
                              ) : (
                                <div
                                  onDoubleClick={(e) => {
                                    if (isPreview) return;
                                    e.stopPropagation();
                                    startEdit(`sub-${item.id}-${sIdx}`);
                                  }}
                                  title={!isPreview ? "Double-click to edit action point" : undefined}
                                  className={`flex-1 select-text ${
                                    !isPreview ? "hover:bg-blue-500/10 rounded px-0.5 cursor-text" : ""
                                  }`}
                                >
                                  <span>{sub}</span>
                                </div>
                              )}
                              {!isPreview && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSubItem(item.id, sIdx);
                                  }}
                                  className="opacity-0 group-hover/sub:opacity-100 text-slate-400 hover:text-rose-500 p-0.5 cursor-pointer shrink-0 transition-opacity"
                                  title="Delete action point"
                                >
                                  <Trash2 className="w-2.5 h-2.5" />
                                </button>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>

                  {!isPreview && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddSubItem(item.id);
                      }}
                      className="text-[10px] text-blue-500 hover:text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-1 opacity-60 hover:opacity-100 transition-opacity self-start cursor-pointer"
                    >
                      <Plus className="w-2.5 h-2.5" />
                      <span>Add point</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // 11. Default / Single Callout Bullet
    const singleItem: KeyInsightBulletItem = (insight.items && insight.items[0]) || {
      id: "single-1",
      num: 1,
      text: insight.text,
      title: insight.title,
    };
    const singleBadgeColor =
      BADGE_NUM_COLORS[singleItem.color || ""] ||
      "bg-gradient-to-br from-[#9D61FF] to-blue-600 text-white";

    return (
      <div className="w-full h-full flex items-start gap-3.5">
        {renderBulletBadge({
          item: singleItem,
          idx: 0,
          insight,
          defaultSize: 28,
          defaultBgClass: singleBadgeColor,
        })}

        <div className="flex-1 min-w-0">
          {insight.title && (
            <div className="mb-1">
              {!isPreview && editingTarget === "single-title" ? (
                <DynamicTextEditor
                  initialValue={insight.title}
                  defaultFontSize={13}
                  className="font-bold text-sm text-slate-900 dark:text-zinc-100"
                  onSave={(plain) => {
                    handleUpdate({ title: plain });
                    finishEdit();
                  }}
                  onCancel={finishEdit}
                />
              ) : (
                <h4
                  onDoubleClick={(e) => {
                    if (isPreview) return;
                    e.stopPropagation();
                    startEdit("single-title");
                  }}
                  title={!isPreview ? "Double-click to edit title" : undefined}
                  className={`text-sm font-bold text-slate-800 dark:text-zinc-100 select-text ${
                    !isPreview ? "hover:bg-purple-500/10 rounded px-1 cursor-text" : ""
                  }`}
                >
                  {insight.title}
                </h4>
              )}
            </div>
          )}

          {!isPreview && (editingTarget === "single" || isForceEditing) ? (
            <DynamicTextEditor
              initialValue={insight.text}
              initialHtml={insight.text}
              defaultFontSize={12}
              multiline={true}
              toolbarPosition="top"
              className="text-xs leading-relaxed"
              placeholder="Key operational observation..."
              onSave={(_plain, html) => {
                handleUpdate({ text: html });
                if (insight.items && insight.items.length > 0) {
                  handleUpdateSingleItem(insight.items[0].id, { text: html });
                }
                finishEdit();
              }}
              onCancel={finishEdit}
            />
          ) : (
            <div
              onDoubleClick={(e) => {
                if (isPreview) return;
                e.stopPropagation();
                startEdit("single");
              }}
              title={!isPreview ? "Double-click to format observation (Word style)" : undefined}
              className={`text-xs text-slate-700 dark:text-zinc-300 leading-relaxed select-text ${
                !isPreview ? "hover:bg-purple-500/5 rounded p-0.5 cursor-text transition-colors" : ""
              }`}
              dangerouslySetInnerHTML={{ __html: insight.text }}
            />
          )}
        </div>
      </div>
    );
  };

  const defaultContainerClass =
    variant === "vertical-takeaways"
      ? "rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-[#f8fafc]/90 dark:bg-[#0c1017] px-3.5 py-1.5"
      : variant === "quote-card"
      ? "rounded-2xl border border-blue-200/60 dark:border-blue-900/40 bg-gradient-to-br from-blue-50/60 via-white to-sky-50/40 dark:from-blue-950/30 dark:via-zinc-950 dark:to-zinc-900 p-6"
      : variant === "vision-banner"
      ? "rounded-2xl border border-blue-200/80 dark:border-blue-900/50 bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50/50 dark:from-blue-950/40 dark:via-zinc-950 dark:to-zinc-900 p-4 sm:p-5"
      : variant === "risk-factors"
      ? "rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 p-4"
      : "rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] p-4 sm:p-5";

  return (
    <>
      <div
        ref={containerRef}
        style={containerStyle}
        className={`w-full h-full flex-1 min-h-0 overflow-hidden transition-all group/insight-block relative ${
          isTransparent ? "bg-transparent border-0 shadow-none p-1" : defaultContainerClass
        }`}
      >
        {renderContent()}
      </div>

      {/* ── React Portal: Floating Top Action Bar for Insight Block ── */}
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
            className="portal-insight-topbar flex items-center gap-1.5 bg-white/98 dark:bg-[#0c1017]/98 border border-slate-200 dark:border-zinc-800 rounded-full px-2.5 py-1 shadow-2xl backdrop-blur-md text-xs select-none pointer-events-auto whitespace-nowrap animate-in fade-in zoom-in-95 duration-100"
          >
            <span className="text-[10px] font-mono font-bold text-[#9D61FF] px-2 py-0.5 rounded-full bg-[#9D61FF]/10 flex items-center gap-1">
              <Lightbulb className="w-2.5 h-2.5" />
              <span>Insights • {items.length || 1} Bullets</span>
            </span>

            {/* Bullets & Markers Inspector Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (isInspectorOpen && inspectorTab === "bullets") {
                  setIsInspectorOpen(false);
                } else {
                  setInspectorTab("bullets");
                  setIsInspectorOpen(true);
                }
              }}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold transition-all cursor-pointer ${
                isInspectorOpen && inspectorTab === "bullets"
                  ? "bg-[#9D61FF] text-white shadow-xs"
                  : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Pencil className="w-2.5 h-2.5" />
              <span>Bullets & Markers</span>
            </button>

            {/* Layout & Frame Inspector Button */}
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
            >
              <SlidersHorizontal className="w-2.5 h-2.5" />
              <span>Layout & Frame</span>
            </button>

            {/* Quick Add Bullet Item Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleAddItem();
              }}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10.5px] font-bold transition-all cursor-pointer shadow-2xs"
              title="Add bullet item"
            >
              <Plus className="w-2.5 h-2.5" />
              <span>Add</span>
            </button>
          </div>,
          document.body
        )}

      {/* ── Floating Inspector Popover Portal ── */}
      {isInspectorOpen && !isPreview && (
        <KeyInsightInspectorPopover
          insight={insight}
          selectedItemId={selectedItemId}
          activeTab={inspectorTab}
          onTabChange={setInspectorTab}
          onSelectItemId={setSelectedItemId}
          isOpen={isInspectorOpen}
          anchorRect={anchorRect}
          onClose={() => setIsInspectorOpen(false)}
          onUpdateInsight={handleUpdate}
          onUpdateSingleItem={handleUpdateSingleItem}
          onAddItem={() => handleAddItem()}
          onDeleteItem={handleDeleteItem}
        />
      )}
    </>
  );
}

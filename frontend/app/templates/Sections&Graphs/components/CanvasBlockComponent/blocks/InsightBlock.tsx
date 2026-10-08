import React, { useState } from "react";
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
} from "lucide-react";
import {
  CanvasCell,
  LibraryKeyInsightItem,
  KeyInsightBulletItem,
  KeyInsightVariant,
} from "@/lib/redux/slices/reportModuleSlice";
import { DynamicTextEditor } from "../../DynamicTitleEditor";

export interface InsightBlockProps {
  cell: CanvasCell;
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

export function InsightBlock({
  cell,
  isPreview,
  isForceEditing,
  onEditingChange,
  onUpdateInsight,
  style,
}: {
  cell: CanvasCell;
  isPreview?: boolean;
  isForceEditing?: boolean;
  onEditingChange?: (isEditing: boolean) => void;
  onUpdateInsight?: (textOrInsight: string | LibraryKeyInsightItem) => void;
  style?: React.CSSProperties;
}) {
  const insight = cell.insight;
  if (!insight) return null;

  const variant: KeyInsightVariant = insight.variant || "single";
  const [editingTarget, setEditingTarget] = useState<string | null>(null);

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

  const handleItemTextUpdate = (itemId: string, newText: string) => {
    const updated = (insight.items || []).map((it) => (it.id === itemId ? { ...it, text: newText } : it));
    handleUpdate({ items: updated });
    finishEdit();
  };

  const handleItemTitleUpdate = (itemId: string, newTitle: string) => {
    const updated = (insight.items || []).map((it) => (it.id === itemId ? { ...it, title: newTitle } : it));
    handleUpdate({ items: updated });
    finishEdit();
  };

  const handleAddItem = (defaultItem: Partial<KeyInsightBulletItem>) => {
    const ts = Date.now();
    const count = (insight.items?.length || 0) + 1;
    const newItem: KeyInsightBulletItem = {
      id: `kib-${ts}`,
      num: count,
      color: count === 1 ? "green" : count === 2 ? "blue" : count === 3 ? "purple" : "orange",
      title: defaultItem.title || `Observation ${count}`,
      text: defaultItem.text || "New observation recorded during monitoring.",
      subItems: defaultItem.subItems || [],
      ...defaultItem,
    };
    handleUpdate({ items: [...(insight.items || []), newItem] });
  };

  const handleDeleteItem = (itemId: string) => {
    const updated = (insight.items || []).filter((it) => it.id !== itemId);
    handleUpdate({ items: updated });
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

  const dynamicBoxShadow = "none";

  // ── 1. 4-Column Numbered Key Insights Grid (Page 5, 6, 7, 8) ────────────────
  if (variant === "columns-numbered") {
    return (
      <div
        className="w-full h-full flex-1 min-h-0 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] p-4 sm:p-5 space-y-3.5 overflow-hidden"
        style={{ borderRadius: dynamicBorderRadius, boxShadow: "none", ...style }}
      >
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 md:divide-x divide-slate-100 dark:divide-zinc-800/80">
          {(insight.items || []).map((item, idx) => {
            const badgeColorClass =
              BADGE_NUM_COLORS[item.color || ""] ||
              (idx % 4 === 0 ? "bg-[#10b981] text-white" : idx % 4 === 1 ? "bg-[#3b82f6] text-white" : idx % 4 === 2 ? "bg-[#8b5cf6] text-white" : "bg-[#f97316] text-white");
            const isItemEditing = editingTarget === `item-${item.id}`;

            return (
              <div
                key={item.id}
                className={`relative group/item flex items-start gap-2.5 ${idx > 0 ? "md:pl-3.5" : ""}`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5 ${badgeColorClass}`}>
                  {item.num ?? idx + 1}
                </span>

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

  // ── 2. 4-Column Titled Key Insights (Page 10, 11) ───────────────────────────
  if (variant === "columns-titled") {
    return (
      <div
        className="w-full h-full flex-1 min-h-0 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] p-4 sm:p-5 space-y-3.5 overflow-hidden"
        style={{ borderRadius: dynamicBorderRadius, boxShadow: "none", ...style }}
      >
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-[#1e3a8a] dark:text-blue-400 tracking-tight leading-none">
                {insight.title || "Key Insights"}
              </h3>
              <div className="w-10 h-0.5 bg-blue-600 rounded-full mt-1" />
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 md:divide-x divide-slate-100 dark:divide-zinc-800/80">
          {(insight.items || []).map((item, idx) => {
            const badgeColorClass =
              BADGE_NUM_COLORS[item.color || ""] ||
              (idx % 4 === 0 ? "bg-[#10b981] text-white" : idx % 4 === 1 ? "bg-[#3b82f6] text-white" : idx % 4 === 2 ? "bg-[#f97316] text-white" : "bg-[#ef4444] text-white");
            const isEditingTitle = editingTarget === `title-${item.id}`;
            const isEditingText = editingTarget === `text-${item.id}`;

            return (
              <div key={item.id} className={`relative group/item flex items-start gap-2.5 ${idx > 0 ? "md:pl-3.5" : ""}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5 ${badgeColorClass}`}>
                  {item.num ?? idx + 1}
                </span>

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
                    onClick={() => handleDeleteItem(item.id)}
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

  // ── 3. Key Takeaways Numbered Badge List (Page 3) ───────────────────────────
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

    return (
      <div
        className="w-full h-auto min-h-fit rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-[#f8fafc]/90 dark:bg-[#0c1017] px-3.5 py-1.5 space-y-0.5 overflow-hidden shadow-none"
        style={{ borderRadius: dynamicBorderRadius, boxShadow: "none", ...style }}
      >
        <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-200/80 dark:border-zinc-800">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-[#2563eb] text-white flex items-center justify-center font-bold shrink-0">
              <FileText className="w-2.5 h-2.5" />
            </div>
            <div>
              <h3 className="text-[11px] sm:text-xs font-black text-[#0f172a] dark:text-blue-400 tracking-tight leading-none">
                {insight.title || "Key Takeaways"}
              </h3>
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

        <div className="space-y-[2px]">
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
            const badgeColorClass =
              BADGE_NUM_COLORS[item.color || ""] ||
              defaultColors[idx % defaultColors.length];
            const isEditing = editingTarget === `item-${item.id}`;

            return (
              <div key={item.id} className={`relative group/row flex items-start gap-1.5 ${takeawayFontSizeClass} text-slate-700 dark:text-zinc-300 py-[1px]`}>
                <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7.5px] font-black shrink-0 mt-[1px] ${badgeColorClass}`}>
                  {item.num ?? idx + 1}
                </span>

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
                    onClick={() => handleDeleteItem(item.id)}
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

  // ── 4. Narrative Key Insights Multi-Paragraph (Page 4) ──────────────────────
  if (variant === "narrative-summary") {
    return (
      <div
        className="w-full h-full flex-1 min-h-0 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] p-5 space-y-3.5 overflow-hidden"
        style={{ borderRadius: dynamicBorderRadius, boxShadow: "none", ...style }}
      >
        <div className="flex items-center gap-2.5 pb-1.5 border-b border-slate-100 dark:border-zinc-800">
          <div className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-[#1e3a8a] dark:text-blue-400 tracking-tight leading-none">
              {insight.title || "Key Insights"}
            </h3>
            <div className="w-10 h-0.5 bg-blue-600 rounded-full mt-1" />
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

  // ── 5. Split Remarks & Quote Block (Page 17) ────────────────────────────────
  if (variant === "split-quote") {
    return (
      <div
        className="w-full h-full flex-1 min-h-0 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] p-5 overflow-hidden"
        style={{ borderRadius: dynamicBorderRadius, boxShadow: "none", ...style }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-center">
          <div className="lg:col-span-7 space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <MessageSquare className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-sm font-black text-[#1e3a8a] dark:text-blue-400">
                {insight.title || "3. Operational Remarks"}
              </h3>
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
      </div>
    );
  }

  // ── 6. Executive Quote Card (Page 5, 17, 18) ────────────────────────────────
  if (variant === "quote-card") {
    return (
      <div
        className="w-full h-full flex-1 min-h-0 rounded-2xl border border-blue-200/60 dark:border-blue-900/40 bg-gradient-to-br from-blue-50/60 via-white to-sky-50/40 dark:from-blue-950/30 dark:via-zinc-950 dark:to-zinc-900 p-6 flex flex-col justify-between relative overflow-hidden"
        style={{ borderRadius: dynamicBorderRadius, boxShadow: "none", ...style }}
      >
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

  // ── 7. Campaign Vision Banner (Page 17) ─────────────────────────────────────
  if (variant === "vision-banner") {
    return (
      <div
        className="w-full h-full flex-1 min-h-0 rounded-2xl border border-blue-200/80 dark:border-blue-900/50 bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50/50 dark:from-blue-950/40 dark:via-zinc-950 dark:to-zinc-900 p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden"
        style={{ borderRadius: dynamicBorderRadius, boxShadow: "none", ...style }}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-full bg-blue-900 text-white flex items-center justify-center shrink-0">
            <HardHat className="w-6 h-6" />
          </div>
          <div className="w-px h-10 bg-blue-600/40 hidden sm:block shrink-0" />
          <div>
            <h3 className="text-base sm:text-lg font-black text-[#1e3a8a] dark:text-blue-300 leading-tight">
              {insight.banner?.headline || insight.title || "Turning Insights into a Safer Tomorrow"}
            </h3>
            <p className="text-xs text-sky-700 dark:text-sky-400 font-semibold mt-0.5">
              {insight.banner?.subtitle || insight.text || "Continuous monitoring. Clearer actions. Safer workplaces."}
            </p>
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
          <div className="font-serif italic font-black text-sm text-blue-950 dark:text-blue-200">
            {insight.banner?.tagline || "Every Worker Returns Home Safe"}
          </div>
          <div className="w-12 h-0.5 bg-blue-600 rounded-full ml-auto mt-1" />
        </div>
      </div>
    );
  }

  // ── 8. Key Factors / Risk Bullets (Page 8) ──────────────────────────────────
  if (variant === "risk-factors") {
    return (
      <div
        className="w-full h-full flex-1 min-h-0 rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 p-4 space-y-2.5 overflow-hidden"
        style={{ borderRadius: dynamicBorderRadius, boxShadow: "none", ...style }}
      >
        <div className="flex items-center justify-between pb-1 border-b border-rose-100 dark:border-rose-900/40">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <h4 className="text-xs font-bold text-rose-800 dark:text-rose-300">
              {insight.title || "Key Factors"}
            </h4>
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
          {(insight.items || []).map((item) => (
            <div key={item.id} className="relative group/risk flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
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
                  onClick={() => handleDeleteItem(item.id)}
                  className="opacity-0 group-hover/risk:opacity-100 text-slate-400 hover:text-rose-500 p-0.5 cursor-pointer"
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

  // ── 9. Key Observations Dot Bullets (Page 9) ────────────────────────────────
  if (variant === "bullet-observations") {
    return (
      <div
        className="w-full h-full flex-1 min-h-0 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] p-4 space-y-2.5 overflow-hidden"
        style={{ borderRadius: dynamicBorderRadius, boxShadow: "none", ...style }}
      >
        <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold text-blue-900 dark:text-blue-300">
              {insight.title || "Key Observations"}
            </h4>
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
          {(insight.items || []).map((item) => (
            <div key={item.id} className="relative group/obs flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
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
                  onClick={() => handleDeleteItem(item.id)}
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

  // ── 10. Priority Actions 5 Steps (Page 18) ──────────────────────────────────
  if (variant === "priority-actions") {
    return (
      <div
        className="w-full h-full flex-1 min-h-0 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] p-5 space-y-3.5 overflow-hidden"
        style={{ borderRadius: dynamicBorderRadius, boxShadow: "none", ...style }}
      >
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#1e3a8a] dark:text-blue-400 tracking-tight leading-none">
                {insight.title || "2. Priority Actions for Next Month"}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {insight.text || "Key actions to address identified improvement areas."}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {(insight.items || []).map((item, idx) => {
            const badgeColorClass =
              BADGE_NUM_COLORS[item.color || ""] ||
              (idx === 0 ? "bg-blue-600 text-white" : idx === 1 ? "bg-emerald-600 text-white" : idx === 2 ? "bg-amber-600 text-white" : idx === 3 ? "bg-purple-600 text-white" : "bg-rose-600 text-white");

            return (
              <div key={item.id} className="rounded-xl border border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/40 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${badgeColorClass}`}>
                    {String(item.num ?? idx + 1).padStart(2, "0")}
                  </span>
                </div>
                <h5 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {item.title}
                </h5>
                {item.subItems && item.subItems.length > 0 && (
                  <ul className="space-y-1 text-[11px] text-slate-600 dark:text-zinc-400 leading-snug">
                    {item.subItems.map((sub, sIdx) => (
                      <li key={sIdx} className="flex items-start gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                        <span>{sub}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── 11. Default / Single Callout Bullet ──────────────────────────────────────
  return (
    <div
      className="w-full h-full flex-1 min-h-0 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] p-4 flex items-start gap-3.5 overflow-hidden"
      style={{
        borderRadius: dynamicBorderRadius,
        boxShadow: "none",
        ...style,
      }}
    >
      <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#9D61FF] to-blue-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
        <Lightbulb className="w-3.5 h-3.5" />
      </div>

      <div className="flex-1 min-w-0">
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
            className={`text-xs text-slate-700 dark:text-zinc-300 leading-relaxed select-text ${!isPreview ? "hover:bg-purple-500/5 rounded p-0.5 cursor-text transition-colors" : ""}`}
            dangerouslySetInnerHTML={{ __html: insight.text }}
          />
        )}
      </div>
    </div>
  );
}

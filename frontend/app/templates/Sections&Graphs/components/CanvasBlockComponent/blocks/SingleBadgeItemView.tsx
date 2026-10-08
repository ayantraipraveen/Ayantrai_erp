import React, { useState } from "react";
import { Pencil } from "lucide-react";
import { CanvasBadgeItem } from "@/lib/redux/slices/reportModuleSlice";
import { BADGE_COLOR_MAP } from "../common/blockConstants";
import { BadgeIcon } from "../common/BadgeIcon";
import { DynamicTextEditor, renderDynamicText } from "../../DynamicTitleEditor";

export interface SingleBadgeItemViewProps {
  badge: CanvasBadgeItem;
  isInsideSelected?: boolean;
  isPreview?: boolean;
  onSelect?: () => void;
  onUpdateBadge?: (patch: Partial<CanvasBadgeItem>) => void;
  onOpenInspector?: () => void;
}

export function SingleBadgeItemView({
  badge,
  isInsideSelected,
  isPreview,
  onSelect,
  onUpdateBadge,
  onOpenInspector,
}: SingleBadgeItemViewProps) {
  const [editingField, setEditingField] = useState<"value" | "label" | null>(null);
  const colors = BADGE_COLOR_MAP[badge.color] || BADGE_COLOR_MAP.blue;

  const cardStyle: React.CSSProperties = {
    backgroundColor: badge.customBgColor || undefined,
    borderColor: badge.customBorderColor || undefined,
    borderWidth: badge.borderWidth !== undefined ? `${badge.borderWidth}px` : undefined,
    borderStyle: badge.borderStyle || undefined,
    borderRadius: badge.borderRadius !== undefined ? `${badge.borderRadius}px` : undefined,
    padding: badge.padding !== undefined ? `${badge.padding}px` : undefined,
    width: badge.customWidth ? `${badge.customWidth}px` : "100%",
    height: badge.customHeight ? `${badge.customHeight}px` : "100%",
    minHeight: badge.customHeight ? `${badge.customHeight}px` : 0,
    maxWidth: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  };

  const valueColorStyle: React.CSSProperties = {
    color: badge.customTextColor || undefined,
    fontSize: badge.fontSizeValue ? `${badge.fontSizeValue}px` : undefined,
  };

  const labelColorStyle: React.CSSProperties = {
    color: badge.customLabelColor || undefined,
    fontSize: badge.fontSizeLabel ? `${badge.fontSizeLabel}px` : undefined,
  };

  const iconContainerSize =
    badge.iconShape === "none"
      ? (badge.iconSize || 18)
      : Math.max(28, (badge.iconSize || 18) + 10);

  const iconShapeClass =
    badge.iconShape === "circle"
      ? "rounded-full"
      : badge.iconShape === "square"
        ? "rounded-none"
        : badge.iconShape === "none"
          ? "bg-transparent p-0 border-0 shadow-none"
          : "rounded-xl";

  const iconBoxStyle: React.CSSProperties = {
    width: `${iconContainerSize}px`,
    height: `${iconContainerSize}px`,
    backgroundColor: badge.customIconBg || undefined,
  };

  return (
    <div
      style={cardStyle}
      onMouseDown={(e) => {
        e.stopPropagation();
        onSelect?.();
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.();
      }}
      className={`no-drag relative rounded-2xl border p-3 flex flex-col justify-between transition-all duration-150 select-none group/single-badge cursor-pointer ${
        !badge.customWidth ? "w-full" : ""
      } ${
        !badge.customHeight ? "h-full min-h-0" : ""
      } ${
        isInsideSelected
          ? "ring-2 ring-[#9D61FF] ring-offset-2 dark:ring-offset-zinc-950 shadow-md border-[#9D61FF]"
          : "hover:border-purple-300 dark:hover:border-purple-700"
      } ${
        !badge.customBgColor ? colors.bg : ""
      } ${!badge.customBorderColor ? colors.border : ""} ${
        editingField ? "z-50" : "z-10"
      }`}
    >
      {/* Top row: Badge Icon & Edit Button */}
      <div className="flex items-start justify-between w-full">
        <div
          style={iconBoxStyle}
          className={`${iconShapeClass} flex items-center justify-center shrink-0 ${
            !badge.customIconColor ? colors.text : ""
          } ${
            !badge.customIconBg && badge.iconShape !== "none"
              ? "bg-white/50 dark:bg-zinc-800/50"
              : ""
          }`}
        >
          <BadgeIcon
            name={badge.icon}
            size={badge.iconSize || 18}
            color={badge.customIconColor}
          />
        </div>

        <div className="flex items-center gap-1">
          {/* Visual Selected Badge Indicator */}
          {isInsideSelected && (
            <div
              className="w-2.5 h-2.5 rounded-full bg-[#9D61FF] ring-2 ring-white dark:ring-zinc-900 shadow-xs pointer-events-none animate-pulse"
              title="Selected Card"
            />
          )}

          {!isPreview && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.();
                onOpenInspector?.();
              }}
              className="opacity-0 group-hover/single-badge:opacity-100 p-1 text-slate-400 hover:text-[#9D61FF] transition-opacity cursor-pointer rounded-lg hover:bg-white/60 dark:hover:bg-zinc-800/60"
              title="Open Card Inspector"
            >
              <Pencil className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Bottom section: Value + Label */}
      <div className="flex flex-col justify-end w-full">
        {/* Metric Value (double-click inline edit) */}
        <div
          style={valueColorStyle}
          className={`text-lg font-black font-mono leading-tight ${
            !badge.customTextColor ? colors.text : ""
          }`}
        >
          {!isPreview && editingField === "value" ? (
            <DynamicTextEditor
              initialValue={badge.value}
              initialHtml={(badge as any).valueHtml}
              defaultFontSize={badge.fontSizeValue || 18}
              className="text-lg font-black font-mono leading-tight"
              onSave={(plain, html) => {
                if (onUpdateBadge) onUpdateBadge({ value: plain, valueHtml: html } as any);
                setEditingField(null);
              }}
              onCancel={() => setEditingField(null)}
            />
          ) : (
            <span
              onDoubleClick={(e) => {
                if (isPreview) return;
                e.stopPropagation();
                setEditingField("value");
              }}
              title={!isPreview ? "Double-click to format value (Word style)" : undefined}
              className={!isPreview ? "hover:underline cursor-text" : ""}
            >
              {renderDynamicText((badge as any).valueHtml, badge.value)}
            </span>
          )}
        </div>

        {/* Badge Label (double-click inline edit) */}
        <div
          style={labelColorStyle}
          className="text-[10px] font-medium text-slate-500 dark:text-zinc-400 leading-tight mt-0.5"
        >
          {!isPreview && editingField === "label" ? (
            <DynamicTextEditor
              initialValue={badge.label}
              initialHtml={(badge as any).labelHtml}
              defaultFontSize={badge.fontSizeLabel || 10}
              className="text-[10px] font-medium leading-tight"
              onSave={(plain, html) => {
                if (onUpdateBadge) onUpdateBadge({ label: plain, labelHtml: html } as any);
                setEditingField(null);
              }}
              onCancel={() => setEditingField(null)}
            />
          ) : (
            <span
              onDoubleClick={(e) => {
                if (isPreview) return;
                e.stopPropagation();
                setEditingField("label");
              }}
              title={!isPreview ? "Double-click to format label (Word style)" : undefined}
              className={!isPreview ? "hover:underline cursor-text" : ""}
            >
              {renderDynamicText((badge as any).labelHtml, badge.label)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

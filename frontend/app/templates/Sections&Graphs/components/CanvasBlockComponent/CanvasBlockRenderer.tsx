"use client";

import React from "react";
import {
  // Constants & Types
  BADGE_COLOR_PALETTES,
  BADGE_COLOR_MAP,
  DYNAMIC_METRIC_ICONS,
  BADGE_AVAILABLE_ICONS,
  CONTAINER_BG_PRESETS,
  CONTAINER_BORDER_PRESETS,
  withAlpha,
  getCardBackgroundColor,
  BlockRendererProps,
  // Utilities & Helpers
  getCellStyleClasses,
  calculateTopBarPosition,
  calculateFloatingPosition,
  useDraggableFloatingPopover,
  // Common UI Elements
  BadgeIcon,
  ColorSwatchPicker,
} from "./common";
import {
  // Inspectors
  DraggablePopoverShell,
  BadgeColorPalettePicker,
  MetricIconPicker,
  DynamicIconColorsControl,
  CardDimensionControls,
  MetricCardInspectorPopover,
  BadgeStripInspectorPopover,
  KeyInsightInspectorPopover,
  ChartInspectorPopover,
  TextBlockInspectorPopover,
} from "./inspectors";
import {
  // Blocks
  MetricCardBlock,
  SingleBadgeItemView,
  BadgeStripBlock,
  ChartBlock,
  InsightBlock,
  TextBlock,
  DividerBlock,
  ElementBlock,
} from "./blocks";

// ── Re-exports for Complete Public API ─────────────────────────────────────────
export {
  BADGE_COLOR_PALETTES,
  BADGE_COLOR_MAP,
  DYNAMIC_METRIC_ICONS,
  BADGE_AVAILABLE_ICONS,
  CONTAINER_BG_PRESETS,
  CONTAINER_BORDER_PRESETS,
  withAlpha,
  getCardBackgroundColor,
  getCellStyleClasses,
  calculateTopBarPosition,
  calculateFloatingPosition,
  useDraggableFloatingPopover,
  BadgeIcon,
  ColorSwatchPicker,
  DraggablePopoverShell,
  BadgeColorPalettePicker,
  MetricIconPicker,
  DynamicIconColorsControl,
  CardDimensionControls,
  MetricCardInspectorPopover,
  BadgeStripInspectorPopover,
  KeyInsightInspectorPopover,
  ChartInspectorPopover,
  TextBlockInspectorPopover,
  MetricCardBlock,
  SingleBadgeItemView,
  BadgeStripBlock,
  ChartBlock,
  InsightBlock,
  TextBlock,
  DividerBlock,
  ElementBlock,
};
export type { BlockRendererProps };

// ── Main CanvasBlockRenderer Dispatcher ────────────────────────────────────────
export function CanvasBlockRenderer({
  cell,
  isSelected,
  isPreview,
  isForceEditing,
  onEditingChange,
  onUpdateMetricCard,
  onUpdateChart,
  onOpenChartEditor,
  onUpdateInsight,
  onUpdateTextBlock,
  onUpdateBadgeStrip,
  onUpdateSingleBadge,
  onAddBadge,
  onDeleteBadge,
  onUpdateDivider,
  onUpdateElement,
}: BlockRendererProps) {
  const { fontClass, fontSizeClass, alignClass, bgClass, textColorClass, styleProps } =
    getCellStyleClasses(cell.style);
  const backgroundColor = getCardBackgroundColor(cell.style);

  const renderInner = () => {
    switch (cell.blockType) {
      case "metric-card":
        return (
          <MetricCardBlock
            cell={cell}
            isSelected={isSelected}
            isPreview={isPreview}
            onUpdateMetricCard={onUpdateMetricCard}
            onEditingChange={onEditingChange}
          />
        );
      case "chart":
        return (
          <ChartBlock
            cell={cell}
            isSelected={isSelected}
            isPreview={isPreview}
            onOpenChartEditor={onOpenChartEditor}
            onUpdateChart={onUpdateChart}
            onEditingChange={onEditingChange}
          />
        );
      case "insight":
        return (
          <InsightBlock
            cell={cell}
            isSelected={isSelected}
            isPreview={isPreview}
            isForceEditing={isForceEditing}
            onEditingChange={onEditingChange}
            onUpdateInsight={onUpdateInsight}
          />
        );
      case "text":
        return (
          <TextBlock
            cell={cell}
            isSelected={isSelected}
            isPreview={isPreview}
            isForceEditing={isForceEditing}
            onEditingChange={onEditingChange}
            onUpdateTextBlock={onUpdateTextBlock}
          />
        );
      case "badge-strip":
        return (
          <BadgeStripBlock
            cell={cell}
            isSelected={isSelected}
            isPreview={isPreview}
            onUpdateBadgeStrip={onUpdateBadgeStrip}
            onUpdateSingleBadge={onUpdateSingleBadge}
            onAddBadge={onAddBadge}
            onDeleteBadge={onDeleteBadge}
          />
        );
      case "divider":
        return (
          <DividerBlock
            cell={cell}
            isSelected={isSelected}
            isPreview={isPreview}
            onUpdateDivider={onUpdateDivider}
          />
        );
      case "element":
        return (
          <ElementBlock
            cell={cell}
            isSelected={isSelected}
            isPreview={isPreview}
            onUpdateElement={onUpdateElement}
          />
        );
      case "stamp":
        return (
          <div
            className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full select-none pointer-events-none"
            dangerouslySetInnerHTML={{
              __html: cell.element?.svgContent || cell.elementBlock?.svgContent || "",
            }}
          />
        );
      default:
        return null;
    }
  };

  const renderedInner = renderInner();
  const cardStyles: React.CSSProperties = {};
  if (typeof cell.customHeight === "number") {
    cardStyles.minHeight = `${cell.customHeight}px`;
    if (cell.customHeight < 32) {
      cardStyles.paddingTop = Math.max(0, Math.floor(cell.customHeight / 2));
      cardStyles.paddingBottom = Math.max(0, Math.floor(cell.customHeight / 2));
    }
  }
  if (backgroundColor) cardStyles.backgroundColor = backgroundColor;
  if (styleProps.borderColor) cardStyles.borderColor = styleProps.borderColor;
  if (styleProps.borderWidth) cardStyles.borderWidth = styleProps.borderWidth;
  if (styleProps.borderStyle) cardStyles.borderStyle = styleProps.borderStyle;
  if (styleProps.borderRadius) cardStyles.borderRadius = styleProps.borderRadius;
  cardStyles.boxShadow = "none";
  if (styleProps.padding) cardStyles.padding = styleProps.padding;
  if (styleProps.paddingTop) cardStyles.paddingTop = styleProps.paddingTop;
  if (styleProps.paddingBottom) cardStyles.paddingBottom = styleProps.paddingBottom;
  if (styleProps.paddingLeft) cardStyles.paddingLeft = styleProps.paddingLeft;
  if (styleProps.paddingRight) cardStyles.paddingRight = styleProps.paddingRight;
  if (styleProps.margin) cardStyles.margin = styleProps.margin;
  if (styleProps.marginTop) cardStyles.marginTop = styleProps.marginTop;
  if (styleProps.marginBottom) cardStyles.marginBottom = styleProps.marginBottom;
  if (styleProps.marginLeft) cardStyles.marginLeft = styleProps.marginLeft;
  if (styleProps.marginRight) cardStyles.marginRight = styleProps.marginRight;

  const innerWithBackground =
    Object.keys(cardStyles).length > 0 && React.isValidElement(renderedInner)
      ? React.cloneElement(renderedInner as React.ReactElement<{ style?: React.CSSProperties }>, {
          style: {
            ...(renderedInner as React.ReactElement<{ style?: React.CSSProperties }>).props.style,
            ...cardStyles,
          },
        })
      : renderedInner;

  return (
    <div
      className={`w-full h-full flex-1 flex flex-col transition-all overflow-visible ${fontClass} ${fontSizeClass} ${alignClass} ${bgClass} ${textColorClass}`}
      style={{
        color: styleProps.color,
      }}
    >
      {innerWithBackground}
    </div>
  );
}

export default CanvasBlockRenderer;

"use client";

import React from "react";
import { CanvasContextRibbonProps } from "./types";
import { PreviewRibbon } from "./PreviewRibbon";
import { BlockContextRibbon } from "./BlockContextRibbon";
import { RowContextRibbon } from "./RowContextRibbon";
import { GlobalCanvasRibbon } from "./GlobalCanvasRibbon";

export function CanvasContextRibbon(props: CanvasContextRibbonProps) {
  const { isPreview, onTogglePreview, selectedCell, selectedRowId, activeRow } = props;

  // 1. Preview Mode Banner
  if (isPreview) {
    return <PreviewRibbon onTogglePreview={onTogglePreview} />;
  }

  // 2. Active Cell Context Ribbon
  if (selectedCell) {
    return (
      <BlockContextRibbon
        selectedCell={selectedCell}
        onUpdateColSpan={props.onUpdateColSpan}
        onUpdateWidth={props.onUpdateWidth}
        onUpdateHeight={props.onUpdateHeight}
        onUpdateMetricCard={props.onUpdateMetricCard}
        onUpdateChart={props.onUpdateChart}
        onOpenChartEditor={props.onOpenChartEditor}
        onDuplicate={props.onDuplicate}
        onDelete={props.onDelete}
        showRulers={props.showRulers}
        onToggleRulers={props.onToggleRulers}
        onUndo={props.onUndo}
        onRedo={props.onRedo}
        canUndo={props.canUndo}
        canRedo={props.canRedo}
        onUpdateCellStyle={props.onUpdateCellStyle}
        uploadedWatermarks={props.uploadedWatermarks}
        activeWatermarkId={props.activeWatermarkId}
        onSelectWatermark={props.onSelectWatermark}
        watermarkConfig={props.watermarkConfig}
        onUpdateWatermarkConfig={props.onUpdateWatermarkConfig}
      />
    );
  }

  // 3. Active Row Context Ribbon
  if (selectedRowId && activeRow) {
    return (
      <RowContextRibbon
        activeRow={activeRow}
        onUndo={props.onUndo}
        onRedo={props.onRedo}
        canUndo={props.canUndo}
        canRedo={props.canRedo}
        onUpdateRowStyle={props.onUpdateRowStyle}
        onRemoveRow={props.onRemoveRow}
        onTogglePageBreak={props.onTogglePageBreak}
      />
    );
  }

  // 4. Global Canvas Ribbon (Default)
  return (
    <GlobalCanvasRibbon
      sectionName={props.sectionName}
      sectionEyebrow={props.sectionEyebrow}
      paperTone={props.paperTone}
      onSetPaperTone={props.onSetPaperTone}
      sectionTextColor={props.sectionTextColor}
      onSetSectionTextColor={props.onSetSectionTextColor}
      uploadedWatermarks={props.uploadedWatermarks}
      activeWatermarkId={props.activeWatermarkId}
      onSelectWatermark={props.onSelectWatermark}
      watermarkConfig={props.watermarkConfig}
      onUpdateWatermarkConfig={props.onUpdateWatermarkConfig}
      showGrid={props.showGrid}
      onToggleGrid={props.onToggleGrid}
      showGuides={props.showGuides}
      onToggleGuides={props.onToggleGuides}
      marginConfig={props.marginConfig}
      onUpdateMarginConfig={props.onUpdateMarginConfig}
      sectionStyle={props.sectionStyle}
      onUpdateSectionStyle={props.onUpdateSectionStyle}
      showRulers={props.showRulers}
      onToggleRulers={props.onToggleRulers}
      onUndo={props.onUndo}
      onRedo={props.onRedo}
      canUndo={props.canUndo}
      canRedo={props.canRedo}
      onTogglePreview={props.onTogglePreview}
    />
  );
}

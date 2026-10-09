import React from "react";
import {
  CanvasRow,
  CanvasRowStyle,
  CanvasSectionStyle,
  CanvasCell,
  CanvasBadgeStrip,
  CanvasBadgeItem,
  CanvasBlockType,
  LibrarySection,
  LibraryMetricCard,
  LibraryKeyInsightItem,
  LibraryChartCard,
  CanvasCoordinateStamp,
  CanvasDividerBlock,
  CanvasElementBlock,
} from "@/lib/redux/slices/reportModuleSlice";
import { UploadedSvgWatermark, WatermarkStampConfig } from "../watermark/utils";
import { SidebarAddBlockEvent } from "../components/CanvasSidebar";
import { CanvasMarginConfig } from "./canvasStyleUtils";

export interface DropInsertZoneProps {
  insertIndex: number;
  onAddRow?: (index: number) => void;
  onDropBlock?: (e: SidebarAddBlockEvent) => void;
  label?: string;
}

export interface AddRowButtonProps {
  pageNumber: number;
  onAddRow?: () => void;
  onDropBlock?: (e: SidebarAddBlockEvent) => void;
}

export interface SortableCellProps {
  sectionId: string;
  rowId: string;
  cell: CanvasCell;
  isSelected: boolean;
  isPreview?: boolean;
  onSelect?: (cellId: string, rowId: string) => void;
  onEdit: (cell: CanvasCell, rowId: string) => void;
  onDuplicate: (cellId: string, rowId: string) => void;
  onDelete: (cellId: string, rowId: string) => void;
  onColSpanChange?: (cellId: string, rowId: string, span: 1 | 2 | 3 | 4) => void;
  onWidthChange?: (cellId: string, rowId: string, customWidth: number) => void;
  onHeightChange?: (cellId: string, rowId: string, customHeight?: number) => void;
  onUpdateMetricCard?: (rowId: string, cellId: string, card: LibraryMetricCard) => void;
  onUpdateChart?: (rowId: string, cellId: string, chart: LibraryChartCard) => void;
  onUpdateInsight?: (rowId: string, cellId: string, textOrInsight: string | LibraryKeyInsightItem) => void;
  onUpdateTextBlock?: (rowId: string, cellId: string, content: string) => void;
  onUpdateBadgeStrip?: (rowId: string, cellId: string, strip: CanvasBadgeStrip) => void;
  onUpdateSingleBadge?: (rowId: string, cellId: string, badgeId: string, patch: Partial<CanvasBadgeItem>) => void;
  onAddBadge?: (rowId: string, cellId: string) => void;
  onDeleteBadge?: (rowId: string, cellId: string, badgeId: string) => void;
  onUpdateDivider?: (rowId: string, cellId: string, divider: CanvasDividerBlock) => void;
  onUpdateElement?: (rowId: string, cellId: string, element: CanvasElementBlock) => void;
  cellIndex?: number;
  totalCellsInRow?: number;
  selectedCellId?: string | null;
  previousCellId?: string;
  onMoveToStackBelow?: (sourceCellId: string, targetCellId: string) => void;
  onStackCellBelow?: (cell: CanvasCell) => void;
  onUnstackCell?: (cellId: string) => void;
  onReorderStacked?: (parentCellId: string, direction: "up" | "down", index: number) => void;
  onDropToStack?: (targetCellId: string, data: any) => void;
  activeDragCellId?: string | null;
  onAddBlockBeside?: (rowId: string, cellIndex: number, blockType: CanvasBlockType) => void;
  onFloatCell?: (cell: CanvasCell, rowId: string) => void;
  zoom?: number;
  currentPageNumber?: number;
}

export interface SortableRowProps {
  sectionId: string;
  row: CanvasRow;
  selectedCellId?: string | null;
  selectedRowId?: string | null;
  isPreview?: boolean;
  currentPageNumber?: number;
  onSelectCell?: (cellId: string | null, rowId: string | null) => void;
  onEditCell: (cell: CanvasCell, rowId: string) => void;
  onDuplicateCell: (cellId: string, rowId: string) => void;
  onDeleteCell: (cellId: string, rowId: string) => void;
  onFloatCell?: (cell: CanvasCell, rowId: string) => void;
  onColSpanChange?: (cellId: string, rowId: string, span: 1 | 2 | 3 | 4) => void;
  onWidthChange?: (cellId: string, rowId: string, customWidth: number) => void;
  onHeightChange?: (cellId: string, rowId: string, customHeight?: number) => void;
  onUpdateMetricCard?: (rowId: string, cellId: string, card: LibraryMetricCard) => void;
  onUpdateChart?: (rowId: string, cellId: string, chart: LibraryChartCard) => void;
  onUpdateInsight?: (rowId: string, cellId: string, textOrInsight: string | LibraryKeyInsightItem) => void;
  onUpdateTextBlock?: (rowId: string, cellId: string, content: string) => void;
  onUpdateBadgeStrip?: (rowId: string, cellId: string, strip: CanvasBadgeStrip) => void;
  onUpdateSingleBadge?: (rowId: string, cellId: string, badgeId: string, patch: Partial<CanvasBadgeItem>) => void;
  onAddBadge?: (rowId: string, cellId: string) => void;
  onDeleteBadge?: (rowId: string, cellId: string, badgeId: string) => void;
  onUpdateDivider?: (rowId: string, cellId: string, divider: CanvasDividerBlock) => void;
  onUpdateElement?: (rowId: string, cellId: string, element: CanvasElementBlock) => void;
  onRemoveRow: (rowId: string) => void;
  onTogglePageBreak?: (rowId: string) => void;
  onDropBlock?: (e: SidebarAddBlockEvent) => void;
  onMoveCellToStackBelow?: (sourceCellId: string, targetCellId: string, rowId: string) => void;
  onStackCellBelow?: (rowId: string, targetCellId: string, cell: CanvasCell) => void;
  onUnstackCell?: (rowId: string, cellId: string) => void;
  onReorderStacked?: (rowId: string, parentCellId: string, direction: "up" | "down", index: number) => void;
  activeDragCellId?: string | null;
  onAddBlockBeside?: (rowId: string, cellIndex: number, blockType: CanvasBlockType) => void;
  onUpdateRowStyle?: (rowId: string, style: Partial<CanvasRowStyle>) => void;
  zoom?: number;
}

export interface CanvasStudioProps {
  section: LibrarySection;
  selectedCellId?: string | null;
  selectedRowId?: string | null;
  onSelectCell?: (cellId: string | null, rowId: string | null) => void;
  onEditCell: (cell: CanvasCell, rowId: string) => void;
  onFloatCell?: (cell: CanvasCell, rowId: string) => void;
  onDockStampToGrid?: (stamp: CanvasCoordinateStamp) => void;
  onOpenChartEditor?: (stampId: string, chart: LibraryChartCard) => void;
  onUpdateMetricCardInCell?: (rowId: string, cellId: string, card: LibraryMetricCard) => void;
  onUpdateChartInCell?: (rowId: string, cellId: string, chart: LibraryChartCard) => void;
  onUpdateInsightInCell?: (rowId: string, cellId: string, textOrInsight: string | LibraryKeyInsightItem) => void;
  onUpdateTextBlockInCell?: (rowId: string, cellId: string, content: string) => void;
  onUpdateBadgeStripInCell?: (rowId: string, cellId: string, strip: CanvasBadgeStrip) => void;
  onUpdateSingleBadgeInCell?: (rowId: string, cellId: string, badgeId: string, patch: Partial<CanvasBadgeItem>) => void;
  onAddBadgeToStripInCell?: (rowId: string, cellId: string) => void;
  onDeleteBadgeFromStripInCell?: (rowId: string, cellId: string, badgeId: string) => void;
  onHeightChange?: (cellId: string, rowId: string, customHeight?: number) => void;
  onUpdateRowStyle?: (rowId: string, style: Partial<CanvasRowStyle>) => void;
  onUpdateSectionStyle?: (style: Partial<CanvasSectionStyle>) => void;
  paperTone?: string;
  marginConfig?: CanvasMarginConfig;
  pageNumber?: number;
  totalReportPages?: number;
  sectionTextColor?: string;
  showGrid?: boolean;
  onToggleGrid?: () => void;
  showGuides?: boolean;
  onToggleGuides?: () => void;
  showRulers?: boolean;
  onToggleRulers?: () => void;
  zoom?: number;
  setZoom?: (zoom: number | ((prev: number) => number)) => void;
  isPreview?: boolean;
  onTogglePreview?: () => void;
  activeWatermark?: UploadedSvgWatermark | null;
  watermarkConfig?: WatermarkStampConfig;
  onUpdateWatermarkConfig?: (config: Partial<WatermarkStampConfig>) => void;
  onSelectWatermark?: ((w: UploadedSvgWatermark | null) => void) | ((watermarkId: string | null) => void);
  onDropBlock?: (e: SidebarAddBlockEvent) => void;
  onEditHeader?: () => void;
  onMoveCellToStackBelow?: (sourceCellId: string, targetCellId: string, rowId: string) => void;
  onStackCellBelow?: (rowId: string, targetCellId: string, cell: CanvasCell) => void;
  onUnstackCell?: (rowId: string, cellId: string) => void;
  onReorderStacked?: (rowId: string, parentCellId: string, direction: "up" | "down", index: number) => void;
  activeViewPageIndex?: number;
  onViewPageIndexChange?: (pageIdx: number) => void;
  /** Rendered before the first content page inside the scroll desk (e.g. Cover Page) */
  beforeContent?: React.ReactNode;
  /** Rendered after the last content page inside the scroll desk (e.g. Back Cover) */
  afterContent?: React.ReactNode;
  onAddPage?: () => void;
}

export interface HeaderTitleFormat {
  fontFamily: "sans" | "serif" | "mono" | "rounded";
  fontSize: number;
  color: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  textAlign: "left" | "center" | "right";
}

export const DEFAULT_HEADER_TITLE_FORMAT: HeaderTitleFormat = {
  fontFamily: "sans",
  fontSize: 19,
  color: "#1836a0",
  bold: true,
  italic: false,
  underline: false,
  textAlign: "left",
};

export interface ReportHeaderValues {
  taglinePrimary: string;
  taglinePrimaryHtml?: string;
  taglineSecondary: string;
  taglineSecondaryHtml?: string;
  title: string;
  titleHtml?: string;
  period: string;
  periodHtml?: string;
}

export interface ReportFooterValues {
  company: string;
  companyHtml?: string;
  websites: string;
  websitesHtml?: string;
  quote: string;
  quoteHtml?: string;
}

export type RulerUnit = "px" | "pt" | "mm" | "in";

export interface UnitConversionFactors {
  isPdf72Dpi: boolean;
  pxPerInch: number;
  pxPerMm: number;
  pxPerPt: number;
}

export function getUnitConversionFactors(pageWidth: number): UnitConversionFactors {
  const isPdf72Dpi = Math.abs(pageWidth - 595) < 10;
  return {
    isPdf72Dpi,
    pxPerInch: isPdf72Dpi ? 72 : 96,
    pxPerMm: pageWidth / 210,
    pxPerPt: isPdf72Dpi ? 1 : 96 / 72,
  };
}

export function formatRulerValue(
  px: number,
  unit: RulerUnit,
  factors: UnitConversionFactors
): string {
  if (unit === "pt") {
    return Math.round(px / factors.pxPerPt).toString();
  }
  if (unit === "mm") {
    return (px / factors.pxPerMm).toFixed(0);
  }
  if (unit === "in") {
    return (px / factors.pxPerInch).toFixed(1);
  }
  return Math.round(px).toString();
}

/**
 * Resolves the sequential type prefix for a CanvasCoordinateStamp.
 */
export function getStampTypePrefix(stamp: CanvasCoordinateStamp): string {
  if (stamp.elementType === "chart" || Boolean(stamp.chart)) return "chart";
  if (stamp.elementType === "text" || Boolean(stamp.textBlock)) return "text";
  if (stamp.elementType === "metric-card" || Boolean(stamp.metricCard)) return "metric";
  if (stamp.elementType === "insight" || Boolean(stamp.insight)) return "insight";
  if (stamp.elementType === "badge-strip" || Boolean(stamp.badgeStrip)) return "badge";
  if (stamp.elementType === "divider" || Boolean(stamp.divider)) return "divider";
  return "stamp";
}

/**
 * Scans a LibrarySection (and optional in-flight allocated IDs) to find the highest number
 * matching `${prefix}-N` and returns `${prefix}-${maxNumber + 1}` (e.g., chart-1, chart-2, etc.).
 */
export function getNextSequentialId(
  prefix: string,
  section?: Partial<LibrarySection> | null,
  allocatedIds?: Set<string> | string[]
): string {
  let maxNum = 0;
  const regex = new RegExp(`^${prefix}-(\\d+)$`);

  const checkId = (id?: string | null) => {
    if (!id || typeof id !== "string") return;
    const match = id.match(regex);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  };

  // 1. Scan section.stamps
  if (section?.stamps) {
    for (const s of section.stamps) {
      checkId(s.id);
      checkId(s.sourceId);
      checkId(s.chart?.id);
      checkId(s.textBlock?.id);
      checkId(s.metricCard?.id);
      checkId(s.insight?.id);
      checkId(s.badgeStrip?.id);
      checkId(s.element?.sourceId);
    }
  }

  // 2. Scan section.canvasRows
  if (section?.canvasRows) {
    for (const r of section.canvasRows) {
      if (r.cells) {
        for (const c of r.cells) {
          checkId(c.id);
          checkId(c.chart?.id);
          checkId(c.textBlock?.id);
          checkId(c.metricCard?.id);
          checkId(c.insight?.id);
          checkId(c.badgeStrip?.id);
          if (c.stackedCells) {
            for (const sc of c.stackedCells) {
              checkId(sc.id);
              checkId(sc.chart?.id);
              checkId(sc.textBlock?.id);
              checkId(sc.metricCard?.id);
              checkId(sc.insight?.id);
              checkId(sc.badgeStrip?.id);
            }
          }
        }
      }
    }
  }

  // 3. Scan allocated IDs in current operation
  if (allocatedIds) {
    for (const id of allocatedIds) {
      checkId(id);
    }
  }

  return `${prefix}-${maxNum + 1}`;
}

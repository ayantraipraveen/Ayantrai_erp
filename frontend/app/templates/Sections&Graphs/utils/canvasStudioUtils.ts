import {
  CanvasRow,
  CanvasCell,
  CanvasBadgeStrip,
  CanvasBadgeItem,
  CanvasBlockType,
  LibrarySection,
  LibraryMetricCard,
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
  onUpdateInsight?: (rowId: string, cellId: string, text: string) => void;
  onUpdateTextBlock?: (rowId: string, cellId: string, content: string) => void;
  onUpdateBadgeStrip?: (rowId: string, cellId: string, strip: CanvasBadgeStrip) => void;
  onUpdateSingleBadge?: (rowId: string, cellId: string, badgeId: string, patch: Partial<CanvasBadgeItem>) => void;
  onAddBadge?: (rowId: string, cellId: string) => void;
  onDeleteBadge?: (rowId: string, cellId: string, badgeId: string) => void;
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
  zoom?: number;
  currentPageNumber?: number;
}

export interface SortableRowProps {
  sectionId: string;
  row: CanvasRow;
  selectedCellId?: string | null;
  selectedRowId?: string | null;
  isPreview?: boolean;
  isAutoBreakFirstRow?: boolean;
  currentPageNumber?: number;
  onSelectCell?: (cellId: string | null, rowId: string | null) => void;
  onEditCell: (cell: CanvasCell, rowId: string) => void;
  onDuplicateCell: (cellId: string, rowId: string) => void;
  onDeleteCell: (cellId: string, rowId: string) => void;
  onColSpanChange?: (cellId: string, rowId: string, span: 1 | 2 | 3 | 4) => void;
  onWidthChange?: (cellId: string, rowId: string, customWidth: number) => void;
  onHeightChange?: (cellId: string, rowId: string, customHeight?: number) => void;
  onUpdateMetricCard?: (rowId: string, cellId: string, card: LibraryMetricCard) => void;
  onUpdateInsight?: (rowId: string, cellId: string, text: string) => void;
  onUpdateTextBlock?: (rowId: string, cellId: string, content: string) => void;
  onUpdateBadgeStrip?: (rowId: string, cellId: string, strip: CanvasBadgeStrip) => void;
  onUpdateSingleBadge?: (rowId: string, cellId: string, badgeId: string, patch: Partial<CanvasBadgeItem>) => void;
  onAddBadge?: (rowId: string, cellId: string) => void;
  onDeleteBadge?: (rowId: string, cellId: string, badgeId: string) => void;
  onRemoveRow: (rowId: string) => void;
  onTogglePageBreak?: (rowId: string) => void;
  onDropBlock?: (e: SidebarAddBlockEvent) => void;
  onMoveCellToStackBelow?: (sourceCellId: string, targetCellId: string, rowId: string) => void;
  onStackCellBelow?: (rowId: string, targetCellId: string, cell: CanvasCell) => void;
  onUnstackCell?: (rowId: string, cellId: string) => void;
  onReorderStacked?: (rowId: string, parentCellId: string, direction: "up" | "down", index: number) => void;
  activeDragCellId?: string | null;
  onAddBlockBeside?: (rowId: string, cellIndex: number, blockType: CanvasBlockType) => void;
  zoom?: number;
}

export interface CanvasStudioProps {
  section: LibrarySection;
  selectedCellId?: string | null;
  selectedRowId?: string | null;
  onSelectCell?: (cellId: string | null, rowId: string | null) => void;
  onEditCell: (cell: CanvasCell, rowId: string) => void;
  onUpdateMetricCardInCell?: (rowId: string, cellId: string, card: LibraryMetricCard) => void;
  onUpdateInsightInCell?: (rowId: string, cellId: string, text: string) => void;
  onUpdateTextBlockInCell?: (rowId: string, cellId: string, content: string) => void;
  onUpdateBadgeStripInCell?: (rowId: string, cellId: string, strip: CanvasBadgeStrip) => void;
  onUpdateSingleBadgeInCell?: (rowId: string, cellId: string, badgeId: string, patch: Partial<CanvasBadgeItem>) => void;
  onAddBadgeToStripInCell?: (rowId: string, cellId: string) => void;
  onDeleteBadgeFromStripInCell?: (rowId: string, cellId: string, badgeId: string) => void;
  onHeightChange?: (cellId: string, rowId: string, customHeight?: number) => void;
  paperTone?: string;
  marginConfig?: CanvasMarginConfig;
  pageNumber?: number;
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

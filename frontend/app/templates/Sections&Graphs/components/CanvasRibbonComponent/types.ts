import {
  CanvasCell,
  CanvasCellStyle,
  CanvasRow,
  CanvasRowStyle,
  CanvasSectionStyle,
  LibraryMetricCard,
  LibraryChartCard,
} from "@/lib/redux/slices/reportModuleSlice";
import { UploadedSvgWatermark, WatermarkStampConfig } from "../../watermark/utils";
import { CanvasMarginConfig } from "./constants";

export interface CanvasContextRibbonProps {
  selectedCell: CanvasCell | null;
  selectedRowId: string | null;
  sectionName: string;
  sectionEyebrow: string;
  onUpdateColSpan: (span: 1 | 2 | 3 | 4) => void;
  onUpdateWidth?: (customWidth?: number) => void;
  onUpdateHeight?: (customHeight?: number) => void;
  onUpdateMetricCard?: (card: LibraryMetricCard) => void;
  onUpdateChart?: (chart: LibraryChartCard) => void;
  onOpenChartEditor?: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  paperTone: string;
  onSetPaperTone: (tone: string) => void;
  sectionTextColor?: string;
  onSetSectionTextColor?: (color: string | undefined) => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  showGuides: boolean;
  onToggleGuides: () => void;
  isPreview: boolean;
  onTogglePreview: () => void;
  showRulers?: boolean;
  onToggleRulers?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;

  // Printable page margins and corner radius
  marginConfig?: CanvasMarginConfig;
  onUpdateMarginConfig?: (config: Partial<CanvasMarginConfig>) => void;

  // Section Spacing & Appearance Management
  sectionStyle?: CanvasSectionStyle;
  onUpdateSectionStyle?: (style: Partial<CanvasSectionStyle>) => void;

  // Active Row & Row Styling Management
  activeRow?: CanvasRow | null;
  onUpdateRowStyle?: (rowId: string, style: Partial<CanvasRowStyle>) => void;
  onRemoveRow?: (rowId: string) => void;
  onTogglePageBreak?: (rowId: string) => void;

  // Font, Color & Background Management
  onUpdateCellStyle?: (style: Partial<CanvasCellStyle>) => void;

  // Watermark Management
  uploadedWatermarks?: UploadedSvgWatermark[];
  activeWatermarkId?: string | null;
  onSelectWatermark?: (watermarkId: string | null) => void;
  watermarkConfig?: WatermarkStampConfig;
  onUpdateWatermarkConfig?: (config: Partial<WatermarkStampConfig>) => void;
}

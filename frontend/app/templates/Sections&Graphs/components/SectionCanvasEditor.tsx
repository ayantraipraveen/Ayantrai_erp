"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  CanvasRow,
  CanvasCell,
  CanvasBadgeStrip,
  CanvasBadgeItem,
  LibraryMetricCard,
  LibraryChartCard,
  LibraryKeyInsightItem,
  PaletteRamp,
  GraphType,
  migrateToCanvasRows,
  addRowWithCell,
  addCellToRow,
  updateLibrarySection,
  updateMetricCardInCell,
  updateChartInCell,
  updateInsightInCell,
  updateTextBlockInCell,
  updateBadgeStripInCell,
  updateSingleBadgeInCell,
  addBadgeToStripInCell,
  deleteBadgeFromStripInCell,
  updateCellColSpan,
  updateCellHeight,
  updateCellStyleInCell,
  updateRowStyle,
  updateSectionStyle,
  removeCanvasRow,
  toggleRowPageBreak,
  setSectionWatermark,
  CanvasCellStyle,
  CanvasRowStyle,
  CanvasSectionStyle,
  duplicateCanvasCell,
  deleteCanvasCell,
  stackCellBelow,
  moveCellToStackBelow,
  unstackCellToRow,
  reorderStackedCells,
  showGlobalToast,
  setChartEditorFullscreen,
  setSectionCanvasRows,
  ChartDataPoint,
  ChartAxisConfig,
  ChartCustomizationOptions,
  ChartSeriesConfig,
  updateCoverPageData,
  updateTableOfContentsData,
  updateBackCoverData,
  addStampToSection,
  CanvasCoordinateStamp,
} from "@/lib/redux/slices/reportModuleSlice";
import { CanvasSidebar, SidebarAddBlockEvent, ReportOutlineItem } from "./CanvasSidebar";
import {
  getUploadedWatermarks,
  getSectionWatermarkConfig,
  saveSectionWatermarkConfig,
  UploadedSvgWatermark,
  WatermarkStampConfig,
  DEFAULT_WATERMARK_CONFIG,
} from "../watermark/utils";
import { CHART_TYPE_OPTIONS } from "./constants/chartTypes";
import { CanvasStudio } from "./CanvasStudio";
import { CanvasContextRibbon } from "./CanvasContextRibbon";
import { CanvasMarginConfig, DEFAULT_CANVAS_MARGIN } from "../utils";
import {
  getReportSectionGroups,
  reorderReportSectionGroups,
  calculateSectionGroupPageNumbers,
  partitionCanvasPages,
  ReportSectionGroup,
  AccurateReportSectionGroup,
} from "../utils/canvasLayoutUtils";
import ChartEditorPanel from "./ChartComponent/ChartEditorPanel";
import {
  EditSectionHeaderModal,
  MetricCardModal,
  KeyInsightModal,
  BadgeStripModal,
} from "./SectionCanvasModals";
import {
  CanvasCoverPage,
  CanvasTableOfContentsPage,
  CanvasBackCoverPage,
} from "./CanvasStudioComponent";
import { AlertCircle, ArrowLeft, Building, Check, Edit2, Eye, Redo2, Save, Undo2 } from "lucide-react";

export { PALETTE_RAMPS } from "./constants/chartTypes";

export interface TemplateHeaderProps {
  templateId: string;
  templateName: string;
  onTemplateNameChange: (name: string) => void;
  sites: { id: string; name: string }[];
  selectedSiteId: string;
  onSelectSiteId: (siteId: string) => void;
  onSaveDraft: () => void;
  onPublish: () => void;
}

interface SectionCanvasEditorProps {
  sectionId: string;
  onBack: () => void;
  showReportFrame?: boolean;
  templateHeaderProps?: TemplateHeaderProps;
}

export default function SectionCanvasEditor({
  sectionId,
  onBack,
  showReportFrame,
  templateHeaderProps,
}: SectionCanvasEditorProps) {
  const dispatch = useAppDispatch();
  const librarySections = useAppSelector((s) => s.reportModule.librarySections || []);
  const section = librarySections.find((s) => s.id === sectionId);
  const chartEditorFullscreen = useAppSelector((s) => s.reportModule.chartEditorFullscreen);

  // When true: displays Cover Page, Table of Contents, and Back Cover Page (Full Blueprint/Template Studio).
  // When false: hides Cover Page, Table of Contents, and Back Cover Page (Individual Section Studio).
  const isReportFrame =
    showReportFrame !== undefined
      ? showReportFrame
      : (sectionId.startsWith("tpl-canvas-") || sectionId.startsWith("tpl-"));

  // ── Document Watermark Studio State ─────────────────────────────────────────
  const [uploadedWatermarks, setUploadedWatermarks] = useState<UploadedSvgWatermark[]>([]);
  const [watermarkConfig, setWatermarkConfig] = useState<WatermarkStampConfig>(DEFAULT_WATERMARK_CONFIG);

  useEffect(() => {
    setUploadedWatermarks(getUploadedWatermarks());
    if (section) {
      setWatermarkConfig(getSectionWatermarkConfig(section.id, section.watermarkId));
    }
  }, [section?.id, section?.watermarkId]);


  // Auto-migrate legacy sections to canvas rows
  useEffect(() => {
    if (section && !section.canvasRows) {
      dispatch(migrateToCanvasRows(section.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section?.id]);

  // ── Studio Viewport & Artboard State ─────────────────────────────────────────
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [canvasActivePageIndex, setCanvasActivePageIndex] = useState<number>(0);
  const [paperTone, setPaperTone] = useState<string>("white");
  const [sectionTextColor, setSectionTextColor] = useState<string | undefined>(undefined);
  const [showGrid, setShowGrid] = useState(true);
  const [showGuides, setShowGuides] = useState(false);
  const [showRulers, setShowRulers] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isPreview, setIsPreview] = useState(false);
  const [marginConfig, setMarginConfig] = useState<CanvasMarginConfig>(DEFAULT_CANVAS_MARGIN);

  // ── Undo / Redo History Management (Ctrl+Z / Ctrl+Y) ───────────────────────
  const undoStackRef = useRef<CanvasRow[][]>([]);
  const redoStackRef = useRef<CanvasRow[][]>([]);
  const lastRecordedRowsRef = useRef<string>("");
  const isUndoRedoOperationRef = useRef<boolean>(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Track canvasRows changes and push snapshots onto undo stack
  useEffect(() => {
    if (!section?.canvasRows) return;
    const currentJson = JSON.stringify(section.canvasRows);
    
    // Skip if nothing changed
    if (currentJson === lastRecordedRowsRef.current) return;
    
    if (isUndoRedoOperationRef.current) {
      isUndoRedoOperationRef.current = false;
      lastRecordedRowsRef.current = currentJson;
      setCanUndo(undoStackRef.current.length > 0);
      setCanRedo(redoStackRef.current.length > 0);
      return;
    }

    // If we had a previous state recorded, push it to undo stack
    if (lastRecordedRowsRef.current) {
      try {
        const prevRows = JSON.parse(lastRecordedRowsRef.current);
        undoStackRef.current.push(prevRows);
        if (undoStackRef.current.length > 50) {
          undoStackRef.current.shift();
        }
        redoStackRef.current = [];
      } catch (err) {
        console.error("Error saving undo snapshot:", err);
      }
    }

    lastRecordedRowsRef.current = currentJson;
    setCanUndo(undoStackRef.current.length > 0);
    setCanRedo(false);
  }, [section?.canvasRows]);

  const handleUndo = useCallback(() => {
    if (undoStackRef.current.length === 0 || !section?.canvasRows) return;
    const prevRows = undoStackRef.current.pop()!;
    redoStackRef.current.push(JSON.parse(JSON.stringify(section.canvasRows)));
    isUndoRedoOperationRef.current = true;
    dispatch(setSectionCanvasRows({ sectionId, canvasRows: prevRows }));
    setCanUndo(undoStackRef.current.length > 0);
    setCanRedo(true);
    dispatch(showGlobalToast({ message: "Undo: Restored previous layout (Ctrl+Z)", type: "info" }));
  }, [dispatch, sectionId, section?.canvasRows]);

  const handleRedo = useCallback(() => {
    if (redoStackRef.current.length === 0 || !section?.canvasRows) return;
    const nextRows = redoStackRef.current.pop()!;
    undoStackRef.current.push(JSON.parse(JSON.stringify(section.canvasRows)));
    isUndoRedoOperationRef.current = true;
    dispatch(setSectionCanvasRows({ sectionId, canvasRows: nextRows }));
    setCanUndo(true);
    setCanRedo(redoStackRef.current.length > 0);
    dispatch(showGlobalToast({ message: "Redo: Reapplied layout (Ctrl+Y)", type: "info" }));
  }, [dispatch, sectionId, section?.canvasRows]);

  // Derive active selected cell
  
  // Extract charts added to this section
  const sectionCharts = useMemo(() => {
    if (!section?.canvasRows) return [];
    const list: LibraryChartCard[] = [];
    const seenIds = new Set<string>();
    for (const r of section.canvasRows) {
      for (const c of r.cells) {
        if (c.blockType === "chart" && c.chart && !seenIds.has(c.chart.id)) {
          seenIds.add(c.chart.id);
          list.push(c.chart);
        }
      }
    }
    return list;
  }, [section?.canvasRows]);

  // Extract charts across all library sections
  const allLibraryCharts = useMemo(() => {
    const list: LibraryChartCard[] = [];
    const seenIds = new Set<string>();
    librarySections.forEach((s) => {
      s.canvasRows?.forEach((r) => {
        r.cells.forEach((c) => {
          if (c.blockType === "chart" && c.chart && !seenIds.has(c.chart.id)) {
            seenIds.add(c.chart.id);
            list.push(c.chart);
          }
        });
      });
      s.charts?.forEach((c) => {
        if (!seenIds.has(c.id)) {
          seenIds.add(c.id);
          list.push(c);
        }
      });
    });
    return list;
  }, [librarySections]);

  const activeCell = useMemo(() => {
    if (!selectedCellId || !section?.canvasRows) return null;
    for (const r of section.canvasRows) {
      for (const cell of r.cells) {
        if (cell.id === selectedCellId) return cell;
        if (cell.stackedCells && cell.stackedCells.length > 0) {
          const sc = cell.stackedCells.find((s) => s.id === selectedCellId);
          if (sc) {
            const w = sc.customWidth ?? 100;
            return {
              ...sc,
              customWidth: w,
              colSpan: (w <= 30 ? 1 : w <= 55 ? 2 : w <= 80 ? 3 : 4) as 1 | 2 | 3 | 4,
            };
          }
        }
      }
    }
    return null;
  }, [selectedCellId, section?.canvasRows]);

  const activeRow = useMemo(() => {
    if (!selectedRowId || !section?.canvasRows) return null;
    return section.canvasRows.find((r) => r.id === selectedRowId) || null;
  }, [selectedRowId, section?.canvasRows]);

  // Report Sections Outline & Sidebar Jump Navigator
  const [activeReportSectionKey, setActiveReportSectionKey] = useState<string>("cover");

  // Base starting page number for body pages: Cover = 1, TOC = 2 => Body = 3 (or 1 for standalone section)
  const bodyStartPageNumber = isReportFrame ? 3 : 1;

  const sectionGroups = useMemo<ReportSectionGroup[]>(() => {
    return getReportSectionGroups(section?.canvasRows || [], section?.name || "Statutory Compliance & Audit");
  }, [section?.canvasRows, section?.name]);

  // Reactive canvas partitions used across page headers, outline, and TOC
  const partitionedCanvasPages = useMemo(() => {
    return partitionCanvasPages(section?.canvasRows || [], marginConfig, bodyStartPageNumber);
  }, [section?.canvasRows, marginConfig, bodyStartPageNumber]);

  // Section groups with accurately calculated start/end page numbers
  const accurateSectionGroups = useMemo<AccurateReportSectionGroup[]>(() => {
    return calculateSectionGroupPageNumbers(sectionGroups, partitionedCanvasPages);
  }, [sectionGroups, partitionedCanvasPages]);

  // Total pages across the complete report blueprint
  const totalReportPages = useMemo(() => {
    if (!isReportFrame) return partitionedCanvasPages.length;
    const lastBodyPageNum =
      partitionedCanvasPages.length > 0
        ? partitionedCanvasPages[partitionedCanvasPages.length - 1].pageNumber
        : 2;
    return lastBodyPageNum + 1; // + 1 for Back Cover
  }, [isReportFrame, partitionedCanvasPages]);

  const computedReportSections = useMemo<ReportOutlineItem[]>(() => {
    const list: ReportOutlineItem[] = [];

    if (isReportFrame) {
      list.push({
        id: "outline-cover",
        key: "cover",
        title: "Cover Page",
        subtitle: section?.coverPageData?.reportType || "Monthly Report",
        type: "cover",
        pageNumber: 1,
      });
      list.push({
        id: "outline-toc",
        key: "toc",
        title: "Table of Contents",
        subtitle: "Executive Summary & Section Index",
        type: "toc",
        pageNumber: 2,
      });
    }

    // Dynamic Body Sections with live auto-calculated page numbers
    accurateSectionGroups.forEach((g) => {
      const widgetCount = g.rows.reduce((sum, r) => sum + r.cells.length, 0);
      list.push({
        id: g.id,
        key: g.key,
        title: g.name,
        subtitle: `${g.rows.length} ${g.rows.length === 1 ? "row" : "rows"} • ${widgetCount} widgets`,
        type: "section",
        pageNumber: g.pageRangeStr,
        rowsCount: g.rows.length,
      });
    });

    if (isReportFrame) {
      const lastBodyPageNum =
        partitionedCanvasPages.length > 0
          ? partitionedCanvasPages[partitionedCanvasPages.length - 1].pageNumber
          : 2;
      const backCoverPageNum = lastBodyPageNum + 1;
      list.push({
        id: "outline-back-cover",
        key: "back-cover",
        title: "Back Cover Page",
        subtitle: "Document Closure & Sign-off",
        type: "back-cover",
        pageNumber: backCoverPageNum,
      });
    }

    return list;
  }, [isReportFrame, section?.coverPageData, accurateSectionGroups, partitionedCanvasPages]);

  const handleSelectReportSection = useCallback((key: string) => {
    setActiveReportSectionKey(key);
    let targetEl: HTMLElement | null = null;
    if (key === "cover") {
      targetEl = document.getElementById("canvas-cover-page");
    } else if (key === "toc") {
      targetEl = document.getElementById("canvas-toc-page");
    } else if (key === "back-cover") {
      targetEl = document.getElementById("canvas-back-cover-page");
    } else if (key.startsWith("section-")) {
      const rowId = key.replace("section-", "");
      targetEl = document.getElementById(`row-${rowId}`) || document.getElementById(key);
    }

    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
      targetEl.classList.add("ring-4", "ring-[#9D61FF]/40", "ring-offset-2");
      setTimeout(() => {
        targetEl?.classList.remove("ring-4", "ring-[#9D61FF]/40", "ring-offset-2");
      }, 2000);
    }
  }, []);

  /**
   * Inserts an entire section (composed of N CanvasRows) immediately after the currently viewed section.
   * If insertAtIndex is explicitly given (e.g. from drag & drop), it honors that index.
   */
  const handleAddSectionRows = useCallback(
    (rowsToAdd: CanvasRow[], sectionName: string, insertAtIndex?: number) => {
      if (!section) return;
      const currentRows = section.canvasRows || [];
      const groups = getReportSectionGroups(currentRows, section.name);

      let targetInsertIndex = currentRows.length; // fallback: end of rows

      if (typeof insertAtIndex === "number") {
        targetInsertIndex = Math.max(0, Math.min(currentRows.length, insertAtIndex));
      } else {
        // Find which section group the user is currently viewing
        let activeGroupIdx = -1;

        // 1. If a row or cell is actively selected:
        if (selectedRowId) {
          activeGroupIdx = groups.findIndex((g) => g.rows.some((r) => r.id === selectedRowId));
        }

        // 2. Check which section group element is currently visible in viewport view center
        if (activeGroupIdx === -1 && groups.length > 0 && typeof window !== "undefined") {
          const midY = window.innerHeight * 0.45;
          for (let gIdx = 0; gIdx < groups.length; gIdx++) {
            const rowId = groups[gIdx].rows[0]?.id;
            const el = document.getElementById(`row-${rowId}`);
            if (el) {
              const rect = el.getBoundingClientRect();
              if (rect.top <= midY && rect.bottom >= 80) {
                activeGroupIdx = gIdx;
                break;
              }
            }
          }
        }

        // 3. If canvas active page index is set:
        if (activeGroupIdx === -1 && typeof canvasActivePageIndex === "number" && groups.length > 0) {
          activeGroupIdx = Math.min(groups.length - 1, Math.max(0, canvasActivePageIndex));
        }

        // 4. If a report section is selected in the outline:
        if (activeGroupIdx === -1 && activeReportSectionKey) {
          if (activeReportSectionKey.startsWith("section-")) {
            const targetRowId = activeReportSectionKey.replace("section-", "");
            activeGroupIdx = groups.findIndex(
              (g) => g.key === activeReportSectionKey || g.rows.some((r) => r.id === targetRowId)
            );
          } else if (activeReportSectionKey === "cover" || activeReportSectionKey === "toc") {
            activeGroupIdx = groups.length > 0 ? 0 : -1;
          } else if (activeReportSectionKey === "back-cover") {
            activeGroupIdx = groups.length - 1;
          }
        }

        // Insert immediately after the found section group
        if (activeGroupIdx >= 0 && activeGroupIdx < groups.length) {
          targetInsertIndex = groups[activeGroupIdx].endRowIndex + 1;
        }
      }

      const ts = Date.now();
      const clonedRows: CanvasRow[] = rowsToAdd.map((r, rIdx) => ({
        ...r,
        id: `row-${ts}-${rIdx}-${Math.random().toString(36).substr(2, 4)}`,
        sectionName,
        pageBreakBefore: rIdx === 0, // Fresh page break for the start of the inserted section
        cells: r.cells?.map((c, cIdx) => ({
          ...c,
          id: `cell-${ts}-${rIdx}-${cIdx}-${Math.random().toString(36).substr(2, 4)}`,
        })) || [],
      }));

      const nextRows = [
        ...currentRows.slice(0, targetInsertIndex),
        ...clonedRows,
        ...currentRows.slice(targetInsertIndex),
      ];

      // If inserted before an existing section, ensure the subsequent section retains its page break
      if (targetInsertIndex < currentRows.length && nextRows[targetInsertIndex + clonedRows.length]) {
        nextRows[targetInsertIndex + clonedRows.length] = {
          ...nextRows[targetInsertIndex + clonedRows.length],
          pageBreakBefore: true,
        };
      }

      dispatch(setSectionCanvasRows({ sectionId, canvasRows: nextRows }));
      dispatch(
        showGlobalToast({
          message: `Inserted "${sectionName}" after current section!`,
          type: "success",
        })
      );

      // Auto-scroll to the new section and highlight
      const firstNewRowId = clonedRows[0]?.id;
      if (firstNewRowId) {
        setActiveReportSectionKey(`section-${firstNewRowId}`);
        setTimeout(() => {
          const rowEl = document.getElementById(`row-${firstNewRowId}`);
          if (rowEl) {
            rowEl.scrollIntoView({ behavior: "smooth", block: "start" });
            rowEl.classList.add("ring-4", "ring-[#9D61FF]/40", "ring-offset-2");
            setTimeout(() => {
              rowEl?.classList.remove("ring-4", "ring-[#9D61FF]/40", "ring-offset-2");
            }, 2500);
          }
        }, 150);
      }
    },
    [dispatch, section, sectionId, selectedRowId, activeReportSectionKey, canvasActivePageIndex]
  );

  /**
   * Reorders entire section groups (by moving all rows belonging to a group)
   */
  const handleReorderReportSections = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (!section) return;
      const currentRows = section.canvasRows || [];
      const nextRows = reorderReportSectionGroups(currentRows, fromIndex, toIndex, section.name);
      dispatch(setSectionCanvasRows({ sectionId, canvasRows: nextRows }));

      const newGroups = getReportSectionGroups(nextRows, section.name);
      const movedGroup = newGroups[toIndex];
      dispatch(
        showGlobalToast({
          message: `Moved "${movedGroup?.name || "Section"}" to position ${toIndex + 1}!`,
          type: "success",
        })
      );

      if (movedGroup?.rows[0]?.id) {
        setActiveReportSectionKey(movedGroup.key);
        setTimeout(() => {
          const targetEl = document.getElementById(`row-${movedGroup.rows[0].id}`);
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
            targetEl.classList.add("ring-4", "ring-[#9D61FF]/40", "ring-offset-2");
            setTimeout(() => {
              targetEl?.classList.remove("ring-4", "ring-[#9D61FF]/40", "ring-offset-2");
            }, 2000);
          }
        }, 100);
      }
    },
    [dispatch, section, sectionId]
  );

  // Sync marginConfig from persistent sectionStyle when section loads
  useEffect(() => {
    if (section?.sectionStyle) {
      setMarginConfig({
        top: section.sectionStyle.marginTop ?? section.sectionStyle.margin ?? DEFAULT_CANVAS_MARGIN.top,
        bottom: section.sectionStyle.marginBottom ?? section.sectionStyle.margin ?? DEFAULT_CANVAS_MARGIN.bottom,
        left: section.sectionStyle.marginLeft ?? section.sectionStyle.margin ?? DEFAULT_CANVAS_MARGIN.left,
        right: section.sectionStyle.marginRight ?? section.sectionStyle.margin ?? DEFAULT_CANVAS_MARGIN.right,
        radius:
          typeof section.sectionStyle.borderRadius === "number"
            ? section.sectionStyle.borderRadius
            : DEFAULT_CANVAS_MARGIN.radius,
      });
    }
  }, [section?.id]);

  // ── Modals State ────────────────────────────────────────────────────────────
  const [editHeaderOpen, setEditHeaderOpen] = useState(false);
  const [editName, setEditName] = useState(section?.name || "");
  const [editEyebrow, setEditEyebrow] = useState(section?.eyebrow || "");
  const [editDesc, setEditDesc] = useState(section?.description || "");

  const handleSaveHeader = () => {
    if (!editName.trim()) return;
    dispatch(
      updateLibrarySection({
        id: sectionId,
        name: editName.trim(),
        eyebrow: editEyebrow.trim(),
        description: editDesc.trim(),
      })
    );
    setEditHeaderOpen(false);
    dispatch(showGlobalToast({ message: "Section header updated.", type: "success" }));
  };

  // Metric Card Modal
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<LibraryMetricCard | null>(null);
  const [editingCellMeta, setEditingCellMeta] = useState<{ cell: CanvasCell; rowId: string } | null>(null);
  const [cardLabel, setCardLabel] = useState("");
  const [cardValue, setCardValue] = useState("");
  const [cardTint, setCardTint] = useState<PaletteRamp>("blue");
  const [cardTrendDir, setCardTrendDir] = useState<"up" | "down" | "no-change">("up");
  const [cardTrendVal, setCardTrendVal] = useState("+2.4% vs last cycle");

  const handleSaveCard = () => {
    if (!cardLabel.trim() || !cardValue.trim() || !editingCellMeta || !editingCard) return;
    dispatch(
      updateMetricCardInCell({
        sectionId,
        rowId: editingCellMeta.rowId,
        cellId: editingCellMeta.cell.id,
        card: {
          ...editingCard,
          label: cardLabel.trim(),
          value: cardValue.trim(),
          tintColor: cardTint,
          trendDirection: cardTrendDir,
          trendValue: cardTrendVal.trim(),
        },
      })
    );
    dispatch(showGlobalToast({ message: "Metric card updated!", type: "success" }));
    setCardModalOpen(false);
    setEditingCellMeta(null);
  };

  // Chart Modal
  const [chartModalOpen, setChartModalOpen] = useState(false);
  const [editingChart, setEditingChart] = useState<LibraryChartCard | null>(null);
  const [editingChartCellMeta, setEditingChartCellMeta] = useState<{ cell: CanvasCell; rowId: string } | null>(null);
  const [chartTitle, setChartTitle] = useState("");
  const [chartType, setChartType] = useState<GraphType>("bar");
  const [chartDataSource, setChartDataSource] = useState("ppe_sensor_compliance");
  const [chartDesc, setChartDesc] = useState("");
  const [chartColor, setChartColor] = useState("#9D61FF");
  const [chartColors, setChartColors] = useState<string[]>([]);
  const [gridRows, setGridRows] = useState(4);
  const [gridCols, setGridCols] = useState(7);
  const [chartDataPoints, setChartDataPoints] = useState<ChartDataPoint[]>([]);
  const [chartXAxis, setChartXAxis] = useState<ChartAxisConfig>({});
  const [chartYAxis, setChartYAxis] = useState<ChartAxisConfig>({});
  const [chartSeries, setChartSeries] = useState<ChartSeriesConfig[]>([]);
  const [chartOptions, setChartOptions] = useState<ChartCustomizationOptions>({
    showValues: true,
    showGridLines: true,
    showLegend: true,
  });

  const handleCloseChartEditor = () => {
    const targetCellId = editingChartCellMeta?.cell?.id;
    setChartModalOpen(false);
    setEditingChartCellMeta(null);
    dispatch(setChartEditorFullscreen(false));

    // Clear URL search params and session storage
    if (typeof window !== "undefined") {
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete("editChartCell");
        url.searchParams.delete("editChartRow");
        window.history.replaceState({}, "", url.toString());
        sessionStorage.removeItem("ayantrai_active_chart_cell");
      } catch (err) {
        console.warn("Could not clear chart edit URL params:", err);
      }
    }

    if (targetCellId) {
      setTimeout(() => {
        const cellEl = document.getElementById(`canvas-cell-${targetCellId}`);
        if (cellEl) {
          cellEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }, 100);
    }
  };

  const handleSaveChart = () => {
    if (!editingChartCellMeta || !editingChart) return;
    const finalColors = chartColors && chartColors.length > 0 ? chartColors : [chartColor];
    dispatch(
      updateChartInCell({
        sectionId,
        rowId: editingChartCellMeta.rowId,
        cellId: editingChartCellMeta.cell.id,
        chart: {
          ...editingChart,
          title: chartTitle.trim(),
          chartType,
          dataSourceField: chartDataSource,
          description: chartDesc.trim(),
          color: chartColor,
          colors: finalColors,
          gridRows: chartType === "heatmap" || chartType === "table" ? gridRows : undefined,
          gridCols: chartType === "heatmap" || chartType === "table" ? gridCols : undefined,
          dataPoints: chartDataPoints && chartDataPoints.length > 0 ? chartDataPoints : undefined,
          xAxis: Object.keys(chartXAxis).length > 0 ? chartXAxis : undefined,
          yAxis: Object.keys(chartYAxis).length > 0 ? chartYAxis : undefined,
          series: chartSeries && chartSeries.length > 0 ? chartSeries : undefined,
          options: chartOptions,
        },
      })
    );
    dispatch(showGlobalToast({ message: "Chart updated!", type: "success" }));
    handleCloseChartEditor();
  };

  // Badge Strip Modal
  const [badgeStripModalOpen, setBadgeStripModalOpen] = useState(false);
  const [editingBadgeStrip, setEditingBadgeStrip] = useState<CanvasBadgeStrip | null>(null);
  const [editingBadgeStripCellMeta, setEditingBadgeStripCellMeta] = useState<{ cell: CanvasCell; rowId: string } | null>(null);

  const handleSaveBadgeStrip = (updatedStrip: CanvasBadgeStrip) => {
    if (!editingBadgeStripCellMeta) return;
    dispatch(
      updateBadgeStripInCell({
        sectionId,
        rowId: editingBadgeStripCellMeta.rowId,
        cellId: editingBadgeStripCellMeta.cell.id,
        badgeStrip: updatedStrip,
      })
    );
    dispatch(showGlobalToast({ message: "Badge strip updated!", type: "success" }));
    setBadgeStripModalOpen(false);
    setEditingBadgeStripCellMeta(null);
  };

  // Insight Modal
  const [insightModalOpen, setInsightModalOpen] = useState(false);
  const [editingInsight, setEditingInsight] = useState<LibraryKeyInsightItem | null>(null);
  const [editingInsightCellMeta, setEditingInsightCellMeta] = useState<{ cell: CanvasCell; rowId: string } | null>(null);
  const [insightText, setInsightText] = useState("");

  const handleSaveInsight = () => {
    if (!insightText.trim() || !editingInsightCellMeta) return;
    const { cell, rowId } = editingInsightCellMeta;
    if (cell.blockType === "insight" && editingInsight) {
      dispatch(
        updateInsightInCell({
          sectionId,
          rowId,
          cellId: cell.id,
          insight: { ...editingInsight, text: insightText.trim() },
        })
      );
      dispatch(showGlobalToast({ message: "Insight updated!", type: "success" }));
    }
    setInsightModalOpen(false);
    setEditingInsightCellMeta(null);
  };

  // ── Block Creation (Sidebar Click/Drop) ──────────────────────────────────────
  const handleSidebarAddBlock = useCallback(
    (e: SidebarAddBlockEvent) => {
      if (!section) return;

      if (e.blockType === "section") {
        const rowsToInsert = e.sectionRows && e.sectionRows.length > 0 ? e.sectionRows : [];
        handleAddSectionRows(rowsToInsert, e.sectionName || "New Section", e.insertRowAtIndex);
        return;
      }

      const ts = Date.now();
      let cell: CanvasCell | null = null;
      switch (e.blockType) {
        case "metric-card":
          cell = {
            id: `cell-mc-${ts}`,
            colSpan: 1,
            blockType: "metric-card",
            metricCard: {
              id: `mc-${ts}`,
              label: "New KPI Indicator",
              value: "96.5%",
              tintColor: "blue",
              trendDirection: "up",
              trendValue: "+1.8% vs last shift",
            },
          };
          break;
        case "chart":
          if (e.customChart) {
            cell = {
              id: `cell-ch-${ts}`,
              colSpan: 4,
              blockType: "chart",
              chart: {
                ...e.customChart,
                id: `ch-${ts}`,
                title: `${e.customChart.title} (Copy)`,
              },
            };
          } else {
            const selectedChartType = e.chartType || "bar";
            const chartOption = CHART_TYPE_OPTIONS.find((c) => c.id === selectedChartType);
            cell = {
              id: `cell-ch-${ts}`,
              colSpan: 4,
              blockType: "chart",
              chart: {
                id: `ch-${ts}`,
                title: `Telemetry ${chartOption?.label || "Chart"}`,
                chartType: selectedChartType,
                dataSourceField: "ppe_sensor_compliance",
                description: "",
                color: "#9D61FF",
                gridRows: (selectedChartType === "heatmap" || selectedChartType === "table") ? 4 : undefined,
                gridCols: (selectedChartType === "heatmap" || selectedChartType === "table") ? 7 : undefined,
              },
            };
          }
          break;
        case "insight":
          cell = {
            id: `cell-ki-${ts}`,
            colSpan: 4,
            blockType: "insight",
            insight: e.customInsight
              ? {
                  ...e.customInsight,
                  id: `ki-${ts}`,
                  items: e.customInsight.items
                    ? e.customInsight.items.map((item, idx) => ({ ...item, id: `kib-${ts}-${idx}` }))
                    : undefined,
                }
              : {
                  id: `ki-${ts}`,
                  variant: "single",
                  text: "Key operational observation recorded during routine industrial monitoring.",
                },
          };
          break;
        case "text":
          cell = {
            id: `cell-tb-${ts}`,
            colSpan: 4,
            blockType: "text",
            textBlock: { id: `tb-${ts}`, content: "" },
          };
          break;
        case "badge-strip":
          cell = {
            id: `cell-bs-${ts}`,
            colSpan: 4,
            blockType: "badge-strip",
            badgeStrip: {
              id: `bs-${ts}`,
              badges: [
                { id: `b1-${ts}`, label: "Attendance", value: "98.7%", color: "blue", icon: "Users" },
                { id: `b2-${ts}`, label: "PPE Compliance", value: "96.2%", color: "green", icon: "Shield" },
                { id: `b3-${ts}`, label: "Response", value: "< 4 min", color: "purple", icon: "Clock" },
                { id: `b4-${ts}`, label: "Risk-Free", value: "14,280", color: "amber", icon: "Zap" },
              ],
            },
          };
          break;
        case "divider":
          cell = { id: `cell-div-${ts}`, colSpan: 4, blockType: "divider" };
          break;
        case "element":
          if (e.elementBlock) {
            cell = {
              id: `cell-el-${ts}`,
              colSpan: 4,
              blockType: "element",
              elementBlock: { ...e.elementBlock, isWatermark: false },
            };
          }
          break;
      }

      if (cell !== null) {
        if (e.targetStackCellId && e.targetRowId) {
          dispatch(
            stackCellBelow({
              sectionId: section.id,
              rowId: e.targetRowId,
              targetCellId: e.targetStackCellId,
              cell,
            })
          );
          dispatch(
            showGlobalToast({
              message: `${e.blockType.replace("-", " ")} stacked directly below card!`,
              type: "success",
            })
          );
        } else if (e.targetRowId) {
          dispatch(
            addCellToRow({
              sectionId: section.id,
              rowId: e.targetRowId,
              cell,
              insertAtIndex: e.targetCellIndex,
            })
          );
          dispatch(
            showGlobalToast({
              message: `${e.blockType.replace("-", " ")} added to row!`,
              type: "success",
            })
          );
        } else if (typeof e.insertRowAtIndex === "number") {
          dispatch(
            addRowWithCell({
              sectionId: section.id,
              cell,
              insertAtIndex: e.insertRowAtIndex,
            })
          );
          dispatch(
            showGlobalToast({
              message: `${e.blockType.replace("-", " ")} inserted at position ${e.insertRowAtIndex + 1}!`,
              type: "success",
            })
          );
        } else {
          // If a row is currently selected and has room (< 4 cells), add directly into that row
          if (selectedRowId) {
            const activeRow = section.canvasRows?.find((r) => r.id === selectedRowId);
            if (activeRow && activeRow.cells.length < 4) {
              dispatch(
                addCellToRow({
                  sectionId: section.id,
                  rowId: selectedRowId,
                  cell,
                })
              );
              dispatch(
                showGlobalToast({
                  message: `${e.blockType.replace("-", " ")} added to selected row!`,
                  type: "success",
                })
              );
              return;
            }
          }
          dispatch(addRowWithCell({ sectionId: section.id, cell }));
          dispatch(
            showGlobalToast({
              message: `${e.blockType.replace("-", " ")} added to canvas!`,
              type: "success",
            })
          );
        }
      }
    },
    [dispatch, section]
  );

  const handleAddWatermarkElement = useCallback(
    (watermarkId: string) => {
      const watermark = uploadedWatermarks.find((item) => item.id === watermarkId);
      if (!watermark) return;

      const targetPage = canvasActivePageIndex >= 0 ? canvasActivePageIndex : 0;
      const newStamp: CanvasCoordinateStamp = {
        id: `stamp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        sourceId: watermark.id,
        name: watermark.name,
        svgContent: watermark.svgContent,
        pageIndex: targetPage,
        x: 215, // center on 595px page
        y: 340, // center on 842px page
        width: 160,
        height: 160,
        rotation: 0,
        opacity: 100,
        layer: "front",
      };

      dispatch(addStampToSection({ sectionId, stamp: newStamp }));
      dispatch(
        showGlobalToast({
          message: `Added "${watermark.name}" stamp to page ${targetPage + 1}! Drag, resize or rotate it freely.`,
          type: "success",
        })
      );
    },
    [dispatch, sectionId, uploadedWatermarks, canvasActivePageIndex]
  );

  // ── Cell Edit Trigger ───────────────────────────────────────────────────────
  const handleEditCell = useCallback(
    (cell: CanvasCell, rowId: string) => {
      switch (cell.blockType) {
        case "metric-card":
          if (cell.metricCard) {
            setEditingCard(cell.metricCard);
            setEditingCellMeta({ cell, rowId });
            setCardLabel(cell.metricCard.label);
            setCardValue(cell.metricCard.value);
            setCardTint(cell.metricCard.tintColor);
            setCardTrendDir(cell.metricCard.trendDirection);
            setCardTrendVal(cell.metricCard.trendValue);
            setCardModalOpen(true);
          }
          break;
        case "chart":
          if (cell.chart) {
            setSelectedCellId(cell.id);
            setSelectedRowId(rowId);
            setEditingChart(cell.chart);
            setEditingChartCellMeta({ cell, rowId });
            setChartTitle(cell.chart.title);
            setChartType(cell.chart.chartType);
            setChartDataSource(cell.chart.dataSourceField);
            setChartDesc(cell.chart.description || "");
            setChartColor(cell.chart.color || "#9D61FF");
            setChartColors(cell.chart.colors || []);
            setGridRows(cell.chart.gridRows || 4);
            setGridCols(cell.chart.gridCols || 7);
            setChartDataPoints(cell.chart.dataPoints || []);
            setChartXAxis(cell.chart.xAxis || {});
            setChartYAxis(cell.chart.yAxis || {});
            setChartSeries(cell.chart.series || []);
            setChartOptions(cell.chart.options || { showValues: true, showGridLines: true, showLegend: true });
            setChartModalOpen(true);
            dispatch(setChartEditorFullscreen(true));

            // Synchronize with URL search params and session storage for persistent reload support
            if (typeof window !== "undefined") {
              try {
                const url = new URL(window.location.href);
                url.searchParams.set("editChartCell", cell.id);
                url.searchParams.set("editChartRow", rowId);
                window.history.replaceState({}, "", url.toString());
                sessionStorage.setItem("ayantrai_active_chart_cell", JSON.stringify({ sectionId, cellId: cell.id, rowId }));
              } catch (err) {
                console.warn("Could not sync chart edit URL params:", err);
              }
            }
          }
          break;
        case "insight":
          if (cell.insight) {
            setEditingInsight(cell.insight);
            setEditingInsightCellMeta({ cell, rowId });
            setInsightText(cell.insight.text);
            setInsightModalOpen(true);
          }
          break;
        case "text":
          // Handled directly via inline editing on the canvas with Word-style toolbar
          break;
        case "badge-strip":
          if (cell.badgeStrip) {
            setEditingBadgeStrip(cell.badgeStrip);
            setEditingBadgeStripCellMeta({ cell, rowId });
            setBadgeStripModalOpen(true);
          }
          break;
        default:
          break;
      }
    },
    [dispatch, sectionId]
  );

  // Auto-restore active chart editor on browser refresh (F5) if editChartCell query param or session is present
  const hasRestoredChartRef = useRef(false);
  useEffect(() => {
    if (hasRestoredChartRef.current || !section?.canvasRows) return;
    if (typeof window === "undefined") return;

    try {
      const params = new URLSearchParams(window.location.search);
      let targetCellId = params.get("editChartCell");
      let targetRowId = params.get("editChartRow");

      if (!targetCellId) {
        const rawSession = sessionStorage.getItem("ayantrai_active_chart_cell");
        if (rawSession) {
          const parsed = JSON.parse(rawSession);
          if (parsed.sectionId === sectionId && parsed.cellId) {
            targetCellId = parsed.cellId;
            targetRowId = parsed.rowId;
          }
        }
      }

      if (targetCellId) {
        let foundCell: CanvasCell | null = null;
        let foundRowId: string | null = targetRowId || null;

        for (const r of section.canvasRows) {
          for (const c of r.cells) {
            if (c.id === targetCellId && c.blockType === "chart" && c.chart) {
              foundCell = c;
              foundRowId = r.id;
              break;
            }
            if (c.stackedCells && c.stackedCells.length > 0) {
              for (const sc of c.stackedCells) {
                if (sc.id === targetCellId && sc.blockType === "chart" && sc.chart) {
                  foundCell = sc;
                  foundRowId = r.id;
                  break;
                }
              }
            }
            if (foundCell) break;
          }
          if (foundCell) break;
        }

        if (foundCell && foundCell.chart && foundRowId) {
          hasRestoredChartRef.current = true;
          handleEditCell(foundCell, foundRowId);
        }
      }
    } catch (err) {
      console.warn("Could not restore chart editor on refresh:", err);
    }
  }, [section?.id, section?.canvasRows, handleEditCell, sectionId]);

  // Sync section to localStorage whenever canvasRows change so refreshes never lose work
  useEffect(() => {
    if (section && section.canvasRows && typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("ayantrai_library_sections");
        if (stored) {
          const list = JSON.parse(stored);
          if (Array.isArray(list)) {
            const idx = list.findIndex((s: any) => s.id === section.id);
            if (idx !== -1) {
              list[idx] = section;
              localStorage.setItem("ayantrai_library_sections", JSON.stringify(list));
            } else {
              list.push(section);
              localStorage.setItem("ayantrai_library_sections", JSON.stringify(list));
            }
          }
        }
      } catch (err) {
        console.warn("Could not sync section to localStorage:", err);
      }
    }
  }, [section]);

  // ── Inline Cell Updates (Live on Canvas & from Ribbon) ──────────────────────

  const handleUpdateMetricCardInCell = useCallback(
    (rowId: string, cellId: string, card: LibraryMetricCard) => {
      dispatch(updateMetricCardInCell({ sectionId, rowId, cellId, card }));
    },
    [dispatch, sectionId]
  );

  const handleUpdateInsightInCell = useCallback(
    (rowId: string, cellId: string, textOrInsight: string | LibraryKeyInsightItem) => {
      if (!section?.canvasRows) return;
      const row = section.canvasRows.find((r) => r.id === rowId);
      const cell = row?.cells.find((c) => c.id === cellId);
      if (cell && cell.insight) {
        const nextInsight =
          typeof textOrInsight === "string"
            ? { ...cell.insight, text: textOrInsight }
            : { ...cell.insight, ...textOrInsight };
        dispatch(updateInsightInCell({ sectionId, rowId, cellId, insight: nextInsight }));
      }
    },
    [dispatch, sectionId, section?.canvasRows]
  );

  const handleUpdateBadgeStripInCell = useCallback(
    (rowId: string, cellId: string, strip: CanvasBadgeStrip) => {
      dispatch(updateBadgeStripInCell({ sectionId, rowId, cellId, badgeStrip: strip }));
    },
    [dispatch, sectionId]
  );

  const handleUpdateSingleBadgeInCell = useCallback(
    (rowId: string, cellId: string, badgeId: string, patch: Partial<CanvasBadgeItem>) => {
      dispatch(updateSingleBadgeInCell({ sectionId, rowId, cellId, badgeId, badge: patch }));
    },
    [dispatch, sectionId]
  );

  const handleAddBadgeToStripInCell = useCallback(
    (rowId: string, cellId: string) => {
      dispatch(addBadgeToStripInCell({ sectionId, rowId, cellId }));
      dispatch(showGlobalToast({ message: "New badge added to strip!", type: "success" }));
    },
    [dispatch, sectionId]
  );

  const handleDeleteBadgeFromStripInCell = useCallback(
    (rowId: string, cellId: string, badgeId: string) => {
      dispatch(deleteBadgeFromStripInCell({ sectionId, rowId, cellId, badgeId }));
      dispatch(showGlobalToast({ message: "Badge removed from strip", type: "info" }));
    },
    [dispatch, sectionId]
  );

  const handleUpdateTextBlockInCell = useCallback(
    (rowId: string, cellId: string, content: string) => {
      dispatch(updateTextBlockInCell({ sectionId, rowId, cellId, content }));
    },
    [dispatch, sectionId]
  );

  const handleUpdateChartInCell = useCallback(
    (chart: LibraryChartCard) => {
      if (!selectedRowId || !selectedCellId) return;
      dispatch(updateChartInCell({ sectionId, rowId: selectedRowId, cellId: selectedCellId, chart }));
    },
    [dispatch, sectionId, selectedRowId, selectedCellId]
  );

    const handleUpdateCellStyle = useCallback(
    (style: Partial<CanvasCellStyle>) => {
      if (!selectedRowId || !selectedCellId) return;
      dispatch(updateCellStyleInCell({ sectionId, rowId: selectedRowId, cellId: selectedCellId, style }));
    },
    [dispatch, sectionId, selectedRowId, selectedCellId]
  );

  const handleSelectWatermark = useCallback(
    (watermarkId: string | null) => {
      const updated = { ...watermarkConfig, watermarkId };
      setWatermarkConfig(updated);
      saveSectionWatermarkConfig(sectionId, updated);
      dispatch(setSectionWatermark({ sectionId, watermarkId }));
      dispatch(
        showGlobalToast({
          message: watermarkId ? "Corporate watermark stamp applied to section" : "Watermark removed",
          type: "success",
        })
      );
    },
    [dispatch, sectionId, watermarkConfig]
  );

  const handleUpdateWatermarkConfig = useCallback(
    (patch: Partial<WatermarkStampConfig>) => {
      const updated = { ...watermarkConfig, ...patch };
      setWatermarkConfig(updated);
      saveSectionWatermarkConfig(sectionId, updated);
    },
    [sectionId, watermarkConfig]
  );

  const handleUpdateColSpan = useCallback(
    (colSpan: 1 | 2 | 3 | 4) => {
      if (!selectedRowId || !selectedCellId) return;
      dispatch(updateCellColSpan({ sectionId, rowId: selectedRowId, cellId: selectedCellId, colSpan }));
    },
    [dispatch, sectionId, selectedRowId, selectedCellId]
  );

  const handleUpdateWidth = useCallback(
    (customWidth?: number) => {
      if (!selectedRowId || !selectedCellId) return;
      if (customWidth === undefined) {
        // Reset to balanced auto colSpan
        dispatch(updateCellColSpan({ sectionId, rowId: selectedRowId, cellId: selectedCellId, colSpan: 2, customWidth: undefined }));
      } else {
        const colSpan = (customWidth <= 30 ? 1 : customWidth <= 55 ? 2 : customWidth <= 80 ? 3 : 4) as 1 | 2 | 3 | 4;
        dispatch(updateCellColSpan({ sectionId, rowId: selectedRowId, cellId: selectedCellId, colSpan, customWidth }));
      }
    },
    [dispatch, sectionId, selectedRowId, selectedCellId]
  );

  const handleUpdateHeight = useCallback(
    (customHeight?: number) => {
      if (!selectedRowId || !selectedCellId) return;
      dispatch(updateCellHeight({ sectionId, rowId: selectedRowId, cellId: selectedCellId, customHeight }));
    },
    [dispatch, sectionId, selectedRowId, selectedCellId]
  );

  const handleCellHeightChange = useCallback(
    (cellId: string, rowId: string, customHeight?: number) => {
      dispatch(updateCellHeight({ sectionId, rowId, cellId, customHeight }));
    },
    [dispatch, sectionId]
  );

  const handleUpdateMarginConfig = useCallback(
    (patch: Partial<CanvasMarginConfig>) => {
      setMarginConfig((current) => ({ ...current, ...patch }));
      if (section?.id) {
        const next = { ...marginConfig, ...patch };
        dispatch(
          updateSectionStyle({
            sectionId: section.id,
            style: {
              marginTop: next.top,
              marginRight: next.right,
              marginBottom: next.bottom,
              marginLeft: next.left,
              margin:
                next.top === next.bottom && next.top === next.left && next.top === next.right
                  ? next.top
                  : undefined,
              borderRadius: next.radius,
            },
          })
        );
      }
    },
    [dispatch, section?.id, marginConfig]
  );

  const handleUpdateSectionStyle = useCallback(
    (patch: Partial<CanvasSectionStyle>) => {
      if (!section?.id) return;
      dispatch(updateSectionStyle({ sectionId: section.id, style: patch }));
      if (
        patch.marginTop !== undefined ||
        patch.marginRight !== undefined ||
        patch.marginBottom !== undefined ||
        patch.marginLeft !== undefined ||
        patch.borderRadius !== undefined
      ) {
        setMarginConfig((curr) => ({
          ...curr,
          top: patch.marginTop ?? patch.margin ?? curr.top,
          right: patch.marginRight ?? patch.margin ?? curr.right,
          bottom: patch.marginBottom ?? patch.margin ?? curr.bottom,
          left: patch.marginLeft ?? patch.margin ?? curr.left,
          radius: typeof patch.borderRadius === "number" ? patch.borderRadius : curr.radius,
        }));
      }
    },
    [dispatch, section?.id]
  );

  const handleUpdateRowStyle = useCallback(
    (rowId: string, patch: Partial<CanvasRowStyle>) => {
      if (!section?.id) return;
      dispatch(updateRowStyle({ sectionId: section.id, rowId, style: patch }));
    },
    [dispatch, section?.id]
  );

  const handleRemoveRow = useCallback(
    (rowId: string) => {
      if (!section?.id) return;
      dispatch(removeCanvasRow({ sectionId: section.id, rowId }));
      if (selectedRowId === rowId) {
        setSelectedRowId(null);
        setSelectedCellId(null);
      }
      dispatch(showGlobalToast({ message: "Row deleted", type: "info" }));
    },
    [dispatch, section?.id, selectedRowId]
  );

  const handleTogglePageBreak = useCallback(
    (rowId: string) => {
      if (!section?.id) return;
      dispatch(toggleRowPageBreak({ sectionId: section.id, rowId }));
      dispatch(showGlobalToast({ message: "Row page break updated", type: "info" }));
    },
    [dispatch, section?.id]
  );

  const handleDuplicateActive = useCallback(() => {
    if (!selectedRowId || !selectedCellId) return;
    dispatch(duplicateCanvasCell({ sectionId, rowId: selectedRowId, cellId: selectedCellId }));
    dispatch(showGlobalToast({ message: "Block duplicated!", type: "success" }));
  }, [dispatch, sectionId, selectedRowId, selectedCellId]);

  const handleDeleteActive = useCallback(() => {
    if (!selectedRowId || !selectedCellId) return;
    dispatch(deleteCanvasCell({ sectionId, rowId: selectedRowId, cellId: selectedCellId }));
    setSelectedCellId(null);
    setSelectedRowId(null);
    dispatch(showGlobalToast({ message: "Block removed.", type: "info" }));
  }, [dispatch, sectionId, selectedRowId, selectedCellId]);

  const handleMoveCellToStackBelow = useCallback(
    (sourceCellId: string, targetCellId: string, rowId: string) => {
      dispatch(moveCellToStackBelow({ sectionId, rowId, sourceCellId, targetCellId }));
      dispatch(showGlobalToast({ message: "Stacked card directly underneath!", type: "success" }));
    },
    [dispatch, sectionId]
  );

  const handleStackCellBelow = useCallback(
    (rowId: string, targetCellId: string, cell: CanvasCell) => {
      dispatch(stackCellBelow({ sectionId, rowId, targetCellId, cell }));
      dispatch(showGlobalToast({ message: "Card stacked below!", type: "success" }));
    },
    [dispatch, sectionId]
  );

  const handleUnstackCell = useCallback(
    (rowId: string, cellId: string) => {
      dispatch(unstackCellToRow({ sectionId, rowId, cellId }));
      dispatch(showGlobalToast({ message: "Unstacked card back to row", type: "info" }));
    },
    [dispatch, sectionId]
  );

  const handleReorderStacked = useCallback(
    (rowId: string, parentCellId: string, direction: "up" | "down", index: number) => {
      dispatch(reorderStackedCells({ sectionId, rowId, parentCellId, direction, stackedCellIndex: index }));
    },
    [dispatch, sectionId]
  );

  // ── Keyboard Shortcuts (Canva Feel) ─────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (chartModalOpen) return;
      const activeTag = document.activeElement?.tagName.toLowerCase();
      const isInput = activeTag === "input" || activeTag === "textarea" || activeTag === "select";

      // Escape key exits preview or clears selection
      if (e.key === "Escape") {
        if (isPreview) {
          setIsPreview(false);
        } else {
          setSelectedCellId(null);
          setSelectedRowId(null);
        }
        return;
      }

      if (isInput) return; // don't intercept typing

      // Undo: Ctrl+Z or Cmd+Z (without Shift)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }

      // Redo: Ctrl+Y, Cmd+Y, or Ctrl+Shift+Z, Cmd+Shift+Z
      if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "z")
      ) {
        e.preventDefault();
        handleRedo();
        return;
      }

      // Delete or Backspace removes active cell
      if ((e.key === "Delete" || e.key === "Backspace") && selectedCellId && selectedRowId) {
        e.preventDefault();
        handleDeleteActive();
        return;
      }

      // Ctrl+D duplicates active cell
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d" && selectedCellId && selectedRowId) {
        e.preventDefault();
        handleDuplicateActive();
        return;
      }

      // Shift+R toggles canvas dimension rulers
      if (e.shiftKey && e.key.toLowerCase() === "r" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setShowRulers((prev) => !prev);
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPreview, selectedCellId, selectedRowId, handleDeleteActive, handleDuplicateActive, handleUndo, handleRedo]);

  if (!section) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-3">
        <AlertCircle className="w-10 h-10 text-rose-500" />
        <h3 className="text-base font-bold text-slate-800 dark:text-zinc-200">Section Not Found</h3>
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold cursor-pointer"
        >
          Return to Sections
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden animate-fadeIn bg-white dark:bg-[#07090d] relative">
      {/* Fullscreen Telemetry Studio Overlay (keeps CanvasStudio mounted so page and scroll position are preserved) */}
      {chartModalOpen && chartEditorFullscreen && editingChart && editingChartCellMeta && (
        <div data-chart-editor-open="true" className="fixed inset-0 z-[100000] flex flex-col bg-white dark:bg-[#07090d] animate-fadeIn">
          <ChartEditorPanel
            editingChart={editingChart}
            chartTitle={chartTitle}
            setChartTitle={setChartTitle}
            chartType={chartType}
            setChartType={setChartType}
            chartDesc={chartDesc}
            setChartDesc={setChartDesc}
            chartColor={chartColor}
            setChartColor={setChartColor}
            chartColors={chartColors}
            setChartColors={setChartColors}
            gridRows={gridRows}
            setGridRows={setGridRows}
            gridCols={gridCols}
            setGridCols={setGridCols}
            chartDataPoints={chartDataPoints}
            setChartDataPoints={setChartDataPoints}
            chartXAxis={chartXAxis}
            setChartXAxis={setChartXAxis}
            chartYAxis={chartYAxis}
            setChartYAxis={setChartYAxis}
            chartOptions={chartOptions}
            setChartOptions={setChartOptions}
            chartSeries={chartSeries}
            setChartSeries={setChartSeries}
            onSave={handleSaveChart}
            onClose={handleCloseChartEditor}
          />
        </div>
      )}

      {/* ── Global Canva Studio Header (Unified Single Row in Template Mode, Standard Header in Section Mode) ── */}
      {templateHeaderProps ? (
        <div className="flex-shrink-0 flex items-center justify-between gap-3 px-4 sm:px-6 py-2 border-b border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-[#0b0e14]/95 backdrop-blur-md z-30">
          {/* Left: Back to Templates, Blueprint ID, Template Name, Stats */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <button
              type="button"
              onClick={onBack}
              className="h-8 px-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs flex-shrink-0"
              title="Back to Templates"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Templates</span>
            </button>

            <div className="h-4 w-px bg-slate-200 dark:bg-zinc-800 hidden sm:block flex-shrink-0" />

            <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-[#9D61FF] border border-purple-500/20 flex-shrink-0">
              {templateHeaderProps.templateId}
            </span>

            {/* Inline Editable Template Title */}
            <div className="flex items-center gap-1.5 min-w-0 flex-1 max-w-md group">
              <input
                type="text"
                value={templateHeaderProps.templateName}
                onChange={(e) => {
                  templateHeaderProps.onTemplateNameChange(e.target.value);
                  dispatch(updateLibrarySection({ id: section.id, name: e.target.value }));
                }}
                placeholder="Enter Template Blueprint Name..."
                className="bg-transparent font-bold text-sm text-slate-900 dark:text-white border-b border-transparent hover:border-slate-300 dark:hover:border-zinc-700 focus:border-[#9D61FF] focus:outline-none px-1 py-0.5 truncate w-full transition-all"
                title="Click to rename template"
              />
              <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </div>

            <span className="text-[10.5px] text-slate-400 dark:text-zinc-500 hidden xl:inline flex-shrink-0">
              {section.canvasRows?.length || 0} rows &middot;{" "}
              {section.canvasRows?.reduce(
                (acc, r) => acc + r.cells.reduce((cAcc, c) => cAcc + 1 + (c.stackedCells?.length || 0), 0),
                0
              ) || 0}{" "}
              blocks
            </span>
          </div>

          {/* Right: Undo/Redo, Preview, Site Selector, Save Draft, Publish */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Undo / Redo Toolbar Buttons */}
            <div className="flex items-center gap-0.5 border-r border-slate-200 dark:border-zinc-800 pr-2 mr-0.5">
              <button
                type="button"
                onClick={handleUndo}
                disabled={!canUndo}
                className={`h-8 w-8 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                  canUndo
                    ? "border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 shadow-xs"
                    : "border-slate-100 dark:border-zinc-800/40 text-slate-300 dark:text-zinc-700 cursor-not-allowed opacity-40"
                }`}
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleRedo}
                disabled={!canRedo}
                className={`h-8 w-8 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                  canRedo
                    ? "border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 shadow-xs"
                    : "border-slate-100 dark:border-zinc-800/40 text-slate-300 dark:text-zinc-700 cursor-not-allowed opacity-40"
                }`}
                title="Redo (Ctrl+Y or Ctrl+Shift+Z)"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Clean Preview Toggle */}
            <button
              type="button"
              onClick={() => setIsPreview(!isPreview)}
              className={`h-8 px-2.5 sm:px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isPreview
                  ? "bg-[#9D61FF] text-white border-transparent shadow-sm"
                  : "border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200"
              }`}
              title="Toggle Clean Preview Mode"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isPreview ? "Exit Preview" : "Preview"}</span>
            </button>

            {/* Target Industrial Site Selector */}
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-100/80 dark:bg-zinc-900/80 rounded-xl px-2.5 py-1 border border-slate-200 dark:border-zinc-800 text-xs">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={templateHeaderProps.selectedSiteId}
                onChange={(e) => templateHeaderProps.onSelectSiteId(e.target.value)}
                className="bg-transparent text-slate-800 dark:text-zinc-200 outline-none text-xs font-medium cursor-pointer"
              >
                {templateHeaderProps.sites.map((s) => (
                  <option key={s.id} value={s.id} className="dark:bg-zinc-900 text-slate-900 dark:text-white">
                    {s.name} ({s.id})
                  </option>
                ))}
              </select>
            </div>

            {/* Save Draft */}
            <button
              type="button"
              onClick={templateHeaderProps.onSaveDraft}
              className="h-8 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline">Save Draft</span>
            </button>

            {/* Publish Blueprint */}
            <button
              type="button"
              onClick={templateHeaderProps.onPublish}
              className="h-8 px-3.5 rounded-xl bg-gradient-to-r from-[#9D61FF] to-[#8035ea] hover:from-[#9254f8] hover:to-[#7227dc] text-white text-xs font-bold flex items-center gap-1.5 shadow-[0_2px_12px_rgba(157,97,255,0.35)] hover:shadow-[0_4px_20px_rgba(157,97,255,0.5)] transition-all active:scale-[0.98] cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Publish Blueprint</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-shrink-0 flex items-center justify-between gap-3 flex-wrap px-4 sm:px-6 py-2 border-b border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-[#0b0e14]/95 backdrop-blur-md z-30">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="h-8 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Sections</span>
            </button>

            <div className="h-4 w-[1px] bg-slate-200 dark:bg-zinc-800 hidden sm:block" />

            {/* Section Eyebrow & Title */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase font-bold text-[#9D61FF] bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                {section.eyebrow}
              </span>
              <h1 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>{section.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    setEditName(section.name);
                    setEditEyebrow(section.eyebrow);
                    setEditDesc(section.description);
                    setEditHeaderOpen(true);
                  }}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  title="Edit Section Title"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </h1>
            </div>
          </div>

          {/* Global Actions */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 dark:text-zinc-500 hidden md:block">
              {section.canvasRows?.length || 0} rows &middot;{" "}
              {section.canvasRows?.reduce(
                (acc, r) => acc + r.cells.reduce((cAcc, c) => cAcc + 1 + (c.stackedCells?.length || 0), 0),
                0
              ) || 0}{" "}
              blocks
            </span>

            {/* Undo / Redo Toolbar Buttons */}
            <div className="flex items-center gap-0.5 border-r border-slate-200 dark:border-zinc-800 pr-2 mr-1">
              <button
                type="button"
                onClick={handleUndo}
                disabled={!canUndo}
                className={`h-8 w-8 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                  canUndo
                    ? "border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 shadow-xs"
                    : "border-slate-100 dark:border-zinc-800/40 text-slate-300 dark:text-zinc-700 cursor-not-allowed opacity-40"
                }`}
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleRedo}
                disabled={!canRedo}
                className={`h-8 w-8 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                  canRedo
                    ? "border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 shadow-xs"
                    : "border-slate-100 dark:border-zinc-800/40 text-slate-300 dark:text-zinc-700 cursor-not-allowed opacity-40"
                }`}
                title="Redo (Ctrl+Y or Ctrl+Shift+Z)"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Clean Preview Toggle */}
            <button
              type="button"
              onClick={() => setIsPreview(!isPreview)}
              className={`h-8 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isPreview
                  ? "bg-[#9D61FF] text-white border-transparent shadow-sm"
                  : "border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200"
              }`}
              title="Toggle Clean Preview Mode"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isPreview ? "Exit Preview" : "Preview"}</span>
            </button>

            {/* Save to Library */}
            <button
              type="button"
              onClick={() => {
                dispatch(showGlobalToast({ message: "Section saved to Library!", type: "success" }));
                onBack();
              }}
              className="h-8 px-4 rounded-xl glow-btn-primary text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm text-white"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save to Library</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Canva Adaptive Contextual Properties Ribbon ── */}
      <CanvasContextRibbon
        selectedCell={chartModalOpen ? null : activeCell}
        selectedRowId={chartModalOpen ? null : selectedRowId}
        sectionName={section.name}
        sectionEyebrow={section.eyebrow}
        onUpdateColSpan={handleUpdateColSpan}
        onUpdateWidth={handleUpdateWidth}
        onUpdateMetricCard={(card) => {
          if (selectedRowId && selectedCellId) {
            handleUpdateMetricCardInCell(selectedRowId, selectedCellId, card);
          }
        }}
        onUpdateChart={handleUpdateChartInCell}
        onOpenChartEditor={() => {
          if (activeCell?.chart && selectedRowId) {
            handleEditCell(activeCell, selectedRowId);
          }
        }}
        onUpdateHeight={handleUpdateHeight}
        onDuplicate={handleDuplicateActive}
        onDelete={handleDeleteActive}
        paperTone={paperTone}
        onSetPaperTone={setPaperTone}
        marginConfig={marginConfig}
        onUpdateMarginConfig={handleUpdateMarginConfig}
        sectionTextColor={sectionTextColor}
        onSetSectionTextColor={setSectionTextColor}
        sectionStyle={section?.sectionStyle}
        onUpdateSectionStyle={handleUpdateSectionStyle}
        activeRow={activeRow}
        onUpdateRowStyle={handleUpdateRowStyle}
        onRemoveRow={handleRemoveRow}
        onTogglePageBreak={handleTogglePageBreak}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid(!showGrid)}
        showGuides={showGuides}
        onToggleGuides={() => setShowGuides(!showGuides)}
        showRulers={showRulers}
        onToggleRulers={() => setShowRulers(!showRulers)}
        isPreview={isPreview}
        onTogglePreview={() => setIsPreview(!isPreview)}
        onUpdateCellStyle={handleUpdateCellStyle}
        uploadedWatermarks={uploadedWatermarks}
        activeWatermarkId={watermarkConfig.watermarkId}
        onSelectWatermark={handleSelectWatermark}
        watermarkConfig={watermarkConfig}
        onUpdateWatermarkConfig={handleUpdateWatermarkConfig}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      {/* ── Main Studio Workspace ── */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Left Sidebar Asset Dock (Hidden in Preview) */}
        {!isPreview && (
          <CanvasSidebar
            onAddBlock={handleSidebarAddBlock}
            sectionCharts={sectionCharts}
            allLibraryCharts={allLibraryCharts}
            uploadedWatermarks={uploadedWatermarks}
            activeWatermarkId={watermarkConfig.watermarkId}
            onSelectWatermark={handleSelectWatermark}
            onAddWatermarkElement={handleAddWatermarkElement}
            watermarkConfig={watermarkConfig}
            reportSections={isReportFrame ? computedReportSections : undefined}
            activeReportSectionKey={activeReportSectionKey}
            onSelectReportSection={handleSelectReportSection}
            onAddSectionRows={handleAddSectionRows}
            onReorderReportSections={handleReorderReportSections}
            showReportSections={isReportFrame}
          />
        )}

        {/* Canva Central Desk with Floating Artboard */}
        <CanvasStudio
          section={section}
          selectedCellId={chartModalOpen ? null : selectedCellId}
          selectedRowId={chartModalOpen ? null : selectedRowId}
          onSelectCell={(cellId, rowId) => {
            setSelectedCellId(cellId);
            setSelectedRowId(rowId);
          }}
          onEditCell={handleEditCell}
          onUpdateMetricCardInCell={handleUpdateMetricCardInCell}
          onUpdateChartInCell={(rowId, cellId, chart) =>
            dispatch(updateChartInCell({ sectionId, rowId, cellId, chart }))
          }
          onUpdateInsightInCell={handleUpdateInsightInCell}
          onUpdateTextBlockInCell={handleUpdateTextBlockInCell}
          onUpdateBadgeStripInCell={handleUpdateBadgeStripInCell}
          onUpdateSingleBadgeInCell={handleUpdateSingleBadgeInCell}
          onAddBadgeToStripInCell={handleAddBadgeToStripInCell}
          onDeleteBadgeFromStripInCell={handleDeleteBadgeFromStripInCell}
          onHeightChange={handleCellHeightChange}
          onUpdateRowStyle={handleUpdateRowStyle}
          onUpdateSectionStyle={handleUpdateSectionStyle}
          paperTone={paperTone}
          marginConfig={marginConfig}
          pageNumber={bodyStartPageNumber}
          totalReportPages={totalReportPages}
          sectionTextColor={sectionTextColor}
          showGrid={showGrid}
          onToggleGrid={() => setShowGrid(!showGrid)}
          showGuides={showGuides}
          onToggleGuides={() => setShowGuides(!showGuides)}
          showRulers={showRulers}
          onToggleRulers={() => setShowRulers(!showRulers)}
          zoom={zoom}
          setZoom={setZoom}
          isPreview={isPreview}
          onTogglePreview={() => setIsPreview(!isPreview)}
          activeWatermark={uploadedWatermarks.find((w) => w.id === watermarkConfig.watermarkId) || null}
          watermarkConfig={watermarkConfig}
          onUpdateWatermarkConfig={handleUpdateWatermarkConfig}
          onSelectWatermark={handleSelectWatermark}
          onDropBlock={handleSidebarAddBlock}
          onMoveCellToStackBelow={handleMoveCellToStackBelow}
          onStackCellBelow={handleStackCellBelow}
          onUnstackCell={handleUnstackCell}
          onReorderStacked={handleReorderStacked}
          activeViewPageIndex={canvasActivePageIndex}
          onViewPageIndexChange={setCanvasActivePageIndex}
          onEditHeader={() => {
            setEditName(section.name);
            setEditEyebrow(section.eyebrow);
            setEditDesc(section.description);
            setEditHeaderOpen(true);
          }}
          beforeContent={
            isReportFrame ? (
              <div className="space-y-6">
                <div id="canvas-cover-page" className="transition-all duration-300 rounded-2xl">
                  <CanvasCoverPage
                    coverPageData={section?.coverPageData}
                    activeIsPreview={isPreview}
                    onUpdate={(data) => dispatch(updateCoverPageData({ sectionId, data }))}
                  />
                </div>
                <div id="canvas-toc-page" className="transition-all duration-300 rounded-2xl">
                  <CanvasTableOfContentsPage
                    tocData={section?.tableOfContentsData}
                    sectionGroups={accurateSectionGroups}
                    activeIsPreview={isPreview}
                    onUpdate={(data) => dispatch(updateTableOfContentsData({ sectionId, data }))}
                  />
                </div>
              </div>
            ) : undefined
          }
          afterContent={
            isReportFrame ? (
              <div id="canvas-back-cover-page" className="transition-all duration-300 rounded-2xl">
                <CanvasBackCoverPage
                  backCoverData={section?.backCoverData}
                  activeIsPreview={isPreview}
                  onUpdate={(data) => dispatch(updateBackCoverData({ sectionId, data }))}
                />
              </div>
            ) : undefined
          }
        />
      </div>


      {/* ── Dialog Modals (Secondary Deep Configuration) ── */}

      <EditSectionHeaderModal
        isOpen={editHeaderOpen}
        onClose={() => setEditHeaderOpen(false)}
        name={editName}
        setName={setEditName}
        eyebrow={editEyebrow}
        setEyebrow={setEditEyebrow}
        description={editDesc}
        setDescription={setEditDesc}
        onSave={handleSaveHeader}
      />

      <MetricCardModal
        isOpen={cardModalOpen}
        onClose={() => {
          setCardModalOpen(false);
          setEditingCellMeta(null);
        }}
        editingCard={editingCard}
        label={cardLabel}
        setLabel={setCardLabel}
        value={cardValue}
        setValue={setCardValue}
        tint={cardTint}
        setTint={setCardTint}
        trendDir={cardTrendDir}
        setTrendDir={setCardTrendDir}
        trendVal={cardTrendVal}
        setTrendVal={setCardTrendVal}
        onSave={handleSaveCard}
      />

      <KeyInsightModal
        isOpen={insightModalOpen}
        onClose={() => {
          setInsightModalOpen(false);
          setEditingInsightCellMeta(null);
        }}
        editingInsight={editingInsight}
        text={insightText}
        setText={setInsightText}
        onSave={handleSaveInsight}
      />

      <BadgeStripModal
        isOpen={badgeStripModalOpen}
        onClose={() => {
          setBadgeStripModalOpen(false);
          setEditingBadgeStripCellMeta(null);
        }}
        badgeStrip={editingBadgeStrip}
        onSave={handleSaveBadgeStrip}
      />
    </div>
  );
}

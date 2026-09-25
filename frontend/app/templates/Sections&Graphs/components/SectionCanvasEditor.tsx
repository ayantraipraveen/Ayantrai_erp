"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ArrowLeft,
  Save,
  AlertCircle,
  Edit2,
  Eye,
  Sliders,
  Sparkles,
  Download,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  CanvasCell,
  LibraryMetricCard,
  LibraryChartCard,
  LibraryKeyInsightItem,
  PaletteRamp,
  GraphType,
  migrateToCanvasRows,
  addRowWithCell,
  updateLibrarySection,
  updateMetricCardInCell,
  updateChartInCell,
  updateInsightInCell,
  updateTextBlockInCell,
  updateCellColSpan,
  updateCellStyleInCell,
  setSectionWatermark,
  CanvasCellStyle,
  duplicateCanvasCell,
  deleteCanvasCell,
  showGlobalToast,
  setChartEditorFullscreen,
} from "@/lib/redux/slices/reportModuleSlice";
import { CanvasSidebar, SidebarAddBlockEvent } from "./CanvasSidebar";
import {
  getUploadedWatermarks,
  getSectionWatermarkConfig,
  saveSectionWatermarkConfig,
  UploadedSvgWatermark,
  WatermarkStampConfig,
  DEFAULT_WATERMARK_CONFIG,
} from "./watermarkStorage";
import { CHART_TYPE_OPTIONS } from "./constants/chartTypes";
import { CanvasStudio } from "./CanvasStudio";
import { CanvasContextRibbon } from "./CanvasContextRibbon";
import ChartEditorPanel from "./ChartEditorPanel";
import {
  EditSectionHeaderModal,
  MetricCardModal,
  KeyInsightModal,
} from "./SectionCanvasModals";

export { PALETTE_RAMPS } from "./constants/chartTypes";

interface SectionCanvasEditorProps {
  sectionId: string;
  onBack: () => void;
}

export default function SectionCanvasEditor({
  sectionId,
  onBack,
}: SectionCanvasEditorProps) {
  const dispatch = useAppDispatch();
  const librarySections = useAppSelector((s) => s.reportModule.librarySections || []);
  const section = librarySections.find((s) => s.id === sectionId);
  const chartEditorFullscreen = useAppSelector((s) => s.reportModule.chartEditorFullscreen);

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
  const [paperTone, setPaperTone] = useState<string>("white");
  const [sectionTextColor, setSectionTextColor] = useState<string | undefined>(undefined);
  const [showGrid, setShowGrid] = useState(true);
  const [showGuides, setShowGuides] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isPreview, setIsPreview] = useState(false);

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
      const c = r.cells.find((cell) => cell.id === selectedCellId);
      if (c) return c;
    }
    return null;
  }, [selectedCellId, section?.canvasRows]);

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

  const handleCloseChartEditor = () => {
    setChartModalOpen(false);
    setEditingChartCellMeta(null);
    dispatch(setChartEditorFullscreen(false));
  };

  const handleSaveChart = () => {
    if (!chartTitle.trim() || !editingChartCellMeta || !editingChart) return;
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
        },
      })
    );
    dispatch(showGlobalToast({ message: "Chart updated!", type: "success" }));
    handleCloseChartEditor();
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
            insight: {
              id: `ki-${ts}`,
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
      }

      if (cell !== null) {
        dispatch(addRowWithCell({ sectionId: section.id, cell }));
        dispatch(showGlobalToast({ message: `${e.blockType.replace("-", " ")} added to canvas!`, type: "success" }));
      }
    },
    [dispatch, section]
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
            setChartModalOpen(true);
            dispatch(setChartEditorFullscreen(true));
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
          if (cell.textBlock) {
            setEditingInsight(null);
            setEditingInsightCellMeta({ cell, rowId });
            setInsightText(cell.textBlock.content);
            setInsightModalOpen(true);
          }
          break;
        default:
          break;
      }
    },
    [dispatch]
  );

  // ── Inline Cell Updates (Live on Canvas & from Ribbon) ──────────────────────
  const handleUpdateMetricCardInCell = useCallback(
    (rowId: string, cellId: string, card: LibraryMetricCard) => {
      dispatch(updateMetricCardInCell({ sectionId, rowId, cellId, card }));
    },
    [dispatch, sectionId]
  );

  const handleUpdateInsightInCell = useCallback(
    (rowId: string, cellId: string, text: string) => {
      if (!section?.canvasRows) return;
      const row = section.canvasRows.find((r) => r.id === rowId);
      const cell = row?.cells.find((c) => c.id === cellId);
      if (cell && cell.insight) {
        dispatch(updateInsightInCell({ sectionId, rowId, cellId, insight: { ...cell.insight, text } }));
      }
    },
    [dispatch, sectionId, section?.canvasRows]
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
    (customWidth: number) => {
      if (!selectedRowId || !selectedCellId) return;
      const colSpan = (customWidth <= 30 ? 1 : customWidth <= 55 ? 2 : customWidth <= 80 ? 3 : 4) as 1 | 2 | 3 | 4;
      dispatch(updateCellColSpan({ sectionId, rowId: selectedRowId, cellId: selectedCellId, colSpan, customWidth }));
    },
    [dispatch, sectionId, selectedRowId, selectedCellId]
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

  // ── Keyboard Shortcuts (Canva Feel) ─────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPreview, selectedCellId, selectedRowId, handleDeleteActive, handleDuplicateActive]);

  // Fullscreen Telemetry Studio Guard
  if (chartModalOpen && chartEditorFullscreen && editingChart && editingChartCellMeta) {
    return (
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
        onSave={handleSaveChart}
        onClose={handleCloseChartEditor}
      />
    );
  }

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
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden animate-fadeIn bg-white dark:bg-[#07090d]">
      {/* ── Global Canva Studio Header ── */}
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
            {section.canvasRows?.reduce((acc, r) => acc + r.cells.length, 0) || 0} blocks
          </span>

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

      {/* ── Canva Adaptive Contextual Properties Ribbon ── */}
      <CanvasContextRibbon
        selectedCell={activeCell}
        selectedRowId={selectedRowId}
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
        onDuplicate={handleDuplicateActive}
        onDelete={handleDeleteActive}
        paperTone={paperTone}
        onSetPaperTone={setPaperTone}
        sectionTextColor={sectionTextColor}
        onSetSectionTextColor={setSectionTextColor}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid(!showGrid)}
        showGuides={showGuides}
        onToggleGuides={() => setShowGuides(!showGuides)}
        isPreview={isPreview}
        onTogglePreview={() => setIsPreview(!isPreview)}
        onUpdateCellStyle={handleUpdateCellStyle}
        uploadedWatermarks={uploadedWatermarks}
        activeWatermarkId={watermarkConfig.watermarkId}
        onSelectWatermark={handleSelectWatermark}
        watermarkConfig={watermarkConfig}
        onUpdateWatermarkConfig={handleUpdateWatermarkConfig}
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
          />
        )}

        {/* Canva Central Desk with Floating Artboard */}
        <CanvasStudio
          section={section}
          selectedCellId={selectedCellId}
          selectedRowId={selectedRowId}
          onSelectCell={(cellId, rowId) => {
            setSelectedCellId(cellId);
            setSelectedRowId(rowId);
          }}
          onEditCell={handleEditCell}
          onUpdateMetricCardInCell={handleUpdateMetricCardInCell}
          onUpdateInsightInCell={handleUpdateInsightInCell}
          onUpdateTextBlockInCell={handleUpdateTextBlockInCell}
          paperTone={paperTone}
          sectionTextColor={sectionTextColor}
          showGrid={showGrid}
          onToggleGrid={() => setShowGrid(!showGrid)}
          showGuides={showGuides}
          onToggleGuides={() => setShowGuides(!showGuides)}
          zoom={zoom}
          setZoom={setZoom}
          isPreview={isPreview}
          onTogglePreview={() => setIsPreview(!isPreview)}
          activeWatermark={uploadedWatermarks.find((w) => w.id === watermarkConfig.watermarkId) || null}
          watermarkConfig={watermarkConfig}
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
    </div>
  );
}

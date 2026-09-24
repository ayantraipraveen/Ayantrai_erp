"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  BarChart2,
  Save,
  Lightbulb,
  AlertCircle,
  Activity,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  LibraryMetricCard,
  LibraryChartCard,
  LibraryKeyInsightItem,
  PaletteRamp,
  updateLibrarySection,
  addCardToSection,
  updateCardInSection,
  deleteCardFromSection,
  reorderCardsInSection,
  addChartToSection,
  updateChartInSection,
  deleteChartFromSection,
  reorderChartsInSection,
  addInsightToSection,
  updateInsightInSection,
  deleteInsightFromSection,
  reorderInsightsInSection,
  showGlobalToast,
  GraphType,
  setChartEditorFullscreen,
} from "@/lib/redux/slices/reportModuleSlice";
import { PALETTE_RAMPS } from "./constants/chartTypes";
import ChartRenderer from "./ChartRenderer";
import ChartEditorPanel from "./ChartEditorPanel";
import {
  EditSectionHeaderModal,
  MetricCardModal,
  KeyInsightModal,
} from "./SectionCanvasModals";

// Re-export PALETTE_RAMPS for backward compatibility
export { PALETTE_RAMPS } from "./constants/chartTypes";

interface SectionCanvasEditorProps {
  sectionId: string;
  onBack: () => void;
}

/**
 * Dedicated Visual Canva-Style Report Studio for Section & Graph Management.
 * Simulates real A4 report rendering matching Dummy_report.pdf.
 */
export default function SectionCanvasEditor({ sectionId, onBack }: SectionCanvasEditorProps) {
  const dispatch = useAppDispatch();
  const librarySections = useAppSelector((state) => state.reportModule.librarySections || []);
  const section = librarySections.find((s) => s.id === sectionId);

  // Edit Section Header Modal State
  const [editHeaderOpen, setEditHeaderOpen] = useState(false);
  const [editName, setEditName] = useState(section?.name || "");
  const [editEyebrow, setEditEyebrow] = useState(section?.eyebrow || "");
  const [editDesc, setEditDesc] = useState(section?.description || "");

  // Metric Card Modal State
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<LibraryMetricCard | null>(null);
  const [cardLabel, setCardLabel] = useState("");
  const [cardValue, setCardValue] = useState("");
  const [cardTint, setCardTint] = useState<PaletteRamp>("blue");
  const [cardTrendDir, setCardTrendDir] = useState<"up" | "down" | "no-change">("up");
  const [cardTrendVal, setCardTrendVal] = useState("+2.4% vs last cycle");

  // Chart Modal / Editor State
  const [chartModalOpen, setChartModalOpen] = useState(false);
  const [editingChart, setEditingChart] = useState<LibraryChartCard | null>(null);
  const [chartTitle, setChartTitle] = useState("");
  const [chartType, setChartType] = useState<GraphType>("bar");
  const [chartDataSource, setChartDataSource] = useState("ppe_sensor_compliance");
  const [chartDesc, setChartDesc] = useState("");
  const [chartColor, setChartColor] = useState("#9D61FF");
  const [chartColors, setChartColors] = useState<string[]>([]);
  const [gridRows, setGridRows] = useState(4);
  const [gridCols, setGridCols] = useState(7);

  // Key Insight Modal State
  const [insightModalOpen, setInsightModalOpen] = useState(false);
  const [editingInsight, setEditingInsight] = useState<LibraryKeyInsightItem | null>(null);
  const [insightText, setInsightText] = useState("");

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

  // --- Handlers: Section Header ---
  const handleSaveHeader = () => {
    if (!editName.trim()) return;
    dispatch(
      updateLibrarySection({
        id: section.id,
        name: editName.trim(),
        eyebrow: editEyebrow.trim(),
        description: editDesc.trim(),
      })
    );
    setEditHeaderOpen(false);
    dispatch(showGlobalToast({ message: "Section title updated.", type: "success" }));
  };

  // --- Handlers: Metric Cards ---
  const handleOpenAddCard = () => {
    setEditingCard(null);
    setCardLabel("");
    setCardValue("");
    setCardTint("blue");
    setCardTrendDir("up");
    setCardTrendVal("+2.4% vs last cycle");
    setCardModalOpen(true);
  };

  const handleOpenEditCard = (card: LibraryMetricCard) => {
    setEditingCard(card);
    setCardLabel(card.label);
    setCardValue(card.value);
    setCardTint(card.tintColor);
    setCardTrendDir(card.trendDirection);
    setCardTrendVal(card.trendValue);
    setCardModalOpen(true);
  };

  const handleSaveCard = () => {
    if (!cardLabel.trim() || !cardValue.trim()) return;

    if (editingCard) {
      dispatch(
        updateCardInSection({
          sectionId: section.id,
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
    } else {
      dispatch(
        addCardToSection({
          sectionId: section.id,
          card: {
            label: cardLabel.trim(),
            value: cardValue.trim(),
            tintColor: cardTint,
            trendDirection: cardTrendDir,
            trendValue: cardTrendVal.trim(),
          },
        })
      );
      dispatch(showGlobalToast({ message: "Metric card added!", type: "success" }));
    }

    setCardModalOpen(false);
  };

  const handleMoveCard = (index: number, direction: "left" | "right") => {
    const cards = [...(section.metricCards || [])];
    const targetIdx = direction === "left" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= cards.length) return;

    const temp = cards[index];
    cards[index] = cards[targetIdx];
    cards[targetIdx] = temp;

    dispatch(reorderCardsInSection({ sectionId: section.id, cards }));
  };

  const handleDeleteCard = (cardId: string) => {
    dispatch(deleteCardFromSection({ sectionId: section.id, cardId }));
    dispatch(showGlobalToast({ message: "Metric card removed.", type: "info" }));
  };

  // --- Handlers: Charts ---
  const handleOpenAddChart = () => {
    setEditingChart(null);
    setChartTitle("");
    setChartType("bar");
    setChartDataSource("ppe_sensor_compliance");
    setChartDesc("");
    setChartColor("#9D61FF");
    setChartColors([]);
    setGridRows(4);
    setGridCols(7);
    setChartModalOpen(true);
    dispatch(setChartEditorFullscreen(true));
  };

  const handleOpenEditChart = (chart: LibraryChartCard) => {
    setEditingChart(chart);
    setChartTitle(chart.title);
    setChartType(chart.chartType);
    setChartDataSource(chart.dataSourceField);
    setChartDesc(chart.description || "");
    const baseColor = chart.color || chart.colors?.[0] || "#9D61FF";
    setChartColor(baseColor);
    setChartColors(chart.colors && chart.colors.length > 0 ? chart.colors : [baseColor]);
    setGridRows(chart.gridRows || (chart.chartType === "table" ? 4 : 4));
    setGridCols(chart.gridCols || (chart.chartType === "table" ? 4 : 7));
    setChartModalOpen(true);
    dispatch(setChartEditorFullscreen(true));
  };

  const handleCloseChartEditor = () => {
    setChartModalOpen(false);
    dispatch(setChartEditorFullscreen(false));
  };

  const handleSaveChart = () => {
    if (!chartTitle.trim()) return;

    const finalColors = chartColors && chartColors.length > 0 ? chartColors : [chartColor];

    if (editingChart) {
      dispatch(
        updateChartInSection({
          sectionId: section.id,
          chart: {
            ...editingChart,
            title: chartTitle.trim(),
            chartType,
            dataSourceField: chartDataSource,
            description: chartDesc.trim(),
            color: chartColor,
            colors: finalColors,
            gridRows: (chartType === "heatmap" || chartType === "table") ? gridRows : undefined,
            gridCols: (chartType === "heatmap" || chartType === "table") ? gridCols : undefined,
          },
        })
      );
      dispatch(showGlobalToast({ message: "Chart updated!", type: "success" }));
    } else {
      dispatch(
        addChartToSection({
          sectionId: section.id,
          chart: {
            title: chartTitle.trim(),
            chartType,
            dataSourceField: chartDataSource,
            description: chartDesc.trim(),
            color: chartColor,
            colors: finalColors,
            gridRows: (chartType === "heatmap" || chartType === "table") ? gridRows : undefined,
            gridCols: (chartType === "heatmap" || chartType === "table") ? gridCols : undefined,
          },
        })
      );
      dispatch(showGlobalToast({ message: "Chart added to section!", type: "success" }));
    }

    setChartModalOpen(false);
    dispatch(setChartEditorFullscreen(false));
  };

  const handleMoveChart = (index: number, direction: "left" | "right") => {
    const charts = [...(section.charts || [])];
    const targetIdx = direction === "left" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= charts.length) return;

    const temp = charts[index];
    charts[index] = charts[targetIdx];
    charts[targetIdx] = temp;

    dispatch(reorderChartsInSection({ sectionId: section.id, charts }));
  };

  const handleCycleChartType = (chart: LibraryChartCard) => {
    const cycle: GraphType[] = [
      "line", "multi-line", "bar", "grouped-bar", "horizontal-bar",
      "stacked-horizontal", "donut", "pie", "heatmap", "two-segment",
      "table", "area", "stacked-bar", "radar", "gauge", "scatter",
      "bubble", "funnel", "sparkline", "combo", "waterfall",
      "treemap", "kpi-card", "timeline", "geo-map",
    ];
    const currentIdx = cycle.indexOf(chart.chartType);
    const nextType = cycle[(currentIdx + 1) % cycle.length];

    dispatch(
      updateChartInSection({
        sectionId: section.id,
        chart: { ...chart, chartType: nextType },
      })
    );
  };

  const handleDeleteChart = (chartId: string) => {
    dispatch(deleteChartFromSection({ sectionId: section.id, chartId }));
    dispatch(showGlobalToast({ message: "Chart removed.", type: "info" }));
  };

  // --- Handlers: Key Insights ---
  const handleOpenAddInsight = () => {
    setEditingInsight(null);
    setInsightText("");
    setInsightModalOpen(true);
  };

  const handleOpenEditInsight = (insight: LibraryKeyInsightItem) => {
    setEditingInsight(insight);
    setInsightText(insight.text);
    setInsightModalOpen(true);
  };

  const handleSaveInsight = () => {
    if (!insightText.trim()) return;

    if (editingInsight) {
      dispatch(
        updateInsightInSection({
          sectionId: section.id,
          insight: { ...editingInsight, text: insightText.trim() },
        })
      );
      dispatch(showGlobalToast({ message: "Insight updated.", type: "success" }));
    } else {
      dispatch(
        addInsightToSection({
          sectionId: section.id,
          text: insightText.trim(),
        })
      );
      dispatch(showGlobalToast({ message: "Insight item added.", type: "success" }));
    }

    setInsightModalOpen(false);
  };

  const handleMoveInsight = (index: number, direction: "up" | "down") => {
    const insights = [...(section.keyInsights || [])];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= insights.length) return;

    const temp = insights[index];
    insights[index] = insights[targetIdx];
    insights[targetIdx] = temp;

    dispatch(reorderInsightsInSection({ sectionId: section.id, keyInsights: insights }));
  };

  const handleDeleteInsight = (insightId: string) => {
    dispatch(deleteInsightFromSection({ sectionId: section.id, insightId }));
    dispatch(showGlobalToast({ message: "Insight removed.", type: "info" }));
  };

  // Render Fullscreen/Inline Chart Editor
  if (chartModalOpen) {
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
        onSave={() => {
          setChartDataSource("custom_telemetry_feed");
          handleSaveChart();
        }}
        onClose={handleCloseChartEditor}
      />
    );
  }

  // Render Main Canvas Studio
  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden animate-fadeIn space-y-2">
      {/* 1. TOP EDITOR CONTROL BAR */}
      <div className="flex-shrink-0 flex items-center justify-between gap-3 flex-wrap px-4 sm:px-6 lg:px-7 py-1.5 border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017]">
        {/* Left: Back + Section Title & Eyebrow */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="h-8.5 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Sections List</span>
          </button>

          <div className="h-4 w-[1px] bg-slate-200 dark:bg-zinc-800 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase font-bold text-[#9D61FF] bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
              {section.eyebrow}
            </span>
            <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
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
                title="Edit Section Title & Header"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </h1>
          </div>
        </div>

        {/* Right: Quick Element Insertion Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleOpenAddCard}
            className="h-8.5 px-3 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Metric Card</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddChart}
            className="h-8.5 px-3 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-[#9D61FF] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>+ Chart</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddInsight}
            className="h-8.5 px-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>+ Key Insight</span>
          </button>

          <button
            type="button"
            onClick={() => {
              dispatch(showGlobalToast({ message: "Section blueprint saved to Library!", type: "success" }));
              onBack();
            }}
            className="h-8.5 px-4 rounded-xl glow-btn-primary text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm ml-1"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save to Library</span>
          </button>
        </div>
      </div>

      {/* 2. CANVA-STYLE VISUAL REPORT SIMULATION CANVAS */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-center bg-slate-100/60 dark:bg-[#07090d]">
        {/* Report Page Container (simulating Dummy_report.pdf A4 Report Module) */}
        <div className="w-full max-w-5xl bg-white dark:bg-[#0b0e14] border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          {/* A. REPORT SECTION HEADER BAR */}
          <div className="border-b border-slate-100 dark:border-zinc-800/80 pb-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 font-mono">
                {section.eyebrow}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                MODULE PREVIEW • SITESAFE EXECUTIVE SUITE
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              {section.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1 max-w-3xl leading-relaxed">
              {section.description}
            </p>
          </div>

          {/* B. PASTEL METRIC CARDS ROW / GRID */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-blue-500" />
                <span>Executive Metric Indicators ({section.metricCards?.length || 0})</span>
              </span>
              <button
                type="button"
                onClick={handleOpenAddCard}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Metric Card</span>
              </button>
            </div>

            {(!section.metricCards || section.metricCards.length === 0) ? (
              <div className="py-8 text-center border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl p-4 text-xs text-slate-400 space-y-2 bg-slate-50/50 dark:bg-zinc-900/30">
                <p>No metric cards added yet.</p>
                <button
                  type="button"
                  onClick={handleOpenAddCard}
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add First Metric Card</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {section.metricCards.map((card, idx) => {
                  const ramp = PALETTE_RAMPS.find((r) => r.id === card.tintColor) || PALETTE_RAMPS[0];

                  return (
                    <div
                      key={card.id}
                      className={`relative group rounded-2xl border p-4 shadow-sm transition-all ${ramp.bgLight} ${ramp.bgDark} ${ramp.borderLight} ${ramp.borderDark}`}
                    >
                      {/* Hover action overlay controls */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-lg p-1 shadow border border-slate-200 dark:border-zinc-700 z-10">
                        {idx > 0 && (
                          <button
                            type="button"
                            onClick={() => handleMoveCard(idx, "left")}
                            className="p-1 hover:text-blue-600 cursor-pointer"
                            title="Move Left"
                          >
                            <ChevronLeft className="w-3 h-3" />
                          </button>
                        )}
                        {idx < (section.metricCards?.length || 0) - 1 && (
                          <button
                            type="button"
                            onClick={() => handleMoveCard(idx, "right")}
                            className="p-1 hover:text-blue-600 cursor-pointer"
                            title="Move Right"
                          >
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleOpenEditCard(card)}
                          className="p-1 hover:text-blue-600 cursor-pointer"
                          title="Edit Card"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCard(card.id)}
                          className="p-1 hover:text-rose-500 cursor-pointer"
                          title="Delete Card"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Card Content */}
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-medium text-slate-600 dark:text-zinc-400 line-clamp-1">
                          {card.label}
                        </div>
                        <div className={`text-xl sm:text-2xl font-black font-mono tracking-tight ${ramp.textLight} ${ramp.textDark}`}>
                          {card.value}
                        </div>
                        <div className="pt-1 flex items-center gap-1">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${ramp.badgeBg} ${ramp.badgeText}`}>
                            {card.trendDirection === "up" && <ArrowUp className="w-2.5 h-2.5" />}
                            {card.trendDirection === "down" && <ArrowDown className="w-2.5 h-2.5" />}
                            {card.trendDirection === "no-change" && <span>—</span>}
                            <span>{card.trendValue}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* C. TELEMETRY CHARTS GRID */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5 text-purple-500" />
                <span>Telemetry Visualizations & Graphs ({section.charts?.length || 0})</span>
              </span>
              <button
                type="button"
                onClick={handleOpenAddChart}
                className="text-xs font-semibold text-[#9D61FF] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Telemetry Chart</span>
              </button>
            </div>

            {(!section.charts || section.charts.length === 0) ? (
              <div className="py-8 text-center border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl p-4 text-xs text-slate-400 space-y-2 bg-slate-50/50 dark:bg-zinc-900/30">
                <p>No telemetry charts attached to this section.</p>
                <button
                  type="button"
                  onClick={handleOpenAddChart}
                  className="text-[#9D61FF] font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add First Chart</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.charts.map((chart, idx) => (
                  <div
                    key={chart.id}
                    className="relative group rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] p-5 shadow-sm space-y-3 hover:border-[#9D61FF]/40 transition-all"
                  >
                    {/* Hover action overlay controls */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-lg p-1 shadow border border-slate-200 dark:border-zinc-700 z-10">
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => handleMoveChart(idx, "left")}
                          className="p-1 hover:text-[#9D61FF] cursor-pointer"
                          title="Move Left"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {idx < (section.charts?.length || 0) - 1 && (
                        <button
                          type="button"
                          onClick={() => handleMoveChart(idx, "right")}
                          className="p-1 hover:text-[#9D61FF] cursor-pointer"
                          title="Move Right"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleCycleChartType(chart)}
                        className="p-1 hover:text-[#9D61FF] text-[10px] font-mono font-bold cursor-pointer"
                        title="Switch Chart Type"
                      >
                        Type: {chart.chartType.toUpperCase()}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditChart(chart)}
                        className="p-1 hover:text-[#9D61FF] cursor-pointer"
                        title="Edit Chart"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteChart(chart.id)}
                        className="p-1 hover:text-rose-500 cursor-pointer"
                        title="Delete Chart"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Chart Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          {chart.title}
                        </h3>
                        <div className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 mt-0.5">
                          Source: {chart.dataSourceField}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-500/10 text-[#9D61FF] border border-purple-500/20 font-bold">
                        {chart.chartType.toUpperCase()}
                      </span>
                    </div>

                    {/* Live SVG Rendering */}
                    <ChartRenderer
                      chart={chart}
                      color={chart.color || chart.colors?.[0]}
                      colors={chart.colors}
                      gridRows={chart.gridRows}
                      gridCols={chart.gridCols}
                    />

                    {chart.description && (
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 pt-1 border-t border-slate-100 dark:border-zinc-800/80">
                        {chart.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* D. KEY INSIGHTS BLOCK (Matching Dummy_report.pdf) */}
          <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/50 p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-500">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Key Operational Insights
                </h3>
              </div>

              <button
                type="button"
                onClick={handleOpenAddInsight}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Insight Bullet</span>
              </button>
            </div>

            {(!section.keyInsights || section.keyInsights.length === 0) ? (
              <div className="text-center py-4 text-xs text-slate-400">
                No key insights added to this section. Click "+ Add Insight Bullet" to create one.
              </div>
            ) : (
              <div className="space-y-2.5">
                {section.keyInsights.map((insight, idx) => (
                  <div
                    key={insight.id}
                    className="relative group p-3 rounded-xl bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-zinc-800 shadow-sm flex items-start gap-3"
                  >
                    {/* Number Badge */}
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#9D61FF] to-blue-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </div>

                    <p className="text-xs text-slate-700 dark:text-zinc-300 flex-1 leading-relaxed">
                      {insight.text}
                    </p>

                    {/* Action buttons */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 flex-shrink-0">
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => handleMoveInsight(idx, "up")}
                          className="p-1 hover:text-blue-600 cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                      )}
                      {idx < (section.keyInsights?.length || 0) - 1 && (
                        <button
                          type="button"
                          onClick={() => handleMoveInsight(idx, "down")}
                          className="p-1 hover:text-blue-600 cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleOpenEditInsight(insight)}
                        className="p-1 hover:text-blue-600 cursor-pointer"
                        title="Edit Insight"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteInsight(insight.id)}
                        className="p-1 hover:text-rose-500 cursor-pointer"
                        title="Delete Insight"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Edit Section Header */}
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

      {/* Modal: Add / Edit Metric Card */}
      <MetricCardModal
        isOpen={cardModalOpen}
        onClose={() => setCardModalOpen(false)}
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

      {/* Modal: Add / Edit Key Insight */}
      <KeyInsightModal
        isOpen={insightModalOpen}
        onClose={() => setInsightModalOpen(false)}
        editingInsight={editingInsight}
        text={insightText}
        setText={setInsightText}
        onSave={handleSaveInsight}
      />
    </div>
  );
}

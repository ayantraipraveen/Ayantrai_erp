"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  Copy,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  BarChart2,
  TrendingUp,
  PieChart,
  Table as TableIcon,
  Sparkles,
  Shield,
  Layers,
  Lock,
  Save,
  Check,
  X,
  PlusCircle,
  HelpCircle,
  Sliders,
  Database,
  Grid,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  Clock,
  Users,
  Cpu,
  Activity,
  Calendar,
  Zap,
  Filter,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  LibrarySection,
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
import { Tooltip } from "@/app/Component";

interface SectionCanvasEditorProps {
  sectionId: string;
  onBack: () => void;
}

// 9 Color Ramps for Pastel Metric Cards (Matching Dummy_report.pdf)
export const PALETTE_RAMPS: {
  id: PaletteRamp;
  label: string;
  bgLight: string;
  bgDark: string;
  borderLight: string;
  borderDark: string;
  textLight: string;
  textDark: string;
  badgeBg: string;
  badgeText: string;
  accent: string;
}[] = [
  {
    id: "blue",
    label: "Ocean Blue",
    bgLight: "bg-blue-50/90",
    bgDark: "dark:bg-blue-950/30",
    borderLight: "border-blue-200/90",
    borderDark: "dark:border-blue-800/60",
    textLight: "text-blue-950",
    textDark: "dark:text-blue-100",
    badgeBg: "bg-blue-500/15",
    badgeText: "text-blue-700 dark:text-blue-300",
    accent: "#3B82F6",
  },
  {
    id: "green",
    label: "Sage Green",
    bgLight: "bg-green-50/90",
    bgDark: "dark:bg-green-950/30",
    borderLight: "border-green-200/90",
    borderDark: "dark:border-green-800/60",
    textLight: "text-green-950",
    textDark: "dark:text-green-100",
    badgeBg: "bg-green-500/15",
    badgeText: "text-green-700 dark:text-green-300",
    accent: "#22C55E",
  },
  {
    id: "purple",
    label: "Royal Violet",
    bgLight: "bg-purple-50/90",
    bgDark: "dark:bg-purple-950/30",
    borderLight: "border-purple-200/90",
    borderDark: "dark:border-purple-800/60",
    textLight: "text-purple-950",
    textDark: "dark:text-purple-100",
    badgeBg: "bg-purple-500/15",
    badgeText: "text-purple-700 dark:text-purple-300",
    accent: "#9D61FF",
  },
  {
    id: "red",
    label: "Soft Coral",
    bgLight: "bg-rose-50/90",
    bgDark: "dark:bg-rose-950/30",
    borderLight: "border-rose-200/90",
    borderDark: "dark:border-rose-800/60",
    textLight: "text-rose-950",
    textDark: "dark:text-rose-100",
    badgeBg: "bg-rose-500/15",
    badgeText: "text-rose-700 dark:text-rose-300",
    accent: "#F43F5E",
  },
  {
    id: "amber",
    label: "Warm Amber",
    bgLight: "bg-amber-50/90",
    bgDark: "dark:bg-amber-950/30",
    borderLight: "border-amber-200/90",
    borderDark: "dark:border-amber-800/60",
    textLight: "text-amber-950",
    textDark: "dark:text-amber-100",
    badgeBg: "bg-amber-500/15",
    badgeText: "text-amber-700 dark:text-amber-300",
    accent: "#F59E0B",
  },
  {
    id: "emerald",
    label: "Mint Emerald",
    bgLight: "bg-emerald-50/90",
    bgDark: "dark:bg-emerald-950/30",
    borderLight: "border-emerald-200/90",
    borderDark: "dark:border-emerald-800/60",
    textLight: "text-emerald-950",
    textDark: "dark:text-emerald-100",
    badgeBg: "bg-emerald-500/15",
    badgeText: "text-emerald-700 dark:text-emerald-300",
    accent: "#10B981",
  },
  {
    id: "cyan",
    label: "Crisp Cyan",
    bgLight: "bg-cyan-50/90",
    bgDark: "dark:bg-cyan-950/30",
    borderLight: "border-cyan-200/90",
    borderDark: "dark:border-cyan-800/60",
    textLight: "text-cyan-950",
    textDark: "dark:text-cyan-100",
    badgeBg: "bg-cyan-500/15",
    badgeText: "text-cyan-700 dark:text-cyan-300",
    accent: "#06B6D4",
  },
  {
    id: "orange",
    label: "Tangerine",
    bgLight: "bg-orange-50/90",
    bgDark: "dark:bg-orange-950/30",
    borderLight: "border-orange-200/90",
    borderDark: "dark:border-orange-800/60",
    textLight: "text-orange-950",
    textDark: "dark:text-orange-100",
    badgeBg: "bg-orange-500/15",
    badgeText: "text-orange-700 dark:text-orange-300",
    accent: "#F97316",
  },
  {
    id: "slate",
    label: "Neutral Slate",
    bgLight: "bg-slate-100/90",
    bgDark: "dark:bg-slate-900/60",
    borderLight: "border-slate-300/80",
    borderDark: "dark:border-slate-800/80",
    textLight: "text-slate-950",
    textDark: "dark:text-slate-100",
    badgeBg: "bg-slate-500/15",
    badgeText: "text-slate-700 dark:text-slate-300",
    accent: "#64748B",
  },
];

/**
 * Dedicated Visual Canva-Style Report Studio for Section & Graph Management.
 * Simulates real A4 report rendering matching Dummy_report.pdf.
 */
export default function SectionCanvasEditor({ sectionId, onBack }: SectionCanvasEditorProps) {
  const dispatch = useAppDispatch();
  const librarySections = useAppSelector((state) => state.reportModule.librarySections || []);
  const section = librarySections.find((s) => s.id === sectionId);

  // Edit Section Header Modal
  const [editHeaderOpen, setEditHeaderOpen] = useState(false);
  const [editName, setEditName] = useState(section?.name || "");
  const [editEyebrow, setEditEyebrow] = useState(section?.eyebrow || "");
  const [editDesc, setEditDesc] = useState(section?.description || "");

  // Metric Card Modal
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<LibraryMetricCard | null>(null);
  const [cardLabel, setCardLabel] = useState("");
  const [cardValue, setCardValue] = useState("");
  const [cardTint, setCardTint] = useState<PaletteRamp>("blue");
  const [cardTrendDir, setCardTrendDir] = useState<"up" | "down" | "no-change">("up");
  const [cardTrendVal, setCardTrendVal] = useState("+2.4% vs last cycle");

  // Chart Modal
  const [chartModalOpen, setChartModalOpen] = useState(false);
  const [editingChart, setEditingChart] = useState<LibraryChartCard | null>(null);
  const [chartTitle, setChartTitle] = useState("");
  const [chartType, setChartType] = useState<GraphType>("bar");
  const [chartDataSource, setChartDataSource] = useState("ppe_sensor_compliance");
  const [chartDesc, setChartDesc] = useState("");

  // Key Insight Modal
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
    setChartModalOpen(true);
    dispatch(setChartEditorFullscreen(true));
  };

  const handleOpenEditChart = (chart: LibraryChartCard) => {
    setEditingChart(chart);
    setChartTitle(chart.title);
    setChartType(chart.chartType);
    setChartDataSource(chart.dataSourceField);
    setChartDesc(chart.description || "");
    setChartModalOpen(true);
    dispatch(setChartEditorFullscreen(true));
  };

  const handleSaveChart = () => {
    if (!chartTitle.trim()) return;

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
          },
        })
      );
      dispatch(showGlobalToast({ message: "Chart added to section!", type: "success" }));
    }

    setChartModalOpen(false);
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
      "treemap", "kpi-card", "timeline", "geo-map"
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

  // Chart SVG Renderers
  const renderLiveChart = (chart: LibraryChartCard) => {
    switch (chart.chartType) {
      case "line":
        return (
          <div className="w-full h-36 flex flex-col">
            <svg viewBox="0 0 420 130" className="w-full flex-1 overflow-visible">
              <defs>
                <linearGradient id={`grad-${chart.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#9D61FF" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#9D61FF" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Y-axis */}
              <line x1="38" y1="8" x2="38" y2="108" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
              {/* X-axis */}
              <line x1="38" y1="108" x2="410" y2="108" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
              {/* Y grid + labels */}
              {[{y:108,l:"0"},{y:82,l:"25"},{y:55,l:"50"},{y:28,l:"75"},{y:8,l:"100"}].map((g,i)=>(
                <g key={i}>
                  <line x1="35" y1={g.y} x2="410" y2={g.y} stroke="currentColor" strokeOpacity="0.07" strokeDasharray="3 3" />
                  <text x="32" y={g.y+3} fontSize="7" textAnchor="end" fill="currentColor" fillOpacity="0.45">{g.l}</text>
                </g>
              ))}
              {/* X ticks */}
              {[{x:90,l:"08:00"},{x:170,l:"12:00"},{x:250,l:"16:00"},{x:330,l:"20:00"},{x:405,l:"24:00"}].map((t,i)=>(
                <g key={i}>
                  <line x1={t.x} y1="108" x2={t.x} y2="112" stroke="currentColor" strokeOpacity="0.3" />
                  <text x={t.x} y="120" fontSize="7" textAnchor="middle" fill="currentColor" fillOpacity="0.45">{t.l}</text>
                </g>
              ))}
              {/* Area fill */}
              <path d="M 45 95 Q 110 42, 175 65 T 295 28 T 405 14 L 405 108 L 45 108 Z" fill={`url(#grad-${chart.id})`} />
              {/* Line */}
              <path d="M 45 95 Q 110 42, 175 65 T 295 28 T 405 14" fill="none" stroke="#9D61FF" strokeWidth="2.5" strokeLinecap="round" />
              {/* Points */}
              {[
                {cx:45,cy:95,val:"88"},
                {cx:130,cy:50,val:"94"},
                {cx:220,cy:46,val:"96"},
                {cx:310,cy:24,val:"99"},
                {cx:405,cy:14,val:"100"},
              ].map((pt,i)=>(
                <g key={i}>
                  <circle cx={pt.cx} cy={pt.cy} r="3.5" fill="#fff" stroke="#9D61FF" strokeWidth="2" />
                  <text x={pt.cx} y={pt.cy-7} fontSize="8" fontWeight="bold" textAnchor="middle" fill="#9D61FF">{pt.val}</text>
                </g>
              ))}
            </svg>
          </div>
        );

      case "donut":
      case "pie":
        return (
          <div className="w-full h-44 flex items-center justify-around py-2">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {/* Segment 1: 55% Blue */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#3B82F6"
                  strokeWidth="15"
                  strokeDasharray="131 238"
                  strokeDashoffset="0"
                />
                {/* Segment 2: 30% Emerald */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#10B981"
                  strokeWidth="15"
                  strokeDasharray="71 238"
                  strokeDashoffset="-131"
                />
                {/* Segment 3: 15% Amber */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#F59E0B"
                  strokeWidth="15"
                  strokeDasharray="36 238"
                  strokeDashoffset="-202"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-base font-extrabold font-mono text-slate-900 dark:text-white">98.7%</span>
                <span className="text-[9px] font-bold uppercase text-slate-400">Compliant</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-slate-700 dark:text-zinc-300">Smart Helmets: 55%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-700 dark:text-zinc-300">Vest Hubs: 30%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-slate-700 dark:text-zinc-300">Grounding Boots: 15%</span>
              </div>
            </div>
          </div>
        );

      case "table":
        return (
          <div className="w-full h-44 overflow-y-auto rounded-xl border border-slate-200 dark:border-zinc-800 text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 font-mono text-[10px] uppercase">
                  <th className="py-2 px-3 font-semibold">Supervisor / Area</th>
                  <th className="py-2 px-3 font-semibold">Zone</th>
                  <th className="py-2 px-3 font-semibold">Response</th>
                  <th className="py-2 px-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                <tr className="hover:bg-slate-50 dark:hover:bg-zinc-900/40">
                  <td className="py-2 px-3 font-medium text-slate-900 dark:text-white">Sunil M. (Crew #1)</td>
                  <td className="py-2 px-3 font-mono text-slate-500">Zone 1</td>
                  <td className="py-2 px-3 font-mono text-emerald-600 dark:text-emerald-400 font-bold">18s</td>
                  <td className="py-2 px-3">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      Optimal
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-zinc-900/40">
                  <td className="py-2 px-3 font-medium text-slate-900 dark:text-white">Pooja K. (Structural)</td>
                  <td className="py-2 px-3 font-mono text-slate-500">Tower L12</td>
                  <td className="py-2 px-3 font-mono text-emerald-600 dark:text-emerald-400 font-bold">24s</td>
                  <td className="py-2 px-3">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      Compliant
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-zinc-900/40">
                  <td className="py-2 px-3 font-medium text-slate-900 dark:text-white">Anand R. (Subcontractor)</td>
                  <td className="py-2 px-3 font-mono text-slate-500">Batching</td>
                  <td className="py-2 px-3 font-mono text-amber-600 dark:text-amber-400 font-bold">42s</td>
                  <td className="py-2 px-3">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      Review
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        );

      case "heatmap":
        return (
          <div className="w-full h-44 flex flex-col justify-end pt-2 text-xs">
            <div className="w-full grid grid-cols-8 gap-1 h-full">
              {/* Header column */}
              <div className="flex flex-col gap-1 justify-end pb-5 font-mono text-[9px] text-slate-400">
                <div className="h-7 flex items-center justify-end pr-2">Week 1</div>
                <div className="h-7 flex items-center justify-end pr-2">Week 2</div>
                <div className="h-7 flex items-center justify-end pr-2">Week 3</div>
                <div className="h-7 flex items-center justify-end pr-2">Week 4</div>
              </div>
              {/* Day columns */}
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
                <div key={day} className="flex flex-col gap-1 h-full">
                  <div className="text-center font-semibold text-slate-600 dark:text-zinc-400 mb-1 h-4 text-[10px] uppercase">{day}</div>
                  <div className={`h-7 rounded flex items-center justify-center text-[10px] font-bold text-white ${i > 4 ? "bg-amber-500" : "bg-emerald-500"}`}>
                    {i > 4 ? "82" : "96"}
                  </div>
                  <div className={`h-7 rounded flex items-center justify-center text-[10px] font-bold text-white ${i > 4 ? "bg-rose-500" : "bg-emerald-400"}`}>
                    {i > 4 ? "78" : "94"}
                  </div>
                  <div className={`h-7 rounded flex items-center justify-center text-[10px] font-bold text-white ${i > 4 ? "bg-amber-400" : "bg-emerald-500"}`}>
                    {i > 4 ? "85" : "95"}
                  </div>
                  <div className={`h-7 rounded flex items-center justify-center text-[10px] font-bold text-white ${i > 4 ? "bg-rose-400" : "bg-emerald-600"}`}>
                    {i > 4 ? "72" : "98"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "horizontal-bar":
        return (
          <div className="w-full h-44 flex flex-col justify-center py-2 gap-2.5 text-xs">
            {[
              { label: "Civil", val: "93%", width: "93%", color: "bg-orange-500" },
              { label: "Mechanical", val: "88%", width: "88%", color: "bg-emerald-500" },
              { label: "Electrical", val: "90%", width: "90%", color: "bg-amber-400" },
              { label: "Fabrication", val: "85%", width: "85%", color: "bg-rose-500" },
            ].map((row, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-20 text-right font-medium text-slate-700 dark:text-zinc-300 truncate">{row.label}</span>
                <div className="flex-1 h-6 bg-slate-100 dark:bg-zinc-800 rounded-r-md flex items-center">
                  <div className={`h-full ${row.color} flex items-center justify-end pr-2 rounded-r-md transition-all`} style={{ width: row.width }}>
                    <span className="text-[10px] font-bold text-white shadow-sm">{row.val}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case "stacked-horizontal":
        return (
          <div className="w-full h-44 flex flex-col justify-center py-4 text-xs">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="font-semibold text-slate-700 dark:text-zinc-300">Total Operational Hours</span>
              <span className="font-bold text-slate-900 dark:text-white">18,750</span>
            </div>
            <div className="w-full h-10 flex rounded-lg overflow-hidden shadow-sm mb-4">
              <div className="bg-emerald-500 flex items-center justify-center text-white font-bold text-xs" style={{ width: '92.4%' }}>
                92.4% Safe
              </div>
              <div className="bg-rose-500 flex items-center justify-center text-white font-bold text-xs" style={{ width: '7.6%' }}>
                7.6%
              </div>
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-500 px-1">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-emerald-500 rounded-sm"></div> Hours without Violations (17,330)</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-rose-500 rounded-sm"></div> Hours with Violations (1,420)</div>
            </div>
          </div>
        );

      case "stacked-bar":
        return (
          <div className="w-full h-36 flex flex-col">
            <svg viewBox="0 0 420 130" className="w-full flex-1 overflow-visible">
              {/* Y-axis */}
              <line x1="38" y1="8" x2="38" y2="108" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
              {/* X-axis */}
              <line x1="38" y1="108" x2="410" y2="108" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
              {/* Y labels */}
              {[{y:108,l:"0"},{y:82,l:"25"},{y:55,l:"50"},{y:28,l:"75"},{y:8,l:"100"}].map((g,i)=>(
                <g key={i}>
                  <line x1="35" y1={g.y} x2="410" y2={g.y} stroke="currentColor" strokeOpacity="0.07" strokeDasharray="3 3" />
                  <text x="32" y={g.y+3} fontSize="7" textAnchor="end" fill="currentColor" fillOpacity="0.45">{g.l}</text>
                </g>
              ))}
              {[
                { x: 80,  h1: 35, h2: 40, h3: 15, h4: 10, label: "Civil" },
                { x: 160, h1: 32, h2: 38, h3: 20, h4: 10, label: "Mech" },
                { x: 240, h1: 28, h2: 42, h3: 18, h4: 12, label: "Elec" },
                { x: 320, h1: 40, h2: 35, h3: 15, h4: 10, label: "Fab" },
                { x: 400, h1: 20, h2: 45, h3: 25, h4: 10, label: "Safety" },
              ].map((b, i) => {
                const totalH = b.h1 + b.h2 + b.h3 + b.h4;
                return (
                  <g key={i}>
                    <rect x={b.x-16} y={108-b.h1} width="32" height={b.h1} fill="#3B82F6" />
                    <rect x={b.x-16} y={108-b.h1-b.h2} width="32" height={b.h2} fill="#10B981" />
                    <rect x={b.x-16} y={108-b.h1-b.h2-b.h3} width="32" height={b.h3} fill="#F59E0B" />
                    <rect x={b.x-16} y={108-totalH} width="32" height={b.h4} fill="#F43F5E" />
                    <line x1={b.x} y1="108" x2={b.x} y2="112" stroke="currentColor" strokeOpacity="0.3" />
                    <text x={b.x} y="120" fontSize="7" fontWeight="bold" textAnchor="middle" fill="currentColor" fillOpacity="0.6">{b.label}</text>
                  </g>
                );
              })}
              {/* Legend */}
              {[{c:"#3B82F6",l:"Civil"},{c:"#10B981",l:"PPE"},{c:"#F59E0B",l:"Safety"},{c:"#F43F5E",l:"Risk"}].map((lg,i)=>(
                <g key={i}><rect x={42+i*60} y="10" width="7" height="7" fill={lg.c} rx="1" /><text x={52+i*60} y="16" fontSize="7" fill="currentColor" fillOpacity="0.6">{lg.l}</text></g>
              ))}
            </svg>
          </div>
        );

      case "grouped-bar":
        return (
          <div className="w-full h-36 flex flex-col">
            <svg viewBox="0 0 420 130" className="w-full flex-1 overflow-visible">
              {/* Y-axis */}
              <line x1="38" y1="8" x2="38" y2="108" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
              {/* X-axis */}
              <line x1="38" y1="108" x2="410" y2="108" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
              {/* Y labels */}
              {[{y:108,l:"0"},{y:82,l:"25"},{y:55,l:"50"},{y:28,l:"75"},{y:8,l:"100"}].map((g,i)=>(
                <g key={i}>
                  <line x1="35" y1={g.y} x2="410" y2={g.y} stroke="currentColor" strokeOpacity="0.07" strokeDasharray="3 3" />
                  <text x="32" y={g.y+3} fontSize="7" textAnchor="end" fill="currentColor" fillOpacity="0.45">{g.l}</text>
                </g>
              ))}
              {[
                { x: 80,  v1: 60, v2: 40, label: "Civil" },
                { x: 160, v1: 85, v2: 60, label: "Elec" },
                { x: 240, v1: 90, v2: 55, label: "Mech" },
                { x: 320, v1: 30, v2: 20, label: "Safety" },
                { x: 400, v1: 70, v2: 50, label: "Admin" },
              ].map((b, i) => (
                <g key={i}>
                  <rect x={b.x-18} y={108-b.v1} width="16" height={b.v1} fill="#F59E0B" rx="2" />
                  <rect x={b.x+2}  y={108-b.v2} width="16" height={b.v2} fill="#EF4444" rx="2" />
                  <line x1={b.x} y1="108" x2={b.x} y2="112" stroke="currentColor" strokeOpacity="0.3" />
                  <text x={b.x} y="120" fontSize="7" textAnchor="middle" fill="currentColor" fillOpacity="0.6">{b.label}</text>
                </g>
              ))}
              {/* Legend */}
              <rect x="42" y="10" width="7" height="7" fill="#F59E0B" rx="1" /><text x="52" y="16" fontSize="7" fill="currentColor" fillOpacity="0.6">Actual</text>
              <rect x="90" y="10" width="7" height="7" fill="#EF4444" rx="1" /><text x="100" y="16" fontSize="7" fill="currentColor" fillOpacity="0.6">Target</text>
            </svg>
          </div>
        );

      case "multi-line":
        return (
          <div className="w-full h-36 flex flex-col">
            <svg viewBox="0 0 420 130" className="w-full flex-1 overflow-visible">
              {/* Y-axis */}
              <line x1="38" y1="8" x2="38" y2="108" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
              {/* X-axis */}
              <line x1="38" y1="108" x2="410" y2="108" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
              {/* Y grid + labels */}
              {[{y:108,l:"0"},{y:82,l:"25"},{y:55,l:"50"},{y:28,l:"75"},{y:8,l:"100"}].map((g,i)=>(
                <g key={i}>
                  <line x1="35" y1={g.y} x2="410" y2={g.y} stroke="currentColor" strokeOpacity="0.07" strokeDasharray="3 3" />
                  <text x="32" y={g.y+3} fontSize="7" textAnchor="end" fill="currentColor" fillOpacity="0.45">{g.l}</text>
                </g>
              ))}
              {/* X ticks */}
              {[{x:90,l:"Q1"},{x:180,l:"Q2"},{x:270,l:"Q3"},{x:405,l:"Q4"}].map((t,i)=>(
                <g key={i}>
                  <line x1={t.x} y1="108" x2={t.x} y2="112" stroke="currentColor" strokeOpacity="0.3" />
                  <text x={t.x} y="120" fontSize="7" textAnchor="middle" fill="currentColor" fillOpacity="0.45">{t.l}</text>
                </g>
              ))}
              {/* Line 1 - Purple */}
              <path d="M 45 95 Q 110 42, 175 65 T 295 28 T 405 14" fill="none" stroke="#9D61FF" strokeWidth="2.5" strokeLinecap="round" />
              {[{cx:45,cy:95},{cx:175,cy:65},{cx:295,cy:28},{cx:405,cy:14}].map((p,i)=><circle key={i} cx={p.cx} cy={p.cy} r="3" fill="#9D61FF" />)}
              {/* Line 2 - Emerald */}
              <path d="M 45 105 Q 110 78, 175 52 T 295 62 T 405 38" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="5 2" />
              {[{cx:45,cy:105},{cx:175,cy:52},{cx:295,cy:62},{cx:405,cy:38}].map((p,i)=><circle key={i} cx={p.cx} cy={p.cy} r="3" fill="#10B981" />)}
              {/* Legend */}
              <rect x="290" y="10" width="8" height="3" fill="#9D61FF" rx="1" />
              <text x="301" y="14" fontSize="7" fill="currentColor" fillOpacity="0.6">Zone A</text>
              <rect x="290" y="20" width="8" height="3" fill="#10B981" rx="1" />
              <text x="301" y="24" fontSize="7" fill="currentColor" fillOpacity="0.6">Zone B</text>
            </svg>
          </div>
        );

      case "two-segment":
        return (
          <div className="w-full h-44 flex flex-col justify-center gap-3 text-xs px-2">
            {[
              { label: "Compliant Workers", val: 85, color: "bg-emerald-500" },
              { label: "PPE Score", val: 73, color: "bg-blue-500" },
              { label: "Incident-Free Days", val: 92, color: "bg-purple-500" },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  <span>{item.label}</span><span>{item.val}%</span>
                </div>
                <div className="w-full h-5 bg-slate-100 dark:bg-zinc-800 rounded-lg overflow-hidden flex">
                  <div className={`h-full ${item.color} rounded-lg transition-all`} style={{ width: `${item.val}%` }} />
                </div>
              </div>
            ))}
          </div>
        );

      case "area":
        return (
          <div className="w-full h-36 flex flex-col">
            <svg viewBox="0 0 420 130" className="w-full flex-1 overflow-visible">
              <defs>
                <linearGradient id={`areagrad-${chart.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.03" />
                </linearGradient>
              </defs>
              {/* Y-axis */}
              <line x1="38" y1="8" x2="38" y2="108" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
              {/* X-axis */}
              <line x1="38" y1="108" x2="410" y2="108" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
              {/* Y grid */}
              {[{y:108,l:"0"},{y:82,l:"25"},{y:55,l:"50"},{y:28,l:"75"},{y:8,l:"100"}].map((g,i)=>(
                <g key={i}>
                  <line x1="35" y1={g.y} x2="410" y2={g.y} stroke="currentColor" strokeOpacity="0.07" strokeDasharray="3 3" />
                  <text x="32" y={g.y+3} fontSize="7" textAnchor="end" fill="currentColor" fillOpacity="0.45">{g.l}</text>
                </g>
              ))}
              {/* X ticks */}
              {[{x:90,l:"Jan"},{x:180,l:"Apr"},{x:270,l:"Jul"},{x:405,l:"Oct"}].map((t,i)=>(
                <g key={i}>
                  <line x1={t.x} y1="108" x2={t.x} y2="112" stroke="currentColor" strokeOpacity="0.3" />
                  <text x={t.x} y="120" fontSize="7" textAnchor="middle" fill="currentColor" fillOpacity="0.45">{t.l}</text>
                </g>
              ))}
              <path d="M 45 108 L 45 95 Q 110 42, 175 65 T 295 28 T 405 14 L 405 108 Z" fill={`url(#areagrad-${chart.id})`} />
              <path d="M 45 95 Q 110 42, 175 65 T 295 28 T 405 14" fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />
              {[{cx:45,cy:95},{cx:130,cy:50},{cx:220,cy:46},{cx:310,cy:24},{cx:405,cy:14}].map((p,i)=>(
                <circle key={i} cx={p.cx} cy={p.cy} r="3" fill="#fff" stroke="#3B82F6" strokeWidth="2" />
              ))}
            </svg>
          </div>
        );

      case "radar":
        return (
          <div className="w-full h-44 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="h-full w-full">
              <polygon points="50,5 95,35 80,90 20,90 5,35" fill="none" stroke="currentColor" strokeOpacity="0.2" />
              <polygon points="50,20 80,45 70,80 30,80 20,45" fill="none" stroke="currentColor" strokeOpacity="0.2" />
              <polygon points="50,15 85,40 60,75 35,80 15,45" fill="#9D61FF" fillOpacity="0.4" stroke="#9D61FF" strokeWidth="1.5" />
            </svg>
          </div>
        );

      case "gauge":
        return (
          <div className="w-full h-44 flex flex-col items-center justify-center relative">
            <svg viewBox="0 0 100 50" className="w-48 h-24 overflow-visible">
              <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="15" strokeLinecap="round" />
              <path d="M 10 50 A 40 40 0 0 1 70 15" fill="none" stroke="#10B981" strokeWidth="15" strokeLinecap="round" />
            </svg>
            <div className="absolute bottom-6 font-bold text-2xl text-slate-800 dark:text-white">72%</div>
          </div>
        );

      case "scatter":
      case "bubble":
        return (
          <div className="w-full h-36 flex flex-col">
            <svg viewBox="0 0 420 130" className="w-full flex-1 overflow-visible">
              {/* Y-axis */}
              <line x1="38" y1="8" x2="38" y2="108" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
              {/* X-axis */}
              <line x1="38" y1="108" x2="410" y2="108" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
              {/* Y grid + labels */}
              {[{y:108,l:"0"},{y:82,l:"25"},{y:55,l:"50"},{y:28,l:"75"},{y:8,l:"100"}].map((g,i)=>(
                <g key={i}>
                  <line x1="35" y1={g.y} x2="410" y2={g.y} stroke="currentColor" strokeOpacity="0.07" strokeDasharray="3 3" />
                  <text x="32" y={g.y+3} fontSize="7" textAnchor="end" fill="currentColor" fillOpacity="0.45">{g.l}</text>
                </g>
              ))}
              {/* X ticks */}
              {[{x:90,l:"20"},{x:180,l:"40"},{x:270,l:"60"},{x:405,l:"80"}].map((t,i)=>(
                <g key={i}>
                  <line x1={t.x} y1="108" x2={t.x} y2="112" stroke="currentColor" strokeOpacity="0.3" />
                  <text x={t.x} y="120" fontSize="7" textAnchor="middle" fill="currentColor" fillOpacity="0.45">{t.l}</text>
                </g>
              ))}
              {[
                {cx:80,  cy:95,  r: chart.chartType==='bubble'?14:4},
                {cx:160, cy:75,  r: chart.chartType==='bubble'?8:4},
                {cx:240, cy:38,  r: chart.chartType==='bubble'?22:4},
                {cx:320, cy:85,  r: chart.chartType==='bubble'?11:4},
                {cx:395, cy:28,  r: chart.chartType==='bubble'?17:4},
              ].map((c,i)=><circle key={i} cx={c.cx} cy={c.cy} r={c.r} fill="#F59E0B" fillOpacity="0.55" stroke="#F59E0B" strokeWidth="1" />)}
            </svg>
          </div>
        );

      case "funnel":
        return (
          <div className="w-full h-44 flex flex-col items-center justify-center gap-1 text-xs text-white font-bold">
            <div className="h-8 bg-blue-500 flex items-center justify-center" style={{ width: "90%" }}>1,200</div>
            <div className="h-8 bg-blue-400 flex items-center justify-center" style={{ width: "70%" }}>850</div>
            <div className="h-8 bg-blue-300 flex items-center justify-center text-blue-900" style={{ width: "50%" }}>420</div>
            <div className="h-8 bg-blue-200 flex items-center justify-center text-blue-900" style={{ width: "30%" }}>180</div>
          </div>
        );

      case "sparkline":
        return (
          <div className="w-full h-44 flex flex-col items-center justify-center gap-3">
            {[
              { label: "Zone A", d: "M 0 25 L 20 10 L 40 20 L 60 5 L 80 15 L 100 0", color: "#10B981" },
              { label: "Zone B", d: "M 0 20 L 20 25 L 40 10 L 60 20 L 80 5 L 100 15", color: "#3B82F6" },
              { label: "Zone C", d: "M 0 30 L 20 15 L 40 25 L 60 10 L 80 20 L 100 5", color: "#F59E0B" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3 w-full px-4">
                <span className="text-[10px] font-bold text-slate-500 w-12 text-right">{s.label}</span>
                <svg viewBox="0 0 100 30" className="w-48 h-8 overflow-visible flex-shrink-0">
                  <path d={s.d} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                <span className="text-[10px] font-bold" style={{ color: s.color }}>↑</span>
              </div>
            ))}
          </div>
        );

      case "combo":
        return (
          <div className="w-full h-36 flex flex-col">
            <svg viewBox="0 0 420 130" className="w-full flex-1 overflow-visible">
              {/* Y-axis */}
              <line x1="38" y1="8" x2="38" y2="108" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
              {/* X-axis */}
              <line x1="38" y1="108" x2="410" y2="108" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
              {/* Y grid */}
              {[{y:108,l:"0"},{y:82,l:"25"},{y:55,l:"50"},{y:28,l:"75"},{y:8,l:"100"}].map((g,i)=>(
                <g key={i}>
                  <line x1="35" y1={g.y} x2="410" y2={g.y} stroke="currentColor" strokeOpacity="0.07" strokeDasharray="3 3" />
                  <text x="32" y={g.y+3} fontSize="7" textAnchor="end" fill="currentColor" fillOpacity="0.45">{g.l}</text>
                </g>
              ))}
              {/* Bars */}
              {[{x:70,h:55},{x:145,h:75},{x:220,h:42},{x:295,h:85},{x:370,h:30}].map((b,i)=>(
                <g key={i}>
                  <rect x={b.x-18} y={108-b.h} width="36" height={b.h} fill="#3B82F6" opacity="0.75" rx="2" />
                  <line x1={b.x} y1="108" x2={b.x} y2="112" stroke="currentColor" strokeOpacity="0.3" />
                  <text x={b.x} y="120" fontSize="7" textAnchor="middle" fill="currentColor" fillOpacity="0.5">{["Jan","Feb","Mar","Apr","May"][i]}</text>
                </g>
              ))}
              {/* Trend line */}
              <path d="M 70 52 L 145 34 L 220 68 L 295 22 L 370 80" fill="none" stroke="#F43F5E" strokeWidth="2.5" strokeLinecap="round" />
              {[{cx:70,cy:52},{cx:145,cy:34},{cx:220,cy:68},{cx:295,cy:22},{cx:370,cy:80}].map((p,i)=>(
                <circle key={i} cx={p.cx} cy={p.cy} r="3" fill="#F43F5E" />
              ))}
              {/* Legend */}
              <rect x="42" y="10" width="7" height="7" fill="#3B82F6" rx="1" /><text x="52" y="16" fontSize="7" fill="currentColor" fillOpacity="0.6">Volume</text>
              <line x1="100" y1="14" x2="112" y2="14" stroke="#F43F5E" strokeWidth="2" /><text x="115" y="16" fontSize="7" fill="currentColor" fillOpacity="0.6">Trend</text>
            </svg>
          </div>
        );

      case "waterfall":
        return (
          <div className="w-full h-36 flex flex-col">
            <svg viewBox="0 0 420 130" className="w-full flex-1 overflow-visible">
              {/* Y-axis */}
              <line x1="38" y1="8" x2="38" y2="108" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
              {/* X-axis */}
              <line x1="38" y1="108" x2="410" y2="108" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
              {/* Y labels */}
              {[{y:108,l:"0"},{y:82,l:"25"},{y:55,l:"50"},{y:28,l:"75"},{y:8,l:"100"}].map((g,i)=>(
                <g key={i}>
                  <line x1="35" y1={g.y} x2="410" y2={g.y} stroke="currentColor" strokeOpacity="0.07" strokeDasharray="3 3" />
                  <text x="32" y={g.y+3} fontSize="7" textAnchor="end" fill="currentColor" fillOpacity="0.45">{g.l}</text>
                </g>
              ))}
              {/* Connectors */}
              <line x1="106" y1="48" x2="120" y2="48" stroke="currentColor" strokeOpacity="0.3" strokeDasharray="2 2" />
              <line x1="186" y1="28" x2="200" y2="48" stroke="currentColor" strokeOpacity="0.3" strokeDasharray="2 2" />
              <line x1="266" y1="68" x2="280" y2="88" stroke="currentColor" strokeOpacity="0.3" strokeDasharray="2 2" />
              <line x1="346" y1="88" x2="360" y2="88" stroke="currentColor" strokeOpacity="0.3" strokeDasharray="2 2" />
              {/* Bars: start, +20, -20, +10, total */}
              <rect x="44" y="48" width="62" height="60" fill="#64748B" rx="2" />
              <rect x="120" y="28" width="66" height="20" fill="#10B981" rx="2" />
              <rect x="200" y="48" width="66" height="20" fill="#F43F5E" rx="2" />
              <rect x="280" y="88" width="66" height="20" fill="#10B981" rx="2" />
              <rect x="360" y="28" width="42" height="80" fill="#64748B" rx="2" />
              {[{x:75,l:"Start"},{x:153,l:"+20"},{x:233,l:"-20"},{x:313,l:"+10"},{x:381,l:"Total"}].map((t,i)=>(
                <g key={i}>
                  <line x1={t.x} y1="108" x2={t.x} y2="112" stroke="currentColor" strokeOpacity="0.3" />
                  <text x={t.x} y="120" fontSize="7" textAnchor="middle" fill="currentColor" fillOpacity="0.6">{t.l}</text>
                </g>
              ))}
            </svg>
          </div>
        );

      case "treemap":
        return (
          <div className="w-full h-44 grid grid-cols-3 gap-1 p-2 text-white font-bold text-[10px]">
            <div className="col-span-2 row-span-2 bg-blue-500 rounded p-2">Item A</div>
            <div className="bg-emerald-500 rounded p-2">Item B</div>
            <div className="bg-amber-500 rounded p-2">Item C</div>
            <div className="col-span-3 bg-rose-500 rounded p-2">Item D</div>
          </div>
        );

      case "kpi-card":
        return (
          <div className="w-full h-44 grid grid-cols-2 gap-3 p-2 text-xs">
            {[
              { label: "Total Incidents", val: "1,248", trend: "-18%", color: "text-rose-500", icon: "↓" },
              { label: "PPE Compliance", val: "97.4%", trend: "+2.1%", color: "text-emerald-500", icon: "↑" },
              { label: "Worker Hours", val: "18,750", trend: "+5.3%", color: "text-blue-500", icon: "↑" },
              { label: "Near-Misses", val: "12", trend: "-33%", color: "text-amber-500", icon: "↓" },
            ].map((k, i) => (
              <div key={i} className="flex flex-col justify-between bg-slate-50 dark:bg-zinc-900 rounded-xl p-3 border border-slate-200 dark:border-zinc-800">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{k.label}</span>
                <div className="font-black text-xl text-slate-900 dark:text-white leading-tight">{k.val}</div>
                <span className={`font-bold ${k.color}`}>{k.icon} {k.trend}</span>
              </div>
            ))}
          </div>
        );

      case "timeline":
        return (
          <div className="w-full h-44 flex flex-col justify-center gap-2 p-2">
            <div className="flex items-center gap-2"><div className="w-16 text-right text-[10px] font-bold text-slate-500">Task 1</div><div className="h-4 bg-blue-500 rounded" style={{width: "40%", marginLeft: "10%"}}></div></div>
            <div className="flex items-center gap-2"><div className="w-16 text-right text-[10px] font-bold text-slate-500">Task 2</div><div className="h-4 bg-emerald-500 rounded" style={{width: "30%", marginLeft: "45%"}}></div></div>
            <div className="flex items-center gap-2"><div className="w-16 text-right text-[10px] font-bold text-slate-500">Task 3</div><div className="h-4 bg-purple-500 rounded" style={{width: "50%", marginLeft: "20%"}}></div></div>
          </div>
        );

      case "geo-map":
        return (
          <div className="w-full h-44 relative overflow-hidden rounded-xl bg-slate-100 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-700">
            <svg viewBox="0 0 400 176" className="w-full h-full">
              {/* Grid lines for map feel */}
              {[40,80,120,160].map(y => <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="currentColor" strokeOpacity="0.08" strokeDasharray="4 4" />)}
              {[80,160,240,320].map(x => <line key={x} x1={x} y1="0" x2={x} y2="176" stroke="currentColor" strokeOpacity="0.08" strokeDasharray="4 4" />)}
              {/* Site location markers */}
              {[
                { cx: 120, cy: 80, label: "Site A", color: "#10B981" },
                { cx: 250, cy: 60, label: "Site B", color: "#3B82F6" },
                { cx: 180, cy: 130, label: "Site C", color: "#F59E0B" },
                { cx: 320, cy: 110, label: "Site D", color: "#9D61FF" },
              ].map((s, i) => (
                <g key={i}>
                  <circle cx={s.cx} cy={s.cy} r="14" fill={s.color} fillOpacity="0.2" />
                  <circle cx={s.cx} cy={s.cy} r="6" fill={s.color} />
                  <text x={s.cx} y={s.cy + 22} fontSize="9" fontWeight="bold" textAnchor="middle" fill="currentColor" fillOpacity="0.7">{s.label}</text>
                </g>
              ))}
            </svg>
            <div className="absolute bottom-2 right-2 text-[9px] font-mono text-slate-400 bg-white/70 dark:bg-zinc-900/70 px-2 py-0.5 rounded">Geo / Map Chart</div>
          </div>
        );

      case "bar":
      default:
        return (
          <div className="w-full h-36 flex flex-col">
            <svg viewBox="0 0 420 130" className="w-full flex-1 overflow-visible">
              {/* Y-axis */}
              <line x1="38" y1="8" x2="38" y2="108" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
              {/* X-axis */}
              <line x1="38" y1="108" x2="410" y2="108" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
              {/* Y grid + labels */}
              {[{y:108,l:"0%"},{y:82,l:"25%"},{y:55,l:"50%"},{y:28,l:"75%"},{y:8,l:"100%"}].map((g,i)=>(
                <g key={i}>
                  <line x1="35" y1={g.y} x2="410" y2={g.y} stroke="currentColor" strokeOpacity="0.07" strokeDasharray="3 3" />
                  <text x="32" y={g.y+3} fontSize="7" textAnchor="end" fill="currentColor" fillOpacity="0.45">{g.l}</text>
                </g>
              ))}
              {/* Bars */}
              {[
                { x: 80,  height: 90, val: "94.2%", label: "L&T Civil" },
                { x: 160, height: 100, val: "98.7%", label: "Steel Mech" },
                { x: 240, height: 75, val: "88.4%",  label: "Tower Crane" },
                { x: 320, height: 97, val: "96.5%", label: "Batching" },
                { x: 400, height: 65, val: "84.0%",  label: "Subterra." },
              ].map((b, i) => (
                <g key={i}>
                  <rect x={b.x-17} y={108-b.height} width="34" height={b.height} rx="4" fill="#3B82F6" />
                  <text x={b.x} y={108-b.height-5} fontSize="7.5" fontWeight="bold" textAnchor="middle" fill="#3B82F6">{b.val}</text>
                  <line x1={b.x} y1="108" x2={b.x} y2="112" stroke="currentColor" strokeOpacity="0.3" />
                  <text x={b.x} y="120" fontSize="7" textAnchor="middle" fill="currentColor" fillOpacity="0.5">{b.label}</text>
                </g>
              ))}
            </svg>
          </div>
        );
    }
  };

  if (chartModalOpen) {
    const closeChartEditor = () => {
      setChartModalOpen(false);
      dispatch(setChartEditorFullscreen(false));
    };
    return (
      <div className="flex-1 min-h-0 bg-white dark:bg-[#0c1017] flex flex-col overflow-hidden animate-fadeIn text-slate-900 dark:text-white">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 p-6 flex-shrink-0">
          <h3 className="text-lg font-bold">
            {editingChart ? "Edit Telemetry Chart" : "Add Telemetry Chart"}
          </h3>
          <button
            type="button"
            onClick={closeChartEditor}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Compact inputs row - no wasted vertical space */}
        <div className="flex-shrink-0 flex gap-4 px-6 py-4 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/30 dark:bg-zinc-900/20">
          <div className="flex-1">
            <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wide block mb-1">Chart Title *</label>
            <input
              type="text"
              value={chartTitle}
              onChange={(e) => setChartTitle(e.target.value)}
              placeholder="e.g. PPE Compliance by Work Zone"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:border-[#9D61FF]"
            />
          </div>
          <div className="flex-1">
            <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wide block mb-1">Caption / Description</label>
            <input
              type="text"
              value={chartDesc}
              onChange={(e) => setChartDesc(e.target.value)}
              placeholder="e.g. Comparative gauge across contractors"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:border-[#9D61FF]"
            />
          </div>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Left Column: Chart Type Grid — fills all remaining height */}
          <div className="w-[42%] border-r border-slate-200 dark:border-zinc-800 flex flex-col min-h-0">
            <div className="px-4 pt-3 pb-2 flex-shrink-0">
              <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wide">Visualization Type</span>
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              <div className="grid grid-cols-5 gap-2">
                {[
                  { id: "line", label: "Line Chart", icon: TrendingUp },
                  { id: "multi-line", label: "Multi-line", icon: TrendingUp },
                  { id: "bar", label: "Vertical Bar", icon: BarChart2 },
                  { id: "grouped-bar", label: "Grouped Bar", icon: BarChart2 },
                  { id: "horizontal-bar", label: "Horiz. Bar", icon: BarChart2 },
                  { id: "stacked-horizontal", label: "100% Stacked", icon: Layers },
                  { id: "donut", label: "Donut", icon: PieChart },
                  { id: "pie", label: "Pie Chart", icon: PieChart },
                  { id: "heatmap", label: "Heatmap", icon: Grid },
                  { id: "two-segment", label: "Progress Bar", icon: CheckCircle2 },
                  { id: "table", label: "Data Table", icon: TableIcon },
                  { id: "area", label: "Area Chart", icon: TrendingUp },
                  { id: "stacked-bar", label: "Stacked Bar", icon: Layers },
                  { id: "radar", label: "Radar", icon: Activity },
                  { id: "gauge", label: "Gauge", icon: Clock },
                  { id: "scatter", label: "Scatter", icon: Sparkles },
                  { id: "bubble", label: "Bubble", icon: Sparkles },
                  { id: "funnel", label: "Funnel", icon: Filter },
                  { id: "sparkline", label: "Sparkline", icon: Activity },
                  { id: "combo", label: "Combo", icon: Layers },
                  { id: "waterfall", label: "Waterfall", icon: BarChart2 },
                  { id: "treemap", label: "Treemap", icon: Grid },
                  { id: "kpi-card", label: "KPI Card", icon: CheckCircle2 },
                  { id: "timeline", label: "Timeline", icon: Calendar },
                  { id: "geo-map", label: "Geo Map", icon: Zap },
                ].map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setChartType(t.id as any)}
                      className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all aspect-square ${
                        chartType === t.id
                          ? "border-[#9D61FF] bg-purple-500/10 text-[#9D61FF] font-bold"
                          : "border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-[#9D61FF]/50 hover:text-[#9D61FF]"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[9px] text-center leading-tight">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Live Preview — fills all remaining height */}
          <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50 dark:bg-zinc-900/30">
            <div className="px-6 pt-3 pb-2 flex items-center justify-between flex-shrink-0">
              <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wide">Chart Live Preview</span>
              <span className="text-[10px] font-mono uppercase text-slate-400 bg-slate-200 dark:bg-zinc-800 px-2 py-0.5 rounded-lg">
                {chartType}
              </span>
            </div>
            <div className="flex-1 min-h-0 px-6 pb-6 flex flex-col [&>div]:flex-1 [&>div]:min-h-0 [&>div]:h-auto [&_svg]:h-full [&_svg]:w-full">
              {renderLiveChart({
                id: "preview",
                title: chartTitle || "Preview Chart",
                chartType: chartType,
                dataSourceField: "custom_telemetry_feed",
                description: chartDesc || "Chart description preview",
              })}
            </div>
          </div>
        </div>


        <div className="flex items-center justify-end gap-2 p-4 border-t border-slate-200 dark:border-zinc-800 flex-shrink-0 bg-white dark:bg-[#0c1017]">
          <button
            type="button"
            onClick={closeChartEditor}
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              setChartDataSource("custom_telemetry_feed");
              handleSaveChart();
              dispatch(setChartEditorFullscreen(false));
            }}
            disabled={!chartTitle.trim()}
            className="px-5 py-2.5 rounded-xl bg-[#9D61FF] text-white text-sm font-bold disabled:opacity-50 hover:bg-purple-600 transition-colors"
          >
            Save Chart
          </button>
        </div>
      </div>
    );
  }

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
                className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
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
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
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
                            className="p-1 hover:text-blue-600"
                            title="Move Left"
                          >
                            <ChevronLeft className="w-3 h-3" />
                          </button>
                        )}
                        {idx < (section.metricCards?.length || 0) - 1 && (
                          <button
                            type="button"
                            onClick={() => handleMoveCard(idx, "right")}
                            className="p-1 hover:text-blue-600"
                            title="Move Right"
                          >
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleOpenEditCard(card)}
                          className="p-1 hover:text-blue-600"
                          title="Edit Card"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCard(card.id)}
                          className="p-1 hover:text-rose-500"
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
                  className="text-[#9D61FF] font-semibold hover:underline inline-flex items-center gap-1"
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
                          className="p-1 hover:text-[#9D61FF]"
                          title="Move Left"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {idx < (section.charts?.length || 0) - 1 && (
                        <button
                          type="button"
                          onClick={() => handleMoveChart(idx, "right")}
                          className="p-1 hover:text-[#9D61FF]"
                          title="Move Right"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleCycleChartType(chart)}
                        className="p-1 hover:text-[#9D61FF] text-[10px] font-mono font-bold"
                        title="Switch Chart Type"
                      >
                        Type: {chart.chartType.toUpperCase()}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditChart(chart)}
                        className="p-1 hover:text-[#9D61FF]"
                        title="Edit Chart"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteChart(chart.id)}
                        className="p-1 hover:text-rose-500"
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
                    {renderLiveChart(chart)}

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
                          className="p-1 hover:text-blue-600"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                      )}
                      {idx < (section.keyInsights?.length || 0) - 1 && (
                        <button
                          type="button"
                          onClick={() => handleMoveInsight(idx, "down")}
                          className="p-1 hover:text-blue-600"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleOpenEditInsight(insight)}
                        className="p-1 hover:text-blue-600"
                        title="Edit Insight"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteInsight(insight.id)}
                        className="p-1 hover:text-rose-500"
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

      {/* ================= MODAL: EDIT SECTION HEADER ================= */}
      {editHeaderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-scaleUp text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-bold">Edit Section Header</h3>
              <button
                type="button"
                onClick={() => setEditHeaderOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-zinc-300">
                  Section Name *
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#9D61FF]"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-zinc-300">
                  Eyebrow Label (Small-caps report tag)
                </label>
                <input
                  type="text"
                  value={editEyebrow}
                  onChange={(e) => setEditEyebrow(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-mono uppercase focus:outline-none focus:border-[#9D61FF]"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-zinc-300">
                  Description / Audit Scope
                </label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#9D61FF]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setEditHeaderOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveHeader}
                className="px-4 py-2 rounded-xl bg-[#9D61FF] text-white text-xs font-bold"
              >
                Save Header
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT METRIC CARD ================= */}
      {cardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-scaleUp text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-bold">
                {editingCard ? "Edit Pastel Metric Card" : "Add Pastel Metric Card"}
              </h3>
              <button
                type="button"
                onClick={() => setCardModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">
                    Card Metric Label *
                  </label>
                  <input
                    type="text"
                    value={cardLabel}
                    onChange={(e) => setCardLabel(e.target.value)}
                    placeholder="e.g. Attendance Adherence"
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#9D61FF]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">
                    Metric Value *
                  </label>
                  <input
                    type="text"
                    value={cardValue}
                    onChange={(e) => setCardValue(e.target.value)}
                    placeholder="e.g. 98.7% or 14,280 hrs"
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-mono font-bold focus:outline-none focus:border-[#9D61FF]"
                  />
                </div>
              </div>

              {/* Pastel Color Swatches (9 Ramps) */}
              <div>
                <label className="font-semibold text-slate-700 dark:text-zinc-300">
                  Card Pastel Tint (9 Harmonious Ramps)
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-1.5">
                  {PALETTE_RAMPS.map((ramp) => (
                    <button
                      key={ramp.id}
                      type="button"
                      onClick={() => setCardTint(ramp.id)}
                      className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                        cardTint === ramp.id
                          ? "border-[#9D61FF] ring-2 ring-purple-500/30 font-bold"
                          : "border-slate-200 dark:border-zinc-800 opacity-80 hover:opacity-100"
                      }`}
                    >
                      <div
                        className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: ramp.accent }}
                      />
                      <span className="text-[10px] truncate">{ramp.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Trend controls */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">
                    Trend Indicator
                  </label>
                  <select
                    value={cardTrendDir}
                    onChange={(e) => setCardTrendDir(e.target.value as any)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#9D61FF]"
                  >
                    <option value="up">↑ Favorable / Upward Trend</option>
                    <option value="down">↓ Downward Trend</option>
                    <option value="no-change">— Stable / Neutral</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">
                    Trend Value / Comparison Text
                  </label>
                  <input
                    type="text"
                    value={cardTrendVal}
                    onChange={(e) => setCardTrendVal(e.target.value)}
                    placeholder="e.g. +2.4% vs last cycle"
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#9D61FF]"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setCardModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCard}
                disabled={!cardLabel.trim() || !cardValue.trim()}
                className="px-4 py-2 rounded-xl bg-[#9D61FF] text-white text-xs font-bold disabled:opacity-50"
              >
                Save Card
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ================= MODAL: ADD / EDIT KEY INSIGHT ================= */}
      {insightModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-scaleUp text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-bold">
                {editingInsight ? "Edit Key Insight Item" : "Add Key Insight Item"}
              </h3>
              <button
                type="button"
                onClick={() => setInsightModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-zinc-300">
                  Insight Sentence / Formatted Observation *
                </label>
                <textarea
                  rows={4}
                  value={insightText}
                  onChange={(e) => setInsightText(e.target.value)}
                  placeholder="e.g. Peak biometric check-in occurred between 08:30 AM and 08:50 AM with zero optical gate latency."
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#9D61FF]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setInsightModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveInsight}
                disabled={!insightText.trim()}
                className="px-4 py-2 rounded-xl bg-[#9D61FF] text-white text-xs font-bold disabled:opacity-50"
              >
                Save Insight
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

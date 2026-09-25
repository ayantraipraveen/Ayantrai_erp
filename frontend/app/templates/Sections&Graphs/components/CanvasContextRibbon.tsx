"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  PaletteRamp,
  GraphType,
  CanvasCell,
  CanvasCellStyle,
  LibraryMetricCard,
  LibraryChartCard,
} from "@/lib/redux/slices/reportModuleSlice";
import {
  PALETTE_RAMPS,
  CHART_TYPE_OPTIONS,
} from "./constants/chartTypes";
import {
  Copy,
  Trash2,
  Sliders,
  Eye,
  Grid,
  Square,
  ArrowUp,
  ArrowDown,
  Maximize2,
  FileText,
  Activity,
  BarChart2,
  Lightbulb,
  AlignLeft,
  AlignCenter,
  AlignRight,
  LayoutGrid,
  Minus,
  Plus,
  Sparkles,
  Type,
  Palette,
  Pipette,
  Droplet,
  Stamp,
  Check,
  RotateCw,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { UploadedSvgWatermark, WatermarkStampConfig } from "./watermarkStorage";

export interface CanvasContextRibbonProps {
  selectedCell: CanvasCell | null;
  selectedRowId: string | null;
  sectionName: string;
  sectionEyebrow: string;
  onUpdateColSpan: (span: 1 | 2 | 3 | 4) => void;
  onUpdateWidth?: (customWidth: number) => void;
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

  // Font, Color & Background Management
  onUpdateCellStyle?: (style: Partial<CanvasCellStyle>) => void;

  // Watermark Management
  uploadedWatermarks?: UploadedSvgWatermark[];
  activeWatermarkId?: string | null;
  onSelectWatermark?: (watermarkId: string | null) => void;
  watermarkConfig?: WatermarkStampConfig;
  onUpdateWatermarkConfig?: (config: Partial<WatermarkStampConfig>) => void;
}

const COLOR_RAMP_DOTS: { id: PaletteRamp; bg: string; label: string }[] = [
  { id: "blue",    bg: "bg-blue-500",    label: "Blue" },
  { id: "green",   bg: "bg-emerald-500", label: "Green" },
  { id: "purple",  bg: "bg-purple-500",  label: "Purple" },
  { id: "amber",   bg: "bg-amber-500",   label: "Amber" },
  { id: "cyan",    bg: "bg-cyan-500",    label: "Cyan" },
  { id: "red",     bg: "bg-rose-500",    label: "Rose" },
  { id: "slate",   bg: "bg-slate-500",   label: "Slate" },
];

const FONT_OPTIONS: { id: "sans" | "serif" | "mono" | "rounded"; label: string; previewClass: string }[] = [
  { id: "sans",    label: "Inter Sans",       previewClass: "font-sans" },
  { id: "serif",   label: "Merriweather Serif", previewClass: "font-serif" },
  { id: "mono",    label: "JetBrains Mono",   previewClass: "font-mono" },
  { id: "rounded", label: "Outfit Modern",    previewClass: "font-sans tracking-wide" },
];

const CARD_BG_PRESETS: { id: string; label: string; color: string; border: string; darkBg: string }[] = [
  { id: "white",    label: "Pure White",  color: "#ffffff", border: "#e2e8f0", darkBg: "#0c1017" },
  { id: "slate",    label: "Crisp Slate", color: "#f8fafc", border: "#cbd5e1", darkBg: "#1e293b" },
  { id: "glass",    label: "Frosted Glass", color: "rgba(255,255,255,0.7)", border: "rgba(255,255,255,0.5)", darkBg: "rgba(20,25,35,0.7)" },
  { id: "purple",   label: "Soft Purple", color: "#f5f3ff", border: "#ddd6fe", darkBg: "#2e1065" },
  { id: "indigo",   label: "Soft Indigo", color: "#eef2ff", border: "#c7d2fe", darkBg: "#1e1b4b" },
  { id: "emerald",  label: "Soft Mint",   color: "#ecfdf5", border: "#a7f3d0", darkBg: "#064e3b" },
  { id: "amber",    label: "Soft Amber",  color: "#fffbeb", border: "#fde68a", darkBg: "#78350f" },
  { id: "rose",     label: "Soft Rose",   color: "#fff1f2", border: "#fecdd3", darkBg: "#881337" },
  { id: "dark",     label: "Midnight",    color: "#0f172a", border: "#334155", darkBg: "#0f172a" },
];

const TEXT_COLOR_SWATCHES = [
  { hex: "#0f172a", label: "Slate Dark" },
  { hex: "#1e293b", label: "Charcoal" },
  { hex: "#475569", label: "Slate Gray" },
  { hex: "#64748b", label: "Muted Gray" },
  { hex: "#8b3dff", label: "Canva Purple" },
  { hex: "#2563eb", label: "Royal Blue" },
  { hex: "#059669", label: "Emerald Green" },
  { hex: "#d97706", label: "Amber Gold" },
  { hex: "#dc2626", label: "Crimson Red" },
  { hex: "#0891b2", label: "Cyan Teal" },
  { hex: "#4f46e5", label: "Indigo" },
  { hex: "#ffffff", label: "Pure White" },
];

export const PAPER_TONE_PRESETS: { id: string; label: string; color: string; border: string; darkBg: string }[] = [
  { id: "white",  label: "Pure White",      color: "#ffffff", border: "#cbd5e1", darkBg: "#0c1017" },
  { id: "slate",  label: "Crisp Slate",     color: "#f8fafc", border: "#94a3b8", darkBg: "#1e293b" },
  { id: "paper",  label: "Warm Cream",      color: "#faf8f5", border: "#fde68a", darkBg: "#15130f" },
  { id: "linen",  label: "Soft Linen",      color: "#f4f1ea", border: "#d6d3d1", darkBg: "#181613" },
  { id: "ice",    label: "Ice Blueprint",   color: "#f0f7ff", border: "#bfdbfe", darkBg: "#0c1322" },
  { id: "mint",   label: "Pale Mint",       color: "#f2f9f5", border: "#a7f3d0", darkBg: "#0b1812" },
  { id: "rose",   label: "Rose Quartz",     color: "#fff5f7", border: "#fbcfe8", darkBg: "#1a0c10" },
  { id: "amber",  label: "Amber Parchment", color: "#fffbeb", border: "#fef08a", darkBg: "#1a1608" },
  { id: "dark",   label: "Executive Dark",  color: "#0f172a", border: "#475569", darkBg: "#07090d" },
];

export function getPaperToneColor(tone?: string): string {
  if (!tone) return "#ffffff";
  const lower = tone.toLowerCase();
  const preset = PAPER_TONE_PRESETS.find((p) => p.id === lower);
  if (preset) return preset.color;
  if (lower === "cream") return "#faf8f5";
  if (lower.startsWith("#") || lower.startsWith("rgb") || lower.startsWith("hsl")) return tone;
  return "#ffffff";
}

export function CanvasContextRibbon({
  selectedCell,
  selectedRowId,
  sectionName,
  sectionEyebrow,
  onUpdateColSpan,
  onUpdateWidth,
  onUpdateMetricCard,
  onUpdateChart,
  onOpenChartEditor,
  onDuplicate,
  onDelete,
  paperTone,
  onSetPaperTone,
  sectionTextColor,
  onSetSectionTextColor,
  showGrid,
  onToggleGrid,
  showGuides,
  onToggleGuides,
  isPreview,
  onTogglePreview,
  onUpdateCellStyle,
  uploadedWatermarks = [],
  activeWatermarkId,
  onSelectWatermark,
  watermarkConfig,
  onUpdateWatermarkConfig,
}: CanvasContextRibbonProps) {
  // Popover menus state
  const [fontMenuOpen, setFontMenuOpen] = useState(false);
  const [colorMenuOpen, setColorMenuOpen] = useState(false);
  const [bgMenuOpen, setBgMenuOpen] = useState(false);
  const [watermarkMenuOpen, setWatermarkMenuOpen] = useState(false);
  const [paperColorMenuOpen, setPaperColorMenuOpen] = useState(false);
  const [sectionTextColorMenuOpen, setSectionTextColorMenuOpen] = useState(false);

  // Close menus when clicking outside
  const ribbonRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ribbonRef.current && !ribbonRef.current.contains(e.target as Node)) {
        setFontMenuOpen(false);
        setColorMenuOpen(false);
        setBgMenuOpen(false);
        setWatermarkMenuOpen(false);
        setPaperColorMenuOpen(false);
        setSectionTextColorMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isPreview) {
    return (
      <div className="h-10 flex-shrink-0 flex items-center justify-between px-4 sm:px-6 bg-slate-900 text-white text-xs border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Eye className="w-3.5 h-3.5 text-[#9D61FF]" />
          <span className="font-bold">Live Clean Preview Mode</span>
          <span className="text-zinc-400 text-[11px]">— Presentation view without editing handles</span>
        </div>
        <button
          type="button"
          onClick={onTogglePreview}
          className="h-7 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors cursor-pointer"
        >
          Exit Preview (Esc)
        </button>
      </div>
    );
  }

  const currentStyle = selectedCell?.style || {};
  const currentWm = uploadedWatermarks.find((w) => w.id === activeWatermarkId);

  // ── Render Block Context Ribbon (When a cell is active) ─────────────────────
  if (selectedCell) {
    const card = selectedCell.metricCard;
    const chart = selectedCell.chart;

    return (
      <div
        ref={ribbonRef}
        className="relative h-11 flex-shrink-0 flex items-center justify-between gap-3 px-4 sm:px-6 bg-slate-50/95 dark:bg-[#090d14]/95 border-b border-slate-200/80 dark:border-zinc-800/80 backdrop-blur-md overflow-x-auto select-none animate-fadeIn z-30"
      >
        <div className="flex items-center gap-2 flex-nowrap">
          {/* Active Block Type Tag */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#9D61FF]/15 text-[#9D61FF] border border-[#9D61FF]/30 text-xs font-bold font-mono">
            {selectedCell.blockType === "metric-card" && <Activity className="w-3.5 h-3.5" />}
            {selectedCell.blockType === "chart"       && <BarChart2 className="w-3.5 h-3.5" />}
            {selectedCell.blockType === "insight"     && <Lightbulb className="w-3.5 h-3.5" />}
            {selectedCell.blockType === "text"        && <AlignLeft className="w-3.5 h-3.5" />}
            {selectedCell.blockType === "badge-strip" && <LayoutGrid className="w-3.5 h-3.5" />}
            {selectedCell.blockType === "divider"     && <Minus className="w-3.5 h-3.5" />}
            <span className="capitalize">{selectedCell.blockType.replace("-", " ")}</span>
          </div>

          <div className="w-px h-4 bg-slate-200 dark:bg-zinc-800 mx-0.5" />

          {/* ── Font Family Dropdown ── */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setFontMenuOpen(!fontMenuOpen);
                setColorMenuOpen(false);
                setBgMenuOpen(false);
                setWatermarkMenuOpen(false);
              }}
              className="h-7 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 hover:border-purple-400 bg-white dark:bg-zinc-900 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer text-slate-700 dark:text-zinc-200"
              title="Change Font Family"
            >
              <Type className="w-3.5 h-3.5 text-[#8B3DFF]" />
              <span className="capitalize">{currentStyle.fontFamily || "Sans"}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {fontMenuOpen && (
              <div className="absolute top-9 left-0 w-44 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl p-1.5 z-50 space-y-1 animate-fadeIn">
                <div className="px-2 py-1 text-[10px] font-mono uppercase text-slate-400 font-bold">Typography</div>
                {FONT_OPTIONS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      if (onUpdateCellStyle) onUpdateCellStyle({ fontFamily: f.id });
                      setFontMenuOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors ${
                      (currentStyle.fontFamily || "sans") === f.id
                        ? "bg-[#8B3DFF]/10 text-[#8B3DFF] font-bold"
                        : "hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200"
                    }`}
                  >
                    <span className={f.previewClass}>{f.label}</span>
                    {(currentStyle.fontFamily || "sans") === f.id && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Text Align Controls ── */}
          <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-zinc-800/80 p-0.5 rounded-lg border border-slate-200/80 dark:border-zinc-700/80">
            <button
              type="button"
              onClick={() => onUpdateCellStyle && onUpdateCellStyle({ textAlign: "left" })}
              className={`p-1 rounded cursor-pointer transition-colors ${
                (currentStyle.textAlign || "left") === "left"
                  ? "bg-white dark:bg-zinc-900 text-[#8B3DFF] shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
              }`}
              title="Align Left"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onUpdateCellStyle && onUpdateCellStyle({ textAlign: "center" })}
              className={`p-1 rounded cursor-pointer transition-colors ${
                currentStyle.textAlign === "center"
                  ? "bg-white dark:bg-zinc-900 text-[#8B3DFF] shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
              }`}
              title="Align Center"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onUpdateCellStyle && onUpdateCellStyle({ textAlign: "right" })}
              className={`p-1 rounded cursor-pointer transition-colors ${
                currentStyle.textAlign === "right"
                  ? "bg-white dark:bg-zinc-900 text-[#8B3DFF] shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
              }`}
              title="Align Right"
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* ── Text Color Swatches Dropdown ── */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setColorMenuOpen(!colorMenuOpen);
                setFontMenuOpen(false);
                setBgMenuOpen(false);
                setWatermarkMenuOpen(false);
              }}
              className="h-7 px-2 rounded-lg border border-slate-200 dark:border-zinc-800 hover:border-purple-400 bg-white dark:bg-zinc-900 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer text-slate-700 dark:text-zinc-200"
              title="Text Color"
            >
              <div
                className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-zinc-600"
                style={{ backgroundColor: currentStyle.textColor || "#0f172a" }}
              />
              <span className="hidden sm:inline">Color</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {colorMenuOpen && (
              <TextColorPopover
                currentColor={currentStyle.textColor || "#0f172a"}
                onSelectColor={(col) => {
                  if (onUpdateCellStyle) onUpdateCellStyle({ textColor: col });
                }}
                onReset={() => {
                  if (onUpdateCellStyle) onUpdateCellStyle({ textColor: undefined });
                }}
                onClose={() => setColorMenuOpen(false)}
                title="Block Text Color"
              />
            )}
          </div>

          {/* ── Card Background (Bg) Presets Dropdown ── */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setBgMenuOpen(!bgMenuOpen);
                setFontMenuOpen(false);
                setColorMenuOpen(false);
                setWatermarkMenuOpen(false);
              }}
              className="h-7 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 hover:border-purple-400 bg-white dark:bg-zinc-900 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer text-slate-700 dark:text-zinc-200"
              title="Card Background"
            >
              <Palette className="w-3.5 h-3.5 text-[#8B3DFF]" />
              <span>Card Bg</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {bgMenuOpen && (
              <CardBgPopover
                currentBg={currentStyle.cardBg}
                onSelectBg={(bg) => {
                  if (onUpdateCellStyle) onUpdateCellStyle({ cardBg: bg });
                }}
                onReset={() => {
                  if (onUpdateCellStyle) onUpdateCellStyle({ cardBg: undefined });
                }}
                onClose={() => setBgMenuOpen(false)}
              />
            )}
          </div>

          <div className="w-px h-4 bg-slate-200 dark:bg-zinc-800 mx-0.5" />

          {/* Metric Card Context Controls (if metric-card) */}
          {selectedCell.blockType === "metric-card" && card && onUpdateMetricCard && (
            <div className="flex items-center gap-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 mr-0.5 hidden md:inline">Tint:</span>
              {COLOR_RAMP_DOTS.map((dot) => (
                <button
                  key={dot.id}
                  type="button"
                  onClick={() => onUpdateMetricCard({ ...card, tintColor: dot.id })}
                  title={dot.label}
                  className={`w-4 h-4 rounded-full ${dot.bg} transition-transform cursor-pointer ${
                    card.tintColor === dot.id ? "ring-2 ring-offset-1 ring-[#9D61FF] scale-110" : "opacity-70 hover:opacity-100"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Chart Context Controls (if chart) */}
          {selectedCell.blockType === "chart" && chart && onUpdateChart && (
            <>
              <select
                value={chart.chartType}
                onChange={(e) => onUpdateChart({ ...chart, chartType: e.target.value as GraphType })}
                className="h-7 px-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-800 dark:text-zinc-200 outline-none cursor-pointer"
              >
                {CHART_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {onOpenChartEditor && (
                <button
                  type="button"
                  onClick={onOpenChartEditor}
                  className="h-7 px-2.5 rounded-lg border border-purple-300 dark:border-purple-800/80 bg-purple-500/10 hover:bg-purple-500/20 text-[#9D61FF] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Open Deep Telemetry Configurator"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Config</span>
                </button>
              )}
            </>
          )}

          {/* Fluid Width Controls (Adjustable % and Presets) */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800/80 p-0.5 rounded-lg border border-slate-200/80 dark:border-zinc-700/80">
            <span className="text-[10px] font-mono font-bold text-slate-400 px-1">Width:</span>
            {([25, 33, 50, 75, 100] as const).map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => {
                  if (onUpdateWidth) onUpdateWidth(w);
                  else {
                    const span = (w <= 30 ? 1 : w <= 55 ? 2 : w <= 80 ? 3 : 4) as 1 | 2 | 3 | 4;
                    onUpdateColSpan(span);
                  }
                }}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                  (selectedCell.customWidth ?? (selectedCell.colSpan * 25)) === w
                    ? "bg-[#9D61FF] text-white shadow-xs"
                    : "text-slate-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-900"
                }`}
                title={`Set block width to ${w}%`}
              >
                {w}%
              </button>
            ))}
            {/* Steppers for fluid adjustable width */}
            <div className="flex items-center border-l border-slate-200 dark:border-zinc-700 pl-1 ml-0.5 gap-0.5">
              <button
                type="button"
                onClick={() => {
                  const curr = selectedCell.customWidth ?? (selectedCell.colSpan * 25);
                  const next = Math.max(15, curr - 5);
                  if (onUpdateWidth) onUpdateWidth(next);
                }}
                className="w-4 h-4 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-zinc-900 flex items-center justify-center font-bold text-xs cursor-pointer"
                title="Decrease width by 5%"
              >
                -
              </button>
              <span className="text-[10px] font-mono font-bold text-slate-700 dark:text-zinc-200 min-w-[28px] text-center">
                {selectedCell.customWidth ?? (selectedCell.colSpan * 25)}%
              </span>
              <button
                type="button"
                onClick={() => {
                  const curr = selectedCell.customWidth ?? (selectedCell.colSpan * 25);
                  const next = Math.min(100, curr + 5);
                  if (onUpdateWidth) onUpdateWidth(next);
                }}
                className="w-4 h-4 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-zinc-900 flex items-center justify-center font-bold text-xs cursor-pointer"
                title="Increase width by 5%"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Right action group */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Watermark Quick Access */}
          <button
            type="button"
            onClick={() => {
              setWatermarkMenuOpen(!watermarkMenuOpen);
              setFontMenuOpen(false);
              setColorMenuOpen(false);
              setBgMenuOpen(false);
            }}
            className={`h-7 px-2.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              currentWm
                ? "bg-purple-500/15 border-purple-400/40 text-[#8B3DFF]"
                : "border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
            }`}
            title="Document Watermark & Corporate Stamp"
          >
            <Stamp className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{currentWm ? currentWm.name.split(" ")[0] : "Watermark"}</span>
          </button>

          {/* Duplicate Button */}
          <button
            type="button"
            onClick={onDuplicate}
            className="h-7 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Duplicate Block (Ctrl+D)"
          >
            <Copy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Duplicate</span>
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={onDelete}
            className="h-7 px-2.5 rounded-lg border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Delete Block (Del)"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>

        {/* ── Watermark Popover Modal ── */}
        {watermarkMenuOpen && (
          <WatermarkPopover
            uploadedWatermarks={uploadedWatermarks}
            activeWatermarkId={activeWatermarkId}
            onSelectWatermark={(id) => {
              if (onSelectWatermark) onSelectWatermark(id);
            }}
            config={watermarkConfig}
            onUpdateConfig={onUpdateWatermarkConfig}
            onClose={() => setWatermarkMenuOpen(false)}
          />
        )}
      </div>
    );
  }

  // ── Render Global Canvas Ribbon (Nothing selected) ──────────────────────────
  return (
    <div
      ref={ribbonRef}
      className="relative h-11 flex-shrink-0 flex items-center justify-between gap-3 px-4 sm:px-6 bg-slate-50/95 dark:bg-[#090d14]/95 border-b border-slate-200/80 dark:border-zinc-800/80 backdrop-blur-md overflow-x-auto select-none z-30"
    >
      <div className="flex items-center gap-3">
        {/* Section info badge */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400">
          <span className="text-[10px] font-mono uppercase font-bold text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-500/20">{sectionEyebrow}</span>
          <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate max-w-[200px]">{sectionName}</span>
        </div>

        <div className="w-px h-4 bg-slate-200 dark:bg-zinc-800 hidden sm:block" />

        {/* Paper tone selector */}
        <div className="relative flex items-center gap-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 hidden sm:inline mr-1">Paper:</span>
          <button
            type="button"
            onClick={() => {
              onSetPaperTone("white");
              setPaperColorMenuOpen(false);
            }}
            className={`h-6 px-2 rounded text-[10px] font-bold border transition-all cursor-pointer ${
              paperTone === "white" || paperTone.toLowerCase() === "#ffffff"
                ? "bg-white text-slate-900 border-slate-300 dark:bg-zinc-800 dark:text-white dark:border-zinc-600 shadow-sm"
                : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200"
            }`}
          >
            White
          </button>
          <button
            type="button"
            onClick={() => {
              onSetPaperTone("slate");
              setPaperColorMenuOpen(false);
            }}
            className={`h-6 px-2 rounded text-[10px] font-bold border transition-all cursor-pointer ${
              paperTone === "slate" || paperTone.toLowerCase() === "#f8fafc"
                ? "bg-slate-100 text-slate-900 border-slate-300 dark:bg-zinc-900 dark:text-white dark:border-zinc-700 shadow-sm"
                : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200"
            }`}
          >
            Slate
          </button>
          <button
            type="button"
            onClick={() => {
              onSetPaperTone("paper");
              setPaperColorMenuOpen(false);
            }}
            className={`h-6 px-2 rounded text-[10px] font-bold border transition-all cursor-pointer ${
              paperTone === "paper" || paperTone === "cream" || paperTone.toLowerCase() === "#faf8f5"
                ? "bg-[#faf8f5] text-amber-900 border-amber-300 dark:bg-[#15130f] dark:text-amber-200 dark:border-amber-800 shadow-sm"
                : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200"
            }`}
          >
            Cream
          </button>

          {/* Custom Color Selector Button */}
          <button
            type="button"
            onClick={() => {
              setPaperColorMenuOpen(!paperColorMenuOpen);
              setWatermarkMenuOpen(false);
            }}
            className={`h-6 px-2 rounded text-[10px] font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
              (!["white", "#ffffff", "slate", "#f8fafc", "paper", "cream", "#faf8f5"].includes(paperTone.toLowerCase())) || paperColorMenuOpen
                ? "bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-700 shadow-xs"
                : "border-slate-200 dark:border-zinc-700/80 text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800"
            }`}
            title="Custom Paper Color & Document Surface Tones"
          >
            <div
              className="w-2.5 h-2.5 rounded-full border border-slate-300 dark:border-zinc-600 shadow-xs flex-shrink-0"
              style={{ backgroundColor: getPaperToneColor(paperTone) }}
            />
            <span>Custom</span>
            <ChevronDown className="w-2.5 h-2.5 opacity-60" />
          </button>

          {paperColorMenuOpen && (
            <PaperColorPopover
              paperTone={paperTone}
              onSetPaperTone={onSetPaperTone}
              onClose={() => setPaperColorMenuOpen(false)}
            />
          )}
        </div>

        <div className="w-px h-4 bg-slate-200 dark:bg-zinc-800 hidden sm:block" />

        {/* Section Text Color */}
        <div className="relative flex items-center gap-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 hidden sm:inline mr-1">Text:</span>
          <button
            type="button"
            onClick={() => {
              setSectionTextColorMenuOpen(!sectionTextColorMenuOpen);
              setPaperColorMenuOpen(false);
              setWatermarkMenuOpen(false);
            }}
            className={`h-6 px-2 rounded text-[10px] font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
              sectionTextColor || sectionTextColorMenuOpen
                ? "bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-700 shadow-xs"
                : "border-slate-200 dark:border-zinc-700/80 text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800"
            }`}
            title="Section Text & Heading Color"
          >
            <div
              className="w-2.5 h-2.5 rounded-full border border-slate-300 dark:border-zinc-600 shadow-xs flex-shrink-0"
              style={{ backgroundColor: sectionTextColor || "#0f172a" }}
            />
            <span>{sectionTextColor ? sectionTextColor.toUpperCase() : "Default"}</span>
            <ChevronDown className="w-2.5 h-2.5 opacity-60" />
          </button>

          {sectionTextColorMenuOpen && (
            <TextColorPopover
              currentColor={sectionTextColor || "#0f172a"}
              onSelectColor={(col) => onSetSectionTextColor && onSetSectionTextColor(col)}
              onReset={() => onSetSectionTextColor && onSetSectionTextColor(undefined)}
              onClose={() => setSectionTextColorMenuOpen(false)}
              title="Section Text Color"
            />
          )}
        </div>

        <div className="w-px h-4 bg-slate-200 dark:bg-zinc-800 hidden sm:block" />

        {/* Watermark Selector & Stamp Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setWatermarkMenuOpen(!watermarkMenuOpen);
            }}
            className={`h-7 px-2.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentWm
                ? "bg-purple-500/15 border-purple-400/50 text-[#8B3DFF] shadow-xs"
                : "border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200"
            }`}
            title="Configure Document Watermark Stamp"
          >
            <Stamp className="w-3.5 h-3.5 text-[#8B3DFF]" />
            <span>Watermark: {currentWm ? currentWm.name.split(" ")[0] : "None"}</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {watermarkMenuOpen && (
            <WatermarkPopover
              uploadedWatermarks={uploadedWatermarks}
              activeWatermarkId={activeWatermarkId}
              onSelectWatermark={(id) => {
                if (onSelectWatermark) onSelectWatermark(id);
              }}
              config={watermarkConfig}
              onUpdateConfig={onUpdateWatermarkConfig}
              onClose={() => setWatermarkMenuOpen(false)}
            />
          )}
        </div>

        <div className="w-px h-4 bg-slate-200 dark:bg-zinc-800 hidden sm:block" />

        {/* Grid and Guides Toggles */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onToggleGrid}
            className={`h-6 px-2 rounded text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
              showGrid ? "bg-purple-500/15 text-[#9D61FF] border border-purple-500/30" : "text-slate-400 hover:text-slate-700"
            }`}
            title="Toggle Matrix Dot Grid"
          >
            <Grid className="w-3 h-3" />
            <span className="hidden sm:inline">Grid</span>
          </button>
          <button
            type="button"
            onClick={onToggleGuides}
            className={`h-6 px-2 rounded text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
              showGuides ? "bg-purple-500/15 text-[#9D61FF] border border-purple-500/30" : "text-slate-400 hover:text-slate-700"
            }`}
            title="Toggle Printable A4 Margins"
          >
            <Square className="w-3 h-3" />
            <span className="hidden sm:inline">Margins</span>
          </button>
        </div>
      </div>

      {/* Right controls: Clean preview */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onTogglePreview}
          className="h-7 px-3 rounded-lg border border-slate-200 dark:border-zinc-800 hover:border-[#9D61FF]/50 hover:bg-[#9D61FF]/10 text-slate-700 dark:text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          title="Toggle Clean Executive Report Preview"
        >
          <Eye className="w-3.5 h-3.5 text-[#9D61FF]" />
          <span>Preview Report</span>
        </button>
      </div>
    </div>
  );
}

// ── Watermark Popover Panel ───────────────────────────────────────────────────
interface WatermarkPopoverProps {
  uploadedWatermarks: UploadedSvgWatermark[];
  activeWatermarkId?: string | null;
  onSelectWatermark: (id: string | null) => void;
  config?: WatermarkStampConfig;
  onUpdateConfig?: (cfg: Partial<WatermarkStampConfig>) => void;
  onClose: () => void;
}

function WatermarkPopover({
  uploadedWatermarks,
  activeWatermarkId,
  onSelectWatermark,
  config,
  onUpdateConfig,
  onClose,
}: WatermarkPopoverProps) {
  const current = uploadedWatermarks.find((w) => w.id === activeWatermarkId);

  return (
    <div className="absolute top-11 right-6 sm:right-auto sm:left-48 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-zinc-800 shadow-2xl p-4 z-50 space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-[#8B3DFF] flex items-center justify-center font-bold">
            <Stamp className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Document Watermark Stamp</h4>
            <p className="text-[10px] text-slate-400">Manage uploaded compliance stamps</p>
          </div>
        </div>
        <a
          href="/templates/Sections&Graphs/watermark"
          target="_blank"
          rel="noreferrer"
          className="text-[10px] text-[#8B3DFF] hover:underline flex items-center gap-1 font-semibold"
          title="Go to Watermark Studio to upload more SVGs"
        >
          <span>Upload SVG</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Watermarks List (Uploaded SVGs) */}
      <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
        {/* Option: None */}
        <button
          type="button"
          onClick={() => {
            onSelectWatermark(null);
          }}
          className={`w-full p-2 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all ${
            !activeWatermarkId
              ? "border-[#8B3DFF] bg-[#8B3DFF]/10 text-[#8B3DFF] font-bold"
              : "border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900/50 text-slate-600 dark:text-zinc-400"
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400">
              <Minus className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs">No Watermark</span>
          </div>
          {!activeWatermarkId && <Check className="w-4 h-4 text-[#8B3DFF]" />}
        </button>

        {uploadedWatermarks.map((wm) => {
          const isSelected = activeWatermarkId === wm.id;
          return (
            <button
              key={wm.id}
              type="button"
              onClick={() => onSelectWatermark(wm.id)}
              className={`w-full p-2 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                isSelected
                  ? "border-[#8B3DFF] bg-[#8B3DFF]/10 text-[#8B3DFF] font-bold shadow-sm"
                  : "border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900/50 text-slate-700 dark:text-zinc-300"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-10 h-6 rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-0.5 flex items-center justify-center flex-shrink-0 overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: wm.svgContent }}
                />
                <div className="min-w-0">
                  <div className="text-xs font-semibold truncate">{wm.name}</div>
                  <div className="text-[9px] font-mono text-slate-400 truncate">{wm.fileName}</div>
                </div>
              </div>
              {isSelected && <Check className="w-4 h-4 text-[#8B3DFF] flex-shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Watermark Parameters (if one is selected) */}
      {current && onUpdateConfig && config && (
        <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 space-y-3">
          {/* Opacity Slider */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-zinc-300 mb-1">
              <span>Stamp Opacity</span>
              <span className="font-mono text-[#8B3DFF]">{config.opacity}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={60}
              step={1}
              value={config.opacity}
              onChange={(e) => onUpdateConfig({ opacity: parseInt(e.target.value, 10) })}
              className="w-full accent-[#8B3DFF] cursor-pointer"
            />
          </div>

          {/* Scale Slider */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-zinc-300 mb-1">
              <span>Stamp Scale</span>
              <span className="font-mono text-[#8B3DFF]">{config.scale}%</span>
            </div>
            <input
              type="range"
              min={50}
              max={150}
              step={5}
              value={config.scale}
              onChange={(e) => onUpdateConfig({ scale: parseInt(e.target.value, 10) })}
              className="w-full accent-[#8B3DFF] cursor-pointer"
            />
          </div>

          {/* Placement Pills */}
          <div>
            <div className="text-[11px] font-semibold text-slate-600 dark:text-zinc-300 mb-1.5">Stamp Placement</div>
            <div className="grid grid-cols-4 gap-1 text-[10px] font-bold">
              {[
                { id: "center", label: "Center" },
                { id: "top-right", label: "Top-R" },
                { id: "bottom-right", label: "Btm-R" },
                { id: "tiled", label: "Tiled" },
              ].map((pos) => (
                <button
                  key={pos.id}
                  type="button"
                  onClick={() => onUpdateConfig({ placement: pos.id as any })}
                  className={`py-1 rounded-md border text-center transition-all cursor-pointer ${
                    config.placement === pos.id
                      ? "bg-[#8B3DFF] text-white border-transparent"
                      : "border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Done Button */}
      <button
        type="button"
        onClick={onClose}
        className="w-full py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer transition-colors shadow-sm"
      >
        Done
      </button>
    </div>
  );
}

// ── Paper Color Popover Panel ─────────────────────────────────────────────────
interface PaperColorPopoverProps {
  paperTone: string;
  onSetPaperTone: (tone: string) => void;
  onClose: () => void;
}

function PaperColorPopover({
  paperTone,
  onSetPaperTone,
  onClose,
}: PaperColorPopoverProps) {
  const activeColor = getPaperToneColor(paperTone);
  const [hexInput, setHexInput] = useState(
    activeColor.startsWith("#") ? activeColor.toUpperCase() : "#FFFFFF"
  );
  const colorPickerRef = useRef<HTMLInputElement | null>(null);

  // Keep hexInput in sync if preset is clicked
  useEffect(() => {
    const col = getPaperToneColor(paperTone);
    if (col.startsWith("#")) {
      setHexInput(col.toUpperCase());
    }
  }, [paperTone]);

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.trim();
    if (!val.startsWith("#")) {
      val = "#" + val;
    }
    setHexInput(val.toUpperCase());
    if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(val)) {
      onSetPaperTone(val.toLowerCase());
    }
  };

  const handleNativeColorInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHexInput(val.toUpperCase());
    onSetPaperTone(val);
  };

  return (
    <div className="absolute top-8 left-0 w-72 sm:w-80 rounded-2xl bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-zinc-800 shadow-2xl p-4 z-50 space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-[#8B3DFF] flex items-center justify-center font-bold">
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Paper Sheet Color</h4>
            <p className="text-[10px] text-slate-400">Curated document tones & custom hex</p>
          </div>
        </div>
        <span
          className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 shadow-2xs"
        >
          {activeColor.toUpperCase()}
        </span>
      </div>

      {/* Curated Document Tones Grid */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
          Document Surface Presets
        </div>
        <div className="grid grid-cols-3 gap-2">
          {PAPER_TONE_PRESETS.map((p) => {
            const isSelected =
              paperTone.toLowerCase() === p.id.toLowerCase() ||
              paperTone.toLowerCase() === p.color.toLowerCase();
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onSetPaperTone(p.id)}
                className={`group relative p-2 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer h-16 ${
                  isSelected
                    ? "ring-2 ring-[#8B3DFF] border-[#8B3DFF] shadow-sm"
                    : "hover:scale-[1.03] border-slate-200 dark:border-zinc-700/80"
                }`}
                style={{ backgroundColor: p.color, borderColor: isSelected ? undefined : p.border }}
                title={`${p.label} (${p.color})`}
              >
                <div className="flex items-center justify-between w-full">
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-black/10 dark:border-white/20 shadow-xs"
                    style={{ backgroundColor: p.color }}
                  />
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-[#8B3DFF] text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>
                <span
                  className={`text-[10px] font-bold truncate ${
                    p.id === "dark" ? "text-white" : "text-slate-800"
                  }`}
                >
                  {p.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Color Input & Color Picker */}
      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800/80">
        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
          Custom Color & Hex
        </div>
        <div className="flex items-center gap-2">
          {/* Native HTML5 Color Picker Trigger Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => colorPickerRef.current?.click()}
              className="w-9 h-9 rounded-xl border border-slate-200 dark:border-zinc-700 flex items-center justify-center shadow-xs hover:scale-105 transition-all cursor-pointer relative overflow-hidden group"
              style={{ backgroundColor: activeColor }}
              title="Click to open system color picker"
            >
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Pipette className="w-3.5 h-3.5 text-white drop-shadow" />
              </div>
            </button>
            <input
              ref={colorPickerRef}
              type="color"
              value={activeColor.startsWith("#") ? activeColor : "#ffffff"}
              onChange={handleNativeColorInput}
              className="sr-only"
            />
          </div>

          {/* Hex Input Field */}
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">
              #
            </span>
            <input
              type="text"
              value={hexInput.replace(/^#/, "")}
              onChange={(e) => handleHexChange(e)}
              maxLength={6}
              placeholder="FFFFFF"
              className="w-full pl-6 pr-2 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-mono font-bold text-slate-900 dark:text-white uppercase focus:outline-none focus:ring-2 focus:ring-[#8B3DFF] focus:border-transparent transition-all"
            />
          </div>

          {/* Reset to White Button */}
          <button
            type="button"
            onClick={() => {
              onSetPaperTone("white");
              setHexInput("#FFFFFF");
            }}
            className="h-9 px-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            title="Reset to Pure White (#FFFFFF)"
          >
            <RotateCw className="w-3 h-3" />
            <span className="text-[10px]">Reset</span>
          </button>
        </div>
      </div>

      {/* Done Button */}
      <button
        type="button"
        onClick={onClose}
        className="w-full py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer transition-colors shadow-sm"
      >
        Apply & Close
      </button>
    </div>
  );
}

// ── Text Color Popover Panel ─────────────────────────────────────────────────
interface TextColorPopoverProps {
  currentColor?: string;
  onSelectColor: (color: string) => void;
  onReset: () => void;
  onClose: () => void;
  title?: string;
}

function TextColorPopover({
  currentColor = "#0f172a",
  onSelectColor,
  onReset,
  onClose,
  title = "Text Color",
}: TextColorPopoverProps) {
  const [hexInput, setHexInput] = useState(
    currentColor.startsWith("#") ? currentColor.toUpperCase() : "#0F172A"
  );
  const colorPickerRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (currentColor && currentColor.startsWith("#")) {
      setHexInput(currentColor.toUpperCase());
    }
  }, [currentColor]);

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.trim();
    if (!val.startsWith("#")) {
      val = "#" + val;
    }
    setHexInput(val.toUpperCase());
    if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(val)) {
      onSelectColor(val.toLowerCase());
    }
  };

  const handleNativeColorInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHexInput(val.toUpperCase());
    onSelectColor(val);
  };

  return (
    <div className="absolute top-8 left-0 w-72 sm:w-80 rounded-2xl bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-zinc-800 shadow-2xl p-4 z-50 space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-[#8B3DFF] flex items-center justify-center font-bold">
            <Type className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">{title}</h4>
  const isCustomColor = !TEXT_COLOR_SWATCHES.some(s => s.hex.toLowerCase() === currentColor.toLowerCase());

  return (
    <div className="absolute top-8 left-0 w-72 sm:w-80 rounded-2xl bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-zinc-800 shadow-2xl p-4 z-50 space-y-3.5 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-[#8B3DFF] flex items-center justify-center font-bold">
            <Type className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">{title}</h4>
            <p className="text-[10px] text-slate-400">Corporate typography palette & custom hex</p>
          </div>
        </div>
        <span
          className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 shadow-2xs"
        >
          {currentColor.toUpperCase()}
        </span>
      </div>

      {/* Curated Typography Swatches Grid with integrated [+] Custom button */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
          <span>Palette Swatches</span>
          <span className="text-[9px] text-[#8B3DFF] font-semibold">Click + for color picker</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {/* Custom Color Add Button with Rainbow Spectrum directly in swatches */}
          <button
            type="button"
            onClick={() => colorPickerRef.current?.click()}
            className={`w-full h-8 rounded-lg flex items-center justify-center transition-all hover:scale-105 cursor-pointer shadow-xs border relative overflow-hidden group ${
              isCustomColor
                ? "ring-2 ring-[#8B3DFF] ring-offset-1 border-[#8B3DFF]"
                : "border-slate-300 dark:border-zinc-700 hover:border-purple-400"
            }`}
            style={{
              background: "conic-gradient(from 180deg at 50% 50%, #FF0000 0deg, #FFA500 45deg, #FFFF00 90deg, #008000 135deg, #00FFFF 180deg, #0000FF 225deg, #800080 270deg, #FF00FF 315deg, #FF0000 360deg)",
            }}
            title="Custom Selection: Open Color Picker / Eyedropper"
          >
            <div className="w-5 h-5 rounded-md bg-white/90 dark:bg-black/90 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
              <Plus className="w-3.5 h-3.5 text-[#8B3DFF] font-bold" />
            </div>
          </button>

          {TEXT_COLOR_SWATCHES.map((swatch) => {
            const isSelected = currentColor.toLowerCase() === swatch.hex.toLowerCase();
            return (
              <button
                key={swatch.hex}
                type="button"
                onClick={() => {
                  onSelectColor(swatch.hex);
                }}
                className={`w-full h-8 rounded-lg flex items-center justify-center transition-transform hover:scale-110 cursor-pointer shadow-xs border ${
                  isSelected
                    ? "ring-2 ring-[#8B3DFF] ring-offset-1 border-transparent"
                    : "border-slate-200 dark:border-zinc-700"
                }`}
                style={{ backgroundColor: swatch.hex }}
                title={`${swatch.label} (${swatch.hex})`}
              >
                {isSelected && (
                  <Check
                    className={`w-3.5 h-3.5 drop-shadow ${
                      swatch.hex.toLowerCase() === "#ffffff" ? "text-slate-900" : "text-white"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Custom Color indicator (if non-preset is selected) */}
      {isCustomColor && (
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/25">
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-md border border-black/10 dark:border-white/20 shadow-xs flex-shrink-0"
              style={{ backgroundColor: currentColor }}
            />
            <div className="text-[11px] font-mono font-bold text-slate-800 dark:text-zinc-200">
              {currentColor.toUpperCase()}
            </div>
          </div>
          <span className="text-[9px] font-mono font-bold text-[#8B3DFF] uppercase tracking-wider bg-purple-500/15 px-1.5 py-0.5 rounded">
            Active Custom
          </span>
        </div>
      )}

      {/* Custom Color Input & Color Picker */}
      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800/80">
        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
          Custom Color & Hex
        </div>
        <div className="flex items-center gap-2">
          {/* Native HTML5 Color Picker Trigger Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => colorPickerRef.current?.click()}
              className="w-9 h-9 rounded-xl border border-slate-200 dark:border-zinc-700 flex items-center justify-center shadow-xs hover:scale-105 transition-all cursor-pointer relative overflow-hidden group"
              style={{ backgroundColor: currentColor }}
              title="Click to open system color picker"
            >
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Pipette
                  className={`w-3.5 h-3.5 drop-shadow ${
                    currentColor.toLowerCase() === "#ffffff" ? "text-slate-900" : "text-white"
                  }`}
                />
              </div>
            </button>
            <input
              ref={colorPickerRef}
              type="color"
              value={currentColor.startsWith("#") ? currentColor : "#0f172a"}
              onChange={handleNativeColorInput}
              className="sr-only"
            />
          </div>

          {/* Hex Input Field */}
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">
              #
            </span>
            <input
              type="text"
              value={hexInput.replace(/^#/, "")}
              onChange={handleHexChange}
              maxLength={6}
              placeholder="0F172A"
              className="w-full pl-6 pr-2 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-mono font-bold text-slate-900 dark:text-white uppercase focus:outline-none focus:ring-2 focus:ring-[#8B3DFF] focus:border-transparent transition-all"
            />
          </div>

          {/* Reset to Default Button */}
          <button
            type="button"
            onClick={() => {
              onReset();
              setHexInput("#0F172A");
            }}
            className="h-9 px-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            title="Reset to Default Color"
          >
            <RotateCw className="w-3 h-3" />
            <span className="text-[10px]">Reset</span>
          </button>
        </div>
      </div>

      {/* Done Button */}
      <button
        type="button"
        onClick={onClose}
        className="w-full py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer transition-colors shadow-sm"
      >
        Apply & Close
      </button>
    </div>
  );
}

// ── Card Background Popover Panel ─────────────────────────────────────────────
interface CardBgPopoverProps {
  currentBg?: string;
  onSelectBg: (bg: string) => void;
  onReset: () => void;
  onClose: () => void;
}

function CardBgPopover({
  currentBg = "white",
  onSelectBg,
  onReset,
  onClose,
}: CardBgPopoverProps) {
  const activeBgHex = currentBg?.startsWith("#") ? currentBg : (CARD_BG_PRESETS.find(p => p.id === currentBg)?.color || "#ffffff");
  const [hexInput, setHexInput] = useState(
    activeBgHex.startsWith("#") ? activeBgHex.toUpperCase() : "#FFFFFF"
  );
  const colorPickerRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (currentBg?.startsWith("#")) {
      setHexInput(currentBg.toUpperCase());
    } else {
      const p = CARD_BG_PRESETS.find(x => x.id === currentBg);
      if (p?.color.startsWith("#")) setHexInput(p.color.toUpperCase());
    }
  }, [currentBg]);

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.trim();
    if (!val.startsWith("#")) {
      val = "#" + val;
    }
    setHexInput(val.toUpperCase());
    if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(val)) {
      onSelectBg(val.toLowerCase());
    }
  };

  const handleNativeColorInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHexInput(val.toUpperCase());
    onSelectBg(val);
  };

  const isCustomBg = Boolean(currentBg?.startsWith("#") || currentBg?.startsWith("rgb"));

  return (
    <div className="absolute top-9 left-0 w-64 sm:w-72 rounded-2xl bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-zinc-800 shadow-2xl p-3.5 z-50 space-y-3.5 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/80 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-purple-500/10 text-[#8B3DFF] flex items-center justify-center font-bold">
            <Palette className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Card Background</h4>
            <p className="text-[10px] text-slate-400">Surface tone & custom hex</p>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 shadow-2xs">
          {activeBgHex.toUpperCase()}
        </span>
      </div>

      {/* Surface Presets */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
          Surface Presets
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {/* Custom Color Button in grid */}
          <button
            type="button"
            onClick={() => colorPickerRef.current?.click()}
            className={`h-11 rounded-lg border p-1 text-[10px] font-bold flex flex-col items-center justify-center transition-all cursor-pointer relative overflow-hidden group ${
              isCustomBg ? "ring-2 ring-[#8B3DFF] border-[#8B3DFF] shadow-xs" : "border-slate-300 dark:border-zinc-700 hover:scale-105"
            }`}
            style={{
              background: "conic-gradient(from 180deg at 50% 50%, #FF0000 0deg, #FFA500 45deg, #FFFF00 90deg, #008000 135deg, #00FFFF 180deg, #0000FF 225deg, #800080 270deg, #FF00FF 315deg, #FF0000 360deg)",
            }}
            title="Custom Hex / Color Picker"
          >
            <div className="w-full h-full rounded bg-white/90 dark:bg-black/90 flex flex-col items-center justify-center gap-0.5">
              <Plus className="w-3 h-3 text-[#8B3DFF] font-bold" />
              <span className="text-[9px] font-bold text-[#8B3DFF]">Custom</span>
            </div>
          </button>

          {CARD_BG_PRESETS.map((p) => {
            const isSelected = currentBg === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelectBg(p.id)}
                className={`h-11 rounded-lg border p-1 text-[10px] font-bold flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isSelected
                    ? "ring-2 ring-[#8B3DFF] shadow-sm"
                    : "hover:scale-105"
                }`}
                style={{ backgroundColor: p.color, borderColor: p.border }}
                title={p.label}
              >
                <span className={p.id === "dark" ? "text-white" : "text-slate-800"}>{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Color Input & Color Picker */}
      <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-zinc-800/80">
        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
          Custom Background Color
        </div>
        <div className="flex items-center gap-2">
          {/* Native HTML5 Color Picker Trigger Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => colorPickerRef.current?.click()}
              className="w-8 h-8 rounded-xl border border-slate-200 dark:border-zinc-700 flex items-center justify-center shadow-xs hover:scale-105 transition-all cursor-pointer relative overflow-hidden group"
              style={{ backgroundColor: activeBgHex }}
              title="Click to open system color picker"
            >
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Pipette
                  className={`w-3.5 h-3.5 drop-shadow ${
                    activeBgHex.toLowerCase() === "#ffffff" ? "text-slate-900" : "text-white"
                  }`}
                />
              </div>
            </button>
            <input
              ref={colorPickerRef}
              type="color"
              value={activeBgHex.startsWith("#") ? activeBgHex : "#ffffff"}
              onChange={handleNativeColorInput}
              className="sr-only"
            />
          </div>

          {/* Hex Input Field */}
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">
              #
            </span>
            <input
              type="text"
              value={hexInput.replace(/^#/, "")}
              onChange={handleHexChange}
              maxLength={6}
              placeholder="FFFFFF"
              className="w-full pl-6 pr-2 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-mono font-bold text-slate-900 dark:text-white uppercase focus:outline-none focus:ring-2 focus:ring-[#8B3DFF] focus:border-transparent transition-all"
            />
          </div>

          {/* Reset to Default Button */}
          <button
            type="button"
            onClick={() => {
              onReset();
              setHexInput("#FFFFFF");
            }}
            className="h-8 px-2 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            title="Reset to Default Background"
          >
            <RotateCw className="w-3 h-3" />
            <span className="text-[10px]">Reset</span>
          </button>
        </div>
      </div>

      {/* Done Button */}
      <button
        type="button"
        onClick={onClose}
        className="w-full py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer transition-colors shadow-sm"
      >
        Apply & Close
      </button>
    </div>
  );
}


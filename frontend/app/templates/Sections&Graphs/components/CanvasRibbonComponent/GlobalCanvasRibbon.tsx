"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Undo2,
  Redo2,
  ChevronDown,
  Stamp,
  Grid,
  Square,
  Ruler,
  Eye,
  Plus,
} from "lucide-react";
import { UploadedSvgWatermark, WatermarkStampConfig } from "../../watermark/utils";
import {
  CanvasMarginConfig,
  DEFAULT_CANVAS_MARGIN,
  getPaperToneColor,
} from "./constants";
import { CanvasSectionStyle } from "@/lib/redux/slices/reportModuleSlice";
import {
  RibbonPortalPopover,
  PaperColorPopover,
  TextColorPopover,
  WatermarkPopover,
  MarginPopover,
} from "./popovers";

export interface GlobalCanvasRibbonProps {
  sectionName: string;
  sectionEyebrow: string;
  paperTone: string;
  onSetPaperTone: (tone: string) => void;
  sectionTextColor?: string;
  onSetSectionTextColor?: (color: string | undefined) => void;
  uploadedWatermarks?: UploadedSvgWatermark[];
  activeWatermarkId?: string | null;
  onSelectWatermark?: (watermarkId: string | null) => void;
  watermarkConfig?: WatermarkStampConfig;
  onUpdateWatermarkConfig?: (config: Partial<WatermarkStampConfig>) => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  showGuides: boolean;
  onToggleGuides: () => void;
  marginConfig?: CanvasMarginConfig;
  onUpdateMarginConfig?: (config: Partial<CanvasMarginConfig>) => void;
  sectionStyle?: CanvasSectionStyle;
  onUpdateSectionStyle?: (style: Partial<CanvasSectionStyle>) => void;
  showRulers?: boolean;
  onToggleRulers?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onTogglePreview: () => void;
  onAddPage?: () => void;
}

export function GlobalCanvasRibbon({
  sectionName,
  sectionEyebrow,
  paperTone,
  onSetPaperTone,
  sectionTextColor,
  onSetSectionTextColor,
  uploadedWatermarks = [],
  activeWatermarkId,
  onSelectWatermark,
  watermarkConfig,
  onUpdateWatermarkConfig,
  showGrid,
  onToggleGrid,
  showGuides,
  onToggleGuides,
  marginConfig = DEFAULT_CANVAS_MARGIN,
  onUpdateMarginConfig,
  sectionStyle,
  onUpdateSectionStyle,
  showRulers = false,
  onToggleRulers,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onTogglePreview,
  onAddPage,
}: GlobalCanvasRibbonProps) {
  const [paperColorMenuOpen, setPaperColorMenuOpen] = useState(false);
  const [sectionTextColorMenuOpen, setSectionTextColorMenuOpen] = useState(false);
  const [watermarkMenuOpen, setWatermarkMenuOpen] = useState(false);
  const [marginMenuOpen, setMarginMenuOpen] = useState(false);

  const paperColorBtnRef = useRef<HTMLButtonElement | null>(null);
  const sectionTextColorBtnRef = useRef<HTMLButtonElement | null>(null);
  const watermarkBtnRef = useRef<HTMLButtonElement | null>(null);
  const marginBtnRef = useRef<HTMLButtonElement | null>(null);
  const ribbonRef = useRef<HTMLDivElement | null>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const closeMenus = () => {
      setPaperColorMenuOpen(false);
      setSectionTextColorMenuOpen(false);
      setWatermarkMenuOpen(false);
      setMarginMenuOpen(false);
    };

    const handlePointerDownOutside = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest(".portal-ribbon-popover")) {
        return;
      }
      if (ribbonRef.current && !ribbonRef.current.contains(e.target as Node)) {
        closeMenus();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenus();
    };

    document.addEventListener("pointerdown", handlePointerDownOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDownOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const currentWm = uploadedWatermarks.find((w) => w.id === activeWatermarkId);

  return (
    <div
      ref={ribbonRef}
      className="relative h-11 flex-shrink-0 flex items-center justify-between gap-3 px-4 sm:px-6 bg-slate-50/95 dark:bg-[#090d14]/95 border-b border-slate-200/80 dark:border-zinc-800/80 backdrop-blur-md overflow-visible select-none z-40"
    >
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3 overflow-visible">
        {/* Undo / Redo controls (Global canvas) */}
        {onUndo && (
          <div className="flex items-center gap-0.5 border-r border-slate-200 dark:border-zinc-800 pr-1.5 mr-0.5">
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              className={`h-7 w-7 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                canUndo
                  ? "border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200"
                  : "border-slate-100 dark:border-zinc-800/40 text-slate-300 dark:text-zinc-700 cursor-not-allowed opacity-40"
              }`}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onRedo}
              disabled={!canRedo}
              className={`h-7 w-7 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                canRedo
                  ? "border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200"
                  : "border-slate-100 dark:border-zinc-800/40 text-slate-300 dark:text-zinc-700 cursor-not-allowed opacity-40"
              }`}
              title="Redo (Ctrl+Y or Ctrl+Shift+Z)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

       

        <div className="w-px h-4 bg-slate-200 dark:bg-zinc-800 hidden sm:block" />

        {/* Paper tone selector */}
        <div className="relative flex shrink-0 items-center gap-1 whitespace-nowrap">
          <span className="text-[10px] uppercase font-bold text-slate-400 hidden sm:inline mr-1">
            Paper:
          </span>
          <button
            type="button"
            onClick={() => {
              onSetPaperTone("white");
              setPaperColorMenuOpen(false);
            }}
            className={`h-6 px-2 rounded text-[10px] font-bold border transition-all cursor-pointer ${
              paperTone === "white" || paperTone.toLowerCase() === "#ffffff"
                ? "bg-white text-slate-900 border-slate-300 dark:bg-zinc-800 dark:text-white dark:border-zinc-600"
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
                ? "bg-slate-100 text-slate-900 border-slate-300 dark:bg-zinc-900 dark:text-white dark:border-zinc-700"
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
              paperTone === "paper" ||
              paperTone === "cream" ||
              paperTone.toLowerCase() === "#faf8f5"
                ? "bg-[#faf8f5] text-amber-900 border-amber-300 dark:bg-[#15130f] dark:text-amber-200 dark:border-amber-800"
                : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200"
            }`}
          >
            Cream
          </button>

          {/* Custom Color Selector Button */}
          <button
            ref={paperColorBtnRef}
            type="button"
            onClick={() => {
              setPaperColorMenuOpen(!paperColorMenuOpen);
              setWatermarkMenuOpen(false);
              setSectionTextColorMenuOpen(false);
            setMarginMenuOpen(false);
            }}
            className={`h-6 px-2 rounded text-[10px] font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
              ![
                "white",
                "#ffffff",
                "slate",
                "#f8fafc",
                "paper",
                "cream",
                "#faf8f5",
              ].includes(paperTone.toLowerCase()) || paperColorMenuOpen
                ? "bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-700"
                : "border-slate-200 dark:border-zinc-700/80 text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800"
            }`}
            title="Custom Paper Color & Document Surface Tones"
          >
            <div
              className="w-2.5 h-2.5 rounded-full border border-slate-300 dark:border-zinc-600 flex-shrink-0"
              style={{ backgroundColor: getPaperToneColor(paperTone) }}
            />
            <span>Custom</span>
            <ChevronDown className="w-2.5 h-2.5 opacity-60" />
          </button>

          <RibbonPortalPopover
            anchorEl={paperColorBtnRef.current}
            isOpen={paperColorMenuOpen}
            onClose={() => setPaperColorMenuOpen(false)}
          >
            <PaperColorPopover
              paperTone={paperTone}
              onSetPaperTone={onSetPaperTone}
              onClose={() => setPaperColorMenuOpen(false)}
            />
          </RibbonPortalPopover>
        </div>

        <div className="w-px h-4 bg-slate-200 dark:bg-zinc-800 hidden sm:block" />

        {/* Section Text Color */}
        <div className="relative flex shrink-0 items-center gap-1 whitespace-nowrap">
          <span className="text-[10px] uppercase font-bold text-slate-400 hidden sm:inline mr-1">
            Text:
          </span>
          <button
            ref={sectionTextColorBtnRef}
            type="button"
            onClick={() => {
              setSectionTextColorMenuOpen(!sectionTextColorMenuOpen);
              setPaperColorMenuOpen(false);
              setWatermarkMenuOpen(false);
            }}
            className={`h-6 px-2 rounded text-[10px] font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
              sectionTextColor || sectionTextColorMenuOpen
                ? "bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-700"
                : "border-slate-200 dark:border-zinc-700/80 text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800"
            }`}
            title="Section Text & Heading Color"
          >
            <div
              className="w-2.5 h-2.5 rounded-full border border-slate-300 dark:border-zinc-600 flex-shrink-0"
              style={{ backgroundColor: sectionTextColor || "#0f172a" }}
            />
            <span>{sectionTextColor ? sectionTextColor.toUpperCase() : "Default"}</span>
            <ChevronDown className="w-2.5 h-2.5 opacity-60" />
          </button>

          <RibbonPortalPopover
            anchorEl={sectionTextColorBtnRef.current}
            isOpen={sectionTextColorMenuOpen}
            onClose={() => setSectionTextColorMenuOpen(false)}
          >
            <TextColorPopover
              currentColor={sectionTextColor || "#0f172a"}
              onSelectColor={(col) => onSetSectionTextColor && onSetSectionTextColor(col)}
              onReset={() => onSetSectionTextColor && onSetSectionTextColor(undefined)}
              onClose={() => setSectionTextColorMenuOpen(false)}
              title="Section Text Color"
            />
          </RibbonPortalPopover>
        </div>

        <div className="w-px h-4 bg-slate-200 dark:bg-zinc-800 hidden sm:block" />

        {/* Watermark Selector & Stamp Button */}
        <div className="relative shrink-0">
          <button
            ref={watermarkBtnRef}
            type="button"
            onClick={() => {
              setWatermarkMenuOpen(!watermarkMenuOpen);
            }}
            className={`h-7 max-w-[190px] shrink-0 whitespace-nowrap rounded-lg border px-2.5 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentWm
                ? "bg-purple-500/15 border-purple-400/50 text-[#8B3DFF]"
                : "border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200"
            }`}
            title="Configure Document Watermark Stamp"
          >
            <Stamp className="w-3.5 h-3.5 text-[#8B3DFF]" />
            <span className="truncate">
              Watermark: {currentWm ? currentWm.name.split(" ")[0] : "None"}
            </span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          <RibbonPortalPopover
            anchorEl={watermarkBtnRef.current}
            isOpen={watermarkMenuOpen}
            onClose={() => setWatermarkMenuOpen(false)}
          >
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
          </RibbonPortalPopover>
        </div>

        <div className="w-px h-4 bg-slate-200 dark:bg-zinc-800 hidden sm:block" />

        {/* Grid and Guides Toggles */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onToggleGrid}
            className={`h-6 px-2 rounded text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
              showGrid
                ? "bg-purple-500/15 text-[#9D61FF] border border-purple-500/30"
                : "text-slate-400 hover:text-slate-700"
            }`}
            title="Toggle Matrix Dot Grid"
          >
            <Grid className="w-3 h-3" />
            <span className="hidden sm:inline">Grid</span>
          </button>

          {/* Margins Adjust & Popover */}
          <div className="relative shrink-0">
            <button
              ref={marginBtnRef}
              type="button"
              onClick={() => {
                setMarginMenuOpen(!marginMenuOpen);
                setPaperColorMenuOpen(false);
                setWatermarkMenuOpen(false);
                setSectionTextColorMenuOpen(false);
              }}
              className={`h-6 shrink-0 whitespace-nowrap rounded border px-2 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                marginMenuOpen || showGuides
                  ? "bg-purple-500/15 text-[#9D61FF] border-purple-400/40"
                  : "border-slate-200 dark:border-zinc-700/80 text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800"
              }`}
              title="Adjust Printable Margins (Narrow, Standard, Wide, Custom)"
            >
              <Square className="w-3 h-3 text-[#9D61FF]" />
              <span>
                Margins: {marginConfig.top}/{marginConfig.right}/{marginConfig.bottom}/{marginConfig.left}
              </span>
              <ChevronDown className="w-2.5 h-2.5 opacity-60" />
            </button>

            <RibbonPortalPopover
              anchorEl={marginBtnRef.current}
              isOpen={marginMenuOpen}
              onClose={() => setMarginMenuOpen(false)}
              align="right"
            >
              <MarginPopover
                marginConfig={marginConfig}
                onUpdateMarginConfig={onUpdateMarginConfig}
                sectionStyle={sectionStyle}
                onUpdateSectionStyle={onUpdateSectionStyle}
                showGuides={showGuides}
                onToggleGuides={onToggleGuides}
                onClose={() => setMarginMenuOpen(false)}
              />
            </RibbonPortalPopover>
          </div>

          {/* Dimensions & Position Rulers Toggle Button */}
          {onToggleRulers && (
            <button
              type="button"
              onClick={onToggleRulers}
              className={`h-6 shrink-0 whitespace-nowrap rounded border px-2 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                showRulers
                  ? "bg-purple-500/15 text-[#9D61FF] border-purple-400/40"
                  : "border-slate-200 dark:border-zinc-700/80 text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800"
              }`}
              title="Toggle Dimensions & Position Rulers (Shift+R) — Standard PDF Page (595×842px)"
            >
              <Ruler className="w-3 h-3 text-[#9D61FF]" />
              <span className="hidden sm:inline">Rulers</span>
              <span className="text-[9px] font-mono text-slate-400 dark:text-zinc-500 hidden md:inline">
                {showRulers ? "595×842" : "Off"}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Right controls: Add Page & Clean preview */}
      <div className="flex shrink-0 items-center gap-2">
        {onAddPage && (
          <button
            type="button"
            onClick={onAddPage}
            className="h-7 shrink-0 whitespace-nowrap rounded-lg border border-purple-300 dark:border-purple-800/60 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-[#8B3DFF] px-2.5 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            title="Create a New Blank A4 Page"
          >
            <Plus className="w-3.5 h-3.5 text-[#8B3DFF]" />
            <span>New Page</span>
          </button>
        )}
        <button
          type="button"
          onClick={onTogglePreview}
          className="h-7 shrink-0 whitespace-nowrap rounded-lg border border-slate-200 dark:border-zinc-800 px-3 text-slate-700 dark:text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          title="Toggle Clean Executive Report Preview"
        >
          <Eye className="w-3.5 h-3.5 text-[#9D61FF]" />
          <span>Preview Report</span>
        </button>
      </div>
    </div>
  );
}

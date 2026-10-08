import React from "react";
import {
  Minus,
  SlidersHorizontal,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
} from "lucide-react";
import { CanvasDividerBlock } from "@/lib/redux/slices/reportModuleSlice";
import { ColorSwatchPicker } from "../common/ColorSwatchPicker";
import { DraggablePopoverShell } from "./DraggablePopoverShell";

export interface DividerInspectorPopoverProps {
  divider: CanvasDividerBlock;
  activeTab: "style" | "layout";
  onTabChange: (tab: "style" | "layout") => void;
  isOpen: boolean;
  anchorRect: DOMRect | null;
  onClose: () => void;
  onUpdateDivider: (patch: Partial<CanvasDividerBlock>) => void;
}

const LINE_STYLE_OPTIONS: { id: "solid" | "dashed" | "dotted" | "double"; label: string; preview: string }[] = [
  { id: "solid", label: "Solid", preview: "border-solid" },
  { id: "dashed", label: "Dashed", preview: "border-dashed" },
  { id: "dotted", label: "Dotted", preview: "border-dotted" },
  { id: "double", label: "Double", preview: "border-double" },
];

const PRESET_DIVIDER_COLORS = [
  { label: "Slate", hex: "#94a3b8" },
  { label: "Zinc", hex: "#71717a" },
  { label: "Purple", hex: "#9D61FF" },
  { label: "Blue", hex: "#3b82f6" },
  { label: "Emerald", hex: "#10b981" },
  { label: "Amber", hex: "#f59e0b" },
  { label: "Rose", hex: "#f43f5e" },
];

export function DividerInspectorPopover({
  divider,
  activeTab,
  onTabChange,
  isOpen,
  anchorRect,
  onClose,
  onUpdateDivider,
}: DividerInspectorPopoverProps) {
  const currentStyle = divider.style || "solid";
  const currentThickness = divider.thickness ?? 1;
  const currentColor = divider.color || "#cbd5e1";
  const currentWidth = divider.width ?? 100;
  const currentAlign = divider.align || "center";
  const currentPaddingY = divider.paddingY ?? 12;
  const currentOpacity = divider.opacity ?? 100;

  const tabsSubHeader = (
    <div className="shrink-0 px-3 pt-1 pb-0.5">
      <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-zinc-800/80 rounded-lg border border-slate-200/60 dark:border-zinc-700/60">
        <button
          type="button"
          onClick={() => onTabChange("style")}
          className={`flex-1 py-0.5 text-[9.5px] font-bold rounded-md transition-all cursor-pointer flex items-center justify-center gap-1 ${
            activeTab === "style"
              ? "bg-white dark:bg-zinc-900 text-[#9D61FF] shadow-xs"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
          }`}
        >
          <Minus className="w-2.5 h-2.5" />
          <span>Line & Style</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange("layout")}
          className={`flex-1 py-0.5 text-[9.5px] font-bold rounded-md transition-all cursor-pointer flex items-center justify-center gap-1 ${
            activeTab === "layout"
              ? "bg-white dark:bg-zinc-900 text-[#9D61FF] shadow-xs"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
          }`}
        >
          <SlidersHorizontal className="w-2.5 h-2.5" />
          <span>Layout & Width</span>
        </button>
      </div>
    </div>
  );

  const footer = (
    <div className="shrink-0 flex items-center justify-between px-3 py-1.5 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/70">
      <span className="text-[9px] font-mono text-slate-500 dark:text-zinc-400 capitalize">
        {currentThickness}px {currentStyle} • {currentWidth}%
      </span>

      <button
        type="button"
        onClick={onClose}
        className="px-3.5 py-1 rounded-lg bg-[#9D61FF] hover:bg-[#8B4CF0] text-white text-[10.5px] font-bold transition-all cursor-pointer shadow-xs"
      >
        Done
      </button>
    </div>
  );

  return (
    <DraggablePopoverShell
      isOpen={isOpen}
      anchorRect={anchorRect}
      onClose={onClose}
      title="Divider Line Inspector"
      headerIcon={<Minus className="w-3 h-3 text-[#9D61FF]" />}
      popoverClassName="portal-divider-inspector"
      ignoreClickSelectors={[".portal-divider-topbar", ".group\\/divider"]}
      pinnedSubHeader={tabsSubHeader}
      footer={footer}
    >
      {activeTab === "style" ? (
        /* Tab 1: Line & Style */
        <div className="space-y-3">
          {/* Line Style Grid */}
          <div>
            <label className="text-[9px] font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
              Line Style
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {LINE_STYLE_OPTIONS.map((opt) => {
                const isSelected = currentStyle === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onUpdateDivider({ style: opt.id })}
                    className={`flex flex-col items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#9D61FF]/10 border-[#9D61FF] text-[#9D61FF] font-bold shadow-2xs"
                        : "bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-slate-300"
                    }`}
                  >
                    <div className="w-full h-3 flex items-center justify-center px-1">
                      <div
                        style={{ borderColor: isSelected ? "#9D61FF" : "currentColor" }}
                        className={`w-full border-t-2 ${opt.preview}`}
                      />
                    </div>
                    <span className="text-[8.5px] mt-0.5">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Line Thickness Slider */}
          <div className="pt-1 border-t border-slate-200/80 dark:border-zinc-800/80">
            <div className="flex items-center justify-between mb-0.5">
              <label className="text-[9px] font-semibold text-slate-700 dark:text-zinc-300">
                Line Thickness
              </label>
              <span className="text-[9px] font-mono font-bold text-[#9D61FF]">
                {currentThickness}px
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="8"
              step="1"
              value={currentThickness}
              onChange={(e) => onUpdateDivider({ thickness: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#9D61FF]"
            />
          </div>

          {/* Line Color & Preset Swatches */}
          <div className="pt-1 border-t border-slate-200/80 dark:border-zinc-800/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[9px] font-semibold text-slate-700 dark:text-zinc-300">
                Line Color
              </label>
              {divider.color && (
                <button
                  type="button"
                  onClick={() => onUpdateDivider({ color: undefined })}
                  className="text-[8.5px] text-[#9D61FF] hover:underline cursor-pointer"
                >
                  Reset Default
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <ColorSwatchPicker
                value={currentColor}
                onChange={(hex) => onUpdateDivider({ color: hex })}
              />
              <input
                type="text"
                value={divider.color || ""}
                onChange={(e) => onUpdateDivider({ color: e.target.value })}
                placeholder="Auto (#cbd5e1)"
                className="flex-1 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-[10px] font-mono text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-[#9D61FF]"
              />
            </div>

            {/* Quick Palette Row */}
            <div className="flex items-center gap-1 pt-0.5">
              {PRESET_DIVIDER_COLORS.map((p) => (
                <button
                  key={p.hex}
                  type="button"
                  onClick={() => onUpdateDivider({ color: p.hex })}
                  title={p.label}
                  className={`w-4 h-4 rounded-full border transition-all cursor-pointer ${
                    currentColor.toLowerCase() === p.hex.toLowerCase()
                      ? "ring-2 ring-[#9D61FF] scale-110"
                      : "border-slate-300 dark:border-zinc-700 hover:scale-105"
                  }`}
                  style={{ backgroundColor: p.hex }}
                />
              ))}
            </div>
          </div>

          {/* Line Opacity Slider */}
          <div className="pt-1 border-t border-slate-200/80 dark:border-zinc-800/80">
            <div className="flex items-center justify-between mb-0.5">
              <label className="text-[9px] font-semibold text-slate-700 dark:text-zinc-300">
                Line Opacity
              </label>
              <span className="text-[9px] font-mono font-bold text-[#9D61FF]">
                {currentOpacity}%
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={currentOpacity}
              onChange={(e) => onUpdateDivider({ opacity: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#9D61FF]"
            />
          </div>
        </div>
      ) : (
        /* Tab 2: Layout & Width */
        <div className="space-y-3">
          {/* Line Width Slider & Quick Presets */}
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <label className="text-[9px] font-semibold text-slate-700 dark:text-zinc-300">
                Line Width
              </label>
              <span className="text-[9px] font-mono font-bold text-[#9D61FF]">
                {currentWidth}%
              </span>
            </div>
            <input
              type="range"
              min="15"
              max="100"
              step="5"
              value={currentWidth}
              onChange={(e) => onUpdateDivider({ width: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#9D61FF]"
            />
            <div className="flex items-center gap-1 mt-1">
              {[25, 50, 75, 100].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => onUpdateDivider({ width: w })}
                  className={`flex-1 py-0.5 rounded text-[8.5px] font-semibold transition-all cursor-pointer ${
                    currentWidth === w
                      ? "bg-[#9D61FF] text-white"
                      : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200"
                  }`}
                >
                  {w}%
                </button>
              ))}
            </div>
          </div>

          {/* Line Alignment */}
          <div className="pt-1 border-t border-slate-200/80 dark:border-zinc-800/80">
            <label className="text-[9px] font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
              Alignment
            </label>
            <div className="grid grid-cols-3 gap-1">
              <button
                type="button"
                onClick={() => onUpdateDivider({ align: "left" })}
                className={`flex items-center justify-center gap-1 py-1 rounded-md text-[9px] font-medium border transition-all cursor-pointer ${
                  currentAlign === "left"
                    ? "bg-[#9D61FF]/10 border-[#9D61FF] text-[#9D61FF] font-bold"
                    : "bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400"
                }`}
              >
                <AlignLeft className="w-3 h-3" />
                <span>Left</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdateDivider({ align: "center" })}
                className={`flex items-center justify-center gap-1 py-1 rounded-md text-[9px] font-medium border transition-all cursor-pointer ${
                  currentAlign === "center"
                    ? "bg-[#9D61FF]/10 border-[#9D61FF] text-[#9D61FF] font-bold"
                    : "bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400"
                }`}
              >
                <AlignCenter className="w-3 h-3" />
                <span>Center</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdateDivider({ align: "right" })}
                className={`flex items-center justify-center gap-1 py-1 rounded-md text-[9px] font-medium border transition-all cursor-pointer ${
                  currentAlign === "right"
                    ? "bg-[#9D61FF]/10 border-[#9D61FF] text-[#9D61FF] font-bold"
                    : "bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400"
                }`}
              >
                <AlignRight className="w-3 h-3" />
                <span>Right</span>
              </button>
            </div>
          </div>

          {/* Vertical Spacing / Padding */}
          <div className="pt-1 border-t border-slate-200/80 dark:border-zinc-800/80">
            <div className="flex items-center justify-between mb-0.5">
              <label className="text-[9px] font-semibold text-slate-700 dark:text-zinc-300">
                Vertical Spacing
              </label>
              <span className="text-[9px] font-mono font-bold text-[#9D61FF]">
                {currentPaddingY}px
              </span>
            </div>
            <input
              type="range"
              min="4"
              max="48"
              step="2"
              value={currentPaddingY}
              onChange={(e) => onUpdateDivider({ paddingY: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#9D61FF]"
            />
          </div>
        </div>
      )}
    </DraggablePopoverShell>
  );
}

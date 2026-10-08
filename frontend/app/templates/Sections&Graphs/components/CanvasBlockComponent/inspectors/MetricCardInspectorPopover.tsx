import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import { LibraryMetricCard } from "@/lib/redux/slices/reportModuleSlice";
import { PALETTE_RAMPS } from "../../constants/chartTypes";
import { ColorSwatchPicker } from "../common/ColorSwatchPicker";
import { DraggablePopoverShell } from "./DraggablePopoverShell";
import { MetricIconPicker } from "./MetricIconPicker";
import { DynamicIconColorsControl } from "./DynamicIconColorsControl";
import { CardDimensionControls } from "./CardDimensionControls";

export interface MetricCardInspectorPopoverProps {
  card: LibraryMetricCard;
  isOpen: boolean;
  anchorRect: DOMRect | null;
  onClose: () => void;
  onUpdateCard: (patch: Partial<LibraryMetricCard>) => void;
}

export function MetricCardInspectorPopover({
  card,
  isOpen,
  anchorRect,
  onClose,
  onUpdateCard,
}: MetricCardInspectorPopoverProps) {
  const [activeTab, setActiveTab] = useState<"content" | "colors">("content");

  const tabsSubHeader = (
    <div className="shrink-0 px-3 pt-1 pb-0.5">
      <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-zinc-800/80 rounded-lg">
        <button
          type="button"
          onClick={() => setActiveTab("content")}
          className={`flex-1 py-0.5 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
            activeTab === "content"
              ? "bg-white dark:bg-zinc-900 text-[#9D61FF] shadow-xs"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
          }`}
        >
          Content & Trend
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("colors")}
          className={`flex-1 py-0.5 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
            activeTab === "colors"
              ? "bg-white dark:bg-zinc-900 text-[#9D61FF] shadow-xs"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
          }`}
        >
          Colors & Style
        </button>
      </div>
    </div>
  );

  const footer = (
    <div className="shrink-0 flex items-center justify-end px-3 py-1.5 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
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
      title="KPI Metric Inspector"
      headerIcon={<Sparkles className="w-3 h-3" />}
      popoverClassName="portal-metric-card-inspector"
      ignoreClickSelectors={[".portal-metric-card-topbar", ".group\\/metric-card"]}
      pinnedSubHeader={tabsSubHeader}
      footer={footer}
    >
      {activeTab === "content" ? (
        <>
          <div className="grid grid-cols-2 gap-1.5">
            <div>
              <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-0.5 text-[9.5px]">
                Metric Value
              </label>
              <input
                type="text"
                value={card.value || ""}
                onChange={(e) => onUpdateCard({ value: e.target.value })}
                placeholder="e.g. 98.4%"
                className="w-full px-2 py-0.5 rounded-md border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 font-mono font-bold text-[11px] text-slate-900 dark:text-white focus:outline-none focus:border-[#9D61FF]"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-0.5 text-[9.5px]">
                Metric Label
              </label>
              <input
                type="text"
                value={card.label || ""}
                onChange={(e) => onUpdateCard({ label: e.target.value })}
                placeholder="e.g. Compliance Rate"
                className="w-full px-2 py-0.5 rounded-md border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-[11px] text-slate-900 dark:text-white focus:outline-none focus:border-[#9D61FF]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <div>
              <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-0.5 text-[9.5px]">
                Trend Indicator
              </label>
              <select
                value={card.trendDirection || "up"}
                onChange={(e) => onUpdateCard({ trendDirection: e.target.value as any })}
                className="w-full px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-[10px] focus:outline-none focus:border-[#9D61FF]"
              >
                <option value="up">▲ Upward Trend</option>
                <option value="down">▼ Downward Trend</option>
                <option value="no-change">— Stable / Flat</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-0.5 text-[9.5px]">
                Comparison Text
              </label>
              <input
                type="text"
                value={card.trendValue || ""}
                onChange={(e) => onUpdateCard({ trendValue: e.target.value })}
                placeholder="e.g. +2.4% vs last shift"
                className="w-full px-2 py-0.5 rounded-md border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-[10.5px] focus:outline-none focus:border-[#9D61FF]"
              />
            </div>
          </div>

          {/* Font Size Sliders */}
          <div className="grid grid-cols-2 gap-1.5 pt-0.5">
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label className="font-semibold text-slate-700 dark:text-zinc-300 text-[9.5px]">
                  Value Font
                </label>
                <span className="font-mono text-[9.5px] font-bold text-[#9D61FF]">
                  {card.fontSizeValue || 20}px
                </span>
              </div>
              <input
                type="range"
                min={12}
                max={36}
                value={card.fontSizeValue || 20}
                onChange={(e) => onUpdateCard({ fontSizeValue: Number(e.target.value) })}
                className="w-full accent-[#9D61FF] cursor-pointer h-1 bg-slate-200 dark:bg-zinc-700 rounded-lg"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label className="font-semibold text-slate-700 dark:text-zinc-300 text-[9.5px]">
                  Label Font
                </label>
                <span className="font-mono text-[9.5px] font-bold text-[#9D61FF]">
                  {card.fontSizeLabel || 10}px
                </span>
              </div>
              <input
                type="range"
                min={8}
                max={18}
                value={card.fontSizeLabel || 10}
                onChange={(e) => onUpdateCard({ fontSizeLabel: Number(e.target.value) })}
                className="w-full accent-[#9D61FF] cursor-pointer h-1 bg-slate-200 dark:bg-zinc-700 rounded-lg"
              />
            </div>
          </div>

          {/* Card Dimensions (Height & Width) */}
          <CardDimensionControls
            customHeight={card.customHeight}
            customWidth={card.customWidth}
            onUpdateHeight={(h) => onUpdateCard({ customHeight: h })}
            onUpdateWidth={(w) => onUpdateCard({ customWidth: w })}
            titlePrefix="Card Sizing (Height & Width)"
            minHeight={50}
            maxHeight={280}
            defaultHeight={90}
            minWidth={70}
            maxWidth={360}
            defaultWidth={150}
          />
        </>
      ) : (
        <>
          {/* 9 Palette Ramps */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1 text-[9.5px]">
              Card Preset Tint
            </label>
            <div className="grid grid-cols-3 gap-1">
              {PALETTE_RAMPS.map((ramp) => (
                <button
                  key={ramp.id}
                  type="button"
                  onClick={() =>
                    onUpdateCard({
                      tintColor: ramp.id,
                      customBgColor: undefined,
                      customBorderColor: undefined,
                    })
                  }
                  className={`p-1 rounded-lg border flex items-center gap-1 cursor-pointer transition-all ${
                    card.tintColor === ramp.id && !card.customBgColor
                      ? "border-[#9D61FF] ring-1.5 ring-purple-500/30 font-bold bg-purple-50 dark:bg-purple-950/30"
                      : "border-slate-200 dark:border-zinc-800 opacity-80 hover:opacity-100"
                  }`}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: ramp.accent }}
                  />
                  <span className="text-[9px] truncate">{ramp.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Colors */}
          <div className="grid grid-cols-2 gap-1.5">
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label className="text-[9px] text-slate-600 dark:text-zinc-400">
                  Background Color
                </label>
                {card.customBgColor && (
                  <button
                    type="button"
                    onClick={() => onUpdateCard({ customBgColor: undefined })}
                    className="text-[8.5px] text-[#9D61FF] hover:underline cursor-pointer font-medium"
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1">
                <ColorSwatchPicker
                  value={card.customBgColor || "#ffffff"}
                  onChange={(hex) => onUpdateCard({ customBgColor: hex })}
                />
                <input
                  type="text"
                  value={card.customBgColor || ""}
                  onChange={(e) => onUpdateCard({ customBgColor: e.target.value })}
                  placeholder="#ffffff"
                  className="flex-1 min-w-0 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-[10px] font-mono text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-[#9D61FF]"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label className="text-[9px] text-slate-600 dark:text-zinc-400">
                  Border Color
                </label>
                {card.customBorderColor && (
                  <button
                    type="button"
                    onClick={() => onUpdateCard({ customBorderColor: undefined })}
                    className="text-[8.5px] text-[#9D61FF] hover:underline cursor-pointer font-medium"
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1">
                <ColorSwatchPicker
                  value={card.customBorderColor || "#e2e8f0"}
                  onChange={(hex) => onUpdateCard({ customBorderColor: hex })}
                />
                <input
                  type="text"
                  value={card.customBorderColor || ""}
                  onChange={(e) => onUpdateCard({ customBorderColor: e.target.value })}
                  placeholder="#e2e8f0"
                  className="flex-1 min-w-0 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-[10px] font-mono text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-[#9D61FF]"
                />
              </div>
            </div>
          </div>

          {/* Dynamic Icon Colors & Shape */}
          <div className="pt-1 border-t border-slate-200/80 dark:border-zinc-800/80 space-y-1">
            <DynamicIconColorsControl
              customIconBg={card.customIconBg}
              customIconColor={card.customIconColor}
              onUpdateIconBg={(bg) => onUpdateCard({ customIconBg: bg })}
              onUpdateIconColor={(color) => onUpdateCard({ customIconColor: color })}
            />

            {/* Icon Shape & Size */}
            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-0.5 text-[9px]">
                  Icon Shape
                </label>
                <div className="grid grid-cols-3 gap-0.5">
                  {(["circle", "rounded", "none"] as const).map((sh) => (
                    <button
                      key={sh}
                      type="button"
                      onClick={() => onUpdateCard({ iconShape: sh })}
                      className={`py-0.5 rounded-md border text-[8.5px] font-bold capitalize transition-all cursor-pointer ${
                        (card.iconShape || "circle") === sh
                          ? "bg-[#9D61FF] text-white border-[#9D61FF]"
                          : "border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800"
                      }`}
                    >
                      {sh}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300 text-[9px]">
                    Icon Size
                  </label>
                  <span className="font-mono text-[9px] font-bold text-[#9D61FF]">
                    {card.iconSize || 14}px
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={28}
                  value={card.iconSize || 14}
                  onChange={(e) => onUpdateCard({ iconSize: Number(e.target.value) })}
                  className="w-full accent-[#9D61FF] cursor-pointer h-1 bg-slate-200 dark:bg-zinc-700 rounded-lg mt-0.5"
                />
              </div>
            </div>
          </div>

          {/* Icon Picker Grid */}
          <MetricIconPicker
            selectedIconId={card.icon || "Shield"}
            onSelectIcon={(iconId) => onUpdateCard({ icon: iconId })}
          />
        </>
      )}
    </DraggablePopoverShell>
  );
}

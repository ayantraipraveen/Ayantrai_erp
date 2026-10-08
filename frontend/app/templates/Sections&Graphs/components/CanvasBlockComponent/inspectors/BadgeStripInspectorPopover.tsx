import React from "react";
import { SlidersHorizontal, Pencil, Plus, Trash2, RotateCcw } from "lucide-react";
import { CanvasBadgeItem, CanvasBadgeStrip } from "@/lib/redux/slices/reportModuleSlice";
import { CONTAINER_BG_PRESETS, CONTAINER_BORDER_PRESETS } from "../common/blockConstants";
import { ColorSwatchPicker } from "../common/ColorSwatchPicker";
import { DraggablePopoverShell } from "./DraggablePopoverShell";
import { BadgeColorPalettePicker } from "./BadgeColorPalettePicker";
import { MetricIconPicker } from "./MetricIconPicker";
import { DynamicIconColorsControl } from "./DynamicIconColorsControl";
import { CardDimensionControls } from "./CardDimensionControls";

export interface BadgeStripInspectorPopoverProps {
  strip: CanvasBadgeStrip;
  selectedBadgeId: string | null;
  activeTab: "badge" | "layout";
  onTabChange: (tab: "badge" | "layout") => void;
  onSelectBadgeId: (id: string) => void;
  isOpen: boolean;
  anchorRect: DOMRect | null;
  onClose: () => void;
  onUpdateSingleBadge: (badgeId: string, patch: Partial<CanvasBadgeItem>) => void;
  onUpdateBadgeStrip: (strip: CanvasBadgeStrip) => void;
  onAddBadge?: () => void;
  onDeleteBadge?: (badgeId: string) => void;
}

export function BadgeStripInspectorPopover({
  strip,
  selectedBadgeId,
  activeTab,
  onTabChange,
  onSelectBadgeId,
  isOpen,
  anchorRect,
  onClose,
  onUpdateSingleBadge,
  onUpdateBadgeStrip,
  onAddBadge,
  onDeleteBadge,
}: BadgeStripInspectorPopoverProps) {
  const activeBadge = strip.badges.find((b) => b.id === selectedBadgeId) || strip.badges[0];
  const activeBadgeIdx = strip.badges.findIndex((b) => b.id === (activeBadge?.id || selectedBadgeId));

  if (!activeBadge) return null;

  const pinnedSubHeader = (
    <>
      {/* Inside Badge Switcher Bar (Pinned) */}
      <div className="shrink-0 flex items-center gap-1 px-3 py-1 bg-slate-50/70 dark:bg-zinc-900/70 border-b border-slate-200/80 dark:border-zinc-800/80 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {strip.badges.map((b, idx) => {
          const isCurrent = (selectedBadgeId || strip.badges[0]?.id) === b.id;
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => {
                onSelectBadgeId(b.id);
                if (activeTab !== "badge") onTabChange("badge");
              }}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isCurrent
                  ? "bg-[#9D61FF] text-white shadow-xs font-bold"
                  : "bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-[#9D61FF] border border-slate-200 dark:border-zinc-700"
              }`}
            >
              <span className="opacity-70 text-[8.5px]">#{idx + 1}</span>
              <span className="truncate max-w-[85px]">{b.label || b.value}</span>
            </button>
          );
        })}
        {strip.badges.length < 8 && (
          <button
            type="button"
            onClick={() => onAddBadge?.()}
            className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[8.5px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 whitespace-nowrap cursor-pointer transition-colors"
            title="Add metric card"
          >
            <Plus className="w-2.5 h-2.5" />
            <span>Add</span>
          </button>
        )}
      </div>

      {/* Sub Tabs (Pinned) */}
      <div className="shrink-0 px-3 pt-1 pb-0.5">
        <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-zinc-800/80 rounded-lg border border-slate-200/60 dark:border-zinc-700/60">
          <button
            type="button"
            onClick={() => onTabChange("badge")}
            className={`flex-1 py-0.5 text-[10px] font-bold rounded-md transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === "badge"
                ? "bg-white dark:bg-zinc-900 text-[#9D61FF] shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            <Pencil className="w-2.5 h-2.5" />
            <span>Card Properties</span>
          </button>
          <button
            type="button"
            onClick={() => onTabChange("layout")}
            className={`flex-1 py-0.5 text-[10px] font-bold rounded-md transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === "layout"
                ? "bg-white dark:bg-zinc-900 text-[#9D61FF] shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            <SlidersHorizontal className="w-2.5 h-2.5" />
            <span>Strip Layout</span>
          </button>
        </div>
      </div>
    </>
  );

  const footer = (
    <div className="shrink-0 flex items-center justify-between px-3 py-1.5 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/70">
      <span className="text-[9px] font-medium text-slate-500 dark:text-zinc-400">
        Card #{activeBadgeIdx + 1} of {strip.badges.length}
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
      title="Metric Strip Inspector"
      headerIcon={<SlidersHorizontal className="w-3 h-3" />}
      popoverClassName="portal-badge-strip-inspector"
      ignoreClickSelectors={[
        ".portal-strip-top-actions",
        ".group\\/badge-strip",
        ".group\\/single-badge",
      ]}
      pinnedSubHeader={pinnedSubHeader}
      footer={footer}
    >
      {activeTab === "badge" ? (
        <>
          {/* Value & Label */}
          <div className="grid grid-cols-2 gap-1.5">
            <div>
              <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-0.5 text-[9.5px]">
                Card Value
              </label>
              <input
                type="text"
                value={activeBadge.value}
                onChange={(e) => onUpdateSingleBadge(activeBadge.id, { value: e.target.value })}
                placeholder="e.g. 98.7%"
                className="w-full px-2 py-0.5 rounded-md border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 font-mono font-bold text-[11px] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#9D61FF] focus:border-[#9D61FF]"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-0.5 text-[9.5px]">
                Card Label
              </label>
              <input
                type="text"
                value={activeBadge.label}
                onChange={(e) => onUpdateSingleBadge(activeBadge.id, { label: e.target.value })}
                placeholder="e.g. Attendance"
                className="w-full px-2 py-0.5 rounded-md border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-[11px] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#9D61FF] focus:border-[#9D61FF]"
              />
            </div>
          </div>

          {/* Color Palette Ramps (1 Row of 10) */}
          <BadgeColorPalettePicker
            activePaletteId={activeBadge.color}
            isCustomColorActive={Boolean(activeBadge.customBgColor)}
            onSelectPalette={(paletteId) =>
              onUpdateSingleBadge(activeBadge.id, {
                color: paletteId as any,
                customBgColor: undefined,
                customBorderColor: undefined,
                customTextColor: undefined,
                customIconColor: undefined,
                customIconBg: undefined,
              })
            }
          />

          {/* Custom Card Colors */}
          <div className="grid grid-cols-2 gap-1.5">
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label className="text-[9px] text-slate-600 dark:text-zinc-400">
                  Custom Background
                </label>
                {activeBadge.customBgColor && (
                  <button
                    type="button"
                    onClick={() => onUpdateSingleBadge(activeBadge.id, { customBgColor: undefined })}
                    className="text-[8.5px] text-[#9D61FF] hover:underline cursor-pointer font-medium"
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1">
                <ColorSwatchPicker
                  value={activeBadge.customBgColor || "#ffffff"}
                  onChange={(hex) => onUpdateSingleBadge(activeBadge.id, { customBgColor: hex })}
                />
                <input
                  type="text"
                  value={activeBadge.customBgColor || ""}
                  onChange={(e) => onUpdateSingleBadge(activeBadge.id, { customBgColor: e.target.value })}
                  placeholder="#ffffff"
                  className="flex-1 min-w-0 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-[10px] font-mono text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-[#9D61FF]"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label className="text-[9px] text-slate-600 dark:text-zinc-400">
                  Custom Border
                </label>
                {activeBadge.customBorderColor && (
                  <button
                    type="button"
                    onClick={() => onUpdateSingleBadge(activeBadge.id, { customBorderColor: undefined })}
                    className="text-[8.5px] text-[#9D61FF] hover:underline cursor-pointer font-medium"
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1">
                <ColorSwatchPicker
                  value={activeBadge.customBorderColor || "#e2e8f0"}
                  onChange={(hex) => onUpdateSingleBadge(activeBadge.id, { customBorderColor: hex })}
                />
                <input
                  type="text"
                  value={activeBadge.customBorderColor || ""}
                  onChange={(e) => onUpdateSingleBadge(activeBadge.id, { customBorderColor: e.target.value })}
                  placeholder="#e2e8f0"
                  className="flex-1 min-w-0 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-[10px] font-mono text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-[#9D61FF]"
                />
              </div>
            </div>
          </div>

          {/* Single Card Sizing (Height & Width) */}
          <CardDimensionControls
            customHeight={activeBadge.customHeight}
            customWidth={activeBadge.customWidth}
            onUpdateHeight={(h) => onUpdateSingleBadge(activeBadge.id, { customHeight: h })}
            onUpdateWidth={(w) => onUpdateSingleBadge(activeBadge.id, { customWidth: w })}
            titlePrefix={`Card Sizing (Card #${activeBadgeIdx + 1})`}
            badgeTag="Custom"
            minHeight={50}
            maxHeight={280}
            defaultHeight={90}
            minWidth={60}
            maxWidth={280}
            defaultWidth={110}
          />

          {/* Icon Settings & Dynamic Colors */}
          <div className="pt-1 border-t border-slate-200/80 dark:border-zinc-800/80 space-y-1">
            {/* Row 1: Shape & Size */}
            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-0.5 text-[9px]">
                  Icon Shape
                </label>
                <div className="grid grid-cols-4 gap-0.5">
                  {(["circle", "rounded", "square", "none"] as const).map((sh) => {
                    const label = sh === "rounded" ? "Round" : sh === "circle" ? "Circle" : sh === "square" ? "Square" : "None";
                    return (
                      <button
                        key={sh}
                        type="button"
                        onClick={() => onUpdateSingleBadge(activeBadge.id, { iconShape: sh })}
                        className={`py-0.5 rounded-md border text-[8.5px] font-bold capitalize transition-all cursor-pointer ${
                          (activeBadge.iconShape || "rounded") === sh
                            ? "bg-[#9D61FF] text-white border-[#9D61FF] shadow-xs"
                            : "border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300 text-[9px]">
                    Icon Size
                  </label>
                  <span className="font-mono text-[9px] font-bold text-[#9D61FF]">
                    {activeBadge.iconSize || 18}px
                  </span>
                </div>
                <input
                  type="range"
                  min={12}
                  max={32}
                  value={activeBadge.iconSize || 18}
                  onChange={(e) => onUpdateSingleBadge(activeBadge.id, { iconSize: Number(e.target.value) })}
                  className="w-full accent-[#9D61FF] cursor-pointer h-1 bg-slate-200 dark:bg-zinc-700 rounded-lg mt-0.5"
                />
              </div>
            </div>

            {/* Row 2: Dynamic Icon Shape Color & Glyph Color */}
            <DynamicIconColorsControl
              customIconBg={activeBadge.customIconBg}
              customIconColor={activeBadge.customIconColor}
              onUpdateIconBg={(bg) => onUpdateSingleBadge(activeBadge.id, { customIconBg: bg })}
              onUpdateIconColor={(color) => onUpdateSingleBadge(activeBadge.id, { customIconColor: color })}
              defaultBgPlaceholder="Auto (Palette)"
              defaultColorPlaceholder="Auto (Palette)"
            />
          </div>

          {/* Icon Symbol Grid with 10 Columns */}
          <MetricIconPicker
            selectedIconId={activeBadge.icon || "Shield"}
            onSelectIcon={(iconId) => onUpdateSingleBadge(activeBadge.id, { icon: iconId })}
          />

          {/* Delete current card if more than 1 */}
          {strip.badges.length > 1 && (
            <div className="pt-0.5">
              <button
                type="button"
                onClick={() => onDeleteBadge?.(activeBadge.id)}
                className="w-full flex items-center justify-center gap-1 py-1 rounded-lg border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors font-semibold text-[10px] cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Remove Card #{activeBadgeIdx + 1}</span>
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Grid Columns */}
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <label className="font-semibold text-slate-700 dark:text-zinc-300 block text-[9.5px]">
                Grid Columns
              </label>
              <div className="flex items-center gap-1">
                <span className="text-[9px] text-slate-500">Custom:</span>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={strip.columns || 2}
                  onChange={(e) => onUpdateBadgeStrip({ ...strip, columns: Math.max(1, Math.min(12, Number(e.target.value) || 1)) })}
                  className="w-8 px-1 py-0.2 text-[9.5px] text-center font-bold font-mono rounded border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-white focus:outline-none focus:border-[#9D61FF]"
                />
                <span className="text-[9px] text-slate-400">cols</span>
              </div>
            </div>
            <div className="grid grid-cols-6 gap-0.5">
              {[1, 2, 3, 4, 5, 6].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onUpdateBadgeStrip({ ...strip, columns: c })}
                  className={`py-0.5 rounded-md border text-[9.5px] font-bold transition-all cursor-pointer ${
                    (strip.columns || 2) === c
                      ? "bg-[#9D61FF] text-white border-[#9D61FF] shadow-xs"
                      : "border-slate-200 dark:border-zinc-800 hover:border-slate-300 text-slate-700 dark:text-zinc-300"
                  }`}
                >
                  {c} Col
                </button>
              ))}
            </div>
          </div>

          {/* Gap & Padding Sliders */}
          <div className="grid grid-cols-2 gap-1.5">
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label className="font-semibold text-slate-700 dark:text-zinc-300 text-[9.5px]">
                  Card Gap
                </label>
                <span className="font-mono text-[9px] font-bold text-[#9D61FF]">
                  {strip.gap !== undefined ? strip.gap : 12}px
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={32}
                value={strip.gap !== undefined ? strip.gap : 12}
                onChange={(e) => onUpdateBadgeStrip({ ...strip, gap: Number(e.target.value) })}
                className="w-full accent-[#9D61FF] cursor-pointer h-1"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label className="font-semibold text-slate-700 dark:text-zinc-300 text-[9.5px]">
                  Padding
                </label>
                <span className="font-mono text-[9px] font-bold text-[#9D61FF]">
                  {strip.padding !== undefined ? strip.padding : 14}px
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={32}
                value={strip.padding !== undefined ? strip.padding : 14}
                onChange={(e) => onUpdateBadgeStrip({ ...strip, padding: Number(e.target.value) })}
                className="w-full accent-[#9D61FF] cursor-pointer h-1"
              />
            </div>
          </div>

          {/* Transparent Container Toggle */}
          <div className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-800 dark:text-zinc-200 text-[10px]">
                Transparent Container
              </div>
              <div className="text-[8.5px] text-slate-500 dark:text-zinc-400">
                Removes outer card background & border
              </div>
            </div>
            <button
              type="button"
              onClick={() => onUpdateBadgeStrip({ ...strip, isTransparent: !strip.isTransparent })}
              className={`w-7 h-4 rounded-full transition-colors p-0.5 cursor-pointer relative ${
                strip.isTransparent ? "bg-[#9D61FF]" : "bg-slate-300 dark:bg-zinc-700"
              }`}
            >
              <div
                className={`w-3 h-3 rounded-full bg-white transition-transform ${
                  strip.isTransparent ? "translate-x-3" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Border Radius & Border Width */}
          {!strip.isTransparent && (
            <div className="space-y-1.5 pt-0.5">
              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="font-semibold text-slate-700 dark:text-zinc-300 text-[9.5px]">
                      Radius
                    </label>
                    <span className="font-mono text-[9px] font-bold text-[#9D61FF]">
                      {strip.borderRadius !== undefined ? strip.borderRadius : 16}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={32}
                    value={strip.borderRadius !== undefined ? strip.borderRadius : 16}
                    onChange={(e) => onUpdateBadgeStrip({ ...strip, borderRadius: Number(e.target.value) })}
                    className="w-full accent-[#9D61FF] cursor-pointer h-1"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="font-semibold text-slate-700 dark:text-zinc-300 text-[9.5px]">
                      Border
                    </label>
                    <span className="font-mono text-[9px] font-bold text-[#9D61FF]">
                      {strip.borderWidth !== undefined ? strip.borderWidth : 1}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={4}
                    value={strip.borderWidth !== undefined ? strip.borderWidth : 1}
                    onChange={(e) => onUpdateBadgeStrip({ ...strip, borderWidth: Number(e.target.value) })}
                    className="w-full accent-[#9D61FF] cursor-pointer h-1"
                  />
                </div>
              </div>

              {/* Container Bg (Presets + Custom) */}
              <div className="space-y-1 pt-0.5">
                <div className="flex items-center justify-between">
                  <label className="text-[9.5px] font-semibold text-slate-700 dark:text-zinc-300">
                    Container Bg
                  </label>
                  <span className="text-[8.5px] font-mono text-slate-500">
                    {strip.backgroundColor || "#ffffff"}
                  </span>
                </div>
                {/* Preset Swatches */}
                <div className="grid grid-cols-5 gap-1">
                  {CONTAINER_BG_PRESETS.map((p) => {
                    const isSel = (strip.backgroundColor || "#ffffff").toLowerCase() === p.value.toLowerCase();
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => onUpdateBadgeStrip({ ...strip, backgroundColor: p.value })}
                        className={`h-5 rounded-md border text-[8.5px] font-medium flex items-center justify-center gap-0.5 cursor-pointer transition-all ${p.bg} ${p.border} ${
                          isSel ? "ring-1.5 ring-[#9D61FF] scale-105 font-bold" : "hover:scale-102"
                        }`}
                        title={p.label}
                      >
                        <span className="truncate">{p.label}</span>
                      </button>
                    );
                  })}
                </div>
                {/* Custom Color Input */}
                <div className="flex items-center gap-1.5 pt-0.5">
                  <ColorSwatchPicker
                    value={strip.backgroundColor && strip.backgroundColor !== "transparent" ? strip.backgroundColor : "#ffffff"}
                    onChange={(hex) => onUpdateBadgeStrip({ ...strip, backgroundColor: hex })}
                  />
                  <input
                    type="text"
                    value={strip.backgroundColor || ""}
                    onChange={(e) => onUpdateBadgeStrip({ ...strip, backgroundColor: e.target.value })}
                    placeholder="#ffffff or transparent"
                    className="flex-1 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-[10px] font-mono"
                  />
                  {strip.backgroundColor && strip.backgroundColor !== "#ffffff" && (
                    <button
                      type="button"
                      onClick={() => onUpdateBadgeStrip({ ...strip, backgroundColor: "#ffffff" })}
                      className="px-1.5 py-0.5 text-[8.5px] text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 border border-slate-200 dark:border-zinc-800 rounded-md cursor-pointer font-medium"
                      title="Reset to white"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Container Border (Presets + Custom) */}
              <div className="space-y-1 pt-0.5">
                <div className="flex items-center justify-between">
                  <label className="text-[9.5px] font-semibold text-slate-700 dark:text-zinc-300">
                    Container Border
                  </label>
                  <span className="text-[8.5px] font-mono text-slate-500">
                    {strip.borderColor || "#e2e8f0"}
                  </span>
                </div>
                {/* Preset Swatches */}
                <div className="grid grid-cols-5 gap-1">
                  {CONTAINER_BORDER_PRESETS.map((p) => {
                    const isSel = (strip.borderColor || "#e2e8f0").toLowerCase() === p.value.toLowerCase();
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => onUpdateBadgeStrip({ ...strip, borderColor: p.value })}
                        className={`h-5 rounded-md border text-[8.5px] font-medium flex items-center justify-center gap-0.5 cursor-pointer transition-all ${p.bg} ${p.border} ${
                          isSel ? "ring-1.5 ring-[#9D61FF] scale-105 font-bold" : "hover:scale-102"
                        }`}
                        title={p.label}
                      >
                        <span className="truncate">{p.label}</span>
                      </button>
                    );
                  })}
                </div>
                {/* Custom Color Input */}
                <div className="flex items-center gap-1.5 pt-0.5">
                  <ColorSwatchPicker
                    value={strip.borderColor && strip.borderColor !== "transparent" ? strip.borderColor : "#e2e8f0"}
                    onChange={(hex) => onUpdateBadgeStrip({ ...strip, borderColor: hex })}
                  />
                  <input
                    type="text"
                    value={strip.borderColor || ""}
                    onChange={(e) => onUpdateBadgeStrip({ ...strip, borderColor: e.target.value })}
                    placeholder="#e2e8f0 or transparent"
                    className="flex-1 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-[10px] font-mono"
                  />
                  {strip.borderColor && strip.borderColor !== "#e2e8f0" && (
                    <button
                      type="button"
                      onClick={() => onUpdateBadgeStrip({ ...strip, borderColor: "#e2e8f0" })}
                      className="px-1.5 py-0.5 text-[8.5px] text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 border border-slate-200 dark:border-zinc-800 rounded-md cursor-pointer font-medium"
                      title="Reset to default border"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* All Cards Sizing Helper (Reset All to Auto) */}
              <div className="pt-1.5 border-t border-slate-200/80 dark:border-zinc-800/80">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-semibold text-slate-700 dark:text-zinc-300 text-[9.5px]">All Cards Sizing</span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = {
                        ...strip,
                        badges: strip.badges.map((b) => ({ ...b, customHeight: undefined, customWidth: undefined })),
                      };
                      onUpdateBadgeStrip(updated);
                    }}
                    className="text-[8.5px] text-[#9D61FF] hover:underline cursor-pointer font-semibold flex items-center gap-0.5"
                  >
                    <RotateCcw className="w-2 h-2" />
                    <span>Reset All to Auto</span>
                  </button>
                </div>
                <p className="text-[8.5px] text-slate-500">
                  Reset all cards in this strip to auto stretch so they fill the row height and column width evenly.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </DraggablePopoverShell>
  );
}

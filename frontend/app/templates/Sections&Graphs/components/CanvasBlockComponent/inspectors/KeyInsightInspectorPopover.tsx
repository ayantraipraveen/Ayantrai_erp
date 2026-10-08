import React, { useState } from "react";
import {
  Lightbulb,
  SlidersHorizontal,
  CheckSquare,
  Plus,
  Trash2,
  RotateCcw,
  Sparkles,
  LayoutGrid,
  Hash,
  Type,
  Check,
  Circle,
  FileText,
  AlertTriangle,
  BarChart2,
  MessageSquare,
  Shield,
} from "lucide-react";
import {
  LibraryKeyInsightItem,
  KeyInsightBulletItem,
  BulletMarkerStyle,
  KeyInsightVariant,
} from "@/lib/redux/slices/reportModuleSlice";
import { CONTAINER_BG_PRESETS, CONTAINER_BORDER_PRESETS } from "../common/blockConstants";
import { ColorSwatchPicker } from "../common/ColorSwatchPicker";
import { DraggablePopoverShell } from "./DraggablePopoverShell";
import { BadgeColorPalettePicker } from "./BadgeColorPalettePicker";
import { MetricIconPicker } from "./MetricIconPicker";
import { DynamicIconColorsControl } from "./DynamicIconColorsControl";
import { CardDimensionControls } from "./CardDimensionControls";

export interface KeyInsightInspectorPopoverProps {
  insight: LibraryKeyInsightItem;
  selectedItemId: string | null;
  activeTab: "bullets" | "layout";
  onTabChange: (tab: "bullets" | "layout") => void;
  onSelectItemId: (id: string) => void;
  isOpen: boolean;
  anchorRect: DOMRect | null;
  onClose: () => void;
  onUpdateInsight: (patch: Partial<LibraryKeyInsightItem>) => void;
  onUpdateSingleItem?: (itemId: string, patch: Partial<KeyInsightBulletItem>) => void;
  onAddItem?: () => void;
  onDeleteItem?: (itemId: string) => void;
}

const VARIANT_OPTIONS: Array<{ id: KeyInsightVariant; label: string; desc: string; icon: React.FC<{ className?: string }> }> = [
  { id: "columns-numbered", label: "4-Col Numbered", desc: "Horizontal columns with numbered badges", icon: LayoutGrid },
  { id: "columns-titled", label: "4-Col Titled", desc: "Columns with headers and body text", icon: LayoutGrid },
  { id: "vertical-takeaways", label: "Vertical Takeaways", desc: "Compact stacked numbered list", icon: FileText },
  { id: "bullet-observations", label: "Observations Dots", desc: "Clean dot bullets list", icon: BarChart2 },
  { id: "priority-actions", label: "Priority Actions", desc: "Step-by-step action boxes", icon: CheckSquare },
  { id: "risk-factors", label: "Risk Factors", desc: "Warning themed bullet list", icon: AlertTriangle },
  { id: "split-quote", label: "Remarks & Quote", desc: "Text commentary with split quote", icon: MessageSquare },
  { id: "narrative-summary", label: "Narrative Summary", desc: "Rich multi-paragraph commentary", icon: FileText },
  { id: "quote-card", label: "Executive Quote", desc: "Large styled quote block", icon: Sparkles },
  { id: "vision-banner", label: "Vision Banner", desc: "Full-width campaign banner", icon: Shield },
  { id: "single", label: "Single Callout", desc: "Single prominent observation", icon: Lightbulb },
];

const MARKER_STYLE_OPTIONS: Array<{ id: BulletMarkerStyle; label: string; preview: string }> = [
  { id: "number", label: "Numbers", preview: "1, 2" },
  { id: "alpha", label: "Letters", preview: "A, B" },
  { id: "roman", label: "Roman", preview: "I, II" },
  { id: "icon", label: "Icons", preview: "★" },
  { id: "dot", label: "Dots", preview: "•" },
  { id: "check", label: "Checks", preview: "✓" },
  { id: "pill", label: "Pills", preview: "01" },
];

const MARKER_SHAPE_OPTIONS: Array<{ id: "circle" | "rounded" | "square" | "none"; label: string }> = [
  { id: "circle", label: "Circle" },
  { id: "rounded", label: "Rounded" },
  { id: "square", label: "Square" },
  { id: "none", label: "None" },
];

export function KeyInsightInspectorPopover({
  insight,
  selectedItemId,
  activeTab,
  onTabChange,
  onSelectItemId,
  isOpen,
  anchorRect,
  onClose,
  onUpdateInsight,
  onUpdateSingleItem,
  onAddItem,
  onDeleteItem,
}: KeyInsightInspectorPopoverProps) {
  const items = insight.items || [];
  const activeItem = items.find((it) => it.id === selectedItemId) || items[0];
  const activeItemIdx = items.findIndex((it) => it.id === (activeItem?.id || selectedItemId));

  const [colorMode, setColorMode] = useState<"item" | "global">("item");

  const currentVariant = insight.variant || "columns-numbered";
  const currentBulletStyle: BulletMarkerStyle =
    activeItem?.bulletStyle || insight.bulletStyle || (currentVariant === "bullet-observations" ? "dot" : "number");
  const currentBulletShape = insight.bulletShape || "circle";
  const currentBulletSize = insight.bulletSize ?? (currentVariant === "vertical-takeaways" ? 16 : 24);

  const pinnedSubHeader = (
    <>
      {/* Horizontal Bullet Switcher Bar (Pinned) */}
      {items.length > 0 && (
        <div className="shrink-0 flex items-center gap-1 px-3 py-1 bg-slate-50/70 dark:bg-zinc-900/70 border-b border-slate-200/80 dark:border-zinc-800/80 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {items.map((it, idx) => {
            const isCurrent = (selectedItemId || items[0]?.id) === it.id;
            return (
              <button
                key={it.id}
                type="button"
                onClick={() => {
                  onSelectItemId(it.id);
                  if (activeTab !== "bullets") onTabChange("bullets");
                }}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isCurrent
                    ? "bg-[#9D61FF] text-white shadow-xs font-bold"
                    : "bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-[#9D61FF] border border-slate-200 dark:border-zinc-700"
                }`}
              >
                <span className="opacity-70 text-[8.5px]">#{idx + 1}</span>
                <span className="truncate max-w-[85px]">{it.title || `Item ${idx + 1}`}</span>
              </button>
            );
          })}
          {items.length < 12 && onAddItem && (
            <button
              type="button"
              onClick={onAddItem}
              className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[8.5px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 whitespace-nowrap cursor-pointer transition-colors"
              title="Add bullet item"
            >
              <Plus className="w-2.5 h-2.5" />
              <span>Add</span>
            </button>
          )}
        </div>
      )}

      {/* Main Tabs (Pinned) */}
      <div className="shrink-0 px-3 pt-1 pb-0.5">
        <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-zinc-800/80 rounded-lg border border-slate-200/60 dark:border-zinc-700/60">
          <button
            type="button"
            onClick={() => onTabChange("bullets")}
            className={`flex-1 py-0.5 text-[10px] font-bold rounded-md transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === "bullets"
                ? "bg-white dark:bg-zinc-900 text-[#9D61FF] shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            <CheckSquare className="w-2.5 h-2.5" />
            <span>Bullets & Markers</span>
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
            <span>Layout & Frame</span>
          </button>
        </div>
      </div>
    </>
  );

  const footer = (
    <div className="shrink-0 flex items-center justify-between px-3 py-1.5 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/70">
      <span className="text-[9px] font-medium text-slate-500 dark:text-zinc-400">
        {items.length > 0 ? `Bullet #${activeItemIdx + 1} of ${items.length}` : `${currentVariant}`}
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
      title="Key Insights & Bullets Inspector"
      headerIcon={<Lightbulb className="w-3 h-3 text-amber-500" />}
      popoverClassName="portal-insight-inspector"
      ignoreClickSelectors={[
        ".portal-insight-topbar",
        ".group\\/insight-block",
        ".group\\/item",
        ".group\\/row",
        ".group\\/risk",
        ".group\\/obs",
      ]}
      pinnedSubHeader={pinnedSubHeader}
      footer={footer}
    >
      {activeTab === "bullets" ? (
        <div className="space-y-3">
          {/* Section Heading & Title */}
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <label className="text-[9px] font-semibold text-slate-700 dark:text-zinc-300">
                Block Heading
              </label>
              {insight.title && (
                <button
                  type="button"
                  onClick={() => onUpdateInsight({ title: undefined })}
                  className="text-[8.5px] text-[#9D61FF] hover:underline cursor-pointer"
                >
                  Reset Default
                </button>
              )}
            </div>
            <input
              type="text"
              value={insight.title || ""}
              onChange={(e) => onUpdateInsight({ title: e.target.value })}
              placeholder="e.g. Key Insights / Observations"
              className="w-full px-2 py-0.5 rounded-md border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-[10.5px] font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#9D61FF]"
            />
          </div>

          {/* Marker Style Selector (Number, Alpha, Roman, Icon, Dot, Check, Pill) */}
          <div>
            <label className="text-[9px] font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
              Bullet Marker Style
            </label>
            <div className="grid grid-cols-4 gap-1">
              {MARKER_STYLE_OPTIONS.map((opt) => {
                const isSelected = currentBulletStyle === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      if (activeItem && onUpdateSingleItem) {
                        onUpdateSingleItem(activeItem.id, { bulletStyle: opt.id });
                      }
                      onUpdateInsight({ bulletStyle: opt.id });
                    }}
                    className={`px-1.5 py-1 rounded-md text-[9.5px] font-medium border flex flex-col items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#9D61FF]/10 text-[#9D61FF] border-[#9D61FF] font-bold shadow-2xs"
                        : "bg-slate-50 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-[10px] font-bold">{opt.preview}</span>
                    <span className="text-[8px] opacity-80">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* If Icon style is selected: show Icon Picker */}
          {currentBulletStyle === "icon" && (
            <div className="pt-0.5">
              <MetricIconPicker
                selectedIconId={activeItem?.icon || "CheckCircle2"}
                onSelectIcon={(iconId) => {
                  if (activeItem && onUpdateSingleItem) {
                    onUpdateSingleItem(activeItem.id, { icon: iconId });
                  }
                }}
                label="Bullet Glyph Icon"
              />
            </div>
          )}

          {/* Marker Shape & Size */}
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <div>
              <label className="text-[9px] font-semibold text-slate-700 dark:text-zinc-300 block mb-0.5">
                Marker Shape
              </label>
              <div className="grid grid-cols-2 gap-1">
                {MARKER_SHAPE_OPTIONS.map((shape) => {
                  const isSelected = currentBulletShape === shape.id;
                  return (
                    <button
                      key={shape.id}
                      type="button"
                      onClick={() => onUpdateInsight({ bulletShape: shape.id })}
                      className={`px-1 py-0.5 rounded text-[9px] font-medium border text-center transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#9D61FF]/10 text-[#9D61FF] border-[#9D61FF] font-bold"
                          : "bg-slate-50 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800"
                      }`}
                    >
                      {shape.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label className="text-[9px] font-semibold text-slate-700 dark:text-zinc-300">
                  Marker Size
                </label>
                <span className="text-[9px] font-mono font-bold text-[#9D61FF]">
                  {currentBulletSize}px
                </span>
              </div>
              <input
                type="range"
                min="14"
                max="36"
                step="2"
                value={currentBulletSize}
                onChange={(e) => onUpdateInsight({ bulletSize: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#9D61FF]"
              />
            </div>
          </div>

          {/* Dynamic Colors: Shape Background & Glyph Color */}
          <div className="pt-1 border-t border-slate-200/80 dark:border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] font-bold text-slate-800 dark:text-zinc-200">
                Bullet Marker Colors
              </span>
              <div className="flex items-center gap-1 text-[8.5px]">
                <button
                  type="button"
                  onClick={() => setColorMode("item")}
                  className={`px-1.5 py-0.5 rounded ${
                    colorMode === "item" ? "bg-[#9D61FF] text-white font-bold" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  This Bullet
                </button>
                <button
                  type="button"
                  onClick={() => setColorMode("global")}
                  className={`px-1.5 py-0.5 rounded ${
                    colorMode === "global" ? "bg-[#9D61FF] text-white font-bold" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  All Bullets
                </button>
              </div>
            </div>

            <DynamicIconColorsControl
              customIconBg={colorMode === "item" ? activeItem?.customBg : insight.badgeBg}
              customIconColor={colorMode === "item" ? activeItem?.customColor : insight.badgeColor}
              onUpdateIconBg={(bg) => {
                if (colorMode === "item" && activeItem && onUpdateSingleItem) {
                  onUpdateSingleItem(activeItem.id, { customBg: bg });
                } else {
                  onUpdateInsight({ badgeBg: bg });
                }
              }}
              onUpdateIconColor={(color) => {
                if (colorMode === "item" && activeItem && onUpdateSingleItem) {
                  onUpdateSingleItem(activeItem.id, { customColor: color });
                } else {
                  onUpdateInsight({ badgeColor: color });
                }
              }}
              defaultBgPlaceholder="Auto (Palette)"
              defaultColorPlaceholder="#ffffff"
            />

            {/* Quick Palette Row */}
            <BadgeColorPalettePicker
              activePaletteId={activeItem?.color || "blue"}
              isCustomColorActive={Boolean(activeItem?.customBg || activeItem?.customColor)}
              onSelectPalette={(palId) => {
                if (colorMode === "item" && activeItem && onUpdateSingleItem) {
                  onUpdateSingleItem(activeItem.id, {
                    color: palId,
                    customBg: undefined,
                    customColor: undefined,
                  });
                } else {
                  const updatedItems = items.map((it) => ({
                    ...it,
                    color: palId,
                    customBg: undefined,
                    customColor: undefined,
                  }));
                  onUpdateInsight({
                    items: updatedItems,
                    badgeBg: undefined,
                    badgeColor: undefined,
                  });
                }
              }}
              label="Preset Palette"
            />
          </div>

          {/* Active Bullet Item Editor (Title & Text) */}
          {activeItem && (
            <div className="pt-1 border-t border-slate-200/80 dark:border-zinc-800/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[9.5px] font-bold text-slate-800 dark:text-zinc-200">
                  Bullet #{activeItemIdx + 1} Content
                </span>
                {items.length > 1 && onDeleteItem && (
                  <button
                    type="button"
                    onClick={() => onDeleteItem(activeItem.id)}
                    className="flex items-center gap-0.5 text-[8.5px] font-bold text-rose-500 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                    <span>Delete</span>
                  </button>
                )}
              </div>

              <div>
                <label className="text-[9px] font-semibold text-slate-700 dark:text-zinc-300 block mb-0.5">
                  Item Title (Optional)
                </label>
                <input
                  type="text"
                  value={activeItem.title || ""}
                  onChange={(e) => {
                    if (onUpdateSingleItem) {
                      onUpdateSingleItem(activeItem.id, { title: e.target.value });
                    }
                  }}
                  placeholder="e.g. Critical Safety Finding"
                  className="w-full px-2 py-0.5 rounded-md border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-[10.5px] font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#9D61FF]"
                />
              </div>

              <div>
                <label className="text-[9px] font-semibold text-slate-700 dark:text-zinc-300 block mb-0.5">
                  Item Description
                </label>
                <textarea
                  rows={2}
                  value={activeItem.text || ""}
                  onChange={(e) => {
                    if (onUpdateSingleItem) {
                      onUpdateSingleItem(activeItem.id, { text: e.target.value });
                    }
                  }}
                  placeholder="Describe the observation in detail..."
                  className="w-full px-2 py-1 rounded-md border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-[10.5px] text-slate-900 dark:text-white focus:outline-none focus:border-[#9D61FF] resize-none"
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Tab 2: Layout & Frame */
        <div className="space-y-3">
          {/* Variant Selector */}
          <div>
            <label className="text-[9px] font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
              Insight Style & Variant
            </label>
            <div className="grid grid-cols-2 gap-1 max-h-36 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:rgba(157,97,255,0.3)_transparent] p-0.5 border border-slate-200 dark:border-zinc-800 rounded-lg bg-slate-50 dark:bg-zinc-900">
              {VARIANT_OPTIONS.map((v) => {
                const IconComp = v.icon;
                const isSelected = currentVariant === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => onUpdateInsight({ variant: v.id })}
                    className={`flex items-start gap-1.5 p-1 rounded-md text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#9D61FF] text-white shadow-xs font-bold"
                        : "text-slate-700 dark:text-zinc-300 hover:bg-slate-200/70 dark:hover:bg-zinc-800/70"
                    }`}
                  >
                    <IconComp className="w-3 h-3 shrink-0 mt-0.5 opacity-90" />
                    <div className="min-w-0">
                      <div className="text-[9.5px] truncate leading-tight">{v.label}</div>
                      <div className={`text-[7.5px] truncate ${isSelected ? "text-white/80" : "text-slate-400"}`}>
                        {v.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Columns Selector (if column variant) */}
          {(currentVariant === "columns-numbered" || currentVariant === "columns-titled") && (
            <div>
              <label className="text-[9px] font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                Grid Columns
              </label>
              <div className="grid grid-cols-4 gap-1">
                {[1, 2, 3, 4].map((cols) => {
                  const isSelected = (insight.columns || 4) === cols;
                  return (
                    <button
                      key={cols}
                      type="button"
                      onClick={() => onUpdateInsight({ columns: cols })}
                      className={`py-1 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#9D61FF] text-white border-[#9D61FF] shadow-xs"
                          : "bg-slate-50 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 hover:border-slate-300"
                      }`}
                    >
                      {cols} Col
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dimension Controls (Height & Width) */}
          <div className="pt-0.5">
            <CardDimensionControls
              customHeight={insight.customHeight}
              customWidth={insight.customWidth}
              onUpdateHeight={(val) => onUpdateInsight({ customHeight: val })}
              onUpdateWidth={(val) => onUpdateInsight({ customWidth: val })}
              titlePrefix="Block Dimensions"
              minHeight={60}
              maxHeight={400}
              defaultHeight={140}
              minWidth={120}
              maxWidth={800}
              defaultWidth={400}
            />
          </div>

          {/* Spacing: Gap & Padding Sliders */}
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label className="text-[9px] font-semibold text-slate-700 dark:text-zinc-300">
                  Item Gap
                </label>
                <span className="text-[9px] font-mono font-bold text-[#9D61FF]">
                  {insight.gap ?? 12}px
                </span>
              </div>
              <input
                type="range"
                min="4"
                max="32"
                step="2"
                value={insight.gap ?? 12}
                onChange={(e) => onUpdateInsight({ gap: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#9D61FF]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label className="text-[9px] font-semibold text-slate-700 dark:text-zinc-300">
                  Card Padding
                </label>
                <span className="text-[9px] font-mono font-bold text-[#9D61FF]">
                  {insight.padding ?? 16}px
                </span>
              </div>
              <input
                type="range"
                min="4"
                max="32"
                step="2"
                value={insight.padding ?? 16}
                onChange={(e) => onUpdateInsight({ padding: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#9D61FF]"
              />
            </div>
          </div>

          {/* Container Styling: Presets & Custom */}
          <div className="pt-1 border-t border-slate-200/80 dark:border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] font-bold text-slate-800 dark:text-zinc-200">
                Card Background & Frame
              </span>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(insight.isTransparent)}
                  onChange={(e) => onUpdateInsight({ isTransparent: e.target.checked })}
                  className="rounded text-[#9D61FF] focus:ring-0 w-3 h-3 cursor-pointer"
                />
                <span className="text-[8.5px] text-slate-500 font-medium">Transparent</span>
              </label>
            </div>

            {!insight.isTransparent && (
              <>
                {/* Background Color */}
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="text-[9px] font-semibold text-slate-700 dark:text-zinc-300">
                      Background Color
                    </label>
                    {insight.backgroundColor && (
                      <button
                        type="button"
                        onClick={() => onUpdateInsight({ backgroundColor: undefined })}
                        className="text-[8.5px] text-[#9D61FF] hover:underline cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <ColorSwatchPicker
                      value={insight.backgroundColor || "#ffffff"}
                      onChange={(hex) => onUpdateInsight({ backgroundColor: hex })}
                    />
                    <input
                      type="text"
                      value={insight.backgroundColor || ""}
                      onChange={(e) => onUpdateInsight({ backgroundColor: e.target.value })}
                      placeholder="Auto (#ffffff)"
                      className="flex-1 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-[10px] font-mono text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-[#9D61FF]"
                    />
                  </div>
                </div>

                {/* Border Color & Width */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] font-semibold text-slate-700 dark:text-zinc-300 block mb-0.5">
                      Border Color
                    </label>
                    <div className="flex items-center gap-1">
                      <ColorSwatchPicker
                        value={insight.borderColor || "#e2e8f0"}
                        onChange={(hex) => onUpdateInsight({ borderColor: hex })}
                      />
                      <input
                        type="text"
                        value={insight.borderColor || ""}
                        onChange={(e) => onUpdateInsight({ borderColor: e.target.value })}
                        placeholder="#e2e8f0"
                        className="flex-1 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-[10px] font-mono text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-[#9D61FF]"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="text-[9px] font-semibold text-slate-700 dark:text-zinc-300">
                        Border Radius
                      </label>
                      <span className="text-[9px] font-mono font-bold text-[#9D61FF]">
                        {insight.borderRadius ?? 16}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="32"
                      step="2"
                      value={insight.borderRadius ?? 16}
                      onChange={(e) => onUpdateInsight({ borderRadius: Number(e.target.value) })}
                      className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#9D61FF]"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </DraggablePopoverShell>
  );
}

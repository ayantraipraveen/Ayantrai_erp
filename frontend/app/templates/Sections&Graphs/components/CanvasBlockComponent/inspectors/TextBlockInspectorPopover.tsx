import React from "react";
import {
  Type,
  SlidersHorizontal,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Info,
  AlertTriangle,
  CheckCircle2,
  Quote,
  FileText,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { CanvasTextBlock, TextCalloutType } from "@/lib/redux/slices/reportModuleSlice";
import { CONTAINER_BG_PRESETS, CONTAINER_BORDER_PRESETS } from "../common/blockConstants";
import { ColorSwatchPicker } from "../common/ColorSwatchPicker";
import { DraggablePopoverShell } from "./DraggablePopoverShell";
import { CardDimensionControls } from "./CardDimensionControls";

export interface TextBlockInspectorPopoverProps {
  textBlock: CanvasTextBlock;
  activeTab: "typography" | "layout";
  onTabChange: (tab: "typography" | "layout") => void;
  isOpen: boolean;
  anchorRect: DOMRect | null;
  onClose: () => void;
  onUpdateTextBlock: (patch: Partial<CanvasTextBlock>) => void;
}

const CALLOUT_OPTIONS: Array<{
  id: TextCalloutType;
  label: string;
  desc: string;
  icon: React.FC<{ className?: string }>;
  accentColor: string;
}> = [
  { id: "none", label: "Plain Note", desc: "Clean minimalist text card", icon: FileText, accentColor: "#64748B" },
  { id: "info", label: "Information", desc: "Highlighted note with blue accent", icon: Info, accentColor: "#3B82F6" },
  { id: "warning", label: "Warning Alert", desc: "Cautionary note with amber accent", icon: AlertTriangle, accentColor: "#F59E0B" },
  { id: "success", label: "Compliance Pass", desc: "Success observation with emerald accent", icon: CheckCircle2, accentColor: "#10B981" },
  { id: "quote", label: "Executive Quote", desc: "Styled editorial quote in italic serif", icon: Quote, accentColor: "#8B5CF6" },
  { id: "neutral", label: "Neutral Slate", desc: "Understated secondary callout", icon: Sparkles, accentColor: "#475569" },
];

const FONT_SIZE_PRESETS = [
  { label: "11px", size: 11 },
  { label: "13px", size: 13 },
  { label: "14px", size: 14 },
  { label: "16px", size: 16 },
  { label: "18px", size: 18 },
  { label: "22px", size: 22 },
];

export function TextBlockInspectorPopover({
  textBlock,
  activeTab,
  onTabChange,
  isOpen,
  anchorRect,
  onClose,
  onUpdateTextBlock,
}: TextBlockInspectorPopoverProps) {
  if (!isOpen) return null;

  const currentFontSize = textBlock.customFontSize ?? 14;
  const currentAlign = textBlock.textAlign || "left";
  const currentLineHeight = textBlock.lineHeight || "normal";
  const currentCallout = textBlock.calloutType || "none";
  const isTransparent = Boolean(textBlock.isTransparent);

  return (
    <DraggablePopoverShell
      title="Text Block & Notes Inspector"
      headerIcon={<Type className="w-4 h-4 text-[#8B3DFF]" />}
      isOpen={isOpen}
      anchorRect={anchorRect}
      onClose={onClose}
      width={410}
      height={460}
    >
      {/* ── Top Tabs ── */}
      <div className="flex items-center gap-1 p-1 bg-slate-100/80 dark:bg-zinc-800/80 rounded-xl mb-3 border border-slate-200/60 dark:border-zinc-700/60">
        <button
          type="button"
          onClick={() => onTabChange("typography")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "typography"
              ? "bg-white dark:bg-zinc-900 text-[#8B3DFF] shadow-xs"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          <span>Typography & Style</span>
        </button>
        <button
          type="button"
          onClick={() => onTabChange("layout")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "layout"
              ? "bg-white dark:bg-zinc-900 text-[#8B3DFF] shadow-xs"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Dimensions & Frame</span>
        </button>
      </div>

      {/* ── TAB 1: Typography & Style ── */}
      {activeTab === "typography" && (
        <div className="space-y-4">
          {/* 1. Callout / Note Preset Selector */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-2">
              Note & Callout Style
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {CALLOUT_OPTIONS.map((opt) => {
                const IconComponent = opt.icon;
                const isSelected = currentCallout === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      onUpdateTextBlock({ calloutType: opt.id });
                    }}
                    className={`p-2 rounded-xl border text-left flex items-start gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#8B3DFF] bg-purple-500/10 shadow-xs ring-1 ring-[#8B3DFF]/50"
                        : "border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900/60"
                    }`}
                  >
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: `${opt.accentColor}20`, color: opt.accentColor }}
                    >
                      <IconComponent className="w-3 h-3" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate">{opt.label}</p>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400 line-clamp-1">{opt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Font Size Slider & Quick Presets */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/70 border border-slate-200/80 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Font Size ({currentFontSize}px)
              </label>
              <button
                type="button"
                onClick={() => onUpdateTextBlock({ customFontSize: 14 })}
                className="text-[10px] text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
                title="Reset to 14px default"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Reset (14px)</span>
              </button>
            </div>
            <input
              type="range"
              min="10"
              max="36"
              step="1"
              value={currentFontSize}
              onChange={(e) => onUpdateTextBlock({ customFontSize: Number(e.target.value) })}
              className="w-full accent-[#8B3DFF] h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
            />
            {/* Quick Presets */}
            <div className="flex items-center justify-between gap-1 mt-2">
              {FONT_SIZE_PRESETS.map((preset) => (
                <button
                  key={preset.size}
                  type="button"
                  onClick={() => onUpdateTextBlock({ customFontSize: preset.size })}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition-all cursor-pointer ${
                    currentFontSize === preset.size
                      ? "bg-[#8B3DFF] text-white border-[#8B3DFF]"
                      : "bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:border-purple-300"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Text Alignment & Line Spacing */}
          <div className="grid grid-cols-2 gap-3">
            {/* Alignment */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-1.5">
                Alignment
              </label>
              <div className="flex items-center rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-0.5">
                {[
                  { id: "left", icon: AlignLeft, title: "Left" },
                  { id: "center", icon: AlignCenter, title: "Center" },
                  { id: "right", icon: AlignRight, title: "Right" },
                  { id: "justify", icon: AlignJustify, title: "Justify" },
                ].map((item) => {
                  const IconC = item.icon;
                  const isActive = currentAlign === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onUpdateTextBlock({ textAlign: item.id as any })}
                      className={`flex-1 py-1 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#8B3DFF] text-white shadow-xs"
                          : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800"
                      }`}
                      title={item.title}
                    >
                      <IconC className="w-3.5 h-3.5" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Line Height */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-1.5">
                Line Spacing
              </label>
              <div className="flex items-center rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-0.5">
                {[
                  { id: "tight", label: "Tight" },
                  { id: "normal", label: "Normal" },
                  { id: "relaxed", label: "Relaxed" },
                ].map((lh) => {
                  const isActive = currentLineHeight === lh.id;
                  return (
                    <button
                      key={lh.id}
                      type="button"
                      onClick={() => onUpdateTextBlock({ lineHeight: lh.id as any })}
                      className={`flex-1 py-1 text-[10px] font-semibold flex items-center justify-center rounded-lg transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#8B3DFF] text-white shadow-xs"
                          : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800"
                      }`}
                    >
                      {lh.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 4. Text / Font Color */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-1.5">
              Text & Font Color
            </label>
            <div className="flex items-center gap-2">
              <ColorSwatchPicker
                value={textBlock.textColor || "#0F172A"}
                onChange={(color) => onUpdateTextBlock({ textColor: color })}
                className="w-7 h-7"
              />
              <input
                type="text"
                value={textBlock.textColor || ""}
                placeholder="#0F172A"
                onChange={(e) => onUpdateTextBlock({ textColor: e.target.value })}
                className="w-24 px-2 py-1 text-xs font-mono rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200"
              />
              {textBlock.textColor && (
                <button
                  type="button"
                  onClick={() => onUpdateTextBlock({ textColor: undefined })}
                  className="text-[10px] text-slate-400 hover:text-rose-500 cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: Dimensions & Frame ── */}
      {activeTab === "layout" && (
        <div className="space-y-4">
          {/* 1. Card Height & Width Sliders */}
          <CardDimensionControls
            customHeight={textBlock.customHeight}
            customWidth={textBlock.customWidth}
            onUpdateHeight={(val) => onUpdateTextBlock({ customHeight: val })}
            onUpdateWidth={(val) => onUpdateTextBlock({ customWidth: val })}
            titlePrefix="Text Block Sizing"
            minHeight={40}
            maxHeight={600}
            minWidth={140}
            maxWidth={595}
          />

          {/* 2. Inner Padding Slider */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/70 border border-slate-200/80 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Inner Padding ({textBlock.padding ?? 16}px)
              </label>
              <button
                type="button"
                onClick={() => onUpdateTextBlock({ padding: 16 })}
                className="text-[10px] text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
                title="Reset to 16px"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Reset</span>
              </button>
            </div>
            <input
              type="range"
              min="4"
              max="36"
              step="2"
              value={textBlock.padding ?? 16}
              onChange={(e) => onUpdateTextBlock({ padding: Number(e.target.value) })}
              className="w-full accent-[#8B3DFF] h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* 3. Transparent Container Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800">
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">Transparent Container</p>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400">Seamless background & no borders</p>
            </div>
            <input
              type="checkbox"
              checked={isTransparent}
              onChange={(e) => onUpdateTextBlock({ isTransparent: e.target.checked })}
              className="w-4 h-4 accent-[#8B3DFF] cursor-pointer"
            />
          </div>

          {!isTransparent && (
            <>
              {/* 4. Container Background Color */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
                  Background Color
                </label>
                <div className="flex items-center gap-2">
                  <ColorSwatchPicker
                    value={textBlock.backgroundColor || "#ffffff"}
                    onChange={(color) => onUpdateTextBlock({ backgroundColor: color })}
                    className="w-7 h-7"
                  />
                  <input
                    type="text"
                    value={textBlock.backgroundColor || ""}
                    placeholder="#ffffff"
                    onChange={(e) => onUpdateTextBlock({ backgroundColor: e.target.value })}
                    className="w-24 px-2 py-1 text-xs font-mono rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200"
                  />
                  {textBlock.backgroundColor && (
                    <button
                      type="button"
                      onClick={() => onUpdateTextBlock({ backgroundColor: undefined })}
                      className="text-[10px] text-slate-400 hover:text-rose-500 cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>
                {/* Presets */}
                <div className="flex items-center gap-1.5 pt-1">
                  {CONTAINER_BG_PRESETS.slice(0, 6).map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => onUpdateTextBlock({ backgroundColor: preset.value })}
                      className="w-5 h-5 rounded-md border border-slate-200 dark:border-zinc-700 hover:scale-110 transition-transform cursor-pointer"
                      style={{ backgroundColor: preset.value }}
                      title={preset.label}
                    />
                  ))}
                </div>
              </div>

              {/* 5. Container Border Color */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
                  Border Color
                </label>
                <div className="flex items-center gap-2">
                  <ColorSwatchPicker
                    value={textBlock.borderColor || "#E2E8F0"}
                    onChange={(color) => onUpdateTextBlock({ borderColor: color })}
                    className="w-7 h-7"
                  />
                  <input
                    type="text"
                    value={textBlock.borderColor || ""}
                    placeholder="#E2E8F0"
                    onChange={(e) => onUpdateTextBlock({ borderColor: e.target.value })}
                    className="w-24 px-2 py-1 text-xs font-mono rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200"
                  />
                  {textBlock.borderColor && (
                    <button
                      type="button"
                      onClick={() => onUpdateTextBlock({ borderColor: undefined })}
                      className="text-[10px] text-slate-400 hover:text-rose-500 cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>
                {/* Presets */}
                <div className="flex items-center gap-1.5 pt-1">
                  {CONTAINER_BORDER_PRESETS.slice(0, 6).map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => onUpdateTextBlock({ borderColor: preset.value })}
                      className="w-5 h-5 rounded-md border border-slate-200 dark:border-zinc-700 hover:scale-110 transition-transform cursor-pointer"
                      style={{ backgroundColor: preset.value }}
                      title={preset.label}
                    />
                  ))}
                </div>
              </div>

              {/* 6. Border Width & Border Radius Sliders */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900/70 border border-slate-200/80 dark:border-zinc-800">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">
                      Border Width
                    </label>
                    <span className="text-[10px] font-mono font-bold text-[#8B3DFF]">
                      {textBlock.borderWidth ?? 1}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="6"
                    step="1"
                    value={textBlock.borderWidth ?? 1}
                    onChange={(e) => onUpdateTextBlock({ borderWidth: Number(e.target.value) })}
                    className="w-full accent-[#8B3DFF] h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900/70 border border-slate-200/80 dark:border-zinc-800">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">
                      Corner Radius
                    </label>
                    <span className="text-[10px] font-mono font-bold text-[#8B3DFF]">
                      {textBlock.borderRadius ?? 16}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="32"
                    step="2"
                    value={textBlock.borderRadius ?? 16}
                    onChange={(e) => onUpdateTextBlock({ borderRadius: Number(e.target.value) })}
                    className="w-full accent-[#8B3DFF] h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </DraggablePopoverShell>
  );
}

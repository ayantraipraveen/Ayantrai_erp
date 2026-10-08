import React from "react";
import {
  Shapes,
  SlidersHorizontal,
  RotateCw,
  Maximize2,
  Sparkles,
} from "lucide-react";
import { CanvasElementBlock } from "@/lib/redux/slices/reportModuleSlice";
import { ColorSwatchPicker } from "../common/ColorSwatchPicker";
import { DraggablePopoverShell } from "./DraggablePopoverShell";

export interface ElementInspectorPopoverProps {
  element: CanvasElementBlock;
  activeTab: "transform" | "style";
  onTabChange: (tab: "transform" | "style") => void;
  isOpen: boolean;
  anchorRect: DOMRect | null;
  onClose: () => void;
  onUpdateElement: (patch: Partial<CanvasElementBlock>) => void;
}

export function ElementInspectorPopover({
  element,
  activeTab,
  onTabChange,
  isOpen,
  anchorRect,
  onClose,
  onUpdateElement,
}: ElementInspectorPopoverProps) {
  const currentRotation = element.rotation || 0;
  const currentScale = element.scale || 100;
  const currentOpacity = element.opacity !== undefined ? element.opacity : 100;
  const currentColor = element.color;

  const tabsSubHeader = (
    <div className="shrink-0 px-3 pt-1 pb-0.5">
      <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-zinc-800/80 rounded-lg border border-slate-200/60 dark:border-zinc-700/60">
        <button
          type="button"
          onClick={() => onTabChange("transform")}
          className={`flex-1 py-0.5 text-[9.5px] font-bold rounded-md transition-all cursor-pointer flex items-center justify-center gap-1 ${
            activeTab === "transform"
              ? "bg-white dark:bg-zinc-900 text-[#9D61FF] shadow-xs"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
          }`}
        >
          <RotateCw className="w-2.5 h-2.5" />
          <span>Transform & Scale</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange("style")}
          className={`flex-1 py-0.5 text-[9.5px] font-bold rounded-md transition-all cursor-pointer flex items-center justify-center gap-1 ${
            activeTab === "style"
              ? "bg-white dark:bg-zinc-900 text-[#9D61FF] shadow-xs"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
          }`}
        >
          <SlidersHorizontal className="w-2.5 h-2.5" />
          <span>Style & Color</span>
        </button>
      </div>
    </div>
  );

  const footer = (
    <div className="shrink-0 flex items-center justify-between px-3 py-1.5 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/70">
      <span className="text-[9px] font-mono text-slate-500 dark:text-zinc-400">
        Scale: {currentScale}% • Rot: {currentRotation}°
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
      title="Decorative Element Inspector"
      headerIcon={<Shapes className="w-3 h-3 text-[#9D61FF]" />}
      popoverClassName="portal-element-inspector"
      ignoreClickSelectors={[".portal-element-topbar", ".group\\/element"]}
      pinnedSubHeader={tabsSubHeader}
      footer={footer}
    >
      {activeTab === "transform" ? (
        /* Tab 1: Transform & Scale */
        <div className="space-y-3">
          {/* Scale Slider & Presets */}
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <label className="text-[9px] font-semibold text-slate-700 dark:text-zinc-300">
                Element Scale
              </label>
              <span className="text-[9px] font-mono font-bold text-[#9D61FF]">
                {currentScale}%
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="250"
              step="5"
              value={currentScale}
              onChange={(e) => onUpdateElement({ scale: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#9D61FF]"
            />
            <div className="flex items-center gap-1 mt-1">
              {[50, 75, 100, 125, 150].map((sc) => (
                <button
                  key={sc}
                  type="button"
                  onClick={() => onUpdateElement({ scale: sc })}
                  className={`flex-1 py-0.5 rounded text-[8.5px] font-semibold transition-all cursor-pointer ${
                    currentScale === sc
                      ? "bg-[#9D61FF] text-white"
                      : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200"
                  }`}
                >
                  {sc}%
                </button>
              ))}
            </div>
          </div>

          {/* Rotation Slider & Presets */}
          <div className="pt-1 border-t border-slate-200/80 dark:border-zinc-800/80">
            <div className="flex items-center justify-between mb-0.5">
              <label className="text-[9px] font-semibold text-slate-700 dark:text-zinc-300">
                Rotation Angle
              </label>
              <span className="text-[9px] font-mono font-bold text-[#9D61FF]">
                {currentRotation}°
              </span>
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              step="5"
              value={currentRotation}
              onChange={(e) => onUpdateElement({ rotation: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#9D61FF]"
            />
            <div className="flex items-center gap-1 mt-1">
              {[0, 45, 90, 180, -90].map((deg) => (
                <button
                  key={deg}
                  type="button"
                  onClick={() => onUpdateElement({ rotation: deg })}
                  className={`flex-1 py-0.5 rounded text-[8.5px] font-semibold transition-all cursor-pointer ${
                    currentRotation === deg
                      ? "bg-[#9D61FF] text-white"
                      : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200"
                  }`}
                >
                  {deg}°
                </button>
              ))}
            </div>
          </div>

          {/* Opacity Slider */}
          <div className="pt-1 border-t border-slate-200/80 dark:border-zinc-800/80">
            <div className="flex items-center justify-between mb-0.5">
              <label className="text-[9px] font-semibold text-slate-700 dark:text-zinc-300">
                Opacity
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
              onChange={(e) => onUpdateElement({ opacity: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#9D61FF]"
            />
          </div>
        </div>
      ) : (
        /* Tab 2: Style & Color */
        <div className="space-y-3">
          {/* Tint / Color Override */}
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <label className="text-[9px] font-semibold text-slate-700 dark:text-zinc-300">
                Color / Tint Override
              </label>
              {currentColor && (
                <button
                  type="button"
                  onClick={() => onUpdateElement({ color: undefined })}
                  className="text-[8.5px] text-[#9D61FF] hover:underline cursor-pointer"
                >
                  Reset Original
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <ColorSwatchPicker
                value={currentColor || "#9D61FF"}
                onChange={(hex) => onUpdateElement({ color: hex })}
              />
              <input
                type="text"
                value={currentColor || ""}
                onChange={(e) => onUpdateElement({ color: e.target.value })}
                placeholder="Original / Default"
                className="flex-1 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-[10px] font-mono text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-[#9D61FF]"
              />
            </div>
          </div>

          {/* Quick Color Presets */}
          <div className="pt-1 border-t border-slate-200/80 dark:border-zinc-800/80">
            <label className="text-[9px] font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
              Color Palette
            </label>
            <div className="flex items-center gap-1.5">
              {["#9D61FF", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#0f172a", "#64748b"].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onUpdateElement({ color: c })}
                  className={`w-4 h-4 rounded-full border transition-all cursor-pointer ${
                    currentColor?.toLowerCase() === c.toLowerCase()
                      ? "ring-2 ring-[#9D61FF] scale-110"
                      : "border-slate-300 dark:border-zinc-700 hover:scale-105"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </DraggablePopoverShell>
  );
}

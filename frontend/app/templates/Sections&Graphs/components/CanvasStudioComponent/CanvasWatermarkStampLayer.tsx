"use client";

import React from "react";
import { Move, Layers, Check, Trash2 } from "lucide-react";
import { UploadedSvgWatermark, WatermarkStampConfig } from "../../watermark/utils";

export interface WatermarkStampLayerProps {
  activeWatermark: UploadedSvgWatermark | null;
  wmPlacement: string;
  wmOpacity: number;
  wmScale: number;
  wmRotation: number;
  wmXOffset: number;
  wmYOffset: number;
  wmLayer: "back" | "front";
  isDarkPaper: boolean;
  isWatermarkSelected: boolean;
  activeIsPreview: boolean;
  handleWatermarkDragStart: (e: React.MouseEvent) => void;
  handleWatermarkResizeStart: (e: React.MouseEvent) => void;
  onUpdateWatermarkConfig?: (config: Partial<WatermarkStampConfig>) => void;
  onSelectWatermark?: ((w: UploadedSvgWatermark | null) => void) | ((watermarkId: string | null) => void);
  setIsWatermarkSelected: (selected: boolean) => void;
  getPlacementClass: (pos: string) => string;
}

export function WatermarkStampLayer({
  activeWatermark,
  wmPlacement,
  wmOpacity,
  wmScale,
  wmRotation,
  wmXOffset,
  wmYOffset,
  wmLayer,
  isDarkPaper,
  isWatermarkSelected,
  activeIsPreview,
  handleWatermarkDragStart,
  handleWatermarkResizeStart,
  onUpdateWatermarkConfig,
  onSelectWatermark,
  setIsWatermarkSelected,
  getPlacementClass,
}: WatermarkStampLayerProps) {
  if (!activeWatermark?.svgContent) return null;

  return (
    <div
      className={`absolute inset-0 select-none ${isWatermarkSelected ? "z-30" : wmLayer === "back" ? "z-[5]" : "z-20"} overflow-hidden flex p-8 sm:p-12 transition-all duration-300 ${
        getPlacementClass(wmPlacement)
      } ${isWatermarkSelected ? "pointer-events-auto" : "pointer-events-none"}`}
    >
      {wmPlacement === "tiled" ? (
        <div className="grid grid-cols-2 gap-24 w-full h-full p-8 place-items-center">
          {[1, 2, 3, 4].map((idx) => (
            <div
              key={idx}
              style={{
                opacity: wmOpacity * 0.7,
                transform: `translate(${wmXOffset}%, ${wmYOffset}%) rotate(${wmRotation}deg) scale(${wmScale * 0.75})`,
                transformOrigin: "center center",
                mixBlendMode: isDarkPaper ? "screen" : "multiply",
              }}
              className="w-full max-w-[280px] filter select-none"
              dangerouslySetInnerHTML={{ __html: activeWatermark.svgContent }}
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            transform: `translate(${wmXOffset}%, ${wmYOffset}%)`,
            transformOrigin: "center center",
          }}
          className="relative flex items-center justify-center transition-transform duration-75 max-w-full"
        >
          <div
            style={{
              opacity: wmOpacity,
              transform: `rotate(${wmRotation}deg) scale(${wmScale})`,
              transformOrigin: "center center",
              mixBlendMode: isDarkPaper ? "screen" : "multiply",
            }}
            className="w-full max-w-[500px] flex items-center justify-center filter select-none cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              if (!activeIsPreview) setIsWatermarkSelected(true);
            }}
            dangerouslySetInnerHTML={{ __html: activeWatermark.svgContent }}
          />

          {isWatermarkSelected && !activeIsPreview && (
            <div
              className="absolute inset-0 -m-3 border-2 border-[#8B3DFF] rounded-2xl ring-4 ring-[#8B3DFF]/20 pointer-events-auto cursor-move flex items-center justify-center select-none"
              onMouseDown={handleWatermarkDragStart}
              title="Drag to reposition watermark anywhere on page"
            >
              <div
                onMouseDown={handleWatermarkResizeStart}
                className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 rounded-full bg-white dark:bg-black border-2 border-[#8B3DFF] cursor-nwse-resize hover:scale-125 transition-transform"
                title="Drag corner to resize scale"
              />
              <div
                onMouseDown={handleWatermarkResizeStart}
                className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-white dark:bg-black border-2 border-[#8B3DFF] cursor-nesw-resize hover:scale-125 transition-transform"
                title="Drag corner to resize scale"
              />
              <div
                onMouseDown={handleWatermarkResizeStart}
                className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 rounded-full bg-white dark:bg-black border-2 border-[#8B3DFF] cursor-nesw-resize hover:scale-125 transition-transform"
                title="Drag corner to resize scale"
              />
              <div
                onMouseDown={handleWatermarkResizeStart}
                className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-white dark:bg-black border-2 border-[#8B3DFF] cursor-nwse-resize hover:scale-125 transition-transform"
                title="Drag corner to resize scale"
              />

              <div
                className="absolute -top-11 left-1/2 -translate-x-1/2 h-8 px-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-zinc-200 z-50 whitespace-nowrap cursor-default"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <span title="Drag watermark" className="flex items-center">
                  <Move className="w-3.5 h-3.5 text-[#8B3DFF] cursor-move" />
                </span>
                <span className="font-semibold text-slate-600 dark:text-zinc-300 max-w-[120px] truncate">
                  {activeWatermark.name.split(" ")[0]}
                </span>

                <div className="w-px h-3.5 bg-slate-200 dark:bg-zinc-800" />

                <div className="flex items-center gap-1 font-mono">
                  <button
                    type="button"
                    onClick={() => onUpdateWatermarkConfig && onUpdateWatermarkConfig({ scale: Math.max(20, Math.round(wmScale * 100) - 10) })}
                    className="w-5 h-5 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center font-bold text-slate-700 dark:text-zinc-300 cursor-pointer"
                    title="Smaller"
                  >
                    -
                  </button>
                  <span className="text-[#8B3DFF] font-bold px-1 text-[11px]">
                    {Math.round(wmScale * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => onUpdateWatermarkConfig && onUpdateWatermarkConfig({ scale: Math.min(300, Math.round(wmScale * 100) + 10) })}
                    className="w-5 h-5 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center font-bold text-slate-700 dark:text-zinc-300 cursor-pointer"
                    title="Larger"
                  >
                    +
                  </button>
                </div>

                <div className="w-px h-3.5 bg-slate-200 dark:bg-zinc-800" />

                <button
                  type="button"
                  onClick={() => {
                    if (!onUpdateWatermarkConfig) return;
                    const placements = [
                      "center",
                      "top-left",
                      "top-right",
                      "bottom-left",
                      "bottom-right",
                      "tiled",
                    ] as const;
                    const nextIdx = (placements.indexOf(wmPlacement as any) + 1) % placements.length;
                    onUpdateWatermarkConfig({ placement: placements[nextIdx] });
                  }}
                  className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 hover:bg-purple-100 text-[10px] font-mono uppercase text-slate-700 dark:text-zinc-300 cursor-pointer"
                  title="Cycle Placement Location"
                >
                  Pos: {wmPlacement}
                </button>

                <div className="w-px h-3.5 bg-slate-200 dark:bg-zinc-800" />

                <button
                  type="button"
                  onClick={() => onUpdateWatermarkConfig?.({ layer: wmLayer === "back" ? "front" : "back" })}
                  className="w-5 h-5 rounded hover:bg-purple-100 text-slate-600 flex items-center justify-center cursor-pointer"
                  title={wmLayer === "back" ? "Bring watermark in front of page content" : "Send watermark behind page content"}
                  aria-label={wmLayer === "back" ? "Bring watermark forward" : "Send watermark backward"}
                >
                  <Layers className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsWatermarkSelected(false)}
                  className="w-5 h-5 rounded hover:bg-purple-100 text-purple-600 flex items-center justify-center cursor-pointer"
                  title="Done"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>

                {onSelectWatermark && (
                  <button
                    type="button"
                    onClick={() => {
                      (onSelectWatermark as any)(null);
                      setIsWatermarkSelected(false);
                    }}
                    className="w-5 h-5 rounded hover:bg-rose-100 text-rose-500 flex items-center justify-center cursor-pointer"
                    title="Remove Watermark"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

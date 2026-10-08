import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Minus, SlidersHorizontal, Pencil } from "lucide-react";
import { CanvasCell, CanvasDividerBlock } from "@/lib/redux/slices/reportModuleSlice";
import { calculateTopBarPosition } from "../common/blockUtils";
import { DividerInspectorPopover } from "../inspectors/DividerInspectorPopover";

export interface DividerBlockProps {
  cell: CanvasCell;
  isSelected?: boolean;
  isPreview?: boolean;
  onUpdateDivider?: (divider: CanvasDividerBlock) => void;
}

export function DividerBlock({
  cell,
  isSelected,
  isPreview,
  onUpdateDivider,
}: DividerBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [inspectorTab, setInspectorTab] = useState<"style" | "layout">("style");
  const [portalCoords, setPortalCoords] = useState<{ top: number; left: number } | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!isSelected) {
      setIsInspectorOpen(false);
    }
  }, [isSelected]);

  const updatePortalPos = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setAnchorRect(rect);
    setPortalCoords(calculateTopBarPosition(rect));
  }, []);

  useEffect(() => {
    if (isSelected && !isPreview) {
      updatePortalPos();
      const interval = setInterval(updatePortalPos, 400);
      window.addEventListener("scroll", updatePortalPos, true);
      window.addEventListener("resize", updatePortalPos);
      return () => {
        clearInterval(interval);
        window.removeEventListener("scroll", updatePortalPos, true);
        window.removeEventListener("resize", updatePortalPos);
      };
    }
  }, [isSelected, isPreview, updatePortalPos]);

  // Resolve divider options with cell.style fallbacks
  const divider = cell.divider || {};
  const style = divider.style || (cell.style?.borderStyle as "solid" | "dashed" | "dotted" | "double") || "solid";
  const thickness = divider.thickness ?? (cell.style?.borderWidth || 1);
  const color = divider.color || cell.style?.borderColor || "#cbd5e1";
  const width = divider.width ?? 100;
  const align = divider.align || (cell.style?.textAlign as "center" | "left" | "right") || "center";
  const paddingY = divider.paddingY ?? (cell.style?.paddingTop || 12);
  const opacity = divider.opacity !== undefined ? divider.opacity / 100 : 1;

  const handleUpdate = (patch: Partial<CanvasDividerBlock>) => {
    if (onUpdateDivider) {
      onUpdateDivider({
        style,
        thickness,
        color,
        width,
        align,
        paddingY,
        opacity: divider.opacity ?? 100,
        ...patch,
      });
    }
  };

  const alignClass =
    align === "left"
      ? "justify-start"
      : align === "right"
      ? "justify-end"
      : "justify-center";

  return (
    <>
      <div
        ref={containerRef}
        style={{
          paddingTop: `${paddingY}px`,
          paddingBottom: `${paddingY}px`,
        }}
        className={`w-full h-full flex items-center ${alignClass} px-3 transition-all select-none group/divider relative cursor-pointer`}
      >
        <div
          style={{
            width: `${width}%`,
            borderTopWidth: `${thickness}px`,
            borderTopStyle: style,
            borderTopColor: color,
            opacity,
          }}
          className="transition-all"
        />
      </div>

      {/* ── React Portal: Floating Top Action Bar for Divider Block ── */}
      {isSelected && !isPreview && portalCoords && typeof document !== "undefined" &&
        createPortal(
          <div
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              top: `${portalCoords.top}px`,
              left: `${portalCoords.left}px`,
              transform: "translateX(-50%)",
              zIndex: 99999,
            }}
            className="portal-divider-topbar flex items-center gap-1.5 bg-white/98 dark:bg-[#0c1017]/98 border border-slate-200 dark:border-zinc-800 rounded-full px-2.5 py-1 shadow-2xl backdrop-blur-md text-xs select-none pointer-events-auto whitespace-nowrap animate-in fade-in zoom-in-95 duration-100"
          >
            <span className="text-[10px] font-mono font-bold text-[#9D61FF] px-2 py-0.5 rounded-full bg-[#9D61FF]/10 flex items-center gap-1">
              <Minus className="w-2.5 h-2.5" />
              <span>Divider Line</span>
            </span>

            {/* Line Style Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (isInspectorOpen && inspectorTab === "style") {
                  setIsInspectorOpen(false);
                } else {
                  setInspectorTab("style");
                  setIsInspectorOpen(true);
                }
              }}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold transition-all cursor-pointer ${
                isInspectorOpen && inspectorTab === "style"
                  ? "bg-[#9D61FF] text-white shadow-xs"
                  : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Pencil className="w-2.5 h-2.5" />
              <span>Line & Style</span>
            </button>

            {/* Layout & Width Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (isInspectorOpen && inspectorTab === "layout") {
                  setIsInspectorOpen(false);
                } else {
                  setInspectorTab("layout");
                  setIsInspectorOpen(true);
                }
              }}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold transition-all cursor-pointer ${
                isInspectorOpen && inspectorTab === "layout"
                  ? "bg-[#9D61FF] text-white shadow-xs"
                  : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
              }`}
            >
              <SlidersHorizontal className="w-2.5 h-2.5" />
              <span>Layout & Width</span>
            </button>
          </div>,
          document.body
        )}

      {/* ── Floating Inspector Popover Portal ── */}
      {isInspectorOpen && !isPreview && (
        <DividerInspectorPopover
          divider={{
            style,
            thickness,
            color,
            width,
            align,
            paddingY,
            opacity: divider.opacity ?? 100,
          }}
          activeTab={inspectorTab}
          onTabChange={setInspectorTab}
          isOpen={isInspectorOpen}
          anchorRect={anchorRect}
          onClose={() => setIsInspectorOpen(false)}
          onUpdateDivider={handleUpdate}
        />
      )}
    </>
  );
}

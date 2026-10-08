import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Shapes, RotateCw, SlidersHorizontal } from "lucide-react";
import { CanvasCell, CanvasElementBlock } from "@/lib/redux/slices/reportModuleSlice";
import { calculateTopBarPosition } from "../common/blockUtils";
import { ElementInspectorPopover } from "../inspectors/ElementInspectorPopover";

export interface ElementBlockProps {
  cell: CanvasCell;
  isSelected?: boolean;
  isPreview?: boolean;
  onUpdateElement?: (element: CanvasElementBlock) => void;
}

export function ElementBlock({
  cell,
  isSelected,
  isPreview,
  onUpdateElement,
}: ElementBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [inspectorTab, setInspectorTab] = useState<"transform" | "style">("transform");
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

  const elem: CanvasElementBlock | undefined = cell.elementBlock || cell.element;
  if (!elem) return null;

  const rotation = elem.rotation || 0;
  const scale = (elem.scale || 100) / 100;
  const opacity = elem.opacity !== undefined ? elem.opacity / 100 : 1;
  const color = elem.color;

  const handleUpdate = (patch: Partial<CanvasElementBlock>) => {
    if (onUpdateElement) {
      onUpdateElement({
        ...elem,
        ...patch,
      });
    }
  };

  return (
    <>
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center p-2 overflow-hidden select-none group/element relative cursor-pointer"
      >
        <div
          className="w-full h-full flex items-center justify-center transition-transform pointer-events-none"
          style={{
            opacity,
            transform: `rotate(${rotation}deg) scale(${scale})`,
            transformOrigin: "center center",
            color: color || undefined,
          }}
          dangerouslySetInnerHTML={{ __html: elem.svgContent }}
        />
      </div>

      {/* ── React Portal: Floating Top Action Bar for Element Block ── */}
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
            className="portal-element-topbar flex items-center gap-1.5 bg-white/98 dark:bg-[#0c1017]/98 border border-slate-200 dark:border-zinc-800 rounded-full px-2.5 py-1 shadow-2xl backdrop-blur-md text-xs select-none pointer-events-auto whitespace-nowrap animate-in fade-in zoom-in-95 duration-100"
          >
            <span className="text-[10px] font-mono font-bold text-[#9D61FF] px-2 py-0.5 rounded-full bg-[#9D61FF]/10 flex items-center gap-1">
              <Shapes className="w-2.5 h-2.5" />
              <span>{elem.name || "SVG Element"}</span>
            </span>

            {/* Transform & Scale Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (isInspectorOpen && inspectorTab === "transform") {
                  setIsInspectorOpen(false);
                } else {
                  setInspectorTab("transform");
                  setIsInspectorOpen(true);
                }
              }}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold transition-all cursor-pointer ${
                isInspectorOpen && inspectorTab === "transform"
                  ? "bg-[#9D61FF] text-white shadow-xs"
                  : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
              }`}
            >
              <RotateCw className="w-2.5 h-2.5" />
              <span>Transform & Scale</span>
            </button>

            {/* Style & Color Button */}
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
              <SlidersHorizontal className="w-2.5 h-2.5" />
              <span>Style & Color</span>
            </button>
          </div>,
          document.body
        )}

      {/* ── Floating Inspector Popover Portal ── */}
      {isInspectorOpen && !isPreview && (
        <ElementInspectorPopover
          element={elem}
          activeTab={inspectorTab}
          onTabChange={setInspectorTab}
          isOpen={isInspectorOpen}
          anchorRect={anchorRect}
          onClose={() => setIsInspectorOpen(false)}
          onUpdateElement={handleUpdate}
        />
      )}
    </>
  );
}

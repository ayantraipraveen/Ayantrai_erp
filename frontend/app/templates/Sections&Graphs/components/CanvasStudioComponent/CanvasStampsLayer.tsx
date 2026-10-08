"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  RotateCw,
  Trash2,
  Layers,
  Check,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
} from "lucide-react";
import {
  CanvasCoordinateStamp,
  LibraryChartCard,
  CanvasBlockType,
} from "@/lib/redux/types/reportModuleTypes";
import { CanvasBlockRenderer } from "../CanvasBlockComponent";

export interface CanvasStampsLayerProps {
  pageIndex: number;
  stamps?: CanvasCoordinateStamp[];
  activeIsPreview?: boolean;
  onUpdateStamp?: (stampId: string, patch: Partial<CanvasCoordinateStamp>) => void;
  onDeleteStamp?: (stampId: string) => void;
  onDockToGrid?: (stamp: CanvasCoordinateStamp) => void;
  onOpenChartEditor?: (stampId: string, chart: LibraryChartCard) => void;
  onBringToFront?: (stampId: string) => void;
  onSendToBack?: (stampId: string) => void;
  onBringForward?: (stampId: string) => void;
  onSendBackward?: (stampId: string) => void;
  selectedStampId?: string | null;
  onSelectStamp?: (stampId: string | null) => void;
  pageWidth?: number;  // 595
  pageHeight?: number; // 842
  zoom?: number;
  layerFilter?: "all" | "back" | "front";
}

/**
 * Precision Coordinate-based Floating Element Canvas Layer (100% Float-Only Architecture).
 * Renders rich telemetry cards (metrics, charts, insights, text, badge strips) and SVG decorative stamps
 * positioned by exact (x, y) coordinates with 360° rotation, 8-handle resizing, and z-index ordering.
 */
export function CanvasStampsLayer({
  pageIndex,
  stamps = [],
  activeIsPreview = false,
  onUpdateStamp,
  onDeleteStamp,
  onOpenChartEditor,
  onBringToFront,
  onSendToBack,
  onBringForward,
  onSendBackward,
  selectedStampId,
  onSelectStamp,
  zoom = 1,
  layerFilter = "all",
}: CanvasStampsLayerProps) {
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);
  const activeSelectedId = selectedStampId !== undefined ? selectedStampId : internalSelectedId;

  const setSelected = (id: string | null) => {
    if (onSelectStamp) onSelectStamp(id);
    setInternalSelectedId(id);
  };

  // Layer stacking helpers
  const handleBringToFront = (stamp: CanvasCoordinateStamp, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (onBringToFront) {
      onBringToFront(stamp.id);
    }
    if (onUpdateStamp) {
      const allPageStamps = stamps.filter((s) => (s.pageIndex ?? 0) === pageIndex);
      const maxZ = allPageStamps.reduce((max, s) => {
        const z = s.zIndex ?? (s.layer === "back" ? 6 : 25);
        return Math.max(max, z);
      }, 25);
      onUpdateStamp(stamp.id, { layer: "front", zIndex: Math.max(25, maxZ + 1) });
    }
  };

  const handleSendToBack = (stamp: CanvasCoordinateStamp, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (onSendToBack) {
      onSendToBack(stamp.id);
    }
    if (onUpdateStamp) {
      const allPageStamps = stamps.filter((s) => (s.pageIndex ?? 0) === pageIndex);
      const backStamps = allPageStamps.filter((s) => s.id !== stamp.id && s.layer === "back");
      const minZ = backStamps.length > 0
        ? backStamps.reduce((min, s) => Math.min(min, s.zIndex ?? 6), 6)
        : 6;
      onUpdateStamp(stamp.id, { layer: "back", zIndex: Math.max(1, minZ - 1) });
    }
  };

  const handleBringForward = (stamp: CanvasCoordinateStamp, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (onBringForward) {
      onBringForward(stamp.id);
    }
    if (onUpdateStamp) {
      const curZ = stamp.zIndex ?? (stamp.layer === "back" ? 6 : 25);
      if (stamp.layer === "back") {
        if (curZ >= 9) {
          onUpdateStamp(stamp.id, { layer: "front", zIndex: 25 });
        } else {
          onUpdateStamp(stamp.id, { zIndex: curZ + 1 });
        }
      } else {
        onUpdateStamp(stamp.id, { zIndex: curZ + 1 });
      }
    }
  };

  const handleSendBackward = (stamp: CanvasCoordinateStamp, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (onSendBackward) {
      onSendBackward(stamp.id);
    }
    if (onUpdateStamp) {
      const curZ = stamp.zIndex ?? (stamp.layer === "back" ? 6 : 25);
      if (stamp.layer !== "back") {
        if (curZ <= 20) {
          onUpdateStamp(stamp.id, { layer: "back", zIndex: 6 });
        } else {
          onUpdateStamp(stamp.id, { zIndex: curZ - 1 });
        }
      } else {
        onUpdateStamp(stamp.id, { zIndex: Math.max(1, curZ - 1) });
      }
    }
  };

  // Dragging state
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragStartPos = useRef<{ mouseX: number; mouseY: number; stampX: number; stampY: number } | null>(null);

  // Resizing state
  const [resizingId, setResizingId] = useState<string | null>(null);
  const resizeCorner = useRef<"nw" | "ne" | "sw" | "se" | "n" | "s" | "e" | "w" | null>(null);
  const resizeStartPos = useRef<{
    mouseX: number;
    mouseY: number;
    width: number;
    height: number;
    x: number;
    y: number;
    aspectRatio: number;
    isCard: boolean;
  } | null>(null);

  // Rotating state
  const [rotatingId, setRotatingId] = useState<string | null>(null);
  const rotateCenter = useRef<{ centerX: number; centerY: number; startAngle: number; initialRotation: number } | null>(null);

  // Filter stamps that belong to this page, optionally filtered by layer
  const pageStamps = stamps.filter((s) => {
    if ((s.pageIndex ?? 0) !== pageIndex) return false;
    if (layerFilter === "back") return s.layer === "back";
    if (layerFilter === "front") return s.layer !== "back";
    return true;
  });

  // ── Drag to Move ───────────────────────────────────────────────────────────
  const handleDragStart = (e: React.MouseEvent, stamp: CanvasCoordinateStamp) => {
    if (activeIsPreview || stamp.locked) return;
    const target = e.target as HTMLElement;
    // Interactive element guard: don't hijack clicks, text selection, or button clicks
    if (target.closest("input, textarea, button, [contenteditable='true'], .no-drag, [data-editor='true'], a, .dynamic-word-editor")) {
      return;
    }
    e.stopPropagation();
    e.preventDefault();
    setSelected(stamp.id);
    setDraggingId(stamp.id);

    dragStartPos.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      stampX: stamp.x,
      stampY: stamp.y,
    };
  };

  // ── Resize Corner & Edges ──────────────────────────────────────────────────
  const handleResizeStart = (
    e: React.MouseEvent,
    stamp: CanvasCoordinateStamp,
    corner: "nw" | "ne" | "sw" | "se" | "n" | "s" | "e" | "w"
  ) => {
    if (activeIsPreview || stamp.locked) return;
    e.stopPropagation();
    e.preventDefault();
    setResizingId(stamp.id);
    resizeCorner.current = corner;

    const isChart = stamp.elementType === "chart" || Boolean(stamp.chart);
    const isText = stamp.elementType === "text" || Boolean(stamp.textBlock);
    const isInsight = stamp.elementType === "insight" || Boolean(stamp.insight);
    const isMetric = stamp.elementType === "metric-card" || Boolean(stamp.metricCard);
    const isBadgeStrip = stamp.elementType === "badge-strip" || Boolean(stamp.badgeStrip);
    const isCard = isChart || isText || isInsight || isMetric || isBadgeStrip;

    const defaultW = isChart ? 380 : isText ? 360 : isInsight ? 380 : isMetric ? 220 : 120;
    const defaultH = isChart ? 250 : isText ? 120 : isInsight ? 130 : isMetric ? 92 : 120;

    const w = stamp.width || defaultW;
    const h = stamp.height || defaultH;

    resizeStartPos.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      width: w,
      height: h,
      x: stamp.x,
      y: stamp.y,
      aspectRatio: w / Math.max(1, h),
      isCard,
    };
  };

  // ── Rotate Axis Stem Handle ────────────────────────────────────────────────
  const handleRotateStart = (
    e: React.MouseEvent,
    stamp: CanvasCoordinateStamp,
    element: HTMLElement
  ) => {
    if (activeIsPreview || stamp.locked) return;
    e.stopPropagation();
    e.preventDefault();
    setRotatingId(stamp.id);

    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const radians = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    const startAngle = radians * (180 / Math.PI);

    rotateCenter.current = {
      centerX,
      centerY,
      startAngle,
      initialRotation: stamp.rotation || 0,
    };
  };

  // ── Global Mouse Listeners for Drag, Resize & Rotate ───────────────────────
  useEffect(() => {
    if (!draggingId && !resizingId && !rotatingId) return;

    const zoomFactor = zoom || 1;

    const handleMouseMove = (e: MouseEvent) => {
      // 1. Move
      if (draggingId && dragStartPos.current && onUpdateStamp) {
        const dx = (e.clientX - dragStartPos.current.mouseX) / zoomFactor;
        const dy = (e.clientY - dragStartPos.current.mouseY) / zoomFactor;
        let newX = Math.round(dragStartPos.current.stampX + dx);
        let newY = Math.round(dragStartPos.current.stampY + dy);

        // 8px snap-to-grid
        newX = Math.round(newX / 8) * 8;
        newY = Math.round(newY / 8) * 8;

        // Page boundary clamps
        newX = Math.max(8, Math.min(595 - 40, newX));
        newY = Math.max(16, Math.min(842 - 30, newY));

        onUpdateStamp(draggingId, { x: newX, y: newY });
      }

      // 2. Resize
      if (resizingId && resizeStartPos.current && onUpdateStamp && resizeCorner.current) {
        const { mouseX, mouseY, width, height, x, y, aspectRatio, isCard } = resizeStartPos.current;
        const dx = (e.clientX - mouseX) / zoomFactor;
        const dy = (e.clientY - mouseY) / zoomFactor;

        let newW = width;
        let newH = height;
        let newX = x;
        let newY = y;

        if (isCard) {
          // Freeform width & height resizing for cards
          const minW = 100;
          const minH = 32;

          if (resizeCorner.current === "se") {
            newW = Math.max(minW, width + dx);
            newH = Math.max(minH, height + dy);
          } else if (resizeCorner.current === "sw") {
            newW = Math.max(minW, width - dx);
            newH = Math.max(minH, height + dy);
            newX = x + (width - newW);
          } else if (resizeCorner.current === "ne") {
            newW = Math.max(minW, width + dx);
            newH = Math.max(minH, height - dy);
            newY = y + (height - newH);
          } else if (resizeCorner.current === "nw") {
            newW = Math.max(minW, width - dx);
            newH = Math.max(minH, height - dy);
            newX = x + (width - newW);
            newY = y + (height - newH);
          } else if (resizeCorner.current === "s") {
            newH = Math.max(minH, height + dy);
          } else if (resizeCorner.current === "n") {
            newH = Math.max(minH, height - dy);
            newY = y + (height - newH);
          } else if (resizeCorner.current === "e") {
            newW = Math.max(minW, width + dx);
          } else if (resizeCorner.current === "w") {
            newW = Math.max(minW, width - dx);
            newX = x + (width - newW);
          }
        } else {
          // Proportional aspect-ratio resizing for decorative stamps
          if (resizeCorner.current === "se") {
            newW = Math.max(30, width + dx);
            newH = Math.round(newW / aspectRatio);
          } else if (resizeCorner.current === "sw") {
            newW = Math.max(30, width - dx);
            newH = Math.round(newW / aspectRatio);
            newX = x + (width - newW);
          } else if (resizeCorner.current === "ne") {
            newW = Math.max(30, width + dx);
            newH = Math.round(newW / aspectRatio);
            newY = y + (height - newH);
          } else if (resizeCorner.current === "nw") {
            newW = Math.max(30, width - dx);
            newH = Math.round(newW / aspectRatio);
            newX = x + (width - newW);
            newY = y + (height - newH);
          } else if (resizeCorner.current === "s") {
            newH = Math.max(20, height + dy);
            newW = Math.round(newH * aspectRatio);
          } else if (resizeCorner.current === "n") {
            newH = Math.max(20, height - dy);
            newW = Math.round(newH * aspectRatio);
            newY = y + (height - newH);
          } else if (resizeCorner.current === "e") {
            newW = Math.max(30, width + dx);
            newH = Math.round(newW / aspectRatio);
          } else if (resizeCorner.current === "w") {
            newW = Math.max(30, width - dx);
            newH = Math.round(newW / aspectRatio);
            newX = x + (width - newW);
          }
        }

        onUpdateStamp(resizingId, {
          x: Math.round(newX),
          y: Math.round(newY),
          width: Math.round(newW),
          height: Math.round(newH),
        });
      }

      // 3. Rotate on Axis
      if (rotatingId && rotateCenter.current && onUpdateStamp) {
        const { centerX, centerY, startAngle, initialRotation } = rotateCenter.current;
        const currentRadians = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        const currentAngle = currentRadians * (180 / Math.PI);
        const deltaAngle = currentAngle - startAngle;

        let finalAngle = Math.round((initialRotation + deltaAngle) % 360);
        if (finalAngle < 0) finalAngle += 360;

        // Snap to nearest 15° when Shift is held
        if (e.shiftKey) {
          finalAngle = Math.round(finalAngle / 15) * 15;
        }

        onUpdateStamp(rotatingId, { rotation: finalAngle });
      }
    };

    const handleMouseUp = () => {
      setDraggingId(null);
      setResizingId(null);
      setRotatingId(null);
      dragStartPos.current = null;
      resizeStartPos.current = null;
      rotateCenter.current = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggingId, resizingId, rotatingId, onUpdateStamp, zoom]);

  // Click outside to deselect
  useEffect(() => {
    if (!activeSelectedId) return;
    const handleDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        !target?.closest(".canvas-coordinate-stamp") &&
        !target?.closest(".stamp-toolbar-portal") &&
        !target?.closest(".draggable-popover-shell") &&
        !target?.closest("[class*='portal-']") &&
        !target?.closest("[role='dialog']")
      ) {
        setSelected(null);
      }
    };
    window.addEventListener("mousedown", handleDocClick);
    return () => window.removeEventListener("mousedown", handleDocClick);
  }, [activeSelectedId]);

  // Keyboard shortcuts for layer stacking (Ctrl+], Ctrl+[, Ctrl+Shift+], Ctrl+Shift+[)
  useEffect(() => {
    if (!activeSelectedId || activeIsPreview) return;
    const currentStamp = pageStamps.find((s) => s.id === activeSelectedId);
    if (!currentStamp) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          (activeEl as HTMLElement).isContentEditable)
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "]") {
        e.preventDefault();
        if (e.shiftKey) {
          handleBringToFront(currentStamp);
        } else {
          handleBringForward(currentStamp);
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === "[") {
        e.preventDefault();
        if (e.shiftKey) {
          handleSendToBack(currentStamp);
        } else {
          handleSendBackward(currentStamp);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeSelectedId, activeIsPreview, pageStamps]);

  if (pageStamps.length === 0) return null;

  // Determine wrapper z-index and overflow based on layerFilter:
  // When an element in the back layer is selected, elevate its wrapper to z-[55] overflow-visible
  // so dragging handles, rotating stem, and toolbar portals are fully interactive and unclipped.
  const hasSelectedStamp = pageStamps.some((s) => s.id === activeSelectedId && !activeIsPreview);

  const wrapperClass =
    layerFilter === "back"
      ? `absolute inset-0 pointer-events-none ${hasSelectedStamp ? "z-[55] overflow-visible" : "z-[5] overflow-visible"}`
      : layerFilter === "front"
      ? "absolute inset-0 pointer-events-none z-[50] overflow-visible"
      : "absolute inset-0 pointer-events-none z-[20] overflow-visible";

  return (
    <div className={wrapperClass}>
      {pageStamps.map((stamp) => {
        const isSelected = activeSelectedId === stamp.id && !activeIsPreview;
        const isBack = stamp.layer === "back";

        const isChart = stamp.elementType === "chart" || Boolean(stamp.chart);
        const isText = stamp.elementType === "text" || Boolean(stamp.textBlock);
        const isInsight = stamp.elementType === "insight" || Boolean(stamp.insight);
        const isMetric = stamp.elementType === "metric-card" || Boolean(stamp.metricCard);
        const isBadgeStrip = stamp.elementType === "badge-strip" || Boolean(stamp.badgeStrip);
        const isCard = isChart || isText || isInsight || isMetric || isBadgeStrip;

        const defaultW = isChart ? 380 : isText ? 360 : isInsight ? 380 : isMetric ? 220 : 120;
        const defaultH = isChart ? 250 : isText ? 120 : isInsight ? 130 : isMetric ? 92 : 120;

        const width = stamp.width || defaultW;
        const height = stamp.height || defaultH;
        const rotation = stamp.rotation || 0;
        const opacity = (stamp.opacity ?? 100) / 100;

        // Calculate layered stacking zIndex
        const baseZ = isBack ? (stamp.zIndex ?? 6) : (stamp.zIndex ?? 25);
        const effectiveZ = isSelected ? Math.max(50, baseZ + 30) : baseZ;

        return (
          <div
            key={stamp.id}
            id={`canvas-stamp-${stamp.id}`}
            onClick={(e) => {
              e.stopPropagation();
              setSelected(stamp.id);
            }}
            onMouseDown={(e) => handleDragStart(e, stamp)}
            style={{
              position: "absolute",
              left: `${stamp.x}px`,
              top: `${stamp.y}px`,
              width: `${width}px`,
              height: `${height}px`,
              transform: `rotate(${rotation}deg)`,
              transformOrigin: "center center",
              zIndex: effectiveZ,
            }}
            className={`canvas-coordinate-stamp pointer-events-auto cursor-move group/stamp transition-all ${
              isSelected ? "ring-2 ring-[#8B3DFF] ring-dashed" : "hover:ring-1 hover:ring-purple-300/60"
            }`}
          >
            {/* ── 1. Floating Block with Full Visual Fidelity & Word-Style Inline Editing ── */}
            {isCard && (
              <div style={{ opacity }} className="w-full h-full select-none overflow-hidden flex flex-col pointer-events-auto">
                <CanvasBlockRenderer
                  cell={{
                    id: stamp.sourceId || stamp.id,
                    colSpan: 1,
                    customWidth: undefined,
                    customHeight: height,
                    blockType: (stamp.elementType || (stamp.chart ? "chart" : stamp.metricCard ? "metric-card" : stamp.insight ? "insight" : stamp.textBlock ? "text" : stamp.badgeStrip ? "badge-strip" : "text")) as CanvasBlockType,
                    metricCard: stamp.metricCard,
                    chart: stamp.chart,
                    insight: stamp.insight,
                    textBlock: stamp.textBlock,
                    badgeStrip: stamp.badgeStrip,
                  }}
                  isSelected={isSelected}
                  isPreview={activeIsPreview}
                  onUpdateMetricCard={(card) => {
                    if (onUpdateStamp) {
                      onUpdateStamp(stamp.id, {
                        name: card.label || stamp.name,
                        metricCard: card,
                      });
                    }
                  }}
                  onUpdateChart={(chart) => {
                    if (onUpdateStamp) {
                      onUpdateStamp(stamp.id, {
                        name: chart.title || stamp.name,
                        chart,
                      });
                    }
                  }}
                  onOpenChartEditor={() => {
                    if (onOpenChartEditor && stamp.chart) {
                      onOpenChartEditor(stamp.id, stamp.chart);
                    }
                  }}
                  onUpdateInsight={(textOrInsight) => {
                    if (onUpdateStamp) {
                      const updatedInsight = typeof textOrInsight === "string"
                        ? { ...(stamp.insight || { id: stamp.id, text: "" }), text: textOrInsight }
                        : textOrInsight;
                      onUpdateStamp(stamp.id, {
                        name: updatedInsight.title || stamp.name,
                        insight: updatedInsight,
                      });
                    }
                  }}
                  onUpdateTextBlock={(content) => {
                    if (onUpdateStamp) {
                      onUpdateStamp(stamp.id, {
                        textBlock: { id: stamp.id, content },
                      });
                    }
                  }}
                  onUpdateBadgeStrip={(strip) => {
                    if (onUpdateStamp) {
                      onUpdateStamp(stamp.id, { badgeStrip: strip });
                    }
                  }}
                />
              </div>
            )}

            {/* ── 2. Transparent SVG Decorative Stamp ── */}
            {!isCard && (
              <div
                style={{ opacity }}
                className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full select-none"
                dangerouslySetInnerHTML={{ __html: stamp.svgContent || "" }}
              />
            )}

            {/* ── Interactive Transform Handles (Shown when Selected) ── */}
            {isSelected && (
              <>
                {/* 4 Corner Resize Handles */}
                <div
                  onMouseDown={(e) => handleResizeStart(e, stamp, "nw")}
                  className="absolute -top-1.5 -left-1.5 w-3 h-3 rounded-full bg-white dark:bg-black border-2 border-[#8B3DFF] cursor-nwse-resize hover:scale-125 transition-transform shadow-xs z-10"
                  title="Resize (NW)"
                />
                <div
                  onMouseDown={(e) => handleResizeStart(e, stamp, "ne")}
                  className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-white dark:bg-black border-2 border-[#8B3DFF] cursor-nesw-resize hover:scale-125 transition-transform shadow-xs z-10"
                  title="Resize (NE)"
                />
                <div
                  onMouseDown={(e) => handleResizeStart(e, stamp, "sw")}
                  className="absolute -bottom-1.5 -left-1.5 w-3 h-3 rounded-full bg-white dark:bg-black border-2 border-[#8B3DFF] cursor-nesw-resize hover:scale-125 transition-transform shadow-xs z-10"
                  title="Resize (SW)"
                />
                <div
                  onMouseDown={(e) => handleResizeStart(e, stamp, "se")}
                  className="absolute -bottom-1.5 -right-1.5 w-3 h-3 rounded-full bg-white dark:bg-black border-2 border-[#8B3DFF] cursor-nwse-resize hover:scale-125 transition-transform shadow-xs z-10"
                  title="Resize (SE)"
                />

                {/* 4 Edge Resize Handles */}
                <div
                  onMouseDown={(e) => handleResizeStart(e, stamp, "n")}
                  className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-1.5 rounded-full bg-white dark:bg-black border border-[#8B3DFF] cursor-ns-resize hover:scale-125 transition-transform z-10"
                  title="Resize Height (N)"
                />
                <div
                  onMouseDown={(e) => handleResizeStart(e, stamp, "s")}
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1.5 rounded-full bg-white dark:bg-black border border-[#8B3DFF] cursor-ns-resize hover:scale-125 transition-transform z-10"
                  title="Resize Height (S)"
                />
                <div
                  onMouseDown={(e) => handleResizeStart(e, stamp, "w")}
                  className="absolute top-1/2 -left-1 -translate-y-1/2 w-1.5 h-4 rounded-full bg-white dark:bg-black border border-[#8B3DFF] cursor-ew-resize hover:scale-125 transition-transform z-10"
                  title="Resize Width (W)"
                />
                <div
                  onMouseDown={(e) => handleResizeStart(e, stamp, "e")}
                  className="absolute top-1/2 -right-1 -translate-y-1/2 w-1.5 h-4 rounded-full bg-white dark:bg-black border border-[#8B3DFF] cursor-ew-resize hover:scale-125 transition-transform z-10"
                  title="Resize Width (E)"
                />

                {/* 360° Rotate Axis Stem Handle (Top Center) */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center z-10">
                  <div
                    onMouseDown={(e) => {
                      const container = document.getElementById(`canvas-stamp-${stamp.id}`);
                      if (container) handleRotateStart(e, stamp, container);
                    }}
                    className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-125 transition-transform shadow-md"
                    title={`Rotate on axis (Current: ${rotation}°). Hold Shift to snap to 15°.`}
                  >
                    <RotateCw className="w-2.5 h-2.5" />
                  </div>
                  <div className="w-0.5 h-2 bg-purple-600" />
                </div>

                {/* Quick Floating Action Toolbar */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="stamp-toolbar-portal absolute -bottom-9 left-1/2 -translate-x-1/2 bg-white/95 dark:bg-[#0c1017]/95 backdrop-blur-md border border-slate-200 dark:border-zinc-800 rounded-full px-2 py-0.5 shadow-xl flex items-center gap-1 z-20 text-[10px] whitespace-nowrap"
                >
                  <span className="text-[9px] font-mono font-bold text-slate-400 border-r border-slate-200 dark:border-zinc-800 pr-1 mr-0.5">
                    {Math.round(width)}×{Math.round(height)}
                  </span>

                  {/* Stacking Controls */}
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={(e) => handleBringToFront(stamp, e)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold flex items-center gap-0.5 cursor-pointer transition-colors ${
                        !isBack
                          ? "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300"
                          : "hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300"
                      }`}
                      title="Bring to Front (Ctrl+Shift+])"
                    >
                      <ChevronsUp className="w-3 h-3 text-purple-600" />
                      <span>Front</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleSendToBack(stamp, e)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold flex items-center gap-0.5 cursor-pointer transition-colors ${
                        isBack
                          ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                          : "hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300"
                      }`}
                      title="Send to Back (Ctrl+Shift+[)"
                    >
                      <ChevronsDown className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      <span>Back</span>
                    </button>

                    <div className="flex items-center border-l border-slate-200 dark:border-zinc-800 pl-0.5 ml-0.5 gap-0.5">
                      <button
                        type="button"
                        onClick={(e) => handleBringForward(stamp, e)}
                        className="w-4 h-4 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center text-slate-600 dark:text-zinc-300 cursor-pointer"
                        title="Bring Forward 1 level (Ctrl+])"
                      >
                        <ArrowUp className="w-2.5 h-2.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleSendBackward(stamp, e)}
                        className="w-4 h-4 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center text-slate-600 dark:text-zinc-300 cursor-pointer"
                        title="Send Backward 1 level (Ctrl+[)"
                      >
                        <ArrowDown className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>

                  {/* Done / Deselect */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(null);
                    }}
                    className="p-1 rounded text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 cursor-pointer"
                    title="Done"
                  >
                    <Check className="w-3 h-3" />
                  </button>

                  {/* Delete Stamp / Element */}
                  {onDeleteStamp && (
                    <button
                      type="button"
                      onClick={() => onDeleteStamp(stamp.id)}
                      className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                      title={isCard ? "Delete Floating Element" : "Delete Stamp"}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

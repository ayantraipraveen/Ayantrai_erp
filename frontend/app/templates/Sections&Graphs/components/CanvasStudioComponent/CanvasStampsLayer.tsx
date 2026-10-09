"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  RotateCw,
  Trash2,
  Layers,
  Check,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ChevronsUp,
  ChevronsDown,
  ZoomIn,
} from "lucide-react";
import {
  CanvasCoordinateStamp,
  LibraryChartCard,
  CanvasBlockType,
  CanvasTextBlock,
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

function getStampDimensions(stamp: CanvasCoordinateStamp): { width: number; height: number } {
  const isChart = stamp.elementType === "chart" || Boolean(stamp.chart);
  const isText = stamp.elementType === "text" || Boolean(stamp.textBlock);
  const isInsight = stamp.elementType === "insight" || Boolean(stamp.insight);
  const isMetric = stamp.elementType === "metric-card" || Boolean(stamp.metricCard);
  const isBadgeStrip = stamp.elementType === "badge-strip" || Boolean(stamp.badgeStrip);
  const isDivider = stamp.elementType === "divider" || Boolean(stamp.divider);

  const defaultW = isChart ? 380 : isText ? 360 : isInsight ? 380 : isMetric ? 220 : isBadgeStrip ? 547 : isDivider ? 547 : 120;
  const defaultH = isChart ? 250 : isText ? 120 : isInsight ? 130 : isMetric ? 92 : isBadgeStrip ? 70 : isDivider ? 28 : 120;

  const baseW = stamp.width || defaultW;
  const baseH = stamp.height || defaultH;
  const currentScale = stamp.scale ?? stamp.chart?.scale ?? 1;

  return {
    width: !isChart && currentScale !== 1 ? Math.round(baseW * currentScale) : baseW,
    height: !isChart && currentScale !== 1 ? Math.round(baseH * currentScale) : baseH,
  };
}

function clampStampPosition(
  x: number,
  y: number,
  width: number,
  height: number,
  pageWidth: number = 595,
  pageHeight: number = 842
): { x: number; y: number } {
  const maxX = Math.max(0, pageWidth - width);
  const maxY = Math.max(0, pageHeight - height);
  return {
    x: Math.max(0, Math.min(maxX, x)),
    y: Math.max(0, Math.min(maxY, y)),
  };
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
  pageWidth = 595,
  pageHeight = 842,
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

  // Zoom menu popup state for a stamp
  const [activeZoomMenuId, setActiveZoomMenuId] = useState<string | null>(null);

  const handleUpdateScale = (stamp: CanvasCoordinateStamp, nextScale: number) => {
    const rounded = Math.round(nextScale * 100) / 100;
    const patch: Partial<CanvasCoordinateStamp> = { scale: rounded };
    if (stamp.chart) {
      patch.chart = { ...stamp.chart, scale: rounded };
    }
    if (stamp.metricCard) {
      patch.metricCard = { ...stamp.metricCard };
    }
    onUpdateStamp?.(stamp.id, patch);
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
    isChart: boolean;
    scale: number;
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

  const pageStampsRef = useRef(pageStamps);
  pageStampsRef.current = pageStamps;

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
    const isDivider = stamp.elementType === "divider" || Boolean(stamp.divider);
    const isElement = stamp.elementType === "element";
    const isCard = isChart || isText || isInsight || isMetric || isBadgeStrip || isDivider || isElement;

    const defaultW = isChart ? 380 : isText ? 360 : isInsight ? 380 : isMetric ? 220 : isBadgeStrip ? 547 : isDivider ? 547 : 120;
    const defaultH = isChart ? 250 : isText ? 120 : isInsight ? 130 : isMetric ? 92 : isBadgeStrip ? 70 : isDivider ? 28 : 120;

    const w = stamp.width || defaultW;
    const h = stamp.height || defaultH;
    const currentScale = stamp.scale ?? stamp.chart?.scale ?? 1;

    resizeStartPos.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      width: w,
      height: h,
      x: stamp.x,
      y: stamp.y,
      aspectRatio: w / Math.max(1, h),
      isCard,
      isChart,
      scale: currentScale,
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

        const currentStamp = pageStampsRef.current.find((s) => s.id === draggingId);
        const { width: sw, height: sh } = currentStamp
          ? getStampDimensions(currentStamp)
          : { width: 120, height: 120 };
        const clamped = clampStampPosition(newX, newY, sw, sh, pageWidth, pageHeight);

        onUpdateStamp(draggingId, { x: clamped.x, y: clamped.y });
      }

      // 2. Resize
      if (resizingId && resizeStartPos.current && onUpdateStamp && resizeCorner.current) {
        const { mouseX, mouseY, width, height, x, y, aspectRatio, isCard, isChart, scale } = resizeStartPos.current;
        const dx = (e.clientX - mouseX) / zoomFactor;
        const dy = (e.clientY - mouseY) / zoomFactor;

        const isScaledNonChart = !isChart && typeof scale === "number" && scale > 0 && scale !== 1;
        const deltaW = isScaledNonChart ? dx / scale : dx;
        const deltaH = isScaledNonChart ? dy / scale : dy;

        let newW = width;
        let newH = height;
        let newX = x;
        let newY = y;

        if (isCard) {
          // Freeform width & height resizing for cards
          const minW = 100;
          const minH = 32;

          if (resizeCorner.current === "se") {
            newW = Math.max(minW, width + deltaW);
            newH = Math.max(minH, height + deltaH);
          } else if (resizeCorner.current === "sw") {
            newW = Math.max(minW, width - deltaW);
            newH = Math.max(minH, height + deltaH);
          } else if (resizeCorner.current === "ne") {
            newW = Math.max(minW, width + deltaW);
            newH = Math.max(minH, height - deltaH);
          } else if (resizeCorner.current === "nw") {
            newW = Math.max(minW, width - deltaW);
            newH = Math.max(minH, height - deltaH);
          } else if (resizeCorner.current === "s") {
            newH = Math.max(minH, height + deltaH);
          } else if (resizeCorner.current === "n") {
            newH = Math.max(minH, height - deltaH);
          } else if (resizeCorner.current === "e") {
            newW = Math.max(minW, width + deltaW);
          } else if (resizeCorner.current === "w") {
            newW = Math.max(minW, width - deltaW);
          }
        } else {
          // Proportional aspect-ratio resizing for decorative stamps
          if (resizeCorner.current === "se") {
            newW = Math.max(30, width + deltaW);
            newH = Math.round(newW / aspectRatio);
          } else if (resizeCorner.current === "sw") {
            newW = Math.max(30, width - deltaW);
            newH = Math.round(newW / aspectRatio);
          } else if (resizeCorner.current === "ne") {
            newW = Math.max(30, width + deltaW);
            newH = Math.round(newW / aspectRatio);
          } else if (resizeCorner.current === "nw") {
            newW = Math.max(30, width - deltaW);
            newH = Math.round(newW / aspectRatio);
          } else if (resizeCorner.current === "s") {
            newH = Math.max(20, height + deltaH);
            newW = Math.round(newH * aspectRatio);
          } else if (resizeCorner.current === "n") {
            newH = Math.max(20, height - deltaH);
            newW = Math.round(newH * aspectRatio);
          } else if (resizeCorner.current === "e") {
            newW = Math.max(30, width + deltaW);
            newH = Math.round(newW / aspectRatio);
          } else if (resizeCorner.current === "w") {
            newW = Math.max(30, width - deltaW);
            newH = Math.round(newW / aspectRatio);
          }
        }

        const isWest = resizeCorner.current === "sw" || resizeCorner.current === "nw" || resizeCorner.current === "w";
        const isNorth = resizeCorner.current === "ne" || resizeCorner.current === "nw" || resizeCorner.current === "n";

        const origVisibleW = isScaledNonChart ? Math.round(width * scale) : width;
        const origVisibleH = isScaledNonChart ? Math.round(height * scale) : height;
        const newVisibleW = isScaledNonChart ? Math.round(newW * scale) : newW;
        const newVisibleH = isScaledNonChart ? Math.round(newH * scale) : newH;

        if (isWest) {
          newX = x + (origVisibleW - newVisibleW);
        }
        if (isNorth) {
          newY = y + (origVisibleH - newVisibleH);
        }

        const finalW = Math.round(newW);
        const finalH = Math.round(newH);
        const finalX = Math.round(newX);
        const finalY = Math.round(newY);

        const currentStamp = pageStampsRef.current.find((s) => s.id === resizingId);
        const patch: Partial<CanvasCoordinateStamp> = {
          x: finalX,
          y: finalY,
          width: finalW,
          height: finalH,
        };

        if (currentStamp?.chart) {
          patch.chart = {
            ...currentStamp.chart,
            customWidth: finalW,
            customHeight: finalH,
          };
        }
        if (currentStamp?.metricCard) {
          patch.metricCard = {
            ...currentStamp.metricCard,
            customWidth: finalW,
            customHeight: finalH,
          };
        }
        if (currentStamp?.insight) {
          patch.insight = {
            ...currentStamp.insight,
            customWidth: finalW,
            customHeight: finalH,
          };
        }
        if (currentStamp?.textBlock) {
          patch.textBlock = {
            ...currentStamp.textBlock,
            customWidth: finalW,
            customHeight: finalH,
          };
        }
        if (currentStamp?.badgeStrip) {
          patch.badgeStrip = {
            ...currentStamp.badgeStrip,
            customWidth: finalW,
            customHeight: finalH,
          };
        }

        onUpdateStamp(resizingId, patch);
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
  }, [draggingId, resizingId, rotatingId, onUpdateStamp, zoom, pageWidth, pageHeight]);

  // Click outside to deselect & reset zoom menu on selection change
  useEffect(() => {
    setActiveZoomMenuId(null);
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

      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        if (onDeleteStamp) {
          setSelected(null);
          onDeleteStamp(currentStamp.id);
        }
        return;
      }

      // Precision 1px nudge via Keyboard Arrow Keys (Shift for 10px fast movement)
      if (e.key === "ArrowUp") {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const { width: sw, height: sh } = getStampDimensions(currentStamp);
        const { y: newY } = clampStampPosition(currentStamp.x, currentStamp.y - step, sw, sh, pageWidth, pageHeight);
        onUpdateStamp?.(currentStamp.id, { y: newY });
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const { width: sw, height: sh } = getStampDimensions(currentStamp);
        const { y: newY } = clampStampPosition(currentStamp.x, currentStamp.y + step, sw, sh, pageWidth, pageHeight);
        onUpdateStamp?.(currentStamp.id, { y: newY });
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const { width: sw, height: sh } = getStampDimensions(currentStamp);
        const { x: newX } = clampStampPosition(currentStamp.x - step, currentStamp.y, sw, sh, pageWidth, pageHeight);
        onUpdateStamp?.(currentStamp.id, { x: newX });
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const { width: sw, height: sh } = getStampDimensions(currentStamp);
        const { x: newX } = clampStampPosition(currentStamp.x + step, currentStamp.y, sw, sh, pageWidth, pageHeight);
        onUpdateStamp?.(currentStamp.id, { x: newX });
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
      } else if ((e.ctrlKey || e.metaKey) && (e.key === "=" || e.key === "+")) {
        e.preventDefault();
        const curr = currentStamp.scale ?? currentStamp.chart?.scale ?? 1;
        const next = Math.min(2.0, Math.round((curr + 0.1) * 10) / 10);
        handleUpdateScale(currentStamp, next);
      } else if ((e.ctrlKey || e.metaKey) && (e.key === "-" || e.key === "_")) {
        e.preventDefault();
        const curr = currentStamp.scale ?? currentStamp.chart?.scale ?? 1;
        const next = Math.max(0.5, Math.round((curr - 0.1) * 10) / 10);
        handleUpdateScale(currentStamp, next);
      } else if ((e.ctrlKey || e.metaKey) && e.key === "0") {
        e.preventDefault();
        handleUpdateScale(currentStamp, 1.0);
      }
    };

    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".stamp-toolbar-portal")) {
        setActiveZoomMenuId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousedown", handlePointerDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handlePointerDown);
    };
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
        const isDivider = stamp.elementType === "divider" || Boolean(stamp.divider);
        const isElement = stamp.elementType === "element";
        const isCard = isChart || isText || isInsight || isMetric || isBadgeStrip || isDivider || isElement;

        const defaultW = isChart ? 380 : isText ? 360 : isInsight ? 380 : isMetric ? 220 : isBadgeStrip ? 547 : isDivider ? 547 : 120;
        const defaultH = isChart ? 250 : isText ? 120 : isInsight ? 130 : isMetric ? 92 : isBadgeStrip ? 70 : isDivider ? 28 : 120;

        const baseWidth = stamp.width || defaultW;
        const baseHeight = stamp.height || defaultH;
        const rotation = stamp.rotation || 0;
        const opacity = (stamp.opacity ?? 100) / 100;
        const currentScale = stamp.scale ?? stamp.chart?.scale ?? 1;

        const width = !isChart && currentScale !== 1 ? Math.round(baseWidth * currentScale) : baseWidth;
        const height = !isChart && currentScale !== 1 ? Math.round(baseHeight * currentScale) : baseHeight;

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
              <div
                style={{
                  opacity,
                  width: (!isChart && currentScale !== 1) ? `${baseWidth}px` : "100%",
                  height: (!isChart && currentScale !== 1) ? `${baseHeight}px` : "100%",
                  transform: (!isChart && currentScale !== 1) ? `scale(${currentScale})` : undefined,
                  transformOrigin: "top left",
                }}
                className="select-none overflow-hidden flex flex-col pointer-events-auto"
              >
                <CanvasBlockRenderer
                  cell={{
                    id: stamp.sourceId || stamp.id,
                    colSpan: 1,
                    customWidth: baseWidth,
                    customHeight: baseHeight,
                    blockType: (stamp.elementType || (stamp.chart ? "chart" : stamp.metricCard ? "metric-card" : stamp.insight ? "insight" : stamp.textBlock ? "text" : stamp.badgeStrip ? "badge-strip" : stamp.divider ? "divider" : stamp.element ? "element" : "text")) as CanvasBlockType,
                    metricCard: stamp.metricCard ? { ...stamp.metricCard, customWidth: width, customHeight: height } : undefined,
                    chart: stamp.chart ? { ...stamp.chart, customWidth: width, customHeight: height, scale: currentScale } : undefined,
                    insight: stamp.insight ? { ...stamp.insight, customWidth: width, customHeight: height } : undefined,
                    textBlock: stamp.textBlock ? { ...stamp.textBlock, customWidth: width, customHeight: height } : undefined,
                    badgeStrip: stamp.badgeStrip ? { ...stamp.badgeStrip, customWidth: width, customHeight: height } : undefined,
                    divider: stamp.divider,
                    element: stamp.element,
                  }}
                  isSelected={isSelected}
                  isPreview={activeIsPreview}
                  onUpdateMetricCard={(card) => {
                    if (onUpdateStamp) {
                      onUpdateStamp(stamp.id, {
                        name: card.label || stamp.name,
                        metricCard: card,
                        width: card.customWidth ?? stamp.width,
                        height: card.customHeight ?? stamp.height,
                      });
                    }
                  }}
                  onUpdateChart={(chart) => {
                    if (onUpdateStamp) {
                      onUpdateStamp(stamp.id, {
                        name: chart.title || stamp.name,
                        chart,
                        scale: chart.scale ?? stamp.scale,
                        width: chart.customWidth ?? stamp.width,
                        height: chart.customHeight ?? stamp.height,
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
                        width: updatedInsight.customWidth ?? stamp.width,
                        height: updatedInsight.customHeight ?? stamp.height,
                      });
                    }
                  }}
                  onUpdateTextBlock={(contentOrBlock) => {
                    if (onUpdateStamp) {
                      const updatedTb: CanvasTextBlock = typeof contentOrBlock === "string"
                        ? { ...(stamp.textBlock || { id: stamp.id, content: "" }), content: contentOrBlock }
                        : contentOrBlock;
                      onUpdateStamp(stamp.id, {
                        name: updatedTb.title || stamp.name,
                        textBlock: updatedTb,
                        width: updatedTb.customWidth ?? stamp.width,
                        height: updatedTb.customHeight ?? stamp.height,
                      });
                    }
                  }}
                  onUpdateBadgeStrip={(strip) => {
                    if (onUpdateStamp) {
                      onUpdateStamp(stamp.id, {
                        badgeStrip: strip,
                        width: strip.customWidth ?? stamp.width,
                        height: strip.customHeight ?? stamp.height,
                      });
                    }
                  }}
                  onUpdateDivider={(divider) => {
                    if (onUpdateStamp) {
                      onUpdateStamp(stamp.id, {
                        divider,
                        width: stamp.width,
                        height: stamp.height,
                      });
                    }
                  }}
                  onUpdateElement={(element) => {
                    if (onUpdateStamp) {
                      onUpdateStamp(stamp.id, {
                        name: element.name || stamp.name,
                        element,
                        width: stamp.width,
                        height: stamp.height,
                      });
                    }
                  }}
                />
              </div>
            )}

            {/* ── 2. Transparent SVG Decorative Stamp ── */}
            {!isCard && (
              <div
                style={{
                  opacity,
                }}
                className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full select-none pointer-events-none"
                dangerouslySetInnerHTML={{ __html: stamp.svgContent || stamp.element?.svgContent || "" }}
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

                  {/* Zoom Stepper & Quick Presets Menu */}
                  <div className="relative flex items-center border-r border-slate-200 dark:border-zinc-800 pr-1 mr-0.5 gap-0.5" title="Element Zoom & Scale (Ctrl +/-)">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const next = Math.max(0.5, Math.round((currentScale - 0.1) * 10) / 10);
                        handleUpdateScale(stamp, next);
                      }}
                      className="w-4 h-4 rounded hover:bg-purple-100 dark:hover:bg-zinc-800 flex items-center justify-center text-slate-600 dark:text-zinc-300 hover:text-purple-600 cursor-pointer transition-colors text-[11px] font-bold"
                      title="Zoom Out (Ctrl+Minus, min 50%)"
                    >
                      -
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveZoomMenuId(activeZoomMenuId === stamp.id ? null : stamp.id);
                      }}
                      className={`px-1 py-0.5 rounded text-[9.5px] font-mono font-bold flex items-center gap-0.5 cursor-pointer transition-colors ${
                        currentScale !== 1
                          ? "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-extrabold"
                          : "hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300"
                      }`}
                      title="Click for Zoom Presets & Slider"
                    >
                      <ZoomIn className="w-2.5 h-2.5 text-purple-600" />
                      <span>{Math.round(currentScale * 100)}%</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const next = Math.min(2.0, Math.round((currentScale + 0.1) * 10) / 10);
                        handleUpdateScale(stamp, next);
                      }}
                      className="w-4 h-4 rounded hover:bg-purple-100 dark:hover:bg-zinc-800 flex items-center justify-center text-slate-600 dark:text-zinc-300 hover:text-purple-600 cursor-pointer transition-colors text-[11px] font-bold"
                      title="Zoom In (Ctrl+Plus, max 200%)"
                    >
                      +
                    </button>

                    {/* Quick Zoom Presets Popover */}
                    {activeZoomMenuId === stamp.id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 bg-white/95 dark:bg-[#0c1017]/95 backdrop-blur-md border border-slate-200 dark:border-zinc-800 rounded-xl p-2.5 shadow-2xl z-30 min-w-[190px] flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between text-[10px] font-semibold text-slate-700 dark:text-zinc-300">
                          <span className="flex items-center gap-1">
                            <ZoomIn className="w-3 h-3 text-[#9D61FF]" />
                            <span>Element Zoom</span>
                          </span>
                          <span className="font-mono font-bold text-[#9D61FF] bg-purple-50 dark:bg-purple-950/50 px-1 rounded">
                            {Math.round(currentScale * 100)}%
                          </span>
                        </div>

                        {/* Interactive Slider */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[8px] text-slate-400 font-mono">50%</span>
                          <input
                            type="range"
                            min="0.5"
                            max="2.0"
                            step="0.05"
                            value={currentScale}
                            onChange={(e) => handleUpdateScale(stamp, parseFloat(e.target.value))}
                            className="flex-1 h-1 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#9D61FF]"
                          />
                          <span className="text-[8px] text-slate-400 font-mono">200%</span>
                        </div>

                        {/* Preset Chips */}
                        <div className="grid grid-cols-3 gap-1">
                          {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => {
                                handleUpdateScale(stamp, preset);
                              }}
                              className={`py-0.5 px-1 rounded text-[9px] font-mono font-semibold transition-colors cursor-pointer text-center ${
                                Math.abs(currentScale - preset) < 0.02
                                  ? "bg-[#9D61FF] text-white shadow-2xs font-bold"
                                  : "bg-slate-100 dark:bg-zinc-800 hover:bg-purple-100 dark:hover:bg-purple-950/40 text-slate-600 dark:text-zinc-300"
                              }`}
                            >
                              {preset === 1.0 ? "100% Reset" : `${Math.round(preset * 100)}%`}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

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

                    {/* 1px Precision Drag/Nudge Controls */}
                    <div className="flex items-center border-l border-slate-200 dark:border-zinc-800 pl-0.5 ml-0.5 gap-0.5" title="Move 1px (Arrow keys, Shift for 10px)">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const step = e.shiftKey ? 10 : 1;
                          const { x: newX } = clampStampPosition(stamp.x - step, stamp.y, width, height, pageWidth, pageHeight);
                          onUpdateStamp?.(stamp.id, { x: newX });
                        }}
                        className="w-4 h-4 rounded hover:bg-purple-100 dark:hover:bg-zinc-800 flex items-center justify-center text-slate-600 dark:text-zinc-300 hover:text-purple-600 cursor-pointer transition-colors"
                        title="Nudge 1px Left (ArrowLeft, Shift for 10px)"
                      >
                        <ArrowLeft className="w-2.5 h-2.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const step = e.shiftKey ? 10 : 1;
                          const { y: newY } = clampStampPosition(stamp.x, stamp.y - step, width, height, pageWidth, pageHeight);
                          onUpdateStamp?.(stamp.id, { y: newY });
                        }}
                        className="w-4 h-4 rounded hover:bg-purple-100 dark:hover:bg-zinc-800 flex items-center justify-center text-slate-600 dark:text-zinc-300 hover:text-purple-600 cursor-pointer transition-colors"
                        title="Nudge 1px Up (ArrowUp, Shift for 10px)"
                      >
                        <ArrowUp className="w-2.5 h-2.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const step = e.shiftKey ? 10 : 1;
                          const { y: newY } = clampStampPosition(stamp.x, stamp.y + step, width, height, pageWidth, pageHeight);
                          onUpdateStamp?.(stamp.id, { y: newY });
                        }}
                        className="w-4 h-4 rounded hover:bg-purple-100 dark:hover:bg-zinc-800 flex items-center justify-center text-slate-600 dark:text-zinc-300 hover:text-purple-600 cursor-pointer transition-colors"
                        title="Nudge 1px Down (ArrowDown, Shift for 10px)"
                      >
                        <ArrowDown className="w-2.5 h-2.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const step = e.shiftKey ? 10 : 1;
                          const { x: newX } = clampStampPosition(stamp.x + step, stamp.y, width, height, pageWidth, pageHeight);
                          onUpdateStamp?.(stamp.id, { x: newX });
                        }}
                        className="w-4 h-4 rounded hover:bg-purple-100 dark:hover:bg-zinc-800 flex items-center justify-center text-slate-600 dark:text-zinc-300 hover:text-purple-600 cursor-pointer transition-colors"
                        title="Nudge 1px Right (ArrowRight, Shift for 10px)"
                      >
                        <ArrowRight className="w-2.5 h-2.5" />
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
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setSelected(null);
                        onDeleteStamp(stamp.id);
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                      }}
                      className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors"
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

"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  RotateCw,
  Trash2,
  Layers,
  Check,
  LayoutGrid,
} from "lucide-react";
import { CanvasCoordinateStamp } from "@/lib/redux/types/reportModuleTypes";
import ChartRenderer from "../ChartComponent/ChartRenderer";

export interface CanvasStampsLayerProps {
  pageIndex: number;
  stamps?: CanvasCoordinateStamp[];
  activeIsPreview?: boolean;
  onUpdateStamp?: (stampId: string, patch: Partial<CanvasCoordinateStamp>) => void;
  onDeleteStamp?: (stampId: string) => void;
  onDockToGrid?: (stamp: CanvasCoordinateStamp) => void;
  selectedStampId?: string | null;
  onSelectStamp?: (stampId: string | null) => void;
  pageWidth?: number;  // 595
  pageHeight?: number; // 842
}

/**
 * Precision Coordinate-based Stamp / Chart / Element Canvas Layer.
 * Renders SVG stamps (100% transparent, borderless) and floating charts positioned by exact (x, y) coordinates.
 * Features:
 * - Freeform drag repositioning anywhere across page
 * - 4-corner resizing (proportional for stamps, freeform for charts)
 * - Top stem handle for free 360° center-axis rotation
 * - Quick preset toolbar (rotation presets, opacity, layer front/back, dock-to-grid, delete)
 */
export function CanvasStampsLayer({
  pageIndex,
  stamps = [],
  activeIsPreview = false,
  onUpdateStamp,
  onDeleteStamp,
  onDockToGrid,
  selectedStampId,
  onSelectStamp,
  pageWidth = 595,
  pageHeight = 842,
}: CanvasStampsLayerProps) {
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);
  const activeSelectedId = selectedStampId !== undefined ? selectedStampId : internalSelectedId;

  const setSelected = (id: string | null) => {
    if (onSelectStamp) onSelectStamp(id);
    setInternalSelectedId(id);
  };

  // Dragging state
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragStartPos = useRef<{ mouseX: number; mouseY: number; stampX: number; stampY: number } | null>(null);

  // Resizing state
  const [resizingId, setResizingId] = useState<string | null>(null);
  const resizeCorner = useRef<"nw" | "ne" | "sw" | "se" | null>(null);
  const resizeStartPos = useRef<{
    mouseX: number;
    mouseY: number;
    width: number;
    height: number;
    x: number;
    y: number;
    aspectRatio: number;
    isChart: boolean;
  } | null>(null);

  // Rotating state
  const [rotatingId, setRotatingId] = useState<string | null>(null);
  const rotateCenter = useRef<{ centerX: number; centerY: number; startAngle: number; initialRotation: number } | null>(null);

  // Filter stamps that belong to this page
  const pageStamps = stamps.filter((s) => (s.pageIndex ?? 0) === pageIndex);

  // ── Drag to Move ───────────────────────────────────────────────────────────
  const handleDragStart = (e: React.MouseEvent, stamp: CanvasCoordinateStamp) => {
    if (activeIsPreview || stamp.locked) return;
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

  // ── Resize Corner ──────────────────────────────────────────────────────────
  const handleResizeStart = (
    e: React.MouseEvent,
    stamp: CanvasCoordinateStamp,
    corner: "nw" | "ne" | "sw" | "se"
  ) => {
    if (activeIsPreview || stamp.locked) return;
    e.stopPropagation();
    e.preventDefault();
    setResizingId(stamp.id);
    resizeCorner.current = corner;

    const isChart = stamp.elementType === "chart" || Boolean(stamp.chart);
    const w = stamp.width || (isChart ? 380 : 120);
    const h = stamp.height || (isChart ? 250 : 120);
    resizeStartPos.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      width: w,
      height: h,
      x: stamp.x,
      y: stamp.y,
      aspectRatio: w / Math.max(1, h),
      isChart,
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

    const handleMouseMove = (e: MouseEvent) => {
      // 1. Move
      if (draggingId && dragStartPos.current && onUpdateStamp) {
        const dx = e.clientX - dragStartPos.current.mouseX;
        const dy = e.clientY - dragStartPos.current.mouseY;
        const newX = Math.round(dragStartPos.current.stampX + dx);
        const newY = Math.round(dragStartPos.current.stampY + dy);
        onUpdateStamp(draggingId, { x: newX, y: newY });
      }

      // 2. Resize
      if (resizingId && resizeStartPos.current && onUpdateStamp && resizeCorner.current) {
        const { mouseX, mouseY, width, height, x, y, aspectRatio, isChart } = resizeStartPos.current;
        const dx = e.clientX - mouseX;
        const dy = e.clientY - mouseY;

        let newW = width;
        let newH = height;
        let newX = x;
        let newY = y;

        if (isChart) {
          // Freeform width & height resizing for charts
          if (resizeCorner.current === "se") {
            newW = Math.max(180, width + dx);
            newH = Math.max(120, height + dy);
          } else if (resizeCorner.current === "sw") {
            newW = Math.max(180, width - dx);
            newH = Math.max(120, height + dy);
            newX = x + (width - newW);
          } else if (resizeCorner.current === "ne") {
            newW = Math.max(180, width + dx);
            newH = Math.max(120, height - dy);
            newY = y + (height - newH);
          } else if (resizeCorner.current === "nw") {
            newW = Math.max(180, width - dx);
            newH = Math.max(120, height - dy);
            newX = x + (width - newW);
            newY = y + (height - newH);
          }
        } else {
          // Proportional aspect-ratio resizing for stamps
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

        // Snap to nearest 45° or 15° when Shift is held
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
  }, [draggingId, resizingId, rotatingId, onUpdateStamp]);

  // Click outside to deselect
  useEffect(() => {
    if (!activeSelectedId) return;
    const handleDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        !target?.closest(".canvas-coordinate-stamp") &&
        !target?.closest(".stamp-toolbar-portal")
      ) {
        setSelected(null);
      }
    };
    window.addEventListener("mousedown", handleDocClick);
    return () => window.removeEventListener("mousedown", handleDocClick);
  }, [activeSelectedId]);

  if (pageStamps.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
      {pageStamps.map((stamp) => {
        const isSelected = activeSelectedId === stamp.id && !activeIsPreview;
        const isDragging = draggingId === stamp.id;
        const isResizing = resizingId === stamp.id;
        const isRotating = rotatingId === stamp.id;
        const isBack = stamp.layer === "back";
        const isChart = stamp.elementType === "chart" || Boolean(stamp.chart);
        const width = stamp.width || (isChart ? 380 : 120);
        const height = stamp.height || (isChart ? 250 : 120);
        const rotation = stamp.rotation || 0;
        const opacity = (stamp.opacity ?? 100) / 100;

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
              zIndex: isSelected ? 40 : isBack ? 6 : 25,
            }}
            className={`canvas-coordinate-stamp pointer-events-auto cursor-move group/stamp transition-shadow ${
              isSelected ? "ring-2 ring-[#8B3DFF] ring-dashed" : "hover:ring-1 hover:ring-purple-300/60"
            }`}
          >
            {/* ── Content: Floating Chart Card OR Transparent SVG Stamp ── */}
            {isChart && stamp.chart ? (
              <div
                style={{ opacity }}
                className="w-full h-full rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white/95 dark:bg-[#0c1017]/95 p-3.5 shadow-lg flex flex-col justify-between overflow-hidden select-none"
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-2 pb-1 border-b border-slate-100 dark:border-zinc-800/60 flex-shrink-0">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {stamp.chart.title || stamp.name}
                    </h3>
                    {stamp.chart.description && (
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">
                        {stamp.chart.description}
                      </p>
                    )}
                  </div>
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-purple-500/10 text-[#8B3DFF] font-bold flex-shrink-0">
                    {stamp.chart.chartType}
                  </span>
                </div>

                {/* Live Chart Renderer */}
                <div
                  style={{
                    pointerEvents: isDragging || isResizing || isRotating ? "none" : "auto",
                  }}
                  className="flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden py-1"
                >
                  <ChartRenderer
                    chart={stamp.chart}
                    color={stamp.chart.color || stamp.chart.colors?.[0] || "#9D61FF"}
                    colors={stamp.chart.colors}
                    gridRows={stamp.chart.gridRows}
                    gridCols={stamp.chart.gridCols}
                    height={Math.max(60, height - 70)}
                  />
                </div>
              </div>
            ) : (
              <div
                style={{ opacity }}
                className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full drop-shadow-sm select-none"
                dangerouslySetInnerHTML={{ __html: stamp.svgContent || "" }}
              />
            )}

            {/* ── Interactive Transform Handles (Shown when Selected) ── */}
            {isSelected && (
              <>
                {/* 4 Corner Resize Handles */}
                <div
                  onMouseDown={(e) => handleResizeStart(e, stamp, "nw")}
                  className="absolute -top-1.5 -left-1.5 w-3 h-3 rounded-full bg-white dark:bg-black border-2 border-[#8B3DFF] shadow-md cursor-nwse-resize hover:scale-125 transition-transform"
                  title="Resize (NW)"
                />
                <div
                  onMouseDown={(e) => handleResizeStart(e, stamp, "ne")}
                  className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-white dark:bg-black border-2 border-[#8B3DFF] shadow-md cursor-nesw-resize hover:scale-125 transition-transform"
                  title="Resize (NE)"
                />
                <div
                  onMouseDown={(e) => handleResizeStart(e, stamp, "sw")}
                  className="absolute -bottom-1.5 -left-1.5 w-3 h-3 rounded-full bg-white dark:bg-black border-2 border-[#8B3DFF] shadow-md cursor-nesw-resize hover:scale-125 transition-transform"
                  title="Resize (SW)"
                />
                <div
                  onMouseDown={(e) => handleResizeStart(e, stamp, "se")}
                  className="absolute -bottom-1.5 -right-1.5 w-3 h-3 rounded-full bg-white dark:bg-black border-2 border-[#8B3DFF] shadow-md cursor-nwse-resize hover:scale-125 transition-transform"
                  title="Resize (SE)"
                />

                {/* ── Top Stem Axis Rotation Handle (Canva / Figma Style) ── */}
                <div
                  className="absolute left-1/2 -top-6 -translate-x-1/2 flex flex-col items-center pointer-events-auto cursor-grab active:cursor-grabbing"
                  onMouseDown={(e) => {
                    const el = document.getElementById(`canvas-stamp-${stamp.id}`);
                    if (el) handleRotateStart(e, stamp, el);
                  }}
                  title="Drag to rotate on center axis"
                >
                  <div className="w-3.5 h-3.5 rounded-full bg-white dark:bg-zinc-900 border-2 border-[#8B3DFF] text-[#8B3DFF] flex items-center justify-center shadow-md hover:scale-125 transition-transform">
                    <RotateCw className="w-2 h-2" />
                  </div>
                  <div className="w-0.5 h-2.5 bg-[#8B3DFF]" />
                </div>

                {/* ── Quick Floating Action Toolbar ── */}
                <div
                  onMouseDown={(e) => e.stopPropagation()}
                  className="stamp-toolbar-portal absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white/98 dark:bg-zinc-900/98 border border-slate-200 dark:border-zinc-800 rounded-xl px-2 py-1 shadow-2xl backdrop-blur-md text-xs z-50 whitespace-nowrap animate-in fade-in zoom-in-95 duration-100"
                >
                  {/* Rotation Angle Preset Display & Stepper */}
                  <div className="flex items-center gap-1 font-mono text-[11px] text-slate-700 dark:text-zinc-300 pr-1 border-r border-slate-200 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => onUpdateStamp?.(stamp.id, { rotation: ((rotation - 15 + 360) % 360) })}
                      className="w-4 h-4 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center font-bold text-slate-500 cursor-pointer"
                      title="Rotate -15°"
                    >
                      ↺
                    </button>
                    <span className="font-bold text-[#8B3DFF] min-w-[28px] text-center">
                      {rotation}°
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateStamp?.(stamp.id, { rotation: ((rotation + 15) % 360) })}
                      className="w-4 h-4 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center font-bold text-slate-500 cursor-pointer"
                      title="Rotate +15°"
                    >
                      ↻
                    </button>
                  </div>

                  {/* Reset to 0° button */}
                  {rotation !== 0 && (
                    <button
                      type="button"
                      onClick={() => onUpdateStamp?.(stamp.id, { rotation: 0 })}
                      className="px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/40 text-[#8B3DFF] text-[10px] font-semibold cursor-pointer"
                      title="Reset rotation to 0°"
                    >
                      0°
                    </button>
                  )}

                  {/* Opacity Stepper */}
                  <div className="flex items-center gap-1 font-mono text-[10px] text-slate-600 dark:text-zinc-400 px-1 border-r border-slate-200 dark:border-zinc-800">
                    <span>Op:</span>
                    <button
                      type="button"
                      onClick={() => onUpdateStamp?.(stamp.id, { opacity: Math.max(10, (stamp.opacity ?? 100) - 15) })}
                      className="w-4 h-4 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center font-bold cursor-pointer"
                      title="Reduce opacity"
                    >
                      -
                    </button>
                    <span className="text-slate-800 dark:text-zinc-200 font-bold">
                      {stamp.opacity ?? 100}%
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateStamp?.(stamp.id, { opacity: Math.min(100, (stamp.opacity ?? 100) + 15) })}
                      className="w-4 h-4 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center font-bold cursor-pointer"
                      title="Increase opacity"
                    >
                      +
                    </button>
                  </div>

                  {/* Layer Toggle: Front vs Back */}
                  <button
                    type="button"
                    onClick={() => onUpdateStamp?.(stamp.id, { layer: isBack ? "front" : "back" })}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center gap-0.5 cursor-pointer ${
                      isBack
                        ? "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                        : "bg-purple-100 dark:bg-purple-950/40 text-[#8B3DFF] font-bold"
                    }`}
                    title={isBack ? "Bring element in front of content" : "Send element behind content"}
                  >
                    <Layers className="w-2.5 h-2.5" />
                    <span>{isBack ? "Back" : "Front"}</span>
                  </button>

                  {/* Dock to Grid (if chart) */}
                  {isChart && onDockToGrid && (
                    <button
                      type="button"
                      onClick={() => onDockToGrid(stamp)}
                      className="px-1.5 py-0.5 rounded bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 text-[10px] font-semibold flex items-center gap-1 cursor-pointer hover:bg-sky-100 transition-colors"
                      title="Dock this chart back into report grid rows"
                    >
                      <LayoutGrid className="w-2.5 h-2.5" />
                      <span>To Grid</span>
                    </button>
                  )}

                  {/* Done / Deselect */}
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="p-1 rounded text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 cursor-pointer"
                    title="Done"
                  >
                    <Check className="w-3 h-3" />
                  </button>

                  {/* Delete Stamp / Chart */}
                  {onDeleteStamp && (
                    <button
                      type="button"
                      onClick={() => onDeleteStamp(stamp.id)}
                      className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                      title={isChart ? "Delete Floating Chart" : "Delete Stamp"}
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

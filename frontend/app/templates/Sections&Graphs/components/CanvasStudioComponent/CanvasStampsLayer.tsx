"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  RotateCw,
  Trash2,
  Layers,
  Check,
  LayoutGrid,
  SlidersHorizontal,
  Type,
  Lightbulb,
    ArrowUp,
  ArrowDown,
  } from "lucide-react";
import {
  CanvasCoordinateStamp,
  LibraryChartCard,
} from "@/lib/redux/types/reportModuleTypes";
import ChartRenderer from "../ChartComponent/ChartRenderer";

export interface CanvasStampsLayerProps {
  pageIndex: number;
  stamps?: CanvasCoordinateStamp[];
  activeIsPreview?: boolean;
  onUpdateStamp?: (stampId: string, patch: Partial<CanvasCoordinateStamp>) => void;
  onDeleteStamp?: (stampId: string) => void;
  onDockToGrid?: (stamp: CanvasCoordinateStamp) => void;
  onOpenChartEditor?: (stampId: string, chart: LibraryChartCard) => void;
  selectedStampId?: string | null;
  onSelectStamp?: (stampId: string | null) => void;
  pageWidth?: number;  // 595
  pageHeight?: number; // 842
}

const PALETTE_TINTS: Record<string, { bg: string; text: string; border: string; badgeBg: string; badgeText: string }> = {
  purple: {
    bg: "bg-purple-500/10 dark:bg-purple-950/30",
    text: "text-[#8B3DFF] dark:text-purple-400",
    border: "border-purple-200 dark:border-purple-800/60",
    badgeBg: "bg-purple-100 dark:bg-purple-900/50",
    badgeText: "text-purple-700 dark:text-purple-300",
  },
  blue: {
    bg: "bg-blue-500/10 dark:bg-blue-950/30",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800/60",
    badgeBg: "bg-blue-100 dark:bg-blue-900/50",
    badgeText: "text-blue-700 dark:text-blue-300",
  },
  green: {
    bg: "bg-emerald-500/10 dark:bg-emerald-950/30",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800/60",
    badgeBg: "bg-emerald-100 dark:bg-emerald-900/50",
    badgeText: "text-emerald-700 dark:text-emerald-300",
  },
  emerald: {
    bg: "bg-emerald-500/10 dark:bg-emerald-950/30",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800/60",
    badgeBg: "bg-emerald-100 dark:bg-emerald-900/50",
    badgeText: "text-emerald-700 dark:text-emerald-300",
  },
  amber: {
    bg: "bg-amber-500/10 dark:bg-amber-950/30",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800/60",
    badgeBg: "bg-amber-100 dark:bg-amber-900/50",
    badgeText: "text-amber-700 dark:text-amber-300",
  },
  orange: {
    bg: "bg-orange-500/10 dark:bg-orange-950/30",
    text: "text-orange-600 dark:text-orange-400",
    border: "border-orange-200 dark:border-orange-800/60",
    badgeBg: "bg-orange-100 dark:bg-orange-900/50",
    badgeText: "text-orange-700 dark:text-orange-300",
  },
  red: {
    bg: "bg-rose-500/10 dark:bg-rose-950/30",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-200 dark:border-rose-800/60",
    badgeBg: "bg-rose-100 dark:bg-rose-900/50",
    badgeText: "text-rose-700 dark:text-rose-300",
  },
  cyan: {
    bg: "bg-cyan-500/10 dark:bg-cyan-950/30",
    text: "text-cyan-600 dark:text-cyan-400",
    border: "border-cyan-200 dark:border-cyan-800/60",
    badgeBg: "bg-cyan-100 dark:bg-cyan-900/50",
    badgeText: "text-cyan-700 dark:text-cyan-300",
  },
  slate: {
    bg: "bg-slate-500/10 dark:bg-zinc-800/40",
    text: "text-slate-700 dark:text-zinc-300",
    border: "border-slate-200 dark:border-zinc-800",
    badgeBg: "bg-slate-100 dark:bg-zinc-800",
    badgeText: "text-slate-700 dark:text-zinc-300",
  },
};

/**
 * Precision Coordinate-based Stamp / Chart / Text / Bullet Insight / Metric Element Canvas Layer.
 * Renders SVG stamps and floating element cards positioned by exact (x, y) coordinates with 360° rotation.
 */
export function CanvasStampsLayer({
  pageIndex,
  stamps = [],
  activeIsPreview = false,
  onUpdateStamp,
  onDeleteStamp,
  onDockToGrid,
  onOpenChartEditor,
  selectedStampId,
  onSelectStamp,
}: CanvasStampsLayerProps) {
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);
  const activeSelectedId = selectedStampId !== undefined ? selectedStampId : internalSelectedId;

  const setSelected = (id: string | null) => {
    if (onSelectStamp) onSelectStamp(id);
    setInternalSelectedId(id);
  };

  // Inline editing state for text, titles, values
  const [editingFieldKey, setEditingFieldKey] = useState<string | null>(null);
  const [editingTextVal, setEditingTextVal] = useState<string>("");

  const startInlineEdit = (fieldKey: string, initialValue: string, e?: React.MouseEvent) => {
    if (activeIsPreview) return;
    if (e) {
      e.stopPropagation();
    }
    setEditingFieldKey(fieldKey);
    setEditingTextVal(initialValue);
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
    isCard: boolean;
    isMetric: boolean;
  } | null>(null);

  // Rotating state
  const [rotatingId, setRotatingId] = useState<string | null>(null);
  const rotateCenter = useRef<{ centerX: number; centerY: number; startAngle: number; initialRotation: number } | null>(null);

  // Filter stamps that belong to this page
  const pageStamps = stamps.filter((s) => (s.pageIndex ?? 0) === pageIndex);

  // ── Drag to Move ───────────────────────────────────────────────────────────
  const handleDragStart = (e: React.MouseEvent, stamp: CanvasCoordinateStamp) => {
    if (activeIsPreview || stamp.locked || editingFieldKey) return;
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
    if (activeIsPreview || stamp.locked || editingFieldKey) return;
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
    const defaultH = isChart ? 250 : isText ? 120 : isInsight ? 130 : isMetric ? 110 : 120;

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
      isMetric,
    };
  };

  // ── Rotate Axis Stem Handle ────────────────────────────────────────────────
  const handleRotateStart = (
    e: React.MouseEvent,
    stamp: CanvasCoordinateStamp,
    element: HTMLElement
  ) => {
    if (activeIsPreview || stamp.locked || editingFieldKey) return;
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
        const { mouseX, mouseY, width, height, x, y, aspectRatio, isCard, isMetric } = resizeStartPos.current;
        const dx = e.clientX - mouseX;
        const dy = e.clientY - mouseY;

        let newW = width;
        let newH = height;
        let newX = x;
        let newY = y;

        if (isCard) {
          // Freeform width & height resizing for all card-type elements
          const minW = isMetric ? 150 : 180;
          const minH = isMetric ? 75 : 60;

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
        setEditingFieldKey(null);
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
        const isText = stamp.elementType === "text" || Boolean(stamp.textBlock);
        const isInsight = stamp.elementType === "insight" || Boolean(stamp.insight);
        const isMetric = stamp.elementType === "metric-card" || Boolean(stamp.metricCard);
        const isBadgeStrip = stamp.elementType === "badge-strip" || Boolean(stamp.badgeStrip);
        const isCard = isChart || isText || isInsight || isMetric || isBadgeStrip;

        const defaultW = isChart ? 380 : isText ? 360 : isInsight ? 380 : isMetric ? 220 : 120;
        const defaultH = isChart ? 250 : isText ? 120 : isInsight ? 130 : isMetric ? 110 : 120;

        const width = stamp.width || defaultW;
        const height = stamp.height || defaultH;
        const rotation = stamp.rotation || 0;
        const opacity = (stamp.opacity ?? 100) / 100;

        // Metric tint
        const tintKey = stamp.metricCard?.tintColor || "purple";
        const tint = PALETTE_TINTS[tintKey] || PALETTE_TINTS.purple;

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
            className={`canvas-coordinate-stamp pointer-events-auto cursor-move group/stamp transition-all ${
              isSelected ? "ring-2 ring-[#8B3DFF] ring-dashed" : "hover:ring-1 hover:ring-purple-300/60"
            }`}
          >
            {/* ── 1. Floating Chart Card with Edit Data & Inline Title Editing ── */}
            {isChart && stamp.chart && (
              <div
                style={{ opacity }}
                className="w-full h-full rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white/95 dark:bg-[#0c1017]/95 p-3.5 flex flex-col justify-between overflow-hidden select-none"
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-100 dark:border-zinc-800/60 flex-shrink-0">
                  <div className="min-w-0 flex-1">
                    {editingFieldKey === `${stamp.id}-chart-title` ? (
                      <input
                        type="text"
                        autoFocus
                        value={editingTextVal}
                        onChange={(e) => setEditingTextVal(e.target.value)}
                        onBlur={() => {
                          const trimmed = editingTextVal.trim();
                          setEditingFieldKey(null);
                          if (trimmed && stamp.chart && onUpdateStamp) {
                            onUpdateStamp(stamp.id, {
                              name: trimmed,
                              chart: { ...stamp.chart, title: trimmed },
                            });
                          }
                        }}
                        onKeyDown={(e) => {
                          e.stopPropagation();
                          if (e.key === "Enter") {
                            const trimmed = editingTextVal.trim();
                            setEditingFieldKey(null);
                            if (trimmed && stamp.chart && onUpdateStamp) {
                              onUpdateStamp(stamp.id, {
                                name: trimmed,
                                chart: { ...stamp.chart, title: trimmed },
                              });
                            }
                          } else if (e.key === "Escape") {
                            setEditingFieldKey(null);
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs font-bold text-slate-900 dark:text-white bg-purple-500/10 border border-[#8B3DFF] rounded px-1.5 py-0.5 outline-none w-full"
                      />
                    ) : (
                      <h3
                        onDoubleClick={(e) => startInlineEdit(`${stamp.id}-chart-title`, stamp.chart?.title || stamp.name, e)}
                        className="text-xs font-bold text-slate-900 dark:text-white truncate cursor-text hover:text-[#8B3DFF] transition-colors"
                        title="Double-click to inline edit chart title"
                      >
                        {stamp.chart.title || stamp.name}
                      </h3>
                    )}

                    {editingFieldKey === `${stamp.id}-chart-desc` ? (
                      <input
                        type="text"
                        autoFocus
                        value={editingTextVal}
                        onChange={(e) => setEditingTextVal(e.target.value)}
                        onBlur={() => {
                          const trimmed = editingTextVal.trim();
                          setEditingFieldKey(null);
                          if (stamp.chart && onUpdateStamp) {
                            onUpdateStamp(stamp.id, {
                              chart: { ...stamp.chart, description: trimmed },
                            });
                          }
                        }}
                        onKeyDown={(e) => {
                          e.stopPropagation();
                          if (e.key === "Enter") {
                            const trimmed = editingTextVal.trim();
                            setEditingFieldKey(null);
                            if (stamp.chart && onUpdateStamp) {
                              onUpdateStamp(stamp.id, {
                                chart: { ...stamp.chart, description: trimmed },
                              });
                            }
                          } else if (e.key === "Escape") {
                            setEditingFieldKey(null);
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[10px] text-slate-700 dark:text-zinc-300 bg-purple-500/10 border border-[#8B3DFF] rounded px-1 py-0.5 outline-none w-full"
                      />
                    ) : (
                      <p
                        onDoubleClick={(e) =>
                          startInlineEdit(`${stamp.id}-chart-desc`, stamp.chart?.description || "", e)
                        }
                        className="text-[10px] text-slate-500 dark:text-zinc-400 truncate cursor-text hover:text-[#8B3DFF] transition-colors"
                        title="Double-click to inline edit caption / description"
                      >
                        {stamp.chart.description || "Double click to add description"}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-purple-500/10 text-[#8B3DFF] font-bold">
                      {stamp.chart.chartType}
                    </span>

                    {/* Edit Data Button right in header */}
                    {onOpenChartEditor && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (stamp.chart) onOpenChartEditor(stamp.id, stamp.chart);
                        }}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#8B3DFF] text-white hover:bg-purple-700 transition-transform active:scale-95 cursor-pointer"
                        title="Open Full Telemetry & Data Editor"
                      >
                        <SlidersHorizontal className="w-2.5 h-2.5" />
                        <span>Edit Data</span>
                      </button>
                    )}
                  </div>
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
            )}

            {/* ── 2. Floating Text Block with Inline Editing ── */}
            {isText && (
              <div
                style={{ opacity }}
                className="w-full h-full rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white/95 dark:bg-[#0c1017]/95 p-3.5 flex flex-col justify-between overflow-hidden select-none"
              >
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-zinc-800/60 flex-shrink-0">
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-zinc-300">
                    <Type className="w-3.5 h-3.5 text-[#8B3DFF]" />
                    <span className="text-[10px] font-mono uppercase font-bold tracking-wide text-slate-500">
                      Text Block
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-400">Double-click to edit</span>
                </div>

                <div className="flex-1 min-h-0 w-full pt-1.5 overflow-hidden">
                  {editingFieldKey === `${stamp.id}-text` ? (
                    <textarea
                      autoFocus
                      value={editingTextVal}
                      onChange={(e) => setEditingTextVal(e.target.value)}
                      onBlur={() => {
                        const trimmed = editingTextVal.trim();
                        setEditingFieldKey(null);
                        if (onUpdateStamp) {
                          onUpdateStamp(stamp.id, {
                            name: trimmed.slice(0, 30) || "Text Block",
                            textBlock: { id: stamp.textBlock?.id || stamp.id, content: trimmed },
                          });
                        }
                      }}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === "Escape") setEditingFieldKey(null);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full h-full resize-none p-2 text-xs text-slate-800 dark:text-zinc-100 bg-purple-500/10 border border-[#8B3DFF] rounded-lg outline-none leading-relaxed"
                    />
                  ) : (
                    <div
                      onDoubleClick={(e) =>
                        startInlineEdit(`${stamp.id}-text`, stamp.textBlock?.content || "Editable text commentary...", e)
                      }
                      className="w-full h-full overflow-y-auto text-xs text-slate-800 dark:text-zinc-200 leading-relaxed cursor-text whitespace-pre-wrap select-text pr-1"
                      title="Double-click to edit text"
                    >
                      {stamp.textBlock?.content || "Double-click to edit text notes and commentary..."}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── 3. Floating Bullet / Key Insight Card with Inline Editing ── */}
            {isInsight && (
              <div
                style={{ opacity }}
                className="w-full h-full rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white/95 dark:bg-[#0c1017]/95 p-3.5 flex flex-col justify-between overflow-hidden select-none"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-zinc-800/60 flex-shrink-0">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <div className="w-5 h-5 rounded-full bg-amber-500/15 text-amber-600 flex items-center justify-center flex-shrink-0">
                      <Lightbulb className="w-3 h-3" />
                    </div>
                    {editingFieldKey === `${stamp.id}-insight-title` ? (
                      <input
                        type="text"
                        autoFocus
                        value={editingTextVal}
                        onChange={(e) => setEditingTextVal(e.target.value)}
                        onBlur={() => {
                          const trimmed = editingTextVal.trim();
                          setEditingFieldKey(null);
                          if (trimmed && onUpdateStamp) {
                            onUpdateStamp(stamp.id, {
                              name: trimmed,
                              insight: {
                                ...(stamp.insight || { id: stamp.id, text: "" }),
                                title: trimmed,
                              },
                            });
                          }
                        }}
                        onKeyDown={(e) => {
                          e.stopPropagation();
                          if (e.key === "Enter") {
                            const trimmed = editingTextVal.trim();
                            setEditingFieldKey(null);
                            if (trimmed && onUpdateStamp) {
                              onUpdateStamp(stamp.id, {
                                name: trimmed,
                                insight: {
                                  ...(stamp.insight || { id: stamp.id, text: "" }),
                                  title: trimmed,
                                },
                              });
                            }
                          } else if (e.key === "Escape") {
                            setEditingFieldKey(null);
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs font-bold text-slate-900 dark:text-white bg-purple-500/10 border border-[#8B3DFF] rounded px-1.5 py-0.5 outline-none w-full"
                      />
                    ) : (
                      <h4
                        onDoubleClick={(e) =>
                          startInlineEdit(`${stamp.id}-insight-title`, stamp.insight?.title || "Key Insights", e)
                        }
                        className="text-xs font-bold text-blue-950 dark:text-blue-300 truncate cursor-text hover:text-[#8B3DFF] transition-colors"
                        title="Double-click to inline edit title"
                      >
                        {stamp.insight?.title || stamp.name || "Key Insights"}
                      </h4>
                    )}
                  </div>
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 font-bold flex-shrink-0">
                    Bullets
                  </span>
                </div>

                {/* Bullets List or Text Body */}
                <div className="flex-1 min-h-0 w-full pt-2 overflow-y-auto pr-1">
                  {stamp.insight?.items && stamp.insight.items.length > 0 ? (
                    <div className="space-y-1.5 text-[11px] leading-relaxed">
                      {stamp.insight.items.map((item, idx) => (
                        <div key={item.id || idx} className="flex items-start gap-2">
                          <span className="w-3.5 h-3.5 rounded-full bg-[#8B3DFF] text-white font-bold flex items-center justify-center text-[8px] flex-shrink-0 mt-0.5">
                            {item.num ?? idx + 1}
                          </span>
                          <span
                            onDoubleClick={(e) =>
                              startInlineEdit(`${stamp.id}-bullet-${idx}`, item.text, e)
                            }
                            className="text-slate-700 dark:text-zinc-200 cursor-text hover:underline"
                            dangerouslySetInnerHTML={{ __html: item.text }}
                          />
                        </div>
                      ))}
                    </div>
                  ) : editingFieldKey === `${stamp.id}-insight-text` ? (
                    <textarea
                      autoFocus
                      value={editingTextVal}
                      onChange={(e) => setEditingTextVal(e.target.value)}
                      onBlur={() => {
                        const trimmed = editingTextVal.trim();
                        setEditingFieldKey(null);
                        if (onUpdateStamp) {
                          onUpdateStamp(stamp.id, {
                            insight: {
                              ...(stamp.insight || { id: stamp.id, text: "" }),
                              text: trimmed,
                            },
                          });
                        }
                      }}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === "Escape") setEditingFieldKey(null);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full h-full resize-none p-2 text-xs text-slate-800 dark:text-zinc-100 bg-purple-500/10 border border-[#8B3DFF] rounded-lg outline-none leading-relaxed"
                    />
                  ) : (
                    <div
                      onDoubleClick={(e) =>
                        startInlineEdit(
                          `${stamp.id}-insight-text`,
                          stamp.insight?.text || "Key operational observation...",
                          e
                        )
                      }
                      className="text-xs text-slate-700 dark:text-zinc-200 leading-relaxed cursor-text whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: stamp.insight?.text || "Double-click to edit key takeaway..." }}
                    />
                  )}
                </div>
              </div>
            )}

            {/* ── 4. Floating Metric KPI Card with Inline Editing ── */}
            {isMetric && (
              <div
                style={{ opacity }}
                className={`w-full h-full rounded-2xl border ${tint.border} ${tint.bg} p-3.5 flex flex-col justify-between overflow-hidden select-none`}
              >
                {/* Metric Label (Inline Editable) */}
                <div className="flex items-center justify-between pb-1 flex-shrink-0">
                  {editingFieldKey === `${stamp.id}-metric-label` ? (
                    <input
                      type="text"
                      autoFocus
                      value={editingTextVal}
                      onChange={(e) => setEditingTextVal(e.target.value)}
                      onBlur={() => {
                        const trimmed = editingTextVal.trim();
                        setEditingFieldKey(null);
                        if (trimmed && onUpdateStamp) {
                          onUpdateStamp(stamp.id, {
                            name: trimmed,
                            metricCard: {
                              ...(stamp.metricCard || { id: stamp.id, label: "", value: "0", tintColor: "purple", trendDirection: "up", trendValue: "" }),
                              label: trimmed,
                            },
                          });
                        }
                      }}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === "Enter") {
                          const trimmed = editingTextVal.trim();
                          setEditingFieldKey(null);
                          if (trimmed && onUpdateStamp) {
                            onUpdateStamp(stamp.id, {
                              name: trimmed,
                              metricCard: {
                                ...(stamp.metricCard || { id: stamp.id, label: "", value: "0", tintColor: "purple", trendDirection: "up", trendValue: "" }),
                                label: trimmed,
                              },
                            });
                          }
                        } else if (e.key === "Escape") setEditingFieldKey(null);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[11px] font-semibold text-slate-800 dark:text-white bg-purple-500/10 border border-[#8B3DFF] rounded px-1.5 py-0.5 outline-none w-full"
                    />
                  ) : (
                    <span
                      onDoubleClick={(e) =>
                        startInlineEdit(`${stamp.id}-metric-label`, stamp.metricCard?.label || stamp.name, e)
                      }
                      className="text-[11px] font-semibold text-slate-600 dark:text-zinc-300 truncate cursor-text hover:underline"
                      title="Double-click to edit label"
                    >
                      {stamp.metricCard?.label || stamp.name}
                    </span>
                  )}
                </div>

                {/* Metric Value (Large Bold, Inline Editable) */}
                <div className="py-1 flex-1 flex items-center">
                  {editingFieldKey === `${stamp.id}-metric-value` ? (
                    <input
                      type="text"
                      autoFocus
                      value={editingTextVal}
                      onChange={(e) => setEditingTextVal(e.target.value)}
                      onBlur={() => {
                        const trimmed = editingTextVal.trim();
                        setEditingFieldKey(null);
                        if (trimmed && onUpdateStamp) {
                          onUpdateStamp(stamp.id, {
                            metricCard: {
                              ...(stamp.metricCard || { id: stamp.id, label: "", value: "0", tintColor: "purple", trendDirection: "up", trendValue: "" }),
                              value: trimmed,
                            },
                          });
                        }
                      }}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === "Enter") {
                          const trimmed = editingTextVal.trim();
                          setEditingFieldKey(null);
                          if (trimmed && onUpdateStamp) {
                            onUpdateStamp(stamp.id, {
                              metricCard: {
                                ...(stamp.metricCard || { id: stamp.id, label: "", value: "0", tintColor: "purple", trendDirection: "up", trendValue: "" }),
                                value: trimmed,
                              },
                            });
                          }
                        } else if (e.key === "Escape") setEditingFieldKey(null);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className={`text-2xl font-black font-mono tracking-tight bg-purple-500/10 border border-[#8B3DFF] rounded px-2 py-0.5 outline-none w-full ${tint.text}`}
                    />
                  ) : (
                    <span
                      onDoubleClick={(e) =>
                        startInlineEdit(`${stamp.id}-metric-value`, stamp.metricCard?.value || "0", e)
                      }
                      className={`text-2xl font-black font-mono tracking-tight cursor-text hover:opacity-80 transition-opacity ${tint.text}`}
                      title="Double-click to edit value"
                    >
                      {stamp.metricCard?.value || "98.4%"}
                    </span>
                  )}
                </div>

                {/* Trend Badge */}
                <div className="flex items-center gap-1.5 pt-1 border-t border-slate-200/40 dark:border-zinc-800/40">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (activeIsPreview || !onUpdateStamp) return;
                      const nextDir =
                        stamp.metricCard?.trendDirection === "up"
                          ? "down"
                          : stamp.metricCard?.trendDirection === "down"
                          ? "no-change"
                          : "up";
                      onUpdateStamp(stamp.id, {
                        metricCard: {
                          ...(stamp.metricCard || { id: stamp.id, label: "", value: "0", tintColor: "purple", trendDirection: "up", trendValue: "" }),
                          trendDirection: nextDir,
                        },
                      });
                    }}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold font-mono transition-transform hover:scale-105 cursor-pointer ${tint.badgeBg} ${tint.badgeText}`}
                    title="Click to cycle trend direction"
                  >
                    {stamp.metricCard?.trendDirection === "up" && <ArrowUp className="w-2.5 h-2.5" />}
                    {stamp.metricCard?.trendDirection === "down" && <ArrowDown className="w-2.5 h-2.5" />}
                    {stamp.metricCard?.trendDirection === "no-change" && <span>—</span>}
                    <span>{stamp.metricCard?.trendValue || "+2.4% vs last cycle"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* ── 5. Transparent SVG Decorative Stamp ── */}
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
                  className="absolute -top-1.5 -left-1.5 w-3 h-3 rounded-full bg-white dark:bg-black border-2 border-[#8B3DFF] cursor-nwse-resize hover:scale-125 transition-transform"
                  title="Resize (NW)"
                />
                <div
                  onMouseDown={(e) => handleResizeStart(e, stamp, "ne")}
                  className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-white dark:bg-black border-2 border-[#8B3DFF] cursor-nesw-resize hover:scale-125 transition-transform"
                  title="Resize (NE)"
                />
                <div
                  onMouseDown={(e) => handleResizeStart(e, stamp, "sw")}
                  className="absolute -bottom-1.5 -left-1.5 w-3 h-3 rounded-full bg-white dark:bg-black border-2 border-[#8B3DFF] cursor-nesw-resize hover:scale-125 transition-transform"
                  title="Resize (SW)"
                />
                <div
                  onMouseDown={(e) => handleResizeStart(e, stamp, "se")}
                  className="absolute -bottom-1.5 -right-1.5 w-3 h-3 rounded-full bg-white dark:bg-black border-2 border-[#8B3DFF] cursor-nwse-resize hover:scale-125 transition-transform"
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
                  <div className="w-3.5 h-3.5 rounded-full bg-white dark:bg-zinc-900 border-2 border-[#8B3DFF] text-[#8B3DFF] flex items-center justify-center hover:scale-125 transition-transform">
                    <RotateCw className="w-2 h-2" />
                  </div>
                  <div className="w-0.5 h-2.5 bg-[#8B3DFF]" />
                </div>

                {/* ── Quick Floating Action Toolbar ── */}
                <div
                  onMouseDown={(e) => e.stopPropagation()}
                  className="stamp-toolbar-portal absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white/98 dark:bg-zinc-900/98 border border-slate-200 dark:border-zinc-800 rounded-xl px-2 py-1 backdrop-blur-md text-xs z-50 whitespace-nowrap animate-in fade-in zoom-in-95 duration-100"
                >
                  {/* For Charts: Direct "Edit Data" button on floating toolbar */}
                  {isChart && stamp.chart && onOpenChartEditor && (
                    <button
                      type="button"
                      onClick={() => onOpenChartEditor(stamp.id, stamp.chart!)}
                      className="px-2 py-0.5 rounded-md bg-[#8B3DFF] text-white hover:bg-purple-700 text-[10px] font-bold flex items-center gap-1 cursor-pointer mr-1 transition-colors"
                      title="Open Telemetry Data Editor"
                    >
                      <SlidersHorizontal className="w-2.5 h-2.5" />
                      <span>Edit Data</span>
                    </button>
                  )}

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

                  {/* Dock to Grid (for charts, text, bullets, and metric cards) */}
                  {isCard && onDockToGrid && (
                    <button
                      type="button"
                      onClick={() => onDockToGrid(stamp)}
                      className="px-1.5 py-0.5 rounded bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 text-[10px] font-semibold flex items-center gap-1 cursor-pointer hover:bg-sky-100 transition-colors"
                      title="Dock this element back into report grid rows"
                    >
                      <LayoutGrid className="w-2.5 h-2.5" />
                      <span>To Grid</span>
                    </button>
                  )}

                  {/* Done / Deselect */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(null);
                      setEditingFieldKey(null);
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

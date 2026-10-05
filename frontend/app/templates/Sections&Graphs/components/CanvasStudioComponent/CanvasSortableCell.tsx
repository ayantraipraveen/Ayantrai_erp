"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useSortable } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus,
  Trash2,
  Copy,
  Edit2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  X,
  CornerDownLeft,
  ExternalLink,
  Activity,
  Lightbulb,
  Type,
  Minus,
  Move,
} from "lucide-react";
import { CanvasBlockRenderer } from "../CanvasBlockRenderer";
import { SortableCellProps, getCellWidthStyle, getDefaultBlockHeight } from "../../utils";
import { useAppSelector } from "@/lib/redux/hooks";

export function SortableCell({
  sectionId,
  rowId,
  cell,
  isSelected,
  isPreview = false,
  onSelect,
  onEdit,
  onDuplicate,
  onDelete,
  onFloatCell,
  onColSpanChange,
  onWidthChange,
  onHeightChange,
  onUpdateMetricCard,
  onUpdateChart,
  onUpdateInsight,
  onUpdateTextBlock,
  onUpdateBadgeStrip,
  onUpdateSingleBadge,
  onAddBadge,
  onDeleteBadge,
  cellIndex,
  totalCellsInRow,
  selectedCellId,
  previousCellId,
  onMoveToStackBelow,
  onStackCellBelow,
  onUnstackCell,
  onReorderStacked,
  onDropToStack,
  activeDragCellId,
  onAddBlockBeside,
  zoom = 1,
  currentPageNumber = 1,
}: SortableCellProps) {
  const isFirstInRow = cellIndex === 0;
  const isLastInRow = typeof totalCellsInRow === "number" && totalCellsInRow > 1 && cellIndex === totalCellsInRow - 1;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: cell.id, data: { rowId, cell }, disabled: isPreview });

  const isSelfDragging = Boolean(activeDragCellId && activeDragCellId === cell.id);
  const isOtherDragging = Boolean(activeDragCellId && activeDragCellId !== cell.id);

  const { setNodeRef: setStackDropRef, isOver: isStackDropOver } = useDroppable({
    id: `stack-drop-${cell.id}`,
    data: { isStackDrop: true, targetCellId: cell.id, rowId },
    disabled: isPreview || isSelfDragging,
  });

  const { setNodeRef: setBesideDropRef, isOver: isBesideDropOver } = useDroppable({
    id: `beside-drop-${cell.id}`,
    data: { isBesideDrop: true, targetCellId: cell.id, rowId, cellIndex },
    disabled: isPreview || isSelfDragging,
  });

  const defaultWidthForCount = totalCellsInRow && totalCellsInRow > 0
    ? totalCellsInRow === 1 ? 100 : totalCellsInRow === 2 ? 50 : totalCellsInRow === 3 ? 33.3 : 25
    : 100;
  const initialPercent = cell.customWidth ?? (cell.colSpan ? cell.colSpan * 25 : defaultWidthForCount);
  const [isResizing, setIsResizing] = useState(false);
  const [resizePercent, setResizePercent] = useState<number>(initialPercent);

  const initialHeight = cell.customHeight;
  const [isHeightResizing, setIsHeightResizing] = useState(false);
  const [resizeHeight, setResizeHeight] = useState<number | undefined>(initialHeight);
  const [isDragOverBottom, setIsDragOverBottom] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [portalPos, setPortalPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const [toolbarPortalPos, setToolbarPortalPos] = useState<{ top: number; left: number } | null>(null);
  const chartEditorFullscreen = useAppSelector((state) => state.reportModule.chartEditorFullscreen);
  const cellDomRef = useRef<HTMLDivElement | null>(null);
  const toolbarDomRef = useRef<HTMLDivElement | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  // When chart editor is active, immediately clear floating portal positions
  useEffect(() => {
    if (chartEditorFullscreen) {
      setPortalPos(null);
      setToolbarPortalPos(null);
      setQuickAddOpen(false);
    }
  }, [chartEditorFullscreen]);


  const updatePortalPos = useCallback(() => {
    if (!cellDomRef.current) return;
    const rect = cellDomRef.current.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) {
      setPortalPos(null);
      return;
    }

    let topPos = rect.bottom + 4;
    const pageEl = cellDomRef.current.closest("[id^='canvas-page-']") as HTMLElement | null;
    const footerEl = pageEl?.querySelector("footer") as HTMLElement | null;
    if (footerEl) {
      const footerRect = footerEl.getBoundingClientRect();
      const maxAllowedTop = footerRect.top - 34;
      if (topPos > maxAllowedTop) {
        topPos = maxAllowedTop;
      }
    }

    // Clamp against the viewport bottom boundary and floating dock (dock is ~48px high)
    const maxDockTop = window.innerHeight - 52;
    if (topPos > maxDockTop) {
      topPos = Math.min(maxDockTop, Math.max(rect.top + 8, rect.bottom - 34));
    }

    setPortalPos({
      top: Math.round(topPos),
      left: rect.left,
      width: rect.width,
    });
  }, []);

  useEffect(() => {
    if (!isSelected && !isHovered && !quickAddOpen) {
      setPortalPos(null);
      return;
    }
    updatePortalPos();
    const handler = () => updatePortalPos();
    window.addEventListener("scroll", handler, true);
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("scroll", handler, true);
      window.removeEventListener("resize", handler);
    };
  }, [isSelected, isHovered, quickAddOpen, updatePortalPos]);

  useEffect(() => {
    if (!quickAddOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest(".portal-quick-add-panel") || target?.closest(".portal-stack-trigger-btn") || cellDomRef.current?.contains(target)) {
        return;
      }
      setQuickAddOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [quickAddOpen]);

  const handleCellMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsHovered(true);
  };

  const handleCellMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 180);
  };

  useEffect(() => {
    setResizePercent(cell.customWidth ?? (cell.colSpan ? cell.colSpan * 25 : defaultWidthForCount));
  }, [cell.customWidth, cell.colSpan, defaultWidthForCount]);

  useEffect(() => {
    setResizeHeight(cell.customHeight);
  }, [cell.customHeight]);

  const [isCellEditing, setIsCellEditing] = useState(false);
  const [hasActiveInput, setHasActiveInput] = useState(false);

  useEffect(() => {
    const handleFocusCheck = () => {
      if (!cellDomRef.current) {
        setHasActiveInput(false);
        return;
      }
      const activeEl = document.activeElement;
      const isInside = Boolean(activeEl && cellDomRef.current.contains(activeEl));
      const isInput =
        isInside &&
        (activeEl?.tagName === "INPUT" ||
          activeEl?.tagName === "TEXTAREA" ||
          (activeEl as HTMLElement)?.isContentEditable ||
          Boolean(activeEl?.closest('[contenteditable="true"]')) ||
          Boolean(activeEl?.closest('.dynamic-word-editor')));
      setHasActiveInput(Boolean(isInput));
    };

    document.addEventListener("focusin", handleFocusCheck);
    document.addEventListener("focusout", handleFocusCheck);
    return () => {
      document.removeEventListener("focusin", handleFocusCheck);
      document.removeEventListener("focusout", handleFocusCheck);
    };
  }, []);

  const isEditingActive = isCellEditing || hasActiveInput;

  useEffect(() => {
    if (!isSelected) {
      setIsCellEditing(false);
      setQuickAddOpen(false);
    }
  }, [isSelected]);

  const currentPercent = isResizing ? resizePercent : (cell.customWidth ?? (cell.colSpan ? cell.colSpan * 25 : defaultWidthForCount));
  const currentHeight = isHeightResizing ? resizeHeight : cell.customHeight;
  const widthStyle = getCellWidthStyle(currentPercent);

  const effectiveZoom = zoom > 0 ? zoom : 1;

  const showTopToolbar = !isPreview && !isDragging && !isEditingActive && (isSelected || isResizing || isHeightResizing);

  const updateToolbarPortalPos = useCallback(() => {
    if (!cellDomRef.current) {
      setToolbarPortalPos(null);
      return;
    }
    const rect = cellDomRef.current.getBoundingClientRect();
    if (rect.bottom < 40 || rect.top > window.innerHeight) {
      setToolbarPortalPos(null);
      return;
    }

    const toolbarWidth = toolbarDomRef.current?.offsetWidth || 560;
    const toolbarHeight = toolbarDomRef.current?.offsetHeight || 36;

    let idealLeft = isLastInRow ? (rect.right - toolbarWidth) : rect.left;
    const clampedLeft = Math.max(16, Math.min(window.innerWidth - toolbarWidth - 16, idealLeft));

    // Place above card if fits; otherwise place below card
    const fitsAbove = rect.top - toolbarHeight - 8 >= 88;
    let targetTop = fitsAbove ? rect.top - toolbarHeight - 8 : rect.bottom + 8;

    // Viewport clamping so toolbar is never cut off by top ribbon or bottom of screen
    const maxAllowedBottom = window.innerHeight - 56 - toolbarHeight;
    if (targetTop > maxAllowedBottom) {
      targetTop = Math.max(88, maxAllowedBottom);
    }
    if (targetTop < 88) {
      targetTop = 88;
    }

    setToolbarPortalPos({
      top: Math.round(targetTop),
      left: Math.round(clampedLeft),
    });
  }, [isLastInRow]);

  useEffect(() => {
    if (!showTopToolbar) {
      setToolbarPortalPos(null);
      return;
    }
    updateToolbarPortalPos();
    const handler = () => updateToolbarPortalPos();
    window.addEventListener("scroll", handler, true);
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("scroll", handler, true);
      window.removeEventListener("resize", handler);
    };
  }, [showTopToolbar, updateToolbarPortalPos]);

  useEffect(() => {
    if (showTopToolbar && toolbarDomRef.current && cellDomRef.current) {
      const actualWidth = toolbarDomRef.current.offsetWidth;
      const rect = cellDomRef.current.getBoundingClientRect();
      const idealLeft = isLastInRow ? (rect.right - actualWidth) : rect.left;
      const clampedLeft = Math.max(16, Math.min(window.innerWidth - actualWidth - 16, idealLeft));
      setToolbarPortalPos((prev) => {
        if (!prev) return null;
        if (prev.left === Math.round(clampedLeft)) return prev;
        return { ...prev, left: Math.round(clampedLeft) };
      });
    }
  }, [showTopToolbar, isLastInRow]);

  useEffect(() => {
    if (showTopToolbar) {
      updateToolbarPortalPos();
    }
  }, [showTopToolbar, currentPercent, currentHeight, effectiveZoom, updateToolbarPortalPos]);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);

    const startX = e.clientX;
    const parentRow = cellDomRef.current?.closest(".canvas-row-cells") as HTMLElement | null;
    const scrollContainer = cellDomRef.current?.closest(".overflow-y-auto, .overflow-auto") as HTMLElement | null;
    const startScrollLeft = scrollContainer?.scrollLeft || 0;
    const parentWidth = parentRow ? (parentRow.getBoundingClientRect().width / effectiveZoom) : 740;
    const startPercent = currentPercent;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const currentScrollLeft = scrollContainer?.scrollLeft || 0;
      const scrollDeltaX = currentScrollLeft - startScrollLeft;
      const deltaX = (moveEvent.clientX - startX + scrollDeltaX) / effectiveZoom;
      const deltaPercent = (deltaX / parentWidth) * 100;
      const newPercent = Math.min(100, Math.max(15, Math.round(startPercent + deltaPercent)));
      setResizePercent(newPercent);
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      setIsResizing(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);

      const currentScrollLeft = scrollContainer?.scrollLeft || 0;
      const scrollDeltaX = currentScrollLeft - startScrollLeft;
      const deltaX = (upEvent.clientX - startX + scrollDeltaX) / effectiveZoom;
      const deltaPercent = (deltaX / parentWidth) * 100;
      const finalPercent = Math.min(100, Math.max(15, Math.round(startPercent + deltaPercent)));
      setResizePercent(finalPercent);

      let colSpan: 1 | 2 | 3 | 4 = 1;
      if (finalPercent >= 85) colSpan = 4;
      else if (finalPercent >= 60) colSpan = 3;
      else if (finalPercent >= 38) colSpan = 2;
      else colSpan = 1;

      if (typeof onColSpanChange === "function") {
        onColSpanChange(cell.id, rowId, colSpan);
      }
      if (typeof onWidthChange === "function") {
        onWidthChange(cell.id, rowId, finalPercent);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const getAvailableHeightToFooter = useCallback((): number => {
    if (!cellDomRef.current) {
      return (currentPageNumber ?? 1) === 1 ? 420 : 440;
    }
    const pageEl = cellDomRef.current.closest("[id^='canvas-page-']") as HTMLElement | null;
    if (!pageEl) return 440;

    const footerEl = pageEl.querySelector("footer") as HTMLElement | null;
    const cellRect = cellDomRef.current.getBoundingClientRect();

    if (footerEl) {
      const footerRect = footerEl.getBoundingClientRect();
      const distanceToFooter = (footerRect.top - cellRect.top) / effectiveZoom;

      let rowsBelowHeight = 0;
      const rowEl = cellDomRef.current.closest(".canvas-row-item, [data-row-id], .group\\/row") as HTMLElement | null;
      if (rowEl && rowEl.parentElement) {
        let nextRow = rowEl.nextElementSibling as HTMLElement | null;
        while (nextRow) {
          if (nextRow.classList.contains("canvas-row-item") || nextRow.hasAttribute("data-row-id") || nextRow.classList.contains("group/row")) {
            rowsBelowHeight += (nextRow.getBoundingClientRect().height / effectiveZoom) + 12;
          }
          nextRow = nextRow.nextElementSibling as HTMLElement | null;
        }
      }

      const reservedBottomSpace = (isPreview ? 16 : 48) + rowsBelowHeight;
      const maxUsable = Math.floor(distanceToFooter - reservedBottomSpace);
      // return Math.max(0, Math.min(460, maxUsable));
  return Math.max(0, maxUsable);
    }

    const pageRect = pageEl.getBoundingClientRect();
    const distanceToPageBottom = (pageRect.bottom - cellRect.top) / effectiveZoom;
    // return Math.max(0, Math.min(460, Math.floor(distanceToPageBottom - (isPreview ? 32 : 72))));
    return Math.max(0, Math.floor(distanceToPageBottom - (isPreview ? 32 : 72)));
  }, [currentPageNumber, effectiveZoom, isPreview]);

  const [dynamicMaxHeight, setDynamicMaxHeight] = useState<number>(() => {
    return (currentPageNumber ?? 1) === 1 ? 420 : 440;
  });

  const updateDynamicMaxHeight = useCallback(() => {
    const allowed = getAvailableHeightToFooter();
    setDynamicMaxHeight((prev) => (Math.abs(prev - allowed) > 2 ? allowed : prev));
  }, [getAvailableHeightToFooter]);

  useEffect(() => {
    updateDynamicMaxHeight();
    const handler = () => updateDynamicMaxHeight();
    window.addEventListener("resize", handler);
    window.addEventListener("scroll", handler, true);
    return () => {
      window.removeEventListener("resize", handler);
      window.removeEventListener("scroll", handler, true);
    };
  }, [updateDynamicMaxHeight]);

  const STACK_H = 5;
  const MIN_BLOCK_H = 0;
  const maxColumnHeight = dynamicMaxHeight;
  const hasStacked = Boolean(cell.stackedCells && cell.stackedCells.length > 0);
  const bottomZoneH = 0; // Rendered in React portal, takes zero internal cell layout height

  const rawBaseBlockHeight = currentHeight || getDefaultBlockHeight(cell.blockType, cell);

  // Groups stacked cells into flex-wrap rows by width and returns total height
  const calcWrappedStackedH = (cells: any[]): { contentH: number; numRows: number } => {
    if (!cells?.length) return { contentH: 0, numRows: 0 };
    const rowMaxHeights: number[] = [];
    let rowW = 0;
    let rowMaxH = 0;
    for (const sc of cells) {
      const w = sc.customWidth || 100;
      const h = sc.customHeight || getDefaultBlockHeight(sc.blockType, sc);
      if (rowW + w > 100 && rowW > 0) {
        rowMaxHeights.push(rowMaxH);
        rowW = w;
        rowMaxH = h;
      } else {
        rowW += w;
        rowMaxH = Math.max(rowMaxH, h);
      }
    }
    rowMaxHeights.push(rowMaxH);
    const contentH = rowMaxHeights.reduce((t, h) => t + h, 0);
    return { contentH, numRows: rowMaxHeights.length };
  };

  const stackedWrap = hasStacked ? calcWrappedStackedH(cell.stackedCells!) : { contentH: 0, numRows: 0 };
  const rawStackedSum = stackedWrap.contentH;
  // Gap between stacked rows (12px each) + 12px outer gap between primary and first stacked row (gap-3)
  const stackGapTotal = hasStacked ? Math.max(0, stackedWrap.numRows - 1) * 12 + 12 : 0;
  const maxAvailableForCards = Math.max(140, maxColumnHeight - stackGapTotal);
  const totalCardsRawH = rawBaseBlockHeight + rawStackedSum;
  const cardScale = totalCardsRawH > maxAvailableForCards ? maxAvailableForCards / totalCardsRawH : 1;

  const baseBlockHeight = Math.max(MIN_BLOCK_H, Math.floor(rawBaseBlockHeight * cardScale));

  const stackedExtraHeight = hasStacked ? rawStackedSum + stackGapTotal : 0;

  const rawMinHeight = hasStacked
    ? baseBlockHeight + stackedExtraHeight
    : (typeof currentHeight === "number" ? Math.max(MIN_BLOCK_H, currentHeight) : undefined);

  const effectiveMinHeight = rawMinHeight !== undefined ? Math.min(maxColumnHeight, rawMinHeight) : undefined;

  const maxPrimaryH = Math.max(MIN_BLOCK_H, maxColumnHeight - stackedExtraHeight);

  const handleHeightResizeStart = (e: React.MouseEvent, explicitStartH?: number) => {
    e.stopPropagation();
    e.preventDefault();
    setIsHeightResizing(true);

    const startY = e.clientY;
    const primaryDom = cellDomRef.current?.querySelector(".group\\/primary-block") as HTMLElement | null;
    const startH = explicitStartH || primaryDom?.offsetHeight || baseBlockHeight || 140;
    const scrollContainer = cellDomRef.current?.closest(".overflow-y-auto, .overflow-auto") as HTMLElement | null;
    const startScrollTop = scrollContainer?.scrollTop || 0;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const currentScrollTop = scrollContainer?.scrollTop || 0;
      const scrollDeltaY = currentScrollTop - startScrollTop;
      const deltaY = (moveEvent.clientY - startY + scrollDeltaY) / effectiveZoom;
      const currentAllowed = Math.max(MIN_BLOCK_H, getAvailableHeightToFooter() - stackedExtraHeight);
      const newH = Math.min(currentAllowed, Math.max(MIN_BLOCK_H, Math.round(startH + deltaY)));
      setResizeHeight(newH);
      if (typeof onHeightChange === "function") {
        onHeightChange(cell.id, rowId, newH);
      }
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      setIsHeightResizing(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);

      const currentScrollTop = scrollContainer?.scrollTop || 0;
      const scrollDeltaY = currentScrollTop - startScrollTop;
      const deltaY = (upEvent.clientY - startY + scrollDeltaY) / effectiveZoom;
      const currentAllowed = Math.max(MIN_BLOCK_H, getAvailableHeightToFooter() - stackedExtraHeight);
      const finalH = Math.min(currentAllowed, Math.max(MIN_BLOCK_H, Math.round(startH + deltaY)));
      setResizeHeight(finalH);

      if (typeof onHeightChange === "function") {
        onHeightChange(cell.id, rowId, finalH);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleCornerResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    setIsHeightResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const parentRow = cellDomRef.current?.closest(".canvas-row-cells") as HTMLElement | null;
    const scrollContainer = cellDomRef.current?.closest(".overflow-y-auto, .overflow-auto") as HTMLElement | null;
    const startScrollLeft = scrollContainer?.scrollLeft || 0;
    const startScrollTop = scrollContainer?.scrollTop || 0;
    const parentWidth = parentRow ? (parentRow.getBoundingClientRect().width / effectiveZoom) : 740;
    const startPercent = currentPercent;
    const primaryDom = cellDomRef.current?.querySelector(".group\\/primary-block") as HTMLElement | null;
    const startH = primaryDom?.offsetHeight || baseBlockHeight || 140;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const currentScrollLeft = scrollContainer?.scrollLeft || 0;
      const scrollDeltaX = currentScrollLeft - startScrollLeft;
      const deltaX = (moveEvent.clientX - startX + scrollDeltaX) / effectiveZoom;
      const deltaPercent = (deltaX / parentWidth) * 100;
      const newPercent = Math.min(100, Math.max(15, Math.round(startPercent + deltaPercent)));
      setResizePercent(newPercent);

      const currentScrollTop = scrollContainer?.scrollTop || 0;
      const scrollDeltaY = currentScrollTop - startScrollTop;
      const deltaY = (moveEvent.clientY - startY + scrollDeltaY) / effectiveZoom;
      const currentAllowed = Math.max(MIN_BLOCK_H, getAvailableHeightToFooter() - stackedExtraHeight);
      const newH = Math.min(currentAllowed, Math.max(MIN_BLOCK_H, Math.round(startH + deltaY)));
      setResizeHeight(newH);
      if (typeof onHeightChange === "function") {
        onHeightChange(cell.id, rowId, newH);
      }
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      setIsResizing(false);
      setIsHeightResizing(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);

      const currentScrollLeft = scrollContainer?.scrollLeft || 0;
      const scrollDeltaX = currentScrollLeft - startScrollLeft;
      const deltaX = (upEvent.clientX - startX + scrollDeltaX) / effectiveZoom;
      const deltaPercent = (deltaX / parentWidth) * 100;
      const finalPercent = Math.min(100, Math.max(15, Math.round(startPercent + deltaPercent)));
      setResizePercent(finalPercent);

      const currentScrollTop = scrollContainer?.scrollTop || 0;
      const scrollDeltaY = currentScrollTop - startScrollTop;
      const deltaY = (upEvent.clientY - startY + scrollDeltaY) / effectiveZoom;
      const currentAllowed = Math.max(MIN_BLOCK_H, getAvailableHeightToFooter() - stackedExtraHeight);
      const finalH = Math.min(currentAllowed, Math.max(MIN_BLOCK_H, Math.round(startH + deltaY)));
      setResizeHeight(finalH);

      let colSpan: 1 | 2 | 3 | 4 = 1;
      if (finalPercent >= 85) colSpan = 4;
      else if (finalPercent >= 60) colSpan = 3;
      else if (finalPercent >= 38) colSpan = 2;
      else colSpan = 1;

      if (typeof onColSpanChange === "function") {
        onColSpanChange(cell.id, rowId, colSpan);
      }
      if (typeof onWidthChange === "function") {
        onWidthChange(cell.id, rowId, finalPercent);
      }
      if (typeof onHeightChange === "function") {
        onHeightChange(cell.id, rowId, finalH);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleStackedHeightResizeStart = (e: React.MouseEvent, scId: string, currentScH: number) => {
    e.stopPropagation();
    e.preventDefault();

    const startY = e.clientY;
    const startH = currentScH || 140;
    const scrollContainer = cellDomRef.current?.closest(".overflow-y-auto, .overflow-auto") as HTMLElement | null;
    const startScrollTop = scrollContainer?.scrollTop || 0;
    const otherStackedH = Math.max(0, stackedExtraHeight - (startH + 12));
    const maxScH = Math.max(MIN_BLOCK_H, maxColumnHeight - baseBlockHeight - otherStackedH - 12 - bottomZoneH);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const currentScrollTop = scrollContainer?.scrollTop || 0;
      const scrollDeltaY = currentScrollTop - startScrollTop;
      const deltaY = (moveEvent.clientY - startY + scrollDeltaY) / effectiveZoom;
      const newH = Math.min(maxScH, Math.max(MIN_BLOCK_H, Math.round(startH + deltaY)));
      if (typeof onHeightChange === "function") {
        onHeightChange(scId, rowId, newH);
      }
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleStackedWidthResizeStart = (e: React.MouseEvent, scId: string, currentScW: number) => {
    e.stopPropagation();
    e.preventDefault();

    const startX = e.clientX;
    const parentWidth = cellDomRef.current ? (cellDomRef.current.getBoundingClientRect().width / effectiveZoom) : 250;
    const startPercent = currentScW || 100;
    const scrollContainer = cellDomRef.current?.closest(".overflow-y-auto, .overflow-auto") as HTMLElement | null;
    const startScrollLeft = scrollContainer?.scrollLeft || 0;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const currentScrollLeft = scrollContainer?.scrollLeft || 0;
      const scrollDeltaX = currentScrollLeft - startScrollLeft;
      const deltaX = (moveEvent.clientX - startX + scrollDeltaX) / effectiveZoom;
      const deltaPercent = (deltaX / parentWidth) * 100;
      const newPercent = Math.min(100, Math.max(25, Math.round(startPercent + deltaPercent)));
      if (typeof onWidthChange === "function") {
        onWidthChange(scId, rowId, newPercent);
      }
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isResizing || isHeightResizing ? "none" : transition,
    opacity: isDragging ? 0.25 : 1,
    width: widthStyle,
    maxWidth: widthStyle,
    height: typeof currentHeight === "number"
      ? `${Math.min(maxColumnHeight, currentHeight + (hasStacked ? stackedExtraHeight : 0))}px`
      : undefined,
    maxHeight: `${maxColumnHeight}px`,
    minHeight: effectiveMinHeight ? `${Math.min(maxColumnHeight, effectiveMinHeight)}px` : undefined,
    flexShrink: 0,
    flexGrow: 0,
    boxSizing: "border-box",
  };

  return (
    <div
      ref={(el) => {
        setNodeRef(el);
        cellDomRef.current = el;
      }}
      id={`canvas-cell-${cell.id}`}
      style={style}
      className={`relative group/cell overflow-visible flex flex-col ${
        isSelected && !isPreview ? "ring-2 ring-[#8B3DFF] ring-offset-2 ring-offset-white dark:ring-offset-zinc-900 rounded-2xl" : ""
      }`}
      onMouseEnter={handleCellMouseEnter}
      onMouseLeave={handleCellMouseLeave}
      onClick={(e) => {
        e.stopPropagation();
        if (!isPreview && typeof onSelect === "function") {
          onSelect(cell.id, rowId);
        }
      }}
    >
      {/* Draggable cell badge tag (positioned top-right to avoid blocking card label) */}
      {!isPreview && !isEditingActive && (
        <div
          {...attributes}
          {...listeners}
          className={`absolute top-1.5 right-2 z-20 ${
            isSelected ? "opacity-0 pointer-events-none" : "opacity-0 group-hover/cell:opacity-100"
          } transition-opacity bg-black/80 hover:bg-black text-white rounded-md px-1.5 py-0.5 text-[9px] font-mono font-bold flex items-center gap-1 cursor-grab active:cursor-grabbing backdrop-blur-xs`}
          title="Drag to move card anywhere (within row or across rows)"
        >
          <GripVertical className="w-2.5 h-2.5" />
          <span className="capitalize">{cell.blockType.replace("-", " ")}</span>
          <span className="text-purple-300 font-mono">({Math.round(currentPercent)}%)</span>
        </div>
      )}

      {/* Live resizing indicator HUD */}
      {!isPreview && !isEditingActive && (isResizing || isHeightResizing) && (
        <div className="absolute top-2 right-2 z-40 bg-[#8B3DFF] text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-md pointer-events-none animate-in fade-in zoom-in-95 duration-100 flex items-center gap-1.5">
          {isResizing && <span>W: {Math.round(currentPercent)}%</span>}
          {isResizing && isHeightResizing && <span className="opacity-60">&bull;</span>}
          {isHeightResizing && <span>H: {currentHeight ? `${Math.round(currentHeight)}px` : "Auto"}</span>}
        </div>
      )}

      {/* Resize handle (right edge for width) — fixed size, opacity-only on hover */}
      {!isPreview && !isEditingActive && (
        <div
          onMouseDown={handleResizeStart}
          className={`absolute right-0 top-0 bottom-0 w-2.5 cursor-col-resize z-30 flex items-center justify-center transition-opacity ${
            isResizing ? "opacity-100" : "opacity-0 group-hover/cell:opacity-100"
          }`}
          title="Drag horizontally to adjust width freely"
        >
          <div className="w-0.5 h-8 rounded-full bg-slate-400/80 dark:bg-zinc-500 group-hover/cell:bg-[#8B3DFF]/80 transition-colors" />
        </div>
      )}

      {/* Beside Droppable Zone on Right Edge (Canva Column Beside Target) */}
      {!isPreview && !isEditingActive && !isSelfDragging && (
        <div
          ref={setBesideDropRef}
          className={`absolute right-0 top-0 bottom-0 transition-all z-35 flex items-center justify-center ${
            isBesideDropOver
              ? "w-8 -right-4 bg-purple-500/25 border-2 border-dashed border-[#8B3DFF] rounded-r-2xl pointer-events-auto"
              : isOtherDragging
              ? "w-4 -right-2 border-r-2 border-dashed border-purple-300 dark:border-purple-700/60 pointer-events-auto"
              : "w-3 pointer-events-none"
          }`}
          title="Drop here to place beside as column"
        >
          {isBesideDropOver && (
            <div className="bg-[#8B3DFF] text-white text-[9px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap rotate-90 flex items-center gap-0.5 animate-pulse pointer-events-none">
              <Plus className="w-2.5 h-2.5" /> Beside
            </div>
          )}
        </div>
      )}

      {/* Quick Add Column Beside Button (+) — absolute, does NOT affect layout flow */}
      {!isPreview && !isEditingActive && !activeDragCellId && typeof onAddBlockBeside === "function" && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAddBlockBeside(rowId, (cellIndex ?? 0) + 1, "text");
          }}
          className="absolute -right-2 top-1/2 -translate-y-1/2 z-35 w-4 h-4 rounded-full bg-white dark:bg-zinc-800 border border-purple-300 dark:border-purple-700 text-[#8B3DFF] hover:bg-[#8B3DFF] hover:text-white flex items-center justify-center transition-colors opacity-0 group-hover/cell:opacity-100 cursor-pointer pointer-events-auto"
          title="Add a new column block beside this card in this row"
        >
          <Plus className="w-2.5 h-2.5" />
        </button>
      )}

      {/* Resize handle (bottom edge for height) — always visible on hover */}
      {!isPreview && !isEditingActive && (
        <div
          onMouseDown={handleHeightResizeStart}
          className={`absolute left-0 right-0 -bottom-1.5 h-3 cursor-row-resize z-30 flex items-center justify-center transition-opacity ${
            isHeightResizing ? "opacity-100" : "opacity-0 group-hover/cell:opacity-100"
          }`}
          title="Drag vertically to adjust height freely"
        >
          <div className="h-0.5 w-10 rounded-full bg-slate-400/80 dark:bg-zinc-500 group-hover/cell:bg-[#8B3DFF]/80 transition-colors" />
        </div>
      )}

      {/* Resize handle (bottom-right corner) — fixed size, opacity-only, shown when no stacked blocks */}
      {!isPreview && !isEditingActive && !hasStacked && (
        <div
          onMouseDown={handleCornerResizeStart}
          className={`absolute -right-1.5 -bottom-1.5 w-4 h-4 cursor-se-resize z-30 flex items-center justify-center transition-opacity ${
            isResizing || isHeightResizing ? "opacity-100" : "opacity-0 group-hover/cell:opacity-100"
          }`}
          title="Drag corner to adjust width & height simultaneously"
        >
          <div className="w-2 h-2 rounded-full border-2 border-white dark:border-zinc-900 bg-slate-400/80 dark:bg-zinc-500 group-hover/cell:bg-[#8B3DFF] transition-colors" />
        </div>
      )}

      {/* Render the actual cell content block and vertically stacked blocks */}
      <div className="w-full flex-1 flex flex-col gap-3 min-h-fit overflow-visible">
        {/* Primary Block */}
        <div
          style={{
            maxHeight: `${maxPrimaryH}px`,
            height: typeof currentHeight === "number" ? `${currentHeight}px` : undefined,
          }}
          className={`w-full ${hasStacked && typeof currentHeight !== "number" ? "flex-1 min-h-0" : "flex-none"} flex flex-col relative group/primary-block overflow-visible`}
        >
          <CanvasBlockRenderer
            cell={currentHeight !== cell.customHeight ? { ...cell, customHeight: currentHeight } : cell}
            isSelected={isSelected}
            isPreview={isPreview}
            isForceEditing={isCellEditing}
            onEditingChange={(editing) => setIsCellEditing(editing)}
            onUpdateMetricCard={(card) => {
              if (typeof onUpdateMetricCard === "function") onUpdateMetricCard(rowId, cell.id, card);
            }}
            onUpdateChart={(chart) => {
              if (typeof onUpdateChart === "function") onUpdateChart(rowId, cell.id, chart);
            }}
            onOpenChartEditor={() => onEdit(cell, rowId)}
            onUpdateInsight={(textOrInsight) => {
              if (typeof onUpdateInsight === "function") onUpdateInsight(rowId, cell.id, textOrInsight);
            }}
            onUpdateTextBlock={(content) => {
              if (typeof onUpdateTextBlock === "function") onUpdateTextBlock(rowId, cell.id, content);
            }}
            onUpdateBadgeStrip={(strip) => {
              if (typeof onUpdateBadgeStrip === "function") onUpdateBadgeStrip(rowId, cell.id, strip);
            }}
            onUpdateSingleBadge={(badgeId, patch) => {
              if (typeof onUpdateSingleBadge === "function") onUpdateSingleBadge(rowId, cell.id, badgeId, patch);
            }}
            onAddBadge={() => {
              if (typeof onAddBadge === "function") onAddBadge(rowId, cell.id);
            }}
            onDeleteBadge={(badgeId) => {
              if (typeof onDeleteBadge === "function") onDeleteBadge(rowId, cell.id, badgeId);
            }}
          />

        </div>

        {/* Stacked Blocks underneath (Canva Column Stack) */}
        {cell.stackedCells && cell.stackedCells.length > 0 && (
          <div className="w-full flex flex-row flex-wrap gap-3 overflow-visible">
            {cell.stackedCells.map((sc: any, sIdx: number) => {
              const isStackedSelected = selectedCellId === sc.id;
              const currentScW = sc.customWidth || 100;

              return (
                <div
                  key={sc.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isPreview && typeof onSelect === "function") {
                      onSelect(sc.id, rowId);
                    }
                  }}
                  style={{
                    width: sc.customWidth ? `${sc.customWidth}%` : "100%",
                    maxWidth: "100%",
                    boxSizing: "border-box",
                    height: sc.customHeight || getDefaultBlockHeight(sc.blockType, sc),
                    flexShrink: 0,
                  }}
                  className={`relative group/stacked-block transition-all ${
                    isStackedSelected && !isPreview ? "ring-2 ring-[#8B3DFF] rounded-2xl" : ""
                  }`}
                >
                  {/* Mini Hover Toolbar for Stacked Item — positioned -top-8 (32px above) so it sits fully above the card and doesn't cover top content */}
                  {!isPreview && isStackedSelected && (
                    <div className={`absolute -top-8 left-0 z-30 ${isStackedSelected ? "opacity-100" : "opacity-0 group-hover/stacked-block:opacity-100"} transition-opacity flex items-center gap-1 bg-white/95 dark:bg-zinc-900/95 border border-slate-200 dark:border-zinc-800 rounded-lg px-2 py-0.5 text-xs backdrop-blur-sm`}>
                      {/* Width Quick Stepper */}
                      <div className="flex items-center border-r border-slate-200 dark:border-zinc-700 pr-1.5 mr-0.5 gap-0.5">
                        <span className="text-[9px] font-mono text-slate-400">W:</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const next = Math.max(25, currentScW - 25);
                            if (typeof onWidthChange === "function") onWidthChange(sc.id, rowId, next);
                          }}
                          className="w-3.5 h-3.5 rounded text-slate-500 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center font-bold text-[10px] cursor-pointer"
                          title="Decrease width of this stacked card"
                        >-</button>
                        <span className="text-[9px] font-mono font-bold text-slate-700 dark:text-zinc-200 min-w-[26px] text-center">
                          {currentScW}%
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const next = Math.min(100, currentScW + 25);
                            if (typeof onWidthChange === "function") onWidthChange(sc.id, rowId, next);
                          }}
                          className="w-3.5 h-3.5 rounded text-slate-500 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center font-bold text-[10px] cursor-pointer"
                          title="Increase width of this stacked card"
                        >+</button>
                      </div>

                      {/* Height Quick Stepper */}
                      <div className="flex items-center border-r border-slate-200 dark:border-zinc-700 pr-1.5 mr-0.5 gap-0.5">
                        <span className="text-[9px] font-mono text-slate-400">H:</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const curH = sc.customHeight || getDefaultBlockHeight(sc.blockType, sc);
                            const next = Math.max(MIN_BLOCK_H, curH - 20);
                            if (typeof onHeightChange === "function") onHeightChange(sc.id, rowId, next);
                          }}
                          className="w-3.5 h-3.5 rounded text-slate-500 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center font-bold text-[10px] cursor-pointer"
                          title="Decrease height of this stacked card"
                        >-</button>
                        <span className="text-[9px] font-mono font-bold text-slate-700 dark:text-zinc-200 min-w-[28px] text-center">
                          {sc.customHeight ? `${sc.customHeight}px` : "Auto"}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const curH = sc.customHeight || getDefaultBlockHeight(sc.blockType, sc);
                            const otherH = Math.max(0, stackedExtraHeight - (curH + 12));
                            const maxH = Math.max(MIN_BLOCK_H, maxColumnHeight - baseBlockHeight - otherH - 12);
                            const next = Math.min(maxH, curH + 20);
                            if (typeof onHeightChange === "function") onHeightChange(sc.id, rowId, next);
                          }}
                          className="w-3.5 h-3.5 rounded text-slate-500 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center font-bold text-[10px] cursor-pointer"
                          title="Increase height of this stacked card"
                        >+</button>
                      </div>

                      {sIdx > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (typeof onReorderStacked === "function") {
                              onReorderStacked(cell.id, "up", sIdx);
                            }
                          }}
                          className="p-0.5 text-slate-500 hover:text-purple-600 rounded cursor-pointer"
                          title="Move up in stack"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {sIdx < cell.stackedCells!.length - 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (typeof onReorderStacked === "function") {
                              onReorderStacked(cell.id, "down", sIdx);
                            }
                          }}
                          className="p-0.5 text-slate-500 hover:text-purple-600 rounded cursor-pointer"
                          title="Move down in stack"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (typeof onUnstackCell === "function") {
                            onUnstackCell(sc.id);
                          }
                        }}
                        className="px-1.5 py-0.5 text-[9px] font-mono text-slate-600 dark:text-zinc-300 hover:text-purple-600 rounded cursor-pointer flex items-center gap-0.5 hover:bg-slate-100 dark:hover:bg-zinc-800"
                        title="Unstack to row as standalone block"
                      >
                        <ExternalLink className="w-2.5 h-2.5" />
                        <span>Unstack</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (typeof onDuplicate === "function") {
                            onDuplicate(sc.id, rowId);
                          }
                        }}
                        className="p-0.5 text-slate-500 hover:text-emerald-600 rounded cursor-pointer"
                        title="Duplicate block"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (typeof onDelete === "function") {
                            onDelete(sc.id, rowId);
                          }
                        }}
                        className="p-0.5 text-slate-500 hover:text-rose-500 rounded cursor-pointer"
                        title="Delete block"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  <div className="h-full overflow-hidden rounded-2xl">
                    <CanvasBlockRenderer
                      cell={sc}
                      isSelected={isStackedSelected}
                      isPreview={isPreview}
                      onUpdateMetricCard={(card) => {
                        if (typeof onUpdateMetricCard === "function") onUpdateMetricCard(rowId, sc.id, card);
                      }}
                      onUpdateChart={(chart) => {
                        if (typeof onUpdateChart === "function") onUpdateChart(rowId, sc.id, chart);
                      }}
                      onOpenChartEditor={() => onEdit(sc, rowId)}
                      onUpdateInsight={(textOrInsight) => {
                        if (typeof onUpdateInsight === "function") onUpdateInsight(rowId, sc.id, textOrInsight);
                      }}
                      onUpdateTextBlock={(content) => {
                        if (typeof onUpdateTextBlock === "function") onUpdateTextBlock(rowId, sc.id, content);
                      }}
                      onUpdateBadgeStrip={(strip) => {
                        if (typeof onUpdateBadgeStrip === "function") onUpdateBadgeStrip(rowId, sc.id, strip);
                      }}
                      onUpdateSingleBadge={(badgeId, patch) => {
                        if (typeof onUpdateSingleBadge === "function") onUpdateSingleBadge(rowId, sc.id, badgeId, patch);
                      }}
                      onAddBadge={() => {
                        if (typeof onAddBadge === "function") onAddBadge(rowId, sc.id);
                      }}
                      onDeleteBadge={(badgeId) => {
                        if (typeof onDeleteBadge === "function") onDeleteBadge(rowId, sc.id, badgeId);
                      }}
                    />
                  </div>

                  {/* Resize handle for stacked block width (right edge) */}
                  {!isPreview  && (
                    <div
                      onMouseDown={(e) => {
                        handleStackedWidthResizeStart(e, sc.id, currentScW);
                      }}
                      className="absolute -right-1.5 top-0 bottom-0 w-3 cursor-col-resize z-30 flex items-center justify-center opacity-0 group-hover/stacked-block:opacity-100 transition-opacity"
                      title="Drag horizontally to adjust width of this stacked block"
                    >
                      <div className="w-0.5 h-8 rounded-full bg-slate-400/80 dark:bg-zinc-500 group-hover/stacked-block:bg-[#8B3DFF]/80 transition-colors" />
                    </div>
                  )}

                  {/* Resize handle for stacked block height (bottom edge) */}
                  {!isPreview && (
                    <div
                      onMouseDown={(e) => {
                        const curH = sc.customHeight || getDefaultBlockHeight(sc.blockType, sc);
                        handleStackedHeightResizeStart(e, sc.id, curH);
                      }}
                      className="absolute left-0 right-0 -bottom-1.5 h-3 cursor-row-resize z-30 flex items-center justify-center opacity-0 group-hover/stacked-block:opacity-100 transition-opacity"
                      title="Drag vertically to adjust height of this stacked card"
                    >
                      <div className="h-0.5 w-8 rounded-full bg-slate-400/80 dark:bg-zinc-500 group-hover/stacked-block:bg-[#8B3DFF]/80 transition-colors" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Canva-style Bottom Edge Drop Target (active during drag) */}
        {!isPreview && !isSelfDragging && (
          <div
            ref={setStackDropRef}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.dataTransfer.dropEffect = "copy";
              if (!isDragOverBottom) setIsDragOverBottom(true);
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setIsDragOverBottom(false);
              }
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragOverBottom(false);
              try {
                const raw = e.dataTransfer.getData("application/json");
                if (!raw) return;
                const data = JSON.parse(raw);
                if (typeof onDropToStack === "function") {
                  onDropToStack(cell.id, data);
                }
              } catch (err) {
                console.error("Drop to stack error:", err);
              }
            }}
            className={`w-full transition-all duration-150 ${
              isStackDropOver || isDragOverBottom
                ? "h-8 my-1 bg-purple-500/20 border-2 border-dashed border-[#8B3DFF] rounded-lg flex items-center justify-center text-[#8B3DFF] text-[10px] font-bold"
                : isOtherDragging
                ? "h-3 my-0.5 border-t-2 border-dashed border-purple-300 dark:border-purple-700/60"
                : "h-0 overflow-hidden"
            }`}
          >
            {(isStackDropOver || isDragOverBottom) && (
              <span className="flex items-center gap-1">
                <Plus className="w-3 h-3" /> Drop to stack here
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── React Portal: Floating "+ Stack below" Button & Quick-Add Menu ── */}
      {mounted && !chartEditorFullscreen && typeof document !== "undefined" && portalPos && !isPreview && !isDragging && !isEditingActive && (isSelected || isHovered || quickAddOpen) &&
        createPortal(
          quickAddOpen ? (
            <div
              onClick={(e) => e.stopPropagation()}
              onMouseEnter={handleCellMouseEnter}
              onMouseLeave={handleCellMouseLeave}
              style={{
                position: "fixed",
                top: portalPos.top,
                left: portalPos.left,
                zIndex: 99999,
              }}
              className="portal-quick-add-panel p-1.5 bg-white/98 dark:bg-zinc-900/98 backdrop-blur-md border-2 border-[#8B3DFF] rounded-2xl flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-150 select-none whitespace-nowrap"
            >
              <div className="flex items-center gap-1 pl-1">
                <Plus className="w-3 h-3 text-[#8B3DFF]" />
                <span className="text-[10px] font-bold text-[#8B3DFF] font-mono uppercase tracking-wider">Stack:</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    const ts = Date.now();
                    if (typeof onStackCellBelow === "function") {
                      onStackCellBelow({
                        id: `cell-mc-${ts}`,
                        colSpan: cell.colSpan || 1,
                        blockType: "metric-card",
                        metricCard: {
                          id: `mc-${ts}`,
                          label: "New KPI Indicator",
                          value: "96.5%",
                          tintColor: "blue",
                          trendDirection: "up",
                          trendValue: "+1.8%",
                        },
                      });
                    }
                    setQuickAddOpen(false);
                  }}
                  className="px-2 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-[#8B3DFF] font-semibold text-[11px] cursor-pointer flex items-center gap-1 transition-colors"
                  title="Stack a Metric Card below"
                >
                  <Activity className="w-3 h-3" /> Metric Card
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const ts = Date.now();
                    if (typeof onStackCellBelow === "function") {
                      onStackCellBelow({
                        id: `cell-tb-${ts}`,
                        colSpan: cell.colSpan || 1,
                        blockType: "text",
                        textBlock: { id: `tb-${ts}`, content: "" },
                      });
                    }
                    setQuickAddOpen(false);
                  }}
                  className="px-2 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 font-semibold text-[11px] cursor-pointer flex items-center gap-1 transition-colors"
                  title="Stack a Text Block below"
                >
                  <Type className="w-3 h-3" /> Text Block
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const ts = Date.now();
                    if (typeof onStackCellBelow === "function") {
                      onStackCellBelow({
                        id: `cell-ki-${ts}`,
                        colSpan: cell.colSpan || 1,
                        blockType: "insight",
                        insight: { id: `ki-${ts}`, text: "Supervisory insight note." },
                      });
                    }
                    setQuickAddOpen(false);
                  }}
                  className="px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 font-semibold text-[11px] cursor-pointer flex items-center gap-1 transition-colors"
                  title="Stack a Key Insight below"
                >
                  <Lightbulb className="w-3 h-3" /> Key Insight
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const ts = Date.now();
                    if (typeof onStackCellBelow === "function") {
                      onStackCellBelow({
                        id: `cell-div-${ts}`,
                        colSpan: cell.colSpan || 1,
                        blockType: "divider",
                      });
                    }
                    setQuickAddOpen(false);
                  }}
                  className="px-2 py-1 rounded-lg bg-slate-500/10 hover:bg-slate-500/20 text-slate-600 dark:text-zinc-300 font-semibold text-[11px] cursor-pointer flex items-center gap-1 transition-colors"
                  title="Stack a Divider below"
                >
                  <Minus className="w-3 h-3" /> Divider
                </button>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setQuickAddOpen(false);
                }}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer ml-1 transition-colors"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setQuickAddOpen(true);
              }}
              onMouseEnter={handleCellMouseEnter}
              onMouseLeave={handleCellMouseLeave}
              style={{
                position: "fixed",
                top: portalPos.top,
                left: portalPos.left,
                zIndex: 99999,
              }}
              className="portal-stack-trigger-btn flex items-center gap-1 px-3 py-1 bg-white/95 dark:bg-zinc-900/95 border border-dashed border-[#8B3DFF]/70 hover:border-[#8B3DFF] text-[#8B3DFF] hover:bg-[#8B3DFF]/10 text-[11px] font-semibold rounded-full backdrop-blur-md cursor-pointer transition-all duration-150 animate-in fade-in zoom-in-95 hover:scale-105 active:scale-95"
              title="Click to stack another block directly below in this column"
            >
              <Plus className="w-3 h-3 text-[#8B3DFF]" />
              <span>Stack below</span>
            </button>
          ),
          document.body
        )
      }

      {/* ── React Portal: Floating Cell Action Bar (Width, Height, Drag, Stack, Actions) ── */}
      {mounted && !chartEditorFullscreen && typeof document !== "undefined" && toolbarPortalPos && showTopToolbar &&
        createPortal(
          <div
            ref={toolbarDomRef}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              top: `${toolbarPortalPos.top}px`,
              left: `${toolbarPortalPos.left}px`,
              zIndex: 99999,
            }}
            className="portal-cell-action-bar flex items-center gap-0.5 bg-white/98 dark:bg-zinc-900/98 border border-slate-200 dark:border-zinc-800 rounded-xl px-1.5 py-0.5 backdrop-blur-md text-xs select-none pointer-events-auto whitespace-nowrap animate-in fade-in duration-100"
          >
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 -ml-0.5 text-slate-400 hover:text-[#8B3DFF] rounded flex items-center"
              title="Drag to move card anywhere across canvas"
            >
              <GripVertical className="w-3.5 h-3.5" />
            </div>

            <div className="flex items-center gap-1 font-mono text-[11px] text-purple-600 dark:text-purple-400 font-bold px-1">
              <span>{Math.round(currentPercent)}%</span>
            </div>

            <div className="flex items-center gap-0.5 border-l border-slate-200 dark:border-zinc-800 pl-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const autoW = defaultWidthForCount;
                  setResizePercent(autoW);
                  const span = autoW >= 85 ? 4 : autoW >= 60 ? 3 : autoW >= 38 ? 2 : 1;
                  if (typeof onColSpanChange === "function") onColSpanChange(cell.id, rowId, span);
                  if (typeof onWidthChange === "function") onWidthChange(cell.id, rowId, autoW);
                }}
                className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-[#8B3DFF] hover:bg-[#8B3DFF]/10 transition-colors cursor-pointer"
                title={`Auto-balance width to fit standard A4 row (${defaultWidthForCount}%)`}
              >
                Auto
              </button>
              {[25, 33, 50, 66, 75, 100].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setResizePercent(preset);
                    const span = preset >= 85 ? 4 : preset >= 60 ? 3 : preset >= 38 ? 2 : 1;
                    if (typeof onColSpanChange === "function") onColSpanChange(cell.id, rowId, span);
                    if (typeof onWidthChange === "function") onWidthChange(cell.id, rowId, preset);
                  }}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                    Math.abs(currentPercent - preset) <= 2
                      ? "bg-[#8B3DFF] text-white font-bold"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  {preset}%
                </button>
              ))}
            </div>

            {/* Height Presets & Steppers */}
            <div className="flex items-center gap-0.5 border-l border-slate-200 dark:border-zinc-800 pl-1.5">
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold font-mono pr-0.5">H:</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setResizeHeight(undefined);
                  if (typeof onHeightChange === "function") onHeightChange(cell.id, rowId, undefined);
                }}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                  !currentHeight
                    ? "bg-[#8B3DFF] text-white font-bold"
                    : "text-[#8B3DFF] hover:bg-[#8B3DFF]/10 font-bold"
                }`}
                title="Auto height (fits content naturally)"
              >
                Auto
              </button>
              {(() => {
                const isChart = cell.blockType === "chart";
                const presetsToUse = isChart
                  ? [
                      { label: "S", h: 280 },
                      { label: "M", h: 360 },
                      { label: "L", h: 460 },
                    ]
                  : [
                      { label: "S", h: 200 },
                      { label: "M", h: 300 },
                      { label: "L", h: 400 },
                    ];
                const minSafeH = isChart ? 260 : MIN_BLOCK_H;

                return (
                  <>
                    {presetsToUse.map((preset) => {
                      const currentAllowed = Math.max(minSafeH, getAvailableHeightToFooter() - stackedExtraHeight);
                      const targetH = Math.min(currentAllowed, preset.h);
                      return (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setResizeHeight(targetH);
                            if (typeof onHeightChange === "function") onHeightChange(cell.id, rowId, targetH);
                          }}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                            currentHeight !== undefined && Math.abs(currentHeight - targetH) <= 15
                              ? "bg-[#8B3DFF] text-white font-bold"
                              : "text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800"
                          }`}
                          title={`Set height to ${preset.label} (${targetH}px)`}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const newH = Math.max(minSafeH, ((typeof currentHeight === "number" ? currentHeight : baseBlockHeight)) - 25);
                        setResizeHeight(newH);
                        if (typeof onHeightChange === "function") onHeightChange(cell.id, rowId, newH);
                      }}
                      className="px-1 py-0.5 rounded text-[10px] font-mono text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                      title={isChart ? "Decrease height by 25px (min 260px)" : "Decrease height by 25px"}
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const currentAllowed = Math.max(minSafeH, getAvailableHeightToFooter() - stackedExtraHeight);
                        const targetH = (typeof currentHeight === "number" ? currentHeight : baseBlockHeight) + 25;
                        const newH = Math.min(currentAllowed, targetH);
                        setResizeHeight(newH);
                        if (typeof onHeightChange === "function") onHeightChange(cell.id, rowId, newH);
                      }}
                      className="px-1 py-0.5 rounded text-[10px] font-mono text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                      title="Increase height by 25px"
                    >
                      +
                    </button>
                  </>
                );
              })()}
            </div>

            <div className="w-px h-3.5 bg-slate-200 dark:bg-zinc-800 mx-0.5" />

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (cell.blockType === "text" || cell.blockType === "insight") {
                  setIsCellEditing(true);
                } else if (typeof onEdit === "function") {
                  onEdit(cell, rowId);
                }
              }}
              className="p-1 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer rounded"
              title="Edit block properties"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (typeof onDuplicate === "function") onDuplicate(cell.id, rowId);
              }}
              className="p-1 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer rounded"
              title="Duplicate block (Ctrl+D)"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (typeof onDelete === "function") onDelete(cell.id, rowId);
              }}
              className="p-1 text-slate-500 hover:text-rose-500 transition-colors cursor-pointer rounded"
              title="Delete block (Del)"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            {/* Float Element on Page (Freeform coordinates & 360° axis rotation) */}
            {onFloatCell && (cell.blockType === "chart" || cell.blockType === "text" || cell.blockType === "insight" || cell.blockType === "metric-card" || cell.blockType === "badge-strip") && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onFloatCell(cell, rowId);
                }}
                className="p-1 text-slate-500 hover:text-[#8B3DFF] dark:hover:text-purple-400 transition-colors cursor-pointer rounded flex items-center gap-1"
                title="Float on Page (detach to freeform coordinates with 360° axis rotation)"
              >
                <Move className="w-3.5 h-3.5 text-[#8B3DFF]" />
              </button>
            )}

            {/* Quick 1-click Stack under left card (Canva Stack) */}
            {cellIndex !== undefined && cellIndex > 0 && previousCellId && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (typeof onMoveToStackBelow === "function") {
                    onMoveToStackBelow(cell.id, previousCellId);
                  }
                }}
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-white bg-[#8B3DFF] hover:bg-[#7828E0] transition-colors cursor-pointer flex items-center gap-1.5 active:scale-95"
                title="Combine into a single vertical column under the card to its left (Canva Stack)"
              >
                <CornerDownLeft className="w-3.5 h-3.5" />
                <span>Stack under left card</span>
              </button>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setQuickAddOpen((prev) => !prev);
              }}
              className={`px-1.5 py-1 transition-all cursor-pointer rounded-lg flex items-center gap-1 text-[10px] font-bold ${
                quickAddOpen
                  ? "bg-[#8B3DFF] text-white"
                  : "text-purple-600 dark:text-purple-400 bg-purple-500/10 hover:bg-purple-500/20"
              }`}
              title="Stack another block directly below this card (Canva Stack)"
            >
              <Plus className="w-3 h-3" />
              <span className="hidden sm:inline">Stack</span>
            </button>
          </div>,
          document.body
        )
      }
    </div>
  );
}

"use client";

import React, { useCallback, useState, useRef, useEffect, useMemo } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  pointerWithin,
  rectIntersection,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { Layers, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { useDispatch } from "react-redux";
import {
  CanvasCell,
  CanvasBlockType,
  updateLibrarySection,
  addCanvasRow,
  toggleRowPageBreak,
  removeCanvasRow,
  addCellToRow,
  moveCellBetweenRows,
  reorderCellsInRow,
  reorderCanvasRows,
  setSectionCanvasRows,
  duplicateCanvasCell,
  deleteCanvasCell,
  moveCellToStackBelow,
  updateCellColSpan,
  updateCellWidth,
  updateCellHeight,
  showGlobalToast,
} from "@/lib/redux/slices/reportModuleSlice";
import { CanvasBlockRenderer } from "./CanvasBlockRenderer";
import { CanvasRuler } from "./CanvasRuler";

import {
  A4_WIDTH_PX,
  A4_HEIGHT_PX,
  partitionCanvasPages,
  PagePartition,
  isColorDark,
  DEFAULT_CANVAS_MARGIN,
  CanvasMarginConfig,
  RulerUnit,
  CanvasStudioProps,
  HeaderTitleFormat,
  DEFAULT_HEADER_TITLE_FORMAT,
} from "../utils";

import {
  DropInsertZone,
  PageAddRowDropZone,
  SortableRow,
  WatermarkStampLayer,
  CanvasReportHeader,
  CanvasSectionHeader,
  CanvasReportFooter,
  CanvasViewportDock,
} from "./CanvasStudioComponent";

export type { CanvasStudioProps };



export function CanvasStudio({
  section,
  selectedCellId,
  selectedRowId,
  onSelectCell,
  onEditCell,
  onUpdateMetricCardInCell,
  onUpdateChartInCell,
  onUpdateInsightInCell,
  onUpdateTextBlockInCell,
  onUpdateBadgeStripInCell,
  onUpdateSingleBadgeInCell,
  onAddBadgeToStripInCell,
  onDeleteBadgeFromStripInCell,
  onHeightChange,
  onUpdateRowStyle,
  onUpdateSectionStyle,
  paperTone = "white",
  marginConfig = DEFAULT_CANVAS_MARGIN,
  pageNumber = 1,
  totalReportPages,
  sectionTextColor,
  showGrid = true,
  onToggleGrid,
  showGuides = false,
  onToggleGuides,
  showRulers = false,
  onToggleRulers,
  zoom = 1,
  setZoom,
  isPreview = false,
  onTogglePreview,
  activeWatermark = null,
  watermarkConfig,
  onUpdateWatermarkConfig,
  onSelectWatermark,
  onDropBlock,
  onEditHeader,
  onMoveCellToStackBelow,
  onStackCellBelow,
  onUnstackCell,
  onReorderStacked,
  activeViewPageIndex: externalActiveViewPageIndex,
  onViewPageIndexChange,
  beforeContent,
  afterContent,
}: CanvasStudioProps) {
  const dispatch = useDispatch();
  const rows = section.canvasRows || [];

  const activePageWidth = A4_WIDTH_PX;
  const activePageHeight = A4_HEIGHT_PX;

  // Multi-page layout engine: partitions rows across authentic A4 sheets (calibrated for standard 842px sheet height)
  const pages = useMemo(() => {
    return partitionCanvasPages(rows, marginConfig, pageNumber, activePageHeight);
  }, [rows, marginConfig, pageNumber, activePageHeight]);

  const computedTotalPages = useMemo(() => {
    return (
      totalReportPages ??
      (pageNumber > 1
        ? pageNumber - 1 + pages.length + (afterContent ? 1 : 0)
        : pages.length)
    );
  }, [totalReportPages, pageNumber, pages.length, afterContent]);

  const [internalActiveViewPageIndex, setInternalActiveViewPageIndex] = useState<number>(externalActiveViewPageIndex ?? 0);
  const activeViewPageIndex = externalActiveViewPageIndex !== undefined ? externalActiveViewPageIndex : internalActiveViewPageIndex;

  const setActiveViewPageIndex = useCallback(
    (idxOrUpdater: number | ((prev: number) => number)) => {
      const nextIdx =
        typeof idxOrUpdater === "function"
          ? idxOrUpdater(activeViewPageIndex)
          : idxOrUpdater;
      if (nextIdx !== activeViewPageIndex) {
        if (onViewPageIndexChange) {
          onViewPageIndexChange(nextIdx);
        } else {
          setInternalActiveViewPageIndex(nextIdx);
        }
      }
    },
    [onViewPageIndexChange, activeViewPageIndex]
  );

  const prevPagesLengthRef = useRef(pages.length);
  const deskScrollRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScrollingRef = useRef<boolean>(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to initial active page if initialized > 0 on mount
  const hasInitialScrolledRef = useRef(false);
  useEffect(() => {
    if (!hasInitialScrolledRef.current && activeViewPageIndex > 0) {
      hasInitialScrolledRef.current = true;
      const timer = setTimeout(() => {
        const targetEl = document.getElementById(`canvas-page-${activeViewPageIndex}`);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [activeViewPageIndex]);

  // Auto-scroll to newly created page if page count increases
  useEffect(() => {
    if (pages.length > prevPagesLengthRef.current) {
      const newPageIdx = pages.length - 1;
      setActiveViewPageIndex(newPageIdx);
      setTimeout(() => {
        document.getElementById(`canvas-page-${newPageIdx}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
    }
    prevPagesLengthRef.current = pages.length;
  }, [pages.length, setActiveViewPageIndex]);

  // Keep activeViewPageIndex clamped within valid bounds if page count changes
  useEffect(() => {
    if (activeViewPageIndex >= pages.length) {
      setActiveViewPageIndex(Math.max(0, pages.length - 1));
    }
  }, [pages.length, activeViewPageIndex, setActiveViewPageIndex]);

  // Clean up any pending scroll timeouts on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const [editingPageIndex, setEditingPageIndex] = useState<number | null>(null);
  const [pageToDelete, setPageToDelete] = useState<PagePartition | null>(null);
  // Internal fallbacks if not controlled by parent
  const [internalSelectedCellId, setInternalSelectedCellId] = useState<string | null>(null);
  const [internalSelectedRowId, setInternalSelectedRowId] = useState<string | null>(null);
  const [internalZoom, setInternalZoom] = useState(1);
  const [internalShowGrid, setInternalShowGrid] = useState(true);
  const [internalShowGuides, setInternalShowGuides] = useState(false);
  const [internalShowRulers, setInternalShowRulers] = useState(false);
  const [rulerUnit, setRulerUnit] = useState<RulerUnit>("px");
  const [pageMousePos, setPageMousePos] = useState<Record<number, { x: number; y: number } | null>>({});
  const [internalIsPreview, setInternalIsPreview] = useState(false);
  const [headerValuesBySection, setHeaderValuesBySection] = useState<
    Record<
      string,
      {
        taglinePrimary: string;
        taglinePrimaryHtml?: string;
        taglineSecondary: string;
        taglineSecondaryHtml?: string;
        title: string;
        titleHtml?: string;
        period: string;
        periodHtml?: string;
      }
    >
  >({});
  const [headerTitleFormatsBySection, setHeaderTitleFormatsBySection] = useState<Record<string, HeaderTitleFormat>>({});
  const [editingHeaderValue, setEditingHeaderValue] = useState<"taglinePrimary" | "taglineSecondary" | "title" | "period" | null>(null);
  const [footerValuesBySection, setFooterValuesBySection] = useState<
    Record<
      string,
      {
        company: string;
        companyHtml?: string;
        websites: string;
        websitesHtml?: string;
        quote: string;
        quoteHtml?: string;
      }
    >
  >({});
  const [editingFooterValue, setEditingFooterValue] = useState<"company" | "websites" | "quote" | null>(null);

  const headerValues = headerValuesBySection[section.id] || {
    taglinePrimary: "Visibility for Every Worker,",
    taglinePrimaryHtml: "",
    taglineSecondary: "Intelligence for Every Site.",
    taglineSecondaryHtml: "",
    title: "Monthly Report",
    titleHtml: "",
    period: "01 Sept 2025 – 30 Sept 2025",
    periodHtml: "",
  };
  const headerTitleFormat = headerTitleFormatsBySection[section.id] || DEFAULT_HEADER_TITLE_FORMAT;
  const headerTitleFontFamily = {
    sans: "var(--font-geist-sans), Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    mono: "ui-monospace, SFMono-Regular, Menlo, monospace",
    rounded: "var(--font-geist-sans), 'Trebuchet MS', sans-serif",
  }[headerTitleFormat.fontFamily];
  const headerTitleTextStyle: React.CSSProperties = {
    fontFamily: headerTitleFontFamily,
    fontSize: `${headerTitleFormat.fontSize}px`,
    color: headerTitleFormat.color,
    fontWeight: headerTitleFormat.bold ? 900 : 500,
    fontStyle: headerTitleFormat.italic ? "italic" : "normal",
    textDecoration: headerTitleFormat.underline ? "underline" : "none",
    textAlign: headerTitleFormat.textAlign,
  };

  const updateHeaderValueWithHtml = (
    field: "taglinePrimary" | "taglineSecondary" | "title" | "period",
    plainText: string,
    html: string
  ) => {
    setHeaderValuesBySection((current) => ({
      ...current,
      [section.id]: {
        ...headerValues,
        [field]: plainText,
        [`${field}Html`]: html,
      },
    }));
    setEditingHeaderValue(null);
  };

  const footerValues = footerValuesBySection[section.id] || {
    company: "AyantrAI Private Limited",
    companyHtml: "",
    websites: "www.ayantrai.com  |  www.sitesafe.ai",
    websitesHtml: "",
    quote: "Every Worker Returns Home Safe",
    quoteHtml: "",
  };

  const updateFooterValueWithHtml = (
    field: "company" | "websites" | "quote",
    plainText: string,
    html: string
  ) => {
    setFooterValuesBySection((current) => ({
      ...current,
      [section.id]: {
        ...footerValues,
        [field]: plainText,
        [`${field}Html`]: html,
      },
    }));
    setEditingFooterValue(null);
  };

  // Section Header Live / Inline Editing State
  const [editingSectionField, setEditingSectionField] = useState<"eyebrow" | "name" | "description" | null>(null);
  useEffect(() => {
  if (!editingHeaderValue && !editingFooterValue && !editingSectionField) {
    setEditingPageIndex(null);
  }
}, [editingHeaderValue, editingFooterValue, editingSectionField]);
  const [localSectionEyebrow, setLocalSectionEyebrow] = useState(section.eyebrow);
  const [localSectionName, setLocalSectionName] = useState(section.name);
  const [localSectionDesc, setLocalSectionDesc] = useState(section.description);

  useEffect(() => {
    setLocalSectionEyebrow(section.eyebrow);
    setLocalSectionName(section.name);
    setLocalSectionDesc(section.description);
  }, [section.eyebrow, section.name, section.description]);

  const commitSectionHeaderUpdate = useCallback(() => {
    dispatch(
      updateLibrarySection({
        id: section.id,
        name: (localSectionName || "").trim() || section.name,
        eyebrow: (localSectionEyebrow || "").trim(),
        description: (localSectionDesc || "").trim(),
      })
    );
    setEditingSectionField(null);
    dispatch(showGlobalToast({ message: "Section header updated", type: "success" }));
  }, [dispatch, section.id, section.name, localSectionName, localSectionEyebrow, localSectionDesc]);

  const activeSelectedCellId = selectedCellId !== undefined ? selectedCellId : internalSelectedCellId;
  const activeSelectedRowId = selectedRowId !== undefined ? selectedRowId : internalSelectedRowId;
  const activeZoom = zoom !== undefined ? zoom : internalZoom;
  const activeShowGrid = showGrid !== undefined ? showGrid : internalShowGrid;
  const activeShowGuides = showGuides !== undefined ? showGuides : internalShowGuides;
  const activeShowRulers = showRulers !== undefined ? showRulers : internalShowRulers;
  const activeIsPreview = isPreview !== undefined ? isPreview : internalIsPreview;

  // Programmatic smooth navigation to a target page
  const handleNavigatePage = useCallback(
    (targetIdx: number) => {
      const clamped = Math.max(0, Math.min(pages.length - 1, targetIdx));
      setActiveViewPageIndex(clamped);
      isProgrammaticScrollingRef.current = true;
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      const targetEl = document.getElementById(`canvas-page-${clamped}`);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      scrollTimeoutRef.current = setTimeout(() => {
        isProgrammaticScrollingRef.current = false;
      }, 600);
    },
    [pages.length]
  );

  // Dynamic active page tracking on desk scroll
  const handleDeskScroll = useCallback(() => {
    if (isProgrammaticScrollingRef.current) return;
    const container = deskScrollRef.current;
    if (!container || pages.length === 0) return;

    const containerRect = container.getBoundingClientRect();
    // Reference reading focal line: 35% down the container viewport
    const focalY = containerRect.top + Math.min(containerRect.height * 0.35, 260);

    let bestIndex = 0;
    let maxVisibleHeight = -1;

    // Boundary snap: if scrolled near the top
    if (container.scrollTop <= 40) {
      bestIndex = 0;
    } else if (container.scrollTop + container.clientHeight >= container.scrollHeight - 40) {
      // Boundary snap: if scrolled near the bottom
      bestIndex = pages.length - 1;
    } else {
      for (let i = 0; i < pages.length; i++) {
        const pageEl = document.getElementById(`canvas-page-${i}`);
        if (!pageEl) continue;
        const pageRect = pageEl.getBoundingClientRect();

        const visibleTop = Math.max(containerRect.top, pageRect.top);
        const visibleBottom = Math.min(containerRect.bottom, pageRect.bottom);
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);

        // If the page covers the focal reading line, that's definitely the active page
        if (pageRect.top <= focalY && pageRect.bottom >= focalY) {
          bestIndex = i;
          break;
        }

        if (visibleHeight > maxVisibleHeight) {
          maxVisibleHeight = visibleHeight;
          bestIndex = i;
        }
      }
    }

    setActiveViewPageIndex((prev) => (prev !== bestIndex ? bestIndex : prev));
  }, [pages.length, setActiveViewPageIndex]);

  // Re-check active page on zoom change
  useEffect(() => {
    const timer = setTimeout(() => {
      handleDeskScroll();
    }, 150);
    return () => clearTimeout(timer);
  }, [activeZoom, handleDeskScroll]);

  const handleSelectCell = useCallback(
    (cellId: string | null, rowId: string | null) => {
      if (typeof onSelectCell === "function") {
        onSelectCell(cellId, rowId);
      } else {
        setInternalSelectedCellId(cellId);
        setInternalSelectedRowId(rowId);
      }
    },
    [onSelectCell]
  );

  const handleToggleGrid = useCallback(() => {
    if (typeof onToggleGrid === "function") {
      onToggleGrid();
    } else {
      setInternalShowGrid((prev) => !prev);
    }
  }, [onToggleGrid]);

  const handleToggleGuides = useCallback(() => {
    if (typeof onToggleGuides === "function") {
      onToggleGuides();
    } else {
      setInternalShowGuides((prev) => !prev);
    }
  }, [onToggleGuides]);

  const handleToggleRulers = useCallback(() => {
    if (typeof onToggleRulers === "function") {
      onToggleRulers();
    } else {
      setInternalShowRulers((prev) => !prev);
    }
  }, [onToggleRulers]);

  // Keyboard Shortcut: Shift + R toggles rulers (Canva / Figma standard)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      const isInput =
        activeTag === "input" ||
        activeTag === "textarea" ||
        (document.activeElement as HTMLElement)?.isContentEditable;
      if (isInput) return;

      if (e.shiftKey && e.key.toLowerCase() === "r" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleToggleRulers();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleToggleRulers]);

  // Selected box bounds for live ruler highlight band
  const getSelectedBoxForPage = useCallback(
    (pageIndex: number) => {
      if (!activeSelectedCellId) return null;
      const cellEl = document.getElementById(`canvas-cell-${activeSelectedCellId}`);
      const pageEl = document.getElementById(`canvas-page-${pageIndex}`);
      if (!cellEl || !pageEl) return null;
      const cellRect = cellEl.getBoundingClientRect();
      const pageRect = pageEl.getBoundingClientRect();
      if (cellRect.bottom < pageRect.top || cellRect.top > pageRect.bottom) {
        return null;
      }
      return {
        x: Math.max(0, Math.round((cellRect.left - pageRect.left) / activeZoom)),
        y: Math.max(0, Math.round((cellRect.top - pageRect.top) / activeZoom)),
        width: Math.round(cellRect.width / activeZoom),
        height: Math.round(cellRect.height / activeZoom),
      };
    },
    [activeSelectedCellId, activeZoom]
  );

  const handleTogglePreview = useCallback(() => {
    if (typeof onTogglePreview === "function") {
      onTogglePreview();
    } else {
      setInternalIsPreview((prev) => !prev);
    }
  }, [onTogglePreview]);

  const zoomIn = () => {
    const next = Math.min(2.5, activeZoom + 0.1);
    if (typeof setZoom === "function") setZoom(next);
    else setInternalZoom(next);
  };

  const zoomOut = () => {
    const next = Math.max(0.5, activeZoom - 0.1);
    if (typeof setZoom === "function") setZoom(next);
    else setInternalZoom(next);
  };

  const resetZoom = () => {
    if (typeof setZoom === "function") setZoom(1);
    else setInternalZoom(1);
  };

  // DnD Kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Active dragged block overlay
  const [activeDragCell, setActiveDragCell] = useState<CanvasCell | null>(null);

  // Custom collision detection prioritizing directional droppable zones
  const customCollisionDetection = useCallback((args: any) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
      // Prioritize explicit directional drop zones (stacking bottom or beside edge)
      const stackCollision = pointerCollisions.find((c: any) =>
        String(c.id).startsWith("stack-drop-")
      );
      if (stackCollision) {
        return [stackCollision, ...pointerCollisions.filter((c: any) => c.id !== stackCollision.id)];
      }

      const besideCollision = pointerCollisions.find((c: any) =>
        String(c.id).startsWith("beside-drop-")
      );
      if (besideCollision) {
        return [besideCollision, ...pointerCollisions.filter((c: any) => c.id !== besideCollision.id)];
      }

      return pointerCollisions;
    }

    const rectCollisions = rectIntersection(args);
    if (rectCollisions.length > 0) {
      const stackCollision = rectCollisions.find((c: any) =>
        String(c.id).startsWith("stack-drop-")
      );
      if (stackCollision) {
        return [stackCollision, ...rectCollisions.filter((c: any) => c.id !== stackCollision.id)];
      }
      return rectCollisions;
    }

    return closestCenter(args);
  }, []);

  // Cell Action Handlers
  const handleDuplicateCell = useCallback(
    (cellId: string, rowId: string) => {
      dispatch(duplicateCanvasCell({ sectionId: section.id, rowId, cellId }));
      dispatch(showGlobalToast({ message: "Block duplicated", type: "success" }));
    },
    [dispatch, section.id]
  );

  const handleDeleteCell = useCallback(
    (cellId: string, rowId: string) => {
      dispatch(deleteCanvasCell({ sectionId: section.id, rowId, cellId }));
      handleSelectCell(null, null);
      dispatch(showGlobalToast({ message: "Block removed", type: "info" }));
    },
    [dispatch, section.id, handleSelectCell]
  );

  const handleColSpanChange = useCallback(
    (cellId: string, rowId: string, colSpan: 1 | 2 | 3 | 4) => {
      dispatch(updateCellColSpan({ sectionId: section.id, rowId, cellId, colSpan }));
    },
    [dispatch, section.id]
  );

  const handleWidthChange = useCallback(
    (cellId: string, rowId: string, customWidth: number) => {
      dispatch(updateCellWidth({ sectionId: section.id, rowId, cellId, customWidth }));
    },
    [dispatch, section.id]
  );

  const handleHeightChange = useCallback(
    (cellId: string, rowId: string, customHeight?: number) => {
      if (typeof onHeightChange === "function") {
        onHeightChange(cellId, rowId, customHeight);
      } else {
        dispatch(updateCellHeight({ sectionId: section.id, rowId, cellId, customHeight }));
      }
    },
    [dispatch, section.id, onHeightChange]
  );

  const handleAddRow = useCallback(() => {
    dispatch(addCanvasRow(section.id));
    dispatch(showGlobalToast({ message: "New row added to section", type: "success" }));
  }, [dispatch, section.id]);

  const handleInsertRowAtIndex = useCallback(
    (insertIndex: number) => {
      dispatch(addCanvasRow({ sectionId: section.id, insertAtIndex: insertIndex }));
      dispatch(showGlobalToast({ message: "New row added to section", type: "success" }));
    },
    [dispatch, section.id]
  );

  const handleAddPage = useCallback(() => {
    dispatch(addCanvasRow({ sectionId: section.id, pageBreakBefore: true }));
    dispatch(showGlobalToast({ message: "New A4 page created", type: "success" }));
  }, [dispatch, section.id]);

  const handleTogglePageBreak = useCallback(
    (rowId: string) => {
      dispatch(toggleRowPageBreak({ sectionId: section.id, rowId }));
      dispatch(showGlobalToast({ message: "Page break toggled", type: "info" }));
    },
    [dispatch, section.id]
  );

  const handleRemoveRow = useCallback(
    (rowId: string) => {
      dispatch(removeCanvasRow({ sectionId: section.id, rowId }));
      handleSelectCell(null, null);
      dispatch(showGlobalToast({ message: "Row removed", type: "info" }));
    },
    [dispatch, section.id, handleSelectCell]
  );

  const handleConfirmDeletePage = useCallback(
    (targetPage: PagePartition) => {
      if (pages.length <= 1) {
        dispatch(
          showGlobalToast({
            message: "Cannot delete the only page in the document.",
            type: "warning",
          })
        );
        setPageToDelete(null);
        return;
      }

      const rowIdsToDelete = new Set(targetPage.rows.map((r) => r.id));
      const remainingRows = (section.canvasRows || [])
        .filter((r) => !rowIdsToDelete.has(r.id))
        .map((r, idx) => {
          // If page 1 was deleted, clear manual page break on the new first row so content starts cleanly on Page 1
          if (idx === 0 && r.pageBreakBefore) {
            return { ...r, pageBreakBefore: false };
          }
          return r;
        });

      dispatch(
        setSectionCanvasRows({
          sectionId: section.id,
          canvasRows: remainingRows,
        })
      );

      handleSelectCell(null, null);
      setActiveViewPageIndex((prev) => Math.max(0, Math.min(prev, pages.length - 2)));
      setPageToDelete(null);

      const rowCount = targetPage.rows.length;
      dispatch(
        showGlobalToast({
          message: `Page ${targetPage.pageNumber} deleted (${rowCount} ${rowCount === 1 ? "row" : "rows"} removed).`,
          type: "info",
        })
      );
    },
    [dispatch, section.id, section.canvasRows, pages.length, handleSelectCell]
  );

  const handleMovePageUp = useCallback(
    (pageIndex: number) => {
      if (pageIndex <= 0 || pageIndex >= pages.length) return;
      const targetPage = pages[pageIndex];
      const prevPage = pages[pageIndex - 1];
      if (!targetPage || !prevPage) return;

      const currentRows = section.canvasRows || [];
      const targetIds = new Set(targetPage.rows.map((r) => r.id));
      const prevIds = new Set(prevPage.rows.map((r) => r.id));

      const firstPrevIdx = currentRows.findIndex((r) => prevIds.has(r.id));
      if (firstPrevIdx === -1) return;

      const rowsWithoutTarget = currentRows.filter((r) => !targetIds.has(r.id));
      const targetRows = targetPage.rows;

      const nextRows = [
        ...rowsWithoutTarget.slice(0, firstPrevIdx),
        ...targetRows,
        ...rowsWithoutTarget.slice(firstPrevIdx),
      ].map((r, idx) => {
        if (idx === 0) {
          return { ...r, pageBreakBefore: false };
        }
        if (prevIds.has(r.id) && r.id === prevPage.rows[0]?.id) {
          return { ...r, pageBreakBefore: true };
        }
        return r;
      });

      dispatch(setSectionCanvasRows({ sectionId: section.id, canvasRows: nextRows }));
      dispatch(showGlobalToast({ message: `Moved Page ${targetPage.pageNumber} up!`, type: "success" }));
      setActiveViewPageIndex(pageIndex - 1);
      setTimeout(() => {
        document.getElementById(`canvas-page-${pageIndex - 1}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    },
    [dispatch, section.id, section.canvasRows, pages, setActiveViewPageIndex]
  );

  const handleMovePageDown = useCallback(
    (pageIndex: number) => {
      if (pageIndex < 0 || pageIndex >= pages.length - 1) return;
      const targetPage = pages[pageIndex];
      const nextPage = pages[pageIndex + 1];
      if (!targetPage || !nextPage) return;

      const currentRows = section.canvasRows || [];
      const targetIds = new Set(targetPage.rows.map((r) => r.id));
      const nextIds = new Set(nextPage.rows.map((r) => r.id));

      let lastNextIdx = -1;
      for (let i = 0; i < currentRows.length; i++) {
        if (nextIds.has(currentRows[i].id)) lastNextIdx = i;
      }
      if (lastNextIdx === -1) return;

      const rowsWithoutTarget = currentRows.filter((r) => !targetIds.has(r.id));
      let insertIdx = 0;
      for (let i = 0; i < rowsWithoutTarget.length; i++) {
        if (nextIds.has(rowsWithoutTarget[i].id)) insertIdx = i + 1;
      }

      const nextRows = [
        ...rowsWithoutTarget.slice(0, insertIdx),
        ...targetPage.rows,
        ...rowsWithoutTarget.slice(insertIdx),
      ].map((r, idx) => {
        if (idx === 0) {
          return { ...r, pageBreakBefore: false };
        }
        if (targetIds.has(r.id) && r.id === targetPage.rows[0]?.id) {
          return { ...r, pageBreakBefore: true };
        }
        return r;
      });

      dispatch(setSectionCanvasRows({ sectionId: section.id, canvasRows: nextRows }));
      dispatch(showGlobalToast({ message: `Moved Page ${targetPage.pageNumber} down!`, type: "success" }));
      setActiveViewPageIndex(pageIndex + 1);
      setTimeout(() => {
        document.getElementById(`canvas-page-${pageIndex + 1}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    },
    [dispatch, section.id, section.canvasRows, pages, setActiveViewPageIndex]
  );

  const handleAddBlockBeside = useCallback(
    (rowId: string, cellIndex: number, blockType: CanvasBlockType = "text") => {
      const ts = Date.now();
      let newCell: CanvasCell;
      if (blockType === "metric-card") {
        newCell = {
          id: `cell-mc-${ts}`,
          colSpan: 1,
          blockType: "metric-card",
          metricCard: {
            id: `mc-${ts}`,
            label: "New KPI Indicator",
            value: "96.5%",
            tintColor: "blue",
            trendDirection: "up",
            trendValue: "+1.8%",
          },
        };
      } else if (blockType === "insight") {
        newCell = {
          id: `cell-ki-${ts}`,
          colSpan: 1,
          blockType: "insight",
          insight: { id: `ki-${ts}`, text: "Supervisory insight note." },
        };
      } else {
        newCell = {
          id: `cell-tb-${ts}`,
          colSpan: 1,
          blockType: "text",
          textBlock: { id: `tb-${ts}`, content: "" },
        };
      }
      dispatch(addCellToRow({ sectionId: section.id, rowId, cell: newCell, insertAtIndex: cellIndex }));
      handleSelectCell(newCell.id, rowId);
      dispatch(showGlobalToast({ message: "Added new column beside!", type: "success" }));
    },
    [dispatch, section.id, handleSelectCell]
  );

  // Drag Handlers
  const handleDragStart = (e: DragStartEvent) => {
    const data = e.active.data.current;
    if (data?.cell) setActiveDragCell(data.cell as CanvasCell);
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveDragCell(null);
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    const activeData = active.data.current;
    const overData = over.data.current;
    const activeId = String(active.id);
    const overId = String(over.id);

    // 1. Stack drop (dragged block dropped onto bottom stack-drop zone)
    if (overData?.isStackDrop || overId.startsWith("stack-drop-")) {
      const targetCellId = (overData?.targetCellId as string) || overId.replace("stack-drop-", "");
      const toRowId = (overData?.rowId as string) || (activeData?.rowId as string);
      const fromRowId = (activeData?.rowId as string) || toRowId;

      if (activeId !== targetCellId && toRowId) {
        dispatch(
          moveCellToStackBelow({
            sectionId: section.id,
            fromRowId,
            toRowId,
            sourceCellId: activeId,
            targetCellId,
          })
        );
        handleSelectCell(activeId, toRowId);
        dispatch(
          showGlobalToast({
            message: "Stacked card directly underneath into column!",
            type: "success",
          })
        );
      }
      return;
    }

    // 2. Beside drop (dragged block dropped onto right edge beside-drop zone)
    if (overData?.isBesideDrop || overId.startsWith("beside-drop-")) {
      const targetCellId = (overData?.targetCellId as string) || overId.replace("beside-drop-", "");
      const toRowId = (overData?.rowId as string) || (activeData?.rowId as string);
      const fromRowId = (activeData?.rowId as string) || toRowId;

      if (activeId !== targetCellId && toRowId) {
        const toRow = rows.find((r) => r.id === toRowId);
        if (toRow) {
          const targetIndex = toRow.cells.findIndex((c) => c.id === targetCellId);
          const insertIdx = targetIndex !== -1 ? targetIndex + 1 : toRow.cells.length;

          if (fromRowId === toRowId) {
            const oldIndex = toRow.cells.findIndex((c) => c.id === activeId);
            if (oldIndex !== -1 && oldIndex !== insertIdx) {
              const newCells = arrayMove(toRow.cells, oldIndex, oldIndex < insertIdx ? insertIdx - 1 : insertIdx);
              dispatch(reorderCellsInRow({ sectionId: section.id, rowId: toRowId, cells: newCells }));
            }
          } else if (fromRowId) {
            dispatch(
              moveCellBetweenRows({
                sectionId: section.id,
                fromRowId,
                toRowId,
                cellId: activeId,
                toIndex: insertIdx,
              })
            );
          }
          handleSelectCell(activeId, toRowId);
          dispatch(
            showGlobalToast({
              message: "Placed card beside in row!",
              type: "success",
            })
          );
        }
      }
      return;
    }

    // 3. Row reordering
    if (activeData?.isRow) {
      const oldIndex = rows.findIndex((r) => r.id === active.id);
      const newIndex = rows.findIndex((r) => r.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const newRows = arrayMove(rows, oldIndex, newIndex);
        dispatch(reorderCanvasRows({ sectionId: section.id, rows: newRows }));
      }
      return;
    }

    // 4. Cell reordering inside same row or cross-row
    if (activeData?.cell && activeData?.rowId) {
      const fromRowId = activeData.rowId;
      const cellId = String(active.id);

      const toRowId = (overData?.rowId as string) || (overData?.isRow ? String(over.id) : null);
      if (toRowId) {
        if (fromRowId === toRowId) {
          const row = rows.find((r) => r.id === fromRowId);
          if (row) {
            const oldIndex = row.cells.findIndex((c) => c.id === cellId);
            const newIndex = row.cells.findIndex((c) => c.id === over.id);
            if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
              const newCells = arrayMove(row.cells, oldIndex, newIndex);
              dispatch(reorderCellsInRow({ sectionId: section.id, rowId: fromRowId, cells: newCells }));
            }
          }
        } else {
          // Cross-row movement
          const toRow = rows.find((r) => r.id === toRowId);
          if (toRow) {
            const targetIndex = overData?.isRow
              ? toRow.cells.length
              : toRow.cells.findIndex((c) => c.id === over.id);
            dispatch(
              moveCellBetweenRows({
                sectionId: section.id,
                fromRowId,
                toRowId,
                cellId,
                toIndex: targetIndex === -1 ? toRow.cells.length : targetIndex,
              })
            );
            dispatch(showGlobalToast({ message: "Moved card to new row!", type: "success" }));
          }
        }
      }
    }
  };

  // Background desk click clears selection
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleSelectCell(null, null);
      setIsWatermarkSelected(false);
    }
  };

  const isCustomColor =
    Boolean(paperTone) &&
    (paperTone.startsWith("#") ||
      paperTone.startsWith("rgb") ||
      paperTone.startsWith("hsl"));

  const paperBgClass =
    paperTone === "slate"
      ? "bg-slate-50 text-slate-900"
      : paperTone === "paper" || paperTone === "cream"
      ? "bg-[#faf8f5] text-slate-900"
      : paperTone === "linen"
      ? "bg-[#f4f1ea] text-slate-900"
      : paperTone === "ice"
      ? "bg-[#f0f7ff] text-slate-900"
      : paperTone === "mint"
      ? "bg-[#f2f9f5] text-slate-900"
      : paperTone === "rose"
      ? "bg-[#fff5f7] text-slate-900"
      : paperTone === "amber"
      ? "bg-[#fffbeb] text-slate-900"
      : paperTone === "dark"
      ? "bg-[#0f172a] text-white"
      : !isCustomColor
      ? "bg-white text-slate-900"
      : "";

  const customPaperStyle: React.CSSProperties = isCustomColor
    ? { backgroundColor: paperTone }
    : {};

  const isDarkPaper = isColorDark(paperTone);

  // Watermark parameters
  const wmOpacity = (watermarkConfig?.opacity ?? 18) / 100;
  const wmScale = (watermarkConfig?.scale ?? 100) / 100;
  const wmRotation = watermarkConfig?.rotation ?? -18;
  const wmPlacement = watermarkConfig?.placement ?? "center";
  const wmXOffset = watermarkConfig?.xOffset ?? 0;
  const wmYOffset = watermarkConfig?.yOffset ?? 0;
  const wmLayer = watermarkConfig?.layer ?? "back";

  const [isWatermarkSelected, setIsWatermarkSelected] = useState(false);
  const [isDraggingWatermark, setIsDraggingWatermark] = useState(false);
  const [isResizingWatermark, setIsResizingWatermark] = useState(false);

  const getPlacementClass = (pos: string) => {
    switch (pos) {
      case "top-left":
        return "items-start justify-start";
      case "top-center":
        return "items-start justify-center";
      case "top-right":
        return "items-start justify-end";
      case "center-left":
        return "items-center justify-start";
      case "center":
        return "items-center justify-center";
      case "center-right":
        return "items-center justify-end";
      case "bottom-left":
        return "items-end justify-start";
      case "bottom-center":
        return "items-end justify-center";
      case "bottom-right":
        return "items-end justify-end";
      case "tiled":
        return "items-center justify-around flex-wrap opacity-60";
      default:
        return "items-center justify-center";
    }
  };

  const handleWatermarkDragStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDraggingWatermark(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const startXOffset = wmXOffset;
    const startYOffset = wmYOffset;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaXPercent = Math.round(((moveEvent.clientX - startX) / 800) * 100);
      const deltaYPercent = Math.round(((moveEvent.clientY - startY) / 1000) * 100);
      const newX = Math.min(50, Math.max(-50, startXOffset + deltaXPercent));
      const newY = Math.min(50, Math.max(-50, startYOffset + deltaYPercent));
      if (onUpdateWatermarkConfig) {
        onUpdateWatermarkConfig({ xOffset: newX, yOffset: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDraggingWatermark(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleWatermarkResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizingWatermark(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const startScale = Math.round(wmScale * 100);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = (moveEvent.clientX - startX) - (moveEvent.clientY - startY);
      const newScale = Math.min(300, Math.max(20, Math.round(startScale + delta * 0.5)));
      if (onUpdateWatermarkConfig) {
        onUpdateWatermarkConfig({ scale: newScale });
      }
    };

    const handleMouseUp = () => {
      setIsResizingWatermark(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* ── Infinite Studio Blueprint Desk ── */}
      <div
        ref={deskScrollRef}
        onScroll={handleDeskScroll}
        className="relative flex-1 min-h-0 overflow-auto p-2 sm:p-1 flex flex-col items-center select-none bg-[#f1f4f9] dark:bg-[#06080d]"
        style={
          activeShowGrid
            ? {
                backgroundImage: "radial-gradient(circle, rgba(148, 163, 184, 0.35) 1.5px, transparent 1.5px)",
                backgroundSize: "24px 24px",
              }
            : undefined
        }
        onClick={handleCanvasClick}
      >
        {/* Scalable Multi-Page Desk Container */}
        <div
          className="flex flex-col items-center gap-1 py-2 transition-transform duration-200 select-none"
          style={{
            transform: `scale(${activeZoom})`,
            transformOrigin: "top center",
            width: activeShowRulers && !activeIsPreview ? `${activePageWidth + 32}px` : `${activePageWidth}px`,
            minWidth: activeShowRulers && !activeIsPreview
              ? `${Math.round((activePageWidth + 32) * Math.max(1, activeZoom))}px`
              : `${Math.round(activePageWidth * Math.max(1, activeZoom))}px`,
          }}
        >
          {/* Before Content Slot — e.g. Cover Page */}
          {beforeContent && (
            <div className="flex flex-col items-center pb-4">
              {beforeContent}
            </div>
          )}

          <SortableContext
            items={rows.map((r) => r.id)}
            strategy={verticalListSortingStrategy}
            disabled={activeIsPreview}
          >
            {pages.map((page, pageIdx) => {
              const isEditingHere = editingPageIndex === page.pageIndex;
              const openHeader = (f: "taglinePrimary" | "taglineSecondary" | "title" | "period") => {
  if (activeIsPreview) return;
  setEditingPageIndex(page.pageIndex);
  setEditingHeaderValue(f);
};
const openFooter = (f: "company" | "websites" | "quote") => {
  if (activeIsPreview) return;
  setEditingPageIndex(page.pageIndex);
  setEditingFooterValue(f);
};
const openSection = (f: "eyebrow" | "name" | "description") => {
  if (activeIsPreview) return;
  setEditingPageIndex(page.pageIndex);
  setEditingSectionField(f);
};
              return (
                <React.Fragment key={`page-${page.pageIndex}`}>
                  {/* Clean Document Page Break Divider between pages on desk */}
                  {pageIdx > 0 && (
                    <div
                      className="flex items-center gap-3 my-4 select-none"
                      style={{
                        width: `${activePageWidth}px`,
                        marginLeft: activeShowRulers && !activeIsPreview ? "32px" : undefined,
                      }}
                    >
                      <div className="flex-1 border-t border-dashed border-slate-300 dark:border-zinc-700" />
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-zinc-800/90 text-slate-500 dark:text-zinc-400 text-[10px] font-mono uppercase tracking-wider font-semibold border border-slate-200 dark:border-zinc-700 shadow-xs">
                        <Layers className="w-3 h-3 text-[#8B3DFF]" />
                        <span>Page Break &bull; Standard A4</span>
                      </div>
                      <div className="flex-1 border-t border-dashed border-slate-300 dark:border-zinc-700" />
                    </div>
                  )}

                  {/* ── Standard Artboard Header Toolbar (Page X of Y + Complete Page Delete) ── */}
                  {!activeIsPreview && (
                    <div
                      className="flex items-center justify-between pb-2 px-0.5 text-xs select-none"
                      style={{
                        width: `${activePageWidth}px`,
                        marginLeft: activeShowRulers && !activeIsPreview ? "32px" : undefined,
                        marginTop: pageIdx > 0 ? "4px" : undefined,
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-800 dark:text-zinc-200">
                          Page {page.pageNumber} of {computedTotalPages}
                        </span>
                        <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">
                          &bull; {page.rows.length} {page.rows.length === 1 ? "row" : "rows"}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono bg-slate-100 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded border border-slate-200/80 dark:border-zinc-700/60">
                          A4 595×842
                        </span>
                      </div>

                      {pages.length > 1 && (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleMovePageUp(page.pageIndex)}
                            disabled={page.pageIndex === 0}
                            className="h-7 px-2 rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none text-slate-700 dark:text-zinc-300 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                            title="Move Page Up"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Move Up</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleMovePageDown(page.pageIndex)}
                            disabled={page.pageIndex === pages.length - 1}
                            className="h-7 px-2 rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none text-slate-700 dark:text-zinc-300 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                            title="Move Page Down"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Move Down</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setPageToDelete(page)}
                            className="h-7 px-2.5 rounded-lg border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                            title={`Delete Page ${page.pageNumber}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Page</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Page Ruler & Artboard Wrapper ── */}
                  <div
                    key={`page-ruler-wrapper-${page.pageIndex}`}
                    className="relative"
                    style={{
                      marginTop: activeShowRulers && !activeIsPreview ? "24px" : undefined,
                      marginLeft: activeShowRulers && !activeIsPreview ? "32px" : undefined,
                    }}
                    onMouseMove={(e) => {
                      if (!activeShowRulers || activeIsPreview) return;
                      const pageEl = document.getElementById(`canvas-page-${page.pageIndex}`);
                      if (!pageEl) return;
                      const rect = pageEl.getBoundingClientRect();
                      const x = Math.round((e.clientX - rect.left) / activeZoom);
                      const y = Math.round((e.clientY - rect.top) / activeZoom);
                      setPageMousePos((prev) => ({
                        ...prev,
                        [page.pageIndex]: {
                          x: Math.max(0, Math.min(activePageWidth, x)),
                          y: Math.max(0, Math.min(activePageHeight, y)),
                        },
                      }));
                    }}
                    onMouseLeave={() => {
                      setPageMousePos((prev) => ({
                        ...prev,
                        [page.pageIndex]: null,
                      }));
                    }}
                  >
                    {/* ── Precision Figma/Canva Style Canvas Ruler Overlay ── */}
                    {activeShowRulers && !activeIsPreview && (
                      <CanvasRuler
                        pageWidth={activePageWidth}
                        pageHeight={activePageHeight}
                        marginConfig={marginConfig}
                        activeMousePos={pageMousePos[page.pageIndex] || null}
                        selectedBox={getSelectedBoxForPage(page.pageIndex)}
                        unit={rulerUnit}
                        onUnitChange={(u) => setRulerUnit(u)}
                        isDark={isDarkPaper}
                      />
                    )}

                    {/* ── Fixed A4 Artboard Sheet ── */}
                    <div
                      id={`canvas-page-${page.pageIndex}`}
                      onClick={() => setActiveViewPageIndex(page.pageIndex)}
                    style={{
                      ...customPaperStyle,
                      borderRadius: "2px",
                      width: `${activePageWidth}px`,
                      minWidth: `${activePageWidth}px`,
                      maxWidth: `${activePageWidth}px`,
                      height: `${activePageHeight}px`,
                      minHeight: `${activePageHeight}px`,
                      maxHeight: `${activePageHeight}px`,
                      boxSizing: "border-box",
                    }}
                    className={`relative ${paperBgClass} border border-slate-200/90 dark:border-zinc-800 ${
                     (editingHeaderValue || editingSectionField || editingFooterValue) && isEditingHere ? "overflow-visible" : "overflow-hidden"
                    } transition-all duration-200 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_25px_50px_-12px_rgba(0,0,0,0.18),0_0_0_1px_rgba(0,0,0,0.05)] flex flex-col justify-between`}
                  >
                    {/* Margin Guides (if enabled) */}
                    {activeShowGuides && !activeIsPreview && (
                      <div
                        className="absolute border border-dashed border-sky-400/40 pointer-events-none z-20"
                        style={{
                          top: marginConfig.top,
                          right: marginConfig.right,
                          bottom: marginConfig.bottom,
                          left: marginConfig.left,
                          borderRadius: "2px",
                        }}
                      />
                    )}

                    {/* Realistic Corporate Document Watermark Stamp Layer */}
                    <WatermarkStampLayer
                      activeWatermark={activeWatermark}
                      wmPlacement={wmPlacement}
                      wmOpacity={wmOpacity}
                      wmScale={wmScale}
                      wmRotation={wmRotation}
                      wmXOffset={wmXOffset}
                      wmYOffset={wmYOffset}
                      wmLayer={wmLayer}
                      isDarkPaper={isDarkPaper}
                      isWatermarkSelected={isWatermarkSelected}
                      activeIsPreview={activeIsPreview}
                      handleWatermarkDragStart={handleWatermarkDragStart}
                      handleWatermarkResizeStart={handleWatermarkResizeStart}
                      onUpdateWatermarkConfig={onUpdateWatermarkConfig}
                      onSelectWatermark={onSelectWatermark}
                      setIsWatermarkSelected={setIsWatermarkSelected}
                      getPlacementClass={getPlacementClass}
                    />

                    {/* Fixed Sitesafe Running Report Header (Edge-to-edge flush with top of A4 sheet) */}
                    <CanvasReportHeader
                      pageNumber={page.pageNumber}
                      paperTone={paperTone}
                      headerValues={headerValues}
                      headerTitleFormat={headerTitleFormat}
                      headerTitleTextStyle={headerTitleTextStyle}
                      editingHeaderValue={isEditingHere ? editingHeaderValue : null}
                      activeIsPreview={activeIsPreview}
                      onStartEditing={openHeader}
                      onSave={updateHeaderValueWithHtml}
                      onCancel={() => setEditingHeaderValue(null)}
                    />

                    {/* Inner Page Content with Margins */}
                    <div
                      className="relative z-10 flex-1 min-h-0 flex flex-col justify-between w-full max-w-full box-border"
                      style={{
                        paddingTop: 10,
                        paddingRight: marginConfig.right,
                        paddingBottom: 6,
                        paddingLeft: marginConfig.left,
                        boxSizing: "border-box",
                      }}
                    >
                      {/* Top Content Area */}
                      <div>
                        {/* Section-specific Header Bar */}
                        <CanvasSectionHeader
                          section={
                            page.rows[0]?.sectionName && page.rows[0].sectionName !== section.name
                              ? {
                                  ...section,
                                  name: page.rows[0].sectionName,
                                  eyebrow: "STATUTORY COMPLIANCE & AUDIT",
                                }
                              : section
                          }
                          paperTone={paperTone}
                          isDarkPaper={isDarkPaper}
                          sectionTextColor={sectionTextColor}
                          editingSectionField={isEditingHere ? editingSectionField : null}
                          activeIsPreview={activeIsPreview}
                          activeWatermark={activeWatermark}
                          isWatermarkSelected={isWatermarkSelected}
                          wmScale={wmScale}
                          onStartEditing={openSection}
                          onFinishEditing={() => setEditingSectionField(null)}
                          onUpdateSection={(patch) => {
                            dispatch(
                              updateLibrarySection({
                                id: section.id,
                                ...patch,
                                changes: patch,
                              })
                            );
                            if (patch.name !== undefined) setLocalSectionName(patch.name);
                            if (patch.eyebrow !== undefined) setLocalSectionEyebrow(patch.eyebrow);
                            if (patch.description !== undefined) setLocalSectionDesc(patch.description);
                            dispatch(showGlobalToast({ message: "Section updated!", type: "success" }));
                          }}
                          onUpdateSpacing={(space) => {
                            dispatch(updateLibrarySection({ id: section.id, headerSpacing: space }));
                          }}
                          onToggleWatermarkSelect={() => setIsWatermarkSelected(!isWatermarkSelected)}
                        />
                      
                        </div>

                      {/* Canvas Rows Container for this Page */}
                      <div
                        className="relative z-10 space-y-2 flex-1 min-h-0 overflow-visible transition-all duration-150"
                        style={{
                          paddingTop: section.sectionStyle?.paddingTop !== undefined ? `${section.sectionStyle.paddingTop}px` : section.sectionStyle?.padding !== undefined ? `${section.sectionStyle.padding}px` : "12px",
                          paddingBottom: section.sectionStyle?.paddingBottom !== undefined ? `${section.sectionStyle.paddingBottom}px` : section.sectionStyle?.padding !== undefined ? `${section.sectionStyle.padding}px` : "6px",
                          paddingLeft: section.sectionStyle?.paddingLeft !== undefined ? `${section.sectionStyle.paddingLeft}px` : section.sectionStyle?.padding !== undefined ? `${section.sectionStyle.padding}px` : "0px",
                          paddingRight: section.sectionStyle?.paddingRight !== undefined ? `${section.sectionStyle.paddingRight}px` : section.sectionStyle?.padding !== undefined ? `${section.sectionStyle.padding}px` : "0px",
                          backgroundColor: section.sectionStyle?.backgroundColor,
                          borderRadius: section.sectionStyle?.borderRadius !== undefined ? (typeof section.sectionStyle.borderRadius === "number" ? `${section.sectionStyle.borderRadius}px` : section.sectionStyle.borderRadius) : undefined,
                          borderWidth: section.sectionStyle?.borderWidth !== undefined ? `${section.sectionStyle.borderWidth}px` : undefined,
                          borderColor: section.sectionStyle?.borderColor,
                          borderStyle: section.sectionStyle?.borderStyle || (section.sectionStyle?.borderWidth ? "solid" : undefined),
                        }}
                      >
                        {page.rows.length === 0 ? (
                          <div
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              e.dataTransfer.dropEffect = "copy";
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              try {
                                const raw = e.dataTransfer.getData("application/json");
                                if (!raw) return;
                                const data = JSON.parse(raw);
                                if (onDropBlock) onDropBlock({ ...data, insertRowAtIndex: 0 });
                              } catch (err) {
                                console.error("Empty canvas drop error:", err);
                              }
                            }}
                            className="text-center py-16 border-2 border-dashed border-slate-200 dark:border-zinc-800 hover:border-[#9D61FF] hover:bg-[#9D61FF]/5 transition-all rounded-2xl text-slate-400 dark:text-zinc-600 space-y-3 cursor-copy"
                          >
                            <p className="text-sm font-medium">Canvas is empty</p>
                            <p className="text-xs">Drag any block from the left sidebar or click to add</p>
                          </div>
                        ) : (
                          <div className="space-y-3.5">
                            {/* Drop zone at the top of this page */}
                            {/* {!activeIsPreview && page.rows.length > 0 && (
                              <DropInsertZone
                                insertIndex={Math.max(0, rows.findIndex((r) => r.id === page.rows[0]?.id))}
                                onAddRow={handleInsertRowAtIndex}
                                onDropBlock={onDropBlock}
                                label={page.isFirstPage ? "Drop to insert at top of report" : `Drop to insert at top of Page ${page.pageNumber}`}
                              />
                            )} */}

                            {page.rows.map((row,rowIdx) => {
                              const globalRowIndex = rows.findIndex((r) => r.id === row.id);
                              return (
                                <React.Fragment key={row.id}>
                                  <SortableRow
                                    sectionId={section.id}
                                    row={row}
                                    selectedCellId={activeSelectedCellId}
                                    selectedRowId={activeSelectedRowId}
                                    isPreview={activeIsPreview}
                                    currentPageNumber={page.pageNumber}
                                    zoom={activeZoom}
                                    onSelectCell={handleSelectCell}
                                    onEditCell={onEditCell}
                                    onDuplicateCell={handleDuplicateCell}
                                    onDeleteCell={handleDeleteCell}
                                    onColSpanChange={handleColSpanChange}
                                    onWidthChange={handleWidthChange}
                                    onHeightChange={handleHeightChange}
                                    onUpdateMetricCard={onUpdateMetricCardInCell}
                                    onUpdateChart={onUpdateChartInCell}
                                    onUpdateInsight={onUpdateInsightInCell}
                                    onUpdateTextBlock={onUpdateTextBlockInCell}
                                    onUpdateBadgeStrip={onUpdateBadgeStripInCell}
                                    onUpdateSingleBadge={onUpdateSingleBadgeInCell}
                                    onAddBadge={onAddBadgeToStripInCell}
                                    onDeleteBadge={onDeleteBadgeFromStripInCell}
                                    onRemoveRow={handleRemoveRow}
                                    onTogglePageBreak={handleTogglePageBreak}
                                    onUpdateRowStyle={onUpdateRowStyle}
                                    onDropBlock={onDropBlock}
                                    onMoveCellToStackBelow={onMoveCellToStackBelow}
                                    onStackCellBelow={onStackCellBelow}
                                    onUnstackCell={onUnstackCell}
                                    onReorderStacked={onReorderStacked}
                                    activeDragCellId={activeDragCell?.id || null}
                                    onAddBlockBeside={handleAddBlockBeside}
                                  />
                                  {/* Drop zone below this row */}
                                  {!activeIsPreview && rowIdx === page.rows.length - 1 && (
                                    <DropInsertZone
                                      insertIndex={globalRowIndex + 1}
                                      onAddRow={handleInsertRowAtIndex}
                                      onDropBlock={onDropBlock}
                                      label={`Drop to insert new row below row ${globalRowIndex + 1}`}
                                    />
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </div>
                        )}

                        {/* Add Row Button on this page (Hidden in preview) */}
                        {!activeIsPreview && (
                          <div className="flex items-center gap-2 pt-2">
                            {/* {(() => {
                              const lastRowOfPage = page.rows[page.rows.length - 1];
                              const pageEndInsertIndex = lastRowOfPage
                                ? rows.findIndex((r) => r.id === lastRowOfPage.id) + 1
                                : rows.length;
                              return (
                                <PageAddRowDropZone
                                  pageNumber={page.pageNumber}
                                  insertIndex={pageEndInsertIndex}
                                  onAddRow={() => handleInsertRowAtIndex(pageEndInsertIndex)}
                                  onDropBlock={onDropBlock}
                                />
                              );
                            })()} */}


                            
                            {page.isLastPage && (
                              <button
                                type="button"
                                onClick={handleAddPage}
                                className="
                                  px-3.5 py-2.5 rounded-xl border border-dashed border-[#8B3DFF]/40
                                  text-xs font-bold text-[#8B3DFF] bg-[#8B3DFF]/5
                                  hover:bg-[#8B3DFF]/10 hover:border-[#8B3DFF]
                                  transition-all flex items-center gap-1.5 cursor-pointer
                                "
                                title="Create a new blank A4 page"
                              >
                                <Layers className="w-3.5 h-3.5" />
                                <span>+ New Page</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Footer: Full Sitesafe Footer on Last Page, Running footer on earlier pages (Edge-to-edge) */}
                    <CanvasReportFooter
                      paperTone={paperTone}
                      footerValues={footerValues}
                      editingFooterValue={isEditingHere ? editingFooterValue : null}
                      activeIsPreview={activeIsPreview}
                      onStartEditing={openFooter}
                      onSave={updateFooterValueWithHtml}
                      onCancel={() => setEditingFooterValue(null)}
                    />
                  </div>
                </div>
              </React.Fragment>
              );
            })}
          </SortableContext>

          {/* After Content Slot — e.g. Back Cover Page */}
          {afterContent && (
            <div className="flex flex-col items-center pt-4">
              {afterContent}
            </div>
          )}
        </div>
      </div>

      {/* ── Floating Viewport Dock (Bottom Center/Right) ── */}
      <CanvasViewportDock
        pagesCount={pages.length}
        activeViewPageIndex={activeViewPageIndex}
        onNavigatePage={handleNavigatePage}
        onDeleteCurrentPage={
          pages.length > 1
            ? () => {
                const target = pages[activeViewPageIndex] || pages[0];
                if (target) setPageToDelete(target);
              }
            : undefined
        }
        activeZoom={activeZoom}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetZoom={resetZoom}
        activeShowGrid={activeShowGrid}
        onToggleGrid={handleToggleGrid}
        activeShowGuides={activeShowGuides}
        onToggleGuides={handleToggleGuides}
        activeShowRulers={activeShowRulers}
        onToggleRulers={handleToggleRulers}
        activeIsPreview={activeIsPreview}
        onTogglePreview={handleTogglePreview}
      />

      {/* ── Complete Page Delete Confirmation Modal ── */}
      {pageToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-sm bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4 animate-scaleUp text-slate-900 dark:text-white text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold">Delete Page {pageToDelete.pageNumber}?</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                {pageToDelete.rows.length > 0 ? (
                  <>
                    This will permanently remove all <span className="font-semibold text-slate-700 dark:text-zinc-200">{pageToDelete.rows.length} {pageToDelete.rows.length === 1 ? "row" : "rows"}</span> and their visual blocks on Page {pageToDelete.pageNumber}.
                  </>
                ) : (
                  `Are you sure you want to delete Page ${pageToDelete.pageNumber}?`
                )}
                <br />This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPageToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              
              <button
                type="button"
                onClick={() => handleConfirmDeletePage(pageToDelete)}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 active:scale-95 text-white text-xs font-bold transition-all shadow-md shadow-rose-500/20 cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Page {pageToDelete.pageNumber}</span>
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ── 3D Elevated Drag Overlay ── */}
      <DragOverlay dropAnimation={{ duration: 150, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}>
        {activeDragCell && (
          <div className="w-[300px] max-w-full opacity-95 shadow-[0_20px_50px_rgba(0,0,0,0.35)] rounded-2xl rotate-1 scale-105 transition-transform ring-2 ring-[#8B3DFF] pointer-events-none cursor-grabbing">
            <CanvasBlockRenderer cell={activeDragCell} isPreview />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

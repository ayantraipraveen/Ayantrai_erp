"use client";

import { PayloadAction } from "@reduxjs/toolkit";
import {
  ReportModuleState,
  LibrarySection,
  LibraryMetricCard,
  LibraryChartCard,
  LibraryKeyInsightItem,
  CanvasRow,
  CanvasRowStyle,
  CanvasSectionStyle,
  CanvasCell,
  CanvasCellStyle,
  CanvasTextBlock,
  CanvasBadgeStrip,
  CanvasBadgeItem,
  CanvasCoordinateStamp,
  GraphType,
  CoverPageData,
  DEFAULT_COVER_PAGE_DATA,
  TableOfContentsData,
  DEFAULT_TABLE_OF_CONTENTS_DATA,
  BackCoverData,
  DEFAULT_BACK_COVER_DATA,
  PageConfigOverride,
  CanvasDividerBlock,
  CanvasElementBlock,
} from "../../types/reportModuleTypes";

/**
 * Auto-balances cell widths in a row so that:
 * 1 cell  -> 100% (colSpan 4)
 * 2 cells -> 50% / 50% (colSpan 2 each)
 * 3 cells -> 33.3% / 33.3% / 33.3% (colSpan 1 each)
 * 4 cells -> 25% / 25% / 25% / 25% (colSpan 1 each)
 * strictly respecting the standard A4 printable width without horizontal overflow.
 */
export function autoBalanceRowCells(row: CanvasRow): void {
  if (!row.cells || row.cells.length === 0) return;
  const count = row.cells.length;
  if (count === 1) {
    row.cells[0].customWidth = 100;
    row.cells[0].colSpan = 4;
    return;
  }
  const w = count === 2 ? 50 : count === 3 ? 33.3 : count === 4 ? 25 : Math.max(15, Math.floor(100 / count));
  const colSpan: 1 | 2 | 3 | 4 = count === 2 ? 2 : 1;
  row.cells.forEach((c) => {
    c.customWidth = w;
    c.colSpan = colSpan;
  });
}

/**
 * Finds a cell in a row, whether it is a top-level cell or inside a stacked column (stackedCells)
 */
export function findCellInRow(
  row: CanvasRow,
  cellId: string
): { cell: CanvasCell; parentCell?: CanvasCell; index: number; isStacked: boolean } | null {
  if (!row.cells) return null;
  for (let i = 0; i < row.cells.length; i++) {
    const c = row.cells[i];
    if (c.id === cellId) {
      return { cell: c, index: i, isStacked: false };
    }
    if (c.stackedCells && c.stackedCells.length > 0) {
      for (let j = 0; j < c.stackedCells.length; j++) {
        if (c.stackedCells[j].id === cellId) {
          return { cell: c.stackedCells[j], parentCell: c, index: j, isStacked: true };
        }
      }
    }
  }
  return null;
}

export const sectionsStudioReducers = {
    setLibrarySections: (state: ReportModuleState, action: PayloadAction<LibrarySection[]>) => {
      state.librarySections = action.payload;
    },
    addOrReplaceLibrarySection: (state: ReportModuleState, action: PayloadAction<LibrarySection>) => {
      const idx = state.librarySections.findIndex((s) => s.id === action.payload.id);
      if (idx !== -1) {
        state.librarySections[idx] = action.payload;
      } else {
        state.librarySections.unshift(action.payload);
      }
    },
    setSelectedLibrarySectionId: (state: ReportModuleState, action: PayloadAction<string | null>) => {
      state.selectedLibrarySectionId = action.payload;
    },

    createLibrarySection: (
      state: ReportModuleState,
      action: PayloadAction<{
        id?: string;
        name: string;
        eyebrow?: string;
        description: string;
        icon?: string;
        metricCards?: LibraryMetricCard[];
        charts?: LibraryChartCard[];
        keyInsights?: LibraryKeyInsightItem[];
        canvasRows?: CanvasRow[];
        coverPageData?: CoverPageData;
        tableOfContentsData?: import("../../types/reportModuleTypes").TableOfContentsData;
        backCoverData?: BackCoverData;
        watermarkId?: string;
      }>
    ) => {
      const newId = action.payload.id || `sec-custom-${Date.now()}`;
      const existingIdx = state.librarySections.findIndex((s) => s.id === newId);
      if (existingIdx !== -1) {
        state.librarySections[existingIdx] = {
          ...state.librarySections[existingIdx],
          name: action.payload.name || state.librarySections[existingIdx].name,
          eyebrow: action.payload.eyebrow || state.librarySections[existingIdx].eyebrow,
          description: action.payload.description || state.librarySections[existingIdx].description,
          canvasRows: action.payload.canvasRows || state.librarySections[existingIdx].canvasRows,
          coverPageData: action.payload.coverPageData || state.librarySections[existingIdx].coverPageData,
          tableOfContentsData: action.payload.tableOfContentsData || state.librarySections[existingIdx].tableOfContentsData,
          backCoverData: action.payload.backCoverData || state.librarySections[existingIdx].backCoverData,
        };
        state.selectedLibrarySectionId = newId;
        return;
      }
      const newSec: LibrarySection = {
        id: newId,
        name: action.payload.name,
        eyebrow: action.payload.eyebrow || "CUSTOM MODULE",
        description: action.payload.description,
        type: "custom",
        icon: action.payload.icon || "Layers",
        updatedAt: "Just now",
        metricCards: action.payload.metricCards || [],
        charts: action.payload.charts || [],
        keyInsights: action.payload.keyInsights || [],
        canvasRows: action.payload.canvasRows || [],
        coverPageData: action.payload.coverPageData,
        tableOfContentsData: action.payload.tableOfContentsData,
        backCoverData: action.payload.backCoverData,
        watermarkId: action.payload.watermarkId,
      };
      state.librarySections.unshift(newSec);
      state.selectedLibrarySectionId = newSec.id;
      state.activityLogs.unshift({
        id: `act-${Date.now()}-lib-add`,
        actor: state.activeRole === "superadmin" ? "Dr. Vikram Seth" : "Site Admin",
        role: state.activeRole === "superadmin" ? "Superadmin" : "Site Admin",
        action: `Created new library section: ${newSec.name}`,
        target: "Sections & Graphs Library",
        timestamp: "Just now",
        type: "template",
      });
    },
    updateLibrarySection: (
      state: ReportModuleState,
      action: PayloadAction<{
        id: string;
        name?: string;
        eyebrow?: string;
        description?: string;
        icon?: string;
        watermarkId?: string;
        watermarkConfig?: LibrarySection["watermarkConfig"];
        headerSpacing?: "compact" | "normal" | "spacious";
        titleHtml?: string;
        titleStyle?: Partial<LibrarySection["titleStyle"]>;
        eyebrowHtml?: string;
        descriptionHtml?: string;
        stamps?: CanvasCoordinateStamp[];
        pageOverrides?: Record<number, PageConfigOverride>;
        changes?: Partial<LibrarySection>;
      }>
    ) => {
      const sec = state.librarySections.find((s: LibrarySection) => s.id === action.payload.id);
      if (sec) {
        const c = action.payload.changes;
        if (c) {
          if (c.name !== undefined) sec.name = c.name;
          if (c.titleHtml !== undefined) sec.titleHtml = c.titleHtml;
          if (c.titleStyle !== undefined) sec.titleStyle = { ...sec.titleStyle, ...c.titleStyle };
          if (c.eyebrow !== undefined) sec.eyebrow = c.eyebrow;
          if (c.eyebrowHtml !== undefined) sec.eyebrowHtml = c.eyebrowHtml;
          if (c.description !== undefined) sec.description = c.description;
          if (c.descriptionHtml !== undefined) sec.descriptionHtml = c.descriptionHtml;
          if (c.icon !== undefined) sec.icon = c.icon;
          if (c.watermarkId !== undefined) sec.watermarkId = c.watermarkId;
          if (c.watermarkConfig !== undefined) sec.watermarkConfig = c.watermarkConfig;
          if (c.headerSpacing !== undefined) sec.headerSpacing = c.headerSpacing;
          if (c.pageOverrides !== undefined) sec.pageOverrides = c.pageOverrides;
          if (c.stamps !== undefined) sec.stamps = c.stamps;
        }
        if (action.payload.name !== undefined) sec.name = action.payload.name;
        if (action.payload.titleHtml !== undefined) sec.titleHtml = action.payload.titleHtml;
        if (action.payload.titleStyle !== undefined) sec.titleStyle = { ...sec.titleStyle, ...action.payload.titleStyle };
        if (action.payload.eyebrow !== undefined) sec.eyebrow = action.payload.eyebrow;
        if (action.payload.eyebrowHtml !== undefined) sec.eyebrowHtml = action.payload.eyebrowHtml;
        if (action.payload.description !== undefined) sec.description = action.payload.description;
        if (action.payload.descriptionHtml !== undefined) sec.descriptionHtml = action.payload.descriptionHtml;
        if (action.payload.icon !== undefined) sec.icon = action.payload.icon;
        if (action.payload.watermarkId !== undefined) sec.watermarkId = action.payload.watermarkId;
        if (action.payload.watermarkConfig !== undefined) sec.watermarkConfig = action.payload.watermarkConfig;
        if (action.payload.headerSpacing !== undefined) sec.headerSpacing = action.payload.headerSpacing;
        if (action.payload.stamps !== undefined) sec.stamps = action.payload.stamps;
        if (action.payload.pageOverrides !== undefined) sec.pageOverrides = action.payload.pageOverrides;
        sec.updatedAt = "Just now";
      }
    },
    setSectionPageOverride: (
      state: ReportModuleState,
      action: PayloadAction<{
        sectionId: string;
        pageIndex: number;
        override: Partial<PageConfigOverride>;
      }>
    ) => {
      const sec = state.librarySections.find((s: LibrarySection) => s.id === action.payload.sectionId);
      if (sec) {
        if (!sec.pageOverrides) sec.pageOverrides = {};
        sec.pageOverrides[action.payload.pageIndex] = {
          ...sec.pageOverrides[action.payload.pageIndex],
          ...action.payload.override,
        };
        sec.updatedAt = "Just now";
      }
    },
    duplicateLibrarySection: (state: ReportModuleState, action: PayloadAction<string>) => {
      const src = state.librarySections.find((s: LibrarySection) => s.id === action.payload);
      if (src) {
        const cloned: LibrarySection = {
          ...src,
          id: `sec-custom-dup-${Date.now()}`,
          name: `${src.name} (Copy)`,
          type: "custom",
          updatedAt: "Just now",
          metricCards: src.metricCards.map((c, i) => ({
            ...c,
            id: `mc-dup-${Date.now()}-${i}`,
          })),
          charts: src.charts.map((ch, i) => ({
            ...ch,
            id: `ch-dup-${Date.now()}-${i}`,
          })),
          keyInsights: src.keyInsights.map((ki, i) => ({
            ...ki,
            id: `ki-dup-${Date.now()}-${i}`,
          })),
        };
        state.librarySections.unshift(cloned);
        state.selectedLibrarySectionId = cloned.id;
        state.activityLogs.unshift({
          id: `act-${Date.now()}-lib-dup`,
          actor: state.activeRole === "superadmin" ? "Dr. Vikram Seth" : "Site Admin",
          role: state.activeRole === "superadmin" ? "Superadmin" : "Site Admin",
          action: `Duplicated library section: ${src.name}`,
          target: `${cloned.id} from ${src.id}`,
          timestamp: "Just now",
          type: "template",
        });
      }
    },
    deleteLibrarySection: (state: ReportModuleState, action: PayloadAction<string>) => {
      const sec = state.librarySections.find((s: LibrarySection) => s.id === action.payload);
      if (sec && sec.type !== "core") {
        state.librarySections = state.librarySections.filter((s: LibrarySection) => s.id !== action.payload);
        if (state.selectedLibrarySectionId === action.payload) {
          state.selectedLibrarySectionId = null;
        }
        state.activityLogs.unshift({
          id: `act-${Date.now()}-lib-del`,
          actor: state.activeRole === "superadmin" ? "Dr. Vikram Seth" : "Site Admin",
          role: state.activeRole === "superadmin" ? "Superadmin" : "Site Admin",
          action: `Deleted library section: ${sec.name}`,
          target: sec.id,
          timestamp: "Just now",
          type: "template",
        });
      }
    },
    addCardToSection: (
      state: ReportModuleState,
      action: PayloadAction<{ sectionId: string; card: Omit<LibraryMetricCard, "id"> }>
    ) => {
      const sec = state.librarySections.find((s: LibrarySection) => s.id === action.payload.sectionId);
      if (sec) {
        sec.metricCards.push({
          ...action.payload.card,
          id: `mc-${Date.now()}`,
        });
        sec.updatedAt = "Just now";
      }
    },
    updateCardInSection: (
      state: ReportModuleState,
      action: PayloadAction<{ sectionId: string; card: LibraryMetricCard }>
    ) => {
      const sec = state.librarySections.find((s: LibrarySection) => s.id === action.payload.sectionId);
      if (sec) {
        const idx = sec.metricCards.findIndex((c: LibraryMetricCard) => c.id === action.payload.card.id);
        if (idx !== -1) {
          sec.metricCards[idx] = action.payload.card;
          sec.updatedAt = "Just now";
        }
      }
    },
    deleteCardFromSection: (
      state: ReportModuleState,
      action: PayloadAction<{ sectionId: string; cardId: string }>
    ) => {
      const sec = state.librarySections.find((s: LibrarySection) => s.id === action.payload.sectionId);
      if (sec) {
        sec.metricCards = sec.metricCards.filter((c: LibraryMetricCard) => c.id !== action.payload.cardId);
        sec.updatedAt = "Just now";
      }
    },
    reorderCardsInSection: (
      state: ReportModuleState,
      action: PayloadAction<{ sectionId: string; cards: LibraryMetricCard[] }>
    ) => {
      const sec = state.librarySections.find((s: LibrarySection) => s.id === action.payload.sectionId);
      if (sec) {
        sec.metricCards = action.payload.cards;
        sec.updatedAt = "Just now";
      }
    },
    addChartToSection: (
      state: ReportModuleState,
      action: PayloadAction<{ sectionId: string; chart: Omit<LibraryChartCard, "id"> }>
    ) => {
      const sec = state.librarySections.find((s: LibrarySection) => s.id === action.payload.sectionId);
      if (sec) {
        sec.charts.push({
          ...action.payload.chart,
          id: `ch-${Date.now()}`,
        });
        sec.updatedAt = "Just now";
      }
    },
    updateChartInSection: (
      state: ReportModuleState,
      action: PayloadAction<{ sectionId: string; chart: LibraryChartCard }>
    ) => {
      const sec = state.librarySections.find((s: LibrarySection) => s.id === action.payload.sectionId);
      if (sec) {
        const idx = sec.charts.findIndex((ch: LibraryChartCard) => ch.id === action.payload.chart.id);
        if (idx !== -1) {
          sec.charts[idx] = action.payload.chart;
          sec.updatedAt = "Just now";
        }
      }
    },
    deleteChartFromSection: (
      state: ReportModuleState,
      action: PayloadAction<{ sectionId: string; chartId: string }>
    ) => {
      const sec = state.librarySections.find((s: LibrarySection) => s.id === action.payload.sectionId);
      if (sec) {
        sec.charts = sec.charts.filter((ch: LibraryChartCard) => ch.id !== action.payload.chartId);
        sec.updatedAt = "Just now";
      }
    },
    reorderChartsInSection: (
      state: ReportModuleState,
      action: PayloadAction<{ sectionId: string; charts: LibraryChartCard[] }>
    ) => {
      const sec = state.librarySections.find((s: LibrarySection) => s.id === action.payload.sectionId);
      if (sec) {
        sec.charts = action.payload.charts;
        sec.updatedAt = "Just now";
      }
    },
    addInsightToSection: (
      state: ReportModuleState,
      action: PayloadAction<{ sectionId: string; text: string }>
    ) => {
      const sec = state.librarySections.find((s: LibrarySection) => s.id === action.payload.sectionId);
      if (sec) {
        sec.keyInsights.push({
          id: `ki-${Date.now()}`,
          text: action.payload.text,
        });
        sec.updatedAt = "Just now";
      }
    },
    updateInsightInSection: (
      state: ReportModuleState,
      action: PayloadAction<{ sectionId: string; insight: LibraryKeyInsightItem }>
    ) => {
      const sec = state.librarySections.find((s: LibrarySection) => s.id === action.payload.sectionId);
      if (sec) {
        const idx = sec.keyInsights.findIndex((ki: LibraryKeyInsightItem) => ki.id === action.payload.insight.id);
        if (idx !== -1) {
          sec.keyInsights[idx] = action.payload.insight;
          sec.updatedAt = "Just now";
        }
      }
    },
    deleteInsightFromSection: (
      state: ReportModuleState,
      action: PayloadAction<{ sectionId: string; insightId: string }>
    ) => {
      const sec = state.librarySections.find((s: LibrarySection) => s.id === action.payload.sectionId);
      if (sec) {
        sec.keyInsights = sec.keyInsights.filter((ki: LibraryKeyInsightItem) => ki.id !== action.payload.insightId);
        sec.updatedAt = "Just now";
      }
    },
    reorderInsightsInSection: (
      state: ReportModuleState,
      action: PayloadAction<{ sectionId: string; keyInsights: LibraryKeyInsightItem[] }>
    ) => {
      const sec = state.librarySections.find((s: LibrarySection) => s.id === action.payload.sectionId);
      if (sec) {
        sec.keyInsights = action.payload.keyInsights;
        sec.updatedAt = "Just now";
      }
    },

    // ── Canvas Row/Cell Reducers (Canva-like Section Editor) ─────────────────
    /** Auto-migrate a section's flat arrays → canvasRows (called on first canvas open) */
    migrateToCanvasRows: (state: ReportModuleState, action: PayloadAction<string>) => {
      const sec = state.librarySections.find((s: LibrarySection) => s.id === action.payload);
      if (!sec || sec.canvasRows) return; // already migrated

      const rows: CanvasRow[] = [];

      // Row 1: Metric Cards (auto-balanced width across standard A4 row)
      if (sec.metricCards && sec.metricCards.length > 0) {
        const count = sec.metricCards.length;
        const w = count === 1 ? 100 : count === 2 ? 50 : count === 3 ? 33.3 : count === 4 ? 25 : Math.floor(100 / count);
        const colSpan = (count === 1 ? 4 : count === 2 ? 2 : 1) as 1 | 2 | 3 | 4;
        rows.push({
          id: `row-mc-${Date.now()}`,
          cells: sec.metricCards.map((card) => ({
            id: `cell-mc-${card.id}`,
            colSpan,
            customWidth: w,
            blockType: "metric-card" as const,
            metricCard: card,
          })),
        });
      }

      // Row 2+: Charts (one chart per row, full-width)
      sec.charts?.forEach((chart, i) => {
        rows.push({
          id: `row-ch-${Date.now()}-${i}`,
          cells: [
            {
              id: `cell-ch-${chart.id}`,
              colSpan: 4 as const,
              blockType: "chart" as const,
              chart,
            },
          ],
        });
      });

      // Last Row: Key Insights (one cell per insight)
      if (sec.keyInsights && sec.keyInsights.length > 0) {
        rows.push({
          id: `row-ki-${Date.now()}`,
          cells: sec.keyInsights.map((ki: LibraryKeyInsightItem) => ({
            id: `cell-ki-${ki.id}`,
            colSpan: 4 as const,
            blockType: "insight" as const,
            insight: ki,
          })),
        });
      }

      sec.canvasRows = rows;
      sec.updatedAt = "Just now";
    },

    /** Add a new empty row to the section canvas */
    addCanvasRow: (
      state: ReportModuleState,
      action: PayloadAction<string | { sectionId: string; pageBreakBefore?: boolean; insertAtIndex?: number }>
    ) => {
      const targetId = typeof action.payload === "string" ? action.payload : action.payload?.sectionId;
      const pageBreakBefore = typeof action.payload === "object" ? Boolean(action.payload?.pageBreakBefore) : false;
      const insertAtIndex = typeof action.payload === "object" ? action.payload?.insertAtIndex : undefined;
      const sec = state.librarySections.find((s: LibrarySection) => s.id === targetId);
      if (sec) {
        if (!sec.canvasRows) sec.canvasRows = [];
        const newRow: CanvasRow = { id: `row-${Date.now()}`, cells: [], pageBreakBefore };
        if (typeof insertAtIndex === "number" && insertAtIndex >= 0 && insertAtIndex <= sec.canvasRows.length) {
          sec.canvasRows.splice(insertAtIndex, 0, newRow);
        } else {
          sec.canvasRows.push(newRow);
        }
        sec.updatedAt = "Just now";
      }
    },

    /** Toggle page break before a row */
    toggleRowPageBreak: (
      state: ReportModuleState,
      action: PayloadAction<{ sectionId: string; rowId: string }>
    ) => {
      const sec = state.librarySections.find((s: LibrarySection) => s.id === action.payload.sectionId);
      if (sec && sec.canvasRows) {
        const row = sec.canvasRows.find((r: CanvasRow) => r.id === action.payload.rowId);
        if (row) {
          row.pageBreakBefore = !row.pageBreakBefore;
          sec.updatedAt = "Just now";
        }
      }
    },

    /** Atomically add a new row with a first cell (for sidebar block drops / insertion) */
    addRowWithCell: (
      state: ReportModuleState,
      action: PayloadAction<{
        sectionId: string;
        cell: CanvasCell;
        insertAtIndex?: number;
      }>
    ) => {
      const sec = state.librarySections.find((s: LibrarySection) => s.id === action.payload.sectionId);
      if (sec) {
        if (!sec.canvasRows) sec.canvasRows = [];
        const newRow: CanvasRow = {
          id: `row-${Date.now()}`,
          cells: [{ ...action.payload.cell, colSpan: 4, customWidth: 100 }],
        };
        if (
          typeof action.payload.insertAtIndex === "number" &&
          action.payload.insertAtIndex >= 0 &&
          action.payload.insertAtIndex <= sec.canvasRows.length
        ) {
          sec.canvasRows.splice(action.payload.insertAtIndex, 0, newRow);
        } else {
          sec.canvasRows.push(newRow);
        }
        sec.updatedAt = "Just now";
      }
    },

    /** Remove a row from the canvas */
    removeCanvasRow: (
      state: ReportModuleState,
      action: PayloadAction<{ sectionId: string; rowId: string }>
    ) => {
      const sec = state.librarySections.find(
        (s: LibrarySection) => s.id === action.payload.sectionId
      );
      if (sec && sec.canvasRows) {
        sec.canvasRows = sec.canvasRows.filter(
          (r: CanvasRow) => r.id !== action.payload.rowId
        );
        sec.updatedAt = "Just now";
      }
    },

    /** Add a new cell to a specific row */
    addCellToRow: (
      state: ReportModuleState,
      action: PayloadAction<{
        sectionId: string;
        rowId: string;
        cell: CanvasCell;
        insertAtIndex?: number;
      }>
    ) => {
      const sec = state.librarySections.find(
        (s: LibrarySection) => s.id === action.payload.sectionId
      );
      const row = sec?.canvasRows?.find((r: CanvasRow) => r.id === action.payload.rowId);
      if (row) {
        if (
          typeof action.payload.insertAtIndex === "number" &&
          action.payload.insertAtIndex >= 0 &&
          action.payload.insertAtIndex <= row.cells.length
        ) {
          row.cells.splice(action.payload.insertAtIndex, 0, action.payload.cell);
        } else {
          row.cells.push(action.payload.cell);
        }
        autoBalanceRowCells(row);
        if (sec) sec.updatedAt = "Just now";
      }
    },

    /** Move a cell between rows (cross-row drag) */
    moveCellBetweenRows: (
      state: ReportModuleState,
      action: PayloadAction<{
        sectionId: string;
        fromRowId: string;
        toRowId: string;
        cellId: string;
        toIndex: number; // insert position in destination row
      }>
    ) => {
      const { sectionId, fromRowId, toRowId, cellId, toIndex } = action.payload;
      const sec = state.librarySections.find((s: LibrarySection) => s.id === sectionId);
      if (!sec?.canvasRows) return;

      const fromRow = sec.canvasRows.find((r: CanvasRow) => r.id === fromRowId);
      const toRow = sec.canvasRows.find((r: CanvasRow) => r.id === toRowId);
      if (!fromRow || !toRow) return;

      const cellIdx = fromRow.cells.findIndex((c: CanvasCell) => c.id === cellId);
      if (cellIdx === -1) return;

      const [cell] = fromRow.cells.splice(cellIdx, 1);
      toRow.cells.splice(toIndex, 0, cell);
      autoBalanceRowCells(fromRow);
      autoBalanceRowCells(toRow);
      sec.updatedAt = "Just now";
    },

    /** Reorder cells within the same row (same-row drag) */
    reorderCellsInRow: (
      state: ReportModuleState,
      action: PayloadAction<{
        sectionId: string;
        rowId: string;
        cells: CanvasCell[];
      }>
    ) => {
      const sec = state.librarySections.find(
        (s: LibrarySection) => s.id === action.payload.sectionId
      );
      const row = sec?.canvasRows?.find((r: CanvasRow) => r.id === action.payload.rowId);
      if (row) {
        row.cells = action.payload.cells;
        if (sec) sec.updatedAt = "Just now";
      }
    },

    /** Reorder rows themselves */
    reorderCanvasRows: (
      state: ReportModuleState,
      action: PayloadAction<{
        sectionId: string;
        rows: CanvasRow[];
      }>
    ) => {
      const sec = state.librarySections.find(
        (s: LibrarySection) => s.id === action.payload.sectionId
      );
      if (sec) {
        sec.canvasRows = action.payload.rows;
        sec.updatedAt = "Just now";
      }
    },

    /** Set or restore entire canvasRows state for Undo/Redo or history */
    setSectionCanvasRows: (
      state: ReportModuleState,
      action: PayloadAction<{
        sectionId: string;
        canvasRows: CanvasRow[];
      }>
    ) => {
      const sec = state.librarySections.find(
        (s: LibrarySection) => s.id === action.payload.sectionId
      );
      if (sec) {
        sec.canvasRows = action.payload.canvasRows;
        sec.updatedAt = "Just now";
      }
    },
    duplicateCanvasCell: (
      state: ReportModuleState,
      action: PayloadAction<{
        sectionId: string;
        rowId: string;
        cellId: string;
      }>
    ) => {
      const { sectionId, rowId, cellId } = action.payload;
      const sec = state.librarySections.find((s: LibrarySection) => s.id === sectionId);
      const row = sec?.canvasRows?.find((r: CanvasRow) => r.id === rowId);
      if (!row) return;

      const found = findCellInRow(row, cellId);
      if (!found) return;

      const original = found.cell;
      const ts = Date.now();
      const cloned: CanvasCell = {
        ...original,
        id: `cell-dup-${ts}`,
        metricCard: original.metricCard
          ? { ...original.metricCard, id: `mc-dup-${ts}` }
          : undefined,
        chart: original.chart
          ? { ...original.chart, id: `ch-dup-${ts}` }
          : undefined,
        insight: original.insight
          ? { ...original.insight, id: `ki-dup-${ts}` }
          : undefined,
        textBlock: original.textBlock
          ? { ...original.textBlock, id: `tb-dup-${ts}` }
          : undefined,
        badgeStrip: original.badgeStrip
          ? {
              ...original.badgeStrip,
              id: `bs-dup-${ts}`,
              badges: original.badgeStrip.badges.map((b: CanvasBadgeItem, i: number) => ({
                ...b,
                id: `badge-dup-${ts}-${i}`,
              })),
            }
          : undefined,
      };

      if (found.isStacked && found.parentCell?.stackedCells) {
        found.parentCell.stackedCells.splice(found.index + 1, 0, cloned);
      } else {
        row.cells.splice(found.index + 1, 0, cloned);
        autoBalanceRowCells(row);
      }
      if (sec) sec.updatedAt = "Just now";
    },

    /** Delete a cell from a row or from a column stack */
    deleteCanvasCell: (
      state: ReportModuleState,
      action: PayloadAction<{
        sectionId: string;
        rowId: string;
        cellId: string;
      }>
    ) => {
      const { sectionId, rowId, cellId } = action.payload;
      const sec = state.librarySections.find((s: LibrarySection) => s.id === sectionId);
      const row = sec?.canvasRows?.find((r: CanvasRow) => r.id === rowId);
      if (!row) return;

      const found = findCellInRow(row, cellId);
      if (!found) return;

      if (found.isStacked && found.parentCell?.stackedCells) {
        found.parentCell.stackedCells.splice(found.index, 1);
      } else {
        row.cells.splice(found.index, 1);
        autoBalanceRowCells(row);
      }
      if (sec) sec.updatedAt = "Just now";
    },

    /** Stacks a new cell directly below a target cell in the same column (Canva Stack) */
    stackCellBelow: (
      state: ReportModuleState,
      action: PayloadAction<{
        sectionId: string;
        rowId: string;
        targetCellId: string;
        cell: CanvasCell;
        insertAtIndex?: number;
      }>
    ) => {
      const { sectionId, rowId, targetCellId, cell, insertAtIndex } = action.payload;
      const sec = state.librarySections.find((s: LibrarySection) => s.id === sectionId);
      const row = sec?.canvasRows?.find((r: CanvasRow) => r.id === rowId);
      if (!row) return;

      const target = row.cells.find((c: CanvasCell) => c.id === targetCellId);
      if (target) {
        if (!target.stackedCells) target.stackedCells = [];
        if (typeof insertAtIndex === "number" && insertAtIndex >= 0 && insertAtIndex <= target.stackedCells.length) {
          target.stackedCells.splice(insertAtIndex, 0, cell);
        } else {
          target.stackedCells.push(cell);
        }
        if (sec) sec.updatedAt = "Just now";
      } else {
        // Target might be one of the stacked cells
        for (const topCell of row.cells) {
          if (topCell.stackedCells) {
            const idx = topCell.stackedCells.findIndex((c) => c.id === targetCellId);
            if (idx !== -1) {
              topCell.stackedCells.splice(idx + 1, 0, cell);
              if (sec) sec.updatedAt = "Just now";
              return;
            }
          }
        }
      }
    },

    /** Moves an existing row cell to be stacked directly below another cell (Canva Stack) */
    moveCellToStackBelow: (
      state: ReportModuleState,
      action: PayloadAction<{
        sectionId: string;
        rowId?: string;
        fromRowId?: string;
        toRowId?: string;
        sourceCellId: string;
        targetCellId: string;
      }>
    ) => {
      const { sectionId, sourceCellId, targetCellId } = action.payload;
      const fromRowId = action.payload.fromRowId || action.payload.rowId;
      const toRowId = action.payload.toRowId || action.payload.rowId;
      if (!fromRowId || !toRowId || sourceCellId === targetCellId) return;

      const sec = state.librarySections.find((s: LibrarySection) => s.id === sectionId);
      if (!sec || !sec.canvasRows) return;
      const fromRow = sec.canvasRows.find((r: CanvasRow) => r.id === fromRowId);
      const toRow = sec.canvasRows.find((r: CanvasRow) => r.id === toRowId);
      if (!fromRow || !toRow) return;

      // Extract source cell from fromRow
      let sourceCell: CanvasCell | null = null;
      const sourceIdx = fromRow.cells.findIndex((c) => c.id === sourceCellId);
      if (sourceIdx !== -1) {
        sourceCell = fromRow.cells.splice(sourceIdx, 1)[0];
        autoBalanceRowCells(fromRow);
      } else {
        for (const topCell of fromRow.cells) {
          if (topCell.stackedCells) {
            const sIdx = topCell.stackedCells.findIndex((c) => c.id === sourceCellId);
            if (sIdx !== -1) {
              sourceCell = topCell.stackedCells.splice(sIdx, 1)[0];
              break;
            }
          }
        }
      }

      if (!sourceCell) return;

      // Clear cell customWidth so it naturally occupies full width of its column
      sourceCell.customWidth = undefined;
      sourceCell.colSpan = 1;

      // Insert into target's stack in toRow
      const targetTop = toRow.cells.find((c) => c.id === targetCellId);
      if (targetTop) {
        if (!targetTop.stackedCells) targetTop.stackedCells = [];
        targetTop.stackedCells.push(sourceCell);
        if (sec) sec.updatedAt = "Just now";
        return;
      }

      for (const topCell of toRow.cells) {
        if (topCell.stackedCells) {
          const tIdx = topCell.stackedCells.findIndex((c) => c.id === targetCellId);
          if (tIdx !== -1) {
            topCell.stackedCells.splice(tIdx + 1, 0, sourceCell);
            if (sec) sec.updatedAt = "Just now";
            return;
          }
        }
      }
    },

    /** Pops a stacked cell out to become a regular top-level cell in the row */
    unstackCellToRow: (
      state: ReportModuleState,
      action: PayloadAction<{
        sectionId: string;
        rowId: string;
        cellId: string;
      }>
    ) => {
      const { sectionId, rowId, cellId } = action.payload;
      const sec = state.librarySections.find((s: LibrarySection) => s.id === sectionId);
      const row = sec?.canvasRows?.find((r: CanvasRow) => r.id === rowId);
      if (!row) return;

      for (let i = 0; i < row.cells.length; i++) {
        const topCell = row.cells[i];
        if (topCell.stackedCells) {
          const sIdx = topCell.stackedCells.findIndex((c) => c.id === cellId);
          if (sIdx !== -1) {
            const [unstacked] = topCell.stackedCells.splice(sIdx, 1);
            row.cells.splice(i + 1, 0, unstacked);
            autoBalanceRowCells(row);
            if (sec) sec.updatedAt = "Just now";
            return;
          }
        }
      }
    },

    /** Reorders cells inside a stacked column */
    reorderStackedCells: (
      state: ReportModuleState,
      action: PayloadAction<{
        sectionId: string;
        rowId: string;
        parentCellId: string;
        direction: "up" | "down";
        stackedCellIndex: number;
      }>
    ) => {
      const { sectionId, rowId, parentCellId, direction, stackedCellIndex } = action.payload;
      const sec = state.librarySections.find((s: LibrarySection) => s.id === sectionId);
      const row = sec?.canvasRows?.find((r: CanvasRow) => r.id === rowId);
      const parentCell = row?.cells.find((c: CanvasCell) => c.id === parentCellId);
      if (!parentCell?.stackedCells) return;

      const targetIndex = direction === "up" ? stackedCellIndex - 1 : stackedCellIndex + 1;
      if (targetIndex >= 0 && targetIndex < parentCell.stackedCells.length) {
        const temp = parentCell.stackedCells[stackedCellIndex];
        parentCell.stackedCells[stackedCellIndex] = parentCell.stackedCells[targetIndex];
        parentCell.stackedCells[targetIndex] = temp;
        if (sec) sec.updatedAt = "Just now";
      }
    },

    /** Update a cell's colSpan & optional adjustable width */
    updateCellColSpan: (
      state: ReportModuleState,
      action: PayloadAction<{
        sectionId: string;
        rowId: string;
        cellId: string;
        colSpan: 1 | 2 | 3 | 4;
        customWidth?: number;
      }>
    ) => {
      const { sectionId, rowId, cellId, colSpan, customWidth } = action.payload;
      const sec = state.librarySections.find((s: LibrarySection) => s.id === sectionId);
      const row = sec?.canvasRows?.find((r: CanvasRow) => r.id === rowId);
      if (!row) return;
      const found = findCellInRow(row, cellId);
      if (found) {
        if (found.isStacked) {
          // Individual stacked cell width within its column container (e.g. 25%, 50%, 75%, 100%)
          found.cell.customWidth = customWidth !== undefined
            ? Math.max(15, Math.min(100, Math.round(customWidth)))
            : (colSpan === 4 ? 100 : colSpan === 3 ? 75 : colSpan === 2 ? 50 : 25);
        } else {
          // Top-level column width
          found.cell.colSpan = colSpan;
          found.cell.customWidth = customWidth !== undefined ? customWidth : undefined;
        }
        if (sec) sec.updatedAt = "Just now";
      }
    },

    /** Update a cell's width to any arbitrary percentage (15% to 100%) */
    updateCellWidth: (
      state: ReportModuleState,
      action: PayloadAction<{
        sectionId: string;
        rowId: string;
        cellId: string;
        customWidth: number;
      }>
    ) => {
      const { sectionId, rowId, cellId, customWidth } = action.payload;
      const sec = state.librarySections.find((s: LibrarySection) => s.id === sectionId);
      const row = sec?.canvasRows?.find((r: CanvasRow) => r.id === rowId);
      if (!row) return;
      const found = findCellInRow(row, cellId);
      if (found) {
        const clamped = Math.max(15, Math.min(100, Math.round(customWidth)));
        if (found.isStacked) {
          // Individual stacked cell width
          found.cell.customWidth = clamped;
        } else {
          // Column width
          found.cell.customWidth = clamped;
          found.cell.colSpan = (clamped <= 30 ? 1 : clamped <= 55 ? 2 : clamped <= 80 ? 3 : 4) as 1 | 2 | 3 | 4;
        }
        if (sec) sec.updatedAt = "Just now";
      }
    },

    /** Update a cell's height to any arbitrary pixel value (80px to 520px to prevent footer overflow) or undefined for Auto */
    updateCellHeight: (
      state: ReportModuleState,
      action: PayloadAction<{
        sectionId: string;
        rowId: string;
        cellId: string;
        customHeight?: number;
      }>
    ) => {
      const { sectionId, rowId, cellId, customHeight } = action.payload;
      const sec = state.librarySections.find((s: LibrarySection) => s.id === sectionId);
      const row = sec?.canvasRows?.find((r: CanvasRow) => r.id === rowId);
      if (!row) return;
      const found = findCellInRow(row, cellId);
      if (found) {
        if (typeof customHeight === "number") {
          const maxH = found.isStacked ? 320 : 480;
          found.cell.customHeight = Math.max(0, Math.min(maxH, Math.round(customHeight)));
        } else {
          found.cell.customHeight = undefined;
        }
        if (sec) sec.updatedAt = "Just now";
      }
    },

    /** Update a cell's style (font, color, bg, border, align, padding, margin) */
    updateCellStyleInCell: (
      state: ReportModuleState,
      action: PayloadAction<{
        sectionId: string;
        rowId: string;
        cellId: string;
        style: Partial<CanvasCellStyle>;
      }>
    ) => {
      const { sectionId, rowId, cellId, style } = action.payload;
      const sec = state.librarySections.find((s: LibrarySection) => s.id === sectionId);
      const row = sec?.canvasRows?.find((r: CanvasRow) => r.id === rowId);
      if (!row) return;
      const found = findCellInRow(row, cellId);
      if (found) {
        found.cell.style = { ...(found.cell.style || {}), ...style };
        if (sec) sec.updatedAt = "Just now";
      }
    },

    /** Update a row's style (columnGap, rowGap, padding, margin, border, borderRadius, backgroundColor) */
    updateRowStyle: (
      state: ReportModuleState,
      action: PayloadAction<{
        sectionId: string;
        rowId: string;
        style: Partial<CanvasRowStyle>;
      }>
    ) => {
      const { sectionId, rowId, style } = action.payload;
      const sec = state.librarySections.find((s: LibrarySection) => s.id === sectionId);
      const row = sec?.canvasRows?.find((r: CanvasRow) => r.id === rowId);
      if (row) {
        row.style = { ...(row.style || {}), ...style };
        if (sec) sec.updatedAt = "Just now";
      }
    },

    /** Update a section's style (padding, margin, border, borderRadius, backgroundColor) */
    updateSectionStyle: (
      state: ReportModuleState,
      action: PayloadAction<{
        sectionId: string;
        style: Partial<CanvasSectionStyle>;
      }>
    ) => {
      const { sectionId, style } = action.payload;
      const sec = state.librarySections.find((s: LibrarySection) => s.id === sectionId);
      if (sec) {
        sec.sectionStyle = { ...(sec.sectionStyle || {}), ...style };
        sec.updatedAt = "Just now";
      }
    },

    /** Update text block content in a cell */
    updateTextBlockInCell: (
      state: ReportModuleState,
      action: PayloadAction<{
        sectionId: string;
        rowId: string;
        cellId: string;
        content: string;
      }>
    ) => {
      const { sectionId, rowId, cellId, content } = action.payload;
      const sec = state.librarySections.find((s: LibrarySection) => s.id === sectionId);
      const row = sec?.canvasRows?.find((r: CanvasRow) => r.id === rowId);
      if (!row) return;
      const found = findCellInRow(row, cellId);
      if (found && found.cell.textBlock) {
        found.cell.textBlock.content = content;
        if (sec) sec.updatedAt = "Just now";
      }
    },

    /** Update badge strip in a cell */
    updateBadgeStripInCell: (
      state: ReportModuleState,
      action: PayloadAction<{
        sectionId: string;
        rowId: string;
        cellId: string;
        badgeStrip: CanvasBadgeStrip;
      }>
    ) => {
      const { sectionId, rowId, cellId, badgeStrip } = action.payload;
      const sec = state.librarySections.find((s: LibrarySection) => s.id === sectionId);
      const row = sec?.canvasRows?.find((r: CanvasRow) => r.id === rowId);
      if (!row) return;
      const found = findCellInRow(row, cellId);
      if (found) {
        found.cell.badgeStrip = badgeStrip;
        if (sec) sec.updatedAt = "Just now";
      }
    },

    /** Update a single badge inside a badge strip in a cell */
    updateSingleBadgeInCell: (
      state: ReportModuleState,
      action: PayloadAction<{
        sectionId: string;
        rowId: string;
        cellId: string;
        badgeId: string;
        badge: Partial<CanvasBadgeItem>;
      }>
    ) => {
      const { sectionId, rowId, cellId, badgeId, badge } = action.payload;
      const sec = state.librarySections.find((s: LibrarySection) => s.id === sectionId);
      const row = sec?.canvasRows?.find((r: CanvasRow) => r.id === rowId);
      if (!row) return;
      const found = findCellInRow(row, cellId);
      if (found && found.cell.badgeStrip) {
        const item = found.cell.badgeStrip.badges.find((b: CanvasBadgeItem) => b.id === badgeId);
        if (item) {
          Object.assign(item, badge);
          if (sec) sec.updatedAt = "Just now";
        }
      }
    },

    /** Add a new badge to a badge strip in a cell */
    addBadgeToStripInCell: (
      state: ReportModuleState,
      action: PayloadAction<{
        sectionId: string;
        rowId: string;
        cellId: string;
        badge?: CanvasBadgeItem;
      }>
    ) => {
      const { sectionId, rowId, cellId, badge } = action.payload;
      const sec = state.librarySections.find((s: LibrarySection) => s.id === sectionId);
      const row = sec?.canvasRows?.find((r: CanvasRow) => r.id === rowId);
      if (!row) return;
      const found = findCellInRow(row, cellId);
      if (found && found.cell.badgeStrip) {
        const ts = Date.now();
        const colors: Array<"blue" | "green" | "purple" | "amber" | "rose" | "cyan"> = ["blue", "green", "purple", "amber", "rose", "cyan"];
        const chosenColor = colors[found.cell.badgeStrip.badges.length % colors.length];
        const newBadge: CanvasBadgeItem = badge || {
          id: `badge-${ts}`,
          label: "New Indicator",
          value: "100%",
          color: chosenColor,
          icon: "Shield",
        };
        found.cell.badgeStrip.badges.push(newBadge);
        if (sec) sec.updatedAt = "Just now";
      }
    },

    /** Delete a badge from a badge strip in a cell */
    deleteBadgeFromStripInCell: (
      state: ReportModuleState,
      action: PayloadAction<{
        sectionId: string;
        rowId: string;
        cellId: string;
        badgeId: string;
      }>
    ) => {
      const { sectionId, rowId, cellId, badgeId } = action.payload;
      const sec = state.librarySections.find((s: LibrarySection) => s.id === sectionId);
      const row = sec?.canvasRows?.find((r: CanvasRow) => r.id === rowId);
      if (!row) return;
      const found = findCellInRow(row, cellId);
      if (found && found.cell.badgeStrip) {
        found.cell.badgeStrip.badges = found.cell.badgeStrip.badges.filter((b) => b.id !== badgeId);
        if (sec) sec.updatedAt = "Just now";
      }
    },

    /** Update metric card data inside a canvas cell */
    updateMetricCardInCell: (
      state: ReportModuleState,
      action: PayloadAction<{
        sectionId: string;
        rowId: string;
        cellId: string;
        card: LibraryMetricCard;
      }>
    ) => {
      const { sectionId, rowId, cellId, card } = action.payload;
      const sec = state.librarySections.find((s: LibrarySection) => s.id === sectionId);
      const row = sec?.canvasRows?.find((r: CanvasRow) => r.id === rowId);
      if (!row) return;
      const found = findCellInRow(row, cellId);
      if (found) {
        found.cell.metricCard = card;
        if (sec) sec.updatedAt = "Just now";
      }
    },

    /** Update chart data inside a canvas cell */
    updateChartInCell: (
      state: ReportModuleState,
      action: PayloadAction<{
        sectionId: string;
        rowId: string;
        cellId: string;
        chart: LibraryChartCard;
      }>
    ) => {
      const { sectionId, rowId, cellId, chart } = action.payload;
      const sec = state.librarySections.find((s: LibrarySection) => s.id === sectionId);
      const row = sec?.canvasRows?.find((r: CanvasRow) => r.id === rowId);
      if (!row) return;
      const found = findCellInRow(row, cellId);
      if (found) {
        found.cell.chart = chart;
        if (sec) sec.updatedAt = "Just now";
      }
    },

    /** Update insight text inside a canvas cell */
    updateInsightInCell: (
      state: ReportModuleState,
      action: PayloadAction<{
        sectionId: string;
        rowId: string;
        cellId: string;
        insight: LibraryKeyInsightItem;
      }>
    ) => {
      const { sectionId, rowId, cellId, insight } = action.payload;
      const sec = state.librarySections.find((s: LibrarySection) => s.id === sectionId);
      const row = sec?.canvasRows?.find((r: CanvasRow) => r.id === rowId);
      if (!row) return;
      const found = findCellInRow(row, cellId);
      if (found) {
        found.cell.insight = insight;
        if (sec) sec.updatedAt = "Just now";
      }
    },

    /** Update divider inside a canvas cell */
    updateDividerInCell: (
      state: ReportModuleState,
      action: PayloadAction<{
        sectionId: string;
        rowId: string;
        cellId: string;
        divider: CanvasDividerBlock;
      }>
    ) => {
      const { sectionId, rowId, cellId, divider } = action.payload;
      const sec = state.librarySections.find((s: LibrarySection) => s.id === sectionId);
      const row = sec?.canvasRows?.find((r: CanvasRow) => r.id === rowId);
      if (!row) return;
      const found = findCellInRow(row, cellId);
      if (found) {
        found.cell.divider = divider;
        found.cell.style = {
          ...(found.cell.style || {}),
          borderStyle: divider.style === "double" ? "solid" : divider.style,
          borderWidth: divider.thickness,
          borderColor: divider.color,
          textAlign: divider.align,
          paddingTop: divider.paddingY,
          paddingBottom: divider.paddingY,
        };
        if (sec) sec.updatedAt = "Just now";
      }
    },

    /** Update element inside a canvas cell */
    updateElementInCell: (
      state: ReportModuleState,
      action: PayloadAction<{
        sectionId: string;
        rowId: string;
        cellId: string;
        element: CanvasElementBlock;
      }>
    ) => {
      const { sectionId, rowId, cellId, element } = action.payload;
      const sec = state.librarySections.find((s: LibrarySection) => s.id === sectionId);
      const row = sec?.canvasRows?.find((r: CanvasRow) => r.id === rowId);
      if (!row) return;
      const found = findCellInRow(row, cellId);
      if (found) {
        found.cell.elementBlock = element;
        found.cell.element = element;
        if (sec) sec.updatedAt = "Just now";
      }
    },
    // ─────────────────────────────────────────────────────────────────────────

    // Cover Page & Back Cover Reducers
    updateCoverPageData: (
      state: ReportModuleState,
      action: PayloadAction<{
        sectionId: string;
        data: Partial<CoverPageData>;
      }>
    ) => {
      const sec = state.librarySections.find((s: LibrarySection) => s.id === action.payload.sectionId);
      if (sec) {
        sec.coverPageData = {
          ...DEFAULT_COVER_PAGE_DATA,
          ...(sec.coverPageData || {}),
          ...action.payload.data,
        };
        sec.updatedAt = "Just now";
      }
    },
    updateTableOfContentsData: (
      state: ReportModuleState,
      action: PayloadAction<{
        sectionId: string;
        data: Partial<TableOfContentsData>;
      }>
    ) => {
      const sec = state.librarySections.find((s: LibrarySection) => s.id === action.payload.sectionId);
      if (sec) {
        sec.tableOfContentsData = {
          ...DEFAULT_TABLE_OF_CONTENTS_DATA,
          ...(sec.tableOfContentsData || {}),
          ...action.payload.data,
        };
        sec.updatedAt = "Just now";
      }
    },
    updateBackCoverData: (
      state: ReportModuleState,
      action: PayloadAction<{
        sectionId: string;
        data: Partial<BackCoverData>;
      }>
    ) => {
      const sec = state.librarySections.find((s: LibrarySection) => s.id === action.payload.sectionId);
      if (sec) {
        sec.backCoverData = {
          ...DEFAULT_BACK_COVER_DATA,
          ...(sec.backCoverData || {}),
          ...action.payload.data,
        };
        sec.updatedAt = "Just now";
      }
    },

    // ── Coordinate-based Stamps & Stickers Reducers ──────────────────────
    addStampToSection: (
      state: ReportModuleState,
      action: PayloadAction<{
        sectionId: string;
        stamp: CanvasCoordinateStamp;
      }>
    ) => {
      const sec = state.librarySections.find((s: LibrarySection) => s.id === action.payload.sectionId);
      if (sec) {
        if (!sec.stamps) sec.stamps = [];
        sec.stamps.push(action.payload.stamp);
        sec.updatedAt = "Just now";
      }
    },
    updateStampInSection: (
      state: ReportModuleState,
      action: PayloadAction<{
        sectionId: string;
        stampId: string;
        patch: Partial<CanvasCoordinateStamp>;
      }>
    ) => {
      const sec = state.librarySections.find((s: LibrarySection) => s.id === action.payload.sectionId);
      if (sec && sec.stamps) {
        const idx = sec.stamps.findIndex((st: CanvasCoordinateStamp) => st.id === action.payload.stampId);
        if (idx !== -1) {
          sec.stamps[idx] = { ...sec.stamps[idx], ...action.payload.patch };
          sec.updatedAt = "Just now";
        }
      }
    },
    deleteStampFromSection: (
      state: ReportModuleState,
      action: PayloadAction<{
        sectionId: string;
        stampId: string;
      }>
    ) => {
      const sec = state.librarySections.find((s: LibrarySection) => s.id === action.payload.sectionId);
      if (sec && sec.stamps) {
        sec.stamps = sec.stamps.filter((st: CanvasCoordinateStamp) => st.id !== action.payload.stampId);
        sec.updatedAt = "Just now";
      }
    },
    bringStampToFront: (
      state: ReportModuleState,
      action: PayloadAction<{
        sectionId: string;
        stampId: string;
      }>
    ) => {
      const sec = state.librarySections.find((s: LibrarySection) => s.id === action.payload.sectionId);
      if (sec && sec.stamps) {
        const idx = sec.stamps.findIndex((st: CanvasCoordinateStamp) => st.id === action.payload.stampId);
        if (idx !== -1) {
          const targetStamp = sec.stamps[idx];
          const pageIndex = targetStamp.pageIndex ?? 0;
          const pageStamps = sec.stamps.filter((st: CanvasCoordinateStamp) => (st.pageIndex ?? 0) === pageIndex);
          const currentMaxZ = pageStamps.reduce((max, s) => {
            const z = s.zIndex ?? (s.layer === "back" ? 6 : 25);
            return Math.max(max, z);
          }, 25);
          sec.stamps[idx] = {
            ...targetStamp,
            layer: "front",
            zIndex: Math.max(25, currentMaxZ + 1),
          };
          sec.updatedAt = "Just now";
        }
      }
    },
    sendStampToBack: (
      state: ReportModuleState,
      action: PayloadAction<{
        sectionId: string;
        stampId: string;
      }>
    ) => {
      const sec = state.librarySections.find((s: LibrarySection) => s.id === action.payload.sectionId);
      if (sec && sec.stamps) {
        const idx = sec.stamps.findIndex((st: CanvasCoordinateStamp) => st.id === action.payload.stampId);
        if (idx !== -1) {
          const targetStamp = sec.stamps[idx];
          const pageIndex = targetStamp.pageIndex ?? 0;
          const pageStamps = sec.stamps.filter((st: CanvasCoordinateStamp) => (st.pageIndex ?? 0) === pageIndex);
          const backStamps = pageStamps.filter((st) => st.id !== targetStamp.id && st.layer === "back");
          const currentMinZ = backStamps.length > 0
            ? backStamps.reduce((min, s) => Math.min(min, s.zIndex ?? 6), 6)
            : 6;
          sec.stamps[idx] = {
            ...targetStamp,
            layer: "back",
            zIndex: Math.max(1, currentMinZ - 1),
          };
          sec.updatedAt = "Just now";
        }
      }
    },
    bringStampForward: (
      state: ReportModuleState,
      action: PayloadAction<{
        sectionId: string;
        stampId: string;
      }>
    ) => {
      const sec = state.librarySections.find((s: LibrarySection) => s.id === action.payload.sectionId);
      if (sec && sec.stamps) {
        const idx = sec.stamps.findIndex((st: CanvasCoordinateStamp) => st.id === action.payload.stampId);
        if (idx !== -1) {
          const targetStamp = sec.stamps[idx];
          const curZ = targetStamp.zIndex ?? (targetStamp.layer === "back" ? 6 : 25);
          if (targetStamp.layer === "back") {
            if (curZ >= 9) {
              sec.stamps[idx] = { ...targetStamp, layer: "front", zIndex: 25 };
            } else {
              sec.stamps[idx] = { ...targetStamp, zIndex: curZ + 1 };
            }
          } else {
            sec.stamps[idx] = { ...targetStamp, zIndex: curZ + 1 };
          }
          sec.updatedAt = "Just now";
        }
      }
    },
    sendStampBackward: (
      state: ReportModuleState,
      action: PayloadAction<{
        sectionId: string;
        stampId: string;
      }>
    ) => {
      const sec = state.librarySections.find((s: LibrarySection) => s.id === action.payload.sectionId);
      if (sec && sec.stamps) {
        const idx = sec.stamps.findIndex((st: CanvasCoordinateStamp) => st.id === action.payload.stampId);
        if (idx !== -1) {
          const targetStamp = sec.stamps[idx];
          const curZ = targetStamp.zIndex ?? (targetStamp.layer === "back" ? 6 : 25);
          if (targetStamp.layer !== "back") {
            if (curZ <= 20) {
              sec.stamps[idx] = { ...targetStamp, layer: "back", zIndex: 6 };
            } else {
              sec.stamps[idx] = { ...targetStamp, zIndex: curZ - 1 };
            }
          } else {
            sec.stamps[idx] = { ...targetStamp, zIndex: Math.max(1, curZ - 1) };
          }
          sec.updatedAt = "Just now";
        }
      }
    },
};

"use client";

import { PayloadAction } from "@reduxjs/toolkit";
import {
  ReportModuleState,
  LibrarySection,
  LibraryMetricCard,
  LibraryChartCard,
  LibraryKeyInsightItem,
  CanvasRow,
  CanvasCell,
  CanvasCellStyle,
  CanvasTextBlock,
  CanvasBadgeStrip,
  CanvasBadgeItem,
  GraphType,
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

export const sectionsStudioReducers = {
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
      }>
    ) => {
      const newId = action.payload.id || `sec-custom-${Date.now()}`;
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
        headerSpacing?: "compact" | "normal" | "spacious";
        changes?: Partial<LibrarySection>;
      }>
    ) => {
      const sec = state.librarySections.find((s: LibrarySection) => s.id === action.payload.id);
      if (sec) {
        const c = action.payload.changes;
        if (c) {
          if (c.name !== undefined) sec.name = c.name;
          if (c.eyebrow !== undefined) sec.eyebrow = c.eyebrow;
          if (c.description !== undefined) sec.description = c.description;
          if (c.icon !== undefined) sec.icon = c.icon;
          if (c.watermarkId !== undefined) sec.watermarkId = c.watermarkId;
          if (c.headerSpacing !== undefined) sec.headerSpacing = c.headerSpacing;
        }
        if (action.payload.name !== undefined) sec.name = action.payload.name;
        if (action.payload.eyebrow !== undefined) sec.eyebrow = action.payload.eyebrow;
        if (action.payload.description !== undefined) sec.description = action.payload.description;
        if (action.payload.icon !== undefined) sec.icon = action.payload.icon;
        if (action.payload.watermarkId !== undefined) sec.watermarkId = action.payload.watermarkId;
        if (action.payload.headerSpacing !== undefined) sec.headerSpacing = action.payload.headerSpacing;
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
      action: PayloadAction<string | { sectionId: string; pageBreakBefore?: boolean }>
    ) => {
      const targetId = typeof action.payload === "string" ? action.payload : action.payload?.sectionId;
      const pageBreakBefore = typeof action.payload === "object" ? Boolean(action.payload?.pageBreakBefore) : false;
      const sec = state.librarySections.find((s: LibrarySection) => s.id === targetId);
      if (sec) {
        if (!sec.canvasRows) sec.canvasRows = [];
        sec.canvasRows.push({ id: `row-${Date.now()}`, cells: [], pageBreakBefore });
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

    /** Duplicate a cell within its row */
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

      const cellIdx = row.cells.findIndex((c: CanvasCell) => c.id === cellId);
      if (cellIdx === -1) return;

      const original = row.cells[cellIdx];
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
      row.cells.splice(cellIdx + 1, 0, cloned);
      autoBalanceRowCells(row);
      if (sec) sec.updatedAt = "Just now";
    },

    /** Delete a cell from a row */
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
      if (row) {
        row.cells = row.cells.filter((c: CanvasCell) => c.id !== cellId);
        autoBalanceRowCells(row);
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
      const cell = row?.cells.find((c: CanvasCell) => c.id === cellId);
      if (cell) {
        cell.colSpan = colSpan;
        if (customWidth !== undefined) {
          cell.customWidth = customWidth;
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
      const cell = row?.cells.find((c: CanvasCell) => c.id === cellId);
      if (cell) {
        const clamped = Math.max(15, Math.min(100, Math.round(customWidth)));
        cell.customWidth = clamped;
        cell.colSpan = (clamped <= 30 ? 1 : clamped <= 55 ? 2 : clamped <= 80 ? 3 : 4) as 1 | 2 | 3 | 4;
        if (sec) sec.updatedAt = "Just now";
      }
    },

    /** Update a cell's height to any arbitrary pixel value (90px to 800px) or undefined for Auto */
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
      const cell = row?.cells.find((c: CanvasCell) => c.id === cellId);
      if (cell) {
        if (typeof customHeight === "number") {
          cell.customHeight = Math.max(80, Math.min(800, Math.round(customHeight)));
        } else {
          cell.customHeight = undefined;
        }
        if (sec) sec.updatedAt = "Just now";
      }
    },

    /** Update a cell's style (font, color, bg, border, align) */
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
      const cell = row?.cells.find((c: CanvasCell) => c.id === cellId);
      if (cell) {
        cell.style = { ...(cell.style || {}), ...style };
        if (sec) sec.updatedAt = "Just now";
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
      const cell = row?.cells.find((c: CanvasCell) => c.id === cellId);
      if (cell && cell.textBlock) {
        cell.textBlock.content = content;
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
      const cell = row?.cells.find((c: CanvasCell) => c.id === cellId);
      if (cell) {
        cell.badgeStrip = badgeStrip;
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
      const cell = row?.cells.find((c: CanvasCell) => c.id === cellId);
      if (cell && cell.badgeStrip) {
        const item = cell.badgeStrip.badges.find((b: CanvasBadgeItem) => b.id === badgeId);
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
      const cell = row?.cells.find((c: CanvasCell) => c.id === cellId);
      if (cell && cell.badgeStrip) {
        const ts = Date.now();
        const colors: Array<"blue" | "green" | "purple" | "amber" | "rose" | "cyan"> = ["blue", "green", "purple", "amber", "rose", "cyan"];
        const chosenColor = colors[cell.badgeStrip.badges.length % colors.length];
        const newBadge: CanvasBadgeItem = badge || {
          id: `badge-${ts}`,
          label: "New Indicator",
          value: "100%",
          color: chosenColor,
          icon: "Shield",
        };
        cell.badgeStrip.badges.push(newBadge);
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
      const cell = row?.cells.find((c: CanvasCell) => c.id === cellId);
      if (cell && cell.badgeStrip) {
        cell.badgeStrip.badges = cell.badgeStrip.badges.filter((b) => b.id !== badgeId);
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
      const cell = row?.cells.find((c: CanvasCell) => c.id === cellId);
      if (cell) {
        cell.metricCard = card;
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
      const cell = row?.cells.find((c: CanvasCell) => c.id === cellId);
      if (cell) {
        cell.chart = chart;
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
      const cell = row?.cells.find((c: CanvasCell) => c.id === cellId);
      if (cell) {
        cell.insight = insight;
        if (sec) sec.updatedAt = "Just now";
      }
    },
    // ─────────────────────────────────────────────────────────────────────────

    // Global Universal Toast Reducers
};

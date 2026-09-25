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
  GraphType,
} from "../../types/reportModuleTypes";

export const sectionsStudioReducers = {
    setSelectedLibrarySectionId: (state, action: PayloadAction<string | null>) => {
      state.selectedLibrarySectionId = action.payload;
    },
    createLibrarySection: (
      state,
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
      state,
      action: PayloadAction<{
        id: string;
        name: string;
        eyebrow?: string;
        description: string;
        icon?: string;
        watermarkId?: string;
      }>
    ) => {
      const sec = state.librarySections.find((s) => s.id === action.payload.id);
      if (sec) {
        sec.name = action.payload.name;
        if (action.payload.eyebrow !== undefined) sec.eyebrow = action.payload.eyebrow;
        sec.description = action.payload.description;
        if (action.payload.icon !== undefined) sec.icon = action.payload.icon;
        if (action.payload.watermarkId !== undefined) sec.watermarkId = action.payload.watermarkId;
        sec.updatedAt = "Just now";
      }
    },
    duplicateLibrarySection: (state, action: PayloadAction<string>) => {
      const src = state.librarySections.find((s) => s.id === action.payload);
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
    deleteLibrarySection: (state, action: PayloadAction<string>) => {
      const sec = state.librarySections.find((s) => s.id === action.payload);
      if (sec && sec.type !== "core") {
        state.librarySections = state.librarySections.filter((s) => s.id !== action.payload);
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
      state,
      action: PayloadAction<{ sectionId: string; card: Omit<LibraryMetricCard, "id"> }>
    ) => {
      const sec = state.librarySections.find((s) => s.id === action.payload.sectionId);
      if (sec) {
        sec.metricCards.push({
          ...action.payload.card,
          id: `mc-${Date.now()}`,
        });
        sec.updatedAt = "Just now";
      }
    },
    updateCardInSection: (
      state,
      action: PayloadAction<{ sectionId: string; card: LibraryMetricCard }>
    ) => {
      const sec = state.librarySections.find((s) => s.id === action.payload.sectionId);
      if (sec) {
        const idx = sec.metricCards.findIndex((c) => c.id === action.payload.card.id);
        if (idx !== -1) {
          sec.metricCards[idx] = action.payload.card;
          sec.updatedAt = "Just now";
        }
      }
    },
    deleteCardFromSection: (
      state,
      action: PayloadAction<{ sectionId: string; cardId: string }>
    ) => {
      const sec = state.librarySections.find((s) => s.id === action.payload.sectionId);
      if (sec) {
        sec.metricCards = sec.metricCards.filter((c) => c.id !== action.payload.cardId);
        sec.updatedAt = "Just now";
      }
    },
    reorderCardsInSection: (
      state,
      action: PayloadAction<{ sectionId: string; cards: LibraryMetricCard[] }>
    ) => {
      const sec = state.librarySections.find((s) => s.id === action.payload.sectionId);
      if (sec) {
        sec.metricCards = action.payload.cards;
        sec.updatedAt = "Just now";
      }
    },
    addChartToSection: (
      state,
      action: PayloadAction<{ sectionId: string; chart: Omit<LibraryChartCard, "id"> }>
    ) => {
      const sec = state.librarySections.find((s) => s.id === action.payload.sectionId);
      if (sec) {
        sec.charts.push({
          ...action.payload.chart,
          id: `ch-${Date.now()}`,
        });
        sec.updatedAt = "Just now";
      }
    },
    updateChartInSection: (
      state,
      action: PayloadAction<{ sectionId: string; chart: LibraryChartCard }>
    ) => {
      const sec = state.librarySections.find((s) => s.id === action.payload.sectionId);
      if (sec) {
        const idx = sec.charts.findIndex((ch) => ch.id === action.payload.chart.id);
        if (idx !== -1) {
          sec.charts[idx] = action.payload.chart;
          sec.updatedAt = "Just now";
        }
      }
    },
    deleteChartFromSection: (
      state,
      action: PayloadAction<{ sectionId: string; chartId: string }>
    ) => {
      const sec = state.librarySections.find((s) => s.id === action.payload.sectionId);
      if (sec) {
        sec.charts = sec.charts.filter((ch) => ch.id !== action.payload.chartId);
        sec.updatedAt = "Just now";
      }
    },
    reorderChartsInSection: (
      state,
      action: PayloadAction<{ sectionId: string; charts: LibraryChartCard[] }>
    ) => {
      const sec = state.librarySections.find((s) => s.id === action.payload.sectionId);
      if (sec) {
        sec.charts = action.payload.charts;
        sec.updatedAt = "Just now";
      }
    },
    addInsightToSection: (
      state,
      action: PayloadAction<{ sectionId: string; text: string }>
    ) => {
      const sec = state.librarySections.find((s) => s.id === action.payload.sectionId);
      if (sec) {
        sec.keyInsights.push({
          id: `ki-${Date.now()}`,
          text: action.payload.text,
        });
        sec.updatedAt = "Just now";
      }
    },
    updateInsightInSection: (
      state,
      action: PayloadAction<{ sectionId: string; insight: LibraryKeyInsightItem }>
    ) => {
      const sec = state.librarySections.find((s) => s.id === action.payload.sectionId);
      if (sec) {
        const idx = sec.keyInsights.findIndex((ki) => ki.id === action.payload.insight.id);
        if (idx !== -1) {
          sec.keyInsights[idx] = action.payload.insight;
          sec.updatedAt = "Just now";
        }
      }
    },
    deleteInsightFromSection: (
      state,
      action: PayloadAction<{ sectionId: string; insightId: string }>
    ) => {
      const sec = state.librarySections.find((s) => s.id === action.payload.sectionId);
      if (sec) {
        sec.keyInsights = sec.keyInsights.filter((ki) => ki.id !== action.payload.insightId);
        sec.updatedAt = "Just now";
      }
    },
    reorderInsightsInSection: (
      state,
      action: PayloadAction<{ sectionId: string; keyInsights: LibraryKeyInsightItem[] }>
    ) => {
      const sec = state.librarySections.find((s) => s.id === action.payload.sectionId);
      if (sec) {
        sec.keyInsights = action.payload.keyInsights;
        sec.updatedAt = "Just now";
      }
    },

    // ── Canvas Row/Cell Reducers (Canva-like Section Editor) ─────────────────
    /** Auto-migrate a section's flat arrays → canvasRows (called on first canvas open) */
    migrateToCanvasRows: (state, action: PayloadAction<string>) => {
      const sec = state.librarySections.find((s) => s.id === action.payload);
      if (!sec || sec.canvasRows) return; // already migrated

      const rows: CanvasRow[] = [];

      // Row 1: Metric Cards (one cell per card)
      if (sec.metricCards && sec.metricCards.length > 0) {
        rows.push({
          id: `row-mc-${Date.now()}`,
          cells: sec.metricCards.map((card) => ({
            id: `cell-mc-${card.id}`,
            colSpan: 1 as const,
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
          cells: sec.keyInsights.map((ki) => ({
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
    addCanvasRow: (state, action: PayloadAction<string>) => {
      const sec = state.librarySections.find((s) => s.id === action.payload);
      if (sec) {
        if (!sec.canvasRows) sec.canvasRows = [];
        sec.canvasRows.push({ id: `row-${Date.now()}`, cells: [] });
        sec.updatedAt = "Just now";
      }
    },

    /** Atomically add a new row with a first cell (for sidebar block drops) */
    addRowWithCell: (
      state,
      action: PayloadAction<{
        sectionId: string;
        cell: CanvasCell;
      }>
    ) => {
      const sec = state.librarySections.find((s) => s.id === action.payload.sectionId);
      if (sec) {
        if (!sec.canvasRows) sec.canvasRows = [];
        sec.canvasRows.push({
          id: `row-${Date.now()}`,
          cells: [action.payload.cell],
        });
        sec.updatedAt = "Just now";
      }
    },


    /** Remove a row from the canvas */
    removeCanvasRow: (
      state,
      action: PayloadAction<{ sectionId: string; rowId: string }>
    ) => {
      const sec = state.librarySections.find(
        (s) => s.id === action.payload.sectionId
      );
      if (sec && sec.canvasRows) {
        sec.canvasRows = sec.canvasRows.filter(
          (r) => r.id !== action.payload.rowId
        );
        sec.updatedAt = "Just now";
      }
    },

    /** Add a new cell to a specific row */
    addCellToRow: (
      state,
      action: PayloadAction<{
        sectionId: string;
        rowId: string;
        cell: CanvasCell;
      }>
    ) => {
      const sec = state.librarySections.find(
        (s) => s.id === action.payload.sectionId
      );
      const row = sec?.canvasRows?.find((r) => r.id === action.payload.rowId);
      if (row) {
        row.cells.push(action.payload.cell);
        if (sec) sec.updatedAt = "Just now";
      }
    },

    /** Move a cell between rows (cross-row drag) */
    moveCellBetweenRows: (
      state,
      action: PayloadAction<{
        sectionId: string;
        fromRowId: string;
        toRowId: string;
        cellId: string;
        toIndex: number; // insert position in destination row
      }>
    ) => {
      const { sectionId, fromRowId, toRowId, cellId, toIndex } = action.payload;
      const sec = state.librarySections.find((s) => s.id === sectionId);
      if (!sec?.canvasRows) return;

      const fromRow = sec.canvasRows.find((r) => r.id === fromRowId);
      const toRow = sec.canvasRows.find((r) => r.id === toRowId);
      if (!fromRow || !toRow) return;

      const cellIdx = fromRow.cells.findIndex((c) => c.id === cellId);
      if (cellIdx === -1) return;

      const [cell] = fromRow.cells.splice(cellIdx, 1);
      toRow.cells.splice(toIndex, 0, cell);
      sec.updatedAt = "Just now";
    },

    /** Reorder cells within the same row (same-row drag) */
    reorderCellsInRow: (
      state,
      action: PayloadAction<{
        sectionId: string;
        rowId: string;
        cells: CanvasCell[];
      }>
    ) => {
      const sec = state.librarySections.find(
        (s) => s.id === action.payload.sectionId
      );
      const row = sec?.canvasRows?.find((r) => r.id === action.payload.rowId);
      if (row) {
        row.cells = action.payload.cells;
        if (sec) sec.updatedAt = "Just now";
      }
    },

    /** Reorder rows themselves */
    reorderCanvasRows: (
      state,
      action: PayloadAction<{
        sectionId: string;
        rows: CanvasRow[];
      }>
    ) => {
      const sec = state.librarySections.find(
        (s) => s.id === action.payload.sectionId
      );
      if (sec) {
        sec.canvasRows = action.payload.rows;
        sec.updatedAt = "Just now";
      }
    },

    /** Duplicate a cell within its row */
    duplicateCanvasCell: (
      state,
      action: PayloadAction<{
        sectionId: string;
        rowId: string;
        cellId: string;
      }>
    ) => {
      const { sectionId, rowId, cellId } = action.payload;
      const sec = state.librarySections.find((s) => s.id === sectionId);
      const row = sec?.canvasRows?.find((r) => r.id === rowId);
      if (!row) return;

      const cellIdx = row.cells.findIndex((c) => c.id === cellId);
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
              badges: original.badgeStrip.badges.map((b, i) => ({
                ...b,
                id: `badge-dup-${ts}-${i}`,
              })),
            }
          : undefined,
      };
      row.cells.splice(cellIdx + 1, 0, cloned);
      if (sec) sec.updatedAt = "Just now";
    },

    /** Delete a cell from a row */
    deleteCanvasCell: (
      state,
      action: PayloadAction<{
        sectionId: string;
        rowId: string;
        cellId: string;
      }>
    ) => {
      const { sectionId, rowId, cellId } = action.payload;
      const sec = state.librarySections.find((s) => s.id === sectionId);
      const row = sec?.canvasRows?.find((r) => r.id === rowId);
      if (row) {
        row.cells = row.cells.filter((c) => c.id !== cellId);
        if (sec) sec.updatedAt = "Just now";
      }
    },

    /** Update a cell's colSpan & optional adjustable width */
    updateCellColSpan: (
      state,
      action: PayloadAction<{
        sectionId: string;
        rowId: string;
        cellId: string;
        colSpan: 1 | 2 | 3 | 4;
        customWidth?: number;
      }>
    ) => {
      const { sectionId, rowId, cellId, colSpan, customWidth } = action.payload;
      const sec = state.librarySections.find((s) => s.id === sectionId);
      const row = sec?.canvasRows?.find((r) => r.id === rowId);
      const cell = row?.cells.find((c) => c.id === cellId);
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
      state,
      action: PayloadAction<{
        sectionId: string;
        rowId: string;
        cellId: string;
        customWidth: number;
      }>
    ) => {
      const { sectionId, rowId, cellId, customWidth } = action.payload;
      const sec = state.librarySections.find((s) => s.id === sectionId);
      const row = sec?.canvasRows?.find((r) => r.id === rowId);
      const cell = row?.cells.find((c) => c.id === cellId);
      if (cell) {
        const clamped = Math.max(15, Math.min(100, Math.round(customWidth)));
        cell.customWidth = clamped;
        cell.colSpan = (clamped <= 30 ? 1 : clamped <= 55 ? 2 : clamped <= 80 ? 3 : 4) as 1 | 2 | 3 | 4;
        if (sec) sec.updatedAt = "Just now";
      }
    },

    /** Update a cell's style (font, color, bg, border, align) */
    updateCellStyleInCell: (
      state,
      action: PayloadAction<{
        sectionId: string;
        rowId: string;
        cellId: string;
        style: Partial<CanvasCellStyle>;
      }>
    ) => {
      const { sectionId, rowId, cellId, style } = action.payload;
      const sec = state.librarySections.find((s) => s.id === sectionId);
      const row = sec?.canvasRows?.find((r) => r.id === rowId);
      const cell = row?.cells.find((c) => c.id === cellId);
      if (cell) {
        cell.style = { ...(cell.style || {}), ...style };
        if (sec) sec.updatedAt = "Just now";
      }
    },

    /** Update text block content in a cell */
    updateTextBlockInCell: (
      state,
      action: PayloadAction<{
        sectionId: string;
        rowId: string;
        cellId: string;
        content: string;
      }>
    ) => {
      const { sectionId, rowId, cellId, content } = action.payload;
      const sec = state.librarySections.find((s) => s.id === sectionId);
      const row = sec?.canvasRows?.find((r) => r.id === rowId);
      const cell = row?.cells.find((c) => c.id === cellId);
      if (cell && cell.textBlock) {
        cell.textBlock.content = content;
        if (sec) sec.updatedAt = "Just now";
      }
    },

    /** Update badge strip in a cell */
    updateBadgeStripInCell: (
      state,
      action: PayloadAction<{
        sectionId: string;
        rowId: string;
        cellId: string;
        badgeStrip: CanvasBadgeStrip;
      }>
    ) => {
      const { sectionId, rowId, cellId, badgeStrip } = action.payload;
      const sec = state.librarySections.find((s) => s.id === sectionId);
      const row = sec?.canvasRows?.find((r) => r.id === rowId);
      const cell = row?.cells.find((c) => c.id === cellId);
      if (cell) {
        cell.badgeStrip = badgeStrip;
        if (sec) sec.updatedAt = "Just now";
      }
    },

    /** Update metric card data inside a canvas cell */
    updateMetricCardInCell: (
      state,
      action: PayloadAction<{
        sectionId: string;
        rowId: string;
        cellId: string;
        card: LibraryMetricCard;
      }>
    ) => {
      const { sectionId, rowId, cellId, card } = action.payload;
      const sec = state.librarySections.find((s) => s.id === sectionId);
      const row = sec?.canvasRows?.find((r) => r.id === rowId);
      const cell = row?.cells.find((c) => c.id === cellId);
      if (cell) {
        cell.metricCard = card;
        if (sec) sec.updatedAt = "Just now";
      }
    },

    /** Update chart data inside a canvas cell */
    updateChartInCell: (
      state,
      action: PayloadAction<{
        sectionId: string;
        rowId: string;
        cellId: string;
        chart: LibraryChartCard;
      }>
    ) => {
      const { sectionId, rowId, cellId, chart } = action.payload;
      const sec = state.librarySections.find((s) => s.id === sectionId);
      const row = sec?.canvasRows?.find((r) => r.id === rowId);
      const cell = row?.cells.find((c) => c.id === cellId);
      if (cell) {
        cell.chart = chart;
        if (sec) sec.updatedAt = "Just now";
      }
    },

    /** Update insight text inside a canvas cell */
    updateInsightInCell: (
      state,
      action: PayloadAction<{
        sectionId: string;
        rowId: string;
        cellId: string;
        insight: LibraryKeyInsightItem;
      }>
    ) => {
      const { sectionId, rowId, cellId, insight } = action.payload;
      const sec = state.librarySections.find((s) => s.id === sectionId);
      const row = sec?.canvasRows?.find((r) => r.id === rowId);
      const cell = row?.cells.find((c) => c.id === cellId);
      if (cell) {
        cell.insight = insight;
        if (sec) sec.updatedAt = "Just now";
      }
    },
    // ─────────────────────────────────────────────────────────────────────────

    // Global Universal Toast Reducers
};

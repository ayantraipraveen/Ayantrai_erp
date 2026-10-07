import { CanvasRow, CanvasCell, LibrarySection, PageConfigOverride } from "@/lib/redux/slices/reportModuleSlice";
import { CanvasMarginConfig, DEFAULT_CANVAS_MARGIN } from "./canvasStyleUtils";

// ─── Standard ISO A4 PDF Dimensions (595 × 842 px / pt at 72 DPI) ───────────
export const A4_WIDTH_PX = 595; // Standard ISO PDF A4 Width (595 px / pt)
export const A4_HEIGHT_PX = 842; // Standard ISO PDF A4 Height (842 px / pt)

/**
 * Mathematical fluid width formula for flex-wrap row with gap: 16px.
 * Ensures precise sub-pixel alignment across 1, 2, 3, or 4 cells without overflow.
 */
export function getCellWidthStyle(percent: number): string {
  const p = Math.max(15, Math.min(100, Math.round(percent)));
  if (p >= 100) return "100%";
  const gapSub = (16 * (100 - p)) / 100;
  return `calc(${p}% - ${gapSub.toFixed(1)}px)`;
}

export function getDefaultBlockHeight(blockType?: string, cellOrVariant?: CanvasCell | string): number {
  if (blockType === "insight") {
    const variant = typeof cellOrVariant === "string" 
      ? cellOrVariant 
      : (cellOrVariant?.insight?.variant || "single");
    const cellObj = typeof cellOrVariant === "object" ? cellOrVariant : undefined;
    const itemsCount = cellObj?.insight?.items?.length;

    switch (variant) {
      case "vertical-takeaways": {
        const count = itemsCount ?? 4;
        // Header + padding + item rows (each compact item is ~16px)
        return Math.max(90, 28 + count * 16);
      }
      case "priority-actions": {
        const count = itemsCount ?? 4;
        return Math.max(100, 40 + count * 22);
      }
      case "bullet-observations":
      case "risk-factors": {
        const count = itemsCount ?? 3;
        return Math.max(90, 36 + count * 18);
      }
      case "columns-numbered": {
        const count = itemsCount ?? 4;
        return Math.max(120, 40 + Math.ceil(count / 2) * 45);
      }
      case "split-quote":
      case "columns-titled":
      case "narrative-summary":
        return 160;
      case "vision-banner":
        return 140;
      case "quote-card":
        return 120;
      case "single":
      default:
        return 100;
    }
  }

  switch (blockType) {
    case "chart":
      return 360;
    case "metric-card":
      return 92;
    case "badge-strip":
      return 130;
    case "text":
      return 85;
    case "divider":
      return 28;
    default:
      return 120;
  }
}

/**
 * Predictive Row Height Estimation (Calibrated for Standard 842px ISO PDF Page).
 * Evaluates block types, stacked blocks, and flex-wrap progression.
 */
export function estimateRowHeight(row: CanvasRow): number {
  if (!row.cells || row.cells.length === 0) return 80;

  let currentLineWidth = 0;
  let currentLineMaxHeight = 0;
  let totalCalculatedHeight = 0;

  for (const cell of row.cells) {
    // Use stored height if available, otherwise use accurate block-type default
    let h = cell.customHeight || getDefaultBlockHeight(cell.blockType, cell);

    // Account for stacked cells — group into flex-wrap rows by width, same as renderer
    if (cell.stackedCells && cell.stackedCells.length > 0) {
      const rowMaxHeights: number[] = [];
      let rowW = 0;
      let rowMaxH = 0;
      for (const sc of cell.stackedCells) {
        const w = sc.customWidth || 100;
        const scH = sc.customHeight || getDefaultBlockHeight(sc.blockType, sc);
        if (rowW + w > 100 && rowW > 0) {
          rowMaxHeights.push(rowMaxH);
          rowW = w;
          rowMaxH = scH;
        } else {
          rowW += w;
          rowMaxH = Math.max(rowMaxH, scH);
        }
      }
      rowMaxHeights.push(rowMaxH);
      // sum of row heights + inter-row gaps (12px) + outer gap between primary and stacked (12px = gap-3)
      const stackedH = rowMaxHeights.reduce((t, rh) => t + rh, 0)
        + Math.max(0, rowMaxHeights.length - 1) * 12
        + 12;
      h += stackedH;
    }

    const cellWidth = cell.customWidth ?? (cell.colSpan ? cell.colSpan * 25 : 100);

    // If flex-wrap wraps into a new line (exceeds 105% allowing for slight margin rounding)
    if (currentLineWidth + cellWidth > 105 && currentLineWidth > 0) {
      totalCalculatedHeight += currentLineMaxHeight + 12; // 12px flex line gap
      currentLineWidth = cellWidth;
      currentLineMaxHeight = h;
    } else {
      currentLineWidth += cellWidth;
      if (h > currentLineMaxHeight) currentLineMaxHeight = h;
    }
  }

  totalCalculatedHeight += currentLineMaxHeight;
  return totalCalculatedHeight + 16; // 16px row margins & drop zone
}

export interface PagePartition {
  pageIndex: number;
  pageNumber: number;
  rows: CanvasRow[];
  isFirstPage: boolean;
  isLastPage: boolean;
  usedHeight: number;
  maxCapacity: number;
}

/**
 * Multi-Page Partitioning Algorithm.
 * Calibrated for standard ISO PDF page (842px sheet height) with uniform standard header & footer.
 */
export function partitionCanvasPages(
  rows: CanvasRow[],
  marginConfig: CanvasMarginConfig = DEFAULT_CANVAS_MARGIN,
  startPageNumber: number = 1,
  sheetHeight: number = A4_HEIGHT_PX,
  pageOverrides?: Record<number, PageConfigOverride>
): PagePartition[] {
  const page1MarginY = (marginConfig?.top ?? 24) + (marginConfig?.bottom ?? 24);

  // Exact physical A4 sheet height: 842px (Standard ISO PDF Page)
  // All pages have standard Header (Sitesafe ~56px + Section Bar ~72px) and Footer (~36px)
  const standardCapacity = Math.round(
    Math.max(
      480,
      Math.min(630, sheetHeight - page1MarginY - 56 - 72 - 36)
    )
  );

  const getCapacityForPage = (pageIdx: number): number => {
    let capacity = standardCapacity;
    if (pageIdx > 0 && pageOverrides?.[pageIdx]) {
      if (pageOverrides[pageIdx].hideReportHeader) {
        capacity += 56;
      }
      if (pageOverrides[pageIdx].hideSectionTitle) {
        capacity += 75;
      }
    }
    return capacity;
  };

  const capPage1Single = getCapacityForPage(0);
  const capPage1Multi = getCapacityForPage(0);
  const capMiddlePage = standardCapacity;
  const capLastPage = standardCapacity;

  if (rows.length === 0) {
    return [
      {
        pageIndex: 0,
        pageNumber: startPageNumber,
        rows: [],
        isFirstPage: true,
        isLastPage: true,
        usedHeight: 0,
        maxCapacity: capPage1Single,
      },
    ];
  }

  const rowHeights = rows.map((r) => estimateRowHeight(r));
  const totalRowHeight = rowHeights.reduce((a, b) => a + b, 0);

  // Check if everything fits on a single page with footer and without forced page break
  const hasForcedPageBreak = rows.some((r, i) => i > 0 && r.pageBreakBefore);
  if (!hasForcedPageBreak && totalRowHeight <= capPage1Single) {
    return [
      {
        pageIndex: 0,
        pageNumber: startPageNumber,
        rows: [...rows],
        isFirstPage: true,
        isLastPage: true,
        usedHeight: totalRowHeight,
        maxCapacity: capPage1Single,
      },
    ];
  }

  // Multi-page distribution
  const pages: PagePartition[] = [];
  let currentPageRows: CanvasRow[] = [];
  let currentUsedHeight = 0;
  let currentPageIndex = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rHeight = rowHeights[i];
    const currentLimit = getCapacityForPage(currentPageIndex);
    const isForcedBreak = i > 0 && Boolean(row.pageBreakBefore);

    if (
      currentPageRows.length > 0 &&
      (isForcedBreak || currentUsedHeight + rHeight > currentLimit)
    ) {
      pages.push({
        pageIndex: currentPageIndex,
        pageNumber: startPageNumber + currentPageIndex,
        rows: currentPageRows,
        isFirstPage: currentPageIndex === 0,
        isLastPage: false,
        usedHeight: currentUsedHeight,
        maxCapacity: currentLimit,
      });

      currentPageIndex++;
      currentPageRows = [row];
      currentUsedHeight = rHeight;
    } else {
      currentPageRows.push(row);
      currentUsedHeight += rHeight;
    }
  }

  if (currentPageRows.length > 0 || pages.length === 0) {
    pages.push({
      pageIndex: currentPageIndex,
      pageNumber: startPageNumber + currentPageIndex,
      rows: currentPageRows,
      isFirstPage: currentPageIndex === 0,
      isLastPage: true,
      usedHeight: currentUsedHeight,
      maxCapacity: getCapacityForPage(currentPageIndex),
    });
  }

  if (pages.length > 0) {
    pages[pages.length - 1].isLastPage = true;
  }

  return pages;
}

/**
 * Auto-balances cell width percentages inside a row so that 1=100%, 2=50%, 3=33%, 4=25%.
 */
export function autoBalanceRowCells(cells: CanvasCell[]): CanvasCell[] {
  if (!cells || cells.length === 0) return [];
  const count = cells.length;
  const equalPercent = Math.floor(100 / count);
  return cells.map((cell, idx) => {
    // If it's the last cell, absorb rounding difference to sum to 100
    const w = idx === count - 1 ? 100 - equalPercent * (count - 1) : equalPercent;
    return {
      ...cell,
      customWidth: w,
      colSpan: Math.max(1, Math.min(4, Math.round(w / 25))) as 1 | 2 | 3 | 4,
    };
  });
}

/**
 * Resolves or constructs working canvasRows for any LibrarySection.
 * If the section already has non-empty canvasRows, returns them.
 * Otherwise, generates balanced metric card rows, chart rows, and insight rows.
 */
export function resolveSectionCanvasRows(sec: LibrarySection): CanvasRow[] {
  if (sec.canvasRows && sec.canvasRows.length > 0) {
    return sec.canvasRows;
  }
  const rows: CanvasRow[] = [];
  const ts = Date.now();

  // 1. Metric Cards Row
  if (sec.metricCards && sec.metricCards.length > 0) {
    const count = sec.metricCards.length;
    const w = count === 1 ? 100 : count === 2 ? 50 : count === 3 ? 33.3 : count === 4 ? 25 : Math.floor(100 / count);
    const colSpan = (count === 1 ? 4 : count === 2 ? 2 : 1) as 1 | 2 | 3 | 4;
    rows.push({
      id: `row-mc-${ts}-${Math.random().toString(36).substr(2, 4)}`,
      sectionName: sec.name,
      pageBreakBefore: true,
      cells: sec.metricCards.map((card, cIdx) => ({
        id: `cell-mc-${card.id || `${ts}-${cIdx}`}`,
        colSpan,
        customWidth: w,
        blockType: "metric-card" as const,
        metricCard: card,
      })),
    });
  }

  // 2. Charts (one row per chart)
  if (sec.charts && sec.charts.length > 0) {
    sec.charts.forEach((chart, cIdx) => {
      rows.push({
        id: `row-ch-${ts}-${cIdx}-${Math.random().toString(36).substr(2, 4)}`,
        sectionName: sec.name,
        pageBreakBefore: rows.length === 0,
        cells: [
          {
            id: `cell-ch-${chart.id || `${ts}-${cIdx}`}`,
            colSpan: 4 as const,
            blockType: "chart" as const,
            chart,
          },
        ],
      });
    });
  }

  // 3. Key Insights
  if (sec.keyInsights && sec.keyInsights.length > 0) {
    rows.push({
      id: `row-ki-${ts}-${Math.random().toString(36).substr(2, 4)}`,
      sectionName: sec.name,
      pageBreakBefore: rows.length === 0,
      cells: sec.keyInsights.map((ki, kIdx) => ({
        id: `cell-ki-${ki.id || `${ts}-${kIdx}`}`,
        colSpan: 4 as const,
        blockType: "insight" as const,
        insight: ki,
      })),
    });
  }

  // Fallback text block if empty
  if (rows.length === 0) {
    rows.push({
      id: `row-def-${ts}-${Math.random().toString(36).substr(2, 4)}`,
      sectionName: sec.name,
      pageBreakBefore: true,
      cells: [
        {
          id: `cell-tb-${ts}`,
          colSpan: 4,
          blockType: "text",
          textBlock: {
            id: `tb-${ts}`,
            content: `<p><strong>${sec.name}</strong></p><p>${sec.description || "Operational telemetry and safety analysis."}</p>`,
          },
        },
      ],
    });
  }

  return rows;
}

export interface ReportSectionGroup {
  id: string;
  key: string;
  name: string;
  rows: CanvasRow[];
  startRowIndex: number;
  endRowIndex: number;
  pageNumber: number;
}

/**
 * Groups flat canvasRows into high-level report section blocks based on pageBreakBefore boundaries
 * and sectionName annotations.
 */
export function getReportSectionGroups(
  rows: CanvasRow[],
  defaultSectionName: string = "Statutory Compliance & Audit"
): ReportSectionGroup[] {
  if (!rows || rows.length === 0) return [];

  const groups: ReportSectionGroup[] = [];
  let currentGroupRows: CanvasRow[] = [];
  let currentStart = 0;
  let currentName = rows[0]?.sectionName || defaultSectionName;
  let currentKey = `section-${rows[0]?.id || "0"}`;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const isNewSection =
      i > 0 && (Boolean(row.pageBreakBefore) || Boolean(row.sectionName && row.sectionName !== currentName));

    if (isNewSection && currentGroupRows.length > 0) {
      groups.push({
        id: `sec-group-${groups.length}`,
        key: currentKey,
        name: currentName,
        rows: currentGroupRows,
        startRowIndex: currentStart,
        endRowIndex: i - 1,
        pageNumber: groups.length + 3,
      });

      currentGroupRows = [row];
      currentStart = i;
      currentName = row.sectionName || `Section ${groups.length + 1}`;
      currentKey = `section-${row.id}`;
    } else {
      currentGroupRows.push(row);
      if (!currentName && row.sectionName) {
        currentName = row.sectionName;
      }
    }
  }

  if (currentGroupRows.length > 0) {
    groups.push({
      id: `sec-group-${groups.length}`,
      key: currentKey,
      name: currentName,
      rows: currentGroupRows,
      startRowIndex: currentStart,
      endRowIndex: rows.length - 1,
      pageNumber: groups.length + 3,
    });
  }

  return groups;
}

/**
 * Reorders high-level section groups (fromIndex -> toIndex) and reconstructs the flat canvasRows array,
 * maintaining correct pageBreakBefore topology.
 */
export function reorderReportSectionGroups(
  rows: CanvasRow[],
  fromIndex: number,
  toIndex: number,
  defaultSectionName: string = "Statutory Compliance & Audit"
): CanvasRow[] {
  const groups = getReportSectionGroups(rows, defaultSectionName);
  if (
    fromIndex < 0 ||
    fromIndex >= groups.length ||
    toIndex < 0 ||
    toIndex >= groups.length ||
    fromIndex === toIndex
  ) {
    return rows;
  }

  const reordered = [...groups];
  const [moved] = reordered.splice(fromIndex, 1);
  reordered.splice(toIndex, 0, moved);

  const nextRows: CanvasRow[] = [];
  reordered.forEach((group, gIdx) => {
    group.rows.forEach((r, rIdx) => {
      nextRows.push({
        ...r,
        // The first row of the first group does not break; all subsequent groups start on a new page.
        pageBreakBefore: rIdx === 0 ? gIdx > 0 : Boolean(r.pageBreakBefore),
        sectionName: group.name,
      });
    });
  });

  return nextRows;
}

export interface AccurateReportSectionGroup extends ReportSectionGroup {
  startPageNumber: number;
  endPageNumber: number;
  pageRangeStr: string;
}

/**
 * Calculates accurate starting and ending page numbers for each section group
 * based on the actual partitioned pages.
 */
export function calculateSectionGroupPageNumbers(
  groups: ReportSectionGroup[],
  pages: PagePartition[]
): AccurateReportSectionGroup[] {
  if (!groups || groups.length === 0) return [];
  if (!pages || pages.length === 0) {
    return groups.map((g, idx) => ({
      ...g,
      startPageNumber: idx + 3,
      endPageNumber: idx + 3,
      pageRangeStr: `${idx + 3}`,
      pageNumber: idx + 3,
    }));
  }

  return groups.map((group, idx) => {
    const firstRowId = group.rows[0]?.id;
    const lastRowId = group.rows[group.rows.length - 1]?.id;

    const startPage = pages.find((p) => p.rows.some((r) => r.id === firstRowId));
    const endPage = pages.find((p) => p.rows.some((r) => r.id === lastRowId));

    const defaultPageNum = pages[0]?.pageNumber ?? 3;
    const startPageNum = startPage?.pageNumber ?? (idx === 0 ? defaultPageNum : defaultPageNum + idx);
    const endPageNum = endPage?.pageNumber ?? startPageNum;
    const pageRangeStr = startPageNum === endPageNum ? `${startPageNum}` : `${startPageNum} – ${endPageNum}`;

    return {
      ...group,
      pageNumber: startPageNum,
      startPageNumber: startPageNum,
      endPageNumber: endPageNum,
      pageRangeStr,
    };
  });
}

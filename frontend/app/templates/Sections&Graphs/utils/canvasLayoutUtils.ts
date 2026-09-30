import { CanvasRow, CanvasCell } from "@/lib/redux/slices/reportModuleSlice";
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

export function getDefaultBlockHeight(blockType?: string): number {
  switch (blockType) {
    case "chart":
      return 370;
    case "metric-card":
      return 135;
    case "badge-strip":
      return 140;
    case "insight":
      return 110;
    case "text":
      return 90;
    case "divider":
      return 32;
    default:
      return 140;
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
    let h = cell.customHeight || 90;
    if (!cell.customHeight) {
      switch (cell.blockType) {
        case "chart":
          h = cell.chart?.description ? 395 : 370;
          break;
        case "metric-card":
          h = 135;
          break;
        case "badge-strip": {
          const w = cell.customWidth ?? (cell.colSpan ? cell.colSpan * 25 : 100);
          h = w <= 55 ? 220 : 140;
          break;
        }
        case "insight":
          h = 110;
          break;
        case "text": {
          const lines = (cell.textBlock?.content || "").split("\n").length;
          h = Math.max(90, 60 + lines * 20);
          break;
        }
        case "divider":
          h = 32;
          break;
        default:
          h = 100;
      }
    }

    // Account for stacked cells in this column
    if (cell.stackedCells && cell.stackedCells.length > 0) {
      for (const sc of cell.stackedCells) {
        const scH = sc.customHeight || getDefaultBlockHeight(sc.blockType);
        h += scH + 12; // 12px gap between stacked blocks
      }
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
  sheetHeight: number = A4_HEIGHT_PX
): PagePartition[] {
  const page1MarginY = (marginConfig?.top ?? 24) + (marginConfig?.bottom ?? 24);

  // Exact physical A4 sheet height: 842px (Standard ISO PDF Page)
  // All pages have identical standard Header (Sitesafe + Section Bar) and identical Footer
  const standardCapacity = Math.round(
    Math.max(380, Math.min(540, sheetHeight - page1MarginY - 110 - 75 - 70 - 35))
  );
  const capPage1Single = standardCapacity;
  const capPage1Multi = standardCapacity;
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
    const isFirstPage = currentPageIndex === 0;
    const currentLimit = isFirstPage ? capPage1Multi : capMiddlePage;
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
      maxCapacity: currentPageIndex === 0 ? capPage1Single : capLastPage,
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

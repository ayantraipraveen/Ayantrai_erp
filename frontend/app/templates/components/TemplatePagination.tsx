"use client";

import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

export interface TemplatePaginationProps {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  totalPages: number;
  totalFilteredCount: number;
  startIndex: number;
  endIndex: number;
  pageSizeOptions?: number[];
  itemLabel?: string;
  className?: string;
}

/**
 * Reusable Enterprise Pagination Bar for Templates and Report grids/tables.
 */
export default function TemplatePagination({
  currentPage,
  setCurrentPage,
  pageSize,
  setPageSize,
  totalPages,
  totalFilteredCount,
  startIndex,
  endIndex,
  pageSizeOptions = [5, 10, 20, 50],
  itemLabel = "templates",
  className = "",
}: TemplatePaginationProps) {
  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-200 dark:border-zinc-800 bg-white/50 dark:bg-[#0c1017]/50 text-xs text-slate-500 dark:text-zinc-400 ${className}`}
    >
      {/* Left Info: Counter and Page Size Picker */}
      <div className="flex items-center gap-2">
        <span>
          Showing{" "}
          <strong className="text-slate-900 dark:text-white font-medium">
            {totalFilteredCount > 0 ? startIndex + 1 : 0}
          </strong>{" "}
          to{" "}
          <strong className="text-slate-900 dark:text-white font-medium">
            {endIndex}
          </strong>{" "}
          of{" "}
          <strong className="text-slate-900 dark:text-white font-medium">
            {totalFilteredCount}
          </strong>{" "}
          {itemLabel}
        </span>
        <span className="text-slate-300 dark:text-zinc-700">|</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-400">Rows per page:</span>
          {pageSizeOptions.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setPageSize(size)}
              className={`h-5 px-1.5 rounded text-[10px] font-medium transition-all cursor-pointer ${
                pageSize === size
                  ? "bg-[#9D61FF] text-white font-bold"
                  : "hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Right Controls: Navigation Buttons */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setCurrentPage(1)}
          disabled={currentPage <= 1}
          className="h-7 w-7 rounded-lg border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
          title="First Page"
        >
          <ChevronsLeft className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="h-7 w-7 rounded-lg border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
          title="Previous Page"
        >
          <ChevronLeft className="w-3 h-3" />
        </button>

        <div className="flex items-center gap-1 mx-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((page) => {
              if (totalPages <= 5) return true;
              if (page === 1 || page === totalPages) return true;
              return Math.abs(page - currentPage) <= 1;
            })
            .map((page, idx, arr) => {
              const prev = arr[idx - 1];
              return (
                <React.Fragment key={page}>
                  {prev && page - prev > 1 && (
                    <span className="px-1 text-slate-400 dark:text-zinc-600 font-mono text-xs">
                      ...
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`h-7 min-w-[28px] px-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer flex items-center justify-center ${
                      currentPage === page
                        ? "bg-[#9D61FF] text-white shadow-[0_0_10px_rgba(157,97,255,0.35)]"
                        : "border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {page}
                  </button>
                </React.Fragment>
              );
            })}
        </div>

        <button
          type="button"
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="h-7 w-7 rounded-lg border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
          title="Next Page"
        >
          <ChevronRight className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage >= totalPages}
          className="h-7 w-7 rounded-lg border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
          title="Last Page"
        >
          <ChevronsRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

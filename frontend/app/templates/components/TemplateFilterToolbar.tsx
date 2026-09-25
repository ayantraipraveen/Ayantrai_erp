"use client";

import React from "react";
import { Search, X, Building, Filter, List, LayoutGrid, Plus, Layers } from "lucide-react";
import { Tooltip, CustomDropdown, DateRangeFilter } from "../../Component";
import { useTemplates } from "./TemplatesContext";
import { useAppDispatch } from "@/lib/redux/hooks";
import { setTemplateActiveTab } from "@/lib/redux/slices/reportModuleSlice";

/**
 * Filter and action toolbar for Templates module.
 * Takes ZERO props - reads directly from TemplatesContext.
 * Features a dedicated Status Dropdown filter, Site Dropdown filter, Date Range filter, instant search,
 * view mode toggle, and primary create action.
 */
export default function TemplateFilterToolbar() {
  const dispatch = useAppDispatch();
  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    statusFilterOptions,
    siteFilter,
    setSiteFilter,
    siteFilterOptions,
    dateRange,
    setDateRange,
    resetFilters,
    hasActiveFilters,
    viewMode,
    setViewMode,
    setBuilderOpen,
    filteredTemplates,
    totalCount,
  } = useTemplates();

  return (
    <div className="p-0 bg-transparent">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2.5">
        {/* Left Side: Search + Status Dropdown + Site Dropdown + Date Range + Reset */}
        <div className="flex flex-1 items-center gap-2 flex-wrap min-w-0">
          {/* Search Input (Standardized h-9) */}
          <div className="relative flex-1 min-w-[160px] max-w-[220px] h-9">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 dark:text-zinc-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search blueprints by name, ID, or site..."
              className="w-full h-9 pl-9 pr-8 rounded-xl border border-slate-200 dark:border-zinc-800/90 bg-slate-50/80 dark:bg-[#0e1219]/90 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-[#9D61FF]/80 focus:bg-white dark:focus:bg-[#0b0e14] transition-all shadow-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status Dropdown Filter (Standardized h-9) */}
          <div className="w-36 sm:w-40 h-9 flex-shrink-0">
            <CustomDropdown
              options={statusFilterOptions}
              value={statusFilter}
              onChange={setStatusFilter}
              icon={Filter}
              size="sm"
              placeholder="Filter by status..."
              className="h-9"
            />
          </div>

          {/* Industrial Site Dropdown Filter (Standardized h-9) */}
          <div className="w-40 sm:w-44 h-9 flex-shrink-0">
            <CustomDropdown
              options={siteFilterOptions}
              value={siteFilter}
              onChange={setSiteFilter}
              icon={Building}
              size="sm"
              placeholder="Filter by site..."
              className="h-9"
            />
          </div>

          {/* Universal Date Range Filter (Standardized h-9) */}
          <div className="min-w-36 max-w-[240px] w-auto h-9 flex-shrink-0">
            <DateRangeFilter
              value={dateRange}
              onChange={setDateRange}
              size="sm"
              placeholder="Filter by date..."
              className="h-9 w-full"
            />
          </div>

          {/* Reset Filters button if any filter is active */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="h-9 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-xs text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 flex-shrink-0 shadow-sm"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Right Side: Results counter + View Mode Toggle + Create Button */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5 flex-shrink-0 ml-auto xl:ml-0">
          <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono">
            Showing <strong className="text-slate-900 dark:text-white">{filteredTemplates.length}</strong> of {totalCount}
          </span>

          {/* View Toggle (Table / Grid) */}
          <div className="flex items-center p-0.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-[#0e1219] h-9">
            <Tooltip content="Table of Lists View" position="bottom">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`h-7.5 px-2.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "table"
                    ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm font-semibold"
                    : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Table</span>
              </button>
            </Tooltip>

            <Tooltip content="Grid Blueprint View" position="bottom">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`h-7.5 px-2.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm font-semibold"
                    : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Grid</span>
              </button>
            </Tooltip>
          </div>
          {/* Primary Action Button */}
          <button
            type="button"
            onClick={() => setBuilderOpen(true)}
            className="h-9 px-4 rounded-xl glow-btn-primary font-bold text-xs cursor-pointer flex items-center justify-center gap-2 flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Template</span>
          </button>
        </div>
      </div>
    </div>
  );
}

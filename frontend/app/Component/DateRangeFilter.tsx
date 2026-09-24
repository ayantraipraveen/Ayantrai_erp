"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  X,
  Check,
  RotateCcw,
  Clock,
  ArrowRight,
} from "lucide-react";
import Tooltip from "./Tooltip";

export interface DateRangeValue {
  startDate: string; // ISO date format "YYYY-MM-DD" or empty ""
  endDate: string;   // ISO date format "YYYY-MM-DD" or empty ""
  preset?: string;   // Identifier of preset or "custom" or "all_time"
  label: string;     // Display label, e.g. "Last 7 Days" or "Sep 15 – Sep 22, 2026"
}

export interface DateRangeFilterProps {
  /** Currently selected date range */
  value?: DateRangeValue;
  /** Callback fired when date range changes */
  onChange?: (range: DateRangeValue) => void;
  /** Default date range if uncontrolled */
  defaultValue?: DateRangeValue;
  /** Size variant (default: "sm", h-9 36px) */
  size?: "sm" | "md";
  /** Popover menu alignment */
  align?: "left" | "right";
  /** Placeholder label when no range is set */
  placeholder?: string;
  /** Additional wrapper class names */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
}

export interface DatePresetOption {
  id: string;
  label: string;
  getRange: () => { startDate: string; endDate: string };
}

/** Format Date object to "YYYY-MM-DD" */
export function formatDateToISO(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Format "YYYY-MM-DD" to readable short format e.g. "Sep 22, 2026" */
export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    if (!year || !month || !day) return dateStr;
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/** Standard preset options */
export const STANDARD_DATE_PRESETS: DatePresetOption[] = [
  {
    id: "all_time",
    label: "All Time",
    getRange: () => ({ startDate: "", endDate: "" }),
  },
  {
    id: "today",
    label: "Today",
    getRange: () => {
      const today = new Date();
      const iso = formatDateToISO(today);
      return { startDate: iso, endDate: iso };
    },
  },
  {
    id: "yesterday",
    label: "Yesterday",
    getRange: () => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      const iso = formatDateToISO(d);
      return { startDate: iso, endDate: iso };
    },
  },
  {
    id: "last_7_days",
    label: "Last 7 Days",
    getRange: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 6);
      return { startDate: formatDateToISO(start), endDate: formatDateToISO(end) };
    },
  },
  {
    id: "last_30_days",
    label: "Last 30 Days",
    getRange: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 29);
      return { startDate: formatDateToISO(start), endDate: formatDateToISO(end) };
    },
  },
  {
    id: "this_month",
    label: "This Month",
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { startDate: formatDateToISO(start), endDate: formatDateToISO(now) };
    },
  },
  {
    id: "last_month",
    label: "Last Month",
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { startDate: formatDateToISO(start), endDate: formatDateToISO(end) };
    },
  },
];

export const DEFAULT_DATE_RANGE: DateRangeValue = {
  startDate: "",
  endDate: "",
  preset: "all_time",
  label: "All Time",
};

/**
 * Universal Reusable Date Range Filter Component for Sitesafe ERP.
 * Standardized with 36px (h-9) controls, quick presets (Today, Last 7 Days, Last 30 Days, This Month, etc.),
 * custom start/end date selectors, dark/light theme support, and click-outside dismissal.
 */
export default function DateRangeFilter({
  value: controlledValue,
  onChange,
  defaultValue = DEFAULT_DATE_RANGE,
  size = "sm",
  align = "left",
  placeholder = "Filter by date...",
  className = "",
  disabled = false,
}: DateRangeFilterProps) {
  const [internalValue, setInternalValue] = useState<DateRangeValue>(
    controlledValue || defaultValue
  );
  const [isOpen, setIsOpen] = useState(false);

  // Temporary inputs inside the popover before applying
  const [draftStart, setDraftStart] = useState(internalValue.startDate);
  const [draftEnd, setDraftEnd] = useState(internalValue.endDate);
  const [draftPreset, setDraftPreset] = useState(internalValue.preset || "all_time");

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef   = useRef<HTMLButtonElement>(null);
  const panelRef    = useRef<HTMLDivElement>(null);

  // Portal menu position
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 0, flipUp: false });

  const updatePanelPosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const panelHeight = 420; // estimated max panel height
    const panelWidth  = 320;
    const spaceBelow  = window.innerHeight - rect.bottom;
    const flipUp      = spaceBelow < panelHeight && rect.top > panelHeight;

    // align: left or right
    let left = align === "right"
      ? rect.right - panelWidth
      : rect.left;

    // clamp within viewport
    left = Math.max(8, Math.min(left, window.innerWidth - panelWidth - 8));

    setMenuPos({
      top:    flipUp ? rect.top - panelHeight + window.scrollY : rect.bottom + window.scrollY + 4,
      left:   left + window.scrollX,
      width:  panelWidth,
      flipUp,
    });
  }, [align]);

  // Sync external value updates
  useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValue(controlledValue);
      setDraftStart(controlledValue.startDate);
      setDraftEnd(controlledValue.endDate);
      setDraftPreset(controlledValue.preset || (controlledValue.startDate ? "custom" : "all_time"));
    }
  }, [controlledValue]);

  // Click-outside listener — checks both trigger and panel
  useEffect(() => {
    if (!isOpen) return;
    updatePanelPosition();
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current && !containerRef.current.contains(e.target as Node) &&
        panelRef.current    && !panelRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("resize", updatePanelPosition);
    window.addEventListener("scroll", updatePanelPosition, true);
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("resize", updatePanelPosition);
      window.removeEventListener("scroll", updatePanelPosition, true);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, updatePanelPosition]);

  const activeValue = controlledValue !== undefined ? controlledValue : internalValue;
  const isFiltered = Boolean(activeValue.startDate || activeValue.endDate || (activeValue.preset && activeValue.preset !== "all_time"));

  // Select a preset option
  const handleSelectPreset = (preset: DatePresetOption) => {
    setDraftPreset(preset.id);
    if (preset.id === "all_time") {
      setDraftStart("");
      setDraftEnd("");
    } else {
      const range = preset.getRange();
      setDraftStart(range.startDate);
      setDraftEnd(range.endDate);
    }
  };

  // Apply changes
  const handleApply = () => {
    let finalLabel = "All Time";
    let finalPreset = draftPreset;

    if (draftPreset === "all_time" || (!draftStart && !draftEnd)) {
      finalLabel = "All Time";
      finalPreset = "all_time";
    } else {
      const matchedPreset = STANDARD_DATE_PRESETS.find((p) => p.id === draftPreset);
      if (matchedPreset && matchedPreset.id !== "all_time" && matchedPreset.id !== "custom") {
        finalLabel = matchedPreset.label;
      } else if (draftStart && draftEnd) {
        if (draftStart === draftEnd) {
          finalLabel = formatDisplayDate(draftStart);
        } else {
          finalLabel = `${formatDisplayDate(draftStart)} – ${formatDisplayDate(draftEnd)}`;
        }
        finalPreset = "custom";
      } else if (draftStart) {
        finalLabel = `From ${formatDisplayDate(draftStart)}`;
        finalPreset = "custom";
      } else if (draftEnd) {
        finalLabel = `Until ${formatDisplayDate(draftEnd)}`;
        finalPreset = "custom";
      }
    }

    const updated: DateRangeValue = {
      startDate: draftStart,
      endDate: draftEnd,
      preset: finalPreset,
      label: finalLabel,
    };

    setInternalValue(updated);
    if (onChange) {
      onChange(updated);
    }
    setIsOpen(false);
  };

  // Clear / Reset filter
  const handleReset = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const resetVal = DEFAULT_DATE_RANGE;
    setDraftStart("");
    setDraftEnd("");
    setDraftPreset("all_time");
    setInternalValue(resetVal);
    if (onChange) {
      onChange(resetVal);
    }
    setIsOpen(false);
  };

  // Open popover and initialize draft state
  const handleToggleOpen = () => {
    if (disabled) return;
    if (!isOpen) {
      setDraftStart(activeValue.startDate);
      setDraftEnd(activeValue.endDate);
      setDraftPreset(activeValue.preset || "all_time");
    }
    setIsOpen(!isOpen);
  };

  const isSm = size === "sm";

  return (
    <div className={`relative inline-block text-left select-none ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        ref={buttonRef}
        onClick={handleToggleOpen}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={`group relative w-full rounded-xl border font-medium transition-all flex items-center justify-between gap-2 cursor-pointer shadow-sm ${
          isSm ? "h-9 min-h-[36px] px-3 text-xs" : "h-11 px-4 text-sm"
        } ${
          isOpen
            ? "border-[#9D61FF] bg-purple-500/10 dark:bg-purple-950/20 text-slate-900 dark:text-white ring-1 ring-[#9D61FF]/50 shadow-[0_0_12px_rgba(157,97,255,0.2)]"
            : isFiltered
            ? "border-purple-500/60 bg-purple-500/5 dark:bg-[#0e1219]/90 text-slate-900 dark:text-white"
            : "border-slate-200 dark:border-zinc-800/90 bg-slate-50/80 dark:bg-[#0e1219]/90 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-zinc-700"
        } ${disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <CalendarIcon
            className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${
              isFiltered || isOpen
                ? "text-[#9D61FF]"
                : "text-slate-400 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-300"
            }`}
          />
          <span className="truncate font-semibold tracking-tight">
            {isFiltered ? activeValue.label : placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Clear button if range is active */}
          {isFiltered && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleReset}
              title="Reset date filter"
              className="p-0.5 rounded-md hover:bg-slate-200/70 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors"
            >
              <X className="w-3 h-3" />
            </span>
          )}

          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-slate-700 dark:text-white" : "group-hover:text-slate-700 dark:group-hover:text-zinc-300"
            }`}
          />
        </div>
      </button>

      {/* Portal Dropdown Panel */}
      {isOpen && typeof document !== "undefined" && createPortal(
        <div
          ref={panelRef}
          style={{
            position: "fixed",
            top:  menuPos.top,
            left: menuPos.left,
            width: menuPos.width,
            zIndex: 9999,
          }}
          className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/98 dark:bg-[#0c1017]/98 backdrop-blur-2xl p-4 shadow-2xl animate-fadeIn space-y-3.5 text-slate-800 dark:text-white"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/80 pb-2.5">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#9D61FF]" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">Date Range Filter</span>
            </div>
            {isFiltered && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-700 dark:text-[#9D61FF] border border-purple-500/30 font-semibold">
                Active Filter
              </span>
            )}
          </div>

          {/* Presets Chips */}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1.5 font-semibold">
              Quick Presets
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {STANDARD_DATE_PRESETS.map((preset) => {
                const isSelected = draftPreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-all cursor-pointer flex items-center justify-between border ${
                      isSelected
                        ? "bg-[#9D61FF]/15 border-[#9D61FF] text-slate-950 dark:text-white font-semibold shadow-[0_0_10px_rgba(157,97,255,0.2)]"
                        : "border-slate-100 dark:border-zinc-800/80 bg-slate-50/60 dark:bg-zinc-900/40 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/70"
                    }`}
                  >
                    <span className="truncate">{preset.label}</span>
                    {isSelected && <Check className="w-3 h-3 text-[#9D61FF] flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Date Range Inputs */}
          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 space-y-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-semibold">
              Custom Range
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-500 dark:text-zinc-400 block mb-1">Start Date</label>
                <input
                  type="date"
                  value={draftStart}
                  onChange={(e) => { setDraftStart(e.target.value); setDraftPreset("custom"); }}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#9D61FF] transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 dark:text-zinc-400 block mb-1">End Date</label>
                <input
                  type="date"
                  value={draftEnd}
                  onChange={(e) => { setDraftEnd(e.target.value); setDraftPreset("custom"); }}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#9D61FF] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2.5 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="h-8 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 text-xs font-medium text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="h-8 px-3 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="h-8 px-4 rounded-xl bg-[#9D61FF] hover:bg-[#8B4CF0] text-white font-bold text-xs transition-all shadow-[0_0_14px_rgba(157,97,255,0.35)] cursor-pointer flex items-center gap-1"
              >
                <span>Apply</span>
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

/**
 * Universal date matching helper.
 * Determines whether a target date string/timestamp falls within the active DateRangeValue.
 */
export function isDateWithinRange(
  dateValue: string | number | Date | undefined | null,
  range: DateRangeValue | undefined
): boolean {
  if (!range) return true;
  if (!range.startDate && !range.endDate) return true;
  if (range.preset === "all_time") return true;
  if (!dateValue) return false;

  try {
    let targetTime: number;

    if (dateValue instanceof Date) {
      targetTime = dateValue.getTime();
    } else if (typeof dateValue === "number") {
      targetTime = dateValue;
    } else {
      // Parse ISO, standard formats, or e.g. "2026-09-18 10:30 AM", "18 Sep 2026"
      const parsed = new Date(dateValue);
      if (isNaN(parsed.getTime())) {
        // Fallback simple string matching if non-standard
        return true;
      }
      targetTime = parsed.getTime();
    }

    if (range.startDate) {
      const [sY, sM, sD] = range.startDate.split("-").map(Number);
      const startTime = new Date(sY, sM - 1, sD, 0, 0, 0, 0).getTime();
      if (targetTime < startTime) return false;
    }

    if (range.endDate) {
      const [eY, eM, eD] = range.endDate.split("-").map(Number);
      const endTime = new Date(eY, eM - 1, eD, 23, 59, 59, 999).getTime();
      if (targetTime > endTime) return false;
    }

    return true;
  } catch {
    return true;
  }
}

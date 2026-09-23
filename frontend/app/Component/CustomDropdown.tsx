"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import { ChevronDown, Check, Search, AlertCircle } from "lucide-react";

export interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
  badge?: string;
  badgeColor?: string;
  disabled?: boolean;
}

export interface CustomDropdownProps {
  /** Array of options as either simple strings or rich DropdownOption objects */
  options: (string | DropdownOption)[];
  /** Currently selected value */
  value: string;
  /** Callback fired when selection changes */
  onChange: (value: string) => void;
  /** Optional top field label */
  label?: string;
  /** Optional placeholder when no value is selected */
  placeholder?: string;
  /** Leading icon displayed in the closed trigger button */
  icon?: React.ComponentType<{ className?: string }>;
  /** Validation error message */
  error?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Overall wrapper className */
  className?: string;
  /** Trigger button className override */
  buttonClassName?: string;
  /** Dropdown menu panel className override */
  menuClassName?: string;
  /** Menu horizontal alignment */
  align?: "left" | "right";
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Enable quick filter search inside the dropdown list */
  searchable?: boolean;
  /** HTML id */
  id?: string;
}

/**
 * Reusable Industrial Custom Dropdown / Select Component.
 * Engineered for Sitesafe ERP with sleek dark glassmorphic styling, amber active glow,
 * keyboard accessibility, click-outside handling, and optional search filtering.
 */
export default function CustomDropdown({
  options,
  value,
  onChange,
  label,
  placeholder = "Select an option",
  icon: LeadingIcon,
  error,
  disabled = false,
  className = "",
  buttonClassName = "",
  menuClassName = "",
  align = "left",
  size = "sm",
  searchable = false,
  id,
}: CustomDropdownProps) {
  const generatedId = useId();
  const dropdownId = id || generatedId;
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Normalize all options to DropdownOption format
  const normalizedOptions: DropdownOption[] = options.map((opt) => {
    if (typeof opt === "string") {
      return { value: opt, label: opt };
    }
    return opt;
  });

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Filter options if search query is active
  const filteredOptions = normalizedOptions.filter((opt) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      opt.label.toLowerCase().includes(query) ||
      (opt.description && opt.description.toLowerCase().includes(query)) ||
      (opt.badge && opt.badge.toLowerCase().includes(query))
    );
  });

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input on open
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    if (isOpen) {
      const idx = filteredOptions.findIndex((o) => o.value === value);
      setFocusedIndex(idx >= 0 ? idx : 0);
    }
  }, [isOpen, searchable]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      setSearchQuery("");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredOptions.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
        const item = filteredOptions[focusedIndex];
        if (!item.disabled) {
          onChange(item.value);
          setIsOpen(false);
          setSearchQuery("");
        }
      }
    }
  };

  // Size specific styles - standardized to rounded-xl to match adjacent form inputs
  const sizeClasses = {
    sm: "h-9 px-3 text-xs rounded-xl min-h-[36px]",
    md: "py-2 px-3 text-xs sm:text-sm rounded-xl min-h-[38px]",
    lg: "py-2.5 px-3.5 text-sm rounded-xl min-h-[44px]",
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${label ? "space-y-1" : ""} ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Optional Form Field Label - matched font size and weight to standard inputs */}
      {label && (
        <label
          htmlFor={dropdownId}
          className="block text-[11px] sm:text-xs font-medium text-slate-700 dark:text-zinc-300"
        >
          {label}
        </label>
      )}

      {/* Main Trigger Button - matches rounded-xl, height, and glowing amber halo of inputs */}
      <button
        type="button"
        id={dropdownId}
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            setSearchQuery("");
          }
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between text-left transition-all border outline-none cursor-pointer rounded-xl ${
          sizeClasses[size]
        } ${
          error
            ? "input-error border-red-500/90 shadow-[0_0_16px_rgba(239,68,68,0.5)] bg-red-50 dark:bg-[#12080a]"
            : isOpen
            ? "border-[#9D61FF] bg-purple-50/40 dark:bg-[#0d111a] shadow-[0_0_0_1.5px_#9D61FF,0_0_16px_rgba(157,97,255,0.3)] text-slate-900 dark:text-white"
            : "border-slate-200 dark:border-zinc-800/90 bg-slate-50/80 dark:bg-[#080b10] text-slate-800 dark:text-zinc-200 focus-glow-amber hover:border-[#9D61FF]/60 hover:shadow-[0_0_12px_rgba(157,97,255,0.2)] hover:bg-slate-100/90 dark:hover:bg-[#0c0f16]"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${buttonClassName}`}
      >
        <div className="flex items-center gap-2.5 truncate pr-2">
          {LeadingIcon && (
            <LeadingIcon className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-500 flex-shrink-0" />
          )}
          {selectedOption?.icon && (
            <selectedOption.icon className="w-3.5 h-3.5 text-[#9D61FF] flex-shrink-0 drop-shadow-[0_0_6px_rgba(157,97,255,0.4)]" />
          )}
          <span
            className={`truncate text-xs ${
              selectedOption ? "text-slate-900 dark:text-white font-medium" : "text-slate-500 dark:text-zinc-500 font-normal"
            }`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span
              className={`text-[9px] font-mono px-1.5 py-0.2 rounded border uppercase font-semibold ${
                selectedOption.badgeColor ||
                "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700"
              }`}
            >
              {selectedOption.badge}
            </span>
          )}
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 dark:text-zinc-400 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#9D61FF] drop-shadow-[0_0_6px_rgba(157,97,255,0.6)]" : ""
          }`}
        />
      </button>

      {/* Floating Dropdown Panel - glowing purple border and rounded-xl */}
      {isOpen && (
        <div
          role="listbox"
          className={`absolute z-50 mt-1.5 w-full min-w-[220px] rounded-xl border border-slate-200 dark:border-[#9D61FF]/40 bg-white/98 dark:bg-[#0e131e]/98 backdrop-blur-2xl p-1.5 shadow-2xl animate-fadeIn ${
            align === "right" ? "right-0" : "left-0"
          } ${menuClassName}`}
        >
          {/* Optional Search Input */}
          {(searchable || normalizedOptions.length > 8) && (
            <div className="p-1 mb-1 border-b border-slate-100 dark:border-zinc-800/80">
              <div className="relative flex items-center">
                <Search className="absolute left-2 w-3 h-3 text-slate-400 dark:text-zinc-500 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setFocusedIndex(0);
                  }}
                  placeholder="Filter options..."
                  className="w-full pl-7 pr-2 py-1.5 text-[11px] bg-slate-50 dark:bg-[#07090e] border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-[#F6C72F] focus:shadow-[0_0_10px_rgba(246,199,47,0.3)] font-mono"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto space-y-0.5 custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="py-2 px-3 text-center text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                No matching results
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const isSelected = option.value === value;
                const isFocused = index === focusedIndex;
                const OptionIcon = option.icon;

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    disabled={option.disabled}
                    onClick={() => {
                      if (!option.disabled) {
                        onChange(option.value);
                        setIsOpen(false);
                        setSearchQuery("");
                      }
                    }}
                    onMouseEnter={() => setFocusedIndex(index)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs transition-all cursor-pointer ${
                      option.disabled
                        ? "opacity-40 cursor-not-allowed"
                        : isSelected
                        ? "bg-purple-500/15 text-purple-700 dark:text-[#9D61FF] font-semibold border border-purple-500/30 dark:border-[#9D61FF]/40 shadow-[0_0_10px_rgba(157,97,255,0.2)]"
                        : isFocused
                        ? "bg-slate-100 dark:bg-zinc-800/90 text-slate-900 dark:text-white"
                        : "text-slate-700 dark:text-zinc-300 hover:bg-purple-500/10 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      {OptionIcon && (
                        <OptionIcon
                          className={`w-3.5 h-3.5 flex-shrink-0 ${
                            isSelected ? "text-purple-600 dark:text-[#9D61FF]" : "text-slate-400 dark:text-zinc-400"
                          }`}
                        />
                      )}
                      <div>
                        <div className="truncate text-[11px] font-medium leading-tight">
                          {option.label}
                        </div>
                        {option.description && (
                          <div className="text-[9px] text-slate-500 dark:text-zinc-500 font-mono truncate">
                            {option.description}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {option.badge && (
                        <span
                          className={`text-[8px] font-mono px-1 py-0.2 rounded border uppercase ${
                            option.badgeColor ||
                            "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700"
                          }`}
                        >
                          {option.badge}
                        </span>
                      )}
                      {isSelected && (
                        <Check className="w-3 h-3 text-[#9D61FF] flex-shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Validation Error Text */}
      {error && (
        <p className="text-[9px] text-red-400 font-mono flex items-center gap-1 mt-0.5 animate-fadeIn">
          <AlertCircle className="w-2.5 h-2.5 flex-shrink-0 text-red-400" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

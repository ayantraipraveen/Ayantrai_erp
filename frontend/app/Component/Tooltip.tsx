"use client";

import React, { useState, useRef, useEffect } from "react";

export type TooltipPosition = "top" | "bottom" | "left" | "right";
export type TooltipVariant = "default" | "amber" | "emerald" | "danger" | "sky";

export interface TooltipProps {
  /** The content to display inside the tooltip bubble (string or JSX) */
  content: React.ReactNode;
  /** The target element that triggers the tooltip on hover or focus */
  children: React.ReactNode;
  /** Position relative to the target element */
  position?: TooltipPosition;
  /** Color theme accent */
  variant?: TooltipVariant;
  /** Delay in milliseconds before showing tooltip */
  delay?: number;
  /** Additional classes for the trigger wrapper */
  className?: string;
  /** Additional classes for the tooltip popover */
  tooltipClassName?: string;
  /** Whether to show directional indicator arrow */
  showArrow?: boolean;
  /** Disable tooltip display */
  disabled?: boolean;
}

const variantStyles: Record<TooltipVariant, { container: string; arrow: string }> = {
  default: {
    container: "bg-[#0d121c] border-zinc-700/80 text-zinc-200 shadow-2xl shadow-black/80",
    arrow: "border-zinc-700/80 bg-[#0d121c]",
  },
  amber: {
    container: "bg-[#121620] border-[#F6C72F]/50 text-amber-200 shadow-[0_0_18px_rgba(246,199,47,0.22)]",
    arrow: "border-[#F6C72F]/50 bg-[#121620]",
  },
  emerald: {
    container: "bg-[#091814] border-emerald-500/50 text-emerald-200 shadow-[0_0_18px_rgba(16,185,129,0.22)]",
    arrow: "border-emerald-500/50 bg-[#091814]",
  },
  danger: {
    container: "bg-[#1c0d12] border-red-500/50 text-red-200 shadow-[0_0_18px_rgba(239,68,68,0.22)]",
    arrow: "border-red-500/50 bg-[#1c0d12]",
  },
  sky: {
    container: "bg-[#091522] border-sky-500/50 text-sky-200 shadow-[0_0_18px_rgba(14,165,233,0.22)]",
    arrow: "border-sky-500/50 bg-[#091522]",
  },
};

const positionStyles: Record<TooltipPosition, { container: string; arrow: string }> = {
  top: {
    container: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    arrow: "top-full left-1/2 -translate-x-1/2 -translate-y-1/2 border-r border-b",
  },
  bottom: {
    container: "top-full left-1/2 -translate-x-1/2 mt-2",
    arrow: "bottom-full left-1/2 -translate-x-1/2 translate-y-1/2 border-l border-t",
  },
  left: {
    container: "right-full top-1/2 -translate-y-1/2 mr-2",
    arrow: "left-full top-1/2 -translate-y-1/2 -translate-x-1/2 border-t border-r",
  },
  right: {
    container: "left-full top-1/2 -translate-y-1/2 ml-2",
    arrow: "right-full top-1/2 -translate-y-1/2 translate-x-1/2 border-b border-l",
  },
};

/**
 * Reusable Industrial Tooltip Component
 * Displays an illuminated, accessible popover upon hover or keyboard focus.
 */
export default function Tooltip({
  content,
  children,
  position = "top",
  variant = "default",
  delay = 120,
  className = "",
  tooltipClassName = "",
  showArrow = true,
  disabled = false,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    if (disabled || !content) return;
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (disabled || !content) {
    return <>{children}</>;
  }

  const currentVariant = variantStyles[variant] || variantStyles.default;
  const currentPosition = positionStyles[position] || positionStyles.top;

  return (
    <div
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}

      {/* Tooltip Floating Bubble */}
      <div
        role="tooltip"
        aria-hidden={!isVisible}
        className={`pointer-events-none absolute z-50 whitespace-nowrap rounded-lg border px-2.5 py-1 text-[10px] font-mono font-medium tracking-tight backdrop-blur-xl transition-all duration-150 ${
          currentPosition.container
        } ${currentVariant.container} ${
          isVisible
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 pointer-events-none"
        } ${tooltipClassName}`}
      >
        {content}

        {/* Directional Arrow */}
        {showArrow && (
          <span
            className={`absolute h-1.5 w-1.5 rotate-45 pointer-events-none ${currentPosition.arrow} ${currentVariant.arrow}`}
          />
        )}
      </div>
    </div>
  );
}

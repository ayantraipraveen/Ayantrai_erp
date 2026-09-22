"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

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
    container: "bg-[#0d121c] border-zinc-700/90 text-zinc-200 shadow-[0_4px_24px_rgba(0,0,0,0.85),0_0_14px_rgba(246,199,47,0.12)]",
    arrow: "border-zinc-700/90 bg-[#0d121c]",
  },
  amber: {
    container: "bg-[#121620] border-[#F6C72F]/60 text-amber-200 shadow-[0_0_20px_rgba(246,199,47,0.3)]",
    arrow: "border-[#F6C72F]/60 bg-[#121620]",
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

/**
 * Reusable Industrial Tooltip Component
 * Displays an illuminated, accessible popover upon hover or keyboard focus.
 * Portaled to document.body to prevent parent container overflow clipping or scrollbar generation.
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
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updateCoords = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();

    if (position === "right") {
      setCoords({
        top: rect.top + rect.height / 2,
        left: rect.right + 8,
      });
    } else if (position === "left") {
      setCoords({
        top: rect.top + rect.height / 2,
        left: rect.left - 8,
      });
    } else if (position === "bottom") {
      setCoords({
        top: rect.bottom + 8,
        left: rect.left + rect.width / 2,
      });
    } else {
      // top
      setCoords({
        top: rect.top - 8,
        left: rect.left + rect.width / 2,
      });
    }
  }, [position]);

  const showTooltip = () => {
    if (disabled || !content) return;
    updateCoords();
    timeoutRef.current = setTimeout(() => {
      updateCoords();
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

  // Recalculate or close on window scroll / resize
  useEffect(() => {
    if (!isVisible) return;
    const handleScrollOrResize = () => {
      updateCoords();
    };
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isVisible, updateCoords]);

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

  // Transform and arrow styles per position
  let transformStyle = "translate(-50%, -100%)";
  let arrowClass = "bottom-[-4px] left-1/2 -translate-x-1/2 border-r border-b";

  if (position === "bottom") {
    transformStyle = "translate(-50%, 0)";
    arrowClass = "top-[-4px] left-1/2 -translate-x-1/2 border-l border-t";
  } else if (position === "right") {
    transformStyle = "translate(0, -50%)";
    arrowClass = "left-[-4px] top-1/2 -translate-y-1/2 border-l border-b";
  } else if (position === "left") {
    transformStyle = "translate(-100%, -50%)";
    arrowClass = "right-[-4px] top-1/2 -translate-y-1/2 border-r border-t";
  }

  return (
    <div
      ref={triggerRef}
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}

      {/* Tooltip Floating Bubble (Portaled to document.body) */}
      {mounted &&
        isVisible &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="tooltip"
            style={{
              position: "fixed",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              transform: transformStyle,
              zIndex: 99999,
            }}
            className={`pointer-events-none whitespace-nowrap rounded-xl border px-2.5 py-1 text-[10px] font-mono font-medium tracking-tight backdrop-blur-xl animate-fadeIn ${currentVariant.container} ${tooltipClassName}`}
          >
            {content}

            {/* Directional Arrow */}
            {showArrow && (
              <span
                className={`absolute h-1.5 w-1.5 rotate-45 pointer-events-none ${arrowClass} ${currentVariant.arrow}`}
              />
            )}
          </div>,
          document.body
        )}
    </div>
  );
}


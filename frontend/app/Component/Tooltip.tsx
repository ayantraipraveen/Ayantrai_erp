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
  /** Preferred position relative to the cursor or target element */
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
  /** Whether tooltip should follow the cursor while hovering inside the trigger element (default: true) */
  followCursor?: boolean;
  /** Maximum width for wrapping long text (e.g. "max-w-xs", "max-w-sm", or custom px) */
  maxWidth?: string;
  /** Whether text should wrap (default: true for long content) */
  wrap?: boolean;
}

const variantStyles: Record<TooltipVariant, { container: string; arrow: string }> = {
  default: {
    container: "bg-[#0d121c] border-zinc-700/90 text-zinc-200 shadow-[0_4px_24px_rgba(0,0,0,0.85),0_0_14px_rgba(157,97,255,0.15)]",
    arrow: "border-zinc-700/90 bg-[#0d121c]",
  },
  amber: {
    container: "bg-[#121620] border-[#9D61FF]/60 text-purple-200 shadow-[0_0_20px_rgba(157,97,255,0.35)]",
    arrow: "border-[#9D61FF]/60 bg-[#121620]",
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
 * Displays an illuminated, accessible popover that follows the mouse cursor while hovering over the trigger element,
 * automatically portaled to document.body to prevent parent container overflow clipping or scrollbar generation.
 */
export default function Tooltip({
  content,
  children,
  position = "top",
  variant = "default",
  delay = 100,
  className = "",
  tooltipClassName = "",
  showArrow = true,
  disabled = false,
  followCursor = true,
  maxWidth = "max-w-xs",
  wrap = true,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activePos, setActivePos] = useState<TooltipPosition>(position);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const triggerRef = useRef<HTMLDivElement | null>(null);
  const mousePosRef = useRef<{ x: number; y: number } | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Compute tooltip coordinates relative to mouse cursor or trigger rect
  const computeCoords = useCallback(
    (clientX?: number, clientY?: number) => {
      // 1. Mouse Cursor Follow Mode
      if (followCursor && clientX !== undefined && clientY !== undefined) {
        let actualPos = position;
        let top = clientY;
        let left = clientX;

        const viewportW = typeof window !== "undefined" ? window.innerWidth : 1200;
        const viewportH = typeof window !== "undefined" ? window.innerHeight : 800;

        if (position === "top") {
          if (clientY < 48) {
            actualPos = "bottom";
            top = clientY + 16;
          } else {
            top = clientY - 12;
          }
          // Clamp horizontally to prevent viewport edge clipping (allow up to 160px margin)
          left = Math.max(160, Math.min(viewportW - 160, clientX));
        } else if (position === "bottom") {
          if (clientY > viewportH - 48) {
            actualPos = "top";
            top = clientY - 12;
          } else {
            top = clientY + 16;
          }
          left = Math.max(160, Math.min(viewportW - 160, clientX));
        } else if (position === "right") {
          if (clientX > viewportW - 150) {
            actualPos = "left";
            left = clientX - 14;
          } else {
            left = clientX + 14;
          }
          top = Math.max(25, Math.min(viewportH - 25, clientY));
        } else if (position === "left") {
          if (clientX < 150) {
            actualPos = "right";
            left = clientX + 14;
          } else {
            left = clientX - 14;
          }
          top = Math.max(25, Math.min(viewportH - 25, clientY));
        }

        setActivePos(actualPos);
        setCoords({ top, left });
        return;
      }

      // 2. Element-Anchored Mode (Keyboard focus or followCursor=false)
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      setActivePos(position);

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
    },
    [followCursor, position]
  );

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (disabled || !content) return;
    mousePosRef.current = { x: e.clientX, y: e.clientY };
    computeCoords(e.clientX, e.clientY);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (mousePosRef.current) {
        computeCoords(mousePosRef.current.x, mousePosRef.current.y);
      }
      setIsVisible(true);
    }, delay);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (disabled || !content || !followCursor) return;
    const clientX = e.clientX;
    const clientY = e.clientY;
    mousePosRef.current = { x: clientX, y: clientY };

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      computeCoords(clientX, clientY);
    });
  };

  const handleMouseLeave = () => {
    mousePosRef.current = null;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setIsVisible(false);
  };

  // Keyboard accessibility
  const handleFocus = () => {
    if (disabled || !content) return;
    computeCoords();
    setIsVisible(true);
  };

  const handleBlur = () => {
    handleMouseLeave();
  };

  // Recalculate or close on window scroll / resize
  useEffect(() => {
    if (!isVisible) return;
    const handleScrollOrResize = () => {
      if (mousePosRef.current) {
        computeCoords(mousePosRef.current.x, mousePosRef.current.y);
      } else {
        computeCoords();
      }
    };
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isVisible, computeCoords]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (disabled || !content) {
    return <>{children}</>;
  }

  const currentVariant = variantStyles[variant] || variantStyles.default;

  // Transform and arrow styles based on active position (including dynamic flips)
  let transformStyle = "translate(-50%, -100%)";
  let arrowClass = "bottom-[-4px] left-1/2 -translate-x-1/2 border-r border-b";

  if (activePos === "bottom") {
    transformStyle = "translate(-50%, 0)";
    arrowClass = "top-[-4px] left-1/2 -translate-x-1/2 border-l border-t";
  } else if (activePos === "right") {
    transformStyle = "translate(0, -50%)";
    arrowClass = "left-[-4px] top-1/2 -translate-y-1/2 border-l border-b";
  } else if (activePos === "left") {
    transformStyle = "translate(-100%, -50%)";
    arrowClass = "right-[-4px] top-1/2 -translate-y-1/2 border-r border-t";
  }

  return (
    <div
      ref={triggerRef}
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
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
              pointerEvents: "none",
              willChange: "top, left",
            }}
            className={`${
              wrap ? `${maxWidth} whitespace-normal break-words leading-relaxed text-start` : "whitespace-nowrap"
            } rounded-xl border px-3 py-1.5 text-[10px] font-mono font-medium tracking-tight backdrop-blur-xl animate-fadeIn ${currentVariant.container} ${tooltipClassName}`}
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


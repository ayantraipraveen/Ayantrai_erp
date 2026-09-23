"use client";

import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
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
  /** Whether tooltip should follow the cursor while hovering inside the trigger element (default: false) */
  followCursor?: boolean;
  /** Maximum width for wrapping long text (e.g. "max-w-xs", "max-w-sm", or custom px) */
  maxWidth?: string;
  /** Whether text should wrap (default: false for short labels, true only for paragraphs) */
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

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Reusable Industrial Tooltip Component.
 * Automatically adjusts position and shifts within viewport boundaries to guarantee
 * 100% on-screen visibility without edge cut-offs or awkward wrapping.
 */
export default function Tooltip({
  content,
  children,
  position = "top",
  variant = "default",
  delay = 80,
  className = "",
  tooltipClassName = "",
  showArrow = true,
  disabled = false,
  followCursor = false,
  maxWidth = "max-w-xs",
  wrap = false,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activePos, setActivePos] = useState<TooltipPosition>(position);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [arrowShift, setArrowShift] = useState(0);

  const triggerRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const mousePosRef = useRef<{ x: number; y: number } | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Compute tooltip coordinates with predictive boundary clamping
  const computeCoords = useCallback(
    (clientX?: number, clientY?: number) => {
      const viewportW = typeof window !== "undefined" ? window.innerWidth : 1200;
      const viewportH = typeof window !== "undefined" ? window.innerHeight : 800;

      // 1. Mouse Cursor Follow Mode (Only if explicitly enabled)
      if (followCursor && clientX !== undefined && clientY !== undefined) {
        let actualPos = position;
        let top = clientY;
        let left = clientX;

        if (position === "top") {
          if (clientY < 48) {
            actualPos = "bottom";
            top = clientY + 16;
          } else {
            top = clientY - 12;
          }
          left = Math.max(24, Math.min(viewportW - 24, clientX));
        } else if (position === "bottom") {
          if (clientY > viewportH - 48) {
            actualPos = "top";
            top = clientY - 12;
          } else {
            top = clientY + 16;
          }
          left = Math.max(24, Math.min(viewportW - 24, clientX));
        } else if (position === "right") {
          if (clientX > viewportW - 80) {
            actualPos = "left";
            left = clientX - 14;
          } else {
            left = clientX + 14;
          }
          top = Math.max(20, Math.min(viewportH - 20, clientY));
        } else if (position === "left") {
          if (clientX < 80) {
            actualPos = "right";
            left = clientX + 14;
          } else {
            left = clientX - 14;
          }
          top = Math.max(20, Math.min(viewportH - 20, clientY));
        }

        setActivePos(actualPos);
        setCoords({ top, left });
        setArrowShift(0);
        return;
      }

      // 2. Element-Anchored Mode (Standard for buttons & interactive elements)
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      let actualPos = position;
      let top = 0;
      const targetCenterX = rect.left + rect.width / 2;

      // Predictive width estimation based on character length
      const textLen = typeof content === "string" ? content.length : 16;
      const estimatedWidth = Math.min(260, Math.max(80, textLen * 8.5 + 28));
      const halfW = estimatedWidth / 2;
      const screenPadding = 14;

      // Vertical position & boundary flip detection
      if (position === "top") {
        if (rect.top < 44) {
          actualPos = "bottom";
          top = rect.bottom + 8;
        } else {
          top = rect.top - 8;
        }
      } else if (position === "bottom") {
        if (rect.bottom > viewportH - 44) {
          actualPos = "top";
          top = rect.top - 8;
        } else {
          top = rect.bottom + 8;
        }
      } else if (position === "right") {
        if (rect.right + estimatedWidth > viewportW - screenPadding) {
          actualPos = "left";
          top = rect.top + rect.height / 2;
        } else {
          top = rect.top + rect.height / 2;
        }
      } else if (position === "left") {
        if (rect.left - estimatedWidth < screenPadding) {
          actualPos = "right";
          top = rect.top + rect.height / 2;
        } else {
          top = rect.top + rect.height / 2;
        }
      }

      // Horizontal position & boundary clamping for top/bottom
      let left = targetCenterX;
      let shift = 0;

      if (actualPos === "top" || actualPos === "bottom") {
        const minCenter = halfW + screenPadding;
        const maxCenter = viewportW - halfW - screenPadding;

        if (targetCenterX > maxCenter) {
          left = maxCenter;
          shift = targetCenterX - maxCenter;
        } else if (targetCenterX < minCenter) {
          left = minCenter;
          shift = targetCenterX - minCenter;
        } else {
          left = targetCenterX;
          shift = 0;
        }
      } else if (actualPos === "right") {
        left = rect.right + 8;
        shift = 0;
      } else if (actualPos === "left") {
        left = rect.left - 8;
        shift = 0;
      }

      setActivePos(actualPos);
      setCoords({ top, left });
      setArrowShift(shift);
    },
    [content, followCursor, position]
  );

  // Synchronous Layer 2 Adjustment: Measures the actual DOM node and enforces strict viewport containment
  useIsomorphicLayoutEffect(() => {
    if (!isVisible || !tooltipRef.current || !triggerRef.current) return;
    const bubbleRect = tooltipRef.current.getBoundingClientRect();
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    const padding = 12;

    let deltaX = 0;
    let deltaY = 0;
    let newPos = activePos;

    // Check right screen boundary overflow
    if (bubbleRect.right > viewportW - padding) {
      deltaX = bubbleRect.right - (viewportW - padding);
    }
    // Check left screen boundary overflow
    else if (bubbleRect.left < padding) {
      deltaX = bubbleRect.left - padding;
    }

    // Check top boundary overflow for "top" -> flip to "bottom"
    if (activePos === "top" && bubbleRect.top < padding) {
      newPos = "bottom";
      deltaY = (triggerRect.bottom + 8) - coords.top;
    }
    // Check bottom boundary overflow for "bottom" -> flip to "top"
    else if (activePos === "bottom" && bubbleRect.bottom > viewportH - padding) {
      newPos = "top";
      deltaY = (triggerRect.top - 8) - coords.top;
    }

    if (Math.abs(deltaX) > 0.5 || Math.abs(deltaY) > 0.5 || newPos !== activePos) {
      setCoords((prev) => ({
        top: prev.top + deltaY,
        left: prev.left - deltaX,
      }));
      setArrowShift((prev) => prev + deltaX);
      if (newPos !== activePos) {
        setActivePos(newPos);
      }
    }
  }, [isVisible, coords.top, coords.left, activePos]);

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
    setArrowShift(0);
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

  // Automatically dismiss tooltip when window loses focus or cursor exits browser
  useEffect(() => {
    const handleDismiss = () => {
      setIsVisible(false);
      setArrowShift(0);
    };

    const handleMouseLeaveDoc = (e: MouseEvent) => {
      if (!e.relatedTarget) {
        handleDismiss();
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleDismiss();
      }
    };

    window.addEventListener("blur", handleDismiss);
    window.addEventListener("focus", handleDismiss);
    window.addEventListener("mouseout", handleMouseLeaveDoc);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.documentElement.addEventListener("mouseleave", handleMouseLeaveDoc);

    return () => {
      window.removeEventListener("blur", handleDismiss);
      window.removeEventListener("focus", handleDismiss);
      window.removeEventListener("mouseout", handleMouseLeaveDoc);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.documentElement.removeEventListener("mouseleave", handleMouseLeaveDoc);
    };
  }, []);

  // Update positioning when user scrolls or resizes window
  useEffect(() => {
    if (!isVisible) return;
    const handleScrollOrResize = () => {
      if (mousePosRef.current && followCursor) {
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
  }, [isVisible, computeCoords, followCursor]);

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

  // Safe arrow shift clamp to keep arrow within bubble rounded corners
  const bubbleWidth = tooltipRef.current?.offsetWidth || 100;
  const maxSafeArrowShift = Math.max(0, bubbleWidth / 2 - 12);
  const clampedArrowShift = Math.max(-maxSafeArrowShift, Math.min(maxSafeArrowShift, arrowShift));

  // Determine if text should wrap (crisp nowrap for actions <= 60 chars)
  const shouldWrap =
    typeof content === "string" ? content.length > 60 && wrap : Boolean(wrap && typeof content !== "string");

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
            ref={tooltipRef}
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
              shouldWrap
                ? `${maxWidth} whitespace-normal break-words leading-relaxed text-start`
                : "whitespace-nowrap"
            } rounded-xl border px-3 py-1.5 text-[10px] font-mono font-medium tracking-tight backdrop-blur-xl animate-fadeIn ${currentVariant.container} ${tooltipClassName}`}
          >
            {content}

            {/* Directional Arrow (Locked to button center, clamped inside bubble) */}
            {showArrow && (
              <span
                style={
                  activePos === "top" || activePos === "bottom"
                    ? { left: `calc(50% + ${clampedArrowShift}px)` }
                    : undefined
                }
                className={`absolute h-1.5 w-1.5 rotate-45 pointer-events-none ${arrowClass} ${currentVariant.arrow}`}
              />
            )}
          </div>,
          document.body
        )}
    </div>
  );
}

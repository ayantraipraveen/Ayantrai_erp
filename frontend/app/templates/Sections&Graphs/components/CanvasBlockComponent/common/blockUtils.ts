import React, { useState, useEffect, useRef, useCallback } from "react";
import { CanvasCell } from "@/lib/redux/slices/reportModuleSlice";

// ── Dynamic Top Action Bar Positioning Helper ─────────────────────────────────
export function calculateTopBarPosition(rect: DOMRect | null): { top: number; left: number } | null {
  if (!rect) return null;
  const viewportW = typeof window !== "undefined" ? window.innerWidth : 1200;
  const viewportH = typeof window !== "undefined" ? window.innerHeight : 900;
  const topNavbarHeight = 72; // Safe area below header navigation and breadcrumbs

  // If the target element is completely scrolled out of the viewport, do NOT render the floating action bar
  if (rect.bottom < topNavbarHeight + 10 || rect.top > viewportH - 20) {
    return null;
  }

  // Normal position: 74px above top edge of card (giving clean 8px-10px air clearance above the rotation stem & knob)
  let top = rect.top - 74;
  // If placing it 74px above would clip under or collide with top navbar (<= 72px):
  if (top < topNavbarHeight) {
    // Dock safely below the card and bottom stamp toolbar (which sits at rect.bottom + 36px)
    top = Math.max(topNavbarHeight + 6, rect.bottom + 42);
    if (top > viewportH - 50) {
      top = rect.top + 8;
    }
  }

  // Center horizontally over card, bounded within viewport margins
  const halfBarWidth = 160;
  const left = Math.max(halfBarWidth + 16, Math.min(viewportW - halfBarWidth - 16, rect.left + rect.width / 2));

  return { top: Math.round(top), left: Math.round(left) };
}

// ── Dynamic Floating Popover Positioning Helper ──────────────────────────────
export function calculateFloatingPosition(
  targetRect: DOMRect | null,
  popoverWidth = 485,
  popoverHeight = 390,
  preferredSide: "right" | "left" | "top" | "bottom" = "right"
): { top: number; left: number; placement: "right" | "left" | "top" | "bottom" } {
  const margin = 14;
  const topNavbarHeight = 72; // Never overlap top navigation header
  const viewportW = typeof window !== "undefined" ? window.innerWidth : 1200;
  const viewportH = typeof window !== "undefined" ? window.innerHeight : 900;

  if (!targetRect) {
    return {
      top: topNavbarHeight + 10,
      left: Math.max(margin, viewportW - popoverWidth - margin),
      placement: "right",
    };
  }

  const spaceOnRight = viewportW - (targetRect.right + margin);
  const spaceOnLeft = targetRect.left - margin;
  const spaceAbove = targetRect.top - topNavbarHeight - margin;
  const spaceBelow = viewportH - (targetRect.bottom + margin);

  let placement: "right" | "left" | "top" | "bottom" = preferredSide;
  let left = targetRect.right + margin;
  let top = targetRect.top;

  if (preferredSide === "right") {
    if (spaceOnRight >= popoverWidth) {
      placement = "right";
      left = targetRect.right + margin;
      top = Math.max(topNavbarHeight, Math.min(targetRect.top, viewportH - popoverHeight - margin));
    } else if (spaceOnLeft >= popoverWidth) {
      placement = "left";
      left = targetRect.left - popoverWidth - margin;
      top = Math.max(topNavbarHeight, Math.min(targetRect.top, viewportH - popoverHeight - margin));
    } else if (spaceAbove >= popoverHeight) {
      placement = "top";
      left = Math.max(margin, Math.min(targetRect.left, viewportW - popoverWidth - margin));
      top = targetRect.top - popoverHeight - margin;
    } else if (spaceBelow >= popoverHeight) {
      placement = "bottom";
      left = Math.max(margin, Math.min(targetRect.left, viewportW - popoverWidth - margin));
      top = targetRect.bottom + margin;
    } else {
      // Pick whichever side has more space
      if (spaceOnRight >= spaceOnLeft) {
        placement = "right";
        left = Math.max(margin, viewportW - popoverWidth - margin);
      } else {
        placement = "left";
        left = margin;
      }
      top = Math.max(topNavbarHeight, Math.min(targetRect.top, viewportH - popoverHeight - margin));
    }
  }

  // Strict boundary protection: ALWAYS fully inside viewport
  left = Math.max(margin, Math.min(left, viewportW - popoverWidth - margin));
  top = Math.max(topNavbarHeight, Math.min(top, viewportH - popoverHeight - margin));

  return { top: Math.round(top), left: Math.round(left), placement };
}

// ── Hook: Draggable Floating Popover Engine ──────────────────────────────────
export function useDraggableFloatingPopover({
  anchorRect,
  isOpen,
  popoverWidth = 485,
  popoverHeight = 390,
  preferredSide = "right",
}: {
  anchorRect: DOMRect | null;
  isOpen: boolean;
  popoverWidth?: number;
  popoverHeight?: number;
  preferredSide?: "right" | "left" | "top" | "bottom";
}) {
  const defaultPos = calculateFloatingPosition(anchorRect, popoverWidth, popoverHeight, preferredSide);
  const [customPos, setCustomPos] = useState<{ top: number; left: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    origTop: number;
    origLeft: number;
  } | null>(null);

  // Reset custom position when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCustomPos(null);
    }
  }, [isOpen]);

  // Clean up any remaining document drag styles if component unmounts mid-drag
  useEffect(() => {
    return () => {
      if (typeof document !== "undefined") {
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };
  }, []);

  const currentPos = customPos || defaultPos;
  const clampedPos = {
    top: Math.max(72, Math.min(currentPos.top, typeof window !== "undefined" ? window.innerHeight - 80 : 800)),
    left: Math.max(10, Math.min(currentPos.left, typeof window !== "undefined" ? window.innerWidth - popoverWidth - 10 : 800)),
  };

  const resetPosition = useCallback(() => {
    setCustomPos(null);
  }, []);

  const handleHeaderMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      const target = e.target as HTMLElement;
      if (target.closest("button") || target.closest("input") || target.closest("select") || target.closest("a")) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      const activeTop = customPos ? customPos.top : defaultPos.top;
      const activeLeft = customPos ? customPos.left : defaultPos.left;

      dragStartRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        origTop: activeTop,
        origLeft: activeLeft,
      };
      setIsDragging(true);

      const origCursor = document.body.style.cursor;
      const origUserSelect = document.body.style.userSelect;
      document.body.style.cursor = "grabbing";
      document.body.style.userSelect = "none";

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!dragStartRef.current) return;
        const dx = moveEvent.clientX - dragStartRef.current.startX;
        const dy = moveEvent.clientY - dragStartRef.current.startY;

        const topNavbarHeight = 72;
        const margin = 10;
        const maxLeft = Math.max(margin, window.innerWidth - popoverWidth - margin);
        const maxTop = Math.max(topNavbarHeight, window.innerHeight - 80);

        const nextLeft = Math.max(margin, Math.min(dragStartRef.current.origLeft + dx, maxLeft));
        const nextTop = Math.max(topNavbarHeight, Math.min(dragStartRef.current.origTop + dy, maxTop));

        setCustomPos({
          top: Math.round(nextTop),
          left: Math.round(nextLeft),
        });
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        dragStartRef.current = null;
        document.body.style.cursor = origCursor;
        document.body.style.userSelect = origUserSelect;
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [customPos, defaultPos.left, defaultPos.top, popoverWidth]
  );

  return {
    pos: clampedPos,
    isCustomPos: Boolean(customPos),
    isDragging,
    resetPosition,
    handleHeaderMouseDown,
  };
}

// ── Helper to resolve CanvasCellStyle overrides ──────────────────────────────
export function getCellStyleClasses(style?: CanvasCell["style"]): {
  fontClass: string;
  fontSizeClass: string;
  alignClass: string;
  bgClass: string;
  textColorClass: string;
  styleProps: React.CSSProperties;
} {
  if (!style) return { fontClass: "", fontSizeClass: "", alignClass: "", bgClass: "", textColorClass: "", styleProps: {} };

  const fontClass =
    style.fontFamily === "serif"
      ? "font-serif"
      : style.fontFamily === "mono"
        ? "font-mono"
        : style.fontFamily === "rounded"
          ? "font-sans tracking-wide"
          : "font-sans";

  const fontSizeClass =
    style.fontSize === "xs"
      ? "text-xs"
      : style.fontSize === "sm"
        ? "text-sm"
        : style.fontSize === "lg"
          ? "text-lg"
          : style.fontSize === "xl"
            ? "text-xl"
            : "";

  const alignClass =
    style.textAlign === "center"
      ? "text-center"
      : style.textAlign === "right"
        ? "text-right"
        : "";
  const styleProps: React.CSSProperties = {};
  let bgClass = "";
  if (style.cardBg === "white") {
    bgClass = "[&>div]:bg-white dark:[&>div]:bg-[#0c1017] [&>div]:border-slate-200 dark:[&>div]:border-zinc-800";
  } else if (style.cardBg === "slate") {
    bgClass = "[&>div]:bg-slate-50 dark:[&>div]:bg-zinc-900 [&>div]:border-slate-300 dark:[&>div]:border-zinc-700";
  } else if (style.cardBg === "glass") {
    bgClass = "[&>div]:bg-white/75 dark:[&>div]:bg-zinc-900/75 [&>div]:backdrop-blur-md [&>div]:border-white/60 dark:[&>div]:border-zinc-700/60";
  } else if (style.cardBg === "purple") {
    bgClass = "[&>div]:bg-purple-50/80 dark:[&>div]:bg-purple-950/30 [&>div]:border-purple-200 dark:[&>div]:border-purple-800/40";
  } else if (style.cardBg === "indigo") {
    bgClass = "[&>div]:bg-indigo-50/80 dark:[&>div]:bg-indigo-950/30 [&>div]:border-indigo-200 dark:[&>div]:border-indigo-800/40";
  } else if (style.cardBg === "emerald") {
    bgClass = "[&>div]:bg-emerald-50/80 dark:[&>div]:bg-emerald-950/30 [&>div]:border-emerald-200 dark:[&>div]:border-emerald-800/40";
  } else if (style.cardBg === "amber") {
    bgClass = "[&>div]:bg-amber-50/80 dark:[&>div]:bg-amber-950/30 [&>div]:border-amber-200 dark:[&>div]:border-amber-800/40";
  } else if (style.cardBg === "rose") {
    bgClass = "[&>div]:bg-rose-50/80 dark:[&>div]:bg-rose-950/30 [&>div]:border-rose-200 dark:[&>div]:border-rose-800/40";
  } else if (style.cardBg === "dark") {
    bgClass = "[&>div]:bg-[#0f172a] [&>div]:text-white [&>div]:border-slate-700";
  } else if (style.cardBg?.startsWith("#") || style.cardBg?.startsWith("rgb")) {
    bgClass = "[&>div]:[background-color:inherit] [&>div]:border-slate-300/80 dark:[&>div]:border-zinc-700/80";
    styleProps.backgroundColor = style.cardBg;
  }

  if (style.borderColor) {
    if (style.borderColor === "none" || style.borderColor === "transparent") {
      styleProps.borderColor = "transparent";
      styleProps.borderWidth = "0px";
    } else {
      styleProps.borderColor = style.borderColor;
      styleProps.borderWidth = style.borderWidth !== undefined ? `${style.borderWidth}px` : "1px";
    }
  }
  if (style.borderStyle) {
    styleProps.borderStyle = style.borderStyle;
  }
  if (style.borderWidth !== undefined) {
    styleProps.borderWidth = `${style.borderWidth}px`;
    if (style.borderWidth === 0) {
      styleProps.borderStyle = "none";
    }
  }

  if (style.borderRadius !== undefined) {
    if (typeof style.borderRadius === "number") {
      styleProps.borderRadius = `${style.borderRadius}px`;
    } else {
      const RADIUS_MAP: Record<string, string> = {
        none: "0px",
        sm: "6px",
        md: "10px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
        full: "9999px",
      };
      styleProps.borderRadius = RADIUS_MAP[style.borderRadius] || style.borderRadius;
    }
  }

  if (style.shadow) {
    styleProps.boxShadow = "none";
  }

  // Dynamic Inner Padding
  if (style.padding !== undefined) {
    styleProps.padding = `${style.padding}px`;
  } else {
    if (style.paddingTop !== undefined) styleProps.paddingTop = `${style.paddingTop}px`;
    if (style.paddingBottom !== undefined) styleProps.paddingBottom = `${style.paddingBottom}px`;
    if (style.paddingLeft !== undefined) styleProps.paddingLeft = `${style.paddingLeft}px`;
    if (style.paddingRight !== undefined) styleProps.paddingRight = `${style.paddingRight}px`;
  }

  // Dynamic Outer Margin
  if (style.margin !== undefined) {
    styleProps.margin = `${style.margin}px`;
  } else {
    if (style.marginTop !== undefined) styleProps.marginTop = `${style.marginTop}px`;
    if (style.marginBottom !== undefined) styleProps.marginBottom = `${style.marginBottom}px`;
    if (style.marginLeft !== undefined) styleProps.marginLeft = `${style.marginLeft}px`;
    if (style.marginRight !== undefined) styleProps.marginRight = `${style.marginRight}px`;
  }

  let textColorClass = "";
  if (style.textColor) {
    styleProps.color = style.textColor;
    textColorClass = "[&_p]:!text-[inherit] [&_span]:!text-[inherit] [&_h1]:!text-[inherit] [&_h2]:!text-[inherit] [&_h3]:!text-[inherit] [&_h4]:!text-[inherit]";
  }

  return { fontClass, fontSizeClass, alignClass, bgClass, textColorClass, styleProps };
}

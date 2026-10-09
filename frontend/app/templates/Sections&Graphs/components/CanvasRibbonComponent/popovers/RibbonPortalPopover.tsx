"use client";

import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { createPortal } from "react-dom";

export interface RibbonPortalPopoverProps {
  anchorEl: HTMLElement | null;
  isOpen: boolean;
  onClose: () => void;
  align?: "left" | "right" | "center";
  offset?: number;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export function RibbonPortalPopover({
  anchorEl,
  isOpen,
  onClose,
  align = "left",
  offset = 6,
  className = "",
  style,
  children,
}: RibbonPortalPopoverProps) {
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updateCoords = useCallback(() => {
    if (!anchorEl) return;
    const rect = anchorEl.getBoundingClientRect();
    const popoverW = popoverRef.current?.offsetWidth || 320;
    const popoverH = popoverRef.current?.offsetHeight || 300;

    let top = rect.bottom + offset;
    let left = rect.left;

    if (align === "right") {
      left = rect.right - popoverW;
    } else if (align === "center") {
      left = rect.left + rect.width / 2 - popoverW / 2;
    }

    // Viewport bounds clamping
    if (left + popoverW > window.innerWidth - 12) {
      left = Math.max(12, window.innerWidth - popoverW - 12);
    }
    if (left < 12) left = 12;

    // Flip above if overflowing bottom
    if (top + popoverH > window.innerHeight - 12 && rect.top > popoverH + 12) {
      top = rect.top - popoverH - offset;
    }

    // Clamp top to viewport bounds
    if (top + popoverH > window.innerHeight - 12) {
      top = Math.max(12, window.innerHeight - popoverH - 12);
    }
    if (top < 12) top = 12;

    setCoords({ top, left });
  }, [anchorEl, align, offset]);

  useLayoutEffect(() => {
    if (isOpen && anchorEl) {
      updateCoords();
    }
  }, [isOpen, anchorEl, updateCoords, children]);

  useEffect(() => {
    if (!isOpen || !anchorEl) {
      setCoords(null);
      return;
    }
    updateCoords();

    // Remeasure dynamically when popover element mounts or its measured size changes
    let observer: ResizeObserver | null = null;
    if (popoverRef.current && typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => {
        updateCoords();
      });
      observer.observe(popoverRef.current);
    }

    const handleScrollOrResize = () => updateCoords();
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    return () => {
      observer?.disconnect();
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen, anchorEl, updateCoords]);

  // Dismiss on clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (popoverRef.current?.contains(target) || anchorEl?.contains(target)) {
        return;
      }
      onClose();
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen, anchorEl, onClose]);

  if (!isOpen || !mounted || !coords || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      ref={popoverRef}
      style={{
        position: "fixed",
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        zIndex: 99999,
        ...style,
      }}
      className={`portal-ribbon-popover ${className}`}
    >
      {children}
    </div>,
    document.body
  );
}

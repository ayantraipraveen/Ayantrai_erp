import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { GripHorizontal, RotateCcw, X } from "lucide-react";
import { useDraggableFloatingPopover } from "../common/blockUtils";

export interface DraggablePopoverShellProps {
  isOpen: boolean;
  anchorRect: DOMRect | null;
  onClose: () => void;
  title: string;
  subtitle?: string;
  headerIcon?: React.ReactNode;
  width?: number;
  height?: number;
  popoverClassName?: string;
  ignoreClickSelectors?: string[];
  pinnedSubHeader?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export function DraggablePopoverShell({
  isOpen,
  anchorRect,
  onClose,
  title,
  subtitle = "Live editing • Direct canvas effect",
  headerIcon,
  width = 485,
  height = 390,
  popoverClassName = "",
  ignoreClickSelectors = [],
  pinnedSubHeader,
  footer,
  children,
}: DraggablePopoverShellProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  const { pos, isCustomPos, isDragging, resetPosition, handleHeaderMouseDown } =
    useDraggableFloatingPopover({ anchorRect, isOpen, popoverWidth: width, popoverHeight: height });

  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (popoverRef.current?.contains(target)) return;
      for (const selector of ignoreClickSelectors) {
        if (target.closest(selector)) return;
      }
      onClose();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, ignoreClickSelectors]);

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={popoverRef}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        position: "fixed",
        top: `${pos.top}px`,
        left: `${pos.left}px`,
        width: `${width}px`,
        maxWidth: "calc(100vw - 20px)",
        maxHeight: "calc(100vh - 84px)",
        zIndex: 99999,
      }}
      className={`flex flex-col bg-white/98 dark:bg-[#0c1017]/98 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl backdrop-blur-md text-xs select-none pointer-events-auto overflow-hidden animate-in fade-in zoom-in-95 duration-100 ${
        isDragging ? "ring-2 ring-[#9D61FF] shadow-purple-500/25" : ""
      } ${popoverClassName}`}
    >
      {/* Header (Pinned & Draggable) */}
      <div
        onMouseDown={handleHeaderMouseDown}
        onDoubleClick={isCustomPos ? resetPosition : undefined}
        className="shrink-0 flex items-center justify-between px-3 py-1.5 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/70 cursor-grab active:cursor-grabbing select-none"
        title="Drag header to reposition • Double-click to snap back"
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="flex items-center justify-center p-0.5 rounded text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors">
            <GripHorizontal className="w-3.5 h-3.5" />
          </div>
          {headerIcon && (
            <div className="w-5 h-5 rounded-md bg-[#9D61FF]/15 text-[#9D61FF] flex items-center justify-center font-bold text-xs shrink-0">
              {headerIcon}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-[11px] font-bold leading-tight truncate text-slate-900 dark:text-white">
                {title}
              </h3>
              {isCustomPos && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-purple-100 dark:bg-purple-900/50 text-[8px] font-bold text-[#9D61FF] shrink-0 border border-purple-200 dark:border-purple-800/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9D61FF] animate-pulse" />
                  <span>Floating</span>
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-[8.5px] text-slate-500 dark:text-zinc-400 truncate leading-none mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {isCustomPos && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                resetPosition();
              }}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-[9px] text-[#9D61FF] font-bold border border-purple-200 dark:border-purple-800 hover:bg-[#9D61FF] hover:text-white cursor-pointer transition-all shadow-xs"
              title="Snap back to anchored position beside card"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>Snap</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-200/50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
            title="Close inspector"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Pinned SubHeader (e.g. badge switcher, tabs) */}
      {pinnedSubHeader}

      {/* Scrollable Content Body */}
      <div className="flex-1 overflow-y-auto px-3 py-1.5 space-y-1.5 text-xs [scrollbar-width:thin] [scrollbar-color:rgba(157,97,255,0.3)_transparent]">
        {children}
      </div>

      {/* Footer */}
      {footer}
    </div>,
    document.body
  );
}

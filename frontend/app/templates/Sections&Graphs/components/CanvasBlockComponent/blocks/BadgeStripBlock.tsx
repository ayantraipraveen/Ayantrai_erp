import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Pencil, SlidersHorizontal, Plus, Trash2 } from "lucide-react";
import { CanvasCell, CanvasBadgeItem, CanvasBadgeStrip } from "@/lib/redux/slices/reportModuleSlice";
import { calculateTopBarPosition } from "../common/blockUtils";
import { SingleBadgeItemView } from "./SingleBadgeItemView";
import { BadgeStripInspectorPopover } from "../inspectors/BadgeStripInspectorPopover";

export interface BadgeStripBlockProps {
  cell: CanvasCell;
  isSelected?: boolean;
  isPreview?: boolean;
  onUpdateBadgeStrip?: (strip: CanvasBadgeStrip) => void;
  onUpdateSingleBadge?: (badgeId: string, patch: Partial<CanvasBadgeItem>) => void;
  onAddBadge?: () => void;
  onDeleteBadge?: (badgeId: string) => void;
}

export function BadgeStripBlock({
  cell,
  isSelected,
  isPreview,
  onUpdateBadgeStrip,
  onUpdateSingleBadge,
  onAddBadge,
  onDeleteBadge,
}: BadgeStripBlockProps) {
  const strip = cell.badgeStrip;
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedBadgeId, setSelectedBadgeId] = useState<string | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [inspectorTab, setInspectorTab] = useState<"badge" | "layout">("badge");
  const [portalCoords, setPortalCoords] = useState<{ top: number; left: number } | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  if (!strip || !strip.badges) return null;

  const isCompact =
    (cell.customWidth !== undefined && cell.customWidth <= 60) ||
    (cell.colSpan !== undefined && cell.colSpan <= 2);

  const isTransparent = Boolean(strip.isTransparent);

  const containerStyle: React.CSSProperties = {
    padding: strip.padding !== undefined ? `${strip.padding}px` : undefined,
    borderRadius: strip.borderRadius !== undefined ? `${strip.borderRadius}px` : undefined,
    borderWidth: strip.borderWidth !== undefined ? `${strip.borderWidth}px` : undefined,
    borderColor: strip.borderColor || undefined,
    backgroundColor: isTransparent ? "transparent" : (strip.backgroundColor || undefined),
    width: "100%",
    height: "100%",
    minHeight: 0,
  };

  const colCount = strip.columns || (isCompact ? 2 : (strip.badges.length >= 4 ? 4 : strip.badges.length || 2));

  const hasAnyCustomHeight = strip.badges.some((b) => Boolean(b.customHeight));

  const gridStyle: React.CSSProperties = {
    gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))`,
    gridAutoRows: hasAnyCustomHeight ? "minmax(min-content, 1fr)" : "1fr",
    gap: strip.gap !== undefined ? `${strip.gap}px` : "12px",
    width: "100%",
    height: "100%",
    minHeight: 0,
    alignItems: "stretch",
  };

  useEffect(() => {
    if (isSelected && strip.badges.length > 0 && !selectedBadgeId) {
      setSelectedBadgeId(strip.badges[0].id);
    }
  }, [isSelected, strip, selectedBadgeId]);

  useEffect(() => {
    if (!isSelected) {
      setIsInspectorOpen(false);
    }
  }, [isSelected]);

  const updatePortalPos = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setAnchorRect(rect);
    setPortalCoords(calculateTopBarPosition(rect));
  }, []);

  useEffect(() => {
    if (isSelected && !isPreview) {
      updatePortalPos();
      const interval = setInterval(updatePortalPos, 400);
      window.addEventListener("scroll", updatePortalPos, true);
      window.addEventListener("resize", updatePortalPos);
      return () => {
        clearInterval(interval);
        window.removeEventListener("scroll", updatePortalPos, true);
        window.removeEventListener("resize", updatePortalPos);
      };
    }
  }, [isSelected, isPreview, updatePortalPos]);

  const activeBadge = strip.badges.find((b) => b.id === selectedBadgeId) || strip.badges[0];
  const activeBadgeIdx = strip.badges.findIndex((b) => b.id === (activeBadge?.id || selectedBadgeId));

  const handleAddDefaultBadge = () => {
    if (onAddBadge) {
      onAddBadge();
    } else if (onUpdateBadgeStrip) {
      const colors: Array<"blue" | "green" | "purple" | "amber" | "rose" | "cyan"> = [
        "blue", "green", "purple", "amber", "rose", "cyan"
      ];
      const newId = `badge-${Date.now()}`;
      const newBadge: CanvasBadgeItem = {
        id: newId,
        label: "New KPI",
        value: "100%",
        color: colors[strip.badges.length % colors.length],
        icon: "Shield",
      };
      const updated = {
        ...strip,
        badges: [...strip.badges, newBadge],
      };
      onUpdateBadgeStrip(updated);
      setSelectedBadgeId(newId);
    }
  };

  const handleDeleteActiveBadge = (badgeId: string) => {
    if (onDeleteBadge) {
      onDeleteBadge(badgeId);
    } else if (onUpdateBadgeStrip) {
      const updated = {
        ...strip,
        badges: strip.badges.filter((b) => b.id !== badgeId),
      };
      onUpdateBadgeStrip(updated);
      setSelectedBadgeId(updated.badges[0]?.id || null);
    }
  };

  return (
    <>
      <div
        ref={containerRef}
        style={containerStyle}
        className={`w-full h-full flex flex-col justify-between transition-all group/badge-strip relative ${
          isTransparent
            ? "bg-transparent border-0 shadow-none p-1"
            : "rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] p-3.5"
        }`}
      >
        <div
          style={gridStyle}
          className="grid items-stretch w-full h-full flex-1 min-h-0"
        >
          {strip.badges.map((badge: CanvasBadgeItem) => (
            <div
              key={badge.id}
              className="flex min-h-0 min-w-0"
              style={{
                width: "100%",
                height: badge.customHeight ? "auto" : "100%",
                minHeight: badge.customHeight ? `${badge.customHeight}px` : undefined,
                justifyContent: badge.customWidth ? "center" : "stretch",
                alignItems: "stretch",
              }}
            >
              <SingleBadgeItemView
                badge={badge}
                isInsideSelected={Boolean(isSelected && (selectedBadgeId === badge.id || (!selectedBadgeId && strip.badges[0]?.id === badge.id)))}
                onSelect={() => setSelectedBadgeId(badge.id)}
                onOpenInspector={() => {
                  setSelectedBadgeId(badge.id);
                  setInspectorTab("badge");
                  setIsInspectorOpen(true);
                }}
                isPreview={isPreview}
                onUpdateBadge={(patch) => {
                  if (onUpdateSingleBadge) {
                    onUpdateSingleBadge(badge.id, patch);
                  } else if (onUpdateBadgeStrip) {
                    const updated = {
                      ...strip,
                      badges: strip.badges.map((b) => (b.id === badge.id ? { ...b, ...patch } : b)),
                    };
                    onUpdateBadgeStrip(updated);
                  }
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── React Portal: Top Action Bar for Badge Strip ── */}
      {isSelected && !isPreview && portalCoords && typeof document !== "undefined" &&
        createPortal(
          <div
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              top: `${portalCoords.top}px`,
              left: `${portalCoords.left}px`,
              transform: "translateX(-50%)",
              zIndex: 99999,
            }}
            className="portal-strip-top-actions flex items-center gap-1.5 bg-white/98 dark:bg-[#0c1017]/98 border border-slate-200 dark:border-zinc-800 rounded-full px-2.5 py-1 shadow-2xl backdrop-blur-md text-xs select-none pointer-events-auto whitespace-nowrap animate-in fade-in zoom-in-95 duration-100"
          >
            <span className="text-[10px] font-mono font-bold text-[#9D61FF] px-2 py-0.5 rounded-full bg-[#9D61FF]/10">
              {activeBadge ? `Card #${activeBadgeIdx + 1}: ${activeBadge.label || activeBadge.value}` : `Strip • ${strip.badges.length}`}
            </span>

            {/* Edit Selected Card Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (isInspectorOpen && inspectorTab === "badge") {
                  setIsInspectorOpen(false);
                } else {
                  setInspectorTab("badge");
                  setIsInspectorOpen(true);
                }
              }}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold transition-all cursor-pointer ${
                isInspectorOpen && inspectorTab === "badge"
                  ? "bg-[#9D61FF] text-white shadow-xs"
                  : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
              }`}
              title="Toggle Live Card Inspector (React Portal)"
            >
              <Pencil className="w-2.5 h-2.5" />
              <span>Edit Card</span>
            </button>

            {/* Layout Settings */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (isInspectorOpen && inspectorTab === "layout") {
                  setIsInspectorOpen(false);
                } else {
                  setInspectorTab("layout");
                  setIsInspectorOpen(true);
                }
              }}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold transition-all cursor-pointer ${
                isInspectorOpen && inspectorTab === "layout"
                  ? "bg-[#9D61FF] text-white shadow-xs"
                  : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
              }`}
              title="Configure Grid Columns, Gap, Padding, & Container"
            >
              <SlidersHorizontal className="w-2.5 h-2.5" />
              <span>Layout</span>
            </button>

            <div className="w-px h-3.5 bg-slate-200 dark:bg-zinc-800 mx-0.5" />

            {/* Add Badge Button */}
            {strip.badges.length < 6 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddDefaultBadge();
                }}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-slate-700 dark:text-zinc-200 hover:text-emerald-600 hover:bg-emerald-500/10 font-semibold text-[11px] transition-colors cursor-pointer"
                title="Add Another Metric Card (up to 6)"
              >
                <Plus className="w-3 h-3 text-emerald-600" />
                <span>Add</span>
              </button>
            )}

            {/* Delete Selected Badge */}
            {strip.badges.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (activeBadge) {
                    handleDeleteActiveBadge(activeBadge.id);
                  }
                }}
                className="p-1 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer ml-0.5"
                title="Remove selected metric card"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>,
          document.body
        )
      }

      {/* ── React Portal: Anchored Metric Badge Strip Inspector (Beside Card) ── */}
      {isInspectorOpen && activeBadge && (
        <BadgeStripInspectorPopover
          strip={strip}
          selectedBadgeId={selectedBadgeId || activeBadge.id}
          activeTab={inspectorTab}
          onTabChange={setInspectorTab}
          onSelectBadgeId={(id) => setSelectedBadgeId(id)}
          isOpen={isInspectorOpen}
          anchorRect={anchorRect}
          onClose={() => setIsInspectorOpen(false)}
          onUpdateSingleBadge={(badgeId, patch) => {
            if (onUpdateSingleBadge) {
              onUpdateSingleBadge(badgeId, patch);
            } else if (onUpdateBadgeStrip) {
              const updated = {
                ...strip,
                badges: strip.badges.map((b) => (b.id === badgeId ? { ...b, ...patch } : b)),
              };
              onUpdateBadgeStrip(updated);
            }
          }}
          onUpdateBadgeStrip={(updated) => {
            if (onUpdateBadgeStrip) onUpdateBadgeStrip(updated);
          }}
          onAddBadge={handleAddDefaultBadge}
          onDeleteBadge={handleDeleteActiveBadge}
        />
      )}
    </>
  );
}

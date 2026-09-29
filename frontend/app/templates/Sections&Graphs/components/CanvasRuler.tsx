"use client";

import React, { useState, useMemo } from "react";
import { Ruler, Maximize2, ShieldCheck } from "lucide-react";
import {
  CanvasMarginConfig,
  RulerUnit,
  getUnitConversionFactors,
  formatRulerValue,
} from "../utils";

export type { RulerUnit };

interface CanvasRulerProps {
  pageWidth: number;   // Standard ISO PDF A4: 595px (595 pt)
  pageHeight: number;  // Standard ISO PDF A4: 842px (842 pt)
  marginConfig?: CanvasMarginConfig;
  activeMousePos?: { x: number; y: number } | null;
  selectedBox?: { x: number; y: number; width: number; height: number } | null;
  unit?: RulerUnit;
  onUnitChange?: (u: RulerUnit) => void;
  isDark?: boolean;
}

export function CanvasRuler({
  pageWidth = 595,
  pageHeight = 842,
  marginConfig,
  activeMousePos,
  selectedBox,
  unit = "px",
  onUnitChange,
  isDark = false,
}: CanvasRulerProps) {
  const [internalUnit, setInternalUnit] = useState<RulerUnit>("px");
  const activeUnit = unit || internalUnit;

  const factors = useMemo(() => getUnitConversionFactors(pageWidth), [pageWidth]);
  const { pxPerPt, pxPerMm, pxPerInch } = factors;

  const handleToggleUnit = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextUnit: RulerUnit =
      activeUnit === "px" ? "pt" : activeUnit === "pt" ? "mm" : activeUnit === "mm" ? "in" : "px";
    if (onUnitChange) {
      onUnitChange(nextUnit);
    } else {
      setInternalUnit(nextUnit);
    }
  };

  // Convert pixel value to selected unit display string
  const formatValue = (px: number): string => formatRulerValue(px, activeUnit, factors);

  // Generate tick marks for horizontal ruler (0 to pageWidth)
  const horizontalTicks = useMemo(() => {
    const ticks: Array<{ pos: number; type: "major" | "medium" | "minor"; label?: string }> = [];
    const step =
      activeUnit === "pt"
        ? pxPerPt * 50
        : activeUnit === "mm"
        ? pxPerMm * 10
        : activeUnit === "in"
        ? pxPerInch / 2
        : 50;

    const minorStep =
      activeUnit === "pt"
        ? pxPerPt * 10
        : activeUnit === "mm"
        ? pxPerMm * 2
        : activeUnit === "in"
        ? pxPerInch / 8
        : 10;

    for (let p = 0; p <= pageWidth; p += minorStep) {
      const isMajor = Math.abs(p % step) < 0.5 || p === 0 || Math.abs(p - pageWidth) < 1;
      const isMedium = !isMajor && Math.abs(p % (step / 2)) < 0.5;

      if (isMajor) {
        ticks.push({
          pos: p,
          type: "major",
          label: formatValue(p),
        });
      } else if (isMedium) {
        ticks.push({ pos: p, type: "medium" });
      } else {
        ticks.push({ pos: p, type: "minor" });
      }
    }
    return ticks;
  }, [pageWidth, activeUnit, pxPerPt, pxPerMm, pxPerInch]);

  // Generate tick marks for vertical ruler (0 to pageHeight)
  const verticalTicks = useMemo(() => {
    const ticks: Array<{ pos: number; type: "major" | "medium" | "minor"; label?: string }> = [];
    const step =
      activeUnit === "pt"
        ? pxPerPt * 50
        : activeUnit === "mm"
        ? pxPerMm * 10
        : activeUnit === "in"
        ? pxPerInch / 2
        : 50;

    const minorStep =
      activeUnit === "pt"
        ? pxPerPt * 10
        : activeUnit === "mm"
        ? pxPerMm * 2
        : activeUnit === "in"
        ? pxPerInch / 8
        : 10;

    for (let p = 0; p <= pageHeight; p += minorStep) {
      const isMajor = Math.abs(p % step) < 0.5 || p === 0 || Math.abs(p - pageHeight) < 1;
      const isMedium = !isMajor && Math.abs(p % (step / 2)) < 0.5;

      if (isMajor) {
        ticks.push({
          pos: p,
          type: "major",
          label: formatValue(p),
        });
      } else if (isMedium) {
        ticks.push({ pos: p, type: "medium" });
      } else {
        ticks.push({ pos: p, type: "minor" });
      }
    }
    return ticks;
  }, [pageHeight, activeUnit, pxPerPt, pxPerMm, pxPerInch]);

  const cornerBg = isDark
    ? "bg-[#0b0e14] border-zinc-800 text-zinc-300"
    : "bg-slate-100 border-slate-300 text-slate-700";

  const rulerBg = isDark
    ? "bg-[#0a0d14]/95 border-zinc-800 text-zinc-400"
    : "bg-slate-50/95 border-slate-300 text-slate-500";

  const tickColor = isDark ? "#52525b" : "#94a3b8";
  const majorTickColor = isDark ? "#a1a1aa" : "#475569";
  const textColor = isDark ? "#a1a1aa" : "#475569";

  return (
    <>
      {/* ── Top-Left Corner Origin Tile (Unit Switcher) ── */}
      <div
        onClick={handleToggleUnit}
        className={`absolute -top-6 -left-8 w-8 h-6 flex items-center justify-center border-t border-l border-r border-b ${cornerBg} rounded-tl-lg font-mono text-[9px] font-bold cursor-pointer select-none hover:bg-[#9D61FF] hover:text-white transition-colors z-30 shadow-xs`}
        title={`Click to switch unit (px [Standard PDF: 595×842] → pt → mm [210×297] → in). Current: ${activeUnit.toUpperCase()}`}
      >
        <span className="uppercase">{activeUnit}</span>
      </div>

      {/* ── Horizontal Top Ruler (0 to 794px) ── */}
      <div
        className={`absolute -top-6 left-0 right-0 h-6 border-t border-b border-r ${rulerBg} select-none z-30 overflow-hidden font-mono text-[8.5px] rounded-tr-lg shadow-xs`}
        style={{ width: `${pageWidth}px` }}
      >
        <svg
          width={pageWidth}
          height={24}
          className="w-full h-full block pointer-events-none"
        >
          {/* Ticks and Numbers */}
          {horizontalTicks.map((t, idx) => {
            const h = t.type === "major" ? 12 : t.type === "medium" ? 7 : 4;
            const y1 = 24 - h;
            const y2 = 24;
            const color = t.type === "major" ? majorTickColor : tickColor;

            return (
              <g key={`h-tick-${idx}`}>
                <line
                  x1={t.pos}
                  y1={y1}
                  x2={t.pos}
                  y2={y2}
                  stroke={color}
                  strokeWidth={1}
                />
                {t.type === "major" && t.pos < pageWidth - 20 && (
                  <text
                    x={t.pos + 2}
                    y={11}
                    fill={textColor}
                    fontSize={8}
                    fontFamily="monospace"
                    textAnchor="start"
                  >
                    {t.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Printable Margin Markers on Horizontal Ruler */}
          {marginConfig && (
            <>
              {/* Left Margin Indicator */}
              <line
                x1={marginConfig.left}
                y1={0}
                x2={marginConfig.left}
                y2={24}
                stroke="#0284c7"
                strokeWidth={1.5}
                strokeDasharray="2 2"
              />
              {/* Right Margin Indicator */}
              <line
                x1={pageWidth - marginConfig.right}
                y1={0}
                x2={pageWidth - marginConfig.right}
                y2={24}
                stroke="#0284c7"
                strokeWidth={1.5}
                strokeDasharray="2 2"
              />
            </>
          )}

          {/* Active Selection Highlight Band */}
          {selectedBox && (
            <rect
              x={selectedBox.x}
              y={0}
              width={selectedBox.width}
              height={24}
              fill="rgba(157, 97, 255, 0.25)"
              stroke="#9D61FF"
              strokeWidth={1}
            />
          )}

          {/* Live Mouse Hairline Indicator */}
          {activeMousePos && activeMousePos.x >= 0 && activeMousePos.x <= pageWidth && (
            <g>
              <line
                x1={activeMousePos.x}
                y1={0}
                x2={activeMousePos.x}
                y2={24}
                stroke="#9D61FF"
                strokeWidth={1.5}
              />
              <rect
                x={Math.min(pageWidth - 36, Math.max(0, activeMousePos.x - 18))}
                y={1}
                width={36}
                height={12}
                rx={2}
                fill="#9D61FF"
              />
              <text
                x={Math.min(pageWidth - 18, Math.max(18, activeMousePos.x))}
                y={10}
                fill="#ffffff"
                fontSize={7.5}
                fontWeight="bold"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {formatValue(activeMousePos.x)}
              </text>
            </g>
          )}
        </svg>

        {/* Dimension Pill (Width Tag) */}
        <div
          className="absolute right-1 top-1 px-1.5 py-0.5 rounded bg-purple-500/15 text-[#9D61FF] border border-purple-500/30 text-[8px] font-bold font-mono pointer-events-none flex items-center gap-1 shadow-xs"
          title={`Standard A4 PDF Width: ${formatValue(pageWidth)}${activeUnit} (595px • 210mm)`}
        >
          <span>{formatValue(pageWidth)}{activeUnit}</span>
          <span className="opacity-70 font-normal">W</span>
        </div>
      </div>

      {/* ── Vertical Left Ruler (0 to 1123px) ── */}
      <div
        className={`absolute top-0 -left-8 bottom-0 w-8 border-l border-b border-t ${rulerBg} select-none z-30 overflow-hidden font-mono text-[8.5px] rounded-bl-lg shadow-xs`}
        style={{ height: `${pageHeight}px` }}
      >
        <svg
          width={32}
          height={pageHeight}
          className="w-full h-full block pointer-events-none"
        >
          {/* Ticks and Numbers */}
          {verticalTicks.map((t, idx) => {
            const w = t.type === "major" ? 14 : t.type === "medium" ? 8 : 5;
            const x1 = 32 - w;
            const x2 = 32;
            const color = t.type === "major" ? majorTickColor : tickColor;

            return (
              <g key={`v-tick-${idx}`}>
                <line
                  x1={x1}
                  y1={t.pos}
                  x2={x2}
                  y2={t.pos}
                  stroke={color}
                  strokeWidth={1}
                />
                {t.type === "major" && t.pos < pageHeight - 15 && (
                  <text
                    x={2}
                    y={t.pos + 8}
                    fill={textColor}
                    fontSize={7.5}
                    fontFamily="monospace"
                    textAnchor="start"
                  >
                    {t.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Printable Margin Markers on Vertical Ruler */}
          {marginConfig && (
            <>
              {/* Top Margin Indicator */}
              <line
                x1={0}
                y1={marginConfig.top}
                x2={32}
                y2={marginConfig.top}
                stroke="#0284c7"
                strokeWidth={1.5}
                strokeDasharray="2 2"
              />
              {/* Bottom Margin Indicator */}
              <line
                x1={0}
                y1={pageHeight - marginConfig.bottom}
                x2={32}
                y2={pageHeight - marginConfig.bottom}
                stroke="#0284c7"
                strokeWidth={1.5}
                strokeDasharray="2 2"
              />
            </>
          )}

          {/* Active Selection Highlight Band */}
          {selectedBox && (
            <rect
              x={0}
              y={selectedBox.y}
              width={32}
              height={selectedBox.height}
              fill="rgba(157, 97, 255, 0.25)"
              stroke="#9D61FF"
              strokeWidth={1}
            />
          )}

          {/* Live Mouse Hairline Indicator */}
          {activeMousePos && activeMousePos.y >= 0 && activeMousePos.y <= pageHeight && (
            <g>
              <line
                x1={0}
                y1={activeMousePos.y}
                x2={32}
                y2={activeMousePos.y}
                stroke="#9D61FF"
                strokeWidth={1.5}
              />
              <rect
                x={1}
                y={Math.min(pageHeight - 14, Math.max(0, activeMousePos.y - 7))}
                width={30}
                height={13}
                rx={2}
                fill="#9D61FF"
              />
              <text
                x={16}
                y={Math.min(pageHeight - 4, Math.max(9, activeMousePos.y + 3))}
                fill="#ffffff"
                fontSize={7}
                fontWeight="bold"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {formatValue(activeMousePos.y)}
              </text>
            </g>
          )}
        </svg>

        {/* Dimension Pill (Height Tag) */}
        <div
          className="absolute left-0.5 bottom-1 px-1 py-0.5 rounded bg-purple-500/15 text-[#9D61FF] border border-purple-500/30 text-[7.5px] font-bold font-mono pointer-events-none flex items-center justify-center shadow-xs"
          title={`Standard A4 PDF Height: ${formatValue(pageHeight)}${activeUnit} (842px • 297mm)`}
        >
          <span>{formatValue(pageHeight)}{activeUnit}</span>
        </div>
      </div>
    </>
  );
}

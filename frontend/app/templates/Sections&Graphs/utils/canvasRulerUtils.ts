export type RulerUnit = "px" | "pt" | "mm" | "in";

export interface UnitConversionFactors {
  isPdf72Dpi: boolean;
  pxPerInch: number;
  pxPerMm: number;
  pxPerPt: number;
}

export function getUnitConversionFactors(pageWidth: number): UnitConversionFactors {
  const isPdf72Dpi = Math.abs(pageWidth - 595) < 10;
  return {
    isPdf72Dpi,
    pxPerInch: isPdf72Dpi ? 72 : 96,
    pxPerMm: pageWidth / 210,
    pxPerPt: isPdf72Dpi ? 1 : 96 / 72,
  };
}

export function formatRulerValue(
  px: number,
  unit: RulerUnit,
  factors: UnitConversionFactors
): string {
  if (unit === "pt") {
    return Math.round(px / factors.pxPerPt).toString();
  }
  if (unit === "mm") {
    return (px / factors.pxPerMm).toFixed(0);
  }
  if (unit === "in") {
    return (px / factors.pxPerInch).toFixed(1);
  }
  return Math.round(px).toString();
}

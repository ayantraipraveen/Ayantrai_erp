"use client";

export interface UploadedSvgWatermark {
  id: string;
  name: string;
  fileName: string;
  svgContent: string;
  uploadedAt: string;
  sizeBytes: number;
  scale?: number;
}

export interface WatermarkStampConfig {
  watermarkId: string | null;
  opacity: number;      // 5 to 60 (percent)
  scale: number;        // 50 to 150 (percent)
  rotation: number;     // -45 to 45 (degrees)
  placement: "center" | "top-right" | "bottom-right" | "tiled";
}

export const STORAGE_KEY = "ayantrai_uploaded_watermark_svgs";
export const WATERMARK_CONFIG_PREFIX = "ayantrai_canvas_wm_config_";

export const DEFAULT_WATERMARK_CONFIG: WatermarkStampConfig = {
  watermarkId: "wm-seed-1",
  opacity: 18,
  scale: 100,
  rotation: -18,
  placement: "center",
};

export const INITIAL_SEEDS: UploadedSvgWatermark[] = [
  {
    id: "wm-seed-1",
    name: "AyantrAI Official Approved Stamp",
    fileName: "ayantrai-official-stamp.svg",
    uploadedAt: "2026-09-24 10:30",
    sizeBytes: 1420,
    scale: 100,
    svgContent: `<svg viewBox="0 0 380 120" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" stroke="#9D61FF" stroke-width="2.5">
    <rect x="6" y="6" width="368" height="108" rx="14" stroke-dasharray="6 4" />
    <path d="M 50 60 L 70 40 L 90 60 L 70 80 Z" fill="#9D61FF" fill-opacity="0.2" />
    <text x="110" y="54" font-family="monospace" font-size="22" font-weight="900" fill="#9D61FF" letter-spacing="3">AYANTRAI</text>
    <text x="110" y="76" font-family="monospace" font-size="10.5" font-weight="700" fill="#9D61FF" letter-spacing="2">OFFICIAL COMPLIANCE STAMP</text>
  </g>
</svg>`,
  },
  {
    id: "wm-seed-2",
    name: "ISO 45001:2018 Certified Stamp",
    fileName: "iso-45001-certified.svg",
    uploadedAt: "2026-09-24 11:15",
    sizeBytes: 1180,
    scale: 100,
    svgContent: `<svg viewBox="0 0 380 120" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" stroke="#10B981" stroke-width="2.5">
    <circle cx="60" cy="60" r="42" stroke-dasharray="4 3" />
    <circle cx="60" cy="60" r="32" fill="#10B981" fill-opacity="0.15" />
    <path d="M 48 60 L 56 68 L 74 48" stroke="#10B981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
    <text x="120" y="52" font-family="monospace" font-size="20" font-weight="900" fill="#10B981" letter-spacing="2">ISO 45001:2018</text>
    <text x="120" y="74" font-family="monospace" font-size="11" font-weight="700" fill="#10B981" letter-spacing="1.5">OCCUPATIONAL SAFETY VERIFIED</text>
  </g>
</svg>`,
  },
  {
    id: "wm-seed-3",
    name: "Confidential Security Seal",
    fileName: "confidential-telemetry.svg",
    uploadedAt: "2026-09-24 12:00",
    sizeBytes: 1350,
    scale: 100,
    svgContent: `<svg viewBox="0 0 380 120" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" stroke="#EF4444" stroke-width="2.5">
    <rect x="8" y="8" width="364" height="104" rx="10" stroke-width="3" />
    <line x1="8" y1="28" x2="372" y2="28" stroke-width="1.5" />
    <line x1="8" y1="92" x2="372" y2="92" stroke-width="1.5" />
    <text x="190" y="66" text-anchor="middle" font-family="monospace" font-size="24" font-weight="900" fill="#EF4444" letter-spacing="6">CONFIDENTIAL</text>
    <text x="190" y="21" text-anchor="middle" font-family="monospace" font-size="8.5" font-weight="700" fill="#EF4444" letter-spacing="2">PROPRIETARY INFRASTRUCTURE TELEMETRY</text>
  </g>
</svg>`,
  },
];

/** Retrieve all uploaded SVGs from localStorage, falling back to INITIAL_SEEDS */
export function getUploadedWatermarks(): UploadedSvgWatermark[] {
  if (typeof window === "undefined") return INITIAL_SEEDS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_SEEDS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_SEEDS;
  } catch (e) {
    console.warn("Failed to parse watermarks from localStorage", e);
    return INITIAL_SEEDS;
  }
}

/** Retrieve watermark stamping settings for a section */
export function getSectionWatermarkConfig(sectionId: string, fallbackWatermarkId?: string): WatermarkStampConfig {
  if (typeof window === "undefined") {
    return {
      ...DEFAULT_WATERMARK_CONFIG,
      watermarkId: fallbackWatermarkId || DEFAULT_WATERMARK_CONFIG.watermarkId,
    };
  }
  try {
    const raw = localStorage.getItem(`${WATERMARK_CONFIG_PREFIX}${sectionId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_WATERMARK_CONFIG,
        ...parsed,
        watermarkId: parsed.watermarkId !== undefined ? parsed.watermarkId : (fallbackWatermarkId || DEFAULT_WATERMARK_CONFIG.watermarkId),
      };
    }
  } catch (e) {
    console.warn("Failed to load watermark config", e);
  }
  return {
    ...DEFAULT_WATERMARK_CONFIG,
    watermarkId: fallbackWatermarkId || DEFAULT_WATERMARK_CONFIG.watermarkId,
  };
}

/** Persist watermark stamping settings for a section */
export function saveSectionWatermarkConfig(sectionId: string, config: WatermarkStampConfig): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${WATERMARK_CONFIG_PREFIX}${sectionId}`, JSON.stringify(config));
  } catch (e) {
    console.warn("Failed to save watermark config", e);
  }
}

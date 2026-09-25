"use client";

import { WatermarkItem } from "../types/reportModuleTypes";

export const initialWatermarks: WatermarkItem[] = [
  {
    id: "wm-approved",
    name: "AyantrAI Official Approved",
    tag: "Governance",
    fileName: "ayantrai-official-stamp.svg",
    description: "Official compliance seal for approved safety audits and master blueprints.",
    opacity: 18,
    rotation: -30,
    scale: 100,
    placement: "center",
    isDefault: true,
    assignedSectionIds: ["sec-core-1", "sec-core-2", "sec-core-7"],
    createdAt: "2026-09-20",
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
    id: "wm-iso45001",
    name: "ISO 45001 Certified Stamp",
    tag: "Compliance",
    fileName: "iso-45001-certified.svg",
    description: "Occupational health and safety verified stamp according to international standards.",
    opacity: 20,
    rotation: -25,
    scale: 105,
    placement: "center",
    isDefault: false,
    assignedSectionIds: ["sec-core-3"],
    createdAt: "2026-09-21",
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
    id: "wm-confidential",
    name: "Confidential Security Seal",
    tag: "Security",
    fileName: "confidential-telemetry.svg",
    description: "Restricted proprietary telemetry stream seal for internal supervisory eyes only.",
    opacity: 16,
    rotation: -35,
    scale: 110,
    placement: "center",
    isDefault: false,
    assignedSectionIds: ["sec-core-6"],
    createdAt: "2026-09-21",
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
  {
    id: "wm-draft",
    name: "Audit Draft — Review Only",
    tag: "Audit",
    fileName: "audit-draft-stamp.svg",
    description: "Pre-release audit watermark for drafts pending project head sign-off.",
    opacity: 18,
    rotation: -30,
    scale: 100,
    placement: "center",
    isDefault: false,
    assignedSectionIds: [],
    createdAt: "2026-09-22",
    svgContent: `<svg viewBox="0 0 380 120" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke="#F59E0B" stroke-width="2.5">
        <rect x="10" y="10" width="360" height="100" rx="12" stroke-dasharray="10 6" />
        <text x="190" y="60" text-anchor="middle" font-family="monospace" font-size="23" font-weight="900" fill="#F59E0B" letter-spacing="4">PRE-RELEASE DRAFT</text>
        <text x="190" y="82" text-anchor="middle" font-family="monospace" font-size="10" font-weight="700" fill="#F59E0B" letter-spacing="2">GOVERNANCE AUDIT PENDING</text>
      </g>
    </svg>`,
  },
  {
    id: "wm-zeroharm",
    name: "Zero Harm Safety Clearance",
    tag: "Safety",
    fileName: "zero-harm-clearance.svg",
    description: "Verified hazard-free environmental site condition clearance mark.",
    opacity: 22,
    rotation: -20,
    scale: 100,
    placement: "center",
    isDefault: false,
    assignedSectionIds: ["sec-core-4", "sec-core-5"],
    createdAt: "2026-09-23",
    svgContent: `<svg viewBox="0 0 380 120" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke="#06B6D4" stroke-width="2.5">
        <polygon points="190,12 368,108 12,108" stroke-dasharray="8 4" rx="10" />
        <path d="M 190 40 L 190 75 M 190 88 L 190 92" stroke="#06B6D4" stroke-width="3.5" stroke-linecap="round" />
        <text x="190" y="104" text-anchor="middle" font-family="monospace" font-size="11" font-weight="800" fill="#06B6D4" letter-spacing="3">ZERO HARM COMPLIANT</text>
      </g>
    </svg>`,
  },
];

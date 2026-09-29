import React from "react";

/**
 * Renders dual-tone eyebrow text matching design target:
 * e.g., "ATTENDANCE ANALYSIS" -> "ATTENDANCE" in dark blue/white, "ANALYSIS" in electric accent blue.
 */
export function renderDualToneEyebrow(
  eyebrow: string,
  sectionTextColor?: string,
  isDarkPaper?: boolean
): React.ReactNode {
  if (sectionTextColor) {
    return <span style={{ color: sectionTextColor }}>{eyebrow}</span>;
  }
  const trimmed = (eyebrow || "").trim();
  if (!trimmed) return null;
  const parts = trimmed.split(/\s+/);
  if (parts.length <= 1) {
    return (
      <span className={isDarkPaper ? "text-sky-400" : "text-[#0d2562] dark:text-sky-400"}>
        {trimmed}
      </span>
    );
  }
  const firstPart = parts.slice(0, -1).join(" ");
  const lastWord = parts[parts.length - 1];
  return (
    <>
      <span className={isDarkPaper ? "text-blue-300" : "text-[#0d2562] dark:text-blue-300"}>
        {firstPart}
      </span>{" "}
      <span className={isDarkPaper ? "text-sky-400" : "text-[#2563eb] dark:text-sky-400"}>
        {lastWord}
      </span>
    </>
  );
}

/**
 * Renders dual-tone title text matching design target:
 * e.g., "Shift-wise Worker Attendance" -> main words in bold, last word in accent electric blue.
 */
export function renderDualToneTitle(
  name: string,
  sectionTextColor?: string,
  isDarkPaper?: boolean
): React.ReactNode {
  if (sectionTextColor) {
    return <span style={{ color: sectionTextColor }}>{name}</span>;
  }
  const trimmed = (name || "").trim();
  if (!trimmed) return null;
  const parts = trimmed.split(/\s+/);
  if (parts.length <= 1) {
    return (
      <span className={isDarkPaper ? "text-white" : "text-[#050a1a] dark:text-white"}>
        {trimmed}
      </span>
    );
  }
  const mainPart = parts.slice(0, -1).join(" ");
  const accentWord = parts[parts.length - 1];
  return (
    <>
      <span className={isDarkPaper ? "text-white" : "text-[#050a1a] dark:text-white"}>
        {mainPart}
      </span>{" "}
      <span className={isDarkPaper ? "text-sky-400" : "text-[#2563eb] dark:text-sky-400"}>
        {accentWord}
      </span>
    </>
  );
}

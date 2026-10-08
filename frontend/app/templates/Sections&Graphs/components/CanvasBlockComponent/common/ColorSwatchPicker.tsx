import React from "react";

export function ColorSwatchPicker({
  value,
  onChange,
  className = "w-5 h-5",
}: {
  value: string;
  onChange: (val: string) => void;
  className?: string;
}) {
  const safeColor = value && value.startsWith("#") ? value : "#ffffff";
  return (
    <div
      className={`relative ${className} rounded-md border border-slate-200 dark:border-zinc-700 shadow-xs shrink-0 overflow-hidden cursor-pointer transition-transform hover:scale-105 active:scale-95`}
      style={{ backgroundColor: safeColor }}
      title="Click to open color picker"
    >
      <input
        type="color"
        value={safeColor}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
    </div>
  );
}

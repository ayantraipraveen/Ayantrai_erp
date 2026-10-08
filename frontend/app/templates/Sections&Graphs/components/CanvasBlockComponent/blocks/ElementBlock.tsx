import React from "react";
import { CanvasCell } from "@/lib/redux/slices/reportModuleSlice";

export interface ElementBlockProps {
  cell: CanvasCell;
}

export function ElementBlock({ cell }: ElementBlockProps) {
  const elem = cell.element;
  if (!elem) return null;

  const rotation = elem.rotation || 0;
  const scale = elem.scale || 1;
  const opacity = elem.opacity !== undefined ? elem.opacity : 1;

  return (
    <div className="w-full h-full flex items-center justify-center p-2 overflow-hidden select-none">
      <div
        className="w-full h-full flex items-center justify-center transition-transform pointer-events-none"
        style={{
          opacity,
          transform: `rotate(${rotation}deg) scale(${scale})`,
          transformOrigin: "center center",
        }}
        dangerouslySetInnerHTML={{ __html: elem.svgContent }}
      />
    </div>
  );
}

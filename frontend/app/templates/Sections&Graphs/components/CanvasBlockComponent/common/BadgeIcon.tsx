import React from "react";
import { getMetricIconComponent } from "../../../utils";

export function BadgeIcon({
  name,
  size = 16,
  className = "",
  color,
}: {
  name?: string;
  size?: number;
  className?: string;
  color?: string;
}) {
  const Icon = getMetricIconComponent(name);
  return (
    <Icon
      style={{
        width: `${size}px`,
        height: `${size}px`,
        color: color || undefined,
        strokeWidth: 2,
      }}
      className={className}
    />
  );
}

"use client";

import React from "react";
import { DynamicTextEditor, renderDynamicText } from "../DynamicTitleEditor";

export interface CanvasInlineEditableTextProps {
  value: string;
  html?: string;
  isEditing: boolean;
  defaultFontSize?: number;
  multiline?: boolean;
  toolbarPosition?: "top" | "bottom";
  toolbarAlign?: "left" | "right" | "center";
  className?: string;
  title?: string;
  onDoubleClick: () => void;
  onSave: (plain: string, html: string) => void;
  onCancel: () => void;
  textElement?: "p" | "h1" | "span" | "div";
}

/**
 * Reusable inline editable text component for report headers, section headers, and footers.
 * Displays styled formatted text, and mounts the DynamicTextEditor upon double-click.
 */
export function CanvasInlineEditableText({
  value,
  html,
  isEditing,
  defaultFontSize = 13,
  multiline = false,
  toolbarPosition = "top",
  toolbarAlign = "left",
  className = "",
  title = "Double-click to format text",
  onDoubleClick,
  onSave,
  onCancel,
  textElement = "p",
}: CanvasInlineEditableTextProps) {
  if (isEditing) {
    return (
      <DynamicTextEditor
        initialValue={value}
        initialHtml={html}
        defaultFontSize={defaultFontSize}
        multiline={multiline}
        toolbarPosition={toolbarPosition}
        toolbarAlign={toolbarAlign}
        className={className}
        onSave={onSave}
        onCancel={onCancel}
      />
    );
  }

  const Tag = textElement;
  return (
    <Tag
      className={`cursor-text ${className}`}
      onDoubleClick={onDoubleClick}
      title={title}
    >
      {renderDynamicText(html, value)}
    </Tag>
  );
}

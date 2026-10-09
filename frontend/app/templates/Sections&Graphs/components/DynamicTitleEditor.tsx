"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Check,
  X,
  Type,
  ChevronDown,
  Pipette,
  Bold,
  Italic,
  Underline,
  Minus,
  Plus,
  CornerDownLeft,
} from "lucide-react";

export interface TitleFontOption {
  id: string;
  name: string;
  family: string;
  category: string;
}

export const TITLE_FONTS: TitleFontOption[] = [
  { id: "Inter", name: "Inter", family: "'Inter', sans-serif", category: "Modern Sans" },
  { id: "Outfit", name: "Outfit", family: "'Outfit', sans-serif", category: "Geometric Sans" },
  { id: "Roboto", name: "Roboto", family: "'Roboto', sans-serif", category: "System Sans" },
  { id: "Montserrat", name: "Montserrat", family: "'Montserrat', sans-serif", category: "Bold Punchy" },
  { id: "Playfair Display", name: "Playfair Display", family: "'Playfair Display', serif", category: "Editorial Serif" },
  { id: "Merriweather", name: "Merriweather", family: "'Merriweather', serif", category: "Classic Serif" },
  { id: "Oswald", name: "Oswald", family: "'Oswald', sans-serif", category: "Condensed Impact" },
  { id: "JetBrains Mono", name: "JetBrains Mono", family: "'JetBrains Mono', monospace", category: "Technical Mono" },
  { id: "Cinzel", name: "Cinzel", family: "'Cinzel', serif", category: "Classic Roman" },
  { id: "Georgia", name: "Georgia", family: "Georgia, serif", category: "Standard Serif" },
];

export const TITLE_THEME_COLORS = [
  { name: "Midnight Black", hex: "#050a1a" },
  { name: "Deep Navy", hex: "#0d2562" },
  { name: "Corporate Blue", hex: "#1836a0" },
  { name: "Electric Azure", hex: "#2563eb" },
  { name: "Sky Blue", hex: "#0284c7" },
  { name: "AyantrAI Purple", hex: "#9D61FF" },
  { name: "Emerald Green", hex: "#059669" },
  { name: "Sunset Amber", hex: "#d97706" },
  { name: "Crimson Red", hex: "#dc2626" },
  { name: "Slate Gray", hex: "#475569" },
  { name: "Pure White", hex: "#ffffff" },
];

export interface DynamicTextEditorProps {
  initialValue?: string;
  initialHtml?: string;
  isDarkPaper?: boolean;
  defaultFontSize?: number;
  multiline?: boolean;
  showToolbar?: boolean;
  toolbarPosition?: "top" | "bottom" | "auto";
  toolbarAlign?: "left" | "right" | "center" | "auto";
  editorBorderColor?: string;
  editorBgColor?: string;
  className?: string;
  placeholder?: string;
  onSave: (plainText: string, html: string) => void;
  onCancel: () => void;
}

// Helper: get character offset selection relative to editor root
function getSelectionOffsets(root: HTMLElement): { start: number; end: number } | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const range = sel.getRangeAt(0);
  if (!root.contains(range.commonAncestorContainer)) return null;

  const preRange = range.cloneRange();
  preRange.selectNodeContents(root);
  preRange.setEnd(range.startContainer, range.startOffset);
  const start = preRange.toString().length;
  const end = start + range.toString().length;

  return { start, end };
}

// Helper: restore character offset selection relative to editor root
function restoreSelectionOffsets(root: HTMLElement, offsets: { start: number; end: number } | null) {
  if (!offsets) return;
  const sel = window.getSelection();
  if (!sel) return;

  const { start, end } = offsets;
  if (start < 0 || end < start) return;

  let charIndex = 0;
  let startNode: Node | null = null;
  let startOffset = 0;
  let endNode: Node | null = null;
  let endOffset = 0;

  function traverse(node: Node): boolean {
    if (node.nodeType === Node.TEXT_NODE) {
      const len = node.textContent?.length || 0;
      if (!startNode && charIndex + len >= start) {
        startNode = node;
        startOffset = start - charIndex;
      }
      if (!endNode && charIndex + len >= end) {
        endNode = node;
        endOffset = end - charIndex;
        return true;
      }
      charIndex += len;
    } else {
      for (let i = 0; i < node.childNodes.length; i++) {
        if (traverse(node.childNodes[i])) return true;
      }
    }
    return false;
  }

  traverse(root);

  if (startNode && endNode) {
    try {
      const newRange = document.createRange();
      newRange.setStart(startNode, startOffset);
      newRange.setEnd(endNode, endOffset);
      sel.removeAllRanges();
      sel.addRange(newRange);
    } catch {
      // ignore
    }
  }
}

/**
 * Universal Microsoft Word-style dynamic rich text editor.
 * The user selects any part of the text with their cursor and clicks a color/font,
 * applying styling specifically and exclusively to the selected text.
 */
export function DynamicTextEditor({
  initialValue,
  initialHtml,
  isDarkPaper,
  defaultFontSize = 14,
  multiline = false,
  showToolbar = true,
  toolbarPosition = "auto",
  toolbarAlign = "auto",
  editorBorderColor,
  editorBgColor,
  className = "",
  placeholder = "Type text...",
  onSave,
  onCancel,
}: DynamicTextEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const fontBtnRef = useRef<HTMLButtonElement | null>(null);
  const colorBtnRef = useRef<HTMLButtonElement | null>(null);
  const savedOffsetsRef = useRef<{ start: number; end: number } | null>(null);

  const [selectedFont, setSelectedFont] = useState<string>("Inter");
  const [fontSize, setFontSize] = useState<number>(defaultFontSize);
  const [activeColor, setActiveColor] = useState<string>("#2563eb");
  const [fontMenuOpen, setFontMenuOpen] = useState(false);
  const [colorMenuOpen, setColorMenuOpen] = useState(false);
  const [fontMenuPos, setFontMenuPos] = useState<{ top: number; left: number } | null>(null);
  const [colorMenuPos, setColorMenuPos] = useState<{ top: number; left: number } | null>(null);
  const [customHex, setCustomHex] = useState("#2563eb");
  const [detectedPlacement, setDetectedPlacement] = useState<"top" | "bottom">("top");
  const [detectedAlign, setDetectedAlign] = useState<"left" | "right">("left");

  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const [toolbarCoords, setToolbarCoords] = useState<{ top: number; left: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updateToolbarCoords = useCallback(() => {
    const target = editorRef.current || containerRef.current;
    if (!target) {
      setToolbarCoords(null);
      return;
    }
    const rect = target.getBoundingClientRect();
    if (rect.bottom < 40 || rect.top > window.innerHeight) {
      setToolbarCoords(null);
      return;
    }

    const toolbarW = toolbarRef.current?.offsetWidth || 480;
    const toolbarH = toolbarRef.current?.offsetHeight || 42;

    const preferBottom = toolbarPosition === "bottom";
    const preferTop = toolbarPosition === "top";

    let targetTop: number;
    if (preferBottom) {
      targetTop = rect.bottom + 8;
      if (targetTop + toolbarH > window.innerHeight - 16 && rect.top - toolbarH - 8 >= 72) {
        targetTop = rect.top - toolbarH - 8;
      }
    } else if (preferTop) {
      targetTop = rect.top - toolbarH - 8;
      if (targetTop < 72) {
        targetTop = rect.bottom + 8;
      }
    } else {
      // Auto: prefer top if space >= 72, else bottom
      if (rect.top - toolbarH - 8 >= 72) {
        targetTop = rect.top - toolbarH - 8;
      } else {
        targetTop = rect.bottom + 8;
      }
    }

    // Clamp vertically so toolbar never goes outside viewport
    const maxAllowedTop = window.innerHeight - toolbarH - 16;
    if (targetTop > maxAllowedTop) {
      targetTop = Math.max(72, maxAllowedTop);
    }
    if (targetTop < 72) {
      targetTop = 72;
    }

    // Horizontally: align based on toolbarAlign or available width
    let targetLeft = rect.left;
    if (toolbarAlign === "right") {
      targetLeft = rect.right - toolbarW;
    } else if (toolbarAlign === "center") {
      targetLeft = rect.left + rect.width / 2 - toolbarW / 2;
    }

    if (targetLeft + toolbarW > window.innerWidth - 16) {
      targetLeft = window.innerWidth - toolbarW - 16;
    }
    if (targetLeft < 16) {
      targetLeft = 16;
    }

    setToolbarCoords({
      top: Math.round(targetTop),
      left: Math.round(targetLeft),
    });
  }, [toolbarPosition, toolbarAlign]);

  useEffect(() => {
    updateToolbarCoords();
    const handleReposition = () => updateToolbarCoords();
    window.addEventListener("scroll", handleReposition, true);
    window.addEventListener("resize", handleReposition);
    return () => {
      window.removeEventListener("scroll", handleReposition, true);
      window.removeEventListener("resize", handleReposition);
    };
  }, [updateToolbarCoords]);

  useEffect(() => {
    if (toolbarCoords && toolbarRef.current) {
      const actualW = toolbarRef.current.offsetWidth;
      const target = editorRef.current || containerRef.current;
      if (!target) return;
      const rect = target.getBoundingClientRect();
      let targetLeft = rect.left;
      if (toolbarAlign === "right") {
        targetLeft = rect.right - actualW;
      } else if (toolbarAlign === "center") {
        targetLeft = rect.left + rect.width / 2 - actualW / 2;
      }
      if (targetLeft + actualW > window.innerWidth - 16) {
        targetLeft = window.innerWidth - actualW - 16;
      }
      if (targetLeft < 16) targetLeft = 16;
      if (Math.round(targetLeft) !== toolbarCoords.left) {
        setToolbarCoords((prev) => (prev ? { ...prev, left: Math.round(targetLeft) } : null));
      }
    }
  }, [toolbarCoords?.top, toolbarAlign]);

  // Track coordinates for Font Family dropdown portal
  useEffect(() => {
    if (!fontMenuOpen || !fontBtnRef.current) return;
    const updatePos = () => {
      if (!fontBtnRef.current) return;
      const rect = fontBtnRef.current.getBoundingClientRect();
      const popoverW = 208; // w-52
      let left = rect.left;
      if (left + popoverW > window.innerWidth - 12) {
        left = Math.max(12, window.innerWidth - popoverW - 12);
      }
      if (left < 12) left = 12;
      let top = rect.bottom + 6;
      if (top + 260 > window.innerHeight && rect.top > 260) {
        top = rect.top - 260;
      }
      setFontMenuPos({ top, left });
    };
    updatePos();
    window.addEventListener("scroll", updatePos, true);
    window.addEventListener("resize", updatePos);
    return () => {
      window.removeEventListener("scroll", updatePos, true);
      window.removeEventListener("resize", updatePos);
    };
  }, [fontMenuOpen]);

  // Track coordinates for Color Tool dropdown portal
  useEffect(() => {
    if (!colorMenuOpen || !colorBtnRef.current) return;
    const updatePos = () => {
      if (!colorBtnRef.current) return;
      const rect = colorBtnRef.current.getBoundingClientRect();
      const popoverW = 240; // w-60
      let left = rect.left;
      if (left + popoverW > window.innerWidth - 12) {
        left = Math.max(12, window.innerWidth - popoverW - 12);
      }
      if (left < 12) left = 12;
      let top = rect.bottom + 6;
      if (top + 320 > window.innerHeight && rect.top > 320) {
        top = rect.top - 320;
      }
      setColorMenuPos({ top, left });
    };
    updatePos();
    window.addEventListener("scroll", updatePos, true);
    window.addEventListener("resize", updatePos);
    return () => {
      window.removeEventListener("scroll", updatePos, true);
      window.removeEventListener("resize", updatePos);
    };
  }, [colorMenuOpen]);

  // Dismiss portal dropdowns when clicking outside
  useEffect(() => {
    if (!fontMenuOpen && !colorMenuOpen) return;
    const handleMenuOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest(".portal-title-dropdown")) return;
      if (fontBtnRef.current?.contains(target) || colorBtnRef.current?.contains(target)) return;
      setFontMenuOpen(false);
      setColorMenuOpen(false);
    };
    document.addEventListener("mousedown", handleMenuOutside);
    return () => document.removeEventListener("mousedown", handleMenuOutside);
  }, [fontMenuOpen, colorMenuOpen]);

  // Dynamically position floating toolbar above or below and clamp horizontally to avoid clipping
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.top < 110) {
        setDetectedPlacement("bottom");
      } else {
        setDetectedPlacement("top");
      }

      // Check distance to artboard boundary or viewport edge
      const artboard = (containerRef.current.closest("[id^='canvas-page']") ||
        containerRef.current.closest(".overflow-hidden")) as HTMLElement | null;

      const boundaryRight = artboard
        ? artboard.getBoundingClientRect().right
        : window.innerWidth;

      const availableToRight = boundaryRight - rect.left - 24;
      const targetToolbarWidth = 460;

      if (availableToRight < targetToolbarWidth) {
        setDetectedAlign("right");
      } else {
        setDetectedAlign("left");
      }
    }
  }, []);

  const effectivePlacement =
    toolbarPosition && toolbarPosition !== "auto" ? toolbarPosition : detectedPlacement;
  const effectiveAlign =
    toolbarAlign && toolbarAlign !== "auto" ? toolbarAlign : detectedAlign;

  // Initialize HTML content on mount & focus
  useEffect(() => {
    if (!editorRef.current) return;
    if (initialHtml && initialHtml.trim()) {
      editorRef.current.innerHTML = initialHtml;
    } else {
      editorRef.current.innerHTML = initialValue || "";
    }
    // Give focus so the user can immediately select or type
    try {
      editorRef.current.focus();
    } catch {
      // ignore
    }
  }, [initialHtml, initialValue]);

  const isMouseDownInEditorRef = useRef(false);

  // Track if mouse is down inside editor to prevent drag-selection from triggering outside click
  useEffect(() => {
    const handleEditorMouseDown = () => {
      isMouseDownInEditorRef.current = true;
    };
    const handleGlobalMouseUp = () => {
      isMouseDownInEditorRef.current = false;
    };
    const ed = editorRef.current;
    if (ed) {
      ed.addEventListener("mousedown", handleEditorMouseDown);
    }
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => {
      if (ed) {
        ed.removeEventListener("mousedown", handleEditorMouseDown);
      }
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, []);

  // Auto-commit when clicking completely outside this editor container (ignoring portal dropdown clicks and selection drags)
 const onSaveRef = useRef(onSave);
const initialValueRef = useRef(initialValue);
useEffect(() => {
  onSaveRef.current = onSave;
  initialValueRef.current = initialValue;
});

useEffect(() => {
  const handler = (e: MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;

    // inside the editor or toolbar (composedPath is captured at dispatch time)
    if (e.composedPath().includes(container)) return;

    // portaled dropdowns and portaled toolbar
    const el = e.target as HTMLElement | null;
    if (toolbarRef.current?.contains(el) || el?.closest(".portal-title-dropdown, .portal-title-toolbar, .portal-ribbon-popover, .portal-quick-add-panel")) return;

    const ed = editorRef.current;
    if (!ed) return;
    let html = ed.innerHTML;
    const plain = (ed.innerText || "").trim();
    const empty = !plain || html === "<br>" || html === "<p><br></p>";
    if (!empty) {
      const edStyle = ed.style;
      if (edStyle.fontSize || edStyle.fontFamily || edStyle.color) {
        if (!html.includes("font-size") && edStyle.fontSize) {
          html = `<span style="font-size: ${edStyle.fontSize};${edStyle.fontFamily ? ` font-family: ${edStyle.fontFamily};` : ''}${edStyle.color ? ` color: ${edStyle.color};` : ''}">${html}</span>`;
        }
      }
    }
    onSaveRef.current(empty ? "" : plain, empty ? "" : html);
  };
  document.addEventListener("mousedown", handler);
  return () => document.removeEventListener("mousedown", handler);
}, []); // subscribes once

  // Keep savedOffsetsRef synchronized whenever selection changes (including collapsed caret movements)
  const handleSelectionChange = useCallback(() => {
    if (!editorRef.current) return;
    const offsets = getSelectionOffsets(editorRef.current);
    if (offsets) {
      savedOffsetsRef.current = offsets;
    }
  }, []);

  useEffect(() => {
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [handleSelectionChange]);

  // Apply style to highlighted text (or entire container if nothing selected)
  const applyStyleToSelectedText = (styles: {
    color?: string;
    fontFamily?: string;
    fontSize?: string;
    fontWeight?: string;
    fontStyle?: string;
    textDecoration?: string;
  }) => {
    if (!editorRef.current) return;
    editorRef.current.focus();

    restoreSelectionOffsets(editorRef.current, savedOffsetsRef.current);
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    if (!editorRef.current.contains(range.commonAncestorContainer)) return;

    // Case 1: If nothing is selected (cursor only, collapsed), apply to whole input content
    if (range.collapsed || !savedOffsetsRef.current || savedOffsetsRef.current.start === savedOffsetsRef.current.end) {
      const existingSpans = editorRef.current.querySelectorAll("span");
      if (existingSpans.length > 0) {
        existingSpans.forEach((s) => {
          const el = s as HTMLElement;
          if (styles.color) el.style.color = styles.color;
          if (styles.fontFamily) el.style.fontFamily = styles.fontFamily;
          if (styles.fontSize) el.style.fontSize = styles.fontSize;
          if (styles.fontWeight) el.style.fontWeight = styles.fontWeight;
          if (styles.fontStyle) el.style.fontStyle = styles.fontStyle;
          if (styles.textDecoration) el.style.textDecoration = styles.textDecoration;
        });
      } else {
        const textContent = editorRef.current.textContent || "";
        const span = document.createElement("span");
        if (styles.color) span.style.color = styles.color;
        if (styles.fontFamily) span.style.fontFamily = styles.fontFamily;
        if (styles.fontSize) span.style.fontSize = styles.fontSize;
        if (styles.fontWeight) span.style.fontWeight = styles.fontWeight;
        if (styles.fontStyle) span.style.fontStyle = styles.fontStyle;
        if (styles.textDecoration) span.style.textDecoration = styles.textDecoration;
        span.textContent = textContent;
        editorRef.current.innerHTML = "";
        editorRef.current.appendChild(span);
      }
      if (styles.color) editorRef.current.style.color = styles.color;
      if (styles.fontFamily) editorRef.current.style.fontFamily = styles.fontFamily;
      if (styles.fontSize) editorRef.current.style.fontSize = styles.fontSize;
      if (styles.fontWeight) editorRef.current.style.fontWeight = styles.fontWeight;
      if (styles.fontStyle) editorRef.current.style.fontStyle = styles.fontStyle;
      if (styles.textDecoration) editorRef.current.style.textDecoration = styles.textDecoration;
      return;
    }

    // Case 2: If the selection is already a single span inside the editor, update its styles directly
    const commonNode = range.commonAncestorContainer;
    const parentSpan = (commonNode.nodeType === Node.TEXT_NODE ? commonNode.parentElement : commonNode as HTMLElement);
    if (
      parentSpan &&
      parentSpan.tagName === "SPAN" &&
      editorRef.current.contains(parentSpan) &&
      parentSpan !== editorRef.current &&
      (range.toString() === parentSpan.textContent || range.toString().trim() === parentSpan.textContent?.trim())
    ) {
      if (styles.color) parentSpan.style.color = styles.color;
      if (styles.fontFamily) parentSpan.style.fontFamily = styles.fontFamily;
      if (styles.fontSize) parentSpan.style.fontSize = styles.fontSize;
      if (styles.fontWeight) parentSpan.style.fontWeight = styles.fontWeight;
      if (styles.fontStyle) parentSpan.style.fontStyle = styles.fontStyle;
      if (styles.textDecoration) parentSpan.style.textDecoration = styles.textDecoration;
      
      savedOffsetsRef.current = getSelectionOffsets(editorRef.current);
      return;
    }

    // Case 3: Partial selection or multi-element selection
    const fragment = range.extractContents();

    // Clean up existing matching styles on any inner child elements
    const descendants = fragment.querySelectorAll("*");
    descendants.forEach((el) => {
      const htmlEl = el as HTMLElement;
      if (styles.color) htmlEl.style.color = "";
      if (styles.fontFamily) htmlEl.style.fontFamily = "";
      if (styles.fontSize) htmlEl.style.fontSize = "";
      if (styles.fontWeight) htmlEl.style.fontWeight = "";
      if (styles.fontStyle) htmlEl.style.fontStyle = "";
      if (styles.textDecoration) htmlEl.style.textDecoration = "";
      if (htmlEl.tagName === "SPAN" && (!htmlEl.getAttribute("style") || htmlEl.style.length === 0)) {
        htmlEl.replaceWith(...Array.from(htmlEl.childNodes));
      }
    });

    const span = document.createElement("span");
    if (styles.color) span.style.color = styles.color;
    if (styles.fontFamily) span.style.fontFamily = styles.fontFamily;
    if (styles.fontSize) span.style.fontSize = styles.fontSize;
    if (styles.fontWeight) span.style.fontWeight = styles.fontWeight;
    if (styles.fontStyle) span.style.fontStyle = styles.fontStyle;
    if (styles.textDecoration) span.style.textDecoration = styles.textDecoration;

    span.appendChild(fragment);
    range.insertNode(span);

    // Keep selection highlighted on the newly styled span
    sel.removeAllRanges();
    const newRange = document.createRange();
    newRange.selectNodeContents(span);
    sel.addRange(newRange);

    savedOffsetsRef.current = getSelectionOffsets(editorRef.current);
  };

  // Apply font size
  const applyFontSize = (sizePx: number) => {
    setFontSize(sizePx);
    applyStyleToSelectedText({ fontSize: `${sizePx}px` });
  };

  // Apply color
  const applyColor = (hex: string) => {
    setActiveColor(hex);
    setCustomHex(hex);
    applyStyleToSelectedText({ color: hex });
  };

  // Apply font family
  const applyFont = (fontOption: TitleFontOption) => {
    setSelectedFont(fontOption.name);
    setFontMenuOpen(false);
    applyStyleToSelectedText({ fontFamily: fontOption.family });
  };

  // Toggle Bold / Italic / Underline
  const toggleStyle = (
    styleProp: "fontWeight" | "fontStyle" | "textDecoration",
    onVal: string,
    offVal: string
  ) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    restoreSelectionOffsets(editorRef.current, savedOffsetsRef.current);
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;

    const range = sel.getRangeAt(0);
    if (!editorRef.current.contains(range.commonAncestorContainer)) return;

    const parentEl =
      range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
        ? (range.commonAncestorContainer as HTMLElement)
        : range.commonAncestorContainer.parentElement;

    let isCurrent = false;
    if (parentEl) {
      const computed = window.getComputedStyle(parentEl);
      if (styleProp === "fontWeight") {
        isCurrent = computed.fontWeight === "700" || computed.fontWeight === "bold" || parentEl.style.fontWeight === "bold";
      } else if (styleProp === "fontStyle") {
        isCurrent = computed.fontStyle === "italic" || parentEl.style.fontStyle === "italic";
      } else if (styleProp === "textDecoration") {
        isCurrent = computed.textDecorationLine.includes("underline") || parentEl.style.textDecoration.includes("underline");
      }
    }

    const newVal = isCurrent ? offVal : onVal;
    applyStyleToSelectedText({ [styleProp]: newVal });
  };

  // Insert a new line (line break) at current cursor position
  const insertNextLine = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();

    // Check if the current selection is already inside editorRef.current
    const sel = window.getSelection();
    const isInsideEditor =
      sel &&
      sel.rangeCount > 0 &&
      editorRef.current.contains(sel.getRangeAt(0).commonAncestorContainer);

    if (isInsideEditor) {
      // Preserve active selection and synchronize savedOffsetsRef to current position
      const currentOffsets = getSelectionOffsets(editorRef.current);
      if (currentOffsets) {
        savedOffsetsRef.current = currentOffsets;
      }
    } else {
      // Selection lost or outside (e.g. clicked toolbar button); restore saved selection
      restoreSelectionOffsets(editorRef.current, savedOffsetsRef.current);
    }

    try {
      const ok = document.execCommand("insertLineBreak");
      if (!ok) {
        throw new Error("insertLineBreak failed");
      }
    } catch {
      const currentSel = window.getSelection();
      if (currentSel && currentSel.rangeCount > 0) {
        const range = currentSel.getRangeAt(0);
        range.deleteContents();
        const br = document.createElement("br");
        range.insertNode(br);
        range.setStartAfter(br);
        range.setEndAfter(br);
        currentSel.removeAllRanges();
        currentSel.addRange(range);
      }
    }
    savedOffsetsRef.current = getSelectionOffsets(editorRef.current);
  };

  // Commit and Save
  const handleSave = () => {
    if (!editorRef.current) return;
    let html = editorRef.current.innerHTML;
    const plainText = (editorRef.current.innerText || "").trim();
    const isActuallyEmpty = !plainText || html === "<br>" || html === "<p><br></p>";
    if (!isActuallyEmpty) {
      const edStyle = editorRef.current.style;
      if (edStyle.fontSize || edStyle.fontFamily || edStyle.color) {
        if (!html.includes("font-size") && edStyle.fontSize) {
          html = `<span style="font-size: ${edStyle.fontSize};${edStyle.fontFamily ? ` font-family: ${edStyle.fontFamily};` : ''}${edStyle.color ? ` color: ${edStyle.color};` : ''}">${html}</span>`;
        }
      }
    }
    onSave(isActuallyEmpty ? "" : (plainText || initialValue || ""), isActuallyEmpty ? "" : html);
  };

  return (
    <div
      ref={containerRef}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      className={`relative select-text w-full ${multiline ? "h-full flex flex-col min-h-0 flex-1" : "inline-block max-w-full"}`}
    >
      {/* ── Floating Word Formatting Toolbar (React Portal: Zero Layout Shift, Zero Clipping) ── */}
      {showToolbar && mounted && typeof document !== "undefined" && toolbarCoords &&
        createPortal(
          <div
            ref={toolbarRef}
            onMouseDown={(e) => {
              // Prevent losing focus / selection inside contentEditable
              e.stopPropagation();
            }}
            className="portal-title-toolbar flex items-center gap-1.5 p-1.5 rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white/98 dark:bg-zinc-900/98 text-xs select-none w-max max-w-[96vw] whitespace-nowrap shrink-0 transition-all duration-100 backdrop-blur-md"
            style={{
              position: "fixed",
              top: `${toolbarCoords.top}px`,
              left: `${toolbarCoords.left}px`,
              zIndex: 99999,
            }}
          >
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Font Family Dropdown */}
          <div className="relative shrink-0">
            <button
              ref={fontBtnRef}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setFontMenuOpen(!fontMenuOpen);
                setColorMenuOpen(false);
              }}
              className="h-7 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center gap-1.5 text-slate-800 dark:text-zinc-200 font-semibold cursor-pointer shrink-0"
              title="Font Family"
            >
              <Type className="w-3.5 h-3.5 text-[#2563eb] shrink-0" />
              <span className="text-[11px] font-semibold shrink-0">{selectedFont}</span>
              <ChevronDown className="w-2.5 h-2.5 opacity-60 shrink-0" />
            </button>

            {fontMenuOpen && typeof document !== "undefined" && fontMenuPos &&
              createPortal(
                <div
                  onMouseDown={(e) => e.preventDefault()}
                  style={{
                    position: "fixed",
                    top: fontMenuPos.top,
                    left: fontMenuPos.left,
                    zIndex: 99999,
                  }}
                  className="portal-title-dropdown w-52 max-h-64 overflow-y-auto rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#11151e] p-1 animate-fadeIn select-none"
                >
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Select Font
                  </div>
                  {TITLE_FONTS.map((font) => (
                    <button
                      key={font.id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => applyFont(font)}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs flex items-center justify-between hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer ${
                        selectedFont === font.name
                          ? "text-[#2563eb] font-bold bg-blue-50/70 dark:bg-blue-950/30"
                          : "text-slate-700 dark:text-zinc-300"
                      }`}
                      style={{ fontFamily: font.family }}
                    >
                      <span>{font.name}</span>
                      <span className="text-[10px] text-slate-400 font-sans font-normal">{font.category}</span>
                    </button>
                  ))}
                </div>,
                document.body
              )
            }
          </div>

          {/* Font Size Stepper */}
          <div className="flex items-center rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 px-1 py-0.5 shrink-0">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                const next = Math.max(10, fontSize - 2);
                applyFontSize(next);
              }}
              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 cursor-pointer"
              title="Decrease Font Size"
            >
              <Minus className="w-2.5 h-2.5" />
            </button>
            <span className="px-1.5 font-mono text-[11px] font-bold text-slate-800 dark:text-zinc-200">
              {fontSize}px
            </span>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                const next = Math.min(64, fontSize + 2);
                applyFontSize(next);
              }}
              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 cursor-pointer"
              title="Increase Font Size"
            >
              <Plus className="w-2.5 h-2.5" />
            </button>
          </div>

          <div className="w-px h-5 bg-slate-200 dark:bg-zinc-800 shrink-0" />

          {/* B, I, U Word Toggles */}
          <div className="flex items-center gap-0.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 p-0.5 shrink-0">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => toggleStyle("fontWeight", "bold", "normal")}
              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold cursor-pointer"
              title="Bold (Ctrl+B)"
            >
              <Bold className="w-3 h-3" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => toggleStyle("fontStyle", "italic", "normal")}
              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 italic cursor-pointer"
              title="Italic (Ctrl+I)"
            >
              <Italic className="w-3 h-3" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => toggleStyle("textDecoration", "underline", "none")}
              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 underline cursor-pointer"
              title="Underline (Ctrl+U)"
            >
              <Underline className="w-3 h-3" />
            </button>
          </div>

          {/* Next Line / Line Break Button */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={insertNextLine}
            className="h-7 px-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center gap-1 text-slate-700 dark:text-zinc-300 font-semibold cursor-pointer shrink-0"
            title="Next Line / Line Break (Shift+Enter or Enter)"
          >
            <CornerDownLeft className="w-3 h-3 text-[#2563eb]" />
            <span className="text-[11px]">Next Line</span>
          </button>

          <div className="w-px h-5 bg-slate-200 dark:bg-zinc-800 shrink-0" />

          {/* Word-Style Text Color Tool ('A' with color bar) */}
          <div className="relative shrink-0">
            <button
              ref={colorBtnRef}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setColorMenuOpen(!colorMenuOpen);
                setFontMenuOpen(false);
              }}
              className="h-7 px-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center gap-1 cursor-pointer shrink-0"
              title="Text Color (Select text and click color)"
            >
              <div className="flex flex-col items-center">
                <span className="text-[11px] font-black leading-none">A</span>
                <span className="w-3 h-0.5 mt-0.5 rounded-full" style={{ backgroundColor: activeColor }} />
              </div>
              <ChevronDown className="w-2.5 h-2.5 opacity-60" />
            </button>

            {colorMenuOpen && typeof document !== "undefined" && colorMenuPos &&
              createPortal(
                <div
                  onMouseDown={(e) => e.preventDefault()}
                  style={{
                    position: "fixed",
                    top: colorMenuPos.top,
                    left: colorMenuPos.left,
                    zIndex: 99999,
                  }}
                  className="portal-title-dropdown w-60 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#11151e] p-3 space-y-2.5 animate-fadeIn select-none"
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Select Color for Selected Text
                  </div>

                  {/* Swatches Grid */}
                  <div className="grid grid-cols-6 gap-1.5">
                    {TITLE_THEME_COLORS.map((col) => (
                      <button
                        key={col.hex}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          applyColor(col.hex);
                          setColorMenuOpen(false);
                        }}
                        className="w-7 h-7 rounded-lg border border-slate-300 dark:border-zinc-700 hover:scale-110 transition-transform cursor-pointer relative flex items-center justify-center"
                        style={{ backgroundColor: col.hex }}
                        title={col.name}
                      >
                        {activeColor.toLowerCase() === col.hex.toLowerCase() && (
                          <Check className={`w-3.5 h-3.5 ${col.hex === "#ffffff" ? "text-slate-900" : "text-white"}`} />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Custom Hex & Native Color Eyedropper */}
                  <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={customHex}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCustomHex(val);
                          if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                            applyColor(val);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            applyColor(customHex);
                            setColorMenuOpen(false);
                          }
                        }}
                        placeholder="#2563EB"
                        className="w-full h-7 px-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-mono outline-none"
                      />
                    </div>
                    <label className="h-7 w-7 rounded-lg border border-slate-300 dark:border-zinc-700 flex items-center justify-center cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800">
                      <Pipette className="w-3.5 h-3.5 text-slate-600 dark:text-zinc-300" />
                      <input
                        type="color"
                        value={customHex.startsWith("#") && customHex.length === 7 ? customHex : "#2563eb"}
                        onChange={(e) => {
                          setCustomHex(e.target.value);
                          applyColor(e.target.value);
                        }}
                        className="sr-only"
                      />
                    </label>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        applyColor(customHex);
                        setColorMenuOpen(false);
                      }}
                      className="h-7 px-2.5 rounded-lg bg-[#2563eb] text-white text-xs font-bold cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                </div>,
                document.body
              )
            }
          </div>

          {/* Quick Color Swatches Row + Custom Color Picker */}
          <div className="flex items-center gap-1 pl-0.5 shrink-0">
            {TITLE_THEME_COLORS.slice(0, 8).map((col) => (
              <button
                key={col.hex}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyColor(col.hex)}
                className={`w-3.5 h-3.5 rounded-full border transition-all cursor-pointer shrink-0 ${
                  activeColor.toLowerCase() === col.hex.toLowerCase()
                    ? "ring-2 ring-blue-500 scale-125 border-white dark:border-white"
                    : "border-slate-300/80 dark:border-zinc-700 hover:scale-125"
                }`}
                style={{ backgroundColor: col.hex }}
                title={`Apply ${col.name} to selected text`}
              />
            ))}

            {/* Direct Custom Color Picker Tile (Rainbow gradient with Eyedropper) */}
            <label
              className="relative w-4.5 h-4.5 rounded-full cursor-pointer hover:scale-125 transition-transform flex items-center justify-center overflow-hidden border border-slate-300 dark:border-zinc-600 ml-0.5 shrink-0"
              style={{
                background: "conic-gradient(from 180deg, #ff0000, #ff8000, #ffff00, #00ff00, #00ffff, #0066ff, #9900ff, #ff0088, #ff0000)",
              }}
              title="Custom Color Picker (Pick any color / Eyedropper)"
            >
              <input
                type="color"
                value={activeColor.startsWith("#") && activeColor.length === 7 ? activeColor : "#2563eb"}
                onChange={(e) => {
                  applyColor(e.target.value);
                }}
                className="sr-only cursor-pointer"
              />
              <Pipette className="w-2.5 h-2.5 text-white" />
            </label>
          </div>
        </div>

        {/* Action Controls: Save & Cancel */}
        <div className="flex items-center gap-1 pl-1 border-l border-slate-200 dark:border-zinc-800 ml-0.5 shrink-0">
          <button
            type="button"
            onClick={handleSave}
            className="h-7 px-2.5 rounded-lg bg-[#2563eb] text-white hover:bg-blue-700 font-bold flex items-center gap-1 cursor-pointer text-xs shrink-0"
            title="Save (Enter)"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="h-7 px-2 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 cursor-pointer text-xs shrink-0"
            title="Cancel (Esc)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>,
      document.body
    )
  }

      {/* ── The Single Editable Text Input ── */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.ctrlKey || e.metaKey) {
            if (e.key === "b" || e.key === "B") {
              e.preventDefault();
              toggleStyle("fontWeight", "bold", "normal");
              return;
            }
            if (e.key === "i" || e.key === "I") {
              e.preventDefault();
              toggleStyle("fontStyle", "italic", "normal");
              return;
            }
            if (e.key === "u" || e.key === "U") {
              e.preventDefault();
              toggleStyle("textDecoration", "underline", "none");
              return;
            }
          }
          if (e.key === "Enter") {
            if (e.shiftKey) {
              e.preventDefault();
              insertNextLine();
              return;
            }
            if (multiline) {
              if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                handleSave();
                return;
              }
              e.preventDefault();
              insertNextLine();
              return;
            }
            e.preventDefault();
            handleSave();
            return;
          }
          if (e.key === "Escape") {
            onCancel();
          }
        }}
        onKeyUp={(e) => {
          e.stopPropagation();
          if (editorRef.current) {
            const offsets = getSelectionOffsets(editorRef.current);
            if (offsets) {
              savedOffsetsRef.current = offsets;
            }
          }
        }}
        onMouseUp={() => {
          if (editorRef.current) {
            const offsets = getSelectionOffsets(editorRef.current);
            if (offsets) {
              savedOffsetsRef.current = offsets;
            }
          }
        }}
        style={{
          fontSize: `${defaultFontSize}px`,
          borderColor: editorBorderColor || undefined,
          backgroundColor: editorBgColor || undefined,
        }}
        className={`w-full outline-none select-text dynamic-word-editor transition-all whitespace-pre-wrap break-words ${
          multiline
            ? `min-h-[50px] p-2 rounded-lg border-2 ${editorBorderColor ? "" : "border-[#2563eb]"} ${editorBgColor ? "" : "bg-white/95 dark:bg-zinc-900/95"} flex-1`
            : `px-1 py-0 rounded ring-1 ring-[#2563eb] bg-blue-50/25 dark:bg-blue-950/25 min-h-0 max-w-full inline-block leading-tight`
        } ${className}`}
        aria-label={placeholder}
      />
    </div>
  );
}

/**
 * Fallback dual-tone HTML generator for Section Eyebrow
 */
export function getFallbackEyebrowHtml(eyebrow?: string, isDarkPaper?: boolean): string {
  const trimmed = (eyebrow || "").trim();
  if (!trimmed) return "";
  if (trimmed.includes("\n")) {
    return trimmed
      .split("\n")
      .map((line) => getFallbackEyebrowHtml(line, isDarkPaper))
      .join("<br>");
  }
  const parts = trimmed.split(/\s+/);
  if (parts.length <= 1) {
    const col = isDarkPaper ? "#38bdf8" : "#0d2562";
    return `<span style="color: ${col}">${trimmed}</span>`;
  }
  const firstPart = parts.slice(0, -1).join(" ");
  const lastWord = parts[parts.length - 1];
  const col1 = isDarkPaper ? "#93c5fd" : "#0d2562";
  const col2 = isDarkPaper ? "#38bdf8" : "#2563eb";
  return `<span style="color: ${col1}">${firstPart}</span> <span style="color: ${col2}">${lastWord}</span>`;
}

/**
 * Fallback dual-tone HTML generator for Section Title
 */
export function getFallbackTitleHtml(name?: string, isDarkPaper?: boolean): string {
  const trimmed = (name || "").trim();
  if (!trimmed) return "";
  if (trimmed.includes("\n")) {
    return trimmed
      .split("\n")
      .map((line) => getFallbackTitleHtml(line, isDarkPaper))
      .join("<br>");
  }
  const parts = trimmed.split(/\s+/);
  if (parts.length <= 1) {
    const col = isDarkPaper ? "#ffffff" : "#050a1a";
    return `<span style="color: ${col}">${trimmed}</span>`;
  }
  const mainPart = parts.slice(0, -1).join(" ");
  const accentWord = parts[parts.length - 1];
  const col1 = isDarkPaper ? "#ffffff" : "#050a1a";
  const col2 = isDarkPaper ? "#38bdf8" : "#2563eb";
  return `<span style="color: ${col1}">${mainPart}</span> <span style="color: ${col2}">${accentWord}</span>`;
}

/**
 * Section Title Editor (alias over DynamicTextEditor configured for main title typography)
 */
export function DynamicTitleEditor({
  initialName,
  initialHtml,
  isDarkPaper,
  paperTone,
  toolbarPosition,
  toolbarAlign,
  onSave,
  onCancel,
}: {
  initialName: string;
  initialHtml?: string;
  isDarkPaper?: boolean;
  paperTone?: string;
  toolbarPosition?: "top" | "bottom" | "auto";
  toolbarAlign?: "left" | "right" | "center" | "auto";
  onSave: (name: string, html: string) => void;
  onCancel: () => void;
}) {
  return (
    <DynamicTextEditor
      initialValue={initialName}
      initialHtml={initialHtml || getFallbackTitleHtml(initialName, isDarkPaper)}
      isDarkPaper={isDarkPaper}
      defaultFontSize={40}
      toolbarPosition={toolbarPosition}
      toolbarAlign={toolbarAlign}
      multiline={false}
      className="text-2xl sm:text-[34px] lg:text-[40px] font-black tracking-[-0.035em] leading-[1.08]"
      onSave={onSave}
      onCancel={onCancel}
    />
  );
}

/**
 * Universal text renderer: renders rich HTML if available, or plain text.
 */
export function renderDynamicText(
  html?: string,
  plainText?: string,
  sectionTextColor?: string
): React.ReactNode {
  if (html && html.trim()) {
    return (
      <span
        dangerouslySetInnerHTML={{ __html: html }}
        className="inline select-text whitespace-pre-wrap break-words"
        style={sectionTextColor ? { color: sectionTextColor } : undefined}
      />
    );
  }
  return (
    <span
      style={sectionTextColor ? { color: sectionTextColor } : undefined}
      className="whitespace-pre-wrap break-words"
    >
      {plainText || ""}
    </span>
  );
}

/**
 * Dual-tone eyebrow renderer with rich HTML support and multi-line preservation.
 */
export function renderDynamicEyebrow(
  eyebrowHtml?: string,
  eyebrow?: string,
  sectionTextColor?: string,
  isDarkPaper?: boolean
): React.ReactNode {
  const strippedHtml = eyebrowHtml ? eyebrowHtml.replace(/<[^>]*>/g, "").trim() : "";
  if (eyebrowHtml && strippedHtml) {
    return (
      <span
        dangerouslySetInnerHTML={{ __html: eyebrowHtml }}
        className="inline select-text whitespace-pre-wrap break-words"
        style={sectionTextColor ? { color: sectionTextColor } : undefined}
      />
    );
  }

  const trimmed = (eyebrow || "").trim();
  if (!trimmed) return null;
  if (sectionTextColor) {
    return <span style={{ color: sectionTextColor }} className="whitespace-pre-wrap break-words">{trimmed}</span>;
  }
  if (trimmed.includes("\n")) {
    const lines = trimmed.split("\n");
    return (
      <span className="whitespace-pre-wrap break-words inline-block">
        {lines.map((line, lIdx) => (
          <React.Fragment key={lIdx}>
            {lIdx > 0 && <br />}
            {renderDynamicEyebrow(undefined, line, sectionTextColor, isDarkPaper)}
          </React.Fragment>
        ))}
      </span>
    );
  }
  const parts = trimmed.split(/\s+/);
  if (parts.length <= 1) {
    return <span className={isDarkPaper ? "text-sky-400" : "text-[#0d2562]"}>{trimmed}</span>;
  }
  const firstPart = parts.slice(0, -1).join(" ");
  const lastWord = parts[parts.length - 1];
  return (
    <>
      <span className={isDarkPaper ? "text-blue-300" : "text-[#0d2562]"}>{firstPart}</span>{" "}
      <span className={isDarkPaper ? "text-sky-400" : "text-[#2563eb]"}>{lastWord}</span>
    </>
  );
}

/**
 * Robust title renderer supporting both custom rich HTML, multi-line line breaks, and fallback dual-tone.
 */
export function renderDynamicTitle(
  titleHtml?: string,
  name?: string,
  sectionTextColor?: string,
  isDarkPaper?: boolean
): React.ReactNode {
  const strippedHtml = titleHtml ? titleHtml.replace(/<[^>]*>/g, "").trim() : "";
  if (titleHtml && strippedHtml) {
    return (
      <span
        dangerouslySetInnerHTML={{ __html: titleHtml }}
        className="inline select-text whitespace-pre-wrap break-words"
        style={sectionTextColor ? { color: sectionTextColor } : undefined}
      />
    );
  }

  const trimmed = (name || "").trim();
  if (!trimmed) return null;

  if (sectionTextColor) {
    return <span style={{ color: sectionTextColor }} className="whitespace-pre-wrap break-words">{trimmed}</span>;
  }

  if (trimmed.includes("\n")) {
    const lines = trimmed.split("\n");
    return (
      <span className="whitespace-pre-wrap break-words inline-block">
        {lines.map((line, lIdx) => (
          <React.Fragment key={lIdx}>
            {lIdx > 0 && <br />}
            {renderDynamicTitle(undefined, line, sectionTextColor, isDarkPaper)}
          </React.Fragment>
        ))}
      </span>
    );
  }

  const parts = trimmed.split(/\s+/);
  if (parts.length <= 1) {
    return <span className={isDarkPaper ? "text-white" : "text-[#050a1a]"}>{trimmed}</span>;
  }

  const mainPart = parts.slice(0, -1).join(" ");
  const accentWord = parts[parts.length - 1];

  return (
    <>
      <span className={isDarkPaper ? "text-white" : "text-[#050a1a]"}>{mainPart}</span>{" "}
      <span className={isDarkPaper ? "text-sky-400" : "text-[#2563eb]"}>{accentWord}</span>
    </>
  );
}

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
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDoubleClick();
      }}
      title={title}
    >
      {renderDynamicText(html, value)}
    </Tag>
  );
}


"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
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
  initialValue: string;
  initialHtml?: string;
  isDarkPaper?: boolean;
  defaultFontSize?: number;
  multiline?: boolean;
  className?: string;
  placeholder?: string;
  onSave: (plainText: string, html: string) => void;
  onCancel: () => void;
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
  className = "",
  placeholder = "Type text...",
  onSave,
  onCancel,
}: DynamicTextEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);

  const [selectedFont, setSelectedFont] = useState<string>("Inter");
  const [fontSize, setFontSize] = useState<number>(defaultFontSize);
  const [activeColor, setActiveColor] = useState<string>("#2563eb");
  const [fontMenuOpen, setFontMenuOpen] = useState(false);
  const [colorMenuOpen, setColorMenuOpen] = useState(false);
  const [customHex, setCustomHex] = useState("#2563eb");

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

  // Auto-commit when clicking completely outside this editor container
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        if (editorRef.current) {
          const html = editorRef.current.innerHTML;
          const plainText = (editorRef.current.innerText || "").trim();
          onSave(plainText || initialValue, html);
        }
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleOutsideClick);
    }, 200);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [initialValue, onSave]);

  // Keep savedRangeRef synchronized whenever selection changes
  const handleSelectionChange = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !editorRef.current) return;
    const range = sel.getRangeAt(0);
    if (editorRef.current.contains(range.commonAncestorContainer)) {
      savedRangeRef.current = range.cloneRange();
    }
  }, []);

  useEffect(() => {
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [handleSelectionChange]);

  // Restore the saved selection range if focus shifted
  const restoreRange = (): boolean => {
    const sel = window.getSelection();
    if (!sel || !savedRangeRef.current || !editorRef.current) return false;
    try {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
      return true;
    } catch {
      return false;
    }
  };

  // Apply font size to the highlighted text (or entire container if nothing selected)
  const applyFontSize = (sizePx: number) => {
    setFontSize(sizePx);
    if (!editorRef.current) return;
    editorRef.current.focus();

    restoreRange();
    const sel = window.getSelection();

    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
      editorRef.current.style.fontSize = `${sizePx}px`;
      return;
    }

    const range = sel.getRangeAt(0);
    if (!editorRef.current.contains(range.commonAncestorContainer)) return;

    const span = document.createElement("span");
    span.style.fontSize = `${sizePx}px`;
    span.appendChild(range.extractContents());
    range.insertNode(span);
    sel.removeAllRanges();
    const newRange = document.createRange();
    newRange.selectNodeContents(span);
    sel.addRange(newRange);
    savedRangeRef.current = newRange.cloneRange();
  };

  // Apply color to the highlighted text (or entire container if nothing selected)
  const applyColor = (hex: string) => {
    setActiveColor(hex);
    setCustomHex(hex);
    if (!editorRef.current) return;
    editorRef.current.focus();

    restoreRange();
    const sel = window.getSelection();

    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
      editorRef.current.style.color = hex;
      return;
    }

    const range = sel.getRangeAt(0);
    if (!editorRef.current.contains(range.commonAncestorContainer)) return;

    try {
      document.execCommand("styleWithCSS", false, "true");
      document.execCommand("foreColor", false, hex);
    } catch {
      const span = document.createElement("span");
      span.style.color = hex;
      span.appendChild(range.extractContents());
      range.insertNode(span);
      sel.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(span);
      sel.addRange(newRange);
      savedRangeRef.current = newRange.cloneRange();
    }
  };

  // Apply font family to selection (or entire container)
  const applyFont = (fontOption: TitleFontOption) => {
    setSelectedFont(fontOption.name);
    setFontMenuOpen(false);
    if (!editorRef.current) return;
    editorRef.current.focus();

    restoreRange();
    const sel = window.getSelection();

    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
      editorRef.current.style.fontFamily = fontOption.family;
      return;
    }

    const range = sel.getRangeAt(0);
    if (!editorRef.current.contains(range.commonAncestorContainer)) return;

    const span = document.createElement("span");
    span.style.fontFamily = fontOption.family;
    span.appendChild(range.extractContents());
    range.insertNode(span);
    sel.removeAllRanges();
    const newRange = document.createRange();
    newRange.selectNodeContents(span);
    sel.addRange(newRange);
    savedRangeRef.current = newRange.cloneRange();
  };

  // Bold, Italic, Underline
  const applyExecCommand = (command: "bold" | "italic" | "underline") => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    restoreRange();
    document.execCommand("styleWithCSS", false, "true");
    document.execCommand(command, false);
  };

  // Commit and Save
  const handleSave = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    const plainText = (editorRef.current.innerText || "").trim();
    onSave(plainText || initialValue, html);
  };

  return (
    <div ref={containerRef} className="relative my-1 select-text w-full">
      {/* ── Compact Word Formatting Toolbar directly attached above the input ── */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1.5 p-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-md text-xs select-none">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Font Family Dropdown */}
          <div className="relative">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setFontMenuOpen(!fontMenuOpen);
                setColorMenuOpen(false);
              }}
              className="h-7 px-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center gap-1 text-slate-800 dark:text-zinc-200 font-semibold cursor-pointer shadow-2xs"
              title="Font Family"
            >
              <Type className="w-3 h-3 text-[#2563eb]" />
              <span className="max-w-[85px] truncate text-[11px]">{selectedFont}</span>
              <ChevronDown className="w-2.5 h-2.5 opacity-60" />
            </button>

            {fontMenuOpen && (
              <div
                onMouseDown={(e) => e.preventDefault()}
                className="absolute left-0 top-full mt-1.5 w-52 max-h-64 overflow-y-auto rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#11151e] shadow-2xl p-1 z-50 animate-fadeIn"
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
              </div>
            )}
          </div>

          {/* Font Size Stepper */}
          <div className="flex items-center rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 px-1 py-0.5 shadow-2xs">
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

          <div className="w-px h-5 bg-slate-200 dark:bg-zinc-800" />

          {/* B, I, U Word Toggles */}
          <div className="flex items-center gap-0.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 p-0.5 shadow-2xs">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyExecCommand("bold")}
              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold cursor-pointer"
              title="Bold (Ctrl+B)"
            >
              <Bold className="w-3 h-3" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyExecCommand("italic")}
              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 italic cursor-pointer"
              title="Italic (Ctrl+I)"
            >
              <Italic className="w-3 h-3" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyExecCommand("underline")}
              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 underline cursor-pointer"
              title="Underline (Ctrl+U)"
            >
              <Underline className="w-3 h-3" />
            </button>
          </div>

          <div className="w-px h-5 bg-slate-200 dark:bg-zinc-800" />

          {/* Word-Style Text Color Tool ('A' with color bar) */}
          <div className="relative">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setColorMenuOpen(!colorMenuOpen);
                setFontMenuOpen(false);
              }}
              className="h-7 px-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center gap-1 cursor-pointer shadow-2xs"
              title="Text Color (Select text and click color)"
            >
              <div className="flex flex-col items-center">
                <span className="text-[11px] font-black leading-none">A</span>
                <span className="w-3 h-0.5 mt-0.5 rounded-full" style={{ backgroundColor: activeColor }} />
              </div>
              <ChevronDown className="w-2.5 h-2.5 opacity-60" />
            </button>

            {colorMenuOpen && (
              <div
                onMouseDown={(e) => e.preventDefault()}
                className="absolute left-0 top-full mt-1.5 w-60 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#11151e] shadow-2xl p-3 z-50 space-y-2.5 animate-fadeIn"
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
                      className="w-7 h-7 rounded-lg border border-slate-300 dark:border-zinc-700 hover:scale-110 transition-transform cursor-pointer shadow-2xs relative flex items-center justify-center"
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
                      onChange={(e) => setCustomHex(e.target.value)}
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
              </div>
            )}
          </div>

          {/* Quick Color Swatches Row */}
          <div className="flex items-center gap-1 pl-1">
            {TITLE_THEME_COLORS.map((col) => (
              <button
                key={col.hex}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyColor(col.hex)}
                className="w-4 h-4 rounded-full border border-slate-300/80 dark:border-zinc-700 hover:scale-125 transition-transform cursor-pointer shadow-2xs"
                style={{ backgroundColor: col.hex }}
                title={`Apply ${col.name} to selected text`}
              />
            ))}
          </div>
        </div>

        {/* Action Controls: Save & Cancel */}
        <div className="flex items-center gap-1 ml-auto">
          <button
            type="button"
            onClick={handleSave}
            className="h-7 px-3 rounded-lg bg-[#2563eb] text-white hover:bg-blue-700 font-bold flex items-center gap-1 cursor-pointer shadow-xs"
            title="Save (Enter)"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="h-7 px-2 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 cursor-pointer"
            title="Cancel (Esc)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── The Single Editable Text Input ── */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onKeyDown={(e) => {
          if (!multiline && e.key === "Enter") {
            e.preventDefault();
            handleSave();
          }
          if (multiline && e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleSave();
          }
          if (e.key === "Escape") {
            onCancel();
          }
        }}
        style={{
          fontSize: `${defaultFontSize}px`,
        }}
        className={`w-full min-h-[38px] px-3 py-1.5 rounded-xl border-2 border-[#2563eb] bg-white dark:bg-zinc-900 outline-none shadow-sm select-text ${className}`}
        aria-label={placeholder}
      />
    </div>
  );
}

/**
 * Section Title Editor (alias over DynamicTextEditor configured for main title typography)
 */
export function DynamicTitleEditor({
  initialName,
  initialHtml,
  isDarkPaper,
  onSave,
  onCancel,
}: {
  initialName: string;
  initialHtml?: string;
  isDarkPaper?: boolean;
  paperTone?: string;
  onSave: (name: string, html: string) => void;
  onCancel: () => void;
}) {
  return (
    <DynamicTextEditor
      initialValue={initialName}
      initialHtml={initialHtml}
      isDarkPaper={isDarkPaper}
      defaultFontSize={40}
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
        className="inline select-text"
        style={sectionTextColor ? { color: sectionTextColor } : undefined}
      />
    );
  }
  return <span style={sectionTextColor ? { color: sectionTextColor } : undefined}>{plainText || ""}</span>;
}

/**
 * Dual-tone eyebrow renderer with rich HTML support.
 */
export function renderDynamicEyebrow(
  eyebrowHtml?: string,
  eyebrow?: string,
  sectionTextColor?: string,
  isDarkPaper?: boolean
): React.ReactNode {
  if (eyebrowHtml && eyebrowHtml.trim()) {
    return (
      <span
        dangerouslySetInnerHTML={{ __html: eyebrowHtml }}
        className="inline select-text"
        style={sectionTextColor ? { color: sectionTextColor } : undefined}
      />
    );
  }

  const trimmed = (eyebrow || "").trim();
  if (!trimmed) return null;
  if (sectionTextColor) {
    return <span style={{ color: sectionTextColor }}>{trimmed}</span>;
  }
  const parts = trimmed.split(/\s+/);
  if (parts.length <= 1) {
    return <span className={isDarkPaper ? "text-sky-400" : "text-[#0d2562] dark:text-sky-400"}>{trimmed}</span>;
  }
  const firstPart = parts.slice(0, -1).join(" ");
  const lastWord = parts[parts.length - 1];
  return (
    <>
      <span className={isDarkPaper ? "text-blue-300" : "text-[#0d2562] dark:text-blue-300"}>{firstPart}</span>{" "}
      <span className={isDarkPaper ? "text-sky-400" : "text-[#2563eb] dark:text-sky-400"}>{lastWord}</span>
    </>
  );
}

/**
 * Robust title renderer supporting both custom rich HTML and fallback dual-tone.
 */
export function renderDynamicTitle(
  titleHtml?: string,
  name?: string,
  sectionTextColor?: string,
  isDarkPaper?: boolean
): React.ReactNode {
  if (titleHtml && titleHtml.trim()) {
    return (
      <span
        dangerouslySetInnerHTML={{ __html: titleHtml }}
        className="inline select-text"
        style={sectionTextColor ? { color: sectionTextColor } : undefined}
      />
    );
  }

  const trimmed = (name || "").trim();
  if (!trimmed) return null;

  if (sectionTextColor) {
    return <span style={{ color: sectionTextColor }}>{trimmed}</span>;
  }

  const parts = trimmed.split(/\s+/);
  if (parts.length <= 1) {
    return <span className={isDarkPaper ? "text-white" : "text-[#050a1a] dark:text-white"}>{trimmed}</span>;
  }

  const mainPart = parts.slice(0, -1).join(" ");
  const accentWord = parts[parts.length - 1];

  return (
    <>
      <span className={isDarkPaper ? "text-white" : "text-[#050a1a] dark:text-white"}>{mainPart}</span>{" "}
      <span className={isDarkPaper ? "text-sky-400" : "text-[#2563eb] dark:text-sky-400"}>{accentWord}</span>
    </>
  );
}

"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Check,
  X,
  Type,
  ChevronDown,
  Sparkles,
  Pipette,
  Bold,
  Italic,
  Underline,
  Eye,
  Minus,
  Plus,
  Palette,
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
  { name: "Violet", hex: "#7c3aed" },
  { name: "Emerald Green", hex: "#059669" },
  { name: "Teal", hex: "#0d9488" },
  { name: "Sunset Amber", hex: "#d97706" },
  { name: "Crimson Red", hex: "#dc2626" },
  { name: "Rose Pink", hex: "#e11d48" },
  { name: "Slate Gray", hex: "#475569" },
  { name: "Pure White", hex: "#ffffff" },
];

export const DUAL_TONE_PRESETS = [
  { name: "Azure Blue", primary: "#050a1a", accent: "#2563eb" },
  { name: "AyantrAI Purple", primary: "#050a1a", accent: "#9D61FF" },
  { name: "Emerald Safety", primary: "#050a1a", accent: "#059669" },
  { name: "Amber Warning", primary: "#050a1a", accent: "#d97706" },
  { name: "Crimson Alert", primary: "#050a1a", accent: "#dc2626" },
  { name: "Solid Dark", primary: "#050a1a", accent: "#050a1a" },
];

export interface DynamicTitleEditorProps {
  initialName: string;
  initialHtml?: string;
  isDarkPaper?: boolean;
  paperTone?: string;
  onSave: (name: string, html: string) => void;
  onCancel: () => void;
}

/**
 * Microsoft Word-style dynamic title editor with live WYSIWYG preview in edit mode.
 * Allows selecting ANY word or range of text and applying specific text colors,
 * font families, font sizes, weights, and styles.
 */
export function DynamicTitleEditor({
  initialName,
  initialHtml,
  isDarkPaper,
  paperTone = "white",
  onSave,
  onCancel,
}: DynamicTitleEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);

  const [selectedText, setSelectedText] = useState<string>("");
  const [selectedFont, setSelectedFont] = useState<string>("Inter");
  const [fontSize, setFontSize] = useState<number>(40);
  const [activeColor, setActiveColor] = useState<string>("#2563eb");
  const [fontMenuOpen, setFontMenuOpen] = useState(false);
  const [colorMenuOpen, setColorMenuOpen] = useState(false);
  const [customHex, setCustomHex] = useState("#2563eb");
  const [words, setWords] = useState<string[]>([]);
  const [liveHtml, setLiveHtml] = useState<string>("");
  const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(null);

  // Compute paper background tone for live preview
  const paperBgColor = React.useMemo(() => {
    switch (paperTone) {
      case "slate":
        return "#f1f5f9";
      case "cream":
        return "#fefce8";
      case "dark":
        return "#11151e";
      default:
        return "#ffffff";
    }
  }, [paperTone]);

  // Initialize HTML content on mount
  useEffect(() => {
    if (!editorRef.current) return;
    let initialRendered = "";
    if (initialHtml && initialHtml.trim()) {
      initialRendered = initialHtml;
    } else {
      const trimmed = (initialName || "").trim();
      const parts = trimmed.split(/\s+/);
      if (parts.length <= 1) {
        const color = isDarkPaper ? "#ffffff" : "#050a1a";
        initialRendered = `<span style="color: ${color}; font-weight: 900;">${trimmed}</span>`;
      } else {
        const firstPart = parts.slice(0, -1).join(" ");
        const lastWord = parts[parts.length - 1];
        const primaryColor = isDarkPaper ? "#ffffff" : "#050a1a";
        const accentColor = isDarkPaper ? "#38bdf8" : "#2563eb";
        initialRendered = `<span style="color: ${primaryColor}; font-weight: 900;">${firstPart}</span> <span style="color: ${accentColor}; font-weight: 900;">${lastWord}</span>`;
      }
    }
    editorRef.current.innerHTML = initialRendered;
    setLiveHtml(initialRendered);
    updateWordsFromEditor();
  }, [initialHtml, initialName, isDarkPaper]);

  const updateWordsFromEditor = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || "";
    const list = text.trim().split(/\s+/).filter(Boolean);
    setWords(list);
    setLiveHtml(editorRef.current.innerHTML);
  };

  // Keep savedRangeRef synchronized on selection changes
  const handleSelectionChange = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !editorRef.current) {
      return;
    }
    const range = sel.getRangeAt(0);
    if (editorRef.current.contains(range.commonAncestorContainer)) {
      savedRangeRef.current = range.cloneRange();
      const str = range.toString();
      setSelectedText(str);
    } else {
      setSelectedText("");
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

  // Apply color to selection (or entire editor if nothing selected)
  const applyColor = (hex: string) => {
    setActiveColor(hex);
    setCustomHex(hex);
    if (!editorRef.current) return;
    editorRef.current.focus();

    restoreRange();
    const sel = window.getSelection();

    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
      // If no text specifically highlighted, apply to the entire title container
      editorRef.current.style.color = hex;
      setLiveHtml(editorRef.current.innerHTML);
      return;
    }

    const range = sel.getRangeAt(0);
    if (!editorRef.current.contains(range.commonAncestorContainer)) return;

    // Apply color specifically to the selected range
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

    setLiveHtml(editorRef.current.innerHTML);
    updateWordsFromEditor();
  };

  // Apply font family to selection (or entire editor)
  const applyFont = (fontOption: TitleFontOption) => {
    setSelectedFont(fontOption.name);
    setFontMenuOpen(false);
    if (!editorRef.current) return;
    editorRef.current.focus();

    restoreRange();
    const sel = window.getSelection();

    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
      editorRef.current.style.fontFamily = fontOption.family;
      setLiveHtml(editorRef.current.innerHTML);
      return;
    }

    const range = sel.getRangeAt(0);
    if (!editorRef.current.contains(range.commonAncestorContainer)) return;

    try {
      document.execCommand("styleWithCSS", false, "true");
      document.execCommand("fontName", false, fontOption.family);
    } catch {
      const span = document.createElement("span");
      span.style.fontFamily = fontOption.family;
      span.appendChild(range.extractContents());
      range.insertNode(span);
      sel.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(span);
      sel.addRange(newRange);
      savedRangeRef.current = newRange.cloneRange();
    }

    setLiveHtml(editorRef.current.innerHTML);
    updateWordsFromEditor();
  };

  // Apply Bold, Italic, Underline
  const applyExecCommand = (command: "bold" | "italic" | "underline") => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    restoreRange();
    document.execCommand("styleWithCSS", false, "true");
    document.execCommand(command, false);
    setLiveHtml(editorRef.current.innerHTML);
    updateWordsFromEditor();
  };

  // Programmatically select a specific word in the editor
  const selectWord = (wordText: string, index: number) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    setSelectedWordIndex(index);

    const walker = document.createTreeWalker(editorRef.current, NodeFilter.SHOW_TEXT, null);
    let currentNode: Node | null;
    let matchCount = 0;

    while ((currentNode = walker.nextNode())) {
      const val = currentNode.nodeValue || "";
      const pos = val.indexOf(wordText);
      if (pos !== -1) {
        if (matchCount === index || matchCount >= 0) {
          const range = document.createRange();
          range.setStart(currentNode, pos);
          range.setEnd(currentNode, pos + wordText.length);
          const sel = window.getSelection();
          if (sel) {
            sel.removeAllRanges();
            sel.addRange(range);
            savedRangeRef.current = range.cloneRange();
            setSelectedText(wordText);
          }
          return;
        }
        matchCount++;
      }
    }
  };

  // Apply quick dual-tone preset
  const applyDualTonePreset = (primary: string, accent: string) => {
    if (!editorRef.current) return;
    const text = (editorRef.current.innerText || "").trim();
    if (!text) return;
    const parts = text.split(/\s+/);
    if (parts.length <= 1) {
      editorRef.current.innerHTML = `<span style="color: ${accent}; font-weight: 900;">${text}</span>`;
    } else {
      const first = parts.slice(0, -1).join(" ");
      const last = parts[parts.length - 1];
      editorRef.current.innerHTML = `<span style="color: ${primary}; font-weight: 900;">${first}</span> <span style="color: ${accent}; font-weight: 900;">${last}</span>`;
    }
    updateWordsFromEditor();
  };

  // Commit and Save
  const handleSave = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    const plainText = (editorRef.current.innerText || "").trim();
    onSave(plainText || initialName, html);
  };

  return (
    <div className="relative my-2 p-3.5 rounded-2xl border-2 border-[#2563eb] bg-white dark:bg-[#0c1017] shadow-2xl space-y-3 z-30 animate-fadeIn">
      {/* ── Microsoft Word-Style Formatting Ribbon ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200 dark:border-zinc-800 text-xs select-none">
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
              className="h-7 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center gap-1.5 text-slate-800 dark:text-zinc-200 font-semibold cursor-pointer shadow-2xs"
              title="Font Family"
            >
              <Type className="w-3.5 h-3.5 text-[#2563eb]" />
              <span className="max-w-[100px] truncate">{selectedFont}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
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
                const next = Math.max(20, fontSize - 2);
                setFontSize(next);
                if (editorRef.current) editorRef.current.style.fontSize = `${next}px`;
              }}
              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 cursor-pointer"
              title="Decrease Font Size"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="px-1.5 font-mono text-[11px] font-bold text-slate-800 dark:text-zinc-200">
              {fontSize}px
            </span>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                const next = Math.min(64, fontSize + 2);
                setFontSize(next);
                if (editorRef.current) editorRef.current.style.fontSize = `${next}px`;
              }}
              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 cursor-pointer"
              title="Increase Font Size"
            >
              <Plus className="w-3 h-3" />
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
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyExecCommand("italic")}
              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 italic cursor-pointer"
              title="Italic (Ctrl+I)"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyExecCommand("underline")}
              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 underline cursor-pointer"
              title="Underline (Ctrl+U)"
            >
              <Underline className="w-3.5 h-3.5" />
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
              className="h-7 px-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Text Color (Applies to selection)"
            >
              <div className="flex flex-col items-center">
                <span className="text-xs font-black leading-none">A</span>
                <span className="w-3.5 h-1 mt-0.5 rounded-full" style={{ backgroundColor: activeColor }} />
              </div>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {colorMenuOpen && (
              <div
                onMouseDown={(e) => e.preventDefault()}
                className="absolute left-0 top-full mt-1.5 w-60 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#11151e] shadow-2xl p-3 z-50 space-y-2.5 animate-fadeIn"
              >
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {selectedText ? `Color for "${selectedText}"` : "Color for Text"}
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

          {/* Quick Color Swatches Bar */}
          <div className="hidden sm:flex items-center gap-1 pl-1">
            {TITLE_THEME_COLORS.slice(0, 6).map((col) => (
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

        {/* Action Controls: Done & Cancel */}
        <div className="flex items-center gap-1.5 ml-auto">
          <button
            type="button"
            onClick={handleSave}
            className="h-7 px-3 rounded-lg bg-[#2563eb] text-white hover:bg-blue-700 font-bold flex items-center gap-1 cursor-pointer shadow-xs"
            title="Save Title (Enter)"
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

      {/* ── Selection Status & Interactive Word Chips ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-semibold text-slate-400">Words:</span>
          {words.map((w, idx) => (
            <button
              key={`${w}-${idx}`}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => selectWord(w, idx)}
              className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                selectedText === w || selectedWordIndex === idx
                  ? "bg-blue-100 text-blue-800 border-blue-400 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-600 shadow-xs ring-1 ring-blue-400"
                  : "bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:border-blue-300"
              }`}
              title={`Click to select "${w}" and apply color/font`}
            >
              <span>{w}</span>
            </button>
          ))}
        </div>

        {/* Dual-Tone Quick Presets */}
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-[#9D61FF]" />
          <span className="text-[10px] uppercase font-bold text-slate-400">Presets:</span>
          {DUAL_TONE_PRESETS.slice(0, 3).map((p) => (
            <button
              key={p.name}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyDualTonePreset(p.primary, p.accent)}
              className="px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 hover:bg-blue-50 text-[10px] font-semibold text-slate-700 dark:text-zinc-300 cursor-pointer"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── Selection Action Banner (When Text is Selected) ── */}
      {selectedText ? (
        <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#2563eb]">Selected text:</span>
            <span className="px-2 py-0.5 rounded font-mono font-bold bg-white dark:bg-zinc-900 text-[#2563eb] border border-blue-300 dark:border-blue-800 shadow-2xs">
              &ldquo;{selectedText}&rdquo;
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-semibold text-slate-500 mr-1">Apply Color:</span>
            {TITLE_THEME_COLORS.slice(0, 5).map((col) => (
              <button
                key={col.hex}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyColor(col.hex)}
                className="w-4 h-4 rounded-full border border-slate-300 hover:scale-125 transition-transform cursor-pointer shadow-2xs"
                style={{ backgroundColor: col.hex }}
                title={`Apply ${col.name} to "${selectedText}"`}
              />
            ))}
          </div>
        </div>
      ) : null}

      {/* ── Rich ContentEditable Title Canvas (Input Mode) ── */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={updateWordsFromEditor}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSave();
            }
            if (e.key === "Escape") {
              onCancel();
            }
          }}
          style={{
            fontSize: `${fontSize}px`,
            fontFamily: TITLE_FONTS.find((f) => f.name === selectedFont)?.family || "'Inter', sans-serif",
          }}
          className="w-full min-h-[58px] font-black tracking-[-0.035em] leading-[1.08] px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 outline-none focus:ring-2 focus:ring-[#2563eb]/40 select-text"
          aria-label="Rich Section Title Editor"
        />
      </div>

      {/* ── LIVE PREVIEW IN EDIT MODE (Requested by User) ── */}
      <div
        className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800/80 shadow-inner space-y-1.5 transition-all overflow-hidden"
        style={{ backgroundColor: paperBgColor }}
      >
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
          <div className="flex items-center gap-1.5 text-[#2563eb]">
            <Eye className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider">Live Document Preview (Real-Time Result)</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200/60 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
            Paper: {paperTone} • {selectedFont} • {fontSize}px
          </span>
        </div>

        {/* Exact Live Rendered Output */}
        <div
          className="min-h-[50px] font-black tracking-[-0.035em] leading-[1.08] select-none py-1.5 transition-all"
          style={{
            fontSize: `${fontSize}px`,
            fontFamily: TITLE_FONTS.find((f) => f.name === selectedFont)?.family || "'Inter', sans-serif",
          }}
          dangerouslySetInnerHTML={{
            __html: liveHtml || "<span class='text-slate-300 italic'>Type title above...</span>",
          }}
        />
      </div>
    </div>
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
  // If user has custom rich HTML, render it directly
  if (titleHtml && titleHtml.trim()) {
    return (
      <span
        dangerouslySetInnerHTML={{ __html: titleHtml }}
        className="inline select-text"
        style={sectionTextColor ? { color: sectionTextColor } : undefined}
      />
    );
  }

  // Fallback to dual-tone word split
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

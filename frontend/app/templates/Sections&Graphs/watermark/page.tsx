"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Stamp,
  ArrowLeft,
  UploadCloud,
  FileCode,
  Trash2,
  Eye,
  AlertCircle,
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  Sun,
  Moon,
  Grid,
  Download,
  Plus,
  Minus,
  RefreshCw,
  Code2,
  Check,
  X,
} from "lucide-react";
import { Tooltip } from "@/app/Component";

export interface UploadedSvgWatermark {
  id: string;
  name: string;
  fileName: string;
  svgContent: string;
  uploadedAt: string;
  sizeBytes: number;
  scale?: number; // Size scale in percentage (can be negative, e.g. -200% to +200%)
}

const STORAGE_KEY = "ayantrai_uploaded_watermark_svgs";

// Initial seed watermarks if local storage is completely empty on first visit
const INITIAL_SEEDS: UploadedSvgWatermark[] = [
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

export default function WatermarkPage() {
  const [watermarks, setWatermarks] = useState<UploadedSvgWatermark[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Upload & Drag-and-drop state
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Paste Raw SVG Modal State
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [pasteSvgContent, setPasteSvgContent] = useState("");
  const [pasteSvgName, setPasteSvgName] = useState("");
  const [pasteError, setPasteError] = useState<string | null>(null);

  // Preview & Scale controls (Scale can be negative e.g. -200% to +200%)
  const [previewTheme, setPreviewTheme] = useState<"light" | "dark" | "grid">("light");
  const [sizeScale, setSizeScale] = useState<number>(100);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setWatermarks(parsed);
          if (parsed.length > 0) {
            setSelectedId(parsed[0].id);
            setSizeScale(parsed[0].scale ?? 100);
          } else {
            setSelectedId(null);
          }
          setIsLoaded(true);
          return;
        }
      }
      // First visit: start with empty list so only user-uploaded SVGs are shown
      setWatermarks([]);
      setSelectedId(null);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    } catch (e) {
      console.warn("Failed to load watermarks from localStorage:", e);
      setWatermarks([]);
      setSelectedId(null);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  const persistWatermarks = (updated: UploadedSvgWatermark[]) => {
    setWatermarks(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn("Failed to save watermarks to localStorage:", e);
    }
  };

  // Sync sizeScale when selected watermark changes
  const handleSelectWatermark = (wm: UploadedSvgWatermark) => {
    setSelectedId(wm.id);
    setSizeScale(wm.scale ?? 100);
    setUploadError(null);
  };

  // Update scale for currently selected watermark and persist
  const handleUpdateScale = (newScale: number) => {
    const clamped = Math.max(-200, Math.min(200, newScale));
    setSizeScale(clamped);

    if (selectedId) {
      const updated = watermarks.map((w) =>
        w.id === selectedId ? { ...w, scale: clamped } : w
      );
      persistWatermarks(updated);
    }
  };

  // Selected watermark
  const selectedWatermark = watermarks.find((w) => w.id === selectedId) || null;

  // Process uploaded SVG files (accepts ANY valid SVG file)
  const handleProcessFiles = async (files: FileList | File[]) => {
    setUploadError(null);
    setUploadSuccess(null);

    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    const newEntries: UploadedSvgWatermark[] = [];
    const errors: string[] = [];

    for (const file of fileList) {
      try {
        const text = await file.text();
        // Check for presence of <svg tag (case-insensitive)
        if (!/<svg[\s>]/i.test(text)) {
          errors.push(`"${file.name}" does not appear to contain valid <svg> vector markup.`);
          continue;
        }

        const cleanName = file.name
          .replace(/\.svg$/i, "")
          .replace(/[-_]/g, " ")
          .trim();
        const formattedName = cleanName ? cleanName.charAt(0).toUpperCase() + cleanName.slice(1) : file.name;

        newEntries.push({
          id: `wm-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          name: formattedName || file.name,
          fileName: file.name.endsWith(".svg") ? file.name : `${file.name}.svg`,
          svgContent: text,
          uploadedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
          sizeBytes: file.size,
          scale: 100,
        });
      } catch (err: any) {
        errors.push(`Failed to read "${file.name}".`);
      }
    }

    if (errors.length > 0) {
      setUploadError(errors.join(" "));
    }

    if (newEntries.length > 0) {
      const updated = [...newEntries, ...watermarks];
      persistWatermarks(updated);
      setSelectedId(newEntries[0].id);
      setSizeScale(100);
      setUploadSuccess(`Uploaded ${newEntries.length} vector SVG${newEntries.length > 1 ? "s" : ""} to library!`);
    }
  };

  // Add SVG by direct code paste
  const handleAddPastedSvg = () => {
    setPasteError(null);
    if (!pasteSvgContent.trim()) {
      setPasteError("Please paste your SVG markup code.");
      return;
    }

    if (!/<svg[\s>]/i.test(pasteSvgContent)) {
      setPasteError("Pasted text does not contain valid <svg> tags.");
      return;
    }

    const name = pasteSvgName.trim() || `Pasted SVG ${watermarks.length + 1}`;
    const cleanFileName = `${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}.svg`;

    const newEntry: UploadedSvgWatermark = {
      id: `wm-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      name,
      fileName: cleanFileName,
      svgContent: pasteSvgContent.trim(),
      uploadedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      sizeBytes: new Blob([pasteSvgContent]).size,
      scale: 100,
    };

    const updated = [newEntry, ...watermarks];
    persistWatermarks(updated);
    setSelectedId(newEntry.id);
    setSizeScale(100);
    setIsPasteModalOpen(false);
    setPasteSvgContent("");
    setPasteSvgName("");
    setUploadSuccess(`Added "${name}" to watermark library!`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessFiles(e.target.files);
      e.target.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFiles(e.dataTransfer.files);
    }
  };

  // Delete a single watermark from the list & localStorage
  const handleDelete = (id: string, name: string) => {
    const updated = watermarks.filter((w) => w.id !== id);
    persistWatermarks(updated);
    if (selectedId === id) {
      const next = updated[0] || null;
      setSelectedId(next ? next.id : null);
      setSizeScale(next?.scale ?? 100);
    }
    setUploadSuccess(`Deleted "${name}" from watermark library.`);
  };

  // Clear all watermarks from list & localStorage
  const handleClearAll = () => {
    if (watermarks.length === 0) return;
    persistWatermarks([]);
    setSelectedId(null);
    setSizeScale(100);
    setUploadSuccess("Cleared all watermarks from local storage.");
  };

  // Reset to default seeds
  const handleResetToSeeds = () => {
    persistWatermarks(INITIAL_SEEDS);
    setSelectedId(INITIAL_SEEDS[0].id);
    setSizeScale(INITIAL_SEEDS[0].scale ?? 100);
    setUploadSuccess("Restored default vector watermark presets.");
    setUploadError(null);
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return "Vector SVG";
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  return (
    <div className="w-full h-full flex-1 min-h-0 flex flex-col overflow-hidden bg-transparent">
      {/* Top Header Bar */}
      <div className="px-6 py-2.5 flex-shrink-0 flex items-center justify-between border-b border-slate-200/70 dark:border-zinc-800/70 bg-transparent">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-purple-500/10 text-[#9D61FF]">
            <Stamp className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Watermark SVG Library
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-500/10 text-[#9D61FF] font-bold border border-purple-500/20">
              {watermarks.length} SVGs Uploaded
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Paste SVG Markup button */}
          <button
            type="button"
            onClick={() => setIsPasteModalOpen(true)}
            className="h-8.5 px-3 rounded-xl border border-slate-200/80 dark:border-zinc-800/80 hover:bg-slate-100/60 dark:hover:bg-zinc-800/60 text-slate-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs hover:border-[#9D61FF]/40"
          >
            <Code2 className="w-3.5 h-3.5 text-[#9D61FF]" />
            <span className="hidden sm:inline">Paste SVG Code</span>
          </button>

          {/* Back to Sections button */}
          <Link
            href="/templates/Sections&Graphs"
            className="h-8.5 px-3 rounded-xl border border-slate-200/80 dark:border-zinc-800/80 hover:bg-slate-100/60 dark:hover:bg-zinc-800/60 text-slate-700 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs hover:border-[#9D61FF]/40 hover:text-[#9D61FF]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sections</span>
          </Link>
        </div>
      </div>

      {/* Main Studio Body: Left List & Upload Zone + Right Live Preview */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden bg-transparent">
        {/* ==================================================================== */}
        {/* LEFT COLUMN: Upload SVG & List All Uploaded SVGs                     */}
        {/* ==================================================================== */}
        <div className="w-full lg:w-[420px] xl:w-[460px] flex-shrink-0 border-r border-slate-200/80 dark:border-zinc-800/80 flex flex-col min-h-0 h-full overflow-hidden bg-white/40 dark:bg-zinc-950/20">
          {/* Upload Zone */}
          <div className="p-4 border-b border-slate-200/70 dark:border-zinc-800/70 space-y-2 flex-shrink-0">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-[#9D61FF]" />
                <span>Upload Vector SVG</span>
              </label>
              <span className="text-[10px] font-mono text-[#9D61FF] bg-purple-500/10 px-2 py-0.5 rounded font-bold">
                ANY .SVG
              </span>
            </div>

            {/* Drag & Drop Card */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-1.5 ${
                isDragging
                  ? "border-[#9D61FF] bg-purple-500/15 scale-[1.01]"
                  : "border-slate-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 hover:border-[#9D61FF]/60 hover:bg-purple-500/5"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".svg,image/svg+xml,text/xml"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-9 h-9 rounded-2xl bg-purple-500/10 text-[#9D61FF] border border-purple-500/20 flex items-center justify-center shadow-xs">
                <UploadCloud className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Drop any SVG file here, or <span className="text-[#9D61FF] underline">browse</span>
                </p>
                <p className="text-[10.5px] text-slate-500 dark:text-zinc-400 mt-0.5">
                  Accepts any vector SVG • Saved in local storage
                </p>
              </div>
            </div>

            {/* Error Banner */}
            {uploadError && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center justify-between animate-fadeIn">
                <div className="flex items-center gap-2 min-w-0">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{uploadError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setUploadError(null)}
                  className="text-rose-500 hover:text-rose-700 text-xs font-mono ml-2 p-0.5 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Success Banner */}
            {uploadSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center justify-between animate-fadeIn">
                <div className="flex items-center gap-2 min-w-0">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{uploadSuccess}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setUploadSuccess(null)}
                  className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-200 text-xs font-mono ml-2 p-0.5 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* List Header with Clear All Action */}
          <div className="px-4 py-2 border-b border-slate-200/60 dark:border-zinc-800/60 bg-slate-50/50 dark:bg-zinc-900/30 flex items-center justify-between text-xs text-slate-500 font-semibold flex-shrink-0">
            <span>Uploaded SVGs ({watermarks.length})</span>
            {watermarks.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-[10.5px] font-medium text-slate-400 hover:text-rose-500 cursor-pointer transition-colors"
                title="Delete all SVGs from list"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Scrollable List of Uploaded SVGs (Scrollbar Hidden) */}
          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden p-3 space-y-2">
            {!isLoaded ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Loading watermarks...
              </div>
            ) : watermarks.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 space-y-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-[#9D61FF] border border-purple-500/20 flex items-center justify-center mx-auto">
                  <Stamp className="w-5 h-5 opacity-70" />
                </div>
                <div>
                  <p className="font-semibold text-slate-700 dark:text-zinc-300 text-xs">
                    No SVGs uploaded yet
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Drop your SVG file above or browse to upload.
                  </p>
                </div>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleResetToSeeds}
                    className="text-[10.5px] text-[#9D61FF] hover:underline cursor-pointer"
                  >
                    + Load sample vector stamps
                  </button>
                </div>
              </div>
            ) : (
              watermarks.map((wm) => {
                const isSelected = selectedWatermark?.id === wm.id;

                return (
                  <div
                    key={wm.id}
                    onClick={() => handleSelectWatermark(wm)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer group flex items-center justify-between gap-3 ${
                      isSelected
                        ? "border-[#9D61FF] bg-[#9D61FF]/10 dark:bg-[#9D61FF]/15 shadow-sm ring-1 ring-[#9D61FF]/40"
                        : "border-slate-200/80 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/40 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-white dark:hover:bg-zinc-900/60"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Mini Thumbnail */}
                      <div className="w-14 h-11 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center overflow-hidden flex-shrink-0 p-1 shadow-2xs">
                        <div
                          className="w-full h-full flex items-center justify-center opacity-90"
                          dangerouslySetInnerHTML={{ __html: wm.svgContent }}
                        />
                      </div>

                      {/* Name & Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 justify-between">
                          <span
                            className={`text-xs font-bold truncate ${
                              isSelected
                                ? "text-[#9D61FF]"
                                : "text-slate-800 dark:text-zinc-200 group-hover:text-slate-900 dark:group-hover:text-white"
                            }`}
                          >
                            {wm.name}
                          </span>

                          {/* Selected badge */}
                          {isSelected && (
                            <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded font-bold bg-[#9D61FF]/20 text-[#9D61FF] flex items-center gap-1 flex-shrink-0">
                              <Eye className="w-2.5 h-2.5" /> Viewing
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 text-[10.5px] font-mono text-slate-500 dark:text-zinc-400 mt-0.5">
                          <span className="truncate max-w-[110px]">{wm.fileName}</span>
                          <span>•</span>
                          <span>{formatBytes(wm.sizeBytes)}</span>
                          {wm.scale !== undefined && wm.scale !== 100 && (
                            <>
                              <span>•</span>
                              <span className={wm.scale < 0 ? "text-amber-500 font-bold" : "text-[#9D61FF] font-semibold"}>
                                {wm.scale}%
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action: Delete from List */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(wm.id, wm.name);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete from list"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ==================================================================== */}
        {/* RIGHT COLUMN: Interactive Live SVG Preview                          */}
        {/* ==================================================================== */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-slate-50/50 dark:bg-zinc-950/30">
          {/* Preview Toolbar */}
          <div className="px-5 py-2.5 border-b border-slate-200/80 dark:border-zinc-800/80 flex items-center justify-between bg-white/40 dark:bg-zinc-900/40 flex-shrink-0 flex-wrap gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Eye className="w-3.5 h-3.5 text-[#9D61FF] flex-shrink-0" />
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate max-w-[160px] sm:max-w-[220px]">
                {selectedWatermark ? selectedWatermark.name : "No SVG Selected"}
              </span>
              {selectedWatermark && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 hidden sm:inline truncate max-w-[120px]">
                  {selectedWatermark.fileName}
                </span>
              )}
              {sizeScale < 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/30 flex items-center gap-1">
                  Minus / Inverted ({sizeScale}%)
                </span>
              )}
            </div>

            {/* Size Scale Controls (Supporting Minus Scale) & Delete Action */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* SIZE SCALE CONTROLS (SUPPORTS MINUS SCALE) */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs shadow-2xs">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                  Size Scale:
                </span>

                {/* Minus Stepper button (can step down into negative) */}
                <button
                  type="button"
                  onClick={() => handleUpdateScale(sizeScale - 10)}
                  className="p-1 hover:text-[#9D61FF] cursor-pointer rounded hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                  title="Decrease size scale (can go negative)"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                {/* Range Slider (-200% to +200%) */}
                <input
                  type="range"
                  min="-200"
                  max="200"
                  step="5"
                  value={sizeScale}
                  onChange={(e) => handleUpdateScale(parseInt(e.target.value))}
                  className="w-18 sm:w-24 h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#9D61FF]"
                  title={`Size Scale: ${sizeScale}%`}
                />

                {/* Plus Stepper button */}
                <button
                  type="button"
                  onClick={() => handleUpdateScale(sizeScale + 10)}
                  className="p-1 hover:text-[#9D61FF] cursor-pointer rounded hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                  title="Increase size scale"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>

                {/* Direct Number Input (Can type minus values like -100) */}
                <div className="flex items-center">
                  <input
                    type="number"
                    min="-200"
                    max="200"
                    value={sizeScale}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val)) handleUpdateScale(val);
                    }}
                    className={`w-13 px-1 py-0.5 rounded text-center font-mono text-[11px] font-bold border focus:outline-none focus:border-[#9D61FF] ${
                      sizeScale < 0
                        ? "text-amber-500 bg-amber-500/10 border-amber-500/30"
                        : "text-[#9D61FF] bg-purple-500/10 border-purple-500/20"
                    }`}
                  />
                  <span className={`font-mono text-[11px] font-bold ml-0.5 ${sizeScale < 0 ? "text-amber-500" : "text-[#9D61FF]"}`}>
                    %
                  </span>
                </div>

                {/* Flip Sign Button (Toggles between + and -) */}
                <button
                  type="button"
                  onClick={() => handleUpdateScale(sizeScale === 0 ? -100 : sizeScale * -1)}
                  className="px-1.5 py-0.5 rounded text-[10.5px] font-mono font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-[#9D61FF] hover:text-white transition-all cursor-pointer"
                  title="Toggle positive/negative sign (±)"
                >
                  ± Flip
                </button>

                {/* Quick 100% Reset Chip */}
                {sizeScale !== 100 && (
                  <button
                    type="button"
                    onClick={() => handleUpdateScale(100)}
                    className="px-1.5 py-0.5 rounded text-[10.5px] font-mono font-bold bg-purple-500/10 text-[#9D61FF] hover:bg-[#9D61FF] hover:text-white transition-all cursor-pointer"
                    title="Reset scale to default 100%"
                  >
                    100%
                  </button>
                )}

                {/* Quick Presets */}
                <div className="hidden xl:flex items-center gap-1 pl-1 border-l border-slate-200 dark:border-zinc-800">
                  {[-100, -50, 50, 100, 150].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleUpdateScale(preset)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                        sizeScale === preset
                          ? "bg-[#9D61FF] text-white shadow-2xs"
                          : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                      title={`Set scale to ${preset}%`}
                    >
                      {preset}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme / Background Toggle */}
              <div className="flex items-center gap-1 p-0.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs">
                <button
                  type="button"
                  onClick={() => setPreviewTheme("light")}
                  className={`p-1.5 rounded-lg cursor-pointer transition-all ${
                    previewTheme === "light"
                      ? "bg-[#9D61FF] text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title="Light Canvas"
                >
                  <Sun className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTheme("dark")}
                  className={`p-1.5 rounded-lg cursor-pointer transition-all ${
                    previewTheme === "dark"
                      ? "bg-[#9D61FF] text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title="Dark Canvas"
                >
                  <Moon className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTheme("grid")}
                  className={`p-1.5 rounded-lg cursor-pointer transition-all ${
                    previewTheme === "grid"
                      ? "bg-[#9D61FF] text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title="Technical Blueprint Grid"
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Delete Current SVG button from preview header */}
              {selectedWatermark && (
                <button
                  type="button"
                  onClick={() => handleDelete(selectedWatermark.id, selectedWatermark.name)}
                  className="h-8 px-2.5 rounded-xl border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Delete this SVG from library"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              )}
            </div>
          </div>

          {/* Live Preview Canvas Stage */}
          <div className="flex-1 min-h-0 overflow-auto custom-scrollbar p-6 flex items-center justify-center">
            {selectedWatermark ? (
              <div
                className={`w-full max-w-[640px] h-[480px] max-h-[calc(100vh-210px)] rounded-3xl shadow-xl relative overflow-hidden border p-6 flex flex-col justify-between transition-colors ${
                  previewTheme === "light"
                    ? "bg-white text-slate-900 border-slate-200/90"
                    : previewTheme === "dark"
                    ? "bg-zinc-900 text-white border-zinc-800"
                    : "bg-[#0b101b] text-white border-zinc-800"
                }`}
              >
                {/* Blueprint grid pattern overlay if selected */}
                {previewTheme === "grid" && (
                  <div
                    className="absolute inset-0 pointer-events-none opacity-25"
                    style={{
                      backgroundImage: "radial-gradient(#9D61FF 1px, transparent 1px)",
                      backgroundSize: "22px 22px",
                    }}
                  />
                )}

                {/* Light canvas subtle dot pattern */}
                {previewTheme === "light" && (
                  <div
                    className="absolute inset-0 pointer-events-none opacity-20"
                    style={{
                      backgroundImage: "radial-gradient(#CBD5E1 1px, transparent 1px)",
                      backgroundSize: "20px 20px",
                    }}
                  />
                )}

                {/* Top Header inside preview card */}
                <div className="relative z-10 flex items-center justify-between text-[11px] font-mono pb-2 border-b border-current/10">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">SCALE:</span>
                    <span className={`font-bold ${sizeScale < 0 ? "text-amber-500" : "text-[#9D61FF]"}`}>
                      {sizeScale}% {sizeScale < 0 ? "(INVERTED / MINUS)" : sizeScale === 100 ? "(DEFAULT)" : ""}
                    </span>
                  </div>

                  {sizeScale !== 100 && (
                    <button
                      type="button"
                      onClick={() => handleUpdateScale(100)}
                      className="text-[10.5px] font-mono font-bold text-[#9D61FF] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> Reset 100%
                    </button>
                  )}
                </div>

                {/* Centered SVG Render with Proportional Bounds & Negative Scale Support */}
                <div className="relative z-10 w-full flex-1 flex items-center justify-center p-6 overflow-hidden">
                  <div
                    className="w-full h-full max-w-[480px] max-h-[270px] flex items-center justify-center transition-transform duration-150 drop-shadow-sm [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full"
                    style={{
                      transform: `scale(${sizeScale === 0 ? 0.01 : sizeScale / 100})`,
                      transformOrigin: "center center",
                    }}
                    dangerouslySetInnerHTML={{ __html: selectedWatermark.svgContent }}
                  />
                </div>

                {/* SVG Metadata Footer Badge */}
                <div className="relative z-10 flex items-center justify-between text-[11px] font-mono opacity-65 border-t pt-2.5 border-current/10">
                  <span className="truncate max-w-[220px]">NAME: {selectedWatermark.fileName}</span>
                  <span>SIZE: {formatBytes(selectedWatermark.sizeBytes)}</span>
                  <span className="hidden sm:inline">DATE: {selectedWatermark.uploadedAt}</span>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-400 text-xs space-y-2">
                <Stamp className="w-10 h-10 mx-auto opacity-30 text-slate-400" />
                <p className="font-semibold text-slate-600 dark:text-zinc-400">
                  No SVG selected for preview
                </p>
                <p className="text-[11px] text-slate-400">
                  Upload an SVG or click an item from the left list to view.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* MODAL: Paste Raw SVG Code                                           */}
      {/* ==================================================================== */}
      {isPasteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl p-6 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-purple-500/10 text-[#9D61FF] border border-purple-500/20 flex items-center justify-center">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Paste SVG Vector Code
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Add SVG directly by pasting its XML/vector markup
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPasteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 text-xs font-mono p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Watermark Name (optional)
              </label>
              <input
                type="text"
                value={pasteSvgName}
                onChange={(e) => setPasteSvgName(e.target.value)}
                placeholder="e.g. AyantrAI Logo Stamp"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/40 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-[#9D61FF]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                SVG Markup Code *
              </label>
              <textarea
                rows={6}
                value={pasteSvgContent}
                onChange={(e) => setPasteSvgContent(e.target.value)}
                placeholder={`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">\n  <circle cx="50" cy="50" r="40" stroke="#9D61FF" stroke-width="3" fill="none" />\n</svg>`}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/40 text-xs font-mono text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-[#9D61FF] custom-scrollbar"
              />
            </div>

            {pasteError && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{pasteError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60 dark:border-zinc-800/60">
              <button
                type="button"
                onClick={() => setIsPasteModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddPastedSvg}
                className="px-4 py-2 rounded-xl bg-[#9D61FF] hover:bg-[#8B4FE8] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Add to Library</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

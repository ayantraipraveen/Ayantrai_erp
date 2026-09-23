"use client";

import React, { useState } from "react";
import { X, MoveUp, MoveDown, Sparkles } from "lucide-react";
import { CustomDropdown } from "../../Component";
import { useTemplates, availableBlockTypes } from "./TemplatesContext";
import { TemplateBlock } from "@/lib/redux/slices/reportModuleSlice";

/**
 * Slide-out visual builder drawer for creating new report templates.
 * Takes ZERO props - reads directly from TemplatesContext.
 */
export default function TemplateBuilderDrawer() {
  const {
    builderOpen,
    setBuilderOpen,
    siteBuilderOptions,
    handleCreateTemplate,
    sites,
  } = useTemplates();

  const [templateName, setTemplateName] = useState("");
  const [templateDesc, setTemplateDesc] = useState("");
  const [selectedSiteId, setSelectedSiteId] = useState(sites[0]?.id || "SITE-01");
  const [builderBlocks, setBuilderBlocks] = useState<TemplateBlock[]>(
    availableBlockTypes.map((b, idx) => ({
      id: `blk-custom-${idx + 1}`,
      type: b.type,
      title: b.title,
      description: b.description,
      enabled: true,
      order: idx + 1,
    }))
  );

  if (!builderOpen) return null;

  const toggleBlock = (index: number) => {
    setBuilderBlocks((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], enabled: !next[index].enabled };
      return next;
    });
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === builderBlocks.length - 1) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    setBuilderBlocks((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy.map((b, i) => ({ ...b, order: i + 1 }));
    });
  };

  const onSubmit = (status: "pending" | "draft") => {
    const success = handleCreateTemplate(templateName, templateDesc, selectedSiteId, builderBlocks, status);
    if (success) {
      setTemplateName("");
      setTemplateDesc("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-white dark:bg-[#0a0d13] border-l border-slate-200 dark:border-zinc-800 p-6 flex flex-col justify-between h-full overflow-y-auto shadow-2xl animate-slideLeft text-slate-900 dark:text-white">
        <div className="space-y-5">
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-4">
            <div>
              <div className="text-[10px] font-mono text-[#9D61FF] uppercase font-bold tracking-wider">
                Block-Based Visual Builder
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                New Safety Report Template
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setBuilderOpen(false)}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* General Metadata Fields */}
          <div className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Template Name *
              </label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g. Monthly Subcontractor Safety & Geotechnical Audit"
                className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#9D61FF]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 block">
                Target Industrial Site
              </label>
              <CustomDropdown
                options={siteBuilderOptions}
                value={selectedSiteId}
                onChange={setSelectedSiteId}
                size="sm"
                placeholder="Select site..."
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Operational Scope / Description
              </label>
              <textarea
                rows={2}
                value={templateDesc}
                onChange={(e) => setTemplateDesc(e.target.value)}
                placeholder="Brief description of the reporting scope, telemetry sources, and audit criteria."
                className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#9D61FF]"
              />
            </div>
          </div>

          {/* 7 Section Blocks Configurator */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                Report Section Blocks ({builderBlocks.filter((b) => b.enabled).length} Enabled):
              </span>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                Reorder priority with arrows
              </span>
            </div>

            <div className="space-y-2">
              {builderBlocks.map((blk, idx) => (
                <div
                  key={blk.id}
                  className={`p-3 rounded-xl border transition-all ${
                    blk.enabled
                      ? "border-[#9D61FF]/50 bg-purple-500/5 dark:bg-[#0f131c]"
                      : "border-slate-200 dark:border-zinc-800/60 opacity-50 bg-slate-50 dark:bg-zinc-950"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={blk.enabled}
                        onChange={() => toggleBlock(idx)}
                        className="rounded text-[#9D61FF] focus:ring-[#9D61FF] cursor-pointer"
                      />
                      <div>
                        <div className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{blk.title}</span>
                          <span className="text-[9px] font-mono text-slate-400 dark:text-zinc-500">
                            #{idx + 1}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-zinc-400">
                          {blk.description}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveBlock(idx, "up")}
                        disabled={idx === 0}
                        className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-20 transition-colors cursor-pointer"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveBlock(idx, "down")}
                        disabled={idx === builderBlocks.length - 1}
                        className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-20 transition-colors cursor-pointer"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Builder Actions Footer */}
        <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3 mt-6">
          <button
            type="button"
            onClick={() => onSubmit("draft")}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 text-xs font-medium hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer"
          >
            Save as Draft
          </button>

          <button
            type="button"
            onClick={() => onSubmit("pending")}
            className="px-5 py-2 rounded-xl glow-btn-primary font-bold text-xs flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Submit for Approval</span>
          </button>
        </div>
      </div>
    </div>
  );
}

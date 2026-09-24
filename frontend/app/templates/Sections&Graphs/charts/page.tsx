"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  addChartToSection,
  showGlobalToast,
  setTemplateActiveTab,
  GraphType,
} from "@/lib/redux/slices/reportModuleSlice";
import ChartEditorPanel from "../../components/sections/ChartEditorPanel";
import { ArrowLeft, BarChart2 } from "lucide-react";
import Link from "next/link";

/**
 * Dedicated Full-Page Route for Telemetry Chart Studio (/templates/Sections&Graphs/charts).
 * Enables creating, customizing, theming, and configuring telemetry visualizations.
 */
export default function SectionsGraphsChartsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const librarySections = useAppSelector(
    (state) => state.reportModule.librarySections || []
  );

  const [chartTitle, setChartTitle] = useState("");
  const [chartType, setChartType] = useState<GraphType>("bar");
  const [chartDesc, setChartDesc] = useState("");
  const [chartColor, setChartColor] = useState("#9D61FF");
  const [chartColors, setChartColors] = useState<string[]>(["#9D61FF"]);
  const [gridRows, setGridRows] = useState(4);
  const [gridCols, setGridCols] = useState(7);

  const handleReturnToTemplates = () => {
    dispatch(setTemplateActiveTab("sections"));
    router.push("/templates");
  };

  const handleSaveChart = () => {
    if (!chartTitle.trim()) {
      dispatch(
        showGlobalToast({
          message: "Please enter a chart title before saving.",
          type: "warning",
        })
      );
      return;
    }

    const finalColors = chartColors && chartColors.length > 0 ? chartColors : [chartColor];
    const targetSection = librarySections[0];

    if (targetSection) {
      dispatch(
        addChartToSection({
          sectionId: targetSection.id,
          chart: {
            title: chartTitle.trim(),
            chartType,
            dataSourceField: "custom_telemetry_feed",
            description: chartDesc.trim(),
            color: chartColor,
            colors: finalColors,
            gridRows: chartType === "heatmap" || chartType === "table" ? gridRows : undefined,
            gridCols: chartType === "heatmap" || chartType === "table" ? gridCols : undefined,
          },
        })
      );
      dispatch(
        showGlobalToast({
          message: `Telemetry chart saved to "${targetSection.name}"!`,
          type: "success",
        })
      );
    } else {
      dispatch(
        showGlobalToast({
          message: "Telemetry chart configuration saved!",
          type: "success",
        })
      );
    }

    handleReturnToTemplates();
  };

  return (
    <div className="animate-fadeIn w-full h-full flex-1 min-h-0 flex flex-col overflow-hidden bg-white dark:bg-[#0c1017]">
      {/* Top Breadcrumb Navigation */}
      <div className="px-4 sm:px-6 lg:px-7 py-2.5 flex-shrink-0 flex items-center justify-between gap-3 border-b border-slate-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-[#0c1017]/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/templates"
            onClick={() => dispatch(setTemplateActiveTab("sections"))}
            className="h-8.5 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sections</span>
          </Link>
          <div className="h-4 w-[1px] bg-slate-200 dark:bg-zinc-800" />
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-purple-500/10 text-[#9D61FF]">
              <BarChart2 className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Sections &amp; Graphs / Telemetry Chart Studio
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReturnToTemplates}
          className="text-xs font-semibold text-[#9D61FF] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
        >
          ← Back to All Sections
        </button>
      </div>

      {/* Main Chart Editor Studio */}
      <div className="flex-1 min-h-0 flex flex-col w-full overflow-hidden">
        <ChartEditorPanel
          editingChart={null}
          chartTitle={chartTitle}
          setChartTitle={setChartTitle}
          chartType={chartType}
          setChartType={setChartType}
          chartDesc={chartDesc}
          setChartDesc={setChartDesc}
          chartColor={chartColor}
          setChartColor={setChartColor}
          chartColors={chartColors}
          setChartColors={setChartColors}
          gridRows={gridRows}
          setGridRows={setGridRows}
          gridCols={gridCols}
          setGridCols={setGridCols}
          onSave={handleSaveChart}
          onClose={handleReturnToTemplates}
        />
      </div>
    </div>
  );
}

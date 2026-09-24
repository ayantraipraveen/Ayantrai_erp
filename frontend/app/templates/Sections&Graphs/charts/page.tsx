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
import { ChartEditorPanel } from "../components";
import Link from "next/link";
import { ArrowLeft, BarChart2 } from "lucide-react";

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
    router.push("/templates/Sections&Graphs");
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
    <div className="animate-fadeIn w-full h-full flex-1 min-h-0 flex flex-col overflow-hidden bg-transparent">
      {/* Top Bar with Back to Sections Button */}
      <div className="px-6 py-2.5 flex-shrink-0 flex items-center justify-between border-b border-slate-200/60 dark:border-zinc-800/60 bg-transparent">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/10 text-[#9D61FF]">
            <BarChart2 className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            Telemetry Chart Studio
          </span>
        </div>
        <Link
          href="/templates/Sections&Graphs"
          className="h-8.5 px-3 rounded-xl border border-slate-200/80 dark:border-zinc-800/80 hover:bg-slate-100/60 dark:hover:bg-zinc-800/60 text-slate-700 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs hover:border-[#9D61FF]/40 hover:text-[#9D61FF]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sections</span>
        </Link>
      </div>

      {/* Main Fullscreen Chart Studio */}
      <div className="flex-1 min-h-0 flex flex-col w-full overflow-hidden bg-transparent">
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
          hideTitleAndCaption={true}
          hideFooter={true}
        />
      </div>
    </div>
  );
}

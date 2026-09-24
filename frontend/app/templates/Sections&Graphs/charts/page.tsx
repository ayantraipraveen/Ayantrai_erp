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
    <div className="animate-fadeIn w-full h-full flex-1 min-h-0 flex flex-col overflow-hidden">
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
          hideTitleAndCaption={true}
          hideFooter={true}
        />
      </div>
    </div>
  );
}

"use client";

import React, { Suspense, useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  Layers,
  Building,
  FileText,
  BarChart2,
  ArrowRight,
  ArrowLeft,
  Stamp,
  Sliders,
  Loader2,
  Calendar,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  addTemplate,
  updateTemplate,
  createLibrarySection,
  setSelectedLibrarySectionId,
  showGlobalToast,
  CoverPageData,
  DEFAULT_COVER_PAGE_DATA,
  DEFAULT_BACK_COVER_DATA,
  CanvasRow,
  TemplateBlock,
} from "@/lib/redux/slices/reportModuleSlice";
import SectionCanvasEditor from "../Sections&Graphs/components/SectionCanvasEditor";
import { CustomDropdown } from "../../../app/Component";

type TemplateCategory = "monthly" | "weekly" | "incident" | "shift";
type SecurityClassification = "CONFIDENTIAL" | "RESTRICTED" | "INTERNAL";

const CATEGORY_OPTIONS: { id: TemplateCategory; label: string; subtext: string }[] = [
  { id: "monthly", label: "Monthly Statutory", subtext: "30-day ISO audit cycle" },
  { id: "weekly", label: "Weekly Ops Audit", subtext: "Subcontractor telemetry" },
  { id: "incident", label: "Incident Investigation", subtext: "CAPA & forensic log" },
  { id: "shift", label: "Daily Shift Handover", subtext: "Muster & permit log" },
];


/**
 * Dedicated Route for Template Blueprint Creation & Studio (/templates/create).
 * Step 1: Full-page Template Details Planning Architecture.
 * Step 2: Full-screen visual Canvas Studio with Cover Page, Sections, and Back Cover Page.
 */
function CreateTemplatePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const templateIdParam = searchParams.get("templateId") || searchParams.get("id");
  const stepParam = searchParams.get("step");

  const templates = useAppSelector((s) => s.reportModule.templates || []);
  const sites = useAppSelector((s) => s.reportModule.sites || []);
  const librarySections = useAppSelector((s) => s.reportModule.librarySections || []);
  const watermarks = useAppSelector((s) => s.reportModule.watermarks || []);
  const activeRole = useAppSelector((s) => s.reportModule.activeRole);

  const existingTemplate = useMemo(() => {
    return templates.find((t) => t.id === templateIdParam) || null;
  }, [templates, templateIdParam]);

  const isEditing = Boolean(existingTemplate);

  // Auto-generate next Blueprint ID (e.g. TPL-004) or use existing ID
  const activeBlueprintId = useMemo(() => {
    if (existingTemplate) return existingTemplate.id;
    const maxNum = templates.reduce((max, t) => {
      const match = t.id.match(/TPL-(\d+)/);
      const num = match ? parseInt(match[1], 10) : 0;
      return num > max ? num : max;
    }, 0);
    return `TPL-${String(maxNum + 1).padStart(3, "0")}`;
  }, [templates, existingTemplate]);

  // Current Step: "plan" (Details Planning full page) or "studio" (Canvas Studio)
  const [step, setStep] = useState<"plan" | "studio">(stepParam === "studio" ? "studio" : "plan");
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  // Form States: Identity & Scope
  const [templateName, setTemplateName] = useState(
    existingTemplate ? existingTemplate.name : "Monthly Subcontractor Safety & Geotechnical Audit"
  );
  const [selectedSiteId, setSelectedSiteId] = useState(
    existingTemplate ? existingTemplate.site_id : sites[0]?.id || "SITE-01"
  );
  const [category, setCategory] = useState<TemplateCategory>(
    (existingTemplate?.category as TemplateCategory) || "monthly"
  );
  const [scopeDescription, setScopeDescription] = useState(
    existingTemplate
      ? existingTemplate.description
      : "Comprehensive statutory health, safety & telemetry audit assessing subcontractor workforce compliance, connected PPE sensor metrics, and environmental threshold logs."
  );

  // Form States: Governance & Standards
  const [selectedStandards, setSelectedStandards] = useState<string[]>(
    existingTemplate?.complianceStandards || ["iso-45001", "statutory-audit"]
  );
  const [attachAuditHash, setAttachAuditHash] = useState(
    existingTemplate?.hasAuditHash !== undefined ? existingTemplate.hasAuditHash : true
  );

  // Form States: Cover Page Metadata
  const [coverEyebrow, setCoverEyebrow] = useState(
    existingTemplate?.coverPageData?.eyebrow || "STATUTORY COMPLIANCE & GEOTECHNICAL AUDIT"
  );
  const [leadAuditor, setLeadAuditor] = useState(
    existingTemplate?.coverPageData?.preparedBy ||
      existingTemplate?.created_by ||
      "Vikram Seth (Site Admin)"
  );
  const [classification, setClassification] = useState<SecurityClassification>(
    (existingTemplate?.coverPageData?.classification as SecurityClassification) || "CONFIDENTIAL"
  );
  const [selectedWatermarkId, setSelectedWatermarkId] = useState<string>(
    watermarks.find((w) => w.isDefault)?.id || watermarks[0]?.id || "wm-default"
  );

  // Form States: Blueprint Sections Picker
  const [selectedSectionIds, setSelectedSectionIds] = useState<string[]>(() => {
    if (existingTemplate && existingTemplate.blocks && existingTemplate.blocks.length > 0) {
      const blockIds = existingTemplate.blocks.map((b) => b.id.replace("blk-", ""));
      const matched = librarySections
        .filter((s) => blockIds.includes(s.id) || blockIds.includes(s.type || ""))
        .map((s) => s.id);
      if (matched.length > 0) return matched;
    }
    return librarySections.map((s) => s.id);
  });

  const siteDropdownOptions = useMemo(() => {
    return sites.map((s) => ({
      value: s.id,
      label: `${s.name} (${s.id})`,
    }));
  }, [sites]);

  const selectedSite = useMemo(() => {
    return sites.find((s) => s.id === selectedSiteId) || sites[0];
  }, [sites, selectedSiteId]);

  // Live Summary Calculations
  const chosenSections = useMemo(() => {
    return librarySections.filter((s) => selectedSectionIds.includes(s.id));
  }, [librarySections, selectedSectionIds]);

  const totalChartsCount = useMemo(() => {
    return chosenSections.reduce((sum, s) => sum + (s.charts?.length || 0), 0);
  }, [chosenSections]);

  const totalCardsCount = useMemo(() => {
    return chosenSections.reduce((sum, s) => sum + (s.metricCards?.length || 0), 0);
  }, [chosenSections]);

  const toggleSection = (id: string) => {
    setSelectedSectionIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };


  // Convert chosen library sections to Blueprint TemplateBlock[]
  const buildTemplateBlocks = (): TemplateBlock[] => {
    return chosenSections.map((sec, idx) => ({
      id: `blk-${sec.id}`,
      type: sec.type === "core" ? "core" : "custom",
      title: sec.name,
      description: sec.description,
      enabled: true,
      order: idx + 1,
      isCustom: sec.type === "custom",
      graphs: (sec.charts || []).map((ch) => ({
        id: ch.id,
        title: ch.title,
        type: "bar",
        dataSource: "attendance_daily_shifts",
        description: ch.description,
      })),
    }));
  };

  // Compile Canvas Rows from chosen sections for full Canvas Studio artboard
  const compileCanvasRows = (): CanvasRow[] => {
    const rows: CanvasRow[] = [];
    chosenSections.forEach((sec, sIdx) => {
      const secRows = sec.canvasRows || [];
      if (secRows.length > 0) {
        secRows.forEach((r, rIdx) => {
          rows.push({
            ...r,
            id: `row-${sec.id}-${rIdx}-${Date.now()}`,
            pageBreakBefore: rIdx === 0 && sIdx > 0,
          });
        });
      }
    });
    return rows;
  };

  // Build the Cover Page Data based on user's planning inputs
  const buildCoverPageData = (): CoverPageData => {
    return {
      reportType: templateName.trim(),
      subtitle: coverEyebrow.trim(),
      reportingPeriod: "01 September 2025 – 30 September 2025",
      projectSite: selectedSite?.name || "Global / All Industrial Sites",
      preparedFor: "Superadmin Governance Board & Statutory Safety Committee",
      preparedBy: leadAuditor.trim() || "Vikram Seth (Site Admin)",
      eyebrow: coverEyebrow.trim(),
      classification,
      classificationBadgeColor:
        classification === "CONFIDENTIAL"
          ? "#ef4444"
          : classification === "RESTRICTED"
          ? "#f59e0b"
          : "#3b82f6",
      reportCode: activeBlueprintId,
      organizationLogoUrl: "/images/sitesafe-logo.svg",
    };
  };

  // Save as Draft (returns to /templates)
  const handleSaveDraft = () => {
    if (!templateName.trim()) {
      dispatch(showGlobalToast({ message: "Please provide a template title.", type: "warning" }));
      return;
    }

    const blocks = buildTemplateBlocks();
    const coverData = buildCoverPageData();

    if (isEditing && existingTemplate) {
      dispatch(
        updateTemplate({
          id: existingTemplate.id,
          name: templateName.trim(),
          description: scopeDescription.trim(),
          site_id: selectedSiteId,
          site_name: selectedSite?.name || "Global Sites",
          blocks,
          status: "draft",
          coverPageData: coverData,
          backCoverData: DEFAULT_BACK_COVER_DATA,
          category,
          frequency: category,
          complianceStandards: selectedStandards,
          hasAuditHash: attachAuditHash,
        })
      );
      dispatch(showGlobalToast({ message: `Template ${existingTemplate.id} updated as draft!`, type: "success" }));
    } else {
      dispatch(
        addTemplate({
          name: templateName.trim(),
          description: scopeDescription.trim(),
          site_id: selectedSiteId,
          site_name: selectedSite?.name || "Global Sites",
          blocks,
          status: "draft",
          created_by: `${leadAuditor} (${activeRole})`,
          category,
          frequency: category,
          complianceStandards: selectedStandards,
          hasAuditHash: attachAuditHash,
          coverPageData: coverData,
          backCoverData: DEFAULT_BACK_COVER_DATA,
        })
      );
      dispatch(showGlobalToast({ message: `Template ${activeBlueprintId} saved as draft!`, type: "success" }));
    }

    router.push("/templates");
  };

  // Execute & Launch Template Canvas Studio
  const handleExecuteAndLaunch = () => {
    if (!templateName.trim()) {
      dispatch(showGlobalToast({ message: "Please provide a template title.", type: "warning" }));
      return;
    }
    if (selectedSectionIds.length === 0) {
      dispatch(showGlobalToast({ message: "Please select at least 1 section for the blueprint.", type: "warning" }));
      return;
    }

    const blocks = buildTemplateBlocks();
    const coverData = buildCoverPageData();
    const compiledRows = compileCanvasRows();
    const compositeSectionId = existingTemplate?.canvasSectionId || `sec-tpl-${activeBlueprintId.toLowerCase()}`;

    if (isEditing && existingTemplate) {
      dispatch(
        updateTemplate({
          id: existingTemplate.id,
          name: templateName.trim(),
          description: scopeDescription.trim(),
          site_id: selectedSiteId,
          site_name: selectedSite?.name || "Global Sites",
          blocks,
          status: "pending",
          coverPageData: coverData,
          backCoverData: DEFAULT_BACK_COVER_DATA,
          category,
          frequency: category,
          complianceStandards: selectedStandards,
          hasAuditHash: attachAuditHash,
        })
      );
    } else {
      dispatch(
        addTemplate({
          name: templateName.trim(),
          description: scopeDescription.trim(),
          site_id: selectedSiteId,
          site_name: selectedSite?.name || "Global Sites",
          blocks,
          status: "pending",
          created_by: `${leadAuditor} (${activeRole})`,
          category,
          frequency: category,
          complianceStandards: selectedStandards,
          hasAuditHash: attachAuditHash,
          coverPageData: coverData,
          backCoverData: DEFAULT_BACK_COVER_DATA,
          canvasSectionId: compositeSectionId,
        })
      );
    }

    // Initialize or update composite section in librarySections
    const existingSec = librarySections.find((s) => s.id === compositeSectionId);
    if (!existingSec) {
      dispatch(
        createLibrarySection({
          id: compositeSectionId,
          name: templateName.trim(),
          eyebrow: coverEyebrow.trim(),
          description: scopeDescription.trim(),
          metricCards: [],
          charts: [],
          keyInsights: [],
          canvasRows: compiledRows,
          coverPageData: coverData,
          backCoverData: DEFAULT_BACK_COVER_DATA,
          watermarkId: selectedWatermarkId,
        })
      );
    }

    dispatch(setSelectedLibrarySectionId(compositeSectionId));
    setActiveSectionId(compositeSectionId);
    setStep("studio");

    dispatch(
      showGlobalToast({
        message: `Blueprint "${templateName.trim()}" initialized! Launching Template Canvas Studio...`,
        type: "success",
      })
    );
  };

  // If in Studio Mode, render full SectionCanvasEditor
  if (step === "studio" && activeSectionId) {
    return (
      <div className="animate-fadeIn w-full h-full flex-1 min-h-0 flex flex-col overflow-hidden bg-white dark:bg-[#07090d]">
        <SectionCanvasEditor
          sectionId={activeSectionId}
          onBack={() => setStep("plan")}
        />
      </div>
    );
  }

  // Step 1: Full Page Details Planning Screen (Not in a popup modal!)
  return (
    <div className="animate-fadeIn w-full h-full flex-1 min-h-0 flex flex-col overflow-y-auto bg-slate-50/60 dark:bg-[#080b10] text-slate-900 dark:text-white">
      
      {/* Top Header & Breadcrumb Bar */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-[#0c1017]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-zinc-800/80 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/templates"
            className="p-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back to Templates</span>
          </Link>
          <div className="h-4 w-px bg-slate-200 dark:bg-zinc-800 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-[#9D61FF] border border-purple-500/20">
              {isEditing ? `Editing Blueprint • ${activeBlueprintId}` : `Planning Phase • ${activeBlueprintId}`}
            </span>
            <span className="text-xs text-slate-400 font-mono hidden md:inline">
              Step 1 of 2: Blueprint Architecture
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer shadow-sm"
          >
            Save as Draft
          </button>
          <button
            type="button"
            onClick={handleExecuteAndLaunch}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#9D61FF] to-[#8035ea] hover:from-[#9254f8] hover:to-[#7227dc] text-white text-xs font-bold flex items-center gap-1.5 shadow-[0_2px_12px_rgba(157,97,255,0.35)] hover:shadow-[0_4px_20px_rgba(157,97,255,0.5)] transition-all active:scale-[0.98] cursor-pointer"
          >
            <span>{isEditing ? "Save & Launch Canvas" : "Execute & Launch Studio"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Page Body Container */}
      <div className="max-w-5xl w-full mx-auto py-6 sm:py-8 px-4 sm:px-6 space-y-6">
        
        {/* Banner Card */}
        <div className="p-5 sm:p-6 rounded-3xl border border-purple-500/20 bg-gradient-to-r from-purple-500/10 via-purple-500/5 to-transparent flex items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-[#9D61FF] text-white shadow-lg shadow-purple-500/20 flex-shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#9D61FF] font-bold">
                {isEditing ? "Interactive Blueprint Editor" : "New Blueprint Architecture"}
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                {isEditing ? `Edit Safety Report Template (${activeBlueprintId})` : "Report Template Blueprint Architecture"}
              </h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-2xl">
                Configure statutory audit criteria, target site bindings, cover page metadata, and attached section libraries before executing into the visual Canvas Studio.
              </p>
            </div>
          </div>

          <div className="hidden lg:flex flex-col items-end gap-1 flex-shrink-0 font-mono text-xs">
            <span className="text-slate-400">Blueprint Target:</span>
            <span className="font-bold text-[#9D61FF] bg-purple-500/10 px-2.5 py-1 rounded-xl border border-purple-500/20">
              {selectedSite?.name || "Global Sites"}
            </span>
          </div>
        </div>

        {/* Card 1: Template Identity & Industrial Site */}
        <div className="p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-bold text-sm">
              <div className="p-2 rounded-xl bg-purple-500/10 text-[#9D61FF]">
                <FileText className="w-4 h-4" />
              </div>
              <span>1. Template Identity &amp; Industrial Site</span>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Blueprint ID: <strong className="text-[#9D61FF]">{activeBlueprintId}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1 text-xs">
                Template Name *
              </label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g. Monthly Subcontractor Safety & Geotechnical Audit"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#9D61FF] shadow-sm transition-all"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1 text-xs">
                Target Industrial Site *
              </label>
              <CustomDropdown
                options={siteDropdownOptions}
                value={selectedSiteId}
                onChange={setSelectedSiteId}
                icon={Building}
                size="sm"
                className="h-11"
              />
            </div>
          </div>

          {/* Category / Frequency Selection Chips */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-2 text-xs">
              Audit Category &amp; Reporting Schedule
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {CATEGORY_OPTIONS.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#9D61FF] bg-[#9D61FF]/10 text-[#9D61FF] font-bold shadow-sm"
                        : "border-slate-200 dark:border-zinc-800 bg-slate-50/40 dark:bg-zinc-950 text-slate-600 dark:text-zinc-400 hover:border-slate-300 dark:hover:border-zinc-700"
                    }`}
                  >
                    <div className="text-xs font-semibold">{cat.label}</div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">{cat.subtext}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1 text-xs">
              Operational Scope &amp; Statutory Objectives
            </label>
            <textarea
              rows={3}
              value={scopeDescription}
              onChange={(e) => setScopeDescription(e.target.value)}
              placeholder="Detail the report scope, connected sensors, threshold limits, and inspection criteria..."
              className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#9D61FF] shadow-sm transition-all"
            />
          </div>
        </div>

        {/* Card 2: Cover Page & Presentation Architecture */}
        <div className="p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-bold text-sm">
              <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500">
                <Sliders className="w-4 h-4" />
              </div>
              <span>2. Cover Page &amp; Document Presentation</span>
            </div>
            <span className="text-xs font-mono text-slate-400">Fixed Page 1 in Studio</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1 text-xs">
                Document Subtitle / Eyebrow Header
              </label>
              <input
                type="text"
                value={coverEyebrow}
                onChange={(e) => setCoverEyebrow(e.target.value)}
                placeholder="e.g. STATUTORY COMPLIANCE & GEOTECHNICAL AUDIT"
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 text-xs font-mono uppercase text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#9D61FF]"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1 text-xs">
                Lead Auditor / Author
              </label>
              <input
                type="text"
                value={leadAuditor}
                onChange={(e) => setLeadAuditor(e.target.value)}
                placeholder="e.g. Vikram Seth (Site Admin)"
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#9D61FF]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1.5 text-xs">
                Security Classification Badge
              </label>
              <div className="flex items-center gap-2">
                {(["CONFIDENTIAL", "RESTRICTED", "INTERNAL"] as SecurityClassification[]).map((cls) => {
                  const isSelected = classification === cls;
                  return (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => setClassification(cls)}
                      className={`flex-1 py-2 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer text-center ${
                        isSelected
                          ? cls === "CONFIDENTIAL"
                            ? "border-rose-500 bg-rose-500/10 text-rose-500"
                            : cls === "RESTRICTED"
                            ? "border-amber-500 bg-amber-500/10 text-amber-500"
                            : "border-sky-500 bg-sky-500/10 text-sky-500"
                          : "border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 text-slate-500"
                      }`}
                    >
                      {cls}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1.5 text-xs">
                Assigned Watermark Stamp
              </label>
              <div className="h-10 px-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-800 dark:text-zinc-200 font-medium truncate">
                  <Stamp className="w-4 h-4 text-[#9D61FF]" />
                  <span>{watermarks.find((w) => w.id === selectedWatermarkId)?.name || "Standard Watermark"}</span>
                </span>
                <span className="text-[10px] text-emerald-500 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-md">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Blueprint Sections Library Picker */}
        <div className="p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-bold text-sm">
              <div className="p-2 rounded-xl bg-purple-500/10 text-[#9D61FF]">
                <Layers className="w-4 h-4" />
              </div>
              <span>3. Blueprint Sections &amp; Telemetry Modules</span>
            </div>
            <div className="text-xs font-mono px-3 py-1 rounded-full bg-purple-500/15 text-[#9D61FF] font-bold">
              {selectedSectionIds.length} of {librarySections.length} Selected
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {librarySections.map((sec) => {
              const isSelected = selectedSectionIds.includes(sec.id);
              const chartsCount = sec.charts?.length || 0;
              const cardsCount = sec.metricCards?.length || 0;

              return (
                <div
                  key={sec.id}
                  onClick={() => toggleSection(sec.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                    isSelected
                      ? "border-[#9D61FF]/60 bg-purple-500/5 shadow-sm"
                      : "border-slate-200 dark:border-zinc-800/80 bg-slate-50/30 dark:bg-zinc-950/40 opacity-70 hover:opacity-100"
                  }`}
                >
                  <div className="pt-0.5">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="rounded text-[#9D61FF] focus:ring-0 cursor-pointer"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {sec.name}
                      </span>
                      <span
                        className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full ${
                          sec.type === "core"
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : "bg-amber-500/15 text-amber-600"
                        }`}
                      >
                        {sec.type || "core"}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono mt-0.5 truncate">
                      {sec.eyebrow}
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                      <span className="flex items-center gap-1">
                        <BarChart2 className="w-3.5 h-3.5 text-[#9D61FF]" />
                        {chartsCount} {chartsCount === 1 ? "Chart" : "Charts"}
                      </span>
                      <span>•</span>
                      <span>{cardsCount} Metrics</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live Assembly Counter Banner */}
          <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-600 dark:text-zinc-400 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Studio Assembly:</span>
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              {chosenSections.length} Sections • {totalChartsCount} Charts • {totalCardsCount} Metric Cards
            </span>
          </div>
        </div>

        {/* Bottom Page Actions Bar */}
        <div className="p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] flex items-center justify-between gap-3 shadow-md">
          <Link
            href="/templates"
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </Link>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer shadow-sm"
            >
              Save as Draft
            </button>

            <button
              type="button"
              onClick={handleExecuteAndLaunch}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#9D61FF] to-[#8035ea] hover:from-[#9254f8] hover:to-[#7227dc] text-white text-xs font-bold flex items-center gap-2 shadow-[0_2px_12px_rgba(157,97,255,0.35)] hover:shadow-[0_4px_20px_rgba(157,97,255,0.5)] transition-all active:scale-[0.98] cursor-pointer"
            >
              <span>{isEditing ? "Save & Launch Canvas Studio" : "Execute & Launch Template Studio"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function CreateTemplateStudioPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 min-h-0 flex items-center justify-center bg-white dark:bg-[#07090d]">
          <div className="flex items-center gap-3 text-slate-500 dark:text-zinc-400">
            <Loader2 className="w-5 h-5 animate-spin text-[#9D61FF]" />
            <span className="text-sm font-semibold">Loading Template Blueprint Architecture...</span>
          </div>
        </div>
      }
    >
      <CreateTemplatePageContent />
    </Suspense>
  );
}

"use client";

import React, { useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  ReportTemplate,
  TemplateBlock,
  TemplateBlockType,
  addTemplate,
  updateTemplate,
  duplicateTemplate,
  updateTemplateRemark,
  approveTemplate,
  rejectTemplate,
  resubmitTemplate,
  deleteTemplate,
  setTemplateSearchQuery,
  setTemplateStatusFilter,
  setTemplateSiteFilter,
  setTemplateDateRange,
  setTemplateViewMode,
  setTemplateCurrentPage,
  setTemplatePageSize,
  resetTemplateFilters,
  setTemplateSelectedId,
  setTemplateEditingId,
  setTemplateReviewModalOpen,
  setTemplateBuilderOpen,
  setTemplateDeleteConfirmId,
  setTemplateToastMessage,
  showGlobalToast,
} from "@/lib/redux/slices/reportModuleSlice";
import {
  DropdownOption,
  DateRangeValue,
  DEFAULT_DATE_RANGE,
  isDateWithinRange,
} from "../../Component";
import { Building, Filter, Clock, CheckCircle2, FileText, XCircle } from "lucide-react";

export const availableBlockTypes: {
  type: TemplateBlockType;
  title: string;
  description: string;
}[] = [
  {
    type: "key_metrics",
    title: "Key Metrics",
    description: "KPI summary (attendance rate, compliance rate, risk-free hours, devices deployed)",
  },
  {
    type: "attendance_trends",
    title: "Attendance Trends",
    description: "Line chart + insight text (department-wise and vendor-wise breakdown)",
  },
  {
    type: "ppe_compliance_trends",
    title: "PPE Compliance Trends",
    description: "Bar chart + insight text (Smart Helmet, Vest IoT Hub, Safety Boot grounding)",
  },
  {
    type: "supervisory_insights",
    title: "Supervisory Insights",
    description: "Table (per-supervisor efficiency, response time, alert handling)",
  },
  {
    type: "device_utilisation",
    title: "Device Utilisation",
    description: "Progress bar (operating hours vs. permissible hours)",
  },
  {
    type: "operational_remarks",
    title: "Operational Remarks",
    description: "Text summary with environmental and shift-level observations",
  },
  {
    type: "improvement_action_plan",
    title: "Improvement & Action Plan",
    description: "Action matrix table (area, focus, owner, target date, status)",
  },
];

/**
 * Pure Redux Hook for Templates Module.
 * Connects directly to Redux store with ZERO React Context and ZERO props drilling.
 */
export function useTemplates() {
  const dispatch = useAppDispatch();
  const {
    templates,
    activeRole,
    sites,
    templateSearchQuery: searchQuery,
    templateStatusFilter: statusFilter,
    templateSiteFilter: siteFilter,
    templateDateRange: dateRange,
    templateViewMode: viewMode,
    templateCurrentPage: currentPage,
    templatePageSize: pageSize,
    templateSelectedId: selectedTemplateId,
    templateEditingId: editingTemplateId,
    templateReviewModalOpen: reviewModalOpen,
    templateBuilderOpen: builderOpen,
    templateDeleteConfirmId: deleteConfirmId,
    templateToastMessage: toastMessage,
  } = useAppSelector((state) => state.reportModule);

  // Selected template object derived from selectedTemplateId
  const selectedTemplate = useMemo(() => {
    if (!selectedTemplateId) return null;
    return templates.find((t) => t.id === selectedTemplateId) || null;
  }, [templates, selectedTemplateId]);

  // Editing template object derived from editingTemplateId
  const editingTemplate = useMemo(() => {
    if (!editingTemplateId) return null;
    return templates.find((t) => t.id === editingTemplateId) || null;
  }, [templates, editingTemplateId]);

  // Counts
  const totalCount = templates.length;
  const pendingCount = useMemo(() => templates.filter((t) => t.status === "pending").length, [templates]);
  const activeCount = useMemo(() => templates.filter((t) => t.status === "active").length, [templates]);
  const draftCount = useMemo(() => templates.filter((t) => t.status === "draft").length, [templates]);
  const rejectedCount = useMemo(() => templates.filter((t) => t.status === "rejected").length, [templates]);

  // Status Filter Options for CustomDropdown
  const statusFilterOptions: DropdownOption[] = useMemo(() => {
    return [
      {
        value: "all",
        label: "All Statuses",
        badge: `${totalCount}`,
        badgeColor: "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300",
        icon: Filter,
      },
      {
        value: "pending",
        label: "Pending Approval",
        badge: `${pendingCount}`,
        badgeColor: "bg-purple-500/20 text-purple-700 dark:text-[#9D61FF] border-purple-500/30",
        icon: Clock,
      },
      {
        value: "active",
        label: "Active Templates",
        badge: `${activeCount}`,
        badgeColor: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
        icon: CheckCircle2,
      },
      {
        value: "draft",
        label: "Drafts",
        badge: `${draftCount}`,
        badgeColor: "bg-slate-500/20 text-slate-600 dark:text-zinc-400",
        icon: FileText,
      },
      {
        value: "rejected",
        label: "Rejected",
        badge: `${rejectedCount}`,
        badgeColor: "bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30",
        icon: XCircle,
      },
    ];
  }, [totalCount, pendingCount, activeCount, draftCount, rejectedCount]);

  // Site Dropdown Options for Filter
  const siteFilterOptions: DropdownOption[] = useMemo(() => {
    return [
      { value: "all", label: "All Industrial Sites" },
      ...sites.map((s) => ({
        value: s.id,
        label: s.name,
        description: s.location,
        icon: Building,
      })),
    ];
  }, [sites]);

  // Site Dropdown Options for Builder
  const siteBuilderOptions: DropdownOption[] = useMemo(() => {
    return sites.map((s) => ({
      value: s.id,
      label: s.name,
      description: `${s.location} • ${s.active_workers} Workers`,
      icon: Building,
    }));
  }, [sites]);

  // Filtered Templates
  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      // Status filter
      if (statusFilter !== "all" && t.status !== statusFilter) {
        return false;
      }
      // Site filter
      if (siteFilter !== "all" && t.site_id !== siteFilter) {
        return false;
      }
      // Date range filter
      if (!isDateWithinRange(t.created_at, dateRange)) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = t.name.toLowerCase().includes(query);
        const matchesDesc = t.description.toLowerCase().includes(query);
        const matchesId = t.id.toLowerCase().includes(query);
        const matchesSite = t.site_name.toLowerCase().includes(query);
        const matchesAuthor = t.created_by.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesId && !matchesSite && !matchesAuthor) {
          return false;
        }
      }
      return true;
    });
  }, [templates, statusFilter, siteFilter, dateRange, searchQuery]);

  // Pagination calculations
  const totalFilteredCount = filteredTemplates.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredCount / pageSize));
  const validPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedTemplates = useMemo(() => {
    const start = (validPage - 1) * pageSize;
    return filteredTemplates.slice(start, start + pageSize);
  }, [filteredTemplates, validPage, pageSize]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    statusFilter !== "all" ||
    siteFilter !== "all" ||
    Boolean(
      dateRange.startDate ||
      dateRange.endDate ||
      (dateRange.preset && dateRange.preset !== "all_time")
    );

  // Setters dispatching directly to Redux
  const setSearchQuery = (query: string) => dispatch(setTemplateSearchQuery(query));
  const setStatusFilter = (status: string) => dispatch(setTemplateStatusFilter(status));
  const setSiteFilter = (site: string) => dispatch(setTemplateSiteFilter(site));
  const setDateRange = (range: DateRangeValue) => dispatch(setTemplateDateRange(range));
  const setViewMode = (mode: "table" | "grid") => dispatch(setTemplateViewMode(mode));
  const setCurrentPage = (page: number) => dispatch(setTemplateCurrentPage(page));
  const setPageSize = (size: number) => dispatch(setTemplatePageSize(size));
  const resetFilters = () => dispatch(resetTemplateFilters());

  const setSelectedTemplate = (tpl: ReportTemplate | null) =>
    dispatch(setTemplateSelectedId(tpl ? tpl.id : null));
  const setReviewModalOpen = (open: boolean) => dispatch(setTemplateReviewModalOpen(open));
  const setBuilderOpen = (open: boolean) => dispatch(setTemplateBuilderOpen(open));
  const setDeleteConfirmId = (id: string | null) => dispatch(setTemplateDeleteConfirmId(id));

  const showToast = (
    msg: string,
    type: "success" | "info" | "warning" | "error" = "info"
  ) => {
    dispatch(showGlobalToast({ message: msg, type }));
  };

  // Actions
  const handleApprove = (tpl: ReportTemplate) => {
    dispatch(
      approveTemplate({
        templateId: tpl.id,
        superadminName: "Dr. Vikram Seth (Superadmin)",
      })
    );
    dispatch(setTemplateReviewModalOpen(false));
    showToast(`Template "${tpl.name}" approved! Report auto-generated.`, "success");
  };

  const handleReject = (tpl: ReportTemplate, reason: string) => {
    if (!reason.trim()) {
      showToast("Please provide a reason for rejection.", "warning");
      return;
    }
    dispatch(
      rejectTemplate({
        templateId: tpl.id,
        reason,
        superadminName: "Dr. Vikram Seth (Superadmin)",
      })
    );
    dispatch(setTemplateReviewModalOpen(false));
    showToast(`Template "${tpl.name}" returned for revision.`, "warning");
  };

  const handleDelete = (id: string) => {
    dispatch(deleteTemplate(id));
    dispatch(setTemplateDeleteConfirmId(null));
    showToast("Template blueprint deleted.", "error");
  };

  const handleCreateTemplate = (
    name: string,
    desc: string,
    siteId: string,
    blocks: TemplateBlock[],
    status: "pending" | "draft"
  ): boolean => {
    if (!name.trim()) {
      showToast("Please provide a template title.");
      return false;
    }
    const site = sites.find((s) => s.id === siteId) || sites[0];
    const enabledBlocks = blocks.filter((b) => b.enabled);
    if (enabledBlocks.length === 0) {
      showToast("Please enable at least one section block.");
      return false;
    }

    dispatch(
      addTemplate({
        name,
        description: desc || "Custom block-based workforce safety template.",
        site_id: site.id,
        site_name: site.name,
        blocks: enabledBlocks,
        status,
        created_by: activeRole === "superadmin" ? "Dr. Vikram Seth (Superadmin)" : "Vikram Seth (Site Admin)",
      })
    );

    dispatch(setTemplateBuilderOpen(false));
    showToast(
      status === "pending"
        ? "Template submitted for Superadmin approval!"
        : "Template saved to drafts."
    );
    return true;
  };

  const setEditingTemplate = (tpl: ReportTemplate | null) => {
    dispatch(setTemplateEditingId(tpl ? tpl.id : null));
    if (tpl) {
      dispatch(setTemplateBuilderOpen(true));
    }
  };

  const handleDuplicate = (id: string) => {
    dispatch(duplicateTemplate(id));
    showToast("Template blueprint duplicated to drafts.", "success");
  };

  const handleUpdateTemplate = (
    id: string,
    name: string,
    desc: string,
    siteId: string,
    blocks: TemplateBlock[],
    status?: "draft" | "pending" | "active" | "rejected"
  ): boolean => {
    if (!name.trim()) {
      showToast("Please provide a template title.", "warning");
      return false;
    }
    const site = sites.find((s) => s.id === siteId) || sites[0];
    const enabledBlocks = blocks.filter((b) => b.enabled);
    if (enabledBlocks.length === 0) {
      showToast("Please enable at least one section block.", "warning");
      return false;
    }

    dispatch(
      updateTemplate({
        id,
        name,
        description: desc || "Custom block-based workforce safety template.",
        site_id: site.id,
        site_name: site.name,
        blocks: enabledBlocks,
        status,
      })
    );

    dispatch(setTemplateEditingId(null));
    dispatch(setTemplateBuilderOpen(false));
    showToast("Template updated successfully!", "success");
    return true;
  };

  const handleResubmit = (templateId: string) => {
    dispatch(resubmitTemplate(templateId));
    showToast("Template resubmitted for Superadmin review!", "info");
  };

  const handleUpdateRemark = (templateId: string, remarks: string) => {
    dispatch(updateTemplateRemark({ templateId, remarks }));
    showToast("Template remark saved.", "success");
  };

  return {
    templates,
    activeRole,
    sites,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    siteFilter,
    setSiteFilter,
    dateRange,
    setDateRange,
    viewMode,
    setViewMode,
    currentPage: validPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    totalFilteredCount,
    paginatedTemplates,
    resetFilters,
    hasActiveFilters,
    filteredTemplates,
    totalCount,
    pendingCount,
    activeCount,
    draftCount,
    rejectedCount,
    statusFilterOptions,
    siteFilterOptions,
    siteBuilderOptions,
    selectedTemplate,
    setSelectedTemplate,
    editingTemplate,
    setEditingTemplate,
    reviewModalOpen,
    setReviewModalOpen,
    builderOpen,
    setBuilderOpen,
    deleteConfirmId,
    setDeleteConfirmId,
    toastMessage,
    showToast,
    handleApprove,
    handleReject,
    handleResubmit,
    handleDelete,
    handleDuplicate,
    handleCreateTemplate,
    handleUpdateTemplate,
    handleUpdateRemark,
  };
}

/**
 * Backwards compatibility wrapper (renders children directly, no context).
 */
export function TemplatesProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

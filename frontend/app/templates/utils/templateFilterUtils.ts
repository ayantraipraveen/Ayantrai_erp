import { ReportTemplate } from "@/lib/redux/slices/reportModuleSlice";

export function filterTemplates(
  templates: ReportTemplate[],
  filters: {
    searchQuery?: string;
    statusFilter?: string;
    siteFilter?: string;
  }
): ReportTemplate[] {
  const { searchQuery = "", statusFilter = "all", siteFilter = "all" } = filters;
  const q = searchQuery.toLowerCase().trim();

  return templates.filter((tpl) => {
    // Search query matching
    if (q) {
      const matchName = tpl.name?.toLowerCase().includes(q);
      const matchDesc = tpl.description?.toLowerCase().includes(q);
      const matchSite = tpl.site_name?.toLowerCase().includes(q);
      const matchAuthor = tpl.created_by?.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchSite && !matchAuthor) {
        return false;
      }
    }

    // Status filter matching
    if (statusFilter && statusFilter !== "all") {
      if (tpl.status !== statusFilter) {
        return false;
      }
    }

    // Site filter matching
    if (siteFilter && siteFilter !== "all") {
      if (tpl.site_id !== siteFilter && tpl.site_name !== siteFilter) {
        return false;
      }
    }

    return true;
  });
}

export function getTemplateStatusBadge(status: string): {
  label: string;
  badgeClass: string;
  dotClass: string;
} {
  switch (status?.toLowerCase()) {
    case "active":
    case "published":
      return {
        label: "Active",
        badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        dotClass: "bg-emerald-500",
      };
    case "draft":
      return {
        label: "Draft",
        badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        dotClass: "bg-amber-500",
      };
    case "pending":
    case "in-review":
      return {
        label: "Pending",
        badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
        dotClass: "bg-blue-500",
      };
    case "archived":
      return {
        label: "Archived",
        badgeClass: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
        dotClass: "bg-slate-500",
      };
    default:
      return {
        label: status || "Unknown",
        badgeClass: "bg-purple-500/10 text-[#8B3DFF] border-purple-500/20",
        dotClass: "bg-[#8B3DFF]",
      };
  }
}

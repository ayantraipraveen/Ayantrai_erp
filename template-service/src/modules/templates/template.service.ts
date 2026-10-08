import { prisma } from '../../config/prisma';
import { ApiError } from '../../shared/utils/apiError';
import {
  CreateTemplateInput,
  UpdateTemplateInput,
  ApproveTemplateInput,
  RejectTemplateInput,
  CloneTemplateInput,
  ResubmitTemplateInput,
} from './template.schema';

export interface ListTemplatesQuery {
  search?: string;
  status?: string;
  site_id?: string;
  startDate?: string;
  endDate?: string;
  datePreset?: string;
  sortBy?: 'updatedAt' | 'createdAt' | 'name' | 'id';
  sortOrder?: 'asc' | 'desc';
  page?: string | number;
  limit?: string | number;
}

/**
 * Format database record into unified response supporting both camelCase and snake_case
 */
export function formatTemplate(t: any) {
  if (!t) return t;
  return {
    ...t,
    site_id: t.siteId || t.site_id || null,
    site_name: t.siteName || t.site_name || null,
    created_by: t.createdBy || t.authorName || t.created_by || 'System',
    created_at: t.createdAt ? new Date(t.createdAt).toISOString() : t.created_at,
    updated_at: t.updatedAt ? new Date(t.updatedAt).toISOString() : t.updated_at,
    compliance_standards: t.complianceStandards || t.compliance_standards || [],
    has_audit_hash: Boolean(t.hasAuditHash),
  };
}

/**
 * List all templates with optional search, status filtering, date range filtering, and pagination
 */
export async function listTemplatesService(query: ListTemplatesQuery) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(query.limit) || 50));
  const skip = (page - 1) * limit;

  const where: any = {};

  if (query.status && query.status !== 'all') {
    where.status = query.status;
  }

  if (query.site_id && query.site_id !== 'all') {
    where.siteId = query.site_id;
  }

  if (query.search && query.search.trim()) {
    const s = query.search.trim().slice(0, 100);
    where.OR = [
      { name: { contains: s, mode: 'insensitive' } },
      { description: { contains: s, mode: 'insensitive' } },
      { id: { contains: s, mode: 'insensitive' } },
      { siteName: { contains: s, mode: 'insensitive' } },
      { category: { contains: s, mode: 'insensitive' } },
    ];
  }

  // Date Range Filtering (explicit startDate/endDate or quick preset)
  const createdAtFilter: any = {};
  if (query.startDate) {
    const start = new Date(query.startDate);
    if (!isNaN(start.getTime())) {
      start.setHours(0, 0, 0, 0);
      createdAtFilter.gte = start;
    }
  }
  if (query.endDate) {
    const end = new Date(query.endDate);
    if (!isNaN(end.getTime())) {
      end.setHours(23, 59, 59, 999);
      createdAtFilter.lte = end;
    }
  }

  // Fallback to datePreset if no explicit startDate/endDate supplied
  if (
    Object.keys(createdAtFilter).length === 0 &&
    query.datePreset &&
    query.datePreset !== 'all_time' &&
    query.datePreset !== 'all'
  ) {
    const now = new Date();
    if (query.datePreset === 'today') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      createdAtFilter.gte = start;
      createdAtFilter.lte = end;
    } else if (query.datePreset === 'yesterday') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
      createdAtFilter.gte = start;
      createdAtFilter.lte = end;
    } else if (query.datePreset === 'last_7_days' || query.datePreset === '7days') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0, 0);
      createdAtFilter.gte = start;
    } else if (query.datePreset === 'last_30_days' || query.datePreset === '30days') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29, 0, 0, 0, 0);
      createdAtFilter.gte = start;
    } else if (query.datePreset === 'this_month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      createdAtFilter.gte = start;
    } else if (query.datePreset === 'last_month') {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      createdAtFilter.gte = start;
      createdAtFilter.lte = end;
    }
  }

  if (Object.keys(createdAtFilter).length > 0) {
    where.createdAt = createdAtFilter;
  }

  // Strict whitelist for sort field to prevent SQL/object injection
  const ALLOWED_SORT_FIELDS = new Set(['updatedAt', 'createdAt', 'name', 'id']);
  const sortBy = ALLOWED_SORT_FIELDS.has(query.sortBy as string)
    ? (query.sortBy as string)
    : 'updatedAt';
  const sortOrder = query.sortOrder === 'asc' || query.sortOrder === 'desc' ? query.sortOrder : 'desc';
  const orderBy: any = [{ [sortBy]: sortOrder }];
  if (sortBy !== 'id') {
    orderBy.push({ id: 'asc' });
  }

  const [total, templates, statusCounts] = await Promise.all([
    (prisma as any).reportTemplate.count({ where }),
    (prisma as any).reportTemplate.findMany({
      where,
      skip,
      take: limit,
      orderBy,
    }),
    (prisma as any).reportTemplate.groupBy({
      by: ['status'],
      _count: { _all: true },
    }).catch(() => []),
  ]);

  const stats = {
    total,
    pendingCount: 0,
    activeCount: 0,
    draftCount: 0,
    rejectedCount: 0,
  };

  if (Array.isArray(statusCounts)) {
    for (const item of statusCounts) {
      if (item.status === 'pending') stats.pendingCount = item._count?._all || 0;
      if (item.status === 'active') stats.activeCount = item._count?._all || 0;
      if (item.status === 'draft') stats.draftCount = item._count?._all || 0;
      if (item.status === 'rejected') stats.rejectedCount = item._count?._all || 0;
    }
  }

  return {
    items: templates.map(formatTemplate),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
    stats,
  };
}

/**
 * Retrieve single template by ID
 */
export async function getTemplateByIdService(id: string) {
  const template = await (prisma as any).reportTemplate.findUnique({
    where: { id },
  });

  if (!template) {
    throw ApiError.notFound(`Template with ID '${id}' not found`);
  }

  return formatTemplate(template);
}

/**
 * Create a new template blueprint
 */
export async function createTemplateService(
  input: CreateTemplateInput,
  user: { id: string; name?: string }
) {
  // 1. Generate unique sequential identifier (e.g. TPL-001, TPL-002)
  const existingTemplates = await (prisma as any).reportTemplate.findMany({
    select: { id: true },
  });

  const maxIdNum = existingTemplates.reduce((max: number, t: { id: string }) => {
    const match = t.id.match(/TPL-(\d+)/i);
    const num = match ? parseInt(match[1], 10) : 0;
    return num > max ? num : max;
  }, 0);

  const nextId = `TPL-${String(maxIdNum + 1).padStart(3, '0')}`;

  // 2. Persist template
  const newTemplate = await (prisma as any).reportTemplate.create({
    data: {
      id: nextId,
      name: input.name,
      description: input.description,
      siteId: input.site_id,
      siteName: input.site_name,
      status: input.status || 'draft',
      version: 'v1.0',
      category: input.category || 'General Safety',
      frequency: input.frequency || 'Weekly',
      complianceStandards: input.complianceStandards || ['ISO 45001'],
      hasAuditHash: input.hasAuditHash ?? true,
      blocks: input.blocks || [],
      coverPageData: input.coverPageData || null,
      tableOfContentsData: input.tableOfContentsData || null,
      backCoverData: input.backCoverData || null,
      canvasSectionId: input.canvasSectionId,
      createdBy: user.id,
      authorName: user.name || 'Site Administrator',
    },
  });

  return newTemplate;
}

/**
 * Update an existing template (automatically increments minor version, e.g. v1.0 -> v1.1)
 */
export async function updateTemplateService(
  id: string,
  input: UpdateTemplateInput,
  user: { id: string; name?: string }
) {
  const existing = await (prisma as any).reportTemplate.findUnique({
    where: { id },
  });

  if (!existing) {
    throw ApiError.notFound(`Template with ID '${id}' not found`);
  }

  const currentVerNum = parseFloat(existing.version.replace('v', '')) || 1.0;
  const nextVersion = `v${(currentVerNum + 0.1).toFixed(1)}`;

  const updatedTemplate = await (prisma as any).reportTemplate.update({
    where: { id },
    data: {
      name: input.name ?? existing.name,
      description: input.description ?? existing.description,
      siteId: input.site_id ?? existing.siteId,
      siteName: input.site_name ?? existing.siteName,
      status: input.status ?? existing.status,
      version: nextVersion,
      category: input.category ?? existing.category,
      frequency: input.frequency ?? existing.frequency,
      complianceStandards: input.complianceStandards ?? existing.complianceStandards,
      hasAuditHash: input.hasAuditHash ?? existing.hasAuditHash,
      blocks: input.blocks ?? existing.blocks,
      coverPageData: input.coverPageData ?? existing.coverPageData,
      tableOfContentsData: input.tableOfContentsData ?? existing.tableOfContentsData,
      backCoverData: input.backCoverData ?? existing.backCoverData,
      canvasSectionId: input.canvasSectionId ?? existing.canvasSectionId,
    },
  });

  return updatedTemplate;
}

/**
 * Delete a template by ID
 */
export async function deleteTemplateService(id: string) {
  const existing = await (prisma as any).reportTemplate.findUnique({
    where: { id },
  });

  if (!existing) {
    throw ApiError.notFound(`Template with ID '${id}' not found`);
  }

  await (prisma as any).reportTemplate.delete({
    where: { id },
  });

  return { message: `Template '${id}' successfully deleted`, id };
}

/**
 * Superadmin approves a pending template
 */
export async function approveTemplateService(
  id: string,
  input: ApproveTemplateInput,
  superadmin: { id: string; name?: string }
) {
  const existing = await (prisma as any).reportTemplate.findUnique({
    where: { id },
  });

  if (!existing) {
    throw ApiError.notFound(`Template with ID '${id}' not found`);
  }

  const approved = await (prisma as any).reportTemplate.update({
    where: { id },
    data: {
      status: 'active',
      approvedBy: superadmin.name || 'Superadmin',
      approvedAt: new Date(),
      remarks: input.remarks || 'Approved and provisioned for industrial safety reporting',
      rejectionReason: null,
    },
  });

  return approved;
}

/**
 * Superadmin rejects a pending template
 */
export async function rejectTemplateService(
  id: string,
  input: RejectTemplateInput,
  superadmin: { id: string; name?: string }
) {
  const existing = await (prisma as any).reportTemplate.findUnique({
    where: { id },
  });

  if (!existing) {
    throw ApiError.notFound(`Template with ID '${id}' not found`);
  }

  const rejected = await (prisma as any).reportTemplate.update({
    where: { id },
    data: {
      status: 'rejected',
      rejectionReason: input.rejectionReason,
      approvedBy: null,
      approvedAt: null,
    },
  });

  return rejected;
}

/**
 * Duplicate / Clone an existing template blueprint
 */
export async function cloneTemplateService(
  id: string,
  input: CloneTemplateInput | undefined,
  user: { id: string; name?: string }
) {
  const existing = await (prisma as any).reportTemplate.findUnique({
    where: { id },
  });

  if (!existing) {
    throw ApiError.notFound(`Template with ID '${id}' not found`);
  }

  // Generate next sequential identifier
  const existingTemplates = await (prisma as any).reportTemplate.findMany({
    select: { id: true },
  });

  const maxIdNum = existingTemplates.reduce((max: number, t: { id: string }) => {
    const match = t.id.match(/TPL-(\d+)/i);
    const num = match ? parseInt(match[1], 10) : 0;
    return num > max ? num : max;
  }, 0);

  const nextId = `TPL-${String(maxIdNum + 1).padStart(3, '0')}`;
  const copyName = input?.name || `${existing.name} (Copy)`;

  const clonedTemplate = await (prisma as any).reportTemplate.create({
    data: {
      id: nextId,
      name: copyName,
      description: existing.description,
      siteId: existing.siteId,
      siteName: existing.siteName,
      status: 'draft',
      version: 'v1.0',
      category: existing.category,
      frequency: existing.frequency,
      complianceStandards: existing.complianceStandards,
      hasAuditHash: existing.hasAuditHash,
      blocks: existing.blocks,
      coverPageData: existing.coverPageData,
      tableOfContentsData: existing.tableOfContentsData,
      backCoverData: existing.backCoverData,
      canvasSectionId: existing.canvasSectionId,
      createdBy: user.id,
      authorName: user.name || 'Site Administrator',
    },
  });

  return clonedTemplate;
}

/**
 * Resubmit a rejected template for review
 */
export async function resubmitTemplateService(
  id: string,
  input: ResubmitTemplateInput | undefined,
  user: { id: string; name?: string }
) {
  const existing = await (prisma as any).reportTemplate.findUnique({
    where: { id },
  });

  if (!existing) {
    throw ApiError.notFound(`Template with ID '${id}' not found`);
  }

  const resubmitted = await (prisma as any).reportTemplate.update({
    where: { id },
    data: {
      status: 'pending',
      rejectionReason: null,
      remarks: input?.remarks || existing.remarks,
    },
  });

  return resubmitted;
}

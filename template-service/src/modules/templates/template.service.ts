import { prisma } from '../../config/prisma';
import { ApiError } from '../../shared/utils/apiError';
import {
  CreateTemplateInput,
  UpdateTemplateInput,
  ApproveTemplateInput,
  RejectTemplateInput,
} from './template.schema';

export interface ListTemplatesQuery {
  search?: string;
  status?: string;
  site_id?: string;
  page?: string | number;
  limit?: string | number;
}

/**
 * List all templates with optional search, status filtering, and pagination
 */
export async function listTemplatesService(query: ListTemplatesQuery) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
  const skip = (page - 1) * limit;

  const where: any = {};

  if (query.status && query.status !== 'all') {
    where.status = query.status;
  }

  if (query.site_id && query.site_id !== 'all') {
    where.siteId = query.site_id;
  }

  if (query.search && query.search.trim()) {
    const s = query.search.trim();
    where.OR = [
      { name: { contains: s, mode: 'insensitive' } },
      { description: { contains: s, mode: 'insensitive' } },
      { id: { contains: s, mode: 'insensitive' } },
    ];
  }

  const [total, templates] = await Promise.all([
    (prisma as any).reportTemplate.count({ where }),
    (prisma as any).reportTemplate.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: 'desc' },
    }),
  ]);

  return {
    items: templates,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
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

  return template;
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

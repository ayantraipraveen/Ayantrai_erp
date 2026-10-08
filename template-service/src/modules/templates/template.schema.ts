import { z } from 'zod';

export const listTemplatesSchema = z.object({
  query: z
    .object({
      search: z.string().trim().max(100).optional(),
      status: z.enum(['all', 'draft', 'pending', 'active', 'rejected']).optional().default('all'),
      site_id: z.string().trim().max(100).optional(),
      startDate: z.string().trim().optional(),
      endDate: z.string().trim().optional(),
      datePreset: z.string().trim().optional(),
      sortBy: z.enum(['updatedAt', 'createdAt', 'name', 'id']).optional().default('updatedAt'),
      sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
      page: z.coerce.number().int().min(1).optional().default(1),
      limit: z.coerce.number().int().min(1).max(100).optional().default(50),
    })
    .optional(),
});

export const createTemplateSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Template name is required' })
      .min(2, 'Name must be at least 2 characters')
      .max(120, 'Name cannot exceed 120 characters')
      .trim(),
    description: z.string().optional(),
    site_id: z.string().optional(),
    site_name: z.string().optional(),
    category: z.string().optional(),
    frequency: z.string().optional(),
    complianceStandards: z.array(z.string()).optional(),
    hasAuditHash: z.boolean().optional(),
    blocks: z.any().optional(),
    coverPageData: z.any().optional(),
    tableOfContentsData: z.any().optional(),
    backCoverData: z.any().optional(),
    canvasSectionId: z.string().optional(),
    status: z.enum(['draft', 'pending', 'active', 'rejected']).optional(),
  }),
});

export const updateTemplateSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(120).trim().optional(),
    description: z.string().optional(),
    site_id: z.string().optional(),
    site_name: z.string().optional(),
    category: z.string().optional(),
    frequency: z.string().optional(),
    complianceStandards: z.array(z.string()).optional(),
    hasAuditHash: z.boolean().optional(),
    blocks: z.any().optional(),
    coverPageData: z.any().optional(),
    tableOfContentsData: z.any().optional(),
    backCoverData: z.any().optional(),
    canvasSectionId: z.string().optional(),
    status: z.enum(['draft', 'pending', 'active', 'rejected']).optional(),
  }),
});

export const approveTemplateSchema = z.object({
  body: z.object({
    remarks: z.string().optional(),
  }),
});

export const rejectTemplateSchema = z.object({
  body: z.object({
    rejectionReason: z
      .string({ required_error: 'Rejection reason is required' })
      .min(3, 'Rejection reason must be at least 3 characters'),
  }),
});

export const cloneTemplateSchema = z.object({
  body: z
    .object({
      name: z.string().min(2).max(120).trim().optional(),
    })
    .optional(),
});

export const resubmitTemplateSchema = z.object({
  body: z
    .object({
      remarks: z.string().optional(),
    })
    .optional(),
});

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>['body'];
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>['body'];
export type ApproveTemplateInput = z.infer<typeof approveTemplateSchema>['body'];
export type RejectTemplateInput = z.infer<typeof rejectTemplateSchema>['body'];
export type CloneTemplateInput = z.infer<typeof cloneTemplateSchema>['body'];
export type ResubmitTemplateInput = z.infer<typeof resubmitTemplateSchema>['body'];


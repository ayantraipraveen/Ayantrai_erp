import { z } from 'zod';

export const listSectionsSchema = z.object({
  query: z
    .object({
      search: z.string().trim().optional(),
      type: z.enum(['all', 'core', 'custom']).optional().default('all'),
      watermarkId: z.string().optional(),
      projectSite: z.string().optional(),
      sortBy: z
        .enum(['orderIndex', 'name', 'createdAt', 'updatedAt', 'id'])
        .optional()
        .default('orderIndex'),

      sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
      page: z.coerce.number().int().min(1).optional().default(1),
      limit: z.coerce.number().int().min(1).max(100).optional().default(10),
    })
    .optional(),
});

export const createSectionSchema = z.object({

  body: z.object({
    name: z
      .string({ required_error: 'Section name is required' })
      .min(2, 'Name must be at least 2 characters')
      .max(150, 'Name cannot exceed 150 characters')
      .trim(),
    titleHtml: z.string().optional(),
    titleStyle: z.record(z.any()).optional(),
    eyebrow: z.string().max(80).optional().default('CUSTOM MODULE'),
    eyebrowHtml: z.string().optional(),
    description: z.string().optional().default(''),
    descriptionHtml: z.string().optional(),
    type: z.enum(['core', 'custom']).optional().default('custom'),
    icon: z.string().optional().default('Layers'),
    orderIndex: z.number().int().optional().default(0),
    headerSpacing: z.enum(['compact', 'normal', 'spacious']).optional().default('normal'),
    sectionStyle: z.record(z.any()).optional(),
    metricCards: z.array(z.any()).optional().default([]),
    charts: z.array(z.any()).optional().default([]),
    keyInsights: z.array(z.any()).optional().default([]),
    canvasRows: z.array(z.any()).optional().default([]),
    stamps: z.array(z.any()).optional().default([]),
    watermarkId: z.string().nullable().optional(),
    projectSite: z.string().nullable().optional(),
    reportingPeriod: z.string().nullable().optional(),
    coverPageData: z.record(z.any()).optional(),
    tableOfContentsData: z.record(z.any()).optional(),
    backCoverData: z.record(z.any()).optional(),
    pageOverrides: z.record(z.any()).optional(),
  }),
});

export const updateSectionSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(150).trim().optional(),
    titleHtml: z.string().optional(),
    titleStyle: z.record(z.any()).optional(),
    eyebrow: z.string().max(80).optional(),
    eyebrowHtml: z.string().optional(),
    description: z.string().optional(),
    descriptionHtml: z.string().optional(),
    type: z.enum(['core', 'custom']).optional(),
    icon: z.string().optional(),
    orderIndex: z.number().int().optional(),
    headerSpacing: z.enum(['compact', 'normal', 'spacious']).optional(),
    sectionStyle: z.record(z.any()).optional(),
    metricCards: z.array(z.any()).optional(),
    charts: z.array(z.any()).optional(),
    keyInsights: z.array(z.any()).optional(),
    canvasRows: z.array(z.any()).optional(),
    stamps: z.array(z.any()).optional(),
    watermarkId: z.string().nullable().optional(),
    projectSite: z.string().nullable().optional(),
    reportingPeriod: z.string().nullable().optional(),
    coverPageData: z.record(z.any()).optional(),
    tableOfContentsData: z.record(z.any()).optional(),
    backCoverData: z.record(z.any()).optional(),
    pageOverrides: z.record(z.any()).optional(),
  }),
});

export const cloneSectionSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(150).trim().optional(),
  }).optional(),
});

export const reorderSectionsSchema = z.object({
  body: z.object({
    orders: z.array(
      z.object({
        id: z.string(),
        orderIndex: z.number().int(),
      })
    ),
  }),
});

export type CreateSectionInput = z.infer<typeof createSectionSchema>['body'];
export type UpdateSectionInput = z.infer<typeof updateSectionSchema>['body'];
export type CloneSectionInput = z.infer<typeof cloneSectionSchema>['body'];
export type ReorderSectionsInput = z.infer<typeof reorderSectionsSchema>['body'];

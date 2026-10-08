import { z } from 'zod';

export const listWatermarksSchema = z.object({
  query: z
    .object({
      search: z.string().trim().max(100).optional(),
      tag: z.string().trim().max(50).optional(),
      page: z.coerce.number().int().min(1).optional().default(1),
      limit: z.coerce.number().int().min(1).max(100).optional().default(50),
    })
    .optional(),
});

export const createWatermarkSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Watermark name is required' })
      .min(2, 'Name must be at least 2 characters')
      .max(150, 'Name cannot exceed 150 characters')
      .trim(),
    fileName: z.string().min(1, 'File name is required').trim().optional(),
    svgContent: z
      .string({ required_error: 'SVG content is required' })
      .min(10, 'Valid SVG markup is required')
      .refine(
        (val) => val.includes('<svg') && val.includes('</svg>'),
        'Provided content must be valid SVG markup containing <svg>...</svg>'
      ),
    sizeBytes: z.number().int().nonnegative().optional(),
    scale: z.number().min(-300).max(500).optional().default(100),
    opacity: z.number().min(0).max(100).optional().default(18),
    rotation: z.number().min(-360).max(360).optional().default(0),
    placement: z
      .enum([
        'center',
        'top-left',
        'top-center',
        'top-right',
        'center-left',
        'center-right',
        'bottom-left',
        'bottom-center',
        'bottom-right',
        'tiled',
        'custom',
      ])
      .optional()
      .default('center'),
    tag: z.string().optional().default('custom'),
    isDefault: z.boolean().optional().default(false),
    description: z.string().optional(),
  }),
});

export const updateWatermarkSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(150).trim().optional(),
    fileName: z.string().min(1).trim().optional(),
    svgContent: z
      .string()
      .min(10)
      .refine(
        (val) => val.includes('<svg') && val.includes('</svg>'),
        'Provided content must be valid SVG markup containing <svg>...</svg>'
      )
      .optional(),
    sizeBytes: z.number().int().nonnegative().optional(),
    scale: z.number().min(-300).max(500).optional(),
    opacity: z.number().min(0).max(100).optional(),
    rotation: z.number().min(-360).max(360).optional(),
    placement: z
      .enum([
        'center',
        'top-left',
        'top-center',
        'top-right',
        'center-left',
        'center-right',
        'bottom-left',
        'bottom-center',
        'bottom-right',
        'tiled',
        'custom',
      ])
      .optional(),
    tag: z.string().optional(),
    isDefault: z.boolean().optional(),
    description: z.string().optional(),
  }),
});

export type CreateWatermarkInput = z.infer<typeof createWatermarkSchema>['body'];
export type UpdateWatermarkInput = z.infer<typeof updateWatermarkSchema>['body'];

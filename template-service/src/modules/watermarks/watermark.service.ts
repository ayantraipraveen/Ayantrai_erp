import { prisma } from '../../config/prisma';
import { ApiError } from '../../shared/utils/apiError';
import { CreateWatermarkInput, UpdateWatermarkInput } from './watermark.schema';

export interface ListWatermarksQuery {
  search?: string;
  tag?: string;
  page?: string | number;
  limit?: string | number;
}

function getWatermarkModel() {
  const model = (prisma as any).watermark;
  if (!model) {
    throw ApiError.internal(
      "Prisma 'watermark' model is not generated yet in @prisma/client. Please run 'npx prisma generate' and restart the dev server."
    );
  }
  return model;
}

/**
 * List all watermarks with search, tag filtering, and pagination
 */
export async function listWatermarksService(query: ListWatermarksQuery) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(query.limit) || 50));
  const skip = (page - 1) * limit;

  const where: any = {};

  if (query.tag && query.tag !== 'all') {
    where.tag = query.tag;
  }

  if (query.search && query.search.trim()) {
    const s = query.search.trim();
    where.OR = [
      { name: { contains: s, mode: 'insensitive' } },
      { fileName: { contains: s, mode: 'insensitive' } },
      { description: { contains: s, mode: 'insensitive' } },
    ];
  }

  const watermarkModel = getWatermarkModel();

  const [total, items] = await Promise.all([
    watermarkModel.count({ where }),
    watermarkModel.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
    }),
  ]);

  return {
    items,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

/**
 * Retrieve a single watermark by ID
 */
export async function getWatermarkByIdService(id: string) {
  const watermarkModel = getWatermarkModel();
  const watermark = await watermarkModel.findUnique({
    where: { id },
  });

  if (!watermark) {
    throw ApiError.notFound(`Watermark with ID '${id}' not found`);
  }

  return watermark;
}

/**
 * Create a new vector SVG watermark stamp
 */
export async function createWatermarkService(
  input: CreateWatermarkInput,
  user?: { id: string; name?: string }
) {
  const sizeBytes =
    input.sizeBytes ?? Buffer.byteLength(input.svgContent, 'utf8');

  const generatedFileName =
    input.fileName ||
    `${input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.svg`;

  const watermarkModel = getWatermarkModel();
  const newWatermark = await watermarkModel.create({
    data: {
      name: input.name,
      fileName: generatedFileName,
      svgContent: input.svgContent,
      sizeBytes,
      scale: input.scale ?? 100,
      opacity: input.opacity ?? 18,
      rotation: input.rotation ?? 0,
      placement: input.placement ?? 'center',
      tag: input.tag ?? 'custom',
      isDefault: input.isDefault ?? false,
      description: input.description,
      createdBy: user?.id,
    },
  });

  return newWatermark;
}

/**
 * Update an existing watermark's properties (scale, opacity, rotation, etc.)
 */
export async function updateWatermarkService(
  id: string,
  input: UpdateWatermarkInput
) {
  const watermarkModel = getWatermarkModel();
  const existing = await watermarkModel.findUnique({
    where: { id },
  });

  if (!existing) {
    throw ApiError.notFound(`Watermark with ID '${id}' not found`);
  }

  const data: any = { ...input };

  if (input.svgContent && input.sizeBytes === undefined) {
    data.sizeBytes = Buffer.byteLength(input.svgContent, 'utf8');
  }

  const updated = await watermarkModel.update({
    where: { id },
    data,
  });

  return updated;
}

/**
 * Delete a watermark by ID
 */
export async function deleteWatermarkService(id: string) {
  const watermarkModel = getWatermarkModel();
  const existing = await watermarkModel.findUnique({
    where: { id },
  });

  if (!existing) {
    throw ApiError.notFound(`Watermark with ID '${id}' not found`);
  }

  await watermarkModel.delete({
    where: { id },
  });

  return { message: `Watermark '${existing.name}' (${id}) deleted successfully`, id };
}

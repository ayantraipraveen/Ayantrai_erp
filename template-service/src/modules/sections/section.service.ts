import { prisma } from '../../config/prisma';
import { ApiError } from '../../shared/utils/apiError';
import {
  CreateSectionInput,
  UpdateSectionInput,
  CloneSectionInput,
  ReorderSectionsInput,
} from './section.schema';
import crypto from 'crypto';

export interface ListSectionsQuery {
  search?: string;
  type?: 'all' | 'core' | 'custom' | string;
  watermarkId?: string;
  projectSite?: string;
  sortBy?: 'orderIndex' | 'name' | 'createdAt' | 'updatedAt' | 'id';
  sortOrder?: 'asc' | 'desc';
  page?: string | number;
  limit?: string | number;
}


function getSectionModel() {
  const model = (prisma as any).templateSection;
  if (!model) {
    throw ApiError.internal(
      "Prisma 'templateSection' model is not generated yet in @prisma/client. Please run 'npx prisma db push' and restart the dev server."
    );
  }
  return model;
}

/**
 * List all template library sections with full filters, search, aggregate telemetry counts, and pagination
 */
export async function listSectionsService(query: ListSectionsQuery) {
  const sectionModel = getSectionModel();

  const where: any = {};

  // 1. Filter by Section Type (core | custom | all)
  if (query.type && query.type !== 'all') {
    where.type = query.type;
  }

  // 2. Filter by Search keyword across name, eyebrow, and description
  if (query.search && query.search.trim()) {
    const s = query.search.trim();
    where.OR = [
      { name: { contains: s, mode: 'insensitive' } },
      { eyebrow: { contains: s, mode: 'insensitive' } },
      { description: { contains: s, mode: 'insensitive' } },
    ];
  }

  // 3. Filter by Watermark ID
  if (query.watermarkId && query.watermarkId.trim()) {
    where.watermarkId = query.watermarkId.trim();
  }

  // 4. Filter by Project / Site name
  if (query.projectSite && query.projectSite.trim()) {
    where.projectSite = { contains: query.projectSite.trim(), mode: 'insensitive' };
  }

  // 5. Pagination calculations
  const limit = query.limit ? Math.max(1, Math.min(100, Number(query.limit))) : 10;
  const page = query.page ? Math.max(1, Number(query.page)) : 1;
  const skip = (page - 1) * limit;

  // 6. Dynamic Sorting
  const sortBy = query.sortBy || 'orderIndex';
  const sortOrder = query.sortOrder || (sortBy === 'orderIndex' ? 'asc' : 'desc');
  const orderBy: any = [{ [sortBy]: sortOrder }];
  if (sortBy !== 'id') {
    orderBy.push({ id: 'asc' });
  }

  // Retrieve matching sections ordered by user request
  const [items, totalFiltered, allSections] = await Promise.all([
    sectionModel.findMany({
      where,
      skip,
      take: limit,
      orderBy,
    }),
    sectionModel.count({ where }),
    sectionModel.findMany({
      select: {
        id: true,
        type: true,
        metricCards: true,
        charts: true,
      },
    }),
  ]);

  // Compute live statistics for top summary strip
  let coreStandardsCount = 0;
  let customModulesCount = 0;
  let totalCardsCount = 0;
  let totalChartsCount = 0;

  for (const s of allSections) {
    if (s.type === 'core') coreStandardsCount++;
    else customModulesCount++;

    if (Array.isArray(s.metricCards)) totalCardsCount += s.metricCards.length;
    if (Array.isArray(s.charts)) totalChartsCount += s.charts.length;
  }

  const totalPages = Math.ceil(totalFiltered / limit) || 1;

  return {
    items,
    stats: {
      totalSections: allSections.length,
      coreStandardsCount,
      customModulesCount,
      totalCardsCount,
      totalChartsCount,
    },
    pagination: {
      total: totalFiltered,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}


/**
 * Retrieve a single section by ID
 */
export async function getSectionByIdService(id: string) {
  const sectionModel = getSectionModel();
  const section = await sectionModel.findUnique({
    where: { id },
  });

  if (!section) {
    throw ApiError.notFound(`Section with ID '${id}' not found`);
  }

  return section;
}

/**
 * Helper to generate next sequential custom section ID (sec-custom-1, sec-custom-2, ...)
 * Reads last section in DB and does max + 1.
 */
async function getNextSectionId(sectionModel: any): Promise<string> {
  const sections = await sectionModel.findMany({
    select: { id: true },
  });

  let maxNum = 0;
  for (const s of sections) {
    const match = s.id?.match(/^sec-custom-(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }

  return `sec-custom-${maxNum + 1}`;
}

/**
 * Scans DB across all sections to find the highest existing number for a given prefix (e.g. "mc-27" -> 27)
 */
async function getMaxItemIdInDb(
  sectionModel: any,
  field: 'metricCards' | 'charts' | 'keyInsights',
  prefix: string
): Promise<number> {
  const sections = await sectionModel.findMany({
    select: { [field]: true },
  });

  let maxNum = 0;
  for (const s of sections) {
    const list = (s as any)[field];
    if (Array.isArray(list)) {
      for (const item of list) {
        const match = item?.id?.match(new RegExp(`^${prefix}-(\\d+)$`));
        if (match) {
          const num = parseInt(match[1], 10);
          // Only treat realistic sequential numbers as valid sequential IDs (ignore millisecond timestamps)
          if (num > maxNum && num < 1000000) maxNum = num;
        }
      }
    }
  }

  return maxNum;
}

/**
 * Checks last ID in DB and increments by + 1 for each new item (mc-(last+1), ch-(last+1), ki-(last+1))
 */
async function assignNextSequentialItemIds(
  sectionModel: any,
  items: any[] | undefined,
  field: 'metricCards' | 'charts' | 'keyInsights',
  prefix: string
): Promise<any[]> {
  if (!Array.isArray(items) || items.length === 0) return [];

  let currentMax = await getMaxItemIdInDb(sectionModel, field, prefix);

  return items.map((item) => {
    // If the item already has a non-temporary sequential ID, preserve it; otherwise allocate DB last + 1
    const isTimestampOrTemp =
      !item?.id ||
      typeof item.id !== 'string' ||
      item.id.includes('temp') ||
      item.id.includes('Date.now') ||
      item.id.includes('mock') ||
      (() => {
        const m = item.id.match(new RegExp(`^${prefix}-(\\d+)$`));
        return m ? parseInt(m[1], 10) >= 1000000 : false;
      })();

    if (!isTimestampOrTemp && item?.id?.startsWith(`${prefix}-`)) {
      return item;
    }
    currentMax += 1;
    return {
      ...item,
      id: `${prefix}-${currentMax}`,
    };
  });
}

/**
 * Create a new custom template section
 */
export async function createSectionService(
  input: CreateSectionInput,
  user?: { id: string; name?: string }
) {
  const sectionModel = getSectionModel();
  
  // 1. Check last custom section ID in DB and add + 1 (e.g. sec-custom-1, sec-custom-2...)
  const newId = await getNextSectionId(sectionModel);

  // 2. Find max orderIndex in DB and add + 1 (e.g. #9 + 1 = #10)
  const highest = await sectionModel.findFirst({
    orderBy: { orderIndex: 'desc' },
    select: { orderIndex: true },
  });
  const orderIndex = input.orderIndex ?? ((highest?.orderIndex ?? 0) + 1);

  // 3. Check last card, chart, and insight IDs in DB and add + 1
  const metricCards = await assignNextSequentialItemIds(sectionModel, input.metricCards, 'metricCards', 'mc');
  const charts = await assignNextSequentialItemIds(sectionModel, input.charts, 'charts', 'ch');
  const keyInsights = await assignNextSequentialItemIds(sectionModel, input.keyInsights, 'keyInsights', 'ki');

  const newSection = await sectionModel.create({
    data: {
      id: newId,
      name: input.name,
      titleHtml: input.titleHtml,
      titleStyle: input.titleStyle,
      eyebrow: input.eyebrow ?? 'CUSTOM MODULE',
      eyebrowHtml: input.eyebrowHtml,
      description: input.description ?? '',
      descriptionHtml: input.descriptionHtml,
      type: input.type ?? 'custom',
      icon: input.icon ?? 'Layers',
      orderIndex,
      headerSpacing: input.headerSpacing ?? 'normal',
      sectionStyle: input.sectionStyle,
      metricCards,
      charts,
      keyInsights,
      canvasRows: input.canvasRows ?? [],
      stamps: input.stamps ?? [],
      watermarkId: input.watermarkId,
      projectSite: input.projectSite,
      reportingPeriod: input.reportingPeriod,
      coverPageData: input.coverPageData,
      tableOfContentsData: input.tableOfContentsData,
      backCoverData: input.backCoverData,
      pageOverrides: input.pageOverrides,
      createdBy: user?.id,
    },
  });

  return newSection;
}

/**
 * Update an existing section's canvas rows, title styling, or telemetry blocks
 */
export async function updateSectionService(
  id: string,
  input: UpdateSectionInput
) {
  const sectionModel = getSectionModel();
  const existing = await sectionModel.findUnique({
    where: { id },
  });

  if (!existing) {
    throw ApiError.notFound(`Section with ID '${id}' not found`);
  }

  const data: any = { ...input };

  if (input.metricCards) {
    data.metricCards = await assignNextSequentialItemIds(sectionModel, input.metricCards, 'metricCards', 'mc');
  }
  if (input.charts) {
    data.charts = await assignNextSequentialItemIds(sectionModel, input.charts, 'charts', 'ch');
  }
  if (input.keyInsights) {
    data.keyInsights = await assignNextSequentialItemIds(sectionModel, input.keyInsights, 'keyInsights', 'ki');
  }

  const updated = await sectionModel.update({
    where: { id },
    data,
  });

  return updated;
}

/**
 * Clone an existing section into a new custom section
 */
export async function cloneSectionService(
  id: string,
  input?: CloneSectionInput,
  user?: { id: string; name?: string }
) {
  const sectionModel = getSectionModel();
  const src = await sectionModel.findUnique({
    where: { id },
  });

  if (!src) {
    throw ApiError.notFound(`Source section with ID '${id}' not found for cloning`);
  }

  // 1. Check last section in DB and add + 1
  const newId = await getNextSectionId(sectionModel);
  const clonedName = input?.name?.trim() || `${src.name} (Copy)`;

  // 2. Check last orderIndex in DB and add + 1
  const highest = await sectionModel.findFirst({
    orderBy: { orderIndex: 'desc' },
    select: { orderIndex: true },
  });
  const orderIndex = (highest?.orderIndex ?? 0) + 1;

  // 3. Check last card, chart, and insight IDs in DB and add + 1 for each cloned item
  let nextCardNum = await getMaxItemIdInDb(sectionModel, 'metricCards', 'mc');
  const metricCards = (Array.isArray(src.metricCards) ? src.metricCards : []).map((c: any) => {
    nextCardNum += 1;
    return { ...c, id: `mc-${nextCardNum}` };
  });

  let nextChartNum = await getMaxItemIdInDb(sectionModel, 'charts', 'ch');
  const charts = (Array.isArray(src.charts) ? src.charts : []).map((ch: any) => {
    nextChartNum += 1;
    return { ...ch, id: `ch-${nextChartNum}` };
  });

  let nextInsightNum = await getMaxItemIdInDb(sectionModel, 'keyInsights', 'ki');
  const keyInsights = (Array.isArray(src.keyInsights) ? src.keyInsights : []).map((ki: any) => {
    nextInsightNum += 1;
    return { ...ki, id: `ki-${nextInsightNum}` };
  });

  const cloned = await sectionModel.create({
    data: {
      id: newId,
      name: clonedName,
      titleHtml: src.titleHtml,
      titleStyle: src.titleStyle,
      eyebrow: src.eyebrow,
      eyebrowHtml: src.eyebrowHtml,
      description: src.description,
      descriptionHtml: src.descriptionHtml,
      type: 'custom',
      icon: src.icon ?? 'Copy',
      orderIndex,
      headerSpacing: src.headerSpacing ?? 'normal',
      sectionStyle: src.sectionStyle,
      metricCards,
      charts,
      keyInsights,
      canvasRows: src.canvasRows ?? [],
      stamps: src.stamps ?? [],
      watermarkId: src.watermarkId,
      projectSite: src.projectSite,
      reportingPeriod: src.reportingPeriod,
      coverPageData: src.coverPageData,
      tableOfContentsData: src.tableOfContentsData,
      backCoverData: src.backCoverData,
      pageOverrides: src.pageOverrides,
      createdBy: user?.id,
    },
  });

  return cloned;
}



/**
 * Delete a custom section (prevents deletion of core standard templates)
 */
export async function deleteSectionService(id: string) {
  const sectionModel = getSectionModel();
  const existing = await sectionModel.findUnique({
    where: { id },
  });

  if (!existing) {
    throw ApiError.notFound(`Section with ID '${id}' not found`);
  }

  if (existing.type === 'core') {
    throw ApiError.badRequest(
      `Core standard section '${existing.name}' (${id}) cannot be deleted as it is a permanent compliance standard.`
    );
  }

  await sectionModel.delete({
    where: { id },
  });

  return {
    message: `Section '${existing.name}' (${id}) deleted successfully`,
    id,
  };
}

/**
 * Bulk reorder sections
 */
export async function reorderSectionsService(input: ReorderSectionsInput) {
  const sectionModel = getSectionModel();

  await prisma.$transaction(
    input.orders.map((item) =>
      sectionModel.update({
        where: { id: item.id },
        data: { orderIndex: item.orderIndex },
      })
    )
  );

  return { message: 'Sections reordered successfully' };
}

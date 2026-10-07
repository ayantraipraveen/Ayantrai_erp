import { Response } from 'express';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { ApiResponse } from '../../shared/utils/apiResponse';
import { AuthenticatedRequest } from '../../shared/types';
import {
  listSectionsService,
  getSectionByIdService,
  createSectionService,
  updateSectionService,
  cloneSectionService,
  deleteSectionService,
  reorderSectionsService,
} from './section.service';

/**
 * GET /api/v1/sections - List sections with filter, search, aggregate statistics, and pagination
 */
export const listSections = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const result = await listSectionsService(req.query);
    res.status(200).json(
      new ApiResponse(
        200,
        result.items,
        'Template sections retrieved successfully',
        {
          ...result.pagination,
          stats: result.stats,
        }
      )
    );
  }
);

/**
 * GET /api/v1/sections/:id - Retrieve single section details with full canvas blocks
 */
export const getSectionById = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const section = await getSectionByIdService(req.params.id as string);
    res
      .status(200)
      .json(new ApiResponse(200, section, 'Section retrieved successfully'));
  }
);

/**
 * POST /api/v1/sections - Create a new custom template section
 */
export const createSection = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const section = await createSectionService(req.body, req.user);
    res
      .status(201)
      .json(new ApiResponse(201, section, 'Section created successfully'));
  }
);

/**
 * PUT /api/v1/sections/:id - Update an existing section's canvas rows, title styling, or telemetry blocks
 */
export const updateSection = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const updated = await updateSectionService(
      req.params.id as string,
      req.body
    );
    res
      .status(200)
      .json(new ApiResponse(200, updated, 'Section updated successfully'));
  }
);

/**
 * POST /api/v1/sections/:id/clone - Clone an existing section into a custom section
 */
export const cloneSection = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const cloned = await cloneSectionService(
      req.params.id as string,
      req.body,
      req.user
    );
    res
      .status(201)
      .json(new ApiResponse(201, cloned, 'Section cloned successfully'));
  }
);

/**
 * DELETE /api/v1/sections/:id - Delete a custom section
 */
export const deleteSection = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const result = await deleteSectionService(req.params.id as string);
    res.status(200).json(new ApiResponse(200, result, result.message));
  }
);

/**
 * PUT /api/v1/sections/reorder - Bulk reorder section sequence
 */
export const reorderSections = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const result = await reorderSectionsService(req.body);
    res.status(200).json(new ApiResponse(200, null, result.message));
  }
);

import { Response } from 'express';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { ApiResponse } from '../../shared/utils/apiResponse';
import { AuthenticatedRequest } from '../../shared/types';
import {
  listWatermarksService,
  getWatermarkByIdService,
  createWatermarkService,
  updateWatermarkService,
  deleteWatermarkService,
} from './watermark.service';

/**
 * GET /api/v1/watermarks - List watermarks with optional query filters
 */
export const listWatermarks = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const result = await listWatermarksService(req.query);
    res.status(200).json(
      new ApiResponse(
        200,
        result.items,
        'Watermarks retrieved successfully',
        result.pagination
      )
    );
  }
);

/**
 * GET /api/v1/watermarks/:id - Retrieve single watermark details
 */
export const getWatermarkById = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const watermark = await getWatermarkByIdService(req.params.id as string);
    res
      .status(200)
      .json(new ApiResponse(200, watermark, 'Watermark retrieved successfully'));
  }
);

/**
 * POST /api/v1/watermarks - Upload or create new SVG watermark
 */
export const createWatermark = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const watermark = await createWatermarkService(req.body, req.user);
    res
      .status(201)
      .json(new ApiResponse(201, watermark, 'Watermark created successfully'));
  }
);

/**
 * PUT /api/v1/watermarks/:id - Update watermark parameters (scale, rotation, opacity)
 */
export const updateWatermark = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const updated = await updateWatermarkService(
      req.params.id as string,
      req.body
    );
    res
      .status(200)
      .json(new ApiResponse(200, updated, 'Watermark updated successfully'));
  }
);

/**
 * DELETE /api/v1/watermarks/:id - Delete watermark by ID
 */
export const deleteWatermark = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const result = await deleteWatermarkService(req.params.id as string);
    res
      .status(200)
      .json(new ApiResponse(200, result, 'Watermark deleted successfully'));
  }
);

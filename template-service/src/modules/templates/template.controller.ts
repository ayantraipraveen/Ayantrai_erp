import { Response } from 'express';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { ApiResponse } from '../../shared/utils/apiResponse';
import { AuthenticatedRequest } from '../../shared/types';
import {
  listTemplatesService,
  getTemplateByIdService,
  createTemplateService,
  updateTemplateService,
  deleteTemplateService,
  approveTemplateService,
  rejectTemplateService,
} from './template.service';

/**
 * GET /api/v1/templates - List templates with query parameters
 */
export const listTemplates = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await listTemplatesService(req.query);
  res
    .status(200)
    .json(new ApiResponse(200, result, 'Templates retrieved successfully'));
});

/**
 * GET /api/v1/templates/:id - Get single template details
 */
export const getTemplateById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const template = await getTemplateByIdService(req.params.id);
  res
    .status(200)
    .json(new ApiResponse(200, template, 'Template details retrieved successfully'));
});

/**
 * POST /api/v1/templates - Create a new template blueprint
 */
export const createTemplate = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const newTemplate = await createTemplateService(req.body, {
    id: req.user!.id,
    name: req.user?.email ? req.user.email.split('@')[0] : 'Site Admin',
  });
  res
    .status(201)
    .json(new ApiResponse(201, newTemplate, 'Template created successfully'));
});

/**
 * PUT /api/v1/templates/:id - Update an existing template
 */
export const updateTemplate = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const updated = await updateTemplateService(req.params.id, req.body, {
    id: req.user!.id,
  });
  res
    .status(200)
    .json(new ApiResponse(200, updated, 'Template updated successfully'));
});

/**
 * DELETE /api/v1/templates/:id - Delete a template
 */
export const deleteTemplate = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await deleteTemplateService(req.params.id);
  res
    .status(200)
    .json(new ApiResponse(200, result, 'Template deleted successfully'));
});

/**
 * POST /api/v1/templates/:id/approve - Superadmin approves template
 */
export const approveTemplate = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const approved = await approveTemplateService(req.params.id, req.body, {
    id: req.user!.id,
    name: 'Superadmin Governance',
  });
  res
    .status(200)
    .json(new ApiResponse(200, approved, 'Template approved successfully'));
});

/**
 * POST /api/v1/templates/:id/reject - Superadmin rejects template
 */
export const rejectTemplate = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const rejected = await rejectTemplateService(req.params.id, req.body, {
    id: req.user!.id,
    name: 'Superadmin Governance',
  });
  res
    .status(200)
    .json(new ApiResponse(200, rejected, 'Template rejected successfully'));
});

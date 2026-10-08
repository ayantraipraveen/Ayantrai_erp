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
  cloneTemplateService,
  resubmitTemplateService,
} from './template.service';

/**
 * GET /api/v1/templates - List templates with query parameters
 */
export const listTemplates = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await listTemplatesService(req.query);
  res
    .status(200)
    .json(new ApiResponse(200, result.items, 'Templates retrieved successfully', result.pagination));
});

/**
 * GET /api/v1/templates/:id - Get single template details
 */
export const getTemplateById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const template = await getTemplateByIdService(req.params.id as string);
  res
    .status(200)
    .json(new ApiResponse(200, template, 'Template details retrieved successfully'));
});

/**
 * POST /api/v1/templates - Create a new template blueprint
 */
export const createTemplate = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id || 'usr-dev-superadmin';
  const userName = req.user?.name || (req.user?.email ? req.user.email.split('@')[0] : 'Site Admin');
  const newTemplate = await createTemplateService(req.body, {
    id: userId,
    name: userName,
  });
  res
    .status(201)
    .json(new ApiResponse(201, newTemplate, 'Template created successfully'));
});

/**
 * PUT /api/v1/templates/:id - Update an existing template
 */
export const updateTemplate = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id || 'usr-dev-superadmin';
  const updated = await updateTemplateService(req.params.id as string, req.body, {
    id: userId,
  });
  res
    .status(200)
    .json(new ApiResponse(200, updated, 'Template updated successfully'));
});

/**
 * DELETE /api/v1/templates/:id - Delete a template
 */
export const deleteTemplate = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await deleteTemplateService(req.params.id as string);
  res
    .status(200)
    .json(new ApiResponse(200, result, 'Template deleted successfully'));
});

/**
 * POST /api/v1/templates/:id/approve - Superadmin approves template
 */
export const approveTemplate = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id || 'usr-dev-superadmin';
  const approved = await approveTemplateService(req.params.id as string, req.body, {
    id: userId,
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
  const userId = req.user?.id || 'usr-dev-superadmin';
  const rejected = await rejectTemplateService(req.params.id as string, req.body, {
    id: userId,
    name: 'Superadmin Governance',
  });
  res
    .status(200)
    .json(new ApiResponse(200, rejected, 'Template rejected successfully'));
});

/**
 * POST /api/v1/templates/:id/clone - Duplicate template
 */
export const cloneTemplate = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id || 'usr-dev-superadmin';
  const userName = req.user?.name || (req.user?.email ? req.user.email.split('@')[0] : 'Site Admin');
  const cloned = await cloneTemplateService(req.params.id as string, req.body, {
    id: userId,
    name: userName,
  });
  res
    .status(201)
    .json(new ApiResponse(201, cloned, 'Template duplicated successfully'));
});

/**
 * POST /api/v1/templates/:id/resubmit - Resubmit template for approval
 */
export const resubmitTemplate = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id || 'usr-dev-superadmin';
  const userName = req.user?.name || (req.user?.email ? req.user.email.split('@')[0] : 'Site Admin');
  const resubmitted = await resubmitTemplateService(req.params.id as string, req.body, {
    id: userId,
    name: userName,
  });
  res
    .status(200)
    .json(new ApiResponse(200, resubmitted, 'Template resubmitted successfully for review'));
});


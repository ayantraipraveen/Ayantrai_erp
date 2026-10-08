import { Router } from 'express';
import {
  listTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  approveTemplate,
  rejectTemplate,
  cloneTemplate,
  resubmitTemplate,
} from './template.controller';
import { validate } from '../../shared/middlewares/validate';
import {
  listTemplatesSchema,
  createTemplateSchema,
  updateTemplateSchema,
  approveTemplateSchema,
  rejectTemplateSchema,
  cloneTemplateSchema,
  resubmitTemplateSchema,
} from './template.schema';
import {
  requireAuth,
  requirePermission,
  requireRole,
} from '../../shared/middlewares/auth.middleware';
import { mutationLimiter } from '../../shared/middlewares/rateLimiter';

const router = Router();

// All template operations require authentication
router.use(requireAuth);

/**
 * @route   GET /api/v1/templates
 * @desc    Query template catalog with filters and pagination
 * @access  Private (templates:read)
 */
router.get(
  '/',
  requirePermission('templates:read'),
  validate(listTemplatesSchema),
  listTemplates
);

/**
 * @route   POST /api/v1/templates
 * @desc    Create new template blueprint
 * @access  Private (templates:create)
 */
router.post(
  '/',
  mutationLimiter,
  requirePermission('templates:create'),
  validate(createTemplateSchema),
  createTemplate
);

/**
 * @route   GET /api/v1/templates/:id
 * @desc    Retrieve single template details
 * @access  Private (templates:read)
 */
router.get('/:id', requirePermission('templates:read'), getTemplateById);

/**
 * @route   PUT /api/v1/templates/:id
 * @desc    Update template contents and auto-increment version
 * @access  Private (templates:update)
 */
router.put(
  '/:id',
  mutationLimiter,
  requirePermission('templates:update'),
  validate(updateTemplateSchema),
  updateTemplate
);

/**
 * @route   DELETE /api/v1/templates/:id
 * @desc    Delete template from catalog
 * @access  Private (templates:delete)
 */
router.delete(
  '/:id',
  mutationLimiter,
  requirePermission('templates:delete'),
  deleteTemplate
);

/**
 * @route   POST /api/v1/templates/:id/clone
 * @desc    Duplicate an existing template blueprint
 * @access  Private (templates:create)
 */
router.post(
  '/:id/clone',
  mutationLimiter,
  requirePermission('templates:create'),
  validate(cloneTemplateSchema),
  cloneTemplate
);

/**
 * @route   POST /api/v1/templates/:id/approve
 * @desc    Superadmin Governance: Approve template
 * @access  Private (Superadmin only)
 */
router.post(
  '/:id/approve',
  mutationLimiter,
  requireRole('superadmin'),
  validate(approveTemplateSchema),
  approveTemplate
);

/**
 * @route   POST /api/v1/templates/:id/reject
 * @desc    Superadmin Governance: Reject template
 * @access  Private (Superadmin only)
 */
router.post(
  '/:id/reject',
  mutationLimiter,
  requireRole('superadmin'),
  validate(rejectTemplateSchema),
  rejectTemplate
);

/**
 * @route   POST /api/v1/templates/:id/resubmit
 * @desc    Resubmit rejected template for approval review
 * @access  Private (templates:update)
 */
router.post(
  '/:id/resubmit',
  mutationLimiter,
  requirePermission('templates:update'),
  validate(resubmitTemplateSchema),
  resubmitTemplate
);

export default router;

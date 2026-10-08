import { Router } from 'express';
import {
  listSections,
  getSectionById,
  createSection,
  updateSection,
  cloneSection,
  deleteSection,
  reorderSections,
} from './section.controller';
import { validate } from '../../shared/middlewares/validate';
import {
  listSectionsSchema,
  createSectionSchema,
  updateSectionSchema,
  cloneSectionSchema,
  reorderSectionsSchema,
} from './section.schema';
import {
  requireAuth,
  requirePermission,
} from '../../shared/middlewares/auth.middleware';
import { mutationLimiter } from '../../shared/middlewares/rateLimiter';

const router = Router();

// All section operations require authentication
router.use(requireAuth);

/**
 * @route   GET /api/v1/sections
 * @desc    Query template section library with filters, search, and aggregate stats
 * @access  Private (templates:read)
 */
router.get(
  '/',
  requirePermission('templates:read'),
  validate(listSectionsSchema),
  listSections
);

/**
 * @route   PUT /api/v1/sections/reorder
 * @desc    Bulk update order indices of sections
 * @access  Private (templates:update)
 */
router.put(
  '/reorder',
  mutationLimiter,
  requirePermission('templates:update'),
  validate(reorderSectionsSchema),
  reorderSections
);

/**
 * @route   GET /api/v1/sections/:id
 * @desc    Retrieve single section by ID with all canvas rows, telemetry, and styles
 * @access  Private (templates:read)
 */
router.get('/:id', requirePermission('templates:read'), getSectionById);

/**
 * @route   POST /api/v1/sections
 * @desc    Create a new custom reusable section
 * @access  Private (templates:create)
 */
router.post(
  '/',
  mutationLimiter,
  requirePermission('templates:create'),
  validate(createSectionSchema),
  createSection
);

/**
 * @route   PUT /api/v1/sections/:id
 * @desc    Update section properties, canvas rows, or title formatting
 * @access  Private (templates:update)
 */
router.put(
  '/:id',
  mutationLimiter,
  requirePermission('templates:update'),
  validate(updateSectionSchema),
  updateSection
);

/**
 * @route   POST /api/v1/sections/:id/clone
 * @desc    Clone an existing core or custom section into a new custom section
 * @access  Private (templates:create)
 */
router.post(
  '/:id/clone',
  mutationLimiter,
  requirePermission('templates:create'),
  validate(cloneSectionSchema),
  cloneSection
);

/**
 * @route   DELETE /api/v1/sections/:id
 * @desc    Delete a custom section (prevents deleting core standard templates)
 * @access  Private (templates:delete)
 */
router.delete(
  '/:id',
  mutationLimiter,
  requirePermission('templates:delete'),
  deleteSection
);

export default router;

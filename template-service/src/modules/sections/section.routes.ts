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
  createSectionSchema,
  updateSectionSchema,
  cloneSectionSchema,
  reorderSectionsSchema,
} from './section.schema';
import { optionalAuth } from '../../shared/middlewares/auth.middleware';

const router = Router();

/**
 * @route   GET /api/v1/sections
 * @desc    Query template section library with filters, search, and aggregate stats
 * @access  Public / Authenticated
 */
router.get('/', listSections);

/**
 * @route   PUT /api/v1/sections/reorder
 * @desc    Bulk update order indices of sections
 * @access  Public (Dev) / Authenticated (Prod)
 */
router.put(
  '/reorder',
  optionalAuth,
  validate(reorderSectionsSchema),
  reorderSections
);

/**
 * @route   GET /api/v1/sections/:id
 * @desc    Retrieve single section by ID with all canvas rows, telemetry, and styles
 * @access  Public / Authenticated
 */
router.get('/:id', getSectionById);

/**
 * @route   POST /api/v1/sections
 * @desc    Create a new custom reusable section
 * @access  Public (Dev) / Authenticated (Prod)
 */
router.post(
  '/',
  optionalAuth,
  validate(createSectionSchema),
  createSection
);

/**
 * @route   PUT /api/v1/sections/:id
 * @desc    Update section properties, canvas rows, or title formatting
 * @access  Public (Dev) / Authenticated (Prod)
 */
router.put(
  '/:id',
  optionalAuth,
  validate(updateSectionSchema),
  updateSection
);

/**
 * @route   POST /api/v1/sections/:id/clone
 * @desc    Clone an existing core or custom section into a new custom section
 * @access  Public (Dev) / Authenticated (Prod)
 */
router.post(
  '/:id/clone',
  optionalAuth,
  validate(cloneSectionSchema),
  cloneSection
);

/**
 * @route   DELETE /api/v1/sections/:id
 * @desc    Delete a custom section (prevents deleting core standard templates)
 * @access  Public (Dev) / Authenticated (Prod)
 */
router.delete('/:id', optionalAuth, deleteSection);

export default router;

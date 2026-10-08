import { Router } from 'express';
import {
  listWatermarks,
  getWatermarkById,
  createWatermark,
  updateWatermark,
  deleteWatermark,
} from './watermark.controller';
import { validate } from '../../shared/middlewares/validate';
import {
  listWatermarksSchema,
  createWatermarkSchema,
  updateWatermarkSchema,
} from './watermark.schema';
import {
  requireAuth,
  requirePermission,
} from '../../shared/middlewares/auth.middleware';
import { mutationLimiter } from '../../shared/middlewares/rateLimiter';
import { methodNotAllowed } from '../../shared/middlewares/methodNotAllowed';

const router = Router();

// All watermark operations require authentication
router.use(requireAuth);

/**
 * @route   GET /api/v1/watermarks
 * @desc    Query watermark stamp catalog with optional search and filters
 * @access  Private (templates:read)
 */
router.get(
  '/',
  requirePermission('templates:read'),
  validate(listWatermarksSchema),
  listWatermarks
);

/**
 * @route   POST /api/v1/watermarks
 * @desc    Upload or create a new SVG watermark stamp
 * @access  Private (templates:create)
 */
router.post(
  '/',
  mutationLimiter,
  requirePermission('templates:create'),
  validate(createWatermarkSchema),
  createWatermark
);

router.all('/', methodNotAllowed(['GET', 'POST']));

/**
 * @route   GET /api/v1/watermarks/:id
 * @desc    Retrieve single watermark by ID
 * @access  Private (templates:read)
 */
router.get('/:id', requirePermission('templates:read'), getWatermarkById);

/**
 * @route   PUT /api/v1/watermarks/:id
 * @desc    Update watermark properties (scale, rotation, opacity, placement)
 * @access  Private (templates:update)
 */
router.put(
  '/:id',
  mutationLimiter,
  requirePermission('templates:update'),
  validate(updateWatermarkSchema),
  updateWatermark
);

/**
 * @route   DELETE /api/v1/watermarks/:id
 * @desc    Delete a watermark stamp
 * @access  Private (templates:delete)
 */
router.delete(
  '/:id',
  mutationLimiter,
  requirePermission('templates:delete'),
  deleteWatermark
);

router.all('/:id', methodNotAllowed(['GET', 'PUT', 'DELETE']));

export default router;

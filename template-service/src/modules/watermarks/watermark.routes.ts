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
  createWatermarkSchema,
  updateWatermarkSchema,
} from './watermark.schema';
import { optionalAuth } from '../../shared/middlewares/auth.middleware';

const router = Router();

/**
 * @route   GET /api/v1/watermarks
 * @desc    Query watermark stamp catalog with optional search and filters
 * @access  Public / Authenticated
 */
router.get('/', listWatermarks);

/**
 * @route   GET /api/v1/watermarks/:id
 * @desc    Retrieve single watermark by ID
 * @access  Public / Authenticated
 */
router.get('/:id', getWatermarkById);

/**
 * @route   POST /api/v1/watermarks
 * @desc    Upload or create a new SVG watermark stamp
 * @access  Public (Dev) / Authenticated (Prod)
 */
router.post(
  '/',
  optionalAuth,
  validate(createWatermarkSchema),
  createWatermark
);

/**
 * @route   PUT /api/v1/watermarks/:id
 * @desc    Update watermark properties (scale, rotation, opacity, placement)
 * @access  Public (Dev) / Authenticated (Prod)
 */
router.put(
  '/:id',
  optionalAuth,
  validate(updateWatermarkSchema),
  updateWatermark
);

/**
 * @route   DELETE /api/v1/watermarks/:id
 * @desc    Delete a watermark stamp
 * @access  Public (Dev) / Authenticated (Prod)
 */
router.delete('/:id', optionalAuth, deleteWatermark);

export default router;

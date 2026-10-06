import { Router } from 'express';
import { login, getMe } from './auth.controller';
import { validate } from '../../shared/middlewares/validate';
import { loginSchema } from './auth.schema';
import { requireAuth } from '../../shared/middlewares/auth.middleware';

const router = Router();

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate user and issue JWT session token
 * @access  Public
 */
router.post('/login', validate(loginSchema), login);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get currently authenticated user's profile and permissions
 * @access  Private (Bearer token)
 */
router.get('/me', requireAuth, getMe);

export default router;

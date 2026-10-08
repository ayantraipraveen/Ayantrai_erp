import { Router } from 'express';
import { login, getMe, logout } from './auth.controller';
import { validate } from '../../shared/middlewares/validate';
import { loginSchema } from './auth.schema';
import { requireAuth, optionalAuth } from '../../shared/middlewares/auth.middleware';

const router = Router();

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate user, set httpOnly session cookies, and issue JWT
 * @access  Public
 */
router.post('/login', validate(loginSchema), login);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get currently authenticated user's profile and permissions
 * @access  Private (Cookie or Bearer token)
 */
router.get('/me', requireAuth, getMe);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Invalidate current user session and clear httpOnly cookies
 * @access  Private / Optional (Always clears cookies)
 */
router.post('/logout', optionalAuth, logout);

export default router;


import { Request, Response, CookieOptions } from 'express';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { ApiResponse } from '../../shared/utils/apiResponse';
import { loginService, logoutService, getMeService } from './auth.service';
import { AuthenticatedRequest } from '../../shared/types';

export const AUTH_COOKIE_NAME = 'sitesafe_token';
export const REFRESH_COOKIE_NAME = 'sitesafe_refresh_token';

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Enterprise cookie options:
 * - httpOnly: true (prevents XSS attacks from accessing token via document.cookie)
 * - secure: true in production (forces HTTPS transmission)
 * - sameSite: lax (protects against CSRF while enabling cross-origin SPA navigation)
 * - path: '/' (available application-wide across microservices)
 */
export const getAuthCookieOptions = (maxAgeMs?: number): CookieOptions => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: (isProduction ? 'strict' : 'lax') as 'strict' | 'lax',
  path: '/',
  ...(maxAgeMs ? { maxAge: maxAgeMs } : {}),
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await loginService(req.body);

  // Set secure httpOnly cookies
  const accessTokenMaxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
  const refreshTokenMaxAge = 30 * 24 * 60 * 60 * 1000; // 30 days

  res.cookie(AUTH_COOKIE_NAME, result.token, getAuthCookieOptions(accessTokenMaxAge));

  if (result.refreshToken) {
    res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, getAuthCookieOptions(refreshTokenMaxAge));
  }

  res
    .status(200)
    .json(new ApiResponse(200, result, 'Login successful'));
});

export const getMe = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userProfile = await getMeService(req.user!.id);
  res
    .status(200)
    .json(new ApiResponse(200, userProfile, 'Current user profile retrieved'));
});

export const logout = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await logoutService(req.user?.id);

  // Invalidate and clear httpOnly cookies in the client browser
  res.clearCookie(AUTH_COOKIE_NAME, getAuthCookieOptions());
  res.clearCookie(REFRESH_COOKIE_NAME, getAuthCookieOptions());

  res
    .status(200)
    .json(new ApiResponse(200, result, 'Logged out successfully'));
});


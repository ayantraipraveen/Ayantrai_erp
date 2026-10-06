import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { ApiResponse } from '../../shared/utils/apiResponse';
import { loginService, logoutService, getMeService } from './auth.service';
import { AuthenticatedRequest } from '../../shared/types';

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await loginService(req.body);
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
  res
    .status(200)
    .json(new ApiResponse(200, result, 'Logged out successfully'));
});


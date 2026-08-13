import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import * as authService from './auth.service.js';

const REFRESH_COOKIE = 'refreshToken';
const cookieOptions = { httpOnly: true, sameSite: 'lax' as const, secure: process.env.NODE_ENV === 'production' };

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  res.cookie(REFRESH_COOKIE, result.refreshToken, cookieOptions);
  sendSuccess(res, result, 'Account created — check your email for a verification code', 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  res.cookie(REFRESH_COOKIE, result.refreshToken, cookieOptions);
  sendSuccess(res, result, 'Logged in successfully');
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie(REFRESH_COOKIE);
  sendSuccess(res, null, 'Logged out');
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.refresh(req.cookies?.[REFRESH_COOKIE]);
  res.cookie(REFRESH_COOKIE, result.refreshToken, cookieOptions);
  sendSuccess(res, result, 'Session refreshed');
});

export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.verifyOtp(req.body.email, req.body.code);
  sendSuccess(res, result, 'Email verified successfully');
});

export const resendOtp = asyncHandler(async (req: Request, res: Response) => {
  await authService.resendOtp(req.body.email);
  sendSuccess(res, null, 'Verification code resent');
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.forgotPassword(req.body.email);
  sendSuccess(res, null, 'If an account exists for this email, a reset link has been sent');
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.resetPassword(req.body.token, req.body.password);
  sendSuccess(res, null, 'Password reset successfully');
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getMe(req.user!.id);
  sendSuccess(res, user);
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.updateProfile(req.user!.id, req.body);
  sendSuccess(res, user, 'Profile updated');
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.changePassword(req.user!.id, req.body.currentPassword, req.body.newPassword);
  sendSuccess(res, null, 'Password changed successfully');
});

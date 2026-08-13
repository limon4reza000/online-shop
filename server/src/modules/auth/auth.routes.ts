import { Router } from 'express';
import passport from 'passport';
import { env } from '../../config/env.js';
import { protect } from '../../middleware/auth.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { signAccessToken, signRefreshToken } from '../../utils/jwt.js';
import * as controller from './auth.controller.js';
import {
  registerSchema, loginSchema, verifyOtpSchema, forgotPasswordSchema, resetPasswordSchema,
  updateProfileSchema, changePasswordSchema,
} from './auth.schema.js';

export const authRouter = Router();

authRouter.post('/register', validateBody(registerSchema), controller.register);
authRouter.post('/login', validateBody(loginSchema), controller.login);
authRouter.post('/logout', controller.logout);
authRouter.post('/refresh', controller.refresh);
authRouter.post('/verify-otp', validateBody(verifyOtpSchema), controller.verifyOtp);
authRouter.post('/resend-otp', controller.resendOtp);
authRouter.post('/forgot-password', validateBody(forgotPasswordSchema), controller.forgotPassword);
authRouter.post('/reset-password', validateBody(resetPasswordSchema), controller.resetPassword);
authRouter.get('/me', protect, controller.me);
authRouter.patch('/me', protect, validateBody(updateProfileSchema), controller.updateProfile);
authRouter.post('/change-password', protect, validateBody(changePasswordSchema), controller.changePassword);

// --- Social login -----------------------------------------------------
// Both providers redirect back to CLIENT_URL with tokens as query params
// once .env has real credentials; until then they respond 501 so the
// frontend's "Continue with Google/Facebook" buttons fail loudly instead
// of silently hanging.

if (env.google.enabled) {
  authRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
  authRouter.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: `${env.clientUrl}/login` }),
    (req, res) => {
      const user = req.user as { id: string; role: string };
      const accessToken = signAccessToken({ sub: user.id, role: user.role });
      const refreshToken = signRefreshToken({ sub: user.id, role: user.role });
      res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'lax' });
      res.redirect(`${env.clientUrl}/auth/callback?token=${accessToken}`);
    }
  );
} else {
  authRouter.get('/google', (_req, res) => res.status(501).json({ success: false, message: 'Google OAuth is not configured on this server' }));
}

if (env.facebook.enabled) {
  authRouter.get('/facebook', passport.authenticate('facebook', { scope: ['email'], session: false }));
  authRouter.get(
    '/facebook/callback',
    passport.authenticate('facebook', { session: false, failureRedirect: `${env.clientUrl}/login` }),
    (req, res) => {
      const user = req.user as { id: string; role: string };
      const accessToken = signAccessToken({ sub: user.id, role: user.role });
      const refreshToken = signRefreshToken({ sub: user.id, role: user.role });
      res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'lax' });
      res.redirect(`${env.clientUrl}/auth/callback?token=${accessToken}`);
    }
  );
} else {
  authRouter.get('/facebook', (_req, res) => res.status(501).json({ success: false, message: 'Facebook OAuth is not configured on this server' }));
}

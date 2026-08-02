import { prisma } from '../../lib/prisma.js';
import { hashPassword, comparePassword } from '../../utils/hash.js';
import { generateOtp, signAccessToken, signRefreshToken } from '../../utils/jwt.js';
import { ApiError } from '../../utils/ApiError.js';
import { sendEmail, emailTemplates } from '../../config/mailer.js';
import type { RegisterInput, LoginInput } from './auth.schema.js';

const OTP_TTL_MS = 10 * 60 * 1000;

function issueTokens(user: { id: string; role: string }) {
  const payload = { sub: user.id, role: user.role };
  return { accessToken: signAccessToken(payload), refreshToken: signRefreshToken(payload) };
}

function toPublicUser(user: {
  id: string; name: string; email: string; role: string; emailVerified: boolean; avatarUrl: string | null;
}) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, emailVerified: user.emailVerified, avatarUrl: user.avatarUrl };
}

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const password = await hashPassword(input.password);
  const otpCode = generateOtp();

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password,
      otpCode,
      otpExpiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
  });

  await sendEmail({ to: user.email, subject: 'আপনার নিত্যঘর অ্যাকাউন্ট যাচাই করুন', html: emailTemplates.otp(otpCode) });

  return { user: toPublicUser(user), ...issueTokens(user) };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !user.password) throw ApiError.unauthorized('Invalid email or password');
  if (user.status === 'blocked') throw ApiError.forbidden('This account has been blocked');

  const valid = await comparePassword(input.password, user.password);
  if (!valid) throw ApiError.unauthorized('Invalid email or password');

  return { user: toPublicUser(user), ...issueTokens(user) };
}

export async function resendOtp(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw ApiError.notFound('No account found for this email');
  if (user.emailVerified) throw ApiError.badRequest('Email is already verified');

  const otpCode = generateOtp();
  await prisma.user.update({ where: { id: user.id }, data: { otpCode, otpExpiresAt: new Date(Date.now() + OTP_TTL_MS) } });
  await sendEmail({ to: user.email, subject: 'আপনার নতুন নিত্যঘর যাচাইকরণ কোড', html: emailTemplates.otp(otpCode) });
}

export async function verifyOtp(email: string, code: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw ApiError.notFound('No account found for this email');
  if (!user.otpCode || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
    throw ApiError.badRequest('Verification code has expired — request a new one');
  }
  if (user.otpCode !== code) throw ApiError.badRequest('Invalid verification code');

  const verified = await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, otpCode: null, otpExpiresAt: null },
  });

  return { user: toPublicUser(verified), ...issueTokens(verified) };
}

export async function forgotPassword(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  // Always resolve without leaking whether the email exists.
  if (!user) return;

  const resetToken = generateOtp() + generateOtp();
  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken, resetTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000) },
  });

  const resetLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
  await sendEmail({ to: user.email, subject: 'আপনার নিত্যঘর পাসওয়ার্ড রিসেট করুন', html: emailTemplates.passwordReset(resetLink) });
}

export async function resetPassword(token: string, newPassword: string) {
  const user = await prisma.user.findFirst({ where: { resetToken: token } });
  if (!user || !user.resetTokenExpiresAt || user.resetTokenExpiresAt < new Date()) {
    throw ApiError.badRequest('This reset link is invalid or has expired');
  }

  const password = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { password, resetToken: null, resetTokenExpiresAt: null },
  });
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound('User not found');
  return toPublicUser(user);
}

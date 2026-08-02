import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';

export const couponsRouter = Router();

const couponSchema = z.object({
  code: z.string().min(3).transform((s) => s.toUpperCase()),
  type: z.enum(['percent', 'fixed']),
  discount: z.number().positive(),
  maxUses: z.number().int().positive().optional(),
  expiresAt: z.coerce.date(),
});

// Customer: validate + get discount details for a code at checkout.
couponsRouter.post('/validate', protect, asyncHandler(async (req, res) => {
  const code = String(req.body.code || '').toUpperCase();
  const coupon = await prisma.coupon.findUnique({ where: { code } });

  if (!coupon || !coupon.active) throw ApiError.badRequest('Invalid coupon code');
  if (coupon.expiresAt < new Date()) throw ApiError.badRequest('This coupon has expired');
  if (coupon.maxUses && coupon.usageCount >= coupon.maxUses) throw ApiError.badRequest('This coupon has reached its usage limit');

  sendSuccess(res, coupon, 'Coupon applied');
}));

couponsRouter.get('/', protect, authorize('ADMIN', 'MANAGER'), asyncHandler(async (_req, res) => {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  sendSuccess(res, coupons);
}));

couponsRouter.post('/', protect, authorize('ADMIN', 'MANAGER'), validateBody(couponSchema), asyncHandler(async (req, res) => {
  const coupon = await prisma.coupon.create({ data: req.body });
  sendSuccess(res, coupon, 'Coupon created', 201);
}));

couponsRouter.patch('/:id', protect, authorize('ADMIN', 'MANAGER'), asyncHandler(async (req, res) => {
  const coupon = await prisma.coupon.update({ where: { id: req.params.id }, data: req.body });
  sendSuccess(res, coupon, 'Coupon updated');
}));

couponsRouter.delete('/:id', protect, authorize('ADMIN'), asyncHandler(async (req, res) => {
  await prisma.coupon.delete({ where: { id: req.params.id } });
  sendSuccess(res, null, 'Coupon deleted');
}));

import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';

export const reviewsRouter = Router();

const reviewSchema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(2),
  body: z.string().min(5),
});

// Customer: submit a review — goes to PENDING until an admin approves it.
reviewsRouter.post('/', protect, validateBody(reviewSchema), asyncHandler(async (req, res) => {
  const hasPurchased = await prisma.orderItem.findFirst({
    where: { productId: req.body.productId, order: { userId: req.user!.id, status: 'DELIVERED' } },
  });

  const review = await prisma.review.create({
    data: { ...req.body, userId: req.user!.id, verified: !!hasPurchased },
  });
  sendSuccess(res, review, 'Review submitted for moderation', 201);
}));

reviewsRouter.get('/mine', protect, asyncHandler(async (req, res) => {
  const reviews = await prisma.review.findMany({ where: { userId: req.user!.id }, include: { product: true }, orderBy: { createdAt: 'desc' } });
  sendSuccess(res, reviews);
}));

reviewsRouter.delete('/:id', protect, asyncHandler(async (req, res) => {
  const review = await prisma.review.findUnique({ where: { id: req.params.id } });
  if (!review) throw ApiError.notFound('Review not found');
  if (review.userId !== req.user!.id && req.user!.role !== 'ADMIN') throw ApiError.forbidden();
  await prisma.review.delete({ where: { id: req.params.id } });
  sendSuccess(res, null, 'Review deleted');
}));

// Admin: moderation queue.
reviewsRouter.get('/', protect, authorize('ADMIN', 'MANAGER'), asyncHandler(async (req, res) => {
  const status = req.query.status as string | undefined;
  const reviews = await prisma.review.findMany({
    where: status ? { status: status.toUpperCase() as 'PENDING' | 'APPROVED' | 'REJECTED' } : undefined,
    include: { user: true, product: true },
    orderBy: { createdAt: 'desc' },
  });
  sendSuccess(res, reviews);
}));

reviewsRouter.patch('/:id/status', protect, authorize('ADMIN', 'MANAGER'), asyncHandler(async (req, res) => {
  const status = String(req.body.status || '').toUpperCase();
  if (!['APPROVED', 'REJECTED'].includes(status)) throw ApiError.badRequest('Invalid status');

  const review = await prisma.review.update({ where: { id: req.params.id }, data: { status: status as 'APPROVED' | 'REJECTED' } });

  if (status === 'APPROVED') {
    const agg = await prisma.review.aggregate({ where: { productId: review.productId, status: 'APPROVED' }, _avg: { rating: true }, _count: true });
    await prisma.product.update({
      where: { id: review.productId },
      data: { rating: agg._avg.rating || 0, reviewCount: agg._count },
    });
  }

  sendSuccess(res, review, `Review ${status.toLowerCase()}`);
}));

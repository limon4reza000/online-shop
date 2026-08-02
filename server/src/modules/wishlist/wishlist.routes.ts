import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';
import { protect } from '../../middleware/auth.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/ApiResponse.js';

export const wishlistRouter = Router();
wishlistRouter.use(protect);

wishlistRouter.get('/', asyncHandler(async (req, res) => {
  const items = await prisma.wishlistItem.findMany({ where: { userId: req.user!.id }, include: { product: true } });
  sendSuccess(res, items);
}));

// Toggle: adds if absent, removes if present — mirrors the frontend's optimistic UX.
wishlistRouter.post('/toggle', asyncHandler(async (req, res) => {
  const { productId } = req.body as { productId: string };
  const existing = await prisma.wishlistItem.findUnique({ where: { userId_productId: { userId: req.user!.id, productId } } });

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    return sendSuccess(res, { wishlisted: false }, 'Removed from wishlist');
  }

  await prisma.wishlistItem.create({ data: { userId: req.user!.id, productId } });
  sendSuccess(res, { wishlisted: true }, 'Added to wishlist');
}));

import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';
import { protect } from '../../middleware/auth.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { trackViewSchema, mergeRecentlyViewedSchema } from './recentlyViewed.schema.js';

export const recentlyViewedRouter = Router();
recentlyViewedRouter.use(protect);

const MAX_ITEMS = 20;

// Keep only the newest MAX_ITEMS rows per user so the table stays bounded.
async function pruneOldest(userId: string) {
  const overflow = await prisma.recentlyViewed.findMany({
    where: { userId },
    orderBy: { viewedAt: 'desc' },
    skip: MAX_ITEMS,
    select: { id: true },
  });
  if (overflow.length > 0) {
    await prisma.recentlyViewed.deleteMany({ where: { id: { in: overflow.map((o) => o.id) } } });
  }
}

recentlyViewedRouter.get('/', asyncHandler(async (req, res) => {
  const items = await prisma.recentlyViewed.findMany({
    where: { userId: req.user!.id },
    include: { product: { include: { category: true, brand: true } } },
    orderBy: { viewedAt: 'desc' },
    take: MAX_ITEMS,
  });
  sendSuccess(res, items);
}));

// Record (or bump) a view — dedupes via the userId+productId unique constraint.
recentlyViewedRouter.post('/', validateBody(trackViewSchema), asyncHandler(async (req, res) => {
  const { productId } = req.body as { productId: string };
  const item = await prisma.recentlyViewed.upsert({
    where: { userId_productId: { userId: req.user!.id, productId } },
    update: { viewedAt: new Date() },
    create: { userId: req.user!.id, productId },
    include: { product: { include: { category: true, brand: true } } },
  });
  await pruneOldest(req.user!.id);
  sendSuccess(res, item);
}));

// Merge a guest's localStorage history into the account right after login —
// existing DB timestamps win over stale local ones, otherwise the local one is kept.
recentlyViewedRouter.post('/merge', validateBody(mergeRecentlyViewedSchema), asyncHandler(async (req, res) => {
  const { items } = req.body as { items: { productId: string; viewedAt: Date }[] };
  const userId = req.user!.id;

  for (const { productId, viewedAt } of items) {
    const existing = await prisma.recentlyViewed.findUnique({ where: { userId_productId: { userId, productId } } });
    if (existing) {
      if (viewedAt > existing.viewedAt) {
        await prisma.recentlyViewed.update({ where: { id: existing.id }, data: { viewedAt } });
      }
    } else {
      await prisma.recentlyViewed.create({ data: { userId, productId, viewedAt } }).catch(() => {
        // Product may have been deleted since the guest viewed it — safe to skip.
      });
    }
  }
  await pruneOldest(userId);

  const merged = await prisma.recentlyViewed.findMany({
    where: { userId },
    include: { product: { include: { category: true, brand: true } } },
    orderBy: { viewedAt: 'desc' },
    take: MAX_ITEMS,
  });
  sendSuccess(res, merged, 'Merged');
}));

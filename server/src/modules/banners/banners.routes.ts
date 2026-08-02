import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/ApiResponse.js';

export const bannersRouter = Router();

const bannerSchema = z.object({
  title: z.string().min(2),
  subtitle: z.string().optional(),
  image: z.string().url(),
  link: z.string().url().optional(),
  active: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

bannersRouter.get('/', asyncHandler(async (req, res) => {
  const activeOnly = req.query.active === 'true';
  const banners = await prisma.banner.findMany({
    where: activeOnly ? { active: true } : undefined,
    orderBy: { sortOrder: 'asc' },
  });
  sendSuccess(res, banners);
}));

bannersRouter.post('/', protect, authorize('ADMIN', 'MANAGER'), validateBody(bannerSchema), asyncHandler(async (req, res) => {
  const banner = await prisma.banner.create({ data: req.body });
  sendSuccess(res, banner, 'Banner created', 201);
}));

bannersRouter.patch('/:id', protect, authorize('ADMIN', 'MANAGER'), asyncHandler(async (req, res) => {
  const banner = await prisma.banner.update({ where: { id: req.params.id }, data: req.body });
  sendSuccess(res, banner, 'Banner updated');
}));

bannersRouter.delete('/:id', protect, authorize('ADMIN'), asyncHandler(async (req, res) => {
  await prisma.banner.delete({ where: { id: req.params.id } });
  sendSuccess(res, null, 'Banner deleted');
}));

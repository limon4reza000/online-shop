import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/ApiResponse.js';

export const brandsRouter = Router();

const brandSchema = z.object({ name: z.string().min(2), logoUrl: z.string().url().optional() });

brandsRouter.get('/', asyncHandler(async (_req, res) => {
  const brands = await prisma.brand.findMany({ include: { _count: { select: { products: true } } } });
  sendSuccess(res, brands);
}));

brandsRouter.post('/', protect, authorize('ADMIN', 'MANAGER'), validateBody(brandSchema), asyncHandler(async (req, res) => {
  const brand = await prisma.brand.create({ data: req.body });
  sendSuccess(res, brand, 'Brand created', 201);
}));

brandsRouter.patch('/:id', protect, authorize('ADMIN', 'MANAGER'), asyncHandler(async (req, res) => {
  const brand = await prisma.brand.update({ where: { id: req.params.id }, data: req.body });
  sendSuccess(res, brand, 'Brand updated');
}));

brandsRouter.delete('/:id', protect, authorize('ADMIN'), asyncHandler(async (req, res) => {
  await prisma.brand.delete({ where: { id: req.params.id } });
  sendSuccess(res, null, 'Brand deleted');
}));

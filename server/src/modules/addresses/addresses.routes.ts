import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { protect } from '../../middleware/auth.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';

export const addressesRouter = Router();
addressesRouter.use(protect);

const addressSchema = z.object({
  label: z.enum(['Home', 'Work', 'Other']).default('Home'),
  fullName: z.string().min(2),
  line1: z.string().min(4),
  city: z.string().min(2),
  zip: z.string().min(3),
  country: z.string().min(2),
  phone: z.string().min(6),
  isDefault: z.boolean().default(false),
});

addressesRouter.get('/', asyncHandler(async (req, res) => {
  const addresses = await prisma.address.findMany({ where: { userId: req.user!.id }, orderBy: { isDefault: 'desc' } });
  sendSuccess(res, addresses);
}));

addressesRouter.post('/', validateBody(addressSchema), asyncHandler(async (req, res) => {
  if (req.body.isDefault) {
    await prisma.address.updateMany({ where: { userId: req.user!.id }, data: { isDefault: false } });
  }
  const address = await prisma.address.create({ data: { ...req.body, userId: req.user!.id } });
  sendSuccess(res, address, 'Address added', 201);
}));

addressesRouter.patch('/:id', asyncHandler(async (req, res) => {
  const existing = await prisma.address.findUnique({ where: { id: req.params.id } });
  if (!existing || existing.userId !== req.user!.id) throw ApiError.notFound('Address not found');

  if (req.body.isDefault) {
    await prisma.address.updateMany({ where: { userId: req.user!.id }, data: { isDefault: false } });
  }
  const address = await prisma.address.update({ where: { id: req.params.id }, data: req.body });
  sendSuccess(res, address, 'Address updated');
}));

addressesRouter.delete('/:id', asyncHandler(async (req, res) => {
  const existing = await prisma.address.findUnique({ where: { id: req.params.id } });
  if (!existing || existing.userId !== req.user!.id) throw ApiError.notFound('Address not found');
  await prisma.address.delete({ where: { id: req.params.id } });
  sendSuccess(res, null, 'Address removed');
}));

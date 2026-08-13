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
  label: z.enum(['Home', 'Office', 'Other']).default('Home'),
  fullName: z.string().min(2, 'পূর্ণ নাম আবশ্যক'),
  phone: z.string().min(6, 'সঠিক মোবাইল নম্বর দিন'),
  division: z.string().min(2, 'বিভাগ আবশ্যক'),
  district: z.string().min(2, 'জেলা আবশ্যক'),
  upazila: z.string().min(2, 'উপজেলা/এলাকা আবশ্যক'),
  postalCode: z.string().min(3, 'পোস্টাল কোড আবশ্যক'),
  fullAddress: z.string().min(5, 'সম্পূর্ণ ঠিকানা আবশ্যক'),
  isDefault: z.boolean().default(false),
});
const updateAddressSchema = addressSchema.partial();

addressesRouter.get('/', asyncHandler(async (req, res) => {
  const addresses = await prisma.address.findMany({ where: { userId: req.user!.id }, orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }] });
  sendSuccess(res, addresses);
}));

addressesRouter.post('/', validateBody(addressSchema), asyncHandler(async (req, res) => {
  const existingCount = await prisma.address.count({ where: { userId: req.user!.id } });
  const makeDefault = req.body.isDefault || existingCount === 0;

  const address = await prisma.$transaction(async (tx) => {
    if (makeDefault) {
      await tx.address.updateMany({ where: { userId: req.user!.id }, data: { isDefault: false } });
    }
    return tx.address.create({ data: { ...req.body, isDefault: makeDefault, userId: req.user!.id } });
  });

  sendSuccess(res, address, 'Address added', 201);
}));

addressesRouter.patch('/:id', validateBody(updateAddressSchema), asyncHandler(async (req, res) => {
  const existing = await prisma.address.findUnique({ where: { id: req.params.id } });
  if (!existing || existing.userId !== req.user!.id) throw ApiError.notFound('Address not found');

  const address = await prisma.$transaction(async (tx) => {
    if (req.body.isDefault) {
      await tx.address.updateMany({ where: { userId: req.user!.id }, data: { isDefault: false } });
    }
    return tx.address.update({ where: { id: req.params.id }, data: req.body });
  });

  sendSuccess(res, address, 'Address updated');
}));

// PATCH /:id/default — convenience endpoint so the address list only needs a single click action.
addressesRouter.patch('/:id/default', asyncHandler(async (req, res) => {
  const existing = await prisma.address.findUnique({ where: { id: req.params.id } });
  if (!existing || existing.userId !== req.user!.id) throw ApiError.notFound('Address not found');

  const address = await prisma.$transaction(async (tx) => {
    await tx.address.updateMany({ where: { userId: req.user!.id }, data: { isDefault: false } });
    return tx.address.update({ where: { id: req.params.id }, data: { isDefault: true } });
  });

  sendSuccess(res, address, 'Default address updated');
}));

addressesRouter.delete('/:id', asyncHandler(async (req, res) => {
  const existing = await prisma.address.findUnique({ where: { id: req.params.id } });
  if (!existing || existing.userId !== req.user!.id) throw ApiError.notFound('Address not found');

  await prisma.$transaction(async (tx) => {
    await tx.address.delete({ where: { id: req.params.id } });
    // If the deleted address was the default, promote the most recently added remaining one.
    if (existing.isDefault) {
      const next = await tx.address.findFirst({ where: { userId: req.user!.id }, orderBy: { createdAt: 'desc' } });
      if (next) await tx.address.update({ where: { id: next.id }, data: { isDefault: true } });
    }
  });

  sendSuccess(res, null, 'Address removed');
}));

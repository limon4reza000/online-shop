import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { broadcastContentUpdate } from '../../sockets/index.js';

export const settingsRouter = Router();
export const settingsAdminRouter = Router();

const STORE_SETTINGS_ID = 'store';

const updateStoreSettingsSchema = z.object({
  freeDeliveryEnabled: z.boolean().optional(),
  freeDeliveryThreshold: z.number().int().min(0).optional(),
  shippingBadgeTitle: z.string().min(1).max(40).optional(),
  shippingBadgeDesc: z.string().min(1).max(60).optional(),
  returnBadgeTitle: z.string().min(1).max(40).optional(),
  returnBadgeDesc: z.string().min(1).max(60).optional(),
  paymentBadgeTitle: z.string().min(1).max(40).optional(),
  paymentBadgeDesc: z.string().min(1).max(60).optional(),
  shopSubtitle1: z.string().min(1).max(80).optional(),
  shopSubtitle2: z.string().min(1).max(80).optional(),
  shopSubtitle3: z.string().min(1).max(80).optional(),
  flashSaleEnabled: z.boolean().optional(),
  flashSaleEndsAt: z.coerce.date().nullable().optional(),
  facebookUrl: z.string().max(300).nullable().optional(),
  instagramUrl: z.string().max(300).nullable().optional(),
  whatsappNumber: z.string().max(30).nullable().optional(),
  messengerUrl: z.string().max(300).nullable().optional(),
});

async function getOrCreateStoreSettings() {
  return prisma.storeSettings.upsert({
    where: { id: STORE_SETTINGS_ID },
    update: {},
    create: { id: STORE_SETTINGS_ID, flashSaleEndsAt: new Date(Date.now() + 26 * 3600 * 1000) },
  });
}

// GET /api/settings/store — public storefront read (promo pill, etc).
settingsRouter.get('/store', asyncHandler(async (_req, res) => {
  const settings = await getOrCreateStoreSettings();
  sendSuccess(res, settings);
}));

const adminGuard = [protect, authorize('ADMIN', 'MANAGER')];

// GET /api/admin/settings/store
settingsAdminRouter.get('/store', ...adminGuard, asyncHandler(async (_req, res) => {
  const settings = await getOrCreateStoreSettings();
  sendSuccess(res, settings);
}));

// PATCH /api/admin/settings/store
settingsAdminRouter.patch('/store', ...adminGuard, validateBody(updateStoreSettingsSchema), asyncHandler(async (req, res) => {
  await getOrCreateStoreSettings();
  const settings = await prisma.storeSettings.update({ where: { id: STORE_SETTINGS_ID }, data: req.body });
  broadcastContentUpdate('settings');
  sendSuccess(res, settings, 'Settings updated');
}));

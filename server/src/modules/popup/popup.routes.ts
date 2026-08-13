import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { updatePopupSchema } from './popup.schema.js';
import { broadcastContentUpdate } from '../../sockets/index.js';

export const popupRouter = Router();
export const popupAdminRouter = Router();

const POPUP_ID = 'promo-popup';

async function getOrCreatePopup() {
  return prisma.promoPopup.upsert({
    where: { id: POPUP_ID },
    update: {},
    create: { id: POPUP_ID },
  });
}

// GET /api/popup — public: only returns the popup when it's enabled and within its schedule.
popupRouter.get('/', asyncHandler(async (_req, res) => {
  const popup = await getOrCreatePopup();
  const now = new Date();
  const withinSchedule = (!popup.startAt || popup.startAt <= now) && (!popup.endAt || popup.endAt >= now);

  if (!popup.enabled || !withinSchedule) {
    sendSuccess(res, null);
    return;
  }
  sendSuccess(res, popup);
}));

const adminGuard = [protect, authorize('ADMIN', 'MANAGER')];

// GET /api/admin/popup — admin: always returns the real record, for editing/preview.
popupAdminRouter.get('/', ...adminGuard, asyncHandler(async (_req, res) => {
  const popup = await getOrCreatePopup();
  sendSuccess(res, popup);
}));

// PATCH /api/admin/popup
popupAdminRouter.patch('/', ...adminGuard, validateBody(updatePopupSchema), asyncHandler(async (req, res) => {
  await getOrCreatePopup();
  const popup = await prisma.promoPopup.update({ where: { id: POPUP_ID }, data: req.body });
  broadcastContentUpdate('popup');
  sendSuccess(res, popup, 'Popup updated');
}));

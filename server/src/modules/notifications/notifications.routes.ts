import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';
import { protect } from '../../middleware/auth.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/ApiResponse.js';

export const notificationsRouter = Router();
notificationsRouter.use(protect);

notificationsRouter.get('/', asyncHandler(async (req, res) => {
  const items = await prisma.notification.findMany({ where: { userId: req.user!.id }, orderBy: { createdAt: 'desc' } });
  sendSuccess(res, items);
}));

notificationsRouter.patch('/:id/read', asyncHandler(async (req, res) => {
  const notification = await prisma.notification.update({ where: { id: req.params.id }, data: { read: true } });
  sendSuccess(res, notification);
}));

notificationsRouter.patch('/read-all', asyncHandler(async (req, res) => {
  await prisma.notification.updateMany({ where: { userId: req.user!.id, read: false }, data: { read: true } });
  sendSuccess(res, null, 'All notifications marked as read');
}));

notificationsRouter.delete('/:id', asyncHandler(async (req, res) => {
  await prisma.notification.delete({ where: { id: req.params.id } });
  sendSuccess(res, null, 'Notification deleted');
}));

import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/ApiResponse.js';

export const analyticsRouter = Router();
analyticsRouter.use(protect, authorize('ADMIN', 'MANAGER'));

analyticsRouter.get('/summary', asyncHandler(async (_req, res) => {
  const [totalRevenue, totalOrders, totalCustomers, totalProducts] = await Promise.all([
    prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'PAID' } }),
    prisma.order.count(),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.product.count({ where: { isActive: true } }),
  ]);

  sendSuccess(res, {
    totalRevenue: totalRevenue._sum.total || 0,
    totalOrders,
    totalCustomers,
    totalProducts,
  });
}));

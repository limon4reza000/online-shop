import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess, sendPaginated } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { createOrderSchema, updateOrderStatusSchema } from './orders.schema.js';
import { notifyUser, emitToAdmins } from '../../sockets/index.js';

export const ordersRouter = Router();

// Statuses that mean "this order's items go back on the shelf." Restoring stock
// is keyed off the order's CURRENT status not being one of these already, so a
// CANCELLED -> REFUNDED transition (or any repeat PATCH) never double-restores.
const STOCK_RESTORING_STATUSES = ['CANCELLED', 'REFUNDED'];

// Customer: place an order from their cart, decrementing stock atomically.
ordersRouter.post('/', protect, validateBody(createOrderSchema), asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const input = req.body as import('zod').infer<typeof createOrderSchema>;

  const order = await prisma.$transaction(async (tx) => {
    for (const item of input.items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product || product.stock < item.quantity) {
        throw ApiError.badRequest(`Insufficient stock for ${product?.name || 'an item'}`);
      }
      await tx.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } });
    }

    return tx.order.create({
      data: {
        userId,
        subtotal: input.subtotal,
        discount: input.discount,
        shipping: input.shipping,
        tax: input.tax,
        total: input.total,
        couponCode: input.couponCode,
        shippingAddress: input.shippingAddress,
        items: { create: input.items.map((i) => ({ productId: i.productId, quantity: i.quantity, price: i.price, color: i.color, size: i.size })) },
      },
      include: { items: true },
    });
  });

  await prisma.notification.create({
    data: { userId, type: 'order', title: 'Order Placed', body: `Your order ${order.id} has been placed successfully.` },
  });
  notifyUser(userId, { type: 'order', title: 'Order Placed', body: `Order ${order.id} confirmed.` });
  emitToAdmins('analytics:update', { reason: 'order:created', orderId: order.id });

  sendSuccess(res, order, 'Order placed successfully', 201);
}));

// Customer: list their own orders.
ordersRouter.get('/my', protect, asyncHandler(async (req, res) => {
  const orders = await prisma.order.findMany({ where: { userId: req.user!.id }, include: { items: true }, orderBy: { createdAt: 'desc' } });
  sendSuccess(res, orders);
}));

ordersRouter.get('/:id', protect, asyncHandler(async (req, res) => {
  const order = await prisma.order.findUnique({ where: { id: req.params.id }, include: { items: { include: { product: true } } } });
  if (!order) throw ApiError.notFound('Order not found');
  if (order.userId !== req.user!.id && req.user!.role !== 'ADMIN') throw ApiError.forbidden();
  sendSuccess(res, order);
}));

// Admin: list all orders, paginated.
ordersRouter.get('/', protect, authorize('ADMIN', 'MANAGER', 'SUPPORT'), asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 10;
  const [items, total] = await Promise.all([
    prisma.order.findMany({ include: { items: true, user: true }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.order.count(),
  ]);
  sendPaginated(res, items, { page, pageSize, total });
}));

// Admin: update order status, notifying the customer in real time.
ordersRouter.patch('/:id/status', protect, authorize('ADMIN', 'MANAGER'), validateBody(updateOrderStatusSchema), asyncHandler(async (req, res) => {
  const newStatus = req.body.status as string;
  const existing = await prisma.order.findUnique({ where: { id: req.params.id }, include: { items: true } });
  if (!existing) throw ApiError.notFound('Order not found');

  const shouldRestoreStock = STOCK_RESTORING_STATUSES.includes(newStatus) && !STOCK_RESTORING_STATUSES.includes(existing.status);

  const order = await prisma.$transaction(async (tx) => {
    if (shouldRestoreStock) {
      for (const item of existing.items) {
        await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
      }
    }
    return tx.order.update({ where: { id: req.params.id }, data: { status: req.body.status } });
  });

  await prisma.notification.create({
    data: { userId: order.userId, type: 'order', title: 'Order Status Updated', body: `Order ${order.id} is now ${order.status.replace(/_/g, ' ').toLowerCase()}.` },
  });
  notifyUser(order.userId, { type: 'order', title: 'Order Update', body: `Order ${order.id} is now ${order.status}.` });
  emitToAdmins('analytics:update', { reason: 'order:status', orderId: order.id });

  sendSuccess(res, order, 'Order status updated');
}));

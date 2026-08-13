import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/ApiResponse.js';

export const analyticsRouter = Router();
analyticsRouter.use(protect, authorize('ADMIN', 'MANAGER'));

const DAY_MS = 24 * 60 * 60 * 1000;

function percentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

// GET /api/analytics/summary — headline stat cards, each with a % change vs the prior 30-day window.
analyticsRouter.get('/summary', asyncHandler(async (_req, res) => {
  const now = new Date();
  const periodStart = new Date(now.getTime() - 30 * DAY_MS);
  const prevPeriodStart = new Date(now.getTime() - 60 * DAY_MS);

  const [
    totalRevenue, totalOrders, totalCustomers, totalProducts,
    revenueThisPeriod, revenuePrevPeriod,
    ordersThisPeriod, ordersPrevPeriod,
    customersThisPeriod, customersPrevPeriod,
    productsThisPeriod, productsPrevPeriod,
  ] = await Promise.all([
    prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'PAID' } }),
    prisma.order.count(),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'PAID', createdAt: { gte: periodStart } } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'PAID', createdAt: { gte: prevPeriodStart, lt: periodStart } } }),
    prisma.order.count({ where: { createdAt: { gte: periodStart } } }),
    prisma.order.count({ where: { createdAt: { gte: prevPeriodStart, lt: periodStart } } }),
    prisma.user.count({ where: { role: 'CUSTOMER', createdAt: { gte: periodStart } } }),
    prisma.user.count({ where: { role: 'CUSTOMER', createdAt: { gte: prevPeriodStart, lt: periodStart } } }),
    prisma.product.count({ where: { createdAt: { gte: periodStart } } }),
    prisma.product.count({ where: { createdAt: { gte: prevPeriodStart, lt: periodStart } } }),
  ]);

  sendSuccess(res, {
    totalRevenue: totalRevenue._sum.total || 0,
    totalOrders,
    totalCustomers,
    totalProducts,
    revenueChange: percentChange(Number(revenueThisPeriod._sum.total || 0), Number(revenuePrevPeriod._sum.total || 0)),
    ordersChange: percentChange(ordersThisPeriod, ordersPrevPeriod),
    customersChange: percentChange(customersThisPeriod, customersPrevPeriod),
    productsChange: percentChange(productsThisPeriod, productsPrevPeriod),
  });
}));

// GET /api/analytics/revenue-trend?months=7 — paid revenue + order count per calendar month.
// GET /api/analytics/revenue-trend?calendarYear=true — fixed জানুয়ারি..ডিসেম্বর of the current year instead of a trailing window.
analyticsRouter.get('/revenue-trend', asyncHandler(async (req, res) => {
  const calendarYear = req.query.calendarYear === 'true';
  const months = calendarYear ? 12 : Math.min(Number(req.query.months) || 7, 12);
  const now = new Date();
  const rangeStart = calendarYear ? new Date(now.getFullYear(), 0, 1) : new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: rangeStart } },
    select: { total: true, paymentStatus: true, createdAt: true },
  });

  const buckets: { key: string; label: string; revenue: number; orders: number }[] = [];
  if (calendarYear) {
    for (let m = 0; m < 12; m++) {
      const d = new Date(now.getFullYear(), m, 1);
      buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString('bn-BD', { month: 'long' }), revenue: 0, orders: 0 });
    }
  } else {
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString('bn-BD', { month: 'long' }), revenue: 0, orders: 0 });
    }
  }
  const bucketByKey = new Map(buckets.map((b) => [b.key, b]));

  for (const order of orders) {
    const key = `${order.createdAt.getFullYear()}-${order.createdAt.getMonth()}`;
    const bucket = bucketByKey.get(key);
    if (!bucket) continue;
    bucket.orders += 1;
    if (order.paymentStatus === 'PAID') bucket.revenue += Number(order.total);
  }

  sendSuccess(res, buckets.map(({ label, revenue, orders: orderCount }) => ({ month: label, revenue, orders: orderCount })));
}));

// GET /api/analytics/category-sales — paid revenue grouped by main category, top 6 + "অন্যান্য".
analyticsRouter.get('/category-sales', asyncHandler(async (_req, res) => {
  const items = await prisma.orderItem.findMany({
    where: { order: { paymentStatus: 'PAID' } },
    select: {
      quantity: true,
      price: true,
      product: { select: { category: { select: { id: true, name: true, parentId: true, parent: { select: { id: true, name: true } } } } } },
    },
  });

  const revenueByCategory = new Map<string, number>();
  for (const item of items) {
    const cat = item.product.category;
    const main = cat.parent ?? cat;
    const revenue = Number(item.price) * item.quantity;
    revenueByCategory.set(main.name, (revenueByCategory.get(main.name) || 0) + revenue);
  }

  const sorted = [...revenueByCategory.entries()].sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, 6).map(([name, sales]) => ({ name, sales }));
  const rest = sorted.slice(6).reduce((sum, [, sales]) => sum + sales, 0);
  if (rest > 0) top.push({ name: 'অন্যান্য', sales: rest });

  sendSuccess(res, top);
}));

// GET /api/analytics/top-products?limit=6 — best-selling products by units sold, from paid orders.
analyticsRouter.get('/top-products', asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 6, 20);

  const grouped = await prisma.orderItem.groupBy({
    by: ['productId'],
    where: { order: { paymentStatus: 'PAID' } },
    _sum: { quantity: true, price: true },
  });

  const ranked = grouped
    .map((g) => ({ productId: g.productId, units: g._sum.quantity || 0, revenue: Number(g._sum.price || 0) }))
    .sort((a, b) => b.units - a.units)
    .slice(0, limit);

  const products = await prisma.product.findMany({
    where: { id: { in: ranked.map((r) => r.productId) } },
    select: { id: true, name: true, thumbnail: true, images: true, rating: true },
  });
  const productById = new Map(products.map((p) => [p.id, p]));

  sendSuccess(
    res,
    ranked
      .map((r) => {
        const p = productById.get(r.productId);
        if (!p) return null;
        return {
          id: p.id,
          name: p.name,
          image: p.thumbnail || (p.images as string[])[0] || null,
          rating: p.rating,
          units: r.units,
          revenue: r.revenue,
        };
      })
      .filter((x): x is NonNullable<typeof x> => !!x)
  );
}));

// GET /api/analytics/weekly-profit?weeks=6 — (subtotal - discount) as a profit proxy, per week, paid orders only.
analyticsRouter.get('/weekly-profit', asyncHandler(async (req, res) => {
  const weeks = Math.min(Number(req.query.weeks) || 6, 12);
  const now = new Date();
  const rangeStart = new Date(now.getTime() - weeks * 7 * DAY_MS);

  const orders = await prisma.order.findMany({
    where: { paymentStatus: 'PAID', createdAt: { gte: rangeStart } },
    select: { subtotal: true, discount: true, createdAt: true },
  });

  const buckets = Array.from({ length: weeks }, (_, i) => ({ label: `সপ্তাহ ${i + 1}`, profit: 0, start: new Date(rangeStart.getTime() + i * 7 * DAY_MS) }));

  for (const order of orders) {
    const idx = Math.min(weeks - 1, Math.floor((order.createdAt.getTime() - rangeStart.getTime()) / (7 * DAY_MS)));
    if (idx < 0) continue;
    buckets[idx].profit += Number(order.subtotal) - Number(order.discount);
  }

  sendSuccess(res, buckets.map(({ label, profit }) => ({ week: label, profit: Math.round(profit) })));
}));

// GET /api/analytics/sales-report — headline cards for the reports page (same 30-day window as /summary).
analyticsRouter.get('/sales-report', asyncHandler(async (_req, res) => {
  const now = new Date();
  const periodStart = new Date(now.getTime() - 30 * DAY_MS);
  const prevPeriodStart = new Date(now.getTime() - 60 * DAY_MS);

  const [paidOrders, prevPaidOrders] = await Promise.all([
    prisma.order.findMany({ where: { paymentStatus: 'PAID', createdAt: { gte: periodStart } }, select: { total: true, subtotal: true, discount: true } }),
    prisma.order.findMany({ where: { paymentStatus: 'PAID', createdAt: { gte: prevPeriodStart, lt: periodStart } }, select: { total: true, subtotal: true, discount: true } }),
  ]);
  const unitsSold = await prisma.orderItem.aggregate({
    _sum: { quantity: true },
    where: { order: { paymentStatus: 'PAID', createdAt: { gte: periodStart } } },
  });
  const prevUnitsSold = await prisma.orderItem.aggregate({
    _sum: { quantity: true },
    where: { order: { paymentStatus: 'PAID', createdAt: { gte: prevPeriodStart, lt: periodStart } } },
  });

  const sum = (rows: { total: unknown }[]) => rows.reduce((s, r) => s + Number(r.total), 0);
  const profit = (rows: { subtotal: unknown; discount: unknown }[]) => rows.reduce((s, r) => s + (Number(r.subtotal) - Number(r.discount)), 0);
  const revenue = sum(paidOrders);
  const prevRevenue = sum(prevPaidOrders);
  const netProfit = profit(paidOrders);
  const prevNetProfit = profit(prevPaidOrders);
  const margin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
  const prevMargin = prevRevenue > 0 ? (prevNetProfit / prevRevenue) * 100 : 0;

  sendSuccess(res, {
    totalRevenue: revenue,
    revenueChange: percentChange(revenue, prevRevenue),
    netProfit,
    netProfitChange: percentChange(netProfit, prevNetProfit),
    unitsSold: unitsSold._sum.quantity || 0,
    unitsSoldChange: percentChange(unitsSold._sum.quantity || 0, prevUnitsSold._sum.quantity || 0),
    avgMargin: Math.round(margin * 10) / 10,
    avgMarginChange: Math.round((margin - prevMargin) * 10) / 10,
  });
}));

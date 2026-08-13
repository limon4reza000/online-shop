import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { createBrandSchema, updateBrandSchema, reorderBrandsSchema, toggleBrandsSchema } from './brands.schema.js';
import * as brandsService from './brands.service.js';
import { broadcastContentUpdate } from '../../sockets/index.js';

export const brandsRouter = Router();
export const brandsAdminRouter = Router();

// GET /api/brands — active brands, ordered, for the storefront marquee/filters.
// ?featured=true restricts to admin-flagged featured brands (homepage "Special Brands").
brandsRouter.get('/', asyncHandler(async (req, res) => {
  const featuredOnly = req.query.featured === 'true';
  const brands = await brandsService.listActiveBrands(featuredOnly);
  sendSuccess(res, brands);
}));

// GET /api/brands/:slug — a single brand, for the brand detail page.
brandsRouter.get('/:slug', asyncHandler(async (req, res) => {
  const brand = await brandsService.getBrandBySlug(req.params.slug);
  sendSuccess(res, brand);
}));

const adminGuard = [protect, authorize('ADMIN', 'MANAGER')];
const destructiveGuard = [protect, authorize('ADMIN')];

// GET /api/admin/brands — flat list incl. hidden, for the admin table.
brandsAdminRouter.get('/', ...adminGuard, asyncHandler(async (_req, res) => {
  const brands = await prisma.brand.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { products: true } } },
  });
  sendSuccess(res, brands);
}));

brandsAdminRouter.post('/', ...adminGuard, validateBody(createBrandSchema), asyncHandler(async (req, res) => {
  const brand = await brandsService.createBrand(req.body);
  broadcastContentUpdate('brands');
  sendSuccess(res, brand, 'Brand created', 201);
}));

// PATCH /api/admin/brands/reorder — must be registered before /:id routes.
brandsAdminRouter.patch('/reorder', ...adminGuard, validateBody(reorderBrandsSchema), asyncHandler(async (req, res) => {
  const { orderedIds } = req.body as { orderedIds: string[] };
  await prisma.$transaction(
    orderedIds.map((id, index) => prisma.brand.update({ where: { id }, data: { sortOrder: index } }))
  );
  broadcastContentUpdate('brands');
  sendSuccess(res, null, 'Order updated');
}));

brandsAdminRouter.patch('/toggle', ...adminGuard, validateBody(toggleBrandsSchema), asyncHandler(async (req, res) => {
  const { ids, isActive } = req.body as { ids: string[]; isActive: boolean };
  await prisma.brand.updateMany({ where: { id: { in: ids } }, data: { isActive } });
  broadcastContentUpdate('brands');
  sendSuccess(res, null, 'Status updated');
}));

brandsAdminRouter.patch('/:id', ...adminGuard, validateBody(updateBrandSchema), asyncHandler(async (req, res) => {
  const brand = await brandsService.updateBrand(req.params.id, req.body);
  broadcastContentUpdate('brands');
  sendSuccess(res, brand, 'Brand updated');
}));

brandsAdminRouter.delete('/:id', ...destructiveGuard, asyncHandler(async (req, res) => {
  await brandsService.deleteBrand(req.params.id);
  broadcastContentUpdate('brands');
  sendSuccess(res, null, 'Brand deleted');
}));

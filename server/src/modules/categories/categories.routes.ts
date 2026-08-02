import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import {
  createCategorySchema,
  updateCategorySchema,
  reorderCategoriesSchema,
  toggleCategoriesSchema,
} from './categories.schema.js';
import * as categoriesService from './categories.service.js';

export const categoriesRouter = Router();
export const categoriesAdminRouter = Router();

// GET /api/categories — main categories with their subcategories (storefront nav).
categoriesRouter.get('/', asyncHandler(async (_req, res) => {
  const tree = await categoriesService.getCategoryTree();
  sendSuccess(res, tree);
}));

// GET /api/categories/:slug — a main or sub category with its children.
categoriesRouter.get('/:slug', asyncHandler(async (req, res) => {
  const category = await categoriesService.getCategoryBySlug(req.params.slug);
  sendSuccess(res, category);
}));

const adminGuard = [protect, authorize('ADMIN', 'MANAGER')];
const destructiveGuard = [protect, authorize('ADMIN')];

// GET /api/admin/categories — flat list (all, incl. hidden) for the admin table.
categoriesAdminRouter.get('/', ...adminGuard, asyncHandler(async (_req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: [{ parentId: 'asc' }, { sortOrder: 'asc' }],
    include: { parent: { select: { id: true, name: true } }, _count: { select: { children: true, products: true } } },
  });
  sendSuccess(res, categories);
}));

// GET /api/admin/categories/tree — full tree incl. hidden, for admin nav trees.
categoriesAdminRouter.get('/tree', ...adminGuard, asyncHandler(async (_req, res) => {
  const tree = await categoriesService.getCategoryTree(true);
  sendSuccess(res, tree);
}));

categoriesAdminRouter.post('/', ...adminGuard, validateBody(createCategorySchema), asyncHandler(async (req, res) => {
  const category = await categoriesService.createCategory(req.body);
  sendSuccess(res, category, 'Category created', 201);
}));

// PATCH /api/admin/categories/reorder — must be registered before /:id routes.
categoriesAdminRouter.patch('/reorder', ...adminGuard, validateBody(reorderCategoriesSchema), asyncHandler(async (req, res) => {
  const { orderedIds } = req.body as { orderedIds: string[] };
  await prisma.$transaction(
    orderedIds.map((id, index) => prisma.category.update({ where: { id }, data: { sortOrder: index } }))
  );
  sendSuccess(res, null, 'Order updated');
}));

categoriesAdminRouter.patch('/toggle', ...adminGuard, validateBody(toggleCategoriesSchema), asyncHandler(async (req, res) => {
  const { ids, isActive } = req.body as { ids: string[]; isActive: boolean };
  await prisma.category.updateMany({ where: { id: { in: ids } }, data: { isActive } });
  sendSuccess(res, null, 'Status updated');
}));

categoriesAdminRouter.patch('/:id', ...adminGuard, validateBody(updateCategorySchema), asyncHandler(async (req, res) => {
  const category = await categoriesService.updateCategory(req.params.id, req.body);
  sendSuccess(res, category, 'Category updated');
}));

categoriesAdminRouter.delete('/:id', ...destructiveGuard, asyncHandler(async (req, res) => {
  await categoriesService.deleteCategory(req.params.id);
  sendSuccess(res, null, 'Category deleted');
}));

import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendPaginated, sendSuccess } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';

export const searchPlaceholdersRouter = Router();
export const searchPlaceholdersAdminRouter = Router();

const createSchema = z.object({
  text: z.string().min(1).max(60),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().optional(),
});

const updateSchema = createSchema.partial();

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
});

const reorderSchema = z.object({
  orderedIds: z.array(z.string()).min(1),
});

const toggleSchema = z.object({
  ids: z.array(z.string()).min(1),
  isActive: z.boolean(),
});

const bulkDeleteSchema = z.object({
  ids: z.array(z.string()).min(1),
});

// GET /api/search-placeholders — active placeholders for the storefront widget.
searchPlaceholdersRouter.get('/', asyncHandler(async (_req, res) => {
  const placeholders = await prisma.searchPlaceholder.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: { id: true, text: true },
  });
  sendSuccess(res, placeholders);
}));

const adminGuard = [protect, authorize('ADMIN', 'MANAGER')];
const destructiveGuard = [protect, authorize('ADMIN')];

// GET /api/admin/search-placeholders?page=&pageSize=&search=
searchPlaceholdersAdminRouter.get('/', ...adminGuard, asyncHandler(async (req, res) => {
  const query = listQuerySchema.parse(req.query);
  const where = query.search ? { text: { contains: query.search } } : undefined;

  const [items, total] = await Promise.all([
    prisma.searchPlaceholder.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.searchPlaceholder.count({ where }),
  ]);

  sendPaginated(res, items, { page: query.page, pageSize: query.pageSize, total });
}));

// POST /api/admin/search-placeholders
searchPlaceholdersAdminRouter.post('/', ...adminGuard, validateBody(createSchema), asyncHandler(async (req, res) => {
  let { sortOrder } = req.body as z.infer<typeof createSchema>;
  if (sortOrder === undefined) {
    const last = await prisma.searchPlaceholder.findFirst({ orderBy: { sortOrder: 'desc' } });
    sortOrder = (last?.sortOrder ?? -1) + 1;
  }
  const placeholder = await prisma.searchPlaceholder.create({ data: { ...req.body, sortOrder } });
  sendSuccess(res, placeholder, 'Placeholder created', 201);
}));

// PATCH /api/admin/search-placeholders/reorder — must be registered before /:id routes.
searchPlaceholdersAdminRouter.patch('/reorder', ...adminGuard, validateBody(reorderSchema), asyncHandler(async (req, res) => {
  const { orderedIds } = req.body as z.infer<typeof reorderSchema>;
  await prisma.$transaction(
    orderedIds.map((id, index) => prisma.searchPlaceholder.update({ where: { id }, data: { sortOrder: index } }))
  );
  sendSuccess(res, null, 'Order updated');
}));

// PATCH /api/admin/search-placeholders/toggle — bulk (or single, via a 1-item array) enable/disable.
searchPlaceholdersAdminRouter.patch('/toggle', ...adminGuard, validateBody(toggleSchema), asyncHandler(async (req, res) => {
  const { ids, isActive } = req.body as z.infer<typeof toggleSchema>;
  await prisma.searchPlaceholder.updateMany({ where: { id: { in: ids } }, data: { isActive } });
  sendSuccess(res, null, 'Status updated');
}));

// DELETE /api/admin/search-placeholders/bulk
searchPlaceholdersAdminRouter.delete('/bulk', ...destructiveGuard, validateBody(bulkDeleteSchema), asyncHandler(async (req, res) => {
  const { ids } = req.body as z.infer<typeof bulkDeleteSchema>;
  await prisma.searchPlaceholder.deleteMany({ where: { id: { in: ids } } });
  sendSuccess(res, null, 'Placeholders deleted');
}));

// PUT /api/admin/search-placeholders/:id
searchPlaceholdersAdminRouter.put('/:id', ...adminGuard, validateBody(updateSchema), asyncHandler(async (req, res) => {
  const existing = await prisma.searchPlaceholder.findUnique({ where: { id: req.params.id } });
  if (!existing) throw ApiError.notFound('Placeholder not found');

  const placeholder = await prisma.searchPlaceholder.update({ where: { id: req.params.id }, data: req.body });
  sendSuccess(res, placeholder, 'Placeholder updated');
}));

// DELETE /api/admin/search-placeholders/:id
searchPlaceholdersAdminRouter.delete('/:id', ...destructiveGuard, asyncHandler(async (req, res) => {
  const existing = await prisma.searchPlaceholder.findUnique({ where: { id: req.params.id } });
  if (!existing) throw ApiError.notFound('Placeholder not found');

  await prisma.searchPlaceholder.delete({ where: { id: req.params.id } });
  sendSuccess(res, null, 'Placeholder deleted');
}));

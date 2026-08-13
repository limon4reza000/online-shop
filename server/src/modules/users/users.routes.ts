import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess, sendPaginated } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { hashPassword } from '../../utils/hash.js';

export const usersRouter = Router();
usersRouter.use(protect, authorize('ADMIN'));

const createStaffSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['ADMIN', 'MANAGER', 'SUPPORT']),
});

// Admin-only: create a staff account directly with a chosen role and password —
// the public /auth/register endpoint always assigns CUSTOMER, so this is the only
// way an ADMIN/MANAGER/SUPPORT account ever comes into existence after the first seed.
usersRouter.post('/staff', validateBody(createStaffSchema), asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body as z.infer<typeof createStaffSchema>;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const user = await prisma.user.create({
    data: { name, email, password: await hashPassword(password), role, emailVerified: true },
    select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
  });
  sendSuccess(res, user, 'Staff account created', 201);
}));

usersRouter.get('/', asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 10;
  const role = req.query.role as string | undefined;

  const where = role ? { role: role.toUpperCase() as 'CUSTOMER' | 'ADMIN' | 'MANAGER' | 'SUPPORT' } : undefined;
  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true, _count: { select: { orders: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  sendPaginated(res, items, { page, pageSize, total });
}));

usersRouter.patch('/:id/role', asyncHandler(async (req, res) => {
  const role = String(req.body.role || '').toUpperCase();
  if (!['CUSTOMER', 'ADMIN', 'MANAGER', 'SUPPORT'].includes(role)) throw ApiError.badRequest('Invalid role');
  const user = await prisma.user.update({ where: { id: req.params.id }, data: { role: role as 'CUSTOMER' | 'ADMIN' | 'MANAGER' | 'SUPPORT' } });
  sendSuccess(res, user, 'Role updated');
}));

usersRouter.patch('/:id/status', asyncHandler(async (req, res) => {
  const status = req.body.status === 'blocked' ? 'blocked' : 'active';
  const user = await prisma.user.update({ where: { id: req.params.id }, data: { status } });
  sendSuccess(res, user, `Customer ${status}`);
}));

usersRouter.delete('/:id', asyncHandler(async (req, res) => {
  await prisma.user.delete({ where: { id: req.params.id } });
  sendSuccess(res, null, 'User deleted');
}));

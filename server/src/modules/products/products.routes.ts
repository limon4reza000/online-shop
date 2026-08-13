import { Router } from 'express';
import { z } from 'zod';
import { protect, authorize } from '../../middleware/auth.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { createProductSchema, updateProductSchema } from './products.schema.js';
import * as controller from './products.controller.js';

export const productsRouter = Router();
export const productsAdminRouter = Router();

const toggleSchema = z.object({ ids: z.array(z.string()).min(1), isActive: z.boolean() });

const adminGuard = [protect, authorize('ADMIN', 'MANAGER')];
const destructiveGuard = [protect, authorize('ADMIN')];

// Public — storefront.
productsRouter.get('/', controller.list);
productsRouter.get('/:slug', controller.getBySlug);
productsRouter.get('/:slug/related', controller.related);

// Admin — sees inactive/hidden products too, plus write access.
productsAdminRouter.get('/', ...adminGuard, controller.adminList);
productsAdminRouter.post('/', ...adminGuard, validateBody(createProductSchema), controller.create);
productsAdminRouter.patch('/toggle', ...adminGuard, validateBody(toggleSchema), controller.toggle);
productsAdminRouter.post('/:id/duplicate', ...adminGuard, controller.duplicate);
productsAdminRouter.patch('/:id', ...adminGuard, validateBody(updateProductSchema), controller.update);
productsAdminRouter.delete('/:id', ...destructiveGuard, controller.remove);

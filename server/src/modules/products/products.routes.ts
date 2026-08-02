import { Router } from 'express';
import { z } from 'zod';
import { protect, authorize } from '../../middleware/auth.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { createProductSchema, updateProductSchema } from './products.schema.js';
import * as controller from './products.controller.js';

export const productsRouter = Router();

const toggleSchema = z.object({ ids: z.array(z.string()).min(1), isActive: z.boolean() });

const adminGuard = [protect, authorize('ADMIN', 'MANAGER')];
const destructiveGuard = [protect, authorize('ADMIN')];

productsRouter.get('/', controller.list);
productsRouter.get('/:slug', controller.getBySlug);
productsRouter.get('/:slug/related', controller.related);

productsRouter.post('/', ...adminGuard, validateBody(createProductSchema), controller.create);
productsRouter.patch('/toggle', ...adminGuard, validateBody(toggleSchema), controller.toggle);
productsRouter.post('/:id/duplicate', ...adminGuard, controller.duplicate);
productsRouter.patch('/:id', ...adminGuard, validateBody(updateProductSchema), controller.update);
productsRouter.delete('/:id', ...destructiveGuard, controller.remove);

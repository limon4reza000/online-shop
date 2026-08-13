import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendPaginated, sendSuccess } from '../../utils/ApiResponse.js';
import * as service from './products.service.js';
import { listProductsQuerySchema } from './products.schema.js';
import { broadcastContentUpdate } from '../../sockets/index.js';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const query = listProductsQuerySchema.parse(req.query);
  const { items, total } = await service.listProducts(query);
  sendPaginated(res, items, { page: query.page, pageSize: query.pageSize, total });
});

export const adminList = asyncHandler(async (req: Request, res: Response) => {
  const query = listProductsQuerySchema.parse(req.query);
  const { items, total } = await service.listProducts(query, { isAdmin: true });
  sendPaginated(res, items, { page: query.page, pageSize: query.pageSize, total });
});

export const getBySlug = asyncHandler(async (req: Request, res: Response) => {
  const product = await service.getProductBySlug(req.params.slug);
  sendSuccess(res, product);
});

export const related = asyncHandler(async (req: Request, res: Response) => {
  const product = await service.getProductBySlug(req.params.slug);
  const items = await service.getRelatedProducts(product.id, product.categoryId);
  sendSuccess(res, items);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const product = await service.createProduct(req.body);
  broadcastContentUpdate('products');
  sendSuccess(res, product, 'Product created', 201);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const product = await service.updateProduct(req.params.id, req.body);
  broadcastContentUpdate('products');
  sendSuccess(res, product, 'Product updated');
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await service.deleteProduct(req.params.id);
  broadcastContentUpdate('products');
  sendSuccess(res, null, 'Product deleted');
});

export const duplicate = asyncHandler(async (req: Request, res: Response) => {
  const product = await service.duplicateProduct(req.params.id);
  broadcastContentUpdate('products');
  sendSuccess(res, product, 'Product duplicated', 201);
});

export const toggle = asyncHandler(async (req: Request, res: Response) => {
  const { ids, isActive } = req.body as { ids: string[]; isActive: boolean };
  await service.toggleProducts(ids, isActive);
  broadcastContentUpdate('products');
  sendSuccess(res, null, 'Status updated');
});

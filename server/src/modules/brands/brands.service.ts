import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import type { z } from 'zod';
import type { createBrandSchema, updateBrandSchema } from './brands.schema.js';

type CreateInput = z.infer<typeof createBrandSchema>;
type UpdateInput = z.infer<typeof updateBrandSchema>;

/** Public storefront — active brands, in admin-defined order. Homepage "Special Brands"
 * passes `featuredOnly` so only brands the admin flagged as featured show there; other
 * consumers (e.g. the shop filter) get the full active list. */
export async function listActiveBrands(featuredOnly = false) {
  return prisma.brand.findMany({
    where: { isActive: true, ...(featuredOnly ? { featured: true } : {}) },
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { products: true } } },
  });
}

export async function getBrandBySlug(slug: string) {
  const brand = await prisma.brand.findUnique({
    where: { slug },
    include: { _count: { select: { products: true } } },
  });
  if (!brand || !brand.isActive) throw ApiError.notFound('Brand not found');
  return brand;
}

export async function createBrand(input: CreateInput) {
  let sortOrder = input.sortOrder;
  if (sortOrder === undefined) {
    const last = await prisma.brand.findFirst({ orderBy: { sortOrder: 'desc' } });
    sortOrder = (last?.sortOrder ?? -1) + 1;
  }
  return prisma.brand.create({ data: { ...input, sortOrder } });
}

export async function updateBrand(id: string, input: UpdateInput) {
  const existing = await prisma.brand.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound('Brand not found');
  return prisma.brand.update({ where: { id }, data: input });
}

export async function deleteBrand(id: string) {
  const existing = await prisma.brand.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });
  if (!existing) throw ApiError.notFound('Brand not found');
  if (existing._count.products > 0) throw ApiError.badRequest('Reassign or remove its products first');

  await prisma.brand.delete({ where: { id } });
}

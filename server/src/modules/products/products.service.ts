import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import type { z } from 'zod';
import type { createProductSchema, listProductsQuerySchema, updateProductSchema } from './products.schema.js';

type CreateInput = z.infer<typeof createProductSchema>;
type UpdateInput = z.infer<typeof updateProductSchema>;
type ListQuery = z.infer<typeof listProductsQuerySchema>;

const sortMap: Record<ListQuery['sort'], Prisma.ProductOrderByWithRelationInput> = {
  featured: { createdAt: 'desc' },
  newest: { createdAt: 'desc' },
  'price-low': { price: 'asc' },
  'price-high': { price: 'desc' },
  popular: { reviewCount: 'desc' },
  rating: { rating: 'desc' },
};

function discountPercent(price: number, oldPrice?: number | null) {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

export async function listProducts(query: ListQuery) {
  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(query.q && {
      OR: [
        { name: { contains: query.q } },
        { sku: { contains: query.q } },
        { tags: { array_contains: query.q } },
        { brand: { name: { contains: query.q } } },
        { category: { name: { contains: query.q } } },
      ],
    }),
    // category = main category slug (matches the sub category's parent), subCategory = leaf slug
    ...(query.subCategory
      ? { category: { slug: query.subCategory } }
      : query.category && { category: { OR: [{ slug: query.category }, { parent: { slug: query.category } }] } }),
    ...(query.brand && { brand: { name: query.brand } }),
    ...(query.color && { colors: { array_contains: query.color } }),
    ...(query.size && { sizes: { array_contains: query.size } }),
    ...(query.minRating && { rating: { gte: query.minRating } }),
    ...(query.inStock && { stock: { gt: 0 } }),
    ...(query.featured && { isFeatured: true }),
    ...(query.bestSeller && { isBestSeller: true }),
    ...(query.newArrival && { isNewArrival: true }),
    ...((query.minPrice || query.maxPrice) && {
      price: { ...(query.minPrice && { gte: query.minPrice }), ...(query.maxPrice && { lte: query.maxPrice }) },
    }),
  };

  // Discount % isn't a stored column, so filter it in application code after fetching candidates.
  if (query.minDiscount) {
    const candidates = await prisma.product.findMany({ where, orderBy: sortMap[query.sort], include: { category: true, brand: true } });
    const filtered = candidates.filter((p) => discountPercent(Number(p.price), p.oldPrice ? Number(p.oldPrice) : null) >= query.minDiscount!);
    const total = filtered.length;
    const items = filtered.slice((query.page - 1) * query.pageSize, query.page * query.pageSize);
    return { items, total };
  }

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: sortMap[query.sort],
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      include: { category: true, brand: true },
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total };
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: { include: { parent: true } },
      brand: true,
      reviews: { where: { status: 'APPROVED' }, include: { user: true } },
    },
  });
  if (!product) throw ApiError.notFound('Product not found');
  return product;
}

export async function createProduct(input: CreateInput) {
  return prisma.product.create({ data: input });
}

export async function updateProduct(id: string, input: UpdateInput) {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound('Product not found');
  return prisma.product.update({ where: { id }, data: input });
}

export async function duplicateProduct(id: string) {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound('Product not found');

  const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, slug, sku, rating: _rating, reviewCount: _reviewCount, ...rest } = existing;
  return prisma.product.create({
    data: {
      ...rest,
      images: existing.images as Prisma.InputJsonValue,
      colors: existing.colors as Prisma.InputJsonValue | undefined,
      sizes: existing.sizes as Prisma.InputJsonValue | undefined,
      tags: existing.tags as Prisma.InputJsonValue | undefined,
      name: `${existing.name} (কপি)`,
      slug: `${slug}-copy-${Date.now()}`,
      sku: sku ? `${sku}-COPY` : null,
    },
  });
}

export async function toggleProducts(ids: string[], isActive: boolean) {
  await prisma.product.updateMany({ where: { id: { in: ids } }, data: { isActive } });
}

export async function deleteProduct(id: string) {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound('Product not found');
  await prisma.product.delete({ where: { id } });
}

export async function getRelatedProducts(productId: string, categoryId: string, limit = 4) {
  return prisma.product.findMany({
    where: { categoryId, id: { not: productId }, isActive: true },
    take: limit,
  });
}

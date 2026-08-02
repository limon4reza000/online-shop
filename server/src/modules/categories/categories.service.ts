import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import type { z } from 'zod';
import type { createCategorySchema, updateCategorySchema } from './categories.schema.js';

type CreateInput = z.infer<typeof createCategorySchema>;
type UpdateInput = z.infer<typeof updateCategorySchema>;

/** Full 3-level tree: main categories -> subcategories, for storefront navigation. */
export async function getCategoryTree(includeInactive = false) {
  return prisma.category.findMany({
    where: { parentId: null, ...(includeInactive ? {} : { isActive: true }) },
    orderBy: { sortOrder: 'asc' },
    include: {
      children: {
        where: includeInactive ? undefined : { isActive: true },
        orderBy: { sortOrder: 'asc' },
        include: { _count: { select: { products: true } } },
      },
      _count: { select: { products: true } },
    },
  });
}

export async function getCategoryBySlug(slug: string) {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      parent: true,
      children: { where: { isActive: true }, orderBy: { sortOrder: 'asc' }, include: { _count: { select: { products: true } } } },
      _count: { select: { products: true } },
    },
  });
  if (!category) throw ApiError.notFound('Category not found');
  return category;
}

export async function createCategory(input: CreateInput) {
  if (input.parentId) {
    const parent = await prisma.category.findUnique({ where: { id: input.parentId } });
    if (!parent) throw ApiError.badRequest('Parent category not found');
    if (parent.parentId) throw ApiError.badRequest('Only 2 levels of categories are supported (main > sub)');
  }

  let sortOrder = input.sortOrder;
  if (sortOrder === undefined) {
    const last = await prisma.category.findFirst({ where: { parentId: input.parentId ?? null }, orderBy: { sortOrder: 'desc' } });
    sortOrder = (last?.sortOrder ?? -1) + 1;
  }

  return prisma.category.create({ data: { ...input, sortOrder } });
}

export async function updateCategory(id: string, input: UpdateInput) {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound('Category not found');

  if (input.parentId) {
    if (input.parentId === id) throw ApiError.badRequest('A category cannot be its own parent');
    const parent = await prisma.category.findUnique({ where: { id: input.parentId } });
    if (!parent) throw ApiError.badRequest('Parent category not found');
    if (parent.parentId) throw ApiError.badRequest('Only 2 levels of categories are supported (main > sub)');
  }

  return prisma.category.update({ where: { id }, data: input });
}

export async function deleteCategory(id: string) {
  const existing = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { children: true, products: true } } },
  });
  if (!existing) throw ApiError.notFound('Category not found');
  if (existing._count.children > 0) throw ApiError.badRequest('Delete or move its subcategories first');
  if (existing._count.products > 0) throw ApiError.badRequest('Reassign or remove its products first');

  await prisma.category.delete({ where: { id } });
}

import { z } from 'zod';

export const createBrandSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().max(2000).optional(),
  logoUrl: z.string().optional(),
  banner: z.string().optional(),
  featured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().optional(),
});

export const updateBrandSchema = createBrandSchema.partial();

export const reorderBrandsSchema = z.object({
  orderedIds: z.array(z.string()).min(1),
});

export const toggleBrandsSchema = z.object({
  ids: z.array(z.string()).min(1),
  isActive: z.boolean(),
});

import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  parentId: z.string().nullable().optional(),
  icon: z.string().optional(),
  image: z.string().optional(),
  banner: z.string().optional(),
  bannerImages: z.array(z.string()).max(3, 'সর্বোচ্চ ৩টি ছবি দেওয়া যাবে').optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const reorderCategoriesSchema = z.object({
  orderedIds: z.array(z.string()).min(1),
});

export const toggleCategoriesSchema = z.object({
  ids: z.array(z.string()).min(1),
  isActive: z.boolean(),
});

import { z } from 'zod';

export const trackViewSchema = z.object({
  productId: z.string().min(1),
});

export const mergeRecentlyViewedSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        viewedAt: z.coerce.date(),
      })
    )
    .max(50),
});

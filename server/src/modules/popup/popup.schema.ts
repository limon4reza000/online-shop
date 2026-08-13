import { z } from 'zod';

export const updatePopupSchema = z.object({
  enabled: z.boolean().optional(),
  title: z.string().min(1).max(80).optional(),
  message: z.string().min(1).max(300).optional(),
  imageUrl: z.string().nullable().optional(),
  buttonText: z.string().nullable().optional(),
  buttonLink: z.string().nullable().optional(),
  delaySeconds: z.number().int().min(0).max(120).optional(),
  startAt: z.coerce.date().nullable().optional(),
  endAt: z.coerce.date().nullable().optional(),
});

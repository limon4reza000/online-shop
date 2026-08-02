import { z } from 'zod';

export const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
    price: z.number().positive(),
    color: z.string().optional(),
    size: z.string().optional(),
  })).min(1),
  subtotal: z.number().nonnegative(),
  discount: z.number().nonnegative().default(0),
  shipping: z.number().nonnegative().default(0),
  tax: z.number().nonnegative().default(0),
  total: z.number().nonnegative(),
  couponCode: z.string().optional(),
  shippingAddress: z.object({
    fullName: z.string(),
    line1: z.string(),
    city: z.string(),
    zip: z.string(),
    country: z.string(),
    phone: z.string(),
  }),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'REFUNDED']),
});

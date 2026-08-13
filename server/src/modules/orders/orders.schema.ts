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
    fullName: z.string().trim().min(1, 'পূর্ণ নাম আবশ্যক'),
    phone: z.string().trim().regex(/^01[3-9]\d{8}$/, 'সঠিক বাংলাদেশি মোবাইল নম্বর দিন'),
    address: z.string().trim().min(1, 'ঠিকানা আবশ্যক'),
    village: z.string().trim().min(1, 'গ্রাম/এলাকা আবশ্যক'),
    postOffice: z.string().trim().min(1, 'পোস্ট অফিস আবশ্যক'),
    upazila: z.string().trim().min(1, 'উপজেলা আবশ্যক'),
    district: z.string().trim().min(1, 'জেলা আবশ্যক'),
    division: z.string().trim().min(1, 'বিভাগ আবশ্যক'),
    note: z.string().optional(),
  }),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'REFUNDED']),
});

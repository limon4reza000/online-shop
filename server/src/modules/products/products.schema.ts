import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(2),
  subtitle: z.string().optional(),
  slug: z.string().min(2),
  shortDescription: z.string().optional(),
  description: z.string().min(10),
  richContent: z.string().optional(),
  price: z.number().positive(),
  oldPrice: z.number().positive().optional(),
  deliveryCharge: z.number().min(0).default(0),
  vat: z.number().min(0).default(0),
  stock: z.number().int().min(0),
  sku: z.string().optional(),
  productCode: z.string().optional(),
  weight: z.number().min(0).optional(),
  material: z.string().optional(),
  warranty: z.string().optional(),
  returnPolicy: z.string().optional(),
  thumbnail: z.string().optional(),
  images: z.array(z.string().url()).min(1),
  video: z.string().url().optional(),
  colors: z.array(z.object({ name: z.string(), hex: z.string() })).optional(),
  sizes: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  categoryId: z.string(),
  brandId: z.string(),
});

export const updateProductSchema = createProductSchema.partial();

export const listProductsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(12),
  q: z.string().optional(),
  category: z.string().optional(), // main category slug
  subCategory: z.string().optional(), // sub category slug
  brand: z.string().optional(),
  color: z.string().optional(),
  size: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  minDiscount: z.coerce.number().optional(), // percent, e.g. 10 = at least 10% off
  minRating: z.coerce.number().optional(),
  inStock: z.coerce.boolean().optional(),
  featured: z.coerce.boolean().optional(),
  bestSeller: z.coerce.boolean().optional(),
  newArrival: z.coerce.boolean().optional(),
  sort: z.enum(['featured', 'newest', 'price-low', 'price-high', 'popular', 'rating']).default('featured'),
});

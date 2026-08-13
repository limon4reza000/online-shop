// Raw shapes exactly as the Express/Prisma API returns them (Decimal fields
// serialize to strings; relations are nested objects, not flat slugs/names).

export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  image: string | null;
  banner: string | null;
  bannerImages: string[] | null;
  isActive: boolean;
  sortOrder: number;
  parentId: string | null;
  parent?: { id: string; name: string; slug: string } | null;
  children?: ApiCategory[];
  _count?: { products: number; children?: number };
  createdAt: string;
  updatedAt: string;
}

export interface ApiProduct {
  id: string;
  name: string;
  subtitle: string | null;
  slug: string;
  shortDescription: string | null;
  description: string;
  richContent: string | null;
  price: string;
  oldPrice: string | null;
  deliveryCharge: string;
  vat: string;
  stock: number;
  sku: string | null;
  productCode: string | null;
  weight: number | null;
  material: string | null;
  warranty: string | null;
  returnPolicy: string | null;
  thumbnail: string | null;
  images: string[];
  video: string | null;
  colors: { name: string; hex: string }[] | null;
  sizes: string[] | null;
  tags: string[] | null;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  metaKeywords: string | null;
  categoryId: string;
  category: ApiCategory;
  brandId: string;
  brand: { id: string; name: string; logoUrl: string | null };
  reviews?: ApiReview[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiReview {
  id: string;
  rating: number;
  title: string;
  body: string;
  verified: boolean;
  createdAt: string;
  productId: string;
  user: { id: string; name: string; avatarUrl: string | null };
}

export interface ApiBrand {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  banner: string | null;
  featured: boolean;
  isActive: boolean;
  sortOrder: number;
  _count?: { products: number };
  createdAt: string;
  updatedAt: string;
}

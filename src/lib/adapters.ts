import type { ApiBrand, ApiCategory, ApiProduct, ApiReview } from './apiTypes';
import type { Brand, Category, Product, Review } from './types';

export function mapApiProduct(p: ApiProduct): Product {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    subtitle: p.subtitle ?? undefined,
    brand: p.brand.name,
    brandId: p.brandId,
    category: p.category.slug,
    categoryId: p.categoryId,
    price: Number(p.price),
    oldPrice: p.oldPrice ? Number(p.oldPrice) : undefined,
    deliveryCharge: Number(p.deliveryCharge),
    vat: Number(p.vat),
    rating: p.rating,
    reviewCount: p.reviewCount,
    images: p.images,
    thumbnail: p.thumbnail ?? undefined,
    video: p.video ?? undefined,
    colors: p.colors ?? undefined,
    sizes: p.sizes ?? undefined,
    description: p.description,
    shortDescription: p.shortDescription ?? undefined,
    richContent: p.richContent ?? undefined,
    sku: p.sku ?? undefined,
    productCode: p.productCode ?? undefined,
    weight: p.weight ?? undefined,
    material: p.material ?? undefined,
    warranty: p.warranty ?? undefined,
    returnPolicy: p.returnPolicy ?? undefined,
    stock: p.stock,
    tags: p.tags ?? [],
    isActive: p.isActive,
    isFeatured: p.isFeatured,
    isBestSeller: p.isBestSeller,
    isNewArrival: p.isNewArrival,
    seoTitle: p.seoTitle ?? undefined,
    seoDescription: p.seoDescription ?? undefined,
    metaKeywords: p.metaKeywords ?? undefined,
    createdAt: p.createdAt,
  };
}

export function mapApiReview(r: ApiReview): Review {
  return {
    id: r.id,
    productId: r.productId,
    author: r.user.name,
    avatar: r.user.avatarUrl ?? '',
    rating: r.rating,
    date: r.createdAt,
    title: r.title,
    body: r.body,
    verified: r.verified,
  };
}

export function mapApiCategory(c: ApiCategory): Category {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    image: c.image ?? undefined,
    icon: c.icon ?? undefined,
    banner: c.banner ?? undefined,
    bannerImages: c.bannerImages ?? undefined,
    isActive: c.isActive,
    parentSlug: c.parent ? c.parent.slug : null,
    count: c._count?.products ?? 0,
  };
}

export function mapApiBrand(b: ApiBrand): Brand {
  return {
    id: b.id,
    name: b.name,
    slug: b.slug,
    description: b.description ?? undefined,
    logoUrl: b.logoUrl ?? undefined,
    banner: b.banner ?? undefined,
    featured: b.featured,
    isActive: b.isActive,
    sortOrder: b.sortOrder,
    productCount: b._count?.products ?? 0,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
  };
}

/** Flattens a main-category tree (each with `.children`) into a flat list, setting parentSlug correctly. */
export function flattenCategoryTree(tree: ApiCategory[]): Category[] {
  const flat: Category[] = [];
  for (const main of tree) {
    const mainCount = (main.children ?? []).reduce((sum, c) => sum + (c._count?.products ?? 0), 0);
    flat.push({ ...mapApiCategory(main), parentSlug: null, count: mainCount });
    for (const sub of main.children ?? []) {
      flat.push({ ...mapApiCategory(sub), parentSlug: main.slug });
    }
  }
  return flat;
}

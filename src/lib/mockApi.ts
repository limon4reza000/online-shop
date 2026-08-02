import { products, categories, reviews } from './data';
import type { Product } from './types';

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchProducts(): Promise<Product[]> {
  await delay();
  return products;
}

export async function fetchProductBySlug(slug: string): Promise<Product | undefined> {
  await delay(250);
  return products.find((p) => p.slug === slug);
}

export async function fetchCategories() {
  await delay(200);
  return categories;
}

export async function fetchReviews(productId: string) {
  await delay(250);
  return reviews.filter((r) => r.productId === productId);
}

export async function searchProducts(query: string): Promise<Product[]> {
  await delay(300);
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return products.filter(
    (p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
  );
}

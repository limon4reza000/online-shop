import { useQuery } from '@tanstack/react-query';
import { fetchProducts, fetchProductBySlug, fetchCategories, searchProducts } from '@/lib/mockApi';

export function useProducts() {
  return useQuery({ queryKey: ['products'], queryFn: fetchProducts, staleTime: 60_000 });
}

export function useProduct(slug: string | undefined) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => fetchProductBySlug(slug as string),
    enabled: !!slug,
  });
}

export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: fetchCategories, staleTime: 5 * 60_000 });
}

export function useSearchProducts(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => searchProducts(query),
    enabled: query.trim().length > 0,
  });
}

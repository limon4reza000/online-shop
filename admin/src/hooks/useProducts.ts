import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { mapApiProduct, mapApiReview } from '@/lib/adapters';
import type { ApiProduct } from '@/lib/apiTypes';
import type { Product } from '@/lib/types';

interface Paginated<T> {
  data: T[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
}

export interface ProductFilters {
  page?: number;
  pageSize?: number;
  q?: string;
  category?: string;
  subCategory?: string;
  brand?: string;
  color?: string;
  size?: string;
  minPrice?: number;
  maxPrice?: number;
  minDiscount?: number;
  minRating?: number;
  inStock?: boolean;
  featured?: boolean;
  bestSeller?: boolean;
  newArrival?: boolean;
  status?: 'active' | 'inactive';
  sort?: 'featured' | 'newest' | 'price-low' | 'price-high' | 'popular' | 'rating';
}

export function useProducts(filters: ProductFilters = {}, options: { enabled?: boolean } = {}) {
  const query = useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const res = await api.get<Paginated<ApiProduct>>('/products', { params: { pageSize: 100, ...filters } });
      return { items: res.data.data.map(mapApiProduct), meta: res.data.meta };
    },
    staleTime: 60_000,
    enabled: options.enabled,
  });
  return { ...query, data: query.data?.items ?? [], meta: query.data?.meta };
}

export function useProduct(slug: string | undefined) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const res = await api.get<{ data: ApiProduct }>(`/products/${slug}`);
      return {
        product: mapApiProduct(res.data.data),
        reviews: (res.data.data.reviews ?? []).map(mapApiReview),
      };
    },
    enabled: !!slug,
  });
}

export function useRelatedProducts(slug: string | undefined) {
  return useQuery({
    queryKey: ['product', slug, 'related'],
    queryFn: async () => {
      const res = await api.get<{ data: ApiProduct[] }>(`/products/${slug}/related`);
      return res.data.data.map(mapApiProduct);
    },
    enabled: !!slug,
  });
}

// ---- Admin ----

export function useAdminProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: ['products', 'admin', filters],
    queryFn: async () => {
      const res = await api.get<Paginated<ApiProduct>>('/admin/products', { params: filters });
      return { items: res.data.data.map(mapApiProduct), meta: res.data.meta };
    },
    placeholderData: (prev) => prev,
  });
}

function useInvalidateProducts() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['products'] });
}

export interface ProductFormInput {
  name: string;
  subtitle?: string;
  slug: string;
  shortDescription?: string;
  description: string;
  richContent?: string;
  price: number;
  oldPrice?: number;
  deliveryCharge: number;
  vat: number;
  stock: number;
  sku?: string;
  productCode?: string;
  weight?: number;
  material?: string;
  warranty?: string;
  returnPolicy?: string;
  thumbnail?: string;
  images: string[];
  video?: string;
  colors?: { name: string; hex: string }[];
  sizes?: string[];
  tags?: string[];
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isActive?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords?: string;
  categoryId: string;
  brandId: string;
}

export function useCreateProduct() {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: (body: ProductFormInput) => api.post('/admin/products', body),
    onSuccess: invalidate,
  });
}

export function useUpdateProduct() {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: ({ id, ...body }: Partial<ProductFormInput> & { id: string }) => api.patch(`/admin/products/${id}`, body),
    onSuccess: invalidate,
  });
}

export function useDeleteProduct() {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/admin/products/${id}`),
    onSuccess: invalidate,
  });
}

export function useDuplicateProduct() {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: (id: string) => api.post(`/admin/products/${id}/duplicate`),
    onSuccess: invalidate,
  });
}

export function useToggleProducts() {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: ({ ids, isActive }: { ids: string[]; isActive: boolean }) =>
      api.patch('/admin/products/toggle', { ids, isActive }),
    onSuccess: invalidate,
  });
}

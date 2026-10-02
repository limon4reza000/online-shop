import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { flattenCategoryTree, mapApiCategory } from '@/lib/adapters';
import { categories as mockCategories } from '@/lib/data';
import type { ApiCategory } from '@/lib/apiTypes';
import type { Category } from '@/lib/types';

/** Public storefront nav: main categories with their subcategories, flattened. */
export function useCategoryTree() {
  const query = useQuery({
    queryKey: ['categories', 'tree'],
    queryFn: async () => {
      try {
        const res = await api.get<{ data: ApiCategory[] }>('/categories');
        if (res.data && Array.isArray(res.data.data)) {
          return flattenCategoryTree(res.data.data);
        }
      } catch (err) {
        console.warn('API error fetching categories, using mock fallback:', err);
      }
      return mockCategories;
    },
    staleTime: 5 * 60_000,
  });

  const categories = query.data ?? mockCategories;
  const mainCategories = useMemo(() => categories.filter((c) => !c.parentSlug), [categories]);
  const getSubCategories = (parentSlug: string) => categories.filter((c) => c.parentSlug === parentSlug);

  return { ...query, categories, mainCategories, getSubCategories };
}

export function useCategoryBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['categories', 'detail', slug],
    queryFn: async () => {
      if (!slug) return null;
      try {
        const res = await api.get<{ data: ApiCategory }>(`/categories/${slug}`);
        if (res.data && res.data.data) {
          return mapApiCategory(res.data.data);
        }
      } catch (err) {
        console.warn('API error fetching category detail, using mock fallback:', err);
      }
      return mockCategories.find((c) => c.slug === slug) || null;
    },
    enabled: !!slug,
  });
}

// ---- Admin ----

export interface AdminCategoryRow extends Category {
  parentId: string | null;
  subCount: number;
}

export function useAdminCategories() {
  return useQuery({
    queryKey: ['categories', 'admin'],
    queryFn: async () => {
      const res = await api.get<{ data: ApiCategory[] }>('/admin/categories');
      return res.data.data.map((c): AdminCategoryRow => ({
        ...mapApiCategory(c),
        parentId: c.parentId,
        subCount: c._count?.children ?? 0,
      }));
    },
  });
}

function useInvalidateCategories() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['categories'] });
}

export interface CategoryFormInput {
  name: string;
  slug: string;
  parentId?: string | null;
  icon?: string;
  image?: string;
  banner?: string;
  isActive?: boolean;
}

export function useCreateCategory() {
  const invalidate = useInvalidateCategories();
  return useMutation({
    mutationFn: (body: CategoryFormInput) => api.post('/admin/categories', body),
    onSuccess: invalidate,
  });
}

export function useUpdateCategory() {
  const invalidate = useInvalidateCategories();
  return useMutation({
    mutationFn: ({ id, ...body }: CategoryFormInput & { id: string }) => api.patch(`/admin/categories/${id}`, body),
    onSuccess: invalidate,
  });
}

export function useDeleteCategory() {
  const invalidate = useInvalidateCategories();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/admin/categories/${id}`),
    onSuccess: invalidate,
  });
}

export function useToggleCategories() {
  const invalidate = useInvalidateCategories();
  return useMutation({
    mutationFn: ({ ids, isActive }: { ids: string[]; isActive: boolean }) =>
      api.patch('/admin/categories/toggle', { ids, isActive }),
    onSuccess: invalidate,
  });
}

export function useReorderCategories() {
  const invalidate = useInvalidateCategories();
  return useMutation({
    mutationFn: (orderedIds: string[]) => api.patch('/admin/categories/reorder', { orderedIds }),
    onSuccess: invalidate,
  });
}

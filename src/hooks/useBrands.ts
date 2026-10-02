import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { mapApiBrand } from '@/lib/adapters';
import { brands as mockBrands } from '@/lib/data';
import type { ApiBrand } from '@/lib/apiTypes';
import type { Brand } from '@/lib/types';

/** Public storefront list — active brands only, in admin-defined order.
 * Pass `{ featured: true }` for the homepage "Special Brands" section. */
export function useBrands(opts?: { featured?: boolean }) {
  return useQuery({
    queryKey: ['brands', opts],
    queryFn: async () => {
      try {
        const res = await api.get<{ data: ApiBrand[] }>('/brands', {
          params: opts?.featured ? { featured: 'true' } : undefined,
        });
        if (res.data && Array.isArray(res.data.data)) {
          return res.data.data.map(mapApiBrand);
        }
      } catch (err) {
        console.warn('API error fetching brands, using mock fallback:', err);
      }
      return mockBrands.map((name, i) => ({
        id: `b-${i + 1}`,
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        featured: true,
        isActive: true,
        sortOrder: i,
        productCount: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
    },
    staleTime: 5 * 60_000,
  });
}

/** A single brand by slug, for the brand detail page. */
export function useBrandBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['brands', 'detail', slug],
    queryFn: async () => {
      if (!slug) return null;
      try {
        const res = await api.get<{ data: ApiBrand }>(`/brands/${slug}`);
        if (res.data && res.data.data) {
          return mapApiBrand(res.data.data);
        }
      } catch (err) {
        console.warn('API error fetching brand by slug, using mock fallback:', err);
      }
      const foundName = mockBrands.find((b) => b.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug) || mockBrands[0];
      return {
        id: `b-fallback`,
        name: foundName,
        slug: foundName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        featured: true,
        isActive: true,
        sortOrder: 1,
        productCount: 10,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    },
    enabled: !!slug,
  });
}

// ---- Admin ----

export function useAdminBrands() {
  return useQuery({
    queryKey: ['brands', 'admin'],
    queryFn: async () => {
      const res = await api.get<{ data: ApiBrand[] }>('/admin/brands');
      return res.data.data.map(mapApiBrand);
    },
  });
}

function useInvalidateBrands() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['brands'] });
}

export interface BrandFormInput {
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  banner?: string;
  featured?: boolean;
  isActive?: boolean;
}

export function useCreateBrand() {
  const invalidate = useInvalidateBrands();
  return useMutation({
    mutationFn: (body: BrandFormInput) => api.post('/admin/brands', body),
    onSuccess: invalidate,
  });
}

export function useUpdateBrand() {
  const invalidate = useInvalidateBrands();
  return useMutation({
    mutationFn: ({ id, ...body }: BrandFormInput & { id: string }) => api.patch(`/admin/brands/${id}`, body),
    onSuccess: invalidate,
  });
}

export function useDeleteBrand() {
  const invalidate = useInvalidateBrands();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/admin/brands/${id}`),
    onSuccess: invalidate,
  });
}

export function useToggleBrands() {
  const invalidate = useInvalidateBrands();
  return useMutation({
    mutationFn: ({ ids, isActive }: { ids: string[]; isActive: boolean }) =>
      api.patch('/admin/brands/toggle', { ids, isActive }),
    onSuccess: invalidate,
  });
}

export function useReorderBrands() {
  const invalidate = useInvalidateBrands();
  return useMutation({
    mutationFn: (orderedIds: string[]) => api.patch('/admin/brands/reorder', { orderedIds }),
    onSuccess: invalidate,
  });
}

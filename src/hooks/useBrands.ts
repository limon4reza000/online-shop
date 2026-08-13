import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { mapApiBrand } from '@/lib/adapters';
import type { ApiBrand } from '@/lib/apiTypes';
import type { Brand } from '@/lib/types';

/** Public storefront list — active brands only, in admin-defined order.
 * Pass `{ featured: true }` for the homepage "Special Brands" section. */
export function useBrands(opts?: { featured?: boolean }) {
  return useQuery({
    queryKey: ['brands', opts],
    queryFn: async () => {
      const res = await api.get<{ data: ApiBrand[] }>('/brands', {
        params: opts?.featured ? { featured: 'true' } : undefined,
      });
      return res.data.data;
    },
    staleTime: 5 * 60_000,
  });
}

/** A single brand by slug, for the brand detail page. */
export function useBrandBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['brands', 'detail', slug],
    queryFn: async () => {
      const res = await api.get<{ data: ApiBrand }>(`/brands/${slug}`);
      return mapApiBrand(res.data.data);
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

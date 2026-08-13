import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { StoreSettings } from '@/lib/types';

/** Public storefront read — used to decide whether to show the free-delivery promo pill. */
export function usePublicStoreSettings() {
  return useQuery({
    queryKey: ['settings', 'store', 'public'],
    queryFn: async () => {
      const res = await api.get<{ data: StoreSettings }>('/settings/store');
      return res.data.data;
    },
    staleTime: 5 * 60_000,
    retry: 1,
  });
}

export function useAdminStoreSettings() {
  return useQuery({
    queryKey: ['settings', 'store', 'admin'],
    queryFn: async () => {
      const res = await api.get<{ data: StoreSettings }>('/admin/settings/store');
      return res.data.data;
    },
  });
}

export function useUpdateStoreSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Omit<StoreSettings, 'id' | 'updatedAt'>>) =>
      api.patch<{ data: StoreSettings }>('/admin/settings/store', body).then((r) => r.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings', 'store'] }),
  });
}

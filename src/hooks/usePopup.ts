import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { PromoPopup } from '@/lib/types';

/** Public: null when the popup is off or outside its schedule window. */
export function usePublicPopup() {
  return useQuery({
    queryKey: ['popup', 'public'],
    queryFn: async () => {
      const res = await api.get<{ data: PromoPopup | null }>('/popup');
      return res.data.data;
    },
    staleTime: 60_000,
    retry: 1,
  });
}

export function useAdminPopup() {
  return useQuery({
    queryKey: ['popup', 'admin'],
    queryFn: async () => {
      const res = await api.get<{ data: PromoPopup }>('/admin/popup');
      return res.data.data;
    },
  });
}

export function useUpdatePopup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Omit<PromoPopup, 'id' | 'updatedAt'>>) =>
      api.patch<{ data: PromoPopup }>('/admin/popup', body).then((r) => r.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['popup'] }),
  });
}

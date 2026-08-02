import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { SearchPlaceholder } from '@/lib/types';

interface Paginated<T> {
  data: T[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
}

/** Public storefront widget — active placeholders ordered by sortOrder. */
export function usePublicSearchPlaceholders() {
  return useQuery({
    queryKey: ['search-placeholders', 'public'],
    queryFn: async () => {
      const res = await api.get<{ data: SearchPlaceholder[] }>('/search-placeholders');
      return res.data.data;
    },
    staleTime: 5 * 60_000,
    retry: 1,
  });
}

interface AdminListParams {
  page: number;
  pageSize: number;
  search?: string;
}

export function useAdminSearchPlaceholders(params: AdminListParams) {
  return useQuery({
    queryKey: ['search-placeholders', 'admin', params],
    queryFn: async () => {
      const res = await api.get<Paginated<SearchPlaceholder>>('/admin/search-placeholders', { params });
      return res.data;
    },
    placeholderData: (prev) => prev,
  });
}

function useInvalidatePlaceholders() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['search-placeholders'] });
}

export function useCreateSearchPlaceholder() {
  const invalidate = useInvalidatePlaceholders();
  return useMutation({
    mutationFn: (body: { text: string; isActive?: boolean }) =>
      api.post<{ data: SearchPlaceholder }>('/admin/search-placeholders', body).then((r) => r.data.data),
    onSuccess: invalidate,
  });
}

export function useUpdateSearchPlaceholder() {
  const invalidate = useInvalidatePlaceholders();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; text?: string; isActive?: boolean }) =>
      api.put<{ data: SearchPlaceholder }>(`/admin/search-placeholders/${id}`, body).then((r) => r.data.data),
    onSuccess: invalidate,
  });
}

export function useDeleteSearchPlaceholder() {
  const invalidate = useInvalidatePlaceholders();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/admin/search-placeholders/${id}`),
    onSuccess: invalidate,
  });
}

export function useBulkDeleteSearchPlaceholders() {
  const invalidate = useInvalidatePlaceholders();
  return useMutation({
    mutationFn: (ids: string[]) => api.delete('/admin/search-placeholders/bulk', { data: { ids } }),
    onSuccess: invalidate,
  });
}

export function useToggleSearchPlaceholders() {
  const invalidate = useInvalidatePlaceholders();
  return useMutation({
    mutationFn: ({ ids, isActive }: { ids: string[]; isActive: boolean }) =>
      api.patch('/admin/search-placeholders/toggle', { ids, isActive }),
    onSuccess: invalidate,
  });
}

export function useReorderSearchPlaceholders() {
  const invalidate = useInvalidatePlaceholders();
  return useMutation({
    mutationFn: (orderedIds: string[]) => api.patch('/admin/search-placeholders/reorder', { orderedIds }),
    onSuccess: invalidate,
  });
}

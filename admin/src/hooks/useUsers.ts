import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type StaffRole = 'ADMIN' | 'MANAGER' | 'SUPPORT';

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  status: 'active' | 'blocked';
  createdAt: string;
  _count?: { orders: number };
}

interface Paginated<T> {
  data: T[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
}

/** Staff-only (ADMIN/MANAGER/SUPPORT) accounts — customers are excluded here since this
 * page is about who has access to the admin panel, not the storefront user base. */
export function useAdminStaff() {
  return useQuery({
    queryKey: ['users', 'staff'],
    queryFn: async () => {
      const [admins, managers, support] = await Promise.all(
        (['ADMIN', 'MANAGER', 'SUPPORT'] as StaffRole[]).map((role) =>
          api.get<Paginated<StaffUser>>('/users', { params: { role, pageSize: 100 } }).then((r) => r.data.data)
        )
      );
      return [...admins, ...managers, ...support].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    },
  });
}

function useInvalidateStaff() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['users'] });
}

export interface CreateStaffInput {
  name: string;
  email: string;
  password: string;
  role: StaffRole;
}

export function useCreateStaff() {
  const invalidate = useInvalidateStaff();
  return useMutation({
    mutationFn: (body: CreateStaffInput) => api.post<{ data: StaffUser }>('/users/staff', body).then((r) => r.data.data),
    onSuccess: invalidate,
  });
}

export function useUpdateStaffRole() {
  const invalidate = useInvalidateStaff();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: StaffRole }) => api.patch(`/users/${id}/role`, { role }),
    onSuccess: invalidate,
  });
}

export function useDeleteStaff() {
  const invalidate = useInvalidateStaff();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: invalidate,
  });
}

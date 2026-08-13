import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Address {
  id: string;
  label: 'Home' | 'Office' | 'Other';
  fullName: string;
  phone: string;
  division: string;
  district: string;
  upazila: string;
  postalCode: string;
  fullAddress: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddressFormInput {
  label: 'Home' | 'Office' | 'Other';
  fullName: string;
  phone: string;
  division: string;
  district: string;
  upazila: string;
  postalCode: string;
  fullAddress: string;
  isDefault?: boolean;
}

export function useAddresses() {
  return useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const res = await api.get<{ data: Address[] }>('/addresses');
      return res.data.data;
    },
  });
}

function useInvalidateAddresses() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['addresses'] });
}

export function useCreateAddress() {
  const invalidate = useInvalidateAddresses();
  return useMutation({
    mutationFn: (body: AddressFormInput) => api.post('/addresses', body),
    onSuccess: invalidate,
  });
}

export function useUpdateAddress() {
  const invalidate = useInvalidateAddresses();
  return useMutation({
    mutationFn: ({ id, ...body }: AddressFormInput & { id: string }) => api.patch(`/addresses/${id}`, body),
    onSuccess: invalidate,
  });
}

export function useDeleteAddress() {
  const invalidate = useInvalidateAddresses();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/addresses/${id}`),
    onSuccess: invalidate,
  });
}

export function useSetDefaultAddress() {
  const invalidate = useInvalidateAddresses();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/addresses/${id}/default`),
    onSuccess: invalidate,
  });
}

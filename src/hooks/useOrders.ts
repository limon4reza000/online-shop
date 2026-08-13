import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface CreateOrderInput {
  items: { productId: string; quantity: number; price: number; color?: string; size?: string }[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  couponCode?: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    village: string;
    postOffice: string;
    upazila: string;
    district: string;
    division: string;
    note?: string;
  };
}

export interface Order {
  id: string;
  status: string;
  total: number;
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: async (body: CreateOrderInput) => {
      const res = await api.post<{ data: Order }>('/orders', body);
      return res.data.data;
    },
  });
}

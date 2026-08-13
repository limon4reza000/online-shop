import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface AdminOrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: string | number;
  color?: string | null;
  size?: string | null;
}

export interface AdminOrder {
  id: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: string | number;
  discount: string | number;
  shipping: string | number;
  tax: string | number;
  total: string | number;
  createdAt: string;
  items: AdminOrderItem[];
  user?: { id: string; name: string; email: string };
}

interface Paginated<T> {
  data: T[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
}

export function useAdminOrders(params: { page?: number; pageSize?: number } = {}) {
  return useQuery({
    queryKey: ['orders', 'admin', params],
    queryFn: async () => {
      const res = await api.get<Paginated<AdminOrder>>('/orders', { params: { page: 1, pageSize: 10, ...params } });
      return res.data;
    },
    placeholderData: (prev) => prev,
  });
}

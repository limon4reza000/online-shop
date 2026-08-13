import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useSocket } from './useSocket';

/** Mount once (e.g. in AdminLayout) to keep every analytics/order view live: whenever the
 * backend broadcasts that an order was placed or its status changed, refetch instead of
 * waiting for a manual refresh. */
export function useAnalyticsRealtimeSync() {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    const onUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    };
    socket.on('analytics:update', onUpdate);
    return () => {
      socket.off('analytics:update', onUpdate);
    };
  }, [socket, queryClient]);
}

export interface AnalyticsSummary {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
  productsChange: number;
}

export function useAnalyticsSummary() {
  return useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: async () => (await api.get<{ data: AnalyticsSummary }>('/analytics/summary')).data.data,
  });
}

export interface RevenueTrendPoint {
  month: string;
  revenue: number;
  orders: number;
}

export function useRevenueTrend(months = 7) {
  return useQuery({
    queryKey: ['analytics', 'revenue-trend', months],
    queryFn: async () => (await api.get<{ data: RevenueTrendPoint[] }>('/analytics/revenue-trend', { params: { months } })).data.data,
  });
}

export interface CategorySales {
  name: string;
  sales: number;
}

export function useCategorySales() {
  return useQuery({
    queryKey: ['analytics', 'category-sales'],
    queryFn: async () => (await api.get<{ data: CategorySales[] }>('/analytics/category-sales')).data.data,
  });
}

export interface TopProduct {
  id: string;
  name: string;
  image: string | null;
  rating: number;
  units: number;
  revenue: number;
}

export function useTopProducts(limit = 6) {
  return useQuery({
    queryKey: ['analytics', 'top-products', limit],
    queryFn: async () => (await api.get<{ data: TopProduct[] }>('/analytics/top-products', { params: { limit } })).data.data,
  });
}

export interface WeeklyProfitPoint {
  week: string;
  profit: number;
}

export function useWeeklyProfit(weeks = 6) {
  return useQuery({
    queryKey: ['analytics', 'weekly-profit', weeks],
    queryFn: async () => (await api.get<{ data: WeeklyProfitPoint[] }>('/analytics/weekly-profit', { params: { weeks } })).data.data,
  });
}

export interface SalesReport {
  totalRevenue: number;
  revenueChange: number;
  netProfit: number;
  netProfitChange: number;
  unitsSold: number;
  unitsSoldChange: number;
  avgMargin: number;
  avgMarginChange: number;
}

export function useSalesReport() {
  return useQuery({
    queryKey: ['analytics', 'sales-report'],
    queryFn: async () => (await api.get<{ data: SalesReport }>('/analytics/sales-report')).data.data,
  });
}

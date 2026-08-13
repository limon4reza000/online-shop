import { useCallback, useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { mapApiProduct } from '@/lib/adapters';
import type { ApiProduct } from '@/lib/apiTypes';
import type { Product } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { useProducts } from './useProducts';

const STORAGE_KEY = 'shop-recently-viewed-v2';
const MAX_ITEMS = 20;

interface LocalEntry {
  productId: string;
  viewedAt: string;
}

function readLocal(): LocalEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLocal(entries: LocalEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ITEMS)));
  } catch {
    /* noop */
  }
}

function clearLocal() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
}

export interface RecentlyViewedItem {
  product: Product;
  viewedAt: string;
}

interface ApiRecentlyViewed {
  viewedAt: string;
  product: ApiProduct;
}

/** Tracks per-product view history: DB-backed for logged-in users, localStorage
 * for guests — with the guest history merged into the account right after login. */
export function useRecentlyViewed() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const mergedRef = useRef(false);
  const { data: allProducts = [] } = useProducts({}, { enabled: !user });

  const remoteQuery = useQuery({
    queryKey: ['recently-viewed'],
    queryFn: async () => {
      const res = await api.get<{ data: ApiRecentlyViewed[] }>('/recently-viewed');
      return res.data.data.map((r) => ({ product: mapApiProduct(r.product), viewedAt: r.viewedAt }));
    },
    enabled: !!user,
  });

  const mergeMutation = useMutation({
    mutationFn: (items: LocalEntry[]) => api.post('/recently-viewed/merge', { items }),
  });

  useEffect(() => {
    if (!user || mergedRef.current) return;
    mergedRef.current = true;
    const local = readLocal();
    if (local.length === 0) return;
    mergeMutation.mutate(local, {
      onSuccess: () => {
        clearLocal();
        queryClient.invalidateQueries({ queryKey: ['recently-viewed'] });
      },
    });
    // Runs once per login transition — deliberately excludes mergeMutation/queryClient from deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const trackView = useCallback(
    (productId: string) => {
      if (user) {
        api
          .post('/recently-viewed', { productId })
          .then(() => queryClient.invalidateQueries({ queryKey: ['recently-viewed'] }))
          .catch(() => { /* noop */ });
      } else {
        const next = [{ productId, viewedAt: new Date().toISOString() }, ...readLocal().filter((e) => e.productId !== productId)];
        writeLocal(next);
      }
    },
    [user, queryClient]
  );

  const guestItems: RecentlyViewedItem[] = user
    ? []
    : readLocal()
        .map((e) => {
          const product = allProducts.find((p) => p.id === e.productId);
          return product ? { product, viewedAt: e.viewedAt } : null;
        })
        .filter((x): x is RecentlyViewedItem => !!x);

  return {
    items: user ? remoteQuery.data ?? [] : guestItems,
    trackView,
  };
}

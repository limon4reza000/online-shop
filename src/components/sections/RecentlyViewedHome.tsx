import { useEffect, useState } from 'react';
import { ProductRail } from './ProductRail';
import { products } from '@/lib/data';
import type { Product } from '@/lib/types';

const RECENT_KEY = 'shop-recently-viewed';

export function RecentlyViewedHome({ onQuickView }: { onQuickView: (p: Product) => void }) {
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      const ids: string[] = raw ? JSON.parse(raw) : [];
      const found = ids.map((id) => products.find((p) => p.id === id)).filter((p): p is Product => !!p).slice(0, 4);
      setItems(found);
    } catch {
      setItems([]);
    }
  }, []);

  if (items.length === 0) return null;

  return (
    <ProductRail
      eyebrow="আপনার ব্রাউজিং হিস্ট্রি"
      title="সম্প্রতি দেখেছেন"
      subtitle="আপনি যেখানে রেখে গিয়েছিলেন, সেখান থেকেই চালিয়ে যান"
      products={items}
      onQuickView={onQuickView}
    />
  );
}

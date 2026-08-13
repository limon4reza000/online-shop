import { useMemo, useState } from 'react';
import { History, ChevronDown, ChevronUp } from 'lucide-react';
import { ProductCard } from '@/components/ui/ProductCard';
import { FadeIn } from '@/components/ui/FadeIn';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import type { Product } from '@/lib/types';

const COLLAPSE_LIMIT = 6;

function dayLabel(iso: string): string {
  const viewed = new Date(iso);
  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOfDay(now) - startOfDay(viewed)) / 86_400_000);
  if (diffDays <= 0) return 'আজ দেখেছেন';
  if (diffDays === 1) return 'গতকাল দেখেছেন';
  if (diffDays < 7) return `${diffDays} দিন আগে দেখেছেন`;
  return 'আগে দেখেছেন';
}

export function RecentlyViewedHome({ onQuickView }: { onQuickView: (p: Product) => void }) {
  const { items } = useRecentlyViewed();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const groups = useMemo(() => {
    const ordered: { label: string; products: Product[] }[] = [];
    for (const { product, viewedAt } of items) {
      const label = dayLabel(viewedAt);
      const group = ordered.find((g) => g.label === label);
      if (group) group.products.push(product);
      else ordered.push({ label, products: [product] });
    }
    return ordered;
  }, [items]);

  if (groups.length === 0) return null;

  const toggleGroup = (label: string) => setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));

  return (
    <section className="py-[2px]">
      <div className="container-app">
        <FadeIn className="flex items-end justify-between gap-4 mb-2 pt-1.5">
          <div>
            <span className="eyebrow"><History size={14} /> আপনার ব্রাউজিং হিস্ট্রি</span>
            <h2 className="mt-1 flex items-center gap-2 text-lg sm:text-xl">
              <History size={18} className="text-primary" /> সম্প্রতি দেখেছেন
            </h2>
            <p className="mt-1 text-sm text-text-secondary">আপনি যেখানে রেখে গিয়েছিলেন, সেখান থেকেই চালিয়ে যান</p>
          </div>
        </FadeIn>

        {groups.map(({ label, products }) => {
          const isExpanded = !!expanded[label];
          const hasMore = products.length > COLLAPSE_LIMIT;
          const visible = isExpanded ? products : products.slice(0, COLLAPSE_LIMIT);

          return (
            <div key={label} className="mb-5 last:mb-0">
              <div className="flex items-center justify-between gap-3 mb-2">
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">{label}</p>
                {hasMore && (
                  <button
                    onClick={() => toggleGroup(label)}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover transition-colors shrink-0"
                  >
                    {isExpanded ? <>কম দেখুন <ChevronUp size={15} /></> : <>আরও দেখুন <ChevronDown size={15} /></>}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {visible.map((p, i) => (
                  <FadeIn key={p.id} delay={i * 60} className="h-full">
                    <ProductCard product={p} onQuickView={onQuickView} bordered={false} />
                  </FadeIn>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

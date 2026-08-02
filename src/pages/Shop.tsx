import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { ProductCard } from '@/components/ui/ProductCard';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { Pagination } from '@/components/ui/Pagination';
import { QuickViewModal } from '@/components/ui/QuickViewModal';
import { Seo } from '@/components/ui/Seo';
import { categories as allCategories, brands } from '@/lib/data';

const categories = allCategories.filter((c) => c.parentSlug);
import { useProducts } from '@/hooks/useProducts';
import { formatPrice } from '@/lib/format';
import type { Product } from '@/lib/types';

const PAGE_SIZE = 9;
const MAX_PRICE = 400;

export default function Shop() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialSort = searchParams.get('sort') || 'featured';

  const [query, setQuery] = useState(initialQuery);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [quickView, setQuickView] = useState<Product | null>(null);

  const { data: products = [], isLoading: loading } = useProducts();

  const toggle = (list: string[], setList: (v: string[]) => void, value: string) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
    setPage(1);
  };

  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      if (query && !p.name.toLowerCase().includes(query.toLowerCase())) return false;
      if (selectedCats.length && !selectedCats.includes(p.category)) return false;
      if (selectedBrands.length && !selectedBrands.includes(p.brand)) return false;
      if (p.price > maxPrice) return false;
      if (p.rating < minRating) return false;
      return true;
    });

    switch (sort) {
      case 'price-low': result = [...result].sort((a, b) => a.price - b.price); break;
      case 'price-high': result = [...result].sort((a, b) => b.price - a.price); break;
      case 'newest': result = [...result].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)); break;
      case 'popular': result = [...result].sort((a, b) => b.reviewCount - a.reviewCount); break;
      case 'rating': result = [...result].sort((a, b) => b.rating - a.rating); break;
    }
    return result;
  }, [products, query, selectedCats, selectedBrands, maxPrice, minRating, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const clearFilters = () => {
    setSelectedCats([]); setSelectedBrands([]); setMaxPrice(MAX_PRICE); setMinRating(0); setQuery(''); setPage(1);
  };

  const FilterPanel = (
    <div className="space-y-7">
      <div>
        <h4 className="text-sm font-bold mb-3">অনুসন্ধান</h4>
        <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="পণ্য খুঁজুন..." className="input-field" />
      </div>
      <div>
        <h4 className="text-sm font-bold mb-3">ক্যাটাগরি</h4>
        <div className="space-y-2">
          {categories.map((c) => (
            <label key={c.id} className="flex items-center gap-2.5 text-sm text-text-secondary cursor-pointer hover:text-text-primary">
              <input type="checkbox" checked={selectedCats.includes(c.slug)} onChange={() => toggle(selectedCats, setSelectedCats, c.slug)} className="accent-primary h-4 w-4 rounded" />
              {c.name}
            </label>
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-sm font-bold mb-3">ব্র্যান্ড</h4>
        <div className="space-y-2">
          {brands.map((b) => (
            <label key={b} className="flex items-center gap-2.5 text-sm text-text-secondary cursor-pointer hover:text-text-primary">
              <input type="checkbox" checked={selectedBrands.includes(b)} onChange={() => toggle(selectedBrands, setSelectedBrands, b)} className="accent-primary h-4 w-4 rounded" />
              {b}
            </label>
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-sm font-bold mb-3">সর্বোচ্চ মূল্য: {formatPrice(maxPrice)}</h4>
        <input type="range" min={20} max={MAX_PRICE} value={maxPrice} onChange={(e) => { setMaxPrice(Number(e.target.value)); setPage(1); }} className="w-full accent-primary" />
      </div>
      <div>
        <h4 className="text-sm font-bold mb-3">সর্বনিম্ন রেটিং</h4>
        <div className="flex gap-2">
          {[0, 3, 4, 4.5].map((r) => (
            <button
              key={r}
              onClick={() => { setMinRating(r); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${minRating === r ? 'bg-primary text-white border-primary' : 'border-border text-text-secondary hover:border-primary'}`}
            >
              {r === 0 ? 'যেকোনো' : `${r}+`}
            </button>
          ))}
        </div>
      </div>
      <button onClick={clearFilters} className="btn-ghost w-full border border-border">সব ফিল্টার মুছুন</button>
    </div>
  );

  return (
    <>
      <Seo title="Shop All" description="আমাদের প্রিমিয়াম ফ্যাশন ও লাইফস্টাইল পণ্যের সম্পূর্ণ সংগ্রহ দেখুন।" />
      <PageHeader title="সব পণ্য" subtitle="আমাদের প্রিমিয়াম ফ্যাশন ও লাইফস্টাইল পণ্যের সম্পূর্ণ সংগ্রহ দেখুন।" crumbs={[{ label: 'শপ' }]} />

      <div className="container-app section-y !py-10 sm:!py-12">
        <div className="grid lg:grid-cols-[260px_1fr] gap-8">
          <aside className="hidden lg:block">
            <div className="card-surface p-6 sticky top-28">{FilterPanel}</div>
          </aside>

          <div>
            <div className="flex items-center justify-between gap-4 mb-6">
              <p className="text-sm text-text-secondary">{filtered.length}টি পণ্য পাওয়া গেছে</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setFiltersOpen(true)} className="lg:hidden btn-outline btn-sm">
                  <SlidersHorizontal size={14} /> ফিল্টার
                </button>
                <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} className="input-field !w-auto text-sm py-2.5">
                  <option value="featured">সাজান: বিশেষ নির্বাচন</option>
                  <option value="newest">নতুন</option>
                  <option value="price-low">মূল্য: কম থেকে বেশি</option>
                  <option value="price-high">মূল্য: বেশি থেকে কম</option>
                  <option value="popular">সর্বাধিক জনপ্রিয়</option>
                  <option value="rating">শীর্ষ রেটেড</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : pageItems.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                {pageItems.map((p) => <ProductCard key={p.id} product={p} onQuickView={setQuickView} />)}
              </div>
            ) : (
              <div className="text-center py-20 text-text-secondary">
                <p className="text-lg font-semibold text-text-primary mb-2">কোনো পণ্য পাওয়া যায়নি</p>
                <p className="text-sm">আপনার ফিল্টার বা অনুসন্ধানের শব্দ পরিবর্তন করে দেখুন।</p>
              </div>
            )}

            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        </div>
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-[95] lg:hidden">
          <div className="absolute inset-0 bg-text-primary/40" onClick={() => setFiltersOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white p-6 overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">ফিল্টার</h3>
              <button onClick={() => setFiltersOpen(false)} className="p-2 rounded-full hover:bg-primary-light"><X size={18} /></button>
            </div>
            {FilterPanel}
          </div>
        </div>
      )}

      <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />
    </>
  );
}

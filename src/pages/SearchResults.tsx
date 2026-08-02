import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { ProductCard } from '@/components/ui/ProductCard';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { QuickViewModal } from '@/components/ui/QuickViewModal';
import { Seo } from '@/components/ui/Seo';
import { useSearchProducts } from '@/hooks/useProducts';
import type { Product } from '@/lib/types';

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [input, setInput] = useState(q);
  const { data: results = [], isLoading } = useSearchProducts(q);
  const [quickView, setQuickView] = useState<Product | null>(null);
  const navigate = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) setSearchParams({ q: input.trim() });
  };

  return (
    <>
      <Seo title={q ? `"${q}" এর জন্য অনুসন্ধান ফলাফল` : 'অনুসন্ধান'} description="সম্পূর্ণ নিত্যঘর ক্যাটালগে অনুসন্ধান করুন।" />
      <PageHeader title="অনুসন্ধান ফলাফল" subtitle={q ? `"${q}" এর জন্য ফলাফল দেখানো হচ্ছে` : 'আমাদের ক্যাটালগে অনুসন্ধান করুন'} crumbs={[{ label: 'অনুসন্ধান' }]} />

      <div className="container-app section-y">
        <form onSubmit={submit} className="max-w-xl mx-auto flex gap-3 mb-12">
          <div className="relative flex-1">
            <SearchIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="পণ্য, ব্র্যান্ড, ক্যাটাগরি খুঁজুন..." className="input-field pl-9" autoFocus />
          </div>
          <button type="submit" className="btn-primary shrink-0">অনুসন্ধান</button>
        </form>

        {!q ? (
          <p className="text-center text-text-secondary">আমাদের ক্যাটালগে অনুসন্ধান শুরু করতে উপরে টাইপ করুন।</p>
        ) : isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg font-semibold text-text-primary mb-2">"{q}" এর জন্য কোনো ফলাফল পাওয়া যায়নি</p>
            <p className="text-sm text-text-secondary mb-6">ভিন্ন কোনো শব্দ দিয়ে খুঁজুন অথবা আমাদের ক্যাটাগরি ঘুরে দেখুন।</p>
            <button onClick={() => navigate('/shop')} className="btn-primary">সব পণ্য দেখুন</button>
          </div>
        ) : (
          <>
            <p className="text-sm text-text-secondary mb-6">{results.length}টি ফলাফল পাওয়া গেছে</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {results.map((p) => <ProductCard key={p.id} product={p} onQuickView={setQuickView} />)}
            </div>
          </>
        )}
      </div>

      <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />
    </>
  );
}

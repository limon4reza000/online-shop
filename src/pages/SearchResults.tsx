import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ProductCard } from '@/components/ui/ProductCard';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { QuickViewModal } from '@/components/ui/QuickViewModal';
import { Seo } from '@/components/ui/Seo';
import { useProducts } from '@/hooks/useProducts';
import type { Product } from '@/lib/types';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const { data: results = [], isLoading } = useProducts({ q }, { enabled: q.trim().length > 0 });
  const [quickView, setQuickView] = useState<Product | null>(null);
  const navigate = useNavigate();

  return (
    <>
      <Seo title={q ? `"${q}" এর জন্য অনুসন্ধান ফলাফল` : 'অনুসন্ধান'} description="সম্পূর্ণ নিত্যঘর ক্যাটালগে অনুসন্ধান করুন।" />

      <div className="container-app section-y">
        <button
          onClick={() => navigate(-1)}
          aria-label="পেছনে যান"
          className="grid place-items-center h-9 w-9 rounded-full bg-primary-light hover:bg-primary-light/70 text-text-primary shadow-soft transition-colors mb-6"
        >
          <ArrowLeft size={16} />
        </button>

        {!q ? (
          <p className="text-center text-text-secondary">আমাদের ক্যাটালগে অনুসন্ধান শুরু করতে উপরে টাইপ করুন।</p>
        ) : isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 border-t border-l border-border">
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
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 border-t border-l border-border">
              {results.map((p) => <ProductCard key={p.id} product={p} onQuickView={setQuickView} />)}
            </div>
          </>
        )}
      </div>

      <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />
    </>
  );
}

import { useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { ProductCard } from '@/components/ui/ProductCard';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { QuickViewModal } from '@/components/ui/QuickViewModal';
import { Pagination } from '@/components/ui/Pagination';
import { useBrandBySlug } from '@/hooks/useBrands';
import { useProducts } from '@/hooks/useProducts';
import type { Product } from '@/lib/types';

const PAGE_SIZE = 8;

export default function BrandDetail() {
  const { slug } = useParams();
  const { data: brand, isLoading: brandLoading, isError } = useBrandBySlug(slug);
  const [page, setPage] = useState(1);
  const [quickView, setQuickView] = useState<Product | null>(null);

  const { data: items = [], meta, isLoading: productsLoading } = useProducts(
    { brand: slug, page, pageSize: PAGE_SIZE },
    { enabled: !!slug }
  );
  const totalPages = meta?.totalPages ?? 1;

  if (brandLoading) return null;
  if (isError || !brand) return <Navigate to="/shop" replace />;

  return (
    <>
      <PageHeader title={brand.name} crumbs={[{ label: 'শপ', to: '/shop' }, { label: brand.name }]} centerBack />
      {brand.banner && (
        <section className="pt-1 sm:pt-2 pb-5">
          <div className="container-app">
            <div className="relative overflow-hidden rounded-xl shadow-lift h-40 sm:h-64">
              <img src={brand.banner} alt={brand.name} className="h-full w-full object-cover" />
            </div>
          </div>
        </section>
      )}
      <div className="container-app pb-2">
        <div className="card-surface p-5 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          {brand.logoUrl && (
            <span className="grid place-items-center h-20 w-20 rounded-full bg-white border-2 border-border shadow-soft overflow-hidden shrink-0">
              <img src={brand.logoUrl} alt={brand.name} className="h-full w-full object-cover" />
            </span>
          )}
          <div className="flex-1">
            <h2 className="text-lg font-bold">{brand.name}</h2>
            {brand.description && <p className="mt-1.5 text-sm text-text-secondary">{brand.description}</p>}
            <p className="mt-2 text-xs font-semibold text-primary">{meta?.total ?? brand.productCount}টি পণ্য</p>
          </div>
        </div>
      </div>
      <div className="container-app section-y !pt-0">
        {productsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 border-t border-l border-border">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-text-secondary">এই ব্র্যান্ডে এখনো কোনো পণ্য যোগ করা হয়নি।</p>
            <Link to="/shop" className="btn-primary mt-6 inline-flex">
              শপে যান <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 border-t border-l border-border">
              {items.map((p) => <ProductCard key={p.id} product={p} onQuickView={setQuickView} />)}
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </div>
      <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />
    </>
  );
}

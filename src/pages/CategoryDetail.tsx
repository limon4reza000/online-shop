import { useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { CategoryHeroBanner } from '@/components/ui/CategoryHeroBanner';
import { ProductCard } from '@/components/ui/ProductCard';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { QuickViewModal } from '@/components/ui/QuickViewModal';
import { Pagination } from '@/components/ui/Pagination';
import { FadeIn } from '@/components/ui/FadeIn';
import { useCategoryTree } from '@/hooks/useCategories';
import { useProducts } from '@/hooks/useProducts';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import type { Product } from '@/lib/types';

const PAGE_SIZE = 8;

export default function CategoryDetail() {
  const { slug } = useParams();
  const { categories, getSubCategories, isLoading: categoriesLoading } = useCategoryTree();
  const category = categories.find((c) => c.slug === slug);
  const [page, setPage] = useState(1);
  const [quickView, setQuickView] = useState<Product | null>(null);

  const isMainCategory = !!category && !category.parentSlug;
  const subCategories = isMainCategory ? getSubCategories(category!.slug) : [];
  const parentCategory = category?.parentSlug ? categories.find((c) => c.slug === category.parentSlug) : undefined;

  const { data: items = [], meta, isLoading: productsLoading } = useProducts(
    { subCategory: slug, page, pageSize: PAGE_SIZE },
    { enabled: !isMainCategory && !!category }
  );
  const totalPages = meta?.totalPages ?? 1;

  if (categoriesLoading) return null;
  if (!category) return <Navigate to="/categories" replace />;

  if (isMainCategory) {
    return (
      <>
        <PageHeader
          title={<span className="inline-flex items-center gap-2.5"><CategoryIcon name={category.icon} className="text-2xl" /> {category.name}</span>}
          crumbs={[{ label: category.name }]}
          showBack
        />
        <div className="container-app section-y">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {subCategories.map((sub, i) => (
              <FadeIn key={sub.id} delay={i * 60}>
                <Link to={`/categories/${sub.slug}`} className="group block relative overflow-hidden rounded-2xl aspect-square shadow-soft hover:shadow-lift transition-all duration-300">
                  <img src={sub.image} alt={sub.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-text-primary/80 via-text-primary/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <p className="font-semibold">{sub.name}</p>
                    <p className="text-xs opacity-80 mt-0.5">{sub.count}টি পণ্য</p>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={category.name}
        crumbs={parentCategory ? [{ label: parentCategory.name, to: `/categories/${parentCategory.slug}` }, { label: category.name }] : [{ label: category.name }]}
        showBack
      />
      <CategoryHeroBanner images={category.bannerImages} alt={category.name} />
      <div className="container-app section-y !pt-0">
        {productsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 border-t border-l border-border">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-text-secondary">এই ক্যাটাগরিতে এখনো কোনো পণ্য যোগ করা হয়নি।</p>
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

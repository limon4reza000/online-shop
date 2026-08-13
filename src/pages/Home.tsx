import { useMemo, useState } from 'react';
import { Heart, Tag, Sparkles, Zap } from 'lucide-react';
import { Hero } from '@/components/sections/Hero';
import { PromoPills } from '@/components/sections/PromoPills';
import { ProductRail } from '@/components/sections/ProductRail';
import { TodaysPicks } from '@/components/sections/TodaysPicks';
import { OfferPopup } from '@/components/sections/OfferPopup';
import { RecentlyViewedHome } from '@/components/sections/RecentlyViewedHome';
import { FeaturedBrands } from '@/components/sections/FeaturedBrands';
import { QuickViewModal } from '@/components/ui/QuickViewModal';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { useProducts } from '@/hooks/useProducts';
import { useCategoryTree } from '@/hooks/useCategories';
import { useLanguage } from '@/context/LanguageContext';
import type { Product } from '@/lib/types';

const BUDGET_CEILING = 99;

export default function Home() {
  const [quickView, setQuickView] = useState<Product | null>(null);
  const { data: products = [] } = useProducts();
  const { mainCategories, getSubCategories } = useCategoryTree();
  const { t } = useLanguage();

  // Today's Edits — team-curated bestsellers.
  const todaysPicks = useMemo(() => products.filter((p) => p.tags.includes('bestseller')).slice(0, 6), [products]);
  // Your's Picks — what the community keeps buying.
  const yoursPicks = useMemo(() => [...products].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 6), [products]);
  // Deals of the Day.
  const dealsOfTheDay = useMemo(() => products.filter((p) => p.tags.includes('flash-sale')).slice(0, 6), [products]);
  // Shop Under ৳99.
  const shopUnder99 = useMemo(
    () => [...products].filter((p) => p.price <= BUDGET_CEILING).sort((a, b) => a.price - b.price).slice(0, 6),
    [products]
  );
  // New Arrivals.
  const newArrivals = useMemo(() => [...products].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 6), [products]);

  // One section per main category, entirely data-driven: a category the admin adds today
  // shows up here on its own with zero code changes, and any with no products stays hidden
  // (ProductRail already returns null for an empty list).
  const categorySections = useMemo(
    () =>
      mainCategories.map((main) => {
        const subSlugs = getSubCategories(main.slug).map((c) => c.slug);
        const categoryProducts = products
          .filter((p) => p.category === main.slug || subSlugs.includes(p.category))
          .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
          .slice(0, 6);
        return { category: main, products: categoryProducts };
      }),
    [mainCategories, getSubCategories, products]
  );

  return (
    <>
      <Hero />
      <PromoPills />
      <FeaturedBrands />
      <TodaysPicks products={todaysPicks} />
      <ProductRail
        icon={<Heart />}
        eyebrow={t('home.yoursPicks.eyebrow')}
        title={t('home.yoursPicks.title')}
        subtitle={t('home.yoursPicks.subtitle')}
        products={yoursPicks}
        viewAllTo="/shop?sort=popular"
        onQuickView={setQuickView}
      />
      <ProductRail
        icon={<Zap />}
        eyebrow={t('home.dealsOfTheDay.eyebrow')}
        title={t('home.dealsOfTheDay.title')}
        subtitle={t('home.dealsOfTheDay.subtitle')}
        products={dealsOfTheDay}
        viewAllTo="/shop"
        onQuickView={setQuickView}
      />
      <ProductRail
        icon={<Tag />}
        eyebrow={t('home.shopUnder99.eyebrow', { amount: BUDGET_CEILING })}
        title={t('home.shopUnder99.title')}
        subtitle={t('home.shopUnder99.subtitle')}
        products={shopUnder99}
        viewAllTo="/shop?sort=price-low"
        onQuickView={setQuickView}
      />
      <ProductRail
        icon={<Sparkles />}
        eyebrow={t('home.newArrivals.eyebrow')}
        title={t('home.newArrivals.title')}
        subtitle={t('home.newArrivals.subtitle')}
        products={newArrivals}
        viewAllTo="/shop?sort=newest"
        onQuickView={setQuickView}
      />

      {categorySections.map(({ category, products: catProducts }) => (
        <ProductRail
          key={category.id}
          icon={<CategoryIcon name={category.icon} />}
          eyebrow={t('home.categoryRail.eyebrow')}
          title={category.name}
          subtitle={t('home.categoryRail.subtitle', { category: category.name })}
          products={catProducts}
          viewAllTo={`/categories/${category.slug}`}
          onQuickView={setQuickView}
        />
      ))}

      <RecentlyViewedHome onQuickView={setQuickView} />
      <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />
      <OfferPopup />
    </>
  );
}

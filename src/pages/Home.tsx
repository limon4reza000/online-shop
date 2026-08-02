import { useMemo, useState } from 'react';
import { Hero } from '@/components/sections/Hero';
import { PromoPills } from '@/components/sections/PromoPills';
import { ProductRail } from '@/components/sections/ProductRail';
import { TodaysPicks } from '@/components/sections/TodaysPicks';
import { FlashSale } from '@/components/sections/FlashSale';
import { ReelsSection } from '@/components/sections/ReelsSection';
import { RecentlyViewedHome } from '@/components/sections/RecentlyViewedHome';
import { FeaturedBrands } from '@/components/sections/FeaturedBrands';
import { CustomerReviews } from '@/components/sections/CustomerReviews';
import { Newsletter } from '@/components/sections/Newsletter';
import { InstagramGallery } from '@/components/sections/InstagramGallery';
import { QuickViewModal } from '@/components/ui/QuickViewModal';
import { products, getSubCategories } from '@/lib/data';
import type { Product } from '@/lib/types';

const BUDGET_CEILING = 60;

export default function Home() {
  const [quickView, setQuickView] = useState<Product | null>(null);

  const todaysPicks = useMemo(() => products.filter((p) => p.tags.includes('bestseller')).slice(0, 6), []);
  const trending = useMemo(() => products.filter((p) => p.tags.includes('trending')).slice(0, 8), []);
  const newArrivals = useMemo(() => [...products].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 4), []);
  const bestSellers = useMemo(() => [...products].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 4), []);
  const flashDeals = useMemo(() => products.filter((p) => p.tags.includes('flash-sale')).slice(0, 4), []);
  const budgetPicks = useMemo(() => [...products].filter((p) => p.price <= BUDGET_CEILING).sort((a, b) => a.price - b.price).slice(0, 4), []);
  const fashionSlugs = useMemo(() => getSubCategories('fashion').map((c) => c.slug), []);
  const beautySlugs = useMemo(() => [...getSubCategories('beauty'), ...getSubCategories('jewelry')].map((c) => c.slug), []);
  const fashionPicks = useMemo(() => products.filter((p) => fashionSlugs.includes(p.category)).slice(0, 4), [fashionSlugs]);
  const beautyPicks = useMemo(() => products.filter((p) => beautySlugs.includes(p.category)).slice(0, 4), [beautySlugs]);
  const recommended = useMemo(() => [...products].sort(() => 0.5 - ((Date.now() / 86400000) % 1)).slice(8, 12), []);

  return (
    <>
      <Hero />
      <PromoPills />
      <TodaysPicks products={todaysPicks} />
      <ProductRail eyebrow="এখন ট্রেন্ডিং" title="ট্রেন্ডিং পণ্য" subtitle="এই সপ্তাহে সবাই যা কার্টে যোগ করছেন" products={trending} viewAllTo="/shop" onQuickView={setQuickView} dark />
      <ProductRail eyebrow="নতুন সংযোজন" title="নতুন পণ্য" subtitle="সদ্য আসা সতেজ সব স্টাইল" products={newArrivals} viewAllTo="/shop?sort=newest" onQuickView={setQuickView} />
      <ProductRail eyebrow="গ্রাহকদের পছন্দ" title="বেস্ট সেলার" subtitle="আমাদের সম্প্রদায়ের বারবার পছন্দের পণ্য" products={bestSellers} viewAllTo="/shop?sort=popular" onQuickView={setQuickView} />
      <FlashSale products={flashDeals} onQuickView={setQuickView} />
      <ReelsSection />
      <ProductRail eyebrow={`$${BUDGET_CEILING}-এর নিচে`} title="বাজেট কালেকশন" subtitle="সাশ্রয়ী দামে দারুণ সব পছন্দ" products={budgetPicks} viewAllTo="/shop?sort=price-low" onQuickView={setQuickView} />
      <FeaturedBrands />
      <ProductRail eyebrow="নারী ফ্যাশন" title="ফ্যাশন কালেকশন" subtitle="আজকের জন্য বাছাই করা ফ্যাশন" products={fashionPicks} viewAllTo="/categories/fashion" onQuickView={setQuickView} dark />
      <ProductRail eyebrow="বিউটি ও জুয়েলারি" title="বিউটি ও জুয়েলারি" subtitle="নিজেকে সাজিয়ে তুলুন প্রতিদিন" products={beautyPicks} viewAllTo="/categories/beauty" onQuickView={setQuickView} />
      <ProductRail eyebrow="আপনার জন্য বাছাই" title="সুপারিশকৃত পণ্য" subtitle="আপনার পছন্দ অনুযায়ী সাজানো" products={recommended} viewAllTo="/shop" onQuickView={setQuickView} />
      <RecentlyViewedHome onQuickView={setQuickView} />
      <CustomerReviews />
      <Newsletter />
      <InstagramGallery />
      <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />
    </>
  );
}

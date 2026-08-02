import { Link } from 'react-router-dom';
import { Zap, ArrowRight } from 'lucide-react';
import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/ui/ProductCard';
import { CountdownTimer } from '@/components/ui/CountdownTimer';
import { FadeIn } from '@/components/ui/FadeIn';
import { useLanguage } from '@/context/LanguageContext';

export function FlashSale({ products, onQuickView }: { products: Product[]; onQuickView?: (p: Product) => void }) {
  const target = Date.now() + 1000 * 60 * 60 * 26;
  const { t } = useLanguage();

  return (
    <section className="section-y bg-gradient-to-br from-primary via-primary to-primary-hover">
      <div className="container-app">
        <FadeIn className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-9">
          <div className="text-white">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] bg-white/15 rounded-full px-3 py-1.5">
              <Zap size={14} /> {t('ফ্ল্যাশ সেল')}
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl text-white">{t('অফার শীঘ্রই শেষ হচ্ছে')}</h2>
          </div>
          <CountdownTimer target={target} light />
        </FadeIn>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((p, i) => (
            <FadeIn key={p.id} delay={i * 60} className="h-full">
              <ProductCard product={p} onQuickView={onQuickView} />
            </FadeIn>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link to="/shop" className="inline-flex items-center gap-1.5 rounded-full bg-white text-primary px-6 py-3 font-semibold hover:-translate-y-0.5 transition-transform shadow-lift">
            {t('সব অফার দেখুন')} <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

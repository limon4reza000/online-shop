import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import type { Product } from '@/lib/types';
import { PickCard } from '@/components/ui/PickCard';
import { FadeIn } from '@/components/ui/FadeIn';
import { useLanguage } from '@/context/LanguageContext';

export function TodaysPicks({ products }: { products: Product[] }) {
  const { t } = useLanguage();

  if (products.length === 0) return null;

  return (
    <section className="py-[2px]">
      <div className="container-app">
        <FadeIn className="flex items-end justify-between gap-4 mb-2 pt-1.5">
          <div>
            <span className="eyebrow"><Sparkles size={14} /> {t('todaysPicks.eyebrow')}</span>
            <h2 className="mt-1 flex items-center gap-2 text-lg sm:text-xl"><Sparkles size={18} className="text-primary" /> {t('todaysPicks.title')}</h2>
            <p className="mt-1 text-sm text-text-secondary">{t('todaysPicks.subtitle')}</p>
          </div>
          <Link to="/shop" className="inline-flex items-center gap-1.5 text-sm font-semibold shrink-0 text-primary hover:text-primary-hover">
            {t('common.viewAll')} <ArrowRight size={15} />
          </Link>
        </FadeIn>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 border-t border-l border-border">
          {products.map((p, i) => (
            <FadeIn key={p.id} delay={i * 50} className="h-full">
              <PickCard product={p} />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

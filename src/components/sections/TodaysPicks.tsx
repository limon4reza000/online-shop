import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import type { Product } from '@/lib/types';
import { PickCard } from '@/components/ui/PickCard';
import { FadeIn } from '@/components/ui/FadeIn';
import { useLanguage } from '@/context/LanguageContext';

export function TodaysPicks({ products }: { products: Product[] }) {
  const { t } = useLanguage();

  return (
    <section className="section-y">
      <div className="container-app">
        <FadeIn className="flex items-end justify-between gap-4 mb-8">
          <div>
            <span className="eyebrow"><Sparkles size={14} /> {t('আজকের বাছাই')}</span>
            <h2 className="mt-3 text-3xl sm:text-4xl">Today's Picks</h2>
            <p className="mt-2 text-sm text-text-secondary">{t('আমাদের টিমের হাতে বাছাই করা আজকের সেরা পণ্য')}</p>
          </div>
          <Link to="/shop" className="inline-flex items-center gap-1.5 text-sm font-semibold shrink-0 text-primary hover:text-primary-hover">
            {t('সব দেখুন')} <ArrowRight size={15} />
          </Link>
        </FadeIn>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 border-t border-l border-border">
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

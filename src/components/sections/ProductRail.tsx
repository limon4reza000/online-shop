import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/ui/ProductCard';
import { FadeIn } from '@/components/ui/FadeIn';
import { useLanguage } from '@/context/LanguageContext';

export function ProductRail({
  eyebrow,
  title,
  subtitle,
  products,
  viewAllTo,
  onQuickView,
  dark = false,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllTo?: string;
  onQuickView?: (p: Product) => void;
  dark?: boolean;
}) {
  const { t } = useLanguage();

  return (
    <section className={`section-y ${dark ? 'bg-text-primary text-white' : ''}`}>
      <div className="container-app">
        <FadeIn className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className={`eyebrow ${dark ? 'text-primary' : ''}`}>{t(eyebrow)}</span>
            <h2 className={`mt-3 text-3xl sm:text-4xl ${dark ? 'text-white' : ''}`}>{t(title)}</h2>
            {subtitle && <p className={`mt-2 text-sm ${dark ? 'text-white/70' : 'text-text-secondary'}`}>{t(subtitle)}</p>}
          </div>
          {viewAllTo && (
            <Link to={viewAllTo} className={`inline-flex items-center gap-1.5 text-sm font-semibold shrink-0 ${dark ? 'text-white hover:text-primary' : 'text-primary hover:text-primary-hover'}`}>
              {t('সব দেখুন')} <ArrowRight size={15} />
            </Link>
          )}
        </FadeIn>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((p, i) => (
            <FadeIn key={p.id} delay={i * 60} className="h-full">
              <ProductCard product={p} onQuickView={onQuickView} />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

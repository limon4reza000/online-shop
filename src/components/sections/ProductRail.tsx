import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/ui/ProductCard';
import { FadeIn } from '@/components/ui/FadeIn';
import { useLanguage } from '@/context/LanguageContext';

/** `eyebrow`/`title`/`subtitle` are already-resolved display strings — the caller
 * decides whether each one comes from a translation key (static section heading)
 * or raw database content (e.g. a category name), since only the caller knows which. */
export function ProductRail({
  eyebrow,
  title,
  icon,
  subtitle,
  products,
  viewAllTo,
  onQuickView,
  dark = false,
}: {
  eyebrow: string;
  title: string;
  icon?: ReactNode;
  subtitle?: string;
  products: Product[];
  viewAllTo?: string;
  onQuickView?: (p: Product) => void;
  dark?: boolean;
}) {
  const { t } = useLanguage();

  if (products.length === 0) return null;

  return (
    <section className={`py-[2px] ${dark ? 'bg-text-primary text-white' : ''}`}>
      <div className="container-app">
        <FadeIn className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2 pt-1.5">
          <div>
            <span className={`eyebrow ${dark ? 'text-primary' : ''}`}>{eyebrow}</span>
            <h2 className={`mt-1 flex items-center gap-2 text-lg sm:text-xl ${dark ? 'text-white' : ''}`}>
              {icon && <span className="text-primary [&_svg]:h-[18px] [&_svg]:w-[18px]">{icon}</span>} {title}
            </h2>
            {subtitle && <p className={`mt-1 text-sm ${dark ? 'text-white/70' : 'text-text-secondary'}`}>{subtitle}</p>}
          </div>
          {viewAllTo && (
            <Link to={viewAllTo} className={`inline-flex items-center gap-1.5 text-sm font-semibold shrink-0 ${dark ? 'text-white hover:text-primary' : 'text-primary hover:text-primary-hover'}`}>
              {t('common.viewAll')} <ArrowRight size={15} />
            </Link>
          )}
        </FadeIn>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {products.map((p, i) => (
            <FadeIn key={p.id} delay={i * 60} className="h-full">
              <ProductCard product={p} onQuickView={onQuickView} bordered={false} />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

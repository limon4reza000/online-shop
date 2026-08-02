import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { brands } from '@/lib/data';
import { FadeIn } from '@/components/ui/FadeIn';
import { useLanguage } from '@/context/LanguageContext';

const brandLogo = (seed: string) => `https://picsum.photos/seed/brand-${seed}/120/120`;

export function FeaturedBrands() {
  const { t } = useLanguage();

  return (
    <section className="py-12 border-y border-border bg-surface">
      <div className="container-app">
        <FadeIn className="flex items-end justify-between gap-4 mb-7">
          <div>
            <span className="eyebrow">{t('যাদের আস্থা পেয়েছি')}</span>
            <h2 className="mt-2 text-2xl sm:text-3xl">{t('বিশেষ ব্র্যান্ড')}</h2>
          </div>
          <Link to="/shop" className="inline-flex items-center gap-1.5 text-sm font-semibold shrink-0 text-primary hover:text-primary-hover">
            {t('সব ব্র্যান্ড')} <ArrowRight size={15} />
          </Link>
        </FadeIn>

        <div className="flex items-start gap-6 sm:gap-8 overflow-x-auto no-scrollbar pb-1">
          {brands.map((b) => (
            <Link key={b} to="/shop" className="group flex flex-col items-center gap-2 shrink-0">
              <span className="h-16 w-16 sm:h-18 sm:w-18 rounded-full overflow-hidden border border-border shadow-soft group-hover:border-primary group-hover:shadow-card transition-all">
                <img src={brandLogo(b)} alt={b} className="h-full w-full object-cover" />
              </span>
              <span className="text-xs font-semibold text-text-primary group-hover:text-primary transition-colors text-center max-w-20 line-clamp-1">
                {b}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

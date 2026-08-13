import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useBrands } from '@/hooks/useBrands';
import { FadeIn } from '@/components/ui/FadeIn';
import { useLanguage } from '@/context/LanguageContext';
import { useMediaQuery } from '@/hooks/useMediaQuery';

// Below this many brands, a single set already fills the row comfortably — duplicating it
// for the scroll loop would just look like the same handful of logos repeating twice.
// Only once there are enough brands to actually need scrolling do we loop the content.
// Mobile has much less horizontal room, so it needs the loop far sooner than desktop.
const MARQUEE_THRESHOLD_DESKTOP = 8;
const MARQUEE_THRESHOLD_MOBILE = 3;

export function FeaturedBrands() {
  const { t } = useLanguage();
  const { data: brands = [] } = useBrands({ featured: true });
  const isMobile = useMediaQuery('(max-width: 639px)');

  if (brands.length === 0) return null;

  const threshold = isMobile ? MARQUEE_THRESHOLD_MOBILE : MARQUEE_THRESHOLD_DESKTOP;
  const shouldScroll = brands.length > threshold;
  const items = shouldScroll ? [...brands, ...brands] : brands;

  return (
    <section className="py-6 sm:py-8">
      <div className="container-app">
        <FadeIn className="flex items-end justify-between gap-4 mb-5">
          <div>
            <span className="eyebrow">{t('featuredBrands.eyebrow')}</span>
            <h2 className="mt-1 text-xl sm:text-2xl">{t('featuredBrands.title')}</h2>
          </div>
          <Link to="/shop" className="inline-flex items-center gap-1.5 text-sm font-semibold shrink-0 text-primary hover:text-primary-hover">
            {t('featuredBrands.viewAll')} <ArrowRight size={15} />
          </Link>
        </FadeIn>

        {/* Content is duplicated back-to-back only when scrolling, so translateX(-50%) loops with no visible seam. */}
        <div className={shouldScroll ? 'group overflow-hidden' : 'overflow-x-auto no-scrollbar'}>
          <div
            className={
              shouldScroll
                ? 'flex w-max animate-marquee group-hover:[animation-play-state:paused] py-3'
                : 'flex flex-nowrap justify-start sm:justify-center w-max sm:w-full mx-auto py-3'
            }
          >
            {items.map((b, i) => (
              <Link
                key={`${b.id}-${i}`}
                to={`/brand/${b.slug}`}
                aria-label={b.name}
                className="group/logo flex flex-col items-center gap-2 shrink-0 px-8 sm:px-12"
              >
                <span className="grid place-items-center h-16 w-16 sm:h-18 sm:w-18 rounded-full bg-white border-2 border-border shadow-soft overflow-hidden transition-colors duration-300 group-hover/logo:border-primary group-hover/logo:shadow-card">
                  <img
                    src={b.logoUrl || `https://picsum.photos/seed/brand-${b.slug}/160/80`}
                    alt={b.name}
                    className="h-full w-full object-cover"
                  />
                </span>
                <span className="text-xs text-text-secondary text-center whitespace-nowrap group-hover/logo:text-primary transition-colors">
                  {b.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

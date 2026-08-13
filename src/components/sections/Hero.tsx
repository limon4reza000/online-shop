import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { ArrowRight, ShieldCheck, BadgePercent, Headset, Wand2, Zap } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const slides = [
  { key: 'hero.slides.0', image: 'https://picsum.photos/seed/hero-main/900/900' },
  { key: 'hero.slides.1', image: 'https://picsum.photos/seed/hero-second/900/900' },
  { key: 'hero.slides.2', image: 'https://picsum.photos/seed/hero-third/900/900' },
];

const features = [
  { icon: ShieldCheck, key: 'hero.features.trustedQuality' },
  { icon: Zap, key: 'hero.features.bestTaste' },
  { icon: BadgePercent, key: 'hero.features.premiumQuality' },
  { icon: Headset, key: 'hero.features.madeWithLove' },
];

export function Hero() {
  const [paginationEl, setPaginationEl] = useState<HTMLDivElement | null>(null);
  const { t } = useLanguage();

  return (
    <section className="pt-1 sm:pt-2 pb-5">
      <div className="container-app">
        <div className="relative overflow-hidden rounded-xl shadow-lift">
          {paginationEl && (
          <Swiper
            modules={[Autoplay, Pagination]}
            autoplay={{ delay: 6000, disableOnInteraction: false }}
            pagination={{ clickable: true, el: paginationEl }}
            speed={600}
            loop
            className="relative hero-swiper"
          >
            {slides.map((slide, i) => (
              <SwiperSlide key={i}>
                <div className="relative bg-linear-to-br from-primary-light via-primary-light to-surface">
                  <div className="relative grid lg:grid-cols-2 items-center gap-6 px-6 sm:px-10 py-6 sm:py-8 pb-11">
                    <div className="fade-up text-center lg:text-left">
                      <span className="inline-grid place-items-center h-9 w-9 rounded-full bg-white text-primary shadow-soft mb-2">
                        <Wand2 size={16} />
                      </span>
                      <div className="flex items-center justify-center lg:justify-start gap-3 text-text-primary/70 text-sm font-semibold">
                        <span className="h-px w-6 bg-text-primary/30" /> {t(`${slide.key}.eyebrow`)} <span className="h-px w-6 bg-text-primary/30" />
                      </div>
                      <h1 className="mt-1 leading-none">
                        <span className="block text-2xl sm:text-3xl font-semibold text-text-primary">{t(`${slide.key}.titleSmall`)}</span>
                        <span className="font-display italic block text-4xl sm:text-5xl lg:text-6xl font-bold text-primary mt-1">{t(`${slide.key}.titleAccent`)}</span>
                      </h1>
                      <p className="mt-4 text-text-secondary text-sm sm:text-base max-w-md mx-auto lg:mx-0">{t(`${slide.key}.description`)}</p>

                      <div className="mt-5 hidden sm:flex flex-wrap justify-center lg:justify-start gap-x-5 gap-y-3">
                        {features.map((f) => (
                          <span key={f.key} className="flex flex-col items-center gap-1.5 w-16">
                            <span className="grid place-items-center h-11 w-11 rounded-full bg-white text-primary shadow-soft"><f.icon size={17} /></span>
                            <span className="text-[11px] font-medium text-text-primary text-center leading-tight">{t(f.key)}</span>
                          </span>
                        ))}
                      </div>

                      <Link to="/shop" className="btn-primary mt-6 inline-flex">
                        {t('hero.shopNow')} <ArrowRight size={16} />
                      </Link>
                    </div>

                    <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
                      <div className="relative h-56 sm:h-64 lg:h-64 rounded-2xl overflow-hidden shadow-lift">
                        <img src={slide.image} alt={t(`${slide.key}.titleAccent`)} className="h-full w-full object-cover" />
                      </div>
                      <span className="absolute -bottom-4 -right-4 h-24 w-24 animate-float">
                        <span className="absolute inset-0 rounded-full bg-primary/50 animate-ping-slow" />
                        <span className="absolute inset-0 grid place-items-center rounded-full bg-linear-to-br from-primary via-primary-hover to-primary ring-4 ring-white shadow-lift">
                          <span className="flex flex-col items-center justify-center -rotate-3">
                            <span className="font-display italic font-black text-lg text-white leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]">
                              {t('hero.fastLabel')}
                            </span>
                            <span className="mt-0.5 h-px w-8 bg-yellow-300/70" />
                            <span className="mt-0.5 font-display italic font-black text-lg text-yellow-300 leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]">
                              {t('hero.deliveryLabel')}
                            </span>
                          </span>
                        </span>
                      </span>
                    </div>
                  </div>

                  <svg className="absolute bottom-0 left-0 w-full text-primary" viewBox="0 0 1200 40" preserveAspectRatio="none" fill="currentColor">
                    <path d="M0,20 C300,45 900,-5 1200,20 L1200,40 L0,40 Z" />
                  </svg>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          )}
        </div>
        <div ref={setPaginationEl} className="hero-pagination mt-2 flex items-center justify-center gap-1" />
      </div>
    </section>
  );
}

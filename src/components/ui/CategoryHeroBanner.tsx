import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';

const DEFAULT_BANNERS = [
  'https://picsum.photos/seed/category-default-banner-1/1600/600',
  'https://picsum.photos/seed/category-default-banner-2/1600/600',
  'https://picsum.photos/seed/category-default-banner-3/1600/600',
];

/**
 * Clean, text-free promotional banner shown at the top of every subcategory
 * page — like the Home page's Hero, it auto-slides between images every 2s
 * with the same dot pagination below the image, but unlike Home it never
 * carries headings, buttons, or overlays on the image itself: just the
 * images the admin uploaded for that subcategory, or a default set otherwise.
 */
export function CategoryHeroBanner({ images, alt }: { images?: string[]; alt: string }) {
  const [paginationEl, setPaginationEl] = useState<HTMLDivElement | null>(null);
  const slides = images && images.length > 0 ? images : DEFAULT_BANNERS;

  return (
    <section className="pt-1 sm:pt-2 pb-5">
      <div className="container-app">
        <div className="relative overflow-hidden rounded-xl shadow-lift h-48 sm:h-72 lg:h-96">
          {slides.length > 1 ? (
            paginationEl && (
              <Swiper
                modules={[Autoplay, Pagination]}
                autoplay={{ delay: 2000, disableOnInteraction: false }}
                pagination={{ clickable: true, el: paginationEl }}
                speed={700}
                loop
                className="h-full w-full"
              >
                {slides.map((src, i) => (
                  <SwiperSlide key={`${src}-${i}`}>
                    <img src={src} alt={alt} className="h-full w-full object-cover" />
                  </SwiperSlide>
                ))}
              </Swiper>
            )
          ) : (
            <img src={slides[0]} alt={alt} className="h-full w-full object-cover" />
          )}
        </div>
        {slides.length > 1 && (
          <div ref={setPaginationEl} className="hero-pagination mt-2 flex items-center justify-center gap-1" />
        )}
      </div>
    </section>
  );
}

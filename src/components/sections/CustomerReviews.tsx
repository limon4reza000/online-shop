import { Quote } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { testimonials } from '@/lib/data';
import { Rating } from '@/components/ui/Rating';
import { FadeIn } from '@/components/ui/FadeIn';

export function CustomerReviews() {
  return (
    <section className="section-y">
      <div className="container-app">
        <FadeIn className="text-center max-w-xl mx-auto mb-10">
          <span className="eyebrow justify-center">অভিজ্ঞতা</span>
          <h2 className="mt-3 text-3xl sm:text-4xl">আমাদের গ্রাহকদের ভালোবাসা</h2>
        </FadeIn>

        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={20}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          breakpoints={{
            0: { slidesPerView: 1 },
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 4 },
          }}
          className="pb-12!"
        >
          {testimonials.map((t) => (
            <SwiperSlide key={t.id}>
              <div className="card-surface p-6 h-full flex flex-col hover:shadow-lift hover:-translate-y-1">
                <Quote className="text-primary/30" size={28} />
                <Rating value={t.rating} size={13} />
                <p className="mt-3 text-sm text-text-secondary leading-relaxed flex-1">{t.body}</p>
                <div className="mt-5 flex items-center gap-3">
                  <img src={t.avatar} alt={t.author} className="h-10 w-10 rounded-full object-cover" />
                  <span className="text-sm font-semibold">{t.author}</span>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Play, Heart } from 'lucide-react';
import { products } from '@/lib/data';
import { FadeIn } from '@/components/ui/FadeIn';

const reels = products.slice(4, 12);

export function ReelsSection() {
  return (
    <section className="section-y">
      <div className="container-app">
        <FadeIn className="flex items-end justify-between gap-4 mb-8">
          <div>
            <span className="eyebrow">স্টাইল রিলস</span>
            <h2 className="mt-3 text-3xl sm:text-4xl">ঘুরিয়ে দেখুন, পছন্দ করুন</h2>
            <p className="mt-2 text-sm text-text-secondary">শর্ট-ফর্ম স্টাইল ইন্সপিরেশন থেকে সরাসরি পণ্যে যান</p>
          </div>
        </FadeIn>

        <Swiper
          spaceBetween={16}
          slidesPerView={2.3}
          breakpoints={{
            640: { slidesPerView: 3.3 },
            1024: { slidesPerView: 5.3 },
          }}
          className="!pb-2"
        >
          {reels.map((p) => (
            <SwiperSlide key={p.id}>
              <Link to={`/product/${p.slug}`} className="group relative block overflow-hidden rounded-3xl aspect-[9/16] shadow-soft hover:shadow-lift transition-all duration-300">
                <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-text-primary/80 via-transparent to-text-primary/10" />
                <span className="absolute top-3 right-3 grid place-items-center h-9 w-9 rounded-full bg-white/25 backdrop-blur text-white group-hover:bg-primary transition-colors">
                  <Heart size={15} />
                </span>
                <span className="absolute inset-0 grid place-items-center opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-transform">
                  <span className="grid place-items-center h-12 w-12 rounded-full bg-white/25 backdrop-blur text-white">
                    <Play size={20} fill="white" />
                  </span>
                </span>
                <div className="absolute bottom-0 left-0 right-0 p-3.5 text-white">
                  <p className="text-xs font-semibold line-clamp-1">{p.name}</p>
                  <p className="text-[11px] opacity-80">{p.brand}</p>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

import { InstagramIcon } from '@/components/ui/SocialIcons';
import { instagramImages } from '@/lib/data';
import { FadeIn } from '@/components/ui/FadeIn';

export function InstagramGallery() {
  return (
    <section className="section-y pt-0">
      <div className="container-app">
        <FadeIn className="text-center max-w-xl mx-auto mb-10">
          <span className="eyebrow justify-center"><InstagramIcon size={14} /> @nityaghor.shop</span>
          <h2 className="mt-3 text-3xl sm:text-4xl">আমাদের ইনস্টাগ্রাম থেকে কিনুন</h2>
        </FadeIn>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
          {instagramImages.map((src, i) => (
            <FadeIn key={i} delay={i * 60}>
              <a href="#" className="group relative block overflow-hidden rounded-2xl aspect-square">
                <img src={src} alt="ইনস্টাগ্রাম পোস্ট" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/40 transition-colors flex items-center justify-center">
                  <InstagramIcon className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={22} />
                </div>
              </a>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

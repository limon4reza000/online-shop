import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { FadeIn } from '@/components/ui/FadeIn';
import { mainCategories } from '@/lib/data';

export default function Categories() {
  return (
    <>
      <PageHeader title="ক্যাটাগরি" subtitle="আপনার জন্য বিশেষভাবে সাজানো আমাদের কিউরেটেড সংগ্রহ দেখুন।" crumbs={[{ label: 'ক্যাটাগরি' }]} />
      <div className="container-app section-y">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mainCategories.map((cat, i) => (
            <FadeIn key={cat.id} delay={i * 70}>
              <Link to={`/categories/${cat.slug}`} className="group block relative overflow-hidden rounded-3xl aspect-[4/3] shadow-soft hover:shadow-lift transition-all duration-300">
                <img src={cat.image} alt={cat.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-text-primary/80 via-text-primary/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <p className="text-3xl">{cat.icon}</p>
                  <p className="text-2xl font-display font-bold mt-1">{cat.name}</p>
                  <p className="text-sm opacity-80 mt-1">{cat.count}টি পণ্য</p>
                  <span className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-primary bg-white rounded-full px-4 py-2 group-hover:gap-2.5 transition-all">
                    এখনই দেখুন <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </>
  );
}

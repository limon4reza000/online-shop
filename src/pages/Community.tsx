import { Link } from 'react-router-dom';
import { ArrowRight, Quote } from 'lucide-react';
import { Seo } from '@/components/ui/Seo';
import { PageHeader } from '@/components/ui/PageHeader';
import { Rating } from '@/components/ui/Rating';
import { testimonials } from '@/lib/data';
import { useAuth } from '@/context/AuthContext';

export default function Community() {
  const { user } = useAuth();

  return (
    <>
      <Seo title="কমিউনিটি" description="নিত্যঘর কমিউনিটিতে যুক্ত হয়ে সদস্যদের অভিজ্ঞতা, স্টাইল টিপস ও এক্সক্লুসিভ আপডেট দেখুন।" />
      <PageHeader title="নিত্যঘর কমিউনিটিতে স্বাগতম" subtitle="হাজারো সদস্যের সাথে যুক্ত হয়ে স্টাইল টিপস, অভিজ্ঞতা এবং এক্সক্লুসিভ আপডেট শেয়ার করুন।" crumbs={[{ label: 'কমিউনিটি' }]} showBack />

      <div className="container-app section-y">
      {!user && (
        <div className="text-center">
          <Link to="/register" className="btn-primary inline-flex">
            যুক্ত হোন <ArrowRight size={16} />
          </Link>
        </div>
      )}

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {testimonials.map((t) => (
          <div key={t.id} className="card-surface p-5 flex flex-col hover:shadow-lift hover:-translate-y-1 transition-all">
            <Quote className="text-primary/30" size={22} />
            <Rating value={t.rating} size={13} />
            <p className="mt-3 text-sm text-text-secondary leading-relaxed flex-1">{t.body}</p>
            <div className="mt-4 flex items-center gap-3">
              <img src={t.avatar} alt={t.author} className="h-9 w-9 rounded-full object-cover" />
              <span className="text-sm font-semibold">{t.author}</span>
            </div>
          </div>
        ))}
      </div>
      </div>
    </>
  );
}

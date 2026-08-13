import { Sparkles, Leaf, HeartHandshake, Globe2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { FadeIn } from '@/components/ui/FadeIn';
import { CustomerReviews } from '@/components/sections/CustomerReviews';

const values = [
  { icon: Sparkles, title: 'প্রিমিয়াম মান', desc: 'প্রতিটি পণ্য অত্যন্ত যত্নসহকারে এবং প্রিমিয়াম উপকরণ দিয়ে তৈরি করা হয়।' },
  { icon: Leaf, title: 'টেকসই', desc: 'আমরা নৈতিক প্রস্তুতকারকদের সাথে অংশীদারিত্ব করি এবং দায়িত্বশীলভাবে সংগৃহীত উপকরণ ব্যবহার করি।' },
  { icon: HeartHandshake, title: 'গ্রাহক অগ্রাধিকার', desc: 'ডিজাইন থেকে ডেলিভারি পর্যন্ত, আপনার সন্তুষ্টিই আমাদের প্রতিটি কাজের মূল চালিকাশক্তি।' },
  { icon: Globe2, title: 'বিশ্বব্যাপী নাগাল', desc: '৪০টিরও বেশি দেশে দ্রুত ও নির্ভরযোগ্য ডেলিভারি সহ শিপিং সুবিধা।' },
];

export default function About() {
  return (
    <>
      <PageHeader title="আমাদের গল্প" crumbs={[{ label: 'আমাদের সম্পর্কে' }]} showBack />

      <div className="container-app section-y grid lg:grid-cols-2 gap-10 items-center">
        <FadeIn>
          <span className="eyebrow">আমরা কারা</span>
          <h2 className="mt-3 text-3xl sm:text-4xl">আধুনিক অভিজাত্যের নতুন সংজ্ঞা</h2>
          <p className="mt-4 text-text-secondary leading-relaxed">
            নিত্যঘরের যাত্রা শুরু হয়েছিল একটি সাধারণ ভাবনা থেকে — দৈনন্দিন ফ্যাশনে মান এবং সহজলভ্যতার মধ্যে কোনো আপোষ থাকা উচিত নয়।
            একটি ছোট স্টুডিও হিসেবে যাত্রা শুরু করে আজ এটি সুচিন্তিতভাবে ডিজাইন করা পোশাক ও আনুষঙ্গিক সামগ্রীর এক নির্ভরযোগ্য গন্তব্যে পরিণত হয়েছে,
            যা ৪০টিরও বেশি দেশের গ্রাহকদের আস্থা অর্জন করেছে।
          </p>
          <p className="mt-4 text-text-secondary leading-relaxed">
            আমরা সরাসরি কারিগর ও নৈতিক প্রস্তুতকারকদের সাথে কাজ করি, যাতে আপনার কাছে এমন পণ্য পৌঁছায় যা দেখতে যেমন সুন্দর, পরতেও তেমনই আরামদায়ক —
            টেকসই এবং আত্মবিশ্বাস জাগিয়ে তোলার জন্য ডিজাইন করা।
          </p>
        </FadeIn>
        <FadeIn delay={150}>
          <img src="https://picsum.photos/seed/about-story/900/700" alt="আমাদের স্টুডিও" className="rounded-3xl shadow-lift w-full object-cover aspect-[4/3]" />
        </FadeIn>
      </div>

      <div className="pt-14 sm:pt-20 pb-8 sm:pb-10 bg-white">
        <div className="container-app">
          <FadeIn className="text-center max-w-xl mx-auto mb-10">
            <span className="eyebrow justify-center">আমাদের মূল্যবোধ</span>
            <h2 className="mt-3 text-3xl sm:text-4xl">যা আমাদের এগিয়ে নিয়ে যায়</h2>
          </FadeIn>
          <div className="grid grid-cols-4 gap-3 sm:gap-5">
            {values.map((v, i) => (
              <FadeIn key={v.title} delay={i * 80}>
                <div className="card-surface p-3 sm:p-6 text-center h-full hover:shadow-lift hover:-translate-y-1">
                  <span className="grid place-items-center h-9 w-9 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-primary-light text-primary mx-auto"><v.icon size={18} /></span>
                  <h4 className="mt-2 sm:mt-4 text-xs sm:text-base font-bold">{v.title}</h4>
                  <p className="mt-2 hidden sm:block text-sm text-text-secondary">{v.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>

      <div className="container-app pt-8 sm:pt-10 pb-8 sm:pb-10">
        <div className="grid grid-cols-4 gap-3 sm:gap-6 text-center">
          {[['১৫০K+', 'সন্তুষ্ট গ্রাহক'], ['৪০+', 'দেশে সেবা প্রদান'], ['৫০০+', 'নির্বাচিত পণ্য'], ['৯', 'বছরের কারুকার্য']].map(([num, label]) => (
            <FadeIn key={label}>
              <p className="text-xl sm:text-4xl font-bold text-primary font-display">{num}</p>
              <p className="text-[11px] sm:text-sm text-text-secondary mt-1">{label}</p>
            </FadeIn>
          ))}
        </div>
      </div>

      <CustomerReviews />
    </>
  );
}

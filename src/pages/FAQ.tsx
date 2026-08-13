import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { FadeIn } from '@/components/ui/FadeIn';

const faqs = [
  { q: 'আপনাদের শিপিং নীতি কী?', a: '৭৫ ডলারের বেশি সকল অর্ডারে আমরা বিনামূল্যে স্ট্যান্ডার্ড শিপিং প্রদান করি। সাধারণত অর্ডার ৩-৭ কর্মদিবসের মধ্যে পৌঁছে যায়। চেকআউটের সময় দ্রুত শিপিংয়ের সুবিধাও পাওয়া যায়।' },
  { q: 'আপনাদের রিটার্ন নীতি কী?', a: 'মূল ট্যাগসহ অব্যবহৃত পণ্যের ক্ষেত্রে ডেলিভারির ৩০ দিনের মধ্যে আমরা রিটার্ন গ্রহণ করি। আপনার রিটার্ন পাওয়ার পর ৫-৭ কর্মদিবসের মধ্যে রিফান্ড প্রক্রিয়া সম্পন্ন হয়।' },
  { q: 'আমি কীভাবে আমার অর্ডার ট্র্যাক করব?', a: 'আপনার অর্ডার পাঠানো হলে, ইমেইলের মাধ্যমে আপনি একটি ট্র্যাকিং নম্বর পাবেন। এছাড়াও আমাদের অর্ডার ট্র্যাকিং পেজ ব্যবহার করে যেকোনো সময় আপনার অর্ডার ট্র্যাক করতে পারবেন।' },
  { q: 'আপনারা কি আন্তর্জাতিকভাবে শিপিং করেন?', a: 'হ্যাঁ, আমরা বিশ্বব্যাপী ৪০টিরও বেশি দেশে শিপিং করি। আন্তর্জাতিক শিপিং খরচ এবং ডেলিভারি সময় গন্তব্যস্থল অনুযায়ী পরিবর্তিত হয়।' },
  { q: 'আপনারা কোন কোন পেমেন্ট পদ্ধতি গ্রহণ করেন?', a: 'দ্রুত ও নিরাপদ চেকআউটের জন্য আমরা বিকাশ, নগদ, রকেট, সকল প্রধান ক্রেডিট/ডেবিট কার্ড এবং ক্যাশ অন ডেলিভারি গ্রহণ করি।' },
  { q: 'আমি কীভাবে বুঝব কোন সাইজ অর্ডার করতে হবে?', a: 'প্রতিটি পণ্যের পেজে একটি বিস্তারিত সাইজ গাইড রয়েছে। আপনি যদি দুটি সাইজের মাঝামাঝি হন, তাহলে সাধারণত আমরা আরও আরামদায়ক ফিটের জন্য বড় সাইজ নেওয়ার পরামর্শ দিই।' },
  { q: 'আমি কি আমার অর্ডার পরিবর্তন বা বাতিল করতে পারি?', a: 'অর্ডার দেওয়ার ১ ঘণ্টার মধ্যে তা পরিবর্তন বা বাতিল করা যাবে। অনুগ্রহ করে যত দ্রুত সম্ভব আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন।' },
  { q: 'আপনারা কি গিফট কার্ড অফার করেন?', a: 'হ্যাঁ! ডিজিটাল গিফট কার্ড ২৫ থেকে ৫০০ ডলার পর্যন্ত বিভিন্ন মূল্যমানে পাওয়া যায় এবং এর কোনো মেয়াদ শেষ হয় না।' },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <>
      <PageHeader title="সচরাচর জিজ্ঞাসিত প্রশ্ন" crumbs={[{ label: 'সচরাচর প্রশ্ন' }]} showBack />
      <div className="container-app section-y max-w-3xl">
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <FadeIn key={f.q} delay={i * 40}>
              <div className="card-surface overflow-hidden">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left"
                >
                  <span className="font-semibold text-sm sm:text-base">{f.q}</span>
                  <ChevronDown size={18} className={`shrink-0 transition-transform text-primary ${open === i ? 'rotate-180' : ''}`} />
                </button>
                <div
                  className="grid transition-all duration-300 ease-out"
                  style={{ gridTemplateRows: open === i ? '1fr' : '0fr' }}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm text-text-secondary leading-relaxed">{f.a}</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </>
  );
}

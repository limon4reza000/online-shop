import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { FadeIn } from '@/components/ui/FadeIn';
import { useToast } from '@/context/ToastContext';

const info = [
  { icon: MapPin, title: 'আমাদের ঠিকানা', body: '21 Bloom Avenue, New York, NY 10001' },
  { icon: Phone, title: 'আমাদের কল করুন', body: '+1 (800) 555-0192' },
  { icon: Mail, title: 'আমাদের ইমেইল করুন', body: 'hello@nityaghor.com' },
  { icon: Clock, title: 'কর্ম সময়', body: 'সোম–শুক্র: সকাল ৯টা – সন্ধ্যা ৬টা EST' },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const { showToast } = useToast();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('বার্তা পাঠানো হয়েছে! আমরা ২৪ ঘণ্টার মধ্যে আপনার সাথে যোগাযোগ করব।', 'success');
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <>
      <PageHeader title="যোগাযোগ করুন" subtitle="আমরা আপনার কথা শুনতে চাই। যেকোনো প্রশ্ন নিয়ে যোগাযোগ করুন।" crumbs={[{ label: 'যোগাযোগ' }]} showBack />

      <div className="container-app section-y grid lg:grid-cols-[1fr_1.3fr] gap-10">
        <FadeIn className="space-y-4">
          {info.map((i) => (
            <div key={i.title} className="card-surface p-5 flex items-start gap-4">
              <span className="grid place-items-center h-11 w-11 rounded-xl bg-primary-light text-primary shrink-0"><i.icon size={19} /></span>
              <div>
                <p className="font-semibold text-sm">{i.title}</p>
                <p className="text-sm text-text-secondary mt-0.5">{i.body}</p>
              </div>
            </div>
          ))}
          <div className="rounded-2xl overflow-hidden aspect-video border border-border">
            <img src="https://picsum.photos/seed/contact-map/700/400" alt="মানচিত্রে অবস্থান" className="h-full w-full object-cover" />
          </div>
        </FadeIn>

        <FadeIn delay={120} className="card-surface p-6 sm:p-8">
          <h3 className="text-lg font-bold mb-5">আমাদের একটি বার্তা পাঠান</h3>
          <form onSubmit={submit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <label className="block">
                <span className="text-sm font-medium mb-1.5 block">আপনার নাম</span>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
              </label>
              <label className="block">
                <span className="text-sm font-medium mb-1.5 block">ইমেইল</span>
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" />
              </label>
            </div>
            <label className="block">
              <span className="text-sm font-medium mb-1.5 block">বিষয়</span>
              <input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="input-field" />
            </label>
            <label className="block">
              <span className="text-sm font-medium mb-1.5 block">বার্তা</span>
              <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="input-field resize-none" />
            </label>
            <button type="submit" className="btn-primary">বার্তা পাঠান <Send size={15} /></button>
          </form>
        </FadeIn>
      </div>
    </>
  );
}

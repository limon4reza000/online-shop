import { useState } from 'react';
import { Mail } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { FadeIn } from '@/components/ui/FadeIn';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const { showToast } = useToast();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    showToast('সাবস্ক্রাইব সম্পন্ন হয়েছে! স্বাগত উপহারের জন্য আপনার ইনবক্স দেখুন 🎁', 'success');
    setEmail('');
  };

  return (
    <section className="section-y">
      <div className="container-app">
        <FadeIn className="relative overflow-hidden rounded-[28px] bg-text-primary px-6 sm:px-14 py-14 text-center">
          <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative">
            <span className="grid place-items-center h-12 w-12 rounded-2xl bg-primary/20 text-primary mx-auto">
              <Mail size={22} />
            </span>
            <h2 className="mt-5 text-3xl sm:text-4xl text-white">প্রথম অর্ডারে পান ১০% ছাড়</h2>
            <p className="mt-3 text-white/70 max-w-md mx-auto">একচেটিয়া অফার, নতুন পণ্য এবং স্টাইল অনুপ্রেরণা সরাসরি আপনার ইনবক্সে পেতে সাবস্ক্রাইব করুন।</p>
            <form onSubmit={submit} className="mt-7 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="আপনার ইমেইল ঠিকানা দিন"
                className="input-field bg-white/95 border-transparent flex-1"
              />
              <button type="submit" className="btn-primary shrink-0">সাবস্ক্রাইব করুন</button>
            </form>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

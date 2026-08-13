import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowLeft, MailCheck, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

const schema = z.object({ email: z.string().email('সঠিক ইমেইল ঠিকানা লিখুন') });
type FormData = z.infer<typeof schema>;

export default function ForgotPassword() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState('');
  const { showToast } = useToast();

  const onSubmit = async (data: FormData) => {
    try {
      await api.post('/auth/forgot-password', { email: data.email });
      setEmail(data.email);
      setSent(true);
    } catch {
      showToast('অনুরোধ পাঠানো যায়নি, আবার চেষ্টা করুন', 'error');
    }
  };

  return (
    <div className="container-app section-y">
      <div className="max-w-md mx-auto card-surface p-8 sm:p-10 text-center">
        {!sent ? (
          <>
            <h1 className="text-3xl">পাসওয়ার্ড ভুলে গেছেন?</h1>
            <p className="mt-2 text-sm text-text-secondary">আপনার ইমেইল লিখুন, আমরা পাসওয়ার্ড রিসেট করার একটি লিংক পাঠিয়ে দেব।</p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-7 text-left">
              <label className="block">
                <span className="text-sm font-medium mb-1.5 block">ইমেইল</span>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
                  <input {...register('email')} type="email" placeholder="you@example.com" className="input-field pl-9" />
                </div>
                {errors.email && <span className="text-xs text-error mt-1 block">{errors.email.message}</span>}
              </label>
              <button type="submit" disabled={isSubmitting} className="btn-primary w-full disabled:opacity-60">
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'রিসেট লিংক পাঠান'}
              </button>
            </form>
          </>
        ) : (
          <div className="animate-fade-in">
            <div className="mx-auto grid place-items-center h-16 w-16 rounded-full bg-success/10">
              <MailCheck size={28} className="text-success" />
            </div>
            <h1 className="mt-5 text-2xl">আপনার ইনবক্স দেখুন</h1>
            <p className="mt-2 text-sm text-text-secondary">আমরা <span className="font-semibold text-text-primary">{email}</span>-এ একটি পাসওয়ার্ড রিসেট লিংক পাঠিয়েছি</p>
          </div>
        )}
        <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-primary font-semibold mt-7 hover:underline">
          <ArrowLeft size={14} /> লগইনে ফিরে যান
        </Link>
      </div>
    </div>
  );
}

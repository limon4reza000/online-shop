import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Eye, EyeOff, Loader2, ShieldAlert, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { Seo } from '@/components/ui/Seo';

const schema = z.object({
  password: z.string().min(6, 'কমপক্ষে ৬ অক্ষর দিন'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'পাসওয়ার্ড দুটি মিলছে না',
  path: ['confirmPassword'],
});
type FormData = z.infer<typeof schema>;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });
  const [showPw, setShowPw] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const onSubmit = async (data: FormData) => {
    try {
      await api.post('/auth/reset-password', { token, password: data.password });
      showToast('পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে — এখন সাইন ইন করুন', 'success');
      navigate('/login');
    } catch {
      showToast('লিংকটি অবৈধ অথবা মেয়াদোত্তীর্ণ, আবার চেষ্টা করুন', 'error');
    }
  };

  if (!token) {
    return (
      <div className="container-app section-y">
        <div className="max-w-md mx-auto card-surface p-8 sm:p-10 text-center">
          <div className="mx-auto grid place-items-center h-16 w-16 rounded-full bg-error/10">
            <ShieldAlert size={28} className="text-error" />
          </div>
          <h1 className="mt-5 text-2xl">অবৈধ রিসেট লিংক</h1>
          <p className="mt-2 text-sm text-text-secondary">এই লিংকটি সঠিক নয়। আবার পাসওয়ার্ড রিসেট করার অনুরোধ করুন।</p>
          <Link to="/forgot-password" className="btn-primary mt-7 inline-flex">পাসওয়ার্ড রিসেট করুন</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-app section-y">
      <Seo title="পাসওয়ার্ড রিসেট করুন" />
      <div className="max-w-md mx-auto card-surface p-8 sm:p-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl">নতুন পাসওয়ার্ড সেট করুন</h1>
          <p className="mt-2 text-sm text-text-secondary">আপনার অ্যাকাউন্টের জন্য একটি নতুন পাসওয়ার্ড লিখুন।</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <label className="block">
            <span className="text-sm font-medium mb-1.5 block">নতুন পাসওয়ার্ড</span>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input {...register('password')} type={showPw ? 'text' : 'password'} placeholder="••••••••" className="input-field pl-9 pr-10" />
              <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <span className="text-xs text-error mt-1 block">{errors.password.message}</span>}
          </label>

          <label className="block">
            <span className="text-sm font-medium mb-1.5 block">পাসওয়ার্ড নিশ্চিত করুন</span>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input {...register('confirmPassword')} type={showPw ? 'text' : 'password'} placeholder="••••••••" className="input-field pl-9" />
            </div>
            {errors.confirmPassword && <span className="text-xs text-error mt-1 block">{errors.confirmPassword.message}</span>}
          </label>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full disabled:opacity-60">
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'পাসওয়ার্ড পরিবর্তন করুন'}
          </button>
        </form>

        <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-primary font-semibold mt-7 hover:underline">
          <ArrowLeft size={14} /> লগইনে ফিরে যান
        </Link>
      </div>
    </div>
  );
}

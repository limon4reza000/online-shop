import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Seo } from '@/components/ui/Seo';
import { SocialLoginButtons } from '@/components/ui/SocialLoginButtons';

const schema = z.object({
  email: z.string().email('সঠিক ইমেইল ঠিকানা লিখুন'),
  password: z.string().min(6, 'কমপক্ষে ৬ অক্ষর দিন'),
});
type FormData = z.infer<typeof schema>;

export default function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });
  const [showPw, setShowPw] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password);
      navigate(from || '/dashboard');
    } catch {
      showToast('ভুল ইমেইল অথবা পাসওয়ার্ড', 'error');
    }
  };

  return (
    <div className="container-app section-y">
      <Seo title="সাইন ইন" description="অর্ডার ট্র্যাক করতে, উইশলিস্ট পরিচালনা করতে এবং দ্রুত চেকআউট করতে আপনার নিত্যঘর অ্যাকাউন্টে সাইন ইন করুন।" />
      <div className="max-w-md mx-auto card-surface p-8 sm:p-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl">আবার স্বাগতম</h1>
          <p className="mt-2 text-sm text-text-secondary">আপনার অ্যাকাউন্টে যেতে সাইন ইন করুন।</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <label className="block">
            <span className="text-sm font-medium mb-1.5 block">ইমেইল</span>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input {...register('email')} type="email" placeholder="you@example.com" className="input-field pl-9" />
            </div>
            {errors.email && <span className="text-xs text-error mt-1 block">{errors.email.message}</span>}
          </label>

          <label className="block">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium">পাসওয়ার্ড</span>
              <Link to="/forgot-password" className="text-xs text-primary font-semibold hover:underline">পাসওয়ার্ড ভুলে গেছেন?</Link>
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input {...register('password')} type={showPw ? 'text' : 'password'} placeholder="••••••••" className="input-field pl-9 pr-10" />
              <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <span className="text-xs text-error mt-1 block">{errors.password.message}</span>}
          </label>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full disabled:opacity-60">
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'সাইন ইন'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-text-secondary">অথবা</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <SocialLoginButtons />

        <p className="text-center text-sm text-text-secondary mt-7">
          অ্যাকাউন্ট নেই? <Link to="/register" className="text-primary font-semibold hover:underline">সাইন আপ করুন</Link>
        </p>
      </div>
    </div>
  );
}

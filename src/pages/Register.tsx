import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Seo } from '@/components/ui/Seo';
import { SocialLoginButtons } from '@/components/ui/SocialLoginButtons';

const schema = z.object({
  name: z.string().min(2, 'আপনার পুরো নাম লিখুন'),
  email: z.string().email('সঠিক ইমেইল ঠিকানা লিখুন'),
  password: z.string().min(6, 'কমপক্ষে ৬ অক্ষর দিন'),
  confirmPassword: z.string(),
  agree: z.boolean().refine((v) => v, 'শর্তাবলীতে সম্মত হতে হবে'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'পাসওয়ার্ড দুটি মিলছে না',
  path: ['confirmPassword'],
});
type FormData = z.infer<typeof schema>;

export default function Register() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });
  const [showPw, setShowPw] = useState(false);
  const { register: doRegister } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const onSubmit = async (data: FormData) => {
    try {
      await doRegister(data.name, data.email, data.password);
      navigate('/verify-email');
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      showToast(message || 'অ্যাকাউন্ট তৈরি করা যায়নি, আবার চেষ্টা করুন', 'error');
    }
  };

  return (
    <div className="container-app section-y">
      <Seo title="অ্যাকাউন্ট তৈরি করুন" description="এক্সক্লুসিভ সুবিধা, অফার এবং দ্রুত চেকআউটের জন্য নিত্যঘরে যুক্ত হোন।" />
      <div className="max-w-md mx-auto card-surface p-8 sm:p-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl">অ্যাকাউন্ট তৈরি করুন</h1>
          <p className="mt-2 text-sm text-text-secondary">এক্সক্লুসিভ সুবিধা ও অফারের জন্য নিত্যঘরে যুক্ত হোন।</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <label className="block">
            <span className="text-sm font-medium mb-1.5 block">পুরো নাম</span>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input {...register('name')} placeholder="জেন ডো" className="input-field pl-9" />
            </div>
            {errors.name && <span className="text-xs text-error mt-1 block">{errors.name.message}</span>}
          </label>

          <label className="block">
            <span className="text-sm font-medium mb-1.5 block">ইমেইল</span>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input {...register('email')} type="email" placeholder="you@example.com" className="input-field pl-9" />
            </div>
            {errors.email && <span className="text-xs text-error mt-1 block">{errors.email.message}</span>}
          </label>

          <label className="block">
            <span className="text-sm font-medium mb-1.5 block">পাসওয়ার্ড</span>
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

          <label className="flex items-start gap-2.5 text-sm text-text-secondary">
            <input type="checkbox" {...register('agree')} className="accent-primary h-4 w-4 rounded mt-0.5" />
            আমি <Link to="/terms" className="text-primary font-semibold hover:underline">শর্তাবলী</Link> এবং <Link to="/privacy" className="text-primary font-semibold hover:underline">গোপনীয়তা নীতি</Link>-তে সম্মত
          </label>
          {errors.agree && <span className="text-xs text-error block -mt-3">{errors.agree.message}</span>}

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full disabled:opacity-60">
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'অ্যাকাউন্ট তৈরি করুন'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-text-secondary">অথবা এর মাধ্যমে সাইন আপ করুন</span>
          <div className="flex-1 h-px bg-border" />
        </div>
        <SocialLoginButtons />

        <p className="text-center text-sm text-text-secondary mt-7">
          আগে থেকেই অ্যাকাউন্ট আছে? <Link to="/login" className="text-primary font-semibold hover:underline">সাইন ইন করুন</Link>
        </p>
      </div>
    </div>
  );
}

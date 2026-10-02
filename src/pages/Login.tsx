import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, Loader2, Sparkles, ShieldCheck, UserCheck, Smartphone, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Seo } from '@/components/ui/Seo';
import { SocialLoginButtons } from '@/components/ui/SocialLoginButtons';

const schema = z.object({
  email: z.string().trim().email('সঠিক ইমেইল ঠিকানা লিখুন'),
  password: z.string().min(6, 'কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড দিন'),
  rememberMe: z.boolean().optional(),
});
type FormData = z.infer<typeof schema>;

export default function Login() {
  const [showPw, setShowPw] = useState(false);
  const [loginTab, setLoginTab] = useState<'password' | 'phone'>('password');
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { rememberMe: true },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password);
      navigate(from || '/dashboard');
    } catch {
      showToast('ভুল ইমেইল অথবা পাসওয়ার্ড। আবার চেষ্টা করুন।', 'error');
    }
  };

  const handleFillDemo = (type: 'customer' | 'admin') => {
    if (type === 'admin') {
      setValue('email', 'admin@nityaghor.com');
      setValue('password', 'Admin123!');
      showToast('অ্যাডমিন ডেমো ক্রেডেনশিয়াল পূরণ করা হয়েছে', 'info');
    } else {
      setValue('email', 'customer@nityaghor.com');
      setValue('password', 'Customer123!');
      showToast('কাস্টমার ডেমো ক্রেডেনশিয়াল পূরণ করা হয়েছে', 'info');
    }
  };

  const handleSendPhoneOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^01[3-9]\d{8}$/.test(phone)) {
      showToast('সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)', 'error');
      return;
    }
    setOtpSent(true);
    showToast(`ওটিপি কোড (${phone}) নম্বরে পাঠানো হয়েছে!`, 'success');
  };

  const handleVerifyPhoneOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) {
      showToast('সঠিক ৪ ডিজিটের ওটিপি কোড দিন', 'error');
      return;
    }
    showToast('মোবাইল নম্বর যাচাই সম্পন্ন হয়েছে!', 'success');
    navigate(from || '/dashboard');
  };

  return (
    <div className="container-app section-y py-8 sm:py-14">
      <Seo title="Login" description="অর্ডার ট্র্যাক করতে, উইশলিস্ট পরিচালনা করতে এবং দ্রুত চেকআউট করতে আপনার নিত্যঘর অ্যাকাউন্টে সাইন ইন করুন।" />

      <div className="max-w-md mx-auto">
        {/* Banner Card Header */}
        <div className="card-surface p-6 sm:p-8 rounded-3xl border border-border shadow-card relative overflow-hidden">
          {/* Subtle Background Decorative Glow */}
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-accent/10 rounded-full blur-2xl pointer-events-none" />

          {/* Header text */}
          <div className="text-center mb-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-light text-primary text-xs font-semibold mb-3">
              <Sparkles size={14} /> নিরাপদ সাইন ইন
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-text-primary">আবার স্বাগতম</h1>
            <p className="mt-1.5 text-sm text-text-secondary">
              আপনার নিত্যঘর অ্যাকাউন্টে সাইন ইন করুন।
            </p>
          </div>

          {/* Quick Tab Switcher */}
          <div className="flex p-1 bg-primary-light/60 rounded-2xl mb-6 relative z-10">
            <button
              type="button"
              onClick={() => setLoginTab('password')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
                loginTab === 'password'
                  ? 'bg-white text-primary shadow-soft'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              ইমেইল ও পাসওয়ার্ড
            </button>
            <button
              type="button"
              onClick={() => setLoginTab('phone')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
                loginTab === 'phone'
                  ? 'bg-white text-primary shadow-soft'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              মোবাইল ওটিপি (OTP)
            </button>
          </div>

          {/* Email & Password Form */}
          {loginTab === 'password' ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 relative z-10">
              <div>
                <label className="text-xs font-semibold text-text-primary mb-1.5 block">ইমেইল ঠিকানা</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="you@example.com"
                    className={`input-field pl-10 ${errors.email ? 'border-error focus:ring-error' : ''}`}
                  />
                </div>
                {errors.email && <span className="text-xs text-error mt-1 block">{errors.email.message}</span>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-text-primary">পাসওয়ার্ড</label>
                  <Link to="/forgot-password" className="text-xs text-primary font-semibold hover:underline">
                    পাসওয়ার্ড ভুলে গেছেন?
                  </Link>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
                  <input
                    {...register('password')}
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`input-field pl-10 pr-10 ${errors.password ? 'border-error focus:ring-error' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary p-1 rounded-md transition-colors"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <span className="text-xs text-error mt-1 block">{errors.password.message}</span>}
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-text-secondary">
                  <input
                    type="checkbox"
                    {...register('rememberMe')}
                    className="accent-primary h-4 w-4 rounded border-border"
                  />
                  আমাকে মনে রাখুন
                </label>
                <span className="text-xs text-text-secondary flex items-center gap-1">
                  <ShieldCheck size={13} className="text-success" /> SSL সুরক্ষিত
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full py-3 text-sm font-bold shadow-lift hover:shadow-card transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> সাইন ইন হচ্ছে...
                  </>
                ) : (
                  'সাইন ইন করুন'
                )}
              </button>
            </form>
          ) : (
            /* Mobile OTP Login Form */
            <div className="space-y-4 relative z-10">
              {!otpSent ? (
                <form onSubmit={handleSendPhoneOtp} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-text-primary mb-1.5 block">মোবাইল নম্বর</label>
                    <div className="relative">
                      <Smartphone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="017XXXXXXXX"
                        className="input-field pl-10"
                      />
                    </div>
                    <span className="text-[11px] text-text-secondary mt-1 block">
                      আপনার নম্বরে ৪ ডিজিটের ওটিপি কোড পাঠানো হবে।
                    </span>
                  </div>
                  <button type="submit" className="btn-primary w-full py-3 text-sm font-bold shadow-lift">
                    ওটিপি পাঠান
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyPhoneOtp} className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-semibold text-text-primary">ওটিপি কোড</label>
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="text-xs text-primary font-semibold hover:underline"
                      >
                        নম্বর পরিবর্তন
                      </button>
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="XXXX"
                      className="input-field text-center tracking-widest text-lg font-bold py-2.5"
                    />
                    <span className="text-[11px] text-text-secondary mt-1.5 text-center block">
                      {phone} নম্বরে পাঠানো কোডটি লিখুন
                    </span>
                  </div>
                  <button type="submit" className="btn-primary w-full py-3 text-sm font-bold shadow-lift">
                    ওটিপি যাচাই ও সাইন ইন
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-6 relative z-10">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-text-secondary font-medium">অথবা সোশ্যাল দিয়ে সাইন ইন</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Social Logins */}
          <div className="relative z-10">
            <SocialLoginButtons />
          </div>

          {/* One-Click Demo Credentials Pill */}
          <div className="mt-6 pt-5 border-t border-border relative z-10">
            <p className="text-xs font-semibold text-text-secondary mb-2 flex items-center justify-between">
              <span>সহজ ডেমো টেস্ট লগইন:</span>
              <span className="text-[11px] text-primary flex items-center gap-1">
                <CheckCircle2 size={12} /> ১-ক্লিক সিলেক্ট
              </span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('customer')}
                className="btn-ghost btn-sm text-xs justify-center border border-border bg-primary-light/40 hover:bg-primary-light hover:border-primary text-text-primary transition-all"
              >
                <UserCheck size={14} className="text-primary" /> কাস্টমার ডেমো
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('admin')}
                className="btn-ghost btn-sm text-xs justify-center border border-border bg-primary-light/40 hover:bg-primary-light hover:border-primary text-text-primary transition-all"
              >
                <ShieldCheck size={14} className="text-primary" /> অ্যাডমিন ডেমো
              </button>
            </div>
          </div>

          {/* Register Link Footer */}
          <p className="text-center text-sm text-text-secondary mt-6 relative z-10">
            নতুন ব্যবহারকারী?{' '}
            <Link to="/register" className="text-primary font-bold hover:underline inline-flex items-center gap-1">
              একটি অ্যাকাউন্ট তৈরি করুন
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}


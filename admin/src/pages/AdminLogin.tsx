import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Logo } from '@/components/ui/Logo';
import { Seo } from '@/components/ui/Seo';

export default function AdminLogin() {
  const { login, loginAsAdmin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      if (err instanceof Error && err.message === 'NOT_ADMIN') {
        showToast('এই অ্যাকাউন্টের অ্যাডমিন প্যানেল অ্যাক্সেসের অনুমতি নেই', 'error');
      } else {
        showToast('ভুল ইমেইল অথবা পাসওয়ার্ড', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDemoLogin = async () => {
    setIsSubmitting(true);
    try {
      await loginAsAdmin();
      navigate('/', { replace: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-primary-light via-bg to-bg grid place-items-center px-4 py-10">
      <Seo title="অ্যাডমিন সাইন ইন" />
      <div className="w-full max-w-md">
        <div className="card-surface p-8 sm:p-10 shadow-lift border border-border">
          <div className="text-center mb-8">
            <div className="inline-flex"><Logo variant="dark" size={44} /></div>
            <p className="mt-3 text-xs font-semibold text-primary uppercase tracking-wide flex items-center justify-center gap-1.5">
              <ShieldCheck size={13} /> Admin Panel
            </p>
            <h1 className="mt-1 text-2xl font-bold">অ্যাডমিন সাইন ইন</h1>
            <p className="mt-1 text-sm text-text-secondary">শুধুমাত্র অনুমোদিত স্টাফ অ্যাকাউন্ট প্রবেশ করতে পারবে।</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
          <label className="block">
            <span className="text-sm font-medium mb-1.5 block">ইমেইল</span>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                placeholder="admin@nityaghor.com"
                className="input-field pl-9"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-sm font-medium mb-1.5 block">পাসওয়ার্ড</span>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPw ? 'text' : 'password'}
                required
                placeholder="••••••••"
                className="input-field pl-9 pr-10"
              />
              <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
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

          <button
            onClick={onDemoLogin}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 w-full text-xs font-semibold text-text-secondary hover:text-primary transition-colors disabled:opacity-60"
          >
            <ShieldCheck size={14} /> ডেমো অ্যাডমিন হিসেবে চালিয়ে যান
          </button>
        </div>

        <div className="mt-5 flex items-start gap-2.5 rounded-2xl bg-primary-light/60 border border-primary/15 px-4 py-3.5">
          <Lock size={14} className="text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-text-secondary leading-relaxed">
            নতুন স্টাফ অ্যাকাউন্টের জন্য কোনো সাইন-আপ নেই — নিরাপত্তার জন্য শুধুমাত্র বিদ্যমান অ্যাডমিন <span className="font-semibold text-text-primary">অ্যাডমিন ইউজার</span> পেজ থেকে নতুন অ্যাকাউন্ট তৈরি করতে পারবেন।
          </p>
        </div>

        <p className="mt-6 text-center text-[11px] text-text-secondary">
          © {new Date().getFullYear()} নিত্যঘর — অভ্যন্তরীণ ব্যবহারের জন্য সংরক্ষিত
        </p>
      </div>
    </div>
  );
}

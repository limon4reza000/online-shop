import { useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Seo } from '@/components/ui/Seo';

const LENGTH = 6;

export default function OTPVerification() {
  const { user, verifyOtp, resendOtp } = useAuth();
  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(''));
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  if (!user) return <Navigate to="/register" replace />;
  if (user.emailVerified) return <Navigate to="/dashboard" replace />;

  const setDigit = (i: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[i] = value;
    setDigits(next);
    if (value && i < LENGTH - 1) inputs.current[i + 1]?.focus();
  };

  const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, LENGTH);
    if (!text) return;
    e.preventDefault();
    setDigits(Array.from({ length: LENGTH }, (_, i) => text[i] || ''));
    inputs.current[Math.min(text.length, LENGTH - 1)]?.focus();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyOtp(digits.join(''))) navigate('/dashboard');
  };

  return (
    <div className="container-app section-y">
      <Seo title="ওটিপি যাচাই করুন" />
      <div className="max-w-md mx-auto card-surface p-8 sm:p-10 text-center">
        <div className="mx-auto grid place-items-center h-16 w-16 rounded-full bg-primary-light">
          <ShieldCheck size={28} className="text-primary" />
        </div>
        <h1 className="mt-5 text-2xl sm:text-3xl">যাচাইকরণ কোড লিখুন</h1>
        <p className="mt-2 text-sm text-text-secondary"><span className="font-semibold text-text-primary">{user.email}</span>-এ পাঠানো ৬-সংখ্যার কোড লিখুন।</p>

        <form onSubmit={submit} className="mt-7">
          <div className="flex justify-center gap-2 sm:gap-3">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => { inputs.current[i] = el; }}
                value={d}
                onChange={(e) => setDigit(i, e.target.value)}
                onKeyDown={(e) => onKeyDown(i, e)}
                onPaste={onPaste}
                inputMode="numeric"
                maxLength={1}
                className="h-12 w-10 sm:h-14 sm:w-12 rounded-xl border border-border bg-surface text-center text-xl font-bold focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
              />
            ))}
          </div>
          <button type="submit" className="btn-primary w-full mt-8">যাচাই করুন ও চালিয়ে যান</button>
        </form>
        <button onClick={resendOtp} className="text-sm text-primary font-semibold mt-4 hover:underline">কোড আবার পাঠান</button>
        <p className="mt-2 text-xs text-text-secondary">ডেমো: যাচাই করতে যেকোনো ৬টি সংখ্যা লিখুন।</p>
      </div>
    </div>
  );
}

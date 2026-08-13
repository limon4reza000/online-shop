import { Navigate, useNavigate } from 'react-router-dom';
import { MailCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Seo } from '@/components/ui/Seo';
import { PageLoader } from '@/components/ui/PageLoader';

export default function EmailVerification() {
  const { user, isLoading, resendOtp } = useAuth();
  const navigate = useNavigate();

  if (isLoading) return <PageLoader />;
  if (!user) return <Navigate to="/register" replace />;
  if (user.emailVerified) return <Navigate to="/dashboard" replace />;

  return (
    <div className="container-app section-y">
      <Seo title="আপনার ইমেইল যাচাই করুন" />
      <div className="max-w-md mx-auto card-surface p-8 sm:p-10 text-center">
        <div className="mx-auto grid place-items-center h-16 w-16 rounded-full bg-primary-light">
          <MailCheck size={28} className="text-primary" />
        </div>
        <h1 className="mt-5 text-2xl sm:text-3xl">আপনার ইমেইল যাচাই করুন</h1>
        <p className="mt-2 text-sm text-text-secondary">
          আমরা <span className="font-semibold text-text-primary">{user.email}</span>-এ একটি ৬-সংখ্যার যাচাইকরণ কোড পাঠিয়েছি। আপনার অ্যাকাউন্ট সক্রিয় করতে পরের স্ক্রিনে এটি লিখুন।
        </p>
        <button onClick={() => navigate('/verify-otp')} className="btn-primary w-full mt-7">
          যাচাইকরণ কোড লিখুন <ArrowRight size={16} />
        </button>
        <button onClick={resendOtp} className="text-sm text-primary font-semibold mt-4 hover:underline">
          কোড পাননি? আবার পাঠান
        </button>
      </div>
    </div>
  );
}

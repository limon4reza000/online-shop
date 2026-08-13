import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

/** Landing page for the Google/Facebook OAuth redirect — reads the access token the
 * server appended to the URL, hydrates the session, then forwards into the app. */
export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const { applySessionToken } = useAuth();
  const navigate = useNavigate();
  const [failed, setFailed] = useState(false);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const token = searchParams.get('token');
    if (!token) {
      setFailed(true);
      return;
    }
    applySessionToken(token)
      .then(() => navigate('/dashboard', { replace: true }))
      .catch(() => setFailed(true));
  }, [searchParams, applySessionToken, navigate]);

  if (failed) {
    return (
      <div className="container-app section-y">
        <div className="max-w-md mx-auto card-surface p-8 sm:p-10 text-center">
          <div className="mx-auto grid place-items-center h-16 w-16 rounded-full bg-error/10">
            <ShieldAlert size={28} className="text-error" />
          </div>
          <h1 className="mt-5 text-2xl">সাইন ইন ব্যর্থ হয়েছে</h1>
          <p className="mt-2 text-sm text-text-secondary">আবার চেষ্টা করুন অথবা ইমেইল দিয়ে সাইন ইন করুন।</p>
          <Link to="/login" className="btn-primary mt-7 inline-flex">লগইনে ফিরে যান</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-app section-y text-center">
      <Loader2 size={28} className="mx-auto animate-spin text-primary" />
      <p className="mt-4 text-sm text-text-secondary">সাইন ইন করা হচ্ছে…</p>
    </div>
  );
}

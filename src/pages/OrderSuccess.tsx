import { Link, useLocation, Navigate } from 'react-router-dom';
import { CheckCircle2, Package, Truck, Home } from 'lucide-react';
import { formatPrice } from '@/lib/format';

export default function OrderSuccess() {
  const location = useLocation();
  const state = location.state as { orderId?: string; total?: number } | null;

  if (!state?.orderId) return <Navigate to="/" replace />;

  return (
    <div className="container-app section-y">
      <div className="max-w-lg mx-auto text-center card-surface p-8 sm:p-12">
        <div className="mx-auto grid place-items-center h-20 w-20 rounded-full bg-success/10 animate-fade-in">
          <CheckCircle2 size={40} className="text-success" />
        </div>
        <h1 className="mt-6 text-3xl">অর্ডার নিশ্চিত হয়েছে!</h1>
        <p className="mt-2 text-text-secondary">আপনার কেনাকাটার জন্য ধন্যবাদ। একটি নিশ্চিতকরণ ইমেইল শীঘ্রই পাঠানো হচ্ছে।</p>

        <div className="mt-6 rounded-2xl bg-primary-light p-5 flex items-center justify-between">
          <div className="text-left">
            <p className="text-xs text-text-secondary">অর্ডার নম্বর</p>
            <p className="font-bold text-primary">{state.orderId}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-text-secondary">মোট পরিশোধিত</p>
            <p className="font-bold">{formatPrice(state.total || 0)}</p>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between text-xs text-text-secondary">
          <Step icon={CheckCircle2} label="নিশ্চিত হয়েছে" active />
          <div className="flex-1 h-0.5 bg-border mx-1" />
          <Step icon={Package} label="প্রক্রিয়াধীন" />
          <div className="flex-1 h-0.5 bg-border mx-1" />
          <Step icon={Truck} label="পাঠানো হয়েছে" />
        </div>

        <div className="mt-9 flex flex-col sm:flex-row gap-3">
          <Link to="/order-tracking" className="btn-primary flex-1">অর্ডার ট্র্যাক করুন</Link>
          <Link to="/" className="btn-outline flex-1"><Home size={16} /> হোমে ফিরে যান</Link>
        </div>
      </div>
    </div>
  );
}

function Step({ icon: Icon, label, active }: { icon: typeof CheckCircle2; label: string; active?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className={`grid place-items-center h-9 w-9 rounded-full ${active ? 'bg-success text-white' : 'bg-primary-light text-text-secondary'}`}>
        <Icon size={16} />
      </span>
      <span className={active ? 'text-text-primary font-medium' : ''}>{label}</span>
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Lock } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuth } from '@/context/AuthContext';
import { mockOrders, products } from '@/lib/data';
import { formatPrice, formatDate } from '@/lib/format';

const statusColors: Record<string, string> = {
  processing: 'bg-warning/10 text-warning',
  shipped: 'bg-primary/10 text-primary',
  'out-for-delivery': 'bg-primary/10 text-primary',
  delivered: 'bg-success/10 text-success',
  cancelled: 'bg-error/10 text-error',
};

const statusLabels: Record<string, string> = {
  all: 'সব',
  processing: 'প্রসেসিং হচ্ছে',
  shipped: 'পাঠানো হয়েছে',
  'out-for-delivery': 'ডেলিভারির পথে',
  delivered: 'ডেলিভার হয়েছে',
  cancelled: 'বাতিল হয়েছে',
};

const filters = ['all', 'processing', 'shipped', 'out-for-delivery', 'delivered', 'cancelled'];

export default function MyOrders() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const orders = filter === 'all' ? mockOrders : mockOrders.filter((o) => o.status === filter);

  if (!user) {
    return (
      <>
        <PageHeader title="আমার অর্ডার" subtitle="আপনার আগের সব অর্ডার এক জায়গায় দেখুন।" crumbs={[{ label: 'অর্ডার' }]} showBack />
        <div className="container-app section-y">
          <EmptyState
            icon={Lock}
            title="অর্ডার দেখতে লগইন করুন"
            description="আপনার আগের অর্ডার ট্র্যাক করতে এবং পছন্দের পণ্য এক ক্লিকে আবার অর্ডার করতে সাইন ইন করুন।"
            actionLabel="লগইন"
            actionTo="/login"
            secondaryActionLabel="সাইন আপ"
            secondaryActionTo="/register"
          />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="আমার অর্ডার" subtitle="আপনার আগের সব অর্ডার এক জায়গায় দেখুন।" crumbs={[{ label: 'অর্ডার' }]} showBack />
      <div className="container-app section-y space-y-6">
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-xs font-semibold capitalize whitespace-nowrap border transition-colors ${
              filter === f ? 'bg-primary text-white border-primary' : 'border-border text-text-secondary hover:border-primary'
            }`}
          >
            {statusLabels[f] ?? f}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <EmptyState icon={Package} title="এই ক্যাটাগরিতে কোনো অর্ডার নেই" />
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="card-surface p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <p className="font-bold">{o.id}</p>
                  <p className="text-xs text-text-secondary">{formatDate(o.date)}-এ করা হয়েছে</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusColors[o.status]}`}>{statusLabels[o.status] ?? o.status}</span>
              </div>
              <div className="space-y-2">
                {o.items.map((it, i) => {
                  const p = products.find((x) => x.id === it.productId);
                  if (!p) return null;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <img src={p.images[0]} alt="" className="h-12 w-12 rounded-lg object-cover" />
                      <Link to={`/product/${p.slug}`} className="flex-1 text-sm font-medium hover:text-primary transition-colors">{p.name}</Link>
                      <span className="text-xs text-text-secondary">পরিমাণ {it.quantity}</span>
                      <span className="text-sm font-bold w-16 text-right">{formatPrice(it.price)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <Link to="/order-tracking" className="text-sm text-primary font-semibold hover:underline">অর্ডার ট্র্যাক করুন</Link>
                <p className="font-bold">মোট: {formatPrice(o.total)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </>
  );
}

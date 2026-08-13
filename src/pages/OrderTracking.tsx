import { useState } from 'react';
import { Search, PackageCheck, PackageSearch, Truck, Home, CircleCheck } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { mockOrders, products } from '@/lib/data';
import { formatPrice, formatDate } from '@/lib/format';

const stageOrder = ['processing', 'shipped', 'out-for-delivery', 'delivered'];
const stages = [
  { key: 'processing', label: 'অর্ডার করা হয়েছে', icon: PackageCheck },
  { key: 'shipped', label: 'পাঠানো হয়েছে', icon: PackageSearch },
  { key: 'out-for-delivery', label: 'ডেলিভারির পথে', icon: Truck },
  { key: 'delivered', label: 'ডেলিভার হয়েছে', icon: Home },
];

export default function OrderTracking() {
  const [orderId, setOrderId] = useState('');
  const [result, setResult] = useState(mockOrders[0]);
  const [notFound, setNotFound] = useState(false);

  const track = (e: React.FormEvent) => {
    e.preventDefault();
    const found = mockOrders.find((o) => o.id.toLowerCase() === orderId.trim().toLowerCase());
    if (found) { setResult(found); setNotFound(false); }
    else setNotFound(true);
  };

  const currentIdx = result.status === 'cancelled' ? -1 : stageOrder.indexOf(result.status);

  return (
    <>
      <PageHeader title="আপনার অর্ডার ট্র্যাক করুন" crumbs={[{ label: 'অর্ডার ট্র্যাকিং' }]} showBack />
      <div className="container-app section-y">
        <form onSubmit={track} className="max-w-lg mx-auto flex gap-3 mb-12">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="যেমন ORD-83421" className="input-field pl-9" />
          </div>
          <button type="submit" className="btn-primary shrink-0">ট্র্যাক করুন</button>
        </form>

        {notFound && <p className="text-center text-error text-sm mb-8">এই আইডি দিয়ে কোনো অর্ডার পাওয়া যায়নি। ORD-83421 ব্যবহার করে দেখুন।</p>}

        <div className="max-w-3xl mx-auto card-surface p-6 sm:p-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-8">
            <div>
              <p className="text-xs text-text-secondary">অর্ডার</p>
              <p className="font-bold text-lg">{result.id}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-text-secondary">অর্ডার করা হয়েছে</p>
              <p className="font-semibold">{formatDate(result.date)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-text-secondary">মোট</p>
              <p className="font-bold text-primary">{formatPrice(result.total)}</p>
            </div>
          </div>

          {result.status === 'cancelled' ? (
            <div className="text-center py-6 text-error font-semibold">এই অর্ডারটি বাতিল করা হয়েছে।</div>
          ) : (
            <div className="relative flex justify-between">
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-border" />
              <div className="absolute top-5 left-0 h-0.5 bg-success transition-all duration-700" style={{ width: `${(currentIdx / (stages.length - 1)) * 100}%` }} />
              {stages.map((s, i) => {
                const done = i <= currentIdx;
                return (
                  <div key={s.key} className="relative flex flex-col items-center gap-2 z-10 flex-1">
                    <span className={`grid place-items-center h-10 w-10 rounded-full border-2 transition-colors ${done ? 'bg-success border-success text-white' : 'bg-white border-border text-text-secondary'}`}>
                      {done ? <CircleCheck size={18} /> : <s.icon size={17} />}
                    </span>
                    <span className={`text-xs text-center font-medium ${done ? 'text-text-primary' : 'text-text-secondary'}`}>{s.label}</span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-10 space-y-3">
            {result.items.map((it, i) => {
              const p = products.find((x) => x.id === it.productId);
              if (!p) return null;
              return (
                <div key={i} className="flex items-center gap-3 border-t border-border pt-3">
                  <img src={p.images[0]} alt="" className="h-12 w-12 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{p.name}</p>
                    <p className="text-xs text-text-secondary">পরিমাণ {it.quantity}</p>
                  </div>
                  <p className="text-sm font-bold">{formatPrice(it.price)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

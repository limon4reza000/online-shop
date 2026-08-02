import { Link } from 'react-router-dom';
import { Package, Heart, MapPin, CreditCard, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
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
  processing: 'প্রসেসিং হচ্ছে',
  shipped: 'পাঠানো হয়েছে',
  'out-for-delivery': 'ডেলিভারির পথে',
  delivered: 'ডেলিভার হয়েছে',
  cancelled: 'বাতিল হয়েছে',
};

export default function Dashboard() {
  const { user } = useAuth();
  const { ids } = useWishlist();
  const recentOrders = mockOrders.slice(0, 3);

  const stats = [
    { label: 'মোট অর্ডার', value: mockOrders.length, icon: Package },
    { label: 'উইশলিস্ট আইটেম', value: ids.length, icon: Heart },
    { label: 'সংরক্ষিত ঠিকানা', value: 1, icon: MapPin },
    { label: 'সংরক্ষিত কার্ড', value: 1, icon: CreditCard },
  ];

  return (
    <div className="space-y-8">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card-surface p-5">
            <span className="grid place-items-center h-10 w-10 rounded-xl bg-primary-light text-primary"><s.icon size={18} /></span>
            <p className="mt-3 text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-text-secondary">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card-surface p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold">সাম্প্রতিক অর্ডার</h3>
          <Link to="/orders" className="text-sm text-primary font-semibold flex items-center gap-1 hover:underline">
            সব দেখুন <ArrowRight size={14} />
          </Link>
        </div>
        <div className="space-y-4">
          {recentOrders.map((o) => {
            const firstProduct = products.find((p) => p.id === o.items[0]?.productId);
            return (
              <div key={o.id} className="flex items-center gap-4 border-b border-border pb-4 last:border-0 last:pb-0">
                {firstProduct && <img src={firstProduct.images[0]} alt="" className="h-14 w-14 rounded-xl object-cover" />}
                <div className="flex-1">
                  <p className="font-semibold text-sm">{o.id}</p>
                  <p className="text-xs text-text-secondary">{formatDate(o.date)} · {o.items.length}টি পণ্য</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusColors[o.status]}`}>{statusLabels[o.status] ?? o.status}</span>
                <p className="font-bold text-sm w-16 text-right">{formatPrice(o.total)}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card-surface p-6">
        <h3 className="text-lg font-bold mb-1">অ্যাকাউন্টের তথ্য</h3>
        <p className="text-sm text-text-secondary">নাম: <span className="text-text-primary font-medium">{user?.name}</span></p>
        <p className="text-sm text-text-secondary">ইমেইল: <span className="text-text-primary font-medium">{user?.email}</span></p>
        <Link to="/profile" className="btn-outline btn-sm mt-4 inline-flex">প্রোফাইল সম্পাদনা করুন</Link>
      </div>
    </div>
  );
}

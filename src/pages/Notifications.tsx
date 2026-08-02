import { useState } from 'react';
import { Package, Tag, Heart, Bell, Check, Trash2, Lock } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuth } from '@/context/AuthContext';

interface Notification {
  id: string;
  type: 'order' | 'promo' | 'wishlist' | 'system';
  title: string;
  body: string;
  date: string;
  read: boolean;
}

const initial: Notification[] = [
  { id: 'n1', type: 'order', title: 'অর্ডার পাঠানো হয়েছে', body: 'আপনার অর্ডার ORD-83421 পাঠানো হয়েছে এবং পথে আছে।', date: '২ ঘণ্টা আগে', read: false },
  { id: 'n2', type: 'promo', title: 'ফ্ল্যাশ সেল সতর্কবার্তা', body: 'নির্বাচিত পণ্যে ৪০% পর্যন্ত ছাড় — শেষ হবে ২৬ ঘণ্টায়।', date: '৫ ঘণ্টা আগে', read: false },
  { id: 'n3', type: 'wishlist', title: 'দাম কমেছে', body: 'আপনার উইশলিস্টের একটি পণ্যের দাম ১৫% কমেছে।', date: '১ দিন আগে', read: true },
  { id: 'n4', type: 'order', title: 'অর্ডার ডেলিভার হয়েছে', body: 'আপনার অর্ডার ORD-77102 সফলভাবে ডেলিভার হয়েছে।', date: '৩ দিন আগে', read: true },
  { id: 'n5', type: 'system', title: 'নিত্যঘরে স্বাগতম', body: 'যুক্ত হওয়ার জন্য ধন্যবাদ! WELCOME10 কোডে আপনার প্রথম অর্ডারে ১০% ছাড় নিন।', date: '১ সপ্তাহ আগে', read: true },
];

const icons = { order: Package, promo: Tag, wishlist: Heart, system: Bell };
const colors = {
  order: 'bg-primary/10 text-primary',
  promo: 'bg-warning/10 text-warning',
  wishlist: 'bg-error/10 text-error',
  system: 'bg-success/10 text-success',
};

export default function Notifications() {
  const { user } = useAuth();
  const [items, setItems] = useState(initial);
  const unreadCount = items.filter((n) => !n.read).length;

  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  const markRead = (id: string) => setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const remove = (id: string) => setItems((prev) => prev.filter((n) => n.id !== id));

  if (!user) {
    return (
      <>
        <PageHeader title="নোটিফিকেশন" subtitle="অর্ডার আপডেট, অফার এবং পছন্দসই খবর সবার আগে পান।" crumbs={[{ label: 'নোটিফিকেশন' }]} showBack />
        <div className="container-app section-y">
          <EmptyState
            icon={Lock}
            title="নোটিফিকেশন দেখতে লগইন করুন"
            description="অর্ডার আপডেট, বিশেষ অফার এবং পছন্দ অনুযায়ী সুপারিশ পেতে সাইন ইন করুন।"
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
      <PageHeader title="নোটিফিকেশন" subtitle="অর্ডার আপডেট, অফার এবং পছন্দসই খবর সবার আগে পান।" crumbs={[{ label: 'নোটিফিকেশন' }]} showBack />
      <div className="container-app section-y space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">নোটিফিকেশন {unreadCount > 0 && <span className="text-primary">({unreadCount}টি অপঠিত)</span>}</h3>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
            <Check size={14} /> সব পঠিত হিসেবে চিহ্নিত করুন
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState icon={Bell} title="আপনি সব দেখে ফেলেছেন" description="এই মুহূর্তে কোনো নোটিফিকেশন নেই।" />
      ) : (
        <div className="space-y-3">
          {items.map((n) => {
            const Icon = icons[n.type];
            return (
              <div key={n.id} className={`card-surface p-4 flex items-start gap-4 ${!n.read ? 'border-primary/40 bg-primary-light/40' : ''}`}>
                <span className={`grid place-items-center h-10 w-10 rounded-xl shrink-0 ${colors[n.type]}`}><Icon size={17} /></span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{n.title}</p>
                    {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                  </div>
                  <p className="text-sm text-text-secondary mt-0.5">{n.body}</p>
                  <p className="text-xs text-text-secondary mt-1.5">{n.date}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {!n.read && (
                    <button onClick={() => markRead(n.id)} aria-label="পঠিত হিসেবে চিহ্নিত করুন" className="p-2 rounded-full hover:bg-primary-light text-text-secondary hover:text-primary">
                      <Check size={15} />
                    </button>
                  )}
                  <button onClick={() => remove(n.id)} aria-label="মুছে ফেলুন" className="p-2 rounded-full hover:bg-error/10 text-text-secondary hover:text-error">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>
    </>
  );
}

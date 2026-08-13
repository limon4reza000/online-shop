import { useState } from 'react';
import { Check, X, Star } from 'lucide-react';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Seo } from '@/components/ui/Seo';
import { reviews as initialReviews, products } from '@/lib/data';
import { formatDate } from '@/lib/format';
import { useToast } from '@/context/ToastContext';
import type { Review } from '@/lib/types';

type ModeratedReview = Review & { status: 'pending' | 'approved' | 'rejected' };

export default function AdminReviews() {
  const [reviews, setReviews] = useState<ModeratedReview[]>(
    initialReviews.map((r, i) => ({ ...r, status: i % 5 === 0 ? 'pending' : 'approved' }))
  );
  const { showToast } = useToast();

  const statusLabels: Record<ModeratedReview['status'], string> = {
    pending: 'অপেক্ষমাণ',
    approved: 'অনুমোদিত',
    rejected: 'প্রত্যাখ্যাত',
  };

  const setStatus = (id: string, status: ModeratedReview['status']) => {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    showToast(`রিভিউ ${statusLabels[status]} করা হয়েছে`, status === 'rejected' ? 'error' : 'success');
  };

  const columns: Column<ModeratedReview>[] = [
    {
      key: 'product',
      label: 'পণ্য',
      render: (r) => {
        const p = products.find((x) => x.id === r.productId);
        return <p className="font-medium min-w-[160px] line-clamp-1">{p?.name || 'অজানা'}</p>;
      },
    },
    { key: 'author', label: 'লেখক', render: (r) => r.author },
    {
      key: 'rating',
      label: 'রেটিং',
      render: (r) => (
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={12} className={i < r.rating ? 'fill-primary text-primary' : 'fill-border text-border'} />)}
        </div>
      ),
    },
    { key: 'body', label: 'মন্তব্য', render: (r) => <p className="max-w-xs line-clamp-2 text-text-secondary">{r.body}</p> },
    { key: 'date', label: 'তারিখ', render: (r) => formatDate(r.date) },
    {
      key: 'status',
      label: 'অবস্থা',
      render: (r) => (
        <span className={`badge ${r.status === 'approved' ? 'bg-success/10 text-success' : r.status === 'rejected' ? 'bg-error/10 text-error' : 'bg-warning/10 text-warning'}`}>
          {statusLabels[r.status]}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'কার্যক্রম',
      render: (r) =>
        r.status === 'pending' ? (
          <div className="flex items-center gap-1.5">
            <button onClick={() => setStatus(r.id, 'approved')} className="p-2 rounded-full hover:bg-success/10 text-text-secondary hover:text-success"><Check size={14} /></button>
            <button onClick={() => setStatus(r.id, 'rejected')} className="p-2 rounded-full hover:bg-error/10 text-text-secondary hover:text-error"><X size={14} /></button>
          </div>
        ) : (
          <span className="text-xs text-text-secondary">—</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <Seo title="Review Moderation" />
      <div>
        <h2 className="text-2xl font-bold">রিভিউ মডারেশন</h2>
        <p className="text-sm text-text-secondary mt-1">{reviews.filter((r) => r.status === 'pending').length}টি রিভিউ অনুমোদনের অপেক্ষায় রয়েছে।</p>
      </div>
      <DataTable columns={columns} data={reviews} rowKey={(r) => r.id} searchPlaceholder="রিভিউ খুঁজুন..." searchFn={(r, q) => r.author.toLowerCase().includes(q) || r.body.toLowerCase().includes(q)} />
    </div>
  );
}

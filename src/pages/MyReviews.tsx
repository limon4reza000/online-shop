import { Link } from 'react-router-dom';
import { Star, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { products } from '@/lib/data';
import { formatDate } from '@/lib/format';
import { useToast } from '@/context/ToastContext';

interface MyReview {
  id: string;
  productId: string;
  rating: number;
  title: string;
  body: string;
  date: string;
}

const initial: MyReview[] = [
  { id: 'mr1', productId: 'p1', rating: 5, title: 'একদম পছন্দ হয়েছে', date: new Date(Date.now() - 4 * 86400000).toISOString(), body: 'ফিটিং একদম নিখুঁত আর কাপড়ের মান প্রিমিয়াম মনে হয়েছে। প্রতিটি রঙে আবার কিনব।' },
  { id: 'mr2', productId: 'p12', rating: 4, title: 'গুণগত মান চমৎকার, একটু ছোট মনে হয়', date: new Date(Date.now() - 20 * 86400000).toISOString(), body: 'কারুকাজ অসাধারণ, তবে সাইজের মাঝামাঝি হলে একটু বড় সাইজ নিন।' },
];

export default function MyReviews() {
  const [reviews, setReviews] = useState(initial);
  const { showToast } = useToast();

  const remove = (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    showToast('রিভিউ মুছে ফেলা হয়েছে', 'info');
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold">আমার রিভিউ</h3>
      {reviews.length === 0 ? (
        <div className="card-surface p-10 text-center">
          <Star size={36} className="mx-auto text-primary/30" />
          <p className="mt-3 font-semibold">আপনি এখনো কোনো রিভিউ লেখেননি</p>
          <Link to="/orders" className="btn-primary btn-sm mt-4 inline-flex">আপনার অর্ডার দেখুন</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => {
            const p = products.find((x) => x.id === r.productId);
            return (
              <div key={r.id} className="card-surface p-5">
                <div className="flex items-start gap-4">
                  {p && <img src={p.images[0]} alt="" className="h-14 w-14 rounded-xl object-cover shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-text-secondary">{formatDate(r.date)}</p>
                    {p && <Link to={`/product/${p.slug}`} className="text-sm font-semibold hover:text-primary transition-colors">{p.name}</Link>}
                    <div className="flex items-center gap-0.5 mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={13} className={i < r.rating ? 'fill-primary text-primary' : 'fill-border text-border'} />
                      ))}
                    </div>
                    <p className="text-sm font-semibold mt-1.5">{r.title}</p>
                    <p className="text-sm text-text-secondary mt-0.5">{r.body}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button className="p-2 rounded-full hover:bg-primary-light text-text-secondary hover:text-primary"><Pencil size={14} /></button>
                    <button onClick={() => remove(r.id)} className="p-2 rounded-full hover:bg-error/10 text-text-secondary hover:text-error"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

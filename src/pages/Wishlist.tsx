import { Link } from 'react-router-dom';
import { Heart, X } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Rating } from '@/components/ui/Rating';
import { AddToCartControl } from '@/components/ui/AddToCartControl';
import { useWishlist } from '@/context/WishlistContext';
import { useProducts } from '@/hooks/useProducts';
import { formatPrice } from '@/lib/format';

export default function Wishlist() {
  const { ids, toggle } = useWishlist();
  const { data: products = [] } = useProducts();
  const items = products.filter((p) => ids.includes(p.id));

  return (
    <>
      <PageHeader title="আমার পছন্দের তালিকা" crumbs={[{ label: 'পছন্দের তালিকা' }]} showBack />
      <div className="container-app section-y">
        {items.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="আপনার পছন্দের তালিকা খালি"
            description="আপনার পছন্দের পণ্যগুলো সংরক্ষণ করুন এবং যেকোনো সময় এখানে খুঁজে পান।"
            actionLabel="কেনাকাটা শুরু করুন"
            actionTo="/shop"
          />
        ) : (
          <div className="grid gap-4">
            {items.map((p) => (
              <div key={p.id} className="card-surface p-4 flex flex-col sm:flex-row items-center gap-4">
                <Link to={`/product/${p.slug}`} className="h-24 w-24 rounded-xl overflow-hidden bg-primary-light shrink-0">
                  <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
                </Link>
                <div className="flex-1 text-center sm:text-left">
                  <p className="text-xs text-text-secondary uppercase">{p.brand}</p>
                  <Link to={`/product/${p.slug}`} className="font-semibold hover:text-primary transition-colors">{p.name}</Link>
                  <div className="mt-1 flex justify-center sm:justify-start"><Rating value={p.rating} count={p.reviewCount} /></div>
                  <div className="mt-1 flex items-center justify-center sm:justify-start gap-2">
                    <span className="font-bold">{formatPrice(p.price)}</span>
                    {p.oldPrice && <span className="text-sm text-text-secondary line-through">{formatPrice(p.oldPrice)}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <AddToCartControl productId={p.id} stock={p.stock} size="sm" className="w-36" />
                  <button onClick={() => toggle(p.id)} aria-label="মুছে ফেলুন" className="grid place-items-center h-10 w-10 rounded-full border border-border hover:border-error hover:text-error transition-colors">
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

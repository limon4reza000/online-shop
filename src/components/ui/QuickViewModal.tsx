import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart } from 'lucide-react';
import type { Product } from '@/lib/types';
import { formatPrice } from '@/lib/format';
import { Rating } from './Rating';
import { Modal } from './Modal';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

export function QuickViewModal({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const { addItem } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const [color, setColor] = useState(product?.colors?.[0]?.name);
  const [size, setSize] = useState(product?.sizes?.[2]);

  const discount = product?.oldPrice && product.oldPrice > product.price
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;
  const inStock = (product?.stock ?? 0) > 0;

  return (
    <Modal open={!!product} onClose={onClose} maxWidth="max-w-3xl">
      {product && (
        <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
          <div className="relative rounded-2xl overflow-hidden bg-primary-light aspect-square">
            <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
            {discount > 0 && (
              <span className="absolute top-3 left-3 rounded-full bg-primary text-white text-xs font-bold px-2.5 py-1">-{discount}%</span>
            )}
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-text-secondary font-semibold">{product.brand}</p>
            <h2 className="text-2xl mt-1">{product.name}</h2>
            <div className="mt-2"><Rating value={product.rating} count={product.reviewCount} /></div>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-2xl font-bold">{formatPrice(product.price)}</span>
              {product.oldPrice && <span className="text-text-secondary line-through">{formatPrice(product.oldPrice)}</span>}
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold">
              <span className={`h-1.5 w-1.5 rounded-full ${inStock ? 'bg-success' : 'bg-error'}`} />
              <span className={inStock ? 'text-success' : 'text-error'}>{inStock ? 'স্টকে আছে' : 'স্টক নেই'}</span>
            </div>
            <p className="mt-3 text-sm text-text-secondary line-clamp-3">{product.description}</p>

            {product.colors && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-text-primary mb-2">রঙ: {color}</p>
                <div className="flex gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setColor(c.name)}
                      style={{ backgroundColor: c.hex }}
                      className={`h-8 w-8 rounded-full border-2 transition-all ${color === c.name ? 'border-primary scale-110' : 'border-white shadow-soft'}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {product.sizes && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-text-primary mb-2">সাইজ</p>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`h-9 min-w-9 px-2 rounded-lg border text-sm font-medium transition-colors ${
                        size === s ? 'border-primary bg-primary text-white' : 'border-border hover:border-primary'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                disabled={!inStock}
                onClick={() => { addItem({ productId: product.id, quantity: 1, color, size }); onClose(); }}
                className="btn-primary flex-1"
              >
                <ShoppingBag size={16} /> কার্টে যোগ করুন
              </button>
              <button
                onClick={() => toggle(product.id)}
                className="grid place-items-center h-12 w-12 rounded-full border border-border hover:border-primary transition-colors shrink-0"
              >
                <Heart size={18} className={isWishlisted(product.id) ? 'fill-primary text-primary' : ''} />
              </button>
            </div>
            <Link to={`/product/${product.slug}`} onClick={onClose} className="inline-block mt-4 text-sm text-primary font-semibold hover:underline">
              সম্পূর্ণ বিবরণ দেখুন →
            </Link>
          </div>
        </div>
      )}
    </Modal>
  );
}

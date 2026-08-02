import { Link } from 'react-router-dom';
import { Heart, Eye, ShoppingBag } from 'lucide-react';
import type { Product } from '@/lib/types';
import { formatPrice } from '@/lib/format';
import { Rating } from './Rating';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';

export function ProductCard({ product, onQuickView }: { product: Product; onQuickView?: (p: Product) => void }) {
  const { isWishlisted, toggle } = useWishlist();
  const { addItem } = useCart();
  const { t } = useLanguage();
  const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;
  const wishlisted = isWishlisted(product.id);

  return (
    <div className="group relative flex flex-col h-full">
      <div className="rounded-2xl bg-white border border-border shadow-soft transition-all duration-300 group-hover:shadow-lift group-hover:-translate-y-1 flex flex-col h-full">
        <div className="relative overflow-hidden rounded-t-2xl">
          <Link to={`/product/${product.slug}`} className="block relative aspect-4/5 overflow-hidden bg-primary-light">
            <img
              src={product.images[0]}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <img
              src={product.images[1]}
              alt=""
              aria-hidden
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          </Link>

          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {discount > 0 && (
              <span className="rounded-full bg-primary text-white text-[11px] font-bold px-2.5 py-1 shadow-card">
                -{discount}%
              </span>
            )}
            {product.tags.includes('new') && (
              <span className="rounded-full bg-text-primary text-white text-[11px] font-bold px-2.5 py-1">{t('নতুন')}</span>
            )}
          </div>

          <div className="absolute top-3 right-3 flex flex-col gap-2">
            <button
              onClick={() => toggle(product.id)}
              aria-label={t('পছন্দের তালিকা পরিবর্তন করুন')}
              className="grid place-items-center h-9 w-9 rounded-full bg-white/90 backdrop-blur shadow-soft transition-all hover:bg-white hover:scale-110"
            >
              <Heart size={16} className={wishlisted ? 'fill-primary text-primary' : 'text-text-primary'} />
            </button>
            {onQuickView && (
              <button
                onClick={() => onQuickView(product)}
                aria-label={t('দ্রুত দেখুন')}
                className="grid place-items-center h-9 w-9 rounded-full bg-white/90 backdrop-blur shadow-soft transition-all hover:bg-white hover:scale-110"
              >
                <Eye size={15} className="text-text-primary" />
              </button>
            )}
          </div>
        </div>

        <div className="pt-3.5 px-3.5 pb-3.5 flex flex-col flex-1">
          <p className="text-[11px] uppercase tracking-wide text-text-secondary font-medium">{product.brand}</p>
          <Link to={`/product/${product.slug}`}>
            <h3 className="mt-0.5 text-sm font-semibold text-text-primary line-clamp-1 hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
          <div className="mt-1.5">
            <Rating value={product.rating} count={product.reviewCount} />
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="font-bold text-text-primary">{formatPrice(product.price)}</span>
            {product.oldPrice && <span className="text-sm text-text-secondary line-through">{formatPrice(product.oldPrice)}</span>}
          </div>

          <button
            onClick={() => addItem({ productId: product.id, quantity: 1 })}
            className="mt-3 flex items-center justify-center gap-1.5 rounded-full bg-primary text-white text-xs font-semibold py-2.5 hover:bg-primary-hover transition-colors"
          >
            <ShoppingBag size={14} /> {t('কার্টে যোগ করুন')}
          </button>
        </div>
      </div>
    </div>
  );
}

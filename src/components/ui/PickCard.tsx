import { Link } from 'react-router-dom';
import { TrendingUp, Plus } from 'lucide-react';
import type { Product } from '@/lib/types';
import { formatPrice } from '@/lib/format';
import { Rating } from './Rating';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';

export function PickCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { t } = useLanguage();
  const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;
  const viewCount = 40 + ((product.reviewCount * 7) % 460);

  return (
    <div className="h-full bg-surface border-r border-b border-border flex flex-col hover:shadow-lift transition-shadow duration-300">
      <Link to={`/product/${product.slug}`} className="relative block aspect-square bg-primary-light">
        <img src={product.images[0]} alt={product.name} loading="lazy" className="h-full w-full object-cover" />
        {discount > 0 && (
          <span className="absolute top-2 left-2 rounded-full bg-primary text-white text-[10px] font-bold px-2 py-0.5">-{discount}%</span>
        )}
      </Link>

      <div className="px-3 pb-3 pt-2 flex flex-col flex-1">
        <span className="flex items-center gap-1 text-[10px] font-medium text-text-secondary">
          <TrendingUp size={11} className="text-primary" /> {viewCount} {t('বার দেখা হয়েছে')}
        </span>
        <p className="mt-1.5 text-[10px] font-bold uppercase tracking-wide text-primary line-clamp-1">{product.brand}</p>
        <Link to={`/product/${product.slug}`}>
          <h3 className="mt-0.5 text-sm font-semibold text-text-primary line-clamp-1 hover:text-primary transition-colors">{product.name}</h3>
        </Link>
        <div className="mt-1.5"><Rating value={product.rating} count={product.reviewCount} size={12} /></div>
        <div className="mt-2 flex items-center gap-2">
          <span className="font-bold text-text-primary">{formatPrice(product.price)}</span>
          {product.oldPrice && <span className="text-xs text-text-secondary line-through">{formatPrice(product.oldPrice)}</span>}
        </div>
        <button
          onClick={() => addItem({ productId: product.id, quantity: 1 })}
          className="mt-3 flex items-center justify-center gap-1 rounded-full bg-primary text-white text-xs font-semibold py-2.5 hover:bg-primary-hover transition-colors"
        >
          <Plus size={13} /> {t('কার্টে যোগ করুন')}
        </button>
      </div>
    </div>
  );
}

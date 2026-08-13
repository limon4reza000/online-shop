import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import type { Product } from '@/lib/types';
import { formatPrice } from '@/lib/format';
import { Rating } from './Rating';
import { AddToCartControl } from './AddToCartControl';
import { useLanguage } from '@/context/LanguageContext';

export function PickCard({ product }: { product: Product }) {
  const { t } = useLanguage();
  const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;
  const inStock = product.stock > 0;
  const viewCount = 40 + ((product.reviewCount * 7) % 460);

  return (
    <div className="group relative flex flex-col h-full border-r border-b border-border bg-white hover:border-primary hover:shadow-lift transition-[border-color,box-shadow] duration-300 ease-out">
      <Link to={`/product/${product.slug}`} className="relative block aspect-square overflow-hidden bg-primary-light">
        <img src={product.images[0]} alt={product.name} loading="lazy" className={`h-full w-full object-cover ${!inStock ? 'grayscale' : ''}`} />
        {discount > 0 && (
          <span className="absolute top-3 left-3 rounded-full bg-primary text-white text-[11px] font-bold px-2.5 py-1 shadow-card">-{discount}%</span>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-text-primary/50 flex items-center justify-center">
            <span className="rounded-full bg-white text-text-primary text-xs font-bold px-3.5 py-1.5 shadow-card">{t('common.outOfStock')}</span>
          </div>
        )}
      </Link>

      <div className="px-3.5 pb-3.5 pt-2.5 flex flex-col flex-1">
        <span className="flex items-center gap-1 text-[10px] font-medium text-text-secondary">
          <TrendingUp size={11} className="text-primary" /> {viewCount} {t('common.views')}
        </span>
        <p className="mt-1.5 text-[10px] font-bold uppercase tracking-wide text-primary line-clamp-1">{product.brand}</p>
        <Link to={`/product/${product.slug}`}>
          <h3 className="mt-0.5 text-sm font-semibold text-text-primary line-clamp-1 hover:text-primary transition-colors">{product.name}</h3>
        </Link>
        <div className="mt-1.5"><Rating value={product.rating} count={product.reviewCount} size={12} /></div>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="font-bold text-text-primary">{formatPrice(product.price)}</span>
          {product.oldPrice && <span className="text-sm text-text-secondary line-through">{formatPrice(product.oldPrice)}</span>}
        </div>
        <AddToCartControl productId={product.id} stock={product.stock} className="mt-3" />
      </div>
    </div>
  );
}

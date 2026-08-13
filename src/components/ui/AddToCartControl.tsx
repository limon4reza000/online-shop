import { Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';

/**
 * Swaps between an "Add to cart" button and a +/- quantity stepper, driven entirely by
 * the global cart (never local state) so every card for the same product — across the
 * home page, category pages, search, wishlist, recently-viewed, related products, etc. —
 * stays in sync.
 */
export function AddToCartControl({
  productId,
  stock,
  size = 'default',
  className = '',
}: {
  productId: string;
  stock: number;
  size?: 'default' | 'sm';
  className?: string;
}) {
  const { items, addItem, updateQuantity, removeItem } = useCart();
  const { t } = useLanguage();
  const inStock = stock > 0;
  const cartItem = items.find((i) => i.productId === productId && !i.color && !i.size);
  const quantity = cartItem?.quantity ?? 0;

  const decrease = () => {
    if (quantity <= 1) removeItem(productId);
    else updateQuantity(productId, quantity - 1);
  };
  const increase = () => updateQuantity(productId, quantity + 1);

  const heightClass = size === 'sm' ? 'h-9' : 'h-[34px]';

  if (quantity > 0) {
    return (
      <div
        className={`flex items-stretch justify-between rounded-none border border-border overflow-hidden animate-fade-in ${heightClass} ${className}`}
      >
        <button
          type="button"
          onClick={decrease}
          aria-label={t('common.decreaseQty')}
          className="w-9 shrink-0 grid place-items-center bg-surface text-text-primary hover:bg-primary-light hover:text-primary transition-colors"
        >
          <Minus size={14} />
        </button>
        <span className="flex-1 grid place-items-center text-xs font-bold text-text-primary">{quantity}</span>
        <button
          type="button"
          onClick={increase}
          disabled={quantity >= stock}
          aria-label={t('common.increaseQty')}
          className="w-9 shrink-0 grid place-items-center bg-primary text-white hover:bg-primary-hover disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <Plus size={14} />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={!inStock}
      onClick={() => addItem({ productId, quantity: 1 })}
      className={`flex items-center justify-center gap-1.5 rounded-none bg-primary text-white text-xs font-semibold hover:bg-primary-hover disabled:opacity-40 disabled:pointer-events-none transition-colors animate-fade-in ${heightClass} ${className}`}
    >
      <ShoppingBag size={14} /> {inStock ? t('common.addToCart') : t('common.outOfStock')}
    </button>
  );
}

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CartItem } from '@/lib/types';
import { products } from '@/lib/data';
import { useToast } from './ToastContext';

interface CartContextValue {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, color?: string, size?: string) => void;
  updateQuantity: (productId: string, quantity: number, color?: string, size?: string) => void;
  clearCart: () => void;
  subtotal: number;
  deliveryCharge: number;
  vat: number;
  itemCount: number;
  coupon: string | null;
  discount: number;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'shop-cart-v1';

const VALID_COUPONS: Record<string, number> = { WELCOME10: 0.1, PINK20: 0.2, SAVE15: 0.15 };

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [coupon, setCoupon] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.productId === item.productId && i.color === item.color && i.size === item.size);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + item.quantity };
        return next;
      }
      return [...prev, item];
    });
    showToast('কার্টে যোগ করা হয়েছে', 'success');
  };

  const removeItem = (productId: string, color?: string, size?: string) => {
    setItems((prev) => prev.filter((i) => !(i.productId === productId && i.color === color && i.size === size)));
  };

  const updateQuantity = (productId: string, quantity: number, color?: string, size?: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId && i.color === color && i.size === size ? { ...i, quantity: Math.max(1, quantity) } : i
      )
    );
  };

  const clearCart = () => setItems([]);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => {
      const p = products.find((x) => x.id === i.productId);
      return sum + (p ? p.price * i.quantity : 0);
    }, 0),
    [items]
  );

  // Delivery charge and VAT are fixed, admin-configured amounts set per product.
  const deliveryCharge = useMemo(
    () => items.reduce((sum, i) => {
      const p = products.find((x) => x.id === i.productId);
      return sum + (p ? p.deliveryCharge * i.quantity : 0);
    }, 0),
    [items]
  );

  const vat = useMemo(
    () => items.reduce((sum, i) => {
      const p = products.find((x) => x.id === i.productId);
      return sum + (p ? p.vat * i.quantity : 0);
    }, 0),
    [items]
  );

  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  const applyCoupon = (code: string) => {
    const upper = code.trim().toUpperCase();
    if (VALID_COUPONS[upper]) {
      setCoupon(upper);
      showToast(`কুপন "${upper}" প্রয়োগ করা হয়েছে`, 'success');
      return true;
    }
    showToast('ভুল কুপন কোড', 'error');
    return false;
  };
  const removeCoupon = () => setCoupon(null);
  const discount = coupon ? subtotal * VALID_COUPONS[coupon] : 0;

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, subtotal, deliveryCharge, vat, itemCount, coupon, discount, applyCoupon, removeCoupon }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

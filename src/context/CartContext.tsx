import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CartItem } from '@/lib/types';
import { useProducts } from '@/hooks/useProducts';
import { useToast } from './ToastContext';

export interface ShippingDetails {
  fullName: string;
  mobile: string;
  address: string;
  village: string;
  postOffice: string;
  upazila: string;
  district: string;
  division: string;
  note?: string;
}

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
  shippingDetails: ShippingDetails | null;
  setShippingDetails: (details: ShippingDetails) => void;
  clearShippingDetails: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'shop-cart-v1';
const SHIPPING_STORAGE_KEY = 'shop-shipping-details-v1';

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
  const [shippingDetails, setShippingDetailsState] = useState<ShippingDetails | null>(() => {
    try {
      const raw = localStorage.getItem(SHIPPING_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const { showToast } = useToast();
  const { data: products = [] } = useProducts();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const setShippingDetails = (details: ShippingDetails) => {
    setShippingDetailsState(details);
    localStorage.setItem(SHIPPING_STORAGE_KEY, JSON.stringify(details));
  };

  // Drop cart entries whose product was deleted/deactivated since it was added —
  // otherwise the cart badge count and the (product-filtered) cart page disagree.
  useEffect(() => {
    if (products.length === 0) return;
    setItems((prev) => {
      const valid = prev.filter((i) => products.some((p) => p.id === i.productId));
      return valid.length === prev.length ? prev : valid;
    });
  }, [products]);

  const addItem = (item: CartItem) => {
    const stock = products.find((p) => p.id === item.productId)?.stock;
    let clamped = false;
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.productId === item.productId && i.color === item.color && i.size === item.size);
      if (idx > -1) {
        const next = [...prev];
        let quantity = next[idx].quantity + item.quantity;
        if (stock !== undefined && quantity > stock) { quantity = stock; clamped = true; }
        next[idx] = { ...next[idx], quantity };
        return next;
      }
      let quantity = item.quantity;
      if (stock !== undefined && quantity > stock) { quantity = stock; clamped = true; }
      return [...prev, { ...item, quantity }];
    });
    showToast(clamped ? 'সর্বোচ্চ স্টক অনুযায়ী পরিমাণ সীমিত করা হয়েছে' : 'কার্টে যোগ করা হয়েছে', clamped ? 'info' : 'success');
  };

  const removeItem = (productId: string, color?: string, size?: string) => {
    setItems((prev) => prev.filter((i) => !(i.productId === productId && i.color === color && i.size === size)));
  };

  const updateQuantity = (productId: string, quantity: number, color?: string, size?: string) => {
    const stock = products.find((p) => p.id === productId)?.stock;
    const capped = stock !== undefined ? Math.min(quantity, stock) : quantity;
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId && i.color === color && i.size === size ? { ...i, quantity: Math.max(1, capped) } : i
      )
    );
  };

  const clearCart = () => setItems([]);

  const clearShippingDetails = () => {
    setShippingDetailsState(null);
    localStorage.removeItem(SHIPPING_STORAGE_KEY);
  };

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
      value={{
        items, addItem, removeItem, updateQuantity, clearCart, subtotal, deliveryCharge, vat, itemCount,
        coupon, discount, applyCoupon, removeCoupon, shippingDetails, setShippingDetails, clearShippingDetails,
      }}
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

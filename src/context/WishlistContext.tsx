import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useToast } from './ToastContext';

interface WishlistContextValue {
  ids: string[];
  toggle: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);
const STORAGE_KEY = 'shop-wishlist-v1';

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const { showToast } = useToast();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }, [ids]);

  const toggle = (productId: string) => {
    setIds((prev) => {
      if (prev.includes(productId)) {
        showToast('উইশলিস্ট থেকে সরানো হয়েছে', 'info');
        return prev.filter((id) => id !== productId);
      }
      showToast('উইশলিস্টে যোগ করা হয়েছে', 'success');
      return [...prev, productId];
    });
  };

  const isWishlisted = (productId: string) => ids.includes(productId);

  return <WishlistContext.Provider value={{ ids, toggle, isWishlisted }}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}

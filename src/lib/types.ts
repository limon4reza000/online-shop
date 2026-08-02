export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  oldPrice?: number;
  deliveryCharge: number;
  vat: number;
  rating: number;
  reviewCount: number;
  images: string[];
  colors?: { name: string; hex: string }[];
  sizes?: string[];
  description: string;
  stock: number;
  tags: string[];
  createdAt: string;
}

export interface SearchPlaceholder {
  id: string;
  text: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  title: string;
  body: string;
  verified: boolean;
}

export interface CartItem {
  productId: string;
  quantity: number;
  color?: string;
  size?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  icon?: string; // emoji, shown for main categories
  parentSlug?: string | null; // undefined/null = main category, set = subcategory
  count: number;
}

export interface Order {
  id: string;
  date: string;
  status: 'processing' | 'shipped' | 'out-for-delivery' | 'delivered' | 'cancelled';
  total: number;
  items: { productId: string; quantity: number; price: number }[];
}

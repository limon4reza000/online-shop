export interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle?: string;
  brand: string;
  brandId?: string;
  category: string; // leaf subcategory slug
  categoryId?: string;
  price: number;
  oldPrice?: number;
  deliveryCharge: number;
  vat: number;
  rating: number;
  reviewCount: number;
  images: string[];
  thumbnail?: string;
  video?: string;
  colors?: { name: string; hex: string }[];
  sizes?: string[];
  description: string;
  shortDescription?: string;
  richContent?: string;
  sku?: string;
  productCode?: string;
  weight?: number;
  material?: string;
  warranty?: string;
  returnPolicy?: string;
  stock: number;
  tags: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords?: string;
  createdAt: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  banner?: string;
  featured: boolean;
  isActive: boolean;
  sortOrder: number;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SearchPlaceholder {
  id: string;
  text: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface StoreSettings {
  id: string;
  freeDeliveryEnabled: boolean;
  freeDeliveryThreshold: number;
  shippingBadgeTitle: string;
  shippingBadgeDesc: string;
  returnBadgeTitle: string;
  returnBadgeDesc: string;
  paymentBadgeTitle: string;
  paymentBadgeDesc: string;
  shopSubtitle1: string;
  shopSubtitle2: string;
  shopSubtitle3: string;
  flashSaleEnabled: boolean;
  flashSaleEndsAt: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  whatsappNumber: string | null;
  messengerUrl: string | null;
  updatedAt: string;
}

export interface PromoPopup {
  id: string;
  enabled: boolean;
  title: string;
  message: string;
  imageUrl: string | null;
  buttonText: string | null;
  buttonLink: string | null;
  delaySeconds: number;
  startAt: string | null;
  endAt: string | null;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderRole: 'CUSTOMER' | 'ADMIN';
  senderId: string;
  content: string;
  attachmentUrl: string | null;
  status: 'SENDING' | 'SENT' | 'DELIVERED' | 'SEEN' | 'FAILED';
  createdAt: string;
}

export interface ChatConversation {
  id: string;
  userId: string;
  status: 'OPEN' | 'RESOLVED';
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatConversationSummary extends ChatConversation {
  user: { id: string; name: string; email: string; avatarUrl: string | null };
  lastMessage: ChatMessage | null;
  unreadCount: number;
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
  image?: string;
  icon?: string; // emoji, shown for main categories
  banner?: string;
  bannerImages?: string[];
  isActive?: boolean;
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

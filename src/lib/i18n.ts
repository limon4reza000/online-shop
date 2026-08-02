/**
 * Bengali -> English lookup for static UI chrome (nav, buttons, headings).
 * Product/catalog data and page body copy stay Bengali-only; `t()` returns
 * the original string unchanged when no entry exists here, so it's always
 * safe to wrap new text without adding a translation first.
 */
export const translations: Record<string, string> = {
  // Header
  'হোম': 'Home',
  'শপ': 'Shop',
  'ক্যাটাগরি': 'Categories',
  'আমাদের সম্পর্কে': 'About Us',
  'যোগাযোগ': 'Contact',
  'কার্ট': 'Cart',
  'নোটিফিকেশন': 'Notifications',
  'মেনু খুলুন': 'Open menu',
  'পণ্য খুঁজুন...': 'Search products...',
  'উইশলিস্ট': 'Wishlist',
  'চ্যাট': 'Chat',
  'লাইট মোড': 'Light mode',
  'ডার্ক মোড': 'Dark mode',
  'অ্যাডমিন প্যানেল': 'Admin panel',
  'ড্যাশবোর্ড': 'Dashboard',
  'সাইন আউট': 'Sign out',
  'লগইন': 'Login',
  'রেজিস্টার': 'Register',
  'সহজে কেনাকাটা করুন': 'Shop with ease',

  // Sidebar
  'নারী': 'Women',
  'পুরুষ': 'Men',
  'জুতা': 'Shoes',
  'ব্যাগ': 'Bags',
  'আনুষঙ্গিক': 'Accessories',
  'বিউটি': 'Beauty',
  'ইলেকট্রনিক্স': 'Electronics',
  'শিশু': 'Kids',
  'আমার অ্যাকাউন্ট': 'My Account',
  'আমার অর্ডার': 'My Orders',
  'প্রোফাইল': 'Profile',
  'লাইট': 'Light',
  'ডার্ক': 'Dark',

  // Search bar
  'নিত্যঘরে খুঁজুন ': 'Search নিত্যঘর ',

  // Common buttons
  'এখনই কিনুন': 'Shop Now',
  'কার্টে যোগ করুন': 'Add to Cart',
  'সব দেখুন': 'View All',
  'সব ব্র্যান্ড': 'All Brands',
  'ক্যাটাগরি ঘুরে দেখুন': 'Browse Categories',
  'দ্রুত দেখুন': 'Quick View',
  'বার দেখা হয়েছে': 'views',
  'নতুন': 'New',
  'পছন্দের তালিকা পরিবর্তন করুন': 'Toggle wishlist',
  'ফ্ল্যাশ সেল': 'Flash Sale',
  'অফার শীঘ্রই শেষ হচ্ছে': 'Offer ending soon',
  'সব অফার দেখুন': 'View All Offers',
  'নির্ভরযোগ্য মান': 'Trusted Quality',
  'সেরা টেস্ট': 'Best Taste',
  'প্রিমিয়াম কোয়ালিটি': 'Premium Quality',
  'ভালোবাসায় তৈরি': 'Made with Love',
  'দ্রুত ডেলিভারি': 'Fast Delivery',
  'দ্রুত': 'Fast',
  'ডেলিভারি': 'Delivery',
  'প্রতিদিন নতুন কালেকশন': 'New Collection Daily',
  '$৭৫+ অর্ডারে ফ্রি শিপিং': 'Free Shipping on $75+ Orders',
  '১০০% নিরাপদ চেকআউট': '100% Secure Checkout',
  'অ্যাপ ইনস্টল করুন': 'Install App',
  '৳৩০০০+ অর্ডারে ফ্রি ডেলিভারি': 'Free Delivery on ৳3000+ Orders',
  'যোগাযোগ করুন': 'Contact Us',

  // Home section headings/eyebrows/subtitles
  'আজকের বাছাই': "Today's Picks",
  'আমাদের টিমের হাতে বাছাই করা আজকের সেরা পণ্য': "Hand-picked by our team, today's best finds",
  'এখন ট্রেন্ডিং': 'Trending Now',
  'ট্রেন্ডিং পণ্য': 'Trending Products',
  'এই সপ্তাহে সবাই যা কার্টে যোগ করছেন': "What everyone's adding to cart this week",
  'নতুন সংযোজন': 'New Arrivals',
  'নতুন পণ্য': 'New Products',
  'সদ্য আসা সতেজ সব স্টাইল': 'Fresh styles, just landed',
  'গ্রাহকদের পছন্দ': "Customers' Choice",
  'বেস্ট সেলার': 'Best Sellers',
  'আমাদের সম্প্রদায়ের বারবার পছন্দের পণ্য': "Our community's repeat favorites",
  'বাজেট কালেকশন': 'Budget Collection',
  'সাশ্রয়ী দামে দারুণ সব পছন্দ': 'Great picks at friendly prices',
  'যাদের আস্থা পেয়েছি': 'Brands We Trust',
  'বিশেষ ব্র্যান্ড': 'Featured Brands',
  'নারী ফ্যাশন': "Women's Fashion",
  'উইমেনস কালেকশন': "Women's Collection",
  'আজকের জন্য বাছাই করা নারী ফ্যাশন': "Today's picks in women's fashion",
  'বিউটি ও আনুষঙ্গিক': 'Beauty & Accessories',
  'বিউটি ও অ্যাক্সেসরিজ': 'Beauty & Accessories',
  'নিজেকে সাজিয়ে তুলুন প্রতিদিন': 'Style yourself, every day',
  'আপনার জন্য বাছাই': 'Picked For You',
  'সুপারিশকৃত পণ্য': 'Recommended Products',
  'আপনার পছন্দ অনুযায়ী সাজানো': 'Curated to your taste',
  'নতুন সিজনের সংগ্রহ': 'New Season Collection',
  'সেরা স্টাইল': 'Best Style',
  'সেরা মুড': 'Best Mood',
  'প্রিমিয়াম ফ্যাশন, বাছাই করা ক্যাপসুল কালেকশন এবং চিরায়ত অত্যাবশ্যকীয় পণ্য আবিষ্কার করুন — প্রতিটি দিনকে বিশেষ করে তুলতে সাজানো।':
    'Discover premium fashion, curated capsule collections, and timeless essentials — styled to make every day special.',
  'বাছাই করা কালেকশন': 'Curated Collection',
  'চিরায়ত ছোঁয়া': 'Timeless Touch',
  'আধুনিক ধাঁচ': 'Modern Edge',
  'দীর্ঘস্থায়ী হওয়ার জন্য বানানো ওয়ারড্রোব স্টেপলের একটি মার্জিত সংগ্রহ — সযত্নে সংগৃহীত, সহজেই বহুমুখী।':
    'An elegant collection of wardrobe staples built to last — thoughtfully sourced, effortlessly versatile.',
  'শুধু সদস্যদের জন্য': 'Members Only',
  'যুক্ত হয়ে': 'Join & Get',
  '১০% সাশ্রয়': '10% Off',
  'ফ্রি অ্যাকাউন্ট তৈরি করুন এবং আগাম অ্যাক্সেস, একচেটিয়া মূল্য ও দ্রুত চেকআউটের সুবিধা উপভোগ করুন।':
    'Create a free account and enjoy early access, exclusive pricing, and faster checkout.',

  // Footer
  'গ্রাহক সহায়তা': 'Customer Support',
  'সাধারণ জিজ্ঞাসা': 'FAQ',
  'অর্ডার ট্র্যাকিং': 'Order Tracking',
  'শিপিং ও রিটার্ন': 'Shipping & Returns',
  'দ্রুত লিংক': 'Quick Links',
  'আইনি তথ্য': 'Legal',
  'প্রাইভেসি পলিসি': 'Privacy Policy',
  'শর্তাবলী': 'Terms & Conditions',
  'আধুনিক ওয়ারড্রোবের জন্য বাছাই করা প্রিমিয়াম ফ্যাশন ও লাইফস্টাইল পণ্য। মার্জিত ডিজাইন, নির্ভেজাল মান, আপনার দোরগোড়ায় পৌঁছে যায়।':
    'Curated premium fashion and lifestyle picks for the modern wardrobe. Elegant design, honest quality, delivered to your door.',
  'সর্বস্বত্ব সংরক্ষিত।': 'All rights reserved.',
  'ভিসা · মাস্টারকার্ড · অ্যামেক্স · পেপ্যাল · অ্যাপল পে': 'Visa · Mastercard · Amex · PayPal · Apple Pay',
};

export function translate(text: string, language: 'bn' | 'en'): string {
  if (language === 'bn') return text;
  return translations[text] ?? text;
}

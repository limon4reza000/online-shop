import type { Product, Category, Review, Order } from './types';

const img = (seed: string, w = 800, h = 1000) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

// 3-level category tree: Main Category -> Sub Category -> Products.
// Flat array; `parentSlug` unset = main category, set = subcategory of that main category.
const categoryTree: { name: string; slug: string; icon: string; children: { name: string; slug: string }[] }[] = [
  {
    name: 'ফ্যাশন', slug: 'fashion', icon: 'shirt',
    children: [
      { name: 'শাড়ি', slug: 'saree' },
      { name: 'থ্রি-পিস', slug: 'three-piece' },
      { name: 'কুর্তি', slug: 'kurti' },
      { name: 'টপস', slug: 'tops' },
      { name: 'টি-শার্ট', slug: 't-shirt' },
      { name: 'জিন্স', slug: 'jeans' },
      { name: 'হিজাব', slug: 'hijab' },
      { name: 'হ্যান্ডব্যাগ', slug: 'handbag' },
      { name: 'ভ্যানিটি ব্যাগ', slug: 'vanity-bag' },
      { name: 'সানগ্লাস', slug: 'sunglasses' },
    ],
  },
  {
    name: 'ইনারওয়্যার', slug: 'innerwear', icon: 'vest',
    children: [
      { name: 'বক্ষবন্ধনী (ব্রা)', slug: 'bra' },
      { name: 'আন্ডারওয়্যার', slug: 'underwear' },
    ],
  },
  {
    name: 'জুয়েলারি', slug: 'jewelry', icon: 'gem',
    children: [
      { name: 'আংটি', slug: 'ring' },
      { name: 'নেকলেস', slug: 'necklace' },
      { name: 'কানের দুল', slug: 'earrings' },
      { name: 'ব্রেসলেট', slug: 'bracelet' },
      { name: 'পায়েল', slug: 'anklet' },
      { name: 'ঘড়ি', slug: 'watch' },
    ],
  },
  {
    name: 'বিউটি', slug: 'beauty', icon: 'wand-magic-sparkles',
    children: [
      { name: 'মেকআপ', slug: 'makeup' },
      { name: 'লিপস্টিক', slug: 'lipstick' },
      { name: 'ফাউন্ডেশন', slug: 'foundation' },
      { name: 'আইলাইনার', slug: 'eyeliner' },
      { name: 'মাসকারা', slug: 'mascara' },
      { name: 'ব্লাশ', slug: 'blush' },
      { name: 'নেইল পলিশ', slug: 'nail-polish' },
    ],
  },
  {
    name: 'বডি অ্যান্ড স্কিন কেয়ার', slug: 'body-skin-care', icon: 'spa',
    children: [
      { name: 'ফেসওয়াশ', slug: 'face-wash' },
      { name: 'সানস্ক্রিন', slug: 'sunscreen' },
      { name: 'স্কিন কেয়ার', slug: 'skin-care' },
      { name: 'বডি লোশন', slug: 'body-lotion' },
      { name: 'পারফিউম', slug: 'perfume' },
      { name: 'বডি স্প্রে', slug: 'body-spray' },
    ],
  },
  {
    name: 'হেয়ার কেয়ার', slug: 'hair-care', icon: 'scissors',
    children: [
      { name: 'শ্যাম্পু', slug: 'shampoo' },
      { name: 'কন্ডিশনার', slug: 'conditioner' },
      { name: 'হেয়ার অয়েল', slug: 'hair-oil' },
      { name: 'হেয়ার সিরাম', slug: 'hair-serum' },
      { name: 'হেয়ার মাস্ক', slug: 'hair-mask' },
      { name: 'হেয়ার কালার', slug: 'hair-color' },
      { name: 'হেয়ার অ্যাকসেসরিজ', slug: 'hair-accessories' },
    ],
  },
  {
    name: 'গ্রুমিং প্রোডাক্টস', slug: 'grooming', icon: 'pump-soap',
    children: [
      { name: 'বডি রেজার', slug: 'body-razor' },
      { name: 'এপিলেটর', slug: 'epilator' },
      { name: 'ট্রিমার', slug: 'trimmer' },
      { name: 'অন্যান্য', slug: 'grooming-others' },
    ],
  },
  {
    name: 'কিডস', slug: 'kids', icon: 'baby-carriage',
    children: [
      { name: 'বেবি ড্রেস', slug: 'baby-dress' },
      { name: 'বেবি জুতা', slug: 'baby-shoes' },
      { name: 'স্কুল ব্যাগ', slug: 'school-bag' },
      { name: 'খেলনা', slug: 'toys' },
      { name: 'ফিডিং বোতল', slug: 'feeding-bottle' },
      { name: 'বেবি কেয়ার', slug: 'baby-care' },
    ],
  },
  {
    name: 'হোম ডেকোর', slug: 'home-decor', icon: 'couch',
    children: [
      { name: 'দেয়াল সজ্জা', slug: 'wall-decor' },
      { name: 'আর্টিফিশিয়াল প্লান্ট', slug: 'artificial-plant' },
      { name: 'ফুলদানি', slug: 'vase' },
      { name: 'টেবিল সজ্জা', slug: 'table-decor' },
      { name: 'আলোসজ্জা', slug: 'lighting' },
      { name: 'পর্দা', slug: 'curtain' },
      { name: 'কিচেন অ্যাকসেসরিজ', slug: 'kitchen-accessories' },
      { name: 'স্টোরেজ ও অর্গানাইজার', slug: 'storage-organizer' },
    ],
  },
];

// Flat list of every main + sub category. Products are tagged against subcategory slugs.
export const categories: Category[] = categoryTree.flatMap((main) => [
  { id: `c-${main.slug}`, name: main.name, slug: main.slug, icon: main.icon, image: img(`cat-${main.slug}`, 600, 700), count: main.children.length, parentSlug: null },
  ...main.children.map((sub) => ({
    id: `c-${main.slug}-${sub.slug}`,
    name: sub.name,
    slug: sub.slug,
    image: img(`cat-${sub.slug}`, 600, 700),
    count: 0,
    parentSlug: main.slug,
  })),
]);

export const mainCategories = categories.filter((c) => !c.parentSlug);
export const getSubCategories = (parentSlug: string) => categories.filter((c) => c.parentSlug === parentSlug);
const leafCategorySlugs = categories.filter((c) => c.parentSlug).map((c) => c.slug);

export const brands = ['Aurelia', 'Nord & Co', 'Velvet Row', 'Marchetti', 'Lumen', 'Pacifica', 'Stelle', 'Onyx Lab'];

const colorSets = [
  [{ name: 'ব্লাশ পিংক', hex: '#F778A1' }, { name: 'কালো', hex: '#1F2937' }, { name: 'আইভরি', hex: '#F5EFE6' }],
  [{ name: 'স্যান্ড', hex: '#D8C3A5' }, { name: 'নেভি', hex: '#1E3A5F' }],
  [{ name: 'রোজ', hex: '#E8A5B0' }, { name: 'চারকোল', hex: '#374151' }, { name: 'সেজ', hex: '#9CAF88' }],
];

// English slugs are preserved for routing/URLs; display names below are Bengali.
const slugSource = [
  'Silk Wrap Midi Dress', 'Tailored Wool Blazer', 'Cloud Knit Sweater', 'Classic Trench Coat',
  'Leather Ankle Boots', 'Suede Chelsea Boots', 'Minimalist Sneakers', 'Running Performance Sneakers',
  'Structured Tote Bag', 'Quilted Crossbody Bag', 'Woven Leather Belt', 'Gold Hoop Earrings',
  'Aviator Sunglasses', 'Cat-Eye Sunglasses', 'Cashmere Scarf', 'Chrono Steel Watch',
  'Rose Petal Eau de Parfum', 'Matte Velvet Lipstick Set', 'Wireless Noise-Cancel Headphones', 'Smart Fitness Band',
  'Linen Blend Shirt', 'Slim Fit Chinos', 'Kids Denim Overalls', 'Kids Cotton Sneakers',
];

const names = [
  'সিল্ক র‍্যাপ মিডি ড্রেস', 'টেইলর্ড উল ব্লেজার', 'ক্লাউড নিট সোয়েটার', 'ক্লাসিক ট্রেঞ্চ কোট',
  'লেদার অ্যাংকল বুট', 'সুয়েড চেলসি বুট', 'মিনিমালিস্ট স্নিকার্স', 'রানিং পারফরম্যান্স স্নিকার্স',
  'স্ট্রাকচার্ড টোট ব্যাগ', 'কুইল্টেড ক্রসবডি ব্যাগ', 'বোনা লেদার বেল্ট', 'গোল্ড হুপ কানের দুল',
  'এভিয়েটর সানগ্লাস', 'ক্যাট-আই সানগ্লাস', 'ক্যাশমিয়ার স্কার্ফ', 'ক্রোনো স্টিল ঘড়ি',
  'রোজ পেটাল ও দ্য পারফিউম', 'ম্যাট ভেলভেট লিপস্টিক সেট', 'ওয়্যারলেস নয়েজ-ক্যান্সেল হেডফোন', 'স্মার্ট ফিটনেস ব্যান্ড',
  'লিনেন ব্লেন্ড শার্ট', 'স্লিম ফিট চিনো প্যান্ট', 'শিশুদের ডেনিম ওভারঅল', 'শিশুদের কটন স্নিকার্স',
];

export const products: Product[] = names.map((name, i) => {
  const id = `p${i + 1}`;
  const catSlug = leafCategorySlugs[i % leafCategorySlugs.length];
  const price = Math.round((39 + (i * 13) % 260) - 0.01) + 0.99;
  const hasDiscount = i % 3 !== 2;
  const oldPrice = hasDiscount ? Math.round(price * (1.2 + (i % 4) * 0.08)) - 0.01 : undefined;
  const seed = `product-${i + 1}`;
  return {
    id,
    slug: slugSource[i].toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name,
    brand: brands[i % brands.length],
    category: catSlug,
    price,
    oldPrice,
    deliveryCharge: 60,
    vat: Math.round(price * 0.08 * 100) / 100,
    rating: Math.round((3.6 + ((i * 7) % 14) / 10) * 10) / 10,
    reviewCount: 12 + ((i * 31) % 340),
    images: [img(seed, 900, 1100), img(seed + '-b', 900, 1100), img(seed + '-c', 900, 1100), img(seed + '-d', 900, 1100)],
    colors: colorSets[i % colorSets.length],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description:
      'সূক্ষ্ম কারুকার্য ও প্রিমিয়াম উপকরণে তৈরি এই পণ্যটি চিরায়ত ডিজাইনের সাথে দৈনন্দিন স্বাচ্ছন্দ্যের নিখুঁত মেলবন্ধন। দিন থেকে রাত—যেকোনো উপলক্ষে অনায়াসে মানিয়ে যাওয়া মার্জিত, বহুমুখী সিলুয়েট দিয়ে আপনার ওয়ারড্রোবকে করে তুলবে আরও অভিজাত।',
    stock: (i * 5) % 20,
    tags: [
      i % 4 === 0 ? 'bestseller' : '',
      i % 5 === 0 ? 'new' : '',
      i % 3 === 0 ? 'trending' : '',
      i % 6 === 0 ? 'flash-sale' : '',
    ].filter(Boolean),
    createdAt: new Date(Date.now() - i * 86400000 * 2).toISOString(),
  };
});

// Backfill category counts now that `products` exists (main category count = sum of its subcategories).
for (const c of categories) {
  if (c.parentSlug) c.count = products.filter((p) => p.category === c.slug).length;
}
for (const c of categories) {
  if (!c.parentSlug) c.count = getSubCategories(c.slug).reduce((sum, s) => sum + s.count, 0);
}

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
export const getRelated = (p: Product, count = 4) =>
  products.filter((x) => x.category === p.category && x.id !== p.id).slice(0, count);

export const reviews: Review[] = Array.from({ length: 18 }).map((_, i) => ({
  id: `r${i + 1}`,
  productId: products[i % products.length].id,
  author: ['আমেলিয়া চৌধুরী', 'সোফিয়া আক্তার', 'লিয়াম হোসেন', 'মায়া পাটেল', 'ইথান ব্রুকস', 'ইসলা ফন্টেইন'][i % 6],
  avatar: img(`avatar-${i}`, 100, 100),
  rating: 3 + (i % 3),
  date: new Date(Date.now() - i * 86400000 * 5).toISOString(),
  title: ['একদম মুগ্ধ হয়ে গেছি', 'দারুণ মানের', 'প্রত্যাশার চেয়েও ভালো', 'প্রতিটি টাকা সার্থক', 'আবারও কিনব', 'অসাধারণ কারুকার্য'][i % 6],
  body: 'ফিটিং একদম নিখুঁত আর কাপড়ের মান অসাধারণ প্রিমিয়াম মনে হয়েছে। দ্রুত ডেলিভারি পেয়েছি এবং প্যাকেজিংও ছিল বেশ সুন্দর। যারা এখনও দ্বিধায় আছেন, তাদের জন্য জোরালো সুপারিশ রইল।',
  verified: i % 3 !== 0,
}));

export const testimonials = [
  { id: 't1', author: 'আমেলিয়া চৌধুরী', avatar: img('t1', 100, 100), rating: 5, body: 'এযাবৎকালের সেরা অনলাইন শপিং অভিজ্ঞতা। দ্রুত ডেলিভারি, চমৎকার প্যাকেজিং, আর মান একেবারে অতুলনীয়।' },
  { id: 't2', author: 'দানিয়েল করিম', avatar: img('t2', 100, 100), rating: 5, body: 'কাস্টমার সাপোর্ট অত্যন্ত দ্রুত সাড়া দিয়েছে এবং পণ্যগুলো সরাসরি দেখতে আরও সুন্দর লেগেছে। এখন এটাই আমার প্রিয় স্টোর।' },
  { id: 't3', author: 'প্রিয়া শর্মা', avatar: img('t3', 100, 100), rating: 4, body: 'পুরো সাইট জুড়েই একটা প্রিমিয়াম অনুভূতি। চেকআউট ছিল ঝামেলাহীন আর অর্ডার ট্র্যাকিংও একদম নির্ভুল।' },
  { id: 't4', author: 'মার্কাস কোল', avatar: img('t4', 100, 100), rating: 5, body: 'সবসময়ই উচ্চমানের পণ্য পেয়েছি। এ পর্যন্ত পাঁচবার অর্ডার করেছি এবং প্রতিটি পণ্যই সাইজ ও ছবির সাথে হুবহু মিলেছে।' },
];

export const instagramImages = Array.from({ length: 6 }).map((_, i) => img(`insta-${i}`, 500, 500));

export const mockOrders: Order[] = [
  { id: 'ORD-83421', date: new Date(Date.now() - 2 * 86400000).toISOString(), status: 'out-for-delivery', total: 214.5, items: [{ productId: 'p1', quantity: 1, price: 129.99 }, { productId: 'p12', quantity: 1, price: 84.51 }] },
  { id: 'ORD-77102', date: new Date(Date.now() - 12 * 86400000).toISOString(), status: 'delivered', total: 96.0, items: [{ productId: 'p7', quantity: 2, price: 48.0 }] },
  { id: 'ORD-69934', date: new Date(Date.now() - 30 * 86400000).toISOString(), status: 'delivered', total: 342.75, items: [{ productId: 'p16', quantity: 1, price: 249.99 }, { productId: 'p3', quantity: 1, price: 92.76 }] },
  { id: 'ORD-51280', date: new Date(Date.now() - 55 * 86400000).toISOString(), status: 'cancelled', total: 58.0, items: [{ productId: 'p22', quantity: 1, price: 58.0 }] },
];

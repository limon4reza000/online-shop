import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const CATEGORY_TREE: { name: string; slug: string; icon: string; children: { name: string; slug: string }[] }[] = [
  {
    name: 'ফ্যাশন', slug: 'fashion', icon: '👗',
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
    name: 'ইনারওয়্যার', slug: 'innerwear', icon: '👙',
    children: [
      { name: 'বক্ষবন্ধনী (ব্রা)', slug: 'bra' },
      { name: 'আন্ডারওয়্যার', slug: 'underwear' },
    ],
  },
  {
    name: 'জুয়েলারি', slug: 'jewelry', icon: '💍',
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
    name: 'বিউটি', slug: 'beauty', icon: '💄',
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
    name: 'বডি অ্যান্ড স্কিন কেয়ার', slug: 'body-skin-care', icon: '🧴',
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
    name: 'হেয়ার কেয়ার', slug: 'hair-care', icon: '💇',
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
    name: 'গ্রুমিং প্রোডাক্টস', slug: 'grooming', icon: '🪒',
    children: [
      { name: 'বডি রেজার', slug: 'body-razor' },
      { name: 'এপিলেটর', slug: 'epilator' },
      { name: 'ট্রিমার', slug: 'trimmer' },
      { name: 'অন্যান্য', slug: 'grooming-others' },
    ],
  },
  {
    name: 'কিডস', slug: 'kids', icon: '🧸',
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
    name: 'হোম ডেকোর', slug: 'home-decor', icon: '🏡',
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

async function main() {
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  await prisma.user.upsert({
    where: { email: 'admin@nityaghor.com' },
    update: {},
    create: { name: 'Admin', email: 'admin@nityaghor.com', password: adminPassword, role: 'ADMIN', emailVerified: true },
  });

  const leafCategories: { id: string; slug: string }[] = [];
  for (let i = 0; i < CATEGORY_TREE.length; i++) {
    const main = CATEGORY_TREE[i];
    const mainCategory = await prisma.category.upsert({
      where: { slug: main.slug },
      update: { name: main.name, icon: main.icon, sortOrder: i },
      create: { name: main.name, slug: main.slug, icon: main.icon, sortOrder: i },
    });

    for (let j = 0; j < main.children.length; j++) {
      const sub = main.children[j];
      const subCategory = await prisma.category.upsert({
        where: { slug: sub.slug },
        update: { name: sub.name, parentId: mainCategory.id, sortOrder: j },
        create: {
          name: sub.name,
          slug: sub.slug,
          parentId: mainCategory.id,
          sortOrder: j,
          image: `https://picsum.photos/seed/cat-${sub.slug}/400/400`,
        },
      });
      leafCategories.push({ id: subCategory.id, slug: subCategory.slug });
    }
  }

  const brands = await Promise.all(
    ['Aurelia', 'Nord & Co', 'Velvet Row', 'Marchetti'].map((name) =>
      prisma.brand.upsert({ where: { name }, update: {}, create: { name } })
    )
  );

  const existingProducts = await prisma.product.count();
  if (existingProducts === 0) {
    await Promise.all(
      Array.from({ length: 12 }).map((_, i) => {
        const category = leafCategories[i % leafCategories.length];
        return prisma.product.create({
          data: {
            name: `Sample Product ${i + 1}`,
            slug: `sample-product-${i + 1}`,
            shortDescription: 'একটি প্রিমিয়াম নমুনা পণ্য।',
            description: 'A premium sample product generated by the seed script — replace with real catalog data.',
            price: 49.99 + i * 5,
            oldPrice: i % 2 === 0 ? 69.99 + i * 5 : null,
            deliveryCharge: 60,
            vat: Math.round((49.99 + i * 5) * 0.08 * 100) / 100,
            stock: 10 + i,
            sku: `SKU-${1000 + i}`,
            images: [`https://picsum.photos/seed/seed-${i}/900/1100`],
            categoryId: category.id,
            brandId: brands[i % brands.length].id,
            tags: i % 3 === 0 ? ['bestseller'] : [],
            isFeatured: i % 4 === 0,
            isBestSeller: i % 3 === 0,
            isNewArrival: i % 5 === 0,
          },
        });
      })
    );
  }

  const defaultPlaceholders = [
    'শাড়ি', 'চুড়ি', 'আংটি', 'ঘড়ি', 'কানের দুল', 'নেকলেস', 'ব্রেসলেট', 'কসমেটিকস', 'সানগ্লাস', 'ফেসওয়াশ',
    'মেকআপ', 'স্কিন কেয়ার', 'পারফিউম', 'নেইল পলিশ', 'লিপস্টিক', 'হ্যান্ডব্যাগ', 'ভ্যানিটি ব্যাগ', 'ওয়ালেট',
    'থ্রি-পিস', 'টু-পিস', 'হিজাব', 'নিকাব', 'বাচ্চাদের পোশাক', 'ডায়াপার', 'বেবি কেয়ার',
    'ফিডিং বোতল', 'বেবি টয়', 'বেবিদের জুতা',
  ];
  const existingPlaceholders = await prisma.searchPlaceholder.count();
  if (existingPlaceholders === 0) {
    await prisma.searchPlaceholder.createMany({
      data: defaultPlaceholders.map((text, i) => ({ text, sortOrder: i, isActive: true })),
    });
  }

  console.log('Seed complete. Admin login: admin@nityaghor.com / Admin123!');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

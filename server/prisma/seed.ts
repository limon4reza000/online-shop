import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const CATEGORY_TREE: { name: string; slug: string; icon: string; children: { name: string; slug: string; icon: string }[] }[] = [
  {
    name: 'ফ্যাশন', slug: 'fashion', icon: 'shirt',
    children: [
      { name: 'শাড়ি', slug: 'saree', icon: 'person-dress' },
      { name: 'থ্রি-পিস', slug: 'three-piece', icon: 'person-dress' },
      { name: 'কুর্তি', slug: 'kurti', icon: 'shirt' },
      { name: 'টপস', slug: 'tops', icon: 'shirt' },
      { name: 'টি-শার্ট', slug: 't-shirt', icon: 'shirt' },
      { name: 'জিন্স', slug: 'jeans', icon: 'shirt' },
      { name: 'হিজাব', slug: 'hijab', icon: 'hijab' },
      { name: 'হ্যান্ডব্যাগ', slug: 'handbag', icon: 'bag-shopping' },
      { name: 'ভ্যানিটি ব্যাগ', slug: 'vanity-bag', icon: 'suitcase' },
      { name: 'সানগ্লাস', slug: 'sunglasses', icon: 'glasses' },
    ],
  },
  {
    name: 'ইনারওয়্যার', slug: 'innerwear', icon: 'vest',
    children: [
      { name: 'বক্ষবন্ধনী (ব্রা)', slug: 'bra', icon: 'bra' },
      { name: 'আন্ডারওয়্যার', slug: 'underwear', icon: 'underwear' },
    ],
  },
  {
    name: 'জুয়েলারি', slug: 'jewelry', icon: 'gem',
    children: [
      { name: 'আংটি', slug: 'ring', icon: 'ring' },
      { name: 'নেকলেস', slug: 'necklace', icon: 'necklace' },
      { name: 'কানের দুল', slug: 'earrings', icon: 'earrings' },
      { name: 'ব্রেসলেট', slug: 'bracelet', icon: 'bracelet' },
      { name: 'পায়েল', slug: 'anklet', icon: 'bracelet' },
      { name: 'ঘড়ি', slug: 'watch', icon: 'clock' },
    ],
  },
  {
    name: 'বিউটি', slug: 'beauty', icon: 'wand-magic-sparkles',
    children: [
      { name: 'মেকআপ', slug: 'makeup', icon: 'paintbrush' },
      { name: 'লিপস্টিক', slug: 'lipstick', icon: 'lipstick' },
      { name: 'ফাউন্ডেশন', slug: 'foundation', icon: 'bottle-droplet' },
      { name: 'আইলাইনার', slug: 'eyeliner', icon: 'pencil' },
      { name: 'মাসকারা', slug: 'mascara', icon: 'paintbrush' },
      { name: 'ব্লাশ', slug: 'blush', icon: 'palette' },
      { name: 'নেইল পলিশ', slug: 'nail-polish', icon: 'nail-polish' },
    ],
  },
  {
    name: 'বডি অ্যান্ড স্কিন কেয়ার', slug: 'body-skin-care', icon: 'spa',
    children: [
      { name: 'ফেসওয়াশ', slug: 'face-wash', icon: 'pump-soap' },
      { name: 'সানস্ক্রিন', slug: 'sunscreen', icon: 'sun' },
      { name: 'স্কিন কেয়ার', slug: 'skin-care', icon: 'spa' },
      { name: 'বডি লোশন', slug: 'body-lotion', icon: 'bottle-droplet' },
      { name: 'পারফিউম', slug: 'perfume', icon: 'flask' },
      { name: 'বডি স্প্রে', slug: 'body-spray', icon: 'spray-can-sparkles' },
    ],
  },
  {
    name: 'হেয়ার কেয়ার', slug: 'hair-care', icon: 'scissors',
    children: [
      { name: 'শ্যাম্পু', slug: 'shampoo', icon: 'pump-soap' },
      { name: 'কন্ডিশনার', slug: 'conditioner', icon: 'bottle-droplet' },
      { name: 'হেয়ার অয়েল', slug: 'hair-oil', icon: 'vial' },
      { name: 'হেয়ার সিরাম', slug: 'hair-serum', icon: 'vial' },
      { name: 'হেয়ার মাস্ক', slug: 'hair-mask', icon: 'mask' },
      { name: 'হেয়ার কালার', slug: 'hair-color', icon: 'palette' },
      { name: 'হেয়ার অ্যাকসেসরিজ', slug: 'hair-accessories', icon: 'gem' },
    ],
  },
  {
    name: 'গ্রুমিং প্রোডাক্টস', slug: 'grooming', icon: 'pump-soap',
    children: [
      { name: 'বডি রেজার', slug: 'body-razor', icon: 'body-razor' },
      { name: 'এপিলেটর', slug: 'epilator', icon: 'bolt-lightning' },
      { name: 'ট্রিমার', slug: 'trimmer', icon: 'scissors' },
      { name: 'অন্যান্য', slug: 'grooming-others', icon: 'tag' },
    ],
  },
  {
    name: 'কিডস', slug: 'kids', icon: 'baby-carriage',
    children: [
      { name: 'বেবি ড্রেস', slug: 'baby-dress', icon: 'baby' },
      { name: 'বেবি জুতা', slug: 'baby-shoes', icon: 'shoe-prints' },
      { name: 'স্কুল ব্যাগ', slug: 'school-bag', icon: 'bag-shopping' },
      { name: 'খেলনা', slug: 'toys', icon: 'puzzle-piece' },
      { name: 'ফিডিং বোতল', slug: 'feeding-bottle', icon: 'bottle-water' },
      { name: 'বেবি কেয়ার', slug: 'baby-care', icon: 'baby-carriage' },
    ],
  },
  {
    name: 'হোম ডেকোর', slug: 'home-decor', icon: 'couch',
    children: [
      { name: 'দেয়াল সজ্জা', slug: 'wall-decor', icon: 'images' },
      { name: 'আর্টিফিশিয়াল প্লান্ট', slug: 'artificial-plant', icon: 'seedling' },
      { name: 'ফুলদানি', slug: 'vase', icon: 'wine-bottle' },
      { name: 'টেবিল সজ্জা', slug: 'table-decor', icon: 'table' },
      { name: 'আলোসজ্জা', slug: 'lighting', icon: 'lightbulb' },
      { name: 'পর্দা', slug: 'curtain', icon: 'tag' },
      { name: 'কিচেন অ্যাকসেসরিজ', slug: 'kitchen-accessories', icon: 'utensils' },
      { name: 'স্টোরেজ ও অর্গানাইজার', slug: 'storage-organizer', icon: 'box-archive' },
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
      update: {
        name: main.name,
        icon: main.icon,
        sortOrder: i,
        image: `https://picsum.photos/seed/cat-${main.slug}/600/700`,
        banner: `https://picsum.photos/seed/banner-${main.slug}/1600/500`,
      },
      create: {
        name: main.name,
        slug: main.slug,
        icon: main.icon,
        sortOrder: i,
        image: `https://picsum.photos/seed/cat-${main.slug}/600/700`,
        banner: `https://picsum.photos/seed/banner-${main.slug}/1600/500`,
      },
    });

    for (let j = 0; j < main.children.length; j++) {
      const sub = main.children[j];
      const subCategory = await prisma.category.upsert({
        where: { slug: sub.slug },
        update: {
          name: sub.name, icon: sub.icon, parentId: mainCategory.id, sortOrder: j,
          bannerImages: [
            `https://picsum.photos/seed/subbanner-${sub.slug}-1/1600/600`,
            `https://picsum.photos/seed/subbanner-${sub.slug}-2/1600/600`,
            `https://picsum.photos/seed/subbanner-${sub.slug}-3/1600/600`,
          ],
        },
        create: {
          name: sub.name,
          slug: sub.slug,
          icon: sub.icon,
          parentId: mainCategory.id,
          sortOrder: j,
          image: `https://picsum.photos/seed/cat-${sub.slug}/400/400`,
          bannerImages: [
            `https://picsum.photos/seed/subbanner-${sub.slug}-1/1600/600`,
            `https://picsum.photos/seed/subbanner-${sub.slug}-2/1600/600`,
            `https://picsum.photos/seed/subbanner-${sub.slug}-3/1600/600`,
          ],
        },
      });
      leafCategories.push({ id: subCategory.id, slug: subCategory.slug });
    }
  }

  const brands = await Promise.all(
  ['Aurelia', 'Nord & Co', 'Velvet Row', 'Marchetti'].map((name) =>
    prisma.brand.upsert({
      where: { name },
      update: {},
      create: {
        name,
        slug: name
          .toLowerCase()
          .replace(/&/g, 'and')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, ''),
      },
    })
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
            tags: [
              i % 3 === 0 ? 'bestseller' : '',
              i % 4 === 1 ? 'trending' : '',
              i % 5 === 2 ? 'flash-sale' : '',
            ].filter(Boolean),
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

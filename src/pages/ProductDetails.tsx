import { useEffect, useMemo, useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { Heart, Share2, Minus, Plus, ShoppingBag, Zap, Truck, RotateCcw, ShieldCheck, ZoomIn, Star } from 'lucide-react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Rating } from '@/components/ui/Rating';
import { ProductCard } from '@/components/ui/ProductCard';
import { QuickViewModal } from '@/components/ui/QuickViewModal';
import { FadeIn } from '@/components/ui/FadeIn';
import { getProduct, getRelated, reviews as allReviews, products, categories } from '@/lib/data';
import { formatPrice, formatDate } from '@/lib/format';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useToast } from '@/context/ToastContext';
import type { Product } from '@/lib/types';

const RECENT_KEY = 'shop-recently-viewed';

export default function ProductDetails() {
  const { slug } = useParams();
  const product = getProduct(slug || '');
  const { addItem } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const { showToast } = useToast();

  const [activeImg, setActiveImg] = useState(0);
  const [color, setColor] = useState(product?.colors?.[0]?.name);
  const [size, setSize] = useState(product?.sizes?.[2]);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<'description' | 'reviews'>('description');
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [zoom, setZoom] = useState(false);

  useEffect(() => {
    if (!product) return;
    setActiveImg(0);
    setColor(product.colors?.[0]?.name);
    setSize(product.sizes?.[2]);
    setQty(1);
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      const ids: string[] = raw ? JSON.parse(raw) : [];
      const next = [product.id, ...ids.filter((id) => id !== product.id)].slice(0, 8);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch { /* noop */ }
  }, [product]);

  const recentlyViewed = useMemo(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      const ids: string[] = raw ? JSON.parse(raw) : [];
      return ids.map((id) => products.find((p) => p.id === id)).filter((p): p is Product => !!p && p.id !== product?.id).slice(0, 4);
    } catch {
      return [];
    }
  }, [product]);

  if (!product) return <Navigate to="/shop" replace />;

  const subCategory = categories.find((c) => c.slug === product.category);
  const mainCategory = subCategory?.parentSlug ? categories.find((c) => c.slug === subCategory.parentSlug) : undefined;
  const related = getRelated(product);
  const productReviews = allReviews.filter((r) => r.productId === product.id);
  const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;
  const inStock = product.stock > 0;

  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    pct: productReviews.length ? Math.round((productReviews.filter((r) => Math.round(r.rating) === star).length / productReviews.length) * 100) : 0,
  }));

  return (
    <>
      <div className="container-app pt-6">
        <Breadcrumbs
          items={[
            { label: 'শপ', to: '/shop' },
            ...(mainCategory ? [{ label: mainCategory.name, to: `/categories/${mainCategory.slug}` }] : []),
            { label: subCategory?.name || product.category, to: `/categories/${product.category}` },
            { label: product.name },
          ]}
        />
      </div>

      <div className="container-app py-8 sm:py-12 grid lg:grid-cols-2 gap-10 lg:gap-14">
        <div>
          <div
            className="relative rounded-3xl overflow-hidden bg-primary-light aspect-square cursor-zoom-in group"
            onClick={() => setZoom((z) => !z)}
          >
            <img
              src={product.images[activeImg]}
              alt={product.name}
              className={`h-full w-full object-cover transition-transform duration-500 ${zoom ? 'scale-150' : 'group-hover:scale-105'}`}
            />
            <span className="absolute bottom-4 right-4 grid place-items-center h-9 w-9 rounded-full bg-white/90 text-text-primary">
              <ZoomIn size={16} />
            </span>
            {discount > 0 && (
              <span className="absolute top-4 left-4 rounded-full bg-primary text-white text-xs font-bold px-3 py-1.5">-{discount}% ছাড়</span>
            )}
          </div>
          <div className="mt-4 grid grid-cols-4 gap-3">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => { setActiveImg(i); setZoom(false); }}
                className={`rounded-xl overflow-hidden aspect-square border-2 transition-all ${activeImg === i ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'}`}
              >
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-text-secondary font-semibold">{product.brand}</p>
          <h1 className="mt-1 text-3xl sm:text-4xl">{product.name}</h1>
          <div className="mt-3 flex items-center gap-3">
            <Rating value={product.rating} count={product.reviewCount} size={16} />
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${inStock ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
              {inStock ? `স্টকে আছে (${product.stock}টি বাকি)` : 'স্টক নেই'}
            </span>
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
            {product.oldPrice && <span className="text-lg text-text-secondary line-through">{formatPrice(product.oldPrice)}</span>}
          </div>

          <p className="mt-5 text-sm text-text-secondary leading-relaxed">{product.description}</p>

          {product.colors && (
            <div className="mt-6">
              <p className="text-sm font-semibold mb-2.5">রঙ: <span className="text-text-secondary font-normal">{color}</span></p>
              <div className="flex gap-2.5">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setColor(c.name)}
                    style={{ backgroundColor: c.hex }}
                    aria-label={c.name}
                    className={`h-9 w-9 rounded-full border-2 transition-all ${color === c.name ? 'border-primary scale-110 shadow-card' : 'border-white shadow-soft'}`}
                  />
                ))}
              </div>
            </div>
          )}

          {product.sizes && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-sm font-semibold">সাইজ: <span className="text-text-secondary font-normal">{size}</span></p>
                <button className="text-xs text-primary font-semibold hover:underline">সাইজ গাইড</button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`h-10 min-w-10 px-3 rounded-xl border text-sm font-semibold transition-colors ${
                      size === s ? 'border-primary bg-primary text-white' : 'border-border hover:border-primary'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-4">
            <p className="text-sm font-semibold">পরিমাণ</p>
            <div className="flex items-center rounded-full border border-border">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-2.5 hover:text-primary"><Minus size={14} /></button>
              <span className="w-10 text-center text-sm font-semibold">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(product.stock || 10, q + 1))} className="p-2.5 hover:text-primary"><Plus size={14} /></button>
            </div>
          </div>

          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <button
              disabled={!inStock}
              onClick={() => addItem({ productId: product.id, quantity: qty, color, size })}
              className="btn-primary flex-1"
            >
              <ShoppingBag size={16} /> কার্টে যোগ করুন
            </button>
            <button
              disabled={!inStock}
              onClick={() => { addItem({ productId: product.id, quantity: qty, color, size }); showToast('চেকআউটে যাওয়া হচ্ছে', 'info'); }}
              className="btn-dark flex-1"
            >
              <Zap size={16} /> এখনই কিনুন
            </button>
            <div className="flex gap-3">
              <button onClick={() => toggle(product.id)} className="grid place-items-center h-12 w-12 rounded-full border border-border hover:border-primary shrink-0 transition-colors">
                <Heart size={18} className={isWishlisted(product.id) ? 'fill-primary text-primary' : ''} />
              </button>
              <button
                onClick={() => { navigator.clipboard?.writeText(window.location.href); showToast('লিংক ক্লিপবোর্ডে কপি হয়েছে', 'success'); }}
                className="grid place-items-center h-12 w-12 rounded-full border border-border hover:border-primary shrink-0 transition-colors"
              >
                <Share2 size={17} />
              </button>
            </div>
          </div>

          <div className="mt-8 grid sm:grid-cols-3 gap-3">
            {[
              { icon: Truck, title: 'ফ্রি শিপিং', desc: '৭৫ ডলারের বেশি অর্ডারে' },
              { icon: RotateCcw, title: '৩০ দিনের রিটার্ন', desc: 'ঝামেলামুক্ত' },
              { icon: ShieldCheck, title: 'নিরাপদ পেমেন্ট', desc: '১০০% সুরক্ষিত' },
            ].map((f) => (
              <div key={f.title} className="flex items-center gap-2.5 rounded-2xl border border-border p-3">
                <f.icon size={20} className="text-primary shrink-0" />
                <div>
                  <p className="text-xs font-semibold">{f.title}</p>
                  <p className="text-[11px] text-text-secondary">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container-app pb-16">
        <div className="flex gap-2 border-b border-border">
          {(['description', 'reviews'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-semibold capitalize border-b-2 transition-colors ${tab === t ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
            >
              {t === 'reviews' ? `রিভিউ (${productReviews.length})` : 'বিবরণ'}
            </button>
          ))}
        </div>

        {tab === 'description' ? (
          <div className="py-8 max-w-3xl text-sm text-text-secondary leading-relaxed space-y-4">
            <p>{product.description}</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>প্রিমিয়াম মানের উপকরণ, নৈতিকভাবে সংগৃহীত</li>
              <li>দৈনন্দিন আরাম ও স্থায়িত্বের জন্য ডিজাইন করা</li>
              <li>মেশিনে ধোয়া যায়, সহজ যত্নের নির্দেশনা সহ</li>
              <li>একাধিক রঙ ও সাইজে পাওয়া যায়</li>
            </ul>
          </div>
        ) : (
          <div className="py-8 grid lg:grid-cols-[280px_1fr] gap-10">
            <div>
              <div className="text-center lg:text-left">
                <p className="text-5xl font-bold">{product.rating.toFixed(1)}</p>
                <Rating value={product.rating} size={16} />
                <p className="text-sm text-text-secondary mt-1">{product.reviewCount}টি রিভিউর ভিত্তিতে</p>
              </div>
              <div className="mt-5 space-y-2">
                {ratingBreakdown.map((r) => (
                  <div key={r.star} className="flex items-center gap-2 text-xs text-text-secondary">
                    <span className="w-8 flex items-center gap-0.5">{r.star} <Star size={10} className="fill-primary text-primary" /></span>
                    <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${r.pct}%` }} />
                    </div>
                    <span className="w-8 text-right">{r.pct}%</span>
                  </div>
                ))}
              </div>
              <button className="btn-outline btn-sm w-full mt-6">একটি রিভিউ লিখুন</button>
            </div>
            <div className="space-y-6">
              {productReviews.length === 0 && <p className="text-sm text-text-secondary">এই পণ্যের জন্য এখনো কোনো রিভিউ নেই।</p>}
              {productReviews.map((r) => (
                <div key={r.id} className="border-b border-border pb-6 last:border-0">
                  <div className="flex items-center gap-3">
                    <img src={r.avatar} alt={r.author} className="h-10 w-10 rounded-full object-cover" />
                    <div>
                      <p className="text-sm font-semibold flex items-center gap-2">
                        {r.author} {r.verified && <span className="text-[10px] bg-success/10 text-success px-2 py-0.5 rounded-full font-medium">যাচাইকৃত</span>}
                      </p>
                      <p className="text-xs text-text-secondary">{formatDate(r.date)}</p>
                    </div>
                  </div>
                  <div className="mt-2"><Rating value={r.rating} size={13} /></div>
                  <p className="mt-1.5 text-sm font-semibold">{r.title}</p>
                  <p className="mt-1 text-sm text-text-secondary leading-relaxed">{r.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {related.length > 0 && (
        <div className="container-app pb-16">
          <FadeIn><h2 className="text-2xl sm:text-3xl mb-6">আপনার পছন্দ হতে পারে</h2></FadeIn>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {related.map((p) => <ProductCard key={p.id} product={p} onQuickView={setQuickView} />)}
          </div>
        </div>
      )}

      {recentlyViewed.length > 0 && (
        <div className="container-app pb-16">
          <h2 className="text-2xl sm:text-3xl mb-6">সম্প্রতি দেখা হয়েছে</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {recentlyViewed.map((p) => <ProductCard key={p.id} product={p} onQuickView={setQuickView} />)}
          </div>
        </div>
      )}

      <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />
    </>
  );
}

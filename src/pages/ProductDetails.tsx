import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, Navigate, Link } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Heart, Share2, Minus, Plus, ShoppingBag, ShoppingCart, X, Zap, Truck, RotateCcw, ShieldCheck, ZoomIn } from 'lucide-react';
import { Rating } from '@/components/ui/Rating';
import { ProductCard } from '@/components/ui/ProductCard';
import { QuickViewModal } from '@/components/ui/QuickViewModal';
import { FadeIn } from '@/components/ui/FadeIn';
import { useProduct, useRelatedProducts } from '@/hooks/useProducts';
import { useCategoryTree } from '@/hooks/useCategories';
import { usePublicStoreSettings } from '@/hooks/useSettings';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { formatPrice } from '@/lib/format';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useToast } from '@/context/ToastContext';
import type { Product } from '@/lib/types';

export default function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useProduct(slug);
  const product = data?.product;
  const { data: related = [] } = useRelatedProducts(slug);
  const { categories } = useCategoryTree();
  const { addItem, itemCount } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const { showToast } = useToast();
  const { data: storeSettings } = usePublicStoreSettings();
  const { trackView } = useRecentlyViewed();

  const [activeImg, setActiveImg] = useState(0);
  const [color, setColor] = useState(product?.colors?.[0]?.name);
  const [size, setSize] = useState(product?.sizes?.[2]);
  const [qty, setQty] = useState(1);
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);

  useEffect(() => {
    if (!product) return;
    setActiveImg(0);
    setColor(product.colors?.[0]?.name);
    setSize(product.sizes?.[2]);
    setQty(1);
    trackView(product.id);
    // trackView is stable per auth state, but not memoized across renders — track by product only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  useEffect(() => {
    document.body.style.overflow = fullscreenOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [fullscreenOpen]);

  if (isLoading) return null;
  if (!product) return <Navigate to="/shop" replace />;

  const subCategory = categories.find((c) => c.slug === product.category);
  const mainCategory = subCategory?.parentSlug ? categories.find((c) => c.slug === subCategory.parentSlug) : undefined;
  const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;
  const savings = product.oldPrice ? product.oldPrice - product.price : 0;
  const inStock = product.stock > 0;

  return (
    <>
      <div className="sticky top-0 z-40 bg-white border-b border-border">
        <div className="container-app h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate(-1)}
              aria-label="পেছনে যান"
              className="grid place-items-center h-9 w-9 rounded-full hover:bg-primary-light text-text-primary transition-colors shrink-0"
            >
              <ArrowLeft size={18} />
            </button>
            <span className="text-sm font-semibold truncate">{product.name}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => { navigator.clipboard?.writeText(window.location.href); showToast('লিংক ক্লিপবোর্ডে কপি হয়েছে', 'success'); }}
              aria-label="শেয়ার করুন"
              className="grid place-items-center h-9 w-9 rounded-full hover:bg-primary-light text-text-primary transition-colors"
            >
              <Share2 size={17} />
            </button>
            <Link to="/cart" aria-label="কার্ট" className="relative grid place-items-center h-9 w-9 rounded-full hover:bg-primary-light text-text-primary transition-colors">
              <ShoppingCart size={18} />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4.5 min-w-4.5 px-1 grid place-items-center rounded-full bg-primary text-white text-[10px] font-bold">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      <div className="container-app py-6 sm:py-10 grid lg:grid-cols-2 gap-8 lg:gap-14">
        <div>
          <div
            className="relative rounded-3xl overflow-hidden bg-primary-light aspect-square cursor-zoom-in group"
            onClick={() => setFullscreenOpen(true)}
          >
            <img
              src={product.images[activeImg]}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span className="absolute bottom-4 right-4 grid place-items-center h-9 w-9 rounded-full bg-white/90 text-text-primary">
              <ZoomIn size={16} />
            </span>
            {product.images.length > 1 && (
              <span className="absolute top-4 left-4 rounded-full bg-text-primary/80 text-white text-xs font-semibold px-2.5 py-1">
                {activeImg + 1}/{product.images.length}
              </span>
            )}
            {discount > 0 && (
              <span className="absolute top-4 right-4 rounded-full bg-primary text-white text-xs font-bold px-3 py-1.5">-{discount}% ছাড়</span>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 flex items-center justify-center gap-1.5">
              {product.images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  aria-label={`ছবি ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${activeImg === i ? 'w-6 bg-primary' : 'w-2 bg-border'}`}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide">
            <span className="text-primary">{subCategory?.name || product.category}</span>
            <span className="text-border">•</span>
            <span className="text-text-secondary">{product.brand}</span>
          </div>
          <h1 className="mt-1.5 text-3xl sm:text-4xl">{product.name}</h1>

          <div className="mt-3 flex items-center gap-3">
            <Rating value={product.rating} count={product.reviewCount} size={16} />
          </div>

          <div className="mt-4 flex items-baseline gap-3 flex-wrap">
            <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
            {product.oldPrice && <span className="text-lg text-text-secondary line-through">{formatPrice(product.oldPrice)}</span>}
            {savings > 0 && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-success/10 text-success">SAVE {formatPrice(savings)}</span>
            )}
          </div>

          <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold">
            <span className={`h-1.5 w-1.5 rounded-full ${inStock ? 'bg-success' : 'bg-error'}`} />
            <span className={inStock ? 'text-success' : 'text-error'}>{inStock ? 'স্টকে আছে' : 'স্টক নেই'}</span>
            {inStock && <span className="text-text-secondary font-normal">• দ্রুত ডেলিভারির জন্য প্রস্তুত</span>}
          </div>

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
                <p className="text-sm font-semibold">সাইজ</p>
                <button className="text-xs text-primary font-semibold hover:underline">সাইজ গাইড</button>
              </div>
              <div className="space-y-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`w-full flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                      size === s ? 'border-primary bg-primary-light' : 'border-border hover:border-primary'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className={`grid place-items-center h-4.5 w-4.5 rounded-full border-2 shrink-0 ${size === s ? 'border-primary' : 'border-border'}`}>
                        {size === s && <span className="h-2 w-2 rounded-full bg-primary" />}
                      </span>
                      {s}
                    </span>
                    <span className="text-text-secondary font-normal">{formatPrice(product.price)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 rounded-2xl bg-primary-light/40 border border-border p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-primary mb-2">বিবরণ</p>
            <p className="text-sm text-text-secondary leading-relaxed">{product.shortDescription || product.description}</p>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <p className="text-sm font-semibold">পরিমাণ</p>
            <div className="flex items-center rounded-full border border-border">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-2.5 hover:text-primary"><Minus size={14} /></button>
              <span className="w-10 text-center text-sm font-semibold">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(product.stock || 10, q + 1))} className="p-2.5 hover:text-primary"><Plus size={14} /></button>
            </div>
          </div>

          <div className="mt-7 space-y-3">
            <button
              disabled={!inStock}
              onClick={() => addItem({ productId: product.id, quantity: qty, color, size })}
              className="btn-primary w-full py-2.5!"
            >
              <ShoppingBag size={18} /> কার্টে যোগ করুন
            </button>
            <div className="flex gap-3">
              <button
                disabled={!inStock}
                onClick={() => { addItem({ productId: product.id, quantity: qty, color, size }); showToast('চেকআউটে যাওয়া হচ্ছে', 'info'); }}
                className="btn-dark flex-1 py-2.5!"
              >
                <Zap size={16} /> এখনই কিনুন
              </button>
              <button onClick={() => toggle(product.id)} className="grid place-items-center h-10 w-10 rounded-full border border-border hover:border-primary shrink-0 transition-colors">
                <Heart size={18} className={isWishlisted(product.id) ? 'fill-primary text-primary' : ''} />
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-1.5 sm:grid-cols-3 sm:gap-3">
            {[
              { icon: Truck, title: storeSettings?.shippingBadgeTitle ?? 'ফ্রি শিপিং', desc: storeSettings?.shippingBadgeDesc ?? '৭৫ ডলারের বেশি অর্ডারে' },
              { icon: RotateCcw, title: storeSettings?.returnBadgeTitle ?? '৩০ দিনের রিটার্ন', desc: storeSettings?.returnBadgeDesc ?? 'ঝামেলামুক্ত' },
              { icon: ShieldCheck, title: storeSettings?.paymentBadgeTitle ?? 'নিরাপদ পেমেন্ট', desc: storeSettings?.paymentBadgeDesc ?? '১০০% সুরক্ষিত' },
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

      {related.length > 0 && (
        <div className="container-app pb-16">
          <FadeIn>
            <h2 className="text-2xl sm:text-3xl">সুপারিশকৃত পণ্য</h2>
            <p className="mt-1 text-sm text-text-secondary">আপনার পছন্দ হতে পারে এমন আরও কিছু পণ্য</p>
          </FadeIn>
          <FadeIn delay={100} className="mt-6">
            <div
              className="flex gap-4 overflow-x-auto snap-x snap-mandatory -mx-4 px-4 pb-2 [-webkit-overflow-scrolling:touch]
                         sm:mx-0 sm:px-0 sm:pb-0 sm:overflow-visible sm:gap-0
                         sm:grid sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 sm:border-t sm:border-l sm:border-border"
            >
              {related.map((p) => (
                <div key={p.id} className="w-[46%] shrink-0 snap-start sm:w-auto sm:shrink">
                  <ProductCard product={p} onQuickView={setQuickView} />
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      )}

      <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />

      {fullscreenOpen && createPortal(
        <div
          className="fixed inset-0 z-100 bg-black/95 flex items-center justify-center animate-fade-in"
          onClick={() => setFullscreenOpen(false)}
        >
          <button
            onClick={() => setFullscreenOpen(false)}
            aria-label="বন্ধ করুন"
            className="absolute top-4 right-4 grid place-items-center h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X size={20} />
          </button>
          {product.images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setActiveImg((i) => (i - 1 + product.images.length) % product.images.length); }}
                aria-label="আগের ছবি"
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 grid place-items-center h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setActiveImg((i) => (i + 1) % product.images.length); }}
                aria-label="পরের ছবি"
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 grid place-items-center h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <ChevronRight size={20} />
              </button>
              <span className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 text-white text-xs font-semibold px-3 py-1.5">
                {activeImg + 1}/{product.images.length}
              </span>
            </>
          )}
          <img
            src={product.images[activeImg]}
            alt={product.name}
            className="max-h-[90vh] max-w-[92vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>,
        document.body
      )}
    </>
  );
}

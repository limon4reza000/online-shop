import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Minus, Plus, Trash2, ShoppingBag, Tag, ArrowRight, User, Phone, MapPin, StickyNote } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { useCart, type ShippingDetails } from '@/context/CartContext';
import { useProducts } from '@/hooks/useProducts';
import { formatPrice } from '@/lib/format';

const shippingSchema = z.object({
  fullName: z.string().trim().min(1, 'পূর্ণ নাম আবশ্যক'),
  mobile: z.string().trim().regex(/^01[3-9]\d{8}$/, 'সঠিক বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)'),
  address: z.string().trim().min(1, 'ঠিকানা আবশ্যক'),
  village: z.string().trim().min(1, 'গ্রাম/এলাকা আবশ্যক'),
  postOffice: z.string().trim().min(1, 'পোস্ট অফিস আবশ্যক'),
  upazila: z.string().trim().min(1, 'উপজেলা আবশ্যক'),
  district: z.string().trim().min(1, 'জেলা আবশ্যক'),
  division: z.string().trim().min(1, 'বিভাগ আবশ্যক'),
  note: z.string().optional(),
});
type ShippingFormData = z.infer<typeof shippingSchema>;

const addressFields: { key: keyof ShippingFormData; label: string }[] = [
  { key: 'village', label: 'গ্রাম/এলাকা' },
  { key: 'postOffice', label: 'পোস্ট অফিস' },
  { key: 'upazila', label: 'উপজেলা' },
  { key: 'district', label: 'জেলা' },
  { key: 'division', label: 'বিভাগ' },
];

const emptyDetails: ShippingFormData = {
  fullName: '',
  mobile: '',
  address: '',
  village: '',
  postOffice: '',
  upazila: '',
  district: '',
  division: '',
  note: '',
};

// Order errors are shown/focused in this priority so the first *logical* mistake wins,
// not just whichever key zod happened to report first.
const fieldOrder: (keyof ShippingFormData)[] = ['fullName', 'mobile', 'address', 'village', 'postOffice', 'upazila', 'district', 'division'];

export default function Cart() {
  const { items, updateQuantity, removeItem, subtotal, deliveryCharge, vat, coupon, discount, applyCoupon, removeCoupon, shippingDetails, setShippingDetails } = useCart();
  const { data: products = [] } = useProducts();
  const [couponInput, setCouponInput] = useState('');
  const navigate = useNavigate();

  const { register, handleSubmit, setFocus, formState: { errors } } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: shippingDetails ?? emptyDetails,
  });

  const total = subtotal - discount + deliveryCharge + vat;

  const onValid = (data: ShippingFormData) => {
    setShippingDetails(data as ShippingDetails);
    navigate('/checkout');
  };

  const onInvalid = (errs: FieldErrors<ShippingFormData>) => {
    const firstKey = fieldOrder.find((k) => errs[k]);
    if (!firstKey) return;
    setFocus(firstKey);
    requestAnimationFrame(() => {
      document.activeElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

  const lineItems = items
    .map((item) => ({ item, product: products.find((p) => p.id === item.productId) }))
    .filter((x): x is { item: typeof items[0]; product: NonNullable<typeof x.product> } => !!x.product);

  return (
    <>
      <PageHeader title="শপিং কার্ট" subtitle="চেকআউটের আগে আপনার পণ্যসমূহ পর্যালোচনা করুন।" crumbs={[{ label: 'কার্ট' }]} showBack />
      <div className="container-app section-y">
        {lineItems.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="আপনার কার্ট খালি"
            description="মনে হচ্ছে আপনি এখনো কিছু যোগ করেননি। পছন্দের পণ্য খুঁজে কার্টে যোগ করুন।"
            actionLabel="কেনাকাটা চালিয়ে যান"
            actionTo="/shop"
          />
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="space-y-2">
              {lineItems.map(({ item, product }) => (
                <div key={`${item.productId}-${item.color}-${item.size}`} className="flex gap-4 card-surface p-4">
                  <Link to={`/product/${product.slug}`} className="h-16 w-16 rounded-xl overflow-hidden bg-primary-light shrink-0">
                    <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-primary uppercase">{product.brand}</p>
                    <Link to={`/product/${product.slug}`} className="block text-sm font-semibold hover:text-primary transition-colors">
                      {product.name}
                      {(item.color || item.size) && (
                        <span className="font-normal text-text-secondary">
                          {' · '}{[item.color, item.size].filter(Boolean).join(' + ')}
                        </span>
                      )}
                    </Link>
                    <p className="font-bold mt-1">{formatPrice(product.price)}</p>
                  </div>

                  <div className="flex flex-col items-end justify-between shrink-0">
                    <button
                      onClick={() => removeItem(item.productId, item.color, item.size)}
                      aria-label="মুছে ফেলুন"
                      className="text-text-secondary hover:text-error transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1">
                      <button onClick={() => updateQuantity(item.productId, item.quantity - 1, item.color, item.size)} className="grid place-items-center h-7 w-7 rounded-full bg-white text-text-primary hover:text-primary shadow-soft transition-colors">
                        <Minus size={12} />
                      </button>
                      <span className="w-5 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1, item.color, item.size)}
                        disabled={item.quantity >= product.stock}
                        className="grid place-items-center h-7 w-7 rounded-full bg-primary text-white hover:bg-primary-hover disabled:opacity-40 disabled:pointer-events-none transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <form onSubmit={handleSubmit(onValid, onInvalid)} noValidate className="space-y-2">
              <div className="card-surface p-5 sm:p-6">
                <div className="flex items-center gap-2.5 mb-5">
                  <span className="grid place-items-center h-9 w-9 rounded-full bg-primary-light text-primary shrink-0">
                    <User size={16} />
                  </span>
                  <h3 className="font-bold text-sm uppercase tracking-wide">আপনার তথ্য</h3>
                </div>

                <div className="space-y-4">
                  <label className="block">
                    <span className="text-sm font-semibold mb-1.5 block">পূর্ণ নাম <span className="text-error">*</span></span>
                    <input
                      {...register('fullName')}
                      placeholder="আপনার পূর্ণ নাম লিখুন"
                      className={`input-field ${errors.fullName ? 'border-error focus:border-error' : ''}`}
                    />
                    {errors.fullName && <span className="text-xs text-error mt-1 block">{errors.fullName.message}</span>}
                  </label>

                  <label className="block">
                    <span className="text-sm font-semibold mb-1.5 flex items-center gap-1.5"><Phone size={14} /> মোবাইল নম্বর <span className="text-error">*</span></span>
                    <input
                      {...register('mobile')}
                      placeholder="01XXXXXXXXX"
                      className={`input-field ${errors.mobile ? 'border-error focus:border-error' : ''}`}
                    />
                    {errors.mobile && <span className="text-xs text-error mt-1 block">{errors.mobile.message}</span>}
                  </label>

                  <div>
                    <span className="text-sm font-semibold mb-2 flex items-center gap-1.5"><MapPin size={14} /> ঠিকানা <span className="text-error">*</span></span>
                    <label className="block mb-3">
                      <input
                        {...register('address')}
                        placeholder="বাসা/হোল্ডিং নম্বর, রোড"
                        className={`input-field ${errors.address ? 'border-error focus:border-error' : ''}`}
                      />
                      {errors.address && <span className="text-xs text-error mt-1 block">{errors.address.message}</span>}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {addressFields.map((f) => (
                        <label key={f.key} className="block">
                          <input
                            {...register(f.key)}
                            placeholder={f.label}
                            className={`input-field ${errors[f.key] ? 'border-error focus:border-error' : ''}`}
                          />
                          {errors[f.key] && <span className="text-xs text-error mt-1 block">{errors[f.key]?.message}</span>}
                        </label>
                      ))}
                    </div>
                  </div>

                  <label className="block">
                    <span className="text-sm font-semibold mb-1.5 flex items-center gap-1.5"><StickyNote size={14} /> ডেলিভারি / অর্ডারের জন্য নোট</span>
                    <textarea
                      {...register('note')}
                      rows={3}
                      placeholder="ডেলিভারি বা অর্ডার সংক্রান্ত কোনো নোট লিখুন"
                      className="input-field resize-none"
                    />
                  </label>
                </div>
              </div>

              <div className="card-surface p-6">
                <h3 className="text-lg font-bold">অর্ডার সারাংশ</h3>

                <div className="mt-4">
                <div className="relative">
                  <Tag size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
                  <input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="কুপন কোড"
                    className="input-field pl-9 pr-20"
                  />
                  <button
                    type="button"
                    onClick={() => { if (applyCoupon(couponInput)) setCouponInput(''); }}
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-hover"
                  >
                    প্রয়োগ করুন
                  </button>
                </div>
                {coupon && (
                  <div className="mt-2 flex items-center justify-between text-xs bg-success/10 text-success rounded-lg px-3 py-2">
                    <span>"{coupon}" প্রয়োগ হয়েছে</span>
                    <button type="button" onClick={removeCoupon} className="font-semibold hover:underline">সরান</button>
                  </div>
                )}
                <p className="mt-1.5 text-[11px] text-text-secondary">WELCOME10, PINK20, অথবা SAVE15 ব্যবহার করে দেখুন</p>
                </div>

                <div className="mt-5 space-y-2.5 text-sm border-t border-border pt-4">
                  <div className="flex justify-between text-text-secondary"><span>সাবটোটাল</span><span className="text-text-primary font-medium">{formatPrice(subtotal)}</span></div>
                  {discount > 0 && <div className="flex justify-between text-success"><span>ছাড়</span><span>-{formatPrice(discount)}</span></div>}
                  <div className="flex justify-between text-text-secondary"><span>ডেলিভারি চার্জ</span><span className="text-text-primary font-medium">{deliveryCharge === 0 ? 'ফ্রি' : formatPrice(deliveryCharge)}</span></div>
                  <div className="flex justify-between text-text-secondary"><span>ভ্যাট</span><span className="text-text-primary font-medium">{formatPrice(vat)}</span></div>
                </div>
                <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                  <span className="font-bold">মোট</span>
                  <span className="text-2xl font-bold text-primary">{formatPrice(total)}</span>
                </div>

                <button type="submit" className="btn-primary w-full mt-6">
                  চেকআউটে যান <ArrowRight size={16} />
                </button>
                <Link to="/shop" className="block text-center text-sm text-primary font-semibold mt-4 hover:underline">কেনাকাটা চালিয়ে যান</Link>
              </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

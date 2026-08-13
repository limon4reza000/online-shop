import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Wallet, ShieldCheck, Send } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { useCart } from '@/context/CartContext';
import { useProducts } from '@/hooks/useProducts';
import { useCreateOrder } from '@/hooks/useOrders';
import { useToast } from '@/context/ToastContext';
import { formatPrice } from '@/lib/format';
import bkashLogo from '@/assets/BKash-bKash-Logo.wine.png';
import nagadLogo from '@/assets/Nagad-Logo.wine.svg';
import rocketLogo from '@/assets/rocket-logo png.webp';

const paymentMethods = [
  { value: 'bkash', label: 'বিকাশ', logo: bkashLogo },
  { value: 'nagad', label: 'নগদ', logo: nagadLogo },
  { value: 'rocket', label: 'রকেট', logo: rocketLogo },
] as const;

const MERCHANT_NUMBER = '01712345678';

const schema = z.object({
  paymentMethod: z.enum(['bkash', 'nagad', 'rocket'], { message: 'একটি পেমেন্ট মাধ্যম বাছাই করুন' }),
  senderNumber: z.string().min(11, 'একটি সঠিক নম্বর দিন').max(14),
  transactionId: z.string().min(6, 'একটি সঠিক ট্রানজেকশন আইডি দিন'),
});
type FormData = z.infer<typeof schema>;

export default function Checkout() {
  const { items, subtotal, deliveryCharge, vat, discount, coupon, clearCart, shippingDetails, clearShippingDetails } = useCart();
  const { data: products = [] } = useProducts();
  const [step, setStep] = useState(0);
  const [placing, setPlacing] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const createOrder = useCreateOrder();

  const { register, handleSubmit, trigger, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const selectedMethod = watch('paymentMethod');

  const total = subtotal - discount + deliveryCharge + vat;

  const lineItems = items
    .map((item) => ({ item, product: products.find((p) => p.id === item.productId) }))
    .filter((x): x is { item: typeof items[0]; product: NonNullable<typeof x.product> } => !!x.product);

  const paymentFields: (keyof FormData)[] = ['paymentMethod', 'senderNumber', 'transactionId'];

  const goNext = async () => {
    const valid = await trigger(paymentFields);
    if (valid) setStep((s) => s + 1);
  };

  // Customer info is collected (and validated) on the Cart page — checkout can't
  // proceed without it, whether the user skipped that step or landed here directly.
  useEffect(() => {
    if (!shippingDetails && lineItems.length > 0) {
      navigate('/cart', { replace: true });
    }
  }, [shippingDetails, lineItems.length, navigate]);

  const onSubmit = () => {
    if (!shippingDetails) {
      navigate('/cart', { replace: true });
      return;
    }
    setPlacing(true);
    createOrder.mutate(
      {
        items: lineItems.map(({ item, product }) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
          color: item.color,
          size: item.size,
        })),
        subtotal,
        discount,
        shipping: deliveryCharge,
        tax: vat,
        total,
        couponCode: coupon ?? undefined,
        shippingAddress: {
          fullName: shippingDetails.fullName,
          phone: shippingDetails.mobile,
          address: shippingDetails.address,
          village: shippingDetails.village,
          postOffice: shippingDetails.postOffice,
          upazila: shippingDetails.upazila,
          district: shippingDetails.district,
          division: shippingDetails.division,
          note: shippingDetails.note,
        },
      },
      {
        onSuccess: (order) => {
          clearCart();
          clearShippingDetails();
          navigate('/order-success', { state: { orderId: order.id, total } });
        },
        onError: () => {
          setPlacing(false);
          showToast('অর্ডার করা যায়নি, আবার চেষ্টা করুন', 'error');
        },
      }
    );
  };

  if (lineItems.length === 0 && !placing) {
    return (
      <div className="container-app section-y text-center">
        <p className="text-lg font-semibold">আপনার কার্ট খালি</p>
        <Link to="/shop" className="btn-primary mt-6 inline-flex">শপে যান</Link>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="চেকআউট" subtitle="নিরাপদ, দ্রুত এবং সহজ।" crumbs={[{ label: 'কার্ট', to: '/cart' }, { label: 'চেকআউট' }]} showBack />

      <div className="container-app pt-4 sm:pt-6 pb-14 sm:pb-20">
        <div className="grid lg:grid-cols-[1fr_360px] gap-3 lg:gap-8 items-start">
          <form onSubmit={handleSubmit(onSubmit)} className="order-2 lg:order-1 card-surface p-6 sm:p-8">
            {step === 0 && (
              <div className="space-y-5 animate-fade-in">
                <h3 className="text-lg font-bold flex items-center gap-2"><Wallet size={18} className="text-primary" /> পেমেন্টের বিবরণ</h3>
                <input type="hidden" {...register('paymentMethod')} />

                <div>
                  <span className="text-sm font-medium mb-2 block">পেমেন্ট মাধ্যম বাছাই করুন</span>
                  <div className="grid grid-cols-3 gap-3">
                    {paymentMethods.map((m) => (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => setValue('paymentMethod', m.value, { shouldValidate: true })}
                        className={`flex items-center justify-center rounded-xl border-2 p-4 transition-colors ${
                          selectedMethod === m.value ? 'border-primary bg-primary-light' : 'border-border hover:border-primary/40'
                        }`}
                      >
                        <img src={m.logo} alt={m.label} className="h-20 sm:h-24 w-full object-contain" />
                      </button>
                    ))}
                  </div>
                  {errors.paymentMethod && <span className="text-xs text-error mt-1.5 block">{errors.paymentMethod.message}</span>}
                </div>

                {selectedMethod && (
                  <div className="animate-fade-in space-y-4">
                    <div className="rounded-xl bg-primary-light p-4 flex items-start gap-2.5">
                      <Send size={16} className="text-primary shrink-0 mt-0.5" />
                      <p className="text-sm text-text-primary">
                        <strong>{paymentMethods.find((m) => m.value === selectedMethod)?.label}</strong> দিয়ে <strong>{MERCHANT_NUMBER}</strong> নম্বরে <strong>{formatPrice(total)}</strong> "Send Money" করে নিচের তথ্য দিন।
                      </p>
                    </div>
                    <Field label="আপনার নম্বর যেটি থেকে টাকা পাঠিয়েছেন" error={errors.senderNumber?.message}>
                      <input {...register('senderNumber')} placeholder="01XXXXXXXXX" className="input-field" />
                    </Field>
                    <Field label="ট্রানজেকশন আইডি" error={errors.transactionId?.message}>
                      <input {...register('transactionId')} placeholder="যেমন: 8N7A6B5C4D" className="input-field" />
                    </Field>
                  </div>
                )}

                <button type="button" onClick={goNext} className="btn-primary w-full">অর্ডার পর্যালোচনা করুন</button>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5 animate-fade-in">
                <h3 className="text-lg font-bold flex items-center gap-2"><ShieldCheck size={18} className="text-primary" /> পর্যালোচনা করুন ও অর্ডার করুন</h3>
                <div className="space-y-3">
                  {lineItems.map(({ item, product }) => (
                    <div key={`${item.productId}-${item.color}-${item.size}`} className="flex items-center gap-3 border-b border-border pb-3">
                      <img src={product.images[0]} alt="" className="h-14 w-14 rounded-lg object-cover" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{product.name}</p>
                        <p className="text-xs text-text-secondary">পরিমাণ {item.quantity} {item.size && `· সাইজ ${item.size}`}</p>
                      </div>
                      <p className="text-sm font-bold">{formatPrice(product.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(0)} className="btn-outline flex-1">পেছনে</button>
                  <button type="submit" disabled={placing} className="btn-primary flex-1">
                    {placing ? 'অর্ডার করা হচ্ছে…' : `অর্ডার করুন · ${formatPrice(total)}`}
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="order-1 lg:order-2 card-surface p-6 lg:sticky lg:top-28">
            <h3 className="text-lg font-bold mb-4">অর্ডার সারাংশ</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-text-secondary"><span>সাবটোটাল</span><span className="text-text-primary font-medium">{formatPrice(subtotal)}</span></div>
              {discount > 0 && <div className="flex justify-between text-success"><span>ছাড়</span><span>-{formatPrice(discount)}</span></div>}
              <div className="flex justify-between text-text-secondary"><span>ডেলিভারি চার্জ</span><span className="text-text-primary font-medium">{deliveryCharge === 0 ? 'ফ্রি' : formatPrice(deliveryCharge)}</span></div>
              <div className="flex justify-between text-text-secondary"><span>ভ্যাট</span><span className="text-text-primary font-medium">{formatPrice(vat)}</span></div>
            </div>
            <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
              <span className="font-bold">মোট</span>
              <span className="text-2xl font-bold text-primary">{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium mb-1.5 block">{label}</span>
      {children}
      {error && <span className="text-xs text-error mt-1 block">{error}</span>}
    </label>
  );
}

import { useEffect, useState } from 'react';
import { Store, Truck, Percent, Bell, Save } from 'lucide-react';
import { Seo } from '@/components/ui/Seo';
import { useToast } from '@/context/ToastContext';
import { useAdminStoreSettings, useUpdateStoreSettings } from '@/hooks/useSettings';

const tabs = [
  { id: 'general', label: 'সাধারণ', icon: Store },
  { id: 'shipping', label: 'শিপিং', icon: Truck },
  { id: 'tax', label: 'কর', icon: Percent },
  { id: 'notifications', label: 'বিজ্ঞপ্তি', icon: Bell },
];

export default function AdminSettings() {
  const [tab, setTab] = useState('general');
  const { showToast } = useToast();

  const { data: storeSettings } = useAdminStoreSettings();
  const updateStoreSettings = useUpdateStoreSettings();
  const [freeDeliveryEnabled, setFreeDeliveryEnabled] = useState(false);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(3000);
  const [shippingBadgeTitle, setShippingBadgeTitle] = useState('ফ্রি শিপিং');
  const [shippingBadgeDesc, setShippingBadgeDesc] = useState('৭৫ ডলারের বেশি অর্ডারে');
  const [returnBadgeTitle, setReturnBadgeTitle] = useState('৩০ দিনের রিটার্ন');
  const [returnBadgeDesc, setReturnBadgeDesc] = useState('ঝামেলামুক্ত');
  const [paymentBadgeTitle, setPaymentBadgeTitle] = useState('নিরাপদ পেমেন্ট');
  const [paymentBadgeDesc, setPaymentBadgeDesc] = useState('১০০% সুরক্ষিত');
  const [shopSubtitle1, setShopSubtitle1] = useState('');
  const [shopSubtitle2, setShopSubtitle2] = useState('');
  const [shopSubtitle3, setShopSubtitle3] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [messengerUrl, setMessengerUrl] = useState('');

  useEffect(() => {
    if (storeSettings) {
      setFreeDeliveryEnabled(storeSettings.freeDeliveryEnabled);
      setFreeDeliveryThreshold(storeSettings.freeDeliveryThreshold);
      setShippingBadgeTitle(storeSettings.shippingBadgeTitle);
      setShippingBadgeDesc(storeSettings.shippingBadgeDesc);
      setReturnBadgeTitle(storeSettings.returnBadgeTitle);
      setReturnBadgeDesc(storeSettings.returnBadgeDesc);
      setPaymentBadgeTitle(storeSettings.paymentBadgeTitle);
      setPaymentBadgeDesc(storeSettings.paymentBadgeDesc);
      setShopSubtitle1(storeSettings.shopSubtitle1);
      setShopSubtitle2(storeSettings.shopSubtitle2);
      setShopSubtitle3(storeSettings.shopSubtitle3);
      setFacebookUrl(storeSettings.facebookUrl ?? '');
      setInstagramUrl(storeSettings.instagramUrl ?? '');
      setWhatsappNumber(storeSettings.whatsappNumber ?? '');
      setMessengerUrl(storeSettings.messengerUrl ?? '');
    }
  }, [storeSettings]);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === 'shipping') {
      updateStoreSettings.mutate(
        {
          freeDeliveryEnabled, freeDeliveryThreshold,
          shippingBadgeTitle, shippingBadgeDesc,
          returnBadgeTitle, returnBadgeDesc,
          paymentBadgeTitle, paymentBadgeDesc,
        },
        {
          onSuccess: () => showToast('সেটিংস সফলভাবে সংরক্ষণ করা হয়েছে', 'success'),
          onError: () => showToast('সেটিংস সংরক্ষণ করা যায়নি', 'error'),
        }
      );
      return;
    }
    if (tab === 'general') {
      updateStoreSettings.mutate(
        {
          shopSubtitle1, shopSubtitle2, shopSubtitle3,
          facebookUrl: facebookUrl || null,
          instagramUrl: instagramUrl || null,
          whatsappNumber: whatsappNumber || null,
          messengerUrl: messengerUrl || null,
        },
        {
          onSuccess: () => showToast('সেটিংস সফলভাবে সংরক্ষণ করা হয়েছে', 'success'),
          onError: () => showToast('সেটিংস সংরক্ষণ করা যায়নি', 'error'),
        }
      );
      return;
    }
    showToast('সেটিংস সফলভাবে সংরক্ষণ করা হয়েছে', 'success');
  };

  return (
    <div className="space-y-6">
      <Seo title="Settings" />
      <div>
        <h2 className="text-2xl font-bold">দোকানের সেটিংস</h2>
        <p className="text-sm text-text-secondary mt-1">আপনার স্টোরফ্রন্টের পছন্দসমূহ কনফিগার করুন।</p>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              tab === t.id ? 'bg-primary text-white' : 'bg-surface border border-border text-text-secondary hover:border-primary hover:text-primary'
            }`}
          >
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={save} className="card-surface p-6 sm:p-8 space-y-5">
        {tab === 'general' && (
          <>
            <div className="grid sm:grid-cols-2 gap-5">
              <label className="block">
                <span className="text-sm font-medium mb-1.5 block">দোকানের নাম</span>
                <input defaultValue="নিত্যঘর" className="input-field" />
              </label>
              <label className="block">
                <span className="text-sm font-medium mb-1.5 block">সহায়তা ইমেইল</span>
                <input defaultValue="hello@nityaghor.com" className="input-field" />
              </label>
              <label className="block">
                <span className="text-sm font-medium mb-1.5 block">সহায়তা ফোন নম্বর</span>
                <input defaultValue="+৮৮০ ১৭০০-০০০০০০" className="input-field" />
              </label>
              <label className="block">
                <span className="text-sm font-medium mb-1.5 block">মুদ্রা</span>
                <select className="input-field" defaultValue="BDT" disabled>
                  <option value="BDT">BDT (৳ টাকা)</option>
                </select>
              </label>
            </div>
            <label className="flex items-center justify-between rounded-xl border border-border p-4">
              <div>
                <p className="text-sm font-semibold">রক্ষণাবেক্ষণ মোড</p>
                <p className="text-xs text-text-secondary">গ্রাহকদের জন্য সাময়িকভাবে স্টোরফ্রন্ট নিষ্ক্রিয় করুন।</p>
              </div>
              <input type="checkbox" className="accent-primary h-5 w-5" />
            </label>

            <div className="pt-2 border-t border-border">
              <p className="text-sm font-semibold mb-1">শপ পেজ সাবটাইটেল</p>
              <p className="text-xs text-text-secondary mb-4">"সব পণ্য" পেজের হেডারে ঘুরিয়ে-ফিরিয়ে (টাইপরাইটার এফেক্টে) দেখানো তিনটি বাক্য।</p>
              <div className="space-y-3">
                <label className="block">
                  <span className="text-xs font-medium mb-1 block">বাক্য ১</span>
                  <input value={shopSubtitle1} onChange={(e) => setShopSubtitle1(e.target.value)} className="input-field" />
                </label>
                <label className="block">
                  <span className="text-xs font-medium mb-1 block">বাক্য ২</span>
                  <input value={shopSubtitle2} onChange={(e) => setShopSubtitle2(e.target.value)} className="input-field" />
                </label>
                <label className="block">
                  <span className="text-xs font-medium mb-1 block">বাক্য ৩</span>
                  <input value={shopSubtitle3} onChange={(e) => setShopSubtitle3(e.target.value)} className="input-field" />
                </label>
              </div>
            </div>

            <div className="pt-2 border-t border-border">
              <p className="text-sm font-semibold mb-1">সামাজিক মাধ্যম ও যোগাযোগ</p>
              <p className="text-xs text-text-secondary mb-4">ফুটার ও ফ্লোটিং চ্যাট বাটনে দেখানো সোশ্যাল ও চ্যাট লিংক পরিচালনা করুন।</p>
              <div className="grid sm:grid-cols-2 gap-5">
                <label className="block">
                  <span className="text-xs font-medium mb-1 block">ফেসবুক পেজ লিংক</span>
                  <input value={facebookUrl} onChange={(e) => setFacebookUrl(e.target.value)} placeholder="https://facebook.com/nityaghor" className="input-field" />
                </label>
                <label className="block">
                  <span className="text-xs font-medium mb-1 block">ইনস্টাগ্রাম পেজ লিংক</span>
                  <input value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} placeholder="https://instagram.com/nityaghor" className="input-field" />
                </label>
                <label className="block">
                  <span className="text-xs font-medium mb-1 block">হোয়াটসঅ্যাপ নম্বর (কান্ট্রি কোডসহ)</span>
                  <input value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder="8801XXXXXXXXX" className="input-field" />
                </label>
                <label className="block">
                  <span className="text-xs font-medium mb-1 block">মেসেঞ্জার চ্যাট লিংক</span>
                  <input value={messengerUrl} onChange={(e) => setMessengerUrl(e.target.value)} placeholder="https://m.me/nityaghor" className="input-field" />
                </label>
              </div>
            </div>
          </>
        )}

        {tab === 'shipping' && (
          <div className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <label className="block">
                <span className="text-sm font-medium mb-1.5 block">স্ট্যান্ডার্ড শিপিং হার (৳)</span>
                <input type="number" defaultValue={60} step="1" className="input-field" />
              </label>
              <label className="block">
                <span className="text-sm font-medium mb-1.5 block">ফ্রি শিপিং সীমা (৳)</span>
                <input type="number" defaultValue={3000} className="input-field" />
              </label>
              <label className="block">
                <span className="text-sm font-medium mb-1.5 block">আনুমানিক ডেলিভারি (দিন)</span>
                <input defaultValue="৩–৭ কার্যদিবস" className="input-field" />
              </label>
            </div>

            <label className="flex items-center justify-between rounded-xl border border-border p-4">
              <div>
                <p className="text-sm font-semibold">ফ্রি ডেলিভারি প্রোমো (হোমপেজ)</p>
                <p className="text-xs text-text-secondary">নির্দিষ্ট পরিমাণ অর্ডারে ফ্রি ডেলিভারির ব্যাজ হোমপেজে দেখান। ডিফল্টভাবে লুকানো থাকে।</p>
              </div>
              <input
                type="checkbox"
                checked={freeDeliveryEnabled}
                onChange={(e) => setFreeDeliveryEnabled(e.target.checked)}
                className="accent-primary h-5 w-5"
              />
            </label>
            {freeDeliveryEnabled && (
              <label className="block max-w-xs">
                <span className="text-sm font-medium mb-1.5 block">ফ্রি ডেলিভারি পরিমাণ (৳)</span>
                <input
                  type="number"
                  min={0}
                  value={freeDeliveryThreshold}
                  onChange={(e) => setFreeDeliveryThreshold(Number(e.target.value))}
                  className="input-field"
                />
                <span className="text-xs text-text-secondary mt-1.5 block">প্রিভিউ: ৳{freeDeliveryThreshold.toLocaleString('en-US')}+ অর্ডারে ফ্রি ডেলিভারি</span>
              </label>
            )}

            <div className="pt-2 border-t border-border">
              <p className="text-sm font-semibold mb-1">প্রোডাক্ট পেজ ট্রাস্ট ব্যাজ</p>
              <p className="text-xs text-text-secondary mb-4">প্রতিটি প্রোডাক্ট পেজে দেখানো তিনটি ব্যাজের টাইটেল ও সাবটেক্সট।</p>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="block">
                    <span className="text-xs font-medium mb-1 block">শিপিং ব্যাজ টাইটেল</span>
                    <input value={shippingBadgeTitle} onChange={(e) => setShippingBadgeTitle(e.target.value)} className="input-field" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium mb-1 block">শিপিং ব্যাজ সাবটেক্সট</span>
                    <input value={shippingBadgeDesc} onChange={(e) => setShippingBadgeDesc(e.target.value)} className="input-field" />
                  </label>
                </div>
                <div className="space-y-2">
                  <label className="block">
                    <span className="text-xs font-medium mb-1 block">রিটার্ন ব্যাজ টাইটেল</span>
                    <input value={returnBadgeTitle} onChange={(e) => setReturnBadgeTitle(e.target.value)} className="input-field" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium mb-1 block">রিটার্ন ব্যাজ সাবটেক্সট</span>
                    <input value={returnBadgeDesc} onChange={(e) => setReturnBadgeDesc(e.target.value)} className="input-field" />
                  </label>
                </div>
                <div className="space-y-2">
                  <label className="block">
                    <span className="text-xs font-medium mb-1 block">পেমেন্ট ব্যাজ টাইটেল</span>
                    <input value={paymentBadgeTitle} onChange={(e) => setPaymentBadgeTitle(e.target.value)} className="input-field" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium mb-1 block">পেমেন্ট ব্যাজ সাবটেক্সট</span>
                    <input value={paymentBadgeDesc} onChange={(e) => setPaymentBadgeDesc(e.target.value)} className="input-field" />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'tax' && (
          <div className="grid sm:grid-cols-2 gap-5">
            <label className="block">
              <span className="text-sm font-medium mb-1.5 block">ডিফল্ট কর হার (%)</span>
              <input type="number" defaultValue={8} step="0.1" className="input-field" />
            </label>
            <label className="block">
              <span className="text-sm font-medium mb-1.5 block">কর নিবন্ধন নম্বর</span>
              <input placeholder="যেমন US-123456789" className="input-field" />
            </label>
          </div>
        )}

        {tab === 'notifications' && (
          <div className="space-y-3">
            {[
              { key: 'New order received', label: 'নতুন অর্ডার পাওয়া গেছে' },
              { key: 'Low stock alerts', label: 'কম স্টকের সতর্কতা' },
              { key: 'New customer registrations', label: 'নতুন গ্রাহক নিবন্ধন' },
              { key: 'New product reviews', label: 'নতুন পণ্য রিভিউ' },
            ].map((item) => (
              <label key={item.key} className="flex items-center justify-between rounded-xl border border-border p-4">
                <p className="text-sm font-medium">{item.label}</p>
                <input type="checkbox" defaultChecked className="accent-primary h-5 w-5" />
              </label>
            ))}
          </div>
        )}

        <button type="submit" className="btn-primary"><Save size={16} /> সেটিংস সংরক্ষণ করুন</button>
      </form>
    </div>
  );
}

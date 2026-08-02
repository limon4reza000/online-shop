import { useState } from 'react';
import { Store, Truck, Percent, Bell, Save } from 'lucide-react';
import { Seo } from '@/components/ui/Seo';
import { useToast } from '@/context/ToastContext';

const tabs = [
  { id: 'general', label: 'সাধারণ', icon: Store },
  { id: 'shipping', label: 'শিপিং', icon: Truck },
  { id: 'tax', label: 'কর', icon: Percent },
  { id: 'notifications', label: 'বিজ্ঞপ্তি', icon: Bell },
];

export default function AdminSettings() {
  const [tab, setTab] = useState('general');
  const { showToast } = useToast();

  const save = (e: React.FormEvent) => {
    e.preventDefault();
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
                <input defaultValue="+1 (800) 555-0192" className="input-field" />
              </label>
              <label className="block">
                <span className="text-sm font-medium mb-1.5 block">মুদ্রা</span>
                <select className="input-field" defaultValue="USD">
                  <option>USD</option><option>EUR</option><option>GBP</option>
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
          </>
        )}

        {tab === 'shipping' && (
          <div className="grid sm:grid-cols-2 gap-5">
            <label className="block">
              <span className="text-sm font-medium mb-1.5 block">স্ট্যান্ডার্ড শিপিং হার ($)</span>
              <input type="number" defaultValue={8.99} step="0.01" className="input-field" />
            </label>
            <label className="block">
              <span className="text-sm font-medium mb-1.5 block">ফ্রি শিপিং সীমা ($)</span>
              <input type="number" defaultValue={75} className="input-field" />
            </label>
            <label className="block">
              <span className="text-sm font-medium mb-1.5 block">আনুমানিক ডেলিভারি (দিন)</span>
              <input defaultValue="৩–৭ কার্যদিবস" className="input-field" />
            </label>
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

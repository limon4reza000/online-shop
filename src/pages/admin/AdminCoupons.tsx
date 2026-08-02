import { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Seo } from '@/components/ui/Seo';
import { useToast } from '@/context/ToastContext';

interface Coupon {
  code: string;
  discount: number;
  type: 'percent' | 'fixed';
  expiresAt: string;
  usageCount: number;
  active: boolean;
}

const initialCoupons: Coupon[] = [
  { code: 'WELCOME10', discount: 10, type: 'percent', expiresAt: '2026-12-31', usageCount: 482, active: true },
  { code: 'PINK20', discount: 20, type: 'percent', expiresAt: '2026-09-30', usageCount: 219, active: true },
  { code: 'SAVE15', discount: 15, type: 'percent', expiresAt: '2026-08-15', usageCount: 130, active: true },
  { code: 'FREESHIP', discount: 8, type: 'fixed', expiresAt: '2026-10-01', usageCount: 76, active: false },
];

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [formOpen, setFormOpen] = useState(false);
  const { showToast } = useToast();

  const remove = (code: string) => {
    setCoupons((prev) => prev.filter((c) => c.code !== code));
    showToast('কুপন মুছে ফেলা হয়েছে', 'info');
  };

  const toggleActive = (code: string) => {
    setCoupons((prev) => prev.map((c) => (c.code === code ? { ...c, active: !c.active } : c)));
  };

  const save = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const code = String(form.get('code')).toUpperCase();
    setCoupons((prev) => [
      { code, discount: Number(form.get('discount')), type: form.get('type') as Coupon['type'], expiresAt: String(form.get('expiresAt')), usageCount: 0, active: true },
      ...prev,
    ]);
    showToast('কুপন তৈরি করা হয়েছে', 'success');
    setFormOpen(false);
  };

  const columns: Column<Coupon>[] = [
    { key: 'code', label: 'কোড', render: (c) => <code className="font-bold bg-primary-light text-primary px-2.5 py-1 rounded-lg text-xs">{c.code}</code> },
    { key: 'discount', label: 'ছাড়', render: (c) => (c.type === 'percent' ? `${c.discount}%` : `$${c.discount}`) },
    { key: 'usage', label: 'ব্যবহৃত', render: (c) => c.usageCount },
    { key: 'expires', label: 'মেয়াদ শেষ', render: (c) => c.expiresAt },
    {
      key: 'active',
      label: 'অবস্থা',
      render: (c) => (
        <button onClick={() => toggleActive(c.code)} className={`badge ${c.active ? 'bg-success/10 text-success' : 'bg-text-secondary/10 text-text-secondary'}`}>
          {c.active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
        </button>
      ),
    },
    {
      key: 'actions',
      label: 'কার্যক্রম',
      render: (c) => (
        <button onClick={() => remove(c.code)} className="p-2 rounded-full hover:bg-error/10 text-text-secondary hover:text-error"><Trash2 size={14} /></button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Seo title="Manage Coupons" />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">কুপন ব্যবস্থাপনা</h2>
          <p className="text-sm text-text-secondary mt-1">{coupons.length}টি কুপন রয়েছে।</p>
        </div>
        <button onClick={() => setFormOpen(true)} className="btn-primary btn-sm"><Plus size={15} /> কুপন যোগ করুন</button>
      </div>
      <DataTable columns={columns} data={coupons} rowKey={(c) => c.code} searchPlaceholder="কুপন খুঁজুন..." searchFn={(c, q) => c.code.toLowerCase().includes(q)} />

      {formOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-text-primary/40 backdrop-blur-sm" onClick={() => setFormOpen(false)} />
          <form onSubmit={save} className="relative w-full max-w-md bg-surface rounded-3xl shadow-lift p-6 sm:p-8 animate-fade-in">
            <button type="button" onClick={() => setFormOpen(false)} className="absolute top-4 right-4 btn-icon !h-9 !w-9"><X size={16} /></button>
            <h3 className="text-lg font-bold mb-5">নতুন কুপন যোগ করুন</h3>
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium mb-1.5 block">কুপন কোড</span>
                <input name="code" required placeholder="SUMMER25" className="input-field uppercase" />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-medium mb-1.5 block">ছাড়ের পরিমাণ</span>
                  <input name="discount" type="number" required className="input-field" />
                </label>
                <label className="block">
                  <span className="text-sm font-medium mb-1.5 block">ধরন</span>
                  <select name="type" className="input-field">
                    <option value="percent">শতাংশ (%)</option>
                    <option value="fixed">নির্দিষ্ট মূল্য ($)</option>
                  </select>
                </label>
              </div>
              <label className="block">
                <span className="text-sm font-medium mb-1.5 block">মেয়াদ শেষ হবে</span>
                <input name="expiresAt" type="date" required className="input-field" />
              </label>
            </div>
            <button type="submit" className="btn-primary w-full mt-6">কুপন তৈরি করুন</button>
          </form>
        </div>
      )}
    </div>
  );
}

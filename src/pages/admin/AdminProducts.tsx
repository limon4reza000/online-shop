import { useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Seo } from '@/components/ui/Seo';
import { products as initialProducts, categories } from '@/lib/data';
import { formatPrice } from '@/lib/format';
import { useToast } from '@/context/ToastContext';
import type { Product } from '@/lib/types';

export default function AdminProducts() {
  const [products, setProducts] = useState(initialProducts);
  const [editing, setEditing] = useState<Product | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const { showToast } = useToast();

  const remove = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast('পণ্যটি মুছে ফেলা হয়েছে', 'info');
  };

  const save = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (editing) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editing.id
            ? {
                ...p,
                name: String(form.get('name')),
                price: Number(form.get('price')),
                stock: Number(form.get('stock')),
                deliveryCharge: Number(form.get('deliveryCharge')) || 0,
                vat: Number(form.get('vat')) || 0,
              }
            : p
        )
      );
      showToast('পণ্যটি হালনাগাদ করা হয়েছে', 'success');
    } else {
      const name = String(form.get('name') || 'শিরোনামহীন পণ্য');
      setProducts((prev) => [
        {
          ...prev[0],
          id: `p${Date.now()}`,
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          name,
          price: Number(form.get('price')) || 0,
          stock: Number(form.get('stock')) || 0,
          deliveryCharge: Number(form.get('deliveryCharge')) || 0,
          vat: Number(form.get('vat')) || 0,
          tags: [],
        },
        ...prev,
      ]);
      showToast('নতুন পণ্য তৈরি করা হয়েছে', 'success');
    }
    setFormOpen(false);
    setEditing(null);
  };

  const columns: Column<Product>[] = [
    {
      key: 'name',
      label: 'পণ্য',
      render: (p) => (
        <div className="flex items-center gap-3 min-w-[220px]">
          <img src={p.images[0]} alt="" className="h-10 w-10 rounded-lg object-cover shrink-0" />
          <div>
            <p className="font-medium line-clamp-1">{p.name}</p>
            <p className="text-xs text-text-secondary">{p.brand}</p>
          </div>
        </div>
      ),
    },
    { key: 'category', label: 'ক্যাটাগরি', render: (p) => <span>{categories.find((c) => c.slug === p.category)?.name || p.category}</span> },
    { key: 'price', label: 'মূল্য', render: (p) => <span className="font-semibold">{formatPrice(p.price)}</span> },
    {
      key: 'delivery',
      label: 'ডেলিভারি/ভ্যাট',
      render: (p) => <span className="text-xs text-text-secondary">{formatPrice(p.deliveryCharge)} · {formatPrice(p.vat)}</span>,
    },
    {
      key: 'stock',
      label: 'স্টক',
      render: (p) => (
        <span className={`badge ${p.stock > 5 ? 'bg-success/10 text-success' : p.stock > 0 ? 'bg-warning/10 text-warning' : 'bg-error/10 text-error'}`}>
          {p.stock > 0 ? `${p.stock}টি স্টকে আছে` : 'স্টক নেই'}
        </span>
      ),
    },
    { key: 'rating', label: 'রেটিং', render: (p) => `${p.rating.toFixed(1)} ★` },
    {
      key: 'actions',
      label: 'কার্যক্রম',
      render: (p) => (
        <div className="flex items-center gap-1.5">
          <button onClick={() => { setEditing(p); setFormOpen(true); }} className="p-2 rounded-full hover:bg-primary-light text-text-secondary hover:text-primary"><Pencil size={14} /></button>
          <button onClick={() => remove(p.id)} className="p-2 rounded-full hover:bg-error/10 text-text-secondary hover:text-error"><Trash2 size={14} /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Seo title="Manage Products" />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">পণ্য ব্যবস্থাপনা</h2>
          <p className="text-sm text-text-secondary mt-1">ক্যাটালগে {products.length}টি পণ্য রয়েছে।</p>
        </div>
        <button onClick={() => { setEditing(null); setFormOpen(true); }} className="btn-primary btn-sm"><Plus size={15} /> পণ্য যোগ করুন</button>
      </div>

      <DataTable
        columns={columns}
        data={products}
        rowKey={(p) => p.id}
        searchPlaceholder="পণ্য খুঁজুন..."
        searchFn={(p, q) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)}
      />

      {formOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-text-primary/40 backdrop-blur-sm" onClick={() => setFormOpen(false)} />
          <form onSubmit={save} className="relative w-full max-w-lg bg-surface rounded-3xl shadow-lift p-6 sm:p-8 max-h-[90vh] overflow-y-auto animate-fade-in">
            <button type="button" onClick={() => setFormOpen(false)} className="absolute top-4 right-4 btn-icon !h-9 !w-9"><X size={16} /></button>
            <h3 className="text-lg font-bold mb-5">{editing ? 'পণ্য সম্পাদনা করুন' : 'নতুন পণ্য যোগ করুন'}</h3>
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium mb-1.5 block">পণ্যের নাম</span>
                <input name="name" defaultValue={editing?.name} required className="input-field" />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-medium mb-1.5 block">মূল্য ($)</span>
                  <input name="price" type="number" step="0.01" defaultValue={editing?.price} required className="input-field" />
                </label>
                <label className="block">
                  <span className="text-sm font-medium mb-1.5 block">স্টক পরিমাণ</span>
                  <input name="stock" type="number" defaultValue={editing?.stock} required className="input-field" />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-medium mb-1.5 block">ডেলিভারি চার্জ (৳)</span>
                  <input name="deliveryCharge" type="number" step="0.01" min="0" defaultValue={editing?.deliveryCharge ?? 60} required className="input-field" />
                </label>
                <label className="block">
                  <span className="text-sm font-medium mb-1.5 block">ভ্যাট (৳)</span>
                  <input name="vat" type="number" step="0.01" min="0" defaultValue={editing?.vat ?? 0} required className="input-field" />
                </label>
              </div>
            </div>
            <button type="submit" className="btn-primary w-full mt-6">{editing ? 'পরিবর্তন সংরক্ষণ করুন' : 'পণ্য তৈরি করুন'}</button>
          </form>
        </div>
      )}
    </div>
  );
}

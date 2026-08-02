import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Seo } from '@/components/ui/Seo';
import { brands as initialBrands, products } from '@/lib/data';
import { useToast } from '@/context/ToastContext';

interface BrandRow { name: string; productCount: number }

export default function AdminBrands() {
  const [brands, setBrands] = useState<BrandRow[]>(initialBrands.map((b) => ({ name: b, productCount: products.filter((p) => p.brand === b).length })));
  const { showToast } = useToast();

  const remove = (name: string) => {
    setBrands((prev) => prev.filter((b) => b.name !== name));
    showToast('ব্র্যান্ড মুছে ফেলা হয়েছে', 'info');
  };

  const columns: Column<BrandRow>[] = [
    { key: 'name', label: 'ব্র্যান্ড', render: (b) => <p className="font-medium">{b.name}</p> },
    { key: 'count', label: 'পণ্য', render: (b) => b.productCount },
    {
      key: 'actions',
      label: 'কার্যক্রম',
      render: (b) => (
        <div className="flex items-center gap-1.5">
          <button className="p-2 rounded-full hover:bg-primary-light text-text-secondary hover:text-primary"><Pencil size={14} /></button>
          <button onClick={() => remove(b.name)} className="p-2 rounded-full hover:bg-error/10 text-text-secondary hover:text-error"><Trash2 size={14} /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Seo title="Manage Brands" />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">ব্র্যান্ড ব্যবস্থাপনা</h2>
          <p className="text-sm text-text-secondary mt-1">{brands.length}টি ব্র্যান্ড রয়েছে।</p>
        </div>
        <button onClick={() => showToast('ব্র্যান্ড তৈরির ফর্ম শীঘ্রই আসছে', 'info')} className="btn-primary btn-sm"><Plus size={15} /> ব্র্যান্ড যোগ করুন</button>
      </div>
      <DataTable columns={columns} data={brands} rowKey={(b) => b.name} searchPlaceholder="ব্র্যান্ড খুঁজুন..." searchFn={(b, q) => b.name.toLowerCase().includes(q)} />
    </div>
  );
}

import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Seo } from '@/components/ui/Seo';
import { categories as initialCategories } from '@/lib/data';
import { useToast } from '@/context/ToastContext';
import type { Category } from '@/lib/types';

export default function AdminCategories() {
  const [categories, setCategories] = useState(initialCategories);
  const { showToast } = useToast();

  const remove = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    showToast('ক্যাটাগরি মুছে ফেলা হয়েছে', 'info');
  };

  const columns: Column<Category>[] = [
    {
      key: 'name',
      label: 'ক্যাটাগরি',
      render: (c) => (
        <div className="flex items-center gap-3 min-w-[200px]">
          <img src={c.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
          <p className="font-medium">{c.name}</p>
        </div>
      ),
    },
    { key: 'slug', label: 'স্লাগ', render: (c) => <code className="text-xs bg-primary-light px-2 py-1 rounded">{c.slug}</code> },
    { key: 'count', label: 'পণ্য', render: (c) => c.count },
    {
      key: 'actions',
      label: 'কার্যক্রম',
      render: (c) => (
        <div className="flex items-center gap-1.5">
          <button className="p-2 rounded-full hover:bg-primary-light text-text-secondary hover:text-primary"><Pencil size={14} /></button>
          <button onClick={() => remove(c.id)} className="p-2 rounded-full hover:bg-error/10 text-text-secondary hover:text-error"><Trash2 size={14} /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Seo title="Manage Categories" />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">ক্যাটাগরি ব্যবস্থাপনা</h2>
          <p className="text-sm text-text-secondary mt-1">{categories.length}টি ক্যাটাগরি রয়েছে।</p>
        </div>
        <button onClick={() => showToast('ক্যাটাগরি তৈরির ফর্ম শীঘ্রই আসছে', 'info')} className="btn-primary btn-sm"><Plus size={15} /> ক্যাটাগরি যোগ করুন</button>
      </div>
      <DataTable columns={columns} data={categories} rowKey={(c) => c.id} searchPlaceholder="ক্যাটাগরি খুঁজুন..." searchFn={(c, q) => c.name.toLowerCase().includes(q)} />
    </div>
  );
}

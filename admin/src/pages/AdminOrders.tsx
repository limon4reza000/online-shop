import { useState } from 'react';
import { Eye } from 'lucide-react';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Seo } from '@/components/ui/Seo';
import { Modal } from '@/components/ui/Modal';
import { mockOrders, products } from '@/lib/data';
import { formatDate, formatPrice } from '@/lib/format';
import { useToast } from '@/context/ToastContext';
import type { Order } from '@/lib/types';

const statusColors: Record<string, string> = {
  processing: 'bg-warning/10 text-warning',
  shipped: 'bg-primary/10 text-primary',
  'out-for-delivery': 'bg-primary/10 text-primary',
  delivered: 'bg-success/10 text-success',
  cancelled: 'bg-error/10 text-error',
};

const statusLabels: Record<string, string> = {
  processing: 'প্রক্রিয়াধীন',
  shipped: 'পাঠানো হয়েছে',
  'out-for-delivery': 'ডেলিভারির পথে',
  delivered: 'ডেলিভারি সম্পন্ন',
  cancelled: 'বাতিল',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState(mockOrders);
  const [viewing, setViewing] = useState<Order | null>(null);
  const { showToast } = useToast();

  const updateStatus = (id: string, status: Order['status']) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    showToast(`অর্ডার ${id} কে "${statusLabels[status]}" হিসেবে চিহ্নিত করা হয়েছে`, 'success');
  };

  const columns: Column<Order>[] = [
    { key: 'id', label: 'অর্ডার আইডি', render: (o) => <span className="font-semibold">{o.id}</span> },
    { key: 'date', label: 'তারিখ', render: (o) => formatDate(o.date) },
    { key: 'items', label: 'আইটেম', render: (o) => o.items.length },
    { key: 'total', label: 'মোট', render: (o) => <span className="font-semibold">{formatPrice(o.total)}</span> },
    {
      key: 'status',
      label: 'অবস্থা',
      render: (o) => (
        <select
          value={o.status}
          onChange={(e) => updateStatus(o.id, e.target.value as Order['status'])}
          className={`text-xs font-semibold rounded-full px-2.5 py-1.5 border-0 outline-none cursor-pointer ${statusColors[o.status]}`}
        >
          {['processing', 'shipped', 'out-for-delivery', 'delivered', 'cancelled'].map((s) => (
            <option key={s} value={s}>{statusLabels[s]}</option>
          ))}
        </select>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (o) => (
        <button onClick={() => setViewing(o)} className="p-2 rounded-full hover:bg-primary-light text-text-secondary hover:text-primary"><Eye size={15} /></button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Seo title="Manage Orders" />
      <div>
        <h2 className="text-2xl font-bold">অর্ডার ব্যবস্থাপনা</h2>
        <p className="text-sm text-text-secondary mt-1">{orders.length}টি অর্ডার (ডেমো তথ্য দেখানো হচ্ছে)।</p>
      </div>
      <DataTable columns={columns} data={orders} rowKey={(o) => o.id} searchPlaceholder="অর্ডার খুঁজুন..." searchFn={(o, q) => o.id.toLowerCase().includes(q)} />

      <Modal open={!!viewing} onClose={() => setViewing(null)}>
        {viewing && (
          <div>
            <h3 className="text-lg font-bold mb-1">{viewing.id}</h3>
            <p className="text-sm text-text-secondary mb-5">{formatDate(viewing.date)} তারিখে করা হয়েছে</p>
            <div className="space-y-3">
              {viewing.items.map((it, i) => {
                const p = products.find((x) => x.id === it.productId);
                if (!p) return null;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <img src={p.images[0]} alt="" className="h-12 w-12 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{p.name}</p>
                      <p className="text-xs text-text-secondary">পরিমাণ {it.quantity}</p>
                    </div>
                    <p className="text-sm font-bold">{formatPrice(it.price)}</p>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between items-center mt-5 pt-5 border-t border-border">
              <span className="font-bold">মোট</span>
              <span className="text-xl font-bold text-primary">{formatPrice(viewing.total)}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

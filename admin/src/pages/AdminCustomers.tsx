import { useState } from 'react';
import { Ban, Mail } from 'lucide-react';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Seo } from '@/components/ui/Seo';
import { formatDate } from '@/lib/format';
import { useToast } from '@/context/ToastContext';

interface Customer {
  id: string;
  name: string;
  email: string;
  orders: number;
  totalSpent: number;
  joined: string;
  status: 'active' | 'blocked';
}

const names = ['Amelia Chen', 'Sofia Rossi', 'Liam Novak', 'Maya Patel', 'Ethan Brooks', 'Isla Fontaine', 'Noah Kim', 'Olivia Ward', 'Lucas Meyer', 'Zara Ahmed', 'Daniel Cole', 'Priya Sharma'];
const initialCustomers: Customer[] = names.map((name, i) => ({
  id: `cus-${1000 + i}`,
  name,
  email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
  orders: (i * 3) % 14,
  totalSpent: Math.round(((i * 137) % 1800) + 60),
  joined: new Date(Date.now() - i * 40 * 86400000).toISOString(),
  status: i % 9 === 0 ? 'blocked' : 'active',
}));

export default function AdminCustomers() {
  const [customers, setCustomers] = useState(initialCustomers);
  const { showToast } = useToast();

  const toggleStatus = (id: string) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, status: c.status === 'active' ? 'blocked' : 'active' } : c)));
    showToast('গ্রাহকের অবস্থা হালনাগাদ করা হয়েছে', 'success');
  };

  const statusLabels: Record<Customer['status'], string> = { active: 'সক্রিয়', blocked: 'অবরুদ্ধ' };

  const columns: Column<Customer>[] = [
    {
      key: 'name',
      label: 'গ্রাহক',
      render: (c) => (
        <div className="flex items-center gap-3 min-w-[200px]">
          <span className="grid place-items-center h-9 w-9 rounded-full bg-primary-light text-primary font-bold text-xs">{c.name[0]}</span>
          <div>
            <p className="font-medium">{c.name}</p>
            <p className="text-xs text-text-secondary">{c.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'orders', label: 'অর্ডার', render: (c) => c.orders },
    { key: 'spent', label: 'মোট ব্যয়', render: (c) => `$${c.totalSpent.toFixed(2)}` },
    { key: 'joined', label: 'যোগদানের তারিখ', render: (c) => formatDate(c.joined) },
    {
      key: 'status',
      label: 'অবস্থা',
      render: (c) => (
        <span className={`badge ${c.status === 'active' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>{statusLabels[c.status]}</span>
      ),
    },
    {
      key: 'actions',
      label: 'কার্যক্রম',
      render: (c) => (
        <div className="flex items-center gap-1.5">
          <button className="p-2 rounded-full hover:bg-primary-light text-text-secondary hover:text-primary"><Mail size={14} /></button>
          <button onClick={() => toggleStatus(c.id)} className="p-2 rounded-full hover:bg-error/10 text-text-secondary hover:text-error"><Ban size={14} /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Seo title="Manage Customers" />
      <div>
        <h2 className="text-2xl font-bold">গ্রাহক ব্যবস্থাপনা</h2>
        <p className="text-sm text-text-secondary mt-1">{customers.length}জন নিবন্ধিত গ্রাহক রয়েছেন।</p>
      </div>
      <DataTable columns={columns} data={customers} rowKey={(c) => c.id} searchPlaceholder="গ্রাহক খুঁজুন..." searchFn={(c, q) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)} />
    </div>
  );
}

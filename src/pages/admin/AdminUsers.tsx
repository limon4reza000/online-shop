import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Seo } from '@/components/ui/Seo';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Manager' | 'Support';
}

const initialUsers: AdminUser[] = [
  { id: 'u1', name: 'Admin', email: 'admin@nityaghor.com', role: 'Super Admin' },
  { id: 'u2', name: 'Grace Liu', email: 'grace@nityaghor.com', role: 'Manager' },
  { id: 'u3', name: 'Marcus Reed', email: 'marcus@nityaghor.com', role: 'Support' },
];

export default function AdminUsers() {
  const [users, setUsers] = useState(initialUsers);
  const { showToast } = useToast();
  const { user } = useAuth();

  const remove = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    showToast('অ্যাডমিন ব্যবহারকারী সরিয়ে ফেলা হয়েছে', 'info');
  };

  const roleLabels: Record<AdminUser['role'], string> = {
    'Super Admin': 'সুপার অ্যাডমিন',
    Manager: 'ম্যানেজার',
    Support: 'সাপোর্ট',
  };

  const columns: Column<AdminUser>[] = [
    {
      key: 'name',
      label: 'ব্যবহারকারী',
      render: (u) => (
        <div className="flex items-center gap-3 min-w-[200px]">
          <span className="grid place-items-center h-9 w-9 rounded-full bg-primary-light text-primary font-bold text-xs">{u.name[0]}</span>
          <div>
            <p className="font-medium">{u.name}</p>
            <p className="text-xs text-text-secondary">{u.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'role', label: 'ভূমিকা', render: (u) => <span className="badge bg-primary-light text-primary">{roleLabels[u.role]}</span> },
    {
      key: 'actions',
      label: 'কার্যক্রম',
      render: (u) => (
        <button
          onClick={() => remove(u.id)}
          disabled={u.email === user?.email}
          className="p-2 rounded-full hover:bg-error/10 text-text-secondary hover:text-error disabled:opacity-30 disabled:pointer-events-none"
        >
          <Trash2 size={14} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Seo title="Admin Users" />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">অ্যাডমিন ব্যবহারকারী ব্যবস্থাপনা</h2>
          <p className="text-sm text-text-secondary mt-1">ভূমিকা-ভিত্তিক অ্যাক্সেসসহ স্টাফ অ্যাকাউন্ট পরিচালনা করুন।</p>
        </div>
        <button onClick={() => showToast('আমন্ত্রণ ফর্ম শীঘ্রই আসছে', 'info')} className="btn-primary btn-sm"><Plus size={15} /> অ্যাডমিন আমন্ত্রণ করুন</button>
      </div>
      <DataTable columns={columns} data={users} rowKey={(u) => u.id} searchPlaceholder="অ্যাডমিন খুঁজুন..." searchFn={(u, q) => u.name.toLowerCase().includes(q)} />
    </div>
  );
}

import { useState } from 'react';
import { Plus, Trash2, X, Loader2, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Seo } from '@/components/ui/Seo';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import {
  useAdminStaff, useCreateStaff, useUpdateStaffRole, useDeleteStaff, type StaffUser, type StaffRole,
} from '@/hooks/useUsers';

const roleLabels: Record<StaffRole, string> = {
  ADMIN: 'সুপার অ্যাডমিন',
  MANAGER: 'ম্যানেজার',
  SUPPORT: 'সাপোর্ট',
};

const emptyForm = { name: '', email: '', password: '', role: 'SUPPORT' as StaffRole };

export default function AdminUsers() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const { data: staff = [], isLoading } = useAdminStaff();
  const createMutation = useCreateStaff();
  const updateRoleMutation = useUpdateStaffRole();
  const deleteMutation = useDeleteStaff();

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [showPw, setShowPw] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<StaffUser | null>(null);

  const openCreate = () => {
    setForm(emptyForm);
    setShowPw(false);
    setFormOpen(true);
  };

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(form, {
      onSuccess: () => { showToast('নতুন স্টাফ অ্যাকাউন্ট তৈরি করা হয়েছে', 'success'); setFormOpen(false); },
      onError: (err: unknown) => {
        const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
        showToast(message === 'An account with this email already exists' ? 'এই ইমেইলে ইতিমধ্যে একটি অ্যাকাউন্ট আছে' : 'তৈরি করা যায়নি, আবার চেষ্টা করুন', 'error');
      },
    });
  };

  const changeRole = (u: StaffUser, role: StaffRole) => {
    updateRoleMutation.mutate({ id: u.id, role }, {
      onSuccess: () => showToast('ভূমিকা পরিবর্তন করা হয়েছে', 'success'),
      onError: () => showToast('ভূমিকা পরিবর্তন করা যায়নি', 'error'),
    });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => { showToast('স্টাফ অ্যাকাউন্ট সরিয়ে ফেলা হয়েছে', 'info'); setDeleteTarget(null); },
      onError: () => { showToast('সরানো যায়নি', 'error'); setDeleteTarget(null); },
    });
  };

  const columns: Column<StaffUser>[] = [
    {
      key: 'name',
      label: 'ব্যবহারকারী',
      render: (u) => (
        <div className="flex items-center gap-3 min-w-[200px]">
          <span className="grid place-items-center h-9 w-9 rounded-full bg-primary-light text-primary font-bold text-xs">{u.name[0]?.toUpperCase()}</span>
          <div>
            <p className="font-medium">{u.name}</p>
            <p className="text-xs text-text-secondary">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'ভূমিকা',
      render: (u) => (
        <select
          value={u.role}
          onChange={(e) => changeRole(u, e.target.value as StaffRole)}
          disabled={u.email === user?.email}
          className="badge bg-primary-light text-primary border-none outline-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {(Object.keys(roleLabels) as StaffRole[]).map((r) => <option key={r} value={r}>{roleLabels[r]}</option>)}
        </select>
      ),
    },
    {
      key: 'actions',
      label: 'কার্যক্রম',
      render: (u) => (
        <button
          onClick={() => setDeleteTarget(u)}
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
        <button onClick={openCreate} className="btn-primary btn-sm"><Plus size={15} /> অ্যাডমিন আমন্ত্রণ করুন</button>
      </div>

      {isLoading ? (
        <div className="card-surface p-14 text-center"><Loader2 size={24} className="mx-auto animate-spin text-primary/40" /></div>
      ) : (
        <DataTable columns={columns} data={staff} rowKey={(u) => u.id} searchPlaceholder="অ্যাডমিন খুঁজুন..." searchFn={(u, q) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)} />
      )}

      {formOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-text-primary/40 backdrop-blur-sm" onClick={() => setFormOpen(false)} />
          <form onSubmit={submitForm} className="relative w-full max-w-md bg-surface rounded-3xl shadow-lift p-6 sm:p-8 animate-fade-in">
            <button type="button" onClick={() => setFormOpen(false)} className="absolute top-4 right-4 btn-icon !h-9 !w-9"><X size={16} /></button>
            <div className="flex items-center gap-2 mb-5">
              <span className="grid place-items-center h-10 w-10 rounded-full bg-primary-light text-primary shrink-0"><ShieldCheck size={18} /></span>
              <h3 className="text-lg font-bold">নতুন স্টাফ আমন্ত্রণ করুন</h3>
            </div>
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium mb-1.5 block">পূর্ণ নাম</span>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="যেমন: Grace Liu" className="input-field" autoFocus />
              </label>
              <label className="block">
                <span className="text-sm font-medium mb-1.5 block">ইমেইল</span>
                <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" required placeholder="staff@nityaghor.com" className="input-field" />
              </label>
              <label className="block">
                <span className="text-sm font-medium mb-1.5 block">অস্থায়ী পাসওয়ার্ড</span>
                <div className="relative">
                  <input
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    type={showPw ? 'text' : 'password'}
                    required
                    minLength={8}
                    placeholder="কমপক্ষে ৮ অক্ষর"
                    className="input-field pr-10"
                  />
                  <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </label>
              <label className="block">
                <span className="text-sm font-medium mb-1.5 block">ভূমিকা</span>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as StaffRole })} className="input-field">
                  {(Object.keys(roleLabels) as StaffRole[]).map((r) => <option key={r} value={r}>{roleLabels[r]}</option>)}
                </select>
              </label>
            </div>
            <button type="submit" disabled={createMutation.isPending} className="btn-primary w-full mt-6 disabled:opacity-60">
              {createMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : 'অ্যাকাউন্ট তৈরি করুন'}
            </button>
          </form>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-text-primary/40 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative w-full max-w-sm bg-surface rounded-3xl shadow-lift p-6 sm:p-8 animate-fade-in text-center">
            <p className="text-sm text-text-secondary mb-1">নিশ্চিত করুন</p>
            <p className="font-semibold mb-6">&ldquo;{deleteTarget.name}&rdquo; স্টাফ অ্যাকাউন্টটি মুছে ফেলতে চান?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="btn-outline flex-1 justify-center">বাতিল</button>
              <button onClick={confirmDelete} disabled={deleteMutation.isPending} className="btn-primary flex-1 justify-center !bg-error hover:!bg-error/90 disabled:opacity-60">
                {deleteMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : 'মুছে ফেলুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

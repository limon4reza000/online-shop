import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Plus, Pencil, Trash2, Home, Briefcase, X, Loader2, Star } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import {
  useAddresses, useCreateAddress, useUpdateAddress, useDeleteAddress, useSetDefaultAddress, type Address,
} from '@/hooks/useAddresses';

const schema = z.object({
  label: z.enum(['Home', 'Office', 'Other']),
  fullName: z.string().min(2, 'পূর্ণ নাম আবশ্যক'),
  phone: z.string().min(6, 'সঠিক মোবাইল নম্বর দিন'),
  division: z.string().min(2, 'বিভাগ আবশ্যক'),
  district: z.string().min(2, 'জেলা আবশ্যক'),
  upazila: z.string().min(2, 'উপজেলা/এলাকা আবশ্যক'),
  postalCode: z.string().min(3, 'পোস্টাল কোড আবশ্যক'),
  fullAddress: z.string().min(5, 'সম্পূর্ণ ঠিকানা আবশ্যক'),
});
type FormData = z.infer<typeof schema>;

const labelIcons = { Home, Office: Briefcase, Other: MapPin };
const labelText: Record<Address['label'], string> = { Home: 'বাড়ি', Office: 'অফিস', Other: 'অন্যান্য' };

const emptyDefaults: FormData = {
  label: 'Home', fullName: '', phone: '', division: '', district: '', upazila: '', postalCode: '', fullAddress: '',
};

function AddressSkeleton() {
  return (
    <div className="card-surface p-5 animate-pulse">
      <div className="h-10 w-10 rounded-xl bg-primary-light" />
      <div className="mt-3 h-4 w-32 rounded bg-primary-light" />
      <div className="mt-2 h-3 w-full rounded bg-primary-light" />
      <div className="mt-1.5 h-3 w-2/3 rounded bg-primary-light" />
    </div>
  );
}

export default function Addresses() {
  const { data: addresses = [], isLoading } = useAddresses();
  const createMutation = useCreateAddress();
  const updateMutation = useUpdateAddress();
  const deleteMutation = useDeleteAddress();
  const defaultMutation = useSetDefaultAddress();
  const { showToast } = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Address | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: emptyDefaults,
  });

  // Warn before an accidental tab-close/refresh while the form has unsaved edits.
  useEffect(() => {
    if (!formOpen || !isDirty) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [formOpen, isDirty]);

  const openCreate = () => {
    reset(emptyDefaults);
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (a: Address) => {
    reset({
      label: a.label, fullName: a.fullName, phone: a.phone, division: a.division,
      district: a.district, upazila: a.upazila, postalCode: a.postalCode, fullAddress: a.fullAddress,
    });
    setEditing(a);
    setFormOpen(true);
  };
  const closeForm = () => {
    if (isDirty && !window.confirm('আপনার পরিবর্তনগুলো সংরক্ষণ করা হয়নি। বন্ধ করতে চান?')) return;
    setFormOpen(false);
    setEditing(null);
  };

  const onSubmit = (data: FormData) => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, ...data }, {
        onSuccess: () => { showToast('ঠিকানা আপডেট হয়েছে', 'success'); setFormOpen(false); setEditing(null); },
        onError: () => showToast('আপডেট করা যায়নি, আবার চেষ্টা করুন', 'error'),
      });
    } else {
      createMutation.mutate(data, {
        onSuccess: () => { showToast('নতুন ঠিকানা যোগ হয়েছে', 'success'); setFormOpen(false); },
        onError: () => showToast('যোগ করা যায়নি, আবার চেষ্টা করুন', 'error'),
      });
    }
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => { showToast('ঠিকানা সরানো হয়েছে', 'info'); setDeleteTarget(null); },
      onError: () => showToast('সরানো যায়নি, আবার চেষ্টা করুন', 'error'),
    });
  };

  const setDefault = (id: string) => {
    defaultMutation.mutate(id, {
      onSuccess: () => showToast('ডিফল্ট ঠিকানা আপডেট হয়েছে', 'success'),
      onError: () => showToast('আপডেট করা যায়নি', 'error'),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">সংরক্ষিত ঠিকানা</h3>
        <button onClick={openCreate} className="btn-primary btn-sm">
          <Plus size={15} /> ঠিকানা যোগ করুন
        </button>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          <AddressSkeleton /><AddressSkeleton />
        </div>
      ) : addresses.length === 0 ? (
        <div className="card-surface p-10 text-center">
          <MapPin size={36} className="mx-auto text-primary/30" />
          <p className="mt-3 font-semibold">এখনো কোনো ঠিকানা সংরক্ষিত নেই</p>
          <p className="text-sm text-text-secondary mt-1">দ্রুত চেকআউটের জন্য একটি ঠিকানা যোগ করুন।</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {addresses.map((a) => {
            const Icon = labelIcons[a.label];
            return (
              <div key={a.id} className={`card-surface p-5 relative border-2 ${a.isDefault ? 'border-primary' : 'border-transparent'}`}>
                {a.isDefault && (
                  <span className="badge bg-primary-light text-primary absolute top-4 right-4 flex items-center gap-1">
                    <Star size={11} className="fill-primary" /> ডিফল্ট
                  </span>
                )}
                <span className="grid place-items-center h-10 w-10 rounded-xl bg-primary-light text-primary"><Icon size={17} /></span>
                <p className="mt-3 font-semibold text-sm">{labelText[a.label]} · {a.fullName}</p>
                <p className="text-sm text-text-secondary mt-1">{a.fullAddress}</p>
                <p className="text-sm text-text-secondary">{a.upazila}, {a.district}, {a.division}</p>
                <p className="text-sm text-text-secondary">পোস্ট কোড: {a.postalCode}</p>
                <p className="text-sm text-text-secondary mt-1">{a.phone}</p>
                <div className="flex items-center gap-3 mt-4">
                  {!a.isDefault && (
                    <button onClick={() => setDefault(a.id)} disabled={defaultMutation.isPending} className="text-xs font-semibold text-primary hover:underline disabled:opacity-60">
                      ডিফল্ট করুন
                    </button>
                  )}
                  <button onClick={() => openEdit(a)} className="text-xs font-semibold text-text-secondary hover:text-primary flex items-center gap-1"><Pencil size={12} /> সম্পাদনা</button>
                  <button onClick={() => setDeleteTarget(a)} className="text-xs font-semibold text-error hover:underline flex items-center gap-1"><Trash2 size={12} /> সরান</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-text-primary/40 backdrop-blur-sm" onClick={closeForm} />
          <form onSubmit={handleSubmit(onSubmit)} className="relative w-full max-w-lg bg-surface rounded-3xl shadow-lift p-6 sm:p-8 max-h-[90vh] overflow-y-auto animate-fade-in">
            <button type="button" onClick={closeForm} className="absolute top-4 right-4 btn-icon !h-9 !w-9"><X size={16} /></button>
            <h3 className="text-lg font-bold mb-5">{editing ? 'ঠিকানা সম্পাদনা করুন' : 'নতুন ঠিকানা যোগ করুন'}</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block sm:col-span-2">
                <span className="text-sm font-medium mb-1.5 block">লেবেল</span>
                <select {...register('label')} className="input-field">
                  <option value="Home">বাড়ি</option>
                  <option value="Office">অফিস</option>
                  <option value="Other">অন্যান্য</option>
                </select>
              </label>
              <label className="block sm:col-span-2">
                <span className="text-sm font-medium mb-1.5 block">পূর্ণ নাম</span>
                <input {...register('fullName')} className="input-field" />
                {errors.fullName && <span className="text-xs text-error mt-1 block">{errors.fullName.message}</span>}
              </label>
              <label className="block sm:col-span-2">
                <span className="text-sm font-medium mb-1.5 block">মোবাইল নম্বর</span>
                <input {...register('phone')} placeholder="01XXXXXXXXX" className="input-field" />
                {errors.phone && <span className="text-xs text-error mt-1 block">{errors.phone.message}</span>}
              </label>
              <label className="block">
                <span className="text-sm font-medium mb-1.5 block">বিভাগ</span>
                <input {...register('division')} placeholder="ঢাকা" className="input-field" />
                {errors.division && <span className="text-xs text-error mt-1 block">{errors.division.message}</span>}
              </label>
              <label className="block">
                <span className="text-sm font-medium mb-1.5 block">জেলা</span>
                <input {...register('district')} placeholder="ঢাকা" className="input-field" />
                {errors.district && <span className="text-xs text-error mt-1 block">{errors.district.message}</span>}
              </label>
              <label className="block">
                <span className="text-sm font-medium mb-1.5 block">উপজেলা/এলাকা</span>
                <input {...register('upazila')} placeholder="মিরপুর" className="input-field" />
                {errors.upazila && <span className="text-xs text-error mt-1 block">{errors.upazila.message}</span>}
              </label>
              <label className="block">
                <span className="text-sm font-medium mb-1.5 block">পোস্টাল কোড</span>
                <input {...register('postalCode')} placeholder="1216" className="input-field" />
                {errors.postalCode && <span className="text-xs text-error mt-1 block">{errors.postalCode.message}</span>}
              </label>
              <label className="block sm:col-span-2">
                <span className="text-sm font-medium mb-1.5 block">সম্পূর্ণ ঠিকানা</span>
                <textarea {...register('fullAddress')} rows={3} placeholder="বাসা/হোল্ডিং নম্বর, রোড, এলাকার বিস্তারিত" className="input-field resize-none" />
                {errors.fullAddress && <span className="text-xs text-error mt-1 block">{errors.fullAddress.message}</span>}
              </label>
            </div>
            <button type="submit" disabled={isSubmitting || createMutation.isPending || updateMutation.isPending} className="btn-primary w-full mt-6 disabled:opacity-60">
              {createMutation.isPending || updateMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : 'ঠিকানা সংরক্ষণ করুন'}
            </button>
          </form>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-text-primary/40 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative w-full max-w-sm bg-surface rounded-3xl shadow-lift p-6 sm:p-8 animate-fade-in text-center">
            <p className="text-sm text-text-secondary mb-1">নিশ্চিত করুন</p>
            <p className="font-semibold mb-6">&ldquo;{labelText[deleteTarget.label]} · {deleteTarget.fullName}&rdquo; ঠিকানাটি মুছে ফেলতে চান?</p>
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

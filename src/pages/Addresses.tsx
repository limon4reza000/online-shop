import { useState } from 'react';
import { MapPin, Plus, Pencil, Trash2, Home, Briefcase, X } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface Address {
  id: string;
  label: 'Home' | 'Work' | 'Other';
  name: string;
  line: string;
  city: string;
  zip: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

const initialAddresses: Address[] = [
  { id: 'a1', label: 'Home', name: 'Jane Doe', line: '21 Bloom Avenue, Apt 4B', city: 'New York, NY', zip: '10001', country: 'United States', phone: '+1 (555) 010-2093', isDefault: true },
  { id: 'a2', label: 'Work', name: 'Jane Doe', line: '500 Madison Ave, Suite 1900', city: 'New York, NY', zip: '10022', country: 'United States', phone: '+1 (555) 010-2093', isDefault: false },
];

const labelIcons = { Home, Work: Briefcase, Other: MapPin };
const labelText: Record<Address['label'], string> = { Home: 'বাড়ি', Work: 'অফিস', Other: 'অন্যান্য' };

export default function Addresses() {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const { showToast } = useToast();

  const removeAddress = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    showToast('ঠিকানা সরানো হয়েছে', 'info');
  };

  const setDefault = (id: string) => {
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
    showToast('ডিফল্ট ঠিকানা আপডেট হয়েছে', 'success');
  };

  const saveAddress = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data: Address = {
      id: editing?.id || `a${Date.now()}`,
      label: (form.get('label') as Address['label']) || 'Home',
      name: String(form.get('name') || ''),
      line: String(form.get('line') || ''),
      city: String(form.get('city') || ''),
      zip: String(form.get('zip') || ''),
      country: String(form.get('country') || ''),
      phone: String(form.get('phone') || ''),
      isDefault: editing?.isDefault ?? addresses.length === 0,
    };
    setAddresses((prev) => (editing ? prev.map((a) => (a.id === editing.id ? data : a)) : [...prev, data]));
    showToast(editing ? 'ঠিকানা আপডেট হয়েছে' : 'ঠিকানা যোগ হয়েছে', 'success');
    setFormOpen(false);
    setEditing(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">সংরক্ষিত ঠিকানা</h3>
        <button onClick={() => { setEditing(null); setFormOpen(true); }} className="btn-primary btn-sm">
          <Plus size={15} /> ঠিকানা যোগ করুন
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="card-surface p-10 text-center">
          <MapPin size={36} className="mx-auto text-primary/30" />
          <p className="mt-3 font-semibold">এখনো কোনো ঠিকানা সংরক্ষিত নেই</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {addresses.map((a) => {
            const Icon = labelIcons[a.label];
            return (
              <div key={a.id} className={`card-surface p-5 relative ${a.isDefault ? 'border-primary' : ''}`}>
                {a.isDefault && <span className="badge bg-primary-light text-primary absolute top-4 right-4">ডিফল্ট</span>}
                <span className="grid place-items-center h-10 w-10 rounded-xl bg-primary-light text-primary"><Icon size={17} /></span>
                <p className="mt-3 font-semibold text-sm">{labelText[a.label]} · {a.name}</p>
                <p className="text-sm text-text-secondary mt-1">{a.line}</p>
                <p className="text-sm text-text-secondary">{a.city}, {a.zip}</p>
                <p className="text-sm text-text-secondary">{a.country}</p>
                <p className="text-sm text-text-secondary mt-1">{a.phone}</p>
                <div className="flex items-center gap-3 mt-4">
                  {!a.isDefault && <button onClick={() => setDefault(a.id)} className="text-xs font-semibold text-primary hover:underline">ডিফল্ট করুন</button>}
                  <button onClick={() => { setEditing(a); setFormOpen(true); }} className="text-xs font-semibold text-text-secondary hover:text-primary flex items-center gap-1"><Pencil size={12} /> সম্পাদনা</button>
                  <button onClick={() => removeAddress(a.id)} className="text-xs font-semibold text-error hover:underline flex items-center gap-1"><Trash2 size={12} /> সরান</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-text-primary/40 backdrop-blur-sm" onClick={() => setFormOpen(false)} />
          <form onSubmit={saveAddress} className="relative w-full max-w-lg bg-surface rounded-3xl shadow-lift p-6 sm:p-8 max-h-[90vh] overflow-y-auto animate-fade-in">
            <button type="button" onClick={() => setFormOpen(false)} className="absolute top-4 right-4 btn-icon !h-9 !w-9"><X size={16} /></button>
            <h3 className="text-lg font-bold mb-5">{editing ? 'ঠিকানা সম্পাদনা করুন' : 'নতুন ঠিকানা যোগ করুন'}</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block sm:col-span-2">
                <span className="text-sm font-medium mb-1.5 block">লেবেল</span>
                <select name="label" defaultValue={editing?.label || 'Home'} className="input-field">
                  <option value="Home">বাড়ি</option><option value="Work">অফিস</option><option value="Other">অন্যান্য</option>
                </select>
              </label>
              <label className="block sm:col-span-2">
                <span className="text-sm font-medium mb-1.5 block">পুরো নাম</span>
                <input name="name" defaultValue={editing?.name} required className="input-field" />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-sm font-medium mb-1.5 block">ঠিকানার লাইন</span>
                <input name="line" defaultValue={editing?.line} required className="input-field" />
              </label>
              <label className="block">
                <span className="text-sm font-medium mb-1.5 block">শহর</span>
                <input name="city" defaultValue={editing?.city} required className="input-field" />
              </label>
              <label className="block">
                <span className="text-sm font-medium mb-1.5 block">জিপ কোড</span>
                <input name="zip" defaultValue={editing?.zip} required className="input-field" />
              </label>
              <label className="block">
                <span className="text-sm font-medium mb-1.5 block">দেশ</span>
                <input name="country" defaultValue={editing?.country || 'United States'} required className="input-field" />
              </label>
              <label className="block">
                <span className="text-sm font-medium mb-1.5 block">ফোন</span>
                <input name="phone" defaultValue={editing?.phone} required className="input-field" />
              </label>
            </div>
            <button type="submit" className="btn-primary w-full mt-6">ঠিকানা সংরক্ষণ করুন</button>
          </form>
        </div>
      )}
    </div>
  );
}

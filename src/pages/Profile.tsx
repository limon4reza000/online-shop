import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function Profile() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('প্রোফাইল সফলভাবে আপডেট হয়েছে', 'success');
  };

  const changePassword = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে', 'success');
  };

  return (
    <div className="space-y-6">
      <form onSubmit={save} className="card-surface p-6">
        <h3 className="text-lg font-bold mb-5">ব্যক্তিগত তথ্য</h3>
        <div className="grid sm:grid-cols-2 gap-5">
          <label className="block">
            <span className="text-sm font-medium mb-1.5 block">পুরো নাম</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
          </label>
          <label className="block">
            <span className="text-sm font-medium mb-1.5 block">ইমেইল</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="input-field" />
          </label>
          <label className="block">
            <span className="text-sm font-medium mb-1.5 block">ফোন</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" className="input-field" />
          </label>
          <label className="block">
            <span className="text-sm font-medium mb-1.5 block">শিপিং ঠিকানা</span>
            <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Bloom Ave, New York, NY" className="input-field" />
          </label>
        </div>
        <button type="submit" className="btn-primary mt-6">পরিবর্তন সংরক্ষণ করুন</button>
      </form>

      <form onSubmit={changePassword} className="card-surface p-6">
        <h3 className="text-lg font-bold mb-5">পাসওয়ার্ড পরিবর্তন করুন</h3>
        <div className="grid sm:grid-cols-3 gap-5">
          <label className="block">
            <span className="text-sm font-medium mb-1.5 block">বর্তমান পাসওয়ার্ড</span>
            <input type="password" className="input-field" placeholder="••••••••" />
          </label>
          <label className="block">
            <span className="text-sm font-medium mb-1.5 block">নতুন পাসওয়ার্ড</span>
            <input type="password" className="input-field" placeholder="••••••••" />
          </label>
          <label className="block">
            <span className="text-sm font-medium mb-1.5 block">নতুন পাসওয়ার্ড নিশ্চিত করুন</span>
            <input type="password" className="input-field" placeholder="••••••••" />
          </label>
        </div>
        <button type="submit" className="btn-outline mt-6">পাসওয়ার্ড আপডেট করুন</button>
      </form>
    </div>
  );
}

import { useState } from 'react';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { Seo } from '@/components/ui/Seo';
import { useToast } from '@/context/ToastContext';

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  active: boolean;
}

const initialBanners: Banner[] = [
  { id: 'b1', title: 'Elevate Your Everyday Style', subtitle: 'New Season Arrivals', image: 'https://picsum.photos/seed/banner1/500/280', active: true },
  { id: 'b2', title: 'Flash Sale — Up to 40% Off', subtitle: 'Limited Time Only', image: 'https://picsum.photos/seed/banner2/500/280', active: true },
  { id: 'b3', title: 'Winter Capsule Collection', subtitle: 'Curated Essentials', image: 'https://picsum.photos/seed/banner3/500/280', active: false },
];

export default function AdminBanners() {
  const [banners, setBanners] = useState(initialBanners);
  const { showToast } = useToast();

  const remove = (id: string) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
    showToast('ব্যানার সরিয়ে ফেলা হয়েছে', 'info');
  };
  const toggle = (id: string) => {
    setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, active: !b.active } : b)));
  };

  return (
    <div className="space-y-6">
      <Seo title="Manage Banners" />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">ব্যানার ব্যবস্থাপনা</h2>
          <p className="text-sm text-text-secondary mt-1">হোমপেজের হিরো এবং প্রচারণামূলক ব্যানার।</p>
        </div>
        <button onClick={() => showToast('ব্যানার আপলোড ফর্ম শীঘ্রই আসছে', 'info')} className="btn-primary btn-sm"><Plus size={15} /> ব্যানার যোগ করুন</button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {banners.map((b) => (
          <div key={b.id} className="card-surface overflow-hidden">
            <div className="relative aspect-video">
              <img src={b.image} alt={b.title} className="h-full w-full object-cover" />
              <span className={`absolute top-3 left-3 badge ${b.active ? 'bg-success text-white' : 'bg-text-secondary text-white'}`}>{b.active ? 'লাইভ' : 'লুকানো'}</span>
            </div>
            <div className="p-4">
              <p className="text-xs text-primary font-semibold uppercase">{b.subtitle}</p>
              <p className="font-semibold text-sm mt-0.5 line-clamp-1">{b.title}</p>
              <div className="flex items-center gap-1.5 mt-3">
                <button onClick={() => toggle(b.id)} className="btn-outline btn-sm flex-1 justify-center !py-2">
                  {b.active ? <EyeOff size={13} /> : <Eye size={13} />} {b.active ? 'লুকান' : 'দেখান'}
                </button>
                <button onClick={() => remove(b.id)} className="p-2.5 rounded-full hover:bg-error/10 text-text-secondary hover:text-error"><Trash2 size={15} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

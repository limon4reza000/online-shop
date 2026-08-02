import { Sparkles, Truck, ShieldCheck, Download } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const pills = [
  { icon: Sparkles, label: 'প্রতিদিন নতুন কালেকশন', dark: true },
  { icon: Truck, label: '$৭৫+ অর্ডারে ফ্রি শিপিং', dark: false },
  { icon: ShieldCheck, label: '১০০% নিরাপদ চেকআউট', dark: false },
];

export function PromoPills() {
  const { t } = useLanguage();

  return (
    <div className="container-app -mt-2 mb-8">
      <div className="hidden sm:grid sm:grid-cols-3 gap-3">
        {pills.map((p) => (
          <div
            key={p.label}
            className={`flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold ${
              p.dark ? 'bg-text-primary text-white' : 'bg-primary-light text-primary'
            }`}
          >
            <p.icon size={16} /> {t(p.label)}
          </div>
        ))}
      </div>

      <div className="sm:hidden flex items-center justify-center gap-2 rounded-full bg-primary-light text-primary px-4 py-3 text-sm font-semibold">
        <Truck size={16} /> {t('৳৩০০০+ অর্ডারে ফ্রি ডেলিভারি')}
      </div>

      <button className="mt-3 w-full flex items-center justify-center gap-2 rounded-lg border-2 border-primary/20 text-primary px-4 py-3 text-sm font-semibold cursor-pointer hover:bg-primary-light hover:border-primary/40 transition-colors">
        <Download size={16} /> {t('অ্যাপ ইনস্টল করুন')}
      </button>
    </div>
  );
}

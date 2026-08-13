import { Sparkles, Truck, ShieldCheck, Download } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { usePublicStoreSettings } from '@/hooks/useSettings';

export function PromoPills() {
  const { t } = useLanguage();
  const { data: settings } = usePublicStoreSettings();

  return (
    <div className="container-app -mt-2 mb-8">
      <div className="hidden sm:grid sm:grid-cols-3 gap-3">
        <div className="flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold bg-text-primary text-white">
          <Sparkles size={16} /> {t('promoPills.newCollectionDaily')}
        </div>
        {settings?.freeDeliveryEnabled ? (
          <div className="flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold bg-primary-light text-primary">
            <Truck size={16} /> {t('promoPills.freeShippingOver', { amount: settings.freeDeliveryThreshold.toLocaleString('en-US') })}
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold bg-primary-light text-primary">
            <ShieldCheck size={16} /> {t('promoPills.secureCheckout')}
          </div>
        )}
        <div className="flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold bg-primary-light text-primary">
          <ShieldCheck size={16} /> {t('promoPills.cashOnDelivery')}
        </div>
      </div>

      {/* Hidden unless admin enables it (Settings → শিপিং) — off by default. */}
      {settings?.freeDeliveryEnabled && (
        <div className="sm:hidden flex items-center justify-center gap-2 rounded-full bg-primary-light text-primary px-4 py-3 text-sm font-semibold">
          <Truck size={16} /> {t('promoPills.freeDeliveryOver', { amount: settings.freeDeliveryThreshold.toLocaleString('en-US') })}
        </div>
      )}

      <button className="mt-3 w-full flex items-center justify-center gap-2 rounded-lg border-2 border-primary/20 text-primary px-4 py-3 text-sm font-semibold cursor-pointer hover:bg-primary-light hover:border-primary/40 transition-colors">
        <Download size={16} /> {t('promoPills.installApp')}
      </button>
    </div>
  );
}

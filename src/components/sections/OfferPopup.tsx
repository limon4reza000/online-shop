import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { usePublicPopup } from '@/hooks/usePopup';

const DISMISS_KEY = 'promo-popup-dismissed';

/** Floating promotional popup — home page only. Remembers dismissal per popup
 * version (id + updatedAt), so editing the popup in admin makes it reappear
 * even for visitors who already closed the previous copy. */
export function OfferPopup() {
  const { data: popup } = usePublicPopup();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!popup) return;
    try {
      const dismissed = localStorage.getItem(DISMISS_KEY);
      if (dismissed === `${popup.id}:${popup.updatedAt}`) return;
    } catch { /* noop */ }

    const timer = setTimeout(() => {
      setMounted(true);
      requestAnimationFrame(() => setVisible(true));
    }, Math.max(0, popup.delaySeconds) * 1000);
    return () => clearTimeout(timer);
  }, [popup]);

  if (!popup || !mounted) return null;

  const close = () => {
    setVisible(false);
    setTimeout(() => setMounted(false), 400);
    try { localStorage.setItem(DISMISS_KEY, `${popup.id}:${popup.updatedAt}`); } catch { /* noop */ }
  };

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 w-[90vw] max-w-sm transition-all duration-500 ease-out ${
        visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95 pointer-events-none'
      }`}
    >
      <div className="relative rounded-3xl bg-white shadow-lift border border-border overflow-hidden">
        <button
          onClick={close}
          aria-label="বন্ধ করুন"
          className="absolute top-3 right-3 z-10 grid place-items-center h-8 w-8 rounded-full bg-white/90 hover:bg-white text-text-primary shadow-soft transition-colors"
        >
          <X size={15} />
        </button>
        {popup.imageUrl && (
          <div className="aspect-16/9 overflow-hidden">
            <img src={popup.imageUrl} alt="" className="h-full w-full object-cover" />
          </div>
        )}
        <div className="p-5">
          <h3 className="text-lg font-bold text-text-primary">{popup.title}</h3>
          <p className="mt-1.5 text-sm text-text-secondary leading-relaxed">{popup.message}</p>
          {popup.buttonText && popup.buttonLink && (
            <a href={popup.buttonLink} onClick={close} className="btn-primary w-full mt-4 justify-center">
              {popup.buttonText}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

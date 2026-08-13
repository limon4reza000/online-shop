import { useEffect, useState } from 'react';
import { Loader2, X, Megaphone } from 'lucide-react';
import { Seo } from '@/components/ui/Seo';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { useToast } from '@/context/ToastContext';
import { useAdminPopup, useUpdatePopup } from '@/hooks/usePopup';

// <input type="datetime-local"> needs "YYYY-MM-DDTHH:mm" in local time, not an ISO/UTC string.
function toDatetimeLocalValue(iso: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AdminPromoPopup() {
  const { showToast } = useToast();
  const { data: popup, isLoading } = useAdminPopup();
  const updateMutation = useUpdatePopup();

  const [enabled, setEnabled] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [buttonLink, setButtonLink] = useState('');
  const [delaySeconds, setDelaySeconds] = useState(3);
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!popup) return;
    setEnabled(popup.enabled);
    setTitle(popup.title);
    setMessage(popup.message);
    setImageUrl(popup.imageUrl ?? '');
    setButtonText(popup.buttonText ?? '');
    setButtonLink(popup.buttonLink ?? '');
    setDelaySeconds(popup.delaySeconds);
    setStartAt(toDatetimeLocalValue(popup.startAt));
    setEndAt(toDatetimeLocalValue(popup.endAt));
  }, [popup]);

  const save = () => {
    updateMutation.mutate(
      {
        enabled,
        title,
        message,
        imageUrl: imageUrl || null,
        buttonText: buttonText || null,
        buttonLink: buttonLink || null,
        delaySeconds,
        startAt: startAt ? new Date(startAt).toISOString() : null,
        endAt: endAt ? new Date(endAt).toISOString() : null,
      },
      {
        onSuccess: () => showToast('পরিবর্তন সংরক্ষণ করা হয়েছে', 'success'),
        onError: () => showToast('সংরক্ষণ করা যায়নি, আবার চেষ্টা করুন', 'error'),
      }
    );
  };

  if (isLoading) {
    return <div className="grid place-items-center py-24"><Loader2 size={28} className="animate-spin text-primary/50" /></div>;
  }

  return (
    <div className="space-y-6">
      <Seo title="প্রোমো পপআপ" />
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs font-semibold text-primary uppercase tracking-wide flex items-center gap-1.5"><Megaphone size={13} /> Content Management</p>
          <h2 className="text-2xl font-bold mt-0.5">প্রোমো পপআপ</h2>
          <p className="text-sm text-text-secondary mt-1">হোমপেজে ভাসমান প্রোমোশনাল পপআপ পরিচালনা করুন।</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowPreview(true)} className="btn-outline btn-sm">প্রিভিউ দেখুন</button>
          <button onClick={save} disabled={updateMutation.isPending} className="btn-primary btn-sm disabled:opacity-60">
            {updateMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : 'সংরক্ষণ করুন'}
          </button>
        </div>
      </div>

      <div className="card-surface p-5 sm:p-6 space-y-5 max-w-2xl">
        <label className="flex items-center gap-2.5 cursor-pointer w-fit">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="h-4 w-4 accent-primary rounded" />
          <span className="text-sm font-medium">পপআপ সক্রিয় করুন</span>
        </label>

        <label className="block">
          <span className="text-sm font-medium mb-1.5 block">শিরোনাম</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} className="input-field" placeholder="অফার শীঘ্রই শেষ হচ্ছে" />
        </label>

        <label className="block">
          <span className="text-sm font-medium mb-1.5 block">বার্তা</span>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} maxLength={200} className="input-field resize-none" placeholder="সীমিত সময়ের জন্য বিশেষ ছাড় — এখনই কেনাকাটা করুন।" />
        </label>

        <ImageUploader label="ছবি (ঐচ্ছিক)" value={imageUrl} onChange={setImageUrl} aspect="aspect-video" size="max-w-[280px]" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium mb-1.5 block">বাটন টেক্সট (ঐচ্ছিক)</span>
            <input value={buttonText} onChange={(e) => setButtonText(e.target.value)} maxLength={40} className="input-field" placeholder="এখনই কিনুন" />
          </label>
          <label className="block">
            <span className="text-sm font-medium mb-1.5 block">বাটন লিংক (ঐচ্ছিক)</span>
            <input value={buttonLink} onChange={(e) => setButtonLink(e.target.value)} className="input-field" placeholder="/shop" />
          </label>
        </div>

        <label className="block max-w-[220px]">
          <span className="text-sm font-medium mb-1.5 block">দেখানোর বিলম্ব (সেকেন্ড)</span>
          <input
            type="number"
            min={0}
            value={delaySeconds}
            onChange={(e) => setDelaySeconds(Math.max(0, Number(e.target.value)))}
            className="input-field"
          />
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium mb-1.5 block">শুরুর সময় (ঐচ্ছিক)</span>
            <input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} className="input-field" />
          </label>
          <label className="block">
            <span className="text-sm font-medium mb-1.5 block">শেষের সময় (ঐচ্ছিক)</span>
            <input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} className="input-field" />
          </label>
        </div>
        <p className="text-xs text-text-secondary">শুরু/শেষের সময় ফাঁকা রাখলে, সক্রিয় করা মাত্রই পপআপ সবসময় দেখানো হবে।</p>
      </div>

      {showPreview && (
        <div className="fixed inset-0 z-[90]">
          <div className="absolute inset-0 bg-text-primary/40 backdrop-blur-sm" onClick={() => setShowPreview(false)} />
          <div className="absolute bottom-5 right-5 z-50 w-[90vw] max-w-sm animate-fade-in">
            <div className="relative rounded-3xl bg-white shadow-lift border border-border overflow-hidden">
              <button
                onClick={() => setShowPreview(false)}
                aria-label="বন্ধ করুন"
                className="absolute top-3 right-3 z-10 grid place-items-center h-8 w-8 rounded-full bg-white/90 hover:bg-white text-text-primary shadow-soft transition-colors"
              >
                <X size={15} />
              </button>
              {imageUrl && (
                <div className="aspect-16/9 overflow-hidden">
                  <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                </div>
              )}
              <div className="p-5">
                <h3 className="text-lg font-bold text-text-primary">{title || 'শিরোনাম'}</h3>
                <p className="mt-1.5 text-sm text-text-secondary leading-relaxed">{message || 'বার্তা'}</p>
                {buttonText && buttonLink && (
                  <span className="btn-primary w-full mt-4 justify-center">{buttonText}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

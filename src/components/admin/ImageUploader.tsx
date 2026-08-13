import { useRef } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { useUploadImage } from '@/hooks/useUpload';
import { useToast } from '@/context/ToastContext';

export function ImageUploader({
  value, onChange, label, aspect = 'aspect-square', rounded = 'rounded-2xl', size = 'max-w-[180px]',
}: {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  aspect?: string;
  rounded?: string;
  size?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadImage();
  const { showToast } = useToast();

  const handleFile = (file?: File) => {
    if (!file) return;
    upload.mutate(file, {
      onSuccess: (url) => onChange(url),
      onError: () => showToast('ছবি আপলোড করা যায়নি', 'error'),
    });
  };

  return (
    <div>
      {label && <span className="text-sm font-medium mb-1.5 block">{label}</span>}
      <div
        className={`relative ${aspect} w-full ${size} ${rounded} border-2 border-dashed border-border overflow-hidden bg-primary-light/40 cursor-pointer hover:border-primary transition-colors group`}
        onClick={() => inputRef.current?.click()}
      >
        {value ? (
          <>
            <img src={value} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(''); }}
              className="absolute top-2 right-2 grid place-items-center h-7 w-7 rounded-full bg-text-primary/70 text-white hover:bg-error transition-colors"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <div className="h-full w-full grid place-items-center text-text-secondary group-hover:text-primary transition-colors">
            {upload.isPending ? <Loader2 size={22} className="animate-spin" /> : <ImagePlus size={22} />}
          </div>
        )}
        {upload.isPending && value && (
          <div className="absolute inset-0 bg-text-primary/40 grid place-items-center">
            <Loader2 size={22} className="animate-spin text-white" />
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}

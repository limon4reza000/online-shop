import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export function Drawer({
  open,
  onClose,
  title,
  children,
  side = 'right',
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  side?: 'left' | 'right';
}) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[95]">
      <div className="absolute inset-0 bg-text-primary/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div
        className={`absolute top-0 ${side === 'left' ? 'left-0' : 'right-0'} h-full w-full max-w-md bg-surface shadow-lift overflow-y-auto animate-fade-in flex flex-col`}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-5 border-b border-border shrink-0">
            <h3 className="text-lg font-bold">{title}</h3>
            <button onClick={onClose} aria-label="বন্ধ করুন" className="btn-icon !h-9 !w-9"><X size={16} /></button>
          </div>
        )}
        <div className="flex-1 p-6">{children}</div>
      </div>
    </div>,
    document.body
  );
}

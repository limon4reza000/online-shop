import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

export function Modal({ open, onClose, children, maxWidth = 'max-w-lg' }: { open: boolean; onClose: () => void; children: ReactNode; maxWidth?: string }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-text-primary/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className={`relative w-full ${maxWidth} bg-white rounded-3xl shadow-lift p-6 sm:p-8 max-h-[90vh] overflow-y-auto animate-fade-in`}>
        <button
          onClick={onClose}
          aria-label="বন্ধ করুন"
          className="absolute top-4 right-4 grid place-items-center h-9 w-9 rounded-full bg-primary-light text-text-primary hover:bg-primary hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
}

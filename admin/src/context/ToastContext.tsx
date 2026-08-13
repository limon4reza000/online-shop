import { createContext, useCallback, useContext, type ReactNode } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { CheckCircle2, XCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const icons = { success: CheckCircle2, error: XCircle, info: Info };
const iconColors = { success: 'text-success', error: 'text-error', info: 'text-primary' };

export function ToastProvider({ children }: { children: ReactNode }) {
  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const Icon = icons[type];
    toast.custom(
      (t) => (
        <div
          className={`flex items-start gap-3 rounded-2xl bg-surface border border-border shadow-lift px-4 py-3.5 w-[calc(100vw-2.5rem)] max-w-sm transition-all duration-300 ${
            t.visible ? 'animate-fade-in' : 'opacity-0'
          }`}
        >
          <Icon size={20} className={`shrink-0 mt-0.5 ${iconColors[type]}`} />
          <p className="text-sm text-text-primary flex-1">{message}</p>
        </div>
      ),
      { duration: 3200 }
    );
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toaster position="bottom-right" gutter={12} toastOptions={{ style: { background: 'transparent', boxShadow: 'none', padding: 0 } }} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

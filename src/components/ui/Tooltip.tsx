import { useState, type ReactNode } from 'react';

export function Tooltip({ label, children, side = 'top' }: { label: string; children: ReactNode; side?: 'top' | 'bottom' }) {
  const [visible, setVisible] = useState(false);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span
          role="tooltip"
          className={`absolute left-1/2 -translate-x-1/2 ${side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'} whitespace-nowrap rounded-lg bg-text-primary text-bg text-xs font-medium px-2.5 py-1.5 shadow-lift z-50 animate-fade-in pointer-events-none`}
        >
          {label}
        </span>
      )}
    </span>
  );
}

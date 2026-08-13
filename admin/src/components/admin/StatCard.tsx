import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export function StatCard({
  label,
  value,
  change,
  icon: Icon,
}: {
  label: string;
  value: string;
  change?: number;
  icon: LucideIcon;
}) {
  const positive = (change ?? 0) >= 0;
  return (
    <div className="card-surface p-5">
      <div className="flex items-start justify-between">
        <span className="grid place-items-center h-10 w-10 rounded-xl bg-primary-light text-primary"><Icon size={18} /></span>
        {change !== undefined && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold ${positive ? 'text-success' : 'text-error'}`}>
            {positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-bold font-display">{value}</p>
      <p className="text-xs text-text-secondary mt-0.5">{label}</p>
    </div>
  );
}

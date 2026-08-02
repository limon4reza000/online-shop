import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionTo,
  secondaryActionLabel,
  secondaryActionTo,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionTo?: string;
  secondaryActionLabel?: string;
  secondaryActionTo?: string;
}) {
  return (
    <div className="relative text-center py-16 px-4 overflow-hidden">
      <div className="pointer-events-none absolute left-1/2 top-8 h-56 w-56 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative">
        <span className="inline-grid place-items-center h-20 w-20 rounded-full bg-primary-light text-primary">
          <Icon size={30} />
        </span>
        <p className="mt-5 text-lg font-bold text-text-primary">{title}</p>
        {description && <p className="mt-2 text-sm text-text-secondary max-w-sm mx-auto leading-relaxed">{description}</p>}
        {(actionLabel && actionTo) || (secondaryActionLabel && secondaryActionTo) ? (
          <div className="mt-6 flex items-center justify-center gap-3">
            {actionLabel && actionTo && <Link to={actionTo} className="btn-primary">{actionLabel}</Link>}
            {secondaryActionLabel && secondaryActionTo && <Link to={secondaryActionTo} className="btn-outline">{secondaryActionLabel}</Link>}
          </div>
        ) : null}
      </div>
    </div>
  );
}

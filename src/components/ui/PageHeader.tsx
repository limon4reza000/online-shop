import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Breadcrumbs } from './Breadcrumbs';

export function PageHeader({
  title,
  subtitle,
  crumbs,
  showBack = false,
}: {
  title: string;
  subtitle?: string;
  crumbs: { label: string; to?: string }[];
  showBack?: boolean;
}) {
  const navigate = useNavigate();

  if (showBack) {
    return (
      <div className="bg-linear-to-br from-primary-light via-bg to-white border-b border-border">
        <div className="container-app py-5">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              aria-label="পেছনে যান"
              className="grid place-items-center h-10 w-10 rounded-full bg-white/70 hover:bg-white text-text-primary shadow-soft transition-colors shrink-0"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-xl sm:text-2xl">{title}</h1>
          </div>
          {crumbs.length > 0 && (
            <div className="mt-3 pl-14">
              <Breadcrumbs items={crumbs} />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-linear-to-br from-primary-light via-bg to-white border-b border-border">
      <div className="container-app py-10 sm:py-14 text-center relative">
        <h1 className="text-3xl sm:text-5xl">{title}</h1>
        {subtitle && <p className="mt-3 text-text-secondary max-w-xl mx-auto">{subtitle}</p>}
        <div className="mt-5 flex justify-center">
          <Breadcrumbs items={crumbs} />
        </div>
      </div>
    </div>
  );
}

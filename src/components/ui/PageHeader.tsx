import { useMemo, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Breadcrumbs } from './Breadcrumbs';
import { useTypewriter } from '@/hooks/useTypewriter';

export function PageHeader({
  title,
  subtitle,
  crumbs,
  showBack = false,
  centerBack = false,
}: {
  title: ReactNode;
  /** A single fixed subtitle, or several sentences to cycle through with the typewriter effect. */
  subtitle?: string | string[];
  crumbs: { label: string; to?: string }[];
  showBack?: boolean;
  /** Adds a back button to the centered hero layout (used when a page needs the big title + subtitle look but still wants back navigation). Independent of `showBack`, which switches to the compact layout instead. */
  centerBack?: boolean;
}) {
  const navigate = useNavigate();
  const subtitleWords = useMemo(() => {
    if (!subtitle) return [];
    return Array.isArray(subtitle) ? subtitle.filter(Boolean) : [subtitle];
  }, [subtitle]);
  const typedSubtitle = useTypewriter(subtitleWords);

  if (showBack) {
    return (
      <div className="bg-linear-to-br from-primary-light via-bg to-white border-b border-border">
        <div className="container-app py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              aria-label="পেছনে যান"
              className="grid place-items-center h-8 w-8 rounded-full bg-white/70 hover:bg-white text-text-primary shadow-soft transition-colors shrink-0"
            >
              <ArrowLeft size={16} />
            </button>
            <h1 className="text-lg sm:text-xl">{title}</h1>
          </div>
          {crumbs.length > 0 && (
            <div className="mt-1.5 pl-11">
              <Breadcrumbs items={crumbs} />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-linear-to-br from-primary-light via-bg to-white border-b border-border">
      <div className="container-app py-2.5 sm:py-3 text-center relative">
        {centerBack && (
          <button
            onClick={() => navigate(-1)}
            aria-label="পেছনে যান"
            className="absolute left-4 top-2.5 sm:left-6 sm:top-3 grid place-items-center h-8 w-8 rounded-full bg-white/70 hover:bg-white text-text-primary shadow-soft transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
        )}
        <div className="px-12 sm:px-14">
          <h1 className="text-xl sm:text-2xl">{title}</h1>
          {subtitleWords.length > 0 && (
            <p className="mt-1 min-h-[1.25em] text-sm text-text-secondary max-w-full mx-auto whitespace-nowrap overflow-hidden text-ellipsis">
              {typedSubtitle}
              <span className="inline-block w-px h-3.5 -mb-0.5 bg-text-secondary animate-blink-caret" />
            </p>
          )}
          <div className="mt-1.5 flex justify-center">
            <Breadcrumbs items={crumbs} />
          </div>
        </div>
      </div>
    </div>
  );
}

import logoWhite from '@/assets/logo white.PNG';
import logoPink from '@/assets/logo.PNG';
import { useLanguage } from '@/context/LanguageContext';

export function Logo({
  variant = 'light',
  size = 32,
  tagline = false,
}: {
  variant?: 'light' | 'dark';
  size?: number;
  tagline?: boolean;
}) {
  const onDark = variant === 'light';
  const { t } = useLanguage();

  return (
    <span className="inline-flex items-center gap-1">
      <img
        src={onDark ? logoWhite : logoPink}
        alt="নিত্যঘর"
        style={{ height: size, width: size }}
        className="object-contain shrink-0"
      />
      <span className="flex flex-col leading-tight">
        <span className={`font-display text-3xl font-bold tracking-tight ${onDark ? 'text-white' : 'text-text-primary'}`}>
          নিত্যঘর
        </span>
        {tagline && (
          <span className={`text-[11px] font-medium ${onDark ? 'text-white/75' : 'text-text-secondary'}`}>
            {t('header.tagline')}
          </span>
        )}
      </span>
    </span>
  );
}

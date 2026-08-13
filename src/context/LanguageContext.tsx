import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { STORAGE_KEY } from '@/i18n';

type Language = 'bn' | 'en';
interface LanguageContextValue {
  language: Language;
  toggleLanguage: () => void;
  /** Looks up a translation key (e.g. `t('common.viewAll')`) in the active locale's
   * resource file, with an optional interpolation map (`t('key', { name: value })`).
   * Never pass raw Bangla/English text here — add it to `src/i18n/locales/*.json` instead. */
  t: (key: string, options?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { t, i18n } = useTranslation();
  const language = (i18n.resolvedLanguage as Language) || 'bn';

  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const toggleLanguage = () => i18n.changeLanguage(language === 'bn' ? 'en' : 'bn');

  const value = useMemo(() => ({ language, toggleLanguage, t }), [language, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}

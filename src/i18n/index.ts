import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import bn from './locales/bn.json';
import en from './locales/en.json';

export const STORAGE_KEY = 'shop-language-v1';

function getInitialLanguage(): 'bn' | 'en' {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'en' ? 'en' : 'bn';
}

i18n.use(initReactI18next).init({
  resources: { bn: { translation: bn }, en: { translation: en } },
  lng: getInitialLanguage(),
  fallbackLng: 'bn',
  interpolation: { escapeValue: false },
  returnEmptyString: false,
});

export default i18n;

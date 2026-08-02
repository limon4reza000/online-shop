import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export function FloatingContact() {
  const { t } = useLanguage();

  return (
    <Link
      to="/contact"
      aria-label={t('যোগাযোগ করুন')}
      className="fixed bottom-5 right-5 z-40 grid place-items-center h-14 w-14 rounded-full bg-primary text-white shadow-lift hover:bg-primary-hover hover:scale-105 transition-all"
    >
      <MessageCircle size={22} />
    </Link>
  );
}

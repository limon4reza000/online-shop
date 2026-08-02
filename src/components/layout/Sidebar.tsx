import { NavLink } from 'react-router-dom';
import {
  Home, ShoppingCart, Package, Bell, User, Sun, Moon, Languages, Users, MessageCircle,
} from 'lucide-react';
import { mainCategories } from '@/lib/data';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';

const itemClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
    isActive ? 'bg-primary text-white' : 'text-text-secondary hover:bg-primary-light hover:text-primary'
  }`;

export function Sidebar() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const { itemCount } = useCart();

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 border-r border-border bg-surface sticky top-22.75 h-[calc(100vh-91px)]">
      <nav className="flex-1 min-h-0 overflow-y-scroll sidebar-scroll p-4">
        <p className="px-3.5 mb-1.5 text-[11px] font-bold uppercase tracking-wide text-text-secondary">{t('শপ')}</p>
        <div className="flex flex-col gap-0.5 mb-5">
          <NavLink to="/" end className={itemClass}>
            <Home size={17} /> {t('হোম')}
          </NavLink>
          {mainCategories.map((c) => (
            <NavLink key={c.id} to={`/categories/${c.slug}`} className={itemClass}>
              <span className="text-base leading-none w-4.25 text-center shrink-0">{c.icon}</span> {t(c.name)}
            </NavLink>
          ))}
        </div>

        <p className="px-3.5 mb-1.5 text-[11px] font-bold uppercase tracking-wide text-text-secondary">{t('আমার অ্যাকাউন্ট')}</p>
        <div className="flex flex-col gap-0.5">
          <NavLink to="/cart" className={itemClass}>
            {({ isActive }) => (
              <>
                <ShoppingCart size={17} /> {t('কার্ট')}
                {itemCount > 0 && (
                  <span className={`ml-auto min-w-5 h-5 px-1 grid place-items-center rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white text-primary' : 'bg-primary text-white'
                  }`}>
                    {itemCount}
                  </span>
                )}
              </>
            )}
          </NavLink>
          <NavLink to="/orders" className={itemClass}>
            <Package size={17} /> {t('আমার অর্ডার')}
          </NavLink>
          <NavLink to="/community" className={itemClass}>
            <Users size={17} /> Community
          </NavLink>
          <NavLink to="/contact" className={itemClass}>
            <MessageCircle size={17} /> {t('চ্যাট')}
          </NavLink>
          <NavLink to="/notifications" className={itemClass}>
            <Bell size={17} /> {t('নোটিফিকেশন')}
          </NavLink>
          <NavLink to={user ? '/profile' : '/login'} className={itemClass}>
            <User size={17} /> {t(user ? 'প্রোফাইল' : 'লগইন')}
          </NavLink>
        </div>
      </nav>

      <div className="shrink-0 p-4 border-t border-border">
        <div className="flex items-center rounded-full bg-primary-light p-1">
          <button
            onClick={() => theme === 'dark' && toggleTheme()}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-full py-2 text-xs font-semibold transition-colors ${
              theme === 'light' ? 'bg-surface text-primary shadow-soft' : 'text-text-secondary'
            }`}
          >
            <Sun size={14} /> {t('লাইট')}
          </button>
          <button
            onClick={() => theme === 'light' && toggleTheme()}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-full py-2 text-xs font-semibold transition-colors ${
              theme === 'dark' ? 'bg-surface text-primary shadow-soft' : 'text-text-secondary'
            }`}
          >
            <Moon size={14} /> {t('ডার্ক')}
          </button>
        </div>

        <div className="mt-2 flex items-center rounded-full bg-primary-light p-1">
          <button
            onClick={() => language === 'en' && toggleLanguage()}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-full py-2 text-xs font-semibold transition-colors ${
              language === 'bn' ? 'bg-surface text-primary shadow-soft' : 'text-text-secondary'
            }`}
          >
            <Languages size={14} /> BN
          </button>
          <button
            onClick={() => language === 'bn' && toggleLanguage()}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-full py-2 text-xs font-semibold transition-colors ${
              language === 'en' ? 'bg-surface text-primary shadow-soft' : 'text-text-secondary'
            }`}
          >
            <Languages size={14} /> EN
          </button>
        </div>
      </div>
    </aside>
  );
}

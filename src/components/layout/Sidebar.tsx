import { NavLink } from 'react-router-dom';
import { Home, Sun, Moon } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCartShopping, faBox, faUsers, faCommentDots, faBell, faUser, faRightToBracket,
} from '@fortawesome/free-solid-svg-icons';
import { CategoryAccordionNav } from './CategoryAccordionNav';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';

const itemClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-base font-medium leading-normal transition-colors ${
    isActive ? 'bg-primary text-white' : 'text-text-secondary hover:bg-primary-light hover:text-primary'
  }`;

// Matches the sizing/spacing of the Font Awesome category icons above (text-base, fixed w-4.25 box).
const navIconClass = 'text-base w-4.25 text-center shrink-0';

export function Sidebar() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const { itemCount } = useCart();

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 border-r border-border bg-surface sticky top-22.75 h-[calc(100vh-91px)]">
      <nav className="flex-1 min-h-0 overflow-y-scroll sidebar-scroll p-4">
        <p className="px-3.5 mb-1.5 text-[11px] font-bold uppercase tracking-wide text-text-secondary">{t('sidebar.shopSection')}</p>
        <div className="flex flex-col gap-0.5 mb-5">
          <NavLink to="/" end className={itemClass}>
            <Home size={18} className="shrink-0" /> {t('nav.home')}
          </NavLink>
        </div>
        <div className="mb-5">
          <CategoryAccordionNav />
        </div>

        <p className="px-3.5 mb-1.5 text-[11px] font-bold uppercase tracking-wide text-text-secondary">{t('sidebar.accountSection')}</p>
        <div className="flex flex-col gap-0.5">
          <NavLink to="/cart" className={itemClass}>
            {({ isActive }) => (
              <>
                <FontAwesomeIcon icon={faCartShopping} className={navIconClass} /> {t('nav.cart')}
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
            <FontAwesomeIcon icon={faBox} className={navIconClass} /> {t('nav.myOrders')}
          </NavLink>
          <NavLink to="/community" className={itemClass}>
            <FontAwesomeIcon icon={faUsers} className={navIconClass} /> {t('sidebar.community')}
          </NavLink>
          <NavLink to="/chat" className={itemClass}>
            <FontAwesomeIcon icon={faCommentDots} className={navIconClass} /> {t('nav.chat')}
          </NavLink>
          <NavLink to="/notifications" className={itemClass}>
            <FontAwesomeIcon icon={faBell} className={navIconClass} /> {t('nav.notifications')}
          </NavLink>
          <NavLink to={user ? '/profile' : '/login'} className={itemClass}>
            <FontAwesomeIcon icon={user ? faUser : faRightToBracket} className={navIconClass} /> {t(user ? 'nav.profile' : 'nav.login')}
          </NavLink>
        </div>
      </nav>

      <div className="shrink-0 p-4 border-t border-border">
        <button
          onClick={toggleTheme}
          className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 border text-sm font-semibold transition-all duration-300 ${
            theme === 'dark' ? 'border-primary text-primary' : 'border-transparent text-primary hover:text-primary-hover'
          }`}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />} {t(theme === 'dark' ? 'header.lightMode' : 'header.darkMode')}
        </button>

        <div className="mt-2 flex items-center gap-1">
          <button
            onClick={() => language === 'bn' && toggleLanguage()}
            className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all duration-300 ${
              language === 'en' ? 'border border-primary text-primary' : 'border border-transparent text-text-secondary hover:text-primary'
            }`}
          >
            Eng
          </button>
          <button
            onClick={() => language === 'en' && toggleLanguage()}
            className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all duration-300 ${
              language === 'bn' ? 'border border-primary text-primary' : 'border border-transparent text-text-secondary hover:text-primary'
            }`}
          >
            বাং
          </button>
        </div>
      </div>
    </aside>
  );
}

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, Heart, Bell, Menu, X, Sun, Moon, ShoppingCart, Home, Store } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { CategoryAccordionNav } from './CategoryAccordionNav';

const navLinks = [
  { key: 'nav.home', to: '/', icon: Home },
  { key: 'nav.shop', to: '/shop', icon: Store },
];

const bottomLinks = [
  { key: 'nav.aboutUs', to: '/about' },
  { key: 'nav.contact', to: '/contact' },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [query, setQuery] = useState('');
  const { itemCount } = useCart();
  const { ids } = useWishlist();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const openMenu = () => {
    setMenuOpen(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setMenuVisible(true)));
  };
  const closeMenu = () => {
    setMenuVisible(false);
    setTimeout(() => setMenuOpen(false), 300);
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
      closeMenu();
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 bg-linear-to-r from-primary via-primary-hover to-primary transition-shadow duration-300 ${
        scrolled ? 'shadow-lift' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-4 py-0.5 px-3 sm:px-4">
        <Link to="/" className="shrink-0">
          <Logo size={80} tagline />
        </Link>

        <div className="flex items-center gap-1 sm:gap-1.5">
          <Link to="/cart" aria-label={t('nav.cart')} className="relative p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors">
            <ShoppingCart size={19} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4.5 min-w-4.5 px-1 grid place-items-center rounded-full bg-white text-primary text-[10px] font-bold">
                {itemCount}
              </span>
            )}
          </Link>

          <Link to="/notifications" aria-label={t('nav.notifications')} className="relative p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors">
            <Bell size={19} />
            <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-white" />
          </Link>

          <button onClick={openMenu} aria-label={t('header.openMenu')} className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors">
            <Menu size={20} />
          </button>
        </div>
      </div>

      {menuOpen && createPortal(
        <div className="fixed inset-0 z-[95]">
          <div
            className={`absolute inset-0 bg-text-primary/40 transition-opacity duration-300 ease-out ${menuVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={closeMenu}
          />
          <div
            className={`absolute right-0 top-0 h-full w-[86%] max-w-sm bg-white flex flex-col transition-transform duration-300 ease-out ${
              menuVisible ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="shrink-0 p-6 pb-0">
              <div className="flex items-center justify-between mb-6">
                <Logo variant="dark" size={60} />
                <button onClick={closeMenu} className="p-2 rounded-full hover:bg-primary-light"><X size={20} /></button>
              </div>

              <form onSubmit={submitSearch} className="relative mb-6">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('header.searchPlaceholder')}
                  className="input-field pl-10"
                />
              </form>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto sidebar-scroll p-6 pt-0">
              <nav className="flex flex-col gap-0">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/'}
                    onClick={() => closeMenu()}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-base font-medium text-text-primary hover:bg-primary-light hover:text-primary"
                  >
                    <link.icon size={17} className="shrink-0" /> {t(link.key)}
                  </NavLink>
                ))}
              </nav>

              <p className="mt-3 mb-2 text-xs font-bold uppercase text-text-secondary tracking-wide px-3">{t('nav.categories')}</p>
              <CategoryAccordionNav onNavigate={() => closeMenu()} />

              <p className="mt-6 mb-2 text-xs font-bold uppercase text-text-secondary tracking-wide px-3">{t('nav.more')}</p>
              <nav className="flex flex-col gap-1">
                {bottomLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => closeMenu()}
                    className="px-3 py-2.5 rounded-xl text-sm font-medium text-text-primary hover:bg-primary-light hover:text-primary"
                  >
                    {t(link.key)}
                  </NavLink>
                ))}
                <Link to="/wishlist" onClick={() => closeMenu()} className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-text-primary hover:bg-primary-light hover:text-primary">
                  <span className="flex items-center gap-2"><Heart size={16} /> {t('nav.wishlist')}</span>
                  {ids.length > 0 && <span className="text-xs font-bold text-primary">{ids.length}</span>}
                </Link>
              </nav>

              <button
                onClick={toggleTheme}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 border text-sm font-semibold mt-2 transition-all duration-300 ${
                  theme === 'dark' ? 'border-primary text-primary' : 'border-transparent text-primary hover:text-primary-hover'
                }`}
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />} {t(theme === 'dark' ? 'header.lightMode' : 'header.darkMode')}
              </button>
            </div>

            <div className="shrink-0 p-6 pt-4 border-t border-border flex flex-col gap-2">
              {user ? (
                <>
                  {user.role === 'admin' && (
                    <Link to="/admin" onClick={() => closeMenu()} className="btn-outline btn-sm">{t('header.adminPanel')}</Link>
                  )}
                  <Link to="/dashboard" onClick={() => closeMenu()} className="btn-outline btn-sm">{t('header.dashboard')}</Link>
                  <button onClick={() => { logout(); closeMenu(); }} className="btn-ghost btn-sm">{t('header.signOut')}</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => closeMenu()} className="btn-primary btn-sm">{t('nav.login')}</Link>
                  <Link to="/register" onClick={() => closeMenu()} className="btn-outline btn-sm">{t('header.register')}</Link>
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, Heart, Bell, Menu, X, Sun, Moon, ShoppingCart } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { mainCategories } from '@/lib/data';

const navLinks = [
  { label: 'হোম', to: '/' },
  { label: 'শপ', to: '/shop' },
  { label: 'ক্যাটাগরি', to: '/categories' },
  { label: 'আমাদের সম্পর্কে', to: '/about' },
  { label: 'যোগাযোগ', to: '/contact' },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
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

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setMenuOpen(false);
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
          <Link to="/cart" aria-label={t('কার্ট')} className="relative p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors">
            <ShoppingCart size={19} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4.5 min-w-4.5 px-1 grid place-items-center rounded-full bg-white text-primary text-[10px] font-bold">
                {itemCount}
              </span>
            )}
          </Link>

          <Link to="/notifications" aria-label={t('নোটিফিকেশন')} className="relative p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors">
            <Bell size={19} />
            <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-white" />
          </Link>

          <button onClick={() => setMenuOpen(true)} aria-label={t('মেনু খুলুন')} className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors">
            <Menu size={20} />
          </button>
        </div>
      </div>

      {menuOpen && createPortal(
        <div className="fixed inset-0 z-[95]">
          <div className="absolute inset-0 bg-text-primary/40" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-[86%] max-w-sm bg-white p-6 animate-fade-in overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <Logo variant="dark" size={60} />
              <button onClick={() => setMenuOpen(false)} className="p-2 rounded-full hover:bg-primary-light"><X size={20} /></button>
            </div>

            <form onSubmit={submitSearch} className="relative mb-6">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('পণ্য খুঁজুন...')}
                className="input-field pl-10"
              />
            </form>

            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) => `px-3 py-2.5 rounded-xl text-sm font-medium ${isActive ? 'bg-primary-light text-primary' : 'text-text-primary'}`}
                >
                  {t(link.label)}
                </NavLink>
              ))}
              <Link to="/wishlist" onClick={() => setMenuOpen(false)} className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-text-primary hover:bg-primary-light hover:text-primary">
                <span className="flex items-center gap-2"><Heart size={16} /> {t('উইশলিস্ট')}</span>
                {ids.length > 0 && <span className="text-xs font-bold text-primary">{ids.length}</span>}
              </Link>
            </nav>

            <p className="mt-6 mb-2 text-xs font-bold uppercase text-text-secondary tracking-wide px-3">{t('ক্যাটাগরি')}</p>
            <div className="flex flex-col gap-1">
              {mainCategories.map((c) => (
                <Link key={c.id} to={`/categories/${c.slug}`} onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-text-primary hover:bg-primary-light">
                  <span className="text-base leading-none">{c.icon}</span> {t(c.name)}
                </Link>
              ))}
            </div>

            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 w-full mt-6 px-3 py-2.5 rounded-xl text-sm font-medium text-text-primary hover:bg-primary-light"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />} {t(theme === 'dark' ? 'লাইট মোড' : 'ডার্ক মোড')}
            </button>

            <div className="mt-4 flex flex-col gap-2 px-3">
              {user ? (
                <>
                  {user.role === 'admin' && (
                    <Link to="/admin" onClick={() => setMenuOpen(false)} className="btn-outline btn-sm">{t('অ্যাডমিন প্যানেল')}</Link>
                  )}
                  <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="btn-outline btn-sm">{t('ড্যাশবোর্ড')}</Link>
                  <button onClick={() => { logout(); setMenuOpen(false); }} className="btn-ghost btn-sm">{t('সাইন আউট')}</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-primary btn-sm">{t('লগইন')}</Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-outline btn-sm">{t('রেজিস্টার')}</Link>
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

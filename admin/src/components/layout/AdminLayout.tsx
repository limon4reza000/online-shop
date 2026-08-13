import { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import {
  LayoutDashboard, Package, FolderTree, Tag, ShoppingCart, Users, Ticket,
  Image, Star, FileBarChart, UserCog, Settings, Menu, X, LogOut, Bell, Search, Megaphone, MessageCircle, Sun, Moon,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Logo } from '@/components/ui/Logo';
import { useAnalyticsRealtimeSync } from '@/hooks/useAnalytics';

const links = [
  { to: '/', label: 'অ্যানালিটিক্স', icon: LayoutDashboard, end: true },
  { to: '/products', label: 'পণ্য', icon: Package },
  { to: '/categories', label: 'ক্যাটাগরি', icon: FolderTree },
  { to: '/brands', label: 'ব্র্যান্ড', icon: Tag },
  { to: '/orders', label: 'অর্ডার', icon: ShoppingCart },
  { to: '/customers', label: 'গ্রাহক', icon: Users },
  { to: '/coupons', label: 'কুপন', icon: Ticket },
  { to: '/banners', label: 'ব্যানার', icon: Image },
  { to: '/search-placeholders', label: 'সার্চ প্লেসহোল্ডার', icon: Search },
  { to: '/popup', label: 'প্রোমো পপআপ', icon: Megaphone },
  { to: '/chat', label: 'কাস্টমার চ্যাট', icon: MessageCircle },
  { to: '/reviews', label: 'রিভিউ', icon: Star },
  { to: '/reports', label: 'বিক্রয় প্রতিবেদন', icon: FileBarChart },
  { to: '/users', label: 'অ্যাডমিন ইউজার', icon: UserCog },
  { to: '/settings', label: 'সেটিংস', icon: Settings },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  useAnalyticsRealtimeSync();

  const Nav = (
    <nav className="flex flex-col gap-1 p-4">
      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          end={l.end}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              isActive ? 'bg-primary text-white' : 'text-text-secondary hover:bg-primary-light hover:text-primary'
            }`
          }
        >
          <l.icon size={17} /> {l.label}
        </NavLink>
      ))}
      <button onClick={logout} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-error hover:bg-error/10 mt-4">
        <LogOut size={17} /> সাইন আউট
      </button>
    </nav>
  );

  return (
    <div className="h-screen flex bg-bg overflow-hidden">
      <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 border-r border-border bg-surface h-full overflow-y-auto sidebar-scroll">
        <Link to="/" className="flex items-center gap-2 px-6 py-6 border-b border-border shrink-0">
          <Logo variant="dark" size={56} />
          <span className="text-xs font-normal text-text-secondary">অ্যাডমিন</span>
        </Link>
        {Nav}
      </aside>

      {open && (
        <div className="fixed inset-0 z-[95] lg:hidden">
          <div className="absolute inset-0 bg-text-primary/40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-surface overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between px-6 py-6 border-b border-border">
              <Logo variant="dark" size={56} />
              <button onClick={() => setOpen(false)} className="p-2 rounded-full hover:bg-primary-light"><X size={18} /></button>
            </div>
            {Nav}
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col h-full">
        <header className="shrink-0 z-40 bg-surface/90 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between px-4 sm:px-8 py-4">
            <button onClick={() => setOpen(true)} className="lg:hidden p-2 -ml-2 rounded-full hover:bg-primary-light"><Menu size={20} /></button>
            <h1 className="text-lg font-bold hidden sm:block">অ্যাডমিন প্যানেল</h1>
            <div className="flex items-center gap-3 ml-auto">
              <button
                onClick={toggleTheme}
                aria-label="থিম পরিবর্তন করুন"
                className="p-2 rounded-full hover:bg-primary-light text-text-secondary hover:text-primary transition-colors"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button className="relative p-2 rounded-full hover:bg-primary-light text-text-secondary hover:text-primary">
                <Bell size={18} />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
              </button>
              <div className="flex items-center gap-2.5 pl-3 border-l border-border">
                <span className="grid place-items-center h-9 w-9 rounded-full bg-primary text-white font-bold text-sm">{user?.name?.[0]?.toUpperCase() || 'A'}</span>
                <div className="hidden sm:block leading-tight">
                  <p className="text-sm font-semibold">{user?.name}</p>
                  <p className="text-xs text-text-secondary">অ্যাডমিনিস্ট্রেটর</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

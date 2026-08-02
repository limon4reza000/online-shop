import { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import {
  LayoutDashboard, Package, FolderTree, Tag, ShoppingCart, Users, Ticket,
  Image, Star, FileBarChart, UserCog, Settings, Menu, X, LogOut, Bell, Search,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Logo } from '@/components/ui/Logo';

const links = [
  { to: '/admin', label: 'অ্যানালিটিক্স', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'পণ্য', icon: Package },
  { to: '/admin/categories', label: 'ক্যাটাগরি', icon: FolderTree },
  { to: '/admin/brands', label: 'ব্র্যান্ড', icon: Tag },
  { to: '/admin/orders', label: 'অর্ডার', icon: ShoppingCart },
  { to: '/admin/customers', label: 'গ্রাহক', icon: Users },
  { to: '/admin/coupons', label: 'কুপন', icon: Ticket },
  { to: '/admin/banners', label: 'ব্যানার', icon: Image },
  { to: '/admin/search-placeholders', label: 'সার্চ প্লেসহোল্ডার', icon: Search },
  { to: '/admin/reviews', label: 'রিভিউ', icon: Star },
  { to: '/admin/reports', label: 'বিক্রয় প্রতিবেদন', icon: FileBarChart },
  { to: '/admin/users', label: 'অ্যাডমিন ইউজার', icon: UserCog },
  { to: '/admin/settings', label: 'সেটিংস', icon: Settings },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

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
    <div className="min-h-screen flex bg-bg">
      <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 border-r border-border bg-surface">
        <Link to="/admin" className="flex items-center gap-2 px-6 py-6 border-b border-border">
          <Logo variant="dark" />
          <span className="text-xs font-normal text-text-secondary">অ্যাডমিন</span>
        </Link>
        {Nav}
      </aside>

      {open && (
        <div className="fixed inset-0 z-[95] lg:hidden">
          <div className="absolute inset-0 bg-text-primary/40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-surface overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between px-6 py-6 border-b border-border">
              <Logo variant="dark" />
              <button onClick={() => setOpen(false)} className="p-2 rounded-full hover:bg-primary-light"><X size={18} /></button>
            </div>
            {Nav}
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between px-4 sm:px-8 py-4">
            <button onClick={() => setOpen(true)} className="lg:hidden p-2 -ml-2 rounded-full hover:bg-primary-light"><Menu size={20} /></button>
            <h1 className="text-lg font-bold hidden sm:block">অ্যাডমিন প্যানেল</h1>
            <div className="flex items-center gap-3 ml-auto">
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
        <main className="flex-1 p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

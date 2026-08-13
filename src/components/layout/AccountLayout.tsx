import { NavLink, Navigate, Outlet } from 'react-router-dom';
import { LayoutDashboard, Package, User, LogOut, Heart, MapPin, Bell, Star, MessageCircle } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAuth } from '@/context/AuthContext';

const links = [
  { to: '/dashboard', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
  { to: '/profile', label: 'প্রোফাইল', icon: User },
  { to: '/addresses', label: 'ঠিকানা', icon: MapPin },
  { to: '/orders', label: 'আমার অর্ডার', icon: Package },
  { to: '/wishlist', label: 'উইশলিস্ট', icon: Heart },
  { to: '/reviews', label: 'রিভিউ', icon: Star },
  { to: '/notifications', label: 'নোটিফিকেশন', icon: Bell },
  { to: '/chat', label: 'চ্যাট', icon: MessageCircle },
];

export function AccountLayout() {
  const { user, logout } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  return (
    <>
      <PageHeader title={`হ্যালো, ${user.name.split(' ')[0]}`} subtitle="আপনার অ্যাকাউন্ট, অর্ডার এবং পছন্দসমূহ পরিচালনা করুন।" crumbs={[{ label: 'অ্যাকাউন্ট' }]} />
      <div className="container-app section-y">
        <div className="grid lg:grid-cols-[240px_1fr] gap-8 items-start">
          <aside className="card-surface p-3">
            <nav className="flex lg:flex-col gap-1 overflow-x-auto no-scrollbar">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                      isActive ? 'bg-primary text-white' : 'text-text-primary hover:bg-primary-light hover:text-primary'
                    }`
                  }
                >
                  <l.icon size={16} /> {l.label}
                </NavLink>
              ))}
              <button onClick={logout} className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-error hover:bg-error/10 whitespace-nowrap">
                <LogOut size={16} /> সাইন আউট
              </button>
            </nav>
          </aside>
          <div>
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}

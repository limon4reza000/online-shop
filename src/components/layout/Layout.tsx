import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Sidebar } from './Sidebar';
import { SearchBar } from './SearchBar';
import { FloatingContact } from '@/components/ui/FloatingContact';

const FOCUSED_FLOW_PATHS = ['/cart', '/orders', '/notifications', '/community', '/contact', '/checkout'];

export function Layout() {
  const { pathname } = useLocation();
  const isFocusedFlow = FOCUSED_FLOW_PATHS.includes(pathname);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 min-w-0 flex flex-col">
          {!isFocusedFlow && <SearchBar />}
          <main className="flex-1">
            <Outlet />
          </main>
          {!isFocusedFlow && <Footer />}
        </div>
      </div>
      <FloatingContact />
    </div>
  );
}

import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Sidebar } from './Sidebar';
import { SearchBar } from './SearchBar';
import { FloatingContact } from '@/components/ui/FloatingContact';

const FOCUSED_FLOW_PATHS = ['/cart', '/orders', '/notifications', '/community', '/contact', '/checkout'];
const HIDE_SEARCHBAR_PATHS = [...FOCUSED_FLOW_PATHS, '/shop', '/search'];
// Quick-link destination pages — take over the full screen like product detail pages,
// navigating back via their own compact PageHeader instead of the site nav/sidebar.
const FULL_TAKEOVER_PATHS = ['/about', '/faq', '/wishlist', '/order-tracking', '/chat'];

export function Layout() {
  const { pathname } = useLocation();
  const isProductDetail = pathname.startsWith('/product/');
  // Category/subcategory pages have their own back button + breadcrumb (via PageHeader),
  // so the persistent sidebar and search bar would just be redundant chrome here.
  const isCategoryDetail = pathname.startsWith('/categories/');
  const isFullTakeover = isProductDetail || FULL_TAKEOVER_PATHS.includes(pathname);
  const hideSearchBar = HIDE_SEARCHBAR_PATHS.includes(pathname) || isProductDetail || isCategoryDetail;
  const hideSidebar = isCategoryDetail;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);

  // These pages take over the full screen — no site nav/sidebar/footer,
  // just the page's own compact top bar (back button, etc.) in their place.
  if (isFullTakeover) {
    return (
      <div className="min-h-screen flex flex-col bg-bg">
        <main className="flex-1">
          <Outlet />
        </main>
        {/* The chat page has its own send button in the same corner — the bubble would just cover it. */}
        {pathname !== '/chat' && <FloatingContact />}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <Header />
      <div className="flex flex-1">
        {!hideSidebar && <Sidebar />}
        <div className="flex-1 min-w-0 flex flex-col">
          {!hideSearchBar && <SearchBar />}
          <main className="flex-1">
            <Outlet />
          </main>
          {pathname === '/' && <Footer />}
        </div>
      </div>
      <FloatingContact />
    </div>
  );
}

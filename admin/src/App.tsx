import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { ToastProvider } from '@/context/ToastContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { PageLoader } from '@/components/ui/PageLoader';
import AdminLogin from '@/pages/AdminLogin';

const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const AdminProducts = lazy(() => import('@/pages/AdminProducts'));
const AdminCategories = lazy(() => import('@/pages/AdminCategories'));
const AdminBrands = lazy(() => import('@/pages/AdminBrands'));
const AdminOrders = lazy(() => import('@/pages/AdminOrders'));
const AdminCustomers = lazy(() => import('@/pages/AdminCustomers'));
const AdminCoupons = lazy(() => import('@/pages/AdminCoupons'));
const AdminBanners = lazy(() => import('@/pages/AdminBanners'));
const AdminSearchPlaceholders = lazy(() => import('@/pages/AdminSearchPlaceholders'));
const AdminReviews = lazy(() => import('@/pages/AdminReviews'));
const AdminUsers = lazy(() => import('@/pages/AdminUsers'));
const AdminSettings = lazy(() => import('@/pages/AdminSettings'));
const AdminPromoPopup = lazy(() => import('@/pages/AdminPromoPopup'));
const AdminChat = lazy(() => import('@/pages/AdminChat'));
const AdminReports = lazy(() => import('@/pages/AdminReports'));

const queryClient = new QueryClient();

/** Gate the entire admin shell behind a valid staff session — customers (or
 * anyone without a token) never see anything past the login screen. */
function RequireAdmin() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function RedirectIfAuthed() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  if (user) return <Navigate to="/" replace />;
  return <AdminLogin />;
}

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <LanguageProvider>
            <ToastProvider>
              <AuthProvider>
                <BrowserRouter>
                  <Routes>
                    <Route path="/login" element={<RedirectIfAuthed />} />

                    <Route element={<RequireAdmin />}>
                      <Route element={<AdminLayout />}>
                        <Route index element={<Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense>} />
                        <Route path="products" element={<Suspense fallback={<PageLoader />}><AdminProducts /></Suspense>} />
                        <Route path="categories" element={<Suspense fallback={<PageLoader />}><AdminCategories /></Suspense>} />
                        <Route path="brands" element={<Suspense fallback={<PageLoader />}><AdminBrands /></Suspense>} />
                        <Route path="orders" element={<Suspense fallback={<PageLoader />}><AdminOrders /></Suspense>} />
                        <Route path="customers" element={<Suspense fallback={<PageLoader />}><AdminCustomers /></Suspense>} />
                        <Route path="coupons" element={<Suspense fallback={<PageLoader />}><AdminCoupons /></Suspense>} />
                        <Route path="banners" element={<Suspense fallback={<PageLoader />}><AdminBanners /></Suspense>} />
                        <Route path="search-placeholders" element={<Suspense fallback={<PageLoader />}><AdminSearchPlaceholders /></Suspense>} />
                        <Route path="reviews" element={<Suspense fallback={<PageLoader />}><AdminReviews /></Suspense>} />
                        <Route path="reports" element={<Suspense fallback={<PageLoader />}><AdminReports /></Suspense>} />
                        <Route path="users" element={<Suspense fallback={<PageLoader />}><AdminUsers /></Suspense>} />
                        <Route path="settings" element={<Suspense fallback={<PageLoader />}><AdminSettings /></Suspense>} />
                        <Route path="popup" element={<Suspense fallback={<PageLoader />}><AdminPromoPopup /></Suspense>} />
                        <Route path="chat" element={<Suspense fallback={<PageLoader />}><AdminChat /></Suspense>} />
                      </Route>
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </BrowserRouter>
              </AuthProvider>
            </ToastProvider>
          </LanguageProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;

import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { ToastProvider } from '@/context/ToastContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { Layout } from '@/components/layout/Layout';
import { AccountLayout } from '@/components/layout/AccountLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { PageLoader } from '@/components/ui/PageLoader';

import Home from '@/pages/Home';
import Shop from '@/pages/Shop';
import Categories from '@/pages/Categories';
import CategoryDetail from '@/pages/CategoryDetail';
import ProductDetails from '@/pages/ProductDetails';
import SearchResults from '@/pages/SearchResults';
import Wishlist from '@/pages/Wishlist';
import Community from '@/pages/Community';
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout';
import OrderSuccess from '@/pages/OrderSuccess';
import OrderTracking from '@/pages/OrderTracking';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import EmailVerification from '@/pages/EmailVerification';
import OTPVerification from '@/pages/OTPVerification';
import Dashboard from '@/pages/Dashboard';
import MyOrders from '@/pages/MyOrders';
import MyReviews from '@/pages/MyReviews';
import Addresses from '@/pages/Addresses';
import Notifications from '@/pages/Notifications';
import Profile from '@/pages/Profile';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import FAQ from '@/pages/FAQ';
import Privacy from '@/pages/Privacy';
import Terms from '@/pages/Terms';
import NotFound from '@/pages/NotFound';
import ServerError from '@/pages/ServerError';

// Admin section is code-split into its own chunk — it's a large,
// rarely-visited surface (Recharts + data tables) that regular
// shoppers should never have to download.
const AdminLayout = lazy(() => import('@/components/layout/AdminLayout').then((m) => ({ default: m.AdminLayout })));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('@/pages/admin/AdminProducts'));
const AdminCategories = lazy(() => import('@/pages/admin/AdminCategories'));
const AdminBrands = lazy(() => import('@/pages/admin/AdminBrands'));
const AdminOrders = lazy(() => import('@/pages/admin/AdminOrders'));
const AdminCustomers = lazy(() => import('@/pages/admin/AdminCustomers'));
const AdminCoupons = lazy(() => import('@/pages/admin/AdminCoupons'));
const AdminBanners = lazy(() => import('@/pages/admin/AdminBanners'));
const AdminSearchPlaceholders = lazy(() => import('@/pages/admin/AdminSearchPlaceholders'));
const AdminReviews = lazy(() => import('@/pages/admin/AdminReviews'));
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'));
const AdminSettings = lazy(() => import('@/pages/admin/AdminSettings'));
const AdminReports = lazy(() => import('@/pages/admin/AdminReports'));

const queryClient = new QueryClient();

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <LanguageProvider>
          <ToastProvider>
            <AuthProvider>
              <WishlistProvider>
                <CartProvider>
                  <BrowserRouter>
                    <Routes>
                      <Route element={<Layout />}>
                        <Route index element={<Home />} />
                        <Route path="shop" element={<Shop />} />
                        <Route path="search" element={<SearchResults />} />
                        <Route path="categories" element={<Categories />} />
                        <Route path="categories/:slug" element={<CategoryDetail />} />
                        <Route path="product/:slug" element={<ProductDetails />} />
                        <Route path="wishlist" element={<Wishlist />} />
                        <Route path="community" element={<Community />} />
                        <Route path="orders" element={<MyOrders />} />
                        <Route path="notifications" element={<Notifications />} />
                        <Route path="cart" element={<Cart />} />
                        <Route path="checkout" element={<Checkout />} />
                        <Route path="order-success" element={<OrderSuccess />} />
                        <Route path="order-tracking" element={<OrderTracking />} />
                        <Route path="login" element={<Login />} />
                        <Route path="register" element={<Register />} />
                        <Route path="forgot-password" element={<ForgotPassword />} />
                        <Route path="verify-email" element={<EmailVerification />} />
                        <Route path="verify-otp" element={<OTPVerification />} />

                        <Route element={<ProtectedRoute />}>
                          <Route element={<AccountLayout />}>
                            <Route path="dashboard" element={<Dashboard />} />
                            <Route path="reviews" element={<MyReviews />} />
                            <Route path="addresses" element={<Addresses />} />
                            <Route path="profile" element={<Profile />} />
                          </Route>
                        </Route>

                        <Route path="about" element={<About />} />
                        <Route path="contact" element={<Contact />} />
                        <Route path="faq" element={<FAQ />} />
                        <Route path="privacy" element={<Privacy />} />
                        <Route path="terms" element={<Terms />} />
                        <Route path="500" element={<ServerError />} />
                        <Route path="*" element={<NotFound />} />
                      </Route>

                      <Route element={<ProtectedRoute role="admin" />}>
                        <Route
                          path="admin"
                          element={
                            <Suspense fallback={<PageLoader />}>
                              <AdminLayout />
                            </Suspense>
                          }
                        >
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
                        </Route>
                      </Route>
                    </Routes>
                  </BrowserRouter>
                </CartProvider>
              </WishlistProvider>
            </AuthProvider>
          </ToastProvider>
          </LanguageProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;

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
import { useContentSync } from '@/hooks/useContentSync';

import Home from '@/pages/Home';
import Shop from '@/pages/Shop';
import Categories from '@/pages/Categories';
import CategoryDetail from '@/pages/CategoryDetail';
import BrandDetail from '@/pages/BrandDetail';
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
import ResetPassword from '@/pages/ResetPassword';
import AuthCallback from '@/pages/AuthCallback';
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
import Chat from '@/pages/Chat';
import FAQ from '@/pages/FAQ';
import Privacy from '@/pages/Privacy';
import Terms from '@/pages/Terms';
import NotFound from '@/pages/NotFound';
import ServerError from '@/pages/ServerError';

const queryClient = new QueryClient();

/** Keeps the storefront's react-query cache live-synced with admin edits — see useContentSync. */
function RealtimeSync() {
  useContentSync();
  return null;
}

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <LanguageProvider>
          <ToastProvider>
            <AuthProvider>
              <RealtimeSync />
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
                        <Route path="brand/:slug" element={<BrandDetail />} />
                        <Route path="product/:slug" element={<ProductDetails />} />
                        <Route path="wishlist" element={<Wishlist />} />
                        <Route path="community" element={<Community />} />
                        <Route path="orders" element={<MyOrders />} />
                        <Route path="notifications" element={<Notifications />} />
                        <Route path="cart" element={<Cart />} />
                        <Route element={<ProtectedRoute />}>
                          <Route path="checkout" element={<Checkout />} />
                          <Route path="order-success" element={<OrderSuccess />} />
                        </Route>
                        <Route path="order-tracking" element={<OrderTracking />} />
                        <Route path="login" element={<Login />} />
                        <Route path="register" element={<Register />} />
                        <Route path="forgot-password" element={<ForgotPassword />} />
                        <Route path="reset-password" element={<ResetPassword />} />
                        <Route path="auth/callback" element={<AuthCallback />} />
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
                        <Route path="chat" element={<Chat />} />
                        <Route path="faq" element={<FAQ />} />
                        <Route path="privacy" element={<Privacy />} />
                        <Route path="terms" element={<Terms />} />
                        <Route path="500" element={<ServerError />} />
                        <Route path="*" element={<NotFound />} />
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

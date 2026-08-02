import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useToast } from './ToastContext';

export type Role = 'customer' | 'admin';

interface User {
  name: string;
  email: string;
  role: Role;
  emailVerified: boolean;
  avatar?: string;
}

interface AuthContextValue {
  user: User | null;
  pendingEmail: string | null;
  login: (email: string) => void;
  loginAsAdmin: () => void;
  register: (name: string, email: string) => void;
  loginWithProvider: (provider: 'google' | 'facebook') => void;
  verifyOtp: (code: string) => boolean;
  resendOtp: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = 'shop-user-v1';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  const login = (email: string) => {
    const role: Role = email.toLowerCase().includes('admin') ? 'admin' : 'customer';
    setUser({ name: email.split('@')[0].replace(/[._]/g, ' '), email, role, emailVerified: true });
    showToast('আবার স্বাগতম!', 'success');
  };

  const loginAsAdmin = () => {
    setUser({ name: 'Admin', email: 'admin@nityaghor.com', role: 'admin', emailVerified: true });
    showToast('অ্যাডমিন হিসেবে সাইন ইন করা হয়েছে (ডেমো)', 'success');
  };

  const register = (name: string, email: string) => {
    setUser({ name, email, role: 'customer', emailVerified: false });
    setPendingEmail(email);
    showToast('অ্যাকাউন্ট তৈরি হয়েছে — চালিয়ে যেতে আপনার ইমেইল যাচাই করুন', 'info');
  };

  const loginWithProvider = (provider: 'google' | 'facebook') => {
    setUser({ name: `${provider === 'google' ? 'Google' : 'Facebook'} User`, email: `demo@${provider}.com`, role: 'customer', emailVerified: true });
    showToast(`${provider === 'google' ? 'গুগল' : 'ফেসবুক'} দিয়ে সাইন ইন করা হয়েছে (ডেমো)`, 'success');
  };

  const verifyOtp = (code: string) => {
    if (code.length === 6) {
      setUser((u) => (u ? { ...u, emailVerified: true } : u));
      setPendingEmail(null);
      showToast('ইমেইল সফলভাবে যাচাই করা হয়েছে', 'success');
      return true;
    }
    showToast('ভুল যাচাইকরণ কোড', 'error');
    return false;
  };

  const resendOtp = () => showToast('যাচাইকরণ কোড আবার পাঠানো হয়েছে', 'info');

  const logout = () => {
    setUser(null);
    showToast('সাইন আউট করা হয়েছে', 'info');
  };

  return (
    <AuthContext.Provider value={{ user, pendingEmail, login, loginAsAdmin, register, loginWithProvider, verifyOtp, resendOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

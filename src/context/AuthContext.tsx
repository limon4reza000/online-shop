import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useToast } from './ToastContext';
import { api, getAccessToken, setAccessToken, AUTH_LOGOUT_EVENT } from '@/lib/api';

export type Role = 'customer' | 'admin';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  emailVerified: boolean;
  avatar?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: Gender;
}

interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
  avatarUrl: string | null;
  phone?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
}

function toUser(u: ApiUser): User {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role === 'CUSTOMER' ? 'customer' : 'admin',
    emailVerified: u.emailVerified,
    avatar: u.avatarUrl ?? undefined,
    phone: u.phone ?? undefined,
    dateOfBirth: u.dateOfBirth ?? undefined,
    gender: (u.gender as Gender) ?? undefined,
  };
}

export interface ProfileUpdateInput {
  name?: string;
  phone?: string | null;
  dateOfBirth?: string | null;
  gender?: Gender | null;
  avatarUrl?: string | null;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  pendingEmail: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithProvider: (provider: 'google' | 'facebook') => void;
  verifyOtp: (code: string) => Promise<boolean>;
  resendOtp: () => Promise<void>;
  logout: () => Promise<void>;
  applySessionToken: (accessToken: string) => Promise<void>;
  updateProfile: (input: ProfileUpdateInput) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const { showToast } = useToast();

  // Restore the session from a stored access token on first load, and re-validate
  // against the server (rather than trusting stale localStorage user data).
  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    api.get('/auth/me')
      .then((res) => setUser(toUser(res.data.data)))
      .catch(() => setAccessToken(null))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const onSessionExpired = () => {
      setUser(null);
      showToast('আপনার সেশনের মেয়াদ শেষ হয়ে গেছে — আবার সাইন ইন করুন', 'info');
    };
    window.addEventListener(AUTH_LOGOUT_EVENT, onSessionExpired);
    return () => window.removeEventListener(AUTH_LOGOUT_EVENT, onSessionExpired);
  }, [showToast]);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { user: apiUser, accessToken } = res.data.data;
    setAccessToken(accessToken);
    setUser(toUser(apiUser));
    showToast('আবার স্বাগতম!', 'success');
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await api.post('/auth/register', { name, email, password });
    const { user: apiUser, accessToken } = res.data.data;
    setAccessToken(accessToken);
    setUser(toUser(apiUser));
    setPendingEmail(email);
    showToast('অ্যাকাউন্ট তৈরি হয়েছে — চালিয়ে যেতে আপনার ইমেইল যাচাই করুন', 'info');
  };

  const loginWithProvider = (provider: 'google' | 'facebook') => {
    window.location.href = `${API_BASE}/auth/${provider}`;
  };

  const verifyOtp = async (code: string) => {
    if (!user?.email) return false;
    try {
      const res = await api.post('/auth/verify-otp', { email: user.email, code });
      const { user: apiUser, accessToken } = res.data.data;
      setAccessToken(accessToken);
      setUser(toUser(apiUser));
      setPendingEmail(null);
      showToast('ইমেইল সফলভাবে যাচাই করা হয়েছে', 'success');
      return true;
    } catch {
      showToast('ভুল অথবা মেয়াদোত্তীর্ণ যাচাইকরণ কোড', 'error');
      return false;
    }
  };

  const resendOtp = async () => {
    if (!user?.email) return;
    try {
      await api.post('/auth/resend-otp', { email: user.email });
      showToast('যাচাইকরণ কোড আবার পাঠানো হয়েছে', 'info');
    } catch {
      showToast('কোড পাঠানো যায়নি, আবার চেষ্টা করুন', 'error');
    }
  };

  const applySessionToken = async (accessToken: string) => {
    setAccessToken(accessToken);
    const res = await api.get('/auth/me');
    setUser(toUser(res.data.data));
  };

  const updateProfile = async (input: ProfileUpdateInput) => {
    const res = await api.patch('/auth/me', input);
    setUser(toUser(res.data.data));
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    await api.post('/auth/change-password', { currentPassword, newPassword });
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Clear the local session regardless of whether the server call succeeded.
    }
    setAccessToken(null);
    setUser(null);
    showToast('সাইন আউট করা হয়েছে', 'info');
  };

  return (
    <AuthContext.Provider
      value={{
        user, isLoading, pendingEmail, login, register, loginWithProvider, verifyOtp, resendOtp,
        logout, applySessionToken, updateProfile, changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

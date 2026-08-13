import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useToast } from './ToastContext';
import { api, getAccessToken, setAccessToken, AUTH_LOGOUT_EVENT } from '@/lib/api';

export type Role = 'customer' | 'admin';

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
}

function toUser(u: ApiUser): User {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role === 'CUSTOMER' ? 'customer' : 'admin',
    avatar: u.avatarUrl ?? undefined,
  };
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginAsAdmin: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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

  // Rejects (and immediately signs back out) any account that isn't staff —
  // customers must never be able to reach the admin panel.
  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { user: apiUser, accessToken } = res.data.data;
    const mapped = toUser(apiUser);
    if (mapped.role !== 'admin') {
      setAccessToken(null);
      throw new Error('NOT_ADMIN');
    }
    setAccessToken(accessToken);
    setUser(mapped);
    showToast('আবার স্বাগতম!', 'success');
  };

  const loginAsAdmin = async () => {
    try {
      await login('admin@nityaghor.com', 'Admin123!');
    } catch {
      showToast('অ্যাডমিন লগইন ব্যর্থ হয়েছে — সার্ভার চালু আছে কিনা যাচাই করুন', 'error');
    }
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
    <AuthContext.Provider value={{ user, isLoading, login, loginAsAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

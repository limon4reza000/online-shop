import axios from 'axios';

/** Axios instance wired to the real backend (Express + Prisma + MySQL). */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  withCredentials: true, // sends the httpOnly refreshToken cookie automatically
});

const TOKEN_KEY = 'shop-token';

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

/** Fired when the refresh token itself is invalid/expired — AuthContext listens to fully sign the user out. */
export const AUTH_LOGOUT_EVENT = 'auth:session-expired';

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Silent-refresh queue: if several requests 401 at once, only one /auth/refresh
// call is made and every queued request retries once it resolves.
let isRefreshing = false;
let refreshQueue: ((token: string | null) => void)[] = [];

function resolveQueue(token: string | null) {
  refreshQueue.forEach((resolve) => resolve(token));
  refreshQueue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { config, response } = error;
    if (response?.status !== 401 || config?._retried || config?.url?.includes('/auth/refresh') || config?.url?.includes('/auth/login')) {
      return Promise.reject(error);
    }

    if (!getAccessToken()) return Promise.reject(error);

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push((token) => {
          if (!token) return reject(error);
          config._retried = true;
          config.headers.Authorization = `Bearer ${token}`;
          resolve(api(config));
        });
      });
    }

    isRefreshing = true;
    try {
      const res = await api.post('/auth/refresh');
      const newToken: string = res.data.data.accessToken;
      setAccessToken(newToken);
      resolveQueue(newToken);
      config._retried = true;
      config.headers.Authorization = `Bearer ${newToken}`;
      return api(config);
    } catch (refreshError) {
      setAccessToken(null);
      resolveQueue(null);
      window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

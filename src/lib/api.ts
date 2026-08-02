import axios from 'axios';

/**
 * Axios instance pre-wired for the real backend (Express + Prisma + MySQL).
 * Until the API is deployed, `src/lib/mockApi.ts` simulates the same
 * request/response shape so the rest of the app can adopt TanStack Query
 * now and swap the transport later without touching component code.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('shop-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) localStorage.removeItem('shop-token');
    return Promise.reject(error);
  }
);

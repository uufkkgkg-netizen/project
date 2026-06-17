import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://femcare-backend-api.onrender.com/api';

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Required for HttpOnly cookie to be sent automatically
});

// ── Request Interceptor ────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    // Support Super Admin impersonation (tenant switching)
    const impersonatedTenantId = sessionStorage.getItem('impersonated_tenant_id');
    if (impersonatedTenantId) {
      config.headers['x-tenant-id'] = impersonatedTenantId;
    }
  }
  return config;
});

// ── Response Interceptor ───────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        // Clear any stale session data and redirect to login
        sessionStorage.removeItem('impersonated_tenant_id');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

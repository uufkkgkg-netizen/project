import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://femcare-backend-api.onrender.com/api';

// ── In-Memory Token Store (NOT localStorage — cleared on page refresh) ─────
// This is the safest cross-origin approach when HttpOnly cookies can't be used
// cross-domain (different Render subdomains). Token lives only in JS memory.
let _memoryToken: string | null = null;

export const tokenStore = {
  set: (token: string) => { _memoryToken = token; },
  get: () => _memoryToken,
  clear: () => { _memoryToken = null; },
};

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Send HttpOnly cookie when same-origin or sameSite=none
});

// ── Request Interceptor ────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  // Attach Bearer token from memory (for cross-origin scenarios)
  const token = tokenStore.get();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  if (typeof window !== 'undefined') {
    // Super Admin impersonation (tenant switching via sessionStorage)
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
      // Clear memory token on 401
      tokenStore.clear();
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        sessionStorage.removeItem('impersonated_tenant_id');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

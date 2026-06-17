import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://femcare-backend-api.onrender.com/api';

// ── In-Memory Token Store (NOT localStorage — cleared on page refresh) ─────
// This is the safest cross-origin approach when HttpOnly cookies can't be used
// cross-domain (different Render subdomains). Token lives only in JS memory.
let _memoryToken: string | null = null;
let _csrfToken: string | null = null;

export const tokenStore = {
  set: (token: string, csrf?: string) => { 
    _memoryToken = token; 
    if (csrf) _csrfToken = csrf;
  },
  get: () => _memoryToken,
  getCsrf: () => _csrfToken,
  clear: () => { 
    _memoryToken = null; 
    _csrfToken = null;
  },
};

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Send HttpOnly cookie when same-origin or sameSite=none
});

// ── Request Interceptor ────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  // Attach Bearer token from memory
  const token = tokenStore.get();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  // Attach CSRF token
  const csrf = tokenStore.getCsrf();
  if (csrf) {
    config.headers['x-csrf-token'] = csrf;
  }

  if (typeof window !== 'undefined') {
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
  async (error) => {
    const originalRequest = error.config;
    
    // Attempt refresh if 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/login')) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(`${API_BASE}/auth/refresh`, {}, { withCredentials: true });
        
        tokenStore.set(res.data.access_token, res.data.csrf_token);
        
        // Update header for retry
        originalRequest.headers['Authorization'] = `Bearer ${res.data.access_token}`;
        originalRequest.headers['x-csrf-token'] = res.data.csrf_token;
        
        return api(originalRequest);
      } catch (refreshError) {
        tokenStore.clear();
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          sessionStorage.removeItem('impersonated_tenant_id');
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;

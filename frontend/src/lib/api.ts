import axios from 'axios';

// Use relative URL so Next.js rewrites proxy the request to the NestJS backend.
// This eliminates all CORS issues since the browser only talks to Next.js (same origin).
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://femcare-backend-api.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Support Super Admin Impersonation
    const impersonatedTenantId = localStorage.getItem('impersonated_tenant_id');
    if (impersonatedTenantId) {
      config.headers['x-tenant-id'] = impersonatedTenantId;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Force token refresh (re-login) if the backend rejects the old token structure
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      if (typeof window !== 'undefined') {
        // If it's a 403 and we are on a protected page, maybe their token is outdated
        console.warn('API Authorization Error:', error.response.status, 'Clearing token to force refresh.');
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        // We only forcefully redirect if it's 401. For 403, we let the UI handle it or show a toast, 
        // but clearing the token ensures next reload forces a fresh login.
        if (error.response.status === 401) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

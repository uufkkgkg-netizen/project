import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://femcare-backend-api.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // sends cookies with cross-origin requests
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    // The backend sets an HttpOnly cookie for same-origin use.
    // For cross-origin requests (different domain), we also store user_info in localStorage
    // but keep the actual JWT in a client-readable cookie for middleware.
    const userInfoStr = localStorage.getItem('user_info');
    const fallbackToken = localStorage.getItem('access_token'); // legacy fallback
    
    // Try to read the middleware-accessible cookie value for the Bearer header
    const cookieToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('access_token='))
      ?.split('=')[1];
    
    const token = cookieToken || fallbackToken;
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
  (response) => {
    // After successful login, sync a readable cookie for the Next.js middleware
    // (The HttpOnly cookie from backend is for security, but middleware needs to read role)
    if (response.config.url?.includes('/auth/login') && response.data?.user) {
      // We rely on the backend cookie being passed via CORS + credentials
      // No raw token is stored in localStorage for security
    }
    return response;
  },
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      if (typeof window !== 'undefined') {
        console.warn('API Authorization Error:', error.response.status);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_info');
        document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        if (error.response.status === 401) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

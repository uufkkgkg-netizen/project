import axios from 'axios';
import axiosRetry from 'axios-retry';

const API_BASE = '/api';

// ── Token Store for CSRF Only ──────────────────────────────────────────────
let _csrfToken: string | null = null;

export const tokenStore = {
  set: (csrf?: string) => { 
    if (csrf) _csrfToken = csrf;
  },
  getCsrf: () => _csrfToken,
  clear: () => { 
    _csrfToken = null;
  },
};

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Send HttpOnly cookie automatically
  timeout: 30000, // 30 seconds timeout to handle Render cold-starts
});

// ── Retry Logic for GET Requests ───────────────────────────────────────────
axiosRetry(api, {
  retries: 3, // number of retries
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    // Only retry GET requests on network errors or 5xx
    if (error.config?.method !== 'get') return false;
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || (error.response && error.response.status >= 500);
  },
});

// ── Request Interceptor ────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
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
    
    // Process error response for specific messages
    if (error.response) {
      const status = error.response.status;
      
      // Enhance Error object with specific user-facing messages
      if (status === 401 && !originalRequest.url?.includes('/auth/login')) {
        error.userMessage = "انتهت الجلسة أو بيانات الدخول غير صحيحة.";
      } else if (status === 401 && originalRequest.url?.includes('/auth/login')) {
        error.userMessage = "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
      } else if (status === 429) {
        error.userMessage = "محاولات عديدة، يرجى المحاولة لاحقاً.";
      } else if (status >= 500) {
        error.userMessage = "خطأ في الاتصال بالخادم، تواصل مع الدعم.";
      } else {
        error.userMessage = error.response.data?.message || "حدث خطأ غير متوقع.";
      }

      // Attempt refresh if 401 and not already retrying
      if (status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/login') && !originalRequest.url?.includes('/auth/refresh')) {
        originalRequest._retry = true;
        try {
          const res = await axios.post(`${API_BASE}/auth/refresh`, {}, { withCredentials: true });
          tokenStore.set(res.data.csrf_token);
          
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
    } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      error.userMessage = "تعذر الاتصال بالخادم (انتهى وقت الطلب).";
    } else {
      error.userMessage = "مشكلة في الشبكة، يرجى التحقق من اتصالك بالإنترنت.";
    }

    return Promise.reject(error);
  }
);

export default api;

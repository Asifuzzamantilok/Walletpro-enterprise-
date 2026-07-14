import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Constants for LocalStorage keys
export const ACCESS_TOKEN_KEY = 'walletpro_access_token';
export const REFRESH_TOKEN_KEY = 'walletpro_refresh_token';
export const ACTIVE_ROLE_KEY = 'walletpro_active_role';

// Get base URL with fallback to the production Render URL
const getBaseUrl = (): string => {
  let rawUrl = (import.meta as any).env?.VITE_API_BASE_URL || 'https://walletpro-enterprise-backend.onrender.com/api/v1';
  
  // Strip any trailing slashes
  rawUrl = rawUrl.replace(/\/+$/, '');
  
  // If it doesn't end with /api/v1 (e.g. is just the domain or has /api), append /api/v1
  if (!rawUrl.endsWith('/api/v1')) {
    if (rawUrl.endsWith('/api')) {
      rawUrl = rawUrl + '/v1';
    } else {
      rawUrl = rawUrl + '/api/v1';
    }
  }
  
  return rawUrl;
};

const BASE_URL = getBaseUrl();

// Create AXIOS instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 2000, // 2 seconds timeout for fast local fallback support
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Custom event dispatchers for global UI listeners
export const emitApiErrorEvent = (type: string, payload: any) => {
  const event = new CustomEvent('walletpro_api_error', { detail: { type, payload } });
  window.dispatchEvent(event);
};

// Flags to prevent infinite refresh loops
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: any) => void; reject: (error: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach JWT Token and Active Role
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Check if offline
    if (!navigator.onLine) {
      emitApiErrorEvent('offline', { message: 'You appear to be offline. Running in offline/cached mode.' });
      return Promise.reject(new Error('Network offline'));
    }

    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    const activeRole = localStorage.getItem(ACTIVE_ROLE_KEY);
    if (activeRole && config.headers) {
      config.headers['X-Active-Role'] = activeRole;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle errors and refresh tokens
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (!error.response) {
      // Network Error, Timeout or Server Down
      if (error.code === 'ECONNABORTED') {
        emitApiErrorEvent('timeout', { message: 'Request timed out. Please check your network connection and retry.' });
      } else {
        emitApiErrorEvent('offline', { message: 'The backend service seems to be unavailable. Retrying with fallback state.' });
      }
      return Promise.reject(error);
    }

    const status = error.response.status;

    // Handle 401 Unauthorized (Expired Access Token)
    const isAuthRequest = originalRequest && originalRequest.url && (
      originalRequest.url.includes('/auth/login') || 
      originalRequest.url.includes('/auth/refresh')
    );

    if (status === 401) {
      if (isAuthRequest) {
        // If an explicit login/refresh attempt receives 401, reject immediately to prevent fake auth or loops
        return Promise.reject(error);
      }

      if (!originalRequest._retry) {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        
        if (!refreshToken) {
          // No refresh token available, clear session and redirect
          localStorage.removeItem(ACCESS_TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          emitApiErrorEvent('auth_expired', { message: 'Your session has expired. Redirecting to login.' });
          return Promise.reject(error);
        }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call token refresh API (Part 4: Refresh Token)
        const response = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
        const { accessToken, newRefreshToken } = response.data;

        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        if (newRefreshToken) {
          localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
        }

        apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        processQueue(null, accessToken);
        isRefreshing = false;

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

        // Clear tokens and notify UI
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        emitApiErrorEvent('auth_expired', { message: 'Session expired. Please log in again.' });
        return Promise.reject(refreshError);
      }
    }
  }

    // Handle 403 Forbidden
    if (status === 403) {
      emitApiErrorEvent('forbidden', { message: 'Access denied. You do not have permissions for this action.' });
    }

    // Handle 429 Too Many Requests
    if (status === 429) {
      emitApiErrorEvent('rate_limit', { message: 'Too many requests. Please slow down and try again later.' });
    }

    // Handle 500 Internal Server Error
    if (status >= 500) {
      emitApiErrorEvent('server_error', { message: 'Enterprise server encountered an unexpected error. Team notified.' });
    }

    // Handle specific status errors
    emitApiErrorEvent('http_error', { status, message: (error.response.data as any)?.message || 'An API error occurred.' });

    return Promise.reject(error);
  }
);

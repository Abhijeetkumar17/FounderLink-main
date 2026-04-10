import axios from 'axios';
import { TokenService } from '../services/tokenService';
import { globalErrorHandler } from '../errors/errorHandler';

// ─── BASE URL SETUP ───
// Reads from environment vars and strips any trailing /api or slashes
const configuredBaseURL =
  import.meta.env.VITE_API_URI ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:8080';

const baseURL = configuredBaseURL.replace(/\/api\/?$/, '').replace(/\/+$/, '');

// ─── CREATE AXIOS INSTANCE ───
// All API files (authApi, startupApi, etc.) import this single instance.
// Every request auto-gets the baseURL prefix and JSON content type.
const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── REFRESH TOKEN STATE ───
// These variables prevent multiple simultaneous refresh calls (race condition).
// If 3 API calls fail with 401 at the same time, only ONE refresh request fires.
// The other 2 wait in the failedQueue and retry after the refresh completes.
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

/**
 * Process all queued requests after a refresh succeeds or fails.
 * - On success: each queued request retries with the new token.
 * - On failure: each queued request is rejected (triggering their individual error handlers).
 */
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token!);
    }
  });
  failedQueue = [];
};

// ─── REQUEST INTERCEPTOR ───
// Runs BEFORE every HTTP request leaves the browser.
// Attaches the JWT access token and user ID to every outgoing request.
axiosInstance.interceptors.request.use(
  (config) => {
    const token = TokenService.getToken();
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (storedUser?.userId) {
      config.headers['X-User-Id'] = String(storedUser.userId);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ─── RESPONSE INTERCEPTOR ───
// Runs AFTER every HTTP response arrives.
// Handles token expiry (401) with automatic refresh + retry.
axiosInstance.interceptors.response.use(
  (response) => response, // 2xx responses pass through untouched
  async (error) => {
    const originalRequest = error.config;

    // ── 401 Unauthorized: Access token expired ──
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Mark this request so we don't retry it infinitely
      originalRequest._retry = true;

      // If a refresh is already in progress, queue this request
      // instead of firing another refresh call
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        }).catch((err) => {
          return Promise.reject(err);
        });
      }

      // First 401 — start the refresh process
      isRefreshing = true;

      try {
        const refreshToken = TokenService.getRefreshToken();

        // If there's no refresh token stored, skip straight to logout
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Call the backend refresh endpoint (using raw axios, NOT axiosInstance,
        // to avoid the interceptor catching the refresh call itself)
        const response = await axios.post(`${baseURL}/auth/refresh`, {
          refreshToken,
        });

        const { token: newToken, refreshToken: newRefreshToken } = response.data.data;

        // Store the new tokens
        TokenService.setToken(newToken);
        if (newRefreshToken) {
          TokenService.setRefreshToken(newRefreshToken);
        }

        // Update the default header for future requests
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

        // Process all queued requests with the new token
        processQueue(null, newToken);

        // Retry the original failed request with the new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed — token is truly expired or invalid
        // Clear everything and force logout
        processQueue(refreshError, null);
        TokenService.clearAll();
        window.dispatchEvent(new Event('auth-logout'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ── 5xx Server Errors: Log globally ──
    if (error.response?.status >= 500) {
      globalErrorHandler(error);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

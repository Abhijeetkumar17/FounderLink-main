import axios from 'axios';
import { TokenService } from '../services/tokenService';
import { globalErrorHandler } from '../errors/errorHandler';

// Prefer either env key and normalize away any trailing slash or accidental /api suffix.
const configuredBaseURL =
  import.meta.env.VITE_API_URI ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:8080';

const baseURL = configuredBaseURL.replace(/\/api\/?$/, '').replace(/\/+$/, '');

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if the error is due to an unauthorized token (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Feature: 4.1 Refresh Token Mechanism 
        // This is a placeholder for refresh logic which will hit the refresh endpoint
        // const refreshToken = TokenService.getRefreshToken();
        // const response = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
        // TokenService.setToken(response.data.token);
        
        // originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
        // return axiosInstance(originalRequest);
        
        // If refresh fails, log out
        TokenService.removeToken();
        window.dispatchEvent(new Event('auth-logout')); // Trigger global logout
      } catch (e) {
        TokenService.removeToken();
        window.dispatchEvent(new Event('auth-logout'));
      }
    } else if (error.response?.status >= 500) {
      // Global error handler for server crashes
      globalErrorHandler(error);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;

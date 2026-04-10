import axios from 'axios';
import { TokenService } from '../../../core/services/tokenService';

const paymentBaseURL =
  import.meta.env.VITE_PAYMENT_API_URL ||
  'http://localhost:8089/api/payments';

const paymentApi = axios.create({
  baseURL: paymentBaseURL.replace(/\/+$/, ''),
  headers: {
    'Content-Type': 'application/json',
  },
});

paymentApi.interceptors.request.use((config) => {
  const token = TokenService.getToken();
  const storedUser = JSON.parse(localStorage.getItem('user') || 'null');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (storedUser?.userId) {
    config.headers['X-User-Id'] = String(storedUser.userId);
  }

  return config;
});

export const createOrder = (data: any) => paymentApi.post('/create-order', data);
export const verifyPayment = (data: any) => paymentApi.post('/verify', data);
export const acceptPayment = (paymentId: string | number) => paymentApi.put(`/${paymentId}/accept`);
export const rejectPayment = (paymentId: string | number) => paymentApi.put(`/${paymentId}/reject`);
export const getPaymentsByInvestor = (investorId: string | number) => paymentApi.get(`/investor/${investorId}`);
export const getPaymentsByFounder = (founderId: string | number) => paymentApi.get(`/founder/${founderId}`);
export const getPaymentsByStartup = (startupId: string | number) => paymentApi.get(`/startup/${startupId}`);
export const getSagaStatus = (paymentId: string | number) => paymentApi.get(`/${paymentId}/saga`);

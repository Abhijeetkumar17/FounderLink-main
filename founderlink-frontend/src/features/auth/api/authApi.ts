import api from '../../../core/interceptors/axiosConfig';

export const login = (data: any) => api.post('/auth/login', data);
export const register = (data: any) => api.post('/auth/register', data);
export const refreshToken = (data: any) => api.post('/auth/refresh', data);

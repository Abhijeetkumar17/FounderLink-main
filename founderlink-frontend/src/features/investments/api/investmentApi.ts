import api from '../../../core/interceptors/axiosConfig';

export const createInvestment = (data: any) => api.post('/investments', data);
export const getInvestmentsByStartup = (startupId: any) => api.get(`/investments/startup/${startupId}`);
export const getMyInvestments = (investorId: any) => api.get(`/investments/investor/${investorId}`);
export const approveInvestment = (id: any) => api.put(`/investments/${id}/approve`);
export const rejectInvestment = (id: any) => api.put(`/investments/${id}/reject`);

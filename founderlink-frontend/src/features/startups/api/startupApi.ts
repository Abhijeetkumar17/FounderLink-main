import api from '../../../core/interceptors/axiosConfig';

export const createStartup = (data: any) => api.post('/startups', data);
export const getAllStartups = (page = 0, size = 10) => api.get(`/startups?page=${page}&size=${size}`);
export const getStartupById = (id: string | number) => api.get(`/startups/${id}`);
export const updateStartup = (id: string | number, data: any) => api.put(`/startups/${id}`, data);
export const deleteStartup = (id: string | number) => api.delete(`/startups/${id}`);
export const approveStartup = (id: string | number) => api.put(`/startups/${id}/approve`);
export const rejectStartup  = (id: string | number) => api.put(`/startups/${id}/reject`);

// Following logic
export const followStartup = (id: string | number) => api.post(`/startups/${id}/follow`);
export const unfollowStartup = (id: string | number) => api.post(`/startups/${id}/unfollow`);
export const checkFollowStatus = (id: string | number) => api.get(`/startups/${id}/is-following`);

export const getStartupsByFounder = (founderId: string | number) => api.get(`/startups/founder/${founderId}`);
export const getAllStartupsAdmin = () => api.get('/startups/admin/all?page=0&size=100');

import api from '../../../core/interceptors/axiosConfig';

export const getMyProfile = (userId: string | number) => api.get(`/users/${userId}`);
export const updateProfile = (userId: string | number, data: any) => api.put(`/users/${userId}`, data);
export const getUserById = (id: string | number) => api.get(`/users/${id}`);
export const getAllProfiles = (page = 0, size = 50) => api.get(`/users?page=${page}&size=${size}`);
export const searchUsersBySkill = (skill: string) => api.get(`/users/search?skill=${encodeURIComponent(skill)}`);
export const getCoFounderIds = () => api.get('/auth/users/by-role?role=ROLE_COFOUNDER');
export const getUsersByRole = (role: string) => api.get(`/auth/users/by-role?role=${role}`);
export const getAuthUserById = (id: string | number) => api.get(`/auth/users/${id}`);
export const getProfilesBatch = (userIds: (string | number)[], skill?: string) => {
  const params = new URLSearchParams({ userIds: userIds.join(',') });
  if (skill) params.append('skill', skill);
  return api.get(`/users/profiles/batch?${params}`);
};

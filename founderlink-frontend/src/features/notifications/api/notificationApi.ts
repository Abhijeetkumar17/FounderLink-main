import api from '../../../core/interceptors/axiosConfig';

export const getNotifications = (userId: any) => api.get(`/notifications/${userId}`);
export const getUnreadNotifications = (userId: any) => api.get(`/notifications/${userId}/unread`);
export const markAsRead = (notificationId: any) => api.put(`/notifications/${notificationId}/read`);

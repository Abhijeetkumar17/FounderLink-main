import api from '../../../core/interceptors/axiosConfig';

export const sendMessage = (data: { receiverId: string | number, content: string }) => api.post('/messages', data);
export const getConversationMessages = (conversationId: string | number) => api.get(`/messages/conversation/${conversationId}`);
export const getMyConversations = () => api.get('/messages/conversations');
export const startConversation = (otherUserId: string | number) => api.post(`/messages/conversations?otherUserId=${otherUserId}`);

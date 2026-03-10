import api from './api';

export const getConversations = () => api.get('/chat/conversations');
export const getMessages = (userId) => api.get(`/chat/messages/${userId}`);
export const sendMessage = (userId, content) => api.post(`/chat/messages/${userId}`, { content });
export const getUnreadCount = () => api.get('/chat/unread-count');

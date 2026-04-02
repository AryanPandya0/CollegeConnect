import api from './api';

export const getConversations = () => api.get('/messages/conversations');
export const getMessages = (conversationId) => api.get(`/messages/${conversationId}`);
export const sendMessage = (conversationId, content) => api.post(`/messages/${conversationId}`, { content });
export const getOrCreateConversation = (participantId) => api.post('/messages/conversations', { participantId });
export const getUnreadCount = () => api.get('/chat/unread-count');

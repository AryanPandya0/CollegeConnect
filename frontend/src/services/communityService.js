import api from './api';

export const getCommunities = () => api.get('/communities');
export const getCommunity = (id) => api.get(`/communities/${id}`);
export const joinCommunity = (id) => api.post(`/communities/${id}/join`);

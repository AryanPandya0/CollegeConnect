import api from './api';

export const getCommunities = (search = '') => api.get(`/communities?search=${search}`);
export const getCommunity = (id) => api.get(`/communities/${id}`);
export const joinCommunity = (id) => api.post(`/communities/${id}/join`);
export const leaveCommunity = (id) => api.post(`/communities/${id}/leave`);

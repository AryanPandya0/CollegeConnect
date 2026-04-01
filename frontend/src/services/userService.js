import api from './api';

export const getLeaderboard = (params) => api.get('/users/leaderboard', { params });
export const getProfile = () => api.get('/users/profile/me');
export const updateProfile = (userData) => api.put('/users/profile', userData);
export const getUserProfile = (userId) => api.get(`/users/${userId}`);

export default {
    getLeaderboard,
    getProfile,
    updateProfile,
    getUserProfile
};

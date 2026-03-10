import api from './api';

export const getPosts = (params) => api.get('/posts', { params });
export const createPost = (postData) => api.post('/posts', postData);
export const votePost = (postId, value) => api.post(`/posts/${postId}/vote`, { value });
export const removeVote = (postId) => api.delete(`/posts/${postId}/vote`);

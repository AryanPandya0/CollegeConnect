import api from './api';

export const getResources = (params) => api.get('/resources', { params });
export const createResource = (resourceData) => api.post('/resources', resourceData);
export const deleteResource = (resourceId) => api.delete(`/resources/${resourceId}`);
export const incrementDownload = (resourceId) => api.post(`/resources/${resourceId}/download`);

export default {
    getResources,
    createResource,
    deleteResource,
    incrementDownload
};

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const ROOT_URL = BASE_URL.replace('/api', '');

/**
 * Format image URL to ensure it has the correct backend prefix
 * @param {string} path - The raw path from the backend
 * @returns {string} Fully qualified image URL
 */
export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  
  // Ensure the path starts with / if it doesn't
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${ROOT_URL}${cleanPath}`;
};

/**
 * Get fallback avatar based on user name
 * @param {string} name - User's name
 * @returns {string} UI Avatar URL
 */
export const getFallbackAvatar = (name) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;
};

// Alias for generic files
export const getFileUrl = getImageUrl;

export default {
  getImageUrl,
  getFileUrl,
  getFallbackAvatar
};

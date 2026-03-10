import { PAGINATION } from './constants.js';

/**
 * Format successful API response
 * @param {Object} options
 * @param {boolean} options.success - Success status
 * @param {string} options.message - Response message
 * @param {*} options.data - Response data
 * @param {Object} options.pagination - Pagination info
 * @returns {Object} Formatted response object
 */
export const formatSuccess = ({
  success = true,
  message = 'Success',
  data = null,
  pagination = null
}) => {
  const response = {
    success,
    message,
    data
  };

  if (pagination) {
    response.pagination = {
      page: pagination.page || PAGINATION.DEFAULT_PAGE,
      limit: pagination.limit || PAGINATION.DEFAULT_LIMIT,
      total: pagination.total || 0,
      totalPages: pagination.totalPages || 0
    };
  }

  return response;
};

/**
 * Format error API response
 * @param {Object} options
 * @param {string} options.message - Error message
 * @param {Array} options.errors - Array of error details
 * @param {number} options.statusCode - HTTP status code
 * @returns {Object} Formatted error response object
 */
export const formatError = ({
  message = 'An error occurred',
  errors = null,
  statusCode = 500
}) => {
  const response = {
    success: false,
    message,
    statusCode
  };

  if (errors) {
    response.errors = errors;
  }

  return response;
};

/**
 * Calculate pagination metadata
 * @param {number} total - Total number of items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {Object} Pagination metadata
 */
export const calculatePagination = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
};

/**
 * Get pagination options from query parameters
 * @param {Object} query - Request query object
 * @returns {Object} Skip and limit values
 */
export const getPaginationOptions = (query) => {
  const page = Math.max(1, parseInt(query.page) || PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(1, parseInt(query.limit) || PAGINATION.DEFAULT_LIMIT)
  );
  
  return {
    page,
    limit,
    skip: (page - 1) * limit
  };
};

export default {
  formatSuccess,
  formatError,
  calculatePagination,
  getPaginationOptions
};

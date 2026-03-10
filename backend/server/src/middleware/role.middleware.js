import { formatError } from '../utils/formatResponse.js';
import { HTTP_STATUS, USER_ROLES } from '../utils/constants.js';

/**
 * Check if user has required role(s)
 * @param  {...string} allowedRoles - Roles that are allowed to access
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        formatError({
          message: 'Authentication required.',
          statusCode: HTTP_STATUS.UNAUTHORIZED
        })
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        formatError({
          message: 'You do not have permission to perform this action.',
          statusCode: HTTP_STATUS.FORBIDDEN
        })
      );
    }

    next();
  };
};

/**
 * Require admin role
 */
export const requireAdmin = requireRole(USER_ROLES.ADMIN);

/**
 * Require campus lead or admin role
 */
export const requireCampusLeadOrAdmin = requireRole(USER_ROLES.CAMPUS_LEAD, USER_ROLES.ADMIN);

/**
 * Check if user owns the resource or is admin
 * @param {Function} getResourceOwnerId - Function to extract owner ID from req
 */
export const requireOwnershipOrAdmin = (getResourceOwnerId) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(
          formatError({
            message: 'Authentication required.',
            statusCode: HTTP_STATUS.UNAUTHORIZED
          })
        );
      }

      // Admin can access anything
      if (req.user.role === USER_ROLES.ADMIN) {
        return next();
      }

      const ownerId = await getResourceOwnerId(req);
      
      if (req.userId !== ownerId.toString()) {
        return res.status(HTTP_STATUS.FORBIDDEN).json(
          formatError({
            message: 'You do not have permission to access this resource.',
            statusCode: HTTP_STATUS.FORBIDDEN
          })
        );
      }

      next();
    } catch (error) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        formatError({
          message: 'Error checking resource ownership.',
          statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
        })
      );
    }
  };
};

/**
 * Check if user is community moderator
 * Requires communityId to be in req.params
 */
export const requireCommunityModerator = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        formatError({
          message: 'Authentication required.',
          statusCode: HTTP_STATUS.UNAUTHORIZED
        })
      );
    }

    // Admin can moderate any community
    if (req.user.role === USER_ROLES.ADMIN) {
      return next();
    }

    const Community = (await import('../models/Community.model.js')).default;
    const community = await Community.findById(req.params.id);

    if (!community) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        formatError({
          message: 'Community not found.',
          statusCode: HTTP_STATUS.NOT_FOUND
        })
      );
    }

    if (!community.isModerator(req.userId)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        formatError({
          message: 'You must be a community moderator to perform this action.',
          statusCode: HTTP_STATUS.FORBIDDEN
        })
      );
    }

    req.community = community;
    next();
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatError({
        message: 'Error checking moderator status.',
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      })
    );
  }
};

export default {
  requireRole,
  requireAdmin,
  requireCampusLeadOrAdmin,
  requireOwnershipOrAdmin,
  requireCommunityModerator
};

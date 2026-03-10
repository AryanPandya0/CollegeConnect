import jwt from 'jsonwebtoken';
import User from '../../models/User.model.js';
import env from '../env.js';
import { formatError } from '../../utils/formatResponse.js';
import { HTTP_STATUS } from '../../utils/constants.js';

/**
 * Authenticate user using JWT token
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        formatError({
          message: 'Access denied. No token provided.',
          statusCode: HTTP_STATUS.UNAUTHORIZED
        })
      );
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);

    // Get user from database
    const user = await User.findById(decoded.userId).select('-password -refreshToken');

    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        formatError({
          message: 'User not found.',
          statusCode: HTTP_STATUS.UNAUTHORIZED
        })
      );
    }

    // Check if user is banned
    if (user.isBanned) {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        formatError({
          message: 'Your account has been banned.',
          statusCode: HTTP_STATUS.FORBIDDEN
        })
      );
    }

    // Attach user to request
    req.user = user;
    req.userId = user._id.toString();
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        formatError({
          message: 'Invalid token.',
          statusCode: HTTP_STATUS.UNAUTHORIZED
        })
      );
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        formatError({
          message: 'Token expired.',
          statusCode: HTTP_STATUS.UNAUTHORIZED
        })
      );
    }

    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatError({
        message: 'Authentication error.',
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      })
    );
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      req.userId = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.userId).select('-password -refreshToken');

    if (user && !user.isBanned) {
      req.user = user;
      req.userId = user._id.toString();
    } else {
      req.user = null;
      req.userId = null;
    }

    next();
  } catch (error) {
    req.user = null;
    req.userId = null;
    next();
  }
};

export default { authenticate, optionalAuth };

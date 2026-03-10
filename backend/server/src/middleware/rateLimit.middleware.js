import rateLimit from 'express-rate-limit';
import env from '../config/env.js';
import { formatError } from '../utils/formatResponse.js';
import { HTTP_STATUS } from '../utils/constants.js';

/**
 * General API rate limiter
 * 100 requests per 15 minutes
 */
export const generalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json(
      formatError({
        message: 'Too many requests, please try again later.',
        statusCode: HTTP_STATUS.TOO_MANY_REQUESTS
      })
    );
  },
  keyGenerator: (req) => {
    return req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  }
});

/**
 * Strict rate limiter for authentication endpoints
 * 5 requests per 15 minutes
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json(
      formatError({
        message: 'Too many authentication attempts, please try again after 15 minutes.',
        statusCode: HTTP_STATUS.TOO_MANY_REQUESTS
      })
    );
  },
  keyGenerator: (req) => {
    return req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  }
});

/**
 * Rate limiter for post creation
 * 10 posts per hour
 */
export const postCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json(
      formatError({
        message: 'Post creation limit reached. You can create up to 10 posts per hour.',
        statusCode: HTTP_STATUS.TOO_MANY_REQUESTS
      })
    );
  },
  keyGenerator: (req) => {
    return req.userId || req.ip;
  }
});

/**
 * Rate limiter for comment creation
 * 30 comments per hour
 */
export const commentCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json(
      formatError({
        message: 'Comment creation limit reached. You can create up to 30 comments per hour.',
        statusCode: HTTP_STATUS.TOO_MANY_REQUESTS
      })
    );
  },
  keyGenerator: (req) => {
    return req.userId || req.ip;
  }
});

/**
 * Rate limiter for voting
 * 100 votes per 15 minutes
 */
export const voteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json(
      formatError({
        message: 'Too many vote requests, please try again later.',
        statusCode: HTTP_STATUS.TOO_MANY_REQUESTS
      })
    );
  },
  keyGenerator: (req) => {
    return req.userId || req.ip;
  }
});

/**
 * Rate limiter for messaging
 * 50 messages per 15 minutes
 */
export const messageLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json(
      formatError({
        message: 'Message limit reached. You can send up to 50 messages per 15 minutes.',
        statusCode: HTTP_STATUS.TOO_MANY_REQUESTS
      })
    );
  },
  keyGenerator: (req) => {
    return req.userId || req.ip;
  }
});

export default {
  generalLimiter,
  authLimiter,
  postCreationLimiter,
  commentCreationLimiter,
  voteLimiter,
  messageLimiter
};

import { body, validationResult } from 'express-validator';
import { REGEX } from '../utils/constants.js';
import { formatError } from '../utils/formatResponse.js';
import { HTTP_STATUS } from '../utils/constants.js';

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      formatError({
        message: 'Validation failed',
        errors: errors.array().map(err => ({
          field: err.path,
          message: err.msg
        })),
        statusCode: HTTP_STATUS.BAD_REQUEST
      })
    );
  }
  next();
};

/**
 * Validate community creation
 */
export const validateCommunity = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Community name is required')
    .matches(REGEX.COMMUNITY_NAME)
    .withMessage('Community name must be 3-30 characters, alphanumeric with hyphens only')
    .toLowerCase(),
  
  body('displayName')
    .trim()
    .notEmpty()
    .withMessage('Display name is required')
    .isLength({ max: 100 })
    .withMessage('Display name cannot exceed 100 characters'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  
  body('college')
    .trim()
    .notEmpty()
    .withMessage('College name is required')
    .isLength({ max: 200 })
    .withMessage('College name cannot exceed 200 characters'),
  
  body('rules')
    .optional()
    .isArray()
    .withMessage('Rules must be an array')
    .custom((rules) => {
      if (rules && rules.length > 0) {
        rules.forEach((rule, index) => {
          if (typeof rule !== 'string') {
            throw new Error(`Rule ${index + 1} must be a string`);
          }
          if (rule.length > 500) {
            throw new Error(`Rule ${index + 1} cannot exceed 500 characters`);
          }
        });
      }
      return true;
    }),
  
  handleValidationErrors
];

/**
 * Validate community update
 */
export const validateCommunityUpdate = [
  body('displayName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Display name cannot exceed 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  
  body('rules')
    .optional()
    .isArray()
    .withMessage('Rules must be an array')
    .custom((rules) => {
      if (rules && rules.length > 0) {
        rules.forEach((rule, index) => {
          if (typeof rule !== 'string') {
            throw new Error(`Rule ${index + 1} must be a string`);
          }
          if (rule.length > 500) {
            throw new Error(`Rule ${index + 1} cannot exceed 500 characters`);
          }
        });
      }
      return true;
    }),
  
  handleValidationErrors
];

/**
 * Validate add moderator
 */
export const validateAddModerator = [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isMongoId()
    .withMessage('Invalid user ID'),
  
  handleValidationErrors
];

export default {
  validateCommunity,
  validateCommunityUpdate,
  validateAddModerator
};

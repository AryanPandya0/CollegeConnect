import { body, validationResult } from 'express-validator';
import { VALIDATION } from '../utils/constants.js';
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
 * Validate profile update
 */
export const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  
  body('bio')
    .optional()
    .trim()
    .isLength({ max: VALIDATION.MAX_BIO_LENGTH })
    .withMessage(`Bio cannot exceed ${VALIDATION.MAX_BIO_LENGTH} characters`),
  
  body('course')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Course cannot exceed 100 characters'),
  
  body('year')
    .optional()
    .isInt({ min: 1, max: 6 })
    .withMessage('Year must be between 1 and 6'),
  
  body('college')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('College name cannot exceed 200 characters'),
  
  body('skills')
    .optional()
    .isArray({ max: VALIDATION.MAX_SKILLS })
    .withMessage(`Skills array cannot exceed ${VALIDATION.MAX_SKILLS} items`)
    .custom((skills) => {
      if (skills && skills.length > 0) {
        skills.forEach((skill, index) => {
          if (typeof skill !== 'string') {
            throw new Error(`Skill ${index + 1} must be a string`);
          }
          if (skill.length > 50) {
            throw new Error(`Skill ${index + 1} cannot exceed 50 characters`);
          }
        });
      }
      return true;
    }),
  
  handleValidationErrors
];

/**
 * Validate comment
 */
export const validateComment = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ max: 5000 })
    .withMessage('Comment cannot exceed 5000 characters'),
  
  body('parentId')
    .optional()
    .isMongoId()
    .withMessage('Invalid parent comment ID'),
  
  handleValidationErrors
];

/**
 * Validate message
 */
export const validateMessage = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Message content is required')
    .isLength({ max: 5000 })
    .withMessage('Message cannot exceed 5000 characters'),
  
  handleValidationErrors
];

/**
 * Validate report
 */
export const validateReport = [
  body('targetId')
    .notEmpty()
    .withMessage('Target ID is required')
    .isMongoId()
    .withMessage('Invalid target ID'),
  
  body('targetType')
    .notEmpty()
    .withMessage('Target type is required')
    .isIn(['post', 'comment', 'user'])
    .withMessage('Target type must be post, comment, or user'),
  
  body('reason')
    .trim()
    .notEmpty()
    .withMessage('Reason is required')
    .isLength({ max: 200 })
    .withMessage('Reason cannot exceed 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  
  handleValidationErrors
];

/**
 * Validate job creation
 */
export const validateJob = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Job title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  
  body('company')
    .trim()
    .notEmpty()
    .withMessage('Company name is required')
    .isLength({ max: 200 })
    .withMessage('Company name cannot exceed 200 characters'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 10000 })
    .withMessage('Description cannot exceed 10000 characters'),
  
  body('type')
    .notEmpty()
    .withMessage('Job type is required')
    .isIn(['internship', 'fulltime', 'parttime', 'contract'])
    .withMessage('Invalid job type'),
  
  body('deadline')
    .notEmpty()
    .withMessage('Deadline is required')
    .isISO8601()
    .withMessage('Invalid deadline format')
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error('Deadline must be in the future');
      }
      return true;
    }),
  
  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Location cannot exceed 200 characters'),
  
  body('requirements')
    .optional()
    .isArray()
    .withMessage('Requirements must be an array'),
  
  body('salary.min')
    .optional()
    .isNumeric()
    .withMessage('Minimum salary must be a number'),
  
  body('salary.max')
    .optional()
    .isNumeric()
    .withMessage('Maximum salary must be a number'),
  
  handleValidationErrors
];

export default {
  validateProfileUpdate,
  validateComment,
  validateMessage,
  validateReport,
  validateJob
};

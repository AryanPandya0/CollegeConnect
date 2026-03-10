import { body, validationResult } from 'express-validator';
import { REGEX, VALIDATION } from '../utils/constants.js';
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
 * Validate registration
 */
export const validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email')
    .matches(REGEX.EDU_EMAIL)
    .withMessage('Please enter a valid email address'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: VALIDATION.MIN_PASSWORD_LENGTH })
    .withMessage(`Password must be at least ${VALIDATION.MIN_PASSWORD_LENGTH} characters`)
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  body('college')
    .trim()
    .notEmpty()
    .withMessage('College name is required')
    .isLength({ max: 200 })
    .withMessage('College name cannot exceed 200 characters'),

  body('course')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Course cannot exceed 100 characters'),

  body('year')
    .optional({ values: 'falsy' })
    .isInt({ min: 1, max: 6 })
    .withMessage('Year must be between 1 and 6'),

  body('bio')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),

  body('skills')
    .optional({ values: 'falsy' })
    .isArray({ max: VALIDATION.MAX_SKILLS })
    .withMessage(`Skills array cannot exceed ${VALIDATION.MAX_SKILLS} items`),

  handleValidationErrors
];

/**
 * Validate login
 */
export const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email'),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  handleValidationErrors
];

/**
 * Validate password change
 */
export const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: VALIDATION.MIN_PASSWORD_LENGTH })
    .withMessage(`Password must be at least ${VALIDATION.MIN_PASSWORD_LENGTH} characters`)
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  handleValidationErrors
];

export default {
  validateRegister,
  validateLogin,
  validateChangePassword
};

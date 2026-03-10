import { body, validationResult } from 'express-validator';
import { POST_TYPES, VALIDATION } from '../utils/constants.js';
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
 * Validate post creation
 */
export const validatePost = [
  body('communityId')
    .optional({ checkFalsy: true })
    .isMongoId()
    .withMessage('Invalid community ID'),

  body('type')
    .notEmpty()
    .withMessage('Post type is required')
    .isIn(Object.values(POST_TYPES))
    .withMessage(`Type must be one of: ${Object.values(POST_TYPES).join(', ')}`),

  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: VALIDATION.MAX_TITLE_LENGTH })
    .withMessage(`Title cannot exceed ${VALIDATION.MAX_TITLE_LENGTH} characters`),

  body('content')
    .optional()
    .trim()
    .isLength({ max: 10000 })
    .withMessage('Content cannot exceed 10000 characters'),

  body('flair')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Flair cannot exceed 50 characters'),

  // Validate poll options if type is poll
  body('poll').custom((value, { req }) => {
    if (req.body.type === 'poll') {
      if (!value || !value.options || !Array.isArray(value.options)) {
        throw new Error('Poll options are required for poll posts');
      }
      if (value.options.length < VALIDATION.MIN_POLL_OPTIONS) {
        throw new Error(`Poll must have at least ${VALIDATION.MIN_POLL_OPTIONS} options`);
      }
      if (value.options.length > VALIDATION.MAX_POLL_OPTIONS) {
        throw new Error(`Poll cannot have more than ${VALIDATION.MAX_POLL_OPTIONS} options`);
      }

      // Validate each option
      value.options.forEach((option, index) => {
        if (!option.text || option.text.trim().length === 0) {
          throw new Error(`Option ${index + 1} text is required`);
        }
        if (option.text.length > 200) {
          throw new Error(`Option ${index + 1} text cannot exceed 200 characters`);
        }
      });
    }
    return true;
  }),

  // Validate event details if type is event
  body('event').custom((value, { req }) => {
    if (req.body.type === 'event') {
      if (!value) {
        throw new Error('Event details are required for event posts');
      }
      if (!value.date) {
        throw new Error('Event date is required');
      }
      if (isNaN(Date.parse(value.date))) {
        throw new Error('Invalid event date');
      }
      if (value.location && value.location.length > 200) {
        throw new Error('Event location cannot exceed 200 characters');
      }
    }
    return true;
  }),

  handleValidationErrors
];

/**
 * Validate vote
 */
export const validateVote = [
  body('value')
    .notEmpty()
    .withMessage('Vote value is required')
    .isIn([-1, 1])
    .withMessage('Vote value must be 1 (upvote) or -1 (downvote)'),

  handleValidationErrors
];

/**
 * Validate poll vote
 */
export const validatePollVote = [
  body('optionIndex')
    .notEmpty()
    .withMessage('Option index is required')
    .isInt({ min: 0 })
    .withMessage('Option index must be a non-negative integer'),

  handleValidationErrors
];

export default {
  validatePost,
  validateVote,
  validatePollVote
};

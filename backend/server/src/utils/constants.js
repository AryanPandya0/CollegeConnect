// User Roles
export const USER_ROLES = {
  STUDENT: 'student',
  ALUMNI: 'alumni',
  CAMPUS_LEAD: 'campusLead',
  ADMIN: 'admin'
};

// Post Types
export const POST_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  POLL: 'poll',
  EVENT: 'event',
  INTERNSHIP: 'internship',
  ANNOUNCEMENT: 'announcement'
};

// Vote Values
export const VOTE_VALUES = {
  UPVOTE: 1,
  DOWNVOTE: -1
};

// Vote Target Types
export const VOTE_TARGET_TYPES = {
  POST: 'post',
  COMMENT: 'comment'
};

// Notification Types
export const NOTIFICATION_TYPES = {
  REPLY: 'reply',
  MENTION: 'mention',
  UPVOTE: 'upvote',
  MESSAGE: 'message',
  FOLLOW: 'follow',
  REPORT: 'report'
};

// Report Status
export const REPORT_STATUS = {
  PENDING: 'pending',
  REVIEWED: 'reviewed',
  RESOLVED: 'resolved',
  DISMISSED: 'dismissed'
};

// Report Target Types
export const REPORT_TARGET_TYPES = {
  POST: 'post',
  COMMENT: 'comment',
  USER: 'user'
};

// Job Types
export const JOB_TYPES = {
  INTERNSHIP: 'internship',
  FULLTIME: 'fulltime',
  PARTTIME: 'parttime',
  CONTRACT: 'contract'
};

// Application Status
export const APPLICATION_STATUS = {
  PENDING: 'pending',
  REVIEWED: 'reviewed',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected'
};

// Campus Score Weights
export const CAMPUS_SCORE_WEIGHTS = {
  POST_UPVOTE: 5,
  COMMENT_UPVOTE: 2,
  POST_CREATED: 1,
  COMMENT_CREATED: 1
};

// Sort Options
export const SORT_OPTIONS = {
  HOT: 'hot',
  NEW: 'new',
  TOP: 'top'
};

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100
};

// File Upload
export const FILE_UPLOAD = {
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_DOCUMENT_SIZE: 10 * 1024 * 1024, // 10MB
  IMAGE_PATH: 'uploads/images/',
  DOCUMENT_PATH: 'uploads/documents/'
};

// Validation Constants
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_TITLE_LENGTH: 300,
  MAX_BIO_LENGTH: 500,
  MAX_SKILLS: 20,
  MIN_POLL_OPTIONS: 2,
  MAX_POLL_OPTIONS: 10
};

// Regex Patterns
export const REGEX = {
  EDU_EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  USERNAME: /^[a-zA-Z0-9_-]{3,30}$/,
  COMMUNITY_NAME: /^[a-zA-Z0-9-]{3,30}$/
};

// Resource Categories
export const RESOURCE_CATEGORIES = {
  NOTES: 'notes',
  EXAM_PAPER: 'exam-paper',
  BOOK: 'book',
  LINK: 'link',
  OTHER: 'other'
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500
};

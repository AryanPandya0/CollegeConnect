import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import env from '../config/env.js';
import { FILE_UPLOAD } from '../utils/constants.js';
import { formatError } from '../utils/formatResponse.js';
import { HTTP_STATUS } from '../utils/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), env.UPLOAD_PATH, 'images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  if (FILE_UPLOAD.ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
  }
};

// Create multer upload instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_FILE_SIZE
  }
});

/**
 * Middleware for single image upload
 * @param {string} fieldName - Field name for the file
 */
export const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    const uploadMiddleware = upload.single(fieldName);
    
    uploadMiddleware(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(HTTP_STATUS.BAD_REQUEST).json(
              formatError({
                message: `File size too large. Maximum size is ${env.MAX_FILE_SIZE / (1024 * 1024)}MB.`,
                statusCode: HTTP_STATUS.BAD_REQUEST
              })
            );
          }
          return res.status(HTTP_STATUS.BAD_REQUEST).json(
            formatError({
              message: err.message,
              statusCode: HTTP_STATUS.BAD_REQUEST
            })
          );
        }
        
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          formatError({
            message: err.message,
            statusCode: HTTP_STATUS.BAD_REQUEST
          })
        );
      }
      next();
    });
  };
};

/**
 * Middleware for multiple image uploads
 * @param {string} fieldName - Field name for the files
 * @param {number} maxCount - Maximum number of files
 */
export const uploadMultiple = (fieldName, maxCount = 5) => {
  return (req, res, next) => {
    const uploadMiddleware = upload.array(fieldName, maxCount);
    
    uploadMiddleware(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(HTTP_STATUS.BAD_REQUEST).json(
              formatError({
                message: `File size too large. Maximum size is ${env.MAX_FILE_SIZE / (1024 * 1024)}MB.`,
                statusCode: HTTP_STATUS.BAD_REQUEST
              })
            );
          }
          if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(HTTP_STATUS.BAD_REQUEST).json(
              formatError({
                message: `Too many files. Maximum ${maxCount} files allowed.`,
                statusCode: HTTP_STATUS.BAD_REQUEST
              })
            );
          }
          return res.status(HTTP_STATUS.BAD_REQUEST).json(
            formatError({
              message: err.message,
              statusCode: HTTP_STATUS.BAD_REQUEST
            })
          );
        }
        
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          formatError({
            message: err.message,
            statusCode: HTTP_STATUS.BAD_REQUEST
          })
        );
      }
      next();
    });
  };
};

/**
 * Middleware for mixed file uploads (different fields)
 * @param {Array} fields - Array of field configurations [{ name: 'avatar', maxCount: 1 }]
 */
export const uploadFields = (fields) => {
  return (req, res, next) => {
    const uploadMiddleware = upload.fields(fields);
    
    uploadMiddleware(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(HTTP_STATUS.BAD_REQUEST).json(
              formatError({
                message: `File size too large. Maximum size is ${env.MAX_FILE_SIZE / (1024 * 1024)}MB.`,
                statusCode: HTTP_STATUS.BAD_REQUEST
              })
            );
          }
          return res.status(HTTP_STATUS.BAD_REQUEST).json(
            formatError({
              message: err.message,
              statusCode: HTTP_STATUS.BAD_REQUEST
            })
          );
        }
        
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          formatError({
            message: err.message,
            statusCode: HTTP_STATUS.BAD_REQUEST
          })
        );
      }
      next();
    });
  };
};

/**
 * Delete uploaded file
 * @param {string} filename - Name of the file to delete
 */
export const deleteFile = (filename) => {
  const filePath = path.join(uploadDir, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

/**
 * Get file URL
 * @param {string} filename - Name of the file
 * @returns {string} Full URL to the file
 */
export const getFileUrl = (filename) => {
  return `/uploads/images/${filename}`;
};

// Document Upload Configuration
const documentUploadDir = path.join(process.cwd(), env.UPLOAD_PATH || 'uploads', 'documents');
if (!fs.existsSync(documentUploadDir)) {
  fs.mkdirSync(documentUploadDir, { recursive: true });
}

const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, documentUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `doc-${uniqueSuffix}${ext}`);
  }
});

const documentFilter = (req, file, cb) => {
  if (FILE_UPLOAD.ALLOWED_DOCUMENT_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, PPT, PPTX are allowed.'), false);
  }
};

const uploadDocument = multer({
  storage: documentStorage,
  fileFilter: documentFilter,
  limits: {
    fileSize: FILE_UPLOAD.MAX_DOCUMENT_SIZE || 10 * 1024 * 1024
  }
});

export const uploadDocumentSingle = (fieldName) => {
  return (req, res, next) => {
    const uploadMiddleware = uploadDocument.single(fieldName);
    
    uploadMiddleware(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(HTTP_STATUS.BAD_REQUEST).json(
              formatError({
                message: `File size too large. Maximum size is ${(FILE_UPLOAD.MAX_DOCUMENT_SIZE || 10 * 1024 * 1024) / (1024 * 1024)}MB.`,
                statusCode: HTTP_STATUS.BAD_REQUEST
              })
            );
          }
          return res.status(HTTP_STATUS.BAD_REQUEST).json(
            formatError({ message: err.message, statusCode: HTTP_STATUS.BAD_REQUEST })
          );
        }
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          formatError({ message: err.message, statusCode: HTTP_STATUS.BAD_REQUEST })
        );
      }
      next();
    });
  };
};

export default {
  uploadSingle,
  uploadMultiple,
  uploadFields,
  deleteFile,
  getFileUrl,
  uploadDocumentSingle
};

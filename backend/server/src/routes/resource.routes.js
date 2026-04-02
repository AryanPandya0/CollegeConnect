import express from 'express';
import * as resourceController from '../controllers/resource.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @route   GET /api/resources
 * @desc    Get all resources with filtering
 * @access  Public (Optional Auth)
 */
router.get('/', optionalAuth, resourceController.getResources);

/**
 * @route   POST /api/resources
 * @desc    Create new resource
 * @access  Private
 */
router.post('/', authenticate, resourceController.createResource);

/**
 * @route   DELETE /api/resources/:id
 * @desc    Delete a resource
 * @access  Private (Author/Admin)
 */
router.delete('/:id', authenticate, resourceController.deleteResource);

/**
 * @route   POST /api/resources/:id/download
 * @desc    Increment download count
 * @access  Private
 */
router.post('/:id/download', authenticate, resourceController.incrementDownload);

/**
 * @route   POST /api/resources/upload
 * @desc    Upload a resource document
 * @access  Private
 */
import { uploadDocumentSingle } from '../middleware/upload.middleware.js';
router.post('/upload', authenticate, uploadDocumentSingle('document'), resourceController.uploadResourceFile);

export default router;

import express from 'express';
import * as searchController from '../controllers/search.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @route   GET /api/search
 * @desc    Global unified search across users, communities, and resources
 * @access  Public (Optional Auth)
 */
router.get('/', optionalAuth, searchController.globalSearch);

export default router;

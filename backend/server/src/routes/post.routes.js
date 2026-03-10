import express from 'express';
import * as postController from '../controllers/post.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.middleware.js';
import { postCreationLimiter, voteLimiter } from '../middleware/rateLimit.middleware.js';
import { uploadMultiple } from '../middleware/upload.middleware.js';
import { validatePost } from '../validators/post.validator.js';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, postController.getFeed);

// Image upload (must come before /:id)
router.post('/upload', authenticate, uploadMultiple('images', 5), postController.uploadImages);

// User posts (must come before /:id)
router.get('/user/:id', postController.getUserPosts);

// Protected routes
router.post('/', authenticate, postCreationLimiter, validatePost, postController.createPost);

// Parameterized routes
router.get('/:id', optionalAuth, postController.getPostById);
router.put('/:id', authenticate, postController.updatePost);
router.delete('/:id', authenticate, postController.deletePost);

// Voting routes
router.post('/:id/vote', authenticate, voteLimiter, postController.votePost);
router.delete('/:id/vote', authenticate, postController.removeVote);

// Poll voting
router.post('/:id/poll/vote', authenticate, postController.votePoll);

export default router;

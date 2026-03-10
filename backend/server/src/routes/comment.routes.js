import express from 'express';
import * as commentController from '../controllers/comment.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.middleware.js';
import { commentCreationLimiter, voteLimiter } from '../middleware/rateLimit.middleware.js';

const router = express.Router();

// Routes mounted at /api/posts/:id/comments

// Public routes
router.get('/posts/:id/comments', optionalAuth, commentController.getComments);
router.get('/comments/:id', optionalAuth, commentController.getCommentById);

// Protected routes
router.post('/posts/:id/comments', authenticate, commentCreationLimiter, commentController.addComment);
router.put('/comments/:id', authenticate, commentController.updateComment);
router.delete('/comments/:id', authenticate, commentController.deleteComment);

// Voting routes
router.post('/comments/:id/vote', authenticate, voteLimiter, commentController.voteComment);
router.delete('/comments/:id/vote', authenticate, commentController.removeVote);

export default router;

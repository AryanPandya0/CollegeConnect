import express from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.middleware.js';
import { uploadSingle } from '../middleware/upload.middleware.js';

const router = express.Router();

// Static routes MUST come before parameterized routes
router.get('/search', userController.searchUsers);
router.get('/leaderboard', userController.getLeaderboard);
router.get('/profile/me', authenticate, userController.getProfile);
router.put('/profile/me', authenticate, userController.updateProfile);
router.put('/profile/avatar', authenticate, uploadSingle('avatar'), userController.uploadAvatar);

// Username route (has prefix /u/)
router.get('/u/:username', optionalAuth, userController.getUserByUsername);

// Parameterized routes
router.get('/:id', optionalAuth, userController.getUserById);
router.get('/:id/followers', userController.getFollowers);
router.get('/:id/following', userController.getFollowing);
router.post('/:id/follow', authenticate, userController.followUser);

export default router;

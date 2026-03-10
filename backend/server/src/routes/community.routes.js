import express from 'express';
import * as communityController from '../controllers/community.controller.js';
import * as postController from '../controllers/post.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.middleware.js';
import { requireCampusLeadOrAdmin, requireCommunityModerator } from '../middleware/role.middleware.js';
import { uploadSingle } from '../middleware/upload.middleware.js';
import { validateCommunity } from '../validators/community.validator.js';

const router = express.Router();

// Public routes
router.get('/', communityController.getCommunities);
router.get('/:id', optionalAuth, communityController.getCommunityById);
router.get('/:id/members', communityController.getMembers);
router.get('/:id/posts', optionalAuth, postController.getCommunityPosts);

// Protected routes - require authentication
router.post('/', authenticate, requireCampusLeadOrAdmin, validateCommunity, communityController.createCommunity);
router.post('/:id/join', authenticate, communityController.joinCommunity);
router.post('/:id/leave', authenticate, communityController.leaveCommunity);

// Moderator only routes
router.put('/:id', authenticate, requireCommunityModerator, communityController.updateCommunity);
router.post('/:id/moderators', authenticate, requireCommunityModerator, communityController.addModerator);
router.delete('/:id/moderators/:userId', authenticate, requireCommunityModerator, communityController.removeModerator);
router.put('/:id/avatar', authenticate, requireCommunityModerator, uploadSingle('avatar'), communityController.uploadAvatar);
router.put('/:id/cover', authenticate, requireCommunityModerator, uploadSingle('cover'), communityController.uploadCover);

export default router;

import express from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(requireAdmin);

// Dashboard
router.get('/dashboard', adminController.getDashboard);
router.get('/stats', adminController.getStats);

// User management
router.get('/users', adminController.getUsers);
router.put('/users/:id/ban', adminController.banUser);
router.put('/users/:id/role', adminController.changeUserRole);

// Report management
router.get('/reports', adminController.getReports);
router.put('/reports/:id', adminController.resolveReport);

// Content moderation
router.delete('/posts/:id', adminController.removePost);
router.delete('/comments/:id', adminController.removeComment);

export default router;

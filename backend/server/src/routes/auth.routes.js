import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/rateLimit.middleware.js';
import { validateRegister, validateLogin } from '../validators/auth.validator.js';

const router = express.Router();

// Public routes with rate limiting
router.post('/register', authLimiter, validateRegister, authController.register);
router.post('/login', authLimiter, validateLogin, authController.login);
router.post('/refresh', authController.refresh);
router.post('/guest', authLimiter, authController.guestLogin);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.put('/change-password', authenticate, authController.changePassword);

export default router;

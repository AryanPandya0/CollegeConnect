import express from 'express';
import * as reportController from '../controllers/report.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.post('/', reportController.createReport);
router.get('/my-reports', reportController.getMyReports);

export default router;

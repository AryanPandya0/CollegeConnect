import express from 'express';
import * as jobController from '../controllers/job.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.middleware.js';
import { requireCampusLeadOrAdmin } from '../middleware/role.middleware.js';
import { uploadSingle } from '../middleware/upload.middleware.js';

const router = express.Router();

// Public routes
router.get('/', jobController.getJobs);

// Authenticated static routes (must come before /:id)
router.get('/applied/my-applications', authenticate, jobController.getAppliedJobs);
router.get('/my-posts/list', authenticate, jobController.getMyJobs);

// Parameterized public route
router.get('/:id', optionalAuth, jobController.getJobById);

// Authenticated parameterized routes
router.post('/:id/apply', authenticate, uploadSingle('resume'), jobController.applyToJob);

// Job management (campus lead or admin)
router.post('/', authenticate, requireCampusLeadOrAdmin, jobController.createJob);
router.put('/:id', authenticate, requireCampusLeadOrAdmin, jobController.updateJob);
router.delete('/:id', authenticate, requireCampusLeadOrAdmin, jobController.deleteJob);
router.get('/:id/applications', authenticate, requireCampusLeadOrAdmin, jobController.getApplications);
router.put('/:id/applications/:appId', authenticate, requireCampusLeadOrAdmin, jobController.updateApplicationStatus);

export default router;

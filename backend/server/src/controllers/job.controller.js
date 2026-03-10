import Job from '../models/Job.model.js';
import { formatSuccess, formatError, getPaginationOptions, calculatePagination } from '../utils/formatResponse.js';
import { HTTP_STATUS, USER_ROLES } from '../utils/constants.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { getFileUrl } from '../middleware/upload.middleware.js';

/**
 * Create job post
 * POST /api/jobs
 */
export const createJob = asyncHandler(async (req, res) => {
  const jobData = {
    ...req.body,
    postedBy: req.userId
  };
  
  const job = new Job(jobData);
  await job.save();
  
  await job.populate('postedBy', 'name avatar');
  await job.populate('community', 'name displayName');
  
  res.status(HTTP_STATUS.CREATED).json(
    formatSuccess({
      message: 'Job posted successfully',
      data: { job }
    })
  );
});

/**
 * Get all jobs
 * GET /api/jobs
 */
export const getJobs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationOptions(req.query);
  const { type, search } = req.query;
  
  // Build filter
  const filter = {
    isActive: true,
    deadline: { $gte: new Date() }
  };
  
  if (type) {
    filter.type = type;
  }
  
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  
  const total = await Job.countDocuments(filter);
  
  const jobs = await Job.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('postedBy', 'name avatar')
    .populate('community', 'name displayName');
  
  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Jobs retrieved successfully',
      data: { jobs },
      pagination: calculatePagination(total, page, limit)
    })
  );
});

/**
 * Get job by ID
 * GET /api/jobs/:id
 */
export const getJobById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const job = await Job.findById(id)
    .populate('postedBy', 'name avatar')
    .populate('community', 'name displayName')
    .populate('applications.applicant', 'name avatar college');
  
  if (!job) {
    return res.status(HTTP_STATUS.NOT_FOUND).json(
      formatError({
        message: 'Job not found',
        statusCode: HTTP_STATUS.NOT_FOUND
      })
    );
  }
  
  // Check if user has applied
  let hasApplied = false;
  let userApplication = null;
  
  if (req.userId) {
    hasApplied = job.hasApplied(req.userId);
    userApplication = job.applications.find(
      app => app.applicant._id.toString() === req.userId
    );
  }
  
  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Job retrieved successfully',
      data: {
        job: {
          ...job.toObject(),
          hasApplied,
          userApplication
        }
      }
    })
  );
});

/**
 * Update job
 * PUT /api/jobs/:id
 */
export const updateJob = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  
  const job = await Job.findById(id);
  
  if (!job) {
    return res.status(HTTP_STATUS.NOT_FOUND).json(
      formatError({
        message: 'Job not found',
        statusCode: HTTP_STATUS.NOT_FOUND
      })
    );
  }
  
  // Check ownership or admin
  const isAdmin = req.user.role === USER_ROLES.ADMIN;
  if (!isAdmin && job.postedBy.toString() !== userId) {
    return res.status(HTTP_STATUS.FORBIDDEN).json(
      formatError({
        message: 'You can only update your own job posts',
        statusCode: HTTP_STATUS.FORBIDDEN
      })
    );
  }
  
  const allowedUpdates = [
    'title', 'company', 'description', 'requirements', 'responsibilities',
    'location', 'type', 'salary', 'deadline', 'startDate', 'duration',
    'isActive', 'isRemote', 'contactEmail', 'externalLink'
  ];
  
  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      job[field] = req.body[field];
    }
  });
  
  await job.save();
  
  await job.populate('postedBy', 'name avatar');
  await job.populate('community', 'name displayName');
  
  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Job updated successfully',
      data: { job }
    })
  );
});

/**
 * Delete job
 * DELETE /api/jobs/:id
 */
export const deleteJob = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  
  const job = await Job.findById(id);
  
  if (!job) {
    return res.status(HTTP_STATUS.NOT_FOUND).json(
      formatError({
        message: 'Job not found',
        statusCode: HTTP_STATUS.NOT_FOUND
      })
    );
  }
  
  // Check ownership or admin
  const isAdmin = req.user.role === USER_ROLES.ADMIN;
  if (!isAdmin && job.postedBy.toString() !== userId) {
    return res.status(HTTP_STATUS.FORBIDDEN).json(
      formatError({
        message: 'You can only delete your own job posts',
        statusCode: HTTP_STATUS.FORBIDDEN
      })
    );
  }
  
  await Job.findByIdAndDelete(id);
  
  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Job deleted successfully',
      data: null
    })
  );
});

/**
 * Apply to job
 * POST /api/jobs/:id/apply
 */
export const applyToJob = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  const { coverLetter } = req.body;
  
  const job = await Job.findById(id);
  
  if (!job) {
    return res.status(HTTP_STATUS.NOT_FOUND).json(
      formatError({
        message: 'Job not found',
        statusCode: HTTP_STATUS.NOT_FOUND
      })
    );
  }
  
  // Check if job is active and not expired
  if (!job.isActive || job.isExpired) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      formatError({
        message: 'This job is no longer accepting applications',
        statusCode: HTTP_STATUS.BAD_REQUEST
      })
    );
  }
  
  // Check if already applied
  if (job.hasApplied(userId)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      formatError({
        message: 'You have already applied to this job',
        statusCode: HTTP_STATUS.BAD_REQUEST
      })
    );
  }
  
  // Handle resume upload
  let resumeUrl = null;
  if (req.file) {
    resumeUrl = getFileUrl(req.file.filename);
  } else if (req.body.resume) {
    resumeUrl = req.body.resume;
  } else {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      formatError({
        message: 'Resume is required',
        statusCode: HTTP_STATUS.BAD_REQUEST
      })
    );
  }
  
  // Add application
  const application = {
    applicant: userId,
    resume: resumeUrl,
    coverLetter,
    appliedAt: new Date()
  };
  
  const added = job.addApplication(application);
  
  if (!added) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      formatError({
        message: 'Failed to submit application',
        statusCode: HTTP_STATUS.BAD_REQUEST
      })
    );
  }
  
  await job.save();
  
  res.status(HTTP_STATUS.CREATED).json(
    formatSuccess({
      message: 'Application submitted successfully',
      data: { application: job.applications[job.applications.length - 1] }
    })
  );
});

/**
 * Get job applications
 * GET /api/jobs/:id/applications
 */
export const getApplications = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  const { page, limit, skip } = getPaginationOptions(req.query);
  
  const job = await Job.findById(id);
  
  if (!job) {
    return res.status(HTTP_STATUS.NOT_FOUND).json(
      formatError({
        message: 'Job not found',
        statusCode: HTTP_STATUS.NOT_FOUND
      })
    );
  }
  
  // Check ownership or admin
  const isAdmin = req.user.role === USER_ROLES.ADMIN;
  if (!isAdmin && job.postedBy.toString() !== userId) {
    return res.status(HTTP_STATUS.FORBIDDEN).json(
      formatError({
        message: 'You can only view applications for your own job posts',
        statusCode: HTTP_STATUS.FORBIDDEN
      })
    );
  }
  
  const total = job.applications.length;
  
  // Get paginated applications
  const applications = await Job.findById(id)
    .populate({
      path: 'applications.applicant',
      select: 'name avatar college course year'
    })
    .then(job => job.applications.slice(skip, skip + limit));
  
  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Applications retrieved successfully',
      data: { applications },
      pagination: calculatePagination(total, page, limit)
    })
  );
});

/**
 * Update application status
 * PUT /api/jobs/:id/applications/:appId
 */
export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { id, appId } = req.params;
  const { status, notes } = req.body;
  const userId = req.userId;
  
  const job = await Job.findById(id);
  
  if (!job) {
    return res.status(HTTP_STATUS.NOT_FOUND).json(
      formatError({
        message: 'Job not found',
        statusCode: HTTP_STATUS.NOT_FOUND
      })
    );
  }
  
  // Check ownership or admin
  const isAdmin = req.user.role === USER_ROLES.ADMIN;
  if (!isAdmin && job.postedBy.toString() !== userId) {
    return res.status(HTTP_STATUS.FORBIDDEN).json(
      formatError({
        message: 'You can only update applications for your own job posts',
        statusCode: HTTP_STATUS.FORBIDDEN
      })
    );
  }
  
  const updated = job.updateApplicationStatus(appId, status, notes);
  
  if (!updated) {
    return res.status(HTTP_STATUS.NOT_FOUND).json(
      formatError({
        message: 'Application not found',
        statusCode: HTTP_STATUS.NOT_FOUND
      })
    );
  }
  
  await job.save();
  
  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Application status updated successfully',
      data: { application: job.applications.id(appId) }
    })
  );
});

/**
 * Get user's applied jobs
 * GET /api/jobs/applied
 */
export const getAppliedJobs = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { page, limit, skip } = getPaginationOptions(req.query);
  
  const filter = {
    'applications.applicant': userId
  };
  
  const total = await Job.countDocuments(filter);
  
  const jobs = await Job.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('postedBy', 'name avatar')
    .populate('community', 'name displayName');
  
  // Add application status to each job
  const jobsWithStatus = jobs.map(job => {
    const application = job.applications.find(
      app => app.applicant.toString() === userId
    );
    return {
      ...job.toObject(),
      applicationStatus: application ? application.status : null,
      appliedAt: application ? application.appliedAt : null
    };
  });
  
  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Applied jobs retrieved successfully',
      data: { jobs: jobsWithStatus },
      pagination: calculatePagination(total, page, limit)
    })
  );
});

/**
 * Get jobs posted by user
 * GET /api/jobs/my-posts
 */
export const getMyJobs = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { page, limit, skip } = getPaginationOptions(req.query);
  
  const filter = { postedBy: userId };
  
  const total = await Job.countDocuments(filter);
  
  const jobs = await Job.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('community', 'name displayName');
  
  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Your job posts retrieved successfully',
      data: { jobs },
      pagination: calculatePagination(total, page, limit)
    })
  );
});

export default {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  applyToJob,
  getApplications,
  updateApplicationStatus,
  getAppliedJobs,
  getMyJobs
};
